import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function toLocalPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const requested = decoded === "/" ? "app/index.html" : decoded.replace(/^\/+/, "");
  const candidate = resolve(projectRoot, normalize(requested));
  const traversal = relative(projectRoot, candidate);

  if (traversal.startsWith(`..${sep}`) || traversal === ".." || isAbsolute(traversal)) {
    return null;
  }

  return candidate;
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`);
    let filePath = toLocalPath(requestUrl.pathname);

    if (!filePath) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
    });
    response.end(body);
  } catch (error) {
    const statusCode = error?.code === "ENOENT" ? 404 : 500;
    response.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
    response.end(statusCode === 404 ? "Not found" : "Internal server error");
  }
});

server.listen(port, host, () => {
  console.log(`CableTwin is running at http://${host}:${port}`);
});
