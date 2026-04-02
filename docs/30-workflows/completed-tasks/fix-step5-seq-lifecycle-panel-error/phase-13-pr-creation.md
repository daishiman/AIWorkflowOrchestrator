# Phase 13: PR作成

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 13                                 |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.25h                              |

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

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 2 の成果物 design-topology.md、Phase 5 の修正結果、Phase 6 の成果物、Phase 7 の成果物、Phase 8 の成果物、Phase 9 の成果物、Phase 10 の成果物、Phase 11 の成果物、Phase 12 の成果物を前提に PR を準備する。

## 実行手順

### ステップ 1: PR 作成前チェックリスト

#### 必須条件

- [ ] Phase 10 の最終レビューが RELEASE OK になっている
- [ ] Phase 11 の手動テスト（全 2 シナリオ）が PASS している
- [ ] Phase 12 のドキュメント更新（2 ファイル）が完了している
- [ ] `pnpm --filter @repo/desktop exec vitest run` が PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] AC-1〜AC-5 が全て充足されている

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
fix(desktop): TASK-FIX-LIFECYCLE-PANEL-ERROR-001 SkillLifecyclePanel エラー永続化バグ修正

- onWorkflowStateChanged コールバックで setWorkflowError(null) を currentPhase: 'handoff' 以外のときのみ呼ぶよう修正
- currentPhase: 'handoff' 受信時にエラーが即座に消去されるバグを解消
- handoffBundle 処理は currentPhase に関わらず変わらない（AC-3 維持）
- SkillLifecyclePanel.error-persistence.test.tsx を新規追加（TC-EP-01〜10）
```

### ステップ 3: PR タイトルと説明

**PR タイトル**:

```
fix(desktop): SkillLifecyclePanel エラー永続化バグ修正 (TASK-FIX-LIFECYCLE-PANEL-ERROR-001)
```

**PR 説明テンプレート**:

```markdown
## 概要

`SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバックが
`setWorkflowError(null)` を無条件に呼び出すため、`currentPhase: 'handoff'` 状態で
届いたエラーが即座に消去されていた問題を修正します。

## 根本原因

`onWorkflowStateChanged` コールバックは `SKILL_CREATOR_WORKFLOW_STATE_CHANGED`
イベントを受信するたびに呼ばれる。`setWorkflowError(null)` が無条件で実行されるため、
`currentPhase: 'handoff'` のスナップショット受信後もエラーがクリアされてしまっていた。

## 修正内容

1 ファイルを修正（2 行追加）:

- **SkillLifecyclePanel.tsx**: `setWorkflowError(null)` を
  `if (snapshot.currentPhase !== 'handoff')` ブロックで囲む

## 受入条件の充足

- AC-1: `currentPhase === 'handoff'` 時に `setWorkflowError(null)` が呼ばれない ✅
- AC-2: `currentPhase !== 'handoff'` 時に `setWorkflowError(null)` が呼ばれる（既存動作維持） ✅
- AC-3: `handoffBundle` の処理は `currentPhase` に関わらず変わらない ✅
- AC-4: 既存テストが全て PASS ✅
- AC-5: UI 上でエラーメッセージが表示されたまま残る ✅（手動テスト確認済み）

## テスト

- TC-EP-01〜05: 基本動作テスト（Phase 4）✅
- TC-EP-06〜10: エッジケース・回帰テスト（Phase 6）✅

## 影響範囲

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（+2 行）
- 新規テスト: `SkillLifecyclePanel.error-persistence.test.tsx`

Props・型定義・IPC チャンネルの変更なし。他コンポーネントへの影響なし。

関連タスク: TASK-FIX-LIFECYCLE-PANEL-ERROR-001
前提タスク: TASK-FIX-ENV-STRIPPING、TASK-FIX-EXECUTE-PLAN-FF-001
```

### ステップ 4: PR 作成コマンド

```bash
gh pr create \
  --title "fix(desktop): SkillLifecyclePanel エラー永続化バグ修正 (TASK-FIX-LIFECYCLE-PANEL-ERROR-001)" \
  --body "$(cat <<'EOF'
## 概要

...（上記テンプレートの内容）
EOF
)"
```

## 多角的チェック観点

- PR 作成前にユーザーの明示承認を受けていることを確認したか
- コミットメッセージの prefix が `fix(desktop):` であることを確認したか
- PR 本文に AC-1〜AC-5 の充足状況が記載されているか確認したか
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
