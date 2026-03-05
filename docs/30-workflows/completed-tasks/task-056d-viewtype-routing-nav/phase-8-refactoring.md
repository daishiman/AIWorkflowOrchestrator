# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| Phase        | 8                                           |
| Phase名      | リファクタリング                            |
| 前提Phase    | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |
| 後続Phase    | Phase 9                                     |
| ステータス   | completed                                   |
| 作成日       | 2026-03-05                                  |
| 機能名       | task-056d-viewtype-routing-nav              |
| 担当SubAgent | SubAgent-B                                  |

## 目的

型重複、導線重複、分岐可読性の課題を解消するリファクタ計画を定義し、挙動を変えずに保守性を上げる。

## 実行タスク

- 重複除去計画: AppDock側の重複ViewType定義を除去する計画を定義する。
- 可読性改善計画: `renderView` 分岐とマッピング定義を整理する計画を定義する。
- 契約一致確認: 型契約とナビ契約の一致確認手順を定義する。

## 参照資料

| 参照資料           | パス                                                                                        | 内容           |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1仕様        | `phase-1-requirements.md`                                                                   | 要件基準       |
| Phase 2仕様        | `phase-2-design.md`                                                                         | 設計基準       |
| Phase 5仕様        | `phase-5-implementation.md`                                                                 | 実装計画       |
| Phase 6仕様        | `phase-6-test-expansion.md`                                                                 | 回帰観点       |
| Phase 7仕様        | `phase-7-coverage-check.md`                                                                 | 品質基準       |
| ルーティングマップ | `outputs/phase-5/viewtype-routing-map.md`                                                   | 対象契約       |
| カバレッジ判定     | `outputs/phase-7/coverage-gate-result.md`                                                   | 維持基準       |
| 実装パターン正本   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 可読性パターン |
| 状態管理正本       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 型境界         |

## システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容           |
| ------------ | ------------------------------------------------------------------------------------------- | -------------- |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタ方針 |
| 状態管理     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 型境界保持     |
| UIナビ       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | 導線保持       |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 退行防止       |

## 実行手順

### ステップ1: 重複箇所特定

型定義とナビ定義の重複箇所を列挙する。

### ステップ2: 改善方針定義

重複除去、命名統一、分岐整理の順序を定義する。

### ステップ3: 契約一致チェック定義

リファクタ後も契約一致を判定するチェック手順を定義する。

## 統合テスト連携

| 観点     | 内容                                         |
| -------- | -------------------------------------------- |
| 退行連携 | Phase 6の回帰ケースを再利用する              |
| 契約連携 | ViewType契約とナビ契約の一致確認を再実施する |
| 後続連携 | Phase 9の品質チェック入力に反映する          |

## 成果物

| 成果物           | パス                                            | 内容         |
| ---------------- | ----------------------------------------------- | ------------ |
| リファクタ計画   | `outputs/phase-8/refactoring-plan.md`           | 改善手順     |
| 契約一致チェック | `outputs/phase-8/contract-consistency-check.md` | 一致確認手順 |

## 完了条件

- [x] 重複箇所が一覧化されている
- [x] 改善順序が定義されている
- [x] 退行防止観点が明記されている
- [x] 契約一致チェック手順が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9: 品質保証

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                   | 仕様参照先                                         |
| -------------- | -------------------------- | -------------------------------------------------- |
| アーキテクチャ | 重複除去方針を扱うため適用 | `aiworkflow-requirements: architecture-*.md`       |
| UI/UX          | 導線維持を扱うため適用     | `aiworkflow-requirements: ui-ux-*.md`              |
| テスタビリティ | 退行防止条件を扱うため適用 | `aiworkflow-requirements: quality-requirements.md` |

## サブタスク管理

1. 参照資料の確認
2. 重複箇所特定
3. 改善方針定義
4. 契約一致チェック定義
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
