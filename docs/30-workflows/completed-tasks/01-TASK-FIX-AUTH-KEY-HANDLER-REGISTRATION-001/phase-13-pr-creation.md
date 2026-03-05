# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 13                                                     |
| 機能名     | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001             |
| タスク名   | auth-key IPCハンドラ登録漏れとライフサイクル整合の修正 |
| 前提Phase  | Phase 12                                               |
| 後続Phase  | -                                                      |
| 作成日     | 2026-03-05                                             |
| ステータス | pending                                                |

## 目的

提出準備を完了し、ユーザー承認後のみPR作成へ進む。

## 背景

`auth-key:exists` で `No handler registered` が発生し、実行前認証確認が停止する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- 提出差分整理: レビューに必要な差分説明を整理する
- 承認条件確認: ユーザー明示承認がある場合のみPR作成へ進む
- 引き継ぎ記録: 次担当者が迷わない引き継ぎ情報を固定する

## 参照資料

| 参照資料               | パス                                              | 説明            |
| ---------------------- | ------------------------------------------------- | --------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物  |
| IPC契約設計            | `outputs/phase-2/ipc-contract-design.md`          | Phase 2 成果物  |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 契約差分               | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物  |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物  |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物  |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物  |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物  |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| 品質レポート           | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| リスク台帳             | `outputs/phase-9/risk-register.md`                | Phase 9 成果物  |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 是正計画               | `outputs/phase-10/corrective-action-plan.md`      | Phase 10 成果物 |
| 出荷準備チェック       | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`          | Phase 11 成果物 |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`              | Phase 11 成果物 |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`             | Phase 11 成果物 |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`        | Phase 12 成果物 |
| 仕様更新サマリー       | `outputs/phase-12/spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴               | `outputs/phase-12/documentation-changelog.md`     | Phase 12 成果物 |
| 未タスク検出           | `outputs/phase-12/unassigned-task-detection.md`   | Phase 12 成果物 |
| スキルフィードバック   | `outputs/phase-12/skill-feedback-report.md`       | Phase 12 成果物 |
| Task2実行ログ          | `outputs/phase-12/phase12-task2-step-log.md`      | Phase 12 成果物 |

## 実行手順

1. 差分要約とレビュー観点を整理する。
2. 承認条件チェックでユーザー明示承認の有無を確認する。
3. 承認がない場合はPR作成を実行せず保留記録のみ残す。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物           | パス                                     | 説明             |
| ---------------- | ---------------------------------------- | ---------------- |
| PR準備メモ       | `outputs/phase-13/pr-preparation.md`     | 提出準備情報     |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | 引き継ぎ情報     |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001
```

## PR作成制約

- ユーザーの明示承認がある場合だけPR作成へ進む。
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## 次のPhase

Phase -: -
