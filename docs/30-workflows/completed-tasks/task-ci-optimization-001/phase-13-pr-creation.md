# Phase 13: PR作成

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 13                       |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |
| 状態   | blocked                  |

## 目的

変更をmainブランチにマージするためのPRを作成する。
ただし、ユーザーの明示的な承認がある場合のみ実施する。
承認前は blocked 状態を維持し、準備状況のみを記録する。

---

## ブロック条件【必須確認】

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

---

## 参照資料

| 資料名                    | パス                                                     | 説明               |
| ------------------------- | -------------------------------------------------------- | ------------------ |
| Phase 12 ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`            | 変更要約の根拠     |
| Phase 12 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認  |
| Phase 10 AC 検証記録      | `outputs/phase-10/ac-verification.md`                    | 受入基準の最終根拠 |
| artifacts.json            | `docs/30-workflows/task-ci-optimi                        |
| 最終レビュー結果          | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物    |
| 手動テスト結果            | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物    |
| 手動テストレポート        | `outputs/phase-11/manual-test-report.md`                 | Phase 11 成果物    |
| 発見された問題            | `outputs/phase-11/discovered-issues.md`                  | Phase 11 成果物    |
| CI実行時間計測            | `outputs/phase-11/ci-timing-measurements.md`             | Phase 11 成果物    |
| キャプチャメタデータ      | `outputs/phase-11/phase11-capture-metadata.json`         | Phase 11 成果物    |
| 実装ガイド                | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物    |
| システム仕様更新サマリ    | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物    |
| 未タスク検出              | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物    |
| スキルフィードバック      | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物    |

zation-001/artifacts.json`| 完了後に status を completed へ更新 |
| CI設定ファイル            |`.github/actions/pnpm-install-retry/action.yml`/`.github/workflows/ci.yml`| 変更内容の確認元                    |
| vitest設定ファイル        |`apps/desktop/vitest.config.ts` | 変更内容の確認元 |

---

## 実行手順

### Task 13-1: ローカル最終確認

user approval 後に実行する。結果を `outputs/phase-13/local-check-result.md` に記録する。

```bash
# lint チェック（CI設定ファイルは YAML のため ESLint 対象外だが、全体チェックとして実施）
pnpm lint

# TypeScript 型チェック
pnpm typecheck

# vitest.config.ts に関係するテストの動作確認
pnpm --filter @repo/desktop test
```

確認観点:

- `pnpm lint` がエラー0件で完了すること
- `pnpm typecheck` がエラー0件で完了すること
- `apps/desktop/vitest.config.ts` の変更（CI_MAX_FORKS=3）がテスト実行に影響しないこと

### Task 13-2: コミットメッセージ作成・変更要約

`outputs/phase-13/change-summary.md` に以下を記録する。

**コミットメッセージ例:**

```
perf(ci): node_modulesキャッシュ最適化・シャード数17・CI_MAX_FORKS=3 (#TASK-CI-OPT-001)
```

**変更ファイル一覧:**

| ファイル                                        | 変更内容                                              |
| ----------------------------------------------- | ----------------------------------------------------- |
| `.github/actions/pnpm-install-retry/action.yml` | `actions/cache@v4` による node_modules キャッシュ追加 |
| `.github/workflows/ci.yml`                      | シャード数 16 → 17                                    |
| `apps/desktop/vitest.config.ts`                 | `CI_MAX_FORKS` 2 → 3                                  |

**現状vs改善後の比較:**

| 指標                    | 改善前  | 改善後                              |
| ----------------------- | ------- | ----------------------------------- |
| CI 実行時間（概算）     | ~15m21s | ~7分40秒以内                        |
| node_modules キャッシュ | なし    | あり（pnpm-lock.yaml ハッシュキー） |
| test-desktop シャード数 | 16      | 17                                  |
| CI_MAX_FORKS            | 2       | 3                                   |

### Task 13-3: PR作成コマンド準備

user approval 後に以下のコマンドを実行する。

**PR タイトル:**

```
perf(ci): テスト実行時間を~50%削減（node_modulesキャッシュ・17シャード最適化）
```

**PR 作成コマンド（heredoc形式）:**

```bash
gh pr create \
  --title "perf(ci): テスト実行時間を~50%削減（node_modulesキャッシュ・17シャード最適化）" \
  --body "$(cat <<'EOF'
## 概要

GitHub CIのテスト実行時間を ~15m21s から ~7分40秒以内 に削減する最適化を実装しました。
GitHub Actions 無料枠（月2,000分）の範囲内で達成します。

## 変更内容

### 変更ファイル

| ファイル | 変更内容 |
| --- | --- |
| `.github/actions/pnpm-install-retry/action.yml` | `actions/cache@v4` による node_modules キャッシュ追加 |
| `.github/workflows/ci.yml` | シャード数 16 → 17 |
| `apps/desktop/vitest.config.ts` | `CI_MAX_FORKS` 2 → 3 |

### 改善前後の比較

| 指標 | 改善前 | 改善後 |
| --- | --- | --- |
| CI 実行時間（概算） | ~15m21s | ~7分40秒以内 |
| node_modules キャッシュ | なし | あり（pnpm-lock.yaml ハッシュキー） |
| test-desktop シャード数 | 16 | 17 |
| CI_MAX_FORKS | 2 | 3 |

## 受入基準（AC）達成状況

- [x] AC-1: node_modulesキャッシュが正常動作（pnpm-lock.yamlハッシュキー）
- [x] AC-2: CI実行時間が7分40秒以内に削減（平均値で評価）
- [x] AC-3: test-desktopの全シャードがPASS維持
- [x] AC-4: シャード数17でmatrix動作
- [x] AC-5: CI_MAX_FORKS=3でメモリ安定動作
- [x] AC-6: mainブランチのカバレッジ収集が継続動作

## テスト方法

このPRをマージ後、CIが自動実行されます。
以下のコマンドでCI実行を監視してください：

\`\`\`bash
gh run watch
\`\`\`

## 関連タスク

- TASK-CI-OPT-001
EOF
)"
```

### Task 13-4: CI実行確認

user approval 後、PR作成完了後に実行する。

```bash
# CI実行状況を監視する
gh run watch

# または直近の実行一覧を確認する
gh run list --limit 5
```

確認観点:

- 全シャード（17並列）が PASS すること
- node_modules キャッシュが正常に作成・利用されること
- カバレッジ収集ジョブが正常動作すること

### Task 13-5: タスク完了処理

CI PASS 確認後、`docs/30-workflows/task-ci-optimization-001/artifacts.json` の status を `completed` に更新する。

```bash
# artifacts.json の status を completed に更新する
# 変更箇所: "status": "spec_created" → "status": "completed"
# また Phase 12 と Phase 13 の status も "not-started" / "blocked" → "completed" へ更新する
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
- [ ] コミットメッセージが規約に従っていること（`perf(ci): ...`）
- [ ] PR が作成され、タイトル・本文が正しく設定されていること
- [ ] CI が全シャード PASS していること
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
