# Phase 12 未タスク検出

## 判定

- current task 由来の新規 unassigned task: `1 件`
- current task で追加した継続 backlog: `1 件`

## 新規 formalize backlog

| 未タスクID                                        | 発見元                            | 内容                                                                                                                       | 配置先                                                                                                                                    |
| ------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001` | Phase 11 manual note (`TC-11-05`) | mobile Step 3 で selected starter card が 2 番目に残る改善余地を、first fold 可視性と別責務の UX 改善として formalize した | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md` |

## 既存 follow-up backlog の再確認

| 未タスクID                                             | 配置                                 | フォーマット   | 今回の確認結果                                                                                        |
| ------------------------------------------------------ | ------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------- |
| `UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001`           | `docs/30-workflows/unassigned-task/` | task-spec 準拠 | 物理配置を確認し、`onboarding.hasCompleted` 維持 + force-open local state 契約へ本文を再同期した      |
| `UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001` | `docs/30-workflows/unassigned-task/` | task-spec 準拠 | 物理配置を確認し、`onboarding.hasCompleted` 維持 + Settings callback 起点の責務分離へ本文を再同期した |

## current task の結論

| 項目                | 判定 | 理由                                                                                                 |
| ------------------- | ---- | ---------------------------------------------------------------------------------------------------- |
| 新規 blocker        | なし | Phase 1-12 の完了を止める項目は残っていない                                                          |
| 新規 minor backlog  | あり | Phase 11 manual note 由来の mobile Step 3 改善余地を 1 件 formalize した                             |
| 既存 follow-up 配置 | 適合 | `docs/30-workflows/unassigned-task/` 配下 2 件の配置と本文契約を current implementation に再同期した |

## 精査対象の候補検討記録

今回の再監査では、未タスク候補として以下の 4 点を精査した。

1. `ThemePreviewCard` の `system` preview で primary text が dark half に沈みやすい
2. Phase 4 / Phase 10 / Phase 12 で `TC-11-07` が別シナリオに再利用され、visual/non-visual の ID が衝突している
3. `.claude` canonical と `.agents` mirror の `ui-ux-navigation.md` が drift している
4. `TC-11-05` の mobile state で selected starter card が 2 番目に残り、first fold 可視性とは別の choice clarity 課題がある

結論として、1〜3 は current turn で修正済み、4 は別責務の UX 改善として `UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001` へ formalize した。

- 1 は `OnboardingWizard` の `system` preview surface を readable な light panel へ是正し、current build screenshot を再取得して `TC-11-04` で再確認した
- 2 は visual TC を `TC-11-01..06` へ固定し、`TC-11-07` の重複定義を workflow 成果物から除去した
- 3 は canonical 側の onboarding navigation spec を現行実装へ更新したうえで mirror へ同期し、`diff -qr` で drift 0 を再確認した
- 4 は `TC-11-05` の manual note を起点に、first fold 可視性と selected-state prominence を分けて扱う follow-up task として formalize した

## 監査ログ記録欄

- `verify-unassigned-links.js`: PASS（source=`.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `220 / 220`, missing=0）
- `audit-unassigned-tasks.js --json --diff-from HEAD`: PASS（current=0, baseline=134, format=91, naming=5, misplaced=38）
- `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md`: PASS（current=0）
- `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md`: PASS（current=0）
- `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md`: PASS（current=0）

## 補足

- `baseline=134` は repository 全体に残る legacy unassigned-task 品質課題であり、current task が新規に増やしたものではない。
- current task 由来の新規 formalize は 1 件で、Phase 11 manual note の selected card order 改善余地を task-spec 形式へ変換した。
- 既存 follow-up 2 件は、指定ディレクトリ配置の確認だけでなく current contract への本文再同期まで今回ターンで実施した。
