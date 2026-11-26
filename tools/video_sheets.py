"""Turn benchmark videos into frames and labelled overview sheets that an agent can read cheaply.

Made for the Kulnari footage (26 Nov). Use it for any new clips (for example the missing rally-hill,
trick-tube and plinko videos) so the frame and time labels match the existing analysis.

    python3 tools/video_sheets.py <media_dir> <out_dir> [--rotate180 NAME ...] [--mirror NAME ...]
    python3 tools/video_sheets.py --stills reference/kulnari     (rebuild the overview sheets)

For each .mov/.mp4 in <media_dir> it writes:
  <out_dir>/frames/<name>/tNNNN.jpg   2 fps, long side 960 px. Frame k is at t = (k - 1) * 0.5 s.
  <out_dir>/sheets/<name>_pN.jpg      1 frame every 2 s, about 1440 px wide, each tile labelled
                                      with its time and frame number (6 x 3 portrait, 4 x 5 landscape).
  <out_dir>/index.json                duration, file times and any real capture timestamp per clip.

--stills rebuilds overview-N-Kxx-Kyy.jpg in that folder from its Kxx-name-n.jpg stills: about 1560 px
wide, 18 stills a sheet, so one sheet fits a single image read at full size. Labels come from labels.json
in the same folder ({"K01": ["Furnace Room", "1"], ...}: name and estimated Kulnari hole number).

NAME is the file name without its extension (for example IMG_0025). Needs ffmpeg and ffprobe on the
PATH, and Pillow. Keep the output out of the repo: frames show people's faces (HOGC rules). Copy only
chosen face-free stills into reference/<venue>/.

Agent budget (learned the hard way on 26 Nov: a 15-agent run used about 2.3M tokens and returned
nothing): give each video agent the sheets first, cap it at about 30 image reads, have it append
notes to a file after every clip, and prefer about 4 agents to 15.
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageDraw, ImageFont, ImageOps


def font(size):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "C:/Windows/Fonts/arialbd.ttf",
              "/System/Library/Fonts/Supplemental/Arial Bold.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:format_tags",
                          "-of", "json", path], capture_output=True, text=True, check=True).stdout
    return json.loads(out)["format"]


def extract(media, frames_root, f):
    name = os.path.splitext(f)[0]
    od = os.path.join(frames_root, name)
    os.makedirs(od, exist_ok=True)
    if not glob.glob(os.path.join(od, "t*.jpg")):
        # ffmpeg applies the phone's rotation flag by default; scale the long side to 960 px.
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(media, f),
                        "-vf", "fps=2,scale='if(gt(iw,ih),960,-2)':'if(gt(iw,ih),-2,960)'",
                        "-q:v", "3", os.path.join(od, "t%04d.jpg")], check=True)
    return name


def sheets_for(name, frames_dir, sheets_dir, rotate, mirror, f_lab, f_head):
    frames = sorted(glob.glob(os.path.join(frames_dir, "t*.jpg")))[::4]  # every 2 s
    if not frames:
        return []
    w0, h0 = Image.open(frames[0]).size
    cols, rows = (6, 3) if h0 >= w0 else (4, 5)
    tw = 1440 // cols
    th = round(h0 * tw / w0)
    per = cols * rows
    made = []
    for s in range(0, len(frames), per):
        chunk = frames[s:s + per]
        nrows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, 34 + nrows * th), (15, 15, 15))
        d = ImageDraw.Draw(sheet)
        note = " (rotated 180)" if rotate else (" (un-mirrored)" if mirror else "")
        d.text((6, 4), f"{name}{note}  part {s // per + 1}  (1 frame / 2 s)", fill=(255, 220, 0), font=f_head)
        for i, p in enumerate(chunk):
            k = int(os.path.basename(p)[1:5])
            x, y = (i % cols) * tw, 34 + (i // cols) * th
            im = Image.open(p).resize((tw, th))
            if rotate:
                im = im.rotate(180)
            if mirror:
                im = ImageOps.mirror(im)
            sheet.paste(im, (x, y))
            d.rectangle([x, y, x + 132, y + 22], fill=(0, 0, 0))
            d.text((x + 3, y + 1), f"{(k - 1) * 0.5:5.1f}s t{k:04d}", fill=(255, 255, 255), font=f_lab)
        out = os.path.join(sheets_dir, f"{name}_p{s // per + 1}.jpg")
        sheet.save(out, quality=82)
        made.append(os.path.basename(out))
    return made


def overview_sheets(folder, per=18, cols=6, cw=260, ch=462, head=40):
    labels = json.load(open(os.path.join(folder, "labels.json"), encoding="utf-8"))
    stills = sorted(f for f in os.listdir(folder) if re.match(r"K\d\d-.*-\d\.jpg$", f))
    for old in glob.glob(os.path.join(folder, "overview-*.jpg")):
        os.remove(old)
    # Keep each hole on one sheet, filling each sheet up to `per` stills.
    groups, cur = [], []
    for kid in sorted({f[:3] for f in stills}):
        mine = [f for f in stills if f[:3] == kid]
        if cur and len(cur) + len(mine) > per:
            groups.append(cur)
            cur = []
        cur += mine
    if cur:
        groups.append(cur)
    f_lab, f_head = font(16), font(24)
    folder_name = os.path.basename(os.path.abspath(folder))
    for n, files in enumerate(groups, 1):
        rows = (len(files) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * cw, head + rows * ch), (18, 18, 18))
        d = ImageDraw.Draw(sheet)
        d.text((8, 7), f"Stills {files[0][:3]}-{files[-1][:3]} (library order; faces left out). Files: {folder_name}/",
               fill=(255, 220, 0), font=f_head)
        for i, f in enumerate(files):
            im = Image.open(os.path.join(folder, f)).convert("RGB")
            im.thumbnail((cw - 4, ch - 4))
            x, y = (i % cols) * cw, head + (i // cols) * ch
            sheet.paste(im, (x + (cw - im.width) // 2, y + (ch - im.height) // 2))
            name, hole = labels.get(f[:3], [f[4:-6].replace("-", " "), "?"])
            d.rectangle([x + 2, y + 2, x + cw - 2, y + 44], fill=(0, 0, 0))
            d.text((x + 6, y + 3), f"{f[:3]} {name}", fill=(255, 255, 255), font=f_lab)
            d.text((x + 6, y + 23), f"still {f[-5]} | Kulnari hole {hole}", fill=(200, 200, 200), font=f_lab)
        out = os.path.join(folder, f"overview-{n}-{files[0][:3]}-{files[-1][:3]}.jpg")
        sheet.save(out, quality=80, optimize=True)
        print(out, sheet.size)


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--stills":
        overview_sheets(sys.argv[2])
        return
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("media_dir")
    ap.add_argument("out_dir")
    ap.add_argument("--rotate180", nargs="*", default=[], metavar="NAME", help="clips filmed upside down")
    ap.add_argument("--mirror", nargs="*", default=[], metavar="NAME", help="clips recorded mirrored")
    a = ap.parse_args()

    frames_root = os.path.join(a.out_dir, "frames")
    sheets_dir = os.path.join(a.out_dir, "sheets")
    os.makedirs(frames_root, exist_ok=True)
    os.makedirs(sheets_dir, exist_ok=True)
    vids = sorted(f for f in os.listdir(a.media_dir) if f.lower().endswith((".mov", ".mp4")))
    with ThreadPoolExecutor(4) as ex:
        names = list(ex.map(lambda f: extract(a.media_dir, frames_root, f), vids))

    f_lab, f_head = font(18), font(24)
    index = []
    for f, name in zip(vids, names):
        meta = probe(os.path.join(a.media_dir, f))
        tags = meta.get("tags", {})
        made = sheets_for(name, os.path.join(frames_root, name), sheets_dir,
                          name in a.rotate180, name in a.mirror, f_lab, f_head)
        index.append({
            "file": f,
            "duration_s": round(float(meta.get("duration", 0)), 1),
            # Only untouched originals keep the real capture time; transferred or edited copies
            # usually carry the transfer time in creation_time, so don't trust that tag alone.
            "capture_time": tags.get("com.apple.quicktime.creationdate"),
            "creation_time_tag": tags.get("creation_time"),
            "file_mtime": os.path.getmtime(os.path.join(a.media_dir, f)),
            "n_frames_2fps": len(glob.glob(os.path.join(frames_root, name, "t*.jpg"))),
            "sheets": made,
        })
    with open(os.path.join(a.out_dir, "index.json"), "w", encoding="utf-8") as fh:
        json.dump(index, fh, indent=1)
    print(f"{len(index)} clips, {sum(len(i['sheets']) for i in index)} sheets -> {sheets_dir}")


if __name__ == "__main__":
    main()
