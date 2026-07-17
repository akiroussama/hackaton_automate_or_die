"""Build the jury-facing CableTwin technical data room PDF.

Concatenates docs/data-room/INDEX.md and the eight numbered documents into one
styled PDF. Output: output/dataroom/CableTwin_SUPCOM_Technical_Data_Room.pdf

Usage: python scripts/build_dataroom_pdf.py
"""

from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable, PageBreak, Paragraph, Preformatted, SimpleDocTemplate,
    Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "data-room"
OUT = ROOT / "output" / "dataroom" / "CableTwin_SUPCOM_Technical_Data_Room.pdf"

DEEP = colors.HexColor("#092925")
TEAL = colors.HexColor("#0F766E")
MINT = colors.HexColor("#C9F36B")
CREAM = colors.HexColor("#F5F4ED")
INK = colors.HexColor("#10221F")
SOFT = colors.HexColor("#53645F")

FILES = ["INDEX.md"] + [p.name for p in sorted(SRC.glob("0[1-8]-*.md"))]

S = {
    "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=19, leading=24,
                         textColor=DEEP, spaceBefore=6, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13.5, leading=17,
                         textColor=TEAL, spaceBefore=12, spaceAfter=6),
    "h3": ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=11.5, leading=15,
                         textColor=INK, spaceBefore=9, spaceAfter=4),
    "h4": ParagraphStyle("h4", fontName="Helvetica-Bold", fontSize=10.5, leading=13,
                         textColor=SOFT, spaceBefore=7, spaceAfter=3),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.7, leading=13.6,
                           textColor=INK, alignment=TA_LEFT, spaceAfter=5),
    "quote": ParagraphStyle("quote", fontName="Helvetica-Oblique", fontSize=10.5,
                            leading=14.5, textColor=TEAL, leftIndent=8 * mm,
                            spaceBefore=4, spaceAfter=7),
    "li": ParagraphStyle("li", fontName="Helvetica", fontSize=9.7, leading=13.4,
                         textColor=INK, leftIndent=6 * mm, bulletIndent=2 * mm,
                         spaceAfter=2.5),
    "cell": ParagraphStyle("cell", fontName="Helvetica", fontSize=8.6, leading=11.4,
                           textColor=INK),
    "cellh": ParagraphStyle("cellh", fontName="Helvetica-Bold", fontSize=8.8,
                            leading=11.6, textColor=colors.white),
    "code": ParagraphStyle("code", fontName="Courier", fontSize=8.4, leading=11,
                           textColor=DEEP, backColor=CREAM, borderPadding=5,
                           spaceBefore=4, spaceAfter=7),
}


def esc(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", text)  # links -> label
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+)`", r"<font face='Courier' size='8.6'>\1</font>", text)
    return text


def flush_table(story, rows):
    if not rows:
        return
    ncols = max(len(r) for r in rows)
    data = []
    for i, row in enumerate(rows):
        row = row + [""] * (ncols - len(row))
        style = S["cellh"] if i == 0 else S["cell"]
        data.append([Paragraph(esc(c), style) for c in row])
    width = 170 * mm
    first = min(0.42, max(0.22, len(rows[1][0]) / 90)) if len(rows) > 1 else 0.3
    col_widths = [width * first] + [(width * (1 - first)) / (ncols - 1)] * (ncols - 1) \
        if ncols > 1 else [width]
    t = Table(data, colWidths=col_widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DEEP),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREAM]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D8DDD4")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
    ]))
    story.append(t)
    story.append(Spacer(1, 5 * mm))


def render_markdown(story, text: str):
    lines = text.splitlines()
    i, table, code, code_buf = 0, [], False, []
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("```"):
            if code:
                story.append(Preformatted("\n".join(code_buf), S["code"]))
                code_buf = []
            code = not code
            i += 1
            continue
        if code:
            code_buf.append(line)
            i += 1
            continue
        if line.strip().startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if not all(re.fullmatch(r":?-{3,}:?", c) for c in cells):
                table.append(cells)
            i += 1
            continue
        flush_table(story, table)
        table = []
        stripped = line.strip()
        if not stripped:
            pass
        elif stripped.startswith("#### "):
            story.append(Paragraph(esc(stripped[5:]), S["h4"]))
        elif stripped.startswith("### "):
            story.append(Paragraph(esc(stripped[4:]), S["h3"]))
        elif stripped.startswith("## "):
            story.append(Paragraph(esc(stripped[3:]), S["h2"]))
        elif stripped.startswith("# "):
            story.append(Paragraph(esc(stripped[2:]), S["h1"]))
            story.append(HRFlowable(width="100%", thickness=1.4, color=MINT,
                                    spaceAfter=6))
        elif stripped.startswith(">"):
            story.append(Paragraph(esc(stripped.lstrip("> ")), S["quote"]))
        elif re.match(r"^\d+\.\s", stripped):
            story.append(Paragraph(esc(re.sub(r"^\d+\.\s", "", stripped)),
                                   S["li"], bulletText="•"))
        elif stripped.startswith(("- ", "* ")):
            story.append(Paragraph(esc(stripped[2:]), S["li"], bulletText="•"))
        else:
            story.append(Paragraph(esc(stripped), S["body"]))
        i += 1
    flush_table(story, table)


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(SOFT)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(20 * mm, 12 * mm,
                      "CableTwin · SUPCOM · Oussama Akir · Technical data room · "
                      "All operational results are synthetic")
    canvas.drawRightString(190 * mm, 12 * mm, f"Page {doc.page}")
    canvas.setFillColor(TEAL)
    canvas.rect(0, 285 * mm, 210 * mm, 2.2 * mm, stroke=0, fill=1)
    canvas.restoreState()


def cover(story):
    story.append(Spacer(1, 40 * mm))
    story.append(Paragraph("CableTwin",
                 ParagraphStyle("c1", fontName="Helvetica-Bold", fontSize=38,
                                textColor=DEEP, spaceAfter=8)))
    story.append(Paragraph("Technical Data Room — Phase 2 · The Build",
                 ParagraphStyle("c2", fontName="Helvetica", fontSize=16,
                                textColor=TEAL, spaceAfter=20)))
    story.append(HRFlowable(width="60%", thickness=2, color=MINT, hAlign="LEFT",
                            spaceAfter=20))
    for line in ["Automate or Die 2026 · Industry · Production Planning & Supply Chain Optimization",
                 "Team SUPCOM · Oussama Akir · Solo participant",
                 "The Waze of the cable factory",
                 "All companies, data and operational results are fully synthetic."]:
        story.append(Paragraph(line, ParagraphStyle(
            "c3", fontName="Helvetica", fontSize=11.5, leading=18, textColor=INK)))
    story.append(PageBreak())


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=20 * mm,
                            rightMargin=20 * mm, topMargin=18 * mm,
                            bottomMargin=18 * mm, title="CableTwin Technical Data Room",
                            author="SUPCOM - Oussama Akir")
    story = []
    cover(story)
    for i, name in enumerate(FILES):
        if i:
            story.append(PageBreak())
        render_markdown(story, (SRC / name).read_text(encoding="utf-8"))
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"data room PDF written: {OUT}")


if __name__ == "__main__":
    main()
