# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 1                                    |
| 名称       | 要件定義                             |
| 前提Phase  | なし                                 |
| 次Phase    | Phase 2（設計）                      |
| タスク分類 | UI task（新規コンポーネント + 統合） |
| 作成日     | 2026-04-03                           |

## 目的

VerifyResultDetailPanel と ImproveResultDetailPanel の要件を定義し、スコープ・前提条件・受入基準を固定する。既存の PlanResultDetailPanel / ExecuteResultDetailPanel のパターンを分析し、再利用可能な設計パターンと新規実装が必要な部分を明確にする。

## 現状ベースライン

- `SkillLifecyclePanel.tsx` には verify detail の inline 表示ブロックが既にあり、`VerifyResultDetailPanel` はその抽出先として新規作成する
- `SkillLifecyclePanel.tsx` には `runtimeImproveResult` と `ImprovementProposalPanel` の runtime improve flow が既にあり、`ImproveResultDetailPanel` は read-only の結果表示として追加する
- `result-panel-parts.tsx` は既に存在するが、verify status の語彙差を吸収するため `StatusBadge` の label override を追加する前提で設計する

## Step 0: P50チェック（既実装確認）

### 確認結果

| 確認項目                         | 結果                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| VerifyResultDetailPanel.tsx      | **未実装** — ファイル不在                                                                                          |
| ImproveResultDetailPanel.tsx     | **未実装** — ファイル不在                                                                                          |
| verify detail inline block       | **実装済み** — `SkillLifecyclePanel.tsx` に verify detail の inline 表示が存在                                     |
| ImprovementProposalPanel.tsx     | **実装済み** — improve の提案表示パネルが既に存在                                                                  |
| SkillLifecyclePanel verify 分岐  | **部分実装** — currentPhase === "verify" 時に execute 結果を表示する暫定コードと verify detail inline block が共存 |
| runtimeImproveResult flow        | **実装済み** — `runtimeImproveResult` で runtime improve 提案を保持し、`ImprovementProposalPanel` に渡している     |
| RuntimeSkillCreatorVerifyDetail  | **型定義済み** — `packages/shared/src/types/skillCreator.ts` に完全定義                                            |
| RuntimeSkillCreatorImproveResult | **型定義済み** — `packages/shared/src/types/skillCreator.ts` に完全定義                                            |
| result-panel-parts.tsx           | **実装済み** — SectionHeader / TagList / StatusBadge / DetailFooter / PANEL_CARD_CLASSES を export                 |
| StatusBadge 語彙                 | **部分整合** — 現行は success/failure/pending。verify 用には label override が必要                                 |

### 既存命名規則の分析

| パターン               | 規則                              | 例                               |
| ---------------------- | --------------------------------- | -------------------------------- |
| コンポーネントファイル | PascalCase.tsx                    | `PlanResultDetailPanel.tsx`      |
| テストファイル         | PascalCase.test.tsx               | `PlanResultDetailPanel.test.tsx` |
| Props 型名             | `{Component}Props`                | `PlanResultDetailPanelProps`     |
| data-testid            | kebab-case                        | `plan-result-detail-panel`       |
| import パス            | `@repo/shared/types` から型import | `RuntimeSkillCreatorPlanResult`  |

## 実行タスク

### Task 1-1: 既存パネルの責務分析

| パネル                   | 表示するデータ型                         | 共有部品の使用                       |
| ------------------------ | ---------------------------------------- | ------------------------------------ |
| PlanResultDetailPanel    | `RuntimeSkillCreatorPlanResult`          | SectionHeader, TagList, DetailFooter |
| ExecuteResultDetailPanel | `RuntimeSkillCreatorExecuteResult`       | StatusBadge, DetailFooter            |
| Verify inline block      | `RuntimeSkillCreatorVerifyDetail`        | inline helper（抽出対象）            |
| ImprovementProposalPanel | `RuntimeSkillCreatorImproveSuggestion[]` | 独自UI（既存）                       |

### Task 1-2: Verify パネルの要件定義

**表示対象データ型**: `RuntimeSkillCreatorVerifyDetail`

| フィールド                 | 型                                     | 表示方法                           |
| -------------------------- | -------------------------------------- | ---------------------------------- |
| `currentPhase`             | `string`                               | メタデータ行                       |
| `planId`                   | `string`                               | DetailFooter                       |
| `status`                   | `"pending" \| "pass" \| "fail"`        | StatusBadge（label override 付き） |
| `message`                  | `string?`                              | テキスト表示                       |
| `nextAction`               | `"review" \| "improve" \| "handoff"?`  | タグ表示                           |
| `checks`                   | `RuntimeSkillCreatorVerifyCheck[]`     | チェックリスト（Layer別グループ）  |
| `evidenceCount`            | `number`                               | バッジ表示                         |
| `route`                    | `RuntimeSkillCreatorVerifyDetailRoute` | メタデータ行                       |
| `reverifyEligible`         | `boolean`                              | ボタン有効/無効                    |
| `disabledReason`           | `string?`                              | 無効時の説明                       |
| `resolvedSkillCreatorRoot` | `string?`                              | Provenance 行                      |
| `manifestPath`             | `string?`                              | Provenance 行                      |
| `resourceDescriptorHash`   | `string?`                              | Provenance 行                      |
| `manifestCacheKey`         | `string?`                              | Provenance 行                      |
| `delegatedGovernanceNote`  | `string`                               | テキスト表示                       |
| `delegatedSessionNote`     | `string`                               | テキスト表示                       |

