# Phase 13: PR作成

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 13                                        |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |
| 状態   | blocked                                   |

## 目的

変更を main ブランチにマージするための PR を作成する。
ただし、ユーザーの明示的な承認がある場合のみ実施する。
承認前は blocked 状態を維持し、準備状況のみを記録する。

---

## ブロック条件【必須確認】

> **Phase 13 は user approval がない限り blocked のまま維持する。**

- ユーザーの明示的な承認なしには実施しない
- `commit / push / PR作成 / CI実行` は user approval が得られるまで行わない
- `task-specification-creator` の Phase 13 ルールでも、承認がない限り blocked を維持する
- blocked 理由を `outputs/phase-13/pr-info.md` に記録する

---

## 実行タスク

| Task      | 内容                                      | 主成果物                                 |
| --------- | ----------------------------------------- | ---------------------------------------- |
| Task 13-1 | ローカル最終確認                          | `outputs/phase-13/local-check-result.md` |
| Task 13-2 | コミットメッセージ作成・変更要約          | `outputs/phase-13/change-summary.md`     |
| Task 13-3 | PR作成コマンド準備・PR情報下書き          | `outputs/phase-13/pr-info.md`            |
| Task 13-4 | CI実行確認手順の整備                      | （`pr-info.md` 内に記載）                |
| Task 13-5 | タスク完了処理（artifacts.json 更新準備） | `outputs/phase-13/pr-ready-report.md`    |

- Task 13-1: ローカル最終確認を実施し `outputs/phase-13/local-check-result.md` に結果を記録する
- Task 13-2: 変更サマリーを作成し `outputs/phase-13/change-summary.md` に差分要約を記録する
- Task 13-3: PR作成コマンドを準備し `outputs/phase-13/pr-info.md` を作成する
- Task 13-4: CI実行確認手順を整備し `pr-info.md` に監視コマンドと確認観点を記載する
- Task 13-5: タスク完了処理を準備し `outputs/phase-13/pr-ready-report.md` に artifacts.json 更新準備を記録する

---

## 参照資料

| 資料名                    | パス                                                                         | 説明                                |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| Phase 12 ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`                                | 変更要約の根拠                      |
| Phase 12 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md`                     | Phase 12 完了確認                   |
| Phase 9 品質チェック結果  | `outputs/phase-9/quality-check-result.md`                                    | 直前品質ゲート                      |
| Phase 8 リファクタ結果    | `outputs/phase-8/refactoring-result.md`                                      | コメント整理の確認                  |
| Phase 7 カバレッジ確認    | `outputs/phase-7/coverage-check-result.md`                                   | 条件分岐と収集条件の確認            |
| Phase 6 テスト拡張結果    | `outputs/phase-6/test-expansion-result.md`                                   | シャード別検証の確認                |
| Phase 5 実装結果          | `outputs/phase-5/implementation-result.md`                                   | 実装差分の確認                      |
| Phase 2 設計決定記録      | `outputs/phase-2/design-decisions.md`                                        | backend カバレッジ設計の確認        |
| Phase 10 AC 検証記録      | `outputs/phase-10/ac-verification.md`                                        | 受入基準の最終根拠                  |
| 最終レビュー結果          | `outputs/phase-10/final-review-result.md`                                    | Phase 10 成果物                     |
| 手動テスト結果            | `outputs/phase-11/manual-test-result.md`                                     | Phase 11 成果物                     |
| 手動テストレポート        | `outputs/phase-11/manual-test-report.md`                                     | Phase 11 成果物                     |
| 発見された問題            | `outputs/phase-11/discovered-issues.md`                                      | Phase 11 成果物                     |
| CI 実行時間計測           | `outputs/phase-11/ci-timing-measurements.md`                                 | Phase 11 成果物                     |
| キャプチャメタデータ      | `outputs/phase-11/phase11-capture-metadata.json`                             | Phase 11 成果物                     |
| 実装ガイド                | `outputs/phase-12/implementation-guide.md`                                   | Phase 12 成果物                     |
| システム仕様更新サマリ    | `outputs/phase-12/system-spec-update-summary.md`                             | Phase 12 成果物                     |
| 未タスク検出              | `outputs/phase-12/unassigned-task-detection.md`                              | Phase 12 成果物                     |
| スキルフィードバック      | `outputs/phase-12/skill-feedback-report.md`                                  | Phase 12 成果物                     |
| artifacts.json            | `docs/30-workflows/task-ci-future-007-backend-codecov-upload/artifacts.json` | 完了後に status を completed へ更新 |
| CI 設定ファイル           | `.github/workflows/ci.yml`                                                   | 変更内容の確認元                    |
| vitest 設定ファイル       | `apps/backend/vitest.config.ts`                                              | 変更内容の確認元                    |

