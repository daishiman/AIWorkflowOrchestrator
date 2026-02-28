# TASK-9I Phase 1: 要件定義書

## メタ情報

| 項目      | 値                                                          |
| --------- | ----------------------------------------------------------- |
| タスク ID | TASK-9I                                                     |
| 機能名    | スキルドキュメント自動生成                                  |
| Phase     | 1 — 要件定義                                                |
| 作成日    | 2026-02-28                                                  |
| 定義場所  | `packages/shared/src/types/skill-docs.ts`（共有型定義）     |
| 実装場所  | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` |

---

## 1. 機能要件（FR）

| ID    | 要件                                                                                                                                                  | 優先度 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `DocGenerationRequest` を受け取り、スキルの SKILL.md・references/・agents/・schemas/ を解析して `GeneratedDoc` を返す                                 | 高     |
| FR-02 | 出力形式として `markdown`・`html`・`pdf` の3形式をサポートする                                                                                        | 高     |
| FR-03 | 言語オプション `ja`（日本語）と `en`（英語）でドキュメント全文の言語を切り替える                                                                      | 高     |
| FR-04 | `includeExamples: true` の場合、スキルの使用例セクションを生成に含める                                                                                | 中     |
| FR-05 | `includeApiReference: true` の場合、スキルの API リファレンスセクションを生成に含める                                                                 | 中     |
| FR-06 | `customSections` 配列で指定された追加セクション名に対応する LLM 生成コンテンツをデフォルトテンプレートに追加して生成する                              | 中     |
| FR-07 | `preview()` メソッドでテンプレート適用済みドキュメントのプレビューを生成する（ファイル出力なし、markdown 固定）                                       | 高     |
| FR-08 | `exportToFile()` メソッドで `GeneratedDoc` を指定パスにファイルとして書き出す（markdown: そのまま、html: Markdown→HTML 変換後、pdf: HTML→PDF 変換後） | 高     |
| FR-09 | デフォルトテンプレートとして7セクション構成（overview/getting-started/configuration/api/examples/troubleshooting/changelog）を提供する                | 高     |
| FR-10 | `DocTemplate[]` 形式でテンプレート一覧を IPC 経由で取得できる                                                                                         | 中     |

### FR 詳細

#### FR-01: ドキュメント生成

`SkillDocGenerator.generate()` メソッドが `DocGenerationRequest` を受け取り、以下のステップでドキュメントを生成する。

1. `analyzeSkillStructure()` でスキルの構造ファイルを読み取る（SKILL.md、references/、agents/、schemas/）
2. デフォルトテンプレート + customSections に基づきセクション一覧を決定する
3. 各セクションを LLM query 関数で逐次生成する
4. `outputFormat` に応じてフォーマット変換する（html: Markdown→HTML、pdf: Markdown→HTML→PDF）
5. `GeneratedDoc` を構築して返却する（generatedAt: ISO 8601 文字列、wordCount: content の総文字数）

#### FR-02: 3形式サポート

| 形式       | 変換処理                                |
| ---------- | --------------------------------------- |
| `markdown` | そのまま（変換なし）                    |
| `html`     | `convertToHtml()` で Markdown→HTML 変換 |
| `pdf`      | `convertToPdf()` で HTML→PDF 変換       |

#### FR-07: プレビュー生成

- `preview(skillName, template?)` メソッドで呼び出す
- テンプレート未指定時はデフォルトテンプレート（7セクション）を使用する
- 出力形式は `markdown` 固定
- ファイルシステムへの書き込みは発生しない
- 内部的には `generate()` にデフォルトリクエストを構築して委譲する

#### FR-09: デフォルトテンプレート 7セクション構成

| セクション ID     | タイトル               | 必須  |
| ----------------- | ---------------------- | ----- |
| `overview`        | 概要                   | true  |
| `getting-started` | はじめに               | true  |
| `configuration`   | 設定                   | false |
| `api`             | API リファレンス       | false |
| `examples`        | 使用例                 | false |
| `troubleshooting` | トラブルシューティング | false |
| `changelog`       | 変更履歴               | false |

---

## 2. 非機能要件（NFR）

| ID     | 要件                                                                                                             | 優先度 | 参照                              |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------- |
| NFR-01 | 全 IPC ハンドラで `validateIpcSender()` による送信元ウィンドウ検証を実行する                                     | 高     | `security-electron-ipc.md`        |
| NFR-02 | 文字列引数に P42 準拠3段バリデーション（typeof → 空文字列 → trim()）を適用する                                   | 高     | `06-known-pitfalls.md#P42`        |
| NFR-03 | エラーレスポンスは `sanitizeErrorMessage()` でパス・機密情報をマスクする                                         | 高     | `security-electron-ipc.md`        |
| NFR-04 | IPC レスポンスは `{ success: boolean, data?: T, error?: string }` 形式で統一する                                 | 高     | `api-ipc-agent.md`                |
| NFR-05 | LLM query 関数を DI（Constructor Injection）で受け取り、テスト時にモック差し替えを可能にする                     | 高     | `06-known-pitfalls.md#P34`        |
| NFR-06 | ドキュメント生成処理（LLM クエリ含む）は7セクション・平均的なスキル構造の場合に3秒以内で完了する                 | 中     | --                                |
| NFR-07 | Date 型は IPC 境界で ISO 8601 文字列（`string`）として送受信する                                                 | 高     | IPC シリアライズ方針              |
| NFR-08 | `exportToFile()` の出力先パスに対してパストラバーサル攻撃を防止するバリデーションを実施する                      | 高     | `security-electron-ipc.md`        |
| NFR-09 | テンプレートの `required: true` セクションは生成時にスキップ不可とし、生成失敗時はエラーを返す                   | 中     | `error-handling.md`               |
| NFR-10 | チャネル名は `IPC_CHANNELS` 定数で管理し、文字列リテラルでのハードコードを禁止する                               | 高     | `06-known-pitfalls.md#P27`        |
| NFR-11 | `outputFormat` 引数は許可値リスト（`"markdown"`, `"html"`, `"pdf"`）で検証し、不正値を拒否する                   | 高     | `security-electron-ipc.md`        |
| NFR-12 | `language` 引数は許可値リスト（`"ja"`, `"en"`）で検証し、不正値を拒否する                                        | 高     | `security-electron-ipc.md`        |
| NFR-13 | IPCハンドラの引数名はPreload側で渡す値のセマンティクスと一致させる（P45対策）                                    | 高     | `06-known-pitfalls.md#P45`        |
| NFR-14 | IPCハンドラは `registerSkillDocsHandlers()` / `unregisterSkillDocsHandlers()` の独立関数として実装する（P5対策） | 高     | `06-known-pitfalls.md#P5`         |
| NFR-15 | 共有型定義は `packages/shared/src/types/skill-docs.ts` に配置し、`index.ts` から re-export する                  | 高     | `01-architecture.md#モノレポ構造` |
| NFR-16 | 既存テスト（9000件以上）が全てPASSする状態を維持する                                                             | 高     | --                                |

