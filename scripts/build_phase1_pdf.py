"""Build the official CableTwin Phase 1 idea dossier as a polished PDF."""

from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "submissions" / "phase-1-idea.md"
OUTPUT = ROOT / "output" / "pdf" / "CableTwin_Phase1_Idea_SUPCOM.pdf"

DEEP = colors.HexColor("#092925")
TEAL = colors.HexColor("#0F766E")
MINT = colors.HexColor("#C9F36B")
CREAM = colors.HexColor("#F5F4ED")
INK = colors.HexColor("#10221F")
SOFT = colors.HexColor("#53645F")
LINE = colors.HexColor("#DDE5E0")
ORANGE = colors.HexColor("#E9763B")
WHITE = colors.white


def register_fonts() -> tuple[str, str, str]:
    candidates = {
        "regular": [
            Path("C:/Windows/Fonts/segoeui.ttf"),
            Path("C:/Windows/Fonts/arial.ttf"),
        ],
        "bold": [
            Path("C:/Windows/Fonts/segoeuib.ttf"),
            Path("C:/Windows/Fonts/arialbd.ttf"),
        ],
        "italic": [
            Path("C:/Windows/Fonts/segoeuii.ttf"),
            Path("C:/Windows/Fonts/ariali.ttf"),
        ],
    }
    selected: dict[str, str] = {}
    for role, paths in candidates.items():
        for path in paths:
            if path.exists():
                name = f"CableTwin-{role}"
                pdfmetrics.registerFont(TTFont(name, str(path)))
                selected[role] = name
                break
    if len(selected) == 3:
        pdfmetrics.registerFontFamily(
            "CableTwin",
            normal=selected["regular"],
            bold=selected["bold"],
            italic=selected["italic"],
            boldItalic=selected["bold"],
        )
        return selected["regular"], selected["bold"], selected["italic"]
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


FONT, FONT_BOLD, FONT_ITALIC = register_fonts()


def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "CableTwinTitle",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=31,
            leading=34,
            textColor=DEEP,
            alignment=TA_LEFT,
            spaceAfter=2 * mm,
        ),
        "subtitle": ParagraphStyle(
            "CableTwinSubtitle",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=17,
            leading=21,
            textColor=TEAL,
            spaceAfter=5 * mm,
        ),
        "eyebrow": ParagraphStyle(
            "Eyebrow",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=7.5,
            leading=9,
            tracking=1.4,
            textColor=TEAL,
            spaceAfter=2 * mm,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=8.3,
            leading=10.5,
            textColor=SOFT,
        ),
        "h1": ParagraphStyle(
            "Section",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=14,
            leading=17,
            textColor=DEEP,
            spaceBefore=4.2 * mm,
            spaceAfter=2 * mm,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "Subsection",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=10.4,
            leading=13,
            textColor=TEAL,
            spaceBefore=2.8 * mm,
            spaceAfter=1.4 * mm,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=8.5,
            leading=10.8,
            textColor=INK,
            spaceAfter=1.8 * mm,
            splitLongWords=True,
        ),
        "body_compact": ParagraphStyle(
            "BodyCompact",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=7.7,
            leading=9.4,
            textColor=INK,
            spaceAfter=0,
            splitLongWords=True,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=7.7,
            leading=9.4,
            textColor=WHITE,
            spaceAfter=0,
            splitLongWords=True,
        ),
        "kpi": ParagraphStyle(
            "Kpi",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=7.2,
            leading=10.5,
            textColor=SOFT,
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "caption": ParagraphStyle(
            "Caption",
            parent=base["BodyText"],
            fontName=FONT_ITALIC,
            fontSize=6.8,
            leading=8.5,
            textColor=SOFT,
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "diagram_box": ParagraphStyle(
            "DiagramBox",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=6.8,
            leading=8.2,
            textColor=DEEP,
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "diagram_arrow": ParagraphStyle(
            "DiagramArrow",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=9,
            leading=10,
            textColor=TEAL,
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName=FONT,
            fontSize=8.35,
            leading=10.4,
            textColor=INK,
            leftIndent=0,
            firstLineIndent=0,
            spaceAfter=0.5 * mm,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=11,
            leading=14,
            textColor=DEEP,
            leftIndent=4 * mm,
            rightIndent=3 * mm,
            spaceBefore=1 * mm,
            spaceAfter=1 * mm,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["Code"],
            fontName=FONT,
            fontSize=7.5,
            leading=10,
            textColor=DEEP,
            leftIndent=2 * mm,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=6.6,
            leading=8,
            textColor=SOFT,
        ),
    }


STYLES = make_styles()


def inline_markup(text: str) -> str:
    escaped = html.escape(text.strip())
    escaped = re.sub(
        r"\[([^\]]+)\]\((https?://[^)]+)\)",
        r'<link href="\2" color="#0F766E"><u>\1</u></link>',
        escaped,
    )
    escaped = re.sub(
        r"&lt;(https?://[^&]+)&gt;",
        r'<link href="\1" color="#0F766E"><u>\1</u></link>',
        escaped,
    )
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(
        r"`([^`]+)`",
        rf'<font name="{FONT_BOLD}" color="#075E57">\1</font>',
        escaped,
    )
    return escaped


def paragraph(text: str, style: str = "body") -> Paragraph:
    return Paragraph(inline_markup(text), STYLES[style])


def quote_box(text: str) -> Table:
    content = Paragraph(inline_markup(text), STYLES["quote"])
    table = Table([[content]], colWidths=[166 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFFBD7")),
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#B9D96E")),
                ("LINEBEFORE", (0, 0), (0, -1), 4, TEAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
            ]
        )
    )
    return table


def code_box(text: str) -> Table:
    pre = Preformatted(text.rstrip(), STYLES["code"])
    table = Table([[pre]], colWidths=[166 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EAF2EE")),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.3 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.3 * mm),
            ]
        )
    )
    return table


def kpi_cards() -> list:
    cells = [
        Paragraph(
            '<font size="15" color="#092925"><b>620 -&gt; 140 min</b></font>'
            "<br/>projected cumulative delay",
            STYLES["kpi"],
        ),
        Paragraph(
            '<font size="15" color="#092925"><b>+14.9%</b></font>'
            "<br/>projected shift-end output",
            STYLES["kpi"],
        ),
        Paragraph(
            '<font size="15" color="#092925"><b>180 -&gt; 30 min</b></font>'
            "<br/>projected overtime",
            STYLES["kpi"],
        ),
    ]
    table = Table([cells], colWidths=[166 * mm / 3] * 3)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CREAM),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
                ("LINEABOVE", (0, 0), (-1, 0), 2.5, TEAL),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
            ]
        )
    )
    caption = Paragraph(
        "Synthetic demonstration on one fixed incident and dataset; "
        "not measured factory performance.",
        STYLES["caption"],
    )
    return [table, Spacer(1, 1.2 * mm), caption, Spacer(1, 2 * mm)]


