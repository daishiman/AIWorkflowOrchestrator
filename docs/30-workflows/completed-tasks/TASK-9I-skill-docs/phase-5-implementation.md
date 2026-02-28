# Phase 5: 実装（TDD: Green）— TASK-9I スキルドキュメント生成

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| 機能名     | TASK-9I-skill-docs                               |
| 作成日     | 2026-02-28                                       |
| 前提Phase  | Phase 4（テスト作成・Red状態確認）               |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

Phase 4 で作成した全テスト（67テスト）を通すための**最小限のプロダクションコード**を実装し、全テストが **Green 状態**（成功）であることを確認する。

## 実行タスク

### Task 1: 型定義実装

#### 1.1 ドキュメント生成型定義

**対象ファイル**: `packages/shared/src/types/skill-docs.ts`（新規作成）

以下のインターフェースを定義する:

| 型名                   | 説明                   | 必須フィールド                                                                                                      |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `DocGenerationRequest` | ドキュメント生成要求   | skillName, outputFormat（`"markdown" \| "html"`）, includeExamples, includeApiReference, language（`"ja" \| "en"`） |
| `GeneratedDoc`         | 生成済みドキュメント   | skillName, format（`"markdown" \| "html"`）, content, sections, generatedAt, wordCount                              |
| `DocSection`           | ドキュメントセクション | id, title, content, order                                                                                           |
| `DocTemplate`          | テンプレート定義       | id, name, description, sections                                                                                     |
| `TemplateSection`      | テンプレートセクション | id, title, prompt, required                                                                                         |

**オプショナルフィールド**:

| 型名                   | オプショナルフィールド       |
| ---------------------- | ---------------------------- |
| `DocGenerationRequest` | customSections（`string[]`） |

**IPC シリアライズ方針**:

- 日時フィールド（generatedAt）は `string`（ISO 8601）で定義する
- Main Process 内部では Date オブジェクトを使用し、IPC 境界で `.toISOString()` に変換する

#### 1.2 re-export 追加

**対象ファイル**: `packages/shared/src/types/index.ts`

```typescript
export * from "./skill-docs.js";
```

---

