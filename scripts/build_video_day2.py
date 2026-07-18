"""Assemble the Day 2 CableTwin demo video (factory-twin edition).

Inputs : tmp/video-frames-day2/ (from scripts/record-video-day2.mjs)
Outputs: output/video-day2/CableTwin_SUPCOM_Demo_2min_Day2.mp4 (+ .srt)

Same proven pipeline as scripts/build_video.py: per-segment neural narration
(edge-tts) -> VFR visual track from arrival-clock frames -> delayed-mix audio
-> H.264/AAC -> SRT. New narration centered on the living factory twin and
the local ML recommender (wording respects the coordination red lines:
"incidents simulated by the twin itself").

Usage: python scripts/build_video_day2.py
"""

from __future__ import annotations

import asyncio
import json
import re
import shutil
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "tmp" / "video-frames-day2"
WORK = ROOT / "tmp" / "video-build-day2"
OUT_DIR = ROOT / "output" / "video-day2"
OUT_MP4 = OUT_DIR / "CableTwin_SUPCOM_Demo_2min_Day2.mp4"
OUT_SRT = OUT_DIR / "CableTwin_SUPCOM_Demo_2min_Day2.srt"

VOICE = "en-US-AndrewNeural"

FFMPEG = shutil.which("ffmpeg") or next(
    (str(p) for p in (Path.home() / "AppData/Local/Microsoft/WinGet/Packages")
     .glob("**/ffmpeg.exe")), None)
FFPROBE = shutil.which("ffprobe") or (FFMPEG and str(Path(FFMPEG).parent / "ffprobe.exe"))

# (start_seconds, rate, narration)
SEGMENTS = [
    (0.8, "+0%", "A production line stops. In seconds, a perfect plan becomes "
     "impossible. CableTwin is a living digital twin that lets the manager "
     "see before deciding."),
    (11.3, "+0%", "This is the live factory twin: three cable lines, ten client "
     "orders, streaming simulated sensors - speed, temperature, tension, "
     "power. Fully synthetic data, running locally, completely offline."),
    (26.2, "+0%", "At ten o'clock, Line 2 stops for four hours. Watch the "
     "engine explore seventeen thousand eight hundred fifty-six candidate "
     "schedules and keep the ten thousand four hundred forty feasible ones - "
     "live, in front of you."),
    (40.5, "+0%", "A local machine-learning model, trained on six hundred "
     "eighty-seven incidents simulated by the twin itself, recommends the "
     "balanced Cost route at seventy-nine percent confidence. Line two's "
     "telemetry flatlines; plant power drops in real time."),
    (55.7, "+0%", "The manager stays in command and chooses Service instead: "
     "priority orders glide to lines one and three, crews are mobilized, and "
     "projected delay falls from six hundred twenty to one hundred forty "
     "minutes."),
    (68.8, "+0%", "One click approves the plan. Nothing is ever sent to a "
     "machine - the decision lands in an audit trail: who decided, when, on "
     "which numbers."),
    (79.3, "+0%", "Behind the twin, the same deterministic engine powers the "
     "full decision view - revised Gantt, before-and-after KPIs, complete "
     "traceability."),
    (94.5, "+8%", "Verified by nine automated checks, an exact exhaustive "
     "benchmark, and a dedicated five-test harness for the recommender. Scan "
     "the link - it runs live in your browser."),
]

VIDEO_BASE_S = 112.0
HARD_LIMIT_S = 119.0


def run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed:\n{p.stderr[-1500:]}")
    return p.stdout


def probe_duration(path: Path) -> float:
    out = run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", str(path)])
    return float(out.strip())


async def synth() -> list[float]:
    durations = []
    for i, (_, rate, text) in enumerate(SEGMENTS):
        mp3 = WORK / f"seg-{i}.mp3"
        await edge_tts.Communicate(text, VOICE, rate=rate).save(str(mp3))
        durations.append(probe_duration(mp3))
    return durations


