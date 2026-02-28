# TASK-9I Phase 2: API 仕様書

## メタ情報

| 項目      | 値                         |
| --------- | -------------------------- |
| タスク ID | TASK-9I                    |
| 機能名    | スキルドキュメント自動生成 |
| Phase     | 2 — 設計                   |
| 作成日    | 2026-02-28                 |
| 前提      | Phase 1 要件定義書         |

---

## 1. IPC チャネル設計

### 1.1 チャネル定数定義

ファイルパス: `apps/desktop/src/preload/channels.ts`

```typescript
// IPC_CHANNELS に追加
SKILL_DOCS_GENERATE: "skill:docs:generate",
SKILL_DOCS_PREVIEW: "skill:docs:preview",
SKILL_DOCS_EXPORT: "skill:docs:export",
SKILL_DOCS_TEMPLATES: "skill:docs:templates",
```

ALLOWED_INVOKE_CHANNELS に4チャネルを登録:

```typescript
IPC_CHANNELS.SKILL_DOCS_GENERATE,
IPC_CHANNELS.SKILL_DOCS_PREVIEW,
IPC_CHANNELS.SKILL_DOCS_EXPORT,
IPC_CHANNELS.SKILL_DOCS_TEMPLATES,
```

### 1.2 skill:docs:generate

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| チャネル名 | `skill:docs:generate`                                                         |
| 定数       | `IPC_CHANNELS.SKILL_DOCS_GENERATE`                                            |
| メソッド   | `ipcMain.handle`                                                              |
| 引数型     | `DocGenerationRequest`（IPC 境界では `unknown` として受信後にバリデーション） |
| 戻り値型   | `{ success: true, data: GeneratedDoc }` / `{ success: false, error: string }` |
| 関連 FR    | FR-01, FR-02, FR-03, FR-04, FR-05, FR-06                                      |

#### 4層セキュリティ実装

**Layer 1: 送信元検証（NFR-01）**

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_DOCS_GENERATE, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

**Layer 2: 引数バリデーション（NFR-02, NFR-11, NFR-12）**

| フィールド            | 検証内容                                                             | エラーメッセージ                                     |
| --------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| `request`             | `typeof === "object"` かつ `!== null`                                | `"request must be an object"`                        |
| `skillName`           | P42準拠3段: `typeof string` → `!== ""` → `.trim() !== ""`            | `"skillName must be a non-empty string"`             |
| `outputFormat`        | 許可値: `["markdown", "html", "pdf"]`                                | `"outputFormat must be one of: markdown, html, pdf"` |
| `includeExamples`     | `typeof boolean`                                                     | `"includeExamples must be a boolean"`                |
| `includeApiReference` | `typeof boolean`                                                     | `"includeApiReference must be a boolean"`            |
| `language`            | 許可値: `["ja", "en"]`                                               | `"language must be one of: ja, en"`                  |
| `customSections`      | `undefined` 許容。存在時: `Array.isArray()` + 全要素 `typeof string` | `"customSections must be an array of strings"`       |

**Layer 3: サービス実行**

```typescript
const doc = await docGenerator.generate(req as DocGenerationRequest);
return { success: true, data: doc };
```

**Layer 4: エラーサニタイズ（NFR-03）**

```typescript
catch (error) {
  return { success: false, error: sanitizeErrorMessage(error) };
}
```

---

### 1.3 skill:docs:preview

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| チャネル名 | `skill:docs:preview`                                                          |
| 定数       | `IPC_CHANNELS.SKILL_DOCS_PREVIEW`                                             |
| メソッド   | `ipcMain.handle`                                                              |
| 引数型     | `{ skillName: string, template?: DocTemplate }`                               |
| 戻り値型   | `{ success: true, data: GeneratedDoc }` / `{ success: false, error: string }` |
| 関連 FR    | FR-07                                                                         |

#### 4層セキュリティ実装

