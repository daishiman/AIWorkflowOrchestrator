# Phase 2: 設計

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| Phase      | 2                 |
| Phase名    | 設計              |
| 前提Phase  | Phase 1           |
| 後続Phase  | Phase 3           |
| ステータス | 完了              |
| 作成日     | 2026-03-25        |
| 機能名     | UT-LLM-MOD-01-005 |

---

## 目的

PROVIDER_CONFIGS を SSoT として確立するための具体的なアーキテクチャ設計を行う。cross-package 依存関係を整理し、型安全な自動導出メカニズムを設計する。

## 背景

Phase 1 で特定された三重管理問題を解決するため、`packages/shared/` に Provider Registry を新設し、`LLMProviderIdSchema` と `inferProviderId` の両方を自動導出する設計が必要。

---

## 実行タスク

1. `provider-registry.ts` を正本に置く構成と import 方向を設計する。
2. `PROVIDER_CONFIGS` から `PROVIDER_IDS` と `inferProviderId` を導出する流れを図示する。
3. `provider.ts` / `index.ts` / `llm.ts` の変更責務を分離する。
4. システム仕様書と backlog に反映すべき対象を特定する。

## 設計方針

### A. アーキテクチャ概要

```
packages/shared/src/types/llm/schemas/
├── provider-registry.ts  [NEW] SSoT: PROVIDER_CONFIGS + modelPrefixes + inferProviderId
├── provider.ts           [MOD] LLMProviderIdSchema を provider-registry から導出
├── index.ts              [MOD] provider-registry から re-export 追加
├── health.ts             [NO CHANGE]
├── ipc.ts                [NO CHANGE]
├── request.ts            [NO CHANGE]
└── response.ts           [NO CHANGE]

apps/desktop/src/main/handlers/
└── llm.ts                [MOD] PROVIDER_CONFIGS と inferProviderId を shared から import
```

### B. データフロー

```
provider-registry.ts (SSoT)
    │
    ├── PROVIDER_CONFIGS (定義)
    │     │
    │     ├──→ PROVIDER_IDS (derived: map(p => p.id))
    │     │       │
    │     │       └──→ provider.ts: LLMProviderIdSchema = z.enum(PROVIDER_IDS)
    │     │                │
    │     │                └──→ LLMProviderId type (変更なし)
    │     │
    │     └──→ inferProviderId() (derived: modelPrefixes からマッチング)
    │
    └── re-export via index.ts
              │
              └──→ llm.ts: import { PROVIDER_CONFIGS, inferProviderId } from "@repo/shared/..."
```

---

## 詳細設計

### 1. provider-registry.ts（新規作成）

