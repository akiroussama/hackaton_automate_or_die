"""Build the additive Day-2 CableTwin technical data room PDF.

This wrapper reuses the accepted Markdown renderer while changing only the
output path, the cover, the footer and a visual-evidence appendix. Historical
Phase-2 artifacts remain untouched.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
BASE_PATH = ROOT / "scripts" / "build_dataroom_pdf.py"
spec = importlib.util.spec_from_file_location("cabletwin_dataroom_base", BASE_PATH)
base = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(base)

OUT = (
    ROOT
    / "day2-final"
    / "data-room"
    / "02_CableTwin_SUPCOM_Day2_Technical_Data_Room.pdf"
)
SCREEN = ROOT / "day2-final" / "evidence" / "screenshots"
ARCH = (
    ROOT
    / "day2-final"
    / "architecture"
    / "CableTwin_SUPCOM_Day2_Hybrid_Decision_Architecture.png"
)
MARK = ROOT / "brand" / "logo" / "cabletwin-mark.png"


def day2_cover(story):
    story.append(Spacer(1, 20 * mm))
    if MARK.exists():
        logo = Image(str(MARK), width=24 * mm, height=24 * mm)
        logo.hAlign = "LEFT"
        story.append(logo)
        story.append(Spacer(1, 8 * mm))

    story.append(
        Paragraph(
            "CableTwin",
            ParagraphStyle(
                "day2-c1",
                fontName="Helvetica-Bold",
                fontSize=40,
                leading=46,
                textColor=base.DEEP,
                spaceAfter=5,
            ),
        )
    )
    story.append(
        Paragraph(
            "Technical Data Room · Day 2 Final",
            ParagraphStyle(
                "day2-c2",
                fontName="Helvetica",
                fontSize=17,
                leading=22,
                textColor=base.TEAL,
                spaceAfter=14,
            ),
        )
    )
    story.append(
        HRFlowable(
            width="62%",
            thickness=2.2,
            color=base.MINT,
            hAlign="LEFT",
            spaceAfter=15,
        )
    )
    story.append(
        Paragraph(
            "One line stops. CableTwin shows three verified recovery routes.",
            ParagraphStyle(
                "day2-hook",
                fontName="Helvetica-Bold",
                fontSize=16,
                leading=21,
                textColor=base.DEEP,
                spaceAfter=12,
            ),
        )
    )
    story.append(
        Paragraph(
            "Live workshop twin · deterministic planning · separate local learned "
            "guidance · separate bounded exact verification · human authority",
            ParagraphStyle(
                "day2-stack",
                fontName="Helvetica",
                fontSize=11,
                leading=16,
                textColor=base.SOFT,
                spaceAfter=14,
            ),
        )
    )

    evidence = [
        ["9 / 9", "5 / 5", "17,856", "10,440"],
        [
            "Planner & workflow",
            "Separate recommender",
            "Candidates",
            "Feasible schedules",
        ],
    ]
    table = Table(evidence, colWidths=[42.5 * mm] * 4, rowHeights=[13 * mm, 10 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), base.DEEP),
                ("TEXTCOLOR", (0, 0), (-1, 0), base.MINT),
                ("TEXTCOLOR", (0, 1), (-1, 1), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, 1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, 0), 16),
                ("FONTSIZE", (0, 1), (-1, 1), 7.5),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, base.TEAL),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 14 * mm))

    for line in [
        "Automate or Die 2026 · Industry · Production Planning & Supply Chain Optimization",
        "Team SUPCOM · Oussama Akir · Solo participant",
        "All companies, orders, operators, telemetry and operational results are fully synthetic.",
        "Read-only decision support · no machine control · no external AI API.",
    ]:
        story.append(
            Paragraph(
                line,
                ParagraphStyle(
                    "day2-meta",
                    fontName="Helvetica",
                    fontSize=10,
                    leading=15,
                    textColor=base.INK,
                ),
            )
        )
    story.append(PageBreak())


def day2_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(base.SOFT)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(
        20 * mm,
        12 * mm,
        "CableTwin · SUPCOM · Oussama Akir · Day 2 technical data room · "
        "All operational results are synthetic",
    )
    canvas.drawRightString(190 * mm, 12 * mm, f"Page {doc.page}")
    canvas.setFillColor(base.TEAL)
    canvas.rect(0, 285 * mm, 210 * mm, 2.2 * mm, stroke=0, fill=1)
    canvas.restoreState()


def visual_page(story, title, items):
    story.append(PageBreak())
    story.append(Paragraph(title, base.S["h1"]))
    story.append(
        HRFlowable(
            width="100%",
            thickness=1.4,
            color=base.MINT,
            spaceAfter=7,
        )
    )
    caption_style = ParagraphStyle(
        "visual-caption",
        parent=base.S["body"],
        fontName="Helvetica-Bold",
        fontSize=9.2,
        leading=12,
        textColor=base.TEAL,
        alignment=TA_CENTER,
        spaceBefore=3,
        spaceAfter=6,
    )
    for image_path, caption in items:
        if not image_path.exists():
            raise FileNotFoundError(image_path)
        pic = Image(str(image_path), width=170 * mm, height=95.625 * mm)
        pic.hAlign = "CENTER"
        story.append(KeepTogether([pic, Paragraph(caption, caption_style)]))


def day2_main():
    base.OUT = OUT
    base.cover = day2_cover
    base.header_footer = day2_header_footer
    OUT.parent.mkdir(parents=True, exist_ok=True)

    doc = base.SimpleDocTemplate(
        str(OUT),
        pagesize=base.A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="CableTwin Day 2 Technical Data Room",
        author="SUPCOM - Oussama Akir",
    )
    story = []
    day2_cover(story)
    for i, name in enumerate(base.FILES):
        if i:
            story.append(PageBreak())
        base.render_markdown(
            story, (base.SRC / name).read_text(encoding="utf-8")
        )

    visual_page(
        story,
        "Visual evidence · living twin and disruption",
        [
            (
                SCREEN / "00-twin-baseline.png",
                "Baseline: live isometric workshop twin at 10:00.",
            ),
            (
                SCREEN / "01-twin-recompute.png",
                "Incident: separate bounded exhaustive verification during recompute.",
            ),
        ],
    )
    visual_page(
        story,
        "Visual evidence · learned guidance and human authority",
        [
            (
                SCREEN / "02-twin-ml-cost.png",
                "Local model suggests Cost at approximately 79% displayed confidence.",
            ),
            (
                SCREEN / "03-twin-human-service.png",
                "The manager selects Service while the model suggestion stays visible.",
            ),
        ],
    )
    visual_page(
        story,
        "Visual evidence · audit and hybrid architecture",
        [
            (
                SCREEN / "04-twin-approved.png",
                "Service is approved at 10:07 and retained in the decision trace.",
            ),
            (
                ARCH,
                "Day 2 hybrid decision architecture: planner, recommender, verifier and human.",
            ),
        ],
    )

    doc.build(
        story,
        onFirstPage=day2_header_footer,
        onLaterPages=day2_header_footer,
    )
    print(f"Day 2 data room PDF written: {OUT}")


if __name__ == "__main__":
    day2_main()
