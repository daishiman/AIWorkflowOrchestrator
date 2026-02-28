# スキルドキュメント生成機能 実装ガイド - TASK-9I

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | TASK-9I                                         |
| Phase    | 12（ドキュメント更新）                          |
| 作成日   | 2026-02-28                                      |
| 対象機能 | スキルドキュメント自動生成（SkillDocGenerator） |

---

## Part 1: 概念的説明（中学生レベル）

### この機能が必要な理由

スキル（AIに特定の仕事をさせるための設定ファイル群）を作ったあと、そのスキルの「使い方マニュアル」を手作業で書くのはとても大変です。スキルの中身を1つ1つ読み解いて、「このスキルは何をするものか」「どう使うのか」「どんな設定があるか」を整理する必要があるからです。

スキルドキュメント生成機能は、この「マニュアル作成」を自動で行います。AIの力を借りて、スキルの中身を読み取り、わかりやすい説明書を自動で作ってくれます。

### スキルドキュメント生成とは？ -- レストランのメニュー作りで例えると

この機能を理解するために、**レストランのメニュー作り**を例に考えてみましょう。

| 技術用語              | レストランの例え                                                     |
| --------------------- | -------------------------------------------------------------------- |
| **スキル**            | レストランの料理（シェフが作ったレシピ）                             |
| **ドキュメント**      | メニュー表（お客さんが見る料理の説明書）                             |
| **テンプレート**      | メニュー表のデザインフォーマット（どの順番で何を書くか決めたひな形） |
| **SkillDocGenerator** | メニュー表を自動で作るプリンター                                     |
| **LLM**               | 料理の説明文を考えてくれるAI翻訳者（日本語でも英語でもOK）           |
| **IPC**               | キッチン（Main Process）とホール（Renderer）をつなぐインターホン     |

### 処理の流れを日常の例で説明

1. **ホールのスタッフ（画面側）** が「この料理のメニュー表を作って！」とインターホンでキッチンに伝えます
2. **キッチンのマネージャー（IPC ハンドラー）** が「本当にホールのスタッフからの依頼か？」と身分確認します（セキュリティ検証）
3. 確認が取れたら、**メニュー表プリンター（SkillDocGenerator）** が動き始めます
4. プリンターはまず料理のレシピ（SKILL.md）を読み取り、材料一覧（ファイル構成）を確認します
5. 次に**AI翻訳者（LLM）** に「この料理の概要を書いて」「使い方を説明して」と順番にお願いします
6. AI翻訳者が書いてくれた文章を、**メニュー表のフォーマット（テンプレート）** に沿って組み立てます
7. 完成したメニュー表をホールのスタッフに返します

### 4つの操作

| 操作          | レストランの例え                             | 説明                         |
| ------------- | -------------------------------------------- | ---------------------------- |
| **generate**  | レシピカードを1から新しく作る                | ドキュメントを完全生成する   |
| **preview**   | 下書きを先に見せてもらう                     | 生成前にプレビューを確認     |
| **export**    | レシピカードを紙に印刷して持ち帰る           | ファイルとして保存する       |
| **templates** | レシピカードのデザインフォーマット一覧を見る | 利用可能なテンプレートを取得 |

### 安全に使える仕組み -- お店の受付に例えると

メニュー表を作る際、4段階のセキュリティチェックが行われます。

1. **受付で身分証確認（Sender検証）**: 「この依頼は本当にホール（正規の画面）から来たものか？」を確認します。見知らぬ人からの依頼は受け付けません
2. **持ち物検査（引数バリデーション）**: 「料理名が正しく指定されているか？」「空欄になっていないか？」を3段階でチェックします（名前がある → 空っぽじゃない → スペースだけじゃない）
3. **調理実行（サービス層処理）**: 検査を通過した依頼だけが実際の処理に進みます
4. **結果のお包み（エラーサニタイズ）**: 万一エラーが起きても、キッチンの内部情報（設備の場所やスタッフの名前）が漏れないように、お客さんに返すメッセージを整えます

