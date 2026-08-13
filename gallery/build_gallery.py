#!/usr/bin/env python3
"""Build the static photo manifest used by gallery.html.

Run from the website root:
    python3 gallery/build_gallery.py

The script scans gallery/ recursively, ignores non-image files, skips broken
images, and converts HEIC/HEIF files to JPEG when a local converter is
available. No captions or file names are displayed on the website.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / "gallery-data.js"
BROWSER_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
HEIC_EXTENSIONS = {".heic", ".heif"}
MIN_FILE_SIZE = 64


def natural_key(value: str) -> list[object]:
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", value)]


def gallery_sort_key(path: Path) -> tuple[object, ...]:
    relative = path.relative_to(HERE)
    year = next((int(part) for part in relative.parts if re.fullmatch(r"\d{4}", part)), 0)
    return (-year, *natural_key(relative.as_posix()))


def run_converter(command: list[str]) -> bool:
    try:
        completed = subprocess.run(
            command,
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return completed.returncode == 0
    except OSError:
        return False


def convert_heic(source: Path) -> Path | None:
    output = source.with_suffix(".jpg")
    if output.exists() and output.stat().st_size >= MIN_FILE_SIZE and output.stat().st_mtime >= source.stat().st_mtime:
        return output

    output.unlink(missing_ok=True)

    if shutil.which("sips") and run_converter(["sips", "-s", "format", "jpeg", str(source), "--out", str(output)]):
        return output

    if shutil.which("heif-convert") and run_converter(["heif-convert", str(source), str(output)]):
        return output

    if shutil.which("magick") and run_converter(["magick", str(source), str(output)]):
        return output

    try:
        from PIL import Image
        import pillow_heif

        pillow_heif.register_heif_opener()
        with Image.open(source) as image:
            image.convert("RGB").save(output, "JPEG", quality=90, optimize=True)
        return output
    except (ImportError, OSError):
        output.unlink(missing_ok=True)
        return None


def has_known_signature(path: Path) -> bool:
    try:
        header = path.read_bytes()[:16]
    except OSError:
        return False

    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        return header.startswith(b"\xff\xd8\xff")
    if suffix == ".png":
        return header.startswith(b"\x89PNG\r\n\x1a\n")
    if suffix == ".webp":
        return header.startswith(b"RIFF") and header[8:12] == b"WEBP"
    if suffix == ".gif":
        return header.startswith((b"GIF87a", b"GIF89a"))
    if suffix == ".avif":
        return b"ftyp" in header and b"avif" in header
    return False


def inspect_image(path: Path) -> tuple[int | None, int | None] | None:
    try:
        if path.stat().st_size < MIN_FILE_SIZE:
            return None
    except OSError:
        return None

    try:
        from PIL import Image

        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            return int(image.width), int(image.height)
    except ImportError:
        return (None, None) if has_known_signature(path) else None
    except OSError:
        return None


def source_files() -> Iterable[Path]:
    for path in HERE.rglob("*"):
        if not path.is_file() or path.name.startswith("."):
            continue
        if path in {OUTPUT, Path(__file__).resolve()}:
            continue
        if path.suffix.lower() in BROWSER_EXTENSIONS | HEIC_EXTENSIONS:
            yield path


def main() -> int:
    candidates: set[Path] = set()
    warnings: list[str] = []

    for path in source_files():
        suffix = path.suffix.lower()
        if suffix in HEIC_EXTENSIONS:
            converted = convert_heic(path)
            if converted is None:
                warnings.append(
                    f"Skipped {path.relative_to(HERE)}: HEIC conversion is unavailable. "
                    "Install pillow-heif or a system HEIC converter."
                )
                continue
            candidates.add(converted)
        else:
            candidates.add(path)

    items: list[dict[str, object]] = []
    for index, path in enumerate(sorted(candidates, key=gallery_sort_key), start=1):
        dimensions = inspect_image(path)
        if dimensions is None:
            warnings.append(f"Skipped {path.relative_to(HERE)}: file is empty, corrupt, or not a supported image.")
            continue

        width, height = dimensions
        item: dict[str, object] = {
            "src": f"gallery/{path.relative_to(HERE).as_posix()}",
            "alt": f"Gallery photo {len(items) + 1}",
        }
        if width and height:
            item["width"] = width
            item["height"] = height
        items.append(item)

    payload = "window.GALLERY_ITEMS = " + json.dumps(items, indent=2) + ";\n"
    OUTPUT.write_text(payload, encoding="utf-8")

    for warning in warnings:
        print(f"Warning: {warning}", file=sys.stderr)

    print(f"Gallery updated: {len(items)} valid photo(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
