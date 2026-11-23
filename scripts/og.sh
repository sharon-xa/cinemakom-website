#!/usr/bin/env bash
# Makes public/og-ar.png and public/og-en.png (1200×630) for link previews.
# The mark is the app's branding/mark-full.svg path (src/assets/brand/), never
# redrawn; text is set in the bundled fonts through a private fontconfig.
set -euo pipefail
cd "$(dirname "$0")/.."

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
cat > "$TMP/fonts.conf" <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>$PWD/fonts-src</dir>
  <cachedir>$TMP/cache</cachedir>
</fontconfig>
EOF
export FONTCONFIG_FILE="$TMP/fonts.conf"

# The mark's path data, scaled into place.
MARK=$(sed -E 's/.*<path ([^>]*)\/>.*/<path \1\/>/' src/assets/brand/mark-full.svg)

bulbs() { # bulbs <y>: a row of lit bulbs
  local y=$1 out='' x
  for ((x = 66; x <= 1134; x += 14)); do
    out+="<circle cx=\"$x\" cy=\"$y\" r=\"3.5\" fill=\"#F4B740\"/>"
  done
  printf '%s' "$out"
}
TOP=$(bulbs 72)
BOTTOM=$(bulbs 558)

render() { # render <locale> <svg body>
  cat > "$TMP/og-$1.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#15100C"/>
  $TOP
  $BOTTOM
  $2
</svg>
EOF
  rsvg-convert -w 1200 -h 630 "$TMP/og-$1.svg" -o "public/og-$1.png"
}

render en "
  <g transform=\"translate(66 120) scale(1.3)\">$MARK</g>
  <text x=\"210\" y=\"178\" font-family=\"Big Shoulders Display\" font-weight=\"800\" font-size=\"52\" letter-spacing=\"1\" fill=\"#F4EAD7\">CINEMAKOM</text>
  <text x=\"212\" y=\"226\" font-family=\"Reem Kufi\" font-weight=\"700\" font-size=\"38\" fill=\"#F4B740\">سينماكم</text>
  <text x=\"66\" y=\"380\" font-family=\"Big Shoulders Display\" font-weight=\"900\" font-size=\"118\" fill=\"#F4EAD7\">CINEMANA,</text>
  <text x=\"66\" y=\"480\" font-family=\"Big Shoulders Display\" font-weight=\"900\" font-size=\"118\" fill=\"#F4EAD7\">FROM A BETTER SEAT.</text>
  <text x=\"1134\" y=\"178\" text-anchor=\"end\" font-family=\"IBM Plex Sans\" font-weight=\"600\" font-size=\"24\" fill=\"#B9A88E\">Free · Earthlink, Iraq</text>
"

render ar "
  <g transform=\"translate(1004 120) scale(1.3)\">$MARK</g>
  <text x=\"990\" y=\"184\" text-anchor=\"end\" font-family=\"Reem Kufi\" font-weight=\"700\" font-size=\"52\" fill=\"#F4B740\">سينماكم</text>
  <text x=\"990\" y=\"230\" text-anchor=\"end\" font-family=\"Big Shoulders Display\" font-weight=\"800\" font-size=\"36\" letter-spacing=\"1\" fill=\"#F4EAD7\">CINEMAKOM</text>
  <!-- One line. rsvg lays text out left to right: the right-to-left marks
       (U+200F) at both ends keep the comma and the full stop on the Arabic side. -->
  <text x=\"1134\" y=\"440\" text-anchor=\"end\" font-family=\"Reem Kufi\" font-weight=\"700\" font-size=\"112\" fill=\"#F4EAD7\">&#x200F;سينمانا، بس أحلى.&#x200F;</text>
  <text x=\"66\" y=\"178\" font-family=\"IBM Plex Sans Arabic\" font-weight=\"600\" font-size=\"26\" fill=\"#B9A88E\">مجاني · إيرثلنك، العراق</text>
"

ls -l public/og-*.png
