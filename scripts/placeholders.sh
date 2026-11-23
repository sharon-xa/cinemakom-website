#!/usr/bin/env bash
# Makes src/data/placeholders.json: for each screenshot in src/assets/screens/,
# a tiny WebP (16 px wide for phones, 32 for computers) as a data: URL. Pages
# paint it behind the real image, so a slow connection shows a soft preview of
# the screen at once instead of an empty black frame. Run after adding or
# changing a screenshot (needs ImageMagick 7: `magick`).
set -euo pipefail
cd "$(dirname "$0")/.."
out=src/data/placeholders.json
{
  echo '{'
  first=1
  for f in src/assets/screens/*.png; do
    name=$(basename "$f" .png)
    w=16; [[ $name == desktop-* ]] && w=32
    data=$(magick "$f" -resize "${w}x" -strip -quality 40 webp:- | base64 -w0)
    [[ $first == 1 ]] || echo ','
    first=0
    printf '  "%s": "data:image/webp;base64,%s"' "$name" "$data"
  done
  echo
  echo '}'
} > "$out"
wc -c "$out"
