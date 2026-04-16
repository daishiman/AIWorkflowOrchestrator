# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| タスクID   | TASK-SW-CANCEL-001                    |
| 機能名     | skill-creator-cancel-channel-constant |
| 前提Phase  | -                                     |
| 後続Phase  | Phase 2                               |
| 作成日     | 2026-04-15                            |
| ステータス | completed                             |

## 目的

`packages/shared/src/ipc/channels.ts` の現状を確認し、`SKILL_CREATOR_CANCEL` チャンネル定数の追加要件と受け入れ基準を固定する。

## 対象ファイルの現状確認

### 確認対象

- `packages/shared/src/ipc/channels.ts`: `SKILL_CREATOR_RUNTIME_CHANNELS` の現在の定義・命名規則を確認する
- 追加位置（`SKILL_CREATOR_PROGRESS` 等の既存キャンセル関連チャンネルの近くか確認）

### 現状の問題

`useCancelGeneration.ts:30` のコメントには「`AbortController.abort()` でメインプロセス側の処理も中断される」と記載されているが、以下の全層において対応コードが存在しない:

1. `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_CANCEL` チャンネルが存在しない
2. `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に登録がない
3. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` にハンドラーが存在しない
4. `apps/desktop/src/preload/skill-creator-api.ts` に `cancelGeneration` メソッドが存在しない

本タスク（CANCEL-001）では層1の定数追加のみを担当する。

## 要件

### 機能要件

1. `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を追加する
2. 値の文字列は既存のチャンネル命名規則（`"skill-creator:{action}"` 形式）に準拠する
3. 追加後、`IPC_CHANNELS.SKILL_CREATOR_CANCEL` として型安全に参照できる

### 非機能要件

1. 既存テストを壊さない
2. `pnpm typecheck` PASS

## 受け入れ基準

| ID   | 受け入れ基準                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------ |
| AC-1 | `SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_CANCEL` が `"skill-creator:cancel"` として定義されている |
| AC-2 | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` として型安全に参照できる                                           |
| AC-3 | `pnpm typecheck` が PASS する（型エラーなし）                                                          |

## IPC 4層接続における本タスクの位置づけ

| 層  | 担当                               | タスク             | ステータス   |
| --- | ---------------------------------- | ------------------ | ------------ |
| 1   | 定数定義（shared channels.ts）     | TASK-SW-CANCEL-001 | **本タスク** |
| 2   | ホワイトリスト（preload channels） | TASK-SW-CANCEL-002 | 後続         |
| 3   | ハンドラー登録（main ipcMain）     | TASK-SW-CANCEL-003 | 後続         |
| 4   | Preload API（contextBridge）       | TASK-SW-CANCEL-002 | 後続         |
| 5   | Renderer 呼び出し（フック修正）    | TASK-SW-CANCEL-004 | 後続         |

## 統合テスト連携【必須】

| 判定項目                        | 基準     | 結果    |
| ------------------------------- | -------- | ------- |
| AC-1〜AC-3 が全て定義されている | 定義済み | pending |

## 多角的チェック観点（AIが判断）

- [ ] 既存の `SKILL_CREATOR_RUNTIME_CHANNELS` の命名規則と一致しているか
- [ ] `IPC_CHANNELS` への型伝播が自動で行われるか（追加設定不要か）

## サブタスク管理

1. `channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` 現状確認
2. 追加位置の決定（`SKILL_CREATOR_PROGRESS` の近く等）
3. AC-1〜AC-3 を受け入れ基準として確定
4. 要件定義書・受け入れ基準の成果物作成

## 成果物

| 成果物       | パス                                         | 説明                     |
| ------------ | -------------------------------------------- | ------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 要件・背景・対象ファイル |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-3               |

## 完了条件

- [ ] `channels.ts` の現状が確認されている
- [ ] AC-1〜AC-3 が固定されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
