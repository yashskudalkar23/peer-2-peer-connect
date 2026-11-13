#!/usr/bin/env python3
"""
make_qr.py — generate a branded Connect QR code.

Usage:
    python3 make_qr.py "https://your-live-url"           # -> qr.png
    python3 make_qr.py "https://your-live-url" out.png    # custom filename

Re-run this with your final hosted URL (GitHub Pages / Netlify / etc.)
and drop the new qr.png into the slides and promo images.
"""
import sys
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask

TEAL = (12, 106, 138)      # --accent
INK  = (15, 27, 45)        # --ink

def make(url, out="qr.png", color=INK):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # robust for print
        box_size=16,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        color_mask=SolidFillColorMask(front_color=color, back_color=(255, 255, 255)),
    )
    img.save(out)
    print("Wrote", out, "for", url)

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://peer-2-peer-connect.netlify.app"
    out = sys.argv[2] if len(sys.argv) > 2 else "qr.png"
    make(url, out)
