# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| Phase        | 13                                                  |
| 機能名       | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| タスク名     | qualityInsights 現行定義を2 skillへ整合反映         |
| タスク種別   | docs-only（コード変更なし）                         |
| 前提Phase    | Phase 12 完了 + ユーザーの明示承認                  |
| 後続Phase    | -（完了）                                           |
| 作成日       | 2026-04-21                                          |
| ステータス   | blocked                                             |
| GitHub Issue | #2327（CLOSED）                                     |

---

## 重要: ユーザー明示承認がない限り blocked【禁止事項】

- **ユーザーの明示承認（例: 「PR作成して」「PRを出してください」）がない限り、PR 作成 / commit / push を一切行わない**
- ローカル確認（`pnpm lint` / `pnpm typecheck` / 関連確認コマンド）を省略しない
- commit / PR を自動で作らない
- `git push --no-verify` / `git commit --no-verify` を使用しない（プロジェクト規約により絶対禁止）
- worktree ブランチの無断 push 禁止（明示的な許可が必須）
- 既存仕様書の他セクションへの意図しない変更を PR に含めない

**PR blocked until user approval**

---

## 目的

> **2026-04-21 current facts 補正**: Phase 13 は blocked のままだが、PR 説明で参照すべき current facts は「10 実フィールド + 11 検証ポイント」「close-out ledger / topic-map / mirror parity 同期済み」である。

変更内容をローカルで最終確認し、変更サマリを提示してユーザーの承認を得た後にのみ PR 作成へ進む。

本タスクは GitHub Issue #2327（CLOSED）と紐づいているため、PR 本文ではクローズ済み Issue の文脈をリンクし、Issue 再オープンや close 上書きを避ける。

docs-only タスクのため、PR の変更内容は Markdown 仕様書ファイルのみ（コード変更なし）であることを明記する。

---

## Issue #2327（CLOSED）の取扱い

- Issue #2327 は CLOSED のままで仕様書作成を継続している（タスク文脈に記載のとおり）
- PR 本文では `Refs: #2327` 形式で参照し、`Closes: #2327` を **使わない**（既に CLOSED であるため）
- Issue が CLOSED であることを PR 本文に明記し、誤って再オープンしないよう注意書きを残す
- **GitHub Issue #2327 は CLOSED のまま維持する**

---

## 実行タスク

1. ローカル動作確認を実施する（docs-only のため lint / typecheck の確認のみ）
2. 変更サマリ（ファイル一覧 / 確認結果）を提示して PR 作成許可を確認する
3. 許可後に `/ai:diff-to-pr` または同等の承認済み PR 作成フローで PR 作成を実施する
4. CI が通過していることを確認する
5. ユーザーが明示承認した場合のみ、完了台帳更新とタスクディレクトリ移動を実施する

---

## 参照資料

| 資料名                   | パス                                                     | 説明                                   |
| ------------------------ | -------------------------------------------------------- | -------------------------------------- |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物                        |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物（NON_VISUAL 判定根拠） |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`              | AC トレース                            |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2                        |
| システム仕様更新サマリ   | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-F / SKILL-changelog 確認   |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`            | LOGS.md / SKILL.md 更新記録            |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 候補                         |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善提案                               |
| コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終ゲート                             |
| 出荷準備チェックリスト   | `outputs/phase-10/shipping-checklist.md`                 | Phase 10 成果物                        |

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーへ以下のローカル確認を依頼する:

```bash
# docs-only タスクのため lint / typecheck の確認
pnpm lint
pnpm typecheck

# 11フィールド追記の最終確認
grep -n "qualityInsights\\." .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md | wc -l
# 期待: 11以上のマッチ

# mirror sync 最終確認
diff -qr .claude/skills/ .agents/skills/
# 期待: 出力 0 行

# 意図しない変更がないことの確認
git diff --stat
# 期待: Markdown 仕様書ファイルのみが変更対象
```

確認結果を `outputs/phase-13/local-check-result.md` に記録する。

### 2. 変更サマリの提示と許可確認【必須】

以下を `outputs/phase-13/change-summary.md` に記述してユーザーへ提示し、PR 作成可否の明示承認を得る:

- 変更ファイル一覧（追記対象仕様書・両 skill の LOGS / SKILL / `.agents/` ミラーを分類）
- 確認結果（11 フィールド追記確認 / mirror sync 差分ゼロ / lint / typecheck の pass）
- 関連 Issue: #2327（**CLOSED のまま運用**）
- docs-only タスクのため変更はすべて Markdown ファイルのみ（コード変更なし）
- スクリーンショット: N/A（NON_VISUAL タスクのため不要）

**重要**: ユーザーから明示的な許可（例: 「PRを作成して」）を得るまで、PR 作成 / commit / push を実施しない。

### 3. PR 作成準備

許可後にのみ PR 作成へ進む。`/ai:diff-to-pr` を実行する前に、以下を確認する:

**実施前の確認対象**:

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

### 4. PR タイトル・本文テンプレート

**PR タイトル形式**:

```
docs(evals-spec): UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 qualityInsights 11フィールドを正本へ追記
```

**PR 本文テンプレート**:

