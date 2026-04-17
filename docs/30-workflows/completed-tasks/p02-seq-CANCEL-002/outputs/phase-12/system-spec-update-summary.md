# システム仕様更新サマリー: TASK-SW-CANCEL-002

## メタ情報

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| タスクID | TASK-SW-CANCEL-002                                      |
| 機能名   | skill-creator-cancel-preload-api                        |
| 更新日   | 2026-04-15                                              |
| 担当層   | IPC 4層のうち 層2（ホワイトリスト）・層4（Preload API） |

---

## 1. 変更の概要

TASK-SW-CANCEL-002 では、スキル生成キャンセル機能を実現する IPC 通信パイプラインの一部として、Preload 層（層4）とホワイトリスト（層2）の実装を完了しました。

---

## 2. skillCreatorAPI.cancelGeneration() の追加

### 変更ファイル

`apps/desktop/src/preload/skill-creator-api.ts`

### 変更内容

#### SkillCreatorAPI インターフェースへのメソッド追加

```typescript
/**
 * TASK-SW-CANCEL-002: スキル生成をキャンセルする
 * Main プロセスの cancelCurrentOperation() を IPC 経由で呼び出す
 */
cancelGeneration: () => Promise<IpcResult<void>>;
```

#### skillCreatorAPI オブジェクトへの実装追加

```typescript
// TASK-SW-CANCEL-002: スキル生成キャンセル
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

### 動作仕様

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| 呼び出し方法 | `window.skillCreatorAPI.cancelGeneration()`                    |
| 引数         | なし                                                           |
| 戻り値       | `Promise<IpcResult<void>>`                                     |
| 内部処理     | `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出す     |
| セキュリティ | `ALLOWED_INVOKE_CHANNELS` チェックを通過した場合のみ実行される |

---

## 3. ALLOWED_INVOKE_CHANNELS への SKILL_CREATOR_CANCEL 追加

### 変更ファイル

`apps/desktop/src/preload/channels.ts`

### 変更内容

`ALLOWED_INVOKE_CHANNELS` 配列の Skill Creator channels グループに以下を追加しました。

```typescript
// TASK-SW-CANCEL-002: キャンセルチャンネルをホワイトリストに追加
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

### 追加位置

`IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA` の直後、`IPC_CHANNELS.SKILL_CREATOR_PLAN` の直前。

### 効果

- Renderer プロセスから `skill-creator:cancel` チャンネルへの IPC invoke が許可される
- ホワイトリスト外チャンネルへのアクセスはブロックされるため、セキュリティを維持しつつ機能追加が実現

---

## 4. IPC チャンネル定数について

`SKILL_CREATOR_CANCEL` の実際の文字列値は `shared` パッケージの正本定義から参照されます。

| 定数名                 | 文字列値               | 定義場所                                                       |
| ---------------------- | ---------------------- | -------------------------------------------------------------- |
| `SKILL_CREATOR_CANCEL` | `skill-creator:cancel` | `packages/shared/src/ipc/channels.ts`（CANCEL-001 で追加済み） |

---

## 5. 変更ファイル一覧

| ファイルパス                                    | 変更種別 | 変更内容                                                             |
| ----------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts` | 修正     | `SkillCreatorAPI` インターフェースと実装に `cancelGeneration` を追加 |
| `apps/desktop/src/preload/channels.ts`          | 修正     | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` を追加           |

---

## 6. 依存関係

| タスク     | 依存の方向 | 内容                                                                   |
| ---------- | ---------- | ---------------------------------------------------------------------- |
| CANCEL-001 | 前提       | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` 定数の定義が完了していること       |
| CANCEL-003 | 後続       | Main ハンドラー（`ipcMain.handle("skill-creator:cancel", ...)`）の実装 |
| CANCEL-004 | 後続       | Renderer フック（`useCancelGeneration`）の実装                         |

---

## 7. 完了ステータス

| 確認項目                                                                   | 状態 |
| -------------------------------------------------------------------------- | ---- |
| `cancelGeneration` メソッドが `SkillCreatorAPI` インターフェースに定義済み | 完了 |
| `cancelGeneration` メソッドが `skillCreatorAPI` オブジェクトに実装済み     | 完了 |
| `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に追加済み             | 完了 |
| 型エラーなし                                                               | 完了 |
| 既存テストへの影響なし                                                     | 完了 |
