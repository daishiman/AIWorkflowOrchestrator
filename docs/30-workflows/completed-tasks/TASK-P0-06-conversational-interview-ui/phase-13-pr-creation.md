# Phase 13: PR作成・CI確認 - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| Phase名    | PR作成・CI確認                         |
| 前提Phase  | Phase 12（ドキュメント更新）           |
| 後続Phase  | なし（本タスク完了）                   |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

TASK-P0-06 の全成果物をPull Requestとして作成し、CIパイプラインでの検証を完了させる。ユーザーの明示的な承認なしにcommitやPR作成を行わないことを厳守する。

## 背景

TASK-P0-06 は Phase 1〜12 を経て、会話型インタビューUIの実装・テスト・ドキュメントが完了した状態である。本Phaseでは以下を実施する：

1. ローカル環境での最終品質チェック（typecheck, lint, test）
2. ユーザー承認の取得
3. コミット・PR作成
4. CI/CDパイプラインの確認

**重要ルール**: ユーザーの明示承認なしにcommit/PR作成を絶対に行わない。

---

## 実行タスク

### タスク1: Phase 12 完了根拠の確認

**目的**: PR作成の前提条件として、Phase 12 までの全成果物が完了していることを確認する。

**チェックリスト**:

| Phase    | 完了確認 | 根拠ファイル                                                                                                                                                                                                                                                                                             |
| -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1  | 未確認   | `phase-1-requirements.md`                                                                                                                                                                                                                                                                                |
| Phase 2  | 未確認   | `phase-2-design.md`                                                                                                                                                                                                                                                                                      |
| Phase 3  | 未確認   | `phase-3-design-review.md`                                                                                                                                                                                                                                                                               |
| Phase 4  | 未確認   | 実装コード                                                                                                                                                                                                                                                                                               |
| Phase 5  | 未確認   | 実装コード                                                                                                                                                                                                                                                                                               |
| Phase 6  | 未確認   | 実装コード                                                                                                                                                                                                                                                                                               |
| Phase 7  | 未確認   | 実装コード                                                                                                                                                                                                                                                                                               |
| Phase 8  | 未確認   | 実装コード                                                                                                                                                                                                                                                                                               |
| Phase 9  | 未確認   | コードレビュー結果                                                                                                                                                                                                                                                                                       |
| Phase 10 | 未確認   | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                                |
| Phase 11 | 未確認   | `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/discovered-issues.md` / `outputs/phase-11/ui-sanity-visual-review.md`                                                                                                                                                                       |
| Phase 12 | 未確認   | `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` |

Phase 12 の完了条件が全て満たされていない場合は、Phase 12 に戻って不足分を補完する。

---

### タスク2: ローカル品質チェック

**目的**: CI に送る前にローカル環境で品質チェックを実施し、CI失敗を未然に防ぐ。

**実行コマンド**:

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLintチェック
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test
```

**追加チェック**:

```bash
# 共有パッケージのビルド確認（依存先が壊れていないか）
pnpm --filter @repo/shared build

# 全パッケージの型チェック（オプション、時間に余裕がある場合）
pnpm typecheck
```

**結果記録**: 各コマンドの実行結果を `outputs/phase-13/local-check-result.md` に記録する。

| チェック項目         | コマンド                                | 結果   | エラー数 | 備考 |
| -------------------- | --------------------------------------- | ------ | -------- | ---- |
| TypeScript型チェック | `pnpm --filter @repo/desktop typecheck` | 未実施 | -        | -    |
| ESLint               | `pnpm --filter @repo/desktop lint`      | 未実施 | -        | -    |
| テスト               | `pnpm --filter @repo/desktop test`      | 未実施 | -        | -    |
| 共有パッケージビルド | `pnpm --filter @repo/shared build`      | 未実施 | -        | -    |

エラーが検出された場合は修正してから再実行する。全チェックがPassするまでタスク3に進まない。

---

### タスク3: 変更サマリー作成

**目的**: PRの本文に使用する変更サマリーを作成する。

**実行手順**:

1. `git diff main --stat` で変更ファイル一覧を取得する
2. `git diff main --shortstat` で変更行数サマリーを取得する
3. 以下の形式で `outputs/phase-13/change-summary.md` を作成する：

```markdown
# Change Summary - TASK-P0-06

