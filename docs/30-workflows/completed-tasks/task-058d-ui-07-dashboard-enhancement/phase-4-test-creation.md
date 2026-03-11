# Phase 4: テスト作成

## メタ情報

| 項目         | 内容          |
| ------------ | ------------- |
| Phase        | 4             |
| Phase名      | テスト作成    |
| 前提Phase    | Phase 1, 2, 3 |
| 後続Phase    | Phase 5       |
| ステータス   | completed     |
| 作成日       | 2026-03-11    |
| 担当SubAgent | SubAgent-D    |

## 目的

ホーム画面再設計の正常系と主要異常系を先にテスト化し、
旧 DashboardView の期待値を安全に置き換える。

## 実行タスク

- 既存期待値棚卸し: `DashboardView.test.tsx` の旧統計カード前提を棚卸しする
- 新規ケース定義: 挨拶、サジェスチョン、タイムライン、EmptyState、導線のテストケースを作る
- Store/導線検証固定: `useAppStore` モックと `setCurrentView` 呼び出し検証を固定する

## 参照資料

| 参照資料            | パス                                                                              | 内容             |
| ------------------- | --------------------------------------------------------------------------------- | ---------------- |
| Phase 1成果物       | `outputs/phase-1/requirements-definition.md`                                      | FR/NFR 一覧      |
| Phase 1受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                          | AC 一覧          |
| Phase 2仕様         | `phase-2-design.md`                                                               | テスト対象設計   |
| 設計レビュー結果    | `outputs/phase-3/design-review-result.md`                                         | レビュー済み前提 |
| 現行テスト          | `apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx`            | 更新対象         |
| テストパターン      | `.agents/skills/aiworkflow-requirements/references/testing-component-patterns.md` | Store mock、RTL  |
| A11y テスト         | `.agents/skills/aiworkflow-requirements/references/testing-accessibility.md`      | keyboard 観点    |

## 実行手順

### ステップ1: 既存期待値を置換する

- 統計カード関連 assertion を削除または置換する
- `ダッシュボード` 表示前提を `ホーム` に更新する

### ステップ2: 新規テストケースを追加する

- 時間帯別挨拶
- EmptyState と通常状態の分岐
- サジェスチョン CTA の `setCurrentView` 検証
- タイムライン 5件制限と `RelativeTime`

### ステップ3: A11y ケースを追加する

- button role
- heading / region
- Tab / Enter / Space

## 統合テスト連携

| 観点 | 内容                                                              |
| ---- | ----------------------------------------------------------------- |
| 状態 | `activityFeed` 件数、`pending` 件数、displayName 有無の組み合わせ |
| 導線 | `workspace` / `skillCenter` / `agent` / `historySearch`           |
| A11y | keyboard 操作と time semantics                                    |

## 多角的チェック観点

| 観点               | 適用判断                                                     | 仕様参照先                                          |
| ------------------ | ------------------------------------------------------------ | --------------------------------------------------- |
| UI/UX              | 表示切替ケース作成のため適用                                 | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ     | helper 切り出しテスト範囲決定で適用                          | `aiworkflow-requirements: architecture-*.md`        |
| アクセシビリティ   | keyboard / role test 作成のため適用                          | `aiworkflow-requirements: testing-accessibility.md` |
| セキュリティ       | 新規 IPC 不要前提を回帰ケース化するため適用                  | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | invalid timestamp / empty / loading の失敗系テスト作成で適用 | `aiworkflow-requirements: error-handling.md`        |
| テスタビリティ     | store mock と interaction test の設計で適用                  | `aiworkflow-requirements: testing-*.md`             |

## 成果物

| 成果物           | パス                                    | 内容            |
| ---------------- | --------------------------------------- | --------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | ケース一覧      |
| テストケース一覧 | `outputs/phase-4/test-cases.md`         | Given/When/Then |

## 完了条件

- [x] 旧統計カード前提の assertion が置換対象として一覧化されている
- [x] 新規 UI の主要ケースが列挙されている
- [x] keyboard / role / navigation ケースが含まれている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 既存 assertion の棚卸し
3. 正常系ケース作成
4. A11y ケース作成
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] コード成果物の配置先が `apps/desktop/src/renderer/...` と明記されている
- [x] ドキュメント成果物の配置先が `outputs/phase-4/` と明記されている
- [x] `artifacts.json` の Phase 4 記述と整合している

## 次のPhase

Phase 5: 実装
