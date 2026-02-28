# TASK-9I Phase 1: 受け入れ基準

## メタ情報

| 項目      | 値                         |
| --------- | -------------------------- |
| タスク ID | TASK-9I                    |
| 機能名    | スキルドキュメント自動生成 |
| Phase     | 1 — 要件定義               |
| 作成日    | 2026-02-28                 |
| 基準数    | AC-01 -- AC-15（15件）     |

---

## AC-01: Markdown 形式でのドキュメント生成

- **Given**: スキル "test-skill" が `.claude/skills/` に存在する
- **When**: `DocGenerationRequest { skillName: "test-skill", outputFormat: "markdown", includeExamples: true, includeApiReference: true, language: "ja" }` で `generate()` を呼び出す
- **Then**: `GeneratedDoc` が返却される
- **And**: `generatedAt` は ISO 8601 形式の文字列である（例: `"2026-02-28T12:00:00.000Z"`）
- **And**: `sections` 配列は1件以上のセクションを含む
- **And**: 各セクションの `content` は空文字列ではない
- **And**: `wordCount` は `content` の総文字数と一致する

**関連 FR**: FR-01（ドキュメント生成）

---

## AC-02: HTML 形式でのドキュメント生成

- **Given**: スキル "test-skill" が `.claude/skills/` に存在する
- **When**: `DocGenerationRequest { skillName: "test-skill", outputFormat: "html", language: "ja", includeExamples: false, includeApiReference: false }` で `generate()` を呼び出す
- **Then**: `GeneratedDoc.format` は `"html"` である
- **And**: `GeneratedDoc.content` は有効な HTML 文字列である（`<html>` タグを含む）

**関連 FR**: FR-02（3形式サポート）

---

## AC-03: PDF 形式でのエクスポート

- **Given**: `GeneratedDoc`（format: `"pdf"`）が生成済みである
- **When**: `skill:docs:export` IPC チャネルで `outputPath: "/tmp/test-output.pdf"` を指定してエクスポートする
- **Then**: 指定パスに PDF ファイルが作成される
- **And**: ファイルサイズは 0 バイトより大きい

**関連 FR**: FR-02（3形式サポート）、FR-08（ファイルエクスポート）

---

## AC-04: 英語ドキュメント生成

- **Given**: スキル "test-skill" が `.claude/skills/` に存在する
- **When**: `DocGenerationRequest { skillName: "test-skill", outputFormat: "markdown", language: "en", includeExamples: false, includeApiReference: false }` で `generate()` を呼び出す
- **Then**: `GeneratedDoc` の各 `section.content` は英語で記述されている

**関連 FR**: FR-03（言語切り替え）

---

## AC-05: プレビュー生成（テンプレート未指定）

- **Given**: スキル "test-skill" が `.claude/skills/` に存在する
- **When**: `preview("test-skill")` を呼び出す（テンプレート未指定）
- **Then**: デフォルトテンプレート（7セクション）を使用した Markdown 形式の `GeneratedDoc` が返却される
- **And**: `GeneratedDoc.format` は `"markdown"` である
- **And**: `GeneratedDoc.sections` は7件のセクションを含む
- **And**: ファイルシステムへの書き込みは発生しない

**関連 FR**: FR-07（プレビュー生成）、FR-09（デフォルトテンプレート）

---

## AC-06: カスタムテンプレートによるプレビュー

- **Given**: カスタム `DocTemplate`（3セクション: 概要、使い方、API）が定義されている
- **When**: `preview("test-skill", customTemplate)` を呼び出す
- **Then**: `GeneratedDoc.sections` は正確に3件である
- **And**: 各セクションの `title` はテンプレートの `TemplateSection.title` と一致する

**関連 FR**: FR-07（プレビュー生成）

---

## AC-07: ファイルエクスポート（Markdown）

- **Given**: `GeneratedDoc`（format: `"markdown"`）が生成済みである
- **When**: `exportToFile(doc, "/valid/output/path.md")` を呼び出す
- **Then**: 指定パスに `content` がファイルとして書き出される
- **And**: ファイルの内容は `doc.content` と一致する

**関連 FR**: FR-08（ファイルエクスポート）

---

## AC-08: パストラバーサル防止

- **Given**: `GeneratedDoc` が生成済みである
- **When**: `exportToFile(doc, "../../etc/passwd")` を呼び出す
- **Then**: バリデーションエラー（code: `VALIDATION_ERROR`）が返される
- **And**: ファイルは書き出されない

**関連 NFR**: NFR-08（パストラバーサル防止）

---

## AC-09: テンプレート一覧取得

- **Given**: デフォルトテンプレートが1件以上登録されている
- **When**: `skill:docs:templates` チャネルを呼び出す
- **Then**: `{ success: true, data: DocTemplate[] }` が返却される
- **And**: 各テンプレートは以下のプロパティを持つ
  - `id`: string（空でない）
  - `name`: string（空でない）
  - `description`: string（空でない）
  - `sections`: TemplateSection[]（1件以上）
