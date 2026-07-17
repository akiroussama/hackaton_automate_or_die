import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const pdfBuilder = path.join(scriptDirectory, "build_phase1_pdf.py");
const bundledCodexPython = path.join(
  homedir(),
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "python",
  process.platform === "win32" ? "python.exe" : "bin/python",
);

const candidates = [
  process.env.CODEX_PYTHON,
  "python",
  "python3",
  bundledCodexPython,
].filter(Boolean);

for (const executable of [...new Set(candidates)]) {
  const probe = spawnSync(executable, ["-c", "import reportlab"], {
    stdio: "ignore",
    windowsHide: true,
  });

  if (probe.status !== 0) {
    continue;
  }

  const build = spawnSync(executable, [pdfBuilder], {
    cwd: path.dirname(scriptDirectory),
    stdio: "inherit",
    windowsHide: true,
  });
  process.exit(build.status ?? 1);
}

console.error(
  [
    "Impossible de trouver un interpréteur Python avec ReportLab.",
    "Installez la dépendance avec :",
    "  python -m pip install -r requirements-pdf.txt",
    "Vous pouvez aussi définir CODEX_PYTHON vers un Python compatible.",
  ].join("\n"),
);
process.exit(1);
