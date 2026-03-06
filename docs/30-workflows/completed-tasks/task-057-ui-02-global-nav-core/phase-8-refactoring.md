# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 8                              |
| Phase名      | リファクタリング               |
| 前提Phase    | Phase 7                        |
| 後続Phase    | Phase 9                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-06                     |
| 機能名       | task-057-ui-02-global-nav-core |
| 担当SubAgent | SubAgent-B（UI構造改善）       |

## 目的

Phase 7 で見えた重複、責務混在、スタイル散在、フラグ依存の複雑さを整理し、Step 3 の `AppDock` 削除へ進める構造を整える。

## 背景

段階移行を支える実装は一時的な分岐や互換コードを含むため、Green 状態の直後は構造負債が残りやすい。Phase 8 では SoC を回復しつつ、Step 3 の `AppDock` 削除で破綻しない構造へ再整理する。

## 実行タスク

- 重複除去: `navContract`、`GlobalNavStrip`、`MobileNavBar` の二重定義を除去する。
- レイアウト整理: `App.tsx` と `AppLayout` の責務境界を整え、`DynamicIsland` と main content の配置を固定する。
- Hook 整理: `useNavShortcuts` の cleanup、依存配列、戻る操作を整理する。
- 削除準備: Step 3 の `AppDock` 削除に向けて依存参照を洗い出し、削除順序を確定する。

## 参照資料

| 参照資料                   | パス                                                 | 内容                       |
| -------------------------- | ---------------------------------------------------- | -------------------------- |
| Phase 1仕様                | `phase-1-requirements.md`                            | 要件基準                   |
| Phase 2仕様                | `phase-2-design.md`                                  | 設計基準                   |
| Phase 5仕様                | `phase-5-implementation.md`                          | 実装内容                   |
| Phase 6仕様                | `phase-6-test-expansion.md`                          | 回帰とアクセシビリティ観点 |
| Phase 7仕様                | `phase-7-coverage-check.md`                          | 改善入力                   |
| 要件成果物                 | `outputs/phase-1/requirements-definition.md`         | 要件との整合確認           |
| 設計成果物                 | `outputs/phase-2/architecture-design.md`             | 責務境界の正本             |
| テスト拡充レポート         | `outputs/phase-6/test-expansion-report.md`           | 改善対象                   |
| カバレッジギャップ分析     | `outputs/phase-7/coverage-gap-analysis.md`           | 改善対象                   |
| 契約一致チェック           | `outputs/phase-7/contract-parity-checklist.md`       | 重複とズレ                 |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`          | 実装結果                   |
| ロールバック手順確認       | `outputs/phase-5/rollback-checklist.md`              | Step 3 削除条件            |
| 変更ファイル一覧           | `outputs/phase-5/changed-files-list.md`              | Phase 5 成果物             |
| ブランチ変更反映マトリクス | `outputs/phase-5/branch-change-reflection-matrix.md` | Phase 5 成果物             |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                 | Phase 7 成果物             |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                         | 内容                               |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 依存方向と責務分離                 |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | Renderer 全体の責務再配置          |
| ナビゲーション仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | 導線正本                           |
| 状態管理仕様         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | selector と Slice 境界             |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント粒度                 |
| UIポータル仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md` | More メニューと overlay の責務維持 |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 退避経路と fallback                |

## 実行手順

### ステップ1: 重複棚卸し

契約、スタイル、レイアウト、Hook の重複箇所を一覧化する。

### ステップ2: 改善実施

重複除去、責務分離、命名整理、コメント整理を順番に実施する。

### ステップ3: 回帰確認

Phase 7 で確認したカバレッジ対象が維持されているかを再確認する。

## TDD検証

| 観点     | Refactor 条件                                 | 戻り先  |
| -------- | --------------------------------------------- | ------- |
| 責務分離 | 挙動変更なしで重複と責務混在を減らす          | Phase 2 |
| 導線維持 | `navContract` と UI 表示の整合を壊さない      | Phase 5 |
| 状態管理 | selector と hook の公開契約を変えずに整理する | Phase 5 |
| 削除準備 | `AppDock` 削除前提の依存洗い出しを完了する    | Phase 7 |

## 統合テスト連携

| 観点     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| UI接続   | レイアウト整理後も `GlobalNavStrip` / `MobileNavBar` が同じ導線を維持する |
| 状態接続 | Hook と selector の責務境界を維持する                                     |
| 移行接続 | Step 3 の削除準備がテスト前提を壊していないことを確認する                 |
| 回帰接続 | Phase 7 のギャップ対象を改善後に再確認する                                |

## 成果物

| 成果物                   | パス                                           | 内容                    |
| ------------------------ | ---------------------------------------------- | ----------------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`        | 改善内容                |
| 差分要約                 | `outputs/phase-8/refactor-diff-summary.md`     | Before / After          |
| 削除準備チェックリスト   | `outputs/phase-8/appdock-removal-readiness.md` | Step 3 に向けた準備状況 |
| 技術負債整理             | `outputs/phase-8/technical-debt-register.md`   | 残課題                  |

## 依存関係

| 区分         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 入力依存     | Phase 5 の実装結果と Phase 7 のギャップ分析が改善対象を決める                |
| 並列調整     | SubAgent-B が構造改善を主担当し、SubAgent-C は回帰維持観点を提供する         |
| 後続引き渡し | Phase 9 は本Phaseの整理結果を前提に QA を実施し、Step 3 の削除準備を判定する |

## 完了条件

- [x] 契約とレイアウトの重複箇所が一覧化され、改善済みである
- [x] `App.tsx` と `AppLayout` の責務境界が記録されている
- [x] `AppDock` 削除準備の依存参照一覧が完成している
- [x] 改善後もテスト前提が維持される確認結果が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- 改善対象、削除準備、残存技術負債の 3 区分で結果を整理する
- `artifacts.json` に Phase 8 の成果物登録内容を反映する
- 挙動変更を伴う場合はリファクタリングとして扱わず、戻り先 Phase を明記する
- Phase 9 が QA 判定できるように改善後の確認結果を `Phase実行記録` に残す

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                              | 仕様参照先                                          |
| -------------- | ------------------------------------- | --------------------------------------------------- |
| アーキテクチャ | 本Phaseの主目的のため適用             | `aiworkflow-requirements: architecture-*.md`        |
| UI/UX          | レイアウト整理を扱うため適用          | `aiworkflow-requirements: ui-ux-*.md`               |
| 状態管理       | Hook と selector の整理を扱うため適用 | `aiworkflow-requirements: arch-state-management.md` |
| テスタビリティ | 改善後の回帰維持を扱うため適用        | `aiworkflow-requirements: quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. 重複除去
3. レイアウト整理
4. Hook 整理
5. 削除準備

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスへ出力
- [x] 完了条件のチェックを更新

## Phase実行記録

### 実行タスク結果

| タスク         | 結果      | 備考                    |
| -------------- | --------- | ----------------------- |
| 重複除去       | completed | outputs/phase-8/ を参照 |
| レイアウト整理 | completed | outputs/phase-8/ を参照 |
| Hook 整理      | completed | outputs/phase-8/ を参照 |
| 削除準備       | completed | outputs/phase-8/ を参照 |

### 発見事項

- 良かった点: 責務境界の整理と AppDock 削除 readiness の切り分けを outputs/phase-8/ に残せた。
- 問題点: Step 3 readiness は記録済みでも本文仕様書が pending で、改善完了の見通しが悪かった。
- 次Phaseへの引き継ぎ: Phase 9 は outputs/phase-8/ の改善結果と技術負債整理を QA 入力として扱う。

## 次のPhase

Phase 9: 品質保証
