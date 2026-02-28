# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 3                                |
| 機能名    | TASK-9I-skill-docs               |
| 作成日    | 2026-02-28                       |
| 前提Phase | Phase 1: 要件定義, Phase 2: 設計 |
| 後続Phase | Phase 4: テスト作成              |
| 状態      | 未着手                           |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、実装開始前に品質ゲートを通過させる。要件カバレッジ、設計妥当性、セキュリティ、IPC 契約整合性、型設計品質、エラーハンドリングを検証する。

## 実行タスク

- 要件カバレッジ検証: FR-01〜FR-10 の全要件が設計でカバーされているか確認
- NFR カバレッジ検証: NFR-01〜NFR-16 の全非機能要件が設計に反映されているか確認
- アーキテクチャ品質検証: クラス設計・DI 設計・責務分離の妥当性を検証
- セキュリティ設計検証: IPC 送信元検証・バリデーション・パストラバーサル防止を検証
- IPC 契約整合性検証: ハンドラ引数型と Preload API 呼び出し型の一致を検証（P44/P45 対策）
- 型設計品質検証: 共有型定義と Preload 型定義の整合性を検証（P32 対策）
- PDF 変換設計検証: Markdown→HTML→PDF パイプラインの実現可能性を検証
- レビューゲート判定: PASS / MINOR / MAJOR を判定

## 参照資料

