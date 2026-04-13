# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 13                                                   |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 12                                             |
| 後続Phase  | 完了                                                 |
| 作成日     | 2026-04-13                                           |
| ステータス | blocked                                              |

## ⚠️ 重要: ユーザーの明示承認が必要

**PR 作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

Phase 12 完了後、ユーザーに以下を確認する:

- PR 作成を実行してよいか
- PR の title と description の確認
- base ブランチの確認

## 目的

変更をローカルで検証し、ユーザーの明示承認が得られた場合のみ PR 作成へ進める。現時点では blocked を維持し、PR は作成しない。

## 実行タスク

1. `local-check-result.md` を作成し、Phase 1〜12 の完了根拠を固定する。
2. `change-summary.md` を作成し、変更の要点と影響範囲を整理する。
3. ユーザー承認の有無を確認し、承認がなければ blocked を維持する。
4. 承認後のみ `pr-info.md` と PR 作成手順へ進む。
5. PR 作成後に CI 確認とタスク完了処理を行う。

## 背景

Phase 12 の全ドキュメント更新が完了した。本 Phase では変更内容を整理し、承認後にのみ PR を作成できる状態へ整える。

## PR 情報（案）

| 項目  | 内容                                                                              |
| ----- | --------------------------------------------------------------------------------- |
| title | `feat(analytics): UT-W3-ANALYTICS-HTTP-PROVIDER-001 本番 analytics HTTP 送信実装` |
| base  | `main`                                                                            |
| label | `type:improvement`, `priority:high`, `scale:medium`                               |

## PR 説明テンプレート

```
## Summary
- `analyticsHandler.ts` Line 106 の TODO を実装し、本番環境での analytics イベント HTTP 送信を有効化
- `sendToAnalyticsProvider` 関数を追加（`ANALYTICS_ENDPOINT_URL` 環境変数 + AbortController 5000ms タイムアウト）
- エラー非伝播設計により、HTTP 送信失敗がアプリ動作に影響しない

## Changes
- `apps/desktop/src/main/ipc/analyticsHandler.ts`: `sendToAnalyticsProvider` 追加、TODO 削除
- `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`: HTTP 送信パステスト追加

## Test plan
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS することを確認
- [ ] AC-01〜AC-07 が全件 PASS していることを確認
- [ ] 既存 analytics IPC フローが回帰していないことを確認

## Related
- closes #2097
- depends on: UT-W3-ANALYTICS-ADAPTER-001（完了済み）
```

## 事前確認チェックリスト

| 確認項目                                        | 方法                |
| ----------------------------------------------- | ------------------- |
| `main` との差分が想定内                         | `git diff main`     |
| 不要ファイル（`.env`等）が含まれていない        | `git status`        |
| コミットメッセージが適切                        | `git log --oneline` |
| `pnpm typecheck && pnpm lint && pnpm test` PASS | CI 確認             |

## 参照資料

| 参照資料                 | パス                                                                           | 説明            |
| ------------------------ | ------------------------------------------------------------------------------ | --------------- |
| アーキテクチャ設計       | `outputs/phase-2/architecture-design.md`                                       | Phase 2 成果物  |
| HTTP送信設計             | `outputs/phase-2/http-send-design.md`                                          | Phase 2 成果物  |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`                                    | Phase 5 成果物  |
| 異常系結果               | `outputs/phase-6/edge-case-result.md`                                          | Phase 6 成果物  |
| トレーサビリティ網羅率   | `outputs/phase-7/traceability-coverage-report.md`                              | Phase 7 成果物  |
| リファクタ計画           | `outputs/phase-8/refactoring-plan.md`                                          | Phase 8 成果物  |
| 品質レポート             | `outputs/phase-9/quality-report.md`                                            | Phase 9 成果物  |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                       | Phase 11 成果物 |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`                                     | Phase 12 成果物 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`                               | Phase 12 成果物 |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`                                  | Phase 12 成果物 |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                                      | Phase 10 成果物 |
| PR 作成ガイド            | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PR 基準         |
| 是正計画                 | `outputs/phase-10/corrective-plan.md`                                          | Phase 10 成果物 |
| 出荷準備チェック         | `outputs/phase-10/shipment-readiness-check.md`                                 | Phase 10 成果物 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                                    | Phase 11 成果物 |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`                                        | Phase 11 成果物 |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`                                | Phase 12 成果物 |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`                                    | Phase 12 成果物 |
| コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md`                       | Phase 12 成果物 |

## 成果物

| 成果物           | パス                                     | 説明                      |
| ---------------- | ---------------------------------------- | ------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | Phase 1〜12 の完了根拠    |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR 前の変更要点           |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URL 等（承認後に作成） |

> `pr-creation-result.md` は PR 作成後に必要になった場合のみ追加する。

## 完了条件

- [ ] ユーザーの明示的な PR 作成許可を得ていること
- [ ] blocked の理由が記録されていること
- [ ] `local-check-result.md` と `change-summary.md` が作成されていること
- [ ] `pr-info.md` を作成できる状態であること
- [ ] PR が作成されている場合は CI が通過していること
- [ ] タスクディレクトリの移動やコミットは、ユーザー承認後の別工程で実施すること

## サブタスク管理

1. ユーザーへの承認確認
2. ローカル確認結果の作成
3. 変更サマリー作成
4. PR 作成判断
5. CI 確認

## タスク100%実行確認【必須】

- [ ] ユーザー承認の有無を記録した
- [ ] ローカル確認結果を残した
- [ ] 変更サマリーを残した
- [ ] PR 未作成時は blocked のまま維持した
- [ ] 実行記録を残した

## 完了

Phase 13 はユーザー承認後に再開し、承認がない限り blocked のまま維持する。
