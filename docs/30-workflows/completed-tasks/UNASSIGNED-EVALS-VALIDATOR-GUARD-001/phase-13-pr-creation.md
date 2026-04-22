# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 13                                               |
| 機能名       | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名     | skill-fixture-runner EVALS.json スキーマ検証追加 |
| 前提Phase    | Phase 12 完了 + ユーザーの明示承認               |
| 後続Phase    | -（完了）                                        |
| 作成日       | 2026-04-21                                       |
| ステータス   | pending                                          |
| GitHub Issue | #2325（CLOSED）                                  |

---

## 重要: ユーザーの明示的承認を得るまでPR作成は禁止

- **ユーザーの明示承認（例: 「PR作成して」「PRを出してください」）がない限り、PR 作成 / commit / push を一切行わない**
- ローカル確認（`pnpm lint` / `pnpm typecheck` / 関連テスト / dual root 同期確認）を省略しない
- commit / PR を自動で作らない
- `git push --no-verify` / `git commit --no-verify` を使用しない（プロジェクト規約により絶対禁止）
- worktree ブランチの無断 push 禁止（明示的な許可が必須）

---

## 目的

変更内容をローカルで最終確認し、変更サマリを提示してユーザーの承認を得た後にのみ PR 作成へ進む。本タスクは Issue #2325（CLOSED）と紐づいているため、PR 本文ではクローズ済み Issue の文脈をリンクし、Issue 再オープンや close 上書きを避ける。

---

## Issue #2325（CLOSED）の取扱い

- Issue #2325 は CLOSED のままで仕様書作成を継続している（タスク文脈に記載のとおり）
- PR 本文では `Refs: #2325` 形式で参照し、`Closes: #2325` を **使わない**（既に CLOSED であるため）
- Issue が CLOSED であることを PR 本文に明記し、誤って再オープンしないよう注意書きを残す

---

## 実行タスク

1. ローカル動作確認をユーザーに依頼する
2. 変更サマリ（ファイル一覧 / テスト結果 / 検証コマンド）を提示して PR 作成許可を確認する
3. 許可後に `/ai:diff-to-pr` または同等の承認済み PR 作成フローで PR 作成を実施する
4. CI が通過していることを確認する
5. `task-workflow.md` の残課題テーブルからエントリを削除し、tasks ディレクトリを `completed-tasks/` へ移動する

---

## 事前チェックリスト（PR 作成前の確認）

### コミット確認

- [ ] `git status` で意図しない変更ファイルが含まれていないことを確認
- [ ] `git diff HEAD` で変更内容を最終確認
- [ ] `--no-verify` を使用していないことを確認

### テスト確認

- [ ] `pnpm lint` が PASS していること
- [ ] `pnpm typecheck` が PASS していること
- [ ] `pnpm vitest run` で関連テストが PASS していること

### dual root 同期確認

- [ ] `diff -u .claude/skills/skill-fixture-runner/EVALS.json .agents/skills/skill-fixture-runner/EVALS.json` の差分がゼロ
- [ ] `validate-evals.js --all-skills` が `exit=0` で完了すること
- [ ] `run-all-validations.js` が PASS していること

---

## 参照資料

| 資料名                   | パス                                                                                    | 説明                   |
| ------------------------ | --------------------------------------------------------------------------------------- | ---------------------- |
| 最終レビュー             | `outputs/phase-10/final-review-result.md`                                               | Phase 10 成果物        |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                                | Phase 11 成果物        |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`                                              | Part 1 / Part 2        |
| システム仕様更新サマリ   | `outputs/phase-12/system-spec-update-summary.md`                                        | Step 1-A〜1-G / Step 2 |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`                                           | validator 実行結果     |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`                                         | follow-up 候補         |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`                                             | L-EVALS-VALIDATOR-001  |
| コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                | 最終ゲート             |
| Phase 13 詳細            | `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md` | PR 作成手順            |

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーへ以下のローカル動作確認を依頼する:

```bash
# Lint / typecheck
pnpm lint
pnpm typecheck

# EVALS.json 検証（全スキル）
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills

# 統合バリデーション実行
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js

# 関連スクリプトのユニットテスト
pnpm vitest run .claude/skills/skill-fixture-runner/scripts/__tests__/

# dual root 同期確認
diff -u .claude/skills/skill-fixture-runner/EVALS.json \
        .agents/skills/skill-fixture-runner/EVALS.json
```

確認結果を `outputs/phase-13/local-check-result.md` に記録する。

### 2. 変更サマリの提示と許可確認【必須】

以下を `outputs/phase-13/change-summary.md` に記述してユーザーへ提示し、PR 作成可否の明示承認を得る:

- 変更ファイル一覧（新規 / 拡張 / reference 更新を分類）
- テスト結果（`pnpm vitest run` / `run-all-validations.js` / `validate-evals.js` の exit code）
- 検証コマンド（手動テスト MT-001〜MT-007 の再実行コマンド）
- 関連 Issue: #2325（**CLOSED のまま運用**）

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

