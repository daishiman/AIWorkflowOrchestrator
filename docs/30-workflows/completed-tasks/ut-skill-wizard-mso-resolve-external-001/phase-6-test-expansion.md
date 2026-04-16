# Phase 6: テスト拡充

## メタ情報

| 項目      | 内容                                              |
| --------- | ------------------------------------------------- |
| タスクID  | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001          |
| タスク名  | resolveExternalIntegration 複数ツール並列統合対応 |
| フェーズ  | Phase 6: テスト拡充                               |
| 前提Phase | Phase 5                                           |
| 後続Phase | Phase 7                                           |
| 作成日    | 2026-04-15                                        |
| 分類      | NON_VISUAL（Renderer内部ロジック変更のみ）        |

---

## 目的

Phase 5 の実装に対して、fail path・エッジケースのテストを追加し、
`resolveExternalIntegration` の堅牢性と信頼性を高める。
Phase 7 のカバレッジ計測（AC-6: 90% 以上）に向けて、
正常系だけでなく異常系・境界値のテストを網羅する。

---

## 追加テスト一覧

### TC-E1: 空配列フォールバックテスト

**目的**: 空配列 `[]` を渡した場合に安全に空の merged object を返すことを確認する（AC-4）

```typescript
describe("resolveExternalIntegration - 空配列フォールバック", () => {
  it("空配列を渡した場合に空の merged object を返す", async () => {
    const result = await resolveExternalIntegration([]);
    expect(result).toEqual({
      tools: [],
      mergedApiEndpoints: [],
      mergedAuthMethods: [],
      mergedPrimaryOperations: [],
    });
  });
});
```

**期待動作**: 空の merged object が返され、例外がスローされない

---

### TC-E2: 未対応ツール名のフォールバックテスト

**目的**: 未対応ツール名のみの配列を渡した場合に安全に空の merged object を返すことを確認する（AC-4）

```typescript
describe("resolveExternalIntegration - 未対応ツール", () => {
  it("未対応ツール名のみの配列で空の merged object を返す", async () => {
    const result = await resolveExternalIntegration(["unknown-tool-xyz"]);
    expect(result.tools).toEqual([]);
  });

  it("複数の未対応ツール名で空の merged object を返す", async () => {
    const result = await resolveExternalIntegration([
      "unknown-tool-1",
      "unknown-tool-2",
    ]);
    expect(result.tools).toEqual([]);
  });

  it("空文字列のツール名で空の merged object を返す", async () => {
    const result = await resolveExternalIntegration([""]);
    expect(result.tools).toEqual([]);
  });
});
```

**期待動作**: 空の merged object が返され、例外がスローされない

---

### TC-E3: 複数ツールで一部が未対応の場合のテスト

**目的**: サポート済みツールと未対応ツールが混在する場合、サポート済みツールのみの統合情報が返されることを確認する（AC-2, AC-4）

```typescript
describe("resolveExternalIntegration - 混在ツール", () => {
  it("サポート済みと未対応が混在する場合、サポート済みの統合情報を返す", async () => {
    // slack はサポート済み、unknown-tool は未対応と仮定
    const result = await resolveExternalIntegration([
      "slack",
      "unknown-tool-xyz",
    ]);

    expect(result.tools.map((tool) => tool.toolName)).toContain("slack");
    expect(result.tools.map((tool) => tool.toolName)).not.toContain(
      "unknown-tool-xyz",
    );
  });

  it("全て未対応の場合は空の merged object を返す", async () => {
    const result = await resolveExternalIntegration([
      "unknown-1",
      "unknown-2",
      "unknown-3",
    ]);
    expect(result.tools).toEqual([]);
  });
});
```

**期待動作**: サポート済みツールの統合情報のみマージされ、未対応ツールは無視される

---

### TC-E4: Promise 並列処理の失敗ケーステスト

**目的**: `Promise.all` を使った並列処理の一部が失敗した場合の動作を確認する

```typescript
describe("resolveExternalIntegration - Promise 並列処理エラー", () => {
  it("一部のツール取得が失敗しても残りの結果を返す", async () => {
    // fetchToolIntegrationInfo を部分モック
    // slack は成功、github は失敗するシナリオ
    vi.mocked(fetchToolIntegrationInfo)
      .mockResolvedValueOnce(mockSlackIntegrationInfo) // slack: 成功
      .mockRejectedValueOnce(new Error("Network error")); // github: 失敗

    // エラーが発生しても例外がスローされないこと
    const result = await resolveExternalIntegration(["slack", "github"]);
    expect(result.tools.map((tool) => tool.toolName)).toEqual(["slack"]);
  });

  it("全てのツール取得が失敗した場合は空の merged object を返す", async () => {
    vi.mocked(fetchToolIntegrationInfo).mockRejectedValue(
      new Error("Network error"),
    );

    const result = await resolveExternalIntegration(["slack", "github"]);
    expect(result.tools).toEqual([]);
  });
});
```

