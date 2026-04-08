# Phase 4: テスト作成（TDD Red）- UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Phase    | 4                                            |
| タスクID | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001      |
| 機能名   | useMainlineExecutionAccess healthPolicy 移行 |
| 作成日   | 2026-04-07                                   |

## 目的

TDD Red フェーズとして、移行後の正しい動作を検証するテストケース（TC-01〜TC-05）を先に実装する。この時点では実装がまだ移行前のため、テストは**意図的に失敗（Red）**する状態で完了とする。

---

## TDD Red フェーズの説明

TDD（テスト駆動開発）では以下のサイクルで進める：

1. **Red**: まず失敗するテストを書く（本 Phase）
2. **Green**: テストが通るように実装する（Phase 5）
3. **Refactor**: コードを整理する（Phase 6）

本 Phase では「移行後にこうなるべき」という期待をテストコードで表現する。Phase 5 の実装完了後にテストが全て PASS（Green）になることを確認する。

---

## 参照資料

| 資料名   | パス                                         | 内容                         |
| -------- | -------------------------------------------- | ---------------------------- |
| 要件定義 | `phase-1-requirements.md`                    | AC-1〜AC-6 定義              |
| 設計書   | `phase-2-design.md`                          | 移行後コード例               |
| 命名規則 | `outputs/phase-1/requirements-definition.md` | テストファイルの既存スタイル |

---

## テスト対象ファイル

```
apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts
```

---

## 命名規則確認（Phase 1 調査結果との整合）

テストコード追加前に以下を確認すること：

```bash
# 既存テストのスタイル確認
cat apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts

# vi/jest/vitest の確認
grep -n "from \"vitest\"" apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts
grep -n "from \"@testing-library" apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts

# モックパターン確認
grep -n "vi.mock\|jest.mock" apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts
```

**確認観点**:

- テストフレームワーク（vitest / jest）
- `describe` / `it` / `test` の使い分け
- モックの書き方（`vi.mock` / `vi.fn()` / `vi.spyOn`）
- `renderHook` の import 元（`@testing-library/react` 等）
- 既存の `describe` ブロック名（新規テストを追加する場所）

---

## テストケース一覧

| TC    | タイトル                                                         | 対応 AC    | 期待する動作                                                              |
| ----- | ---------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| TC-01 | resolveHealthPolicy が呼び出されること                           | AC-1       | フックレンダリング時に `resolveHealthPolicy` がコールされる               |
| TC-02 | buildMainlineExecutionAccessState に healthPolicy が渡されること | AC-2       | `buildMainlineExecutionAccessState` の引数に `healthPolicy` が含まれる    |
| TC-03 | apiKeyDegraded 独自ロジックが除去されていること（間接確認）      | AC-3       | `disconnected` 状態でも `resolveHealthPolicy` 経由で判定される            |
| TC-04 | connected 状態で healthy な HealthPolicy が生成されること        | AC-1, AC-2 | `status === "connected"` のとき healthy な `healthPolicy` が渡される      |
| TC-05 | disconnected 状態で unhealthy な HealthPolicy が生成されること   | AC-1, AC-2 | `status === "disconnected"` のとき unhealthy な `healthPolicy` が渡される |

---

## テストケース詳細

### TC-01: resolveHealthPolicy が呼び出されること