def goal_grid() -> list:
    cells = [
        Paragraph("<b>BOLD</b><br/>A decision twin for the minutes after a line stops", STYLES["body_compact"]),
        Paragraph("<b>USEFUL</b><br/>Three feasible recovery choices before approval", STYLES["body_compact"]),
        Paragraph("<b>MEASURABLE</b><br/>620 to 140 min delay; +14.9% shift-end output", STYLES["body_compact"]),
        Paragraph("<b>ACHIEVABLE</b><br/>Working offline prototype; 8/8 automated checks", STYLES["body_compact"]),
    ]
    table = Table([cells], colWidths=[166 * mm / 4] * 4)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CREAM),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
                ("LINEABOVE", (0, 0), (-1, 0), 2.2, TEAL),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.2 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2 * mm),
            ]
        )
    )
    return [table, Spacer(1, 1.5 * mm)]


def journey_diagram() -> list:
    labels = [
        "Factory<br/>snapshot",
        "Line<br/>stops",
        "Impact<br/>revealed",
        "Three recovery<br/>routes",
        "Compare<br/>KPIs",
        "Manager approval<br/>and audit",
    ]
    cells = []
    widths = []
    box_widths = [24.5, 24.5, 24.5, 27, 24.5, 25.5]
    for index, (label, width) in enumerate(zip(labels, box_widths)):
        cells.append(Paragraph(label, STYLES["diagram_box"]))
        widths.append(width * mm)
        if index < len(labels) - 1:
            cells.append(Paragraph("&gt;", STYLES["diagram_arrow"]))
            widths.append(3 * mm)

    table = Table([cells], colWidths=widths, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2.8 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.8 * mm),
    ]
    for column in range(0, len(cells), 2):
        commands.extend(
            [
                ("BACKGROUND", (column, 0), (column, 0), colors.HexColor("#EAF2EE")),
                ("BOX", (column, 0), (column, 0), 0.6, colors.HexColor("#B8CFC7")),
            ]
        )
    table.setStyle(TableStyle(commands))
    return [table, Spacer(1, 2 * mm)]


