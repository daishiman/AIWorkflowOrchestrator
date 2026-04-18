# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 5                            |
| Phase名    | 実装                         |
| 前提Phase  | Phase 4                      |
| 後続Phase  | Phase 6                      |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

Phase 4 で作成した Red テストを Green にするため、`SkillCreatorService.ts` に
`extract-purpose` エージェントを用いた LLM purpose 抽出の実装を追加する。
Phase 2 設計書の方針に従い、既存パターンとの整合性を維持しながら最小限の変更で実装する。

## 背景

現状の `runCreateWorkflow` では `structurePlan.purpose` に `options.description` が直接代入されている。
本 Phase では `LlmClient` インターフェースの追加・コンストラクタ注入・`extractPurposeWithLlm` メソッドの実装を行い、
AC-1〜AC-4 を充足する。

---

## 実行タスク

### タスク1: 実装対象ファイル一覧の確認

**目的**: 変更・新規作成するファイルの範囲を確定し、実装漏れを防ぐ。

**実行手順**:

1. 変更対象ファイルと新規作成ファイルをリストアップする
2. 各ファイルの変更内容の概要を確認する
3. 変更範囲外のファイルに影響がないことを確認する

**実装対象ファイル一覧**:

| 種別     | ファイルパス                                                                         | 変更内容概要                                                                                       |
| -------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 修正     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                        | `LlmClient` 型定義追加・コンストラクタ変更・`extractPurposeWithLlm` 追加・`runCreateWorkflow` 修正 |
| 新規作成 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` | Phase 4 で設計した TC-01〜TC-05 のテスト実装                                                       |

**変更範囲外（変更しない）**:

| ファイルパス                                             | 理由                                               |
| -------------------------------------------------------- | -------------------------------------------------- |
| `apps/desktop/src/main/services/skill/ResourceLoader.ts` | `loadAgent` メソッドは既存実装をそのまま使用       |
| `.claude/skills/skill-creator/agents/extract-purpose.md` | エージェント定義ファイルは変更しない               |
| `packages/shared/types/index.ts` 等の共有型定義          | `LlmClient` 型は `SkillCreatorService.ts` 内に定義 |

**期待される成果物**:

- 実装対象ファイル一覧の確認

---

### タスク2: `SkillCreatorService.ts` への `LlmClient` 型定義追加

**目的**: Phase 2 で設計した `LlmClient` インターフェースをファイル内に定義する。

**実行手順**:

1. `SkillCreatorService.ts` の既存 `import` 宣言と型定義セクションを確認する
2. `StructurePlanJson` インターフェース定義の直前に `LlmClient` を追加する
3. `LlmGenerateOptions` 型も同時に定義する

**追加コード**:

```typescript
/**
 * LLM クライアントの generate メソッド引数型
 * TASK-SC-LLM-PURPOSE-WIRE-001: purpose 抽出 LLM 統合
 */
interface LlmGenerateOptions {
  system: string;
  user: string;
}

/**
 * LLM クライアントのインターフェース
 * TASK-SC-LLM-PURPOSE-WIRE-001: purpose 抽出 LLM 統合
 */
interface LlmClient {
  generate(options: LlmGenerateOptions): Promise<string>;
}
```

**配置場所**: `SkillCreatorService.ts` の `StructurePlanJson` インターフェース定義の直前（約 36 行目）

**期待される成果物**:

- `LlmGenerateOptions` インターフェース定義
- `LlmClient` インターフェース定義

---

### タスク3: コンストラクタへの `llmClient` オプショナル引数追加

**目的**: `LlmClient` をコンストラクタ注入でテスト時にモック差し替え可能にする。

**実行手順**:

1. `SkillCreatorService` クラスのフィールド宣言セクションを確認する
2. `private readonly llmClient?: LlmClient` フィールドを追加する
3. コンストラクタ引数に `llmClient?: LlmClient` を追加する（後方互換: オプショナル）
4. コンストラクタ本体で `this.llmClient = llmClient` を設定する

**変更内容**:

```typescript
// フィールド宣言に追加
private readonly llmClient?: LlmClient;

// コンストラクタ変更前
constructor(skillsDir?: string, workflowsDir?: string)

// コンストラクタ変更後
constructor(
  skillsDir?: string,
  workflowsDir?: string,
  llmClient?: LlmClient,
)

