/* eslint-disable @typescript-eslint/no-require-imports -- Hostland starts this file as CommonJS server.js. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "public");
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4"
};
http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filename = path.resolve(root, "." + pathname);
    if (filename !== root && !filename.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    let status = 200;
    let stat;
    try {
      stat = await fs.promises.stat(filename);
      if (stat.isDirectory()) {
        filename = path.join(filename, "index.html");
        stat = await fs.promises.stat(filename);
      }
      if (!stat.isFile()) throw new Error("Not a file");
    } catch {
      status = 404;
      filename = path.join(root, "404.html");
      stat = await fs.promises.stat(filename);
    }
    res.writeHead(status, {
      "Content-Type": types[path.extname(filename)] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": pathname.startsWith("/_next/static/") ? "public, max-age=31536000, immutable" : "no-cache"
    });
    if (req.method === "HEAD") { res.end(); return; }
    fs.createReadStream(filename).on("error", () => res.destroy()).pipe(res);
  } catch {
    res.writeHead(400).end();
  }
}).listen(Number(process.env.PORT || 3000), "0.0.0.0");