---

## Part 2: 技術者向け実装詳細

### 実装概要

| 項目           | 値                                                                                      |
| -------------- | --------------------------------------------------------------------------------------- |
| IPCチャネル数  | 4（generate, preview, export, templates）                                               |
| 新規ファイル数 | 2（SkillDocGenerator.ts, skill-docs.ts）                                                |
| 修正ファイル数 | 5（skillHandlers.ts, channels.ts, skill-api.ts, types.ts [preload], index.ts [共有型]） |
| 型定義         | DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection            |
| テスト総数     | 64（ユニット24 + IPC32 + 型テスト8）                                                    |

### アーキテクチャ概要

```
Renderer (React UI)
  │
  ▼ IPC (contextBridge + safeInvokeUnwrap)
Preload (skill-api.ts)
  │ docsGenerate / docsPreview / docsExport / docsTemplates
  ▼
Main Process (skillHandlers.ts)
  │ registerSkillDocsHandlers / unregisterSkillDocsHandlers
  ▼
SkillDocGenerator (DI: Constructor Injection)
  ├── queryFn: LLMQueryFn (LLM呼び出し関数)
  └── skillFileManager: SkillFileManager (スキルファイル読取)
```

**DIパターン**: Constructor Injection（P34準拠）

`SkillDocGenerator` はコンストラクタで2つの依存を受け取ります。

```typescript
constructor(queryFn: LLMQueryFn, skillFileManager: SkillFileManager)
```

- `LLMQueryFn`: `(prompt: string) => Promise<{ content: string }>` -- LLM問い合わせ関数
- `SkillFileManager`: スキルのファイル読取・存在確認を行うサービス

生成時点で全依存が利用可能であるため、Constructor Injection パターンを採用しています（Setter Injection は不要）。

### 共有型定義

**ファイル**: `packages/shared/src/types/skill-docs.ts`

#### DocGenerationRequest

ドキュメント生成リクエスト。Renderer側からIPCを通じてMain Processに送信されます。

| プロパティ            | 型                     | 必須 | 説明                           |
| --------------------- | ---------------------- | ---- | ------------------------------ |
| `skillName`           | `string`               | 必須 | 対象スキル名                   |
| `outputFormat`        | `"markdown" \| "html"` | 必須 | 出力形式                       |
| `includeExamples`     | `boolean`              | 必須 | 使用例セクションを含めるか     |
| `includeApiReference` | `boolean`              | 必須 | APIリファレンスを含めるか      |
| `language`            | `"ja" \| "en"`         | 必須 | ドキュメント言語               |
| `customSections`      | `string[]`             | 任意 | 追加カスタムセクション名の配列 |

#### GeneratedDoc

生成済みドキュメント。Main Processから返されるレスポンスオブジェクトです。

| プロパティ    | 型                     | 説明                 |
| ------------- | ---------------------- | -------------------- |
| `skillName`   | `string`               | 対象スキル名         |
| `format`      | `"markdown" \| "html"` | 出力形式             |
| `content`     | `string`               | ドキュメント全文     |
| `sections`    | `DocSection[]`         | セクション一覧       |
| `generatedAt` | `string`               | 生成日時（ISO 8601） |
| `wordCount`   | `number`               | 総文字数             |

#### DocSection

ドキュメントの1セクションを表すオブジェクトです。

| プロパティ | 型       | 説明                |
| ---------- | -------- | ------------------- |
| `id`       | `string` | セクション識別子    |
| `title`    | `string` | セクションタイトル  |
| `content`  | `string` | セクション本文      |
| `order`    | `number` | 表示順序（0始まり） |

#### DocTemplate

ドキュメント生成に使用するテンプレート定義です。

| プロパティ    | 型                  | 説明                       |
| ------------- | ------------------- | -------------------------- |
| `id`          | `string`            | テンプレート識別子         |
| `name`        | `string`            | テンプレート名             |
| `description` | `string`            | テンプレート説明           |
| `sections`    | `TemplateSection[]` | テンプレートセクション定義 |