**Verify チェックの表示仕様**:

- Layer 別（layer1〜layer4）にグループ化して表示
- 各チェック項目は severity（info / warning / error）に応じたアイコンを表示
- summary と evidenceSummary を表示
- 0 件のときは空状態メッセージを表示
- 折りたたみ対応（チェック数が多い場合）
- `StatusBadge` は label override で `pass` / `fail` / `pending` を `合格` / `不合格` / `検証中` として表示する

### Task 1-3: Improve パネルの要件定義

**表示対象データ型**: `RuntimeSkillCreatorImproveResult`

| フィールド    | 型                                       | 表示方法                 |
| ------------- | ---------------------------------------- | ------------------------ |
| `improveId`   | `string`                                 | DetailFooter             |
| `suggestions` | `RuntimeSkillCreatorImproveSuggestion[]` | 提案リスト               |
| `revisedSpec` | `string?`                                | 折りたたみコードブロック |

**Improve 提案の表示仕様**:

- 各提案を section / before / after / reason のカード形式で表示
- before / after は diff 風に強調（背景色の差別化）
- revisedSpec は折りたたみの `<pre>` ブロックで表示（PlanResultDetailPanel の skillSpec と同パターン）
- suggestions が 0 件でも improveId と revisedSpec は表示する
- suggestions が 0 件のときは空状態メッセージを表示する

### Task 1-4: SkillLifecyclePanel 統合要件

| 条件                              | 表示コンポーネント         |
| --------------------------------- | -------------------------- |
| `verifyDetail` が取得済み         | `VerifyResultDetailPanel`  |
| `runtimeImproveResult` が取得済み | `ImproveResultDetailPanel` |

**注意**: 既存の `ImprovementProposalPanel` は improve の **提案操作パネル**（apply/feedback 機能付き）であり、本タスクで作成する `ImproveResultDetailPanel` は improve の **結果表示パネル**（読み取り専用）。責務が異なるため共存する。`VerifyResultDetailPanel` は `SkillLifecyclePanel` の inline verify detail block の抽出先として置き換える。

### Task 1-5: 受入基準

| ID    | 基準                                                                                  | 検証方法       |
| ----- | ------------------------------------------------------------------------------------- | -------------- |
| AC-1  | verify フェーズ完了後に VerifyResultDetailPanel が SkillLifecyclePanel に表示される   | ユニットテスト |
| AC-2  | improve フェーズ完了後に ImproveResultDetailPanel が SkillLifecyclePanel に表示される | ユニットテスト |
| AC-3  | VerifyResultDetailPanel が checks を Layer 別にグループ化して表示する                 | ユニットテスト |
| AC-4  | VerifyResultDetailPanel が severity に応じたアイコンを表示する                        | ユニットテスト |
| AC-5  | ImproveResultDetailPanel が suggestions を section/before/after/reason で表示する     | ユニットテスト |
| AC-6  | 各パネルが result-panel-parts.tsx の共有部品を再利用している                          | コードレビュー |
| AC-7  | VerifyResultDetailPanel のテストが 25件 PASS する                                     | テスト実行     |
| AC-8  | ImproveResultDetailPanel のテストが 15件 PASS する                                    | テスト実行     |
| AC-9  | TypeScript 型チェック・ESLint がエラー 0件である                                      | 自動検証       |
| AC-10 | 既存テストが全て PASS する                                                            | テスト実行     |
| AC-11 | VerifyResultDetailPanel が route / provenance / disabledReason を表示する             | ユニットテスト |
| AC-12 | ImproveResultDetailPanel が suggestions 0件と revisedSpec の有無を正しく扱う          | ユニットテスト |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                         | パス                                                                                                           | 内容                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| SkillLifecyclePanel 設計         | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` | ルーティング・レンダリング基盤 |
| UI/UX コンポーネントリファレンス | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                      | SkillDetailPanel 設計          |

### コード参照

| 参照                     | パス                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| PlanResultDetailPanel    | `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`    |
| ExecuteResultDetailPanel | `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx` |
| result-panel-parts       | `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx`       |
| ImprovementProposalPanel | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` |
| SkillLifecyclePanel      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      |
| 型定義                   | `packages/shared/src/types/skillCreator.ts`                               |

## 成果物

| 成果物         | 配置先                                  |
| -------------- | --------------------------------------- |
| Phase 1 仕様書 | `phase-1-requirements.md`（本ファイル） |

## 完了条件

- [ ] 既存パネル（Plan / Execute）の責務・パターンが分析されている
- [ ] Verify パネルの表示フィールドと表示方法が定義されている
- [ ] Improve パネルの表示フィールドと表示方法が定義されている
- [ ] SkillLifecyclePanel 統合条件が定義されている
- [ ] 受入基準 AC-1〜AC-12 が検証可能な形で定義されている
- [ ] 受入基準 AC-11〜AC-12 が検証可能な形で定義されている
- [ ] 既存命名規則が分析・記録されている
- [ ] 既存コードの P50チェックが完了している

## タスク100%実行確認【必須】

- [x] Task 1-1: 既存パネルの責務分析 — 完了
- [x] Task 1-2: Verify パネルの要件定義 — 完了
- [x] Task 1-3: Improve パネルの要件定義 — 完了
- [x] Task 1-4: SkillLifecyclePanel 統合要件 — 完了
- [x] Task 1-5: 受入基準 — 完了

## 次Phase

Phase 2（設計）へ進む。Phase 1 で定義した要件と型情報を基に、コンポーネント設計と SkillLifecyclePanel 統合設計を行う。
