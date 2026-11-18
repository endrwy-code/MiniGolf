#!/usr/bin/env python3
"""Flow simulation: does play order change how many people the course serves?

Compares ways of running a 10-hole course during a session with a queue that never
empties (more people want to play than the course can take). Standard library only.

Holes are numbered by play position 0..9 (position 0 = hole 10 at the queue end,
position 9 = hole 1, the finale). Hero holes 8, 4, 2, 1 sit at positions 2, 6, 8, 9.

THE HARD CEILING (why no ordering policy can beat it)
-----------------------------------------------------
Each group must play every hole once, and a hole hosts one group at a time. So hole h
must give each group m_h minutes (on average) of exclusive time, and over a session of
T minutes it can serve at most T / m_h groups. Every group that finishes has used every
hole, so finished groups <= min over h of T / m_h = T / m_max. In players per hour:

    ceiling = group_size * 60 / (slowest hole's mean time in minutes)

Play order only changes *when* a group visits a hole, never *how many minutes* each hole
must give each group, so no order (fixed line, ring, free roam) can exceed the ceiling.
Order can only waste less or more of it (idle holes while groups are stuck elsewhere).
The ceiling rises only if the slowest hole gets faster, is duplicated, or groups play
fewer holes each (policy f). The ceiling ignores walking, so real numbers sit below it.

POLICIES
--------
a    Fixed line 10 -> 1. The starter sends the next group (waiting on deck at the tee)
     the moment hole 10 is clear. This is the current plan.
a2   As a, but the starter also keeps at most --cap-line groups (default 12) on the
     course, so most of the waiting happens in the queue, not inside the course.
b    Fixed line with a shotgun start: at opening one group stands on every hole and plays
     the loop in order from there (hole 1 wraps back to hole 10, so this assumes a loop
     layout). After that, new groups enter at hole 10 as in a. Groups already on the
     course get priority at hole 10 over new groups. Because the opening groups finish
     at about the same time and the course then refills from hole 10 only, most of the
     opening gain is lost; c is the version that keeps refilling every hole.
c    Ring, start anywhere. A host sends the next waiting group to hole h when:
       (1) h is idle: nobody playing it, waiting at its tee, or walking to it; and
       (2) no group coming from the upstream hole (h-1) is expected to arrive before the
           new group is expected to be --gap of the way through h. Expected times use mean
           hole times: upstream arrival = expected finish at h-1 (never earlier than now)
           + walk; the new group's progress point = now + free walk + gap * mean(h).
     The group then plays the ring in order from h until it has played all 10. The host
     also keeps at most --cap-line groups on the course (without a cap the ring floods
     with groups stuck behind slow hero holes).
d    Free order with a cap of N groups on the course. A group that finishes a hole picks a
     free hole it hasn't played (uniformly at random), reserves it and walks there
     (--free-walk). If none is free it waits; freed holes go to whoever has waited
     longest. A new group enters each time one finishes.
e    As d, but players are twice as likely to pick a hero hole when several are free.
f    Two 5-hole half-courses (holes 10-6 and 5-1), each a fixed line with its own starter.
     Each group plays 5 holes, not 10. It shows the "fewer holes per player" lever.

METRICS (means over repetitions; 90% range is the 5th to 95th percentile)
-------
players/h    groups finishing inside the session x group size / session hours
late/h       the same, counted only over the second half of the session (after the fill).
             Rough: groups that move in waves (shotgun or free-order starts) make it jumpy.
             For a true steady state run a long session, e.g. --hours 12.
player-holes/h  holes played inside the session x group size / hours (golf delivered)
round        minutes from being called from the queue to finishing (finished groups)
wait         round minus putting minus walking (standing around on the course)
idle %       share of session time a hole has nobody putting on it (average of holes)

WHAT THIS MODEL LEAVES OUT
--------------------------
Groups don't abandon, play through, or vary in size; no kids, no breakdowns, no staff
delays; walking time is fixed; arrivals never dry up (the queue is always full).

Run:  python3 tools/flow_sim.py            (full table, both profiles)
      python3 tools/flow_sim.py --sanity   (the checks listed in main())
"""
import argparse
import heapq
import math
import random
import statistics as st
from collections import deque

