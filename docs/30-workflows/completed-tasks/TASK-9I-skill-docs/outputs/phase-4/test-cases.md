# TASK-9I テストケース一覧 (Phase 4)

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| タスク ID  | TASK-9I-SKILL-DOCS |
| Phase      | 4 (テスト作成)     |
| 作成日     | 2026-02-28         |
| 総テスト数 | 64                 |

## 1. 型定義テスト (`skill-docs.test.ts`)

| ID   | テスト名                                              | カテゴリ | 期待結果                                       |
| ---- | ----------------------------------------------------- | -------- | ---------------------------------------------- |
| T-01 | DocGenerationRequest has required fields              | 型検証   | skillName, outputFormat, language が正しく代入 |
| T-02 | DocGenerationRequest supports optional customSections | 型検証   | customSections 配列が2要素で代入可能           |
| T-03 | GeneratedDoc has all required fields                  | 型検証   | 6つの必須フィールドが正しく代入                |
| T-04 | DocSection has required fields                        | 型検証   | id, title, content, order が正しく代入         |
| T-05 | DocTemplate has required fields                       | 型検証   | id, name, description, sections が正しく代入   |
| T-06 | TemplateSection has required fields                   | 型検証   | id, title, prompt, required が正しく代入       |
| T-07 | outputFormat accepts only markdown or html            | 型検証   | "markdown" と "html" の両方が代入可能          |
| T-08 | language accepts only ja or en                        | 型検証   | "ja" と "en" の両方が代入可能                  |

## 2. SkillDocGenerator テスト (`SkillDocGenerator.test.ts`)

### generate() テスト

| ID   | テスト名                                                | カテゴリ | 期待結果                                                |
| ---- | ------------------------------------------------------- | -------- | ------------------------------------------------------- |
| G-01 | returns GeneratedDoc with correct skillName             | ユニット | result.skillName === "test-skill"                       |
| G-02 | respects outputFormat "markdown"                        | ユニット | result.format === "markdown", HTML タグなし             |
| G-03 | converts to HTML when outputFormat is "html"            | ユニット | result.content に `<html>`, `<body>` を含む             |
| G-04 | includes examples section when includeExamples is true  | ユニット | sections に id="examples" が存在する                    |
| G-05 | excludes examples section when includeExamples is false | ユニット | sections に id="examples" が存在しない                  |
| G-06 | includes API section when includeApiReference is true   | ユニット | sections に id="api" が存在する                         |
| G-07 | excludes API section when includeApiReference is false  | ユニット | sections に id="api" が存在しない                       |
| G-08 | supports Japanese language                              | ユニット | LLM プロンプトに「日本語で回答してください」を含む      |
| G-09 | supports English language                               | ユニット | LLM プロンプトに "Please respond in English" を含む     |
| G-10 | handles customSections                                  | ユニット | カスタムセクション "faq", "best-practices" が生成される |
| G-11 | throws for invalid outputFormat                         | 異常系   | "outputFormat must be one of: markdown, html" エラー    |
| G-12 | throws when skill not found                             | 異常系   | "Skill not found: missing-skill" エラー                 |
| G-13 | calculates correct wordCount                            | ユニット | wordCount === セクション数 \* コンテンツ長              |
| G-14 | sets generatedAt as ISO 8601 string                     | ユニット | ISO 8601 形式の日時文字列                               |
| G-15 | sets correct section order                              | ユニット | sections[i].order === i（0始まり連番）                  |
| G-16 | handles LLM timeout                                     | 異常系   | 30秒後に "LLM query timeout" エラー                     |

### preview() テスト

| ID   | テスト名                                            | カテゴリ | 期待結果                                        |
| ---- | --------------------------------------------------- | -------- | ----------------------------------------------- |
| P-01 | returns markdown format always                      | ユニット | result.format === "markdown"                    |
| P-02 | uses DEFAULT_DOC_TEMPLATE when no template provided | ユニット | sections.length === 7（デフォルトテンプレート） |
| P-03 | uses custom template when provided                  | ユニット | カスタムテンプレートのセクションのみ生成        |
| P-04 | throws when skill not found                         | 異常系   | "Skill not found: unknown" エラー               |

### exportToFile() テスト

| ID   | テスト名                    | カテゴリ     | 期待結果                                              |
| ---- | --------------------------- | ------------ | ----------------------------------------------------- |
| E-01 | writes content to file      | ユニット     | fs.writeFile が正しい引数で呼ばれる                   |
| E-02 | rejects path traversal (..) | セキュリティ | "Invalid output path: path traversal detected" エラー |

### DEFAULT_DOC_TEMPLATE テスト

| ID   | テスト名         | カテゴリ | 期待結果                  |
| ---- | ---------------- | -------- | ------------------------- |
| D-01 | has 7 sections   | ユニット | sections.length === 7     |
| D-02 | has id "default" | ユニット | template.id === "default" |

## 3. IPC ハンドラテスト (`skillHandlers.docs.test.ts`)

### Sender 検証テスト

