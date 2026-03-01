# Phase 13: PR作成

## メタ情報

| 項目      | 値                                                   |
| --------- | ---------------------------------------------------- |
| Phase     | 13                                                   |
| 機能名    | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001            |
| 作成日    | 2026-02-28                                           |
| 前提Phase | Phase 12（ドキュメント更新）完了                     |
| 目的      | ユーザー許可を得てPRを作成し、CIを確認してタスク完了 |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- Task 1: 成果物最終確認 — 全Phase（1-12）の成果物が揃っていることを確認
- Task 2: ローカル動作確認依頼 — ユーザーにローカルでの動作確認を依頼
- Task 3: 変更サマリー提示 — 変更内容のサマリーを提示しPR作成の許可を確認
- Task 4: PR作成 — ユーザーの許可後に PR を作成
- Task 5: 最終検証・タスク完了処理 — CI確認とタスクディレクトリ移動

## 参照資料

| 資料名               | パス                                          | 説明           |
| -------------------- | --------------------------------------------- | -------------- |
| Phase 2 設計成果物   | `outputs/phase-2/`                            | 設計仕様       |
| Phase 5 実装成果物   | `outputs/phase-5/`                            | 実装コード概要 |
| Phase 6 テスト成果物 | `outputs/phase-6/`                            | テスト拡充結果 |
| Phase 7 成果物       | `outputs/phase-7/`                            | カバレッジ結果 |
| Phase 8 成果物       | `outputs/phase-8/`                            | リファクタ記録 |
| Phase 9 品質成果物   | `outputs/phase-9/`                            | 品質保証結果   |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-checklist.md`   | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| artifacts.json       | `outputs/artifacts.json`                      | 全Phase成果物  |

## 実行手順

### ステップ1: 成果物最終確認【必須】

PR作成前に、全Phase の成果物が揃っていることを確認する。

**確認項目**:

- [ ] artifacts.json の全Phase（1-12）が `completed` ステータスであること
- [ ] 各Phase の必須成果物ファイルが物理的に存在すること
- [ ] `pnpm lint` がPASSすること
- [ ] `pnpm typecheck` がPASSすること
- [ ] 全テストがPASSすること（`pnpm --filter @repo/shared test`）

```bash
# 成果物検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001

# 品質検証
pnpm lint
pnpm typecheck
pnpm --filter @repo/shared test
```

### ステップ2: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

1. `pnpm --filter @repo/shared build` で shared パッケージをビルド
2. `pnpm --filter @repo/desktop dev` でアプリを起動
3. 以下の基本動作を確認:
   - アプリが正常に起動すること
   - 設定画面（認証・APIキー管理）が正常に表示されること
   - DevTools コンソールに `@repo/shared` 関連のエラーがないこと

**重要**: ユーザーから動作確認完了の報告を受けるまで次のステップに進まないこと。

### ステップ3: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**提示内容**:

- 変更ファイル数と変更行数（`git diff --stat` の結果）
- 主要な変更内容:
  - 型定義ファイル5件の移動（`types/` → `src/types/`）
  - index.ts + `__tests__/` の移動
  - package.json / tsconfig.json / vitest.config.ts / tsup.config.ts の4ファイル同期更新
- テスト結果サマリー（自動テスト数 + 手動テスト14項目）
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
git commit -m "refactor(shared): 型定義ディレクトリ統合 types/ → src/types/

- auth.ts/api-keys.ts/common.ts/file-selection.ts/workflow.ts を src/types/ に移動
- package.json/tsconfig.json/vitest.config.ts/tsup.config.ts の4ファイル同期更新
- 公開パス不変（exports が吸収）、import文変更不要
- 全テストPASS、手動テスト14項目確認済み"

# 4. プッシュ
git push -u origin $(git branch --show-current)

# 5. PR作成
gh pr create \
  --title "refactor(shared): 型定義ディレクトリ統合 types/ → src/types/" \
  --body "$(cat <<'EOF'
## Summary
- `packages/shared` の型定義ディレクトリ二重構造を解消（`types/` → `src/types/` に統合）
- 5ファイル + index.ts + __tests__/ を移動し、4設定ファイルを同期更新
- 公開パス不変（exports がパスを吸収）、影響ファイル30+箇所の import 変更不要

## Test plan
- [ ] 自動テスト: `pnpm --filter @repo/shared test` がPASS
- [ ] 型チェック: `pnpm typecheck` がPASS
- [ ] Lint: `pnpm lint` がPASS
- [ ] ビルド: `pnpm --filter @repo/shared build` がPASS
- [ ] 手動テスト: Phase 11の14項目がPASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### ステップ5: CI確認・タスク完了処理【必須】

- PRが作成されていること
- CIが通過していること
- CIが失敗した場合は原因を調査し、修正後に再プッシュ

**タスク完了処理**:

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001をcompleted-tasksに移動"
git push
```

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

## CIチェック結果

| チェック項目 | 結果 |
| ------------ | ---- |
| TypeCheck    | PASS |
| Lint         | PASS |
| Test         | PASS |
| Build        | PASS |
```

## 完了条件

- [ ] 全Phase（1-12）の成果物が揃っていることを確認した
- [ ] artifacts.json の全Phase が `completed` ステータスであることを確認した
- [ ] `pnpm lint` がPASSしている
- [ ] `pnpm typecheck` がPASSしている
- [ ] 全テストがPASSしている
- [ ] ユーザーにローカル動作確認を依頼し、確認完了の報告を受けている
- [ ] 変更サマリーを提示し、PR作成の明示的な許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/` に移動されている
- [ ] 移動後のコミット・プッシュが完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・ディレクトリ移動）**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 成果物最終確認（全Phase成果物・品質検証）
2. ユーザーにローカル動作確認を依頼
3. 変更サマリーの提示と許可確認
4. PR作成（`/ai:diff-to-pr` 実行）
5. CI確認
6. タスクディレクトリ移動
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（ワークフロー完了）
