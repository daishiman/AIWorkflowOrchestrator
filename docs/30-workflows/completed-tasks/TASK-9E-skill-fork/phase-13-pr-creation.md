# Phase 13: PR作成

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 13                               |
| タスクID  | TASK-9E-SKILL-FORK               |
| 機能名    | skill-fork（スキルフォーク機能） |
| 作成日    | 2026-02-28                       |
| 前提Phase | Phase 12（ドキュメント更新）     |
| 次Phase   | なし（ワークフロー完了）         |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

## 実行タスク

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

- Electron デスクトップアプリを起動し、スキルフォーク機能が正常に動作するか確認
- Phase 11 の手動テストケース（TC-01〜TC-08）の主要項目を再確認

**重要**: ユーザーから動作確認完了の報告があるまで、次のステップに進まないこと。

### ステップ2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PR を作成してよいかユーザーに確認する。

**サマリーに含める内容**:

- 新規ファイル一覧
  - `apps/desktop/src/main/services/skill/SkillForker.ts`
  - `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`
  - `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`
  - `packages/shared/src/types/skill-fork.ts`
- 変更ファイル一覧
  - `packages/shared/src/types/index.ts`（re-export 追加）
  - `packages/shared/index.ts`（re-export 追加）
  - `apps/desktop/src/main/ipc/skillHandlers.ts`（skill:fork ハンドラー追加）
  - `apps/desktop/src/preload/channels.ts`（SKILL_FORK チャネル追加）
  - `apps/desktop/src/preload/skill-api.ts`（fork API 追加）
- テスト結果サマリー（自動テスト数、手動テスト数、カバレッジ）
- Phase 10 最終レビュー結果

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### ステップ3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR 作成を実行する。

```
/ai:diff-to-pr
```

**PR タイトル例**: `feat(skill-fork): スキルフォーク・派生機能実装 (TASK-9E)`

**PR 本文に含める内容**:

- Summary（1-3 箇条書き）
  - 既存スキルをベースに新しいスキルを作成する SkillForker を実装
  - IPC チャンネル `skill:fork` を追加し、SkillForkOptions で部分フォークをサポート
  - fork-metadata.json にフォーク元情報を記録
- Test Plan
  - 自動テスト: SkillForker 単体テスト + IPC ハンドラーテスト
  - 手動テスト: TC-01〜TC-08（正常系4件 + 異常系3件 + 統合1件）
  - カバレッジ: Line 80%+, Branch 60%+, Function 80%+

### ステップ4: CI 確認

PR 作成後、CI の全チェックが通過したことを確認する。

| CI チェック項目 | 確認内容                                                   | 結果 |
| --------------- | ---------------------------------------------------------- | ---- |
| TypeCheck       | `pnpm --filter @repo/desktop exec tsc --noEmit` エラーなし | -    |
| Lint            | `pnpm lint` エラーなし                                     | -    |
| Test            | `pnpm --filter @repo/desktop test` 全テスト PASS           | -    |
| Build           | `pnpm --filter @repo/shared build` 成功                    | -    |

**重要**: CI が失敗した場合は、修正してから再度 CI を確認する。ユーザーに状況を報告し、次のステップに進まないこと。

### ステップ5: タスク完了処理【必須】

PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/completed-tasks/TASK-9E-skill-fork/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-9E

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-9E-skill-forkをcompleted-tasksに移動"
git push
```

### フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLI で手動対応する:

```bash
# ブランチ作成（未作成の場合）
git checkout -b feature/task-9e-skill-fork

# 変更をステージング
git add apps/desktop/src/main/services/skill/SkillForker.ts
git add apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts
git add apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts
git add packages/shared/src/types/skill-fork.ts
git add packages/shared/src/types/index.ts
git add packages/shared/index.ts
git add apps/desktop/src/main/ipc/skillHandlers.ts
git add apps/desktop/src/preload/channels.ts
git add apps/desktop/src/preload/skill-api.ts
git add docs/30-workflows/completed-tasks/TASK-9E-skill-fork/

# コミット
git commit -m "feat(skill-fork): スキルフォーク・派生機能実装 (TASK-9E)"

# プッシュ
git push -u origin feature/task-9e-skill-fork

# PR作成
gh pr create --title "feat(skill-fork): スキルフォーク・派生機能実装 (TASK-9E)" --body "..."
```

## 参照資料

| 資料名         | パス                                          | 説明            |
| -------------- | --------------------------------------------- | --------------- |
| Phase 2 設計   | `outputs/phase-2/architecture-design.md`      | Phase 2 成果物  |
| Phase 5 実装   | `outputs/phase-5/implementation-summary.md`   | Phase 5 成果物  |
| Phase 6 テスト | `outputs/phase-6/test-expansion.md`           | Phase 6 成果物  |
| Phase 7 判定   | `outputs/phase-7/coverage-report.md`          | Phase 7 成果物  |
| Phase 8 改善   | `outputs/phase-8/refactoring-notes.md`        | Phase 8 成果物  |
| Phase 9 品質   | `outputs/phase-9/quality-verification.md`     | Phase 9 成果物  |
| 最終レビュー   | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト     | `outputs/phase-11/manual-test-checklist.md`   | Phase 11 成果物 |
| ドキュメント   | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| 実装ガイド     | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物 |
| Git ルール     | `.claude/rules/07-git-and-tooling.md`         | PR 作成ルール   |

## 成果物

| 成果物  | パス                          | 説明           |
| ------- | ----------------------------- | -------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL、CI結果 |

### pr-info.md テンプレート

```markdown
# PR 情報

| 項目           | 値                         |
| -------------- | -------------------------- |
| PR番号         | #XXX                       |
| PR URL         | https://...                |
| ブランチ       | feature/task-9e-skill-fork |
| ベースブランチ | main                       |
| CI結果         | PASS/FAIL                  |

## 変更サマリー

- 新規ファイル: 4
- 変更ファイル: 5
- テスト数: N（自動）+ 8（手動）

## CI チェック結果

| チェック項目 | 結果 |
| ------------ | ---- |
| TypeCheck    | -    |
| Lint         | -    |
| Test         | -    |
| Build        | -    |
```

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] ユーザーから動作確認完了の報告を受けている
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] CI の全チェック項目が PASS している
- [ ] pr-info.md が `outputs/phase-13/` に配置されている
- [ ] タスクディレクトリが `completed-tasks/` に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. ステップ1: ユーザーにローカル動作確認を依頼
2. ステップ2: 変更サマリー提示と許可確認
3. ステップ3: PR 作成（`/ai:diff-to-pr`）
4. ステップ4: CI 確認
5. ステップ5: タスク完了処理（ディレクトリ移動）
6. 成果物の作成・配置（pr-info.md）

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（ワークフロー完了）
