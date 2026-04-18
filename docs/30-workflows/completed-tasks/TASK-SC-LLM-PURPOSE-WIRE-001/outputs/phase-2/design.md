# Phase 2 成果物: 設計書

## LLM 呼び出し方式の決定

**採用方式**: 案 A（直接呼び出し: `llmClient.generate`）

理由: テスト容易性・コード量の少なさ・既存パターンとの整合性。

## `LlmClient` インターフェース定義

```typescript
interface LlmGenerateOptions {
  system: string;
  user: string;
}

interface LlmClient {
  generate(options: LlmGenerateOptions): Promise<string>;
}
```

## purpose 抽出フロー

```
runCreateWorkflow(options, signal)
  │
  └─ extractPurposeWithLlm(options, signal)
       ├─ llmClient が undefined → null を返す（フォールバック）
       ├─ loadAgent("extract-purpose", { signal })
       │    └─ purposeAgentDef: string
       ├─ skillInput = `スキル名: ${options.name}\n説明: ${options.description}`
       ├─ llmClient.generate({ system: purposeAgentDef, user: skillInput })
       │    └─ purpose: string
       └─ purpose.trim() を返す

structurePlan.purpose = purpose ?? options.description
```

## コンストラクタ変更設計

```typescript
// 変更前
constructor(skillsDir?: string, workflowsDir?: string)

// 変更後（後方互換）
constructor(
  skillsDir?: string,
  workflowsDir?: string,
  llmClient?: LlmClient,
)
```

既存テストは引数なしで `new SkillCreatorService()` を呼び出しており、変更不要。

## エラーハンドリング設計

| エラーケース             | 処理方針                                             |
| ------------------------ | ---------------------------------------------------- |
| `loadAgent` 失敗         | `extractPurposeWithLlm` の catch で捕捉 → null 返却  |
| `generate` 失敗          | `extractPurposeWithLlm` の catch で捕捉 → null 返却  |
| LLM が空文字を返す       | `"".trim()` で空文字のまま格納（フォールバックなし） |
| `llmClient` が undefined | null 返却 → `options.description` にフォールバック   |
| AbortError               | rethrow（既存パターン踏襲）                          |

## extract-purpose エージェント期待出力フォーマット（AC-5）

| 項目         | 仕様                                    |
| ------------ | --------------------------------------- |
| 型           | `string`（プレーンテキスト）            |
| 長さ         | 10〜200 文字                            |
| 形式         | 1〜2 文の自然言語文（日本語または英語） |
| JSON 形式    | 不要（文字列直接返却）                  |
| 先頭末尾空白 | `trim()` により除去して格納             |

## `skillInput` 構築仕様

```
`スキル名: ${options.name}\n説明: ${options.description}`
```

## 統合ポイント定義

| 統合ポイント                   | 提供元              | 消費元                  | 契約                                          |
| ------------------------------ | ------------------- | ----------------------- | --------------------------------------------- |
| `loadAgent("extract-purpose")` | `ResourceLoader`    | `extractPurposeWithLlm` | `Promise<string>`: エージェント定義 MD 文字列 |
| `llmClient.generate`           | `LlmClient` 実装    | `extractPurposeWithLlm` | `Promise<string>`: purpose 文字列             |
| `structurePlan.purpose`        | `runCreateWorkflow` | `generateSkillMd`       | `string`: LLM 生成の purpose 文字列           |
