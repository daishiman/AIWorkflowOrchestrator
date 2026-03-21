# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| Phase 名   | 手動テスト                      |
| タスクID   | TASK-FIX-LLM-CONFIG-PERSISTENCE |
| 前提 Phase | Phase 10                        |
| 後続 Phase | Phase 12                        |
| ステータス | completed                       |
| 作成日     | 2026-03-20                      |
| 更新日     | 2026-03-21                      |
| 機能名     | LLM設定永続化修正               |

## 目的

`knowledge-studio-store` を正本とする Renderer persist が、再読み込み後も `selectedProviderId` / `selectedModelId` を保持し、無効値は `null` へクリアし、legacy v1 入力は v2 に安全移行されることを画面証跡つきで確認する。
本タスクは product shell 全体ではなく dedicated harness を使い、実装済みの `validateAndSyncPersistedConfig()` と persist v2 の見え方を視覚検証する。

## 実行タスク

### Task 1: dedicated harness による capture 実行

```bash
pnpm --filter @repo/desktop screenshot:task-fix-llm-config-persistence
```

- 入口スクリプト: `apps/desktop/scripts/capture-task-fix-llm-config-persistence-phase11.mjs`
- 本体スクリプト: `apps/desktop/scripts/capture-llm-config-persistence-phase11.mjs`
- harness route: `apps/desktop/src/renderer/phase11-llm-config-persistence.html`
- harness 実装: `apps/desktop/src/renderer/phase11-llm-config-persistence.tsx`

### Task 2: テストケース

| テストケース | 観点                         | 入力                                                                              | 期待結果                                                  | 証跡                                                                       |
| ------------ | ---------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| TC-11-01     | persist v2 の正常復元        | `selectedProviderId=anthropic`, `selectedModelId=claude-3-5-sonnet`, `version=2`  | 選択値がそのまま表示される                                | `outputs/phase-11/screenshots/TC-11-01-persist-v2-valid-selection.png`     |
| TC-11-02     | 無効 provider の null クリア | `selectedProviderId=legacy-provider`, `selectedModelId=legacy-model`, `version=2` | provider/model が未選択になり、暗黙 fallback が発生しない | `outputs/phase-11/screenshots/TC-11-02-invalid-provider-cleared.png`       |
| TC-11-03     | legacy v1 の v2 正規化       | `version=1`, LLM 選択フィールドなし                                               | 既存 persist を残したまま v2 扱いで正規化される           | `outputs/phase-11/screenshots/TC-11-03-legacy-v1-normalized-to-v2.png`     |
| TC-11-04     | reload 後の維持              | TC-11-01 と同じ valid state で再読み込み                                          | 再読み込み後も選択が保持され、reload count が 2 になる    | `outputs/phase-11/screenshots/TC-11-04-reload-retains-selected-config.png` |

### Task 3: 画面カバレッジマトリクス

| テストケース | surface        | 状態                      | 証跡                                                                       | 理由                     |
| ------------ | -------------- | ------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| TC-11-01     | review harness | valid persisted selection | `outputs/phase-11/screenshots/TC-11-01-persist-v2-valid-selection.png`     | 正常系の復元可視化       |
| TC-11-02     | review harness | invalid provider cleared  | `outputs/phase-11/screenshots/TC-11-02-invalid-provider-cleared.png`       | P62 対策の可視化         |
| TC-11-03     | review harness | legacy v1 normalized      | `outputs/phase-11/screenshots/TC-11-03-legacy-v1-normalized-to-v2.png`     | migrate 安全性の可視化   |
| TC-11-04     | review harness | after reload              | `outputs/phase-11/screenshots/TC-11-04-reload-retains-selected-config.png` | 再読み込み後の保持可視化 |

### Task 4: 補助成果物の同期

- `outputs/phase-11/manual-test-checklist.md` に TC ごとの実施可否を記録する
- `outputs/phase-11/manual-test-result.md` に実行コマンド、補助証跡、ブロッカー有無を記録する
- `outputs/phase-11/discovered-issues.md` に Phase 11 時点の発見事項を記録する
- `outputs/phase-11/screenshot-plan.json` と `phase11-capture-metadata.json` の時刻・内容を `manual-test-result.md` と一致させる

## テストケース

| テストケース | 観点                         | 入力                                                                              | 期待結果                                                  | 証跡                                                                       |
| ------------ | ---------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| TC-11-01     | persist v2 の正常復元        | `selectedProviderId=anthropic`, `selectedModelId=claude-3-5-sonnet`, `version=2`  | 選択値がそのまま表示される                                | `outputs/phase-11/screenshots/TC-11-01-persist-v2-valid-selection.png`     |
| TC-11-02     | 無効 provider の null クリア | `selectedProviderId=legacy-provider`, `selectedModelId=legacy-model`, `version=2` | provider/model が未選択になり、暗黙 fallback が発生しない | `outputs/phase-11/screenshots/TC-11-02-invalid-provider-cleared.png`       |
| TC-11-03     | legacy v1 の v2 正規化       | `version=1`, LLM 選択フィールドなし                                               | 既存 persist を残したまま v2 扱いで正規化される           | `outputs/phase-11/screenshots/TC-11-03-legacy-v1-normalized-to-v2.png`     |
| TC-11-04     | reload 後の維持              | TC-11-01 と同じ valid state で再読み込み                                          | 再読み込み後も選択が保持され、reload count が 2 になる    | `outputs/phase-11/screenshots/TC-11-04-reload-retains-selected-config.png` |

