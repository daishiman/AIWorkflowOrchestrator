# Phase 1: 要件定義

## メタ情報

| 項目      | 値                 |
| --------- | ------------------ |
| Phase     | 1                  |
| 機能名    | TASK-9I-skill-docs |
| 作成日    | 2026-02-28         |
| 前提Phase | なし               |
| 後続Phase | Phase 2: 設計      |
| 状態      | 未着手             |

## 目的

スキルの構造を解析し、LLM を使って自動的にドキュメントを生成する機能の要件を定義する。Markdown/HTML/PDF 形式でのエクスポート、日本語/英語切り替え、カスタムセクション追加をサポートする。本タスクは Main Process サービス・IPC 契約・Preload API・共有型定義のみを対象とし、Renderer UI コンポーネントはスコープ外（TASK-030 で実装）とする。

## 実行タスク

- 要件抽出: ドキュメント生成・プレビュー・エクスポート・テンプレート管理の4つの主要機能を FR として分類する
- 非機能要件定義: セキュリティ（P42/P44 準拠 IPC）・パフォーマンス（LLM 応答時間 3 秒以内目標）・拡張性（テンプレート追加）・国際化（ja/en）を NFR として定義する
- 受け入れ基準作成: 各要件に対して Gherkin 形式で検証可能な受け入れ基準を定義する
- FR/NFR 分類: 機能要件と非機能要件を明確に分離し ID を付与する
- スコープ定義: 実装範囲（Main Process / IPC / Preload / Shared Types）と除外範囲（Renderer UI）を明示する
- IPC チャネル要件定義: 4チャネル（generate/preview/export/templates）の引数・戻り値型を確定する

## 参照資料

| 資料名                   | パス                                                                               | 説明                                   |
| ------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------- |
| タスク定義               | `docs/30-workflows/TASK-9I-skill-docs/index.md`                                    | TASK-9I タスク概要                     |
| 仕様逆引き               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                   | 必須仕様の抽出起点                     |
| 仕様クイック参照         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                | 仕様カテゴリの一次確認                 |
| IPC 仕様                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`               | IPC チャネル定義                       |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`       | IPC セキュリティパターン               |
| 入力バリデーション仕様   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`   | P42 準拠の入力検証                     |
| スキルインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`  | スキル型定義                           |
| サービス層アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`      | サービス層構造                         |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`              | エラー処理方針                         |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                               | P42/P44/P45 対策                       |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`      | IPC契約検証手順                        |
| IPC型不整合ガイド        | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`   | Date/引数形式の整合                    |
| TASK-9G 仕様（参考）     | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-1-requirements.md` | 先行タスクの仕様書（設計パターン参考） |

### aiworkflow-requirements 抽出コマンド（Phase 1 開始時）

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "api-ipc-agent" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-electron-ipc" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "interfaces-agent-sdk-skill" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "quality-requirements" -C 3
```

## 要件定義

### 機能要件（FR）

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

### 非機能要件（NFR）

| ID     | 要件                                                                                                             | 優先度 | 参照                              |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------- |
| NFR-01 | 全 IPC ハンドラで `validateIpcSender()` による送信元ウィンドウ検証を実行する                                     | 高     | `security-electron-ipc.md`        |
| NFR-02 | 文字列引数に P42 準拠3段バリデーション（typeof → 空文字列 → trim()）を適用する                                   | 高     | `06-known-pitfalls.md#P42`        |
| NFR-03 | エラーレスポンスは `sanitizeErrorMessage()` でパス・機密情報をマスクする                                         | 高     | `security-electron-ipc.md`        |
| NFR-04 | IPC レスポンスは `{ success: boolean, data?: T, error?: string }` 形式で統一する                                 | 高     | `api-ipc-agent.md`                |
| NFR-05 | LLM query 関数を DI（Constructor Injection）で受け取り、テスト時にモック差し替えを可能にする                     | 高     | `06-known-pitfalls.md#P34`        |
| NFR-06 | ドキュメント生成処理（LLM クエリ含む）は7セクション・平均的なスキル構造の場合に3秒以内で完了する                 | 中     | —                                 |
| NFR-07 | Date 型は IPC 境界で ISO 8601 文字列（`string`）として送受信する                                                 | 高     | IPC シリアライズ方針              |
| NFR-08 | `exportToFile()` の出力先パスに対してパストラバーサル攻撃を防止するバリデーションを実施する                      | 高     | `security-electron-ipc.md`        |
| NFR-09 | テンプレートの `required: true` セクションは生成時にスキップ不可とし、生成失敗時はエラーを返す                   | 中     | `error-handling.md`               |
| NFR-10 | チャネル名は `IPC_CHANNELS` 定数で管理し、文字列リテラルでのハードコードを禁止する                               | 高     | `06-known-pitfalls.md#P27`        |
| NFR-11 | `outputFormat` 引数は許可値リスト（`"markdown"`, `"html"`, `"pdf"`）で検証し、不正値を拒否する                   | 高     | `security-electron-ipc.md`        |
| NFR-12 | `language` 引数は許可値リスト（`"ja"`, `"en"`）で検証し、不正値を拒否する                                        | 高     | `security-electron-ipc.md`        |
| NFR-13 | IPCハンドラの引数名はPreload側で渡す値のセマンティクスと一致させる（P45対策）                                    | 高     | `06-known-pitfalls.md#P45`        |
| NFR-14 | IPCハンドラは `registerSkillDocsHandlers()` / `unregisterSkillDocsHandlers()` の独立関数として実装する（P5対策） | 高     | `06-known-pitfalls.md#P5`         |
| NFR-15 | 共有型定義は `packages/shared/src/types/skill-docs.ts` に配置し、`index.ts` から re-export する                  | 高     | `01-architecture.md#モノレポ構造` |
| NFR-16 | 既存テスト（9000件以上）が全てPASSする状態を維持する                                                             | 高     | —                                 |

