# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

plan/execute 結果表示パネルの表示対象データ、コンポーネント分割、エラー状態連携、SkillLifecyclePanel 統合方式を要件として固定する。

## 実行タスク

- `RuntimeSkillCreatorPlanResult` から表示対象フィールドを抽出する
- `RuntimeSkillCreatorExecuteResult` から表示対象フィールドを抽出する
- エラー状態表示の要件を定義する（TASK-RT-02 連携）
- SkillLifecyclePanel への統合ポイントを特定する
- AC-1〜AC-6 への写像を確認する

## 参照資料

| 資料名              | パス                                                                      | 説明                          |
| ------------------- | ------------------------------------------------------------------------- | ----------------------------- |
| 要件草案            | `../requirements-draft.md`                                                | RT lane 要件                  |
| 親 workflow pack    | `../root-workflow-pack/index.md`                                          | lane 共通不変条件             |
| 型定義              | `packages/shared/src/types/skillCreator.ts`                               | PlanResult / ExecuteResult 型 |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | 統合先コンポーネント          |
| ImprovementPanel    | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | UI スタイル参考               |

### 現行コードアンカー

| ファイル                                                                  | 観察点                                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                               | `RuntimeSkillCreatorPlanResult` に agents[], scripts[], triggers[], anchors[] を含む |
| `packages/shared/src/types/skillCreator.ts`                               | `RuntimeSkillCreatorExecuteResult` に executeId, skillName, success, error? を含む   |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | line 1171-1174 で skillName のみカード表示。詳細表示なし                             |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | planSkill() / executePlan() 呼び出し後に結果詳細をレンダリングしていない             |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | パネル UI パターンの参考（Tailwind CSS class、レイアウト構造）                       |

## 実行手順

### ステップ1: PlanResult の表示対象フィールドを定義する

`RuntimeSkillCreatorPlanResult` から以下のフィールドを表示対象として定義する:

| フィールド     | 型                                         | 表示方式             | 必須/任意 |
| -------------- | ------------------------------------------ | -------------------- | --------- |
| skillName      | `string`                                   | ヘッダーに表示       | 必須      |
| description    | `string`                                   | サブヘッダーに表示   | 必須      |
| estimatedSteps | `number`                                   | バッジ表示           | 必須      |
| agents         | `Array<{ name: string; role: string }>`    | リスト表示           | 必須      |
| scripts        | `Array<{ name: string; purpose: string }>` | リスト表示           | 必須      |
| triggers       | `string[]`                                 | タグ表示             | 必須      |
| anchors        | `string[]`                                 | タグ表示             | 必須      |
| planId         | `string`                                   | フッターに小さく表示 | 任意      |
| skillSpec      | `string`                                   | 折りたたみ表示       | 任意      |

### ステップ2: ExecuteResult の表示対象フィールドを定義する

`RuntimeSkillCreatorExecuteResult` から以下のフィールドを表示対象として定義する:

| フィールド | 型        | 表示方式                           | 必須/任意 |
| ---------- | --------- | ---------------------------------- | --------- |
| skillName  | `string`  | ヘッダーに表示                     | 必須      |
| success    | `boolean` | 成功/失敗バッジ（緑/赤）           | 必須      |
| error      | `string?` | エラーメッセージ（失敗時のみ表示） | 条件付き  |
| executeId  | `string`  | フッターに小さく表示               | 任意      |

### ステップ3: エラー状態表示の要件を定義する

- plan 失敗時: `RuntimeSkillCreatorPlanResult` が返されない場合にエラーパネルを表示
- execute 失敗時: `success: false` かつ `error` フィールドが存在する場合にエラー詳細を表示
- TASK-RT-02 の error types（stub response error notification）との連携方式を定義
- エラー状態では「再試行」ボタンの表示を検討

### ステップ4: SkillLifecyclePanel 統合ポイントを特定する

- plan 完了後（review phase 前）: PlanResultDetailPanel を表示
- execute 完了後（verify phase 前）: ExecuteResultDetailPanel を表示
- ワークフロー state (`currentPhase`) に応じてパネルを切り替える
- `awaitingUserInput` 状態との連携（plan_review 時に PlanResultDetailPanel を表示）

## 統合テスト連携

- Phase 4 で表示対象フィールドを test case へ変換する
- Phase 7 で全フィールドの表示 coverage を確認する
- Phase 9 で型安全性と既存コンポーネントとの互換性を監査する

## 成果物

| 成果物              | パス                                     | 説明                                   |
| ------------------- | ---------------------------------------- | -------------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | 表示対象フィールドと統合ポイントの固定 |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | 型定義 → 表示フィールドの対応表        |

## 完了条件

- [ ] PlanResult の表示対象フィールドが列挙されている
- [ ] ExecuteResult の表示対象フィールドが列挙されている
- [ ] エラー状態表示の要件が TASK-RT-02 連携として定義されている
- [ ] SkillLifecyclePanel 統合ポイントが特定されている
- [ ] AC-1〜AC-6 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
