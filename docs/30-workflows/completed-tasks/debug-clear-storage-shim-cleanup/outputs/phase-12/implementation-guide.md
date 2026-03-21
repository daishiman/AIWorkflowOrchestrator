# 実装ガイド: debug-clear-storage 残骸クリーンアップ

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

前の家に引っ越したのに、郵便物の転送設定や住所録だけが古いまま残っていると、配達する人も受け取る人も混乱します。  
このタスクでも同じで、`debug-clear-storage` という一時的な仕組みの本体はもう消えているのに、関連する予防コードや説明が repo のあちこちに残っていました。残っていると「まだデータを全部消す仕組みが動いている」と誤解されます。

### たとえば

たとえば、クラス替えのあとに前の座席表だけが残っている状態です。今の席に座っているのに、古い座席表を見て案内されたら間違えます。  
`debug-clear-storage` の残骸は、この古い座席表と同じです。

### 何をするか

- repo 全体に残っていた `debug-clear-storage` の残骸を棚卸しする
- 不要なものは削除する
- 残す説明は historical note に降格する
- 変更の結果を Phase 11 / Phase 12 の成果物に記録する

## Part 2: 開発者向け実装詳細

### 型定義

```ts
type CleanupDecision = "remove" | "downgrade" | "keep";

interface CleanupTarget {
  path: string;
  decision: CleanupDecision;
  reason: string;
}

interface Phase12ArtifactSet {
  implementationGuide: string;
  systemSpecUpdateSummary: string;
  documentationChangelog: string;
  unassignedTaskDetection: string;
  skillFeedbackReport: string;
  complianceCheck: string;
}
```

### API/CLI シグネチャ

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/debug-clear-storage-shim-cleanup
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/debug-clear-storage-shim-cleanup --json
```

### 使用例

```ts
const targets: CleanupTarget[] = [
  {
    path: "apps/desktop/e2e/global-setup.ts",
    decision: "remove",
    reason: "debug 前提を削除",
  },
  {
    path: "apps/desktop/docs/development/clear-storage.md",
    decision: "downgrade",
    reason: "historical note 化",
  },
];
```

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/debug-clear-storage-shim-cleanup
```

### エラーハンドリング

- `debug-clear-storage` の残存が見つかった場合は、削除か historical note 降格のどちらかに即時分類する
- `artifacts.json` と `outputs/artifacts.json` がずれていた場合は、root と outputs を同値化する
- Phase 11 の補助成果物が不足していた場合は、`manual-test-checklist.md` と `manual-test-result.md` を優先して補完する

### エッジケース

- CLI で画面証跡を再取得しない場合でも、コードレビューと静的検証で代替できる
- `skipAuth` / `VITE_E2E_MODE` は残骸クリーンアップとは独立して扱う
- `debug-clear-storage` が docs の historical note にだけ残る場合は、runtime 残存と区別する

### 設定項目と定数一覧

| 項目                  | 値 / 役割                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `workflowDir`         | `docs/30-workflows/debug-clear-storage-shim-cleanup`                                                                                      |
| `phase11Artifacts`    | `manual-test-checklist.md` / `manual-test-result.md` / `manual-test-report.md`                                                            |
| `phase12Artifacts`    | `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `phase12-task-spec-compliance-check.md` |
| `phase13Status`       | `blocked`                                                                                                                                 |
| `debug-clear-storage` | 廃止済みの残骸キーワード                                                                                                                  |

### 変更ファイル一覧と理由

| ファイル                                         | 理由                                       |
| ------------------------------------------------ | ------------------------------------------ |
| `apps/desktop/e2e/global-setup.ts`               | debug 前提の preflight を除去するため      |
| `apps/desktop/docs/development/clear-storage.md` | historical note に降格するため             |
| `phase-11-manual-test.md`                        | 正式成果物名を揃えるため                   |
| `phase-12-documentation.md`                      | Task 6 と canonical outputs を追加するため |
| `artifacts.json` / `index.md`                    | completed / blocked の状態を揃えるため     |

### Before / After

- `global-setup.ts`: debug 用 sessionStorage フラグを設定しない
- `clear-storage.md`: 旧 workaround を歴史的記録として残す
- `phase11/phase12`: 旧 report 名から正式名へ揃える

### 認証バイパスとの関係

- `VITE_E2E_MODE` / `skipAuth` / `dev-skip-auth` は維持する
- `debug-clear-storage` は認証バイパスではなく、廃止済みのデバッグ用トリガーとして扱う

### Zustand persist への影響

- `debug-clear-storage` は sessionStorage 由来の残骸なので、localStorage の persist データとは切り分ける
- `localStorage.clear()` の禁止は別経路で担保し、今回の cleanup はその防御を壊さない