## 概要

会話型インタビューUIの実装。5種InputKind対応、apiKeyStatusガイダンスバナー、undo機能、進捗バー連携。

## 変更統計

- 変更ファイル数: X files
- 追加行数: +XXX
- 削除行数: -XXX

## 主要変更ファイル

| ファイル             | 変更概要           |
| -------------------- | ------------------ |
| （git diffから取得） | （変更内容の要約） |

## 依存タスク

- RT-04（APIキー管理UI）: 連携済み
- RT-05（multi_select型定義）: 暫定対応（canonical化は別タスク）

## 未タスク

- UT-P0-06-CANONICAL-SYNC-001: 正本仕様同期（RT-05完了後）
- UT-P0-06-PHASE11-EVIDENCE-001: エビデンス保管
```

---

### タスク4: ユーザー承認の取得

**目的**: commit/PR作成の前にユーザーの明示的な承認を得る。

**重要**: このタスクはユーザーとの対話が必要であり、自動実行してはならない。

**承認リクエスト時に提示する情報**:

1. ローカルチェック結果（タスク2）
2. 変更サマリー（タスク3）
3. Phase 12 完了根拠（タスク1）
4. blockedの有無（タスク5参照）

**承認記録**:

| 項目        | 内容                            |
| ----------- | ------------------------------- |
| 承認日時    | （ユーザー承認後に記入）        |
| 承認者      | （ユーザー名）                  |
| 承認方法    | 対話での明示承認                |
| blocked理由 | なし / （ある場合は理由を記載） |

---

### タスク5: Blocked状態の確認

**目的**: PR作成をブロックする要因がないかを確認する。

**ブロック要因チェック**:

| #    | ブロック要因                                  | 状態   | 対応                                               |
| ---- | --------------------------------------------- | ------ | -------------------------------------------------- |
| B-01 | ローカルチェック（typecheck/lint/test）に失敗 | 未確認 | 失敗時はPhase 4-8に戻って修正                      |
| B-02 | Phase 11 で Critical問題が検出されている      | 未確認 | Critical問題が残っている場合はPR作成不可           |
| B-03 | 依存タスク（RT-04）が未マージ                 | 未確認 | 未マージの場合はbase branchの変更またはblocked記録 |
| B-04 | ユーザー承認が得られていない                  | 未確認 | 承認なしではcommit/PR作成を行わない                |

全ブロック要因がクリアされた場合のみ、タスク6に進む。

---

### タスク6: コミット・PR作成

**目的**: 承認後、変更をcommitしPull Requestを作成する。

**前提**: タスク4のユーザー承認が得られていること。

**実行手順**:

1. 変更をステージングする

```bash
git add -A
```

2. コミットを作成する

```bash
git commit -m "feat(desktop): TASK-P0-06 会話型インタビューUI実装

- 5種InputKind（single_select, multi_select, free_text, secret, confirm）対応
- apiKeyStatusガイダンスバナー追加
- undo/rollback機能実装
- InterviewProgressBar連携
- 手動テスト・ドキュメント完了

Closes #1889"
```

3. リモートにプッシュする

```bash
git push -u origin <branch-name>
```

4. PRを作成する

```bash
gh pr create \
  --title "feat(desktop): TASK-P0-06 会話型インタビューUI" \
  --body "$(cat <<'EOF'
## Summary
- 5種InputKind対応の会話型インタビューUI実装
- apiKeyStatusガイダンスバナー・undo機能・進捗バー連携
- Phase 1-12の全工程完了

## Changes
（`outputs/phase-13/change-summary.md` の内容を転記）

## Test plan
- [ ] Phase 10 最終レビュー: 全Pass
- [ ] Phase 11 手動テスト: 全11シナリオPass、Critical問題0件
- [ ] ローカルチェック: typecheck/lint/test 全Pass

