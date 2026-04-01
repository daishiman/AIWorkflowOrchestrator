# Phase 2: 設計

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 2                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

1 つの concern（`phase` 判定追加）の変更設計を定義し、変更前後コードを比較する。`snapshot.phase` の型を確認して `'failed'` との比較が型安全に行われることを保証する。

## 実行タスク

1. concern 設計（1 concern: phase 判定追加）
2. `snapshot.phase` の型確認（`WorkflowPhase` 型の定義場所）
3. 変更前後コード比較
4. `handoffBundle` 処理への影響がないことの確認
5. React hooks deps に変更がないことの確認

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 実行手順

### ステップ 1: concern 設計（1 concern: phase 判定追加）

本タスクの concern は 1 つのみ:

#### Concern 1: `onWorkflowStateChanged` コールバック内の `phase` 判定

**問題の所在**:

```
SkillLifecyclePanel.tsx:539
setWorkflowError(null);  ← 'failed' フェーズでもエラーを消去する
```

**現状（問題あり）**:

```typescript
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  setWorkflowSnapshot(snapshot);
  setWorkflowError(null); // ← BUG: 'failed' フェーズでもエラーを消去する
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});
```

**修正後（正しい動作）**:

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

**変更量**: 1 行を `if` ブロックで囲む（3 行の差分、実質 2 行追加・0 行削除）

### ステップ 2: `snapshot.phase` の型確認

```bash
# WorkflowPhase 型の定義場所を確認
grep -rn "WorkflowPhase" packages/shared/src/ --include="*.ts"
grep -rn "WorkflowPhase" apps/desktop/src/ --include="*.ts" --include="*.tsx"

# WorkflowPhaseSnapshot の型定義を確認
grep -rn "WorkflowPhaseSnapshot" packages/shared/src/ --include="*.ts"
grep -rn "WorkflowPhaseSnapshot" apps/desktop/src/ --include="*.ts" --include="*.tsx"

# 'failed' が型定義に含まれているか確認
grep -A 10 "WorkflowPhase" packages/shared/src/types/skill-workflow.ts 2>/dev/null || \
grep -rn "'failed'" packages/shared/src/ --include="*.ts"
```

型確認ポイント:

- `snapshot.phase` が `WorkflowPhase` 型（リテラルユニオン）であれば、`!== 'failed'` が型安全に機能する
- `snapshot.phase` が `string` 型であれば、`'failed'` リテラルとの比較も型安全（`string !== string` の比較）
- いずれの場合も新規型定義は不要（既存型を再利用する）

### ステップ 3: 変更前後のコード比較

| 項目                              | 変更前                                                        | 変更後                                            |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| `setWorkflowSnapshot` 呼び出し    | 無条件で呼ばれる                                              | 変更なし（無条件で呼ばれる）                      |
| `setWorkflowError(null)` 呼び出し | 無条件で呼ばれる（バグ）                                      | `phase !== 'failed'` の場合のみ呼ばれる（修正後） |
| `handoffBundle` 処理              | `snapshot.handoffBundle` が truthy の場合に実行               | 変更なし（`phase` に関わらず実行）                |
| React hooks deps                  | `[setHandoffGuidance, setWorkflowError, setWorkflowSnapshot]` | 変更なし（同一）                                  |

### ステップ 4: `handoffBundle` 処理への影響確認

修正後のコードでは、`snapshot.phase` の判定は `setWorkflowError(null)` にのみ適用され、`handoffBundle` の処理は影響を受けない。

```typescript
if (snapshot.phase !== "failed") {
  setWorkflowError(null); // ← この if ブロックの外に handoffBundle 処理がある
}
if (snapshot.handoffBundle) {
  // ← phase に関わらず実行される（変更なし）
  setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
}
```

AC-3「`handoffBundle` の処理は `phase` に関わらず変わらないこと」を満たす設計。

### ステップ 5: React hooks deps の確認

修正によって `useEffect` の依存配列に変更が生じないことを確認する:

```typescript
useEffect(() => {
  // ... (変更あり)
}, [setHandoffGuidance, setWorkflowError, setWorkflowSnapshot]);
//  ↑ この依存配列は変更なし
```

ESLint `react-hooks/exhaustive-deps` への影響なし（依存関係の変更なし）。

## アーキテクチャ設計図

### フェーズ別の動作変更

```
Renderer（SkillLifecyclePanel）
   │
   ├── onWorkflowStateChanged callback
   │     ├── phase: 'running'   → setWorkflowSnapshot + setWorkflowError(null)  ✅
   │     ├── phase: 'completed' → setWorkflowSnapshot + setWorkflowError(null)  ✅
   │     ├── phase: 'failed'    → setWorkflowSnapshot のみ（エラー保持）        ✅ 修正後
   │     │                        ↑ 修正前は setWorkflowError(null) も呼んでいた（バグ）
   │     └── handoffBundle 処理 → phase に関わらず実行                          ✅
```

## 多角的チェック観点

- `snapshot.phase` が `undefined` や `null` の場合に `!== 'failed'` が `true` と評価される挙動を確認したか（エラー未発生時は `undefined` の可能性があるか）
- `phase: 'failed'` 以外のエラー関連フェーズ（例: `'heartbeat_timeout'`）がある場合、それらも `'failed'` と同様に扱うべきか確認したか
- `setWorkflowError(null)` がコールバック外（他の場所）から呼ばれる箇所があるか確認したか（影響範囲の特定）

## 成果物

| 成果物           | パス                                 | 説明                                               |
| ---------------- | ------------------------------------ | -------------------------------------------------- |
| 設計トポロジー表 | `outputs/phase-2/design-topology.md` | 1 concern の設計表、変更前後コード比較、型確認結果 |

## 完了条件

- [ ] 1 つの concern（`onWorkflowStateChanged` の `phase` 判定）の変更設計が明記されている
- [ ] `snapshot.phase` の型定義場所が確認され、`'failed'` との比較が型安全であることが確認されている
- [ ] 変更前後コードが比較表として記録されている
- [ ] `handoffBundle` 処理が `phase` に関わらず実行されることが設計で確認されている
- [ ] React hooks deps（`useEffect` 依存配列）が変更なしであることが確認されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-2/design-topology.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 3: 設計レビュー へ進む
