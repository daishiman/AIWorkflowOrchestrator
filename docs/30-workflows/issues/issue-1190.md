# [#1190] [UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001] Settings Onboarding rerun 導線の発見性改善

## メタ情報

```yaml
task_id: UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001
task_name: Settings Onboarding rerun 導線の発見性改善
category: 改善
target_feature: SettingsView / Onboarding rerun card / Getting Started 導線
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 11, Phase 12
created_date: 2026-03-13
spec_path: docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md
```

## 背景

TASK-UI-09-ONBOARDING-WIZARD の手動確認では Settings から rerun できること自体は確認できたが、full settings page では rerun card が fold 下に落ちやすく、初見ユーザーが導線を見つけにくい。動作完了とは別の IA 問題として改善する。

## ゴール

- rerun card の配置または見せ方を改善し、full settings page でも見つけやすくする
- CTA の意味が非技術者にも分かる状態にする
- rerun の内部契約（`onboarding.completed=false` reset と dashboard handoff）を変えずに改善する

## 実装課題と解決策

- isolated では良く見えるが full page では埋もれる: full settings page を基準に再評価する
- UI 改善と状態契約を混ぜやすい: Settings は入口、onboarding は表示判定という境界を守る
- CTA の意味が伝わりにくい: タイトルと説明文で再体験の目的を補う
- Phase 12 の完了判定を揺らしやすい: discoverability を独立 task として扱う

## 関連仕様

- `/.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `/.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
