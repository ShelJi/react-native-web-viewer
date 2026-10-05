from PIL import Image, ImageOps
from pathlib import Path

SOURCE = Path("image.png")
OUTPUT = Path("images")

OUTPUT.mkdir(exist_ok=True)

img = Image.open(SOURCE).convert("RGBA")

# --------------------------------------------------
# original.png
# --------------------------------------------------
img.save(OUTPUT / "original.png", "PNG")


# --------------------------------------------------
# Helper: create square image
# --------------------------------------------------
def make_square(image, size, background=(255, 255, 255, 0)):
    image = image.copy()

    # Fit image inside square while preserving aspect ratio
    image.thumbnail((size, size), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), background)

    x = (size - image.width) // 2
    y = (size - image.height) // 2

    canvas.alpha_composite(image, (x, y))

    return canvas


# --------------------------------------------------
# icon.png
# Expo standard app icon
# --------------------------------------------------
icon = make_square(img, 1024)

icon.save(
    OUTPUT / "icon.png",
    "PNG",
    optimize=True
)


# --------------------------------------------------
# android-icon-foreground.png
# Android adaptive icon foreground
#
# Keep the logo smaller so Android can safely crop it.
# --------------------------------------------------
foreground = make_square(img, 1024)

# Add extra transparent padding
foreground.thumbnail((700, 700), Image.Resampling.LANCZOS)

adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))

x = (1024 - foreground.width) // 2
y = (1024 - foreground.height) // 2

adaptive.alpha_composite(foreground, (x, y))

adaptive.save(
    OUTPUT / "android-icon-foreground.png",
    "PNG",
    optimize=True
)


# --------------------------------------------------
# splash-icon.png
# Expo splash screen icon
# --------------------------------------------------
splash = make_square(img, 1024)

# Make the actual logo smaller for splash screen
logo = img.copy()
logo.thumbnail((700, 700), Image.Resampling.LANCZOS)

splash = Image.new("RGBA", (1024, 1024), (255, 255, 255, 0))

x = (1024 - logo.width) // 2
y = (1024 - logo.height) // 2

splash.alpha_composite(logo, (x, y))

splash.save(
    OUTPUT / "splash-icon.png",
    "PNG",
    optimize=True
)


# --------------------------------------------------
# favicon.png
# Web favicon
# --------------------------------------------------
favicon = make_square(img, 48)

favicon.save(
    OUTPUT / "favicon.png",
    "PNG",
    optimize=True
)


print("Generated successfully:")
print("  images/original.png")
print("  images/icon.png")
print("  images/android-icon-foreground.png")
print("  images/splash-icon.png")
print("  images/favicon.png")