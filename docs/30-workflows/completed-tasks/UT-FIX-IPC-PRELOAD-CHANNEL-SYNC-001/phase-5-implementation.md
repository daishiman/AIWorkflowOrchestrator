# Phase 5: 実装指示 — ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS への追加

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 5                                   |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | Phase 4（テスト方針確認）           |
| 後続Phase  | Phase 6（型チェック）               |
| ステータス | completed                           |

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

## 1. 修正ファイル

```
apps/desktop/src/preload/channels.ts
```

---

## 2. 事前確認

実装前に以下を確認する。

### 2.1 CHAT_EXPORT_CHANNELS / FILE_SYSTEM_CHANNELS のimport状況

現在の `channels.ts` の import セクション（1〜14行付近）を確認する。

```bash
head -20 apps/desktop/src/preload/channels.ts
```

現時点では以下のimportが存在する：

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

`CHAT_EXPORT_CHANNELS` と `FILE_SYSTEM_CHANNELS` が **import されていない**。

### 2.2 IPC_CHANNELS のキー存在確認

現在の `IPC_CHANNELS` オブジェクトに `CHAT_EXPORT_CHANNELS` や `FILE_SYSTEM_CHANNELS` がスプレッド展開されていないため、以下のキーが存在しない：

- `EXPORT_SESSION`
- `PREVIEW_EXPORT`
- `WRITE_FILE`（`FILE_WRITE` は存在するが別チャネル）
- `READ_FILE`（`FILE_READ` は存在するが別チャネル）

---

## 3. 実装手順

### Step 1: import に CHAT_EXPORT_CHANNELS と FILE_SYSTEM_CHANNELS を追加

**変更箇所**: ファイル冒頭の import ブロック（1〜14行）

```typescript
// 変更前
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

// 変更後
import {
  APPROVAL_CHANNELS,
  CHAT_EXPORT_CHANNELS,
  EXECUTION_CHANNELS,
  FILE_SYSTEM_CHANNELS,
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  SKILL_CREATOR_OUTPUT_READY,
  SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
  SKILL_CREATOR_OPEN_SKILL,
  SKILL_CREATOR_SESSION_CHANNELS,
  SKILL_CREATOR_RUNTIME_CHANNELS,
  SKILL_CREATOR_VERIFY,
} from "@repo/shared/src/ipc/channels";
```

### Step 2: IPC_CHANNELS オブジェクトに明示追加を行う

**変更箇所**: `IPC_CHANNELS` オブジェクト内の適切な位置

Chat Export チャネルの追加（`// Chat Edit operations` セクションの前に追加）：

```typescript
  // Chat Export operations (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  ...CHAT_EXPORT_CHANNELS,

  // File System operations (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  WRITE_FILE: FILE_SYSTEM_CHANNELS.WRITE_FILE,
  READ_FILE: FILE_SYSTEM_CHANNELS.READ_FILE,
```

**追加位置の目安**: `CHAT_EDIT_*` セクション（307行付近）の直前に挿入する。

```typescript
  // Chat Export operations (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  ...CHAT_EXPORT_CHANNELS,

  // File System operations (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  WRITE_FILE: FILE_SYSTEM_CHANNELS.WRITE_FILE,
  READ_FILE: FILE_SYSTEM_CHANNELS.READ_FILE,

  // Chat Edit operations
  CHAT_EDIT_READ_FILE: "chat-edit:read-file",
  // ...
```

### Step 3: ALLOWED_INVOKE_CHANNELS に6チャネルを追加

**変更箇所**: `ALLOWED_INVOKE_CHANNELS` 配列（427行付近）

`// Chat Edit channels` セクションの直前に以下を追加：

```typescript
  // Chat Export channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.EXPORT_SESSION,
  IPC_CHANNELS.PREVIEW_EXPORT,
  // File System channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.WRITE_FILE,
  IPC_CHANNELS.READ_FILE,
  // Skill Creator Session invoke channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.START_SESSION,
  IPC_CHANNELS.ANSWER,
```

> 注意: `CONFIGURE_API`（`skill-creator:configure-api`）は既に `IPC_CHANNELS.CONFIGURE_API` として
> `ALLOWED_INVOKE_CHANNELS` に登録済みであるため、追加しない。

### Step 4: ALLOWED_ON_CHANNELS に6チャネルを追加

**変更箇所**: `ALLOWED_ON_CHANNELS` 配列（727行付近）

`// Skill Creator channels` セクションの末尾（`IPC_CHANNELS.SKILL_CREATOR_OUTPUT_READY` の直後）に追加：

```typescript
  // Skill Creator Session on-channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.QUESTION_RECEIVED,
  IPC_CHANNELS.SESSION_COMPLETE,
  IPC_CHANNELS.SESSION_ERROR,
  IPC_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED,
  // Skill Creator External API on-channels (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
  IPC_CHANNELS.API_CONFIGURED,
  IPC_CHANNELS.API_TEST_RESULT,
```

---

## 4. 追加後のチャネル確認表

### ALLOWED_INVOKE_CHANNELS 追加分（6チャネル）

| キー名         | チャネル文字列                | 元グループ                     |
| -------------- | ----------------------------- | ------------------------------ |
| EXPORT_SESSION | `chat:exportSession`          | CHAT_EXPORT_CHANNELS           |
| PREVIEW_EXPORT | `chat:previewExport`          | CHAT_EXPORT_CHANNELS           |
| WRITE_FILE     | `fs:writeFile`                | FILE_SYSTEM_CHANNELS           |
| READ_FILE      | `fs:readFile`                 | FILE_SYSTEM_CHANNELS           |
| START_SESSION  | `skill-creator:start-session` | SKILL_CREATOR_SESSION_CHANNELS |
| ANSWER         | `skill-creator:answer`        | SKILL_CREATOR_SESSION_CHANNELS |

### ALLOWED_ON_CHANNELS 追加分（6チャネル）

| キー名                       | チャネル文字列                               | 元グループ                          |
| ---------------------------- | -------------------------------------------- | ----------------------------------- |
| QUESTION_RECEIVED            | `skill-creator:question-received`            | SKILL_CREATOR_SESSION_CHANNELS      |
| SESSION_COMPLETE             | `skill-creator:session-complete`             | SKILL_CREATOR_SESSION_CHANNELS      |
| SESSION_ERROR                | `skill-creator:session-error`                | SKILL_CREATOR_SESSION_CHANNELS      |
| EXTERNAL_API_CONFIG_REQUIRED | `skill-creator:external-api-config-required` | SKILL_CREATOR_SESSION_CHANNELS      |
| API_CONFIGURED               | `skill-creator:api-configured`               | SKILL_CREATOR_EXTERNAL_API_CHANNELS |
| API_TEST_RESULT              | `skill-creator:api-test-result`              | SKILL_CREATOR_EXTERNAL_API_CHANNELS |

> 注記: `API_CONFIGURED` と `API_TEST_RESULT` の2チャネルは `SKILL_CREATOR_EXTERNAL_API_CHANNELS` からスプレッド展開されている。
