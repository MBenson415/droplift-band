"""Generate an Open Graph image (1200x630) with the Droplift logo and title."""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = ROOT / "public" / "droplift-logo.png"
OUTPUT_PATH = ROOT / "public" / "og-image.png"

WIDTH, HEIGHT = 1200, 630
BG_COLOR = (0, 0, 0)
TEXT_COLOR = (255, 107, 0)  # brand orange

# Create black canvas
img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
draw = ImageDraw.Draw(img)

# Place logo centered, sized to fit
logo = Image.open(LOGO_PATH).convert("RGBA")
logo_max_h = 350
ratio = logo_max_h / logo.height
logo_resized = logo.resize((int(logo.width * ratio), logo_max_h), Image.LANCZOS)
logo_x = (WIDTH - logo_resized.width) // 2
logo_y = 60
img.paste(logo_resized, (logo_x, logo_y), logo_resized)

# Add "DROPLIFT" text below logo
try:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
except OSError:
    font = ImageFont.load_default()

text = "DROPLIFT"
bbox = draw.textbbox((0, 0), text, font=font)
text_w = bbox[2] - bbox[0]
text_x = (WIDTH - text_w) // 2
text_y = logo_y + logo_max_h + 40
draw.text((text_x, text_y), text, fill=TEXT_COLOR, font=font)

img.save(OUTPUT_PATH, "PNG")
print(f"OG image saved to {OUTPUT_PATH}")
