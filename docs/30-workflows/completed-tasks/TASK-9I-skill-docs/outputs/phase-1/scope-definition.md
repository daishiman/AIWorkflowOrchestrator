# TASK-9I Phase 1: スコープ定義書

## メタ情報

| 項目      | 値                         |
| --------- | -------------------------- |
| タスク ID | TASK-9I                    |
| 機能名    | スキルドキュメント自動生成 |
| Phase     | 1 — 要件定義               |
| 作成日    | 2026-02-28                 |

---

## 1. 含むもの（In Scope）

### 1.1 Main Process

| 対象                       | 説明                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `SkillDocGenerator` クラス | LLM 連携によるスキル構造解析、Markdown/HTML/PDF ドキュメント生成、ファイルエクスポート機能 |
| `doc-templates.ts`         | デフォルトテンプレート定数定義（7セクション構成）                                          |

#### SkillDocGenerator の責務

- `generate()`: ドキュメント生成（FR-01 -- FR-06）
- `preview()`: テンプレート適用済みプレビュー（FR-07）
- `exportToFile()`: ファイルエクスポート（FR-08）
- `analyzeSkillStructure()`: スキル構造解析（private）
- `generateSection()`: セクション生成（private）
- `convertToHtml()`: Markdown→HTML 変換（private）
- `convertToPdf()`: HTML→PDF 変換（private）
- `isValidOutputPath()`: パストラバーサルバリデーション（private）

### 1.2 IPC 通信

| 対象                    | 説明                                       |
| ----------------------- | ------------------------------------------ |
| 4チャネルのハンドラ登録 | `registerSkillDocsHandlers()` で一括登録   |
| 4チャネルのハンドラ解除 | `unregisterSkillDocsHandlers()` で一括解除 |
| `skill:docs:generate`   | LLM を使ったドキュメント生成               |
| `skill:docs:preview`    | テンプレート適用済みプレビュー             |
| `skill:docs:export`     | ファイルエクスポート                       |
| `skill:docs:templates`  | テンプレート一覧取得                       |

### 1.3 Preload

| 対象                           | 説明                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `SkillAPI` への4メソッド追加   | `docsGenerate`, `docsPreview`, `docsExport`, `docsTemplates` |
| `safeInvokeUnwrap` パターン    | IPC 呼び出しをラップし、`data` フィールドを展開              |
| `ALLOWED_INVOKE_CHANNELS` 登録 | 4チャネルをホワイトリストに追加                              |

### 1.4 Shared Types

| 対象                                      | 説明                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skill-docs.ts` | 5型定義（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection） |
| `packages/shared/src/types/index.ts`      | 5型の re-export                                                                         |

### 1.5 セキュリティ

| 層      | 処理                                       | 対応 NFR               |
| ------- | ------------------------------------------ | ---------------------- |
| Layer 1 | `validateIpcSender()` 送信元検証           | NFR-01                 |
| Layer 2 | P42 準拠3段バリデーション + 許可値チェック | NFR-02, NFR-11, NFR-12 |
| Layer 3 | サービス内部検証（パストラバーサル）       | NFR-08                 |
| Layer 4 | `sanitizeErrorMessage()` エラーサニタイズ  | NFR-03                 |

### 1.6 既存ファイルへの変更

| ファイル                                               | 変更内容                                           |
| ------------------------------------------------------ | -------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`                 | `IPC_CHANNELS` に4チャネル定数追加                 |
| `apps/desktop/src/preload/channels.ts`                 | `ALLOWED_INVOKE_CHANNELS` に4チャネル追加          |
| `apps/desktop/src/preload/skill-api.ts`                | docs 操作4メソッド追加                             |
| `apps/desktop/src/preload/types.ts`                    | SkillAPI 型に4メソッドの型定義追加                 |
| `apps/desktop/src/main/ipc/index.ts`                   | `registerSkillDocsHandlers` の初期化呼び出し追加   |
| `apps/desktop/src/main/services/skill/SkillService.ts` | `setDocGenerator` / `getDocGenerator` メソッド追加 |
| `packages/shared/src/types/index.ts`                   | skill-docs.ts からの re-export 追加                |

### 1.7 デフォルトテンプレート

7セクション構成の標準テンプレート。

| セクション ID     | タイトル               | 必須  |
| ----------------- | ---------------------- | ----- |
| `overview`        | 概要                   | true  |
| `getting-started` | はじめに               | true  |
| `configuration`   | 設定                   | false |
| `api`             | API リファレンス       | false |
| `examples`        | 使用例                 | false |
| `troubleshooting` | トラブルシューティング | false |
| `changelog`       | 変更履歴               | false |