### Task 2: SkillDocGenerator 実装

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`（新規作成）

#### 2.1 クラス構成

```
SkillDocGenerator
├── constructor(queryFn, skillFileManager)
├── async generate(request: DocGenerationRequest): Promise<GeneratedDoc>
├── async preview(skillName: string, template?: DocTemplate): Promise<GeneratedDoc>
├── async exportToFile(doc: GeneratedDoc, outputPath: string): Promise<void>
├── private async analyzeSkillStructure(skillName: string): Promise<string>
├── private async generateSection(sectionConfig, skillStructure, language): Promise<DocSection>
├── private convertToHtml(markdownContent: string): string
└── private validateOutputPath(outputPath: string): void
```

#### 2.2 各メソッドの実装仕様

##### constructor

| 項目     | 仕様                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| 引数     | `queryFn: (prompt: string) => Promise<{ content: string }>`, `skillFileManager: SkillFileManager` |
| パターン | Constructor Injection（P34準拠: 生成時点で全依存が利用可能）                                      |

##### generate

| 項目           | 仕様                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| バリデーション | outputFormat が `"markdown"` / `"html"` のいずれかであることを検証。不正値で Error をスロー                  |
| スキル確認     | `skillFileManager.skillExists(skillName)` で存在確認。不在で `"Skill not found: {skillName}"` Error をスロー |
| 構造解析       | `analyzeSkillStructure(skillName)` でスキルの SKILL.md・references/ を解析                                   |
| セクション生成 | デフォルト7セクション（概要・使い方・設定・API・トラブルシューティング・変更履歴・ライセンス）を LLM で生成  |
| examples       | `includeExamples: true` の場合のみ使用例セクションを追加生成                                                 |
| apiReference   | `includeApiReference: true` の場合のみ API リファレンスセクションを追加生成                                  |
| customSections | `customSections` 配列の各セクション名に対して LLM で追加コンテンツを生成                                     |
| HTML 変換      | `outputFormat === "html"` の場合、全セクション生成後に `convertToHtml()` で変換                              |
| generatedAt    | `new Date().toISOString()` で現在時刻を ISO 8601 文字列として設定                                            |
| wordCount      | 全セクション content の合計文字数を算出                                                                      |
| タイムアウト   | LLM queryFn の各呼び出しに 30 秒のタイムアウトを設定。超過でタイムアウト Error をスロー                      |
| 戻り値         | `GeneratedDoc`（sections は order 昇順で連番）                                                               |

##### preview

| 項目         | 仕様                                                        |
| ------------ | ----------------------------------------------------------- |
| テンプレート | 未指定の場合はデフォルトテンプレートを使用                  |
| 生成         | テンプレートの `sections` に従って各セクションを LLM で生成 |
| required     | `required: true` のセクションは生成失敗時にエラーをスロー   |
| ファイル出力 | ファイルシステムへの書き込みは実行しない（プレビューのみ）  |
| 戻り値       | `GeneratedDoc`（format は `"markdown"` 固定）               |

##### exportToFile

| 項目               | 仕様                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| パスバリデーション | `validateOutputPath()` でパストラバーサル攻撃を検出。`..` を含むパスを拒否     |
| ファイル書き出し   | `fs.promises.writeFile(outputPath, doc.content, "utf-8")` でファイルを書き出す |
| エラー伝播         | `fs.writeFile` のエラーはそのまま上位に伝播する                                |

##### analyzeSkillStructure

| 項目         | 仕様                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| 読み取り     | `skillFileManager.readSkillFile(skillName)` で SKILL.md の内容を取得                  |
| ファイル一覧 | `skillFileManager.listSkillFiles(skillName)` でスキルディレクトリのファイル一覧を取得 |
| 戻り値       | スキル構造を表す文字列（SKILL.md の内容 + ファイル一覧）                              |

##### convertToHtml

| 項目 | 仕様                                                                   |
| ---- | ---------------------------------------------------------------------- |
| 変換 | Markdown 文字列を HTML 文字列に変換する                                |
| 出力 | `<html><head></head><body>{変換済みHTML}</body></html>` 形式で返却する |

##### validateOutputPath

| 項目   | 仕様                                                  |
| ------ | ----------------------------------------------------- |
| 検証   | パスに `..` セグメントが含まれる場合に Error をスロー |
| 正規化 | `path.resolve()` でパスを正規化した後に検証する       |

---

### Task 3: チャンネル定数追加

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

`IPC_CHANNELS` オブジェクトに以下の4定数を追加する:

```typescript
// Skill docs operations (TASK-9I)
SKILL_DOCS_GENERATE: "skill:docs:generate",
SKILL_DOCS_PREVIEW: "skill:docs:preview",
SKILL_DOCS_EXPORT: "skill:docs:export",
SKILL_DOCS_TEMPLATES: "skill:docs:templates",
```

`ALLOWED_INVOKE_CHANNELS` 配列に以下を追加する:

```typescript
// Skill docs channels (TASK-9I)
IPC_CHANNELS.SKILL_DOCS_GENERATE,
IPC_CHANNELS.SKILL_DOCS_PREVIEW,
IPC_CHANNELS.SKILL_DOCS_EXPORT,
IPC_CHANNELS.SKILL_DOCS_TEMPLATES,
```

**注意**: `ALLOWED_ON_CHANNELS` への追加は不要（全て invoke パターンのため）。

---

### Task 4: IPC ハンドラー実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`（既存ファイルへ追記）

#### 4.1 ファイル構成

```
apps/desktop/src/main/ipc/skillHandlers.ts
├── import 宣言
├── registerSkillDocsHandlers(mainWindow, skillDocGenerator)
│   ├── skill:docs:generate ハンドラー
│   ├── skill:docs:preview ハンドラー
│   ├── skill:docs:export ハンドラー
│   └── skill:docs:templates ハンドラー
└── unregisterSkillDocsHandlers()
```

#### 4.2 関数シグネチャ

```typescript
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels.js";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator.js";
import type { SkillDocGenerator } from "../services/skill/SkillDocGenerator.js";

export function registerSkillDocsHandlers(
  mainWindow: BrowserWindow,
  skillDocGenerator: SkillDocGenerator,
): void;

export function unregisterSkillDocsHandlers(): void;
```

#### 4.3 共通ハンドラーパターン

