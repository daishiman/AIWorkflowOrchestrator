# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                              |
| ------ | ----------------------------------------------- |
| Phase  | 1                                               |
| 機能名 | TASK-RT-03-skill-creation-result-panel          |
| 作成日 | 2026-04-04                                      |
| 種別   | **UIタスク**（Renderer コンポーネント新規作成） |

## 目的

`SkillCreationResultPanel` コンポーネントの受入基準・スコープ・型定義を確定する。既存コードの命名規則・状態管理パターン・型構造を調査し、設計の前提条件を固める。

## 実行タスク

- **P50チェック（必須）**: 既存コードの実装状態を調査（重複防止）
- **型定義調査**: `packages/shared/src/types/skillCreator.ts` の3型フィールド全量把握
- **既存コンポーネント調査**: `PlanResultDetailPanel` / `ExecuteResultDetailPanel` / `VerifyResultDetailPanel` / `SkillLifecyclePanel` / `result-panel-parts.tsx` の役割確認
- **命名規則調査**: 既存コンポーネントのファイル名・props型・export 命名パターンの記録
- **受入基準定義**: 機能要件（FR）・非機能要件（NFR）の定義
- **スコープ確定**: 含む/含まない境界の確定
- **タスク種別宣言**: UIタスクとして Phase 11 スクリーンショット要件を宣言

## 参照資料

| 資料名                   | パス                                                                          |
| ------------------------ | ----------------------------------------------------------------------------- |
| 型定義                   | `packages/shared/src/types/skillCreator.ts`                                   |
| 統合先コンポーネント     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`          |
| 既存詳細パネル (plan)    | `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`        |
| 既存詳細パネル (execute) | `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx`     |
| 既存詳細パネル (verify)  | `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx`      |
| 共通 UI パーツ           | `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx`           |
| verify checks 表示参考   | `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx`      |
| Jotai atoms              | `apps/desktop/src/renderer/store/`                                            |
| unassigned task 元指示書 | `docs/30-workflows/unassigned-task/TASK-RT-03-skill-creation-result-panel.md` |

## 実行手順

### ステップ 0: P50チェック（必須）

```bash
# SkillCreationResultPanel が既に存在するか確認
grep -rn "SkillCreationResultPanel" apps/desktop/src/

# 既存の詳細パネルの確認
ls apps/desktop/src/renderer/components/skill/
```

#### Props/型前提条件の確認

```bash
# 3型の存在確認
grep -n "RuntimeSkillCreatorPlanResult\|RuntimeSkillCreatorExecuteResult\|RuntimeSkillCreatorVerifyDetail" \
  packages/shared/src/types/skillCreator.ts

# SkillLifecyclePanel の既存 atom フック確認
grep -n "useCurrentPlanResult\|useWorkflowSnapshot\|useSkillExecutionStatus" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### ステップ 1: 型定義調査

`packages/shared/src/types/skillCreator.ts` を参照し、以下の型の全フィールドを記録する:

**確認対象型**:

| 型名                                     | 役割                             |
| ---------------------------------------- | -------------------------------- |
| `RuntimeSkillCreatorPlanResult`          | plan() の戻り値                  |
| `RuntimeSkillCreatorExecuteResult`       | execute() の戻り値               |
| `RuntimeSkillCreatorVerifyDetail`        | verify detail IPC の戻り値       |
| `RuntimeSkillCreatorVerifyCheck`         | verify の個別チェック項目        |
| `RuntimeSkillCreatorVerifyDetailRoute`   | verify の遷移・出所情報          |
| `RuntimeSkillCreatorVerifyCheckSeverity` | `"info" \| "warning" \| "error"` |

**型フィールド一覧**:

