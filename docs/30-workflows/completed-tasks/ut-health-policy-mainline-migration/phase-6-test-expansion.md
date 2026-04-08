# Phase 6: テスト拡充

## メタ情報

| 項目         | 値                                         |
| ------------ | ------------------------------------------ |
| タスクID     | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001    |
| フェーズ     | Phase 6                                    |
| フェーズ名   | テスト拡充                                 |
| 前提フェーズ | Phase 5（実装完了）                        |
| 担当         | 実装担当者                                 |
| 成果物       | `outputs/phase-6/test-expansion-report.md` |

---

## 目的

Phase 5（実装フェーズ）で `useMainlineExecutionAccess.ts` のリファクタリング（`apiKeyDegraded` 独自算出ロジックの削除・`resolveHealthPolicy()` + `buildMainlineExecutionAccessState()` への統一）が完了した後、エッジケースおよび境界条件を網羅する追加テストを実装する。

このフェーズの完了により、実装の正確性・堅牢性を担保し、後続フェーズ（Phase 7: カバレッジ確認）の前提条件を整える。

---

## 対象ファイル

| 区分                     | ファイルパス                                                                   |
| ------------------------ | ------------------------------------------------------------------------------ |
| 実装（変更対象）         | `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`                |
| テスト（追加・拡充対象） | `apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts` |

---

## 追加テストケース一覧

### 6-1. `selectedHealthStatus` が `undefined` の場合（プロバイダー未選択時）

#### 背景

ユーザーがプロバイダーを一切選択していない状態では `selectedHealthStatus` が `undefined` になる。この状態で `resolveHealthPolicy()` および `buildMainlineExecutionAccessState()` が想定通りの結果を返すことを確認する。

#### テストケース

| テストID | 入力条件                                                                | 期待する出力                                             |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| TC-6-1-1 | `selectedHealthStatus = undefined`、`connectionStatus = 'disconnected'` | `canExecute = false`、エラー状態が適切に反映される       |
| TC-6-1-2 | `selectedHealthStatus = undefined`、`connectionStatus = 'connected'`    | `canExecute = false`（プロバイダー未選択のため実行不可） |
| TC-6-1-3 | `selectedHealthStatus = undefined`、`isApiKeySet = false`               | `canExecute = false`                                     |

#### 実装例（テストコードの骨格）

```typescript
describe("selectedHealthStatus が undefined の場合", () => {
  it("プロバイダー未選択時は canExecute が false になること", () => {
    // Arrange
    const mockState = buildMockState({ selectedHealthStatus: undefined });

    // Act
    const result = renderHook(() => useMainlineExecutionAccess(mockState));

    // Assert
    expect(result.current.canExecute).toBe(false);
  });
});
```

---

### 6-2. `isRateLimited` が考慮された場合の将来対応コメント

#### 背景

現在の実装では `isRateLimited` フラグは `resolveHealthPolicy()` の判定に直接影響しない可能性があるが、将来的にレートリミット状態を `HealthPolicy` に組み込む設計変更が予定されている。

このフェーズでは実装は行わず、テストコードに `TODO` コメントを残して将来対応を明示する。

#### 対応内容

```typescript
// TODO(UT-HEALTH-POLICY-MAINLINE-MIGRATION-001):
// isRateLimited が true の場合、resolveHealthPolicy() が
// DEGRADED または BLOCKED を返すよう将来拡張予定。
// 設計確定後に以下テストを有効化すること。
//
// it.skip('isRateLimited=true のとき healthPolicy が DEGRADED になること', () => {
//   ...
// });
```

#### 配置場所

`useMainlineExecutionAccess.test.ts` の `describe('将来対応 / 未実装')` ブロック内。

---

### 6-3. 各 `connectionStatus` パターンのテスト

#### テスト対象パターン

| connectionStatus | 期待する動作                                            |
| ---------------- | ------------------------------------------------------- |
| `'connected'`    | 正常系。APIキー等の状態次第で `canExecute` が決定される |
| `'disconnected'` | `canExecute = false`。`reason` に切断理由が含まれる     |
| `'error'`        | `canExecute = false`。`reason` にエラー詳細が含まれる   |

#### テストケース詳細

**TC-6-3-1: `connectionStatus = 'connected'`**

```typescript
it("connected 状態かつ APIキー設定済みの場合 canExecute が true になること", () => {
  const result = renderHook(() =>
    useMainlineExecutionAccess({
      connectionStatus: "connected",
      isApiKeySet: true,
      selectedHealthStatus: "healthy",
    }),
  );
  expect(result.current.canExecute).toBe(true);
});
```

**TC-6-3-2: `connectionStatus = 'disconnected'`**

```typescript
it("disconnected 状態では canExecute が false になること", () => {
  const result = renderHook(() =>
    useMainlineExecutionAccess({
      connectionStatus: "disconnected",
      isApiKeySet: true,
      selectedHealthStatus: "healthy",
    }),
  );
  expect(result.current.canExecute).toBe(false);
  expect(result.current.reason).toContain("disconnected");
});
```

**TC-6-3-3: `connectionStatus = 'error'`**

```typescript
it("error 状態では canExecute が false になること", () => {
  const result = renderHook(() =>
    useMainlineExecutionAccess({
      connectionStatus: "error",
      isApiKeySet: true,
      selectedHealthStatus: "healthy",
    }),
  );
  expect(result.current.canExecute).toBe(false);
});
```

---

## テスト実行コマンド

```bash
# 対象テストのみ実行
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts

# ウォッチモード（開発中）
pnpm --filter @repo/desktop vitest apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts
```

---

## 完了条件（フェーズゲート）

| 条件                                      | 確認方法                                            |
| ----------------------------------------- | --------------------------------------------------- |
| 追加テストケースが全て PASS する          | `pnpm --filter @repo/desktop vitest run` の出力確認 |
| `TODO` コメントが適切に配置されている     | コードレビュー                                      |
| 既存テストが PASS を維持している          | CI ログ確認                                         |
| テストコードに `any` 型が使用されていない | TypeScript 型チェック                               |

---

## 成果物

- **レポートファイル**: `outputs/phase-6/test-expansion-report.md`
  - 追加したテストケース一覧
  - 各テストの PASS/FAIL 結果
  - `TODO` コメントの一覧と将来対応方針
  - 次フェーズ（Phase 7）への引き継ぎ事項