| 資料名                 | パス                                                                                | 説明                       |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                           | 要件定義成果物             |
| Phase 2 設計           | `phase-2-design.md`                                                                 | 設計成果物                 |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`        | IPC セキュリティ           |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`       | IPC 契約検証手順           |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`               | エラーハンドリング         |
| サービス層設計         | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`       | サービス層構造             |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                | P5/P27/P32/P34/P42/P44/P45 |
| TASK-9G 設計レビュー   | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-3-design-review.md` | 先行タスクレビュー         |

## 判定基準

| 判定              | 条件                           | 対応                                        |
| ----------------- | ------------------------------ | ------------------------------------------- |
| PASS              | 全レビュー観点で問題なし       | Phase 4 へ進行                              |
| MINOR             | 軽微な指摘あり（機能影響なし） | 指摘を未タスク仕様書に変換後 Phase 4 へ進行 |
| MAJOR（要件問題） | 要件の欠落・矛盾あり           | Phase 1 へ戻る                              |
| MAJOR（設計問題） | 設計上の重大な問題あり         | Phase 2 へ戻る                              |

## レビュー観点

### 1. 機能要件カバレッジ（FR → 設計マッピング）

| FR-ID | 要件概要               | 設計でのカバー箇所                                                                                                   | 結果 |
| ----- | ---------------------- | -------------------------------------------------------------------------------------------------------------------- | ---- |
| FR-01 | ドキュメント生成       | `SkillDocGenerator.generate()` → `analyzeSkillStructure()` + `generateSection() x N`                                 | —    |
| FR-02 | 3形式サポート          | `outputFormat: "markdown" \| "html" \| "pdf"`、`convertToHtml()` / `convertToPdf()`                                  | —    |
| FR-03 | 言語切り替え           | `language: "ja" \| "en"` → `generateSection()` の LLM プロンプトに言語指示を含める                                   | —    |
| FR-04 | examples セクション    | `includeExamples: true` → テンプレートの `examples` セクションを生成対象に含める                                     | —    |
| FR-05 | API リファレンス       | `includeApiReference: true` → テンプレートの `api` セクションを生成対象に含める                                      | —    |
| FR-06 | カスタムセクション追加 | `customSections` 配列 → デフォルトテンプレートにカスタム `TemplateSection` を追加                                    | —    |
| FR-07 | プレビュー生成         | `SkillDocGenerator.preview()` → markdown 固定、ファイル出力なし                                                      | —    |
| FR-08 | ファイルエクスポート   | `SkillDocGenerator.exportToFile()` → パストラバーサル検証 + `fs.writeFile` / `convertToPdf`                          | —    |
| FR-09 | デフォルトテンプレート | `DEFAULT_DOC_TEMPLATE`（7セクション: overview/getting-started/configuration/api/examples/troubleshooting/changelog） | —    |
| FR-10 | テンプレート一覧       | `skill:docs:templates` IPC チャネル → `[DEFAULT_DOC_TEMPLATE]` 返却                                                  | —    |

### 2. 非機能要件カバレッジ（NFR → 設計マッピング）

| NFR-ID | 要件概要                     | 設計でのカバー箇所                                                                               | 結果 |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| NFR-01 | 送信元検証                   | 全4ハンドラの Layer 1 で `validateIpcSender()` + `getAllowedWindows` 呼び出し                    | —    |
| NFR-02 | P42 準拠3段バリデーション    | 全文字列引数（skillName, outputPath）で `typeof` → `=== ""` → `.trim() === ""`                   | —    |
| NFR-03 | エラーサニタイズ             | 全ハンドラの Layer 4 で `sanitizeErrorMessage()` 適用                                            | —    |
| NFR-04 | IPC レスポンス形式統一       | `{ success: boolean, data?: T, error?: string }` 形式で全レスポンス返却                          | —    |
| NFR-05 | LLM query 関数 DI            | `SkillDocGenerator` コンストラクタで `LLMQueryFn` を受け取る                                     | —    |
| NFR-06 | 生成パフォーマンス3秒        | LLM query の逐次実行。7セクション生成での達成可能性を検証                                        | —    |
| NFR-07 | ISO 8601 文字列              | `generatedAt` は `new Date().toISOString()` で生成。`string` 型で定義                            | —    |
| NFR-08 | パストラバーサル防止         | `isValidOutputPath()` で `path.resolve()` + `..` チェック                                        | —    |
| NFR-09 | required セクション必須      | `required: true` セクションの生成失敗時にエラー返却                                              | —    |
| NFR-10 | チャネル名定数管理           | `IPC_CHANNELS.SKILL_DOCS_*` 定数4件で参照                                                        | —    |
| NFR-11 | outputFormat 許可値チェック  | `VALID_OUTPUT_FORMATS = ["markdown", "html", "pdf"]` でバリデーション                            | —    |
| NFR-12 | language 許可値チェック      | `VALID_LANGUAGES = ["ja", "en"]` でバリデーション                                                | —    |
| NFR-13 | P45 引数名セマンティクス一致 | skillName→スキル名、outputPath→出力先パス、request→生成リクエスト、template→テンプレート         | —    |
| NFR-14 | register/unregister 独立関数 | `registerSkillDocsHandlers()` / `unregisterSkillDocsHandlers()` で P5 対策                       | —    |
| NFR-15 | @repo/shared 型配置          | `packages/shared/src/types/skill-docs.ts` + `index.ts` re-export                                 | —    |
| NFR-16 | 既存テスト維持               | 新規ファイル追加のみ、既存コード変更は最小限（channels.ts / skill-api.ts / types.ts / index.ts） | —    |

### 3. アーキテクチャ品質

| 観点                | 確認項目                                                                                                      | 結果 |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ---- |
| 単一責務原則（SRP） | `SkillDocGenerator`（ドキュメント生成・変換）が明確な責務を持つ。テンプレート定義は `doc-templates.ts` に分離 | —    |
| 依存性逆転（DIP）   | LLM query 関数は `LLMQueryFn` 型で抽象化され、Constructor Injection でモック可能                              | —    |
| DI 設計             | Constructor Injection（queryFn）+ Setter Injection（SkillService.setDocGenerator）の組み合わせ                | —    |
| レイヤー依存方向    | Main → Shared の一方向依存のみ。逆方向 import なし                                                            | —    |
| モノレポ構成        | 共有型は `@repo/shared`、実装は `apps/desktop`。幽霊依存なし（P8 対策）                                       | —    |
| テスタビリティ      | `LLMQueryFn` モック差し替えにより LLM 呼び出しなしのユニットテストが可能                                      | —    |
| L2 コンポーネント   | `SkillDocGenerator` が `SkillService` Facade の L2 コンポーネントとして配置されている                         | —    |

### 4. セキュリティ設計（4層構造）

| 観点                        | 確認項目                                                                                 | 結果 |
| --------------------------- | ---------------------------------------------------------------------------------------- | ---- |
| Layer 1: IPC 送信元検証     | 全4ハンドラで `validateIpcSender()` + `getAllowedWindows: () => [mainWindow]`            | —    |
| Layer 2: P42 バリデーション | `skillName` / `outputPath` に3段バリデーション（typeof → `=== ""` → `.trim() === ""`）   | —    |
| Layer 2: 許可値チェック     | `outputFormat` は `["markdown", "html", "pdf"]`、`language` は `["ja", "en"]` でチェック | —    |
| Layer 2: 型チェック         | `includeExamples`, `includeApiReference` は `typeof boolean` でチェック                  | —    |
| Layer 2: 配列チェック       | `customSections` は `Array.isArray()` + 全要素 `typeof string` でチェック                | —    |
| Layer 3: パストラバーサル   | `isValidOutputPath()` で `path.resolve()` + `..` セグメント検出                          | —    |
| Layer 4: エラーサニタイズ   | 全ハンドラの catch 節で `sanitizeErrorMessage()` を適用し内部情報を隠蔽                  | —    |
| チャネル名管理              | `IPC_CHANNELS` 定数で参照（ハードコード文字列なし、P27 対策）                            | —    |
| ALLOWED_INVOKE_CHANNELS     | 4チャネルがホワイトリストに追加されている                                                | —    |

### 5. IPC 契約整合性（ipc-contract-checklist.md 準拠）

| チェック項目                             | 確認内容                                                                                                         | 結果 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---- |
| Phase 1: チャネル名の定数管理            | `channels.ts` に `SKILL_DOCS_GENERATE/PREVIEW/EXPORT/TEMPLATES` 定数4件定義、`ALLOWED_INVOKE_CHANNELS` に登録    | —    |
| Phase 2: skill:docs:generate 引数型一致  | Preload: `request: DocGenerationRequest` → Handler: `request` をオブジェクトバリデーション後にキャスト           | —    |
| Phase 2: skill:docs:preview 引数型一致   | Preload: `{ skillName, template }` → Handler: `args.skillName`, `args.template`                                  | —    |
| Phase 2: skill:docs:export 引数型一致    | Preload: `{ doc, outputPath }` → Handler: `args.doc`, `args.outputPath`                                          | —    |
| Phase 2: skill:docs:templates 引数型一致 | Preload: 引数なし → Handler: 引数なし                                                                            | —    |
| Phase 3: 引数名セマンティクス一致（P45） | `skillName`→スキル名、`outputPath`→出力先パス、`request`→生成リクエスト、`template`→テンプレート。命名と値が一致 | —    |
| Phase 4: レスポンス型の一致              | Preload: `safeInvokeUnwrap<T>` で `data` 展開。Handler: `{ success, data?, error? }` 形式                        | —    |
| Phase 5: エラーレスポンスの型一致        | 全ハンドラ: `{ success: false, error: string }` 形式。`sanitizeErrorMessage()` 適用済み                          | —    |
| Phase 6: 送信元検証の実装                | 全4ハンドラで `validateIpcSender()` が呼ばれること                                                               | —    |

### 6. 型設計品質

| 観点                     | 確認項目                                                                                  | 結果 |
| ------------------------ | ----------------------------------------------------------------------------------------- | ---- |
| outputFormat union       | `"markdown" \| "html" \| "pdf"` の3値が `DocGenerationRequest` と `GeneratedDoc` で一致   | —    |
| language union           | `"ja" \| "en"` が `DocGenerationRequest` で定義され、`generateSection()` に伝播           | —    |
| IPC 境界の型変換         | `generatedAt` は `string`（ISO 8601）で統一                                               | —    |
| P32 対策（型二箇所更新） | `shared/types/skill-docs.ts` + `preload/types.ts` の両方に型定義                          | —    |
| オプショナルフィールド   | `customSections?: string[]`、`template?: DocTemplate` は `?` 付きで undefined 許容        | —    |
| re-export 設計           | `packages/shared/src/types/index.ts` から5型を re-export                                  | —    |
| any 型不使用             | 全ての IPC 境界で `unknown` から3段検証（typeof/空文字/trim）後にキャスト。`any` 使用なし | —    |

### 7. エラーハンドリング

| 観点                       | 確認項目                                                                                      | 結果 |
| -------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| バリデーションエラー       | `VALIDATION_ERROR`（1000-1999番台）: 引数不正、outputFormat 不正、language 不正。リトライ不可 | —    |
| ビジネスエラー             | スキル未検出（2000-2999番台）: `Skill not found: {skillName}`。リトライ不可                   | —    |
| 外部サービスエラー         | LLM 通信エラー / タイムアウト（3000-3999番台）。リトライ可能                                  | —    |
| インフラストラクチャエラー | ファイル書き込み / PDF 変換失敗（4000-4999番台）。リトライ可能                                | —    |
| パストラバーサルエラー     | `isValidOutputPath()` で検出 → `VALIDATION_ERROR` として拒否                                  | —    |
| required セクション失敗    | `required: true` セクションの LLM 生成失敗 → エラーとして伝播（握りつぶさない）               | —    |
| エラーの非握りつぶし       | 全エラーが Layer 4 で `sanitizeErrorMessage()` 適用後にクライアントに返却される               | —    |

### 8. PDF 変換設計

| 観点               | 確認項目                                                                                                        | 結果 |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ---- |
| 変換パイプライン   | Markdown → HTML（`convertToHtml`）→ PDF（`convertToPdf`）の2段階変換が設計されている                            | —    |
| puppeteer 依存     | Electron 環境での Chromium 利用可否が検討されている                                                             | —    |
| エラーハンドリング | `convertToPdf()` 失敗時は Infrastructure Error（4000-4999番台）として返却                                       | —    |
| リソース管理       | puppeteer ブラウザインスタンスの適切なクローズ（`browser.close()` の保証）が設計されている                      | —    |
| ファイル出力先分岐 | `exportToFile()` 内で format に応じて `fs.writeFile`（markdown/html）または `convertToPdf`（pdf）を分岐する設計 | —    |

## 統合テスト連携

統合テスト観点のレビューゲートを実施:

| レビュー観点       | 確認項目                                                                                               | 結果 |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ---- |
| IPC 設計           | 4チャネルの引数・戻り値型が Phase 1 の IPC チャネル定義テーブルと一致                                  | —    |
| データフロー       | Renderer → Preload(safeInvokeUnwrap) → Handler(4層セキュリティ) → SkillDocGenerator → LLM/FS           | —    |
| LLM 連携           | `LLMQueryFn` の Constructor Injection。モック差し替えによるテスト可能性                                | —    |
| ファイルシステム   | `exportToFile()` のパストラバーサル検証 + format 別出力（markdown/html: writeFile、pdf: convertToPdf） | —    |
| スキルファイル読取 | `analyzeSkillStructure()` が SKILL.md / references/ / agents/ / schemas/ を読み取る                    | —    |
| 型共有             | `@repo/shared` の型が Main Process と Preload の両方で参照されている                                   | —    |
| エラーハンドリング | バリデーションエラー / ビジネスエラー / LLM エラー / ファイルI/Oエラーの区別と処理                     | —    |

## 多角的チェック観点（AI レビュー判断）

| 観点                         | 確認事項                                                                                                                                | 結果 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 過去の落とし穴対策           | P5（二重登録防止）、P27（ハードコード文字列禁止）、P32（型二箇所更新）、P42（trim バリデーション）、P44/P45（IPC 契約整合性）が対策済み | —    |
| outputFormat 3形式           | `"markdown"` / `"html"` / `"pdf"` の3形式が型定義・バリデーション・変換ロジックで一貫して設計されている                                 | —    |
| PDF 変換の実現可能性         | puppeteer による HTML→PDF 変換が Electron 環境で利用可能であること                                                                      | —    |
| LLM 逐次生成のパフォーマンス | 7セクション逐次生成で NFR-06（3秒以内）の達成可能性。LLM 応答速度への依存を明記                                                         | —    |
| customSections の拡張性      | デフォルトテンプレートにカスタムセクションを追加する設計が柔軟で壊れにくい                                                              | —    |
| 既存コードへの影響           | 新規ファイル追加が中心。既存ファイルへの変更は channels.ts / skill-api.ts / types.ts / ipc/index.ts の4ファイルのみ                     | —    |
| Setter Injection の妥当性    | `SkillDocGenerator` は LLM query 関数準備後に生成するため、Setter Injection が妥当                                                      | —    |
| テンプレート設計の品質       | 7セクションの LLM プロンプトが具体的で、条件・閾値・入力制約が明記されている                                                            | —    |
| TASK-9G パターン踏襲         | registerHandlers / unregisterHandlers 分離、validateIpcSender + P42 の4層構造が TASK-9G と一貫性を保つ                                  | —    |
| スコープ整合性               | Phase 1 スコープ定義（含むもの/含まないもの）と Phase 2 設計の対象範囲が一致する                                                        | —    |

## レビュー結果

### 判定

**判定: （Phase 実行時に記入）**

### 指摘事項

（Phase 実行時に記入。MINOR 指摘は全て未タスク仕様書に変換する）

| No  | 重要度 | 観点 | 指摘内容 | 対応方針 |
| --- | ------ | ---- | -------- | -------- |
| —   | —      | —    | —        | —        |

## 成果物

| 成果物       | パス                                      | 説明           |
| ------------ | ----------------------------------------- | -------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 本ドキュメント |

## 完了条件

- [ ] 機能要件カバレッジ（FR-01〜FR-10）の全項目が確認されている
- [ ] 非機能要件カバレッジ（NFR-01〜NFR-16）の全項目が確認されている
- [ ] アーキテクチャ品質の全観点（7項目）が確認されている
- [ ] セキュリティ設計の全観点（9項目）が確認されている
- [ ] IPC 契約整合性の全チェック項目（9項目）が確認されている
- [ ] 型設計品質の全観点（7項目）が確認されている
- [ ] エラーハンドリングの全観点（7項目）が確認されている
- [ ] PDF 変換設計の全観点（5項目）が確認されている
- [ ] 統合テスト連携の全レビュー観点（7項目）が確認されている
- [ ] 多角的チェック観点（10項目）が確認されている
- [ ] レビュー判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] **本 Phase 内のレビュー作業を 100% 実行完了**

## 次の Phase

Phase 4: テスト作成