**期待動作**: 一部のPromiseが失敗しても全体がクラッシュせず、成功分のみが返る。

---

### TC-E5: 単一ツールの後方互換性テスト（AC-3）

**目的**: 単一ツールを配列で渡した場合、従来（`string` 単体渡し）と同一の動作を維持することを確認する

```typescript
describe("resolveExternalIntegration - 単一ツール後方互換性", () => {
  it("単一ツールの配列で従来と同一の統合情報を返す", async () => {
    const result = await resolveExternalIntegration(["slack"]);

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0]?.toolName).toBe("slack");
    expect(result.mergedApiEndpoints).toContain("/slack/api");
    expect(result.mergedAuthMethods).toContain("oauth2");
    expect(result.mergedPrimaryOperations).toContain("create");
  });

  it("単一ツールの場合も複数ツールと同じ型構造を返す", async () => {
    const singleResult = await resolveExternalIntegration(["slack"]);
    const multiResult = await resolveExternalIntegration(["slack", "github"]);

    expect(Object.keys(singleResult)).toEqual(Object.keys(multiResult));
  });
});
```

---

### TC-E6: 重複ツール名の処理テスト

**目的**: 同じツール名が複数含まれる配列を渡した場合の動作を確認する

```typescript
describe("resolveExternalIntegration - 重複ツール名", () => {
  it("重複ツール名が含まれる場合に重複除去して処理する", async () => {
    const result = await resolveExternalIntegration(["slack", "slack"]);

    expect(result.tools).toHaveLength(1);
    expect(result.tools[0]?.toolName).toBe("slack");
  });
});
```

---

## 参照資料

| 資料名                            | パス                                                                                      | 用途                             |
| --------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 実装仕様書                | `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/phase-5-implementation.md`    | 実装仕様の確認・テスト対象の把握 |
| resolveExternalIntegration テスト | `apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts` | 既存テストとの重複回避           |
| SkillCreateWizard.tsx             | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                        | テスト対象実装の確認             |

---

## 実行手順

### 1. 既存テストの確認

```bash
# Phase 4 で作成した既存テストを確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts
```

### 2. テスト拡充の追加

上記 TC-E1〜TC-E6 のテストケースを `resolveExternalIntegration.test.ts` に追加する。

### 3. テスト実行（全件PASS確認）

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts
```

### 4. カバレッジ暫定確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts
```

---

## 成果物

| 成果物名                                  | パス                                                                                      | 説明                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| resolveExternalIntegration テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts` | fail path・エッジケースのテストを追加 |

---

## 完了条件

- [ ] TC-E1（空配列フォールバック）が実装・PASS している
- [ ] TC-E2（未対応ツール名フォールバック）が実装・PASS している
- [ ] TC-E3（混在ツール処理）が実装・PASS している
- [ ] TC-E4（Promise 並列処理失敗ケース）が実装・PASS している
- [ ] TC-E5（単一ツール後方互換性）が実装・PASS している
- [ ] TC-E6（重複ツール名処理）が実装・PASS している
- [ ] 全テストケースが PASS している
- [ ] Phase 4 で作成した既存テストが引き続き PASS している
- [ ] カバレッジが 90% に近づいている（Phase 7 で正式計測）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] Phase 7（カバレッジチェック）へのブロッカーがない

---

## サブタスク管理

| #   | サブタスク                           | 状態    |
| --- | ------------------------------------ | ------- |
| 1   | TC-E1 空配列フォールバックテスト追加 | pending |
| 2   | TC-E2 未対応ツール名テスト追加       | pending |
| 3   | TC-E3 混在ツール処理テスト追加       | pending |
| 4   | TC-E4 Promise 失敗ケーステスト追加   | pending |
| 5   | TC-E5 後方互換性テスト追加           | pending |
| 6   | TC-E6 重複ツール名テスト追加         | pending |
| 7   | 全テスト実行・PASS 確認              | pending |

---

## タスク100%実行確認【必須】

テスト拡充完了後、以下を全て確認してから Phase 7 に進む。

```bash
# 1. 全テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# 2. カバレッジ暫定確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# 3. 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 次のPhase

Phase 7: カバレッジチェック（AC-6: 90% 以上の達成確認）
