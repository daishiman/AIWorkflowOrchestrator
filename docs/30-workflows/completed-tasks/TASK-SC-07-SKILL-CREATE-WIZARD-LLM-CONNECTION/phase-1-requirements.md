# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| Phase名    | 要件定義                                      |
| 前提Phase  | -                                             |
| 後続Phase  | Phase 2                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

SkillCreateWizard に LLM 生成フローを接続するための要件・受入条件・インベントリを確定する。TASK-SC-06 で確立されたパターンをウィザードコンテキストに適用するために必要な差分を明確にする。

## 背景

SkillCreateWizard は TASK-10A-C で作成された4段階ウィザードだが、現在はテンプレートベースの `createSkill` のみをサポートしている。TASK-SC-06 で SkillLifecyclePanel に planSkill/executePlan を接続済みであり、同パターンをウィザードにも展開する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現行コードのインベントリ作成

**目的**: 変更対象ファイルの現状を正確に把握する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` を読み、現在の状態管理・データフロー・イベントハンドラを一覧化する
2. `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` を読み、props インターフェース・UI 要素を確認する
3. `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` を読み、props インターフェース・UI 要素を確認する
4. `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx` を読み、WizardOptions 型と生成トリガーの仕組みを確認する
5. `apps/desktop/src/renderer/components/skill/wizard/index.ts` を読み、export 構成を確認する
6. 各ファイルの既存テストファイル（`__tests__/` 配下）を読み、テストカバレッジの現状を把握する
7. 結果を `outputs/phase-1/inventory.md` に記録する

**期待される成果物**:

- `outputs/phase-1/inventory.md`（現行コードのインベントリ）

---

### タスク2: Preload API・Store 契約の確認

**目的**: planSkill / executePlan の実シグネチャと Zustand store hooks を確定する

**実行手順**:

1. `apps/desktop/src/preload/skill-creator-api.ts` の `planSkill`（L96-100）と `executePlan`（L105-110）のシグネチャを記録する
2. `apps/desktop/src/renderer/store/slices/agentSlice.ts` の `PlanResult` 型（L34-39）を記録する
3. `apps/desktop/src/renderer/store/index.ts` から以下の hooks の export を確認する:
   - `useIsSkillGenerating` / `useSetIsSkillGenerating`
   - `useGenerationProgress` / `useSetGenerationProgress`
   - `useGenerationError` / `useSetGenerationError`
   - `useCurrentPlanResult` / `useSetCurrentPlanResult`
   - `useCurrentPlanId` / `useSetCurrentPlanId`
   - `useClearGenerationState`
   - `useCreateSkill`
4. SkillLifecyclePanel（L65-82）のローカル `SkillCreatorRuntimeApi` 型と Preload API の差異を記録する
5. 結果を `outputs/phase-1/api-contract.md` に記録する

**期待される成果物**:

- `outputs/phase-1/api-contract.md`（API 契約の確認結果）

---

### タスク3: 受入条件（AC）の確定

**目的**: テスト可能な受入条件を定義する

**実行手順**:

1. GitHub Issue #1588 の受入基準を元に、以下の AC を詳細化する
2. 各 AC に対して検証方法（自動テスト / 手動テスト）を明記する

**受入条件一覧**:

| AC    | 条件                                                                                      | 検証方法       |
| ----- | ----------------------------------------------------------------------------------------- | -------------- |
| AC-1  | DescribeStep に「LLM で生成」と「テンプレートから作成」の選択 UI が表示される             | 自動テスト     |
| AC-2  | 「LLM で生成」選択 → ConfigureStep スキップ → GenerateStep で planSkill が呼ばれる        | 自動テスト     |
| AC-3  | GenerateStep で plan 結果（type, estimatedSteps, guidance）が正しく表示される             | 自動テスト     |
| AC-4  | GenerateStep の「実行」ボタンで executePlan が呼ばれ、成功時 CompleteStep に遷移する      | 自動テスト     |
| AC-5  | GenerateStep の「キャンセル」ボタンで plan をクリアし DescribeStep に戻る                 | 自動テスト     |
| AC-6  | generationProgress が GenerateStep に表示される（ローディング状態）                       | 自動テスト     |
| AC-7  | planSkill / executePlan のエラー時、GenerateStep にエラーメッセージが表示される           | 自動テスト     |
| AC-8  | 「テンプレートから作成」フローが既存のまま動作する（非破壊）                              | 自動テスト     |
| AC-9  | PlanResult 型は agentSlice.ts からの Single Source of Truth を使用する                    | コードレビュー |
| AC-10 | Hybrid State Pattern の対称クリアが handleCancelPlan / handleExecutePlan の両方で行われる | 自動テスト     |

3. 結果を `outputs/phase-1/acceptance-criteria.md` に記録する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`（受入条件定義書）

