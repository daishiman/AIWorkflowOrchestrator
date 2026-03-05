# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

Phase 5実装を安全に進めるため、Store/IPC/PreloadのRedテストを先に作成する。

## 実行タスク

- Storeテスト作成: `notificationSlice` と `historySearchSlice` の状態遷移テストを作成する。
- IPCテスト作成: `notificationHandlers` と `historySearchHandlers` の契約テストを作成する。
- Preloadテスト作成: `channels.ts` allowlist と API公開面のテストを作成する。
- View遷移テスト作成: AppDockとAppルーティングで新ViewTypeを検証する。

## 参照資料

| 資料名         | パス                                                                              | 説明             |
| -------------- | --------------------------------------------------------------------------------- | ---------------- |
| Phase 1仕様    | `phase-1-requirements.md`                                                         | 要件参照         |
| Phase 2仕様    | `phase-2-design.md`                                                               | 設計参照         |
| Phase 3仕様    | `phase-3-design-review.md`                                                        | レビュー指摘反映 |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト設計基準   |
| 品質基準       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準   |
| 入力検証仕様   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`  | P42検証観点      |

## 統合テスト連携

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| 実行前提       | Phase 2のIPC契約をテストケースへ反映した状態         |
| 統合テスト対象 | Renderer Store操作 -> Preload invoke -> Main handler |
| 成功判定       | Red失敗理由が仕様要件と一致する                      |

## 成果物

| 成果物        | パス                                    | 説明                 |
| ------------- | --------------------------------------- | -------------------- |
| テスト仕様書  | `outputs/phase-4/test-specification.md` | テストケース一覧     |
| Redテスト計画 | `outputs/phase-4/red-test-list.md`      | 失敗期待値と確認手順 |

## 完了条件

- [ ] Storeテストケースを定義した
- [ ] IPC契約テストケースを定義した
- [ ] Preload allowlistテストケースを定義した
- [ ] Red失敗条件を明文化した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5: 実装

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
