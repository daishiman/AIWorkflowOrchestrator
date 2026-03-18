# skillcenter-create-route - タスク実行仕様書

## ユーザーからの元の指示

```text
SkillCenterView にスキル新規作成への導線を配線する（ヘッダーCTA + JourneyPanel クリッカブル化）。
現状は /advanced/skill-create-wizard への直接URL入力が唯一の到達手段であり、
仕様上の「入口としてツール探索、一次導線の案内、作成前の意図整理を担う」役割を果たせていない。
```

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| タスク名     | skillcenter-create-route              |
| 分類         | 実装                                  |
| 対象機能     | SkillCenterView 作成導線配線          |
| 優先度       | 高                                    |
| 見積もり規模 | 小規模                                |
| ステータス   | completed                             |
| 作成日       | 2026-03-17                            |

## タスク概要

### 目的

SkillCenterView にスキル新規作成への一次導線（ヘッダーCTA）と、SkillLifecycleJourneyPanel の各ステップカードへのアクションボタンを追加し、「死んだ機能」であった SkillCreateWizard / AgentView / SkillAnalysisView をユーザーが直接到達できる状態にする。

### 背景

現在の SkillCenterView には以下の問題がある:

1. スキル新規作成への遷移CTAが存在しない
2. SkillLifecycleJourneyPanel のステップカードはテキスト表示のみで、クリック可能なアクション要素がゼロ
3. 仕様上は「入口としてツール探索、一次導線の案内、作成前の意図整理を担う」だが、handoff CTAが未実装
4. 唯一の到達手段は `/advanced/skill-create-wizard` の直接URL入力

本タスクは Task01（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）が追加した `skillCreate` / `skillAnalysis` ViewType を利用して、SkillCenterView から各画面への遷移を完結させる。

### 最終ゴール

- SkillCenterView ヘッダーに「+ 新規作成」プライマリCTAボタンが表示される
- JourneyPanel の各ステップカードにCTAボタンが表示され、クリックで対応画面に遷移する
- AC-1 〜 AC-8 の全受入基準を満たす

### 成果物一覧

| 種別       | 成果物                                 | 配置先                                                                                                          |
| ---------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜3 / artifacts.json | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/`                 |
| 設計成果物 | outputs/phase-\*/\*.md                 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/outputs/phase-*/` |
| 実装コード | 対象ファイル変更                       | `apps/desktop/src/renderer/` 配下の各ファイル                                                                   |

## 参照ファイル

| 参照資料                             | パス                                                                                        | 内容                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| パック親 index                       | `docs/30-workflows/skill-lifecycle-routing/index.md`                                        | 実行順序、依存グラフ、共通方針の正本       |
| SkillCenterView                      | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                 | ヘッダーCTAとJourneyPanel接続の主対象      |
| useSkillCenter                       | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                   | 遷移アクション追加の対象Hook               |
| skillLifecycleJourney                | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                             | JOB_GUIDES の onAction 実装の対象          |
| SkillLifecycleJourneyPanel           | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/`    | ボタンレンダリング追加の対象コンポーネント |
| ナビゲーション正本                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様             |
| 機能別コンポーネント                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / SkillEditor 仕様             |
| スキルライフサイクル統合             | `docs/30-workflows/skill-lifecycle-unification/index.md`                                    | ジョブガイド・Surface Ownership            |
| 導線契約正本                         | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                             | 画面責務境界                               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand/IPC パターン                       |

## 受入基準

| ID   | 基準                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | SkillCenterView ヘッダーに「+ 新規作成」プライマリCTAボタンが表示される                                 |
| AC-2 | ボタンクリックで `setCurrentView("skillCreate")` が呼ばれ、作成画面に遷移する                           |
| AC-3 | JourneyPanel の「スキルを作る」カードにCTAボタンが表示され、クリックで作成画面に遷移する                |
| AC-4 | JourneyPanel の「スキルを使う」カードにCTAボタンが表示され、クリックで workspace に遷移する             |
| AC-5 | JourneyPanel の「スキルを改善する」カードにCTAボタンが表示され、クリックで分析画面に遷移する            |
| AC-6 | skillLifecycleJourney.ts の forbiddenResponsibility に違反しない（handoff CTAであり、実行本体ではない） |
| AC-7 | モバイル（768px未満）でもCTAボタンがアクセス可能                                                        |
| AC-8 | Apple HIG準拠（8pxグリッド、角丸8-12px、繊細な影）                                                      |

## 依存関係

| 依存タスク                                  | 状態           | 説明                                                  |
| ------------------------------------------- | -------------- | ----------------------------------------------------- |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 | Phase 3 完了後 | `skillCreate` / `skillAnalysis` ViewType の追加が前提 |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名   | 責務                                                       | 依存 |
| ---- | ---------- | -------------- | ---------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理       | 現状コードと受入基準から実装スコープを確定する             | -    |
| T-02 | Phase 2    | 設計確定       | ヘッダーCTA・JourneyPanel CTA の設計・Props 定義を確定する | T-01 |
| T-03 | Phase 3    | レビューゲート | 設計が責務境界・HIG・AC 全件に整合するか判定する           | T-02 |
| T-04 | Phase 4-7  | テスト・実装   | TDD で CTA ボタンの表示・遷移を実装する                    | T-03 |
| T-05 | Phase 8-13 | 品質・文書化   | 品質検証・ドキュメント・PR 作成                            | T-04 |

## 実行フロー

1. Phase 1-3 で実装スコープ・設計・レビューゲートを固める。
2. Phase 4-7 でTDDによるCTAボタン実装とカバレッジ確認を行う。
3. Phase 8-13 で品質検証・ドキュメント・PR作成を行う。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed   |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed   |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- ViewType 遷移・JourneyPanel CTA・useSkillCenter アクションを統合テスト観点の中心に置く。
- AC-6（forbiddenResponsibility 非違反）は設計レビュー（Phase 3）で必ず確認する。
- AC-7（モバイル対応）と AC-8（Apple HIG準拠）は Phase 11 の手動テストで確認する。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
