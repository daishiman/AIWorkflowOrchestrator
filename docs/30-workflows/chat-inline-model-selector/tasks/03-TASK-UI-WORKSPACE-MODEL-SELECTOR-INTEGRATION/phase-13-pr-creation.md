# Phase 13: 完了

## メタ情報

| 項目          | 内容                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 13                                                                                                                             |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                              |
| 作成日        | 2026-03-21                                                                                                                     |
| 担当          | -                                                                                                                              |
| ステータス    | 未着手                                                                                                                         |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-12-documentation.md` |

## 目的

成果物の最終確認を行い、PR を作成して TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION を完了する。

> **注意**: コミット・PR作成はユーザーの明示的な承認後のみ実行すること。`--no-verify` オプションは絶対に使用禁止。

## 実行タスク

### タスク1: 成果物の最終確認

#### 修正ファイルの確認

```bash
# 変更ファイルの確認
git diff --stat HEAD

# WorkspaceChatPanel の変更内容確認
git diff HEAD -- apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# useWorkspaceChatController の変更内容確認（修正した場合）
git diff HEAD -- apps/desktop/src/renderer/views/WorkspaceView/useWorkspaceChatController.ts
```

**確認チェックリスト**:

- [ ] `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`: InlineModelSelector(compact=true)が上部に配置されている
- [ ] `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`: ストリーミング中のdisabled制御が実装されている
- [ ] `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`: GuidanceBlock(variant="blocked")の表示条件が正しく実装されている
- [ ] `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`: チャット入力フィールドのdisabled条件がモデル選択状態に連動している

#### テスト成果物の確認

```bash
# Phase 4/5/6 で作成したテストファイルの確認
find apps/desktop/src/renderer/views/WorkspaceView/__tests__ -name "WorkspaceChatPanel*"

# 全テスト実行（最終確認、P40対策）
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/
```

**確認チェックリスト**:

- [ ] `WorkspaceChatPanel.integration.test.tsx` が存在する
- [ ] I-1〜I-6、E-1〜E-5 の全テストが PASS している

#### ドキュメント成果物の確認

```bash
# Phase 12 で作成したドキュメントの確認
ls docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/

# 実装ガイドの確認
head -50 docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/outputs/phase-12/implementation-guide.md
```

**確認チェックリスト**:

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている（Part 1 + Part 2 の2パート構成）
- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている

### タスク2: 最終品質チェック

```bash
# Lint
cd apps/desktop && pnpm lint

# TypeCheck
cd apps/desktop && pnpm typecheck
```

### タスク3: コミット作成

```bash
# ステージング
git add apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx
git add apps/desktop/src/renderer/views/WorkspaceView/useWorkspaceChatController.ts  # 修正した場合
git add apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx
git add docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/

# コミット（conventional commits 形式）
git commit -m "feat(workspace): integrate InlineModelSelector into WorkspaceChatPanel

- Place InlineModelSelector(compact=true) at top of WorkspaceChatPanel
- Hide GuidanceBlock(blocked) when model is selected
- Disable chat input when no model selected
- Disable InlineModelSelector during streaming
- Link blocked state to useWorkspaceChatController

Closes #<issue-number>"
```

**コミットルール**:

- `--no-verify` は絶対に使用しない
- pre-commit hook（lint-staged）を必ず通す
- コミットメッセージは conventional commits 形式

### タスク4: PR 作成

```bash
# PR作成（gh CLI使用）
gh pr create \
  --title "feat(workspace): integrate InlineModelSelector into WorkspaceChatPanel" \
  --body "$(cat << 'EOF'
## Summary
- Place \`InlineModelSelector(compact=true)\` at top of WorkspaceChatPanel
- Hide \`GuidanceBlock(variant="blocked")\` when model is selected; keep API key GuidanceBlock independent
- Disable chat input when no model is selected
- Disable \`InlineModelSelector\` during streaming to prevent state conflicts

## Test Plan
- [ ] Unit/integration tests: I-1 ~ I-6, E-1 ~ E-5 (11 test cases) all PASS
- [ ] Manual test: Model selection in WorkspaceChatPanel → AI response flow confirmed (Scenarios 1-4)
- [ ] Visual check: compact layout does not disrupt WorkspaceChatPanel layout

## Dependencies
- Requires Task 01 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT) to be merged first

## Related
- Task: TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION
- Feature: chat-inline-model-selector
EOF
)" \
  --base main
```

**PRルール** (07-git-and-tooling.md より):

- PR タイトルは70文字以内
- PR 本文に Summary（1-3箇条書き）+ Test Plan を含める
- main ブランチに直接 push しない

### タスク5: GitHub Issue のクローズ（該当する場合）

```bash
# このタスクに対応する GitHub Issue が存在する場合
gh issue close <issue-number> --comment \
  "TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION 完了。PR: <PR-URL>"
```

## 参照資料

### プロジェクトルール

| 資料名           | パス                                  |
| ---------------- | ------------------------------------- |
| Git & ツーリング | `.claude/rules/07-git-and-tooling.md` |

### 前Phase成果物

| 資料名                | パス                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 12 ドキュメント | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-12-documentation.md` |

## 実行手順

1. **タスク1の実施**: 修正ファイル・テスト・ドキュメントの成果物を最終確認する
2. **タスク2の実施**: Lint・TypeCheck を最終実行する
3. **タスク3の実施**: コミットを作成する（`--no-verify` 禁止）
4. **タスク4の実施**: PR を作成する
5. **タスク5の実施**: GitHub Issue が存在する場合はクローズする

## 成果物

| 成果物                        | パス                                                                                                                         | 説明               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 13 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-13-pr-creation.md` | 完了フェーズ手順書 |
| コミット                      | git log HEAD                                                                                                                 | 修正内容のコミット |
| PR                            | GitHub PR URL                                                                                                                | レビュー待ちのPR   |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 13
```

## 完了条件

- [ ] 修正ファイル（WorkspaceChatPanel.tsx 等）の変更内容を最終確認した
- [ ] 全テスト（I-1〜I-6、E-1〜E-5）が PASS していることを最終確認した
- [ ] Phase 12 の成果物（outputs/phase-12/implementation-guide.md 等）が存在することを確認した
- [ ] Lint・TypeCheck が通ることを最終確認した
- [ ] `--no-verify` を使わずにコミットを作成した
- [ ] PR を作成した（Summary + Test Plan を含む）
- [ ] GitHub Issue が存在する場合はクローズした

## タスク完了

TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION のすべての Phase が完了。

**修正内容サマリ**:

1. `WorkspaceChatPanel.tsx` にInlineModelSelector(compact=true)をパネル上部に配置
2. モデル選択状態に応じてGuidanceBlock(variant="blocked")の表示/非表示を制御
3. チャット入力フィールドのdisabled条件をモデル選択状態に連動
4. ストリーミング中のInlineModelSelector disabled制御を実装

**影響範囲**:

- WorkspaceChatPanelでモデル選択がインラインで可能になった
- モデル未選択時はGuidanceBlockでユーザーを誘導する
- Task 01（TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT）が前提依存となる
