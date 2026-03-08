# Phase 2: 責務分担表（Ownership Matrix）

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 2                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Lead-Sync                                       |

---

## 1. 層別責務分担

### 1.1 本タスクでの変更責務

| 層    | ファイル / ディレクトリ                                                           | 変更種別 | 責務                                             | 担当 SubAgent            |
| ----- | --------------------------------------------------------------------------------- | -------- | ------------------------------------------------ | ------------------------ |
| Tests | `apps/desktop/src/renderer/views/SettingsView/SettingsView.integration.test.tsx`  | 新規作成 | real composition 統合テスト                      | SubAgent-Test-Harness    |
| Tests | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts` | 新規作成 | store + electronAPI mock の一元管理ヘルパー      | SubAgent-Test-Harness    |
| Docs  | `docs/30-workflows/08-.../outputs/phase-*/`                                       | 新規作成 | Phase 成果物（要件/設計/テスト計画/回帰行列 等） | SubAgent-Lead-Sync       |
| Docs  | `docs/30-workflows/08-.../outputs/phase-11/manual-test-template.md`               | 新規作成 | settings shell 到達必須の手動テストテンプレート  | SubAgent-Manual-Evidence |

### 1.2 変更しない層

| 層       | ファイル                                                     | 理由                                               | 確認責務                 |
| -------- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------ |
| Renderer | `views/SettingsView/index.tsx`                               | プロダクションコード変更なし                       | SubAgent-Component-Scope |
| Renderer | `components/settings/AuthModeSelector/index.tsx`             | プロダクションコード変更なし                       | SubAgent-Component-Scope |
| Renderer | `components/organisms/ApiKeysSection/index.tsx`              | プロダクションコード変更なし（task-06 で変更予定） | SubAgent-Component-Scope |
| Renderer | `components/organisms/AccountSection/index.tsx`              | プロダクションコード変更なし                       | SubAgent-Component-Scope |
| Preload  | `preload/index.ts`, `preload/types.ts`                       | IPC 境界は mock で対応。変更なし                   | SubAgent-Lead-Sync       |
| Main     | `main/ipc/apiKeyHandlers.ts`, `main/ipc/authModeHandlers.ts` | Main Process は mock 対象。変更なし                | SubAgent-Lead-Sync       |
| Store    | `store/index.ts`, `store/slices/*.ts`                        | store は mock 対象。変更なし（task-07 で変更予定） | SubAgent-Lead-Sync       |

---

## 2. SubAgent 別責務分担

| SubAgent                 | Phase 1-3 での責務                                  | Phase 4-9 での責務                                  | Phase 10-13 での責務                          |
| ------------------------ | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------- |
| SubAgent-Test-Harness    | harness 構造設計、mock 境界定義                     | harness 実装、integration test 実装（Codex 委譲可） | テスト結果の検証                              |
| SubAgent-Component-Scope | real/mock 境界の定義、責務重複チェック              | 既存 test との境界維持                              | 重複テストの最終確認                          |
| SubAgent-Manual-Evidence | settings shell 到達条件の定義、証跡テンプレート設計 | -                                                   | Phase 11 の手動テスト実行、証跡収集           |
| SubAgent-Lead-Sync       | 05/06/07 の AC 統合、回帰行列設計、仕様書作成       | テストケースと AC の追跡性検証                      | 最終レビュー、仕様同期、未タスク検出、PR 準備 |

---

## 3. Codex 委譲境界

| Phase   | 委譲範囲                                     | SubAgent の確認責務                  |
| ------- | -------------------------------------------- | ------------------------------------ |
| Phase 4 | Red テスト（失敗するテストケース）の実装     | テストケース ID と AC の対応を確認   |
| Phase 5 | settings-test-harness.ts の実装              | mock 境界が設計判断2に合致するか確認 |
| Phase 6 | 追加テストケースの実装                       | カバレッジ基準への貢献を確認         |
| Phase 7 | カバレッジレポートの取得                     | NFR-03 の基準に達しているか確認      |
| Phase 8 | リファクタリング（テストコードの重複排除等） | 機能変更がないことを確認             |
| Phase 9 | lint / typecheck / 全テスト実行              | 全 PASS を確認                       |

---

## 4. 先行タスクとの責務境界

| 先行タスク | 先行タスクの変更責務                           | 本タスク（08）の検証責務                                     |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------ |
| task-05    | AuthModeSelector の UI 導線改善                | real AuthModeSelector 経由で切替動作を統合テストで検証       |
| task-06    | ApiKeysSection の providers 正規化ガード追加   | malformed response 時のフォールバックを統合テストで検証      |
| task-07    | navigationSlice / store hydrate のハードニング | corrupted persist state での settings 表示を統合テストで検証 |

### 競合回避ルール

- 08 のテストは先行タスクの「AC」に依存するが、「実装詳細」には依存しない
- 先行タスクの実装が変更されても、AC が維持されている限り 08 のテストは PASS する設計にする
- 先行タスクの実装が AC を変更する場合は、08 の回帰行列も更新する