全ハンドラーは以下の共通パターンに従う:

```
1. validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })
2. validation.valid === false → throw toIPCValidationError(validation)
3. 引数バリデーション（P42準拠: 型チェック → 空文字列 → .trim() 空文字列）
4. サービスメソッド呼び出し
5. { success: true, data? } を返却（Date → ISO 8601 変換）
6. 既知のエラー → { success: false, error: error.message }
7. 予期しないエラー → { success: false, error: "Internal error" }
```

**注意**: `validateStringArg` 共通関数（skillHandlers.ts L592-610）を再利用する。

#### 4.4 各ハンドラーの実装仕様

##### skill:docs:generate

| 項目           | 値                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_DOCS_GENERATE`                                                                                                             |
| 引数           | `DocGenerationRequest`（オブジェクト形式）                                                                                                     |
| バリデーション | skillName: `validateStringArg` で非空文字列（P42準拠）、outputFormat: `"markdown"` / `"html"` のいずれか、language: `"ja"` / `"en"` のいずれか |
| 呼び出し       | `skillDocGenerator.generate(request)`                                                                                                          |
| 成功レスポンス | `{ success: true, data: GeneratedDoc }`                                                                                                        |

##### skill:docs:preview

| 項目           | 値                                                     |
| -------------- | ------------------------------------------------------ |
| チャンネル     | `IPC_CHANNELS.SKILL_DOCS_PREVIEW`                      |
| 引数           | `{ skillName: string, template?: DocTemplate }`        |
| バリデーション | skillName: `validateStringArg` で非空文字列（P42準拠） |
| 呼び出し       | `skillDocGenerator.preview(skillName, template)`       |
| 成功レスポンス | `{ success: true, data: GeneratedDoc }`                |

##### skill:docs:export

| 項目           | 値                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_DOCS_EXPORT`                                                                         |
| 引数           | `{ doc: GeneratedDoc, outputPath: string }`                                                              |
| バリデーション | outputPath: `validateStringArg` で非空文字列（P42準拠）、doc: 非 null オブジェクト、パストラバーサル検証 |
| 呼び出し       | `skillDocGenerator.exportToFile(doc, outputPath)`                                                        |
| 成功レスポンス | `{ success: true }`                                                                                      |

##### skill:docs:templates

| 項目           | 値                                       |
| -------------- | ---------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_DOCS_TEMPLATES`      |
| 引数           | なし                                     |
| 呼び出し       | デフォルトテンプレート配列を返却         |
| 成功レスポンス | `{ success: true, data: DocTemplate[] }` |

#### 4.5 エラーハンドリング

```typescript
catch (error) {
  if (error instanceof Error && error.message.startsWith("Skill not found")) {
    return { success: false, error: error.message };
  }
  if (error instanceof Error && error.message.startsWith("Invalid output path")) {
    return { success: false, error: error.message };
  }
  if (error instanceof Error && error.message.includes("Document generation failed")) {
    return { success: false, error: "Document generation failed" };
  }
  if (error instanceof Error && error.message.includes("Export failed")) {
    return { success: false, error: "Export failed" };
  }
  // 予期しないエラー: 内部情報を漏洩しない
  return { success: false, error: "Internal error" };
}
```

#### 4.6 unregisterSkillDocsHandlers

```typescript
export function unregisterSkillDocsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_GENERATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_PREVIEW);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_EXPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_TEMPLATES);
}
```

---

### Task 5: Preload API 拡張

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`

#### 5.1 docs メソッド追加

```typescript
// Skill docs operations (TASK-9I)
docsGenerate: (request: DocGenerationRequest) =>
  safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_GENERATE, request),

docsPreview: (skillName: string, template?: DocTemplate) =>
  safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_PREVIEW, { skillName, template }),

docsExport: (doc: GeneratedDoc, outputPath: string) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DOCS_EXPORT, { doc, outputPath }),

docsTemplates: () =>
  safeInvokeUnwrap<DocTemplate[]>(IPC_CHANNELS.SKILL_DOCS_TEMPLATES),
```

#### 5.2 型定義追加

**対象ファイル**: `apps/desktop/src/preload/types.ts`

SkillAPI インターフェースに以下のメソッドを追加する:

