# TASK-9I Phase 2: アーキテクチャ設計書

## メタ情報

| 項目      | 値                         |
| --------- | -------------------------- |
| タスク ID | TASK-9I                    |
| 機能名    | スキルドキュメント自動生成 |
| Phase     | 2 — 設計                   |
| 作成日    | 2026-02-28                 |
| 前提      | Phase 1 要件定義書         |

---

## 1. SkillDocGenerator クラス設計

### 1.1 クラス概要

| 項目         | 値                                                                               |
| ------------ | -------------------------------------------------------------------------------- |
| ファイルパス | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                      |
| 責務         | スキル構造解析、LLM によるセクション生成、フォーマット変換、ファイルエクスポート |
| DI           | LLM query 関数（Constructor Injection）                                          |
| 配置         | `SkillService` Facade の L2 コンポーネント                                       |

### 1.2 Public メソッド（3メソッド）

#### generate(request: DocGenerationRequest): Promise\<GeneratedDoc\>

| 項目    | 説明                                                                                                              |
| ------- | ----------------------------------------------------------------------------------------------------------------- |
| 関連 FR | FR-01, FR-02, FR-03, FR-04, FR-05, FR-06                                                                          |
| 引数    | `DocGenerationRequest`（skillName, outputFormat, language, includeExamples, includeApiReference, customSections） |
| 戻り値  | `GeneratedDoc`（skillName, format, content, sections, generatedAt, wordCount）                                    |
| 例外    | `VALIDATION_ERROR`（スキル未検出）、`EXTERNAL_SERVICE_ERROR`（LLM エラー）                                        |

処理フロー:

1. `analyzeSkillStructure(request.skillName)` でスキル構造を解析する
2. デフォルトテンプレートのセクション一覧を取得する
3. `includeExamples: false` の場合、`examples` セクションを除外する
4. `includeApiReference: false` の場合、`api` セクションを除外する
5. `customSections` がある場合、追加の `TemplateSection` を生成して末尾に追加する
6. 各セクションに対して `generateSection(analysis, section, language)` を逐次実行する
7. `required: true` セクションの生成に失敗した場合はエラーを送出する
8. 全セクションの content を結合して `content` を構築する
9. `outputFormat` が `"html"` の場合、`convertToHtml(content)` で変換する
10. `outputFormat` が `"pdf"` の場合、`convertToHtml(content)` → `convertToPdf(html, tempPath)` で変換する
11. `generatedAt` は `new Date().toISOString()` で ISO 8601 文字列を生成する
12. `wordCount` は `content` の文字数をカウントして設定する

#### preview(skillName: string, template?: DocTemplate): Promise\<GeneratedDoc\>

| 項目    | 説明                                                                       |
| ------- | -------------------------------------------------------------------------- |
| 関連 FR | FR-07                                                                      |
| 引数    | `skillName`（スキル名）、`template`（任意: カスタムテンプレート）          |
| 戻り値  | `GeneratedDoc`（format: `"markdown"` 固定）                                |
| 例外    | `VALIDATION_ERROR`（スキル未検出）、`EXTERNAL_SERVICE_ERROR`（LLM エラー） |

処理フロー:

1. `template` 未指定時は `DEFAULT_DOC_TEMPLATE` を使用する
2. `DocGenerationRequest` を構築する（outputFormat: `"markdown"`, language: `"ja"`, includeExamples: true, includeApiReference: true）
3. テンプレートのセクション一覧で `generate()` に委譲する（ファイル出力なし）

#### exportToFile(doc: GeneratedDoc, outputPath: string): Promise\<void\>

| 項目    | 説明                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| 関連 FR | FR-08                                                                          |
| 引数    | `doc`（生成済みドキュメント）、`outputPath`（出力先パス）                      |
| 戻り値  | `void`                                                                         |
| 例外    | `VALIDATION_ERROR`（パストラバーサル）、`INFRASTRUCTURE_ERROR`（書き込み失敗） |

