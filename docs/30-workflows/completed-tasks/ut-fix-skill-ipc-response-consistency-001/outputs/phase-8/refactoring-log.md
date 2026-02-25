# Phase 8: リファクタリング記録

## 担当

- SubAgent-B（リファクタリング）

## 方針

今回の不整合は契約層のズレが原因のため、広範囲リファクタではなく「契約差分に直結する最小変更」を優先する。

## 実施内容

1. Preload 契約の単一化

- `execute` は wrapper 返却前提に合わせ `safeInvokeUnwrap` へ統一。
- `remove` は Main 契約 `RemoveResult` と型同期。

2. テストモックの正規化

- `execute` モックを wrapper 形式へ統一（`{ success: true, data: ... }`）。
- `remove` モックを `RemoveResult` 返却へ統一。

3. スコープ外リファクタの抑制

- Main / Renderer 実装の挙動変更は行わず、回帰リスクを回避。

## 変更対象

- `apps/desktop/src/preload/skill-api.ts`
- `apps/desktop/src/preload/__tests__/skill-api.test.ts`
- `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`

## 判定

- [x] 重複・不整合のある契約記述を最小差分で統一。
- [x] テスト可読性と再現性を維持。
- [x] Phase 9（品質保証）へ遷移可能。