```typescript
/**
 * @file LLM Provider Registry - Single Source of Truth
 * @description 全プロバイダー/モデル情報の唯一の定義元。
 *   新プロバイダー追加時はこのファイルの PROVIDER_CONFIGS にエントリを追加するだけで、
 *   LLMProviderIdSchema と inferProviderId が自動的に追従する。
 */

/**
 * プロバイダー設定の型定義
 */
export interface ProviderConfigEntry {
  /** プロバイダーID（一意） */
  readonly id: string;
  /** 表示名 */
  readonly name: string;
  /**
   * モデルIDの prefix ルール。
   * inferProviderId で modelId.startsWith(prefix) として使用。
   * OpenRouter のように "/" 判定が必要な場合は空配列にし、
   * specialMatcher で対応する。
   */
  readonly modelPrefixes: readonly string[];
  /**
   * 特殊マッチャー関数（省略可）。
   * modelPrefixes では表現できないマッチングルールに使用。
   * 例: OpenRouter の modelId.includes("/") 判定。
   */
  readonly specialMatcher?: (modelId: string) => boolean;
  /** 利用可能なモデル一覧 */
  readonly models: readonly ProviderModelEntry[];
}

export interface ProviderModelEntry {
  readonly id: string;
  readonly name: string;
  readonly contextWindow: number;
  readonly isDefault: boolean;
  readonly description?: string;
}

/**
 * PROVIDER_CONFIGS - Single Source of Truth
 *
 * 新プロバイダー追加手順:
 * 1. この配列に新エントリを追加する
 * 2. 以上（LLMProviderIdSchema と inferProviderId は自動追従）
 */
export const PROVIDER_CONFIGS = [
  {
    id: "openai",
    name: "OpenAI",
    modelPrefixes: ["gpt-", "o3", "o4"],
    models: [
      {
        id: "gpt-5.4",
        name: "GPT-5.4",
        contextWindow: 1050000,
        isDefault: true,
        description: "...",
      },
      // ... 他のモデル
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    modelPrefixes: ["claude-"],
    models: [
      {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        contextWindow: 200000,
        isDefault: true,
        description: "...",
      },
      // ... 他のモデル
    ],
  },
  {
    id: "google",
    name: "Google",
    modelPrefixes: ["gemini-"],
    models: [
      /* ... */
    ],
  },
  {
    id: "xai",
    name: "xAI",
    modelPrefixes: ["grok-"],
    models: [
      /* ... */
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    modelPrefixes: [],
    specialMatcher: (modelId: string) => modelId.includes("/"),
    models: [
      /* ... */
    ],
  },
] as const satisfies readonly ProviderConfigEntry[];

/**
 * PROVIDER_CONFIGS から自動導出されるプロバイダーID tuple。
 * z.enum() に必要な [string, ...string[]] 形式。
 */
export const PROVIDER_IDS: [string, ...string[]] = PROVIDER_CONFIGS.map(
  (p) => p.id,
) as [string, ...string[]];

/**
 * PROVIDER_CONFIGS から自動導出されるプロバイダーID推定関数。
 * モデルIDからプロバイダーIDを推定する。
 *
 * マッチング優先順位:
 * 1. specialMatcher（定義されている場合）
 * 2. modelPrefixes による prefix マッチング
 *
 * @param modelId - モデルID（例: "gpt-5.4", "claude-sonnet-4-6"）
 * @returns 推定されたプロバイダーID、または null
 */
export function inferProviderId(modelId: string): LLMProviderId | null {
  for (const provider of PROVIDER_CONFIGS) {
    // specialMatcher が定義されている場合、先に評価
    if (provider.specialMatcher?.(modelId)) {
      return provider.id;
    }
    // modelPrefixes による prefix マッチング
    if (provider.modelPrefixes.some((prefix) => modelId.startsWith(prefix))) {
      return provider.id;
    }
  }
  return null;
}
```

### 2. provider.ts（変更）

```typescript
// Before:
export const LLMProviderIdSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
]);
export type LLMProviderId = z.infer<typeof LLMProviderIdSchema>;

// After:
import { PROVIDER_IDS } from "./provider-registry";

export const LLMProviderIdSchema = z.enum(PROVIDER_IDS);
export type LLMProviderId = z.infer<typeof LLMProviderIdSchema>;
```

### 3. index.ts（変更）

```typescript
// 既存 export に追加
export {
  PROVIDER_CONFIGS,
  PROVIDER_IDS,
  inferProviderId,
} from "./provider-registry";
export type {
  ProviderConfigEntry,
  ProviderModelEntry,
} from "./provider-registry";
```

### 4. llm.ts（変更）

```typescript
// Before:
import { LLMProviderIdSchema, type LLMProviderId, ... } from "@repo/shared/types/llm/schemas";

const PROVIDER_CONFIGS: Array<{ id: LLMProviderId; ... }> = [ ... ];

function inferProviderId(modelId: string): LLMProviderId | null {
  if (modelId.startsWith("gpt-") || ...) return "openai";
  // ... 手動ルール
}

// After:
import {
  LLMProviderIdSchema,
  PROVIDER_CONFIGS,
  inferProviderId,
  type LLMProviderId,
  ...
} from "@repo/shared/types/llm/schemas";

// PROVIDER_CONFIGS と inferProviderId は削除（shared から import）
```

---

## 設計判断

### DJ-001: PROVIDER_CONFIGS の配置先

| 選択肢                       | 説明                                         | 採否                    |
| ---------------------------- | -------------------------------------------- | ----------------------- |
| A: `packages/shared/` に配置 | SSoT として shared に集約。desktop が import | **採用**                |
| B: `apps/desktop/` に維持    | 既存構造を維持。shared は ID のみ            | 却下（SSoT にならない） |
| C: 両方に分散                | shared に ID、desktop にモデル詳細           | 却下（2箇所管理が残る） |

**理由**: `PROVIDER_CONFIGS` のモデル情報（id, name, contextWindow, isDefault, description）はセキュリティ上の問題がなく、shared に配置しても安全。desktop 固有のロジック（SecureStorage 参照等）は `llm.ts` に残す。

### DJ-002: inferProviderId のマッチング戦略

