---
task_id: TASK-RALLY-006
task_name: L675-708 useEffect依存配列修正
task_type: NON_VISUAL
category: improvement
status: not_started
current_phase: 1
created_date: 2026-04-21
---

# TASK-RALLY-006: L675-708 useEffect依存配列修正

## メタ情報

| 項目                | 値                                                      |
| ------------------- | ------------------------------------------------------- |
| タスクID            | TASK-RALLY-006                                          |
| 機能名              | スキルクリエイター ラリー機能 useEffect依存配列循環排除 |
| 作成日              | 2026-04-21                                              |
| 実行形態            | seq                                                     |
| 依存タスク          | TASK-RALLY-005完了後                                    |
| 衝突ドメイン        | SkillLifecyclePanelドメイン                             |
| implementation_mode | new                                                     |

## 目的

`SkillLifecyclePanel.tsx` の L675-708 にある `useEffect` の依存配列に `workflowSnapshot?.planId` が含まれている。このエフェクトは IPC pull（getWorkflowState）を呼び出し、その結果として `applyWorkflowSnapshot` で `workflowSnapshot` を更新する。結果として「workflowSnapshot が更新される → エフェクトが再実行される → workflowSnapshot が再更新される」という循環リスクが存在する。

RALLY-005 で workflowSnapshot の更新経路（invoke 正規・push 補完）が確立された後、依存配列から `workflowSnapshot?.planId` を除去し、`activePlanResult?.planId` または `storePlanId` のみをトリガーとすることで IPC pull の再実行ループリスクを排除する。

## スコープ

### 含む

- `SkillLifecyclePanel.tsx` L675-708 の useEffect 依存配列から `workflowSnapshot?.planId` を除去する
- planId の値を useRef に抽出し、エフェクト内では ref 経由で参照する設計への変更
- `react-hooks/exhaustive-deps` ESLint ルールへの準拠確認

### 含まない

- L675-708 以外の useEffect の変更
- workflowSnapshot の更新権限設計（RALLY-005 のスコープ）
- processWorkflowOutcome の await 統一（RALLY-008 のスコープ）
- commit / push / PR 実行

## Phase 1: 要件定義

### 受け入れ基準

- AC-1: L675-708 の useEffect 依存配列から `workflowSnapshot?.planId` が除去されていること
- AC-2: エフェクトのトリガーが `activePlanResult?.planId` または `storePlanId` の変化のみとなること
- AC-3: `react-hooks/exhaustive-deps` ESLint ルールが警告を出さないこと
- AC-4: planId の値がエフェクト内で正しく参照されていること（ref または直接参照）
- AC-5: `pnpm typecheck` がエラーなしで通過すること
- AC-6: `pnpm lint` がエラーなしで通過すること

### P50チェック

対象ファイルの現状実装を確認する：

```bash
# L675-708 の useEffect 全体を確認
sed -n '670,715p' \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 依存配列の全項目確認
grep -n "workflowSnapshot\|storePlanId\|activePlanResult" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30

# ESLint 現状確認
pnpm lint apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx 2>&1 | grep -A2 "exhaustive-deps"
```

## Phase 2: 設計

### 変更箇所

#### 現状（L675-708 付近）

```typescript
useEffect(() => {
  const planId =
    storePlanId ?? activePlanResult?.planId ?? workflowSnapshot?.planId;
  const skillCreatorApi = getSkillCreatorApi();
  if (!planId || !skillCreatorApi?.getWorkflowState) {
    return;
  }
  void skillCreatorApi
    .getWorkflowState(planId)
    .then((result) => {
      // ... applyWorkflowSnapshot(result.data) 等
    })
    .catch(...);
}, [
  activePlanResult?.planId,
  setHandoffGuidance,
  setWorkflowError,
  setWorkflowSnapshot,
  storePlanId,
  workflowSnapshot?.planId,  // ← 循環リスクの原因
]);
```

#### 変更後

```typescript
// workflowSnapshot?.planId を useRef に退避し、依存配列から除外する
const workflowSnapshotPlanIdRef = useRef(workflowSnapshot?.planId);
useEffect(() => {
  workflowSnapshotPlanIdRef.current = workflowSnapshot?.planId;
}, [workflowSnapshot?.planId]);

useEffect(() => {
  // フォールバックは ref 経由で参照（依存配列に不要）
  const planId =
    storePlanId ?? activePlanResult?.planId ?? workflowSnapshotPlanIdRef.current;
  const skillCreatorApi = getSkillCreatorApi();
  if (!planId || !skillCreatorApi?.getWorkflowState) {
    return;
  }
  void skillCreatorApi
    .getWorkflowState(planId)
    .then((result) => {
      // ... applyWorkflowSnapshot(result.data) 等
    })
    .catch(...);
}, [
  activePlanResult?.planId,
  setHandoffGuidance,
  setWorkflowError,
  setWorkflowSnapshot,
  storePlanId,
  // workflowSnapshot?.planId は除外済み → 循環なし
]);
```

