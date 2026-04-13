# Phase 13: PR作成

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase番号  | 13                                |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 機能名     | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 前提Phase  | Phase 12: ドキュメント更新        |
| 後続Phase  | PR作成・マージ待ち                |
| ステータス | blocked                           |
| 作成日     | 2026-04-12                        |

---

## 目的

全フェーズ（Phase 1〜12）の完了を確認し、ユーザーの明示的な承認が得られた場合にのみ `cronExpression` 意味論的バリデーション改善のプルリクエストを作成する。現時点では blocked を維持する。

---

## 重要: PR作成の前提条件

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

Phase 13 blocked 条件:

- ユーザーの承認が得られていない場合は PR 作成を実行しない
- ローカル確認が未完了の場合は PR 作成を実行しない
- Phase 12 までの成果物が揃っていない場合は PR 作成を実行しない
- 以下の全条件を満たした上でユーザーに承認を求める

---

## 実行タスク

### Task 13-1: PR 作成前チェック

PR 作成前に以下の全項目が満たされていることを確認する。

| 確認項目                                 | 確認方法                                                                                                                                                                             | 判定        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 全ユニットテスト PASS                    | `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | PASS / FAIL |
| TypeScript 型チェック 0エラー            | `pnpm --filter @repo/desktop exec tsc --noEmit`                                                                                                                                      | PASS / FAIL |
| ESLint 0エラー                           | `pnpm --filter @repo/desktop lint`                                                                                                                                                   | PASS / FAIL |
| Phase 10 受け入れ基準 AC-1〜AC-5 全 PASS | `outputs/phase-10/final-review-report.md`                                                                                                                                            | PASS / FAIL |
| Phase 11 手動テスト全シナリオ PASS       | `outputs/phase-11/manual-test-report.md`                                                                                                                                             | PASS / FAIL |
| Phase 12 ドキュメント全成果物存在        | `outputs/phase-12/` 配下の確認                                                                                                                                                       | PASS / FAIL |

### Task 13-2: ブランチ・コミット状態の確認

```bash
git status
git log --oneline -10
```

コミットが必要分だけ積まれていること・未コミットの変更がないことを確認する。

### Task 13-3: ユーザーへの承認依頼

PR 作成前に以下の情報をユーザーに提示し、承認を求める。

提示内容:

- PR タイトル（案）
- PR 本文（案）
- 変更ファイル一覧
- CI 確認コマンド
- `local-check-result.md` と `change-summary.md` の要約

### Task 13-4: PR 作成（ユーザー承認後のみ）

ユーザーの承認を得た後、以下のコマンドを実行する。

```bash
gh pr create \
  --title "feat(validator): cronExpression意味論的バリデーション追加 (TASK-CRON-SEMANTIC-VALIDATION-001)" \
  --body "$(cat <<'EOF'
## 概要

`scheduleConfigValidator.ts` の `validateCronExpression` 関数に意味論的バリデーションを追加した。

純 TypeScript の月末日テーブルを利用し、`0 9 31 2 *`（2月31日）や `0 9 30 2 *`（2月30日）のような存在しない日時だけを検出してエラーを返すようになった。

## 変更内容

- `validateCronSemantics()` 関数の追加
- バリデーション3段階フロー（構文 → 値域 → 意味論）の整理
- エラーメッセージ定数の一元管理
- ScheduleDialog / ConversationRoundStep へのエラー表示統合

## 関連 Issue

Closes #2082

## テスト

- ユニットテスト: 全件 PASS
- 手動テスト: 全4シナリオ PASS（`outputs/phase-11/manual-test-report.md` 参照）
- ドキュメント: `outputs/phase-12/phase12-task-spec-compliance-check.md` で整合確認済み

## タスクID

TASK-CRON-SEMANTIC-VALIDATION-001
EOF
)"
```

### Task 13-5: CI 確認

PR 作成後、CI の状態を確認する。

```bash
# CI 状態確認
gh pr checks

# 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# Lint
pnpm --filter @repo/desktop lint