```markdown
## サマリ

- `qualityInsights.*` 11 フィールドの役割・writer・運用責任を正本仕様書へ追加。
- 追記対象: `references/` 配下の qualityInsights 関連仕様書
- docs-only タスク（コード変更なし）

## 変更内容

- qualityInsights の 11 フィールド全てに以下を追記:
  - 各フィールドの役割（description）
  - 各フィールドの writer（書き込み主体）
  - 各フィールドの運用責任（operational ownership）
- 両 skill の SKILL.md / LOGS.md へ完了記録を追記
- mirror sync 確認（`.claude/` ↔ `.agents/` 差分ゼロ）

## 受け入れ基準（Phase 1 で定義）

- AC-1: qualityInsights の 11 フィールド全てが正本仕様書に追記されている
- AC-2: 各フィールドに役割が明記されている
- AC-3: 各フィールドに writer が明記されている
- AC-4: 各フィールドに運用責任が明記されている
- AC-5: コード変更が一切含まれていない（docs-only 制約の遵守）
- AC-6: mirror sync 差分が 0 件
- AC-7: 既存仕様書の他セクションへの意図しない変更がない

## 確認コマンド

レビュー時は以下を実行してください:

\`\`\`bash

# 11フィールド追記確認

grep -n "qualityInsights\\." .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md | wc -l

# mirror sync 確認

diff -qr .claude/skills/ .agents/skills/

# 意図しない変更なし確認

git diff --stat
\`\`\`

## テスト結果

- 11 フィールド全追記確認: PASS
- mirror sync 差分: 0 件
- docs-only 制約の遵守: コード変更なし
- Phase 11 手動テスト（NON_VISUAL）: PASS
- Phase 9 品質保証: 全品質ゲート PASS

## 関連 Issue

- Refs: #2327（**CLOSED のまま**: タスク文脈で仕様書作成として定義。Issue を再オープンせず CLOSED のまま運用する）

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要（NON_VISUAL タスク）。
```

### 5. CI 確認手順

```bash
# PR 作成後の CI 確認
gh pr checks <PR番号>

# または PR URL から確認
gh pr view <PR番号> --web
```

CI が通過していることを確認する。docs-only タスクのため、コード系 CI（typecheck / unit test）は変更なし扱いとなるが、lint は通過必須。

### 6. タスク完了処理

PR マージ後に以下を実施する:

- ユーザー承認後に限り、完了台帳へ同期し未完了台帳から整理する
- タスクディレクトリを `docs/30-workflows/completed-tasks/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/` へ移動する
- **GitHub Issue #2327 は CLOSED のまま維持する（再オープン禁止）**
- Phase 12 の `unassigned-task-detection.md` に記録された未タスクを後続タスクとして登録する

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
- [ ] PR タイトルが `docs(evals-spec): UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 qualityInsights 11フィールドを正本へ追記` 形式である
- [ ] PR 本文に Issue #2327 を `Refs:` で参照し、CLOSED のまま運用する旨が明記されている
- [ ] CI が通過している
- [ ] **GitHub Issue #2327 が CLOSED のまま維持されている（再オープンしていない）**
- [ ] タスクディレクトリが `completed-tasks/` へ移動されている
- [ ] ユーザー承認後の close-out 手順が明記されている

---

## タスク100%実行確認【必須】

- [ ] ローカル確認結果が出力されている
- [ ] 変更サマリが出力されている
- [ ] PR 情報（URL）が出力されている
- [ ] PR 作成結果が出力されている
- [ ] PR 本文に docs-only タスク（コード変更なし）の旨が明記されている
- [ ] PR 本文にスクリーンショット不要（NON_VISUAL）の旨が明記されている
- [ ] Issue #2327 が CLOSED のままであることを確認している（再オープンしていない）
- [ ] `--no-verify` / `-n` を使用していない
- [ ] 既存仕様書の他セクションへの意図しない変更が PR に含まれていない

---

## 多角的チェック観点

| 観点           | チェック内容                                                                              |
| -------------- | ----------------------------------------------------------------------------------------- |
| ユーザー承認   | PR 作成前にユーザーの明示承認を得ているか                                                 |
| docs-only      | PR の変更内容がすべて Markdown ファイルのみであるか（コード変更が混入していないか）       |
| Issue 取扱い   | Issue #2327 が CLOSED のまま維持されているか（`Refs:` のみで `Closes:` を使っていないか） |
| CI 確認        | CI（少なくとも lint）が通過していることを確認しているか                                   |
| タスク完了処理 | `completed-tasks/` への移動と完了台帳更新が承認後にのみ実行される設計になっているか       |

---

## サブタスク管理

1. ローカル動作確認の実施・記録
2. 変更サマリの作成・提示
3. ユーザーの明示承認の取得（**blocked until approval**）
4. PR 作成（`/ai:diff-to-pr` 経由）
5. CI 確認
6. タスク完了処理（承認後のみ `completed-tasks/` 移動・完了台帳更新）

---

## タスク全体完了

Phase 13 の完了後、本タスク（UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001）は完了。

- 本タスクの状態を「完了」に更新する
- 承認前は close-out 系コマンドを実行しない
- Phase 12 の `unassigned-task-detection.md` に記録された未タスクを後続タスクとして登録する
- タスクディレクトリを `docs/30-workflows/completed-tasks/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/` へ移動する
- **GitHub Issue #2327 は CLOSED のまま維持する（再オープン禁止）**
