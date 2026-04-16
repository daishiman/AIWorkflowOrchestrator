# Phase 1 — 要件定義

## メタ情報

| 項目         | 値                                     |
| ------------ | -------------------------------------- |
| タスクID     | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001    |
| タスク名     | preloadホワイトリスト チャネル同期修正 |
| 種別         | bugfix（CI Rule-1違反解消）            |
| 優先度       | 高（CI修正）                           |
| ステータス   | completed                              |
| 担当フェーズ | Phase 1（要件定義）                    |
| 後続Phase    | Phase 2（設計）                        |

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

## 1. 背景

`node scripts/verify-ipc-4layer.cjs` が実施するIPCレイヤー整合性チェックにおいて、
**Rule-1**（preloadホワイトリスト整合性チェック）が12チャネルの **FAIL** を報告している。

### 原因

`packages/shared/src/ipc/channels.ts` で正本定義されたチャネル定数が、
`apps/desktop/src/preload/channels.ts` の以下のホワイトリストに登録されていない。

- `ALLOWED_INVOKE_CHANNELS` — renderer → main への invoke 許可リスト
- `ALLOWED_ON_CHANNELS` — main → renderer へのプッシュ受信許可リスト

### なぜ問題か

Electronのpreloadスクリプトはセキュリティサンドボックスとして機能し、
ホワイトリストに未登録のチャネルはブロックされる。
登録漏れがあると機能が動作せず、かつCIが常にFAIL状態となる。

---

## 2. 問題の詳細

### 2-1. ALLOWED_INVOKE_CHANNELSに追加が必要なチャネル（6件）

| #   | チャネル文字列                | 定数キー（shared）                             | 定数グループ                     |
| --- | ----------------------------- | ---------------------------------------------- | -------------------------------- |
| 1   | `chat:exportSession`          | `CHAT_EXPORT_CHANNELS.EXPORT_SESSION`          | `CHAT_EXPORT_CHANNELS`           |
| 2   | `chat:previewExport`          | `CHAT_EXPORT_CHANNELS.PREVIEW_EXPORT`          | `CHAT_EXPORT_CHANNELS`           |
| 3   | `fs:writeFile`                | `FILE_SYSTEM_CHANNELS.WRITE_FILE`              | `FILE_SYSTEM_CHANNELS`           |
| 4   | `fs:readFile`                 | `FILE_SYSTEM_CHANNELS.READ_FILE`               | `FILE_SYSTEM_CHANNELS`           |
| 5   | `skill-creator:start-session` | `SKILL_CREATOR_SESSION_CHANNELS.START_SESSION` | `SKILL_CREATOR_SESSION_CHANNELS` |
| 6   | `skill-creator:answer`        | `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`        | `SKILL_CREATOR_SESSION_CHANNELS` |

> **備考**: `CONFIGURE_API` は `IPC_CHANNELS.CONFIGURE_API` として preload 側に **既登録済み** であり、
> 本タスクの missing には **数えない**。

### 2-2. ALLOWED_ON_CHANNELSに追加が必要なチャネル（6件）

| #   | チャネル文字列                               | 定数キー（shared）                                            | 定数グループ                          |
| --- | -------------------------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| 1   | `skill-creator:question-received`            | `SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED`            | `SKILL_CREATOR_SESSION_CHANNELS`      |
| 2   | `skill-creator:session-complete`             | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE`             | `SKILL_CREATOR_SESSION_CHANNELS`      |
| 3   | `skill-creator:session-error`                | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR`                | `SKILL_CREATOR_SESSION_CHANNELS`      |
| 4   | `skill-creator:external-api-config-required` | `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | `SKILL_CREATOR_SESSION_CHANNELS`      |
| 5   | `skill-creator:api-configured`               | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED`          | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` |
| 6   | `skill-creator:api-test-result`              | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_TEST_RESULT`         | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` |

---

## 3. スコープ

### 含むもの

- `apps/desktop/src/preload/channels.ts` への上記チャネル追加
- `ALLOWED_INVOKE_CHANNELS` への6件追加
- `ALLOWED_ON_CHANNELS` への6件追加
- `CHAT_EXPORT_CHANNELS`・`FILE_SYSTEM_CHANNELS` のimport追加（必要な場合）
- `IPC_CHANNELS` オブジェクトへのスプレッド展開追加（必要な場合）

### 含まないもの

- `packages/shared/src/ipc/channels.ts` の変更（正本は変更しない）
- mainプロセス側ハンドラーの追加・変更（Rule-2修正は別タスク: UT-FIX-IPC-MAIN-HANDLER-IMPL-001）
- テストコードの新規作成
- その他ファイルへの変更

---

## 4. 受け入れ条件

| #   | 条件                                                                 | 確認方法                                |
| --- | -------------------------------------------------------------------- | --------------------------------------- |
| 1   | `node scripts/verify-ipc-4layer.cjs` のRule-1がすべてPASSとなること  | 検証スクリプト実行                      |
| 2   | TypeScriptのコンパイルエラーが発生しないこと                         | `pnpm --filter @repo/desktop typecheck` |
| 3   | ESLintエラーが発生しないこと                                         | `pnpm --filter @repo/desktop lint`      |
| 4   | 既存テストがすべて通過すること                                       | `pnpm --filter @repo/desktop test`      |
| 5   | 変更ファイルが `apps/desktop/src/preload/channels.ts` のみであること | `git diff --name-only`                  |

---

## 5. 変更ファイル

```
apps/desktop/src/preload/channels.ts   （唯一の変更対象）
```

---

## 6. 依存関係

| 依存先タスク                     | 関係         | 備考                             |
| -------------------------------- | ------------ | -------------------------------- |
| UT-FIX-IPC-MAIN-HANDLER-IMPL-001 | 並列実行可能 | Rule-2修正（mainハンドラー追加） |

本タスクはUT-FIX-IPC-MAIN-HANDLER-IMPL-001との依存関係はなく、並列実行可能。

---

## 7. 優先度・リスク

| 項目   | 内容                                                |
| ------ | --------------------------------------------------- |
| 優先度 | 高（CI修正・ブロッカー）                            |
| リスク | 低（変更ファイルが1ファイルのみ、ロジック変更なし） |

---

## Phase 1 完了条件

- [x] 背景・問題の詳細が明確に定義されている
- [x] 対象12チャネルが表形式で網羅されている
- [x] スコープ（含む/含まない）が明確に定義されている
- [x] 受け入れ条件が検証可能な形式で定義されている
- [x] 変更ファイルが特定されている
- [x] 依存関係が確認されている
