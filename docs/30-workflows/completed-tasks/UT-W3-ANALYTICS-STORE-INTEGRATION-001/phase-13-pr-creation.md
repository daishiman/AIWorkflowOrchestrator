# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 13                                             |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| 機能名     | renderer analytics slice / SkillAnalytics 連携 |
| 前提Phase  | Phase 12                                       |
| 後続Phase  | -（本タスクでは実行しない）                    |
| 作成日     | 2026-04-13                                     |
| ステータス | blocked                                        |

## 重要

**PR作成はユーザーの明示的な許可を得てから実行すること。**
ユーザー承認なしに commit / push / PR を実行してはならない。

## 目的

commit と PR 作成を行う。ユーザー承認後のみ実施する。
本 Phase は blocked 状態であり、ユーザーの指示を待つ。

## ステータス: blocked（ユーザー指示待ち）

現在 blocked。以下の条件が揃った後、ユーザーの明示的な承認を得てから実施する：

- [ ] Phase 12 の全成果物が揃っている
- [ ] ユーザーから明示的な PR 作成承認を得ている

## 実行タスク

### T-13-1: ローカル品質チェック

PR 作成前に以下のコマンドを実行し、全て PASS することを確認する。

```bash
pnpm typecheck && pnpm lint && \
  pnpm --filter @repo/desktop test -- --run \
    apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

結果を `outputs/phase-13/local-check-result.md` に記録する。

| チェック項目          | 基準    | 結果    |
| --------------------- | ------- | ------- |
| TypeScript 型チェック | PASS    | pending |
| ESLint                | PASS    | pending |
| analyticsSlice テスト | 全 PASS | pending |

### T-13-2: 変更サマリー作成

以下の内容を `outputs/phase-13/change-summary.md` に記録する：

- 変更ファイル一覧
- 変更の概要（何を・なぜ変更したか）
- 受入基準（AC-1〜AC-4）の達成状況

### T-13-3: コミット作成（`--no-verify` 禁止）

**禁止事項**: `git commit --no-verify` および `git push --no-verify` は絶対に使用しない。

コミットメッセージフォーマット：

```
feat(analytics): UT-W3-ANALYTICS-STORE-INTEGRATION-001 renderer analytics slice実装

スキル実行ライフサイクル（start/complete/error）への自動計装を追加。
analyticsAdapter への直接送信により、明示的なイベント送信を簡素化。

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

実行コマンド（ユーザー承認後のみ）：

```bash
git add apps/desktop/src/renderer/store/slices/analyticsSlice.ts
git add apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
git add packages/shared/src/types/skill-analytics.ts
git add packages/shared/src/types/index.ts
git add packages/shared/index.ts
git commit -m "$(cat <<'EOF'
feat(analytics): UT-W3-ANALYTICS-STORE-INTEGRATION-001 renderer analytics slice実装

スキル実行ライフサイクル（start/complete/error）への自動計装を追加。
analyticsAdapter への直接送信により、明示的なイベント送信を簡素化。

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### T-13-4: PR作成（`gh pr create`）

PR タイトル例：
`feat(analytics): renderer analytics slice実装（UT-W3-ANALYTICS-STORE-INTEGRATION-001）`

実行コマンド（ユーザー承認後のみ）：

```bash
gh pr create \
  --title "feat(analytics): renderer analytics slice実装（UT-W3-ANALYTICS-STORE-INTEGRATION-001）" \
  --body "$(cat <<'EOF'
## Summary

- `analyticsSlice` を Zustand slice として新規実装（`slices/analyticsSlice.ts`）
- スキル実行ライフサイクル（start/complete/error）を `analyticsAdapter` へ直接送信
- `SkillAnalyticsEvent` 型を `packages/shared/src/types/skill-analytics.ts` に定義
- 必要に応じて `packages/shared/src/types/index.ts` / `packages/shared/index.ts` の公開面を同期
- 既存の `trackEvent` 公開 API シグネチャを変更せず後方互換性を維持

## Acceptance Criteria

- [x] AC-1: スキル実行の自動計装（trackSkillStart / trackSkillComplete / trackSkillError）
- [x] AC-2: analyticsSlice が Zustand slice として実装済み
- [x] AC-3: trackEvent 公開 API シグネチャ不変
- [x] AC-4: pnpm typecheck && lint && test PASS

## Related

- Issue: #2100
- Task: UT-W3-ANALYTICS-STORE-INTEGRATION-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

PR 情報を `outputs/phase-13/pr-info.md` に記録する。

### T-13-5: CI確認

PR 作成後、CI の実行状況を確認する。

```bash
gh run list --branch "$(git branch --show-current)" --limit 5
gh pr checks
```

結果を `outputs/phase-13/pr-ready-report.md` に記録する。

## 禁止事項

- `git commit --no-verify` の使用禁止
- `git push --no-verify` の使用禁止
- `git commit -n` の使用禁止（`--no-verify` の短縮形）
- ユーザー承認前の commit / push / PR 作成の禁止

## 参照資料

| 資料名       | パス                                          | 説明            |
| ------------ | --------------------------------------------- | --------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物 |

## 成果物

| 成果物           | パス                                     | 説明                               |
| ---------------- | ---------------------------------------- | ---------------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | pnpm typecheck/lint/test の結果    |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更ファイル・概要・AC 達成状況    |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR URL・番号（ユーザー承認後のみ） |
| PR 完了レポート  | `outputs/phase-13/pr-ready-report.md`    | CI 確認・PR 完了記録               |

## 完了条件

- [ ] ユーザーから明示的な PR 作成承認を得ている
- [ ] T-13-1: ローカル品質チェック（typecheck && lint && test）が全 PASS
- [ ] T-13-2: 変更サマリーが作成されている
- [ ] T-13-3: commit が作成されている（`--no-verify` 不使用）
- [ ] T-13-4: PR が作成されている（`gh pr create`）
- [ ] T-13-5: CI 実行状況が確認・記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了（ユーザー承認後）

## サブタスク管理

1. T-13-1: ローカル品質チェック（ユーザー承認後）
2. T-13-2: 変更サマリー作成（ユーザー承認後）
3. T-13-3: コミット作成（ユーザー承認後）
4. T-13-4: PR 作成（ユーザー承認後）
5. T-13-5: CI 確認（PR 作成後）

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
