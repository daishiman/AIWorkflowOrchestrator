# Phase 8 責務マップ — 各クラス/関数の責務と依存関係

## メタ情報

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 8 |
| 作成日 | 2026-03-16                                 |

---

## クラス責務一覧

### 1. ILLMDocQueryAdapter（インターフェース）

**ファイル:** `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` L10-14

**責務:** LLM プロバイダへのドキュメント生成クエリを抽象化する

**公開メソッド:**

| メソッド            | 引数     | 戻り値                                | 説明                   |
| ------------------- | -------- | ------------------------------------- | ---------------------- |
| `query(prompt)`     | `string` | `Promise<DocOperationResult<string>>` | LLM へ問い合わせを実行 |
| `isAvailable()`     | なし     | `boolean`                             | API key が有効かを判定 |
| `getProviderName()` | なし     | `string`                              | プロバイダ名を返す     |

**依存:** `DocOperationResult<T>` (@repo/shared)

---

### 2. LLMDocQueryAdapter（実装クラス）

**ファイル:** `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` L16-177

**責務:**

1. `getApiKey` 関数を経由して API key の有効性を判定
2. LLM プロバイダへのクエリを実行（現時点は stub 実装）
3. エラーを `DocOperationResult` の error 形式にマッピング

**コンストラクタ引数（Constructor Injection）:**

| 引数           | 型                     | 説明                               |
| -------------- | ---------------------- | ---------------------------------- |
| `getApiKey`    | `() => string \| null` | API key 取得関数（DI）             |
| `providerName` | `string`               | プロバイダ名（デフォルト: "stub"） |

**内部メソッド:**

| メソッド          | 責務                                                    |
| ----------------- | ------------------------------------------------------- |
| `mapError(error)` | 例外を DocOperationResult エラー形式に変換（7種別対応） |

**エラーコード体系:**

| コード範囲 | カテゴリ         | 例                          |
| ---------- | ---------------- | --------------------------- |
| 1000-1999  | VALIDATION       | prompt 空文字列             |
| 2000-2999  | BUSINESS         | API key 未設定/無効         |
| 3000-3999  | EXTERNAL_SERVICE | タイムアウト/Rate limit/5xx |
| 5000-5999  | INTERNAL         | 不明エラー（fallback）      |

**依存:**

- `@repo/shared` の `DocOperationResult<T>`

---

### 3. SkillDocsCapabilityResolver

**ファイル:** `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` L12-32

**責務:** `ILLMDocQueryAdapter` の状態に基づいて capability パスを判定する

**コンストラクタ引数（Constructor Injection）:**

| 引数      | 型                    | 説明               |
| --------- | --------------------- | ------------------ |
| `adapter` | `ILLMDocQueryAdapter` | LLM アダプタ（DI） |

**capability 判定ロジック:**

```
await adapter.isAvailable() == false
  → capability: "guidance-only"
     guidance: "設定画面から API key を設定してください"

await adapter.isAvailable() == true
  → capability: "integrated-api"
     provider: adapter.getProviderName()
```

注: `terminal-handoff` パスは本実装では判定されない（将来の LLM 到達不可ケースで拡張予定）

**依存:**

- `ILLMDocQueryAdapter` (同パッケージ)
- `SkillDocsCapabilityResult` (@repo/shared)

---

### 4. SkillDocGenerator

**ファイル:** `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` L82-284

**責務:**

1. スキルの SKILL.md を読み込み、構造情報を抽出
2. `LLMQueryFn` 経由で LLM に各セクションの生成を依頼
3. 複数セクションを結合してドキュメントを組み立てる
4. Markdown / HTML のフォーマット変換
5. ファイルエクスポート（パストラバーサル検証込み）

**コンストラクタ引数（Constructor Injection）:**

| 引数               | 型                 | 説明                         |
| ------------------ | ------------------ | ---------------------------- |
| `queryFn`          | `LLMQueryFn`       | LLM クエリ関数（DI）         |
| `skillFileManager` | `SkillFileManager` | スキルファイル読み込み（DI） |

**公開メソッド:**

