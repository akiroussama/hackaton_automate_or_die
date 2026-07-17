"""Build the one-page CableTwin brand guide PDF.

Output: brand/CableTwin_Brand_Guide.pdf
Usage: python scripts/build_brand_guide.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable, Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand"
OUT = BRAND / "CableTwin_Brand_Guide.pdf"

DEEP = colors.HexColor("#092925")
TEAL = colors.HexColor("#0F766E")
MINT = colors.HexColor("#C9F36B")
CREAM = colors.HexColor("#F5F4ED")
WHITE = colors.white
ORANGE = colors.HexColor("#E9763B")
INK = colors.HexColor("#10221F")
SOFT = colors.HexColor("#53645F")

h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=24, leading=30,
                    textColor=DEEP, spaceAfter=2)
h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=12, textColor=TEAL,
                    spaceBefore=10, spaceAfter=4)
body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.5, leading=13,
                      textColor=INK, spaceAfter=3)
cell = ParagraphStyle("cell", fontName="Helvetica", fontSize=8.8, leading=11.5,
                      textColor=INK)

story = []
story.append(Paragraph("CableTwin brand guide", h1))
story.append(Paragraph("The Waze of the cable factory · Automate or Die 2026 · Team SUPCOM",
                       ParagraphStyle("sub", fontName="Helvetica", fontSize=10.5,
                                      textColor=SOFT, spaceAfter=6)))
story.append(HRFlowable(width="100%", thickness=1.6, color=MINT, spaceAfter=8))

story.append(Paragraph("Brand idea", h2))
story.append(Paragraph(
    "Three cable lines; one stops (orange); a mint recovery route bypasses the stop. "
    "The mark tells the product story: when a production route closes, CableTwin finds "
    "and compares the alternatives, and the human decides.", body))

story.append(Paragraph("Primary logo and compact mark", h2))
logo_table = Table(
    [[Image(str(BRAND / "logo" / "cabletwin-logo.png"), width=88 * mm, height=22.4 * mm),
      Image(str(BRAND / "logo" / "cabletwin-mark.png"), width=22 * mm, height=22 * mm)]],
    colWidths=[110 * mm, 60 * mm])
logo_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("BACKGROUND", (0, 0), (-1, -1), WHITE),
    ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#D8DDD4")),
    ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
]))
story.append(logo_table)
story.append(Spacer(1, 3 * mm))
story.append(Paragraph(
    "Files: <b>cabletwin-logo-light.svg</b> (for light backgrounds), "
    "<b>cabletwin-logo-dark.svg</b> (for dark backgrounds), "
    "<b>cabletwin-logo-monochrome.svg</b> (single colour), "
    "<b>cabletwin-mark.svg</b> (compact). PNG exports are provided alongside.", body))

story.append(Paragraph("Palette", h2))
sw = [("Deep green", "#092925", DEEP, WHITE), ("Teal", "#0F766E", TEAL, WHITE),
      ("Mint", "#C9F36B", MINT, DEEP), ("Cream", "#F5F4ED", CREAM, DEEP),
      ("White", "#FFFFFF", WHITE, DEEP), ("Orange accent", "#E9763B", ORANGE, WHITE)]
row = [Paragraph(f"<font color='{'white' if fg == WHITE else '#092925'}'>"
                 f"<b>{name}</b><br/>{hexv}</font>", cell) for name, hexv, _, fg in sw]
pal = Table([row], colWidths=[170 * mm / 6] * 6, rowHeights=[16 * mm])
pal.setStyle(TableStyle(
    [("BACKGROUND", (i, 0), (i, 0), c) for i, (_, _, c, _) in enumerate(sw)] + [
     ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
     ("LEFTPADDING", (0, 0), (-1, -1), 6),
     ("BOX", (3, 0), (4, 0), 0.4, colors.HexColor("#D8DDD4"))]))
story.append(pal)

story.append(Paragraph("Typography", h2))
story.append(Paragraph(
    "Headlines and UI numerals: <b>Segoe UI Bold / Arial Bold</b>. Body: Segoe UI / "
    "Arial. Documents: Helvetica / Arial. Only standard, portable system fonts are "
    "used so every deliverable renders identically on jury machines.", body))

story.append(Paragraph("Usage rules", h2))
rules = [
    "Keep clear space around the logo of at least the height of one cable line in the mark.",
    "Minimum sizes: mark 16 px; full wordmark 140 px wide.",
    "Use the dark-background variant on deep green; the light variant on white or cream.",
    "Mint is the accent for routes, key metrics and calls to action — never for body text on white.",
    "Orange marks the incident only; never use it as a general accent.",
    "Do not recolour, stretch, outline, rotate or add effects to the logo.",
    "Never associate the brand with a real cable manufacturer; always label operational results as synthetic.",
]
for r in rules:
    story.append(Paragraph(r, ParagraphStyle("li", parent=body, leftIndent=5 * mm,
                                             bulletIndent=1 * mm), bulletText="-"))

story.append(Paragraph("Applications", h2))
story.append(Paragraph(
    "Slides: deep-green title/closing slides, cream content slides (see the Phase 2 deck). "
    "Video thumbnail: brand/social/cabletwin-demo-thumbnail.png. "
    "Product UI: the frozen prototype palette is the source of this system.", body))

doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                        topMargin=16 * mm, bottomMargin=14 * mm,
                        title="CableTwin Brand Guide", author="SUPCOM - Oussama Akir")
doc.build(story)
print(f"brand guide written: {OUT}")