処理フロー:

1. `isValidOutputPath(outputPath)` でパストラバーサルバリデーションを実行する
2. 出力先ディレクトリの存在を確認し、存在しない場合は `fs.mkdir` で再帰的に作成する
3. `doc.format` に応じて出力を分岐する
   - `"markdown"`: `fs.writeFile(outputPath, doc.content)` でそのまま書き出す
   - `"html"`: `fs.writeFile(outputPath, doc.content)` でそのまま書き出す（content は既に HTML）
   - `"pdf"`: `convertToPdf(doc.content, outputPath)` で PDF ファイルを生成する

### 1.3 Private メソッド（5メソッド）

#### analyzeSkillStructure(skillName: string): Promise\<SkillAnalysis\>

スキルディレクトリ `.claude/skills/{skillName}/` を読み取り、構造解析結果を返す。

| 読み取り対象                              | 格納先             |
| ----------------------------------------- | ------------------ |
| `SKILL.md`                                | `skillMdContent`   |
| `references/*.md`                         | `referenceFiles[]` |
| `agents/*`                                | `agentFiles[]`     |
| `schemas/*`                               | `schemaFiles[]`    |
| `references/` 内の examples 有無判定      | `hasExamples`      |
| `references/` 内の api-reference 有無判定 | `hasApiReference`  |

スキルディレクトリが存在しない場合は `VALIDATION_ERROR`（`"Skill not found: {skillName}"`）を送出する。

#### generateSection(analysis: SkillAnalysis, section: TemplateSection, language: "ja" | "en"): Promise\<DocSection\>

テンプレートセクションの `prompt` と `SkillAnalysis` を組み合わせて LLM に問い合わせる。

プロンプト構築:

```
以下のスキル情報を基に、「{section.title}」セクションを{language === "ja" ? "日本語" : "English"}で生成してください。

## スキル情報
{analysis.skillMdContent}

## 参考資料
{analysis.referenceFiles.map(f => f.content).join("\n")}

## 生成指示
{section.prompt}
```

#### convertToHtml(markdown: string): string

`marked` ライブラリで Markdown を HTML に変換し、完全な HTML ドキュメントとしてラップする。

出力構造:

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Skill Documentation</title>
  </head>
  <body>
    {parsed markdown}
  </body>
</html>
```

#### convertToPdf(html: string, outputPath: string): Promise\<void\>

`puppeteer` を使用して HTML を PDF にレンダリングし、指定パスに書き出す。

処理:

1. `puppeteer.launch()` でブラウザインスタンスを起動する
2. `page.setContent(html)` で HTML をロードする
3. `page.pdf({ path: outputPath, format: "A4" })` で PDF を生成する
4. `browser.close()` でリソースを解放する（finally 節で保証）

#### isValidOutputPath(outputPath: string): boolean

パストラバーサル攻撃を防止するバリデーション。

検証ステップ:

1. `path.resolve(outputPath)` で絶対パスに正規化する
2. 正規化後のパスに `..` セグメントが含まれていないことを検証する
3. 許可されたディレクトリ配下であることを検証する

---

## 2. DI 構造

### 2.1 LLM Query 関数（Constructor Injection）

```typescript
type LLMQueryFn = (prompt: string) => Promise<{ content: string }>;

class SkillDocGenerator {
  private readonly queryFn: LLMQueryFn;
  private readonly skillBasePath: string;

  constructor(queryFn: LLMQueryFn, skillBasePath?: string) {
    this.queryFn = queryFn;
    this.skillBasePath = skillBasePath ?? ".claude/skills/";
  }
}
```

| DI 対象         | パターン              | 理由                                                         |
| --------------- | --------------------- | ------------------------------------------------------------ |
| `queryFn`       | Constructor Injection | テスト時にモック差し替えが必要。生成時点で利用可能（NFR-05） |
| `skillBasePath` | Constructor Injection | テスト時に一時ディレクトリに切り替えるため                   |

### 2.2 SkillService Facade（Setter Injection）

```typescript
class SkillService {
  private docGenerator: SkillDocGenerator | null = null;

