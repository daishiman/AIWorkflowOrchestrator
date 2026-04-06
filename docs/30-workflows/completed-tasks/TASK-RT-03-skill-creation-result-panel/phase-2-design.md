# Phase 2: 設計

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 2                                      |
| 機能名 | TASK-RT-03-skill-creation-result-panel |
| 作成日 | 2026-04-04                             |

## 目的

`SkillCreationResultPanel` コンポーネントの UI 設計・props 型設計・`SkillLifecyclePanel` との統合設計を確定する。concern ごとの責務境界と状態管理の方針を明示する。

## 実行タスク

- **コンポーネント分割設計**: 既存 detail panel を再利用する orchestration 構造
- **props 型定義**: `SkillCreationResultPanelProps` の型設計
- **UIレイアウト設計**: Stack + existing disclosure パターンの採用判断
- **部分成功ロジック設計**: 全体ステータスバッジの判定テーブル
- **統合設計**: `SkillLifecyclePanel` へのデータ受け渡し・表示タイミング
- **既存パネル重複整理**: `PlanResultDetailPanel` / `ExecuteResultDetailPanel` / `VerifyResultDetailPanel` との統合方針

## 参照資料

| 資料名                    | パス                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| Phase 1 成果物            | `outputs/phase-1/requirements.md`                                         |
| Phase 1 型調査            | `outputs/phase-1/type-investigation.md`                                   |
| 統合先コンポーネント      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      |
| 既存詳細パネル            | `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`    |
|                           | `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx` |
|                           | `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx`  |
| 共通 UI パーツ            | `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx`       |
| verify canonical renderer | `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx`  |
| Jotai atoms               | `apps/desktop/src/renderer/store/`                                        |

## 実行手順

### ステップ 1: コンポーネント分割設計

`SkillCreationResultPanel` は新しい detail renderer を増やさず、既存の detail panel を束ねる orchestration wrapper とする。

**コンポーネント構造（concern × topology）**:

```
SkillCreationResultPanel          ← コンテナ（props の null チェックで各セクションを制御）
├── OverallStatusBadge            ← 全体ステータスバッジ（インライン or 内部コンポーネント）
├── PlanResultDetailPanel         ← plan detail の canonical renderer
├── ExecuteResultDetailPanel      ← execute detail の canonical renderer
└── VerifyResultDetailPanel       ← verify detail の canonical renderer
```

**方針**: wrapper は表示順序・空状態・全体ステータスのみを責務とし、詳細描画は既存コンポーネントへ委譲する。
再検証操作は `SkillLifecyclePanel` に残し、wrapper は表示専用で `VerifyResultDetailPanel` を利用する。
空状態では `結果がまだありません` を表示し、ユーザーが結果未到着を即座に判別できるようにする。

### ステップ 2: props 型設計

```typescript
export interface SkillCreationResultPanelProps {
  /** plan フェーズの結果。plan未完了時は null */
  planResult: RuntimeSkillCreatorPlanResult | null;
  /** execute フェーズの結果。execute未完了時は null */
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  /** verify フェーズの詳細結果。verify未完了時は null */
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null;
  /** パネルを閉じるコールバック（オプション） */
  onClose?: () => void;
}
```

**設計方針**:

- 新規 Jotai atom を追加しない。`SkillCreationResultPanel` は純粋な表示コンポーネントとして設計
- データ取得は `SkillLifecyclePanel` が担当し、props として受け渡す
- `onClose` は将来の折りたたみ機能に備えて optional で用意
- detail の見た目・文言は既存 panel の canonical 仕様を使い、wrapper 側で再実装しない

### ステップ 3: UIレイアウト設計

**採用パターン**: Stack + existing disclosure（wrapper は積み重ね、詳細な開閉は既存 panel に委譲）

```
SkillCreationResultPanel
┌─────────────────────────────────────────┐
│ 🎯 スキル生成結果  [全体ステータスバッジ] │ ← ヘッダー
├─────────────────────────────────────────┤
│ PlanResultDetailPanel                    │
├─────────────────────────────────────────┤
│ ExecuteResultDetailPanel                 │
├─────────────────────────────────────────┤
│ VerifyResultDetailPanel                  │
└─────────────────────────────────────────┘
```

### ステップ 4: 部分成功ロジック設計

全体ステータスバッジの判定テーブル（Phase 4 テストケースと1:1対応）:

