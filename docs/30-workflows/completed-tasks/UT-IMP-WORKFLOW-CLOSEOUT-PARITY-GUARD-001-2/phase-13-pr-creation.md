# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | Phase 12 完了 + ユーザーの明示承認        |
| 後続Phase  | -（完了）                                 |
| 作成日     | 2026-04-19                                |
| ステータス | pending                                   |

## 重要: ユーザー明示承認がない限り blocked【禁止事項】

- **ユーザーの明示承認（例: 「PR作成して」「PRを出してください」）がない限り、PR 作成 / commit / push を一切行わない**
- ローカル確認（`pnpm lint` / `pnpm typecheck` / 関連テスト / parity validator）を省略しない
- commit / PR を自動で作らない
- `git push --no-verify` / `git commit --no-verify` を使用しない（プロジェクト規約により絶対禁止）
- worktree ブランチの無断 push 禁止（明示的な許可が必須）
- 既存完了 workflow への遡及修正を PR に含めない（AC-7 により範囲外）

## 目的

変更内容をローカルで最終確認し、変更サマリを提示してユーザーの承認を得た後にのみ PR 作成へ進む。本タスクは Issue #2293（CLOSED）と紐づいているため、PR 本文ではクローズ済み Issue の文脈をリンクし、Issue 再オープンや close 上書きを避ける。

## Issue #2293（CLOSED）の取扱い

- Issue #2293 は CLOSED のままで仕様書作成を継続している（タスク文脈に記載のとおり）
- PR 本文では `Refs: #2293` 形式で参照し、`Closes: #2293` を **使わない**（既に CLOSED であるため）
- Issue が CLOSED であることを PR 本文に明記し、誤って再オープンしないよう注意書きを残す

## 実行タスク

1. ローカル動作確認を依頼する
2. 変更サマリ（ファイル一覧 / テスト結果 / 検証コマンド）を提示して PR 作成許可を確認する
3. 許可後に `/ai:diff-to-pr` または同等の承認済み PR 作成フローで PR 作成を実施する
4. CI が通過していることを確認する
5. `task-workflow.md` の残課題テーブルからエントリを削除し、tasks ディレクトリを `completed-tasks/` へ移動する

## 参照資料

| 資料名                   | パス                                                                                    | 説明                      |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------- |
| 最終レビュー             | `outputs/phase-10/final-review-result.md`                                               | Phase 10 成果物           |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                                | Phase 11 成果物           |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                                             | AC-1〜AC-7 トレース       |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`                                              | Part 1 / Part 2           |
| システム仕様更新サマリ   | `outputs/phase-12/system-spec-update-summary.md`                                        | Step 1-A〜1-G / Step 2    |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`                                           | 自己適用 PARITY_OK 実測値 |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`                                         | follow-up 候補            |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`                                             | L-CLOSEOUT-PARITY-001     |
| コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                | 最終ゲート                |
| Phase 13 詳細            | `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md` | PR 作成手順               |
| 出荷準備チェックリスト   | `outputs/phase-10/shipping-checklist.md`                                                | Phase 10 成果物           |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーへ以下のローカル動作確認を依頼する:

```bash
# Lint / typecheck
pnpm lint
pnpm typecheck

# 自タスク自身に対する parity 検証（dogfooding 確認）
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 --json

# 全仕様統合検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js

# 関連スクリプトのユニットテスト
pnpm vitest run .claude/skills/task-specification-creator/scripts/__tests__/
```

確認結果を `outputs/phase-13/local-check-result.md` に記録する。

### 2. 変更サマリの提示と許可確認【必須】

以下を `outputs/phase-13/change-summary.md` に記述してユーザーへ提示し、PR 作成可否の明示承認を得る:

- 変更ファイル一覧（新規 / 拡張 / reference 更新を分類）
- テスト結果（`pnpm vitest run` / `verify-all-specs.js` / `validate-closeout-parity.js` の exit code）
- 検証コマンド（手動テスト 6 シナリオの再実行コマンド）
- 関連 Issue: #2293（**CLOSED のまま運用**）
- 既存完了 workflow への遡及修正は含まない（AC-7）

**重要**: ユーザーから明示的な許可（例: 「PRを作成して」）を得るまで、PR 作成 / commit / push を実施しない。

### 3. PR 作成準備

許可後にのみ PR 作成へ進む。`/ai:diff-to-pr` を実行する前に、以下を確認する。

**実施前の確認対象**:

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

PR 作成時は `/ai:diff-to-pr` を使い、ユーザー承認前に commit / PR を進めない。

### 4. PR タイトル / 本文テンプレート

**PR タイトル形式**:

```
feat(task-spec-creator): UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 workflow close-out parity guard
```

**PR 本文テンプレート**:

