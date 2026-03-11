import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const RENDERER_ROOT = resolve(__dirname, "..");
const TOKENS_PATH = resolve(__dirname, "tokens.css");
const TOKENS_CSS = readFileSync(TOKENS_PATH, "utf8");

const REQUIRED_TOKENS = [
  "--text-tertiary",
  "--border-primary",
  "--accent-primary",
  "--bg-hover",
  "--border-color",
  "--status-success-subtle",
  "--status-warning-subtle",
  "--status-info-subtle",
  "--syntax-operator",
  "--syntax-punctuation",
] as const;

const THEMES = ["light", "dark", "kanagawa-dragon"] as const;

function collectRendererFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectRendererFiles(fullPath));
      continue;
    }

    if (!/\.(ts|tsx|css)$/.test(fullPath)) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function parseDefinedTokens(css: string): Set<string> {
  const definitions = new Set<string>();
  const matches = css.matchAll(/(--[a-z0-9-]+)\s*:/gi);

  for (const match of matches) {
    const token = match[1];
    if (token) {
      definitions.add(token);
    }
  }

  return definitions;
}

function getThemeBlock(theme: (typeof THEMES)[number]): string {
  const escapedTheme = theme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `\\[data-theme="${escapedTheme}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`,
    "m",
  );
  const match = TOKENS_CSS.match(regex);
  return match?.[1] ?? "";
}

function unresolvedVarReferences(): Array<{
  token: string;
  file: string;
  snippet: string;
}> {
  const definedTokens = parseDefinedTokens(TOKENS_CSS);
  const results: Array<{ token: string; file: string; snippet: string }> = [];

  const files = collectRendererFiles(RENDERER_ROOT).filter(
    (file) => !file.endsWith("tokens.light-theme.contract.test.ts"),
  );

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const varMatches = content.matchAll(
      /var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi,
    );

    for (const match of varMatches) {
      const token = match[1];
      const fallback = match[2]?.trim();

      if (!token || definedTokens.has(token) || fallback) {
        continue;
      }

      results.push({
        token,
        file,
        snippet: match[0],
      });
    }
  }

  return results;
}

describe("tokens.css light theme contract", () => {
  it("light theme の背景階層を純白依存から外す", () => {
    const lightBlock = getThemeBlock("light");

    expect(lightBlock).toContain("--bg-primary: #f7f7f5;");
    expect(lightBlock).toContain("--bg-elevated: #fcfcfa;");
    expect(lightBlock).not.toContain("--bg-primary: #ffffff;");
    expect(lightBlock).not.toContain("--bg-elevated: #ffffff;");
  });

  it("必須 token が 3テーマすべてで解決できる", () => {
    for (const theme of THEMES) {
      const block = getThemeBlock(theme);

      for (const token of REQUIRED_TOKENS) {
        expect(block).toContain(`${token}:`);
      }
    }
  });

  it("renderer で fallback なし未定義 token 参照が存在しない", () => {
    const unresolved = unresolvedVarReferences();
    expect(unresolved).toEqual([]);
  });

  it("代表レンダリングで light の text と background が同色化しない", () => {
    const style = document.createElement("style");
    style.textContent = TOKENS_CSS;
    document.head.appendChild(style);

    try {
      document.documentElement.setAttribute("data-theme", "light");

      const panel = document.createElement("div");
      panel.style.backgroundColor = "var(--bg-primary)";
      panel.style.color = "var(--text-primary)";
      document.body.appendChild(panel);

      const helper = document.createElement("div");
      helper.style.backgroundColor = "var(--bg-secondary)";
      helper.style.color = "var(--text-tertiary)";
      document.body.appendChild(helper);

      const panelStyle = getComputedStyle(panel);
      const helperStyle = getComputedStyle(helper);

      expect(panelStyle.backgroundColor).not.toBe(panelStyle.color);
      expect(helperStyle.backgroundColor).not.toBe(helperStyle.color);

      panel.remove();
      helper.remove();
    } finally {
      style.remove();
      document.documentElement.removeAttribute("data-theme");
    }
  });
});