**Layer 1: 送信元検証（NFR-01）**

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_DOCS_PREVIEW, {
  getAllowedWindows: () => [mainWindow],
});
```

**Layer 2: 引数バリデーション**

| フィールド  | 検証内容                                                  | エラーメッセージ                         |
| ----------- | --------------------------------------------------------- | ---------------------------------------- |
| `args`      | `typeof === "object"` かつ `!== null`                     | `"args must be an object"`               |
| `skillName` | P42準拠3段: `typeof string` → `!== ""` → `.trim() !== ""` | `"skillName must be a non-empty string"` |
| `template`  | `undefined` 許容。存在時: `typeof object` チェック        | --                                       |

**Layer 3: サービス実行**

```typescript
const doc = await docGenerator.preview(
  a.skillName as string,
  a.template as DocTemplate | undefined,
);
return { success: true, data: doc };
```

**Layer 4: エラーサニタイズ（NFR-03）**

```typescript
catch (error) {
  return { success: false, error: sanitizeErrorMessage(error) };
}
```

---

### 1.4 skill:docs:export

| 項目       | 値                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| チャネル名 | `skill:docs:export`                                                        |
| 定数       | `IPC_CHANNELS.SKILL_DOCS_EXPORT`                                           |
| メソッド   | `ipcMain.handle`                                                           |
| 引数型     | `{ doc: GeneratedDoc, outputPath: string }`                                |
| 戻り値型   | `{ success: true, data: undefined }` / `{ success: false, error: string }` |
| 関連 FR    | FR-08                                                                      |

#### 4層セキュリティ実装

**Layer 1: 送信元検証（NFR-01）**

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_DOCS_EXPORT, {
  getAllowedWindows: () => [mainWindow],
});
```

**Layer 2: 引数バリデーション**

| フィールド   | 検証内容                                                  | エラーメッセージ                          |
| ------------ | --------------------------------------------------------- | ----------------------------------------- |
| `args`       | `typeof === "object"` かつ `!== null`                     | `"args must be an object"`                |
| `doc`        | `typeof === "object"` かつ `!== null`                     | `"doc must be a GeneratedDoc object"`     |
| `outputPath` | P42準拠3段: `typeof string` → `!== ""` → `.trim() !== ""` | `"outputPath must be a non-empty string"` |

**Layer 3: サービス実行**

```typescript
await docGenerator.exportToFile(a.doc as GeneratedDoc, a.outputPath as string);
return { success: true, data: undefined };
```

**Layer 4: エラーサニタイズ（NFR-03）**

```typescript
catch (error) {
  return { success: false, error: sanitizeErrorMessage(error) };
}
```

---

### 1.5 skill:docs:templates

| 項目       | 値                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| チャネル名 | `skill:docs:templates`                                                         |
| 定数       | `IPC_CHANNELS.SKILL_DOCS_TEMPLATES`                                            |
| メソッド   | `ipcMain.handle`                                                               |
| 引数型     | なし                                                                           |
| 戻り値型   | `{ success: true, data: DocTemplate[] }` / `{ success: false, error: string }` |
| 関連 FR    | FR-10                                                                          |

#### 4層セキュリティ実装

**Layer 1: 送信元検証（NFR-01）**

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_DOCS_TEMPLATES, {
  getAllowedWindows: () => [mainWindow],
});
```

**Layer 2: 引数バリデーション**

引数なしのため、バリデーション不要。

**Layer 3: サービス実行**

```typescript
return { success: true, data: [DEFAULT_DOC_TEMPLATE] };
```

**Layer 4: エラーサニタイズ（NFR-03）**

```typescript
catch (error) {
  return { success: false, error: sanitizeErrorMessage(error) };
}
```

---

### 1.6 ハンドラ登録・解除関数（NFR-14, P5 対策）

ファイルパス: `apps/desktop/src/main/ipc/skillDocsHandlers.ts`

```typescript
export function registerSkillDocsHandlers(
  mainWindow: BrowserWindow,
  docGenerator: SkillDocGenerator,
): void {
  // 4チャネルの ipcMain.handle 登録
}

export function unregisterSkillDocsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_GENERATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_PREVIEW);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_EXPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_TEMPLATES);
}
```

---

## 2. Preload API 設計

### 2.1 SkillAPI 4メソッド

ファイルパス: `apps/desktop/src/preload/skill-api.ts`

全メソッドは `safeInvokeUnwrap` パターンで IPC 呼び出しをラップする。

#### docsGenerate

```typescript
docsGenerate: (request: DocGenerationRequest): Promise<GeneratedDoc> =>
  safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_GENERATE, request),