N_HOLES = 10
HERO_POS = (2, 6, 8, 9)  # holes 8, 4, 2, 1

PROFILES = {
    "balanced": [2.25] * N_HOLES,
    "uneven": [3.25 if p in HERO_POS else 2.0 for p in range(N_HOLES)],
}

POLICIES = [
    ("a", "a. Fixed line, start when hole 10 clear"),
    ("a2", "a2. Fixed line, max 12 groups on course"),
    ("b", "b. Fixed line + shotgun start"),
    ("c", "c. Ring, host starts anywhere, max 12"),
    ("d10", "d. Free order, cap 10 groups"),
    ("d12", "d. Free order, cap 12 groups"),
    ("e10", "e. Free order, hero-seeking, cap 10"),
    ("e12", "e. Free order, hero-seeking, cap 12"),
    ("f", "f. Two 5-hole half-courses"),
]

ARRIVE, FINISH = 0, 1


class Group:
    __slots__ = ("route", "idx", "unplayed", "t_entry", "play", "walk", "next_arrival")

    def __init__(self, t, route=None, unplayed=None):
        self.route = route          # list of hole positions, or None for free order
        self.idx = 0                # index of the hole being played / walked to
        self.unplayed = unplayed    # set of positions still to play (free order)
        self.t_entry = t
        self.play = 0.0
        self.walk = 0.0
        self.next_arrival = None    # time the group reaches its next tee, when walking


def sample(mean, cv, rng):
    if cv <= 0 or mean <= 0:
        return mean
    s2 = math.log(1 + cv * cv)
    return rng.lognormvariate(math.log(mean) - s2 / 2, math.sqrt(s2))


