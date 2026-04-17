# ドキュメント更新履歴: TASK-SW-CANCEL-002

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | TASK-SW-CANCEL-002               |
| 機能名   | skill-creator-cancel-preload-api |
| 作成日   | 2026-04-15                       |

---

## 変更履歴

### 2026-04-15: cancelGeneration Preload API 追加・ホワイトリスト登録（CANCEL-002）

#### 変更種別

機能追加（IPC Preload 層）

#### 変更概要

スキル生成キャンセル機能の IPC パイプラインを構築するため、Preload 層（層4）とホワイトリスト（層2）を実装しました。

#### 影響ファイル

| ファイルパス                                    | 変更種別 | 変更内容                                                                                |
| ----------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts` | 修正     | `cancelGeneration: () => Promise<IpcResult<void>>` をインターフェースと実装の両方に追加 |
| `apps/desktop/src/preload/channels.ts`          | 修正     | `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を追加                 |

#### 変更詳細

**`apps/desktop/src/preload/skill-creator-api.ts`**

- `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` を追加
- `skillCreatorAPI` 実装オブジェクトに `cancelGeneration: (): Promise<IpcResult<void>> => safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を追加

**`apps/desktop/src/preload/channels.ts`**

- `ALLOWED_INVOKE_CHANNELS` 配列の Skill Creator channels グループ内に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を追加
- コメント `// TASK-SW-CANCEL-002: キャンセルチャンネルをホワイトリストに追加` を付与

#### 関連タスク

| タスクID   | 関連内容                                                               |
| ---------- | ---------------------------------------------------------------------- |
| CANCEL-001 | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` 定数の追加（前提タスク、完了済み） |
| CANCEL-002 | 本タスク（完了）                                                       |
| CANCEL-003 | Main ハンドラー追加（後続タスク）                                      |
| CANCEL-004 | Renderer フック実装（後続タスク）                                      |

#### 動作への影響

- `skillCreatorAPI.cancelGeneration()` を呼び出せるようになった
- ただし CANCEL-003（Main ハンドラー）が未実装のため、現時点では呼び出してもタイムアウトする
- 既存機能への後退はなし

#### 破壊的変更

なし。既存のインターフェースへのメソッド追加のみで、既存メソッドの変更・削除は行っていない。

---

## 過去の関連変更履歴

### 2026-04-14: SKILL_CREATOR_CANCEL チャンネル定数の追加（CANCEL-001）

| ファイルパス                                           | 変更内容                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`（推定）          | `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を追加       |
| `apps/desktop/src/preload/channels.ts`（IPC_CHANNELS） | `SKILL_CREATOR_CANCEL` を `IPC_CHANNELS` オブジェクトに追加 |

---

## 今後の予定変更

### CANCEL-003 予定（後続タスク）

| ファイルパス                                                  | 予定変更内容                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, ...)` を追加 |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | `cancelCurrentOperation()` メソッドを追加                       |

### CANCEL-004 予定（後続タスク）

| ファイルパス                                             | 予定変更内容                                                |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` | `skillCreatorAPI.cancelGeneration()` を呼び出すフックを実装 |
