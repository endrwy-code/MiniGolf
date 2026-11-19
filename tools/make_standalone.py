#!/usr/bin/env python3
"""Build standalone copies of the status pages that open straight from disk in Chrome.

The Artifact sources in status/ are HTML fragments (the Artifact host adds <!doctype>, <head>
and <body>). This script wraps each fragment in a full document. For the 3D page it also
embeds three.js (pinned 0.186.1, MIT licence, vetted 18 Nov 2026: no OSV advisories) so the
file works offline and on networks that block jsDelivr.

Usage:
    python3 tools/make_standalone.py            # writes status/standalone/*.html
The three.js files are downloaded once with curl into .cache/three-0.186.1/ (not committed). If jsDelivr is
unreachable, they are recovered from the committed standalone page instead.
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "status")
OUT = os.path.join(SRC, "standalone")
THREE_VER = "0.186.1"
CACHE = os.path.join(ROOT, ".cache", f"three-{THREE_VER}")
THREE_FILES = {
    "core": "build/three.core.min.js",
    "three": "build/three.module.min.js",
    "orbit": "examples/jsm/controls/OrbitControls.js",
}

SKELETON_HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
"""

LOADER_OLD = """  THREE = await import('three');
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));"""
LOADER_NEW = """  const blobUrl = (txt) => URL.createObjectURL(new Blob([txt], { type: 'text/javascript' }));
  const src = (id) => document.getElementById(id).textContent;
  const coreUrl = blobUrl(src('src-three-core'));
  const threeUrl = blobUrl(src('src-three').split('__THREE_CORE__').join(coreUrl));
  const orbitUrl = blobUrl(src('src-orbit').split('__THREE__').join(threeUrl));
  THREE = await import(threeUrl);
  ({ OrbitControls } = await import(orbitUrl));"""


def recover_from_standalone(key):
    """Fallback when jsDelivr is unreachable (e.g. a cloud session that blocks it): take the same pinned files back out
    of the committed standalone page, undoing the import rewrites. npm's three@0.186.1 has no .min builds to fetch instead."""
    page = os.path.join(OUT, "countdown-golf-3d.html")
    ids = {"core": "src-three-core", "three": "src-three", "orbit": "src-orbit"}
    if not os.path.exists(page):
        return None
    with open(page, encoding="utf-8") as f:
        m = re.search(r'<script type="text/plain" id="%s">(.*?)</script>' % ids[key], f.read(), re.S)
    if not m:
        return None
    txt = m.group(1)
    if key == "three":
        txt = txt.replace('from"__THREE_CORE__"', 'from"./three.core.js"')
    if key == "orbit":
        txt = txt.replace("from '__THREE__'", "from 'three'")
    return txt


def fetch_three():
    os.makedirs(CACHE, exist_ok=True)
    out = {}
    for key, rel in THREE_FILES.items():
        path = os.path.join(CACHE, rel.replace("/", "_"))
        if not os.path.exists(path):
            url = f"https://cdn.jsdelivr.net/npm/three@{THREE_VER}/{rel}"
            if subprocess.run(["curl", "-sSfL", "-o", path, url]).returncode != 0:
                txt = recover_from_standalone(key)
                if txt is None:
                    sys.exit(f"couldn't download {url} and no standalone copy to recover it from")
                print(f"jsDelivr unreachable: recovered {rel} from the committed standalone page")
                with open(path, "w", encoding="utf-8") as f:
                    f.write(txt)
        with open(path, encoding="utf-8") as f:
            txt = f.read()
        if "</script" in txt.lower():
            sys.exit(f"{rel} contains a closing script tag; cannot embed safely")
        out[key] = txt
    out["three"] = out["three"].replace('from"./three.core.js"', 'from"__THREE_CORE__"')
    if "__THREE_CORE__" not in out["three"]:
        sys.exit("three.module.min.js no longer imports ./three.core.js; update the rewrite")
    out["orbit"], n = re.subn(r"from\s*'three'", "from '__THREE__'", out["orbit"])
    if n != 1:
        sys.exit("OrbitControls.js import of 'three' not found exactly once; update the rewrite")
    return out


def wrap(fragment, extra_body_start=""):
    """Split the fragment into head material (title, meta, links, style) and body content."""
    m = re.search(r"\n<(header|main)\b", fragment)
    if not m:
        sys.exit("could not find where the page body starts")
    head, body = fragment[: m.start()], fragment[m.start():]
    return SKELETON_HEAD + head.strip() + "\n</head>\n<body>\n" + extra_body_start + body.strip() + "\n</body>\n</html>\n"


def main():
    os.makedirs(OUT, exist_ok=True)

    with open(os.path.join(SRC, "countdown-golf-status.html"), encoding="utf-8") as f:
        status = f.read()
    with open(os.path.join(OUT, "countdown-golf-status.html"), "w", encoding="utf-8") as f:
        f.write(wrap(status))

    with open(os.path.join(SRC, "countdown-golf-3d.html"), encoding="utf-8") as f:
        page = f.read()
    page, n = re.subn(r'<script type="importmap">.*?</script>\s*', "", page, flags=re.S)
    if n != 1:
        sys.exit("import map not found in the 3D page")
    if LOADER_OLD not in page:
        sys.exit("three.js loader block not found in the 3D page; update LOADER_OLD")
    page = page.replace(LOADER_OLD, LOADER_NEW)
    lib = fetch_three()
    embedded = (
        f'<!-- three.js {THREE_VER} (MIT licence, (c) three.js authors), embedded so this file works offline -->\n'
        f'<script type="text/plain" id="src-three-core">{lib["core"]}</script>\n'
        f'<script type="text/plain" id="src-three">{lib["three"]}</script>\n'
        f'<script type="text/plain" id="src-orbit">{lib["orbit"]}</script>\n'
    )
    with open(os.path.join(OUT, "countdown-golf-3d.html"), "w", encoding="utf-8") as f:
        f.write(wrap(page, embedded))

    for name in ("countdown-golf-status.html", "countdown-golf-3d.html"):
        p = os.path.join(OUT, name)
        print(f"{os.path.relpath(p, ROOT)}  {os.path.getsize(p) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
