# Phase 13: 完了・PR作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 13                                             |
| Phase名    | 完了・PR作成                                   |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 12（ドキュメント更新）                   |
| 後続Phase  | なし（タスク完了）                             |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

成果物を最終確認し、ユーザーへの動作確認依頼・PR 作成・CI 確認・タスク完了移管を行う。

**重要**: PR 作成は **自動実行しない**。必ずユーザーの明示的な許可を得てから実行すること。

## 実行タスク

- Step 1: ローカル品質確認（ビルド・テスト・型チェック・Lint）
- Step 2: ユーザーへのローカル動作確認依頼と変更サマリーの提示
- Step 3: ユーザーの許可確認
- Step 4: `/ai:diff-to-pr` によるPR作成（許可後のみ）
- Step 5: CI 確認
- Step 6: completed-tasks への仕様書移動

## 参照資料

### システム仕様テーブル

| 参照資料                | パス                                                                           | 内容                                |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| architecture-overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Electronアーキテクチャ、IPC登録一覧 |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB初期化パターン                    |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPCセキュリティ原則                 |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーハンドリングパターン          |

### コードベース参照

| ファイル                | パス                                     | 備考                          |
| ----------------------- | ---------------------------------------- | ----------------------------- |
| 修正対象ファイル        | `apps/desktop/src/main/ipc/index.ts`     | Section 13 追加（1 ファイル） |
| Phase 12 成果物         | `outputs/phase-12/`                      | ドキュメント更新結果          |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 動作確認の根拠                |

## 実行手順

### Step 1: ローカル品質確認

PR 作成前にローカルで以下を確認する。Phase 9 完了時点で通過済みだが、
Phase 8〜12 の作業で変更が入った場合は再確認する。

| #   | 確認項目              | コマンド                                             | 期待結果   |
| --- | --------------------- | ---------------------------------------------------- | ---------- |
| 1   | ビルド成功            | `pnpm --filter @repo/desktop build`                  | エラーなし |
| 2   | 全テスト通過          | `pnpm --filter @repo/desktop test`                   | 全 PASS    |
| 3   | TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck`              | エラーなし |
| 4   | Lint チェック         | `pnpm --filter @repo/desktop lint`                   | エラーなし |
| 5   | 実際の動作確認        | `pnpm --filter @repo/desktop dev`（Phase 11 と同様） | 正常起動   |

確認結果を `outputs/phase-13/local-check.md` に記録する。

### Step 2: ユーザーへの変更サマリー提示と動作確認依頼

ユーザーに以下の変更サマリーを提示する。

---

**変更サマリー**

| 項目                 | 内容                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| 修正ファイル         | `apps/desktop/src/main/ipc/index.ts`（1 ファイルのみ）                           |
| 変更内容             | `registerAllIpcHandlers()` に Section 13（Conversation IPC ハンドラ登録）を追加  |
| 追加行数             | import 3 行 + Section 13 の約 30 行（DB 初期化 + ハンドラ登録 + フォールバック） |
| 新規ファイル         | なし                                                                             |
| 削除ファイル         | なし                                                                             |
| 影響範囲             | `conversation:create/list/get/update/delete/addMessage/search` の 7 チャンネル   |
| 既存ハンドラへの影響 | なし（Section 1〜12 の構造変更なし）                                             |

**動作確認依頼**:

Phase 11 で実施した手動テスト（TC-01〜TC-08）の主要シナリオを
ユーザー自身でローカル環境にて確認していただけますか？

確認コマンド:

```bash
pnpm --filter @repo/desktop dev
# DevTools Console で:
# await window.conversationAPI.create({ title: "test", userId: "u1" })
```

---

### Step 3: ユーザー許可確認

**PR 作成の許可を明示的に求める。**

許可が得られた場合のみ Step 4 へ進む。
許可が得られない場合はその理由を確認し、対応する。

### Step 4: PR 作成（ユーザー許可後のみ実行）

```
/ai:diff-to-pr
```

PR 情報の参考テンプレート:

**タイトル**:

```
fix(conversation-ipc): registerAllIpcHandlers に Conversation ハンドラ登録を追加
```

**説明**:

```markdown
## Summary

