#!/usr/bin/env python3

"""Create clean document views and evidence crops from a saved archive original."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image


parser = ArgumentParser()
parser.add_argument("--input", required=True)
parser.add_argument("--full-view", required=True)
parser.add_argument("--remove-x", help="Inclusive-exclusive vertical strip to remove, e.g. 2380:2470")
parser.add_argument("--rotate", type=int, choices=(90, 180, 270), help="Clockwise rotation applied before cleaning and cropping")
parser.add_argument(
    "--crop",
    action="append",
    default=[],
    help="Output path and left,top,right,bottom coordinates: path:l:t:r:b",
)
args = parser.parse_args()

source = Image.open(args.input)
working = source
if args.rotate:
    working = source.rotate(-args.rotate, expand=True)
if args.remove_x:
    left_edge, right_edge = (int(value) for value in args.remove_x.split(":"))
    if not 0 <= left_edge < right_edge <= working.width:
        raise ValueError("Invalid --remove-x interval")
    left = working.crop((0, 0, left_edge, working.height))
    right = working.crop((right_edge, 0, working.width, working.height))
    merged = Image.new(working.mode, (left.width + right.width, working.height))
    merged.paste(left, (0, 0))
    merged.paste(right, (left.width, 0))
    working = merged

Path(args.full_view).parent.mkdir(parents=True, exist_ok=True)
working.save(args.full_view, quality=95, subsampling=0)

for crop_spec in args.crop:
    output, left, top, right, bottom = crop_spec.rsplit(":", 4)
    box = tuple(int(value) for value in (left, top, right, bottom))
    if not 0 <= box[0] < box[2] <= working.width or not 0 <= box[1] < box[3] <= working.height:
        raise ValueError(f"Invalid crop box for {output}: {box}")
    Path(output).parent.mkdir(parents=True, exist_ok=True)
    working.crop(box).save(output, quality=95, subsampling=0)