#### TemplateSection

テンプレート内の各セクションの定義です。

| プロパティ | 型        | 説明                |
| ---------- | --------- | ------------------- |
| `id`       | `string`  | セクション識別子    |
| `title`    | `string`  | セクションタイトル  |
| `prompt`   | `string`  | LLMに渡すプロンプト |
| `required` | `boolean` | 必須セクションか    |

### 4チャネルのインターフェース

| チャネル名             | 定数名                 | 引数                                            | 戻り値                                   | 説明                 |
| ---------------------- | ---------------------- | ----------------------------------------------- | ---------------------------------------- | -------------------- |
| `skill:docs:generate`  | `SKILL_DOCS_GENERATE`  | `DocGenerationRequest`                          | `{ success: true, data: GeneratedDoc }`  | ドキュメント完全生成 |
| `skill:docs:preview`   | `SKILL_DOCS_PREVIEW`   | `{ skillName: string, template?: DocTemplate }` | `{ success: true, data: GeneratedDoc }`  | プレビュー生成       |
| `skill:docs:export`    | `SKILL_DOCS_EXPORT`    | `{ doc: GeneratedDoc, outputPath: string }`     | `{ success: true }`                      | ファイルエクスポート |
| `skill:docs:templates` | `SKILL_DOCS_TEMPLATES` | なし                                            | `{ success: true, data: DocTemplate[] }` | テンプレート一覧取得 |

**エラーレスポンス共通形式**:

```typescript
{ success: false, error: string }
```

### Preload API

`apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェースに4メソッドを追加。

```typescript
// SkillAPI インターフェース（docs 操作部分）
interface SkillAPI {
  // ...（既存メソッド省略）

  /** ドキュメントを生成する */
  docsGenerate: (request: DocGenerationRequest) => Promise<GeneratedDoc>;
  /** ドキュメントのプレビューを生成する */
  docsPreview: (
    skillName: string,
    template?: DocTemplate,
  ) => Promise<GeneratedDoc>;
  /** ドキュメントをファイルにエクスポートする */
  docsExport: (doc: GeneratedDoc, outputPath: string) => Promise<void>;
  /** テンプレート一覧を取得する */
  docsTemplates: () => Promise<DocTemplate[]>;
}
```

**呼び出し例（Renderer側）**:

```typescript
// ドキュメント生成
const doc = await window.electronAPI.skill.docsGenerate({
  skillName: "my-skill",
  outputFormat: "markdown",
  includeExamples: true,
  includeApiReference: false,
  language: "ja",
});

// プレビュー
const preview = await window.electronAPI.skill.docsPreview("my-skill");

// エクスポート
await window.electronAPI.skill.docsExport(doc, "/tmp/my-skill-doc.md");

