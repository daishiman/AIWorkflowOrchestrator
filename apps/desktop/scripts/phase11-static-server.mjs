import fs from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import path from "node:path";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

function resolveContentType(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream";
}

function resolveRendererPath(rootDir, requestPathname) {
  const rawPath =
    requestPathname === "/" ? "/index.html" : decodeURIComponent(requestPathname);
  const normalizedPath = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const resolvedPath = path.resolve(rootDir, `.${normalizedPath}`);

  if (!resolvedPath.startsWith(path.resolve(rootDir))) {
    throw new Error(`Path traversal is not allowed: ${requestPathname}`);
  }

  return resolvedPath;
}

async function readStaticFile(rootDir, requestPathname) {
  const resolvedPath = resolveRendererPath(rootDir, requestPathname);
  const stat = await fs.stat(resolvedPath);
  const filePath = stat.isDirectory()
    ? path.join(resolvedPath, "index.html")
    : resolvedPath;

  return {
    body: await fs.readFile(filePath),
    filePath,
  };
}

export function canAutoStartLocalStaticServer(baseUrl) {
  const url = new URL(baseUrl);

  return (
    (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
    (url.protocol === "http:" || url.protocol === "https:")
  );
}

export async function probeStaticServer(targetUrl) {
  const transport = targetUrl.startsWith("https:") ? https : http;

  return await new Promise((resolve) => {
    const request = transport.request(targetUrl, { method: "HEAD" }, (response) => {
      resolve(Boolean(response.statusCode && response.statusCode >= 200 && response.statusCode < 400));
      response.resume();
    });

    request.on("error", () => resolve(false));
    request.end();
  });
}

export async function startRendererStaticServer({ baseUrl, rootDir }) {
  const url = new URL(baseUrl);

  if (!canAutoStartLocalStaticServer(baseUrl)) {
    throw new Error(`Auto static serve is only supported on localhost: ${baseUrl}`);
  }

  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.writeHead(400);
      res.end("Bad Request");
      return;
    }

    try {
      const requestUrl = new URL(req.url, baseUrl);
      const { body, filePath } = await readStaticFile(rootDir, requestUrl.pathname);

      res.writeHead(200, {
        "Content-Type": resolveContentType(filePath),
      });
      if (req.method !== "HEAD") {
        res.end(body);
        return;
      }
      res.end();
    } catch (error) {
      const statusCode =
        error instanceof Error &&
        (error.message.includes("ENOENT") || error.message.includes("ENOTDIR"))
          ? 404
          : 500;
      res.writeHead(statusCode, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      if (req.method !== "HEAD") {
        res.end(statusCode === 404 ? "Not Found" : "Internal Server Error");
        return;
      }
      res.end();
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(Number(url.port || 80), url.hostname, () => {
      server.off("error", reject);
      resolve();
    });
  });

  return {
    close: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    },
  };
}
