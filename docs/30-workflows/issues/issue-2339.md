# [#2339] [TASK-LOGS-ARCHIVE-CI-VALIDATE-001] LOGS.md アーカイブポリシー CI 検証スクリプト統合

## メタ情報

```yaml
issue_number: 2339
title: [TASK-LOGS-ARCHIVE-CI-VALIDATE-001] LOGS.md アーカイブポリシー CI 検証スクリプト統合
state: OPEN
priority: 低
scale: 小規模
category: -
status: -
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2339
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | -      |

---

## 背景

`TASK-LOGS-ARCHIVE-POLICY-001` にてアーカイブポリシーが確定したが、現時点ではアーカイブポリシーに違反した状態（閾値超過のまま放置）を **PR マージ前に自動検知する仕組みが存在しない**。違反の検知は担当者の手動確認に依存しており、見落としが発生しやすい状況にある。

本タスクは `TASK-LOGS-ARCHIVE-POLICY-001 Phase 12 unassigned-task-detection（UT-003）` にて記録・formalize された。

## 目標

GitHub Actions ワークフローに LOGS.md サイズ検証スクリプトを統合し、PR マージ時に 300 行超・30 KB 超の閾値チェックを自動実行する仕組みを構築する。

- 検知時は **warning（警告）として通知**し、エラーによるマージブロックは行わない（非破壊的 CI / exit 0 保証）
- `.claude/skills/*/LOGS.md` と `.agents/skills/*/LOGS.md` の両方を対象とする
- 警告メッセージにポリシー参照パスを含める

## 成果物

| 成果物                                  | 種別 | 内容                                                 |
| --------------------------------------- | ---- | ---------------------------------------------------- |
| `scripts/ci/check-logs-size.sh`         | 新規 | LOGS.md サイズ検証スクリプト（ローカル単体実行可能） |
| `.github/workflows/logs-size-check.yml` | 新規 | GitHub Actions ワークフロー定義                      |

## エスカレーションフロー参照

ポリシー §5.3 エスカレーションフロー（F-005）: アーカイブ未実施の一次対応として「該当 skill 担当が当月内に実施」と定められているが、CI 自動検知なしでは担当者の気づきが遅れやすい。

## 参照

- ポリシー正本: `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`
- 仕様書: `docs/30-workflows/unassigned-task/TASK-LOGS-ARCHIVE-CI-VALIDATE-001.md`

## 依存タスク

- TASK-LOGS-ARCHIVE-POLICY-001（前提: 閾値・対象パス・エスカレーションフローの定義元）
