# Phase 13 — コミット準備・完了確認

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 13                                  |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | Phase 12（ドキュメント更新完了）    |
| 後続Phase  | なし（タスク完了）                  |
| ステータス | pending                             |

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

## 注意事項

本フェーズはユーザーからの明示的なPR作成指示があるまで実施しない。

コミットおよびPR作成は **ユーザーから明示的に指示を受けた後** に実施すること。
このドキュメントは事前準備手順の確認用であり、自律的な実行は禁止する。

---

## Phase 13 実施条件

以下がすべて満たされた後に実施する。

- [ ] Phase 1〜12 が全て完了済みであること
- [ ] `node scripts/verify-ipc-4layer.cjs` のRule-1 が全チャネルPASSであること
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしであること
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしであること
- [ ] `pnpm --filter @repo/desktop test` が全テスト通過であること
- [ ] ユーザーからコミット・PR作成の明示的な指示があること

---

## コミット準備チェックリスト

### 変更ファイル確認

```bash
git diff --name-only
```

**期待結果**: `apps/desktop/src/preload/channels.ts` のみが表示されること。
他のファイルが含まれる場合は意図しない変更が混入している可能性がある。

### 差分内容確認

```bash
git diff apps/desktop/src/preload/channels.ts
```

確認すべき差分の内容：

1. import文に `CHAT_EXPORT_CHANNELS`・`FILE_SYSTEM_CHANNELS` が追加されていること
2. `IPC_CHANNELS` オブジェクトに `...CHAT_EXPORT_CHANNELS`・`...FILE_SYSTEM_CHANNELS` が追加されていること
3. `ALLOWED_INVOKE_CHANNELS` に以下が追加されていること
   - `IPC_CHANNELS.EXPORT_SESSION`（chat:exportSession）
   - `IPC_CHANNELS.PREVIEW_EXPORT`（chat:previewExport）
   - `IPC_CHANNELS.WRITE_FILE`（fs:writeFile）
   - `IPC_CHANNELS.READ_FILE`（fs:readFile）
   - `IPC_CHANNELS.START_SESSION`（skill-creator:start-session）
   - `IPC_CHANNELS.ANSWER`（skill-creator:answer）
4. `ALLOWED_ON_CHANNELS` に以下が追加されていること
   - `IPC_CHANNELS.QUESTION_RECEIVED`（skill-creator:question-received）
   - `IPC_CHANNELS.SESSION_COMPLETE`（skill-creator:session-complete）
   - `IPC_CHANNELS.SESSION_ERROR`（skill-creator:session-error）
   - `IPC_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED`（skill-creator:external-api-config-required）
   - `IPC_CHANNELS.API_CONFIGURED`（skill-creator:api-configured）
   - `IPC_CHANNELS.API_TEST_RESULT`（skill-creator:api-test-result）

### 最終検証コマンド

```bash
# Rule-1 最終確認
node scripts/verify-ipc-4layer.cjs

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# テスト
pnpm --filter @repo/desktop test
```

### コミットメッセージ案

```
fix(ipc): preloadホワイトリストに12チャネルを追加（Rule-1違反解消）

- ALLOWED_INVOKE_CHANNELS に6チャネルを追加
  - chat:exportSession, chat:previewExport (CHAT_EXPORT_CHANNELS)
  - fs:writeFile, fs:readFile (FILE_SYSTEM_CHANNELS)
  - skill-creator:start-session, skill-creator:answer (SKILL_CREATOR_SESSION_CHANNELS)
- ALLOWED_ON_CHANNELS に6チャネルを追加
  - skill-creator:question-received, session-complete, session-error (SKILL_CREATOR_SESSION_CHANNELS)
  - skill-creator:external-api-config-required (SKILL_CREATOR_SESSION_CHANNELS)
  - skill-creator:api-configured, api-test-result (SKILL_CREATOR_EXTERNAL_API_CHANNELS)
- import に CHAT_EXPORT_CHANNELS・FILE_SYSTEM_CHANNELS を追加
- IPC_CHANNELS に上記2グループのスプレッド展開を追加

Resolves: CI verify-ipc-4layer Rule-1 violation (12 channels)
Task: UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001
```

---

## 実施手順（ユーザー指示後）

ユーザーからの明示的な指示を受けた後に以下を実行する。

### Step 1: ステージング

```bash
git add apps/desktop/src/preload/channels.ts
```

### Step 2: コミット

```bash
git commit -m "$(cat <<'EOF'
fix(ipc): preloadホワイトリストに12チャネルを追加（Rule-1違反解消）

- ALLOWED_INVOKE_CHANNELS に6チャネルを追加
  - chat:exportSession, chat:previewExport (CHAT_EXPORT_CHANNELS)
  - fs:writeFile, fs:readFile (FILE_SYSTEM_CHANNELS)
  - skill-creator:start-session, skill-creator:answer (SKILL_CREATOR_SESSION_CHANNELS)
- ALLOWED_ON_CHANNELS に6チャネルを追加
  - skill-creator:question-received, session-complete, session-error (SKILL_CREATOR_SESSION_CHANNELS)
  - skill-creator:external-api-config-required (SKILL_CREATOR_SESSION_CHANNELS)
  - skill-creator:api-configured, api-test-result (SKILL_CREATOR_EXTERNAL_API_CHANNELS)
- import に CHAT_EXPORT_CHANNELS・FILE_SYSTEM_CHANNELS を追加
- IPC_CHANNELS に上記2グループのスプレッド展開を追加

Resolves: CI verify-ipc-4layer Rule-1 violation (12 channels)
Task: UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001
EOF
)"
```

### Step 3: PR作成（別途ユーザー指示が必要）

PR作成はコミット完了後、改めてユーザーの指示を待つこと。

---

## 関連情報

| 項目               | 内容                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| 並列タスク         | UT-FIX-IPC-MAIN-HANDLER-IMPL-001（Rule-2修正・mainハンドラー追加）           |
| 仕様書ディレクトリ | `docs/30-workflows/ipc-4layer-fix-lane/UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001/` |
| ブランチ名案       | `fix/ipc-preload-channel-sync-rule1`                                         |
