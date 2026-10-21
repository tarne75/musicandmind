#!/usr/bin/env bash
# Downloads the full-resolution ORIGINAL images from the old Wix site into images/originals/ (git-ignored backups).
# The site itself uses the optimised .webp copies in images/media and images/blog.
# Usage (from project root):  bash scripts/download-images.sh
# Safe to re-run: existing files are skipped. Requires only curl.
cd "$(dirname "$0")/.." || exit 1
BASE="https://static.wixstatic.com/media"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"
fail=0

get() { # $1 = local path, $2 = wix file id
  if [ -s "$1" ]; then echo "skip   $1"; return; fi
  mkdir -p "$(dirname "$1")"
  if curl -fsSL --retry 3 --retry-delay 2 -A "$UA" -e "https://www.musicandmind.co.uk/" -o "$1" "$BASE/$2"; then
    echo "saved  $1"
  else
    echo "FAILED $1 ($2)"; rm -f "$1"; fail=$((fail+1))
  fi
}

# Media page clippings -> images/media/m01...m26
i=0
for id in \
  bf1d7b_d6331400807945efa7846052b2ff9862~mv2.jpg bf1d7b_3c1925337dc74d2caa29202a4227088e~mv2.png \
  bf1d7b_a541614464194bd4aab4b03b183889f5~mv2.png bf1d7b_c89acb56911e46e79f63df912d9ab03a~mv2.png \
  bf1d7b_d7238e15485b41ae85137d5bd317a11d~mv2.png bf1d7b_9b898afe3fc34cddb60ba968ee2d2cd0~mv2.png \
  bf1d7b_14c9bfa881a243ca833a3579416a5eea~mv2.png bf1d7b_97fb73a797dc4181a9a30d62e7a8cae4~mv2.png \
  bf1d7b_639dd60d009c496aa7b681100c4feb54~mv2.png bf1d7b_86f9b8906c934b37be5a4af96d34cd21~mv2.png \
  bf1d7b_90ed9ed67a1f420f9883e517f6d4afcf~mv2.png bf1d7b_f0562589250f424a8dc36a87776239e0~mv2.png \
  bf1d7b_3256313bdf5343689b6196ca606c3fa6~mv2.png bf1d7b_d6b0bb104add41e0a28968e01d19951f~mv2.png \
  bf1d7b_133dbd9cdc3a444aaa4a54765859d339~mv2.png bf1d7b_34788e920bd54b668afb12c8f65087d0~mv2.png \
  bf1d7b_58d7ccbace9d4a98947fd6347f8c6999~mv2.png bf1d7b_fbd956a46bad4168a7e104a36c0a472b~mv2.png \
  bf1d7b_2657e28ce82e464e8bc75b115f77c941~mv2.png bf1d7b_4aea2e9b6e2f4b8b9fe1a5e1343bcdfd~mv2.png \
  bf1d7b_aa5ad788f8bd4dff9fb68673f3c24147~mv2.png bf1d7b_af382e262c9a43f7bb33378d5d66f7a9~mv2.png \
  bf1d7b_57cc40b1daef47ddb24450283a544bee~mv2.jpg bf1d7b_45b6f766bd5745dfaf343149710ddc3b~mv2.png \
  bf1d7b_3959770a6c9a417a87b055977f0e510b~mv2.png bf1d7b_5444a499b35e489f895729e51e6d5012~mv2.png
do
  i=$((i+1)); get "$(printf 'images/originals/media/m%02d.%s' "$i" "${id##*.}")" "$id"
done

# Blog thumbnails -> images/blog/b01...b10.png
i=0
for id in \
  bf1d7b_65b06b2974fd4aa59c5d339293bd8725~mv2.png bf1d7b_e356e64cce044b109af644711fabc053~mv2.png \
  bf1d7b_91154b870cad4d639ca68f73d02d7e99~mv2.png bf1d7b_a7a1ccee8c3c4f2e96b78f503b33dc63~mv2.png \
  bf1d7b_ed01dd8ca21045b0a814406e2396491f~mv2.png bf1d7b_bfe4d28e56464323846af3ff92da4f5b~mv2.png \
  bf1d7b_233636a5c9f5445bb11ae6db8ea76191~mv2.png bf1d7b_bd3b038788e34e68b15241a422d0f397~mv2.png \
  bf1d7b_3bc8fc0918d64d9999722b7abf4c0385~mv2.png bf1d7b_840ddf967e574a9b9d9df34f43e13f56~mv2.png
do
  i=$((i+1)); get "$(printf 'images/originals/blog/b%02d.png' "$i")" "$id"
done

# Original logo + social icons (reference only)
get images/originals/brand/logo-original.png "bf1d7b_109332c6003f4a48915a7d1a560f7cad~mv2_d_4000_1837_s_2.png"
get images/originals/brand/icon-youtube.png   a1b09fe8b7f04378a9fe076748ad4a6a.png
get images/originals/brand/icon-twitter.png   9c4b521dd2404cd5a05ed6115f3a0dc8.png
get images/originals/brand/icon-facebook.png  e316f544f9094143b9eac01f1f19e697.png
get images/originals/brand/icon-instagram.png 8d6893330740455c96d218258a458aa4.png

echo; [ "$fail" -eq 0 ] && echo "All images downloaded." || echo "$fail download(s) failed; re-run to retry."