| 選択肢                               | 説明                                  | 採否                                                        |
| ------------------------------------ | ------------------------------------- | ----------------------------------------------------------- |
| A: modelPrefixes + specialMatcher    | 明示的な prefix リスト + 例外ルール   | **採用**                                                    |
| B: models 配列から prefix を自動抽出 | `models.map(m => m.id.split("-")[0])` | 却下（`o3`, `o4` のような短い prefix を正確に抽出できない） |
| C: 正規表現パターン                  | 各プロバイダーに regex を定義         | 却下（over-engineering）                                    |

**理由**: `modelPrefixes` を明示的に定義する方が、prefix の粒度を制御でき、`o3`/`o4` のような短い prefix も正確に扱える。OpenRouter の `"/"` 判定は `specialMatcher` で対応。

### DJ-003: z.enum() の型安全性

<!-- TODO(human): DJ-003の設計判断コードを実装してください。
  PROVIDER_CONFIGSからLLMProviderIdのリテラル型ユニオン（"openai" | "anthropic" | ...）を
  維持したまま z.enum() に渡す方法を設計してください。

  ヒント: TypeScript 5.0の const type parameter を活用する方法があります。
  考慮点:
  - inferProviderId の戻り値型も LLMProviderId | null を維持したい
  - unsafe cast (as unknown as) を最小化したい
  - z.enum() は [string, ...string[]] 形式の入力が必要
-->

---

## モジュール依存関係

```
packages/shared/
  provider-registry.ts  ──(defines)──→ PROVIDER_CONFIGS, PROVIDER_IDS, inferProviderId
       │
       ↓ import
  provider.ts           ──(derives)──→ LLMProviderIdSchema, LLMProviderId
       │
       ↓ import
  health.ts, ipc.ts, request.ts, response.ts
       │
       ↓ re-export via index.ts
apps/desktop/
  llm.ts                ──(imports)──→ PROVIDER_CONFIGS, inferProviderId, LLMProviderIdSchema
```

**循環依存チェック**: `provider-registry.ts` は `zod` を import しない。`provider.ts` が `provider-registry.ts` + `zod` を import。循環なし。

### 追加影響: LLMAdapterFactory.ts

`apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` の `SUPPORTED_PROVIDER_IDS: LLMProviderId[]` が手動列挙されている。SSoT化後は `PROVIDER_IDS` を直接 import する、または `PROVIDER_CONFIGS.map(p => p.id)` で導出する。

---

## 統合テスト連携

統合ポイント/契約の設計:

| 統合ポイント                               | 契約                                        | 検証方法                                  |
| ------------------------------------------ | ------------------------------------------- | ----------------------------------------- |
| `PROVIDER_CONFIGS` → `LLMProviderIdSchema` | PROVIDER_CONFIGS の全 id が Schema で valid | テスト: 全 id を safeParse                |
| `PROVIDER_CONFIGS` → `inferProviderId`     | 全モデルIDが正しいプロバイダーに解決        | テスト: 全モデルで inferProviderId を実行 |
| `LLMProviderIdSchema` → 既存 import 元     | export パス不変                             | 型チェック: pnpm typecheck                |

---

## 参照資料

| 参照資料         | パス                                                | 内容              |
| ---------------- | --------------------------------------------------- | ----------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                           | 要件・受入基準    |
| LLM Handlers     | `apps/desktop/src/main/handlers/llm.ts`             | 現行実装          |
| Provider Schema  | `packages/shared/src/types/llm/schemas/provider.ts` | 現行 Zod スキーマ |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                         | 内容                         |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| task-workflow-backlog | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` | UT-LLM-MOD-01-005 の登録状況 |

---

## 成果物

| 成果物 | パス                        | 内容           |
| ------ | --------------------------- | -------------- |
| 設計書 | `outputs/phase-2/design.md` | 本ドキュメント |

---

## 完了条件

- [ ] アーキテクチャ概要が図示されている
- [ ] データフロー（PROVIDER_CONFIGS → LLMProviderIdSchema, inferProviderId）が設計されている
- [ ] 新規ファイル `provider-registry.ts` の詳細設計が完了している
- [ ] 既存ファイル `provider.ts`, `llm.ts` の変更方針が確定している
- [ ] 設計判断 DJ-001〜DJ-003 が記録されている
- [ ] モジュール依存関係に循環がないことが確認されている
- [ ] 統合テスト連携の契約が定義されている
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 2
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 2 実行記録

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

Phase 3: 設計レビューゲート

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-3-*.md`
