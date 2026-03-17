# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| Phase名    | 要件定義                              |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | なし（Task01 Phase 3 完了が事前条件） |
| 後続Phase  | Phase 2（設計）                       |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

SkillCenterView の現状コードを確認し、ヘッダーCTA追加と JourneyPanel クリッカブル化に必要な実装スコープを確定する。受入基準 AC-1〜AC-8 を検証可能な形で定義し、Task01 との依存境界を明確にする。

## 実行タスク

- 現状確認: SkillCenterView / useSkillCenter / skillLifecycleJourney / SkillLifecycleJourneyPanel の現状コードを読み、変更箇所を特定する
- P50チェック: 対象ファイルの既実装状態を調査し、受入基準の一部が既に実装済みでないかを確認する
- スコープ確定: AC-1〜AC-8 に対応する実装スコープを機能要件・非機能要件に分類する
- 依存境界整理: Task01（ViewType 追加）との依存インターフェースを整理し、前提条件を明文化する
- 除外範囲定義: 本タスクが扱わない責務（スキル作成ロジック本体、SkillAnalysisView の実装など）を明示する

## 参照資料

| 参照資料                   | パス                                                                                     | 内容                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| SkillCenterView            | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                              | ヘッダー構造とJourneyPanel接続の現状を確認する                     |
| useSkillCenter             | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                | 現在のアクション定義と遷移ロジックを確認する                       |
| skillLifecycleJourney      | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                          | JOB_GUIDES の onAction 型定義と forbiddenResponsibility を確認する |
| SkillLifecycleJourneyPanel | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/` | 現在のカードレンダリングとProps契約を確認する                      |
| パック親 index             | `docs/30-workflows/skill-lifecycle-routing/index.md`                                     | 実行順序・依存グラフ・共通方針の正本を確認する                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                             | パス                                                                                        | 内容                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様の正本                |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / SkillEditor / JourneyPanel 仕様の正本 |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand state 管理・setCurrentView パターン         |

## 実行手順

### ステップ0: P50チェック（既実装状態の調査）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# ヘッダーCTAの既実装確認
grep -n "新しいツールを作る\|skillCreate\|setCurrentView" apps/desktop/src/renderer/views/SkillCenterView/index.tsx

# JourneyPanel のボタン実装確認
grep -rn "onAction\|CTAButton\|button" apps/desktop/src/renderer/views/SkillCenterView/components/SkillLifecycleJourneyPanel/

# skillLifecycleJourney の onAction 定義確認
grep -n "onAction\|forbiddenResponsibility" apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts
```

| 判定         | 条件                             | 対応                                          |
| ------------ | -------------------------------- | --------------------------------------------- |
| 未実装       | 受入基準の対応コードが存在しない | 通常の要件定義・設計・実装フローを進む        |
| 一部実装済み | 一部の AC が既に満たされている   | 未実装箇所のみをスコープとして Phase 2 に進む |
| 全実装済み   | 全 AC が既に満たされている       | Phase 4-5 を「検証・補完」モードに切り替える  |

### ステップ1: 参照資料を確認する

この Phase で使うコードパス・前提Phase・システム仕様を確認し、SkillCenterView 作成導線配線の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: システム仕様との整合を確認する

aiworkflow-requirements の正本と照合し、ViewType・UI・状態管理のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス・完了条件・次の Phase への handoff を確認して記録する。

## 統合テスト連携

ViewType 遷移・JourneyPanel CTA・useSkillCenter アクションの接続要件を要件として明文化する。Task01 が提供する `skillCreate` / `skillAnalysis` ViewType の利用方法を確認し、統合テスト観点として記録する。

## 成果物

| 成果物       | パス                                         | 内容                                                 |
| ------------ | -------------------------------------------- | ---------------------------------------------------- |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・受入基準 AC-1〜AC-8 を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲・除外範囲・Task01 依存境界を明記する        |

## 完了条件

- [ ] P50チェックが完了し、既実装状態が確認されている
- [ ] AC-1〜AC-8 が検証可能な形で定義されている
- [ ] Task01 との依存インターフェース（ViewType 名称）が明文化されている
- [ ] 本タスクが扱わない責務（forbiddenResponsibility 対象）が除外範囲として記録されている
- [ ] 機能要件と非機能要件（HIG・モバイル対応）が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