// コンストラクタ本体に追加
this.llmClient = llmClient;
```

**後方互換確認**:

- 既存の `new SkillCreatorService()` は引数なしで動作し続ける
- `llmClient` が `undefined` の場合、purpose 抽出をスキップして `options.description` を使用する

**期待される成果物**:

- `llmClient` フィールド追加
- コンストラクタ引数・本体の変更

---

### タスク4: `extractPurposeWithLlm` プライベートメソッドの実装

**目的**: purpose 抽出ロジックを独立したメソッドに切り出し、SRP を遵守する。

**実行手順**:

1. `runCollaborativeWorkflow` の直後に `extractPurposeWithLlm` メソッドを追加する
2. Phase 2 設計のフローに従い、`loadAgent` → `generate` → `trim()` → 返却を実装する
3. `signal` の伝播を実装する（`loadAgent` に `{ signal }` を渡す）
4. `llmClient` が未設定の場合は `undefined` を返す

**実装コード**:

```typescript
/**
 * extract-purpose エージェントを使って LLM から purpose 文字列を生成する
 * TASK-SC-LLM-PURPOSE-WIRE-001
 *
 * @param options - スキル作成オプション（name, description を使用）
 * @param signal - キャンセル用 AbortSignal
 * @returns LLM が生成した purpose 文字列、または undefined（llmClient 未設定時）
 */
