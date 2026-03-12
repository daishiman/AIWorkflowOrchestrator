import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = existsSync(path.resolve(process.cwd(), "apps/desktop"))
  ? process.cwd()
  : path.resolve(process.cwd(), "../..");

const targetFiles = [
  "apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx",
  "apps/desktop/src/renderer/views/AuthView/index.tsx",
  "apps/desktop/src/renderer/components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx",
  "apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx",
  "apps/desktop/src/renderer/views/SettingsView/ProfileSection/LocaleSelector.tsx",
  "apps/desktop/src/renderer/views/SettingsView/ProfileSection/TimezoneSelector.tsx",
  "apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx",
];

const disallowedPatterns = [
  { name: "text-white", regex: /\btext-white(?:\/\d+)?\b/ },
  { name: "bg-white/5", regex: /\bbg-white\/5\b/ },
  { name: "bg-white/10", regex: /\bbg-white\/10\b/ },
  { name: "bg-white/20", regex: /\bbg-white\/20\b/ },
  { name: "border-white/10", regex: /\bborder-white\/10\b/ },
  { name: "border-white/20", regex: /\bborder-white\/20\b/ },
  { name: "bg-slate-*", regex: /\bbg-slate-[\w/-]+/ },
  { name: "text-slate-*", regex: /\btext-slate-[\w/-]+/ },
  { name: "border-slate-*", regex: /\bborder-slate-[\w/-]+/ },
  { name: "bg-zinc-*", regex: /\bbg-zinc-[\w/-]+/ },
  { name: "text-zinc-*", regex: /\btext-zinc-[\w/-]+/ },
  { name: "border-zinc-*", regex: /\bborder-zinc-[\w/-]+/ },
];

describe("light theme shared color migration contract", () => {
  for (const relativePath of targetFiles) {
    it(`${relativePath} に disallowed pattern を残さない`, () => {
      const source = readFileSync(path.join(repoRoot, relativePath), "utf-8");

      for (const pattern of disallowedPatterns) {
        expect(source, `${relativePath} contains ${pattern.name}`).not.toMatch(
          pattern.regex,
        );
      }
    });
  }
});
