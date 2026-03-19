# コンポーネントテストパターン / history bundle

> 親仕様書: [testing-component-patterns.md](testing-component-patterns.md)
> 役割: history bundle

## 参照

- **テストフィクスチャ**: [testing-fixtures.md](testing-fixtures.md)
- **品質要件**: [quality-requirements.md](quality-requirements.md)
- **UIコンポーネント仕様**: [ui-ux-components.md](ui-ux-components.md)
- **状態管理パターン Store Hooksテスト実装ガイド**: [arch-state-management.md](arch-state-management.md#store-hooks-テスト実装ガイド)

---

## 関連未タスク

| タスクID                  | タスク名                           | 優先度 | 発見元    | 概要                                                             |
| ------------------------- | ---------------------------------- | ------ | --------- | ---------------------------------------------------------------- |
| TASK-IMP-VITEST-UTILS-001 | Vitestテスト共通ユーティリティ整備 | 中     | TASK-9A-A | ESModuleモッキング回避パターン・一時ディレクトリヘルパーの共通化 |

> **配置先**: `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-vitest-test-utilities-improvement.md`

---

## 変更履歴

| Version | Date       | Changes                                                            |
| ------- | ---------- | ------------------------------------------------------------------ |
| 1.12.0  | 2026-03-08 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001: S-INT-01 View レベル統合テストハーネスパターンを追加（real composition、vi.mock hoisting、モジュールスコープ変数、M-01 網羅的デフォルト値） |
| 1.11.0  | 2026-03-08 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001: SettingsView 統合ハーネスパターンを追加（store+electronAPI 一本化、HarnessOptions、非同期安定化ルール） |
| 1.10.0  | 2026-03-07 | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001: Preload Shape 異常系テストパターン追加（electronAPI 差し替え、テストケースマトリクス、afterEach 復元ルール） |
| 1.9.0   | 2026-03-06 | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001: auth-mode 契約テストパターンを追加し、`window.electronAPI.authMode` モックを現行API（`get/set/status/validate/onModeChanged`）と `AuthModeStatus` DTO に同期 |
| 1.8.0   | 2026-02-26 | TASK-9A完了反映: SkillEditorテストパターンを `spec_created` から `completed` に更新。関連タスク表記を `TASK-9A` に同期 |
| 1.7.0   | 2026-02-23 | TASK-UI-00-ATOMS: Atomsコンポーネントテストパターンセクション追加（Props駆動テスト、CSS変数アサーション、テーマ横断テスト、displayName検証、7コンポーネント必須テストケース、タイマーテストパターン、後方互換性テストパターン、テスト実績） |
| 1.6.0   | 2026-02-22 | TASK-UI-00-TOKENS: テーマ横断テストヘルパーパターンを追加（`renderWithTheme`/`renderWithAllThemes`、`data-theme` 後始末ルール、P39準拠注意点） |
| 1.5.0   | 2026-02-19 | TASK-9A-C: SkillEditorテストパターン追加（textareaテスト、IPC mockパターン、ファイルツリーテスト、キーボードショートカットテスト、非同期テスト）。spec_created（実装未着手）を明記 |
| 1.4.0   | 2026-02-13 | TASK-FIX-11-1-SDK-TEST-ENABLEMENT: Main Process SDKテスト有効化パターンを追加（mockRejectedValueOnce、beforeEach再設定、Fake Timersタイムアウト検証、モジュールモック時の直接エラー注入） |
| 1.3.0   | 2026-02-12 | UT-STORE-HOOKS-TEST-REFACTOR-001: Zustand Store Hooksテストパターンセクション追加（renderHook 6パターン、テスト環境要件、選択基準、テスト実績） |
| 1.2.0   | 2026-02-07 | TASK-FIX-4-2: テストファイル分離パターンセクション追加（永続化・エラー・境界値テスト分離） |
| 1.1.0   | 2026-02-03 | TASK-9A-A: 関連未タスクセクション追加（TASK-IMP-VITEST-UTILS-001） |
| 1.0.0   | 2026-02-02 | TASK-8Bパターンから初版作成（280テスト知見統合）                   |

