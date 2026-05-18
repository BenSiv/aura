import os
from PIL import Image, ImageDraw

icon_path = '/home/bensiv/Projects/aura/fst/metadata/android/en-US/images/icon.png'
feat_path = '/home/bensiv/Projects/aura/fst/metadata/android/en-US/images/featureGraphic.png'

# 1. Resize and Flatten App Icon
print(f"Reading original icon from {icon_path}...")
im = Image.open(icon_path)
print(f"Original Icon Size: {im.size}, Mode: {im.mode}")

# Resize to exactly 512x512
im_resized = im.resize((512, 512), Image.Resampling.LANCZOS)

# Flatten on solid brand background (#0F172A -> RGB 15, 23, 42)
background_icon = Image.new('RGB', (512, 512), (15, 23, 42))
if im_resized.mode == 'RGBA':
    background_icon.paste(im_resized, (0, 0), im_resized)
else:
    background_icon.paste(im_resized, (0, 0))

background_icon.save(icon_path, 'PNG')
print(f"Successfully generated Play Store compliant App Icon: Size {background_icon.size}, Mode {background_icon.mode}")

# 2. Generate Professional Gradient Feature Graphic (1024x500)
print("Creating gradient feature graphic...")
feat_width = 1024
feat_height = 500
feat_img = Image.new('RGB', (feat_width, feat_height))

# Generate high-quality linear gradient background from #0F172A (15, 23, 42) to #1E293B (30, 41, 59)
draw = ImageDraw.Draw(feat_img)
color_start = (15, 23, 42)
color_end = (30, 41, 59)

for y in range(feat_height):
    # Linear interpolation factor
    t = y / float(feat_height)
    r = int(color_start[0] * (1 - t) + color_end[0] * t)
    g = int(color_start[1] * (1 - t) + color_end[1] * t)
    b = int(color_start[2] * (1 - t) + color_end[2] * t)
    draw.line([(0, y), (feat_width, y)], fill=(r, g, b))

# Resize logo for feature graphic (e.g. 200x200)
logo_size = 200
logo_resized = im.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

# Calculate centered coordinates
px = (feat_width - logo_size) // 2
py = (feat_height - logo_size) // 2

# Paste logo centered
if logo_resized.mode == 'RGBA':
    feat_img.paste(logo_resized, (px, py), logo_resized)
else:
    feat_img.paste(logo_resized, (px, py))

# Save the feature graphic
feat_img.save(feat_path, 'PNG')
print(f"Successfully generated Feature Graphic: Size {feat_img.size}, Mode {feat_img.mode}")