```typescript
// Skill docs operations (TASK-9I)
docsGenerate: (request: DocGenerationRequest) => Promise<GeneratedDoc>;
docsPreview: (skillName: string, template?: DocTemplate) =>
  Promise<GeneratedDoc>;
docsExport: (doc: GeneratedDoc, outputPath: string) => Promise<void>;
docsTemplates: () => Promise<DocTemplate[]>;
```

**注意**: `DocGenerationRequest`, `GeneratedDoc`, `DocTemplate` は `@repo/shared` からインポートする。型の二重定義を避ける（P23対策）。

---

### Task 6: アプリ初期化統合

**対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

#### 6.1 SkillDocGenerator インスタンス生成

アプリ初期化時（BrowserWindow 生成後）に以下を追加する:

```typescript
// SkillDocGenerator 初期化 (TASK-9I)
const skillDocGenerator = new SkillDocGenerator(queryFn, skillFileManager);
```

#### 6.2 IPC ハンドラー登録

既存の `registerAllIpcHandlers` 関数に以下を追加する:

```typescript
registerSkillDocsHandlers(mainWindow, skillDocGenerator);
```

#### 6.3 IPC ハンドラー解除

既存の `unregisterAllIpcHandlers` 関数に以下を追加する:

```typescript
unregisterSkillDocsHandlers();
```

---

## 既知の Pitfall 対策

| Pitfall ID | 内容                         | 対策                                                                                |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| P5         | リスナー二重登録             | `unregisterSkillDocsHandlers` で確実に全解除                                        |
| P19        | 型キャストによる検証バイパス | LLM レスポンスの型を実行時バリデーション                                            |
| P23        | 型二重定義の管理             | `DocGenerationRequest` 等を `@repo/shared` に配置し Preload と Main で同一参照      |
| P27        | ハードコード文字列の見落とし | 全チャンネル名に `IPC_CHANNELS` 定数を使用。実装後に grep で検証                    |
| P34        | 遅延初期化が必要な DI        | SkillDocGenerator は BrowserWindow 生成後に初期化（Constructor Injection で対応）   |
| P42        | .trim() バリデーション漏れ   | 全文字列引数に3段バリデーション（型チェック → 空文字列 → .trim() 空文字列）         |
| P44        | IPC インターフェース不整合   | ハンドラ引数と Preload 呼び出し形式を完全一致させる                                 |
| P45        | 引数命名の契約ドリフト       | 引数名を実際の値のセマンティクスに一致させる（skillName は名前、outputPath はパス） |

## アーキテクチャ層別実装テーブル

| レイヤー | ファイル                                                    | 変更内容                                    |
| -------- | ----------------------------------------------------------- | ------------------------------------------- |
| 共有型   | `packages/shared/src/types/skill-docs.ts`                   | 新規: 5インターフェース定義                 |
| 共有型   | `packages/shared/src/types/index.ts`                        | re-export 追加                              |
| Main     | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | 新規: ドキュメント生成サービス              |
| Main     | `apps/desktop/src/main/ipc/skillHandlers.ts`                | 既存拡張: 4ハンドラー + register/unregister |
| Main     | `apps/desktop/src/main/ipc/index.ts`                        | 初期化統合                                  |
| Preload  | `apps/desktop/src/preload/channels.ts`                      | 4チャンネル定数 + ホワイトリスト追加        |
| Preload  | `apps/desktop/src/preload/skill-api.ts`                     | 4メソッド追加（safeInvokeUnwrap パターン）  |
| Preload  | `apps/desktop/src/preload/types.ts`                         | SkillAPI 型に4メソッド追加                  |

## 参照資料

| 資料                                                                             | 用途                            |
| -------------------------------------------------------------------------------- | ------------------------------- |
| Phase 4 成果物（テストファイル3件）                                              | テストが Green になることを確認 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                     | 既存ハンドラーの実装パターン    |
| `apps/desktop/src/main/ipc/skillHandlers.ts` L592-610                            | `validateStringArg` 共通関数    |
| `apps/desktop/src/main/services/skill/SkillService.ts`                           | サービス層の実装パターン        |
| `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`                 | IPC 検証関数                    |
| `apps/desktop/src/preload/channels.ts`                                           | チャンネル定数追加位置          |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`             | IPC チャネル定義                |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`     | IPC セキュリティパターン        |
| `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力バリデーション規約          |
| `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`    | サービス層アーキテクチャ        |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`            | エラー処理方針                  |
| `.claude/rules/04-electron-security.md`                                          | セキュリティ原則                |

