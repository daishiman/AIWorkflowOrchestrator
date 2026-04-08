# Phase 13: PR作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| Phase名    | PR作成                          |
| 前提Phase  | Phase 12                        |
| 後続Phase  | マージ                          |
| ステータス | ユーザー指示待ち（blocked）     |
| 作成日     | 2026-04-08                      |
| 機能名     | skill-wizard-runtime-validation |

---

## 目的

ユーザーの明示的な承認後にコミット・PR作成を行い、実装をリモートリポジトリへ反映する。

---

## 重要警告

> **PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

Phase 12 完了後、AIは以下のメッセージをユーザーに提示し、承認を待つ。

```
Phase 12 が完了しました。
以下の変更を含むコミット・PRを作成してよいですか？

変更ファイル（実際の差分）:
- 実装/テスト: `packages/shared/src/types/skillInfoFormValidation.ts`、`packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts`
- 公開エクスポート: `packages/shared/src/types/index.ts`

「はい」または「PR作成してください」と回答した場合のみ実行します。
```

---

## 実行タスク（ユーザー承認後のみ実行）

### タスク1: ローカル品質チェック（最終確認）

**目的**: コミット前に typecheck / lint / test を最終確認する

**実行手順**:

```bash
# TypeScript型チェック
pnpm --filter @repo/shared typecheck

# Lintチェック
pnpm --filter @repo/shared lint

# テスト実行
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
```

**期待成果物**: `outputs/phase-13/local-check-result.md`

全項目0エラー・全テストPASSであることを確認してから次のタスクへ進む。

---

### タスク2: コミット作成

**目的**: 変更ファイルをステージングし、コミットを作成する

**実行手順**:

```bash
git add packages/shared/src/types/skillInfoFormValidation.ts \
         packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts \
         packages/shared/src/types/index.ts
git commit -m "feat(skill-wizard): UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 SkillInfoFormData ランタイムバリデーション実装"
```

**注意事項**:

- `--no-verify` オプションは **絶対に使用禁止**
- pre-commit フック（lint-staged）が失敗した場合は原因を修正してから再実行する
- コミット対象は `git status` で確認した本タスク関連差分のみに限定すること

**期待成果物**: コミット作成完了（コミットハッシュを `outputs/phase-13/change-summary.md` に記録）

---

### タスク3: PR作成（ブランチ作成・push・PR作成）

**目的**: リモートリポジトリへpushし、GitHubにPRを作成する

**実行手順**:

```bash
# フィーチャーブランチ作成（未作成の場合）
git checkout -b feat/skill-wizard-runtime-validation-ut-w0

# リモートへpush
git push -u origin feat/skill-wizard-runtime-validation-ut-w0

# PR作成
gh pr create \
  --title "feat(skill-wizard): SkillInfoFormData ランタイムバリデーション実装" \
  --body "$(cat <<'EOF'
## Summary

- `SkillInfoFormData` に対するランタイムバリデーション関数を新規実装
- エラーメッセージを全て日本語で定義（AC-4）
- ピュア関数として実装し、UIコンポーネント・IPCへの依存なし
- Phase 12 の Step 1-A〜1-G / Step 2 判定結果をドキュメントへ記録

## Test plan

- [ ] `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts` が全件PASSすること
- [ ] `pnpm --filter @repo/shared typecheck` が 0エラーで完了すること
- [ ] `pnpm --filter @repo/shared lint` が 0エラーで完了すること

## 関連Issue

Closes #1999
EOF
)"
```

**期待成果物**: `outputs/phase-13/pr-info.md`（PR URL・PR番号を記録）

---

### タスク4: CI確認

**目的**: PRに対するCIが全て成功することを確認する

**実行手順**:

```bash
# CI状態の確認
gh pr checks <PR番号>
```

**確認観点**:

- [ ] typecheck が成功していること
- [ ] lint が成功していること
- [ ] test が全件PASSしていること
- [ ] CI全チェックが green であること

CIが失敗した場合は原因を特定し、修正コミットを追加してから再確認する。

**期待成果物**: `outputs/phase-13/pr-ready-report.md`（CI結果・最終ステータスを記録）

---

## PR本文テンプレート

| 項目      | 内容                                                                 |
| --------- | -------------------------------------------------------------------- |
| タイトル  | `feat(skill-wizard): SkillInfoFormData ランタイムバリデーション実装` |
| Summary   | 変更内容の箇条書き（3点以内）                                        |
| Test plan | テスト実行方法のチェックリスト                                       |
| 関連Issue | `Closes #1999`                                                       |

### Summary（箇条書き3点）

- `SkillInfoFormData` に対するランタイムバリデーション関数を新規実装し、`packages/shared/src/types/index.ts` へ公開エクスポートを追加
- エラーメッセージを全て日本語で定義（AC-4）
- ピュア関数として実装し、UIコンポーネント・IPCへの依存なし

### Test plan

- [ ] `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts` が全件PASSすること
- [ ] `pnpm --filter @repo/shared typecheck` が 0エラーで完了すること
- [ ] `pnpm --filter @repo/shared lint` が 0エラーで完了すること

---

## 参照資料

| 資料名                       | パス                                                     | 説明                     |
| ---------------------------- | -------------------------------------------------------- | ------------------------ |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了証明        |
| AC検証ドキュメント           | `outputs/phase-10/ac-verification.md`                    | AC-1〜AC-5 全達成の証拠  |
| 品質チェック結果             | `outputs/phase-9/quality-check-result.md`                | typecheck/lint/test 結果 |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物          |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物          |
| 発見事項                     | `outputs/phase-11/discovered-issues.md`                  | Phase 11 成果物          |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物          |
| システム仕様書更新サマリ     | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物          |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物          |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物          |

---

## 成果物

| 成果物                   | 配置先                                   | 形式     |
| ------------------------ | ---------------------------------------- | -------- |
| ローカル品質チェック結果 | `outputs/phase-13/local-check-result.md` | Markdown |
| 変更サマリ               | `outputs/phase-13/change-summary.md`     | Markdown |
| PR情報                   | `outputs/phase-13/pr-info.md`            | Markdown |
| PR完了レポート           | `outputs/phase-13/pr-ready-report.md`    | Markdown |

---

## 完了条件

- [ ] ユーザーから明示的な承認を得ていること（**自動実行禁止**）
- [ ] ローカル品質チェック（typecheck / lint / test）が全項目PASSであること
- [ ] コミットが作成され、本タスク関連差分のみが含まれていること
- [ ] `--no-verify` を使用せずにコミットが完了していること
- [ ] PRが作成され、PR URLが `outputs/phase-13/pr-info.md` に記録されていること
- [ ] CI全チェックが green であることが `outputs/phase-13/pr-ready-report.md` に記録されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクの成果物ファイルが全て生成されていることを確認
- [ ] PR URL をユーザーに報告する

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が全6タスク完了していること
- **後続**: マージ（レビュアーによる承認後）

---

## PR作成後の完了宣言

PR作成・CI確認が完了した後、以下を宣言する。

```
タスク UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 の実装が完了しました。

PR: <PR URL>
関連Issue: #1999

変更ファイル:
- 実装/テスト差分（必須）
- 公開エクスポート差分（該当時）

受入基準:
- AC-1: PASS（skillName空白チェック実装済み）
- AC-2: PASS（purpose最小文字数チェック実装済み）
- AC-3: PASS（ユニットテスト全件PASS）
- AC-4: PASS（エラーメッセージ全て日本語）
- AC-5: PASS（typecheck 0エラー）
```