---

## 実行手順

### Task 13-1: ローカル最終確認

user approval 後に実行する。結果を `outputs/phase-13/local-check-result.md` に記録する。

```bash
# lint チェック（CI設定ファイルは YAML のため ESLint 対象外だが、全体チェックとして実施）
pnpm lint

# TypeScript 型チェック
pnpm typecheck

# backend テストの動作確認
pnpm --filter @repo/backend test
```

確認観点:

- `pnpm lint` がエラー0件で完了すること
- `pnpm typecheck` がエラー0件で完了すること
- `apps/backend/vitest.config.ts` の変更（coverage 設定追加）がテスト実行に影響しないこと

### Task 13-2: コミットメッセージ作成・変更要約

`outputs/phase-13/change-summary.md` に以下を記録する。

**コミットメッセージ例:**

```
ci(backend): Codecov backend フラグ対応・main push 時のみカバレッジ収集 (#TASK-CI-FUTURE-007)
```

**変更ファイル一覧:**

| ファイル                        | 変更内容                                                              |
| ------------------------------- | --------------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | backend カバレッジ収集ステップ追加・Codecov `flags: backend` 設定追加 |
| `apps/backend/vitest.config.ts` | coverage 設定追加（必要な場合のみ）                                   |

**現状 vs 改善後の比較:**

| 指標                       | 変更前 | 変更後                     |
| -------------------------- | ------ | -------------------------- |
| backend カバレッジ収集     | なし   | あり（main push 時のみ）   |
| Codecov フラグ             | なし   | `flags: backend`           |
| PR 時のカバレッジ収集      | 対象外 | スキップ（条件分岐で除外） |
| desktop フラグ（回帰確認） | あり   | あり（変更なし・回帰なし） |

### Task 13-3: PR作成コマンド準備

user approval 後に以下のコマンドを実行する。

**ブランチ名:**

```
feat/task-ci-future-007-backend-codecov-upload
```

**ブランチ作成:**

```bash
git checkout -b feat/task-ci-future-007-backend-codecov-upload
```

**コミット:**

```bash
git add .github/workflows/ci.yml apps/backend/vitest.config.ts
git commit -m "$(cat <<'EOF'
ci(backend): Codecov backend フラグ対応・main push 時のみカバレッジ収集 (#TASK-CI-FUTURE-007)

- test-web ジョブ（@repo/backend）にカバレッジ収集ステップを追加
- Codecov アップロードに flags: backend を設定
- main push 時のみカバレッジ収集（PR 時はスキップ）
- desktop フラグの既存動作に影響なし（回帰なし）

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

**PR タイトル:**

```
ci(backend): Codecov backend フラグ対応・main push 時のみカバレッジ収集
```

**PR 作成コマンド（heredoc形式）:**

```bash
gh pr create \
  --title "ci(backend): Codecov backend フラグ対応・main push 時のみカバレッジ収集" \
  --body "$(cat <<'EOF'
## 概要

`test-web` ジョブ（実体は `@repo/backend`）にカバレッジ収集を追加し、
Codecov の `backend` フラグでアップロードします。
PR 時はスキップ、main push 時のみ収集する設計です。

## 変更内容

### 変更ファイル

| ファイル | 変更内容 |
| --- | --- |
| `.github/workflows/ci.yml` | backend カバレッジ収集ステップ追加・Codecov `flags: backend` 設定追加・main push 条件分岐 |
| `apps/backend/vitest.config.ts` | coverage 設定追加（必要な場合のみ） |

### 変更前後の比較

| 指標 | 変更前 | 変更後 |
| --- | --- | --- |
| backend カバレッジ収集 | なし | あり（main push 時のみ） |
| Codecov フラグ | なし | `flags: backend` |
| PR 時のカバレッジ収集 | 対象外 | スキップ（条件分岐で除外） |
| desktop フラグ（回帰確認） | あり | あり（変更なし・回帰なし） |

