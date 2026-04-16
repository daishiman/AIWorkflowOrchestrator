# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| タスクID   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001  |
| 機能名     | skill-wizard/resolve-external-integration |
| 前提Phase  | Phase 3                                   |
| 後続Phase  | Phase 5                                   |
| 作成日     | 2026-04-15                                |
| ステータス | pending                                   |

## 目的

TDD Red 段階として、`resolveExternalIntegration` の複数ツール並列処理・後方互換性・フォールバック・テストカバレッジ 90% 以上を達成するテストを先に定義し、Phase 5（実装）が失敗するテストを通すことを目標とする形で進められる状態にする。

## 実行タスク

- テストファイル設計: `resolveExternalIntegration.test.ts` の構造・テストケース設計
- 複数ツール並列処理テスト設計: AC-1 対応（TC-1〜TC-2）
- マージ結果テスト設計: AC-2 対応（TC-3〜TC-4）
- 後方互換性テスト設計: AC-3 対応（TC-5）
- フォールバックテスト設計: AC-4 対応（TC-6〜TC-10）
- カバレッジ 90% 達成のための網羅的テスト設計
- バッジ削除後テスト確認: `ConversationRoundStep.test.tsx` の TC-1〜TC-6 削除対象の特定

## 参照資料

| 資料名                          | パス                                                                                         | 用途                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase 2 設計書                  | `outputs/phase-2/design.md`                                                                  | テスト対象の関数シグネチャ・マージ戦略の参照       |
| Phase 3 設計レビュー結果        | `outputs/phase-3/gate-decision.md`                                                           | ゲート判定結果・リスク対策の参照                   |
| resolveExternalIntegration 実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | テスト対象の現状実装・型定義の確認                 |
| 対象コンポーネント              | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | バッジ削除対象（削除後の期待状態）の確認           |
| テストファイル                  | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 削除対象テスト（TC-1〜TC-6）の特定                 |
| Vitest 公式ドキュメント         | https://vitest.dev/                                                                          | `vi.fn()` / `vi.spyOn()` / `--coverage` の使用方法 |

## 実行手順

### 1. テストファイルの配置設計

#### テストファイルパス

```
apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts
```

既存のテストファイルの命名規則（`__tests__/*.test.ts(x)`）に従う。

#### テストファイルの基本構造

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveExternalIntegration } from "../SkillCreateWizard";
// または抽出後の独立モジュール
// import { resolveExternalIntegration } from "../resolveExternalIntegration";

// fetchToolIntegrationInfo のモック
vi.mock("../fetchToolIntegrationInfo", () => ({
  fetchToolIntegrationInfo: vi.fn(),
}));