def run_once(policy, means, rng, T, cv, walk, free_walk, gap, cap_line):
    n = len(means)
    playing = [None] * n            # (group, start time) or None
    queue = [deque() for _ in range(n)]
    incoming = [[] for _ in range(n)]   # groups walking to each hole
    played_time = [0.0] * n
    plays_done = 0
    lobby = []                      # free-order groups waiting for a free hole
    ev = []
    seq = [0]
    stats = {"done": 0, "late": 0, "rounds": [], "waits": []}
    on_course = [0]

    free_mode = policy[0] in "de"
    cap = int(policy[1:]) if free_mode else None
    hero_w = 2.0 if policy[0] == "e" else 1.0

    def push(t, kind, g, h):
        seq[0] += 1
        heapq.heappush(ev, (t, kind, seq[0], g, h))

    def send_walking(g, h, t, d):
        g.walk += d
        g.next_arrival = t + d
        incoming[h].append(g)
        push(t + d, ARRIVE, g, h)

    def hole_free(h):
        return playing[h] is None and not queue[h] and not incoming[h]

    def complete(g, t):
        on_course[0] -= 1
        if t <= T:
            stats["done"] += 1
            if t > T / 2:
                stats["late"] += 1
            rnd = t - g.t_entry
            stats["rounds"].append(rnd)
            stats["waits"].append(rnd - g.play - g.walk)

    def new_group(t, route=None):
        on_course[0] += 1
        if route is None:
            return Group(t, unplayed=set(range(n)))
        return Group(t, route=route)

    def ring(start):
        return [(start + k) % n for k in range(n)]

    def assign_free(g, t):
        cands = [h for h in g.unplayed if hole_free(h)]
        if not cands:
            return False
        w = [hero_w if h in HERO_POS else 1.0 for h in cands]
        h = rng.choices(cands, weights=w)[0]
        send_walking(g, h, t, free_walk)
        return True

    def upstream_ok(h, t):
        """Policy c rule (2): no upstream group expected before the new one is `gap` through h."""
        u = (h - 1) % n
        soonest = math.inf
        if playing[u] is not None:
            g, t0 = playing[u]
            if g.idx + 1 < len(g.route) and g.route[g.idx + 1] == h:
                soonest = min(soonest, max(t, t0 + means[u]) + walk)
        for g in list(queue[u]) + incoming[u]:
            if g.idx + 1 < len(g.route) and g.route[g.idx + 1] == h:
                start_u = max(t, g.next_arrival or t)
                soonest = min(soonest, start_u + means[u] + walk)
        return soonest >= t + free_walk + gap * means[h]

    def start_queued(t):
        for h in range(n):
            if playing[h] is None and queue[h]:
                g = queue[h].popleft()
                playing[h] = (g, t)
                push(t + sample(means[h], cv, rng), FINISH, g, h)

    def inject(t):
        if policy in ("a", "a2", "b"):
            if hole_free(0) and (policy != "a2" or on_course[0] < cap_line):
                queue[0].append(new_group(t, list(range(n))))
        elif policy == "f":
            if hole_free(0):
                queue[0].append(new_group(t, list(range(0, 5))))
            if hole_free(5):
                queue[5].append(new_group(t, list(range(5, 10))))
        elif policy == "c":
            for h in range(n):
                if on_course[0] >= cap_line:
                    break
                if hole_free(h) and upstream_ok(h, t):
                    send_walking(new_group(t, ring(h)), h, t, free_walk)
        elif free_mode:
            still = []
            for g in lobby:
                if not assign_free(g, t):
                    still.append(g)
            lobby[:] = still
            while on_course[0] < cap:
                g = new_group(t)
                if not assign_free(g, t):
                    lobby.append(g)

    def dispatch(t):
        start_queued(t)
        inject(t)
        start_queued(t)

    # opening
    if policy == "b":
        for s in range(n):
            queue[s].append(new_group(0.0, ring(s)))
    dispatch(0.0)

    while ev and ev[0][0] <= T:
        t = ev[0][0]
        while ev and ev[0][0] <= t + 1e-9:
            _, kind, _, g, h = heapq.heappop(ev)
            if kind == ARRIVE:
                incoming[h].remove(g)
                g.next_arrival = None
                queue[h].append(g)
            else:
                _, t0 = playing[h]
                playing[h] = None
                played_time[h] += t - t0
                g.play += t - t0
                plays_done += 1
                if free_mode:
                    g.unplayed.discard(h)
                    if g.unplayed:
                        lobby.append(g)
                    else:
                        complete(g, t)
                else:
                    g.idx += 1
                    if g.idx == len(g.route):
                        complete(g, t)
                    else:
                        send_walking(g, g.route[g.idx], t, walk)
        dispatch(t)

    for h in range(n):
        if playing[h] is not None:
            played_time[h] += T - playing[h][1]

    hours = T / 60
    return {
        "groups_h": stats["done"] / hours,
        "late_groups_h": stats["late"] / (hours / 2),
        "plays_h": plays_done / hours,
        "round": st.mean(stats["rounds"]) if stats["rounds"] else float("nan"),
        "wait": st.mean(stats["waits"]) if stats["waits"] else float("nan"),
        "idle": 100 * (1 - sum(played_time) / (n * T)),
    }


def pct(xs, p):
    xs = sorted(xs)
    k = (len(xs) - 1) * p
    lo, hi = math.floor(k), math.ceil(k)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)


def run_case(policy, profile, args, cv=None, walk=None, free_walk=None, seed=None):
    cv = args.cv if cv is None else cv
    walk = args.walk if walk is None else walk
    free_walk = args.free_walk if free_walk is None else free_walk
    seed = args.seed if seed is None else seed
    rng = random.Random(f"{seed}-{profile}-{policy}-{cv}-{walk}-{free_walk}")
    means = PROFILES[profile]
    reps = [run_once(policy, means, rng, args.hours * 60, cv, walk, free_walk,
                     args.gap, args.cap_line) for _ in range(args.reps)]
    g = args.group
    players = [r["groups_h"] * g for r in reps]
    return {
        "players": st.mean(players),
        "p5": pct(players, 0.05),
        "p95": pct(players, 0.95),
        "late": st.mean(r["late_groups_h"] for r in reps) * g,
        "pholes": st.mean(r["plays_h"] for r in reps) * g,
        "round": st.mean(r["round"] for r in reps),
        "wait": st.mean(r["wait"] for r in reps),
        "idle": st.mean(r["idle"] for r in reps),
    }


