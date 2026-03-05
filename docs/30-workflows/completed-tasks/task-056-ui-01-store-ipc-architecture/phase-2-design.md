# Phase 2: 設計

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 2                                 |
| 機能名   | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 作成日   | 2026-03-05                        |

## 目的

Phase 1で固定した要件を、Store構造・IPC契約・Preload公開面へ具体化する。

## 実行タスク

- Store設計: `notificationSlice` と `historySearchSlice` の責務、状態、アクション、セレクタを定義する。
- IPC契約設計: `notification:*` と `history:*` チャネルの引数型と戻り値型を定義する。
- Preload設計: `safeInvoke` と `safeOn` を使う公開API面を定義する。
- ViewType拡張設計: `workspace`, `skillCenter`, `historySearch` を追加した遷移表を作成する。

## 参照資料

| 資料名                   | パス                                                                              | 説明                |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------- |
| Phase 1仕様              | `phase-1-requirements.md`                                                         | 要件定義            |
| 要件定義成果物           | `outputs/phase-1/requirements-definition.md`                                      | 要件詳細            |
| 状態管理パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`      | Slice実装規約       |
| 状態管理詳細             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | セレクタ分離        |
| IPC API仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | invoke/on契約       |
| API一覧                  | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | IPCチャネル命名規約 |
| インターフェース仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型同期の基準        |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | Preload公開原則     |
| IPCセキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証順序      |
| 入力検証仕様             | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`  | P42三段検証         |

## 統合テスト連携

| 項目                   | 内容                                                         |
| ---------------------- | ------------------------------------------------------------ |
| 設計対象の統合ポイント | `store/index.ts`, `preload/channels.ts`, `main/ipc/index.ts` |
| テスト連携条件         | すべての新規チャネルに成功系と異常系を用意する               |
| 連携先Phase            | Phase 4でテスト仕様化、Phase 5で実装適合確認                 |

## 成果物

| 成果物                 | パス                                                            | 説明                             |
| ---------------------- | --------------------------------------------------------------- | -------------------------------- |
| アーキテクチャ設計書   | `outputs/phase-2/architecture-design.md`                        | 層構造・責務分離                 |
| API仕様書              | `outputs/phase-2/api-specification.md`                          | IPC/Preload契約                  |
| Storeマッピング        | `outputs/phase-2/store-slice-mapping.md`                        | 既存/新規Slice対応               |
| 仕様抽出マトリクス     | `outputs/phase-2/aiworkflow-requirements-extraction-matrix.md`  | aiworkflow仕様の抽出結果と適用先 |
| 仕様抽出完全性チェック | `outputs/phase-2/aiworkflow-requirements-completeness-check.md` | カテゴリ別の抽出漏れ監査         |

## 完了条件

- [ ] Slice責務と状態モデルを定義した
- [ ] IPC契約表を作成した
- [ ] Preload公開APIを定義した
- [ ] ViewType拡張の遷移表を定義した
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビューゲート

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