```

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| 引数     | `request: DocGenerationRequest`                 |
| 戻り値   | `Promise<GeneratedDoc>`                         |
| IPC 引数 | `request` オブジェクトをそのまま渡す            |
| P45 確認 | Preload: `request` → Handler: `request`（一致） |

#### docsPreview

```typescript
docsPreview: (skillName: string, template?: DocTemplate): Promise<GeneratedDoc> =>
  safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_PREVIEW, { skillName, template }),
```

| 項目     | 値                                                       |
| -------- | -------------------------------------------------------- |
| 引数     | `skillName: string`, `template?: DocTemplate`            |
| 戻り値   | `Promise<GeneratedDoc>`                                  |
| IPC 引数 | `{ skillName, template }` オブジェクトとして送信         |
| P45 確認 | Preload: `skillName` → Handler: `args.skillName`（一致） |

#### docsExport

```typescript
docsExport: (doc: GeneratedDoc, outputPath: string): Promise<void> =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DOCS_EXPORT, { doc, outputPath }),
```

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| 引数     | `doc: GeneratedDoc`, `outputPath: string`                  |
| 戻り値   | `Promise<void>`                                            |
| IPC 引数 | `{ doc, outputPath }` オブジェクトとして送信               |
| P45 確認 | Preload: `outputPath` → Handler: `args.outputPath`（一致） |

#### docsTemplates

```typescript
docsTemplates: (): Promise<DocTemplate[]> =>
  safeInvokeUnwrap<DocTemplate[]>(IPC_CHANNELS.SKILL_DOCS_TEMPLATES),
```

| 項目     | 値                       |
| -------- | ------------------------ |
| 引数     | なし                     |
| 戻り値   | `Promise<DocTemplate[]>` |
| IPC 引数 | なし                     |

### 2.2 Preload 型定義追加

ファイルパス: `apps/desktop/src/preload/types.ts`

```typescript
// SkillAPI 型に追加
docsGenerate: (request: DocGenerationRequest) => Promise<GeneratedDoc>;
docsPreview: (skillName: string, template?: DocTemplate) =>
  Promise<GeneratedDoc>;
docsExport: (doc: GeneratedDoc, outputPath: string) => Promise<void>;
docsTemplates: () => Promise<DocTemplate[]>;
```

---

## 3. 型定義設計（5インターフェース）

### 3.1 定義場所

ファイルパス: `packages/shared/src/types/skill-docs.ts`

re-export: `packages/shared/src/types/index.ts` から5型を export

### 3.2 DocGenerationRequest

```typescript
export interface DocGenerationRequest {
  /** 対象スキル名（P42準拠: 空文字列・スペースのみ不可） */
  skillName: string;

  /** 出力形式（NFR-11: 許可値リストで検証） */
  outputFormat: "markdown" | "html" | "pdf";

  /** 使用例セクションを含めるか（FR-04） */
  includeExamples: boolean;

  /** API リファレンスセクションを含めるか（FR-05） */
  includeApiReference: boolean;

  /** ドキュメント言語（NFR-12: 許可値リストで検証） */
  language: "ja" | "en";

  /** 追加セクション名（FR-06, 任意） */
  customSections?: string[];
}
```

### 3.3 GeneratedDoc

```typescript
export interface GeneratedDoc {
  /** 対象スキル名 */
  skillName: string;

  /** 出力形式 */
  format: "markdown" | "html" | "pdf";

  /** ドキュメント全文（format に応じた形式） */
  content: string;

  /** セクション一覧 */
  sections: DocSection[];

  /** 生成日時（ISO 8601 文字列, NFR-07） */
  generatedAt: string;

  /** 総文字数 */
  wordCount: number;
}
```

### 3.4 DocSection

```typescript
export interface DocSection {
  /** セクション識別子（テンプレートの TemplateSection.id と対応） */
  id: string;

  /** セクションタイトル */
  title: string;

  /** セクション本文 */
  content: string;

  /** 表示順序（0始まり） */
  order: number;
}
```

### 3.5 DocTemplate

```typescript
export interface DocTemplate {
  /** テンプレート識別子 */
  id: string;