**目的**: AC-1「`resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている」の自動検証

```typescript
describe("resolveHealthPolicy の統合", () => {
  it("TC-01: フックレンダリング時に resolveHealthPolicy が呼び出されること", () => {
    // Arrange
    const mockResolveHealthPolicy = vi.fn().mockReturnValue({
      /* モック HealthPolicy */
    });
    vi.mocked(resolveHealthPolicy).mockImplementation(mockResolveHealthPolicy);

    // Act
    renderHook(() =>
      useMainlineExecutionAccess({
        /* 適切な引数 */
      }),
    );

    // Assert
    expect(mockResolveHealthPolicy).toHaveBeenCalledTimes(1);
  });
});
```

**Red 確認**: 移行前は `resolveHealthPolicy` が呼ばれないため、`toHaveBeenCalledTimes(1)` で失敗する。

---

## 実装メモ

本ワークツリーでは、Vitest の `forks + isolate` 環境で `vi.mock("@repo/shared/types", ...)` が安定してプロダクションコードに刺さらなかったため、TC-01〜TC-05 の canonical 実装は `buildMainlineExecutionAccessState()` に渡る `healthPolicy` を観測する間接検証へ寄せた。

Vitest の `forks + isolate` 構成では、`vi.mock("@repo/shared/types", ...)` がプロダクションコードの解決経路と一致せず、`resolveHealthPolicy` の direct mock が安定しない場合がある。

その場合は、`buildMainlineExecutionAccessState()` に渡る `healthPolicy` を観測点にして間接検証すること。

**実装方針**:

- `resolveHealthPolicy` の戻り値を直接 spy しない
- `buildMainlineExecutionAccessState` の引数に含まれる `healthPolicy` を確認する
- `apiKeyDegraded` の独自算出が消えていることを `buildMainlineExecutionAccessState` に渡る引数から確認する

### TC-02: buildMainlineExecutionAccessState に healthPolicy が渡されること

**目的**: AC-2「`buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている」の自動検証

```typescript
it("TC-02: buildMainlineExecutionAccessState に healthPolicy が渡されること", () => {
  // Arrange
  const mockHealthPolicy = {
    status: "healthy",
    /* HealthPolicy の他フィールド */
  };
  vi.mocked(resolveHealthPolicy).mockReturnValue(mockHealthPolicy);

  const mockBuildState = vi.fn().mockReturnValue({
    /* モック戻り値 */
  });
  vi.mocked(buildMainlineExecutionAccessState).mockImplementation(
    mockBuildState,
  );

  // Act
  renderHook(() =>
    useMainlineExecutionAccess({
      /* 適切な引数 */
    }),
  );

  // Assert
  expect(mockBuildState).toHaveBeenCalledWith(
    expect.objectContaining({
      healthPolicy: mockHealthPolicy,
    }),
  );
});
```

**Red 確認**: 移行前は `buildMainlineExecutionAccessState` に `healthPolicy` が渡されないため `objectContaining` で失敗する。

---

### TC-03: apiKeyDegraded 独自ロジックが除去されていること（間接確認）

**目的**: AC-3「L117-120 の `apiKeyDegraded` 独自算出ロジックが削除されている」の間接確認

```typescript
it("TC-03: disconnected 状態の判定が resolveHealthPolicy 経由であること（apiKeyDegraded 独自ロジックが除去されていること）", () => {
  // Arrange
  // resolveHealthPolicy のモックで任意の healthPolicy を返す
  const mockHealthPolicy = { status: "unhealthy" /* ... */ };
  vi.mocked(resolveHealthPolicy).mockReturnValue(mockHealthPolicy);

  // Act
  renderHook(() =>
    useMainlineExecutionAccess({
      credentials: { apiKeyValid: true },
      selectedHealthStatus: { status: "disconnected" /* ... */ },
    }),
  );

  // Assert
  // resolveHealthPolicy が呼ばれ、その戻り値が buildMainlineExecutionAccessState に渡されること
  // （独自ロジックで apiKeyDegraded を直接計算していないことを間接的に確認）
  expect(resolveHealthPolicy).toHaveBeenCalledWith(
    expect.objectContaining({
      connectionStatus: "disconnected",
      isApiKeyValid: true,
    }),
  );
  expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
    expect.objectContaining({ healthPolicy: mockHealthPolicy }),
  );
});
```

**Red 確認**: 移行前は `resolveHealthPolicy` が呼ばれないため失敗する。

---

### TC-04: connected 状態で healthy な HealthPolicy が生成されること

**目的**: `status === "connected"` のとき、`resolveHealthPolicy` が healthy なポリシーを受け取ること

