# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 6                            |
| Phase名    | テスト拡充                   |
| 前提Phase  | Phase 5                      |
| 後続Phase  | Phase 7                      |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

Phase 4 で作成した TC-01〜TC-05 を基盤として、境界条件・fail path・回帰テストを拡充する。
TC-06〜TC-10 を追加することで LLM purpose 抽出の堅牢性を高め、
カバレッジ向上と未発見のバグ検出を実現する。

## 背景

Phase 5 実装完了時点で TC-01〜TC-05 は Green となっている。
しかし「LLM が空文字を返す」「エージェント定義ファイルが存在しない」等の境界条件は
TC-01〜TC-05 ではカバーされていない。
本 Phase ではこれらの境界条件・異常系・回帰テストを追加し、
テストカバレッジとコードの信頼性を向上させる。

---

## 実行タスク

### タスク1: Phase 4 テストの境界条件拡充方針の策定

**目的**: TC-06〜TC-10 の追加方針と、テストファイル内の配置場所を確定する。

**実行手順**:

1. `SkillCreatorService.purpose.test.ts` の現状構造を確認する
2. TC-06〜TC-10 の配置先 `describe` ブロックを設計する
3. 各テストケースの優先度（高/中/低）を評価する

**TC-06〜TC-10 の配置設計**:

```
describe("LLM-PURPOSE-WIRE-001: purpose 抽出 LLM 統合")
  ├─ （既存: TC-01〜TC-05）
  ├─ describe("境界条件: LLM 生成結果の端値")
  │    ├─ TC-06: LLM が空文字を返した場合の挙動
  │    └─ TC-07: LLM が非常に長い文字列を返した場合
  ├─ describe("fail path: リソース・クライアント異常")
  │    ├─ TC-08: extract-purpose エージェント定義ファイルが存在しない場合
  │    └─ TC-09: llmClient が undefined の場合
  └─ describe("回帰: 既存モードへの影響なし")
       └─ TC-10: 既存の collaborative モードへの回帰テスト
```

**優先度評価**:

| テストケース | 優先度 | 理由                                                              |
| ------------ | ------ | ----------------------------------------------------------------- |
| TC-06        | 高     | 空文字は `structurePlan.purpose` に影響し SKILL.md の品質に関わる |
| TC-07        | 中     | 長文は現状は格納するだけで問題なし、将来のバリデーション基盤      |
| TC-08        | 高     | ファイル不在はデプロイ環境で発生しうる実運用上のリスク            |
| TC-09        | 高     | `llmClient` 未設定でのフォールバック動作の確認（AC-4 関連）       |
| TC-10        | 高     | collaborative モード既存動作の回帰確認（AC-6 関連）               |

**期待される成果物**:

- TC-06〜TC-10 の配置設計と優先度評価

---

### タスク2: 追加テストケースの実装

**目的**: TC-06〜TC-10 を `SkillCreatorService.purpose.test.ts` に追加実装する。

---

#### TC-06: LLM が空文字を返した場合の挙動

**目的**: `generate` が空文字 `""` を返した場合の `structurePlan.purpose` の値を検証する。

**テスト設計**:

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| 前提条件 | `mockLlmClient.generate` が `""` を返す                       |
| 実行     | `runCreateWorkflow` を直接呼び出す                            |
| 検証     | `structurePlan.purpose` が `""` である（`trim()` 後も空文字） |
| 期待動作 | 空文字をそのまま格納する（フォールバックは行わない）          |

**検証コード設計**:

```typescript
it("TC-06: LLM が空文字を返した場合、purpose は空文字になる", async () => {
  mockLlmClient.generate.mockResolvedValue("");
  mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

  const structurePlan = await (
    service as unknown as {
      runCreateWorkflow: (opts: {
        name: string;
        description: string;
        mode: string;
      }) => Promise<{ purpose: string } | null>;
    }
  ).runCreateWorkflow({
    name: "test-skill",
    description: "テスト説明",
    mode: "create",
  });

  expect(structurePlan?.purpose).toBe("");
});
```

**境界条件の考察**:

- `trim()` を適用しても空文字のままであること
- `structurePlan.purpose` が `options.description` に自動フォールバックしないこと（明示的設計）
- 将来的にバリデーションを追加する場合の基準値として記録する

---

#### TC-07: LLM が非常に長い文字列を返した場合

**目的**: `generate` が極端に長い文字列を返した場合でも、エラーなく格納されることを検証する。

**テスト設計**:

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 前提条件 | `mockLlmClient.generate` が 10,000 文字の文字列を返す                    |
| 実行     | `runCreateWorkflow` を直接呼び出す                                       |
| 検証     | `structurePlan.purpose` が 10,000 文字の文字列と一致する（切り捨てなし） |
| 期待動作 | 長さ制限なしでそのまま格納される（バリデーションは本タスクスコープ外）   |

**検証コード設計**:

