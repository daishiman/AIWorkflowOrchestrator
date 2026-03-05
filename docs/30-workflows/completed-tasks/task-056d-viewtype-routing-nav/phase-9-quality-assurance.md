# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 9                              |
| Phase名      | 品質保証                       |
| 前提Phase    | Phase 5                        |
| 後続Phase    | Phase 10                       |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-C                     |

## 目的

本タスクの品質判定基準を定義し、実装完了時に同じ基準で合否判定できる状態を作る。

## 実行タスク

- 品質チェックリスト作成: 機能、型、安全性、可観測性の観点を定義する。
- セキュリティ検証計画作成: ナビトリガー連携時の境界検証計画を定義する。
- ゲート条件固定: Phase 10で再利用するGo条件を定義する。

## 参照資料

| 参照資料         | パス                                                                         | 内容           |
| ---------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 5仕様      | `phase-5-implementation.md`                                                  | 実装計画       |
| Phase 7仕様      | `phase-7-coverage-check.md`                                                  | カバレッジ条件 |
| Phase 8仕様      | `phase-8-refactoring.md`                                                     | 改善条件       |
| カバレッジ判定   | `outputs/phase-7/coverage-gate-result.md`                                    | 閾値           |
| 契約一致チェック | `outputs/phase-8/contract-consistency-check.md`                              | 一致条件       |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | QA基準         |
| セキュリティ正本 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 境界要件       |

## システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                         | 内容               |
| ------------ | ---------------------------------------------------------------------------- | ------------------ |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テスト・品質ゲート |
| セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC境界            |
| エラー仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 失敗時分類         |
| UIナビ       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | 導線品質基準       |

## 実行手順

### ステップ1: 品質項目定義

品質判定項目をカテゴリ別に定義する。

### ステップ2: セキュリティ項目定義

ナビ連携とショートカット起点の境界検証項目を定義する。

### ステップ3: ゲート条件固定

Phase 10へ渡すGo条件、Rework条件を定義する。

## 統合テスト連携

| 観点             | 内容                                 |
| ---------------- | ------------------------------------ |
| 品質連携         | Phase 4-7で定義したTC-IDと結び付ける |
| セキュリティ連携 | 失敗ケースを異常系試験へ統合する     |
| ゲート連携       | Phase 10判定テーブルへ直接流用する   |

## 成果物

| 成果物               | パス                                          | 内容         |
| -------------------- | --------------------------------------------- | ------------ |
| 品質チェックリスト   | `outputs/phase-9/quality-checklist.md`        | QA観点       |
| セキュリティ検証計画 | `outputs/phase-9/security-validation-plan.md` | 境界検証観点 |

## 完了条件

- [x] 品質判定項目がカテゴリ別に定義されている
- [x] セキュリティ検証項目が定義されている
- [x] Phase 10へ引き渡す判定条件が定義されている
- [x] 指標と根拠資料の対応が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 10: 最終レビューゲート

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断               | 仕様参照先                                         |
| ------------------ | ---------------------- | -------------------------------------------------- |
| セキュリティ       | 境界検証を扱うため適用 | `aiworkflow-requirements: security-*.md`           |
| テスタビリティ     | 判定指標を扱うため適用 | `aiworkflow-requirements: quality-requirements.md` |
| エラーハンドリング | 失敗分類を扱うため適用 | `aiworkflow-requirements: error-handling.md`       |

## サブタスク管理

1. 参照資料の確認
2. 品質項目定義
3. セキュリティ項目定義
4. ゲート条件固定
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