**設計判断の根拠**：

- エフェクトの本来の目的は「planId が確定したタイミングで一度だけ getWorkflowState を呼ぶ」こと
- `workflowSnapshot?.planId` はフォールバックとして使われているが、`storePlanId` または `activePlanResult?.planId` が存在する場合は使われない
- RALLY-005 で invoke が正規ソースと確立されたため、フォールバックの `workflowSnapshot?.planId` への依存をトリガーにする必要性は低い
- ref 経由で参照することで「値は最新を使いつつ、依存配列のトリガーとはならない」を実現する

### 注意事項

実装前に L675-708 のエフェクト本体が「planId 変更時に必ず実行すべき処理」を含むかを精査する。planId 変更時の初期化処理が必要な場合は、planId 専用の useEffect を別途追加し、循環を起こす処理のみ ref 化する。

### 検証方法

1. `pnpm lint` で `exhaustive-deps` 警告が出ないことを確認
2. 単体テストでエフェクトが `storePlanId` 変化時にのみ再実行されることを確認
3. `workflowSnapshot` 更新後にエフェクトが再実行されないことを確認
4. `pnpm typecheck` でエラーなしを確認

## Phase 3: 実装計画

1. `SkillLifecyclePanel.tsx` の L675-708 を読み、エフェクト本体の完全な内容を把握する
2. `workflowSnapshotPlanIdRef` を追加し、`workflowSnapshot?.planId` の変化を追跡する useEffect を追加する
3. 既存の useEffect 依存配列から `workflowSnapshot?.planId` を除去する
4. エフェクト内のフォールバック参照を `workflowSnapshotPlanIdRef.current` に変更する
5. `pnpm lint` を実行して `exhaustive-deps` 警告がないことを確認する
6. 単体テストを作成または更新する
7. `pnpm typecheck` と `pnpm lint` を実行して品質を確認する

## Phase 4: テスト設計

### 単体テスト（Vitest）

テスト対象: `SkillLifecyclePanel.tsx` L675-708 付近の useEffect の実行タイミング

| テストケース | 内容                                                                                 | 期待結果                                                |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| TC-1         | `storePlanId` が変化する                                                             | エフェクトが再実行される（getWorkflowState が呼ばれる） |
| TC-2         | `activePlanResult?.planId` が変化する                                                | エフェクトが再実行される（getWorkflowState が呼ばれる） |
| TC-3         | `workflowSnapshot?.planId` のみが変化する                                            | エフェクトが再実行されない（循環なし）                  |
| TC-4         | storePlanId/activePlanResult がどちらも null で workflowSnapshotPlanIdRef に値がある | ref の値で getWorkflowState が呼ばれる                  |
| TC-5         | planId が null の場合                                                                | getWorkflowState が呼ばれない                           |

## Phase 5: 実装

Phase 3 の手順に従い実装する。

実装時の注意点：

- `workflowSnapshotPlanIdRef` の更新用 useEffect は `workflowSnapshot?.planId` のみを依存配列に持つ
- メインの useEffect（L675-708 相当）の依存配列には `workflowSnapshotPlanIdRef` 自体を含めない（ref は依存配列に含める必要がないため）
- エラーハンドリング（setWorkflowError）の呼び出しパターンは変更しない

## Phase 12: ドキュメント

### 変更内容のドキュメント化

- 変更した useEffect のインラインコメントに「workflowSnapshot?.planId を除外した理由（循環防止）」を追記する
- ref 経由参照パターンの説明コメントを追加する

中学生レベルの概念説明：

`useEffect` は「ある値が変化したときに自動で実行される処理」です。依存配列（`[]` の中に書く値）が変化するたびに処理が動きます。もし「処理が動いた結果、依存配列の値が変化する」という状況になると、「処理→値の変化→処理→値の変化→...」と無限ループになります。これを「循環（circular dependency）」と呼びます。`useRef` を使うと「値を読むことはできるが、useEffect のトリガーにはならない」という形で値を参照できます。本タスクではこの仕組みを使って無限ループのリスクを除去します。

## Phase 13: 完了確認

### 完了条件

- [ ] `SkillLifecyclePanel.tsx` L675-708 付近の useEffect 依存配列から `workflowSnapshot?.planId` が除去されている
- [ ] `workflowSnapshotPlanIdRef`（または同等の ref）が実装されている
- [ ] エフェクト内のフォールバック参照が ref 経由になっている
- [ ] 単体テスト TC-1〜TC-5 がすべて PASS している
- [ ] `pnpm lint` の `exhaustive-deps` 警告がゼロである
- [ ] `pnpm typecheck` がエラーなしで通過している

### タスク100%実行確認【必須】

- [ ] Phase 1〜12 完了
- [ ] 受け入れ基準 AC-1〜AC-6 全PASS
- [ ] RALLY-005 が完了していることを確認してから本タスクに着手していること
- [ ] RALLY-008 の実行前提（循環排除済みの依存配列）が整っている
