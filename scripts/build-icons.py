"""
Builds every app icon from the brand artwork in assets/brand/voca-icon.jpg:
the iOS/store icon, Android adaptive layers (background, foreground, themed
monochrome), the notification icon, splash image, favicon and the 512x512
Google Play icon.

    python scripts/build-icons.py        (or: npm run build:icons)

Needs Python 3 with Pillow (pip install pillow).
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "brand" / "voca-icon.jpg"
OUT = ROOT / "assets" / "images"
STORE = ROOT / "Screenshots"

# The puzzle-ring disc in the source image (measured).
CX, CY, R = 712, 708, 682
# The orange centre with the "V" and sound waves.
INNER_R = 440


def circle_mask(size, cx, cy, r, feather=2):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather)) if feather else m


def disc(src):
    """The disc cut out on a transparent, square canvas."""
    rgba = src.convert("RGBA")
    rgba.putalpha(circle_mask(src.size, CX, CY, R))
    return rgba.crop((CX - R, CY - R, CX + R, CY + R))


def background(src, size):
    """The soft gradient behind the disc, without the disc."""
    # Average the corners into a smooth four-corner gradient.
    w, h = src.size
    pick = lambda x, y: src.getpixel((x, y))
    tl, tr, bl, br = pick(8, 8), pick(w - 9, 8), pick(8, h - 9), pick(w - 9, h - 9)
    small = Image.new("RGB", (2, 2))
    small.putpixel((0, 0), tl)
    small.putpixel((1, 0), tr)
    small.putpixel((0, 1), bl)
    small.putpixel((1, 1), br)
    return small.resize((size, size), Image.BICUBIC)


def letter_mask(src, size):
    """The cream "V" and sound waves inside the orange centre, as an alpha mask."""
    rgb = src.convert("RGB")
    r, g, b = [c for c in rgb.split()]
    # Cream: bright and not very saturated (orange felt is bright but saturated).
    sat = ImageChops.subtract(r, b)
    bright = r.point(lambda v: 255 if v > 200 else 0)
    low_sat = sat.point(lambda v: 255 if v < 55 else 0)
    m = ImageChops.multiply(bright, low_sat)
    m = ImageChops.multiply(m, circle_mask(src.size, CX, CY, INNER_R, feather=0))
    m = m.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    box = (CX - INNER_R, CY - INNER_R, CX + INNER_R, CY + INNER_R)
    return m.crop(box).resize((size, size), Image.LANCZOS)


def placed(img, canvas, scale):
    """img centred on a transparent canvas, scaled to `scale` of its width."""
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    d = round(canvas * scale)
    piece = img.resize((d, d), Image.LANCZOS)
    out.alpha_composite(piece, ((canvas - d) // 2, (canvas - d) // 2))
    return out


def silhouette(mask, canvas, scale, colour=(255, 255, 255)):
    d = round(canvas * scale)
    m = mask.resize((d, d), Image.LANCZOS)
    solid = Image.new("RGBA", (d, d), colour + (255,))
    solid.putalpha(m)
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    out.alpha_composite(solid, ((canvas - d) // 2, (canvas - d) // 2))
    return out


def main():
    src = Image.open(SRC).convert("RGB")
    STORE.mkdir(exist_ok=True)
    cut = disc(src)
    letters = letter_mask(src, 1024)

    full = src.resize((1024, 1024), Image.LANCZOS)
    full.save(OUT / "icon.png")  # iOS + Expo: square, opaque
    src.resize((512, 512), Image.LANCZOS).save(STORE / "play-icon-512.png")

    # Android adaptive icon: the mask shows roughly the middle 2/3, so the disc sits inside it.
    background(src, 512).save(OUT / "android-icon-background.png")
    placed(cut, 512, 0.64).save(OUT / "android-icon-foreground.png")
    silhouette(letters, 432, 0.62, (0, 0, 0)).save(OUT / "android-icon-monochrome.png")

    silhouette(letters, 96, 0.9).save(OUT / "notification-icon.png")
    placed(cut, 600, 0.96).save(OUT / "splash-icon.png")
    placed(cut, 48, 1.0).save(OUT / "favicon.png")

    for name in ["icon.png", "android-icon-background.png", "android-icon-foreground.png", "android-icon-monochrome.png", "notification-icon.png", "splash-icon.png", "favicon.png"]:
        print(f"  {name:32} {Image.open(OUT / name).size}")
    print(f"  {'Screenshots/play-icon-512.png':32} (512, 512)")


if __name__ == "__main__":
    main()
