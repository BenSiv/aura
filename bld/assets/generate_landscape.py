import os
import glob
from PIL import Image, ImageDraw, ImageFilter

portrait_dir = '/home/bensiv/Projects/aura/fst/metadata/android/en-US/images/phoneScreenshots'
landscape_dir = '/home/bensiv/Projects/aura/fst/metadata/android/en-US/images/landscapeScreenshots'

os.makedirs(landscape_dir, exist_ok=True)

png_files = sorted(glob.glob(os.path.join(portrait_dir, '*.png')))

for filepath in png_files:
    filename = os.path.basename(filepath)
    print(f"Generating landscape format for {filename}...")
    
    # Load original portrait screenshot
    portrait_im = Image.open(filepath)
    
    # Create 1920x1080 canvas
    canvas_w = 1920
    canvas_h = 1080
    canvas = Image.new('RGB', (canvas_w, canvas_h))
    
    # Draw premium gradient background (#0F172A to #1E293B)
    draw = ImageDraw.Draw(canvas)
    color_start = (15, 23, 42)
    color_end = (30, 41, 59)
    for y in range(canvas_h):
        t = y / float(canvas_h)
        r = int(color_start[0] * (1 - t) + color_end[0] * t)
        g = int(color_start[1] * (1 - t) + color_end[1] * t)
        b = int(color_start[2] * (1 - t) + color_end[2] * t)
        draw.line([(0, y), (canvas_w, y)], fill=(r, g, b))
        
    # Scale portrait screenshot to fit height 960 (preserving 9:16 ratio)
    screen_h = 960
    screen_w = 540
    screen_resized = portrait_im.resize((screen_w, screen_h), Image.Resampling.LANCZOS)
    
    # Center coordinates
    px = (canvas_w - screen_w) // 2
    py = (canvas_h - screen_h) // 2
    
    # Draw a beautiful mockup container behind the screenshot (with matching #6366F1 indigo glow)
    glow_border = 4
    glow_box = [px - glow_border, py - glow_border, px + screen_w + glow_border, py + screen_h + glow_border]
    draw.rounded_rectangle(glow_box, radius=24, fill=(99, 102, 241)) # Aura indigo accent
    
    # Paste screenshot inside the container (overlapping rounded corners slightly for look)
    # To mask rounded corners on the screen, we create a rounded rectangle mask
    mask = Image.new('L', (screen_w, screen_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, screen_w, screen_h], radius=20, fill=255)
    
    canvas.paste(screen_resized, (px, py), mask)
    
    # Save PNG version
    canvas.save(os.path.join(landscape_dir, filename), 'PNG')
    
    # Save JPEG version
    jpeg_filename = os.path.splitext(filename)[0] + '.jpg'
    canvas.save(os.path.join(landscape_dir, jpeg_filename), 'JPEG', quality=95)
    print(f"Successfully generated {filename} (PNG) and {jpeg_filename} (JPEG) at 1920x1080!")
