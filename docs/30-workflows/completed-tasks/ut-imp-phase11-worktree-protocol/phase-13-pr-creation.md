# Phase 13: PR作成 — Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目      | 値                                                   |
| --------- | ---------------------------------------------------- |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                 |
| Phase     | 13                                                   |
| タスク名  | Phase 11 Worktree環境テストプロトコル標準化          |
| Issue     | #853                                                 |
| 作成日    | 2026-03-01                                           |
| 前提Phase | Phase 12（ドキュメント更新）完了                     |
| 目的      | ユーザー許可を得てPRを作成し、CIを確認してタスク完了 |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。deferred-tests.mdに未解消項目がないことを確認した上でタスクを完了する。

## 実行タスク

- Task 1: 成果物最終確認 — 全Phase（1-12）の成果物が揃っていることを確認
- Task 2: ローカル動作確認依頼 — ユーザーにE2Eテスト実行を依頼
- Task 3: 変更サマリー提示 — 変更内容のサマリーを提示しPR作成の許可を確認
- Task 4: PR作成 — ユーザーの許可後にPRを作成
- Task 5: CI確認・deferred-tests解消確認 — CIが通過し、未実施テストが全て解消されていることを確認
- Task 6: タスク完了処理 — タスクディレクトリをcompleted-tasksに移動

## 参照資料

| 資料名                 | パス                                                                                        | 説明                     |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1要件定義        | `phase-1-requirements.md`                                                                   | 機能要件・受入基準       |
| Phase 2設計成果物      | `outputs/phase-2/architecture-design.md`                                                    | 設計内容の最終確認       |
| Phase 5実装成果物      | `outputs/phase-5/`                                                                          | プロトコル文書・E2E      |
| Phase 6テスト拡充成果  | `outputs/phase-6/integration-test.md`                                                       | 統合テスト拡充結果       |
| Phase 7カバレッジ成果  | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ達成証跡       |
| Phase 8リファクタ成果  | `outputs/phase-8/refactoring-log.md`                                                        | リファクタリング結果     |
| Phase 9品質成果物      | `outputs/phase-9/`                                                                          | 品質保証結果             |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`                                                   | Phase 10成果物           |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                                    | Phase 11成果物           |
| 未実施テスト記録       | `outputs/phase-11/deferred-tests.md`                                                        | Phase 11成果物（条件）   |
| ドキュメント更新履歴   | `outputs/phase-12/documentation-changelog.md`                                               | Phase 12成果物           |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`                                                  | Phase 12成果物           |
| artifacts.json         | `outputs/artifacts.json`                                                                    | 全Phase成果物            |
| 必要仕様抽出マトリクス | `spec-reference-matrix.md`                                                                  | 必要仕様の最終整合確認   |
| IPC契約チェック        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約の最終確認観点    |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 再利用パターンの準拠確認 |
| CI/CD仕様              | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                       | GitHub Actions設計規約   |
| Playwright仕様         | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | Electron E2E実装パターン |
| E2E品質仕様            | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | E2E品質観点              |

## 実行手順

### ステップ1: 成果物最終確認【必須】

PR作成前に、全Phaseの成果物が揃っていることを確認する。

**確認項目**:

- [ ] artifacts.json の全Phase（1-12）が `completed` ステータスであること
- [ ] 各Phase の必須成果物ファイルが物理的に存在すること
- [ ] `pnpm lint` がPASSすること
- [ ] `pnpm typecheck` がPASSすること
- [ ] `pnpm --filter @repo/desktop test` がPASSすること（desktopパッケージの全テスト）

```bash
# 成果物検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-imp-phase11-worktree-protocol

# 品質検証
pnpm lint
pnpm typecheck
pnpm --filter @repo/desktop test
```

### ステップ2: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

1. メインリポジトリで `pnpm --filter @repo/desktop test:e2e` を実行し、E2Eテストが全件PASSすることを確認
2. `apps/desktop/e2e/` 配下のテストファイル（`ipc-skill-remove.spec.ts`、`ipc-skill-import.spec.ts`）が正常に実行されることを確認
3. CI/CDワークフロー（`.github/workflows/ci.yml`）のE2Eテストジョブ設定が正しいことを目視確認

**重要**: ユーザーから動作確認完了の報告を受けるまで次のステップに進まないこと。