describe("resolveExternalIntegration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AC-1: 複数ツール並列処理", () => {
    /* TC-1〜TC-2 */
  });
  describe("AC-2: 統合情報マージ", () => {
    /* TC-3〜TC-4 */
  });
  describe("AC-3: 後方互換性（単一ツール）", () => {
    /* TC-5 */
  });
  describe("AC-4: フォールバック", () => {
    /* TC-6〜TC-10 */
  });
});
```

### 2. 複数ツール並列処理テスト（AC-1 対応）

#### TC-1: 複数ツール入力時に並列取得が実行される

```typescript
it("TC-1: 複数ツール入力時に fetchToolIntegrationInfo が並列で呼び出される", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);

  // 各ツールの取得に遅延を付与して並列性を検証
  let resolveA: () => void;
  let resolveB: () => void;
  const callOrder: string[] = [];

  mockFetch.mockImplementation((tool: string) => {
    return new Promise((resolve) => {
      callOrder.push(`start:${tool}`);
      if (tool === "toolA") {
        resolveA = () => {
          callOrder.push(`end:${tool}`);
          resolve({
            apiEndpoints: ["/a"],
            authMethods: ["bearer"],
            mainOperations: ["opA"],
          });
        };
      } else {
        resolveB = () => {
          callOrder.push(`end:${tool}`);
          resolve({
            apiEndpoints: ["/b"],
            authMethods: ["apiKey"],
            mainOperations: ["opB"],
          });
        };
      }
    });
  });

  const promise = resolveExternalIntegration(["toolA", "toolB"]);

  // 両方の開始が記録されてから終了させる（並列であることの証明）
  expect(callOrder).toContain("start:toolA");
  expect(callOrder).toContain("start:toolB");

  resolveA!();
  resolveB!();

  await promise;
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
```

#### TC-2: 複数ツール入力時に fetchToolIntegrationInfo が各ツールで呼び出される

```typescript
it("TC-2: 複数ツール入力時に各ツール名で fetchToolIntegrationInfo が呼び出される", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);

  mockFetch.mockResolvedValueOnce({
    apiEndpoints: ["/a"],
    authMethods: ["bearer"],
    mainOperations: ["opA"],
  });
  mockFetch.mockResolvedValueOnce({
    apiEndpoints: ["/b"],
    authMethods: ["apiKey"],
    mainOperations: ["opB"],
  });

  await resolveExternalIntegration(["toolA", "toolB"]);

  expect(mockFetch).toHaveBeenCalledWith("toolA");
  expect(mockFetch).toHaveBeenCalledWith("toolB");
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
```

### 3. 統合情報マージテスト（AC-2 対応）

#### TC-3: 複数ツールの apiEndpoints・authMethods・mainOperations がマージされる

```typescript
it("TC-3: 複数ツールの統合情報が正しくマージされる", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);

  mockFetch.mockResolvedValueOnce({
    apiEndpoints: ["https://api.toolA.com/v1"],
    authMethods: ["bearer"],
    mainOperations: ["create", "read"],
  });
  mockFetch.mockResolvedValueOnce({
    apiEndpoints: ["https://api.toolB.com/v2"],
    authMethods: ["apiKey"],
    mainOperations: ["update", "delete"],
  });

  const result = await resolveExternalIntegration(["toolA", "toolB"]);

  expect(result.apiEndpoints).toContain("https://api.toolA.com/v1");
  expect(result.apiEndpoints).toContain("https://api.toolB.com/v2");
  expect(result.authMethods).toContain("bearer");
  expect(result.authMethods).toContain("apiKey");
  expect(result.mainOperations).toContain("create");
  expect(result.mainOperations).toContain("update");
});
```

#### TC-4: 重複するフィールド値が排除される

```typescript
it("TC-4: マージ結果の重複フィールド値が排除される", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);

  // 同じ authMethod を持つ2ツール
  mockFetch.mockResolvedValue({
    apiEndpoints: ["https://api.common.com/v1"],
    authMethods: ["bearer"],
    mainOperations: ["read"],
  });

  const result = await resolveExternalIntegration(["toolA", "toolA"]);

  // 重複が排除されているか確認
  expect(
    result.apiEndpoints.filter((e) => e === "https://api.common.com/v1"),
  ).toHaveLength(1);
  expect(result.authMethods.filter((a) => a === "bearer")).toHaveLength(1);
  expect(result.mainOperations.filter((o) => o === "read")).toHaveLength(1);
});
```

### 4. 後方互換性テスト（AC-3 対応）

#### TC-5: 単一ツール入力時は従来と同一の結果が返る

```typescript
it("TC-5: 単一ツール入力時は従来と同一の結果が返る", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);

  const expectedInfo = {
    apiEndpoints: ["https://api.toolA.com/v1"],
    authMethods: ["bearer"],
    mainOperations: ["create", "read", "update", "delete"],
  };
  mockFetch.mockResolvedValueOnce(expectedInfo);

  const result = await resolveExternalIntegration(["toolA"]);

  expect(result.apiEndpoints).toEqual(expectedInfo.apiEndpoints);
  expect(result.authMethods).toEqual(expectedInfo.authMethods);
  expect(result.mainOperations).toEqual(expectedInfo.mainOperations);
  expect(mockFetch).toHaveBeenCalledWith("toolA");
  expect(mockFetch).toHaveBeenCalledTimes(1);
});
```

### 5. フォールバックテスト（AC-4 対応）

#### TC-6: 空配列入力時はデフォルト値が返る

```typescript
it("TC-6: 空配列入力時はデフォルト値が返る", async () => {
  const result = await resolveExternalIntegration([]);

  expect(result.apiEndpoints).toEqual([]);
  expect(result.authMethods).toEqual([]);
  expect(result.mainOperations).toEqual([]);
});
```

#### TC-7: 未対応ツール入力時は安全にフォールバックする

```typescript
it("TC-7: 未対応ツール入力時は例外を投げずデフォルト値が返る", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);
  mockFetch.mockRejectedValueOnce(new Error("Unsupported tool"));

  await expect(
    resolveExternalIntegration(["unsupported"]),
  ).resolves.not.toThrow();

  const result = await resolveExternalIntegration(["unsupported"]);
  expect(result.apiEndpoints).toEqual([]);
  expect(result.authMethods).toEqual([]);
  expect(result.mainOperations).toEqual([]);
});
```

#### TC-8: 複数ツールのうち1件が失敗しても残りがマージされる

```typescript
it("TC-8: 複数ツールのうち1件が取得失敗しても残りの結果がマージされる", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);

  mockFetch.mockImplementation((tool: string) => {
    if (tool === "toolA") {
      return Promise.resolve({
        apiEndpoints: ["https://api.toolA.com/v1"],
        authMethods: ["bearer"],
        mainOperations: ["create"],
      });
    }
    return Promise.reject(new Error("取得失敗"));
  });

  const result = await resolveExternalIntegration(["toolA", "errorTool"]);

  expect(result.apiEndpoints).toContain("https://api.toolA.com/v1");
  expect(result.authMethods).toContain("bearer");
  expect(result.mainOperations).toContain("create");
});
```

#### TC-9: 全ツール取得失敗時はデフォルト値が返る

```typescript
it("TC-9: 全ツール取得失敗時はデフォルト値が返る", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);
  mockFetch.mockRejectedValue(new Error("全件失敗"));

  const result = await resolveExternalIntegration(["errorA", "errorB"]);

  expect(result.apiEndpoints).toEqual([]);
  expect(result.authMethods).toEqual([]);
  expect(result.mainOperations).toEqual([]);
});
```

#### TC-10: 3ツール以上入力時に全ツール分がマージされる

```typescript
it("TC-10: 3ツール以上入力時に全ツール分の情報がマージされる", async () => {
  const { fetchToolIntegrationInfo } =
    await import("../fetchToolIntegrationInfo");
  const mockFetch = vi.mocked(fetchToolIntegrationInfo);

  const tools = ["toolA", "toolB", "toolC"];
  tools.forEach((tool, i) => {
    mockFetch.mockResolvedValueOnce({
      apiEndpoints: [`https://api.${tool}.com/v${i + 1}`],
      authMethods: [`method${i + 1}`],
      mainOperations: [`op${i + 1}`],
    });
  });

  const result = await resolveExternalIntegration(tools);

  expect(result.apiEndpoints).toHaveLength(3);
  expect(result.authMethods).toHaveLength(3);
  expect(result.mainOperations).toHaveLength(3);
});
```

### 6. カバレッジ 90% 達成のための補足テスト設計

TC-1〜TC-10 に加え、以下の補足テストを追加して Branch/Function カバレッジを補完する。

| テストケース ID | テスト内容                                                  | 対象ブランチ/パス                  | AC対応 |
| --------------- | ----------------------------------------------------------- | ---------------------------------- | ------ |
| TC-11           | 空白のみのツール名が正規化で除去される                      | フィルタ条件の trim/empty チェック | AC-4   |
| TC-12           | mergeIntegrations に空配列が渡された場合                    | `infos.length === 0` の境界値      | AC-4   |
| TC-13           | fetchToolIntegrationInfo が同期的に解決される場合の動作確認 | 非同期パスの同期的解決             | AC-1   |

```typescript
it("TC-11: 空白のみのツール名が正規化で除去される", async () => {
  const result = await resolveExternalIntegration(["   ", "validTool"]);

  expect(result.tools.map((tool) => tool.toolName)).toEqual(["validTool"]);
});

