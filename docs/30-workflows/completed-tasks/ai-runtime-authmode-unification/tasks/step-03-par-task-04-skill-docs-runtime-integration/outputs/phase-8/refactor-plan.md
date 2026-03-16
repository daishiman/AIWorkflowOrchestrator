# Phase 8 リファクタリング計画 — 評価結果

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスク     | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 8 |
| 評価日     | 2026-03-16                                 |
| 評価者     | Claude Sonnet 4.6                          |
| 対象 Phase | Phase 5 実装成果物（4ファイル）            |

## 評価対象ファイル

| ファイル                                                              | 行数       | 責務                           |
| --------------------------------------------------------------------- | ---------- | ------------------------------ |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | 177行      | LLMアダプタ + mapError         |
| `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | 32行       | 3-path capability判定          |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`           | 284行      | ドキュメント生成（queryFn DI） |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                          | L1049-1271 | IPC 4チャンネル                |

---

## T-8-1: PromptBuilder 責務分離の評価

### 評価対象

`SkillDocGenerator.ts` の `generateSection()` メソッド（L235-264）の prompt 構築部分。

```
const prompt = `${langInstruction}\n\nスキル情報:\n${skillStructure}\n\n指示: ${sectionConfig.prompt}`;
```

### 判断: 分離不要

**理由:**

1. prompt 構築ロジックは3行のテンプレートリテラル。複雑性がない
2. `langInstruction` の条件分岐（`ja` vs `en`）も単純な三項演算子
3. `TemplateSection.prompt` はすでに外部定義（`DEFAULT_DOC_TEMPLATE`）から注入されており、テンプレートの責務は分離済み
4. 将来的にプロンプトエンジニアリングが複雑化した場合にのみ `PromptBuilder` クラスへの抽出を検討する

**結論:** 現段階での PromptBuilder 分離は Over-Engineering であり、実施しない。

---

## T-8-2: LLMDocQueryAdapter 抽象化層確認

### 確認事項

**ILLMDocQueryAdapter インターフェース（LLMDocQueryAdapter.ts L10-14）:**

```typescript
export interface ILLMDocQueryAdapter {
  query(prompt: string): Promise<DocOperationResult<string>>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}
```

- インターフェースが適切に定義されており、仕様の `ILLMDocQueryAdapter` と一致している
- `LLMDocQueryAdapter` がこのインターフェースを実装済み

**SkillDocGenerator の依存関係:**

```typescript
export class SkillDocGenerator {
  private readonly queryFn: LLMQueryFn;
  // adapter を直接保持せず、queryFn (= adapter.query) を経由
}
```

- `SkillDocGenerator` は `ILLMDocQueryAdapter` に直接依存せず、`LLMQueryFn = (prompt: string) => Promise<{ content: string }>` 型の関数として間接参照している
- これは仕様が意図した DI パターン（Constructor Injection）で正しく実装されている

**P34 Setter Injection パターンの適用可能性:**

- `SkillDocGenerator` の `queryFn` は Constructor Injection で十分（生成時点で queryFn が利用可能）
- `BrowserWindow` 等の外部リソースへの依存がないため、Setter Injection（P34）の適用は不要
- 現状の Constructor Injection が適切な選択

**判断:** 現状の設計が仕様どおり。変更不要。

---

## T-8-3: ErrorMapper 責務分離の評価

### 評価対象

`LLMDocQueryAdapter.ts` の `private mapError()` メソッド（L76-176）。

### 網羅された7エラー種別

| エラー種別              | コード | カテゴリ         | retryable |
| ----------------------- | ------ | ---------------- | --------- |
| prompt バリデーション   | 1001   | VALIDATION       | false     |
| API key 未設定          | 2001   | BUSINESS         | false     |
| タイムアウト            | 3001   | EXTERNAL_SERVICE | true      |
| Rate limit              | 3002   | EXTERNAL_SERVICE | true      |
| API key 無効（401/403） | 2002   | BUSINESS         | false     |
| Server error（5xx）     | 3003   | EXTERNAL_SERVICE | true      |
| 内部エラー（fallback）  | 5001   | INTERNAL         | false     |

### 判断: 分離不要

**理由:**

1. `mapError()` は `LLMDocQueryAdapter` の `private` メソッドとして配置されており、クラスの責務に直接対応している
2. エラー変換のロジックは `LLMDocQueryAdapter.query()` の catch 節からのみ呼ばれる凝集性の高い実装
3. 100行のメソッドだが全エラー種別が1箇所にまとまっており、見通しが良い
4. 独立した `ErrorMapper` クラスに分離した場合、テストのセットアップが複雑化するが得られる利点が少ない
5. 将来 LLM プロバイダが複数になる（例: OpenAI, Anthropic, Gemini）段階で、共通 `ErrorMapper` として抽出を検討する

**結論:** `mapError()` は現状の private メソッドとして適切に配置されている。分離しない。

---

## T-8-4: IPC ハンドラの共通パターン確認

### 評価対象

`skillHandlers.ts` の `registerSkillDocsHandlers()` 内の4チャンネル（L1049-1271）。

### 共通パターンの確認

各チャンネルで以下のパターンを確認:

```
1. validateIpcSender() によるセキュリティチェック
2. 引数のオブジェクト型チェック
3. validateStringArg() による文字列バリデーション（P42準拠）
4. try/catch でサービス呼び出し
5. エラー種別に応じたレスポンス変換
```

### withDocHandler 抽出の評価

**評価結果: 抽出不要**

**理由:**

1. 既存の `skillHandlers.ts` に `validateIpcSender()` と `validateStringArg()` がユーティリティとして用意されており、共通バリデーション層はすでに共通化されている
2. 4チャンネルの引数スキーマがそれぞれ異なる（`generate` は6フィールド、`preview` は2フィールド、`export` は2フィールド、`templates` は0フィールド）ため、ジェネリックな `withDocHandler` で統一するのが難しい
3. 既存の他ハンドラ（`skill:import`, `skill:remove` 等）と同じパターンで実装されており、コードベースの一貫性を維持している

**結論:** `withDocHandler` 共通化は不要。

---

## T-8-5: Capability チェックの共通化検討

詳細は `capability-commonality.md` を参照。

---

## まとめ: リファクタリング判断サマリー

| 評価項目                    | 判断 | 理由                                                         |
| --------------------------- | ---- | ------------------------------------------------------------ |
| PromptBuilder 分離          | 不要 | 3行のテンプレートリテラル。Over-Engineering                  |
| ErrorMapper 分離            | 不要 | private メソッドとして適切に配置済み                         |
| withDocHandler 抽出         | 不要 | 既存ユーティリティで十分。引数スキーマが各チャンネルで異なる |
| Setter Injection (P34) 適用 | 不要 | Constructor Injection で十分                                 |
| ILLMDocQueryAdapter 設計    | 適切 | 仕様どおりに実装済み                                         |

**Phase 5 の実装はシンプルかつ適切な設計であり、現段階での大規模リファクタリングは不要と評価する。**
