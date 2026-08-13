# Amitabha Deb personal website

A lightweight static site for GitHub Pages. Upload everything in this folder to the repository root; no framework or build step is required for normal publishing.

## Pages

- `index.html` — personal bio and contact card
- `experience.html` — work history
- `education.html` — education
- `skills.html` — skills
- `projects.html` — projects and publications
- `gallery.html` — photo-only gallery

## Updating the gallery

Add photos inside `gallery/` (year folders are supported), then run:

```bash
python3 gallery/build_gallery.py
```

The generator creates `gallery/gallery-data.js`, skips empty or corrupt files, and converts HEIC/HEIF when a compatible local converter is installed. More detail is in `gallery/README.md`.

## Publishing

Replace the contents of the existing GitHub Pages repository with the contents of this folder, commit, and push to `main`.