it("TC-12: mergeIntegrations が空配列を受け取った場合は空の merged object を返す", () => {
  expect(mergeIntegrations([])).toEqual({
    tools: [],
    mergedApiEndpoints: [],
    mergedAuthMethods: [],
    mergedPrimaryOperations: [],
  });
});
```

### 7. バッジ削除後テスト確認（ConversationRoundStep.test.tsx）

AC-7 対応として、`ConversationRoundStep.test.tsx` から以下の削除対象テストを特定する。

#### 削除対象テストケース（TC-1〜TC-6）

| テストケース ID | テスト内容                                             | 削除理由             |
| --------------- | ------------------------------------------------------ | -------------------- |
| TC-1            | Q5 で2ツール選択時に先頭ツールに「主ツール」バッジあり | バッジ削除により不要 |
| TC-2            | Q5 で2ツール選択時に2番目ツールにバッジなし            | バッジ削除により不要 |
| TC-3            | Q5 で1ツールのみ選択時にバッジ非表示                   | バッジ削除により不要 |
| TC-4            | Q5 未選択時にバッジ非表示                              | バッジ削除により不要 |
| TC-5            | Q5 先頭ツールの `MainToolBadge` aria-label 確認        | バッジ削除により不要 |
| TC-6            | Q5 以外の設問でバッジ非表示                            | バッジ削除により不要 |

#### 削除後の確認コマンド

```bash
# 削除後に「主ツール」関連テストが残っていないか確認
grep -n "主ツール\|mainToolBadge\|shouldShowMainToolBadge\|MAIN_TOOL_BADGE" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# 削除後にテストが全件 PASS することを確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### 8. テスト実行・カバレッジ確認手順

