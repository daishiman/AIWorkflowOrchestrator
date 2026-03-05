# Phase 5: 実装

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 5                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

Phase 4のRedテストをGreenへ進め、Store/IPC/Preload/ViewTypeの実装を完了する。

## 実行タスク

- Store実装: `notificationSlice.ts` と `historySearchSlice.ts` を追加し、`store/index.ts` に統合する。
- IPC実装: `notificationHandlers.ts` と `historySearchHandlers.ts` を追加し、`main/ipc/index.ts` に登録する。
- IPCセキュリティ実装: 上記ハンドラに `validateIpcSender` とエラーサニタイズを適用し、`security-electron-ipc.md` に準拠させる。
- Preload実装: `preload/channels.ts`, `preload/types.ts`, `preload/index.ts` を拡張する。
- ViewType実装: `store/types.ts`, `App.tsx`, `AppDock` を更新して新Viewを遷移可能にする。

## 参照資料

| 資料名             | パス                                                                             | 説明               |
| ------------------ | -------------------------------------------------------------------------------- | ------------------ |
| Phase 4仕様        | `phase-4-test-creation.md`                                                       | Red基準            |
| テスト仕様成果物   | `outputs/phase-4/test-specification.md`                                          | 実装対象           |
| IPC契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`            | 契約順守           |
| API一覧            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`             | チャネル命名・分類 |
| IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`     | sender検証         |
| 入力検証仕様       | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | P42三段検証        |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | Slice構成          |
| UI遷移仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`          | View導線           |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`            | エラー応答契約     |

## 統合テスト連携

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 統合対象     | Store更新、IPC呼び出し、View遷移                             |
| 実行コマンド | `pnpm --filter @repo/desktop exec vitest run <対象ファイル>` |
| 成功判定     | Phase 4で作成したテストがGreenになる                         |

## 成果物

| 成果物           | パス                                                 | 説明                           |
| ---------------- | ---------------------------------------------------- | ------------------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`          | 実装内容と判断理由             |
| 変更ファイル一覧 | `outputs/phase-5/changed-files-list.md`              | 変更対象の台帳                 |
| 反映マトリクス   | `outputs/phase-5/branch-change-reflection-matrix.md` | ブランチ変更と仕様反映の対応表 |

## 完了条件

- [ ] RedテストがGreenへ遷移した
- [ ] 新規SliceとIPCハンドラーを追加した
- [ ] Preload APIと型定義を同期した
- [ ] ViewType拡張をルーティングへ反映した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充

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
