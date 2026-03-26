# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 4                      |
| Phase名    | テスト作成（TDD: Red） |
| 前提Phase  | Phase 3                |
| 後続Phase  | Phase 5                |
| ステータス | 完了                   |
| 作成日     | 2026-03-25             |
| 機能名     | UT-LLM-MOD-01-005      |

---

## 目的

Phase 2 で設計した provider-registry.ts の SSoT メカニズムに対して、TDD の Red フェーズとしてテストを先行作成する。実装前にテストを書くことで、期待する振る舞いを明確にし、実装の正確性を保証する。

---

## 背景

Phase 3 の設計レビューを通過した設計に基づき、TDD の Red フェーズとしてテストを先行作成する。テストは provider-registry.ts の実装前に書き、全テストが FAIL することを確認する（Red 状態）。

---

## 実行タスク

1. `provider-registry.test.ts` を新規作成し、SSoT 検証の Red テストを先行作成する。
2. `PROVIDER_IDS` / `LLMProviderIdSchema` / `inferProviderId` の連動テストを追加する。
3. 新規プロバイダー追加シミュレーションで 1 箇所更新だけで済むことを検証する。

### Task 1: テストファイルの新規作成

テスト配置先: `packages/shared/src/types/llm/schemas/__tests__/provider-registry.test.ts`

### Task 2: SSoT 検証テスト

PROVIDER_CONFIGS の全プロバイダーIDが LLMProviderIdSchema で valid であることを検証する。

```typescript
describe("SSoT 検証: PROVIDER_CONFIGS → LLMProviderIdSchema", () => {
  it("PROVIDER_CONFIGS の全 id が LLMProviderIdSchema で valid", () => {
    for (const provider of PROVIDER_CONFIGS) {
      const result = LLMProviderIdSchema.safeParse(provider.id);
      expect(result.success).toBe(true);
    }
  });

  it("LLMProviderIdSchema の全 enum 値が PROVIDER_CONFIGS に存在する", () => {
    const configIds = PROVIDER_CONFIGS.map((p) => p.id);
    for (const enumValue of LLMProviderIdSchema.options) {
      expect(configIds).toContain(enumValue);
    }
  });

  it("PROVIDER_IDS と PROVIDER_CONFIGS の id が完全一致する", () => {
    const configIds = PROVIDER_CONFIGS.map((p) => p.id);
    expect(PROVIDER_IDS).toEqual(configIds);
  });
});
```

### Task 3: inferProviderId テスト

PROVIDER_CONFIGS の全モデルに対して inferProviderId が正しいプロバイダーIDを返すことを検証する。

```typescript
describe("inferProviderId", () => {
  it("PROVIDER_CONFIGS の全モデルが正しいプロバイダーに解決される", () => {
    for (const provider of PROVIDER_CONFIGS) {
      for (const model of provider.models) {
        const result = inferProviderId(model.id);
        expect(result).toBe(provider.id);
      }
    }
  });

  it("OpenRouter のスラッシュ形式モデルIDが 'openrouter' に解決される", () => {
    expect(inferProviderId("anthropic/claude-sonnet-4-6")).toBe("openrouter");
    expect(inferProviderId("openai/gpt-5.4")).toBe("openrouter");
  });

  it("既知の prefix パターンが正しく解決される", () => {
    expect(inferProviderId("gpt-5.4")).toBe("openai");
    expect(inferProviderId("o3-mini")).toBe("openai");
    expect(inferProviderId("o4-mini")).toBe("openai");
    expect(inferProviderId("claude-sonnet-4-6")).toBe("anthropic");
    expect(inferProviderId("gemini-2.5-pro")).toBe("google");
    expect(inferProviderId("grok-3")).toBe("xai");
  });

  it("未知のモデルIDに対して null を返す", () => {
    expect(inferProviderId("unknown-model")).toBeNull();
    expect(inferProviderId("mistral-large")).toBeNull();
  });
});
```

### Task 4: 新プロバイダー追加テスト（SSoT 自動追従検証）

PROVIDER_CONFIGS にダミープロバイダーを追加した場合に、LLMProviderIdSchema と inferProviderId が自動追従することをテスト設計として記述する。

```typescript
describe("SSoT 自動追従検証", () => {
  it("PROVIDER_CONFIGS の id 数と PROVIDER_IDS の要素数が一致する", () => {
    expect(PROVIDER_IDS.length).toBe(PROVIDER_CONFIGS.length);
  });

  it("PROVIDER_CONFIGS の id に重複がない", () => {
    const ids = PROVIDER_CONFIGS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("全プロバイダーが modelPrefixes または specialMatcher を持つ", () => {
    for (const provider of PROVIDER_CONFIGS) {
      const hasPrefixes = provider.modelPrefixes.length > 0;
      const hasMatcher = typeof provider.specialMatcher === "function";
      expect(hasPrefixes || hasMatcher).toBe(true);
    }
  });
});
```

### Task 5: テスト実行（Red 確認）

テストコマンド:

```bash
pnpm --filter @repo/shared test -- --run provider-registry
```

この時点では実装が存在しないため、全テストが FAIL（Red）することを確認する。

---

## 参照資料

| 参照資料         | パス                                                               | 内容                    |
| ---------------- | ------------------------------------------------------------------ | ----------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                                          | 受入基準 AC-001〜AC-006 |
| Phase 2 設計     | `phase-2-design.md`                                                | provider-registry 設計  |
| Phase 3 レビュー | `phase-3-design-review.md`                                         | レビュー判定結果        |
| 既存テスト       | `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | 既存 provider テスト    |

---

## 統合テスト連携

| 接続ポイント                               | テスト内容                                 |
| ------------------------------------------ | ------------------------------------------ |
| `PROVIDER_CONFIGS` → `LLMProviderIdSchema` | 全 id が safeParse で valid                |
| `PROVIDER_CONFIGS` → `inferProviderId`     | 全モデルが正しいプロバイダーに解決         |
| `PROVIDER_IDS` の整合性                    | PROVIDER_CONFIGS.map(p => p.id) と完全一致 |

---

## 成果物

| 成果物         | パス                                                                        | 内容               |
| -------------- | --------------------------------------------------------------------------- | ------------------ |
| テストファイル | `packages/shared/src/types/llm/schemas/__tests__/provider-registry.test.ts` | SSoT 検証テスト    |
| テスト実行結果 | `outputs/phase-4/test-red-result.md`                                        | Red フェーズの結果 |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run provider-registry
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] provider-registry.ts のスタブ（空の export のみ）を作成してコンパイルエラーを回避
- [ ] ロジック的な FAIL（実装がないため）を確認

---

## 完了条件

- [ ] テストファイル `provider-registry.test.ts` が作成されている
- [ ] SSoT 検証テスト（PROVIDER_CONFIGS の全 id が LLMProviderIdSchema で valid）が記述されている
- [ ] inferProviderId テスト（PROVIDER_CONFIGS の全モデルで正しいプロバイダーに解決）が記述されている
- [ ] 新プロバイダー追加テスト（SSoT 自動追従検証）が記述されている
- [ ] テストコマンド `pnpm --filter @repo/shared test -- --run provider-registry` で実行可能
- [ ] 実装前のため全テストが FAIL（Red）であることを確認
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 4
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 4 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- （記入欄）

---

## 次のPhase

Phase 5: 実装

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-5-*.md`
