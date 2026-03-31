# テスト仕様書

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |

## テスト一覧

### 層1: Semantic 確認テスト（Playwright `_electron`）

| テストID | テストファイル                                          | 検証内容                                | 期待値                                         | 優先度 |
| -------- | ------------------------------------------------------- | --------------------------------------- | ---------------------------------------------- | ------ |
| SEM-001  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | `role="checkbox"` が全 option に付与    | `count > 0`                                    | MUST   |
| SEM-002  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | `aria-label` が非空文字                 | 全要素でラベル確認、空文字なし                 | MUST   |
| SEM-003  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | `tabindex` の適切な設定                 | `tabIndex` が 0 または -1                      | MUST   |
| SEM-004  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | Tab キーでフォーカス移動                | `activeElement` が BUTTON/INPUT/DIV            | MUST   |
| SEM-005  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | アクセシビリティツリー構造取得          | `snapshot !== null` かつ `children.length > 0` | MUST   |
| SEM-006  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | 選択後 `aria-checked="true"` 付与       | 選択した要素に `aria-checked="true"`           | MUST   |
| SEM-007  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | kind 切り替え後 `aria-checked` リセット | `aria-checked="true"` の count が 0            | MUST   |

### 層2: Visual 確認テスト（`toHaveScreenshot()`）

| テストID | テストファイル                                                                       | スナップショット名               | 許容差              | 優先度 |
| -------- | ------------------------------------------------------------------------------------ | -------------------------------- | ------------------- | ------ |
| VIS-001  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | `M11-1-multi-select-display.png` | `maxDiffPixels: 50` | MUST   |
| VIS-002  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | `M11-2-checkbox-selected.png`    | `maxDiffPixels: 50` | MUST   |
| VIS-003  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | `M11-3-kind-switched.png`        | `maxDiffPixels: 50` | MUST   |
| VIS-004  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | `M11-4-kind-single_select.png`   | `maxDiffPixels: 50` | MUST   |
| VIS-005  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | `M11-4-kind-free_text.png`       | `maxDiffPixels: 50` | MUST   |
| VIS-006  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | `M11-4-kind-secret.png`          | `maxDiffPixels: 50` | MUST   |
| VIS-007  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | `M11-4-kind-confirm.png`         | `maxDiffPixels: 50` | MUST   |

### 層3: AI UX評価スクリプト単体テスト（Vitest モック）

#### `evaluateUIWithClaude()` のテスト

| テストID | テストファイル                                                                       | 検証内容                             | 期待値                                  | 優先度 |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------------ | --------------------------------------- | ------ |
| API-001  | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | 正常 JSON レスポンスのパース         | `UXEvaluationResult` オブジェクトが返る | MUST   |
| API-002  | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | コードブロック付き JSON のパース     | コードブロック除去後に正常パース        | MUST   |
| API-003  | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | API エラー時の例外処理               | エラーがそのまま伝播                    | MUST   |
| API-004  | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | 不正レスポンス型の処理               | `Error('Unexpected response type')`     | MUST   |
| API-005  | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | スクリーンショット base64 エンコード | base64 文字列が返る                     | MUST   |

#### `saveEvaluationReport()` のテスト

| テストID | テストファイル                                                                       | 検証内容                           | 期待値                                             | 優先度 |
| -------- | ------------------------------------------------------------------------------------ | ---------------------------------- | -------------------------------------------------- | ------ |
| SAVE-001 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | Markdown ファイルが生成される      | `fs.writeFileSync` が呼ばれる                      | MUST   |
| SAVE-002 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | 出力ディレクトリが自動作成される   | `fs.mkdirSync` が `{ recursive: true }` で呼ばれる | MUST   |
| SAVE-003 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | usabilityIssues テーブルが含まれる | `## ユーザビリティ問題` を含む                     | MUST   |
| SAVE-004 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | タスク ID がレポートに含まれる     | 引数の `taskId` が Markdown 内に含まれる           | MUST   |

#### `generateUnassignedTasks()` のテスト

| テストID | テストファイル                                                                       | 検証内容                            | 期待値                             | 優先度 |
| -------- | ------------------------------------------------------------------------------------ | ----------------------------------- | ---------------------------------- | ------ |
| TASK-001 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | HIGH 問題 2 件からファイル 2 件生成 | `files.length === 2`               | MUST   |
| TASK-002 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | MEDIUM/LOW 問題はファイル生成なし   | `files.length === 0`               | MUST   |
| TASK-003 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | ファイル命名が規則に従う            | `ui-ux-issue-YYYYMMDD-001.md` 形式 | MUST   |
| TASK-004 | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts` | 問題 0 件の場合は空配列を返す       | `generatedFiles = []`              | MUST   |

### payload 検証テスト

| テストID | テストファイル                                          | 検証内容                     | 期待値                                              | 優先度 |
| -------- | ------------------------------------------------------- | ---------------------------- | --------------------------------------------------- | ------ |
| PAY-001  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` | `selectedOptionIds` が配列型 | `Array.isArray(payload.selectedOptionIds) === true` | MUST   |

## テスト実行コマンド

```bash
# Playwright _electron テスト（Semantic + Visual）
# 初回（ベースライン生成）
npx playwright test apps/desktop/tests/e2e/phase11-semantic-layer.test.ts \
  --config=.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts \
  --update-snapshots

# 2回目以降（比較実行）
npx playwright test apps/desktop/tests/e2e/phase11-semantic-layer.test.ts \
  --config=.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts

# Vitest 単体テスト（AI 評価スクリプト）
pnpm vitest run .claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts
```

## テスト合計

| カテゴリ                     | テスト数  |
| ---------------------------- | --------- |
| SEM（Semantic）              | 7 件      |
| VIS（Visual）                | 7 件      |
| API（Claude API）            | 5 件      |
| SAVE（レポート保存）         | 4 件      |
| TASK（unassigned-task 生成） | 4 件      |
| PAY（payload 検証）          | 1 件      |
| **合計**                     | **28 件** |
