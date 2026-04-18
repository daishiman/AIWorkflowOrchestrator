# 実装ガイド: ipcMain.handle() 重複・欠損 CI 自動検出

## Part 1: 初学者向け解説

### なぜ必要か

学校の持ち物チェック表を毎朝見直すと、「ノートを 2 冊入れた」「定規を入れ忘れた」にすぐ気づけます。

今回のスナップショットテストも同じです。アプリが起動するときに「どの IPC チャンネルを登録するか」のリストを基準として保存しておき、あとからリストが変わったときに自動で検出します。

特に「同じチャンネルを 2 回登録してしまう」バグ（`SKILL_CREATOR_GET_ADAPTER_STATUS` の二重登録事例）は、実行するまで気づけず大きな障害につながりました。このテストがあれば、PR を出した時点で CI が「あ、重複してるよ」と教えてくれます。

---

## Part 2: 開発者向け技術ガイド

### 概要

`registerRuntimeSkillCreatorHandlers()` が登録する 19 チャンネルをスナップショットで固定し、重複・欠損を CI で自動検出する。

### テストファイル

```
apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts
apps/desktop/src/main/ipc/__tests__/__snapshots__/creatorHandlers.registrationSnapshot.test.ts.snap
```

### 型定義

```typescript
// チャンネル収集配列
let handles: string[];

// spy セットアップ
mockIpcMainHandle.mockImplementation((channel: string) => {
  handles.push(channel);
});

// 重複検出
const isDuplicated = new Set(handles).size !== handles.length;
```

### テスト実行コマンド

```bash
# 通常テスト（CI と同等）
pnpm --filter @repo/desktop test

# スナップショット更新（チャンネル変更時）
pnpm --filter @repo/desktop test -- --updateSnapshot

# 特定テストのみ実行
npx vitest run "src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts"
```

### スナップショット更新が許可される条件

- `registerRuntimeSkillCreatorHandlers()` にチャンネルを意図的に追加・変更・削除した場合
- PR 説明に変更理由を明記した場合

### スナップショット更新が禁止される条件

- 「CI を通すため」だけの目的での更新
- チャンネル変更の意図なしに `--updateSnapshot` を実行すること

### テスト失敗時の対処手順

| 失敗テスト                        | 原因                         | 対処                                                                    |
| --------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| REG-SNAP-01 スナップショット差分  | チャンネルの追加・変更・削除 | `--updateSnapshot` で意図的に更新し、スナップショットファイルをコミット |
| REG-DEDUP-01 `expected N to be M` | 同一チャンネルが重複登録     | 重複している `ipcMain.handle()` 呼び出しを削除                          |
| REG-COUNT-01 件数不一致           | チャンネル数が 19 以外       | スナップショットを更新するか、重複を削除する                            |

### 現在のスナップショット（19 チャンネル）

```
skill-creator:apply-improvement
skill-creator:cleanup-expired-sessions
skill-creator:configure-api
skill-creator:delete-session
skill-creator:execute-plan
skill-creator:get-adapter-status
skill-creator:get-governance-state
skill-creator:get-session-detail
skill-creator:get-verify-detail
skill-creator:get-workflow-state
skill-creator:improve-skill
skill-creator:list-sessions
skill-creator:normalize-sdk-messages
skill-creator:output-overwrite-approved
skill-creator:plan
skill-creator:resume-session
skill-creator:reverify-workflow
skill-creator:submit-user-input
skill-creator:verify
```

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。

代替証跡:

- `docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-11/manual-test-result.md` — 手動テスト実行記録
- `docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-11/ui-sanity-visual-review.md` — NON_VISUAL 判定記録
- CI ログ — 既存ワークフローで自動実行
