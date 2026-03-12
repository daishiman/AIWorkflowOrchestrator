import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(__dirname, "..", "validate-workspace-parent-reference-sweep.mjs");
const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "workspace-parent-sweep-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(root, relativePath, content) {
  const fullPath = join(root, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf8");
}

function createPassingFixture(root) {
  writeFile(
    root,
    "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md",
    [
      "# pointer",
      "../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md",
      "../../../completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md",
      "../../../completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md",
    ].join("\n"),
  );

  writeFile(
    root,
    "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md",
    [
      "../completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md",
      "../completed-task/task-059a-ui-04b-workspace-chat-panel.md",
      "../completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md",
    ].join("\n"),
  );

  writeFile(
    root,
    "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058b-ui-04a-workspace-layout-filebrowser.md",
    [
      "| ステータス | completed |",
      "../../../completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md",
    ].join("\n"),
  );
  writeFile(
    root,
    "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059a-ui-04b-workspace-chat-panel.md",
    [
      "| ステータス | completed |",
      "../../../completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md",
    ].join("\n"),
  );
  writeFile(
    root,
    "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-059b-ui-04c-workspace-preview-quicksearch.md",
    [
      "| ステータス | completed |",
      "../../../completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md",
    ].join("\n"),
  );

  writeFile(
    root,
    "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-090-tasks-index-legacy.md",
    [
      "| TASK-UI-04A-WORKSPACE-LAYOUT      | [ワークスペースレイアウト・FileBrowser](./task-058b-ui-04a-workspace-layout-filebrowser.md) | UI-00, UI-01, UI-02        | large  | completed  |",
      "| TASK-UI-04B-WORKSPACE-CHAT        | [ワークスペースChatPanel](./task-059a-ui-04b-workspace-chat-panel.md)                       | UI-00, UI-01, UI-04A       | medium | completed  |",
      "| TASK-UI-04C-WORKSPACE-PREVIEW     | [ワークスペースPreview・QuickSearch](./task-059b-ui-04c-workspace-preview-quicksearch.md)   | UI-00, UI-01, UI-04A       | medium | completed  |",
    ].join("\n"),
  );

  writeFile(
    root,
    ".claude/skills/aiworkflow-requirements/references/task-workflow.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/",
  );
  writeFile(
    root,
    ".claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/",
  );
  writeFile(
    root,
    ".claude/skills/aiworkflow-requirements/references/interfaces-llm.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-11/screenshots/",
  );
  writeFile(
    root,
    ".claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-6/integration-test.md",
  );
  writeFile(
    root,
    ".agents/skills/aiworkflow-requirements/references/task-workflow.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/",
  );
  writeFile(
    root,
    ".agents/skills/aiworkflow-requirements/references/ui-ux-feature-components.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/",
  );
  writeFile(
    root,
    ".agents/skills/aiworkflow-requirements/references/interfaces-llm.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-11/screenshots/",
  );
  writeFile(
    root,
    ".agents/skills/aiworkflow-requirements/references/interfaces-chat-history.md",
    "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-6/integration-test.md",
  );

  writeFile(
    root,
    "apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs",
    'const workflow = "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser";',
  );

  writeFile(root, "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/index.md", "# 04A");
  writeFile(root, "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md", "# 04B");
  writeFile(root, "docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/index.md", "# 04C");
}

function runValidator(root) {
  return spawnSync("node", [scriptPath, "--json", "--root", root], {
    encoding: "utf8",
  });
}

describe("validate-workspace-parent-reference-sweep", () => {
  it("passes on a normalized fixture", () => {
    const root = makeTempDir();
    createPassingFixture(root);

    const result = runValidator(root);
    const payload = JSON.parse(result.stdout);

    expect(result.status).toBe(0);
    expect(payload.ok).toBe(true);
    expect(payload.summary["path-drift"]).toBe(0);
    expect(payload.summary["status-drift"]).toBe(0);
    expect(payload.summary["mirror-drift"]).toBe(0);
  });

  it("detects stale parent pointer paths", () => {
    const root = makeTempDir();
    createPassingFixture(root);
    writeFile(
      root,
      "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md",
      "./task-058b-ui-04a-workspace-layout-filebrowser.md",
    );

    const result = runValidator(root);
    const payload = JSON.parse(result.stdout);

    expect(result.status).toBe(1);
    expect(payload.ok).toBe(false);
    expect(payload.summary["path-drift"]).toBeGreaterThan(0);
  });

  it("detects pending legacy status", () => {
    const root = makeTempDir();
    createPassingFixture(root);
    writeFile(
      root,
      "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-090-tasks-index-legacy.md",
      "| TASK-UI-04A-WORKSPACE-LAYOUT      | [ワークスペースレイアウト・FileBrowser](./task-058b-ui-04a-workspace-layout-filebrowser.md) | UI-00, UI-01, UI-02        | large  | pending    |",
    );

    const result = runValidator(root);
    const payload = JSON.parse(result.stdout);

    expect(result.status).toBe(1);
    expect(payload.ok).toBe(false);
    expect(payload.summary["status-drift"]).toBeGreaterThan(0);
  });

  it("detects mirror drift", () => {
    const root = makeTempDir();
    createPassingFixture(root);
    writeFile(
      root,
      ".agents/skills/aiworkflow-requirements/references/task-workflow.md",
      "DIFFERENT",
    );

    const result = runValidator(root);
    const payload = JSON.parse(result.stdout);

    expect(result.status).toBe(1);
    expect(payload.ok).toBe(false);
    expect(payload.summary["mirror-drift"]).toBeGreaterThan(0);
  });
});

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    rmSync(dir, { recursive: true, force: true });
  }
});