def table_widths(column_count: int) -> list[float]:
    total = 166 * mm
    if column_count == 7:
        ratios = [1.65, 0.78, 0.78, 0.72, 0.65, 1.15, 1.03]
    elif column_count == 3:
        ratios = [1.05, 1.35, 1.7]
    elif column_count == 2:
        ratios = [1.15, 2.25]
    else:
        ratios = [1.0] * column_count
    factor = total / sum(ratios)
    return [ratio * factor for ratio in ratios]


def build_table(rows: list[list[str]]) -> Table:
    column_count = len(rows[0])
    data = []
    for row_index, row in enumerate(rows):
        style = STYLES["table_header"] if row_index == 0 else STYLES["body_compact"]
        converted = [
            Paragraph(
                inline_markup(cell),
                style,
            )
            for cell in row
        ]
        data.append(converted)

    table = Table(
        data,
        colWidths=table_widths(column_count),
        repeatRows=1,
        hAlign="LEFT",
    )
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), DEEP),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 1.7 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.7 * mm),
    ]
    for index in range(1, len(data)):
        commands.append(
            (
                "BACKGROUND",
                (0, index),
                (-1, index),
                CREAM if index % 2 else WHITE,
            )
        )
    table.setStyle(TableStyle(commands))
    return table


def parse_table(lines: list[str], start: int) -> tuple[Table, int]:
    rows = []
    index = start
    while index < len(lines) and lines[index].strip().startswith("|"):
        cells = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
        rows.append(cells)
        index += 1
    if len(rows) >= 2 and all(re.fullmatch(r":?-{3,}:?", cell) for cell in rows[1]):
        rows.pop(1)
    return build_table(rows), index


def flush_paragraph(buffer: list[str], story: list) -> None:
    if buffer:
        story.append(paragraph(" ".join(part.strip() for part in buffer)))
        buffer.clear()


def markdown_to_story(lines: list[str], start_index: int) -> list:
    story: list = []
    paragraph_buffer: list[str] = []
    index = start_index

    while index < len(lines):
        raw = lines[index]
        stripped = raw.strip()

        if not stripped:
            flush_paragraph(paragraph_buffer, story)
            index += 1
            continue

        if stripped == "<!-- KPI_CARDS -->":
            flush_paragraph(paragraph_buffer, story)
            story.extend(kpi_cards())
            index += 1
            continue

        if stripped == "<!-- GOAL_GRID -->":
            flush_paragraph(paragraph_buffer, story)
            story.extend(goal_grid())
            index += 1
            continue

        if stripped == "<!-- JOURNEY_DIAGRAM -->":
            flush_paragraph(paragraph_buffer, story)
            story.extend(journey_diagram())
            index += 1
            continue

        if stripped == "<!-- PAGE_BREAK -->":
            flush_paragraph(paragraph_buffer, story)
            story.append(PageBreak())
            index += 1
            continue

        if stripped.startswith("```"):
            flush_paragraph(paragraph_buffer, story)
            index += 1
            code_lines = []
            while index < len(lines) and not lines[index].strip().startswith("```"):
                code_lines.append(lines[index])
                index += 1
            story.append(code_box("\n".join(code_lines)))
            story.append(Spacer(1, 2 * mm))
            index += 1
            continue

        if stripped.startswith("|"):
            flush_paragraph(paragraph_buffer, story)
            table, index = parse_table(lines, index)
            story.append(table)
            story.append(Spacer(1, 2.5 * mm))
            continue

        if stripped.startswith(">"):
            flush_paragraph(paragraph_buffer, story)
            quote_lines = []
            while index < len(lines) and lines[index].strip().startswith(">"):
                quote_lines.append(lines[index].strip()[1:].strip())
                index += 1
            story.append(quote_box(" ".join(quote_lines)))
            story.append(Spacer(1, 2 * mm))
            continue

        if stripped.startswith("### "):
            flush_paragraph(paragraph_buffer, story)
            story.append(Paragraph(inline_markup(stripped[4:]), STYLES["h2"]))
            index += 1
            continue

        if stripped.startswith("## "):
            flush_paragraph(paragraph_buffer, story)
            story.append(Paragraph(inline_markup(stripped[3:]), STYLES["h1"]))
            separator = HRFlowable(
                width="100%",
                thickness=0.7,
                color=LINE,
                spaceBefore=0,
                spaceAfter=1.7 * mm,
            )
            separator.keepWithNext = True
            story.append(separator)
            index += 1
            continue

        if stripped.startswith("- "):
            flush_paragraph(paragraph_buffer, story)
            items = []
            while index < len(lines) and lines[index].strip().startswith("- "):
                items.append(
                    ListItem(
                        paragraph(lines[index].strip()[2:], "bullet"),
                        leftIndent=3 * mm,
                    )
                )
                index += 1
            story.append(
                ListFlowable(
                    items,
                    bulletType="bullet",
                    bulletFontName=FONT_BOLD,
                    bulletFontSize=6.5,
                    bulletColor=TEAL,
                    leftIndent=5 * mm,
                    bulletOffsetY=1.5,
                    spaceAfter=1.7 * mm,
                )
            )
            continue

        numbered = re.match(r"^\d+\.\s+(.*)$", stripped)
        if numbered:
            flush_paragraph(paragraph_buffer, story)
            items = []
            while index < len(lines):
                match = re.match(r"^\d+\.\s+(.*)$", lines[index].strip())
                if not match:
                    break
                items.append(
                    ListItem(
                        paragraph(match.group(1), "bullet"),
                        leftIndent=3 * mm,
                    )
                )
                index += 1
            story.append(
                ListFlowable(
                    items,
                    bulletType="1",
                    start="1",
                    bulletFontName=FONT_BOLD,
                    bulletFontSize=7.5,
                    bulletColor=TEAL,
                    leftIndent=6 * mm,
                    spaceAfter=1.7 * mm,
                )
            )
            continue

        paragraph_buffer.append(stripped)
        index += 1

    flush_paragraph(paragraph_buffer, story)
    return story


