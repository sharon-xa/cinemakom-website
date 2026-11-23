#!/usr/bin/env bash
# Makes src/data/placeholders.json: for each screenshot in src/assets/screens/,
# a tiny WebP (32 px wide for phones, 64 for computers) and its size. Pages
# paint it, softened by an SVG blur (src/lib/screens.ts), behind the real
# image, so a slow connection shows a smooth preview of the screen at once
# instead of an empty black frame. Run after adding or changing a screenshot
# (needs ImageMagick 7: `magick`).
set -euo pipefail
cd "$(dirname "$0")/.."
out=src/data/placeholders.json
{
  echo '{'
  first=1
  for f in src/assets/screens/*.png; do
    name=$(basename "$f" .png)
    w=32; [[ $name == desktop-* ]] && w=64
    tmp=$(mktemp --suffix=.webp)
    trap 'rm -f "$tmp"' EXIT
    magick "$f" -resize "${w}x" -strip -quality 55 "$tmp"
    pw=$(magick identify -format '%w' "$tmp")
    ph=$(magick identify -format '%h' "$tmp")
    data=$(base64 -w0 "$tmp")
    rm -f "$tmp"
    [[ $first == 1 ]] || echo ','
    first=0
    printf '  "%s": { "w": %d, "h": %d, "webp": "%s" }' "$name" "$pw" "$ph" "$data"
  done
  echo
  echo '}'
} > "$out"
wc -c "$out"
