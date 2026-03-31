# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 8                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 担当   | 設計書作成エージェント                |

## 目的

動作を変えずにコード品質と仕様書品質を改善する。3層評価スクリプトのモジュール分離・共通ユーティリティ抽出・テンプレート重複排除・フィードバックループの責務整理を行い、Phase 9（品質保証）以降での検証を安定化させる。

## 実行タスク

- `evaluate-ui-ux-playwright-e2e.ts` の関数分離と命名改善
- `evaluate-ui-ux.js` のエラーハンドリング共通化
- Phase 11 テンプレートの重複排除と構造整理
- unassigned-task 生成ロジックの責務整理

## 参照資料

| 資料名                 | パス                                                                                     | 説明                           |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 5 実装           | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-5-implementation.md` | リファクタリング対象の実装計画 |
| Phase 7 カバレッジ確認 | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-7-coverage-check.md` | どの責務が未整理かの確認材料   |
| Phase テンプレート     | `.claude/skills/task-specification-creator/references/phase-templates.md`                | Phase 8 の必須構造確認         |

---

## 実行手順

### ステップ 1: スクリプトのリファクタリング

**目的**: 3 層評価スクリプトを責務ごとに分離し、再利用性と可読性を高める。

#### 1-1: 層ごとのファイル分割設計

現在の `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` に含まれる 3 層評価関数を、以下のファイル構成に分離する。

| 新規ファイル                                                                         | 担当する責務                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `.claude/skills/task-specification-creator/scripts/layers/semantic-layer.ts`         | 層1: Semantic 確認（ARIA・tabindex・フォーカス） |
| `.claude/skills/task-specification-creator/scripts/layers/visual-layer.ts`           | 層2: Visual 確認（toHaveScreenshot）             |
| `.claude/skills/task-specification-creator/scripts/layers/ai-ux-layer.ts`            | 層3: AI UX 評価（Claude API 呼び出し委譲）       |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-screenshot.js`     | 共通ユーティリティ（スクリーンショット保存等）   |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | エントリポイント（テストスイートのみ残す）       |

#### 1-2: Before/After 変更テーブル

| 対象                                           | Before                                                   | After                                                                                | 理由                                         |
| ---------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------- |
| `testSemanticLayer()` 関数                     | `evaluate-ui-ux-playwright-e2e.ts` にインライン定義      | `layers/semantic-layer.ts` にエクスポート関数として移動                              | 単一責務原則。層1 の変更が他層に波及しない   |
| `testVisualLayer()` 関数                       | `evaluate-ui-ux-playwright-e2e.ts` にインライン定義      | `layers/visual-layer.ts` にエクスポート関数として移動                                | 単一責務原則。層2 の変更が他層に波及しない   |
| `encodeScreenshot()` 関数（evaluate-ui-ux.js） | `evaluate-ui-ux.js` にプライベート定義                   | `utils/screenshot-utils.ts` にエクスポート関数として移動                             | 複数スクリプトから再利用可能にする           |
| `launchElectronApp()` 関数                     | `evaluate-ui-ux-playwright-e2e.ts` にインライン定義      | `utils/electron-launcher.ts` に移動（Electron 起動設定を集約）                       | 起動オプション変更時の変更箇所を一箇所に限定 |
| `SemanticTestResult` 型定義                    | `evaluate-ui-ux-playwright-e2e.ts` の末尾に定義          | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-types.d.ts` に集約 | 型定義の一元管理                             |
| `UXEvaluationResult` 等の型定義                | `evaluate-ui-ux.js` に定義                               | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-types.d.ts` に集約 | 型定義の一元管理                             |
| エラーハンドリング（evaluate-ui-ux.js）        | 各関数で個別の `console.error` / `process.exit`          | `utils/error-handler.ts` に `handleEvaluationError()` を定義して統一                 | エラー出力フォーマットの統一とテスト容易化   |
| unassigned-task 生成ロジック                   | `evaluate-ui-ux.js` の `main()` 内に混在                 | `evaluate-ui-ux-unassigned-task.js` として独立モジュール化                           | 評価実行・記録・生成の責務を明確に分離       |
| 評価結果の Markdown 変換                       | `evaluate-ui-ux.js` の `saveEvaluationReport()` 内に混在 | `evaluate-ui-ux-report-formatter.js` として独立モジュール化                          | フォーマット変更時の影響範囲を限定           |

#### 1-3: エラーハンドリング共通化設計

`evaluate-ui-ux.js` で個別に実装されているエラーハンドリングを `utils/error-handler.ts` で統一する。

```typescript
// .claude/skills/task-specification-creator/scripts/utils/error-handler.ts
export type EvaluationErrorCode =
  | "SCREENSHOT_NOT_FOUND"
  | "API_RESPONSE_INVALID"
  | "OUTPUT_WRITE_FAILED"
  | "ELECTRON_LAUNCH_FAILED";