### IPC チャネル定義

| チャネル               | メソッド | 引数                                            | 戻り値                     | 説明                           |
| ---------------------- | -------- | ----------------------------------------------- | -------------------------- | ------------------------------ |
| `skill:docs:generate`  | `handle` | `DocGenerationRequest`                          | `IpcResult<GeneratedDoc>`  | LLM を使ってドキュメント生成   |
| `skill:docs:preview`   | `handle` | `{ skillName: string, template?: DocTemplate }` | `IpcResult<GeneratedDoc>`  | テンプレート適用済みプレビュー |
| `skill:docs:export`    | `handle` | `{ doc: GeneratedDoc, outputPath: string }`     | `IpcResult<void>`          | ファイルエクスポート           |
| `skill:docs:templates` | `handle` | なし                                            | `IpcResult<DocTemplate[]>` | テンプレート一覧取得           |

### 型定義概要

| 型名                   | 説明                                                                                                      | 定義場所                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `DocGenerationRequest` | 生成リクエスト（skillName, outputFormat, language, includeExamples, includeApiReference, customSections） | `packages/shared/src/types/skill-docs.ts` |
| `GeneratedDoc`         | 生成結果（skillName, format, content, sections, generatedAt, wordCount）                                  | `packages/shared/src/types/skill-docs.ts` |
| `DocSection`           | セクション情報（id, title, content, order）                                                               | `packages/shared/src/types/skill-docs.ts` |
| `DocTemplate`          | テンプレート定義（id, name, description, sections）                                                       | `packages/shared/src/types/skill-docs.ts` |
| `TemplateSection`      | テンプレートセクション（id, title, prompt, required）                                                     | `packages/shared/src/types/skill-docs.ts` |

## 受け入れ基準

### AC-01: Markdown 形式でのドキュメント生成

- **Given**: スキル "test-skill" が `.claude/skills/` に存在する
- **When**: `DocGenerationRequest { skillName: "test-skill", outputFormat: "markdown", includeExamples: true, includeApiReference: true, language: "ja" }` で `generate()` を呼び出す
- **Then**: `GeneratedDoc` が返却される
- **And**: `generatedAt` は ISO 8601 形式の文字列である
- **And**: `sections` 配列は1件以上のセクションを含む
- **And**: 各セクションの `content` は空文字列ではない
- **And**: `wordCount` は `content` の総文字数と一致する

### AC-02: HTML 形式でのドキュメント生成

- **Given**: スキル "test-skill" が存在する
- **When**: `DocGenerationRequest { outputFormat: "html", language: "ja" }` で `generate()` を呼び出す
- **Then**: `GeneratedDoc.format` は `"html"` である
- **And**: `GeneratedDoc.content` は有効な HTML 文字列（`<html>` タグを含む）である

### AC-03: PDF 形式でのエクスポート

- **Given**: `GeneratedDoc`（format: `"pdf"`）が生成済みである
- **When**: `skill:docs:export` IPC チャネルで `outputPath` を指定してエクスポートする
- **Then**: 指定パスに PDF ファイルが作成される

### AC-04: 英語ドキュメント生成

- **Given**: スキル "test-skill" が存在する
- **When**: `DocGenerationRequest { language: "en" }` で `generate()` を呼び出す
- **Then**: `GeneratedDoc` の各 `section.content` は英語で記述されている

### AC-05: プレビュー生成（テンプレート未指定）

- **Given**: スキル "test-skill" が存在する
- **When**: `preview("test-skill")` を呼び出す（テンプレート未指定）
- **Then**: デフォルトテンプレート（7セクション）を使用した Markdown 形式の `GeneratedDoc` が返却される
- **And**: ファイルシステムへの書き込みは発生しない