---

### タスク4: スコープ定義

**目的**: 本タスクの境界を明確にする

**実行手順**:

1. 以下のスコープ定義を確認し記録する

**スコープ内**:

- DescribeStep への生成モード選択 UI 追加
- SkillCreateWizard への planSkill / executePlan ハンドラ追加
- GenerateStep の plan 結果表示 UI 追加（type, estimatedSteps, guidance）
- GenerateStep の「実行」「キャンセル」ボタン追加
- generationProgress の表示
- エラーハンドリング
- 既存テストの更新・新規テスト追加

**スコープ外**:

- Preload API の変更（既存の planSkill / executePlan をそのまま使用）
- agentSlice の変更（既存の PlanResult 型・hooks をそのまま使用）
- SkillLifecyclePanel の変更
- ConfigureStep のロジック変更（LLM モード時はスキップするのみ）
- improve / feedback フロー（別タスク）

2. 結果を `outputs/phase-1/scope.md` に記録する

**期待される成果物**:

- `outputs/phase-1/scope.md`（スコープ定義書）

---

## 参照資料

| 参照資料                        | パス                                                                                 | 内容                                      |
| ------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- |
| 未タスク指示書                  | `docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md` | タスク概要・苦戦箇所                      |
| GitHub Issue #1588              | GitHub UI                                                                            | 受入基準・変更対象                        |
| SkillCreateWizard               | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                   | 現行ウィザード実装                        |
| SkillLifecyclePanel（参考実装） | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                 | TASK-SC-06 planSkill/executePlan パターン |
| Preload API                     | `apps/desktop/src/preload/skill-creator-api.ts`                                      | planSkill/executePlan シグネチャ          |
| agentSlice                      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                               | PlanResult 型・hooks 定義                 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                              | 内容                       |
| --------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| UI コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md`    | wizard コンポーネント設計  |
| 状態管理仕様          | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Zustand store 設計         |
| IPC Agent API         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | planSkill/executePlan 契約 |

---

## 成果物

| 成果物         | パス                                     | 内容                           |
| -------------- | ---------------------------------------- | ------------------------------ |
| インベントリ   | `outputs/phase-1/inventory.md`           | 現行コードの状態一覧           |
| API 契約確認   | `outputs/phase-1/api-contract.md`        | Preload API / Store hooks 契約 |
| 受入条件定義書 | `outputs/phase-1/acceptance-criteria.md` | AC-1 ~ AC-10 の詳細定義        |
| スコープ定義書 | `outputs/phase-1/scope.md`               | スコープ内外の明確化           |

---

## 統合テスト連携（Phase 1）

接続要件（API/認証/データフロー）を要件に明記:

- planSkill は `prompt: string, authMode?: AuthMode, apiKey?: string | null` を受け取る
- executePlan は `planId: string, skillSpec: string, authMode?: AuthMode, apiKey?: string | null` を受け取る
- SkillCreateWizard は `window.electronAPI.skillCreator` 経由で API にアクセスする
- 認証情報は SkillLifecyclePanel と同じパターンで取得する

---

## 完了条件

- [ ] 全4成果物（inventory.md, api-contract.md, acceptance-criteria.md, scope.md）が生成されている
- [ ] AC-1 ~ AC-10 が検証方法付きで定義されている
- [ ] スコープ内外が明確に境界付けされている
- [ ] Preload API のシグネチャが正確に記録されている
- [ ] PlanResult 型の定義元（agentSlice.ts:34）が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（本Phase が起点）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-2-design.md`
