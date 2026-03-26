# TASK-SDK-05: create-entry-mainline-unification

## 概要

`SkillLifecyclePanel` と `SkillCreateWizard` に分散している create 導線を整理し、
通常ユーザーが迷わず辿る一次導線を `Skill Center -> skillCreate` に固定する task 仕様書である。

この task の主目的は、UI を全面統合することではない。
「どこから始めるか」を 1 つに説明できる状態を作り、
補助導線や advanced route は検証用・診断用の secondary route として残すことにある。

## この task で固定すること

- create の primary route を `Skill Center` 起点に一本化する
- `SkillCreateWizard` を create の destination surface として固定する
- `SkillLifecyclePanel` / `SkillManagementPanel` を advanced / secondary route として位置づける
- source provenance / structure mismatch / source conflict の表示を mainline 向け summary と diagnostics に分離する
- `setCurrentView` / `currentSkillName` / `viewHistory` の既存 store 境界を崩さず handoff を整理する
- Task06 の verify / improve 再入場面と責務を分離する

## 非対象

- verify / improve / apply / re-verify の正式 surface 設計
- approval / disclosure / terminal handoff governance
- session persistence / resume compatibility
- `SkillCreateWizard` 内部の step 構成そのものの全面刷新
- `SkillLifecyclePanel` の runtime 実行ロジック再設計

## 依存関係

| 種別        | 参照先                                                                       | 役割                                                 |
| ----------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| predecessor | `../step-03-par-task-03-context-budget-and-resource-selection/index.md`      | provenance / degrade warning の upstream 契約        |
| predecessor | `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`       | interaction bridge / awaiting input の upstream 契約 |
| parallel    | `../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`       | verify / improve / re-entry surface の並列 task      |
| downstream  | `../step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md` | disclosure / governance / handoff hardening          |

## 現行コードアンカー

| ファイル                                                                  | 現状の責務                                                     | Task05 での扱い                                             |
| ------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/App.tsx`                                       | `skillCreate` / `skillAnalysis` / advanced route の shell 分岐 | create mainline と advanced route の境界を固定する          |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | header CTA と journey CTA による一次導線の入口                 | primary create entry の正面入口に固定する                   |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `setCurrentView("skillCreate")` などの handoff                 | mainline handoff payload の最小契約を維持する               |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | template / LLM 両モードの作成 destination                      | create destination surface として位置づける                 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | create -> execute -> improve の一気通し panel                  | mainline ではなく advanced / secondary route として整理する |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | list / create / lifecycle / analysis を持つ advanced panel     | primary route の代替にしない secondary shell として残す     |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | job guide / surface responsibility / advanced route 契約       | primary/secondary の言語正本として再利用する                |

## 完了イメージ

- create を始める通常導線を 1 文で説明できる
- `SkillCenter` が入口、`SkillCreateWizard` が destination、`SkillManagementPanel` が advanced route と整理されている
- provenance warning は mainline 向け summary と raw diagnostics に分離されている
- Task06 の verify / improve 再入場導線と衝突しない
- advanced route を残しても primary route が揺れない

## 受入基準

- AC-1: 通常ユーザー向け create 入口は `Skill Center` の CTA 群に集約されている
- AC-2: `SkillCreateWizard` は create destination であり、独立した primary entry として説明しない
- AC-3: `SkillLifecyclePanel` / `SkillManagementPanel` は advanced / secondary route として扱われる
- AC-4: source provenance / degrade warning は mainline で summary 表示し、診断詳細は secondary route へ逃がす
- AC-5: `setCurrentView` / `currentSkillName` / `viewHistory` の既存 store 境界を崩さない
- AC-6: Task06 の verify / improve / re-entry surface をこの task へ持ち込まない
- AC-7: close/back の戻り先は `skillCenter` を正本にし、legacy alias を増やさない

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| 真の論点             | UI を増やすことではなく、create 開始点を 1 つに説明できること                                             |
| 依存関係・責務境界   | provenance は Task03、interaction bridge は Task04、verify/improve は Task06、governance は Task07 が担う |
| 価値とコストの不均衡 | 一次導線の固定は高価値だが、全画面統合まで広げると Task06/07 の責務を侵食する                             |
| 改善優先順位         | 1) primary route 固定 2) secondary route の格下げ 3) warning 表示境界 4) downstream handoff 明文化        |
| 4条件評価            | 価値性・実現性・整合性・運用性を満たすため、create 導線の説明責務に scope を絞る                          |

## ディレクトリ構成

```text
step-04-par-task-05-create-entry-mainline-unification/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/mainline-boundary-matrix.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-11/
    │   ├── manual-test-checklist.md
    │   ├── manual-test-result.md
    │   └── screenshot-plan.json
    └── phase-12/
        ├── implementation-guide.md
        ├── system-spec-update-summary.md
        ├── documentation-changelog.md
        ├── unassigned-task-detection.md
        ├── skill-feedback-report.md
        └── phase12-task-spec-compliance-check.md
```

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
