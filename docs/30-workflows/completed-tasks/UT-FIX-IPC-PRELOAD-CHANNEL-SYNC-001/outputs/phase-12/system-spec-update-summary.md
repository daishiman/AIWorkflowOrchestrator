# system-spec-update-summary.md

## システム仕様同期サマリー

### 同期ルール

`packages/shared/src/ipc/channels.ts` が IPC チャネルの正本です。  
`apps/desktop/src/preload/channels.ts` では、その正本を `IPC_CHANNELS` と `ALLOWED_*` に反映し、renderer が使えるチャネルだけを明示的に許可します。

### 今回の変更内容

#### ALLOWED_INVOKE_CHANNELS への追加（6件）

| チャネル名                    | 所属グループ                     |
| ----------------------------- | -------------------------------- |
| `chat:exportSession`          | `CHAT_EXPORT_CHANNELS`           |
| `chat:previewExport`          | `CHAT_EXPORT_CHANNELS`           |
| `fs:writeFile`                | `FILE_SYSTEM_CHANNELS`           |
| `fs:readFile`                 | `FILE_SYSTEM_CHANNELS`           |
| `skill-creator:start-session` | `SKILL_CREATOR_SESSION_CHANNELS` |
| `skill-creator:answer`        | `SKILL_CREATOR_SESSION_CHANNELS` |

#### ALLOWED_ON_CHANNELS への追加（6件）

| チャネル名                                   | 所属グループ                          |
| -------------------------------------------- | ------------------------------------- |
| `skill-creator:question-received`            | `SKILL_CREATOR_SESSION_CHANNELS`      |
| `skill-creator:session-complete`             | `SKILL_CREATOR_SESSION_CHANNELS`      |
| `skill-creator:session-error`                | `SKILL_CREATOR_SESSION_CHANNELS`      |
| `skill-creator:external-api-config-required` | `SKILL_CREATOR_SESSION_CHANNELS`      |
| `skill-creator:api-configured`               | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` |
| `skill-creator:api-test-result`              | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` |

### `FILE_SYSTEM_CHANNELS` の扱い

`FILE_SYSTEM_CHANNELS.SHOW_SAVE_DIALOG` は既存の `IPC_CHANNELS.DIALOG_SHOW_SAVE` と同じ `dialog:showSaveDialog` です。  
そのため、`FILE_SYSTEM_CHANNELS` を丸ごと spread せず、`WRITE_FILE` と `READ_FILE` だけを明示追加する方が重複を増やさずに済みます。

### `verify-ipc-4layer.cjs` との整合

`node scripts/verify-ipc-4layer.cjs` の結果は次の通りです。

- Rule-1: PASS
- Rule-2: PASS
- Rule-3: PASS

`skill-creator:configure-api` は既登録済みのため missing に含めず、`ALLOWED_INVOKE_CHANNELS` 6件 + `ALLOWED_ON_CHANNELS` 6件で preload / main / shared の整合が current facts と一致しました。
