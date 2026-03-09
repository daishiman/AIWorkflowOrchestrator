# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| カテゴリ   | fix                                       |
| ステータス | pending                                   |
| 前提Phase  | Phase 4                                   |
| 後続Phase  | Phase 6                                   |

## 目的

App.tsx からデバッグ用 `useEffect`（L45-61）を削除し、Phase 4 で作成したテストが全て PASS する状態にする（TDD Green フェーズ）。

## 実行タスク

### タスク1: デバッグコードの削除

**目的**: App.tsx L45-61 のデバッグ用 `useEffect` を完全に削除する

**手順**:

1. `apps/desktop/src/renderer/App.tsx` を開く
2. 以下の行を削除する:
   - L45: `// デバッグ用: 初回起動時にストレージをクリア（TODO: テスト完了後に削除）`
   - L46-61: `useEffect(() => { ... }, []);` ブロック全体
3. 削除後の空行を整理する（連続する空行を1行にまとめる）

**削除対象コード（17行）**:

```typescript
// デバッグ用: 初回起動時にストレージをクリア（TODO: テスト完了後に削除）
useEffect(() => {
  if (
    import.meta.env.VITE_E2E_MODE === "true" ||
    window.location.search.includes("skipAuth=true")
  ) {
    return;
  }

  const shouldClear = sessionStorage.getItem("debug-clear-storage");
  if (!shouldClear) {
    console.log("🔧 [DEBUG] Clearing all storage for clean auth test...");
    localStorage.clear();
    sessionStorage.setItem("debug-clear-storage", "done");
    window.location.reload();
  }
}, []);
```

**期待される成果物**:

- 修正済み `apps/desktop/src/renderer/App.tsx`

### タスク2: import の確認

**目的**: 削除後に不要になった import がないかを確認する

**手順**:

1. `useEffect` が他の箇所で使用されているか確認
   - L71（auth初期化）、L87（resize）、L100（未認証リセット）で使用 → **維持**
2. `React` import が必要か確認 → JSX.Element の型で使用 → **維持**
3. その他の import に影響がないことを確認

**結果**: import の変更は不要

### タスク3: テスト実行（Green フェーズ確認）

**目的**: Phase 4 で作成したテストが全て PASS することを確認する

**手順**:

1. `cd apps/desktop && pnpm vitest run src/renderer/__tests__/App.debug-removal.test.tsx`
2. TC-1〜TC-5 が全て PASS することを確認
3. 既存テストも PASS することを確認: `cd apps/desktop && pnpm vitest run`

**期待結果**: 全テスト PASS

### タスク4: 型チェック

**目的**: 削除後の型整合性を確認する

**手順**:

1. `pnpm --filter @repo/desktop exec tsc --noEmit`
2. エラーがないことを確認

## 参照資料

| 参照資料       | パス                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| Phase 4 成果物 | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-4-test-creation.md` |
| App.tsx        | `apps/desktop/src/renderer/App.tsx`                                                    |

## 統合テスト連携

- Phase 4 のテストが全て PASS することで AC-1, AC-2, AC-4 を検証
- Phase 6 でカバレッジを確認し、不足があればテスト追加

## 成果物

| 成果物          | パス                                                                                    |
| --------------- | --------------------------------------------------------------------------------------- |
| 修正済みApp.tsx | `apps/desktop/src/renderer/App.tsx`                                                     |
| 実装仕様書      | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md` |

## 完了条件

- [ ] デバッグ用 useEffect（L45-61）が完全に削除されていること
- [ ] import に不要な変更がないこと
- [ ] Phase 4 のテストが全て PASS すること
- [ ] 型チェックがエラーなしで通ること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 6: テスト拡充へ進む。