### AC-06: カスタムテンプレートによるプレビュー

- **Given**: カスタム `DocTemplate`（3セクション: 概要、使い方、API）が定義されている
- **When**: `preview("test-skill", customTemplate)` を呼び出す
- **Then**: `GeneratedDoc.sections` は正確に3件である
- **And**: 各セクションの `title` はテンプレートの `TemplateSection.title` と一致する

### AC-07: ファイルエクスポート（Markdown）

- **Given**: `GeneratedDoc`（format: `"markdown"`）が生成済みである
- **When**: `exportToFile(doc, "/valid/output/path.md")` を呼び出す
- **Then**: 指定パスに `content` がファイルとして書き出される
- **And**: ファイルの内容は `doc.content` と一致する

### AC-08: パストラバーサル防止

- **Given**: `GeneratedDoc` が生成済みである
- **When**: `exportToFile(doc, "../../etc/passwd")` を呼び出す
- **Then**: バリデーションエラー（code: `VALIDATION_ERROR`）が返される
- **And**: ファイルは書き出されない

### AC-09: テンプレート一覧取得

- **Given**: デフォルトテンプレートが1件以上登録されている
- **When**: `skill:docs:templates` チャネルを呼び出す
- **Then**: `DocTemplate[]` が返却される
- **And**: 各テンプレートは `id`, `name`, `description`, `sections` を持つ
- **And**: `sections` の各要素は `id`, `title`, `prompt`, `required` を持つ

### AC-10: カスタムセクション追加

- **Given**: スキル "test-skill" が存在する
- **When**: `customSections: ["deployment", "monitoring"]` を指定してドキュメントを生成する
- **Then**: デフォルト7セクション＋カスタム2セクションの計9セクションが `GeneratedDoc.sections` に含まれる

### AC-11: 存在しないスキルへのリクエスト

- **Given**: スキル "nonexistent-skill" が存在しない
- **When**: `generate({ skillName: "nonexistent-skill", ... })` を呼び出す
- **Then**: エラーレスポンス `{ success: false, error: "Skill not found: nonexistent-skill" }` が返される

### AC-12: IPC バリデーション（空文字列・スペースのみの skillName 拒否）

- **Given**: `skill:docs:generate` ハンドラが登録されている
- **When**: `skillName` に空文字列 `""` またはスペースのみ `"   "` を送信する
- **Then**: `{ success: false, error: "skillName must be a non-empty string" }` が返却される
- **And**: ドキュメント生成処理は実行されない

### AC-13: IPC バリデーション（不正 outputFormat 拒否）

- **Given**: `skill:docs:generate` ハンドラが登録されている
- **When**: `outputFormat` に `"docx"`（許可値リスト外）を送信する
- **Then**: `{ success: false, error: "outputFormat must be one of: markdown, html, pdf" }` が返却される

### AC-14: IPC セキュリティ（送信元検証）

- **Given**: 不正な送信元からの IPC リクエストが送信される
- **When**: `skill:docs:generate` ハンドラが呼び出される
- **Then**: `validateIpcSender` が検証失敗を返す
- **And**: バリデーションエラーレスポンスが返される
- **And**: ドキュメント生成処理は実行されない

### AC-15: LLM DI（テスタビリティ）

- **Given**: モック化された queryFn（固定テキストを返す）で `SkillDocGenerator` を生成する
- **When**: ドキュメントを生成する
- **Then**: モックの queryFn が各セクション生成時に呼ばれ、固定テキストがセクション content に反映される

## スコープ定義

### 含むもの

- Main Process: `SkillDocGenerator` サービスクラス（LLM 連携、スキル構造解析、Markdown/HTML/PDF 生成、ファイルエクスポート）
- IPC: 4チャネルのハンドラ登録・解除（`registerSkillDocsHandlers()` / `unregisterSkillDocsHandlers()`）
- Preload: `SkillAPI` への docs 操作4メソッド追加（`safeInvokeUnwrap` パターン）
- Shared Types: `packages/shared/src/types/skill-docs.ts`（`DocGenerationRequest`, `GeneratedDoc`, `DocSection`, `DocTemplate`, `TemplateSection`）
- セキュリティ: 4層構造（Sender 検証 → 引数バリデーション → 内部検証 → エラーサニタイズ）
- `channels.ts` へのチャネル定数4件追加
- `ALLOWED_INVOKE_CHANNELS` へのホワイトリスト登録
- `preload/types.ts` への型追加
- `apps/desktop/src/main/ipc/index.ts` への初期化呼び出し追加
- デフォルトテンプレート定義（7セクション構造）
- ユニットテスト（SkillDocGenerator、IPCハンドラ）

### 含まないもの