## Related
- Closes #1889
- 依存: RT-04（APIキー管理UI）
- 未タスク: UT-P0-06-CANONICAL-SYNC-001, UT-P0-06-PHASE11-EVIDENCE-001
EOF
)"
```

**PR情報を `outputs/phase-13/pr-info.md` に記録する**:

| 項目           | 内容             |
| -------------- | ---------------- |
| PR番号         | （作成後に記入） |
| PR URL         | （作成後に記入） |
| ブランチ       | （ブランチ名）   |
| ベースブランチ | main             |
| 作成日時       | （作成後に記入） |

---

### タスク7: CI/CD確認

**目的**: PRに対するCIパイプラインの実行結果を確認する。

**確認コマンド**:

```bash
# CI実行状況の確認
gh pr checks <PR番号>

# CI失敗時の詳細確認
gh run view <run-id> --log-failed
```

**CI確認項目**:

| #     | チェック                             | 期待結果 |
| ----- | ------------------------------------ | -------- |
| CI-01 | TypeScript型チェック                 | Pass     |
| CI-02 | ESLint                               | Pass     |
| CI-03 | Vitest / Jest テスト                 | Pass     |
| CI-04 | Playwright E2Eテスト（該当する場合） | Pass     |
| CI-05 | ビルド                               | Pass     |

**CI失敗時の対応**:

1. 失敗ログを確認する
2. ローカルで再現・修正する
3. 追加コミットをプッシュする（`--no-verify` は使用禁止）
4. CIの再実行を確認する

---

## 参照資料

| 資料                    | パス/参照先                                                                                                                                                                                                                                                                                              | 用途                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/discovered-issues.md` / `outputs/phase-11/ui-sanity-visual-review.md`                                                                                                                                                                       | Critical問題・視覚レビュー確認 |
| Phase 12 ドキュメント   | `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了根拠                       |
| Git操作禁止事項         | `CLAUDE.md`                                                                                                                                                                                                                                                                                              | --no-verify禁止ルール          |
| GitHub CLI              | `gh` コマンド                                                                                                                                                                                                                                                                                            | PR作成・CI確認                 |

---

## 統合テスト連携【必須】

Phase 13 では新規の統合テストは実施しないが、以下を確認する：

- **CI上の統合テスト**: CIパイプラインに含まれる統合テスト（E2Eテスト等）が全てPassしていることを確認
- **Phase 11 統合テスト結果の反映**: PR本文に Phase 11 の手動統合テスト結果（IT-01〜IT-05）が記載されていることを確認
- **IPC接続の健全性**: CI環境でのビルドが成功し、IPC関連の型エラーがないことを確認

---

## 成果物

| 成果物               | ファイル名                               | 説明                           |
| -------------------- | ---------------------------------------- | ------------------------------ |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | typecheck/lint/test の実行結果 |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | 変更ファイル・行数・概要       |
| PR情報               | `outputs/phase-13/pr-info.md`            | PR番号・URL・ブランチ情報      |

---

## 完了条件

- [ ] Phase 12 までの全成果物が完了条件を満たしている
- [ ] ローカルチェック（typecheck, lint, test）が全てPassしている
- [ ] `outputs/phase-13/local-check-result.md` にチェック結果が記録されている
- [ ] `outputs/phase-13/change-summary.md` に変更サマリーが記録されている
- [ ] blocked要因が全てクリアされている
- [ ] ユーザーの明示的な承認が得られている
- [ ] コミットが作成されている（`--no-verify` 不使用）
- [ ] PRが作成され、PR番号が `outputs/phase-13/pr-info.md` に記録されている
- [ ] CIパイプラインが全てPassしている
- [ ] CI失敗がある場合は修正コミットで解消されている

---

## 次のPhase

なし。本Phaseの完了をもって TASK-P0-06（会話型インタビューUI）は完了となる。

### 後続タスクへの引き継ぎ（再掲）

- **P0-08（セッション復元）**: `outputs/phase-12/implementation-guide.md` の一時状態構造・状態境界セクションを参照
- **RT-05（multi_select canonical化）**: `outputs/phase-12/implementation-guide.md` の型マッピング表・`outputs/phase-12/unassigned-task-detection.md` の UT-P0-06-CANONICAL-SYNC-001 を参照
