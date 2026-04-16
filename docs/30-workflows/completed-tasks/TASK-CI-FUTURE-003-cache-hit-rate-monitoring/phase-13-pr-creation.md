# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 13                                   |
| 機能名     | TASK-CI-FUTURE-003                   |
| タスク名   | キャッシュヒット率のモニタリング設定 |
| 前提Phase  | Phase 12                             |
| 後続Phase  | -（完了）                            |
| 作成日     | 2026-04-15                           |
| ステータス | pending                              |

## 目的

Phase 1〜12 の成果物（`.github/workflows/ci.yml` の変更）をPRとしてリモートブランチへプッシュし、レビュー依頼を作成する。

## ⚠️ 重要: ユーザー承認必須

**このPhaseはユーザーの明示的な承認があるまで実行してはならない。**

PR 作成はリポジトリへの公開アクションであり、以下を確認してからユーザーに承認を求めること:

1. Phase 12 の全成果物が完成していること
2. Phase 11 の手動テストが完了していること
3. ユーザーが「PR を作成してください」と明示的に指示すること

## 実行タスク

### Task 13-A: 変更サマリーの作成

PR の説明文に記載する変更サマリーを作成する。

**変更ファイル一覧**:

| ファイル                   | 変更種別 | 変更内容                             |
| -------------------------- | -------- | ------------------------------------ |
| `.github/workflows/ci.yml` | 修正     | キャッシュヒット率判定ステップの追加 |

**変更の概要**:

```
feat(ci): TASK-CI-FUTURE-003 キャッシュヒット率のモニタリング設定

- node_modules キャッシュの3状態（完全ヒット・フォールバック・ミス）を自動判定
- GitHub Actions Summary にキャッシュ状態をMarkdownテーブルで出力
- キャッシュミス時に ::warning:: アノテーションを出力
- if: always() + continue-on-error: true でCI実行への影響ゼロ
```

### Task 13-B: ブランチ・PR の準備確認

| 確認項目                             | 期待状態        | 確認結果 |
| ------------------------------------ | --------------- | -------- |
| 作業ブランチが存在する               | ✅ 存在         | -        |
| Phase 1〜12 の全成果物がコミット済み | ✅ コミット済み | -        |
| Phase 12 の root evidence が存在する | ✅ 存在         | -        |
| ブランチがリモートにプッシュ済み     | ✅ プッシュ済み | -        |
| CI が全ジョブ PASS している          | ✅ PASS         | -        |

### Task 13-C: PR 作成

ユーザーの明示的な承認後に以下を実行する。

```bash
# ブランチのプッシュ（未実施の場合）
git push -u origin docs/task-ci-future-003-cache-hit-rate-monitoring-specs

# PR の作成
gh pr create \
  --title "feat(ci): TASK-CI-FUTURE-003 キャッシュヒット率のモニタリング設定" \
  --body "$(cat <<'EOF'
## 概要

TASK-CI-FUTURE-003: node_modules キャッシュのヒット率を継続的にモニタリングし、キャッシュ劣化を早期検知できる仕組みを整備する。

## 変更内容

- `.github/workflows/ci.yml` にキャッシュヒット率判定ステップを追加
- 3状態（完全ヒット・フォールバックヒット・ミス）を `cache-hit` + `node_modules` 存在確認で正確に判定
- GitHub Actions Summary にキャッシュ状態をMarkdownテーブルで出力
- キャッシュミス時に `::warning::` アノテーションを出力
- `if: always()` + `continue-on-error: true` でCI全体への影響をゼロに抑制

## テスト方法

1. CI を実行し、Summary タブでキャッシュ状態テーブルが表示されることを確認する
2. キャッシュを削除して CI を実行し、`::warning::` アノテーションが表示されることを確認する

## 関連Issue

Closes #2169

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 13-D: CI 確認

PR 作成後、CI が全ジョブ PASS することを確認する。

```bash
# PR の CI 状態確認
gh pr checks <PR番号>

# CI 実行結果の詳細確認
gh run list --limit=3
```

### Task 13-E: タスク完了処理

PR マージ後に以下を実施する。

```bash
# Phase 13 完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-CI-FUTURE-003-cache-hit-rate-monitoring \
  --phase 13

# artifacts.json のステータスを completed に更新する
```

## 変数一覧

| 変数名          | 内容                                                                |
| --------------- | ------------------------------------------------------------------- |
| `BRANCH_NAME`   | `docs/task-ci-future-003-cache-hit-rate-monitoring-specs`           |
| `PR_TITLE`      | `feat(ci): TASK-CI-FUTURE-003 キャッシュヒット率のモニタリング設定` |
| `CLOSES_ISSUE`  | `#2169`                                                             |
| `TARGET_BRANCH` | `main`                                                              |

## 参照資料

| 資料名                  | パス                                                     | 用途             |
| ----------------------- | -------------------------------------------------------- | ---------------- |
| Phase 12 実装ガイド     | `outputs/phase-12/implementation-guide.md`               | PR 説明文の参照  |
| Phase 12 準拠確認       | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終監査の参照   |
| Phase 5 変更ファイル    | `outputs/phase-5/changed-files.md`                       | 変更ファイル一覧 |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                 | テスト方法の記載 |
| phase 10 成果物         | `outputs/phase-10/final-review.md`                       | Phase 10 成果物  |
| phase 11 成果物         | `outputs/phase-11/evidence-index.md`                     | Phase 11 成果物  |
| phase 12 成果物         | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物  |

## 完了条件

- [ ] ユーザーから PR 作成の明示的な承認を受けている
- [ ] Task 13-A の変更サマリーが作成されている
- [ ] Task 13-B の準備確認が全て ✅
- [ ] Task 13-C で PR が作成されている
- [ ] Task 13-D で CI が全ジョブ PASS している
- [ ] PR が main にマージされている（マージ後）
- [ ] Task 13-E のタスク完了処理が実施されている（マージ後）