- Renderer UI コンポーネント（TASK-030 で実装）
- テンプレートの CRUD UI（テンプレート一覧取得 API のみ提供。カスタムテンプレートの作成・編集・削除は別タスク）
- LLM プロバイダ切り替え機能（既存の LLM 設定に従う）
- リアルタイムストリーミング生成（バッチ生成のみ）
- E2E テスト（Playwright）
- ドキュメントのバージョン管理

## アーキテクチャ層別要件

| 層           | 要件                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Main Process | `SkillDocGenerator` を `SkillService` の L2 コンポーネントとして配置。LLM query 関数を Constructor Injection で受け取る |
| IPC 通信     | 4チャネルを `registerSkillDocsHandlers()` で一括登録。`validateIpcSender` + P42 バリデーション + 許可値チェック必須     |
| Preload      | `SkillAPI` に docs 操作4メソッドを追加。`safeInvokeUnwrap` パターン使用。`ALLOWED_INVOKE_CHANNELS` に4チャネル登録      |
| Shared Types | `packages/shared/src/types/skill-docs.ts` に全型定義を配置。`index.ts` から re-export                                   |
| Renderer     | 変更なし（UI は TASK-030 のスコープ）                                                                                   |

## 統合テスト連携

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ       | 記載内容                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| IPC 通信               | `skill:docs:generate` / `skill:docs:preview` / `skill:docs:export` / `skill:docs:templates` の4チャネルで Renderer→Main 通信 |
| Preload Bridge         | `safeInvokeUnwrap` パターンで IPC 呼び出しをラップ。`ALLOWED_INVOKE_CHANNELS` への4チャネル追加が必須                        |
| LLM 連携               | `SkillDocGenerator` が LLM query 関数を通じて外部 LLM サービスと通信。タイムアウト30秒                                       |
| ファイルシステム       | `exportToFile()` がユーザー指定パスにファイルを書き出す。パストラバーサルバリデーション必須                                  |
| スキルファイル読み取り | `analyzeSkillStructure()` が `.claude/skills/{skillName}/` 配下の SKILL.md・references/ を読み取る                           |
| データフロー           | Renderer → Preload(safeInvokeUnwrap) → Handler → SkillDocGenerator → LLM / FileSystem                                        |

## 多角的チェック観点

| 観点               | 確認事項                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 4層セキュリティ構造（Sender 検証 → P42 バリデーション → 許可値チェック / パストラバーサル検証 → エラーサニタイズ）が全4チャネルで適用 |
| アーキテクチャ     | SkillService Facade の L2 配置、Constructor Injection（queryFn）、registerSkillDocsHandlers / unregisterSkillDocsHandlers 独立関数    |
| IPC 契約整合性     | ハンドラ引数名（skillName, outputPath, request, template）と Preload 側の渡し方が一致する（P44/P45 対策）                             |
| エラーハンドリング | LLM エラー（3000番台）、ファイルシステムエラー（4000番台）、バリデーションエラー（1000番台）の3カテゴリが明確に分類されている         |
| 型安全             | `any` 型の使用がなく、全ての IPC 境界で型定義が存在する                                                                               |
| DI テスタビリティ  | LLM query 関数のモック差し替えによるユニットテストが実行可能な設計である                                                              |
| パストラバーサル   | `exportToFile()` の outputPath に `..` を含むパスが拒否される                                                                         |
| Electron層別       | Main Process 内で完結。Renderer / Preload への逆方向依存なし。contextBridge 経由の API 公開                                           |

## 成果物

| 成果物         | パス                                         | 説明                                       |
| -------------- | -------------------------------------------- | ------------------------------------------ |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | FR/NFR 分類、IPC チャネル定義              |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | Gherkin 形式の受け入れ基準（AC-01〜AC-15） |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | 実装範囲と除外範囲の定義                   |
| Phase 1 仕様書 | `phase-1-requirements.md`                    | 本ファイル                                 |

## 完了条件

- [ ] 機能要件（FR-01〜FR-10）が全て定義されている
- [ ] 非機能要件（NFR-01〜NFR-16）が全て定義されている
- [ ] IPC チャネル定義（4チャネル）の引数・戻り値型が確定している
- [ ] 受け入れ基準（AC-01〜AC-15）が全て Gherkin 形式で記述されている
- [ ] 型定義5種の概要が定義されている
- [ ] スコープ定義で実装範囲と除外範囲が明確に分離されている
- [ ] アーキテクチャ層別要件（Main/IPC/Preload/Shared Types/Renderer）が定義されている
- [ ] 統合テスト連携セクションで接続要件が明記されている
- [ ] 多角的チェック観点で P42/P44/P45 対策が含まれている
- [ ] 曖昧語（条件・閾値・対象が特定されない語）が残っていない
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 2: 設計
