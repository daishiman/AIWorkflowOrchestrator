# Phase 2 — 設計

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | Phase 1（要件定義完了）             |
| ステータス | completed                           |
| 後続Phase  | Phase 3（設計レビュー）             |

---

## 目的

本Phaseの目的は、既存本文に記載された要件を満たすこと。

## 実行タスク

- 既存本文の手順を実行する。

## 参照資料

- 本ファイル上部のメタ情報
- `index.md`
- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `phase-4-test-creation.md`
- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `phase-7-coverage-check.md`
- `phase-8-refactoring.md`
- `phase-9-quality-assurance.md`
- `phase-10-final-review.md`
- `phase-11-manual-test.md`
- `phase-12-documentation.md`
- `phase-13-pr-creation.md`

## 成果物

- 本Phaseで定義された成果物

## 完了条件

- [x] 既存本文の完了条件をすべて満たす。

## 1. 設計アプローチ

### 方針

**最小変更原則**: `apps/desktop/src/preload/channels.ts` の1ファイルのみを変更する。
ロジックの追加・変更は行わず、ホワイトリスト配列への要素追加のみとする。

### 設計方針の詳細

1. `CHAT_EXPORT_CHANNELS` および `FILE_SYSTEM_CHANNELS` のimportを追加する
2. `IPC_CHANNELS` オブジェクトに `...CHAT_EXPORT_CHANNELS` を追加し、`FILE_SYSTEM_CHANNELS` は `WRITE_FILE` / `READ_FILE` だけを明示追加する
3. `ALLOWED_INVOKE_CHANNELS` に6チャネルを追加する
4. `ALLOWED_ON_CHANNELS` に6チャネルを追加する

> **既存構造の踏襲**: `SKILL_CREATOR_SESSION_CHANNELS` と `SKILL_CREATOR_EXTERNAL_API_CHANNELS` は
> すでに `IPC_CHANNELS` にスプレッド展開済みのため、
> `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` への追加は `IPC_CHANNELS.キー名` 形式で行う。
> `CONFIGURE_API` は preload 側で既登録のため、本タスクの追加対象から除外する。

---

## 2. 変更対象ファイルの詳細

### ファイルパス

```
apps/desktop/src/preload/channels.ts
```

### 現状の問題箇所

#### import文（現状）

```typescript
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  SKILL_CREATOR_OUTPUT_READY,
  SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
  SKILL_CREATOR_OPEN_SKILL,
  SKILL_CREATOR_SESSION_CHANNELS,
  SKILL_CREATOR_RUNTIME_CHANNELS,
  SKILL_CREATOR_VERIFY,
} from "@repo/shared/src/ipc/channels";
```

`CHAT_EXPORT_CHANNELS` と `FILE_SYSTEM_CHANNELS` がimportされていない。

#### IPC_CHANNELS オブジェクト（現状）

`CHAT_EXPORT_CHANNELS` が未反映で、`FILE_SYSTEM_CHANNELS` は `WRITE_FILE` / `READ_FILE` のみを追加する設計にしていない。
そのため、`EXPORT_SESSION`, `PREVIEW_EXPORT`, `WRITE_FILE`, `READ_FILE` の 4 キーが不足している。

#### ALLOWED_INVOKE_CHANNELS（現状の欠落）

以下のチャネルが未登録：

- `chat:exportSession`
- `chat:previewExport`
- `fs:writeFile`
- `fs:readFile`
- `skill-creator:start-session`
- `skill-creator:answer`

`skill-creator:configure-api` は `IPC_CHANNELS.CONFIGURE_API` として既登録であり、
本タスクの missing には含めない。

#### ALLOWED_ON_CHANNELS（現状の欠落）

以下のチャネルが未登録：

- `skill-creator:question-received`
- `skill-creator:session-complete`
- `skill-creator:session-error`
- `skill-creator:external-api-config-required`
- `skill-creator:api-configured`
- `skill-creator:api-test-result`

---

## 3. ALLOWED_INVOKE_CHANNELSへの追加設計

### 追加するimport