```bash
# Red 確認（Phase 5 実装前に失敗することを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# 型チェック（テストコードの型エラーなし確認）
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# カバレッジ確認（Phase 5 実装後に 90% 以上であることを確認）
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/renderer/components/skill/

# 全テスト実行
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

| 判定項目               | 基準       | 結果 |
| ---------------------- | ---------- | ---- |
| テストケース網羅度     | AC全件対応 | -    |
| ユニットテストLine     | 90%+       | -    |
| ユニットテストBranch   | 80%+       | -    |
| ユニットテストFunction | 90%+       | -    |
| 型チェック             | PASS       | -    |

## 成果物

| 成果物         | パス                                                                                      | 説明                                               |
| -------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                                   | テストケース一覧・実行手順・カバレッジ目標         |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts` | TDD Red 段階のテストコード（Phase 5 実装前は失敗） |

## 完了条件

- [ ] テストファイルのパス（`__tests__/resolveExternalIntegration.test.ts`）が確定済み
- [ ] TC-1〜TC-2（AC-1: 並列処理）のテストケースが定義済み
- [ ] TC-3〜TC-4（AC-2: 統合情報マージ）のテストケースが定義済み
- [ ] TC-5（AC-3: 後方互換性）のテストケースが定義済み
- [ ] TC-6〜TC-10（AC-4: フォールバック）のテストケースが定義済み
- [ ] TC-11〜TC-13（カバレッジ補足）のテストケースが定義済み
- [ ] `ConversationRoundStep.test.tsx` の削除対象テスト（TC-1〜TC-6）が特定済み
- [ ] テスト実行コマンドが確認済み（Red 確認・カバレッジ確認）
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. テストファイルの配置設計（パス・基本構造）
2. AC-1 対応テスト設計（TC-1〜TC-2: 並列処理）
3. AC-2 対応テスト設計（TC-3〜TC-4: マージ）
4. AC-3 対応テスト設計（TC-5: 後方互換性）
5. AC-4 対応テスト設計（TC-6〜TC-10: フォールバック）
6. カバレッジ補足テスト設計（TC-11〜TC-13）
7. バッジ削除後テスト確認（削除対象 TC-1〜TC-6 の特定）
8. テスト実行・カバレッジ確認手順の記載
9. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
