#!/usr/bin/env python3
"""Run a local line-level HTR checkpoint on cropped Cyrillic manuscript lines."""

from __future__ import annotations

import argparse
from pathlib import Path

import torch
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel


class TrOCRProcessorCustom(TrOCRProcessor):
    def __init__(self, image_processor, tokenizer):
        self.image_processor = image_processor
        self.tokenizer = tokenizer
        self.current_processor = self.image_processor
        self.chat_template = None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("model_dir", type=Path)
    parser.add_argument("images", nargs="+", type=Path)
    parser.add_argument("--max-new-tokens", type=int, default=160)
    args = parser.parse_args()

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    processor = TrOCRProcessorCustom.from_pretrained(args.model_dir)
    model = VisionEncoderDecoderModel.from_pretrained(args.model_dir).to(device)
    model.eval()

    for image_path in args.images:
        with Image.open(image_path) as source:
            image = source.convert("RGB")
        pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
        with torch.inference_mode():
            generated_ids = model.generate(
                pixel_values,
                max_new_tokens=args.max_new_tokens,
                num_beams=3,
            )
        text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        print(f"{image_path.name}\t{text}")


if __name__ == "__main__":
    main()