def ceiling(profile, policy, group):
    m = PROFILES[profile]
    if policy == "f":
        return group * 60 / max(m[:5]) + group * 60 / max(m[5:])
    return group * 60 / max(m)


def print_table(profile, args):
    m = PROFILES[profile]
    print(f"\n### Profile: {profile} (hole means {', '.join(f'{x:g}' for x in m)} min; "
          f"CV {args.cv}, walk {args.walk}, free walk {args.free_walk}, "
          f"{args.hours:g} h, groups of {args.group}, {args.reps} reps, seed {args.seed})\n")
    print(f"Ceiling, full course: {ceiling(profile, 'a', args.group):.0f} players/h. "
          f"Ceiling, two half-courses (f): {ceiling(profile, 'f', args.group):.0f} players/h.\n")
    print("| Policy | Players/h (90% range) | Late/h | Player-holes/h | Round min | Wait min | Hole idle % |")
    print("|---|---|---|---|---|---|---|")
    for key, label in POLICIES:
        r = run_case(key, profile, args)
        print(f"| {label} | {r['players']:.0f} ({r['p5']:.0f}–{r['p95']:.0f}) | {r['late']:.0f} | "
              f"{r['pholes']:.0f} | {r['round']:.1f} | {r['wait']:.1f} | {r['idle']:.0f} |")


def sanity(args):
    print("## Sanity checks\n")
    print("1. No variability, no walking: fixed lines should reach the ceiling after the fill "
          "(late/h ~ ceiling).")
    for prof in PROFILES:
        c = ceiling(prof, "a", args.group)
        for key in ("a", "b"):
            r = run_case(key, prof, args, cv=0, walk=0, free_walk=0)
            print(f"   {prof:8s} {key}: session {r['players']:.1f}, late {r['late']:.1f}, ceiling {c:.1f}")
    print("\n2. No policy beats the ceiling on session players/h (default settings and the zero-noise case).")
    ok = True
    for prof in PROFILES:
        for key, _ in POLICIES:
            c = ceiling(prof, key, args.group)
            for kw in ({}, {"cv": 0, "walk": 0, "free_walk": 0}):
                r = run_case(key, prof, args, **kw)
                if r["players"] > c + 1e-6:
                    ok = False
                    print(f"   FAIL {prof} {key} {kw}: {r['players']:.1f} > {c:.1f}")
    print("   all within the ceiling" if ok else "   see failures above")
    print("\n3. Seed stability: players/h with two seeds (default settings).")
    for prof in PROFILES:
        diffs = []
        for key, _ in POLICIES:
            r1 = run_case(key, prof, args, seed=args.seed)
            r2 = run_case(key, prof, args, seed=args.seed + 1)
            diffs.append((key, r1["players"], r2["players"]))
        print(f"   {prof}: " + ", ".join(f"{k} {x:.1f}/{y:.1f}" for k, x, y in diffs))
        print(f"   largest gap {max(abs(x - y) for _, x, y in diffs):.1f} players/h")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--reps", type=int, default=300)
    ap.add_argument("--seed", type=int, default=2026)
    ap.add_argument("--hours", type=float, default=3.0)
    ap.add_argument("--group", type=int, default=4, help="players per group (for reporting)")
    ap.add_argument("--cv", type=float, default=0.35, help="spread of hole times (coefficient of variation)")
    ap.add_argument("--walk", type=float, default=0.25, help="minutes to walk to the adjacent next hole")
    ap.add_argument("--free-walk", type=float, default=0.6,
                    help="minutes to find and walk to a non-adjacent hole (free order, ring starts)")
    ap.add_argument("--gap", type=float, default=0.5, help="policy c: see the docstring")
    ap.add_argument("--cap-line", type=int, default=12, help="policies a2 and c: max groups on the course")
    ap.add_argument("--profile", choices=["both", *PROFILES], default="both")
    ap.add_argument("--sanity", action="store_true", help="run the sanity checks instead of the table")
    args = ap.parse_args()
    if args.sanity:
        sanity(args)
        return
    for prof in (PROFILES if args.profile == "both" else [args.profile]):
        print_table(prof, args)


if __name__ == "__main__":
    main()
