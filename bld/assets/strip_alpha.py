import glob
import os
from PIL import Image

screenshot_dir = '/home/bensiv/Projects/aura/fst/metadata/android/en-US/images/phoneScreenshots'
png_files = glob.glob(os.path.join(screenshot_dir, '*.png'))

for filepath in png_files:
    print(f"Processing {os.path.basename(filepath)}...")
    im = Image.open(filepath)
    print(f"Original mode: {im.mode}")
    # Convert to RGB to strip the alpha channel
    rgb_im = im.convert('RGB')
    # Save back as a PNG without alpha
    rgb_im.save(filepath, 'PNG')
    print(f"Successfully converted {os.path.basename(filepath)} to 24-bit RGB (no alpha channel)")