  setDocGenerator(docGenerator: SkillDocGenerator): void {
    this.docGenerator = docGenerator;
  }

  getDocGenerator(): SkillDocGenerator {
    if (!this.docGenerator) {
      throw new Error(
        "SkillDocGenerator is not initialized. Call setDocGenerator() first.",
      );
    }
    return this.docGenerator;
  }
}
```

| DI 対象        | パターン         | 理由                                                                             |
| -------------- | ---------------- | -------------------------------------------------------------------------------- |
| `docGenerator` | Setter Injection | LLM query 関数の準備完了後に生成するため、コンストラクタ時点では不可（P34 対策） |

---

## 3. デフォルトテンプレート設計

### 3.1 テンプレート構成（7セクション）

ファイルパス: `apps/desktop/src/main/services/skill/doc-templates.ts`

| 順序 | セクション ID     | タイトル               | 必須  | LLM プロンプト概要                                     |
| ---- | ----------------- | ---------------------- | ----- | ------------------------------------------------------ |
| 0    | `overview`        | 概要                   | true  | 目的・主要機能・対象ユーザーを200文字以内で説明        |
| 1    | `getting-started` | はじめに               | true  | 基本的な使用手順をステップバイステップで説明           |
| 2    | `configuration`   | 設定                   | false | 設定項目（Anchors、パラメータ）を一覧テーブルで説明    |
| 3    | `api`             | API リファレンス       | false | 公開インターフェース（入出力、コマンド）を技術的に説明 |
| 4    | `examples`        | 使用例                 | false | 具体的な使用例を3件以上、入力/出力ペアで記載           |
| 5    | `troubleshooting` | トラブルシューティング | false | 一般的なエラーと解決策を3件以上、3列テーブルで記載     |
| 6    | `changelog`       | 変更履歴               | false | 変更履歴を日付・バージョン・内容テーブルで抽出         |

### 3.2 各セクションの LLM プロンプト

#### overview（概要）

```
このスキルの目的、主要機能、対象ユーザーを200文字以内で説明してください。
SKILL.md の内容を要約してください。
```

#### getting-started（はじめに）

```
このスキルの基本的な使用手順をステップバイステップで説明してください。
トリガーキーワードと典型的なワークフローを含めてください。
```

#### configuration（設定）

```
このスキルで利用可能な設定項目（Anchors、パラメータ、環境変数）を
一覧テーブル形式で説明してください。設定項目がない場合は「設定項目なし」と記載してください。
```

#### api（API リファレンス）

```
このスキルが公開するインターフェース（入力/出力フォーマット、コマンド、IPC チャネル）を
技術的に説明してください。
```

#### examples（使用例）

```
このスキルの具体的な使用例を3件以上、入力と期待される出力のペアで記載してください。
```

#### troubleshooting（トラブルシューティング）

```
このスキルで発生しうる一般的なエラーと解決策を3件以上挙げてください。
エラーメッセージ、原因、解決手順の3列テーブル形式で記載してください。
```

#### changelog（変更履歴）

```
SKILL.md の変更履歴セクションから主要な変更を日付・バージョン・内容のテーブル形式で
抽出してください。変更履歴がない場合は「変更履歴なし」と記載してください。
```

---

## 4. 内部型定義

### 4.1 SkillAnalysis（内部型）

```typescript
interface SkillAnalysis {
  /** スキル名 */
  skillName: string;
  /** SKILL.md の内容 */
  skillMdContent: string;
  /** references/ 配下のファイル一覧 */
  referenceFiles: Array<{ path: string; content: string }>;
  /** agents/ 配下のファイル一覧 */
  agentFiles: Array<{ path: string; content: string }>;
  /** schemas/ 配下のファイル一覧 */
  schemaFiles: Array<{ path: string; content: string }>;
  /** 使用例コンテンツが存在するか */
  hasExamples: boolean;
  /** API リファレンスコンテンツが存在するか */
  hasApiReference: boolean;
}
```

### 4.2 LLMQueryFn（DI 用型）

```typescript
type LLMQueryFn = (prompt: string) => Promise<{ content: string }>;
```

---

## 5. 初期化フロー

### 5.1 初期化シーケンス

```
アプリ起動 → BrowserWindow 作成
  │
  ├── Step 1: LLM query 関数の構築（既存 LLM サービスに委譲）
  │   const llmQuery: LLMQueryFn = async (prompt) => {
  │     const response = await llmService.query(prompt);
  │     return { content: response };
  │   };
  │
  ├── Step 2: SkillDocGenerator 生成（Constructor Injection: queryFn）
  │   const docGenerator = new SkillDocGenerator(llmQuery);
  │
  ├── Step 3: SkillService Facade への L2 コンポーネント登録
  │   skillService.setDocGenerator(docGenerator);
  │
  ├── Step 4: IPC ハンドラ登録（P5対策: register/unregister 独立関数）
  │   registerSkillDocsHandlers(mainWindow, docGenerator);
  │
  └── Step 5: アプリ終了時のクリーンアップ
      app.on("before-quit", () => {
        unregisterSkillDocsHandlers();
      });