export interface EvaluationError {
  code: EvaluationErrorCode;
  message: string;
  originalError?: unknown;
}

export function handleEvaluationError(error: EvaluationError): never {
  console.error(`[${error.code}] ${error.message}`);
  if (error.originalError) {
    console.error("原因:", error.originalError);
  }
  process.exit(1);
}
```

#### 1-4: リファクタリング計画の出力先

変更内容の詳細を以下に記録する。

**成果物**: `outputs/phase-8/refactoring-plan.md`

記録フォーマット:

```markdown
# リファクタリング計画

## 変更一覧

| 変更ID | 対象ファイル | 変更種別 | Before（要約） | After（要約） | 理由 |
| ------ | ------------ | -------- | -------------- | ------------- | ---- |
| RF-001 | ...          | 移動     | ...            | ...           | ...  |

## 影響範囲

- テストへの影響: なし / インポートパスの更新のみ
- 外部 API: 変更なし（型定義の移動のみ）
- Phase 4〜7 成果物への影響: なし（スクリプト動作は同一）
```

---

### ステップ 2: テンプレートのリファクタリング

**目的**: Phase 11 テンプレートの重複排除と見出し階層の整理。

#### 2-1: 重複チェックポイント

以下の観点で `phase-11-test-report-template.md` の重複を確認する。

| 確認観点                                                         | 確認方法                                           | 対処方針                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| 既存「アクセシビリティテスト」セクションと「層1: Semantic 確認」 | セクション内容を対比し、確認項目の重複リストを作成 | 層1 の確認項目が既存と重複する場合は統合                       |
| 既存「スクリーンショットエビデンス」と「層2: Visual 確認」       | 命名ルール・保存先の重複を確認                     | 命名ルールを統一し、既存ルールへの参照を追加                   |
| 「仕様照合結果サマリー」と「3層評価サマリー」                    | 同一情報が二重記載されていないかを確認             | 仕様照合は既存セクション、評価サマリーは 3層評価サマリーに統合 |

#### 2-2: 見出し階層の整理

Phase 2 で追加した 3 層評価セクションの見出し構造を以下のように整理する。

**Before** (Phase 2 設計時の暫定構造):

```markdown
### 層1: Semantic 確認（アクセシビリティ構造検証）

### 層2: Visual 確認（視覚的回帰検出）

### 層3: AI UX 評価（問題発見）

### 3層評価サマリー
```

**After** (Phase 8 整理後):

```markdown
## 3層評価

### 層1: Semantic 確認（アクセシビリティ構造検証）

### 層2: Visual 確認（視覚的回帰検出）

### 層3: AI UX 評価（問題発見）

### 3層評価サマリー
```

理由: 既存の `## 機能テスト` / `## エラーハンドリングテスト` と同じ階層（h2）に「3層評価」を配置し、テンプレート全体の構造的一貫性を保つ。

---

### ステップ 3: フィードバックループの責務整理

**目的**: 評価実行・記録・生成の責務を明確に分離し、各コンポーネントの単一責務を確立する。

#### 3-1: 責務分離テーブル