---

## 3. IPC チャネル定義

### 3.1 チャネル一覧

| チャネル               | メソッド | 説明                           |
| ---------------------- | -------- | ------------------------------ |
| `skill:docs:generate`  | `handle` | LLM を使ってドキュメント生成   |
| `skill:docs:preview`   | `handle` | テンプレート適用済みプレビュー |
| `skill:docs:export`    | `handle` | ファイルエクスポート           |
| `skill:docs:templates` | `handle` | テンプレート一覧取得           |

### 3.2 チャネル詳細

#### skill:docs:generate

| 項目   | 定義                                                                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 引数   | `DocGenerationRequest { skillName: string, outputFormat: "markdown" \| "html" \| "pdf", includeExamples: boolean, includeApiReference: boolean, language: "ja" \| "en", customSections?: string[] }` |
| 戻り値 | `{ success: true, data: GeneratedDoc }` / `{ success: false, error: string }`                                                                                                                        |

#### skill:docs:preview

| 項目   | 定義                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| 引数   | `{ skillName: string, template?: DocTemplate }`                               |
| 戻り値 | `{ success: true, data: GeneratedDoc }` / `{ success: false, error: string }` |

#### skill:docs:export

| 項目   | 定義                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 引数   | `{ doc: GeneratedDoc, outputPath: string }`                                |
| 戻り値 | `{ success: true, data: undefined }` / `{ success: false, error: string }` |