```

### 5.2 依存関係図

```
llmService (既存)
  └──→ llmQuery: LLMQueryFn
         └──→ SkillDocGenerator (Constructor Injection)
                ├──→ SkillService.setDocGenerator() (Setter Injection)
                └──→ registerSkillDocsHandlers(mainWindow, docGenerator)
                       └──→ 4 IPC チャネル登録
```

---

## 6. シーケンス図

### 6.1 ドキュメント生成フロー

```
Renderer                  Preload                    Main (IPC Handler)           SkillDocGenerator          LLM Service
  |                         |                           |                            |                         |
  |-- docsGenerate(req) --> |                           |                            |                         |
  |                         |-- safeInvokeUnwrap -----> |                            |                         |
  |                         |                           |-- L1: validateIpcSender -> |                         |
  |                         |                           |-- L2: validate args -----> |                         |
  |                         |                           |-- L3: generate(req) -----> |                         |
  |                         |                           |                            |-- analyzeSkillStructure  |
  |                         |                           |                            |   (read SKILL.md, refs)  |
  |                         |                           |                            |                         |
  |                         |                           |                            |-- generateSection x N -> |
  |                         |                           |                            |                         |-- queryFn(prompt)
  |                         |                           |                            |                         |<- { content }
  |                         |                           |                            |<- DocSection[]           |
  |                         |                           |                            |                         |
  |                         |                           |                            |-- convertToHtml (if html)|
  |                         |                           |                            |-- convertToPdf (if pdf)  |
  |                         |                           |                            |<- GeneratedDoc           |
  |                         |                           |<- { success, data } ------  |                         |
  |                         |<- GeneratedDoc ---------- |                            |                         |
  |<- GeneratedDoc -------- |                           |                            |                         |
```

### 6.2 ファイルエクスポートフロー

```
Renderer                  Preload                    Main (IPC Handler)           SkillDocGenerator
  |                         |                           |                            |
  |-- docsExport(doc,path)->|                           |                            |
  |                         |-- safeInvokeUnwrap -----> |                            |
  |                         |                           |-- L1: validateIpcSender -> |
  |                         |                           |-- L2: validate args -----> |
  |                         |                           |-- L3: exportToFile() ----> |
  |                         |                           |                            |-- isValidOutputPath(path)
  |                         |                           |                            |-- mkdir -p (if needed)
  |                         |                           |                            |-- fs.writeFile / convertToPdf
  |                         |                           |<- { success: true } ------  |
  |                         |<- void ------------------- |                            |
  |<- void ----------------- |                           |                            |
