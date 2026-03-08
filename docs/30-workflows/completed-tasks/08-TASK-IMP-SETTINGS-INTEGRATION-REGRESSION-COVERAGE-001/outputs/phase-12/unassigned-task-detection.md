# Phase 12: 未タスク検出レポート

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 12                                                       |
| 作成日   | 2026-03-08                                               |

---

## 検出サマリ

| 項目     | 件数 |
| -------- | ---- |
| 検出数   | 4    |
| 高優先度 | 0    |
| 中優先度 | 2    |
| 低優先度 | 2    |

---

## 未タスク一覧

### UT-08-001: act() 警告の解消

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| ID       | UT-08-001                                                             |
| 分類     | テスト品質改善                                                        |
| 優先度   | Low                                                                   |
| 影響範囲 | SettingsView.integration.test.tsx の INT-05 テストスイート（3テスト） |

**内容**: INT-05（auth-mode status メッセージの条件付き表示）の3テストで、ApiKeysSection の非同期更新（`apiKey.list()` の Promise 解決）に起因する `act()` 警告がコンソールに出力される。テスト自体は PASS するが、コンソール出力が汚染される。

**原因**: INT-05 のテストは auth-mode status の表示を検証する目的であり、ApiKeysSection の非同期ロード完了を `waitFor` で待機していない。SettingsView 全体をレンダーするため、ApiKeysSection の `useEffect` 内 `apiKey.list()` が Promise を返し、テスト終了後に state 更新が発生する。

**対策案**:

1. INT-05 の各テスト末尾に `await waitFor(() => {})` を追加して非同期更新を待機する
2. または、INT-05 専用のハーネスオプションで `apiKey.list` を同期的に解決する mock に差し替える

**機能影響**: なし（テスト結果に影響なし、コンソール出力の美観のみ）

---

### UT-08-002: Playwright E2E テスト導入検討

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| ID       | UT-08-002                          |
| 分類     | テスト基盤拡充                     |
| 優先度   | Medium                             |
| 影響範囲 | SettingsView の E2E レベル回帰保証 |

**内容**: 現在の統合テスト（SettingsView.integration.test.tsx）は happy-dom 環境での DOM 検証であり、実際の Electron ウィンドウ + Chromium レンダリングは検証していない。Phase 11（手動テスト）で確認するシナリオの一部を Playwright で自動化することで、回帰保証を強化できる。

**対策案**:

1. Playwright for Electron を導入し、SettingsView の表示 -> 操作フローを E2E テスト化
2. 対象シナリオ: 設定画面表示、auth-mode 切替、APIキープロバイダー一覧表示
3. CI パイプラインに headless モードで組み込み

**見積もり**: 中規模（Playwright 環境構築 + テストシナリオ 5-8 本）

---

### UT-08-003: Phase 6 拡張テストケースの残実装

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| ID       | UT-08-003                                       |
| 分類     | テストカバレッジ拡充                            |
| 優先度   | Medium                                          |
| 影響範囲 | regression-expansion-plan.md の INT-11 ~ INT-13 |

**内容**: Phase 6 の regression-expansion-plan.md で計画された INT-06 ~ INT-13 のうち、INT-06 ~ INT-10 は Phase 6 で実装済み。残りの INT-11 ~ INT-13 は以下の理由で未実装。

| テストケース | 計画内容                                      | 未実装理由                                                                                              |
| ------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| INT-11       | auth-mode 切替後の ApiKeysSection 連動        | ApiKeysSection は auth-mode に依存せず常時表示のため、連動テストの意義が低い                            |
| INT-12       | malformed provider entry のフィルタリング     | ApiKeysSection の内部フィルタリング実装が type predicate ベースであり、統合テストよりも単体テストが適切 |
| INT-13       | persist corruption 後の SettingsView 正常表示 | localStorage mock の harness 非対応。専用 setup 関数の追加が必要                                        |

**対策案**:

1. INT-11: 実装依存の確認後、ApiKeysSection が auth-mode に連動する場合のみ実装
2. INT-12: ApiKeysSection の単体テストで malformed entry フィルタリングを検証（既存テストの拡充）
3. INT-13: harness に localStorage mock 機能を追加し、persist corruption テストを実装

---

### UT-08-004: testing-component-patterns.md への integration harness パターン追加

| 項目     | 内容                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| ID       | UT-08-004                                                                         |
| 分類     | 仕様書更新                                                                        |
| 優先度   | Low                                                                               |
| 影響範囲 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

**内容**: 本タスクで確立した settings-test-harness パターン（store mock + electronAPI mock の一本化ハーネス）を、testing-component-patterns.md に実装パターンとして追加する。これにより、今後の統合テスト実装時にハーネス設計の再発明を防止する。

**追加すべきパターン**:

1. `createXxxHarness(options)` パターン: store + 外部API mock の一本化
2. vi.mock のモジュールスコープ変数参照パターン（hoist 対策）
3. HarnessOptions による テストケースごとのカスタマイズ

**対策案**: testing-component-patterns.md の「統合テストパターン」セクションに追記

---

## 3ステップ完了確認

| ステップ                                   | UT-08-001 | UT-08-002 | UT-08-003 | UT-08-004 |
| ------------------------------------------ | --------- | --------- | --------- | --------- |
| 1. 本レポートに記録                        | 完了      | 完了      | 完了      | 完了      |
| 2. task-workflow.md 残課題テーブルへの登録 | 完了      | 完了      | 完了      | 完了      |
| 3. 関連仕様書に参照リンク追加              | 完了      | 完了      | 完了      | 完了      |

**注記**: 未タスク指示書は `docs/30-workflows/unassigned-task/task-ut-08-00{1..4}-*.md` として作成済み。`task-workflow.md` / `testing-component-patterns.md` / `lessons-learned.md` への参照反映も完了。