```typescript
it("TC-07: LLM が非常に長い文字列を返した場合、切り捨てなしで格納される", async () => {
  const longPurpose = "あ".repeat(10000);
  mockLlmClient.generate.mockResolvedValue(longPurpose);
  mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

  const structurePlan = await (
    service as unknown as {
      runCreateWorkflow: (opts: {
        name: string;
        description: string;
        mode: string;
      }) => Promise<{ purpose: string } | null>;
    }
  ).runCreateWorkflow({
    name: "test-skill",
    description: "テスト説明",
    mode: "create",
  });

  expect(structurePlan?.purpose).toHaveLength(10000);
});
```

---

#### TC-08: extract-purpose エージェント定義ファイルが存在しない場合

**目的**: `loadAgent("extract-purpose")` が ENOENT 等で失敗した場合、`createSkill` が継続することを検証する。

**テスト設計**:

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 前提条件 | `mockResourceLoader.loadAgent` が `new Error("ENOENT: no such file")` を throw する                |
| 実行     | `createSkill({ name: "test-skill", description: "...", mode: "create" })`                          |
| 検証     | `createSkill` が例外を throw せずスキルディレクトリパスを返す                                      |
| 期待動作 | `runCreateWorkflow` が `null` を返し、`ensureSkillMdExists` フォールバックで SKILL.md が生成される |

**検証コード設計**:

```typescript
it("TC-08: エージェント定義ファイルが存在しない場合、createSkill は継続して成功する", async () => {
  mockResourceLoader.loadAgent.mockRejectedValue(
    new Error("ENOENT: no such file or directory"),
  );

  await expect(
    service.createSkill({
      name: "test-skill",
      description: "テスト説明",
      mode: "create",
    }),
  ).resolves.toContain("test-skill");
});
```

---

#### TC-09: llmClient が undefined の場合

**目的**: `llmClient` を注入しないで `SkillCreatorService` を生成した場合、
`purpose` が `options.description` にフォールバックすることを検証する（AC-4 関連）。

**テスト設計**:

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 前提条件 | `llmClient` を注入せずに `new SkillCreatorService()` でインスタンス化する                      |
| 実行     | `runCreateWorkflow` を直接呼び出す                                                             |
| 検証     | `structurePlan.purpose` が `options.description` と一致する                                    |
| 期待動作 | `extractPurposeWithLlm` が `undefined` を返し、`?? options.description` でフォールバックされる |

**検証コード設計**:

```typescript
it("TC-09: llmClient が undefined の場合、purpose は options.description にフォールバックする", async () => {
  const serviceWithoutLlm = new SkillCreatorService();
  const description = "フォールバック用の説明文";

  const structurePlan = await (
    serviceWithoutLlm as unknown as {
      runCreateWorkflow: (opts: {
        name: string;
        description: string;
        mode: string;
      }) => Promise<{ purpose: string } | null>;
    }
  ).runCreateWorkflow({
    name: "test-skill",
    description,
    mode: "create",
  });

  expect(structurePlan?.purpose).toBe(description);
});
```

---

#### TC-10: 既存の collaborative モードへの回帰テスト

**目的**: AC-6 の検証。`llmClient` 追加後も `collaborative` モードの既存動作が変わらないことを検証する。

**テスト設計**:

| 項目     | 内容                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `llmClient` を注入した `SkillCreatorService` で `collaborative` モードを実行する                                      |
| 実行     | `createSkill({ name: "collab-skill", mode: "collaborative", interviewResult: { purpose: "...", features: ["f1"] } })` |
| 検証     | `createSkill` が正常に完了する（`mockLlmClient.generate` は呼び出されない）                                           |
| 期待動作 | `collaborative` モードでは `runCreateWorkflow` が呼ばれず、`llmClient.generate` は未呼び出し                          |

**検証コード設計**:

```typescript
it("TC-10: collaborative モードでは llmClient.generate が呼び出されない", async () => {
  await service.createSkill({
    name: "collab-skill",
    description: "コラボスキル",
    mode: "collaborative",
    interviewResult: {
      purpose: "コラボ目的",
      features: ["feature-1"],
    },
  });

  expect(mockLlmClient.generate).not.toHaveBeenCalled();
});
```

---

### タスク3: fail path テストの追加

**目的**: TC-04・TC-08 で設計した fail path に加え、追加の fail path シナリオをカバーする。

**実行手順**:

1. `extractPurposeWithLlm` が throw した場合のフローを確認する
2. `generate` が `AbortError` を throw した場合の rethrow を検証するテストを検討する
3. 追加 fail path テストの必要性を評価し、必要であれば実装する

**追加 fail path テスト評価**:

| テスト内容                                           | 評価       | 理由                                                          |
| ---------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `generate` が AbortError を throw した場合の rethrow | 実装推奨   | AbortSignal 伝播の正確性を保証するため                        |
| `generate` がタイムアウトした場合の動作              | スコープ外 | タイムアウト制御は `llmClient` 実装に委譲（本タスクの範囲外） |
| `generate` が非常に遅い場合（非同期テスト）          | スコープ外 | パフォーマンステストは別タスクで対応                          |

**AbortError rethrow テスト設計**（追加推奨）:

