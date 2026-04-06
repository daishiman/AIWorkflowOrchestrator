# UT-FIX-EP-01-E2E-PLAYWRIGHT-FIRE-AND-FORGET: fire-and-forget パターン E2E テスト整備

## メタ情報

```yaml
issue_number: 1911
```

## メタ情報

| 項目         | 値                                                         |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-FIX-EP-01-E2E-PLAYWRIGHT-FIRE-AND-FORGET                |
| タスク名     | fire-and-forget パターンの Playwright E2E テスト整備       |
| 優先度       | 低                                                         |
| 分類         | テスト拡充                                                 |
| 見積もり規模 | 中規模                                                     |
| 検出元       | TASK-FIX-EP-01 Phase 3（設計レビュー）, Phase 10, Phase 11 |
| 作成日       | 2026-04-04                                                 |
| ステータス   | 未着手                                                     |

## 概要

`skill-creator:execute-plan` IPC の fire-and-forget 化に伴い、Renderer 側の ack 分岐を含む end-to-end フローの自動検証が未整備。現在は自動テスト 938 件（ユニット + 統合）で代替検証しているが、実際の Electron プロセス間通信を経由した E2E テストは存在しない。

## 影響範囲

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — `handleExecutePlan` の `isExecutePlanAck` 分岐
- `apps/desktop/src/main/ipc/creatorHandlers.ts` — fire-and-forget ハンドラー
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `executeAsync` メソッド

## 対応方針

1. Playwright テスト環境の整備（E2E フレームワーク構成）
2. Skill Creator 画面を起動し、「計画を立てる」→「実行する」フローを自動操作
3. 以下を検証するテストケースを作成:
   - 「実行する」ボタンクリック後、UI が即座に「実行中」状態に切り替わること（100ms 以内レスポンス）
   - IPC タイムアウトエラーが発生しないこと
   - `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベント経由で進捗が UI に反映されること
   - スキル生成完了後に「完了」状態に遷移すること

## 苦戦箇所（TASK-FIX-EP-01 からの知見）

- **Playwright 環境未整備**: Electron + Playwright の統合テスト環境がプロジェクト全体で未構成。E2E テスト基盤の構築が前提となる
- **非同期イベント待ち合わせ**: fire-and-forget パターンでは `invoke` のレスポンスと実際の完了通知が分離しているため、Playwright でイベント到着を待つ仕組みが必要
- **推奨**: Playwright 環境整備タスクと合わせて対応すると効率的

## 参照

- TASK-FIX-EP-01 Phase 3 設計レビュー: MINOR 指摘
- TASK-FIX-EP-01 Phase 11 手動テスト: 代替検証で対応済み
- `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/unassigned-task-detection.md`: U-1