| 責務           | 担当モジュール                                  | 入力                   | 出力                               |
| -------------- | ----------------------------------------------- | ---------------------- | ---------------------------------- |
| 評価実行       | `layers/semantic-layer.ts`                      | `Page`, `selector`     | `SemanticTestResult`               |
| 評価実行       | `layers/visual-layer.ts`                        | `Page`, `testCaseId`   | `void`（Playwright が内部で管理）  |
| 評価実行       | `layers/ai-ux-layer.ts`                         | `screenshotPaths[]`    | `UXEvaluationResult`               |
| 評価記録       | `evaluate-ui-ux-report-formatter.js`            | `UXEvaluationResult`   | `string`（Markdown テキスト）      |
| 評価記録       | `evaluate-ui-ux.js`（`saveEvaluationReport()`） | `string`, `outputPath` | `void`（ファイル書き込み）         |
| unassigned生成 | `evaluate-ui-ux-unassigned-task.js`             | `UXEvaluationResult`   | `string[]`（生成ファイルパス一覧） |

#### 3-2: 責務整理後のデータフロー

```
Phase 11 実行
    │
    ├─ 層1: semantic-layer.ts（評価実行）→ SemanticTestResult
    ├─ 層2: visual-layer.ts（評価実行）→ スクリーンショット保存
    └─ 層3: ai-ux-layer.ts（評価実行）→ UXEvaluationResult
                                               │
                              ┌────────────────┴────────────────┐
                              ▼                                 ▼
                   evaluate-ui-ux-report-formatter.js                evaluate-ui-ux-unassigned-task.js
                   （評価記録）                         （unassigned生成）
                              │                                 │
                              ▼                                 ▼
              outputs/phase-11/ai-ux-evaluation.md    unassigned-task/ui-ux-issue-*.md
```

---

## 統合テスト連携

```bash
# リファクタリング後の動作確認
pnpm test

# 統合テスト（スクリプト分割後の結合確認）
pnpm test:integration

# E2E テスト（Playwright 分割後の動作確認）
pnpm test:e2e
```

リファクタリング前後で以下が一致することを確認する。

| 確認項目                                       | 確認方法                                |
| ---------------------------------------------- | --------------------------------------- |
| `testSemanticLayer()` の戻り値                 | Before/After で同じ型・同じ値が返る     |
| `testVisualLayer()` のスクリーンショット保存先 | ファイルパスが変わっていないこと        |
| `evaluateUIWithClaude()` の戻り値              | モック使用で同一 JSON が返ること        |
| `generateUnassignedTasks()` の出力             | Before/After で同じファイルが生成される |

---

## 成果物

| 成果物名                             | パス                                                                                  | 説明                            |
| ------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------- |
| リファクタリング仕様書（本ファイル） | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-8-refactoring.md` | Phase 8 成果物                  |
| リファクタリング計画                 | `outputs/phase-8/refactoring-plan.md`                                                 | Before/After テーブル・影響範囲 |

---

## 完了条件チェックリスト

- [ ] `evaluate-ui-ux-playwright-e2e.ts` の 3 層評価関数が層ごとにファイル分離されている
- [ ] `evaluate-ui-ux.js` のエラーハンドリングが `utils/error-handler.ts` で共通化されている
- [ ] 共通ユーティリティ（`encodeScreenshot` 等）が `utils/screenshot-utils.ts` に抽出されている
- [ ] 型定義（`SemanticTestResult`・`UXEvaluationResult` 等）が `types.ts` に集約されている
- [ ] unassigned-task 生成ロジックが `evaluate-ui-ux-unassigned-task.js` として独立している
- [ ] 評価結果の Markdown 変換が `evaluate-ui-ux-report-formatter.js` として独立している
- [ ] Phase 11 テンプレートの重複（アクセシビリティ・スクリーンショット）が確認・解消されている
- [ ] 3 層評価セクションの見出し階層が `## 3層評価` → `###` 構造に整理されている
- [ ] リファクタリング計画（`outputs/phase-8/refactoring-plan.md`）が作成されている
- [ ] `pnpm test` / `pnpm test:integration` / `pnpm test:e2e` がリファクタリング前後で同じ結果を返す
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
