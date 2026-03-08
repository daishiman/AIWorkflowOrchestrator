# Phase 5: 変更ファイル計画

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 5                                                        |
| 作成日   | 2026-03-08                                               |

---

## 新規ファイル

| ファイルパス                                                                               | 目的                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`          | store + electronAPI の統合 mock ハーネス。AC-06（境界一本化）の実現。createDefaultStoreState() / createDefaultAuthModeSelectors() / createDefaultElectronApiKey() / createSettingsHarness(options) を提供 |
| `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` | SettingsView 統合テスト（INT-01 〜 INT-05、サブケース含む9テストケース）。AC-01（過剰モック解消）の実現                                                                                                   |

---

## 変更なしファイル（real composition で使用）

以下のファイルは統合テストで **real コンポーネント** として使用するが、ソースコードの変更は行わない。

| ファイルパス                                                               | 役割                                  |
| -------------------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | テスト対象（変更なし）                |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`  | real コンポーネント（vi.mock 不使用） |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`  | real コンポーネント（vi.mock 不使用） |
| `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | real コンポーネント（vi.mock 不使用） |

---

## 既存テストへの影響

| ファイルパス                                                                                         | テスト件数 | 影響                                                  |
| ---------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                                 | 26件       | 変更なし。引き続き vi.mock 使用の単体テストとして残存 |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`    | 46件       | 変更なし                                              |
| `apps/desktop/src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx` | 20件       | 変更なし                                              |

統合テストは別ファイル（`SettingsView.integration.test.tsx`）として独立しており、既存テストファイルへの修正は一切発生しない。