  /** テンプレート名 */
  name: string;

  /** テンプレート説明 */
  description: string;

  /** テンプレートセクション定義 */
  sections: TemplateSection[];
}
```

### 3.6 TemplateSection

```typescript
export interface TemplateSection {
  /** セクション識別子 */
  id: string;

  /** セクションタイトル */
  title: string;

  /** LLM に渡すプロンプト */
  prompt: string;

  /** 必須セクションか（NFR-09: true の場合スキップ不可） */
  required: boolean;
}
```

---

## 4. エラーカテゴリ分類

### 4.1 エラーコード範囲

| カテゴリ               | コード範囲 | リトライ | 説明                                                         |
| ---------------------- | ---------- | -------- | ------------------------------------------------------------ |
| Validation Error       | 1000-1999  | 不可     | 引数不正、outputFormat 不正、language 不正、パストラバーサル |
| Business Error         | 2000-2999  | 不可     | スキル未検出                                                 |
| External Service Error | 3000-3999  | 可能     | LLM 通信エラー、LLM タイムアウト                             |
| Infrastructure Error   | 4000-4999  | 可能     | ファイル書き込み失敗、PDF 変換失敗                           |

### 4.2 エラーメッセージ一覧

| エラーメッセージ                                     | カテゴリ   | 発生箇所                  |
| ---------------------------------------------------- | ---------- | ------------------------- |
| `"request must be an object"`                        | Validation | Layer 2: generate         |
| `"skillName must be a non-empty string"`             | Validation | Layer 2: generate/preview |
| `"outputFormat must be one of: markdown, html, pdf"` | Validation | Layer 2: generate         |
| `"includeExamples must be a boolean"`                | Validation | Layer 2: generate         |
| `"includeApiReference must be a boolean"`            | Validation | Layer 2: generate         |
| `"language must be one of: ja, en"`                  | Validation | Layer 2: generate         |
| `"customSections must be an array of strings"`       | Validation | Layer 2: generate         |
| `"args must be an object"`                           | Validation | Layer 2: preview/export   |
| `"doc must be a GeneratedDoc object"`                | Validation | Layer 2: export           |
| `"outputPath must be a non-empty string"`            | Validation | Layer 2: export           |
| `"Skill not found: {skillName}"`                     | Business   | Layer 3: generate         |
| `"LLM query failed"`                                 | External   | Layer 3: generate         |
| `"File write failed"`                                | Infra      | Layer 3: export           |

### 4.3 IPC 統一レスポンス形式（NFR-04）

全チャネルで以下の形式を統一的に使用する。

```typescript
// 成功
interface IpcSuccessResult<T> {
  success: true;
  data: T;
}

// 失敗
interface IpcErrorResult {
  success: false;
  error: string;
}

type IpcResult<T> = IpcSuccessResult<T> | IpcErrorResult;
```

---

## 5. IPC 契約整合性チェック（P44/P45 対策）

### 5.1 引数名セマンティクス一致確認

| チャネル               | Preload 側の引数          | Handler 側のアクセス              | セマンティクス           | 結果 |
| ---------------------- | ------------------------- | --------------------------------- | ------------------------ | ---- |
| `skill:docs:generate`  | `request` (object)        | `request` (object)                | 生成リクエスト           | 一致 |
| `skill:docs:preview`   | `{ skillName, template }` | `args.skillName`, `args.template` | スキル名, テンプレート   | 一致 |
| `skill:docs:export`    | `{ doc, outputPath }`     | `args.doc`, `args.outputPath`     | ドキュメント, 出力先パス | 一致 |
| `skill:docs:templates` | なし                      | なし                              | --                       | 一致 |

### 5.2 P42 準拠3段バリデーション適用箇所

| チャネル              | フィールド   | typeof チェック | 空文字列チェック | trim チェック    |
| --------------------- | ------------ | --------------- | ---------------- | ---------------- |
| `skill:docs:generate` | `skillName`  | string          | `=== ""`         | `.trim() === ""` |
| `skill:docs:preview`  | `skillName`  | string          | `=== ""`         | `.trim() === ""` |
| `skill:docs:export`   | `outputPath` | string          | `=== ""`         | `.trim() === ""` |