| メソッド                        | 引数                   | 戻り値                  | 説明                 |
| ------------------------------- | ---------------------- | ----------------------- | -------------------- |
| `generate(request)`             | `DocGenerationRequest` | `Promise<GeneratedDoc>` | フル生成             |
| `preview(skillName, template?)` | `string, DocTemplate?` | `Promise<GeneratedDoc>` | プレビュー生成       |
| `exportToFile(doc, outputPath)` | `GeneratedDoc, string` | `Promise<void>`         | ファイルエクスポート |

**内部メソッド:**

| メソッド                                                   | 責務                                                |
| ---------------------------------------------------------- | --------------------------------------------------- |
| `analyzeSkillStructure(skillName)`                         | SKILL.md とファイル一覧を読み込んで構造文字列を返す |
| `generateSection(skillStructure, sectionConfig, language)` | 1セクションを LLM で生成（30秒タイムアウト付き）    |
| `convertToHtml(markdownContent)`                           | Markdown を簡易 HTML に変換                         |
| `validateOutputPath(outputPath)`                           | パストラバーサル検証                                |

**定数:**

| 定数                   | 値                     | 説明                         |
| ---------------------- | ---------------------- | ---------------------------- |
| `DEFAULT_DOC_TEMPLATE` | 7セクション構成        | 標準ドキュメントテンプレート |
| `LLM_TIMEOUT_MS`       | 30,000ms               | LLM クエリのタイムアウト     |
| `VALID_OUTPUT_FORMATS` | `["markdown", "html"]` | 有効な出力フォーマット       |

**依存:**

- `path`, `fs/promises` (Node.js 標準)
- `@repo/shared` の型定義 6種
- `SkillFileManager` (同パッケージ)

---

### 5. registerSkillDocsHandlers / unregisterSkillDocsHandlers

**ファイル:** `apps/desktop/src/main/ipc/skillHandlers.ts` L1039-1283

**責務:** Skill Docs 機能の IPC チャンネルを Main Process に登録/解除する

**登録チャンネル:**

| チャンネル             | 関数                               | 引数バリデーション                 |
| ---------------------- | ---------------------------------- | ---------------------------------- |
| `skill:docs:generate`  | `skillDocGenerator.generate()`     | 6フィールド（P42準拠）             |
| `skill:docs:preview`   | `skillDocGenerator.preview()`      | 2フィールド                        |
| `skill:docs:export`    | `skillDocGenerator.exportToFile()` | 2フィールド + パストラバーサル検証 |
| `skill:docs:templates` | 固定 DEFAULT_DOC_TEMPLATE 返却     | 引数なし                           |

**セキュリティ:** 全チャンネルで `validateIpcSender()` による送信元ウィンドウ検証を実施

---

## 依存関係図

```
Renderer (UI)
    |
    | IPC (contextBridge)
    v
skillHandlers.registerSkillDocsHandlers()
    |
    +---> SkillDocGenerator.generate/preview/exportToFile()
    |         |
    |         +---> queryFn: LLMQueryFn (DI)
    |         |         |
    |         |         +---> LLMDocQueryAdapter.query() [実装時の具体例]
    |         |                   |
    |         |                   +---> getApiKey(): () => string | null (DI)
    |         |
    |         +---> SkillFileManager.readFile/listSkillFiles()
    |
    +---> SkillDocsCapabilityResolver.resolve()
              |
              +---> ILLMDocQueryAdapter.isAvailable/getProviderName()
```

## 設計原則の遵守確認

| 原則                  | 状態 | 根拠                                                    |
| --------------------- | ---- | ------------------------------------------------------- |
| 単一責務（SRP）       | 遵守 | 各クラスが明確な1つの責務を持つ                         |
| 依存性逆転（DIP）     | 遵守 | SkillDocGenerator は LLMQueryFn インターフェースに依存  |
| Constructor Injection | 遵守 | 全クラスがコンストラクタで依存を受け取る                |
| P42 3段バリデーション | 遵守 | IPC 層で型/空文字/トリム空文字のチェック実施            |
| P34 DI パターン選択   | 適切 | 外部リソース依存なしのため Constructor Injection を選択 |