### ステップ3: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**提示内容**:

- 変更ファイル数と変更行数（`git diff --stat` の結果）
- 主要な変更内容:
  - Worktree環境Phase 11代替テストプロトコル文書
  - E2Eテストスクリプト2件（skill:remove、skill:import）
  - Playwright設定ファイル（playwright.config.ts）
  - CI/CDワークフロー更新（ci.ymlにE2Eテストジョブ追加）
  - Phase 11テンプレート更新（.claude/skills/task-specification-creator/references/phase-11-12-guide.mdにWorktree代替手順セクション追加）
  - deferred-testsテンプレート
- テスト結果サマリー（自動テスト数 + 手動テスト7項目）
- Phase 10最終レビュー結果

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ4: PR作成（ユーザー許可後）

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**フォールバック（`/ai:diff-to-pr` が使えない場合）**:

```bash
# 1. ブランチ確認
git branch --show-current

# 2. 全変更をステージング
git add -A

# 3. コミット
git commit -m "feat(test): Phase 11 Worktree環境テストプロトコル標準化 (#853)

- Worktree環境用Phase 11代替テストプロトコル文書を作成
- Playwright E2Eテスト（skill:remove, skill:import）を実装
- CI/CDワークフローにE2Eテストジョブを追加
- Phase 11テンプレートにWorktree代替手順セクションを追加
- deferred-tests追跡ワークフローを定義"

# 4. プッシュ
git push -u origin $(git branch --show-current)

# 5. PR作成
gh pr create \
  --title "feat(test): Phase 11 Worktree環境テストプロトコル標準化 (#853)" \
  --body "$(cat <<'EOF'
## Summary
- Worktree環境でPhase 11を実行する際の3層テスト分類（Layer 1-3）プロトコルを定義
- Playwright E2Eテスト（skill:remove, skill:import）をCI/CDパイプラインに統合
- 未実施テストの追跡・完了管理ワークフロー（deferred-tests.md）を標準化

## Test plan
- [ ] 自動テスト: `pnpm --filter @repo/desktop test` がPASS
- [ ] E2Eテスト: `pnpm --filter @repo/desktop test:e2e` がPASS
- [ ] 型チェック: `pnpm typecheck` がPASS
- [ ] Lint: `pnpm lint` がPASS
- [ ] 手動テスト: Phase 11の7テストケース（TC-001〜TC-007）が実施済み
- [ ] CI: GitHub ActionsのE2Eテストジョブがsuccess

Closes #853

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### ステップ5: CI確認・deferred-tests解消確認【必須】

- [ ] PRが作成されていること
- [ ] CIが通過していること（E2Eテストジョブを含む）
- [ ] CIが失敗した場合は原因を調査し、修正後に再プッシュ

**deferred-tests.md 解消確認**:

`outputs/phase-11/deferred-tests.md` が存在する場合、以下を確認する:

- [ ] TC-001（E2Eテスト）: CIのE2Eテストジョブが「success」ステータスであること、またはメインリポジトリで `pnpm --filter @repo/desktop test:e2e` がPASSしていること
- [ ] TC-004（CI E2Eジョブ）: GitHub ActionsのE2Eテストジョブが「success」ステータスであること
- [ ] deferred-tests.md の「解消チェック」セクションの全項目にチェックが入っていること

**全項目が解消された場合**: deferred-tests.md の先頭に `## ステータス: 全項目解消（YYYY-MM-DD）` を追記する。

**未解消項目がある場合**: 未解消の原因を調査し、Phase 12の未タスク検出レポートに追記する。未タスク指示書を作成し、P3準拠の3ステップを完了する。

### ステップ6: タスク完了処理【必須】

PRが作成され、CIが通過し、deferred-testsが全て解消された後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/ut-imp-phase11-worktree-protocol/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep ut-imp-phase11-worktree-protocol

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): UT-IMP-PHASE11-WORKTREE-PROTOCOL-001をcompleted-tasksに移動"
git push
```

## 統合テスト連携

| 統合テスト観点               | 確認方法                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| E2Eテストの実環境動作        | CI/CDパイプラインのE2Eテストジョブが「success」で完了していることを確認する                                                        |
| deferred-testsの全解消       | deferred-tests.mdの全チェックボックスにチェックが入っていることを確認する                                                          |
| Phase 11テンプレートの整合性 | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` のWorktree代替手順セクションがPR差分に含まれていること |
| CI/CDワークフローの整合性    | ci.ymlのE2Eテストジョブがmainブランチでも正しく動作する設定であることを確認                                                        |

