# Phase 13: PR作成

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 13                                |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

レビュー依頼に必要な情報を整理し、ユーザー許可後にPR作成へ移行できる状態を作る。

## 実行タスク

- PR本文下書き: 変更概要、テスト結果、影響範囲、スクリーンショットを整理する。
- レビュー観点整理: Store、IPC、Preload、UI導線の確認観点を列挙する。
- 実行制約確認: コミットとPR作成はユーザー明示許可が出るまで実行しない。

## 参照資料

| 資料名             | パス                               | 説明                 |
| ------------------ | ---------------------------------- | -------------------- |
| Phase 1仕様        | `phase-1-requirements.md`          | 要件根拠             |
| Phase 2仕様        | `phase-2-design.md`                | 設計根拠             |
| Phase 5仕様        | `phase-5-implementation.md`        | 実装根拠             |
| Phase 6仕様        | `phase-6-test-expansion.md`        | テスト根拠           |
| Phase 7仕様        | `phase-7-coverage-check.md`        | カバレッジ根拠       |
| Phase 8仕様        | `phase-8-refactoring.md`           | リファクタ根拠       |
| Phase 9仕様        | `phase-9-quality-assurance.md`     | QA根拠               |
| Phase 10仕様       | `phase-10-final-review.md`         | 最終レビュー根拠     |
| Phase 11仕様       | `phase-11-manual-test.md`          | 手動テスト根拠       |
| Phase 12仕様       | `phase-12-documentation.md`        | ドキュメント同期根拠 |
| PRテンプレート規約 | `.github/pull_request_template.md` | PR本文構造           |

## 成果物

| 成果物           | パス                                      | 説明                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| PR下書き         | `outputs/phase-13/pr-description.md`      | PR本文テンプレート適用結果 |
| レビュー依頼メモ | `outputs/phase-13/review-request-note.md` | 確認観点一覧               |

## 完了条件

- [ ] PR本文下書きを作成した
- [ ] レビュー観点を整理した
- [ ] コミット/PR実行制約を明記した
- [ ] ユーザー明示許可待ち状態を記録した
- [ ] 本Phase内の全タスクを100%実行完了

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