def build_visual_track() -> Path:
    meta = json.loads((FRAMES / "meta.json").read_text())
    frames = meta["frames"]
    total = meta["totalMs"] / 1000.0
    lines = ["ffconcat version 1.0"]
    for i, fr in enumerate(frames):
        t = fr["t"] / 1000.0
        nxt = frames[i + 1]["t"] / 1000.0 if i + 1 < len(frames) else total
        dur = max(0.02, nxt - t)
        name = f"frame-{fr['n']:05d}.jpg"
        lines.append(f"file '{name}'")
        lines.append(f"duration {dur:.4f}")
    lines.append(f"file 'frame-{frames[-1]['n']:05d}.jpg'")
    concat = FRAMES / "frames.ffconcat"
    concat.write_text("\n".join(lines), encoding="ascii")
    visual = WORK / "visual.mp4"
    run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
         "-vf", "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p",
         "-t", f"{VIDEO_BASE_S:.2f}",
         "-c:v", "libx264", "-crf", "18", "-preset", "medium", str(visual)])
    actual = probe_duration(visual)
    if abs(actual - VIDEO_BASE_S) > 1.5:
        raise SystemExit(f"visual track is {actual:.1f}s, expected ~{VIDEO_BASE_S}s "
                         "- frame timestamps look wrong, re-record")
    return visual


def build_audio_track(durations: list[float], total_s: float) -> Path:
    inputs, filters, tags = [], [], []
    for i, (start, _, _) in enumerate(SEGMENTS):
        inputs += ["-i", str(WORK / f"seg-{i}.mp3")]
        delay_ms = int(start * 1000)
        filters.append(f"[{i}]adelay={delay_ms}:all=1[a{i}]")
        tags.append(f"[a{i}]")
    filters.append(f"{''.join(tags)}amix=inputs={len(SEGMENTS)}:normalize=0,"
                   f"apad=whole_dur={total_s:.2f},loudnorm=I=-17:TP=-1.5[out]")
    audio = WORK / "audio.m4a"
    run([FFMPEG, "-y", *inputs, "-filter_complex", ";".join(filters),
         "-map", "[out]", "-c:a", "aac", "-b:a", "160k", str(audio)])
    return audio


def fmt_ts(s: float) -> str:
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(sec):02d},{int(round((sec % 1) * 1000)):03d}"


def write_srt(durations: list[float]):
    cues = []
    for (start, _, text), dur in zip(SEGMENTS, durations):
        sentences = [s.strip() for s in re.split(r"(?<=[.!?;]) +", text) if s.strip()]
        weights = [len(s) for s in sentences]
        total_w = sum(weights)
        t = start
        for s, w in zip(sentences, weights):
            d = dur * w / total_w
            cues.append((t, min(t + d, start + dur), s))
            t += d
    lines = []
    for i, (a, b, s) in enumerate(cues, 1):
        lines += [str(i), f"{fmt_ts(a)} --> {fmt_ts(b)}", s, ""]
    OUT_SRT.write_text("\n".join(lines), encoding="utf-8-sig")


def main():
    if not FFMPEG or not FFPROBE:
        raise SystemExit("ffmpeg/ffprobe not found")
    WORK.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    durations = asyncio.run(synth())
    for (start, _, text), d in zip(SEGMENTS, durations):
        print(f"  seg @{start:6.1f}s  {d:5.2f}s  {text[:48]}...")
    audio_end = SEGMENTS[-1][0] + durations[-1] + 0.6
    total = max(VIDEO_BASE_S, audio_end)
    if total > HARD_LIMIT_S:
        raise SystemExit(f"assembled duration {total:.1f}s exceeds the hard limit")

    visual = build_visual_track()
    audio = build_audio_track(durations, total)

    run([FFMPEG, "-y", "-i", str(visual), "-i", str(audio),
         "-vf", f"tpad=stop_mode=clone:stop_duration={max(0.0, total - VIDEO_BASE_S):.2f}",
         "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-c:a", "copy", "-movflags", "+faststart", str(OUT_MP4)])
    write_srt(durations)

    final = probe_duration(OUT_MP4)
    print(f"\nfinal video: {OUT_MP4}")
    print(f"duration: {final:.2f}s ({int(final // 60)}:{final % 60:05.2f})  "
          f"limit 2:00 -> {'OK' if final < 120 else 'OVER'}")
    print(f"captions: {OUT_SRT}")


if __name__ == "__main__":
    main()