| planResult | executeResult | verifyDetail.status | 全体ステータス | バッジ色 |
| ---------- | ------------- | ------------------- | -------------- | -------- |
| null       | -             | -                   | 進行中         | gray     |
| あり       | null          | -                   | Plan完了       | blue     |
| あり       | success=false | -                   | 実行失敗       | red      |
| あり       | success=true  | null / "pending"    | 検証中         | yellow   |
| あり       | success=true  | "fail"              | 検証失敗       | orange   |
| あり       | success=true  | "pass"              | 完了           | green    |

### ステップ 5: SkillLifecyclePanel 統合設計

**表示タイミング**:

- `planResult` が取得できた場合
- execute が完了し `executeResult` が取得できた場合
- verify 詳細が取得できた場合

**データの受け渡し設計**:

```typescript
// SkillLifecyclePanel 内での使用
const currentPlanResult = useCurrentPlanResult();        // RuntimeSkillCreatorPlanResult | null
const workflowSnapshot = useWorkflowSnapshot();          // SkillCreatorWorkflowUiSnapshot | null
const executeResult = workflowSnapshot
  ? extractExecuteResultFromWorkflowSnapshot(workflowSnapshot)
  : null;
// verifyDetail は既存の getVerifyDetail IPC を呼び出して取得（または useGetVerifyDetail フック）

<SkillCreationResultPanel
  planResult={currentPlanResult}
  executeResult={executeResult}
  verifyDetail={verifyDetail}
/>
```

**配置方針**: `SkillLifecyclePanel` の結果表示エリアに配置し、既存の詳細パネルは wrapper から呼び出す。`SkillLifecyclePanel` の inline 詳細レンダリングは wrapper 採用後に削減し、再検証ボタンは親側のアクションとして維持する。

### ステップ 6: 既存パネル重複整理

Phase 1 調査結果に基づき以下いずれかを選択:

| 方針                                                      | 採用条件                                                                                          | 影響           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------- |
| A. 既存パネルを SkillCreationResultPanel 内部から呼び出す | PlanResultDetailPanel/ExecuteResultDetailPanel/VerifyResultDetailPanel が独立して使われている場合 | 後方互換性維持 |
| B. 既存パネルを SkillCreationResultPanel で置き換える     | 既存パネルが SkillLifecyclePanel からのみ呼ばれている場合                                         | コード削減     |

**Phase 2 時点の判断**: A（既存パネルを `SkillCreationResultPanel` 内部から呼び出す）を採用する。B は却下する。

## 統合テスト連携【必須】

| 判定項目                             | 基準 | 結果 |
| ------------------------------------ | ---- | ---- |
| props 型が Phase 1 の型調査と整合    | ✅   | TBD  |
| 状態管理方針（Jotai atom 追加不要）  | ✅   | TBD  |
| 既存パネル重複整理方針が確定している | ✅   | TBD  |

## 多角的チェック観点

| 観点       | チェック内容                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------- |
| 責務境界   | SkillCreationResultPanel は純粋な表示コンポーネント、データ取得は SkillLifecyclePanel         |
| 状態所有権 | 新規 atom は原則追加しない。verifyDetail も `SkillLifecyclePanel` 側の local state を維持する |
| 整合性     | 部分成功判定テーブルの各行が Phase 4 テストケースと1:1対応している                            |
| 実現性     | RT-02/RT-06 未完了でも Phase 1-2 は先行実施可能                                               |

## 成果物

| 成果物               | パス                                    | 説明                           |
| -------------------- | --------------------------------------- | ------------------------------ |
| コンポーネント設計書 | `outputs/phase-2/component-design.md`   | 分割方針・props型・レイアウト  |
| 統合設計書           | `outputs/phase-2/integration-design.md` | SkillLifecyclePanel 統合方針   |
| 部分成功判定テーブル | `outputs/phase-2/status-matrix.md`      | 全体ステータスバッジ判定ルール |

## 完了条件

- [ ] コンポーネント分割設計（concern × topology）が定義されている
- [ ] `SkillCreationResultPanelProps` 型が設計されている
- [ ] UIレイアウト（Stack + existing disclosure パターン）が確定している
- [ ] 部分成功判定テーブルが定義されている（6パターン）
- [ ] `SkillLifecyclePanel` との統合設計（表示タイミング・データ受け渡し）が確定している
- [ ] 既存パネル重複整理方針（A または B）が決定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
