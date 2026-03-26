# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| Phase      | 6                 |
| Phase名    | テスト拡充        |
| 前提Phase  | Phase 5           |
| 後続Phase  | Phase 7           |
| ステータス | 完了              |
| 作成日     | 2026-03-25        |
| 機能名     | UT-LLM-MOD-01-005 |

---

## 目的

Phase 5 の実装に対して、エッジケースや回帰テストを追加し、堅牢性を確保する。Phase 4 で作成した基本テストに加え、境界値・異常系・競合パターンを網羅する。

---

## 背景

Phase 5 の実装が完了しテストが全て PASS（Green状態）。エッジケース、境界値、回帰テストを追加してテストの網羅性を高める。既存テスト（provider.test.ts, llm.test.ts）との回帰確認も含む。

---

## 実行タスク

1. `inferProviderId` の空文字・大文字小文字・prefix 境界を追加検証する。
2. OpenRouter の `provider/model` 形式と優先順位を回帰テスト化する。
3. `PROVIDER_IDS` / `models` / `specialMatcher` の整合性を網羅する。
4. 既存 shared schema テストとの回帰がないことを確認する。

### Task 1: エッジケーステスト

`packages/shared/src/types/llm/schemas/__tests__/provider-registry.test.ts` に以下を追加する。

```typescript
describe("inferProviderId - エッジケース", () => {
  it("空文字に対して null を返す", () => {
    expect(inferProviderId("")).toBeNull();
  });

  it("空白文字のみに対して null を返す", () => {
    expect(inferProviderId("   ")).toBeNull();
  });

  it("prefix と完全一致するモデルIDに対して正しく解決する", () => {
    // "gpt-" のみ（suffix なし）のケース
    expect(inferProviderId("gpt-")).toBe("openai");
  });

  it("大文字小文字が異なるモデルIDに対して null を返す（case-sensitive）", () => {
    expect(inferProviderId("GPT-5.4")).toBeNull();
    expect(inferProviderId("Claude-sonnet-4-6")).toBeNull();
  });
});
```

### Task 2: OpenRouter の "provider/model" 形式テスト

```typescript
describe("inferProviderId - OpenRouter 形式", () => {
  it("'provider/model' 形式が openrouter に解決される", () => {
    expect(inferProviderId("anthropic/claude-sonnet-4-6")).toBe("openrouter");
    expect(inferProviderId("openai/gpt-5.4")).toBe("openrouter");
    expect(inferProviderId("google/gemini-2.5-pro")).toBe("openrouter");
    expect(inferProviderId("meta-llama/llama-3.1-70b")).toBe("openrouter");
  });

  it("スラッシュを含むがプロバイダー prefix にもマッチするモデルIDの優先順位", () => {
    // `inferProviderId` の評価順序: 各プロバイダーについて 1. specialMatcher（先に評価）→ 2. modelPrefixes。
    // PROVIDER_CONFIGS の配列順に走査し、最初にマッチしたプロバイダーを返す。
    expect(inferProviderId("openai/gpt-4o")).toBe("openrouter");
  });
});

describe("優先順位テスト", () => {
  it("specialMatcher は modelPrefixes より先に評価される", () => {
    // OpenRouter の specialMatcher (includes("/")) は
    // 他プロバイダーの modelPrefixes より先に評価される
    expect(inferProviderId("openai/gpt-4o")).toBe("openrouter");
  });

  it("PROVIDER_CONFIGS の配列順で最初にマッチしたプロバイダーが返る", () => {
    // "gpt-" は openai の modelPrefixes にマッチ
    expect(inferProviderId("gpt-5.4")).toBe("openai");
  });
});
```

### Task 3: 既存テストの回帰確認

既存テストファイルが変更なしで全 PASS することを確認する。

```bash
# provider.test.ts の回帰確認
pnpm --filter @repo/shared test -- --run provider.test

# llm.test.ts の回帰確認
pnpm --filter @repo/desktop test -- --run llm.test
```