## 受入基準（AC）達成状況

- [x] AC-1: test-web ジョブに backend カバレッジ収集ステップが追加されていること
- [x] AC-2: Codecov アップロードに `flags: backend` が設定されていること
- [x] AC-3: main push 時のみカバレッジ収集が実行されること
- [x] AC-4: PR 時はカバレッジ収集がスキップされること
- [x] AC-5: `desktop` フラグの Codecov アップロードが引き続き正常動作していること（回帰なし）

## テスト方法

このPRをマージ後、CIが自動実行されます。
以下のコマンドでCI実行を監視してください：

\`\`\`bash
gh run watch
\`\`\`

## 関連タスク

- TASK-CI-FUTURE-007
- 依存: TASK-CI-FUTURE-002
EOF
)"
```

### Task 13-4: CI実行確認

user approval 後、PR作成完了後に実行する。

```bash
# CI 実行状況を監視する
gh run watch

# または直近の実行一覧を確認する
gh run list --limit 5
```

確認観点:

- test-web ジョブが PASS すること
- PR 時に coverage ステップがスキップされること
- desktop フラグのカバレッジアップロードが引き続き正常動作していること（回帰なし）

### Task 13-5: タスク完了処理

CI PASS 確認後、`docs/30-workflows/task-ci-future-007-backend-codecov-upload/artifacts.json` の status を `completed` に更新する。

```bash
# artifacts.json の status を completed に更新する
# 変更箇所: "status": "spec_created" → "status": "completed"
# また Phase 12 と Phase 13 の status も "not_started" / "blocked" → "completed" へ更新する
```

---

## PR本文テンプレート（heredoc例）

上記 Task 13-3 の `gh pr create` コマンドを参照すること。
approval 前に内容を `outputs/phase-13/pr-info.md` に下書きとして保存しておく。

---

## 統合テスト連携

- Phase 12 までの結果をもって、PR 化の準備だけを行う
- CI 実行は user approval 後に限定する
- PR マージ後、`artifacts.json` の全 Phase status が `completed` になることを確認する

---

## サブタスク管理

| ID     | タスク名                             | ステータス |
| ------ | ------------------------------------ | ---------- |
| T-13-1 | ローカル最終確認                     | 未実施     |
| T-13-2 | コミットメッセージ作成・変更要約     | 未実施     |
| T-13-3 | PR作成コマンド準備・PR情報下書き     | 未実施     |
| T-13-4 | CI実行確認手順の整備                 | 未実施     |
| T-13-5 | タスク完了処理（artifacts.json更新） | 未実施     |

---

## 成果物

| 成果物           | 配置先                                   | 形式     |
| ---------------- | ---------------------------------------- | -------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | Markdown |
| 変更要約         | `outputs/phase-13/change-summary.md`     | Markdown |
| PR 情報          | `outputs/phase-13/pr-info.md`            | Markdown |
| PR 準備レポート  | `outputs/phase-13/pr-ready-report.md`    | Markdown |

---

## 完了条件

- [ ] user approval が取得されていること
- [ ] `pnpm lint` と `pnpm typecheck` がエラー0件で完了していること
- [ ] コミットメッセージが規約に従っていること（`ci(backend): ...`）
- [ ] PR が作成され、タイトル・本文が正しく設定されていること
- [ ] CI が test-web ジョブ PASS していること
- [ ] PR 時に coverage ステップがスキップされることを CI ログで確認していること
- [ ] `artifacts.json` の status が `completed` に更新されていること
- [ ] `outputs/phase-13/local-check-result.md` / `change-summary.md` / `pr-info.md` / `pr-ready-report.md` が作成されていること

---

## タスク100%実行確認【必須】

- [ ] T-13-1: ローカル最終確認を完了済み
- [ ] T-13-2: コミットメッセージ作成・変更要約を完了済み
- [ ] T-13-3: PR作成コマンド準備・PR情報下書きを完了済み
- [ ] T-13-4: CI実行確認手順を整備済み
- [ ] T-13-5: タスク完了処理（artifacts.json更新）を完了済み

---

## 次Phase

なし（タスク完了）