```typescript
import {
  APPROVAL_CHANNELS,
  CHAT_EXPORT_CHANNELS, // 追加
  EXECUTION_CHANNELS,
  FILE_SYSTEM_CHANNELS, // 追加
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  SKILL_CREATOR_OUTPUT_READY,
  SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
  SKILL_CREATOR_OPEN_SKILL,
  SKILL_CREATOR_SESSION_CHANNELS,
  SKILL_CREATOR_RUNTIME_CHANNELS,
  SKILL_CREATOR_VERIFY,
} from "@repo/shared/src/ipc/channels";
```

### IPC_CHANNELSへのスプレッド展開追加

`IPC_CHANNELS` オブジェクトの先頭付近（Analytics operations の前後）に追加：

```typescript
export const IPC_CHANNELS = {
  // Chat Export operations (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  ...CHAT_EXPORT_CHANNELS,

  // File System operations (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  WRITE_FILE: FILE_SYSTEM_CHANNELS.WRITE_FILE,
  READ_FILE: FILE_SYSTEM_CHANNELS.READ_FILE,

  // Analytics operations (UT-W3-ANALYTICS-ADAPTER-001)
  ANALYTICS_SEND: "analytics:send",
  // ... 以下既存のまま
```

> **注意**: `FILE_SYSTEM_CHANNELS.SHOW_SAVE_DIALOG` は `"dialog:showSaveDialog"` であり、
> `IPC_CHANNELS.DIALOG_SHOW_SAVE` と同じ文字列値。`FILE_SYSTEM_CHANNELS` を丸ごと spread すると
> 値の重複が増えるため、必要キーだけを追加する方がエレガント。

### ALLOWED_INVOKE_CHANNELSへの追加コード

```typescript
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // Analytics channels (UT-W3-ANALYTICS-ADAPTER-001)
  IPC_CHANNELS.ANALYTICS_SEND,

  // Chat Export channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.EXPORT_SESSION,     // chat:exportSession
  IPC_CHANNELS.PREVIEW_EXPORT,     // chat:previewExport

  // File System channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.WRITE_FILE,         // fs:writeFile
  IPC_CHANNELS.READ_FILE,          // fs:readFile

  IPC_CHANNELS.FILE_GET_TREE,
  // ... 既存のチャネル群 ...

  // Skill Creator channels (TASK-9B-H) の末尾に追加
  // skill-creator:start-session / skill-creator:answer
  IPC_CHANNELS.START_SESSION,      // skill-creator:start-session
  IPC_CHANNELS.ANSWER,             // skill-creator:answer

  // ...
```

> **IPC_CHANNELS.CONFIGURE_API の扱い**: 現状の `ALLOWED_INVOKE_CHANNELS` に
> `IPC_CHANNELS.CONFIGURE_API` が既に存在するため、本タスクでは追加しない。

---

## 4. ALLOWED_ON_CHANNELSへの追加設計

```typescript
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存のチャネル群 ...

  // Skill Creator Session channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.QUESTION_RECEIVED, // skill-creator:question-received
  IPC_CHANNELS.SESSION_COMPLETE, // skill-creator:session-complete
  IPC_CHANNELS.SESSION_ERROR, // skill-creator:session-error
  IPC_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED, // skill-creator:external-api-config-required

  // Skill Creator External API channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.API_CONFIGURED, // skill-creator:api-configured
  IPC_CHANNELS.API_TEST_RESULT, // skill-creator:api-test-result

  // Approval push notification (TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001)
  IPC_CHANNELS.APPROVAL_REQUEST,
];
```

追加位置は `ALLOWED_ON_CHANNELS` 末尾の `IPC_CHANNELS.APPROVAL_REQUEST` の直前が適切。

---

## 5. 事前確認事項

実装前に以下を grep で確認する。

### 5-1. CHAT_EXPORT_CHANNELSのimport確認

```bash
grep -n "CHAT_EXPORT_CHANNELS" apps/desktop/src/preload/channels.ts
```

現状では未import。追加が必要。

### 5-2. FILE_SYSTEM_CHANNELSのimport確認

```bash
grep -n "FILE_SYSTEM_CHANNELS" apps/desktop/src/preload/channels.ts
```

現状では未import。追加が必要。

### 5-3. CONFIGURE_API の既存登録確認

