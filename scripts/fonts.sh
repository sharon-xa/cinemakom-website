#!/usr/bin/env bash
# Builds the site's WOFF2 font subsets from fonts-src/ into src/assets/fonts/.
#
# Each family is cut to one script (Latin or Arabic) and its variable axes are
# pinned to the weights the site uses, so a page only fetches glyphs it can show.
# The matching @font-face rules (with unicode-range) live in src/styles/fonts.css.
#
# Needs fontTools with the brotli module. If the system Python lacks brotli,
# a private venv is made in .cache/fonts-venv (gitignored).
set -euo pipefail

cd "$(dirname "$0")/.."
SRC=fonts-src
OUT=src/assets/fonts
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

PY=python3
if ! "$PY" -c 'import fontTools, brotli' 2>/dev/null; then
  VENV=.cache/fonts-venv
  if [ ! -x "$VENV/bin/python" ]; then
    echo "brotli not found: creating $VENV"
    python3 -m venv "$VENV"
    "$VENV/bin/pip" install --quiet 'fonttools>=4.68' brotli
  fi
  PY="$VENV/bin/python"
fi

LATIN='U+0000-00FF,U+2010-2027,U+2030-203A,U+20AC'
ARABIC='U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F'
FEATURES='*'   # keep every OpenType feature: Arabic shaping, kerning, tnum

# instance <src> <dst> <axis=limits>...: pin or narrow variable axes.
instance() {
  local src=$1 dst=$2
  shift 2
  "$PY" -m fontTools.varLib.instancer "$src" "$@" --output "$dst" --quiet
}

# subset <src> <name> <unicodes>: write $OUT/<name>.woff2.
subset() {
  "$PY" -m fontTools.subset "$1" \
    --unicodes="$3" \
    --layout-features="$FEATURES" \
    --flavor=woff2 \
    --no-hinting \
    --desubroutinize \
    --name-IDs='0,1,2,3,4,5,6' \
    --output-file="$OUT/$2.woff2"
}

mkdir -p "$OUT"
rm -f "$OUT"/*.woff2

# Display, Latin: Big Shoulders Display, 800–900 (still variable).
instance "$SRC/BigShouldersDisplay-Variable.ttf" "$TMP/bsd.ttf" wght=800:900
subset "$TMP/bsd.ttf" big-shoulders-display-latin "$LATIN"

# Display, Arabic: Reem Kufi Bold (700, static).
instance "$SRC/ReemKufi-Variable.ttf" "$TMP/reem.ttf" wght=700
subset "$TMP/reem.ttf" reem-kufi-700-arabic "$ARABIC"

# UI, Latin: IBM Plex Sans, 400–600, normal width (still variable).
instance "$SRC/IBMPlexSans-Variable.ttf" "$TMP/plex.ttf" wght=400:600 wdth=100
subset "$TMP/plex.ttf" ibm-plex-sans-latin "$LATIN"

# UI, Arabic: IBM Plex Sans Arabic, three static weights.
subset "$SRC/IBMPlexSansArabic-Regular.ttf" ibm-plex-sans-arabic-400 "$ARABIC"
subset "$SRC/IBMPlexSansArabic-Medium.ttf" ibm-plex-sans-arabic-500 "$ARABIC"
subset "$SRC/IBMPlexSansArabic-SemiBold.ttf" ibm-plex-sans-arabic-600 "$ARABIC"

ls -l "$OUT"