```markdown
## サマリ

- Phase 12 close-out 時の三者 SSOT（`index.md` / root `artifacts.json` / `outputs/artifacts.json`）+ phase 本文 frontmatter（S4）の status drift を機械検証する parity guard を導入。
- 新規: `validate-closeout-parity.js`
- 拡張: `complete-phase.js`（atomic / rollback）/ `verify-all-specs.js`（parity gate 統合）
- reference 更新: `phase-12-completion-checklist.md` / `patterns-phase12-sync.md` / 両 skill の `SKILL.md` / `LOGS.md` / `error-handling.md` / `quality-requirements.md` / `topic-map.md` / `.agents/` ミラー

## 受け入れ基準（Phase 1 で定義）

- AC-1: validator が exit 0/1/2/3 と JSON code を契約通りに返す
- AC-2: drift レポートに phase / source / expected / actual の 4 項
- AC-3: `verify-all-specs.js` が parity drift で PASS を抑止
- AC-4: `complete-phase.js` が S1〜S3（および S4）を単一コマンドで同値更新
- AC-5: `phase-12-completion-checklist.md` に validator 実行が必須 gate として追加
- AC-6: `task-specification-creator` / `aiworkflow-requirements` 両 skill の reference / LOGS / SKILL.md / `.agents/` ミラーへ教訓還流
- AC-7: 既存完了 workflow への遡及修正なし（drift baseline は `outputs/phase-1/drift-inventory.md` に保存）

## テスト結果

- `pnpm vitest run .claude/skills/task-specification-creator/scripts/__tests__/`: PASS
- `pnpm lint` / `pnpm typecheck`: PASS
- `validate-closeout-parity.js --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 --json`: `code: PARITY_OK`, `exitCode: 0`（**自己適用 / dogfooding**）
- `verify-all-specs.js`（parity gate 含む統合実行）: PASS

## 検証コマンド

レビュー時は以下を実行してください:

\`\`\`bash
pnpm lint
pnpm typecheck
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
 --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 --json
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js
pnpm vitest run .claude/skills/task-specification-creator/scripts/**tests**/
\`\`\`

## 関連 Issue

- Refs: #2293（**CLOSED のまま**: 仕様策定段階で一度クローズされた Issue を、本 PR で実装まで到達。Issue を再オープンせず CLOSED のまま運用する）

## 範囲外（明示）

- 既存完了 workflow の drift 遡及修正（AC-7 により別タスク化）
- workflow テンプレート刷新
- Phase 定義の変更

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
```

### 5. PR 実行結果の確認

- PR が作成されていること
- CI（lint / typecheck / vitest / `verify-all-specs.js` / `validate-closeout-parity.js`）が通過していること
- PR 本文の Issue リンクが `Refs: #2293` で `Closes:` でないこと

### 6. フォールバック（必要時）

GitHub app / `gh` CLI が必要な場合は手動対応する。`gh` 認証エラー時はユーザーに通知し、手動操作の指示を仰ぐ。

## 成果物

| 成果物           | パス                                     | 説明                           |
| ---------------- | ---------------------------------------- | ------------------------------ |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 実施した確認の要約             |
| 変更サマリ       | `outputs/phase-13/change-summary.md`     | PR 説明の下書き                |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR URL 等                      |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | PR 作成後の記録（CI 結果含む） |

## 完了条件

- [ ] ユーザーへローカル動作確認を依頼している
- [ ] 変更サマリを提示し PR 作成の **明示的承認** を得ている
- [ ] PR 作成準備の記録が残っている（local-check-result.md / change-summary.md）
- [ ] PR が作成されている（`/ai:diff-to-pr` 経由）
- [ ] PR タイトルが `feat(task-spec-creator): UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 workflow close-out parity guard` 形式である
- [ ] PR 本文に Issue #2293 を `Refs:` で参照し、CLOSED のまま運用する旨が明記されている
- [ ] CI が通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが `completed-tasks/` へ移動されている
- [ ] `task-workflow.md` の残課題テーブルから本タスクのエントリが削除されている
- [ ] Phase 12 の `unassigned-task-detection.md` に記録された未タスクが後続タスクとして登録されている

## タスク100%実行確認【必須】

- [ ] ローカル確認結果が出力されている
- [ ] 変更サマリが出力されている
- [ ] PR 情報（URL）が出力されている
- [ ] PR 作成結果が出力されている
- [ ] Phase 12 の成果物参照が正しい
- [ ] Issue #2293 が CLOSED のままであることを確認している（再オープンしていない）
- [ ] `--no-verify` / `-n` を使用していない
- [ ] 既存完了 workflow への遡及修正が PR に含まれていない（AC-7）

## タスク全体完了

Phase 13 の完了後、本タスク（UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001）は完了。

- 本タスクの状態を「完了」に更新する
- `task-workflow.md` の残課題テーブルからエントリを削除する
- `task-workflow-completed.md` の completed ledger に追加する
- Phase 12 の `unassigned-task-detection.md` に記録された未タスクを後続タスクとして登録する
- タスクディレクトリを `docs/30-workflows/completed-tasks/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001/` へ移動する
- 自己適用 dogfooding の最終結果（`validate-closeout-parity.js --workflow . --json` の `PARITY_OK`）を `pr-creation-result.md` に再貼り付けし、guard が自身の close-out まで保証したことを構造的に記録する
