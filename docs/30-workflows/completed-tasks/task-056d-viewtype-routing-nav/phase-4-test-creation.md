# Phase 4: テスト作成

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 4                              |
| Phase名      | テスト作成                     |
| 前提Phase    | Phase 1, Phase 2, Phase 3      |
| 後続Phase    | Phase 5                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-B                     |

## 目的

ViewType拡張とルーティング整合を担保する Red テスト仕様を先行定義し、実装時の漏れを防ぐ。

## 実行タスク

- テスト観点定義: 型、分岐、ナビ、ショートカット、統合の5観点を定義する。
- テストケース作成: 失敗前提のケースをID付きで作成する。
- 統合マトリクス作成: `App.tsx` と `AppDock` の連携ケースを整理する。

## 参照資料

| 参照資料       | パス                                                                        | 内容           |
| -------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 1仕様    | `phase-1-requirements.md`                                                   | 要件入力       |
| Phase 2仕様    | `phase-2-design.md`                                                         | 設計入力       |
| Phase 3仕様    | `phase-3-design-review.md`                                                  | 指摘入力       |
| 設計成果物     | `outputs/phase-2/routing-switch-design.md`                                  | 分岐設計       |
| レビュー成果物 | `outputs/phase-3/review-findings.md`                                        | 修正対象       |
| テスト基準     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |
| ナビ正本       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`     | 導線期待値     |

## システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                         | 内容           |
| ---------- | ---------------------------------------------------------------------------- | -------------- |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト基準     |
| UIナビ     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | 画面遷移期待値 |
| 状態管理   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | ViewType契約   |
| エラー仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 失敗系設計     |

## 実行手順

### ステップ1: テスト観点定義

観点ごとに成功条件と失敗条件を定義する。

### ステップ2: テストケース作成

TC-IDを付与し、前提・入力・期待結果を記述する。

### ステップ3: 統合マトリクス作成

画面導線とショートカットを含む連携ケースを整理する。

## 統合テスト連携

| 観点         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| 連携ケース   | ViewType変更時に `renderView` と AppDock表示が一致することを検証対象化 |
| 失敗系ケース | 未定義ViewType入力時の安全動作を検証対象化                             |
| 後続連携     | Phase 5実装計画へ TC-ID を引き渡す                                     |

## 成果物

| 成果物               | パス                                         | 内容       |
| -------------------- | -------------------------------------------- | ---------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`      | 観点定義   |
| テストケース一覧     | `outputs/phase-4/test-cases.md`              | TC-ID一覧  |
| 統合テストマトリクス | `outputs/phase-4/integration-test-matrix.md` | 連携検証表 |

## 完了条件

- [x] テスト観点が5カテゴリで定義されている
- [x] 失敗系を含むTC-IDが作成されている
- [x] 統合マトリクスにナビと分岐が含まれている
- [x] Phase 5へ引き渡す入力が整理されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5: 実装

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                   | 仕様参照先                                         |
| ------------------ | -------------------------- | -------------------------------------------------- |
| テスタビリティ     | 主要目的のため適用         | `aiworkflow-requirements: quality-requirements.md` |
| UI/UX              | ナビ導線試験を扱うため適用 | `aiworkflow-requirements: ui-ux-*.md`              |
| エラーハンドリング | 失敗系設計を扱うため適用   | `aiworkflow-requirements: error-handling.md`       |

## サブタスク管理

1. 参照資料の確認
2. テスト観点定義
3. テストケース作成
4. 統合マトリクス作成
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
