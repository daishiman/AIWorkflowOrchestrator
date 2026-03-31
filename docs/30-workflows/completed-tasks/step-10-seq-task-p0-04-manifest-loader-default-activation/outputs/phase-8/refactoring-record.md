# Phase 8 成果物: リファクタリング記録

## 変更点

### 1. `hasDynamicResourcePipeline()` メソッド削除

**変更前**:

```typescript
private hasDynamicResourcePipeline(): boolean {
  // TASK-P0-04: 自動インスタンス化により常に true を返す
  return true;
}
```

**変更後**: メソッド削除。

**理由**: 呼び出し元が存在しない dead code。TASK-P0-04 で `plan()` と `improve()` を常に dynamic pipeline を try するよう変更した際、このガードメソッドは不要になった。

### 2. `resolveOperationResources()` の null check 削除

**変更前**:

```typescript
if (
  !this.sourceResolver ||
  !this.resourcePlanner ||
  !this.resolvedResourceReader
) {
  throw new Error("Dynamic resource pipeline is not configured");
}
```

**変更後**: コメントに置換。

```typescript
// TASK-P0-04: 3コンポーネントは常に自動インスタンス化されるため null check 不要
```

**理由**: フィールドが `readonly` 必須型（`?: なし`）になり、コンストラクタで必ず初期化されるため実行時 null は不可能。TypeScript 型で保証済み。

### 3. `readPlannedResources()` の null check 削除

同上と同じ理由。`resolvedResourceReader` は常に存在する。

## 判断した最小複雑性

| 候補                  | 採用 | 理由                                                   |
| --------------------- | ---- | ------------------------------------------------------ |
| init メソッド抽出     | 否   | コンストラクタの初期化ロジックは3行で十分シンプル      |
| fallback chain 共通化 | 否   | plan/improve で微妙に異なる（agentSpecs 構造が異なる） |
| 命名変更              | 否   | 現状の命名（sourceResolver, resourcePlanner 等）は明確 |

## リファクタ後のテスト結果

417/417 通過（回帰なし）
