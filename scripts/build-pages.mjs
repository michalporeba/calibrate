import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = resolve(repoRoot, "dist");

function writeTheme404(theme) {
  writeFileSync(
    resolve(distDir, theme, "404.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Calibrate</title>
    <script>
      (function redirectGitHubPagesRoute(location) {
        var pathSegmentsToKeep = 2;
        var pathname = location.pathname
          .split("/")
          .slice(0, 1 + pathSegmentsToKeep)
          .join("/");
        var route = location.pathname
          .slice(pathname.length)
          .replace(/&/g, "~and~");
        var search = location.search ? location.search.replace(/&/g, "~and~") : "";
        var nextUrl = pathname + "/?/" + route + search + location.hash;

        location.replace(nextUrl);
      })(window.location);
    </script>
  </head>
  <body></body>
</html>
`,
  );
}

rmSync(distDir, { force: true, recursive: true });
mkdirSync(distDir, { recursive: true });

const viteBin = resolve(repoRoot, "node_modules", ".bin", "vite");

execFileSync(viteBin, ["build", "--mode", "pages-me", "--outDir", "dist/me"], {
  cwd: repoRoot,
  stdio: "inherit",
});
writeTheme404("me");

execFileSync(viteBin, ["build", "--mode", "pages-gds", "--outDir", "dist/gds"], {
  cwd: repoRoot,
  stdio: "inherit",
});
writeTheme404("gds");

writeFileSync(
  resolve(distDir, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calibrate Themes</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        background: #f6f3ec;
        color: #171d19;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.82), transparent 38%),
          linear-gradient(180deg, #f9f7f2 0%, #f6f3ec 100%);
      }
      main {
        width: min(100%, 44rem);
      }
      h1 {
        margin: 0;
        font-family: "Iowan Old Style", Georgia, serif;
        font-size: clamp(2.8rem, 7vw, 5rem);
        font-weight: 500;
        letter-spacing: -0.04em;
        line-height: 0.95;
      }
      p {
        line-height: 1.7;
        font-size: 1.1rem;
      }
      ul {
        list-style: none;
        margin: 2rem 0 0;
        padding: 0;
        display: grid;
        gap: 1rem;
      }
      a {
        display: block;
        padding: 1rem 1.15rem;
        border: 1px solid rgba(47, 50, 44, 0.08);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.82);
        color: inherit;
        text-decoration: none;
      }
      strong {
        display: block;
        margin-bottom: 0.25rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>calibrate</h1>
      <p>Choose a hosted theme variant for the demo.</p>
      <ul>
        <li>
          <a href="./me/">
            <strong>Personal</strong>
            Minimal, calm, and lightly styled.
          </a>
        </li>
        <li>
          <a href="./gds/">
            <strong>GDS-aligned</strong>
            Adapted to feel closer to a public-sector service pattern.
          </a>
        </li>
      </ul>
    </main>
  </body>
</html>
`,
);

writeFileSync(
  resolve(distDir, "404.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Calibrate</title>
    <script>
      (function redirectGitHubPagesRoute(location) {
        var segments = location.pathname.split("/");
        var keep = segments[2] === "me" || segments[2] === "gds" ? 2 : 1;
        var pathname = segments.slice(0, 1 + keep).join("/");
        var route = location.pathname.slice(pathname.length).replace(/&/g, "~and~");
        var search = location.search ? location.search.replace(/&/g, "~and~") : "";
        var nextUrl = pathname + "/?/" + route + search + location.hash;

        location.replace(nextUrl);
      })(window.location);
    </script>
  </head>
  <body></body>
</html>
`,
);
