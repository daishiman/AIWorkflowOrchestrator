# Phase 13: 完了

## メタ情報

| 項目      | 内容                                        |
| --------- | ------------------------------------------- |
| Phase番号 | 13                                          |
| 機能名    | viewtype-renderView-foundation              |
| タスクID  | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |
| 作成日    | 2026-03-17                                  |

## 目的

成果物の最終確認を行い、ユーザー許可を得た上で PR を作成する。`/ai:diff-to-pr` による PR 作成後、CI の確認を行う。

## 実行タスク

| #   | タスク名               | 説明                                                 |
| --- | ---------------------- | ---------------------------------------------------- |
| 1   | 成果物最終確認         | Phase 5〜12の全成果物が揃っていることを確認          |
| 2   | コミット前最終チェック | lint/typecheck/test の全PASS確認                     |
| 3   | 変更差分の確認         | git diff で想定外のファイル変更がないことを確認      |
| 4   | ユーザー許可待ち       | PR作成の明示的許可を取得                             |
| 5   | PR作成                 | ユーザー許可後に `/ai:diff-to-pr` またはgh pr create |
| 6   | CI確認                 | GitHub Actions CI の PASS確認                        |
| 7   | タスク完了処理         | completed-tasksへの移動                              |

## 参照資料

### タスク関連

| 資料名                      | パス                                      | 説明                    |
| --------------------------- | ----------------------------------------- | ----------------------- |
| Phase 2 設計仕様書          | `phase-2-design.md`                       | PR説明で触れる設計意図  |
| Phase 5 実装仕様書          | `phase-5-implementation.md`               | 実装差分の要点確認      |
| Phase 6 テスト拡充          | `phase-6-test-expansion.md`               | 追加テスト範囲の確認    |
| Phase 7 カバレッジ結果      | `outputs/phase-7/coverage-report.md`      | カバレッジ基準達成確認  |
| Phase 8 リファクタリング    | `outputs/phase-8/refactoring-log.md`      | 改善内容の確認          |
| Phase 9 品質検証結果        | `outputs/phase-9/qa-results.md`           | lint/typecheck/test結果 |
| Phase 10 最終レビュー結果   | `outputs/phase-10/final-review-report.md` | 最終判定と指摘確認      |
| Phase 11 手動テスト結果     | `outputs/phase-11/manual-test-result.md`  | 画面証跡と手動確認結果  |
| Phase 12 ドキュメント成果物 | `outputs/phase-12/`                       | 全ドキュメント成果物    |
| PR作成ルール                | `.claude/rules/07-git-and-tooling.md`     | ブランチ名・PR本文規約  |
| コミット前チェックリスト    | `CLAUDE.md`                               | lint/typecheck/test必須 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                     | 説明                                |
| -------------------- | -------------------------------------------------------- | ----------------------------------- |
| ナビゲーションUI設計 | `aiworkflow-requirements: ui-ux-navigation.md`           | ViewType一覧・Global Navigation設計 |
| 状態管理             | `aiworkflow-requirements: arch-state-management-core.md` | Zustand Store・ViewType状態管理     |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                       | カバレッジ基準・TDD設計             |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                     | P39/P40/P41等                       |

## 実行手順

### Task 1: 成果物最終確認

Phase 5〜12 の全成果物が揃っていることを確認する。

| Phase    | 成果物                                                      | 確認 |
| -------- | ----------------------------------------------------------- | ---- |
| Phase 5  | 変更ファイル（types.ts, skillLifecycleJourney.ts, App.tsx） | -    |
| Phase 6  | テストファイル（追加テスト）                                | -    |
| Phase 7  | `outputs/phase-7/coverage-report.md`                        | -    |
| Phase 8  | `outputs/phase-8/refactoring-log.md`                        | -    |
| Phase 9  | `outputs/phase-9/qa-results.md`                             | -    |
| Phase 10 | `outputs/phase-10/final-review-report.md`                   | -    |
| Phase 11 | `outputs/phase-11/manual-test-result.md`                    | -    |
| Phase 12 | `outputs/phase-12/implementation-guide.md` 等               | -    |

### Task 2: コミット前最終チェック

`07-git-and-tooling.md` のコミット前チェックリストを実行する:

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3

# lint
pnpm --filter @repo/desktop lint 2>&1 | tail -5

# typecheck
pnpm --filter @repo/desktop typecheck 2>&1 | tail -5

# test
pnpm --filter @repo/desktop exec vitest run 2>&1 | tail -10
```

全て PASS することを確認する。

### Task 3: 変更差分の確認

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3
git diff --stat
git diff --name-only
```

