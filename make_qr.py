#!/usr/bin/env python3
"""
Make a printable QR card for the water distributor site.

Install once:
    pip install "qrcode[pil]" pillow

Usage:
    python3 make_qr.py https://USERNAME.github.io/REPONAME
    python3 make_qr.py https://USERNAME.github.io/REPONAME --theme royal --name "Business Name" --out qr_card.png

Personal link for one shop (opens the order form with the shop name filled in):
    python3 make_qr.py "https://USERNAME.github.io/REPONAME/?shop=Sri%20Lakshmi%20Stores" --out qr_lakshmi.png
"""
import argparse
import sys

try:
    import qrcode
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit('Missing packages. Run: pip install "qrcode[pil]" pillow')

THEMES = {
    "teal":  {"header": "#062F36", "accent": "#22C3B3", "qr": "#062F36", "bg": "#E5F6F5", "text": "#FFFFFF", "ink": "#062F36"},
    "royal": {"header": "#0F1B3D", "accent": "#F97316", "qr": "#0F1B3D", "bg": "#EEF3FF", "text": "#FFFFFF", "ink": "#0F1B3D"},
}


def load_font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def centered(draw, text, y, font, fill, width):
    box = draw.textbbox((0, 0), text, font=font)
    x = (width - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=font, fill=fill)


def main():
    parser = argparse.ArgumentParser(description="Create a QR card for the site")
    parser.add_argument("url", help="Full site address, for example https://user.github.io/repo")
    parser.add_argument("--theme", choices=sorted(THEMES), default="teal")
    parser.add_argument("--name", default="Water Supply Khammam", help="Business name shown on the card")
    parser.add_argument("--line", default="Scan to order on WhatsApp", help="Line under the header")
    parser.add_argument("--out", default="qr_card.png", help="Output PNG file")
    args = parser.parse_args()

    t = THEMES[args.theme]
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=14, border=2)
    qr.add_data(args.url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=t["qr"], back_color="white").convert("RGB")

    width, header_h, pad = 900, 200, 60
    qr_size = width - 2 * pad - 40
    qr_img = qr_img.resize((qr_size, qr_size), Image.NEAREST)

    url_text = args.url if len(args.url) <= 48 else args.url[:45] + "..."
    height = header_h + pad + qr_size + 40 + 120
    card = Image.new("RGB", (width, height), t["bg"])
    draw = ImageDraw.Draw(card)

    draw.rectangle([0, 0, width, header_h], fill=t["header"])
    centered(draw, args.name, 50, load_font(54, True), t["text"], width)
    centered(draw, args.line, 125, load_font(34), t["accent"], width)

    top = header_h + pad
    draw.rounded_rectangle([pad, top, width - pad, top + qr_size + 40], radius=28, fill="white", outline=t["accent"], width=8)
    card.paste(qr_img, (pad + 20, top + 20))

    centered(draw, url_text, top + qr_size + 40 + 36, load_font(28), t["ink"], width)

    card.save(args.out)
    print("Saved", args.out)


if __name__ == "__main__":
    main()