回帰テスト対象:

| テストファイル                                                     | 確認内容                                        |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | LLMProviderIdSchema の既存テストケースが全 PASS |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | llm ハンドラーの既存テストケースが全 PASS       |

### Task 4: modelPrefixes 競合テスト

prefix が他プロバイダーのモデルIDに誤マッチしないことを検証する。

```typescript
describe("modelPrefixes 競合検証", () => {
  it("各プロバイダーの modelPrefixes が他プロバイダーのモデルIDにマッチしない", () => {
    for (const provider of PROVIDER_CONFIGS) {
      for (const otherProvider of PROVIDER_CONFIGS) {
        if (provider.id === otherProvider.id) continue;

        for (const model of otherProvider.models) {
          for (const prefix of provider.modelPrefixes) {
            expect(model.id.startsWith(prefix)).toBe(false);
          }
        }
      }
    }
  });

  it("modelPrefixes 間に包含関係がない", () => {
    const allPrefixes = PROVIDER_CONFIGS.flatMap((p) =>
      p.modelPrefixes.map((prefix) => ({ providerId: p.id, prefix })),
    );
    for (const a of allPrefixes) {
      for (const b of allPrefixes) {
        if (a.providerId === b.providerId) continue;
        // prefix A が prefix B の先頭に一致しないこと
        expect(a.prefix.startsWith(b.prefix)).toBe(false);
      }
    }
  });
});
```

### Task 5: テスト実行（全体）

```bash
# provider-registry テスト（拡充分含む）
pnpm --filter @repo/shared test -- --run provider-registry

# shared パッケージ全体
pnpm --filter @repo/shared test -- --run

# desktop パッケージ（回帰確認）
pnpm --filter @repo/desktop test -- --run
```

---

## 参照資料

| 参照資料             | パス                                                               | 内容           |
| -------------------- | ------------------------------------------------------------------ | -------------- |
| Phase 4 テスト作成   | `phase-4-test-creation.md`                                         | 基本テスト仕様 |
| Phase 5 実装         | `phase-5-implementation.md`                                        | 実装内容       |
| 既存 provider テスト | `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | 回帰対象テスト |
| 既存 llm テスト      | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | 回帰対象テスト |

---

## 統合テスト連携

| 接続ポイント          | テスト内容                                               |
| --------------------- | -------------------------------------------------------- |
| provider.test.ts 回帰 | LLMProviderIdSchema の既存テストが SSoT 移行後も PASS    |
| llm.test.ts 回帰      | llm ハンドラーの既存テストが shared import 移行後も PASS |
| modelPrefixes 競合    | プロバイダー間で prefix の誤マッチが発生しないことを検証 |

---

## 成果物

| 成果物                   | パス                                                                        | 内容                         |
| ------------------------ | --------------------------------------------------------------------------- | ---------------------------- |
| テストファイル（拡充済） | `packages/shared/src/types/llm/schemas/__tests__/provider-registry.test.ts` | エッジケース・競合テスト追加 |
| 回帰テスト結果           | `outputs/phase-6/regression-result.md`                                      | 回帰テスト実行結果           |
| テスト拡充記録           | `outputs/phase-6/test-expansion-record.md`                                  | テスト拡充作業の記録         |

---

## 完了条件

- [ ] エッジケーステスト（空文字、空白、大文字小文字）が追加されている
- [ ] OpenRouter の "provider/model" 形式テストが追加されている
- [ ] 既存テスト `provider.test.ts` が全 PASS（回帰確認）
- [ ] 既存テスト `llm.test.ts` が全 PASS（回帰確認）
- [ ] modelPrefixes 競合テスト（prefix が他プロバイダーのモデルIDに誤マッチしない）が追加されている
- [ ] modelPrefixes 間の包含関係テストが追加されている
- [ ] 全テスト PASS
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 6
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 6 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- ***

## 次のPhase

Phase 7: カバレッジ確認

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-7-*.md`