| 型名                                   | 主要フィールド                                                                                                                                                                                                                                                                            | 補足                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `RuntimeSkillCreatorPlanResult`        | `planId`, `skillSpec`, `estimatedSteps`, `skillName`, `description`, `agents`, `scripts`, `triggers`, `anchors`, `adapterStatus?`                                                                                                                                                         | plan detail の canonical source（`adapterStatus?` は現行 UI では非表示） |
| `RuntimeSkillCreatorExecuteResult`     | `executeId`, `skillName`, `success`, `error?`, `sessionId?`, `resultSubtype?`, `stopReason?`, `permissionDenials?`, `sdkEvents?`, `sourceProvenance?`, `persistResult?`, `persistError?`                                                                                                  | execute detail の canonical source                                       |
| `RuntimeSkillCreatorVerifyDetail`      | `planId`, `currentPhase`, `status`, `message?`, `nextAction?`, `checks`, `evidenceCount`, `resolvedSkillCreatorRoot?`, `manifestPath?`, `resourceDescriptorHash?`, `manifestCacheKey?`, `route`, `reverifyEligible`, `disabledReason?`, `delegatedGovernanceNote`, `delegatedSessionNote` | verify detail の canonical source                                        |
| `RuntimeSkillCreatorVerifyCheck`       | `id`, `layer`, `severity`, `summary`, `evidenceSummary?`                                                                                                                                                                                                                                  | layer グループの最小単位                                                 |
| `RuntimeSkillCreatorVerifyDetailRoute` | `type`, `permissionMode?`, `launcher?`, `summary`                                                                                                                                                                                                                                         | integrated_api / terminal_handoff の判定と説明                           |

### ステップ 2: 既存コンポーネント調査

以下を確認して重複・再利用可能な要素を記録する:

- `PlanResultDetailPanel.tsx`: plan 結果の何を表示しているか
- `ExecuteResultDetailPanel.tsx`: execute 結果の何を表示しているか
- `VerifyResultDetailPanel.tsx`: verify 結果の canonical renderer と再利用ポイント
- `result-panel-parts.tsx`: 共通 UI パーツと重複削減の余地
- `VerifyResultDetailPanel.tsx`: verify checks の canonical renderer と表示パターン
- `SkillLifecyclePanel.tsx`: 既存の Jotai atom フックと状態管理の構造

### ステップ 3: 命名規則調査

既存コンポーネントの命名パターンを記録する（Phase 4 TDD Red 前に確認用）:

```bash
# コンポーネントファイルの命名パターン確認
ls apps/desktop/src/renderer/components/skill/

# props 型の命名規則確認
grep -n "export interface.*Props" apps/desktop/src/renderer/components/skill/*.tsx
```

**記録項目**:

- ファイル名: PascalCase（例: `SkillCreationResultPanel.tsx`）✅ 確認
- props 型: `${ComponentName}Props`（例: `SkillCreationResultPanelProps`）✅ 確認
- テストファイル: `${ComponentName}.test.tsx`（例: `SkillCreationResultPanel.test.tsx`）✅ 確認

### ステップ 4: 受入基準の定義

**機能要件（FR）**:

| ID    | 要件                                                                                                                                                                                                                                                                      | 優先度 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | plan フェーズ完了時: `PlanResultDetailPanel` を通して skillName・description・estimatedSteps・agents・scripts・triggers・anchors・skillSpec を表示                                                                                                                        | 必須   |
| FR-02 | execute フェーズ完了時: `ExecuteResultDetailPanel` を通して success フラグ・persistResult.skillPath・persistResult.files・error・sessionId・resultSubtype・stopReason・persistError・permissionDenials・sdkEvents・sourceProvenance を表示                                | 必須   |
| FR-03 | verify フェーズ完了時: `VerifyResultDetailPanel` を通して checks[] を layer（layer1〜4）でグループ化し、severity・evidenceSummary・message・nextAction・evidenceCount・route 情報・reverifyEligible・disabledReason・delegatedGovernanceNote・delegatedSessionNote を表示 | 必須   |
| FR-04 | 各チェックの severity（info/warning/error）をバッジで視覚的に区別する                                                                                                                                                                                                     | 必須   |
| FR-05 | 全体ステータスバッジ（進行中/Plan完了/実行失敗/検証失敗/完了/検証中）を表示                                                                                                                                                                                               | 必須   |
| FR-06 | 全 props が null の場合にもエラーなくレンダリングされる（初期状態対応）                                                                                                                                                                                                   | 必須   |
| FR-07 | `SkillLifecyclePanel` に統合し、plan/execute/verify のいずれかが揃った時点で表示する（reverify action は親側維持）                                                                                                                                                        | 必須   |
| FR-08 | 既存 `PlanResultDetailPanel` / `ExecuteResultDetailPanel` / `VerifyResultDetailPanel` との重複を整理する                                                                                                                                                                  | 必須   |

