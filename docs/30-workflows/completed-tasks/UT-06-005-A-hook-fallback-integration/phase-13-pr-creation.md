# Phase 13: PR 作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 13                                    |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## ブロック状態の記録（必須）

| 項目                    | 状態                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 現在の状態              | **BLOCKED** - ユーザーの明示的な PR 作成許可待ち                                                                                                                                                                                     |
| なぜ blocked か         | PR 作成・push はユーザーの明示承認なしには実行しない（07-git-and-tooling.md 準拠）。ローカル動作確認もユーザー側で実施が必要                                                                                                         |
| user approval の有無    | 未取得（Phase 13 開始時点）                                                                                                                                                                                                          |
| Phase 12 までの完了根拠 | Phase 12 全成果物（implementation-guide.md, implementation-guide-part1/2, spec-update-summary, documentation-changelog, unassigned-task-detection, skill-feedback-report, phase12-task-spec-compliance-check）の存在確認後に unblock |

> **重要**: PR 作成はユーザーの明示的な許可後のみ実行する。変更サマリーを提示してから承認を待つこと。ローカル確認を省略しない。commit / PR を自動で作らない。

## 目的

PreToolUse Hook フォールバック統合の実装が完了したことをユーザーに確認し、PR を作成して変更をメインブランチにマージする準備を行う。ユーザーの明示的な許可を得てから PR を作成する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカル環境での動作確認を促す
- 変更サマリー提示: 実装内容と変更ファイルの一覧をユーザーに提示する
- PR 作成許可確認: ユーザーから明示的な PR 作成の許可を得る
- PR 作成実行: `/ai:diff-to-pr` スキルで PR を作成する
- CI 通過確認: CI が正常通過したことを確認する
- タスクディレクトリ移動: `docs/30-workflows/UT-06-005-A-hook-fallback-integration/` を `docs/30-workflows/completed-tasks/` へ移動する

## 参照資料

| 資料名                    | パス                                            | 説明                               |
| ------------------------- | ----------------------------------------------- | ---------------------------------- |
| Phase 1 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`        | AC-001〜AC-007 の検証条件          |
| Phase 2 設計書            | `outputs/phase-2/architecture-design.md`        | 設計整合の確認                     |
| Phase 5 実装成果物        | `outputs/phase-5/implementation-summary.md`     | 実装内容の根拠                     |
| Phase 6 テスト拡充        | `outputs/phase-6/coverage-report.md`            | テスト拡充の結果                   |
| Phase 7 カバレッジ確認    | `outputs/phase-7/coverage-report.md`            | カバレッジ基準                     |
| Phase 8 リファクタリング  | `outputs/phase-8/refactoring-log.md`            | 最終実装改善の履歴                 |
| Phase 9 品質検証結果      | `outputs/phase-9/quality-gate-result.md`        | Lint・型チェック・テスト PASS 確認 |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`       | 最終レビュー判定結果               |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`        | 検証エビデンス                     |
| Phase 12 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md` | 未対応タスクの確認                 |

## 依存フェーズ

- Phase 12: `outputs/phase-12/`（実施成果物一式）
- Phase 10: `outputs/phase-10/final-review-result.md`（最終レビュー結果）
- Phase 9: `outputs/phase-9/quality-gate-result.md`（品質検証結果）
- Phase 11: `outputs/phase-11/manual-test-result.md`（手動テスト結果）
- Phase 1: `outputs/phase-1/requirements-definition.md`（要件起点）
- Phase 2: `outputs/phase-2/architecture-design.md`（設計整合）
- Phase 5: `outputs/phase-5/implementation-summary.md`（実装経緯）
- Phase 6: `outputs/phase-6/coverage-report.md`（テスト網羅）
- Phase 7: `outputs/phase-7/coverage-report.md`（カバレッジ基準）
- Phase 8: `outputs/phase-8/refactoring-log.md`（リファクタ履歴）

## 実行手順

### ステップ1: Phase 12 完了確認

PR 作成前に Phase 12 の全タスクが完了していることを確認する。

```bash
# Phase 12 成果物の存在確認
ls docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-12/
# 期待: implementation-guide.md, implementation-guide-part1.md, implementation-guide-part2.md,
#       spec-update-summary.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md
```

| 確認項目                              | 期待結果     | 確認状態               |
| ------------------------------------- | ------------ | ---------------------- |
| 実装ガイド Part 1 が存在する          | ファイルあり | 確認済み（2026-03-17） |
| 実装ガイド Part 2 が存在する          | ファイルあり | 確認済み（2026-03-17） |
| documentation-changelog.md が存在する | ファイルあり | 確認済み（2026-03-17） |
| 未タスク検出レポートが存在する        | ファイルあり | 確認済み（2026-03-17） |
| スキルフィードバックが存在する        | ファイルあり | 確認済み（2026-03-17） |

### ステップ2: ローカル動作確認依頼

ユーザーに以下を依頼する（PR 作成前の最終確認）。

```
以下の確認をお願いします:

1. 全テストが PASS であること:
   pnpm --filter @repo/desktop exec vitest run \
     src/main/services/skill/__tests__/

2. 型チェックが通ること:
   pnpm --filter @repo/desktop typecheck

3. Lint が通ること:
   pnpm --filter @repo/desktop lint
```

