# Phase 13: 完了 — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                          |
| ------------- | ------------------------------------------- |
| 機能名        | chatview-inline-model-selector-integration  |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| Phase         | 13                                          |
| 作成日        | 2026-03-21                                  |
| 依存          | Phase 12（ドキュメント）完了後              |
| 前Phase成果物 | ./phase-12-documentation.md                 |

## 目的

本タスクの成果物を最終確認し、PRを作成してmainブランチへのマージを準備する。

## 実行タスク

- 成果物の最終確認チェックリストを完了する
- git statusで変更ファイルを確認する
- PRを作成する（gh pr createを使用）

## 参照資料

| 資料                                       | パス                                |
| ------------------------------------------ | ----------------------------------- |
| Phase 12 ドキュメント成果物                | ./phase-12-documentation.md         |
| Git & ツーリングルール                     | .claude/rules/07-git-and-tooling.md |
| タスク実行ワークフロールール（Phase 13）   | .claude/rules/05-task-execution.md  |
| Phase 2 設計書（ChatView配置設計 3.1/3.3） | ./phase-2-design.md                 |

## 実行手順

### Step 1: 成果物最終確認

すべてのPhase成果物が揃っていることを確認する。

```bash
ls -la docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/
```

期待されるファイル:

- phase-4-test.md
- phase-5-implementation.md
- phase-6-test-expansion.md
- phase-7-coverage.md
- phase-8-refactoring.md
- phase-9-quality-assurance.md
- phase-10-final-review.md
- phase-11-manual-test.md
- phase-12-documentation.md
- phase-13-pr-creation.md（本ファイル）
- implementation-guide.md（Phase 12 Task 1で作成）
- component-documentation.md（Phase 12 Task 1で作成）
- documentation-changelog.md（Phase 12 Task 3で作成）
- unassigned-task-report.md（Phase 12 Task 4で作成）

### Step 2: プロダクションコード変更の確認

```bash
git status
git diff --stat
```

変更対象として期待されるファイル:

- `apps/desktop/src/renderer/views/ChatView/index.tsx`（InlineModelSelector追加）
- `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.integration.test.tsx`（新規）
- `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`（必要な場合のみ）
- `docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/`（本タスク仕様書群）

### Step 3: コミット前チェックリスト

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/
```

3コマンドすべてがPASSであることを確認する。

**注意**: `--no-verify` の使用は絶対禁止。

### Step 4: PR作成

```bash
git add apps/desktop/src/renderer/views/ChatView/index.tsx \
  apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.integration.test.tsx \
  docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/

git commit -m "$(cat <<'EOF'
feat(chat): ChatViewヘッダーにInlineModelSelectorを配置

TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION
- ChatView/index.tsxのヘッダー左側にInlineModelSelectorを配置
- ストリーミング中はdisabled状態に連動
- LLMGuidanceBannerの既存動作（モデル未選択で表示）を維持
- 統合テスト8件（TC-I-1〜5 + TC-E-1〜3）を追加

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

```bash
gh pr create \
  --title "feat(chat): ChatViewヘッダーにInlineModelSelectorを配置" \
  --body "$(cat <<'EOF'
## Summary

- ChatView/index.tsxのヘッダー左側（SystemPromptToggleButtonの隣）にInlineModelSelectorを配置
- ストリーミング中はInlineModelSelectorをdisabledにしてモデル変更を防止
- LLMGuidanceBannerの既存動作（モデル未選択時に表示）を維持

## Test Plan

- [ ] TC-I-1: ChatViewヘッダーにInlineModelSelectorが表示される
- [ ] TC-I-2: モデル選択後にチャット送信が動作する
- [ ] TC-I-3: モデル未選択時にLLMGuidanceBannerが表示される
- [ ] TC-I-4: モデル選択後にLLMGuidanceBannerが非表示になる
- [ ] TC-I-5: ストリーミング中はInlineModelSelectorがdisabledになる
- [ ] TC-E-1: プロバイダー0件時のChatView表示
- [ ] TC-E-2: セレクタ変更中の送信ガード
- [ ] TC-E-3: RAGモードとの共存
- [ ] 手動テスト MT-1〜MT-4 PASS確認

関連タスク: TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION
依存タスク: TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT（Task 01）
EOF
)"
```

### Step 5: PR作成後の確認

```bash
gh pr view
```

PRのURL・タイトル・本文を確認し、このファイルの成果物テーブルに記録する。

## 成果物

| 成果物       | パス/URL           | 説明                     |
| ------------ | ------------------ | ------------------------ |
| Pull Request | （PR作成後に記入） | mainへのマージ準備完了PR |

**PR情報（実行時に記入）:**

| 項目       | 値       |
| ---------- | -------- |
| PR URL     | （記入） |
| PR番号     | （記入） |
| ブランチ名 | （記入） |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 13
```

## 完了条件

- [ ] 全Phase成果物ファイルが揃っている
- [ ] `git status` でプロダクションコード変更が意図通りである
- [ ] Lint・TypeCheck・テストがすべてPASS
- [ ] `--no-verify` を使用していない
- [ ] PRが作成されPR URLが記録されている
- [ ] PRタイトルが70文字以内である
- [ ] PR本文にSummary（1-3箇条書き）とTest Planが含まれている

## 次のPhase

本タスク（TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION）は本Phaseで完了。

---

_本タスク（TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION）の完了をもって、ChatView InlineModelSelector統合（Task 02）が完了する。_