#### skill:docs:templates

| 項目   | 定義                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| 引数   | なし                                                                           |
| 戻り値 | `{ success: true, data: DocTemplate[] }` / `{ success: false, error: string }` |

---

## 4. 型定義

### 4.1 型定義一覧

全型定義は `packages/shared/src/types/skill-docs.ts` に配置し、`index.ts` から re-export する。

| 型名                   | 説明                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `DocGenerationRequest` | 生成リクエスト（skillName, outputFormat, language, includeExamples, includeApiReference, customSections） |
| `GeneratedDoc`         | 生成結果（skillName, format, content, sections, generatedAt, wordCount）                                  |
| `DocSection`           | セクション情報（id, title, content, order）                                                               |
| `DocTemplate`          | テンプレート定義（id, name, description, sections）                                                       |
| `TemplateSection`      | テンプレートセクション（id, title, prompt, required）                                                     |

### 4.2 型定義詳細

```typescript
/** ドキュメント生成リクエスト */
export interface DocGenerationRequest {
  skillName: string;
  outputFormat: "markdown" | "html" | "pdf";
  includeExamples: boolean;
  includeApiReference: boolean;
  language: "ja" | "en";
  customSections?: string[];
}

/** 生成済みドキュメント */
export interface GeneratedDoc {
  skillName: string;
  format: "markdown" | "html" | "pdf";
  content: string;
  sections: DocSection[];
  generatedAt: string; // ISO 8601
  wordCount: number;
}

/** ドキュメントセクション */
export interface DocSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

/** ドキュメントテンプレート */
export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
}

/** テンプレートセクション定義 */
export interface TemplateSection {
  id: string;
  title: string;
  prompt: string;
  required: boolean;
}
```

---

## 5. アーキテクチャ層別要件

| 層           | 要件                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Main Process | `SkillDocGenerator` を `SkillService` の L2 コンポーネントとして配置。LLM query 関数を Constructor Injection で受け取る |
| IPC 通信     | 4チャネルを `registerSkillDocsHandlers()` で一括登録。`validateIpcSender` + P42 バリデーション + 許可値チェック必須     |
| Preload      | `SkillAPI` に docs 操作4メソッドを追加。`safeInvokeUnwrap` パターン使用。`ALLOWED_INVOKE_CHANNELS` に4チャネル登録      |
| Shared Types | `packages/shared/src/types/skill-docs.ts` に全型定義を配置。`index.ts` から re-export                                   |
| Renderer     | 変更なし（UI は TASK-030 のスコープ）                                                                                   |

---

## 6. データフロー

```
Renderer → Preload(safeInvokeUnwrap) → IPC Handler(4層セキュリティ) → SkillDocGenerator → LLM Service / FileSystem
```

### セキュリティ4層構造

| Layer | 処理                                      | 対応 NFR               |
| ----- | ----------------------------------------- | ---------------------- |
| 1     | `validateIpcSender()` 送信元検証          | NFR-01                 |
| 2     | P42 準拠3段バリデーション                 | NFR-02, NFR-11, NFR-12 |
| 3     | 内部サービス実行                          | FR-01 -- FR-10         |
| 4     | `sanitizeErrorMessage()` エラーサニタイズ | NFR-03                 |
