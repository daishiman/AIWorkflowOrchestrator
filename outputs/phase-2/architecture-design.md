# Phase 2 アーキテクチャ設計書

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-A

## 設計方針

- Design 1: 未タスク参照同期ルールを `task-workflow.md` に集約
- Design 2: 3点同期チェックリストを `phase-11-12-guide.md` に集約
- Design 3: 苦戦箇所→未タスク化3ステップを `phase-templates.md` に明文化
- Design 4: baseline/current 分離監査を `spec-update-workflow.md` に明文化
- Design 5: 検証コマンド順序（verify → generate-index → quick_validate）を `spec-update-workflow.md` に明文化

## 更新対象と責務

| ファイル                  | 設計責務                                   | 対応FR/NFR  |
| ------------------------- | ------------------------------------------ | ----------- |
| `task-workflow.md`        | 未タスク参照同期ルール、完了/残課題整合    | FR-1, NFR-1 |
| `phase-11-12-guide.md`    | 3点同期チェックリスト、記録テンプレート    | FR-2, NFR-3 |
| `phase-templates.md`      | 苦戦箇所0件時記載 + 未タスク化3ステップ    | FR-3        |
| `spec-update-workflow.md` | 検証コマンド順次実行、baseline/current分離 | FR-4, NFR-2 |

## 依存関係

- Phase 1 要件を入力として設計を固定
- 実装（Phase 5）では上記4ファイルを分担更新

## SubAgent分担（設計）

- SubAgent-A: Design 1, 2, 4
- SubAgent-D: Design 3
- SubAgent-B: Design 5の実行順序と異常系整理

## 設計判定

- 設計矛盾: なし
- Phase 3 レビュー入力: 完了
