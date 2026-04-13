# Phase 13: PR作成

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 13                            |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 作成日 | 2026-04-13                    |
| 状態   | blocked                       |

## 目的

ユーザーの明示承認後にのみ PR を作成する。
Phase 12 までの成果物を PR 化するための準備を行う。
ただし、user approval が得られるまで commit / push / PR 作成 / CI 実行は行わない。

---

## blocked 状態の理由

- ユーザーの明示指示で commit / PR 作成はスコープ外になっている
- `task-specification-creator` の Phase 13 ルールでも、承認がない限り blocked を維持する
- Phase 1〜12 の全完了条件が満たされていることが PR 作成の前提条件

---

## 前提条件

- ユーザーの明示的な承認を受けていること
- Phase 1〜12 の全完了条件が満たされていること
- Phase 10 の判定が「PASS」であること
- Phase 12 の phase12-task-spec-compliance-check が PASS であること

---

## 実行タスク

- **タスク1**: blocked 条件と approval 状態の確認
- **タスク2**: ローカル最終確認の下書き作成
- **タスク3**: change-summary.md の作成
- **タスク4**: `gh pr create` コマンド実行（approval 後のみ）
- **タスク5**: CI 確認（approval 後のみ）

---

## 参照資料

| 資料名                       | パス                                                     | 説明               |
| ---------------------------- | -------------------------------------------------------- | ------------------ |
| Phase 12 ドキュメント更新    | `outputs/phase-12/documentation-changelog.md`            | 変更要約の根拠     |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認  |
| Phase 10 AC 検証記録         | `outputs/phase-10/ac-verification.md`                    | 受入基準の最終根拠 |
| GitHub Issue #2098           | daishiman/AIWorkflowOrchestrator#2098                    | 関連 Issue         |
| 最終レビュー結果（PASS）     | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物    |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物    |
| 手動テストレポート           | `outputs/phase-11/manual-test-report.md`                 | Phase 11 成果物    |
| 発見課題（ISSUE-P11-01）     | `outputs/phase-11/discovered-issues.md`                  | Phase 11 成果物    |
| UIサニティVisualレビュー     | `outputs/phase-11/ui-sanity-visual-review.md`            | Phase 11 成果物    |
| キャプチャメタデータ         | `outputs/phase-11/phase11-capture-metadata.json`         | Phase 11 成果物    |
| 実装ガイド（2パート構成）    | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物    |
| SystemSpec更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物    |
| 未タスク検出（0件）          | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物    |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物    |

---

## PR ブロック条件

**ユーザーの明示承認なし → blocked（絶対に実行しない）**

以下は user approval が得られるまで実行禁止:

```bash
git commit
git push
gh pr create
```

---

## 実行手順

### ステップ1: blocked 条件を確認する

- user approval が未取得であれば、Phase 13 は blocked を維持する
- `commit / push / PR` は実行しない
- blocked 理由を `outputs/phase-13/pr-info.md` に記録する

### ステップ2: ローカル最終確認（下書き）

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop exec playwright test --grep "analytics"
git diff --name-only main HEAD
```

- 実行結果は `outputs/phase-13/local-check-result.md` に下書きとして残す

### ステップ3: change-summary.md の作成

- 変更ファイル一覧を整理する
- AC-1〜AC-5 の充足根拠を整理する
- `outputs/phase-13/change-summary.md` に要約を記録する

**変更ファイル一覧（想定）**:

| ファイルパス                                                                                | 変更種別 | 説明                                      |
| ------------------------------------------------------------------------------------------- | -------- | ----------------------------------------- |
| `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx`                | 追加     | `AnalyticsDashboardPanel` 本体            |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                    | 変更     | 設定画面への AnalyticsDashboardPanel 統合 |
| `apps/desktop/src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx` | 追加     | unit test                                 |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                        | 変更     | 統合テスト                                |
| `apps/desktop/e2e/analytics-dashboard.spec.ts`                                              | 追加     | E2E テスト                                |

### ステップ4: `gh pr create` コマンド実行（approval 後のみ）

```bash
gh pr create \
  --title "feat(analytics): Analytics ダッシュボード UI (UT-W3-ANALYTICS-DASHBOARD-001) #2098" \
  --body "$(cat <<'EOF'
## Summary

- 設定画面に `AnalyticsDashboardPanel` を統合した（AC-1）
- オプトアウト状態（ON/OFF）を UI で確認可能にした（AC-2）
- 開発モードで dev-only 診断ブロックを表示した（AC-3）

## Acceptance Criteria

- [x] AC-1: 設定画面に `AnalyticsDashboardPanel` が統合されていること
- [x] AC-2: オプトアウト状態の現在値（ON/OFF）が UI で確認できること
- [x] AC-3: 開発モードで dev-only 診断ブロックが表示されること
- [x] AC-4: Playwright E2E テストが PASS すること
- [x] AC-5: `pnpm typecheck && pnpm lint && pnpm test` が PASS すること

## Related

Closes #2098

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- `PR URL` と `CI 結果` は実操作後に `outputs/phase-13/pr-info.md` へ記録する

### ステップ5: CI 確認（approval 後のみ）

```bash
gh pr checks <PR番号>
gh run view --log-failed
```

---

## 統合テスト連携

- Phase 12 までの結果をもって、PR 化の準備だけを行う
- CI 実行は user approval 後に限定する
- GitHub Issue #2098 を PR マージ時にクローズする

---

## サブタスク管理

| ID     | タスク名                   | ステータス |
| ------ | -------------------------- | ---------- |
| T-13-1 | blocked 条件の確認         | 未実施     |
| T-13-2 | ローカル最終確認の下書き   | 未実施     |
| T-13-3 | change-summary.md の作成   | 未実施     |
| T-13-4 | PR 作成（approval 後のみ） | blocked    |
| T-13-5 | CI 確認（approval 後のみ） | blocked    |

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

- [ ] blocked 理由が明文化されていること
- [ ] user approval がない限り commit / push / PR を実行しないこと
- [ ] Phase 12 の成果物をもとに PR 下書きが作成されていること
- [ ] `outputs/phase-13/local-check-result.md` / `change-summary.md` / `pr-info.md` / `pr-ready-report.md` が作成されていること

---

## タスク100%実行確認【必須】

- [ ] T-13-1: blocked 条件を確認済み
- [ ] T-13-2: ローカル最終確認の下書きを作成済み
- [ ] T-13-3: change-summary.md を作成済み
- [ ] T-13-4: PR 作成（approval 取得後のみ実行）
- [ ] T-13-5: CI 確認（approval 取得後のみ実行）

---

## 次のPhase

なし。user approval が得られた場合のみ Phase 13 を解放する。
