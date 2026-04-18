# Phase 12: Documentation Changelog

## 作成日

2026-04-18

---

## 変更サマリ

| ファイル                                                  | 変更種別 | baseline（変更前）                                       | current（変更後）                                                               |
| --------------------------------------------------------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`           | 修正     | `cancelGeneration` インターフェース未定義・実装なし      | インターフェース定義済み + `safeInvoke` 経由の実装追加（396 行・726-727 行）    |
| `apps/desktop/src/preload/channels.ts`                    | 修正     | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` なし | `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` 追加（716 行） |
| `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`  | 修正     | fire-and-forget の `void` cancel 通知                    | `Promise<void>` で await 可能な cancel 通知へ統一                               |
| `docs/30-workflows/p02-seq-CANCEL-002/`                   | 修正     | validator FAIL / stale current facts / parity 欠落       | 必須セクション補完・Phase 11 補助成果物追加・mirror inventory 同期              |
| `docs/30-workflows/completed-tasks/TASK-SW-CANCEL-002.md` | 修正     | `status: open`・旧 workflow path                         | `completed`・現行 workflow path へ同期                                          |

---

## 変更内容詳細

### skill-creator-api.ts（インターフェース追加）

- **変更前**: `SkillCreatorAPI` インターフェースに `cancelGeneration` プロパティが存在しなかった
- **変更後**: `cancelGeneration: () => Promise<IpcResult<void>>` をインターフェースに追加
- **目的**: Renderer 側から型安全に `cancelGeneration()` を呼び出せるようにする

### skill-creator-api.ts（実装追加）

- **変更前**: `cancelGeneration` の実装なし
- **変更後**: `cancelGeneration: (): Promise<IpcResult<void>> => safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を追加
- **目的**: `safeInvoke` パターンに統一し、IPC invoke を安全にラップする

### channels.ts（ホワイトリスト登録）

- **変更前**: `ALLOWED_INVOKE_CHANNELS` に `"skill-creator:cancel"` 相当のエントリなし
- **変更後**: `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を `ALLOWED_INVOKE_CHANNELS` に追加（716 行）
- **目的**: Preload セキュリティゲートを通過できるチャンネルとして `SKILL_CREATOR_CANCEL` を正式認可する

### useCancelGeneration.ts（cancel await 契約の統一）

- **変更前**: `cancelGeneration()` が `void` を返し、IPC 通知は fire-and-forget
- **変更後**: `cancelGeneration(): Promise<void>` に統一し、Main 側通知を await 可能にした
- **目的**: lessons learned と実装契約の drift を解消し、将来の race 条件を減らす

---

## 変更理由

- スキル生成キャンセル機能の実装において、Preload 層（層2）の API を整備する必要があった
- `safeInvoke` パターンに統一することで、他のスキル Creator API メソッドと一貫した実装スタイルを維持できる
- `ALLOWED_INVOKE_CHANNELS` への登録は Electron のセキュリティモデル上必須であり、未登録のままでは invoke がブロックされる
- close-out workflow は validator で FAIL していたため、文書構造・mirror parity・ledger 同期の是正が必要だった

---

## 後続タスクとの関係

| タスク     | 内容                                             | 本変更との関係                            |
| ---------- | ------------------------------------------------ | ----------------------------------------- |
| CANCEL-003 | Main ハンドラー追加（ipcMain.handle）            | 本変更で用意した Preload API の呼び出し先 |
| CANCEL-004 | Renderer フック修正（cancelGeneration 呼び出し） | 本変更で追加した API の利用側             |

---

## MINOR 残存

| MINOR ID    | 内容                           | 状態                    |
| ----------- | ------------------------------ | ----------------------- |
| CANCEL-M-01 | channels.ts:715 コメント drift | current-turn で解消済み |
