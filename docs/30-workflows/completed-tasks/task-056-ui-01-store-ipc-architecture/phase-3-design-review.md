# Phase 3: 設計レビューゲート

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 3                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

設計の欠陥を実装前に除去し、Gate判定を記録する。

## 実行タスク

- 設計レビュー実施: Store/IPC/Preload/ViewTypeの整合性をレビューする。
- リスク評価: P31/P42/P44/P45再発リスクを評価する。
- Gate判定: MAJOR/MINOR/APPROVEDの判定と対処方針を記録する。

## 参照資料

| 資料名          | パス                                                                                        | 説明             |
| --------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1仕様     | `phase-1-requirements.md`                                                                   | 要件再確認       |
| Phase 2仕様     | `phase-2-design.md`                                                                         | 設計レビュー対象 |
| Phase 2成果物   | `outputs/phase-2/architecture-design.md`                                                    | 設計根拠         |
| レビュー基準    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`              | Gate判定基準     |
| 実装パターン    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装可能性確認   |
| IPC契約チェック | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約ドリフト防止 |

## 統合テスト連携

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| 事前固定項目 | Red対象テストケース一覧                             |
| レビュー対象 | Store Slice単体、IPC Handler単体、Preload allowlist |
| Gate通過条件 | Phase 4テストケースが全要件をカバーする             |

## 成果物

| 成果物           | パス                                                             | 説明                               |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                        | 判定と指摘一覧                     |
| リスク登録簿     | `outputs/phase-3/risk-register.md`                               | リスクと対策                       |
| スキル準拠監査   | `outputs/phase-3/task-specification-creator-compliance-audit.md` | task-specification-creator準拠結果 |
| 多角思考監査     | `outputs/phase-3/multi-thinking-consistency-audit.md`            | 矛盾・漏れ・依存関係の統合監査     |

## 完了条件

- [ ] レビュー観点を全件確認した
- [ ] MAJOR/MINORの判定を記録した
- [ ] Phase 4で実施する修正タスクを確定した
- [ ] Gate結果を成果物へ反映した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 4: テスト作成

## 実行手順

### ステップ1: 参照資料確認

本Phaseの参照資料を確認し、前提条件を固定する。

### ステップ2: 実行タスク実施

`実行タスク` に記載した項目を順番に実行し、結果を成果物に記録する。

### ステップ3: 成果物検証

成果物の配置と内容を確認し、完了条件をチェックする。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                                                   |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| セキュリティ       | IPC/入力検証を含むため適用                   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| UI/UX              | ViewType/AppDock/App遷移を含むため適用       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      |
| アーキテクチャ     | Store/IPC/Preload層変更を含むため適用        | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| API設計            | IPC契約変更を含むため適用                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        |
| エラーハンドリング | Handlerエラー応答を含むため適用              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| テスト品質         | テスト追加/拡充/カバレッジ確認を含むため適用 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新（Phase 1〜11）
4. 成果物の出力
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物を指定パスへ出力
- [ ] 完了条件のチェックを更新