def page_chrome(canvas, doc) -> None:
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(DEEP)
    canvas.rect(0, height - 5 * mm, width, 5 * mm, fill=1, stroke=0)
    canvas.setFillColor(MINT)
    canvas.rect(0, height - 5 * mm, 52 * mm, 5 * mm, fill=1, stroke=0)

    canvas.setFont(FONT_BOLD, 7)
    canvas.setFillColor(DEEP)
    canvas.drawString(15 * mm, 11 * mm, "CABLETWIN / SUPCOM")
    canvas.setFont(FONT, 6.5)
    canvas.setFillColor(SOFT)
    canvas.drawCentredString(
        width / 2,
        11 * mm,
        "AUTOMATE OR DIE 2026 - INDUSTRY - THEME 3 - PHASE 1",
    )
    canvas.drawRightString(width - 15 * mm, 11 * mm, f"{doc.page}")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(15 * mm, 15 * mm, width - 15 * mm, 15 * mm)
    canvas.restoreState()


def build_pdf() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    lines = SOURCE.read_text(encoding="utf-8").splitlines()

    start = next(
        index for index, line in enumerate(lines) if line.strip() == "<!-- GOAL_GRID -->"
    )

    story = [
        Spacer(1, 7 * mm),
        Paragraph(
            "AUTOMATE OR DIE 2026 / INDUSTRY / THEME 3 / PHASE 1 / 17 JULY 2026",
            STYLES["eyebrow"],
        ),
        Paragraph("CableTwin", STYLES["title"]),
        Paragraph("The Waze of the cable factory", STYLES["subtitle"]),
    ]

    meta = Table(
        [
            [
                Paragraph(
                    "<b>TEAM LEADER</b><br/>Oussama Akir - SUPCOM - solo",
                    STYLES["meta"],
                ),
                Paragraph(
                    "<b>THEME 3</b><br/>Production Planning &amp; Supply Chain Optimization",
                    STYLES["meta"],
                ),
                Paragraph(
                    "<b>STATUS</b><br/>Working prototype - all 8 sections",
                    STYLES["meta"],
                ),
            ]
        ],
        colWidths=[43 * mm, 76 * mm, 47 * mm],
    )
    meta.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CREAM),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
            ]
        )
    )
    story.extend(
        [
            meta,
            Spacer(1, 5 * mm),
            quote_box(
                "See before you decide: when a line stops, CableTwin turns a "
                "production emergency into three comparable recovery decisions, "
                "then lets the production manager choose and records the decision."
            ),
            Spacer(1, 2 * mm),
        ]
    )
    story.extend(markdown_to_story(lines, start))

    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=22 * mm,
        leftMargin=22 * mm,
        topMargin=11 * mm,
        bottomMargin=18 * mm,
        title="CableTwin - Phase 1 Idea - SUPCOM",
        author="SUPCOM",
        subject="AUTOMATE OR DIE 2026 Industry Challenge",
        creator="CableTwin",
    )
    document.build(story, onFirstPage=page_chrome, onLaterPages=page_chrome)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
