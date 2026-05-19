import os
import shutil
import subprocess
from PIL import Image

def main():
    webp_path = "pub/auraradar_scan_match_chat.webp"
    out_mp4 = "pub/auraradar_scan_match_chat.mp4"
    frames_dir = "pub/temp_frames"
    
    if os.path.exists(frames_dir):
        shutil.rmtree(frames_dir)
    os.makedirs(frames_dir)
    
    print(f"Opening {webp_path}...")
    img = Image.open(webp_path)
    
    durations = []
    print(f"Extracting {img.n_frames} frames to {frames_dir}...")
    
    for i in range(img.n_frames):
        img.seek(i)
        durations.append(img.info.get('duration', 100)) # fallback to 100ms
        frame_path = os.path.join(frames_dir, f"frame_{i:04d}.png")
        # Save as RGB to avoid alpha/palette transparency issues in h264 encoding
        img.convert("RGB").save(frame_path)
        
    avg_duration = sum(durations) / len(durations)
    fps = round(1000.0 / avg_duration, 2)
    print(f"Average frame duration: {avg_duration}ms (Calculated FPS: {fps})")
    
    print("Compiling frames into high-quality MP4 using ffmpeg...")
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(fps),
        "-i", os.path.join(frames_dir, "frame_%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        out_mp4
    ]
    
    subprocess.run(cmd, check=True)
    print(f"Success! WebP converted to MP4 at: {out_mp4}")
    
    print("Cleaning up temp frames directory...")
    shutil.rmtree(frames_dir)

if __name__ == "__main__":
    main()
