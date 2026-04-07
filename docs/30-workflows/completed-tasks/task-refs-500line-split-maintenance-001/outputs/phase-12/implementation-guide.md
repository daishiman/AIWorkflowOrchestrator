# Phase 12: 実装ガイド

## ステータス: completed

### Part 1: 中学生レベルの説明

図書館で分厚い本を1冊だけ置くと、読みたい章を見つけるのに時間がかかる。
今回の作業は、その分厚い本を「目次」と「章ごとの薄い本」に分けるイメージ。
たとえば、必要な内容だけを先に読めるようにしておくと、AI も人も迷わず必要な場所へたどり着ける。

つまり、「全部を一度に読む」状態から「必要なものだけを段階的に読む」状態へ変えた。

### Part 2: 技術的詳細

#### current contract

- 本 workflow は docs-only task で、コード変更は行わない
- Phase 11 は NON_VISUAL のため、スクリーンショット証跡は持たない
- Phase 12 の close-out は canonical 6 ファイルへ分割して記録する

#### target delta

- 1 つのレポートに詰め込まれていた close-out を 6 ファイルに分離する
- `task-specification-creator/scripts/generate-index.js` の実行例を `--workflow` 必須へ揃える
- `outputs/artifacts.json` と実ファイル名の drift をなくす

#### TypeScript 型

```ts
type Phase12OutputName =
  | "implementation-guide.md"
  | "system-spec-update-summary.md"
  | "documentation-changelog.md"
  | "unassigned-task-detection.md"
  | "skill-feedback-report.md"
  | "phase12-task-spec-compliance-check.md";

interface Phase12ValidationOptions {
  workflowDir: string;
  maxLinesPerFile: number;
  requireScreenshots: false;
}

interface Phase12ValidationResult {
  pass: boolean;
  missingFiles: Phase12OutputName[];
  notes: string[];
}

function validatePhase12Closeout(
  options: Phase12ValidationOptions,
): Phase12ValidationResult;
```

#### API signature / usage example

```ts
const result = validatePhase12Closeout({
  workflowDir: "docs/30-workflows/task-refs-500line-split-maintenance-001",
  maxLinesPerFile: 499,
  requireScreenshots: false,
});
```

#### Error handling

- `outputs/phase-11/manual-test-checklist.md` が無い場合は fail
- `task-specification-creator/scripts/generate-index.js --workflow ... --regenerate` が non-zero の場合は fail
- `outputs/phase-12/*.md` に planned wording が残る場合は fail

#### Configurable parameters

- `MAX_LINES_PER_FILE = 499`
- `WORKFLOW_DIR = docs/30-workflows/task-refs-500line-split-maintenance-001`
- `PHASE11_VISUAL_REQUIRED = false`

#### 分離ルール

- 499 行以内に収める
- H2 / H3 の区切りを基準に分割する
- 親ファイルは index と概要に縮小する
- `.claude/skills/` と `.agents/skills/` の mirror を同一内容に保つ

#### 実施対象

- `aiworkflow-requirements` 系: 19 件
- `task-specification-creator` 系: 5 件
- 合計: 24 件

#### 実施結果

- 新規ファイル作成: 23 件
- 500 行超の残存: 0 件
- code change: 0 件
- `generate-index.js` 再生成: PASS

#### エッジケース

- 1 つのセクションが 499 行を超える場合は、さらに H3 単位へ分割する
- docs-only task のため、Phase 11 のスクリーンショット更新は不要
- `task-specification-creator` の index 再生成コマンドは `--workflow` を付ける
