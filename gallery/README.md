# Updating the gallery

1. Put photos anywhere inside this `gallery` folder. Year folders such as `gallery/2026/` are supported.
2. From the website root, run:

```bash
python3 gallery/build_gallery.py
```

3. Commit the new photos and the regenerated `gallery/gallery-data.js`.

The page displays photos only: three columns on laptops/desktops, two on tablets, and one on phones. JPG, JPEG, PNG, WebP, GIF, and AVIF work directly. HEIC/HEIF is converted to JPEG when macOS `sips`, `heif-convert`, ImageMagick, or Python `pillow-heif` is available. Empty and corrupt files are skipped.