# テスト
pnpm --filter @repo/desktop exec vitest run
```

CI が全て PASS であることを確認する。FAIL の場合は原因を調査し、修正コミットを追加する。

---

## 参照資料

| 参照資料                     | パス                                                     | 説明            |
| ---------------------------- | -------------------------------------------------------- | --------------- |
| 最終レビュー結果             | `outputs/phase-10/final-review-report.md`                | Phase 10 成果物 |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |
| 手動テスト総合レポート       | `outputs/phase-11/manual-test-report.md`                 | Phase 11 成果物 |
| 発見された問題               | `outputs/phase-11/discovered-issues.md`                  | Phase 11 成果物 |
| UIビジュアルレビュー         | `outputs/phase-11/ui-sanity-visual-review.md`            | Phase 11 成果物 |
| スクリーンショットメタデータ | `outputs/phase-11/phase11-capture-metadata.json`         | Phase 11 成果物 |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| システム仕様書更新サマリ     | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物 |
| コンプライアンスチェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

## 実行手順

### Step 1: PR 作成前チェックの実施

Task 13-1 の全項目を確認し、`outputs/phase-13/local-check-result.md` に記録する。

### Step 2: ブランチ・コミット状態の確認

```bash
git status
git log --oneline -10
```

### Step 3: PR 本文案の作成

Phase 12 の成果物をもとに PR タイトル・本文案を作成する。
あわせて `outputs/phase-13/change-summary.md` に変更要約を記録する。

### Step 4: ユーザーへの承認依頼

PR タイトル案・本文案・変更ファイル一覧を提示し、ユーザーの承認を待つ。

**ユーザーの承認なしに Step 5 以降を実行しないこと。**

### Step 5: PR 作成（承認後）

```bash
gh pr create --title "..." --body "..."
```

実行結果は `outputs/phase-13/pr-creation-result.md` に記録する。

### Step 6: PR URL の記録

作成された PR の URL を `outputs/phase-13/pr-info.md` に記録する。

### Step 7: CI 確認

```bash
gh pr checks
```

CI が全件 PASS になるまで状態を監視する。
確認結果は `outputs/phase-13/ci-check-result.md` に記録する。

---

## 統合テスト連携

Phase 13 は PR 作成フェーズのため統合テスト連携は不要。
ただし CI 確認（typecheck / lint / test）が全件 PASS であることを確認する。

---

## 成果物

| ファイル                                 | 説明             |
| ---------------------------------------- | ---------------- |
| `outputs/phase-13/local-check-result.md` | ローカル確認結果 |
| `outputs/phase-13/change-summary.md`     | 変更サマリー     |
| `outputs/phase-13/pr-info.md`            | PR URL 等の情報  |
| `outputs/phase-13/pr-creation-result.md` | PR 作成結果      |
| `outputs/phase-13/ci-check-result.md`    | CI 確認結果      |

---

## 完了条件

- [ ] PR 作成前チェックの全項目が PASS
- [ ] ユーザーの明示的な承認を得ている
- [ ] PR が正常に作成されている
- [ ] PR URL が `outputs/phase-13/pr-info.md` に記録されている
- [ ] CI（typecheck / lint / test）が全件 PASS
- [ ] CI FAIL の場合、修正コミットが追加されている

---

## サブタスク管理

| サブタスクID | 内容                          | ステータス                |
| ------------ | ----------------------------- | ------------------------- |
| 13-1         | PR 作成前チェック             | pending                   |
| 13-2         | ブランチ・コミット状態の確認  | pending                   |
| 13-3         | ユーザーへの承認依頼          | pending                   |
| 13-4         | PR 作成（ユーザー承認後のみ） | blocked（ユーザー未承認） |
| 13-5         | CI 確認                       | pending                   |

---

## タスク100%実行確認【必須】

Phase 13 完了前に以下を全て確認すること。

- [ ] 全サブタスク（13-1〜13-5）が完了またはスキップ理由が記録されている
- [ ] ユーザーの明示的な承認が記録されている
- [ ] PR が作成されている（ユーザー承認後）
- [ ] CI が全件 PASS
- [ ] 成果物ファイルが全て `outputs/phase-13/` に保存されている

---

## 次のPhase

**PR作成・マージ待ち**

- PR レビュアーからのフィードバックを受け、修正が必要な場合は修正コミットを追加する。
- マージ完了をもってタスク TASK-CRON-SEMANTIC-VALIDATION-001 を完了とする。
- マージ後、GitHub Issue #2082 をクローズする。
