# [#1191] [UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001] Onboarding Wizard テストハードニングと回帰ガード強化

## メタ情報

```yaml
task_id: UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001
task_name: Onboarding Wizard テストハードニングと回帰ガード強化
category: 改善
target_feature: Onboarding Wizard / Settings rerun / OnboardingGate / SettingsView integration tests
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-13
spec_path: docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md
```

## 背景

TASK-UI-09-ONBOARDING-WIZARD の Phase 12 再確認で、Onboarding Wizard の本体実装は完了している一方、function coverage 76.92% と `act(...)` warning が残っていることを確認した。rerun 導線は `persist reset -> view handoff -> overlay 再評価` の連鎖を持ち、回帰しやすいため follow-up task として独立管理する。

## ゴール

- Onboarding 関連 target test で `act(...)` warning を 0 件にする
- first launch / complete / rerun / already-completed の主要分岐をテストで守る
- touched scope の function coverage を 80% 以上にする

## 実装課題と解決策

- rerun 契約が複数層にまたがる: helper で `persist reset -> handoff -> overlay 再表示` を固定する
- warning の原因が見えにくい: async wait と flush ポイントを明示する
- coverage gap が再発しやすい: 主要 5 分岐を coverage 対象として列挙する
- system spec との接続が切れやすい: task-workflow / settings / lessons の同一 UT ID を維持する

## 関連仕様

- `/.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `/.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