## 統合テスト連携

| 連携先                | 内容                                                         |
| --------------------- | ------------------------------------------------------------ |
| Phase 4（テスト作成） | 67件のテスト仕様を満たす最小実装を追加する                   |
| Phase 6（テスト拡充） | 実装後の不足分岐・境界値ケースを追加してカバレッジを拡張する |
| Phase 9（品質保証）   | lint/typecheck/coverage を通じて実装品質を確定する           |

## 多角的チェック観点

| 観点              | 確認事項                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| セキュリティ      | 4層セキュリティ構造（Sender 検証 → P42 バリデーション → 内部検証 → エラーサニタイズ）が全チャンネルで適用されている |
| パストラバーサル  | `exportToFile()` の outputPath に `..` を含むパスが拒否される                                                       |
| IPC 契約整合性    | ハンドラ側の引数型と Preload 側の呼び出し引数が完全に一致する（P44 対策）                                           |
| 引数命名一致      | ハンドラの引数名と実際に渡される値のセマンティクスが一致する（P45 対策）                                            |
| DI テスタビリティ | queryFn の Constructor Injection により LLM 依存をモック可能な設計である                                            |
| エラーサニタイズ  | 予期しないエラーで `"Internal error"` のみを返し、内部情報を漏洩しない                                              |
| 型安全            | `any` 型の使用がなく、全ての IPC 境界で型定義が存在する                                                             |

## 成果物

| 成果物                                                      | 説明                              |
| ----------------------------------------------------------- | --------------------------------- |
| `packages/shared/src/types/skill-docs.ts`                   | 新規: 型定義（5インターフェース） |
| `packages/shared/src/types/index.ts`                        | re-export 追加                    |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | 新規: ドキュメント生成サービス    |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | 既存拡張: IPC ハンドラー          |
| `apps/desktop/src/preload/channels.ts`                      | 4定数 + ホワイトリスト追加        |
| `apps/desktop/src/preload/skill-api.ts`                     | 4メソッド追加                     |
| `apps/desktop/src/preload/types.ts`                         | SkillAPI 型拡張                   |
| `apps/desktop/src/main/ipc/index.ts`                        | 初期化統合                        |

## 完了条件

- [ ] 4チャンネル定数が `preload/channels.ts` に定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS` に4チャンネルが追加されている
- [ ] `DocGenerationRequest` 等の型が `packages/shared/src/types/skill-docs.ts` に定義され、`index.ts` から re-export されている
- [ ] `SkillDocGenerator` が generate / preview / exportToFile メソッドを実装している
- [ ] `SkillDocGenerator` のコンストラクタが queryFn を DI で受け取っている（Constructor Injection）
- [ ] `generate()` が Markdown と HTML の2形式をサポートしている
- [ ] `generate()` が日本語と英語の切り替えをサポートしている
- [ ] `generate()` が includeExamples / includeApiReference / customSections を処理している
- [ ] `generate()` に 30 秒のタイムアウトが設定されている
- [ ] `exportToFile()` がパストラバーサル攻撃を拒否する
- [ ] 4つの IPC ハンドラーが `skillHandlers.ts` に実装されている
- [ ] 各ハンドラーで `validateIpcSender` による送信元検証が実施されている
- [ ] 各ハンドラーの引数バリデーションが P42 準拠3段バリデーションを実装している
- [ ] 既知エラーは `error.message` をそのまま返し、予期しないエラーは `"Internal error"` を返す
- [ ] Preload API に4メソッドが追加されている（`safeInvokeUnwrap` パターン）
- [ ] `unregisterSkillDocsHandlers` で4チャンネル全てが解除される
- [ ] ハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数のみ使用）
- [ ] `apps/desktop/src/main/ipc/index.ts` で SkillDocGenerator の初期化が統合されている
- [ ] Phase 4 の全テスト（67テスト）が **Green 状態**（成功）である
- [ ] `cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocGenerator` が全PASS
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.docs` が全PASS
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所のテストを追加する。
