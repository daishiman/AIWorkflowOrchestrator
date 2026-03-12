// @vitest-environment node

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const TARGET_FILES = [
  {
    name: "ThemeSelector",
    path: fileURLToPath(
      new URL(
        "../components/molecules/ThemeSelector/index.tsx",
        import.meta.url,
      ),
    ),
  },
  {
    name: "AuthModeSelector",
    path: fileURLToPath(
      new URL(
        "../components/settings/AuthModeSelector/index.tsx",
        import.meta.url,
      ),
    ),
  },
  {
    name: "AuthKeySection",
    path: fileURLToPath(
      new URL(
        "../components/settings/AuthKeySection/index.tsx",
        import.meta.url,
      ),
    ),
  },
  {
    name: "AccountSection",
    path: fileURLToPath(
      new URL(
        "../components/organisms/AccountSection/index.tsx",
        import.meta.url,
      ),
    ),
  },
  {
    name: "ApiKeysSection",
    path: fileURLToPath(
      new URL(
        "../components/organisms/ApiKeysSection/index.tsx",
        import.meta.url,
      ),
    ),
  },
  {
    name: "AuthView",
    path: fileURLToPath(
      new URL("../views/AuthView/index.tsx", import.meta.url),
    ),
  },
  {
    name: "WorkspaceSearchPanel",
    path: fileURLToPath(
      new URL(
        "../components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx",
        import.meta.url,
      ),
    ),
  },
  {
    name: "SettingsView",
    path: fileURLToPath(
      new URL("../views/SettingsView/index.tsx", import.meta.url),
    ),
  },
];

const FORBIDDEN_PATTERNS = [
  /text-white(?:\/\d+)?/g,
  /bg-white(?:\/\d+)?/g,
  /border-white(?:\/\d+)?/g,
  /text-slate-\d+(?:\/\d+)?/g,
  /bg-slate-\d+(?:\/\d+)?/g,
  /border-slate-\d+(?:\/\d+)?/g,
  /text-zinc-\d+(?:\/\d+)?/g,
  /bg-zinc-\d+(?:\/\d+)?/g,
  /border-zinc-\d+(?:\/\d+)?/g,
  /text-gray-\d+(?:\/\d+)?/g,
  /bg-gray-\d+(?:\/\d+)?/g,
  /border-gray-\d+(?:\/\d+)?/g,
  /(?:text|bg|border)-(?:red|green|blue|yellow|amber|orange)-\d+(?:\/\d+)?/g,
  /#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/g,
];

describe("light theme shared color migration guard", () => {
  it.each(TARGET_FILES)(
    "$name から hardcoded color class と hex を除去する",
    ({ path }) => {
      const source = readFileSync(path, "utf-8");

      for (const pattern of FORBIDDEN_PATTERNS) {
        const matches = source.match(pattern);
        expect(matches, `${path} matched ${pattern.source}`).toBeNull();
      }
    },
  );
});