**非機能要件（NFR）**:

| ID     | 要件                                                                                                 | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------- | ------ |
| NFR-01 | TypeScript 型エラー 0件（`pnpm --filter @repo/desktop typecheck` PASS）                              | 必須   |
| NFR-02 | ESLint エラー 0件（`pnpm --filter @repo/desktop lint` PASS）                                         | 必須   |
| NFR-03 | ユニットテスト全ケース PASS、Line Coverage 80%+                                                      | 必須   |
| NFR-04 | 新規 Jotai atom の追加は最小限（既存 `useCurrentPlanResult` / `useWorkflowSnapshot` を最大限再利用） | 推奨   |
| NFR-05 | `SkillCreationResultPanel` は独立コンポーネントとして設計（再利用可能）                              | 推奨   |

### ステップ 5: スコープ確定

**含むもの**:

- `SkillCreationResultPanel.tsx` の新規作成
- `SkillCreationResultPanel.test.tsx` の新規作成
- `SkillLifecyclePanel.tsx` への統合（表示タイミング・データ受け渡し）
- `ExecuteResultDetailPanel.tsx` の詳細表示拡張（persistResult.skillPath / files / persistError）
- 既存 `PlanResultDetailPanel` / `ExecuteResultDetailPanel` / `VerifyResultDetailPanel` / `result-panel-parts.tsx` との重複整理

**含まないもの**:

- スキルファイルの書き出し処理（`SkillFileWriter.persist()` の呼び出し）— TASK-P0-05 の責務
- verify engine の実装・変更 — TASK-P0-01 の責務
- APIキー管理UI — TASK-RT-04 の責務
- `improve()` フェーズの UI 変更 — 別タスクの責務
- Storybook story の作成（推奨するが必須ではない）

### ステップ 6: タスク種別宣言

**判定結果: UIタスク**

本タスクは Renderer コンポーネント（`SkillCreationResultPanel.tsx`）の新規作成を含むため **UIタスク** として分類する。

Phase 11 での対応方針:

- スクリーンショット要件: **SCREENSHOT必須**（UIコンポーネント追加のため）
- Playwright + Vite dev server パターンを使用
- `screenshot-plan.json` の作成が必須

## 統合テスト連携【必須】

| 判定項目                         | 基準 | 結果 |
| -------------------------------- | ---- | ---- |
| ユニットテスト Line Coverage     | 80%+ | TBD  |
| ユニットテスト Branch Coverage   | 60%+ | TBD  |
| ユニットテスト Function Coverage | 80%+ | TBD  |
| 結合テスト（コンポーネント統合） | 100% | TBD  |

## 多角的チェック観点

| 観点     | チェック内容                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------- |
| システム | Jotai atom の状態所有権が SkillLifecyclePanel に留まり、SkillCreationResultPanel はProps受け取りのみ |
| 依存関係 | TASK-RT-02/RT-06 未完了時でも Phase 1-2 は先行実行可能                                               |
| 価値     | verify 結果の可視化でユーザーが `improve()` 移行判断を自己判断できるようになる                       |
| 責務境界 | SkillCreationResultPanel は wrapper、詳細表示は既存 detail panel に委譲する                          |

## 成果物

| 成果物         | パス                                    | 説明                        |
| -------------- | --------------------------------------- | --------------------------- |
| 要件定義書     | `outputs/phase-1/requirements.md`       | FR/NFR・受入基準・スコープ  |
| 型調査レポート | `outputs/phase-1/type-investigation.md` | 3型フィールド一覧・命名規則 |

## 完了条件

- [ ] 既存コードの P50チェックが完了している（重複なし確認）
- [ ] `RuntimeSkillCreatorPlanResult` / `ExecuteResult` / `VerifyDetail` の全フィールドが把握されている
- [ ] FR-01〜FR-08 / NFR-01〜NFR-05 が定義されている
- [ ] スコープ（含む/含まない）が確定している
- [ ] タスク種別が **UIタスク** として宣言されている
- [ ] 命名規則（ファイル名・props型名・テストファイル名）が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