## 多角的チェック観点

| 観点                   | 適用判断 | 仕様参照先                                         |
| ---------------------- | -------- | -------------------------------------------------- |
| PRタイトル・本文の品質 | 適用     | `.claude/rules/07-git-and-tooling.md` PR作成ルール |
| CIパイプラインの通過   | 適用     | `.github/workflows/ci.yml`                         |
| deferred-tests全解消   | 適用     | `outputs/phase-11/deferred-tests.md`               |
| ブランチ命名規約       | 適用     | `.claude/rules/07-git-and-tooling.md`              |
| コミットメッセージ規約 | 適用     | `CLAUDE.md`                                        |

## 成果物

| 成果物 | パス                          | 必須 | 説明                 |
| ------ | ----------------------------- | ---- | -------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | ✅   | PR URL・番号・CI結果 |

### pr-info.md テンプレート

```markdown
## PR情報

| 項目     | 値              |
| -------- | --------------- |
| PR番号   | #{{PR_NUMBER}}  |
| PR URL   | {{PR_URL}}      |
| ブランチ | {{BRANCH_NAME}} |
| CI結果   | PASS / FAIL     |
| 作成日   | {{YYYY-MM-DD}}  |

## 変更サマリー

- 変更ファイル数: {{N}}
- 追加行数: {{N}}
- 削除行数: {{N}}

## 主要変更内容

- Worktree環境Phase 11代替テストプロトコル文書
- E2Eテストスクリプト2件（skill:remove、skill:import）
- Playwright設定ファイル（playwright.config.ts）
- CI/CDワークフロー更新（ci.ymlにE2Eテストジョブ追加）
- Phase 11テンプレート更新（Worktree代替手順セクション追加）
- deferred-testsテンプレート

## CIチェック結果

| チェック項目     | 結果 |
| ---------------- | ---- |
| TypeCheck        | PASS |
| Lint             | PASS |
| Unit/Integration | PASS |
| E2E (Playwright) | PASS |
| Build            | PASS |

## deferred-tests解消状況

| TC-ID  | テスト名                            | 解消状況 |
| ------ | ----------------------------------- | -------- |
| TC-001 | メインリポジトリでE2Eテスト実行     | 解消済み |
| TC-004 | CI環境でE2Eテストジョブ正常完了確認 | 解消済み |
```

## 完了条件

### Task 1: 成果物最終確認

- [ ] 全Phase（1-12）の成果物が揃っていることを確認した
- [ ] artifacts.json の全Phase が `completed` ステータスであることを確認した
- [ ] `pnpm lint` がPASSしている
- [ ] `pnpm typecheck` がPASSしている
- [ ] `pnpm --filter @repo/desktop test` がPASSしている

### Task 2: ローカル動作確認

- [ ] ユーザーにE2Eテスト実行を依頼し、確認完了の報告を受けている

### Task 3: 変更サマリー

- [ ] 変更サマリーを提示し、PR作成の明示的な許可を得ている

### Task 4: PR作成

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] PRタイトルが70文字以内であること
- [ ] PR本文にSummary（1-3箇条書き）+ Test Planが含まれていること

### Task 5: CI確認・deferred-tests解消

- [ ] CIが通過している（E2Eテストジョブを含む全ジョブ）
- [ ] deferred-tests.mdが存在する場合、全項目が解消されている
- [ ] deferred-tests.mdの「解消チェック」セクションの全チェックボックスにチェックが入っている

### Task 6: タスク完了処理

- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/ut-imp-phase11-worktree-protocol/` に移動されている
- [ ] 移動後のコミット・プッシュが完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・deferred-tests解消・ディレクトリ移動）**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 成果物最終確認（全Phase成果物・品質検証）
2. ユーザーにローカル動作確認を依頼（E2Eテスト実行）
3. 変更サマリーの提示と許可確認
4. PR作成（`/ai:diff-to-pr` 実行）
5. CI確認・deferred-tests解消確認
6. タスクディレクトリ移動
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜6）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（ワークフロー完了）
