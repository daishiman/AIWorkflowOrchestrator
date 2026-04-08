# UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001: Phase 12 close-out 時の台帳・lane・artifacts 三者同期チェックリスト整備

## メタ情報

| 項目         | 値                                                                     |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001                         |
| issue_number | 2031                                                                   |
| 検出元       | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 12 フィードバック |
| 優先度       | MEDIUM                                                                 |
| 影響         | 片側更新による仕様書・台帳・lane index の不整合が次回close-outで再発   |
| 検出日       | 2026-04-07                                                             |

## 概要

W0-seq-02 完了時に以下5箇所を同期させる必要があった: task-workflow.md, task-workflow-completed.md, skill-wizard-redesign-lane/index.md, outputs/artifacts.json, docs/30-workflows/W0-seq-02-smart-default-reasoning-service/outputs/artifacts.json。これらの同期関係が明示されないため、次回のPhase 12 close-outで同じ見落としが再発するリスクがある。

## 現状

```markdown
<!-- 現状: Phase 12 完了条件（抜粋） -->

## Phase 12 完了条件

- [ ] implementation-guide.md 作成
- [ ] system-spec-update-summary.md 作成
- [ ] unassigned-task-detection.md 作成

# ← lane index / backlog / artifacts の三者同期チェックが含まれていない
```

task-workflow.md・task-workflow-completed.md・lane/index.md・outputs/artifacts.jsonという4〜5箇所のファイルをPhase 12 close-outで同時に更新する必要があるが、この要件がPhase 12テンプレートに含まれていない。

## 期待される修正

```markdown
## Phase 12 完了条件（改善後）

- [ ] implementation-guide.md 作成
- [ ] system-spec-update-summary.md 作成
- [ ] unassigned-task-detection.md 作成
- [ ] task-workflow-backlog.md の当該タスクエントリを completed に移動
- [ ] task-workflow-completed.md に当該タスクを追加
- [ ] lane/index.md の当該タスクステータスを DONE に更新
- [ ] outputs/artifacts.json の全Phase status を confirmed
- [ ] 上記5ファイルの parity を最終確認
```

task-specification-creator スキルのPhase 12テンプレートにこのチェックリストを必須項目として追加する。

## 完了条件

- [ ] task-specification-creator スキルのPhase 12テンプレートに「ledger/lane/artifacts三者同期」チェックリストが追加されている
- [ ] 同期対象ファイル（backlog/completed/lane-index/artifacts）が明示されている
- [ ] チェックリストがPhase 12の必須完了条件として組み込まれている

## 苦戦箇所記録

task-workflow.md・task-workflow-completed.md・lane/index.md・outputs/artifacts.jsonという4〜5箇所のファイルをPhase 12 close-outで同時に更新する必要があるが、これが明文化されていなかったため段階的に発見・修正が必要だった。最終的にチェックリスト化で解決。

## 関連

- 検出タスク: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001
- 関連フィードバック: FB-04（Phase 12 skill-feedback-report.md）
