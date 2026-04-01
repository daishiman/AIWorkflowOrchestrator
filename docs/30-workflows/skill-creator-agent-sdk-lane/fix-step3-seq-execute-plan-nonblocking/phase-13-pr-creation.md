# Phase 13: PR作成

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 13                           |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 0.5h                         |

## 目的

Phase 1〜12 の全成果物が揃い、ユーザーの明示承認を受けた後に PR を作成する。PR 作成前の必須チェックリストを定義する。

## 重要事項

- コミットしない
- PR を作成しない
- **ユーザーの明示承認があるまで実行しない**

## 実行タスク

1. PR 作成前の必須チェックリストを確認する
2. ユーザーの明示承認を受ける
3. コミットメッセージを作成する
4. PR を作成する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: PR 作成前チェックリスト

#### 必須条件

- [ ] Phase 10 の最終レビューが RELEASE OK になっている
- [ ] Phase 11 の手動テスト（全 3 シナリオ）が PASS している
- [ ] Phase 12 のドキュメント更新（5 ファイル）が完了している
- [ ] `pnpm --filter @repo/desktop exec vitest run` が PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] AC-1〜AC-6 が全て充足されている

#### ブランチ確認

```bash
# 現在のブランチ確認
git branch --show-current

# 変更ファイルの確認
git status

# 差分の確認
git diff --stat main
```

### ステップ 2: コミットメッセージ

```
fix(desktop): TASK-FIX-EXECUTE-PLAN-FF-001 skill-creator:execute-plan IPCハンドラーのfire-and-forget化

- CHANNEL_TIMEOUTS に "skill-creator:execute-plan": 1_800_000 を追加（P0暫定）
- creatorHandlers.ts の execute ハンドラーを fire-and-forget パターンに変更
- SkillCreatorWorkflowEngine に onPhaseChanged callback を追加
- RuntimeSkillCreatorFacade に executeAsync() を追加し、webContents.send にワイヤリング
- ipcMain.handle('skill-creator:execute-plan') が 100ms 以内に { accepted: true, planId } を返す
- バックグラウンドで Agent SDK query() が非同期実行される
- 各フェーズ遷移時に SKILL_CREATOR_WORKFLOW_STATE_CHANGED で進捗通知
```

### ステップ 3: PR タイトルと説明

**PR タイトル**:

```
fix(desktop): skill-creator:execute-plan IPCハンドラーのfire-and-forget化 (TASK-FIX-EXECUTE-PLAN-FF-001)
```

**PR 説明テンプレート**:

```markdown
## 概要

`skill-creator:execute-plan` IPC ハンドラーが `await runtimeSkillCreatorService.execute()` で
最大 30 分間ブロッキングしていた問題を修正します。

## 根本原因

1. `CHANNEL_TIMEOUTS` に `skill-creator:execute-plan` が未登録 → デフォルト 5000ms でタイムアウト
2. `creatorHandlers.ts` の execute ハンドラーが `await` で同期待機 → Renderer が 5 秒でタイムアウト

## 修正内容

4 ファイルを修正:

1. **ipc-utils.ts**: `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000` を追加（P0 暫定）
2. **creatorHandlers.ts**: `void facade.executeAsync(planId, req)` + 即時 `{ accepted: true, planId }` 返却
3. **SkillCreatorWorkflowEngine.ts**: `onPhaseChanged?: PhaseChangedCallback` callback を追加
4. **RuntimeSkillCreatorFacade.ts**: `executeAsync(planId, req): Promise<void>` を追加、callback ワイヤリング

## 受入条件の充足

- AC-1: ハンドラーが 100ms 以内に `{ accepted: true, planId }` を返す ✅
- AC-2: バックグラウンドで `executeAsync()` が Agent SDK `query()` を呼ぶ ✅
- AC-3: 各フェーズ遷移時に `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が発火する ✅
- AC-4: `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000` が追加された ✅
- AC-5: 既存 `safeInvoke` 互換性が保たれている（breaking change なし） ✅
- AC-6: `onPhaseChanged` callback が型安全に定義されている ✅

## テスト

- TC-T1-01〜02: CHANNEL_TIMEOUTS 検証 ✅
- TC-T2-01〜07: fire-and-forget ハンドラー検証 ✅
- TC-T3-01〜06: onPhaseChanged 検証 ✅
- TC-T4-01〜02: executeAsync エラー処理検証 ✅

## 影響範囲

- `apps/desktop/src/preload/ipc-utils.ts`（1 行追加）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（〜5 行変更）
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`（〜15 行追加）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（〜25 行追加）

Renderer 側のコード変更なし。

関連タスク: TASK-FIX-EXECUTE-PLAN-FF-001
```

### ステップ 4: PR 作成コマンド

```bash
gh pr create \
  --title "fix(desktop): skill-creator:execute-plan IPCハンドラーのfire-and-forget化 (TASK-FIX-EXECUTE-PLAN-FF-001)" \
  --body "$(cat <<'EOF'
## 概要
...（上記テンプレートの内容）
EOF
)"
```

## 多角的チェック観点

- PR 作成前にユーザーの明示承認を受けていることを確認したか
- コミットメッセージの prefix が `fix(desktop):` であることを確認したか
- PR 本文に AC-1〜AC-6 の充足状況が記載されているか確認したか
- `--no-verify` を使用していないことを確認したか（絶対禁止）

## 成果物

| 成果物              | パス   | 説明                 |
| ------------------- | ------ | -------------------- |
| GitHub Pull Request | PR URL | ユーザー承認後に作成 |

## 完了条件

- [ ] PR 作成は blocked であることが明記されている（ユーザーの明示承認が必要）
- [ ] PR 作成前の必須チェックリストが定義されている
- [ ] PR タイトル・説明・コミットメッセージのテンプレートが定義されている
- [ ] `--no-verify` を使用しないことが明記されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（ユーザー承認後に GitHub PR を作成）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 13 が最終 Phase。PR 作成後にタスク完了。