```typescript
it("TC-FA-01: generate が AbortError を throw した場合、createSkill から rethrow される", async () => {
  const abortController = new AbortController();
  const abortError = new DOMException("Aborted", "AbortError");
  mockLlmClient.generate.mockRejectedValue(abortError);
  mockResourceLoader.loadAgent.mockResolvedValue("agent-def");

  abortController.abort();

  await expect(
    service.createSkill({
      name: "test-skill",
      description: "テスト",
      mode: "create",
    }),
  ).rejects.toMatchObject({ name: "AbortError" });
});
```

**期待される成果物**:

- fail path テスト評価結果
- 追加 fail path テスト実装（TC-FA-01）

---

### タスク4: 統合テストの拡充

**目的**: Phase 4 で定義した境界系統合シナリオ（IT-B-01〜IT-B-05）を TC-06〜TC-10 でカバーし、
全カテゴリのカバレッジを向上させる。

**実行手順**:

1. IT-B-01〜IT-B-05 と TC-06〜TC-10 の対応を確認する
2. 各テストケースが意図した統合シナリオをカバーしていることを検証する
3. カバレッジ計測コマンドを確認する（`pnpm --filter @repo/desktop test --coverage`）
4. purpose 抽出パスの line coverage・branch coverage 目標を確認する

**境界系統合シナリオと TC の対応確認**:

| 統合シナリオ | テストケース | 検証内容                                            |
| ------------ | ------------ | --------------------------------------------------- |
| IT-B-01      | TC-06        | `generate` が空文字を返す場合の `purpose` 格納      |
| IT-B-02      | TC-07        | `generate` が長文を返す場合の切り捨てなし格納       |
| IT-B-03      | TC-08        | エージェントファイル不在での `createSkill` 継続     |
| IT-B-04      | TC-09        | `llmClient` 未設定での `description` フォールバック |
| IT-B-05      | TC-10        | `collaborative` モードで `generate` 非呼び出し      |

**カバレッジ目標**:

| 指標              | Phase 4 完了時 | Phase 6 目標 |
| ----------------- | -------------- | ------------ |
| Line Coverage     | 約 70%         | 85% 以上     |
| Branch Coverage   | 約 50%         | 70% 以上     |
| Function Coverage | 約 80%         | 90% 以上     |

**期待される成果物**:

- 境界系統合シナリオと TC の対応確認結果
- カバレッジ計測結果（目標達成/未達）

---

## 参照資料

| 参照資料               | パス                                                                               | 内容                                    |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 4 テスト設計書   | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-4-test-creation.md            | TC-01〜TC-05・統合シナリオ定義          |
| Phase 5 実装書         | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-5-implementation.md           | `extractPurposeWithLlm` 実装仕様        |
| purpose テストファイル | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.purpose.test.ts | TC-01〜TC-05 実装済み（Phase 4 成果物） |
| SkillCreatorService    | apps/desktop/src/main/services/skill/SkillCreatorService.ts                        | Phase 5 修正済み実装                    |

---

## 成果物

| 成果物                           | パス                                                                               | 内容                                         |
| -------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| purpose テストファイル（拡充後） | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.purpose.test.ts | TC-01〜TC-10 + TC-FA-01（fail path）実装済み |
| Phase 6 テスト拡充書（本書）     | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-6-test-expansion.md           | 境界条件・fail path・回帰テスト設計          |

---

## 統合テスト連携

**Phase 6 アクション**: 統合テストの拡充（全カテゴリのカバレッジ向上）。

- IT-B-01〜IT-B-05（境界系統合シナリオ）を TC-06〜TC-10 でカバーする
- fail path テスト（TC-FA-01: AbortError rethrow）を追加し、異常系の網羅性を高める
- `pnpm --filter @repo/desktop test --coverage` で purpose 抽出パスのカバレッジを計測し、目標値を確認する
- Phase 7（カバレッジ確認）への引き渡し基盤として、全テスト Green 状態を確保する

---

## 完了条件

- [ ] TC-06（空文字返却）が `SkillCreatorService.purpose.test.ts` に追加・実装されている
- [ ] TC-07（長文返却）が `SkillCreatorService.purpose.test.ts` に追加・実装されている
- [ ] TC-08（エージェントファイル不在）が `SkillCreatorService.purpose.test.ts` に追加・実装されている
- [ ] TC-09（`llmClient` undefined）が `SkillCreatorService.purpose.test.ts` に追加・実装されている
- [ ] TC-10（collaborative モード回帰）が `SkillCreatorService.purpose.test.ts` に追加・実装されている
- [ ] TC-FA-01（AbortError rethrow）の追加実装判断が完了している
- [ ] IT-B-01〜IT-B-05 と TC-06〜TC-10 の対応が確認されている
- [ ] カバレッジ計測が実施され、目標値（Line: 85%・Branch: 70%・Function: 90%）の達成状況が確認されている
- [ ] TC-01〜TC-10 の全テストが Green を維持している
- [ ] 既存テスト（`SkillCreatorService.test.ts`・`SkillCreatorService.struct-001.test.ts` 等）が全て Green のまま
