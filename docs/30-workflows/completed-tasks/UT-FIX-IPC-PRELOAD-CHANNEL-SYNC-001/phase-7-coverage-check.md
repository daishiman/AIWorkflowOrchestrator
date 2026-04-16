# Phase 7: カバレッジ確認 — 12チャネル全修正の反映確認

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 7                                   |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | Phase 5（実装完了）                 |
| 後続Phase  | Phase 8（リファクタリング）         |
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

## 1. 目的

修正対象の12チャネル全てが `apps/desktop/src/preload/channels.ts` のホワイトリストに正しく追加されていることをチャネル単位で確認する。

---

## 2. チャネル別確認コマンド

### 2.1 ALLOWED_INVOKE_CHANNELS への追加確認（6チャネル）

```bash
# chat:exportSession
grep -n "EXPORT_SESSION\|chat:exportSession" apps/desktop/src/preload/channels.ts

# chat:previewExport
grep -n "PREVIEW_EXPORT\|chat:previewExport" apps/desktop/src/preload/channels.ts

# fs:writeFile
grep -n "WRITE_FILE\|fs:writeFile" apps/desktop/src/preload/channels.ts

# fs:readFile
grep -n "READ_FILE\|fs:readFile" apps/desktop/src/preload/channels.ts

# skill-creator:start-session
grep -n "START_SESSION\|skill-creator:start-session" apps/desktop/src/preload/channels.ts

# skill-creator:answer
grep -n "\"ANSWER\"\|IPC_CHANNELS.ANSWER\|skill-creator:answer" apps/desktop/src/preload/channels.ts
```

### 2.2 CONFIGURE_API の既存登録確認（確認のみ・追加不要）

```bash
grep -n "CONFIGURE_API\|skill-creator:configure-api" apps/desktop/src/preload/channels.ts
```

期待値: `ALLOWED_INVOKE_CHANNELS` 内に既存エントリが存在し、本タスクの追加対象から除外されること。

### 2.3 ALLOWED_ON_CHANNELS への追加確認（6チャネル）

```bash
# skill-creator:question-received
grep -n "QUESTION_RECEIVED\|skill-creator:question-received" apps/desktop/src/preload/channels.ts

# skill-creator:session-complete
grep -n "SESSION_COMPLETE\|skill-creator:session-complete" apps/desktop/src/preload/channels.ts

# skill-creator:session-error
grep -n "SESSION_ERROR\|skill-creator:session-error" apps/desktop/src/preload/channels.ts

# skill-creator:external-api-config-required
grep -n "EXTERNAL_API_CONFIG_REQUIRED\|skill-creator:external-api-config-required" apps/desktop/src/preload/channels.ts

# skill-creator:api-configured
grep -n "API_CONFIGURED\|skill-creator:api-configured" apps/desktop/src/preload/channels.ts

# skill-creator:api-test-result
grep -n "API_TEST_RESULT\|skill-creator:api-test-result" apps/desktop/src/preload/channels.ts
```

---

## 3. 一括確認コマンド

```bash
# 修正対象12チャネルが全てホワイトリストに含まれているか一括確認
for ch in \
  "EXPORT_SESSION" "PREVIEW_EXPORT" \
  "WRITE_FILE" "READ_FILE" \
  "START_SESSION" "ANSWER" \
  "QUESTION_RECEIVED" "SESSION_COMPLETE" "SESSION_ERROR" \
  "EXTERNAL_API_CONFIG_REQUIRED" "API_CONFIGURED" "API_TEST_RESULT"
do
  count=$(grep -c "IPC_CHANNELS\.$ch" apps/desktop/src/preload/channels.ts)
  echo "$ch: $count 件"
done
```

期待値: 各チャネルが **1件以上** ヒットすること。

---

## 4. チェックリスト

| チャネル文字列                               | ホワイトリスト | 確認 |
| -------------------------------------------- | -------------- | ---- |
| `chat:exportSession`                         | INVOKE         | [ ]  |
| `chat:previewExport`                         | INVOKE         | [ ]  |
| `fs:writeFile`                               | INVOKE         | [ ]  |
| `fs:readFile`                                | INVOKE         | [ ]  |
| `skill-creator:start-session`                | INVOKE         | [ ]  |
| `skill-creator:answer`                       | INVOKE         | [ ]  |
| `skill-creator:question-received`            | ON             | [ ]  |
| `skill-creator:session-complete`             | ON             | [ ]  |
| `skill-creator:session-error`                | ON             | [ ]  |
| `skill-creator:external-api-config-required` | ON             | [ ]  |
| `skill-creator:api-configured`               | ON             | [ ]  |
| `skill-creator:api-test-result`              | ON             | [ ]  |