// テンプレート一覧
const templates = await window.electronAPI.skill.docsTemplates();
```

### セキュリティ検証フロー

4層セキュリティを各チャネルに実装。

#### 第1層: Sender検証（validateIpcSender）

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_DOCS_GENERATE, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

#### 第2層: 引数バリデーション（P42準拠3段）

```typescript
// validateStringArg: P42準拠3段バリデーション
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      error: `${argName} must be a non-empty string`,
    };
  }
  return null;
}
```

generate チャネルでは以下のバリデーションを実施:

| 引数                  | チェック内容                                       |
| --------------------- | -------------------------------------------------- |
| `request`             | null/非オブジェクト拒否                            |
| `skillName`           | P42準拠3段（型チェック → 空文字列 → trim空文字列） |
| `outputFormat`        | `"markdown"` / `"html"` のいずれかであること       |
| `includeExamples`     | boolean 型であること                               |
| `includeApiReference` | boolean 型であること                               |
| `language`            | `"ja"` / `"en"` のいずれかであること               |
| `customSections`      | 任意。指定時は文字列の配列であること               |

#### 第3層: サービス層エラーハンドリング

```typescript
try {
  const doc = await skillDocGenerator.generate(req as DocGenerationRequest);
  return { success: true, data: doc };
} catch (error) {
  // 既知エラーはメッセージをそのまま返す
  if (error instanceof Error && error.message.startsWith("Skill not found")) {
    return { success: false, error: error.message };
  }
  // 予期しない例外は "Internal error" に正規化
  return { success: false, error: "Internal error" };
}
```

#### 第4層: エラーサニタイズ

予期しない例外が発生した場合、内部情報（ファイルパス、IPアドレス、スタックトレース）が漏洩しないよう、`"Internal error"` に正規化して返します。`sanitizeErrorMessage` 関数（skillHandlers.ts 共通）が以下をマスクします:

- スタックトレース除去
- Unix/Windows ファイルパスを `[path]` に置換
- IPアドレスを `[host]` に置換
- 機密情報（token, key, password, secret）をマスク

### テストカテゴリテーブル

| カテゴリ       | テスト対象                    | テスト数（実測値） |
| -------------- | ----------------------------- | ------------------ |
| ユニットテスト | SkillDocGenerator メソッド    | 24                 |
| IPC テスト     | skillHandlers docs ハンドラー | 32                 |
| 型テスト       | skill-docs.ts 型定義          | 8                  |
| **合計**       |                               | **64**             |

> テスト数は `it(` パターンの grep カウントによる実測値（P37対策）。

### エッジケースと対応

| エッジケース             | 挙動                                                         |
| ------------------------ | ------------------------------------------------------------ |
| スキル未存在             | `"Skill not found: {skillName}"` エラーを返す                |
| LLMタイムアウト          | 30秒で `"LLM query timeout"` エラーをスロー                  |
| 不正な outputFormat      | `"outputFormat must be one of: markdown, html"` エラーを返す |
| 空文字列の skillName     | P42準拠3段バリデーションで拒否                               |
| スペースのみの skillName | P42準拠3段バリデーションで `.trim() === ""` で拒否           |
| パストラバーサル攻撃     | IPC層とサービス層の二重チェックで `".."` を含むパスを拒否    |
| 非オブジェクト引数       | `"request must be an object"` エラーを返す                   |

### ファイル一覧と変更内容

| ファイル                                                    | 種別 | 変更内容                                                         |
| ----------------------------------------------------------- | ---- | ---------------------------------------------------------------- |
| `packages/shared/src/types/skill-docs.ts`                   | 新規 | ドキュメント生成型定義（5インターフェース）                      |
| `packages/shared/src/types/index.ts`                        | 修正 | `skill-docs` re-export 追加                                      |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | 新規 | ドキュメント生成サービス（generate/preview/export）              |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | 修正 | `registerSkillDocsHandlers` / `unregisterSkillDocsHandlers` 追加 |
| `apps/desktop/src/main/ipc/index.ts`                        | 修正 | SkillDocGenerator インスタンス化と登録                           |
| `apps/desktop/src/preload/channels.ts`                      | 修正 | `SKILL_DOCS_*` 4チャネル定数追加                                 |
| `apps/desktop/src/preload/skill-api.ts`                     | 修正 | docs 操作4メソッド追加（SkillAPI 型 + 実装）                     |

### デフォルトテンプレート構成

`DEFAULT_DOC_TEMPLATE` は7セクション構成:

| #   | セクションID      | タイトル               | 必須 |
| --- | ----------------- | ---------------------- | ---- |
| 1   | `overview`        | 概要                   | 必須 |
| 2   | `getting-started` | はじめに               | 必須 |
| 3   | `configuration`   | 設定                   | 任意 |
| 4   | `api`             | API リファレンス       | 任意 |
| 5   | `examples`        | 使用例                 | 任意 |
| 6   | `troubleshooting` | トラブルシューティング | 任意 |
| 7   | `changelog`       | 変更履歴               | 任意 |

`includeExamples: false` の場合、`examples` セクションはスキップされます。
`includeApiReference: false` の場合、`api` セクションはスキップされます。
