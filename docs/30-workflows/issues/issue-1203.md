# [#1203] [UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001] UT

## メタ情報

```yaml
task_id: UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001
task_name: UT
category: -
target_feature: -
priority: low
scale: small
status: unassigned
source_phase: task-061-ui-09-onboarding-wizard Phase 11 TC-11-05
created_date: 2026-03-13
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | low        |
| 規模       | small      |
| ステータス | unassigned |

---

## 概要

Onboarding Wizard の Step 3（使い始めたい用途を選ぶ）において、mobile viewport（390x844）で starter tool カードを選択した場合、選択されたカードが元の位置（2番目など）に留まり、first fold に表示されないことがある。選択済みカードを先頭に移動するか、選択状態の視覚的強調を強化することで、ユーザーの選択確認を容易にする。

## 背景

- Phase 11 手動テスト TC-11-05 で発見
- Onboarding は初回1回限りの体験であり、機能影響は軽微
- first fold 可視性と選択状態の prominence は別責務として分離

## 対象ファイル

- `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx`

## 受け入れ基準

- [ ] mobile viewport でカード選択後、選択されたカードが視覚的に目立つ
- [ ] first fold 内に選択確認の視覚的フィードバックがある
- [ ] 既存テスト（20件）が全て PASS する
- [ ] Desktop/Tablet レイアウトに影響しない

## 関連タスク

- task-061-ui-09-onboarding-wizard（親タスク）
