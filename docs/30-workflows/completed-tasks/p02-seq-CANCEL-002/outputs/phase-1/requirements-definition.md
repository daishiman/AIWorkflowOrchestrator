# Phase 1: 要件定義書 (requirements-definition)

## 作成日

2026-04-18

---

## 1. タスク概要

| 項目         | 内容                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SW-CANCEL-002                                                                                                  |
| タスク名     | skill-creator-cancel-preload-api                                                                                    |
| 対象ファイル | `apps/desktop/src/preload/skill-creator-api.ts`                                                                     |
|              | `apps/desktop/src/preload/channels.ts`                                                                              |
| 目的         | preload層に cancelGeneration メソッドを追加し、SKILL_CREATOR_CANCEL チャンネルを ALLOWED_INVOKE_CHANNELS に登録する |

---

## 2. 対象ファイル現状確認

### 2-1. skill-creator-api.ts の現状

**ファイルパス**: `apps/desktop/src/preload/skill-creator-api.ts`

#### インターフェース定義（行 392〜396）

```typescript
/**
 * 現在実行中のスキル生成をキャンセルする
 * @returns キャンセル結果
 */
cancelGeneration: () => Promise<IpcResult<void>>;
```

→ `SkillCreatorAPI` インターフェースの末尾メソッドとして定義済み

#### 実装（行 725〜727）

```typescript
// TASK-SW-CANCEL-002: スキル生成キャンセル
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

→ `skillCreatorAPI` オブジェクトの末尾プロパティとして実装済み

#### safeInvoke パターン（行 400〜404）

```typescript
/**
 * safeInvoke - 許可されたチャンネルのみ invoke を実行（タイムアウト付き）
 */
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}
```

→ `safeInvoke` は内部で `ALLOWED_INVOKE_CHANNELS` ホワイトリストを参照して `invokeWithTimeout` を呼び出す。チャンネルがホワイトリストに存在しない場合はエラーを返す設計。

---

### 2-2. channels.ts の現状

**ファイルパス**: `apps/desktop/src/preload/channels.ts`

#### IPC_CHANNELS 定義（行 366〜367）

```typescript
// TASK-SW-CANCEL-002: スキル生成キャンセルチャンネル
SKILL_CREATOR_CANCEL: "skill-creator:cancel",
```

→ `IPC_CHANNELS` オブジェクトに `SKILL_CREATOR_CANCEL` 定義済み

#### ALLOWED_INVOKE_CHANNELS 登録（行 715〜716）

```typescript
// Skill Creator cancel channel (TASK-SW-CANCEL-002)
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

→ `ALLOWED_INVOKE_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` 登録済み

---

### 2-3. テストファイルの現状

| テスト対象                                              | 状態       |
| ------------------------------------------------------- | ---------- |
| `cancelGeneration` メソッドのユニットテスト             | **未存在** |
| `SKILL_CREATOR_CANCEL` チャンネルのホワイトリストテスト | **未存在** |

---

## 3. safeInvoke パターン確認

`cancelGeneration` は他の invoke 系メソッドと同一パターンで実装されている。

| メソッド例         | safeInvoke 呼び出しパターン                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `detectMode`       | `safeInvoke<IpcResult<SkillCreatorMode>>(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, request)` |
| `cancelGeneration` | `safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)`                           |

**特記事項**: `cancelGeneration` は引数を取らない（`void` 引数）。これはキャンセル操作の性質上、追加情報を必要としないためである。

---

## 4. 機能要件

| 要件ID | 内容                                                                                                                                       | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-1   | `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が定義されること                                   | 必須   |
| FR-2   | `skillCreatorAPI` 実装オブジェクトの `cancelGeneration` が `safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出すこと | 必須   |
| FR-3   | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が `"skill-creator:cancel"` の値で定義されること                                                       | 必須   |
| FR-4   | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` に含まれること                                                            | 必須   |
| FR-5   | `cancelGeneration` の戻り値型が `Promise<IpcResult<void>>` であること                                                                      | 必須   |

---

## 5. 非機能要件

| 要件ID | 内容                                                                          | 優先度 |
| ------ | ----------------------------------------------------------------------------- | ------ |
| NFR-1  | 既存の `SkillCreatorAPI` インターフェースの他メソッドに影響を与えないこと     | 必須   |
| NFR-2  | `ALLOWED_INVOKE_CHANNELS` の既存エントリを削除・変更しないこと                | 必須   |
| NFR-3  | Electron セキュリティモデルを遵守すること（ホワイトリスト経由の通信のみ許可） | 必須   |
| NFR-4  | TypeScript 型安全性を維持すること（`any` 型の使用禁止）                       | 必須   |
| NFR-5  | `safeInvoke` パターンの一貫性を維持すること（他メソッドと同一実装スタイル）   | 推奨   |

---

## 6. 変更スコープ確定

| ファイル                                        | 変更種別 | 変更内容                                                     |
| ----------------------------------------------- | -------- | ------------------------------------------------------------ |
| `apps/desktop/src/preload/skill-creator-api.ts` | 追加済み | `cancelGeneration` インターフェース定義 + 実装               |
| `apps/desktop/src/preload/channels.ts`          | 追加済み | `SKILL_CREATOR_CANCEL` 定義 + `ALLOWED_INVOKE_CHANNELS` 登録 |
| テストファイル（新規作成対象）                  | 未実装   | `cancelGeneration` および ALLOWED_INVOKE_CHANNELS のテスト   |

**確認結論**: コード実装は完了済み。テストファイルのみ未作成。

---

## 7. 依存関係

| 依存先                                | 種別     | 内容                                        |
| ------------------------------------- | -------- | ------------------------------------------- |
| `invokeWithTimeout`（`ipc-utils.ts`） | 内部依存 | `safeInvoke` の実体。タイムアウト制御を担う |
| `ALLOWED_INVOKE_CHANNELS`             | 内部依存 | `safeInvoke` がホワイトリスト検証に使用する |
| `IPC_CHANNELS.SKILL_CREATOR_CANCEL`   | 内部依存 | チャンネル名の定数参照                      |
| `IpcResult<void>`（shared/types）     | 型依存   | 戻り値型の定義元                            |
