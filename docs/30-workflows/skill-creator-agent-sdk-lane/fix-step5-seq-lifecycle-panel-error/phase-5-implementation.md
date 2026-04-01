# Phase 5: 実装

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 5                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

`SkillLifecyclePanel.tsx:539` 付近の `setWorkflowError(null)` を `if` ブロックで囲み、Phase 4 で作成したテストを Green 化する。

## 実行タスク

1. `SkillLifecyclePanel.tsx` を修正する（1 箇所）
2. Phase 4 テストが Green になることを確認する
3. 既存テストへの影響がないことを確認する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 実行手順

### ステップ 1: 修正対象箇所の確認

```bash
# 修正対象の行を確認する
grep -n "setWorkflowError(null)" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 対象行の前後を確認する（531〜544 行付近）
sed -n '531,544p' \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### ステップ 2: 修正内容

**修正ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**修正箇所**: `onWorkflowStateChanged` コールバック内（539 行付近）

**変更前**:

```typescript
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  setWorkflowSnapshot(snapshot);
  setWorkflowError(null); // ← BUG: 'failed' フェーズでもエラーを消去する
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});
```

**変更後**:

```typescript
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  setWorkflowSnapshot(snapshot);
  if (snapshot.phase !== "failed") {
    setWorkflowError(null); // 'failed' 以外のフェーズでのみエラーをクリア
  }
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});
```

**変更サマリー**:

- 変更量: `setWorkflowError(null);` の 1 行を、`if (snapshot.phase !== 'failed') { ... }` ブロックで囲む（実質 2 行追加・0 行削除）
- `handoffBundle` 処理の位置は変更しない
- `useEffect` の依存配列は変更しない

### ステップ 3: テストの Green 化確認

```bash
# Phase 4 テストが Green になることを確認する
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx
```

期待される結果:

- TC-EP-01: PASS（`phase: 'failed'` 時に `setWorkflowError(null)` が呼ばれない）
- TC-EP-02: PASS（`phase: 'running'` 時に `setWorkflowError(null)` が呼ばれる）
- TC-EP-03: PASS（`phase: 'completed'` 時に `setWorkflowError(null)` が呼ばれる）
- TC-EP-04: PASS（`phase: 'failed'` でも `handoffBundle` 処理が実行される）
- TC-EP-05: PASS（`handoffBundle: null` 時に `setHandoffGuidance` が呼ばれない）

### ステップ 4: 既存テストへの影響確認

```bash
# SkillLifecyclePanel の既存テストを全て実行する
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/

# desktop パッケージ全体のテストを実行する
pnpm --filter @repo/desktop exec vitest run
```

全テストが PASS することを確認する。

## 多角的チェック観点

- `if (snapshot.phase !== 'failed')` の括弧の位置が正しく、`handoffBundle` 処理が `if` ブロックの外にあることを確認したか
- `snapshot.phase` が `undefined` の場合に `!== 'failed'` が `true` と評価されるため、`setWorkflowError(null)` が呼ばれる（エラーがクリアされる）挙動を確認したか
- TypeScript のコンパイルエラーが発生しないことを確認したか（`snapshot.phase` の型が `'failed'` との比較に対応しているか）

## 成果物

| 成果物                         | パス                                                                 | 説明                       |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------- |
| `SkillLifecyclePanel.tsx` 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | バグ修正済みコンポーネント |

## 完了条件

- [ ] `SkillLifecyclePanel.tsx:539` 付近の `setWorkflowError(null)` が `if (snapshot.phase !== 'failed')` ブロックで囲まれている
- [ ] Phase 4 テストファイル（`error-persistence.test.tsx`）の全 TC が Green になっている
- [ ] `handoffBundle` 処理が `if` ブロックの外（`phase` 判定の影響を受けない位置）にある
- [ ] `useEffect` の依存配列が変更されていない
- [ ] TypeScript コンパイルエラーが発生していない

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`SkillLifecyclePanel.tsx` の修正が完了）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 6: テスト拡充 へ進む