private async extractPurposeWithLlm(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<string | undefined> {
  if (!this.llmClient) {
    return undefined;
  }

  this.throwIfAborted(signal);
  const purposeAgentDef = await this.resourceLoader.loadAgent(
    "extract-purpose",
    { signal },
  );

  this.throwIfAborted(signal);
  const skillInput = `スキル名: ${options.name}\n説明: ${options.description}`;
  const purpose = await this.llmClient.generate({
    system: purposeAgentDef,
    user: skillInput,
  });

  return purpose.trim();
}
```

**期待される成果物**:

- `extractPurposeWithLlm` メソッドの実装

---

### タスク5: `runCreateWorkflow` の purpose 処理箇所の修正

**目的**: `structurePlan.purpose` を `options.description` の直接代入から LLM 生成結果に差し替える。

**実行手順**:

1. `runCreateWorkflow` 内の `purpose: options.description` の行を特定する（約 872 行目）
2. `extractPurposeWithLlm` 呼び出しで purpose を取得する処理に変更する
3. `undefined` の場合は `options.description` にフォールバックする
4. 変更後の全体フローが Phase 2 設計と一致することを確認する

**変更前**:

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: options.description, // AC-1: LLM統合は別タスク、現時点は description を使用
  features: [],
  agents: ["extract-purpose", "plan-structure"],
};
return structurePlan;
```

**変更後**:

```typescript
const purpose =
  (await this.extractPurposeWithLlm(options, _signal)) ?? options.description;

const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose, // TASK-SC-LLM-PURPOSE-WIRE-001: LLM 生成結果（未設定時は description にフォールバック）
  features: [],
  agents: ["extract-purpose", "plan-structure"],
};
return structurePlan;
```

**注意事項**:

- `_signal` パラメータを `signal` に変更する（`extractPurposeWithLlm` に渡すため）
- 既存の `catch` ブロック（`return null`）はそのまま維持する

**期待される成果物**:

- `runCreateWorkflow` の purpose 処理変更

---

### タスク6: 実装時の注意事項

**目的**: 実装時に発生しやすい問題を事前に整理し、品質を確保する。

**注意事項一覧**:

| 項目                     | 内容                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `_signal` パラメータ変更 | `runCreateWorkflow` の第 2 引数 `_signal` を `signal` に変更し、`extractPurposeWithLlm` に渡す                                                    |
| AbortError 伝播          | `extractPurposeWithLlm` 内の `throwIfAborted` が `AbortError` を throw し、`runCreateWorkflow` の `catch` で `isAbortError` により rethrow される |
| 型安全性                 | `llmClient` フィールドは `LlmClient                                                                                                               | undefined` 型（`private readonly llmClient?: LlmClient`）で宣言する |
| `any` 型の禁止           | `LlmGenerateOptions` インターフェースを定義し、`generate` の引数・戻り値を厳密に型付けする                                                        |
| `trim()` の適用          | LLM 生成結果の先頭末尾空白を必ず `trim()` で除去してから `purpose` に格納する                                                                     |
| コメントの更新           | `runCreateWorkflow` のコメント内の「LLM統合は別タスク」という注記を削除・更新する                                                                 |

**実装チェックリスト**:

- [ ] `LlmGenerateOptions` インターフェースが定義されている
- [ ] `LlmClient` インターフェースが定義されている
- [ ] `private readonly llmClient?: LlmClient` フィールドが追加されている
- [ ] コンストラクタの第 3 引数に `llmClient?: LlmClient` が追加されている
- [ ] `extractPurposeWithLlm` メソッドが実装されている
- [ ] `signal` が `extractPurposeWithLlm` に正しく伝播されている
- [ ] `runCreateWorkflow` の `purpose` が LLM 生成結果（または `description` フォールバック）を使用している
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm --filter @repo/desktop test` で TC-01〜TC-05 が Green になる
- [ ] 既存テスト（`SkillCreatorService.struct-001.test.ts` 等）が全て Green のまま

---

### タスク7: 統合テスト連携 — フロント/バック接続の実装とテスト支援コード整備

**目的**: Phase 4 で設計した統合テストシナリオを Phase 5 の実装で全て通過できる状態にする。

**実行手順**:

1. `SkillCreatorService.purpose.test.ts` が Phase 4 設計通りに実装されているか確認する
2. IT-N-01〜IT-N-02（正常系）が TC-01〜TC-03 でカバーされることを確認する
3. IT-E-01〜IT-E-03（異常系）が TC-04 でカバーされることを確認する
4. テスト支援コード（`beforeEach` でのモック初期化）が正しく実装されているか確認する

**統合テストシナリオと実装の対応確認**:

| 統合シナリオ | 対応テストケース | 実装確認ポイント                                          |
| ------------ | ---------------- | --------------------------------------------------------- |
| IT-N-01      | TC-01, TC-02     | `loadAgent` → `generate` の呼び出し連鎖が実装されている   |
| IT-N-02      | TC-03            | `trim()` 後の値が `purpose` に格納されている              |
| IT-E-01      | TC-04            | `generate` 失敗時に `runCreateWorkflow` が `null` を返す  |
| IT-E-02      | TC-04            | `loadAgent` 失敗時に `runCreateWorkflow` が `null` を返す |
| IT-E-03      | TC-05（一部）    | AbortError が rethrow される                              |

**期待される成果物**:

- 統合テストシナリオと実装の対応確認結果

---

## 参照資料

| 参照資料                     | パス                                                                    | 内容                          |
| ---------------------------- | ----------------------------------------------------------------------- | ----------------------------- |
| Phase 2 設計書               | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-2-design.md        | LLM 呼び出し設計・フロー      |
| Phase 4 テスト設計書         | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-4-test-creation.md | TC-01〜TC-05 の検証コード設計 |
| SkillCreatorService          | apps/desktop/src/main/services/skill/SkillCreatorService.ts             | 実装対象                      |
| extract-purpose エージェント | .claude/skills/skill-creator/agents/extract-purpose.md                  | system prompt 内容            |

---

## 成果物

| 成果物                         | パス                                                                               | 内容                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| SkillCreatorService.ts（修正） | apps/desktop/src/main/services/skill/SkillCreatorService.ts                        | `LlmClient` 追加・`extractPurposeWithLlm` 実装・`runCreateWorkflow` 修正 |
| purpose テストファイル（新規） | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.purpose.test.ts | TC-01〜TC-05 実装済み                                                    |

---

## 統合テスト連携

**Phase 5 アクション**: フロント/バック接続の実装とテスト支援コード整備。

- `extractPurposeWithLlm` の実装が `loadAgent` → `generate` → `structurePlan.purpose` の統合フローを完成させる
- `SkillCreatorService.purpose.test.ts` の TC-01〜TC-05 が全て Green になることで統合テストが成立する
- IT-N-01〜IT-E-03 の統合シナリオが TC-01〜TC-05 によりカバーされることを確認する
- Phase 6 のテスト拡充（TC-06〜TC-10）に向け、境界系シナリオのテスト基盤が整備された状態にする

---

## 完了条件

- [ ] `LlmGenerateOptions` および `LlmClient` インターフェースが `SkillCreatorService.ts` に追加されている
- [ ] `private readonly llmClient?: LlmClient` フィールドが追加されている
- [ ] コンストラクタ第 3 引数に `llmClient?: LlmClient` が追加されている（後方互換）
- [ ] `extractPurposeWithLlm` プライベートメソッドが実装されている
- [ ] `runCreateWorkflow` の `purpose` が LLM 生成結果を使用するよう修正されている
- [ ] `SkillCreatorService.purpose.test.ts` の TC-01〜TC-05 が全て Green である
- [ ] 既存テスト（`SkillCreatorService.test.ts`・`SkillCreatorService.struct-001.test.ts` 等）が全て Green のまま
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
