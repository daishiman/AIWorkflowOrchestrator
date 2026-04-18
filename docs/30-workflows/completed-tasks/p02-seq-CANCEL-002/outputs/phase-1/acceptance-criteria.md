# Phase 1: 受け入れ基準書 (acceptance-criteria)

## 作成日

2026-04-18

---

## 受け入れ基準一覧

| AC番号 | 基準                                                                                                                                       | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| AC-1   | `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が定義されていること                               | 必須   |
| AC-2   | `skillCreatorAPI` 実装オブジェクトの `cancelGeneration` が `safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出すこと | 必須   |
| AC-3   | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` の値が `"skill-creator:cancel"` であること                                                             | 必須   |
| AC-4   | `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が含まれること                                                            | 必須   |

---

## AC-1 詳細定義

**基準**: `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が定義されていること

### 検証方法

| 手順 | 内容                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------- |
| 1    | `apps/desktop/src/preload/skill-creator-api.ts` を開く                                          |
| 2    | `export interface SkillCreatorAPI { ... }` ブロック内に `cancelGeneration` が存在することを確認 |
| 3    | 型シグネチャが `() => Promise<IpcResult<void>>` であることを確認                                |
| 4    | `tsc --noEmit` でコンパイルエラーがないことを確認                                               |

### 合格条件

- `SkillCreatorAPI` インターフェース内に `cancelGeneration` メソッドシグネチャが存在する
- 引数なし（`void` 引数）で `Promise<IpcResult<void>>` を返す型定義である
- TypeScript 型チェックがエラーなしでパスする

### 不合格条件

- `cancelGeneration` がインターフェースに存在しない
- 型シグネチャが `IpcResult<void>` 以外の型を使用している
- TypeScript 型エラーが発生している

---

## AC-2 詳細定義

**基準**: `skillCreatorAPI` 実装オブジェクトの `cancelGeneration` が `safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出すこと

### 検証方法

| 手順 | 内容                                                                                        |
| ---- | ------------------------------------------------------------------------------------------- |
| 1    | `apps/desktop/src/preload/skill-creator-api.ts` の `skillCreatorAPI` オブジェクト定義を確認 |
| 2    | `cancelGeneration` プロパティが `safeInvoke<IpcResult<void>>` を使用していることを確認      |
| 3    | 引数として `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が渡されていることを確認                     |
| 4    | 他の `safeInvoke` 呼び出しパターン（例: `detectMode`）と比較して一貫性を確認                |

### 合格条件

- `skillCreatorAPI.cancelGeneration` が `safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出している
- 追加の引数（`...args`）を渡していない（引数なしキャンセル操作）
- arrow function 形式 `(): Promise<IpcResult<void>> => safeInvoke<IpcResult<void>>(...)` で定義されている

### 不合格条件

- `safeInvoke` 以外の方法（例: 直接 `ipcRenderer.invoke`）でチャンネルを呼び出している
- 型引数が省略されている（型推論に依存した実装）
- `IPC_CHANNELS.SKILL_CREATOR_CANCEL` 以外のリテラル文字列 `"skill-creator:cancel"` を直書きしている

---

## AC-3 詳細定義

**基準**: `IPC_CHANNELS.SKILL_CREATOR_CANCEL` の値が `"skill-creator:cancel"` であること

### 検証方法

| 手順 | 内容                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| 1    | `apps/desktop/src/preload/channels.ts` を開く                                                    |
| 2    | `IPC_CHANNELS` オブジェクト内の `SKILL_CREATOR_CANCEL` キーを確認                                |
| 3    | 値が文字列リテラル `"skill-creator:cancel"` であることを確認                                     |
| 4    | 他の SKILL_CREATOR 系チャンネルの命名規則（`"skill-creator:<action>"` 形式）と一致することを確認 |

### 合格条件

- `IPC_CHANNELS.SKILL_CREATOR_CANCEL` の値が正確に `"skill-creator:cancel"` である
- 命名規則 `"skill-creator:<action>"` に従っている
- コメントに `TASK-SW-CANCEL-002` のタスク参照が記載されている

### 不合格条件

- 値が `"skill-creator:cancel"` 以外の文字列である
- `SKILL_CREATOR_CANCEL` キーが `IPC_CHANNELS` に存在しない

---

## AC-4 詳細定義

**基準**: `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が含まれること

### 検証方法

| 手順 | 内容                                                                                       |
| ---- | ------------------------------------------------------------------------------------------ |
| 1    | `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` 配列定義を確認         |
| 2    | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` がエントリとして存在することを確認                     |
| 3    | `safeInvoke("skill-creator:cancel")` を呼び出した際にエラーが発生しないことをテストで確認  |
| 4    | `ALLOWED_INVOKE_CHANNELS` の既存エントリ（他チャンネル）が削除・変更されていないことを確認 |

### 合格条件

- `ALLOWED_INVOKE_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が含まれている
- 既存のホワイトリストエントリが維持されている
- `safeInvoke` によるチャンネル呼び出しがホワイトリスト検証をパスする

### 不合格条件

- `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に存在しない
- 既存のホワイトリストエントリが削除・変更されている
- `ALLOWED_INVOKE_CHANNELS` が空配列になっている

---

## 追加確認事項

| 項目                      | 内容                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| 既存メソッド回帰なし      | `SkillCreatorAPI` インターフェースの既存メソッド定義が変更されていないこと               |
| TypeScript コンパイル     | `pnpm --filter @repo/desktop typecheck` がエラーなしでパスすること                       |
| Electron コンテキスト分離 | `contextBridge.exposeInMainWorld` 経由で `cancelGeneration` が renderer に公開されること |
| 命名一貫性                | メソッド名 `cancelGeneration` がインターフェース定義・実装で一致していること             |