## 画面カバレッジマトリクス

| テストケース | surface        | 状態                      | 証跡                                                                       | 理由                     |
| ------------ | -------------- | ------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| TC-11-01     | review harness | valid persisted selection | `outputs/phase-11/screenshots/TC-11-01-persist-v2-valid-selection.png`     | 正常系の復元可視化       |
| TC-11-02     | review harness | invalid provider cleared  | `outputs/phase-11/screenshots/TC-11-02-invalid-provider-cleared.png`       | P62 対策の可視化         |
| TC-11-03     | review harness | legacy v1 normalized      | `outputs/phase-11/screenshots/TC-11-03-legacy-v1-normalized-to-v2.png`     | migrate 安全性の可視化   |
| TC-11-04     | review harness | after reload              | `outputs/phase-11/screenshots/TC-11-04-reload-retains-selected-config.png` | 再読み込み後の保持可視化 |

## 参照資料

| 資料                     | パス                                                                                           | 用途                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Phase 2 設計             | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md`                       | persist v2 / restore 契約の確認                        |
| Phase 5 実装             | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-5-implementation.md`               | dedicated harness が検証する対象実装の確認             |
| Phase 6 テスト拡充       | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-6-test-expansion.md`               | 回帰テスト観点の確認                                   |
| Phase 7 カバレッジ       | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-7-coverage-check.md`               | unit test coverage の確認                              |
| Phase 8 リファクタリング | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-8-refactoring.md`                  | 直前コード状態の確認                                   |
| Phase 9 品質検証         | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-9-quality-assurance.md`            | lint/typecheck/test PASS の確認                        |
| Phase 10 最終レビュー    | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-10-final-review.md`                | 受入基準とレビュー結果の確認                           |
| Phase 10 出力            | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-10/final-review-result.md` | PASS 判定と対象テストの確認                            |
| persist 実装             | `apps/desktop/src/renderer/store/index.ts`                                                     | `knowledge-studio-store`, version 2, partialize の確認 |
| validation 実装          | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                                           | `validateAndSyncPersistedConfig()` の確認              |
| capture 入口             | `apps/desktop/scripts/capture-task-fix-llm-config-persistence-phase11.mjs`                     | 実行コマンドの正本                                     |

## 実行手順

1. `pnpm --filter @repo/desktop screenshot:task-fix-llm-config-persistence` を実行する。
2. build blocker がある場合は fallback review board の capture を実行する。
3. `outputs/phase-11/screenshot-plan.json` を確認し、TC-11-01〜04 が揃っていることを確認する。
4. `outputs/phase-11/manual-test-checklist.md` と `outputs/phase-11/manual-test-result.md` を実績で更新する。
5. ブロッカーが出た場合は `discovered-issues.md` と Phase 12 レポートへ同じ事実を書き戻す。

## 統合テスト連携

- `persist-partialize.test.ts`, `persist-migration.test.ts`, `llmSlice-validation.test.ts`, `llmSlice-sync.test.ts`, `llmSlice-validation-extended.test.ts` を根拠テストとして扱う
- 画面証跡は visual evidence、ロジック保証は unit test として分離する
- fallback review board を使う場合も、元の根拠は `validateAndSyncPersistedConfig()` と persist v2 実装であることを `manual-test-result.md` に明記する

## 成果物

| 成果物          | パス                                                                                             | 説明                      |
| --------------- | ------------------------------------------------------------------------------------------------ | ------------------------- |
| Phase 11 仕様書 | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-11-manual-test.md`                   | 手動テスト計画と TC 定義  |
| 実施チェック    | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/manual-test-checklist.md` | TC 実施可否               |
| 実施結果        | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/manual-test-result.md`    | 実測結果と補助証跡        |
| capture plan    | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/screenshot-plan.json`     | 撮影対象一覧              |
| 発見事項        | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/discovered-issues.md`     | ブロッカー/フォローアップ |

## 完了条件

- [x] `knowledge-studio-store` を正本とすることを明記した
- [x] TC-11-01〜04 の visual evidence 対象を定義した
- [x] dedicated harness / capture script / result file の導線を固定した
- [x] `画面カバレッジマトリクス` に PNG 証跡列を含めた
- [x] `統合テスト連携` 見出しを含めた
- [x] Phase 12 で再利用する capture command を固定した