```

### 6.3 プレビュー生成フロー

```
Renderer                  Preload                    Main (IPC Handler)           SkillDocGenerator
  |                         |                           |                            |
  |-- docsPreview(name) --> |                           |                            |
  |                         |-- safeInvokeUnwrap -----> |                            |
  |                         |                           |-- L1: validateIpcSender -> |
  |                         |                           |-- L2: validate args -----> |
  |                         |                           |-- L3: preview(name) -----> |
  |                         |                           |                            |-- resolve template
  |                         |                           |                            |-- generate(defaultReq)
  |                         |                           |                            |   (markdown 固定, 全セクション)
  |                         |                           |<- { success, data } ------  |
  |                         |<- GeneratedDoc ---------- |                            |
  |<- GeneratedDoc -------- |                           |                            |
```

### 6.4 テンプレート一覧取得フロー

```
Renderer                  Preload                    Main (IPC Handler)
  |                         |                           |
  |-- docsTemplates() ----> |                           |
  |                         |-- safeInvokeUnwrap -----> |
  |                         |                           |-- L1: validateIpcSender
  |                         |                           |-- return [DEFAULT_DOC_TEMPLATE]
  |                         |<- DocTemplate[] --------- |
  |<- DocTemplate[] -------- |                           |
```

---

## 7. エラーハンドリング設計

### 7.1 エラーカテゴリ分類

| エラー種別                    | エラーコード範囲 | リトライ | 発生箇所                                                  |
| ----------------------------- | ---------------- | -------- | --------------------------------------------------------- |
| 引数バリデーション失敗        | 1000-1999        | 不可     | IPC ハンドラ Layer 2（skillName, outputFormat, language） |
| パストラバーサル検出          | 1000-1999        | 不可     | `isValidOutputPath()` で拒否                              |
| スキル未検出                  | 2000-2999        | 不可     | `analyzeSkillStructure()` でスキルディレクトリ不在        |
| LLM 通信エラー / タイムアウト | 3000-3999        | 可能     | `generateSection()` で LLM query 失敗                     |
| ファイル書き込み失敗          | 4000-4999        | 可能     | `exportToFile()` で `fs.writeFile` / `convertToPdf` 失敗  |

### 7.2 IPC 統一レスポンス形式

成功レスポンス:

```typescript
{ success: true, data: GeneratedDoc }
{ success: true, data: DocTemplate[] }
{ success: true, data: undefined }  // exportToFile
```

エラーレスポンス:

```typescript
{ success: false, error: "skillName must be a non-empty string" }
{ success: false, error: "outputFormat must be one of: markdown, html, pdf" }
{ success: false, error: "language must be one of: ja, en" }
{ success: false, error: "Skill not found: test-skill" }
{ success: false, error: "LLM query failed" }
{ success: false, error: "File write failed" }
```

---

## 8. ファイル構成

### 新規ファイル

| ファイルパス                                                | 内容                       |
| ----------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | サービスクラス本体         |
| `apps/desktop/src/main/services/skill/doc-templates.ts`     | デフォルトテンプレート定数 |
| `apps/desktop/src/main/ipc/skillDocsHandlers.ts`            | IPC ハンドラ登録・解除     |
| `packages/shared/src/types/skill-docs.ts`                   | 共有型定義5種              |

### 変更ファイル

| ファイルパス                                           | 変更内容                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`                 | IPC_CHANNELS に4定数追加、ALLOWED_INVOKE_CHANNELS に4件追加 |
| `apps/desktop/src/preload/skill-api.ts`                | docs 操作4メソッド追加                                      |
| `apps/desktop/src/preload/types.ts`                    | SkillAPI 型に4メソッド追加                                  |
| `apps/desktop/src/main/ipc/index.ts`                   | registerSkillDocsHandlers 初期化呼び出し                    |
| `apps/desktop/src/main/services/skill/SkillService.ts` | setDocGenerator / getDocGenerator 追加                      |
| `packages/shared/src/types/index.ts`                   | skill-docs.ts からの re-export                              |