- `registerAllIpcHandlers()` から `registerConversationHandlers()` が呼ばれていない問題を修正
- `ipc/index.ts` に Section 13 を追加（DB 初期化 → ConversationRepository → ハンドラ登録）
- DB 初期化失敗時のフォールバックハンドラ（`registerConversationFallbackHandlers()`）を追加

## Changes

### 修正ファイル

- `apps/desktop/src/main/ipc/index.ts`
  - Section 13: Conversation IPC ハンドラ登録（約 30 行追加）
  - `registerConversationFallbackHandlers()` 関数追加

## Test plan

- [x] 単体テスト: `conversationHandlers.test.ts` 全 PASS
- [x] 単体テスト: `conversationRepository.test.ts` 全 PASS
- [x] 単体テスト: `ipc-graceful-degradation.test.ts` 全 PASS
- [x] 型チェック: TypeScript エラーなし
- [x] 手動テスト: TC-01〜TC-08 全確認済み（DevTools Console）
- [x] フォールバック確認: DB 初期化失敗時に DB_NOT_AVAILABLE が返ること確認済み
```

**ラベル**:

- `fix`
- `ipc`
- `backend`

### Step 5: CI 確認

PR 作成後、CI の結果を確認する。

| CI チェック | 期待結果 |
| ----------- | -------- |
| Build       | PASS     |
| Test        | PASS     |
| TypeCheck   | PASS     |
| Lint        | PASS     |

CI 結果と PR URL を `outputs/phase-13/pr-info.md` に記録する。

### Step 6: completed-tasks への移動

PR マージ後（またはマージ待ち状態になった後）、仕様書ディレクトリを
completed-tasks に移動する。

```bash
mv docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION \
   docs/30-workflows/completed-tasks/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION
```

**注意**: ディレクトリ移動はマージ完了後に実施すること。
マージ前の移動は禁止しない（worktree 環境に応じて判断）。

## 成果物

| 成果物           | パス                                                     | 内容                                |
| ---------------- | -------------------------------------------------------- | ----------------------------------- |
| Phase 13 仕様書  | `docs/30-workflows/TASK-FIX-.../phase-13-pr-creation.md` | 本ドキュメント                      |
| ローカル確認結果 | `outputs/phase-13/local-check.md`                        | ビルド・テスト・型・Lint の確認結果 |
| PR 情報          | `outputs/phase-13/pr-info.md`                            | PR URL・CI 結果・作成日時           |

## 完了条件

- [ ] ビルドが成功することを確認した（`pnpm --filter @repo/desktop build`）
- [ ] 全テストが通過することを確認した（`pnpm --filter @repo/desktop test`）
- [ ] 型チェックが通過することを確認した（`pnpm --filter @repo/desktop typecheck`）
- [ ] Lint エラーがないことを確認した（`pnpm --filter @repo/desktop lint`）
- [ ] 変更サマリーをユーザーに提示した
- [ ] ユーザーへのローカル動作確認を依頼した
- [ ] ユーザーから PR 作成の明示的な許可を得た
- [ ] `/ai:diff-to-pr` を実行して PR を作成した
- [ ] CI が全て PASS することを確認した
- [ ] PR URL を `outputs/phase-13/pr-info.md` に記録した
- [ ] ローカル確認結果（`outputs/phase-13/local-check.md`）を作成した

## PR 作成に関する注意事項

| 禁止事項                                      | 理由                                           |
| --------------------------------------------- | ---------------------------------------------- |
| ユーザー確認なしで PR を作成する              | 意図しないブランチやコミットが作成される可能性 |
| `git push --force` を main ブランチに実行する | main の履歴が壊れる                            |
| `git commit --no-verify` を使用する           | CLAUDE.md で絶対禁止                           |
| ローカル確認をスキップする                    | 未確認のコードが PR に含まれる                 |

## 次のPhase

なし。本 Phase の完了をもって
`TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION` タスクが完了する。

PR マージ後、仕様書ディレクトリを completed-tasks に移動する（Step 6）。