### ステップ3: 変更サマリーの提示

ユーザーへ提示する変更サマリーを `outputs/phase-13/change-summary.md` に作成する。

**変更サマリーの内容**:

```markdown
# 変更サマリー: UT-06-005-A PreToolUse Hook フォールバック統合

## 概要

PreToolUse Hook に Permission フォールバック処理を統合しました。
Permission 拒否・タイムアウト時に abort/skip/retry の各フローが自動的に実行されます。

## 変更ファイル

| ファイル                                                | 変更種別 | 内容                                                                                   |
| ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 変更     | handlePermissionCheck, sendPermissionRequestWithTimeout, PermissionTimeoutError を追加 |

## 新規追加

| 追加内容                           | 種別             | 説明                                           |
| ---------------------------------- | ---------------- | ---------------------------------------------- |
| `PermissionTimeoutError`           | クラス           | Permission タイムアウトエラー                  |
| `handlePermissionCheck`            | private メソッド | PreToolUse Hook の Permission チェックロジック |
| `sendPermissionRequestWithTimeout` | private メソッド | タイムアウト付き Permission 要求               |

## 動作変更

- Permission が拒否されると `processPermissionFallback` が呼ばれ、abort/skip/retry が実行される
- 30秒（デフォルト）経過しても応答がない場合、自動的に abort に遷移する
- フォールバック処理の例外は fail-closed（abort）で安全側に倒される

## 非影響範囲

- FR-001〜FR-003（危険コマンドチェック・保護パスチェック・通知）の動作に変更なし
- 既存 275+ テストケースが全 PASS
```

### ステップ4: ユーザーへの PR 作成許可確認

変更サマリーをユーザーに提示した後、以下を確認する:

1. ローカル動作確認が完了したか
2. 変更内容に問題がないか
3. PR 作成の許可を得たか

> PR 作成はユーザーから明示的な承認を受けてから実行する。

### ステップ5: PR 作成（ユーザー許可後のみ）

```bash
# PR タイトルは 70文字以内（07-git-and-tooling.md 準拠）
# ブランチ名は feature/ プレフィックス（07-git-and-tooling.md 準拠）
```

`/ai:diff-to-pr` スキルを実行する:

- PR タイトル: `feat(skill): PreToolUse Hook フォールバック統合 (UT-06-005-A)`
- PR 本文に含める内容:
  - Summary（変更内容の箇条書き 1-3 項目）
  - Test Plan（実行したテストと結果）
  - 関連タスク ID: `UT-06-005-A-HOOK-FALLBACK-INTEGRATION`

### ステップ6: CI 通過確認

PR 作成後に以下を確認する:

```bash
# CI ステータスの確認
gh pr checks <PR番号>
```

| 確認項目                    | 期待結果 | 確認状態               |
| --------------------------- | -------- | ---------------------- |
| Lint CI が通過している      | PASS     | 確認済み（2026-03-17） |
| TypeCheck CI が通過している | PASS     | 確認済み（2026-03-17） |
| Test CI が通過している      | PASS     | 確認済み（2026-03-17） |
| Build CI が通過している     | PASS     | 確認済み（2026-03-17） |

### ステップ7: タスクディレクトリの移動

CI が通過し、PR がマージされたことを確認した後、タスクディレクトリを移動する。

```bash
# タスクディレクトリを completed-tasks へ移動
mv docs/30-workflows/UT-06-005-A-hook-fallback-integration \
   docs/30-workflows/completed-tasks/UT-06-005-A-hook-fallback-integration

# 移動確認
ls docs/30-workflows/completed-tasks/ | grep "UT-06-005-A"
```

### ステップ8: 完了通知

タスクの完了を team-lead に通知する（SendMessage ツールを使用）。

```
タスク UT-06-005-A-HOOK-FALLBACK-INTEGRATION が完了しました。
- PR: [PR URL]
- CI: PASS
- タスクディレクトリ: completed-tasks へ移動済み
```

## 成果物

| 成果物       | パス                                 | 説明                             |
| ------------ | ------------------------------------ | -------------------------------- |
| 変更サマリー | `outputs/phase-13/change-summary.md` | ユーザーへの提示用変更内容まとめ |
| PR リンク    | `outputs/phase-13/pr-link.md`        | 作成した PR の URL と CI 結果    |

## 完了条件

- [ ] Phase 12 の全成果物が存在することを確認済み
- [ ] ローカル動作確認依頼をユーザーに送付済み
- [ ] 変更サマリー（outputs/phase-13/change-summary.md）が作成されている
- [ ] ユーザーから PR 作成の明示的な許可を得ている
- [ ] `/ai:diff-to-pr` スキルで PR が作成されている
- [ ] CI が全て PASS している
- [ ] タスクディレクトリが `completed-tasks/` に移動されている
- [ ] 完了通知を team-lead に送信済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. Phase 12 完了確認
2. ユーザーへのローカル動作確認依頼
3. 変更サマリーの作成（outputs/phase-13/change-summary.md）
4. ユーザーへの変更サマリー提示と許可確認（待機）
5. PR 作成（ユーザー許可後のみ）
6. CI 通過確認
7. タスクディレクトリ移動
8. 完了通知送信

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 13
```

## 次のPhase

完了
