# [#1839] [TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001] before-quit guard の実装

## メタ情報

```yaml
task_id: TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001
task_name: before-quit guard の実装
category: 改善
target_feature: Skill Creator の実行中終了ガード
priority: 中
scale: 中規模
status: クローズ済 (GitHub CLOSED, label status:unassigned)
source_phase: 2026-04-01 Phase 12 unassigned-task-detection
created_date: 2026-04-01
closed_date: 2026-04-03
dependencies: TASK-FIX-EXECUTE-PLAN-FF-001
spec_path: docs/30-workflows/completed-tasks/skill-creator-before-quit-guard/unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md
github_issue: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1839
labels:
  [
    priority:medium,
    type:improvement,
    status:unassigned,
    skill-creator,
    unassigned-task,
  ]
```

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| 優先度     | 中 (priority:medium)                |
| 規模       | 中規模                              |
| ステータス | クローズ済（ラベル上は unassigned） |

---

## 1. なぜこのタスクが必要か（Why）

`skill-creator:execute-plan` を fire-and-forget 化した結果、アプリ終了時にバックグラウンド実行中のスキル生成が中断され、不整合や未保存の状態が残るリスクが顕在化した。ユーザーへ警告せず終了できてしまうため、`before-quit` イベントでのガードが必要となった。

## 2. 何を達成するか（What）

アプリ終了前にスキル生成の実行中を検知し、適切な処理（警告ダイアログや待機/中断）を行う。スキル未実行時は通常終了できるよう維持する。

## 3. どのように実行するか（How）

1. `RuntimeSkillCreatorFacade` に実行中判定 API (`hasRunningExecution`) を提供する。
2. `app.on('before-quit', ...)` でガードを登録し、ダイアログ表示と終了可否を制御する。
3. テストケースを追加し、実行中/未実行/ダイアログ reject の分岐を検証する。
4. 必要に応じて `app.exit(0)` で即時終了させるケースを整理する。

## 4. 完了条件チェックリスト

- [ ] 実行中にアプリ終了を試みた場合、適切な処理（警告/待機/中断）が行われる
- [ ] 非実行時は通常終了できる
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS
- [ ] UI 通知を実装する場合はアクセシビリティに配慮

## 5. 関連

- 親タスク: TASK-FIX-EXECUTE-PLAN-FF-001
- 仕様書: `docs/30-workflows/completed-tasks/skill-creator-before-quit-guard/unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md`

## 6. 備考

- GitHub 状態: CLOSED (2026-04-03 更新)
- ラベル: priority:medium / type:improvement / status:unassigned / skill-creator / unassigned-task