### 1.8 テスト

| 対象                               | 説明                                                  |
| ---------------------------------- | ----------------------------------------------------- |
| `SkillDocGenerator` ユニットテスト | LLM query モック差し替えによる全メソッドテスト        |
| IPC ハンドラ ユニットテスト        | 4チャネルのバリデーション・セキュリティ・正常系テスト |

---

## 2. 含まないもの（Out of Scope）

| 除外項目                       | 理由                                                                                              | 対応先           |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------- |
| Renderer UI コンポーネント     | フロントエンド UI は別タスクで実装する                                                            | TASK-030         |
| テンプレートの CRUD UI         | テンプレート一覧取得 API のみ本タスクで提供する。カスタムテンプレートの作成・編集・削除は別タスク | 別タスク（未定） |
| LLM プロバイダ切り替え機能     | 既存の LLM 設定に従い、プロバイダ選択は既存機能に委譲する                                         | 既存機能         |
| リアルタイムストリーミング生成 | バッチ生成のみ対応する。ストリーミングは別タスクで検討する                                        | 別タスク（未定） |
| E2E テスト（Playwright）       | ユニットテストのみ本タスクのスコープとする                                                        | 別タスク（未定） |
| ドキュメントのバージョン管理   | 生成されたドキュメントの履歴管理・差分表示は対象外とする                                          | 別タスク（未定） |

---

## 3. 新規ファイル一覧

| ファイルパス                                                               | 説明                           |
| -------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                | ドキュメント生成サービスクラス |
| `apps/desktop/src/main/services/skill/doc-templates.ts`                    | デフォルトテンプレート定数     |
| `apps/desktop/src/main/ipc/skillDocsHandlers.ts`                           | IPC ハンドラ登録・解除関数     |
| `packages/shared/src/types/skill-docs.ts`                                  | 共有型定義5種                  |
| `apps/desktop/src/main/services/skill/__tests__/SkillDocGenerator.test.ts` | SkillDocGenerator テスト       |
| `apps/desktop/src/main/ipc/__tests__/skillDocsHandlers.test.ts`            | IPC ハンドラテスト             |

---

## 4. 依存関係

### 外部依存

| パッケージ  | 用途               | 新規追加 |
| ----------- | ------------------ | -------- |
| `marked`    | Markdown→HTML 変換 | 要検討   |
| `puppeteer` | HTML→PDF 変換      | 要検討   |

### 内部依存

| モジュール             | 依存元                    | 説明                                     |
| ---------------------- | ------------------------- | ---------------------------------------- |
| `@repo/shared` 型定義  | SkillDocGenerator, IPC    | 共有型の参照                             |
| `validateIpcSender`    | IPC ハンドラ              | 送信元検証ユーティリティ                 |
| `sanitizeErrorMessage` | IPC ハンドラ              | エラーサニタイズユーティリティ           |
| `IPC_CHANNELS`         | IPC ハンドラ, Preload API | チャネル定数                             |
| `safeInvokeUnwrap`     | Preload API               | IPC 呼び出しラッパー                     |
| `SkillService`         | 初期化フロー              | Facade パターン（L2 コンポーネント登録） |

---

## 5. 影響分析

### 既存テストへの影響

- 新規ファイル追加が中心のため、既存テスト（9000件以上）への影響は限定的
- 既存ファイルへの変更は型定義追加・チャネル定数追加・メソッド追加のみで、既存メソッドの振る舞いを変更しない
- NFR-16: 既存テストが全て PASS する状態を維持する

### 既存コードへの影響

| 変更対象ファイル  | 変更種別       | リスク | 備考                                      |
| ----------------- | -------------- | ------ | ----------------------------------------- |
| `channels.ts`     | 定数追加       | 低     | 既存定数に影響しない追記のみ              |
| `skill-api.ts`    | メソッド追加   | 低     | 既存メソッドに影響しない追記のみ          |
| `types.ts`        | 型定義追加     | 低     | 既存型に影響しない追記のみ                |
| `ipc/index.ts`    | 初期化追加     | 低     | `registerSkillDocsHandlers` 呼び出し追加  |
| `SkillService.ts` | メソッド追加   | 低     | Setter Injection で L2 コンポーネント登録 |
| `shared/index.ts` | re-export 追加 | 低     | 既存 export に影響しない追記のみ          |