### 4. PRタイトル案

```
feat(skill-fixture-runner): EVALS.json validator 追加（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）
```

### 5. PRの説明テンプレート

```markdown
## Summary

- `skill-fixture-runner` に `validate-evals.js` を新規追加し、EVALS.json の L1/L2/L3 スキーマ検証を実現
- L1: JSON パース検証（破損 JSON を即時検出）
- L2: 必須キー検証（方言許容モード / strict モードの切り替えあり）
- L3: dual root 一致検証（`.claude/` と `.agents/` の 6 スキル全件 diff 検証）
- `run-all-validations.js` に `validate-evals.js` を統合し、1 コマンドで全 validator を起動可能に
- fixture EVALS.json の除外 allowlist を実装し SKILL.md に明記

## Changes

### 新規追加

- `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`: 3 層（L1/L2/L3）EVALS.json 検証スクリプト

### 拡張

- `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`: `validate-evals.js` の統合起動

### ドキュメント更新

- `.claude/skills/skill-fixture-runner/SKILL.md`: fixture 除外 allowlist・実行手順の追記
- `.claude/skills/skill-fixture-runner/LOGS.md`: 変更履歴追記
- `.agents/skills/skill-fixture-runner/` 配下: mirror parity 同期

## Test plan

- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm vitest run .claude/skills/skill-fixture-runner/scripts/__tests__/` PASS
- [ ] `validate-evals.js --all-skills` が `exit=0` で完了する
- [ ] `run-all-validations.js` が PASS する
- [ ] 破損 JSON を渡した際に `exit=1` でエラーメッセージが出力される
- [ ] `.agents/` 側を差分化した際に L3 エラーが `exit=1` で検出される
- [ ] fixture EVALS.json が allowlist により検証対象外になる
- [ ] `diff -u .claude/skills/skill-fixture-runner/EVALS.json .agents/skills/skill-fixture-runner/EVALS.json` の差分がゼロ

## Related issues

- Refs: #2325（**CLOSED のまま**: 本 PR で実装完了。Issue を再オープンせず CLOSED のまま運用する）

## 範囲外（明示）

- EVALS.json の評価コンテンツ品質検証（→ UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 で対応予定）
- 6 スキル間の方言統一（→ UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 で対応予定）

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`
```

### 6. PR 実行結果の確認

- PR が作成されていること
- CI（lint / typecheck / vitest / `run-all-validations.js` / `validate-evals.js`）が通過していること
- PR 本文の Issue リンクが `Refs: #2325` で `Closes:` でないこと

### 7. フォールバック（必要時）

GitHub app / `gh` CLI が必要な場合は手動対応する。`gh` 認証エラー時はユーザーに通知し、手動操作の指示を仰ぐ。

---

## 成果物

| 成果物           | パス                                     | 説明                           |
| ---------------- | ---------------------------------------- | ------------------------------ |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 実施した確認の要約             |
| 変更サマリ       | `outputs/phase-13/change-summary.md`     | PR 説明の下書き                |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR URL 等                      |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | PR 作成後の記録（CI 結果含む） |

---

## 完了条件

- [ ] ユーザーへローカル動作確認を依頼している
- [ ] 変更サマリを提示し PR 作成の **明示的承認** を得ている
- [ ] PR 作成準備の記録が残っている（`local-check-result.md` / `change-summary.md`）
- [ ] PR が作成されている（`/ai:diff-to-pr` 経由）
- [ ] PR タイトルが `feat(skill-fixture-runner): EVALS.json validator 追加（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）` 形式である
- [ ] PR 本文に Issue #2325 を `Refs:` で参照し、CLOSED のまま運用する旨が明記されている
- [ ] CI が通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが `completed-tasks/` へ移動されている
- [ ] `task-workflow.md` の残課題テーブルから本タスクのエントリが削除されている
- [ ] Phase 12 の `unassigned-task-detection.md` に記録された未タスクが後続タスクとして登録されている

---

## タスク100%実行確認【必須】

- [ ] ローカル確認結果が出力されている
- [ ] 変更サマリが出力されている
- [ ] PR 情報（URL）が出力されている
- [ ] PR 作成結果が出力されている
- [ ] Phase 12 の成果物参照が正しい
- [ ] Issue #2325 が CLOSED のままであることを確認している（再オープンしていない）
- [ ] `--no-verify` / `-n` を使用していない
- [ ] `diff -u` による dual root 差分ゼロを確認している

---

## タスク全体完了

Phase 13 の完了後、本タスク（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）は完了。

- 本タスクの状態を「完了」に更新する
- `task-workflow.md` の残課題テーブルからエントリを削除する
- `task-workflow-completed.md` の completed ledger に追加する
- Phase 12 の `unassigned-task-detection.md` に記録された後続タスク候補（UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 / UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001）を後続タスクとして登録する
- タスクディレクトリを `docs/30-workflows/completed-tasks/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/` へ移動する