- **And**: `sections` の各要素は以下のプロパティを持つ
  - `id`: string（空でない）
  - `title`: string（空でない）
  - `prompt`: string（空でない）
  - `required`: boolean

**関連 FR**: FR-10（テンプレート一覧取得）

---

## AC-10: カスタムセクション追加

- **Given**: スキル "test-skill" が `.claude/skills/` に存在する
- **When**: `DocGenerationRequest { skillName: "test-skill", outputFormat: "markdown", language: "ja", includeExamples: true, includeApiReference: true, customSections: ["deployment", "monitoring"] }` で `generate()` を呼び出す
- **Then**: `GeneratedDoc.sections` はデフォルト7セクション + カスタム2セクションの計9セクションを含む
- **And**: カスタムセクションの `id` は `"deployment"` と `"monitoring"` である

**関連 FR**: FR-06（カスタムセクション追加）

---

## AC-11: 存在しないスキルへのリクエスト

- **Given**: スキル "nonexistent-skill" が `.claude/skills/` に存在しない
- **When**: `generate({ skillName: "nonexistent-skill", outputFormat: "markdown", language: "ja", includeExamples: false, includeApiReference: false })` を呼び出す
- **Then**: エラーレスポンス `{ success: false, error: "Skill not found: nonexistent-skill" }` が返される
- **And**: ドキュメント生成処理は実行されない

**関連 FR**: FR-01（ドキュメント生成）

---

## AC-12: IPC バリデーション（空文字列・スペースのみの skillName 拒否）

- **Given**: `skill:docs:generate` ハンドラが登録されている
- **When**: `skillName` に空文字列 `""` を送信する
- **Then**: `{ success: false, error: "skillName must be a non-empty string" }` が返却される
- **And**: ドキュメント生成処理は実行されない

- **Given**: `skill:docs:generate` ハンドラが登録されている
- **When**: `skillName` にスペースのみ `"   "` を送信する
- **Then**: `{ success: false, error: "skillName must be a non-empty string" }` が返却される
- **And**: ドキュメント生成処理は実行されない

**関連 NFR**: NFR-02（P42 準拠3段バリデーション）

---

## AC-13: IPC バリデーション（不正 outputFormat 拒否）

- **Given**: `skill:docs:generate` ハンドラが登録されている
- **When**: `outputFormat` に `"docx"`（許可値リスト外）を送信する
- **Then**: `{ success: false, error: "outputFormat must be one of: markdown, html, pdf" }` が返却される
- **And**: ドキュメント生成処理は実行されない

**関連 NFR**: NFR-11（outputFormat 許可値チェック）

---

## AC-14: IPC セキュリティ（送信元検証）

- **Given**: 不正な送信元からの IPC リクエストが送信される
- **When**: `skill:docs:generate` ハンドラが呼び出される
- **Then**: `validateIpcSender` が検証失敗を返す
- **And**: バリデーションエラーレスポンス `{ success: false, error: string }` が返される
- **And**: ドキュメント生成処理は実行されない

**関連 NFR**: NFR-01（送信元ウィンドウ検証）

---

## AC-15: LLM DI テスタビリティ

- **Given**: モック化された `queryFn`（固定テキスト `"mocked content"` を返す）で `SkillDocGenerator` を生成する
- **When**: ドキュメントを生成する（`generate()` 呼び出し）
- **Then**: モックの `queryFn` が各セクション生成時に呼ばれる
- **And**: 固定テキスト `"mocked content"` がセクション `content` に反映される
- **And**: 実際の LLM サービスへの通信は発生しない

**関連 NFR**: NFR-05（LLM query 関数 DI）

---

## 受け入れ基準サマリ

| AC-ID | テスト対象               | 関連 FR/NFR  | 優先度 |
| ----- | ------------------------ | ------------ | ------ |
| AC-01 | Markdown 生成            | FR-01        | 高     |
| AC-02 | HTML 生成                | FR-02        | 高     |
| AC-03 | PDF エクスポート         | FR-02, FR-08 | 高     |
| AC-04 | 英語生成                 | FR-03        | 高     |
| AC-05 | プレビュー（デフォルト） | FR-07, FR-09 | 高     |
| AC-06 | プレビュー（カスタム）   | FR-07        | 中     |
| AC-07 | Markdown エクスポート    | FR-08        | 高     |
| AC-08 | パストラバーサル防止     | NFR-08       | 高     |
| AC-09 | テンプレート一覧         | FR-10        | 中     |
| AC-10 | カスタムセクション       | FR-06        | 中     |
| AC-11 | スキル未検出             | FR-01        | 中     |
| AC-12 | 空文字列/スペースのみ    | NFR-02       | 高     |
| AC-13 | 不正 outputFormat        | NFR-11       | 高     |
| AC-14 | IPC Sender 検証          | NFR-01       | 高     |
| AC-15 | LLM DI テスタビリティ    | NFR-05       | 高     |