| ID   | テスト名                                     | カテゴリ     | 期待結果                                           |
| ---- | -------------------------------------------- | ------------ | -------------------------------------------------- |
| H-01 | generate は sender 検証失敗時にエラーを返す  | セキュリティ | { success: false, error: "Unauthorized IPC call" } |
| H-02 | preview は sender 検証失敗時にエラーを返す   | セキュリティ | 同上                                               |
| H-03 | export は sender 検証失敗時にエラーを返す    | セキュリティ | 同上                                               |
| H-04 | templates は sender 検証失敗時にエラーを返す | セキュリティ | 同上                                               |

### 引数バリデーションテスト

| ID   | テスト名                                                    | カテゴリ       | 期待結果                                                                 |
| ---- | ----------------------------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| H-05 | generate は null request を拒否する                         | バリデーション | { success: false, error: "request must be an object" }                   |
| H-06 | generate は skillName 未指定を拒否する                      | バリデーション | { success: false, error: "skillName must be a non-empty string" }        |
| H-07 | preview は null args を拒否する                             | バリデーション | { success: false, error: "args must be an object" }                      |
| H-08 | export は doc 未指定を拒否する                              | バリデーション | { success: false, error: "doc must be a valid object" }                  |
| H-09 | generate は無効な outputFormat を拒否する                   | バリデーション | { success: false, error: "outputFormat must be one of: markdown, html" } |
| H-10 | generate は無効な language を拒否する                       | バリデーション | { success: false, error: "language must be one of: ja, en" }             |
| H-11 | generate は boolean でない includeExamples を拒否する       | バリデーション | { success: false, error: "includeExamples must be a boolean" }           |
| H-15 | generate は customSections が文字列配列でない場合を拒否する | バリデーション | { success: false, error: "customSections must be an array of strings" }  |

### 正常系テスト

| ID    | テスト名                                          | カテゴリ | 期待結果                                        |
| ----- | ------------------------------------------------- | -------- | ----------------------------------------------- |
| H-12  | generate は正常なリクエストで成功レスポンスを返す | ユニット | { success: true, data: doc }                    |
| H-13  | preview は正常なリクエストで成功レスポンスを返す  | ユニット | { success: true, data: doc }                    |
| H-14a | export は正常なリクエストで成功レスポンスを返す   | ユニット | { success: true }                               |
| H-14b | templates は DEFAULT_DOC_TEMPLATE を返す          | ユニット | { success: true, data: [DEFAULT_DOC_TEMPLATE] } |

### セキュリティ・エラーハンドリングテスト

| ID   | テスト名                                | カテゴリ     | 期待結果                                          |
| ---- | --------------------------------------- | ------------ | ------------------------------------------------- |
| H-16 | export はパストラバーサル(..)を拒否する | セキュリティ | { success: false, error: "Invalid output path" }  |
| H-17 | generate はスキル未発見時にエラーを返す | エラー処理   | { success: false, error: "Skill not found: ..." } |

### P42 バリデーションテスト

| ID   | テスト名                                       | カテゴリ | 期待結果                                                          |
| ---- | ---------------------------------------------- | -------- | ----------------------------------------------------------------- |
| H-18 | generate は空文字列 skillName を拒否する       | P42準拠  | { success: false, error: "skillName must be a non-empty string" } |
| H-19 | generate はスペースのみの skillName を拒否する | P42準拠  | 同上                                                              |
| H-20 | preview はスペースのみの skillName を拒否する  | P42準拠  | 同上                                                              |

### ハンドラ解除テスト

| ID   | テスト名                                  | カテゴリ | 期待結果                                     |
| ---- | ----------------------------------------- | -------- | -------------------------------------------- |
| H-21 | SKILL_DOCS_GENERATE チャンネルを解除する  | ユニット | removeHandler が正しいチャンネル名で呼ばれる |
| H-22 | SKILL_DOCS_PREVIEW チャンネルを解除する   | ユニット | 同上                                         |
| H-23 | SKILL_DOCS_EXPORT チャンネルを解除する    | ユニット | 同上                                         |
| H-24 | SKILL_DOCS_TEMPLATES チャンネルを解除する | ユニット | 同上                                         |

### 追加テスト

| ID  | テスト名                                                        | カテゴリ       | 期待結果                                            |
| --- | --------------------------------------------------------------- | -------------- | --------------------------------------------------- |
| -   | 4つの docs ハンドラーを登録する                                 | ユニット       | handlerMap に4チャンネルが登録されている            |
| -   | 全4チャンネルを一括解除する                                     | ユニット       | removeHandler が4回呼ばれる                         |
| -   | generate の getAllowedWindows コールバック検証 (P41)            | セキュリティ   | コールバックが定義され、ウィンドウ配列を返す        |
| -   | generate は予期しない例外で Internal error を返す               | エラー処理     | { success: false, error: "Internal error" }         |
| -   | preview はスキル未発見時にエラーを返す                          | エラー処理     | { success: false, error: "Skill not found: ..." }   |
| -   | export は outputPath 未指定を拒否する                           | バリデーション | { success: false, error: "outputPath must be..." }  |
| -   | generate は includeApiReference が boolean でない場合を拒否する | バリデーション | { success: false, error: "includeApiReference..." } |
