# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 10                             |
| Phase名      | 最終レビューゲート             |
| 前提Phase    | Phase 1, Phase 2, Phase 5      |
| 後続Phase    | Phase 11                       |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-C                     |

## 目的

品質保証計画に基づいて最終判定基準を固定し、実装時にGo/No-Goの意思決定を再現できる状態を作る。

## 実行タスク

- 最終判定表作成: PASS/MINOR/MAJOR/CRITICALの判定条件を確定する。
- 再作業方針定義: MAJOR以上の戻り先を定義する。
- 引き継ぎ条件整理: Phase 11へ渡す検証必須項目を固定する。

## 参照資料

| 参照資料           | パス                                                                           | 内容         |
| ------------------ | ------------------------------------------------------------------------------ | ------------ |
| Phase 1仕様        | `phase-1-requirements.md`                                                      | 要件基準     |
| Phase 2仕様        | `phase-2-design.md`                                                            | 設計基準     |
| Phase 5仕様        | `phase-5-implementation.md`                                                    | 実装計画     |
| Phase 9仕様        | `phase-9-quality-assurance.md`                                                 | QA基準       |
| 品質チェックリスト | `outputs/phase-9/quality-checklist.md`                                         | 判定材料     |
| セキュリティ計画   | `outputs/phase-9/security-validation-plan.md`                                  | 境界判定材料 |
| レビュー基準       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | ゲート判定   |
| エラー仕様         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | 失敗分類     |

## システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                         | 内容       |
| ------------ | ---------------------------------------------------------------------------- | ---------- |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | Go判定閾値 |
| UIナビ       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | 導線品質   |
| セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 境界品質   |
| エラー仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 異常分類   |

## 実行手順

### ステップ1: 判定条件整備

Phase 9成果物から判定条件を抽出し、判定表へ統合する。

### ステップ2: 戻り先定義

重大度ごとに戻り先Phaseを定義する。

### ステップ3: 引き継ぎ要件整理

手動検証で必須の観点を確定する。

## 統合テスト連携

| 観点     | 内容                                               |
| -------- | -------------------------------------------------- |
| 判定連携 | Phase 4-7で定義したTC-IDの合否を最終判定へ反映する |
| 証跡連携 | Phase 11で再確認する導線証跡を指定する             |
| 戻り連携 | FAIL条件をPhase 6またはPhase 8へ連携する           |

## 成果物

| 成果物             | パス                                      | 内容     |
| ------------------ | ----------------------------------------- | -------- |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md` | 判定表   |
| 再作業意思決定ログ | `outputs/phase-10/rework-decision-log.md` | 戻り条件 |

## 完了条件

- [x] 判定表が4段階で定義されている
- [x] 戻り先条件が問題種別ごとに定義されている
- [x] Phase 11引き継ぎ観点が固定されている
- [x] 判定根拠が参照資料と結び付いている
- [x] 本Phase内の全タスクを100%実行完了

## レビューゲート（Phase 10）

### レビュー結果判定

| 判定     | 条件             | 次のアクション             |
| -------- | ---------------- | -------------------------- |
| PASS     | 必須項目を満たす | Phase 11へ進む             |
| MINOR    | 軽微課題のみ     | 課題記録後にPhase 11へ進む |
| MAJOR    | 重大課題あり     | Phase 8へ戻る              |
| CRITICAL | 契約破綻あり     | Phase 1へ戻る              |

### 戻り先決定基準

| 問題の種類   | 戻り先  |
| ------------ | ------- |
| 要件問題     | Phase 1 |
| 設計問題     | Phase 2 |
| 実装計画問題 | Phase 5 |
| 品質問題     | Phase 8 |

## 次のPhase

Phase 11: 手動テスト検証

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                   | 仕様参照先                                   |
| ------------------ | -------------------------- | -------------------------------------------- |
| セキュリティ       | 最終判定項目に含むため適用 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | 導線品質判定に含むため適用 | `aiworkflow-requirements: ui-ux-*.md`        |
| エラーハンドリング | 重大度判定に含むため適用   | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

1. 参照資料の確認
2. 判定条件整備
3. 戻り先定義
4. 引き継ぎ要件整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