変更ファイルが以下の 3 ファイルのみであることを確認する（テストファイル含む）:

- `apps/desktop/src/renderer/store/types.ts`
- `apps/desktop/src/renderer/skillLifecycleJourney.ts`（または同等パス）
- `apps/desktop/src/renderer/App.tsx`
- 対応するテストファイル群

### Task 4: ユーザー許可待ち

**PR 作成はユーザーの許可が必要です。**

PR 作成前に以下の情報をユーザーに提示し、承認を得る:

#### PR 概要（案）

**ブランチ名**: `feature/viewtype-renderView-foundation`

**タイトル（70文字以内）**: `feat(renderer): ViewType に skillAnalysis/skillCreate を追加`

**本文（Summary + Test Plan）**:

```markdown
## Summary

- `ViewType` に `"skillAnalysis"` と `"skillCreate"` を追加
- `App.tsx` の `renderView()` に対応する 2 case を追加
- `skillLifecycleJourney.ts` に `onAction?: () => void` を追加

## Test Plan

- Vitest: 全テスト PASS
- TypeScript typecheck: Error 0 件
- ESLint: Error 0 件
- カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- AC-1〜AC-6 全達成（Phase 10 最終レビュー PASS）
```

### Task 5: PR 作成（ユーザー許可後）

ユーザーから許可を得た後、以下を実行する:

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3

# ブランチ作成・コミット
git checkout -b feature/viewtype-renderView-foundation
git add apps/desktop/src/renderer/store/types.ts
git add apps/desktop/src/renderer/skillLifecycleJourney.ts
git add apps/desktop/src/renderer/App.tsx
# テストファイルも追加
git add apps/desktop/src/**/__tests__/
git commit -m "feat(renderer): ViewType に skillAnalysis/skillCreate を追加 (#TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001)"

# PR 作成
gh pr create \
  --title "feat(renderer): ViewType に skillAnalysis/skillCreate を追加" \
  --body "..." \
  --base main
```

または `/ai:diff-to-pr` コマンドを使用する。

### Task 6: CI 確認

PR 作成後、GitHub Actions の CI が PASS することを確認する:

```bash
# CI 状況確認
gh pr checks <PR番号> 2>&1
```

CI が失敗した場合は原因を特定し修正する（`--no-verify` は使用禁止）。

### Task 7: タスク完了処理【必須】

PR作成・CI確認が完了したら、以下のタスク完了処理を実行する:

1. **completed-tasks への移動**:

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260317-005902-wt-3
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation \
   docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation
```

2. **artifacts.json の Phase 13 ステータスを `completed` に更新**

3. **最終確認**: 全 Phase（5〜13）の成果物が揃っていること

## 統合テスト連携

| 連携対象             | 確認内容                                 | 確認結果 |
| -------------------- | ---------------------------------------- | -------- |
| Phase 5〜12 全成果物 | 全Phaseの成果物が揃っていること          | -        |
| CI パイプライン      | lint/typecheck/test が全PASS             | -        |
| artifacts.json       | Phase 13のステータスが更新されていること | -        |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物           | パス                               | 必須 | 説明                           |
| ---------------- | ---------------------------------- | ---- | ------------------------------ |
| PRチェックリスト | `outputs/phase-13/pr-checklist.md` | 必須 | PR作成前最終チェックリスト記録 |
| PR URL           | （PR作成後に記録）                 | 必須 | 作成されたPRのURL              |

## 完了条件

- [ ] Phase 5〜12 の全成果物が揃っている
- [ ] `pnpm lint` が Error 0 件で PASS する
- [ ] `pnpm typecheck` がエラー 0 件で PASS する
- [ ] `pnpm test` が全件 PASS する
- [ ] `git diff --name-only` で想定外のファイル変更がない
- [ ] PR 概要（タイトル・本文）が準備されている
- [ ] ユーザーの PR 作成許可が得られている
- [ ] PR が作成されている（ユーザー許可後）
- [ ] CI が PASS している（PR 作成後）
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 成果物最終確認
3. Task 2: コミット前最終チェック
4. Task 3: 変更差分の確認
5. Task 4: ユーザー許可待ち
6. Task 5: PR作成
7. Task 6: CI確認
8. Task 7: タスク完了処理（completed-tasks移動）
9. 統合テスト連携の確認
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 13
```

## 次Phase

なし（本タスクの最終Phase）

TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 の全 Phase（5〜13）が完了。
