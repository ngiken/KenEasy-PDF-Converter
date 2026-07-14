from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = HERE / "out"
TARGET = ROOT / "docs" / "screenshots" / "quick-tour.gif"
SOURCES = [OUT / f"readme-tour-0{i}.png" for i in range(1, 4)]

frames = []
for source in SOURCES:
    image = Image.open(source).convert("RGB")
    image = image.resize((960, 600), Image.Resampling.LANCZOS)
    frames.append(image.quantize(colors=112, method=Image.Quantize.MEDIANCUT))

frames[0].save(TARGET, save_all=True, append_images=frames[1:], duration=[1800, 2200, 2400], loop=0, optimize=True, disposal=2)
print("Animated quick tour written to docs/screenshots/quick-tour.gif")
