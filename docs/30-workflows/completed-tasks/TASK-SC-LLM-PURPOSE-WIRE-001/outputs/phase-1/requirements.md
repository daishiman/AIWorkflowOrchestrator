# Phase 1 成果物: 要件定義

## 現状コード確認

### `runCreateWorkflow` の purpose 処理フロー（現状）

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
  _signal?: AbortSignal,
): Promise<StructurePlanJson | null> {
  try {
    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: options.description, // ← LLM未使用、description を直接代入
      features: [],
      agents: ["extract-purpose", "plan-structure"],
    };
    return structurePlan;
  } catch {
    return null;
  }
}
```

- `loadAgent("extract-purpose")` の呼び出しは **現状存在しない**
- `llmClient` フィールドは **未定義**
- `structurePlan.purpose` には `options.description` が直接代入されている

### 変更が必要な箇所

| ファイル                 | 変更箇所                       | 内容                                                   |
| ------------------------ | ------------------------------ | ------------------------------------------------------ |
| `SkillCreatorService.ts` | 型定義セクション（36行目前後） | `LlmGenerateOptions`, `LlmClient` インターフェース追加 |
| `SkillCreatorService.ts` | フィールド定義                 | `private readonly llmClient?: LlmClient` 追加          |
| `SkillCreatorService.ts` | コンストラクタ                 | `llmClient?: LlmClient` 引数追加                       |
| `SkillCreatorService.ts` | `runCreateWorkflow`            | `extractPurposeWithLlm` 呼び出しに変更                 |
| `SkillCreatorService.ts` | 新規メソッド                   | `extractPurposeWithLlm` 追加                           |

## extract-purpose エージェント仕様サマリー

| 項目                                 | 内容                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| 入力                                 | スキル名 + 説明文の自然言語テキスト                           |
| 出力                                 | `{ skillName, summary, goals }` JSON（または summary 文字列） |
| `structurePlan.purpose` に格納する値 | `summary` フィールド相当（1-2文、10-200文字）                 |

## 受入条件詳細

| ID   | 条件                                                                        | 検証方法                       |
| ---- | --------------------------------------------------------------------------- | ------------------------------ |
| AC-1 | `loadAgent("extract-purpose")` の戻り値が `generate` の `system` に渡される | ユニットテストのモック引数検証 |
| AC-2 | `llmClient.generate({ system, user })` 呼び出しが実装される                 | ユニットテストのモック引数検証 |
| AC-3 | `structurePlan.purpose` に LLM 生成結果が格納される                         | ユニットテストの戻り値検証     |
| AC-4 | 既存 LLM 呼び出しパターンと整合（コンストラクタ注入）                       | コードレビュー・型チェック     |
| AC-5 | extract-purpose エージェントの期待出力フォーマットが設計書に明文化          | 設計書レビュー                 |
| AC-6 | 既存テストが全てパスし続ける                                                | CI テスト実行                  |
| AC-7 | `SkillCreatorService.purpose.test.ts` が作成され LLM モックで検証可能       | テスト実行                     |

## 命名決定表

| 対象                       | 決定名                                | 理由                                 |
| -------------------------- | ------------------------------------- | ------------------------------------ |
| LLM クライアントフィールド | `llmClient`                           | 仕様書コメントに記載済み             |
| LLM 呼び出しメソッド引数型 | `LlmGenerateOptions`                  | TypeScript 慣習                      |
| LLM クライアント型         | `LlmClient`                           | シンプルで明確                       |
| purpose 抽出専用メソッド   | `extractPurposeWithLlm`               | extract-purpose エージェント名に対応 |
| テストファイル名           | `SkillCreatorService.purpose.test.ts` | 既存命名パターンに準拠               |

## `llmClient` インターフェース接続要件

| 要件             | 内容                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| インターフェース | `generate(options: { system: string; user: string }): Promise<string>` |
| モック可能性     | コンストラクタ注入により `vi.fn()` で差し替え可能                      |
| エラーモデル     | `generate` が throw した場合、`extractPurposeWithLlm` は null を返す   |
| フォールバック   | `llmClient` が undefined の場合、`options.description` を使用          |

## 前提タスク完了確認

- [x] `generateSkillMd` メソッドが実装済み（SkillCreatorService.ts 888行目）
- [x] `StructurePlanJson.purpose` が `string` 型で定義済み（36-44行目）
- [x] `structurePlan.purpose` が `generateSkillMd` で使用されている（triggerDescription 生成で参照）