```typescript
it("TC-04: connected 状態で resolveHealthPolicy に connected な入力が渡されること", () => {
  // Arrange
  vi.mocked(resolveHealthPolicy).mockReturnValue({
    status: "healthy" /* ... */,
  });

  // Act
  renderHook(() =>
    useMainlineExecutionAccess({
      credentials: { apiKeyValid: true },
      selectedHealthStatus: { status: "connected" /* ... */ },
    }),
  );

  // Assert
  expect(resolveHealthPolicy).toHaveBeenCalledWith(
    expect.objectContaining({
      connectionStatus: "connected",
      isApiKeyValid: true,
    }),
  );
});
```

**Red 確認**: 移行前は `resolveHealthPolicy` が呼ばれないため `toHaveBeenCalledWith` で失敗する。

---

### TC-05: disconnected 状態で unhealthy な HealthPolicy が生成されること

**目的**: `status === "disconnected"` のとき、`resolveHealthPolicy` に正しい入力が渡されること

```typescript
it("TC-05: disconnected 状態で resolveHealthPolicy に disconnected な入力が渡されること", () => {
  // Arrange
  vi.mocked(resolveHealthPolicy).mockReturnValue({
    status: "unhealthy" /* ... */,
  });

  // Act
  renderHook(() =>
    useMainlineExecutionAccess({
      credentials: { apiKeyValid: true },
      selectedHealthStatus: { status: "disconnected" /* ... */ },
    }),
  );

  // Assert
  expect(resolveHealthPolicy).toHaveBeenCalledWith(
    expect.objectContaining({
      connectionStatus: "disconnected",
      isApiKeyValid: true,
    }),
  );
  // buildMainlineExecutionAccessState に unhealthy な healthPolicy が渡されること
  expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
    expect.objectContaining({
      healthPolicy: { status: "unhealthy" /* ... */ },
    }),
  );
});
```

**Red 確認**: 移行前は `resolveHealthPolicy` が呼ばれないため失敗する。

---

## テスト実装手順

### 1. 既存テストファイルの確認

```bash
# 既存テストの全体像を確認
cat apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts
```

### 2. モック設定の追加

既存の `vi.mock` ブロックに `resolveHealthPolicy` のモックを追加する：

```typescript
vi.mock("@repo/shared/types", () => ({
  resolveHealthPolicy: vi.fn(),
  buildMainlineExecutionAccessState: vi.fn(),
  // ... 既存のモック
}));
```

> 既存のモック設定がある場合はそれを壊さずに追加すること。

### 3. TC-01〜TC-05 を適切な describe ブロックに追加

既存の describe 構造に合わせて、新規 describe ブロックを追加するか、適切な既存ブロックに追加する。

### 4. Red 状態の確認

```bash
# テストを実行し、TC-01〜TC-05 が失敗することを確認
pnpm --filter @repo/desktop test

# 既存テストが PASS していることも確認（新規テストのみ失敗であること）
```

**期待する結果**:

- TC-01〜TC-05: FAIL（Red 状態）
- 既存テスト: PASS（壊していないこと）

---

## 成果物

| 成果物                                                                         | 種別         | 説明                         |
| ------------------------------------------------------------------------------ | ------------ | ---------------------------- |
| `apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts` | 変更ファイル | TC-01〜TC-05 追加（failing） |

---

## 完了条件

- [ ] 既存テストファイルのスタイル（フレームワーク・モックパターン）を確認した
- [ ] TC-01〜TC-05 が既存テストファイルに追加されている
- [ ] `pnpm --filter @repo/desktop test` 実行時に TC-01〜TC-05 が FAIL（Red）になっている
- [ ] 既存テストは全て PASS のままである

## 次の Phase

Phase 5（実装 TDD Green）へ進む。Phase 2 設計書の4ステップに従い実装を行い、TC-01〜TC-05 が全て PASS（Green）になることを確認する。