```bash
grep -n "CONFIGURE_API" apps/desktop/src/preload/channels.ts
```

`IPC_CHANNELS.CONFIGURE_API` として `ALLOWED_INVOKE_CHANNELS` に登録済みであることを確認。
登録済みであれば追加不要（重複登録しない）。

### 5-4. SKILL_CREATOR_SESSION_CHANNELS のスプレッド展開確認

```bash
grep -n "SKILL_CREATOR_SESSION_CHANNELS" apps/desktop/src/preload/channels.ts
```

`...SKILL_CREATOR_SESSION_CHANNELS` が `IPC_CHANNELS` に展開済みであることを確認済み（line 337）。
これにより `IPC_CHANNELS.START_SESSION`、`IPC_CHANNELS.ANSWER` 等のキーが使用可能。

---

## 6. 定数キーマッピング表

### ALLOWED_INVOKE_CHANNELSに追加する6チャネル

| IPC_CHANNELSキー | チャネル文字列                | sharedソース                                   |
| ---------------- | ----------------------------- | ---------------------------------------------- |
| `EXPORT_SESSION` | `chat:exportSession`          | `CHAT_EXPORT_CHANNELS.EXPORT_SESSION`          |
| `PREVIEW_EXPORT` | `chat:previewExport`          | `CHAT_EXPORT_CHANNELS.PREVIEW_EXPORT`          |
| `WRITE_FILE`     | `fs:writeFile`                | `FILE_SYSTEM_CHANNELS.WRITE_FILE`              |
| `READ_FILE`      | `fs:readFile`                 | `FILE_SYSTEM_CHANNELS.READ_FILE`               |
| `START_SESSION`  | `skill-creator:start-session` | `SKILL_CREATOR_SESSION_CHANNELS.START_SESSION` |
| `ANSWER`         | `skill-creator:answer`        | `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`        |

### ALLOWED_ON_CHANNELSに追加する6チャネル

| IPC_CHANNELSキー               | チャネル文字列                               | sharedソース                                                  |
| ------------------------------ | -------------------------------------------- | ------------------------------------------------------------- |
| `QUESTION_RECEIVED`            | `skill-creator:question-received`            | `SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED`            |
| `SESSION_COMPLETE`             | `skill-creator:session-complete`             | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE`             |
| `SESSION_ERROR`                | `skill-creator:session-error`                | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR`                |
| `EXTERNAL_API_CONFIG_REQUIRED` | `skill-creator:external-api-config-required` | `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` |
| `API_CONFIGURED`               | `skill-creator:api-configured`               | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED`          |
| `API_TEST_RESULT`              | `skill-creator:api-test-result`              | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_TEST_RESULT`         |

---

## 7. リスク

| #   | リスク                                           | 影響度 | 対策                                                                                           |
| --- | ------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------- |
| 1   | verify-ipc-4layer.cjs の解決精度                 | 中     | スクリプト実行で実際に検出されたチャネルのみを対象とする                                       |
| 2   | `CONFIGURE_API` の既登録扱いの不明瞭さ           | 低     | 既登録であることを明記し、本タスクの追加対象から除外する                                       |
| 3   | `FILE_SYSTEM_CHANNELS.SHOW_SAVE_DIALOG` の値重複 | 低     | `"dialog:showSaveDialog"` は `DIALOG_SHOW_SAVE` と値が同じ。キー名は異なるため動作上の問題なし |
| 4   | IPC_CHANNELSキー名の衝突                         | 低     | スプレッド展開時に既存キーと衝突しないことをTypeScriptエラーで確認                             |

---

## Phase 2 完了条件

- [x] 設計アプローチ（最小変更原則）が明確に定義されている
- [x] 変更対象ファイルと変更箇所が特定されている
- [x] 追加するimport文のコードスニペットが記載されている
- [x] ALLOWED_INVOKE_CHANNELSへの追加コードスニペットが記載されている
- [x] ALLOWED_ON_CHANNELSへの追加コードスニペットが記載されている
- [x] 事前確認事項（grepコマンド付き）が定義されている
- [x] 定数キーマッピング表が完備されている
- [x] リスクが識別・対策済みである
