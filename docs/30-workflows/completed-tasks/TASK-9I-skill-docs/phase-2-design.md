# Phase 2: 設計

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase     | 2                     |
| 機能名    | TASK-9I-skill-docs    |
| 作成日    | 2026-02-28            |
| 前提Phase | Phase 1: 要件定義     |
| 後続Phase | Phase 3: 設計レビュー |
| 状態      | 未着手                |

## 目的

Phase 1 で定義した FR-01〜FR-10・NFR-01〜NFR-16 の要件を実現するための詳細設計を行う。SkillDocGenerator クラス設計、IPC チャネル設計、Preload API 設計、型定義設計、デフォルトテンプレート設計を確定する。先行タスク TASK-9G（SkillScheduler）の設計パターンを踏襲する。

## 実行タスク

- クラス設計: `SkillDocGenerator` の public API / private メソッド / DI 構造を設計する
- IPC チャネル設計: 4チャネルのハンドラ実装詳細（バリデーション・エラーハンドリング・レスポンス形式）を設計する
- Preload API 設計: `SkillAPI` への4メソッド追加を `safeInvokeUnwrap` パターンで設計する
- 型定義設計: `skill-docs.ts` の全インターフェースと re-export 構成を設計する
- テンプレート設計: デフォルト7セクションテンプレートの構造と各セクションの LLM プロンプトを設計する
- エラーハンドリング設計: エラーカテゴリ分類と IPC レスポンス形式を設計する
- DI / 初期化設計: `SkillService` Facade との統合とライフサイクルを設計する

## 参照資料

| 資料名                 | パス                                                                                        | 説明                     |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                                   | 前 Phase 成果物          |
| タスク定義             | `docs/30-workflows/TASK-9I-skill-docs/index.md`                                             | TASK-9I タスク概要       |
| IPC 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC チャネル仕様         |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティパターン |
| 入力バリデーション仕様 | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | P42 準拠の入力検証       |
| 全体アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 層構造と責務境界         |
| サービス層設計         | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | サービス層構造           |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー処理方針           |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P42/P44/P45 対策         |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約検証手順          |
| IPC型不整合ガイド      | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | Date/引数形式整合        |
| 実装パターン集         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターン          |
| TASK-9G 設計（参考）   | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-2-design.md`                | 先行タスク設計パターン   |

## 設計方針

### アプローチ選定

| 選択肢                                 | 採用 | 理由                                                                                                     |
| -------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| LLM query 関数を Constructor Injection | Yes  | テスト時にモック差し替えが可能。TASK-9G（SkillScheduler）の DI パターンと一貫性を保つ                    |
| LLM クライアントを直接参照             | No   | テスト困難。外部依存がクラス内部にハードコードされ、単体テストで LLM 呼び出しを回避できない              |
| セクション並列生成                     | No   | LLM API の Rate Limit を考慮し、逐次生成を採用。将来的に並列化する場合は `Promise.allSettled` で対応     |
| ファイル出力の直接実装                 | Yes  | `fs.writeFile` を使用。出力先バリデーション付き                                                          |
| Markdown→HTML 変換に marked ライブラリ | Yes  | 軽量で広く使われている Markdown パーサー。`<html>` ラッピングを自前で追加                                |
| HTML→PDF 変換に puppeteer              | Yes  | Electron 環境で利用可能。Chromium ベースの高品質 PDF レンダリング。`page.pdf()` で HTML→PDF 変換         |
| outputFormat に `"pdf"` を含める       | Yes  | ユーザー要求仕様で3形式（markdown/html/pdf）が指定されている。`convertToPdf()` を private メソッドで実装 |

## クラス設計

### SkillDocGenerator

```typescript
// apps/desktop/src/main/services/skill/SkillDocGenerator.ts

import {
  DocGenerationRequest,
  GeneratedDoc,
  DocSection,
  DocTemplate,
  TemplateSection,
} from "@repo/shared";

/** スキル構造解析結果（内部型） */
interface SkillAnalysis {
  skillName: string;
  skillMdContent: string;
  referenceFiles: Array<{ path: string; content: string }>;
  agentFiles: Array<{ path: string; content: string }>;
  schemaFiles: Array<{ path: string; content: string }>;
  hasExamples: boolean;
  hasApiReference: boolean;
}

/** LLM query 関数の型（DI用） */
type LLMQueryFn = (prompt: string) => Promise<{ content: string }>;

export class SkillDocGenerator {
  private readonly queryFn: LLMQueryFn;
  private readonly skillBasePath: string;

  /**
   * @param queryFn LLM query 関数（Constructor Injection: NFR-05）
   * @param skillBasePath スキルディレクトリのベースパス（デフォルト: .claude/skills/）
   */
  constructor(queryFn: LLMQueryFn, skillBasePath?: string) {
    this.queryFn = queryFn;
    this.skillBasePath = skillBasePath ?? ".claude/skills/";
  }

  /**
   * ドキュメント生成（FR-01, FR-02, FR-03, FR-04, FR-05, FR-06）
   *
   * 処理フロー:
   * 1. スキル構造解析（analyzeSkillStructure）
   * 2. テンプレート決定（デフォルト + customSections）
   * 3. セクション逐次生成（generateSection x N）
   * 4. フォーマット変換（markdown → html / pdf）
   * 5. GeneratedDoc 構築（generatedAt: ISO 8601, wordCount 算出）
   *
   * @throws VALIDATION_ERROR — skillName が空文字列/存在しないスキルの場合
   * @throws EXTERNAL_SERVICE_ERROR — LLM タイムアウト/通信エラーの場合
   */
  async generate(request: DocGenerationRequest): Promise<GeneratedDoc>;

  /**
   * プレビュー生成（FR-07）
   * markdown 形式固定。generate() にデフォルトリクエストを構築して委譲する。
   * ファイル出力は発生しない。
   */
  async preview(
    skillName: string,
    template?: DocTemplate,
  ): Promise<GeneratedDoc>;

  /**
   * ファイルエクスポート（FR-08）
   *
   * 処理フロー:
   * 1. パストラバーサルバリデーション（isValidOutputPath）
   * 2. 出力先ディレクトリの存在確認（mkdir -p）
   * 3. fs.writeFile でファイル書き出し
   *
   * @throws VALIDATION_ERROR — outputPath がパストラバーサルの場合
   * @throws INFRASTRUCTURE_ERROR — ファイル書き込み失敗の場合
   */
  async exportToFile(doc: GeneratedDoc, outputPath: string): Promise<void>;

  /**
   * スキル構造解析（private）
   * .claude/skills/{skillName}/ 配下を読み取る:
   * - SKILL.md（メイン定義ファイル）
   * - references/ 配下の全 .md ファイル
   * - agents/ 配下の全ファイル
   * - schemas/ 配下の全ファイル
   *
   * @throws VALIDATION_ERROR — スキルディレクトリが存在しない場合
   */
  private async analyzeSkillStructure(
    skillName: string,
  ): Promise<SkillAnalysis>;

  /**
   * セクション生成（private）
   * テンプレートセクションの prompt と SkillAnalysis を組み合わせて LLM に問い合わせる。
   * language パラメータで出力言語を制御する。
   *
   * @throws EXTERNAL_SERVICE_ERROR — LLM 通信エラーの場合
   */
  private async generateSection(
    analysis: SkillAnalysis,
    section: TemplateSection,
    language: "ja" | "en",
  ): Promise<DocSection>;

  /**
   * Markdown → HTML 変換（private, FR-02）
   * marked ライブラリで Markdown をパースし、
   * <html><head><meta charset="utf-8"></head><body>...</body></html> でラップする。
   */
  private convertToHtml(markdown: string): string;

  /**
   * HTML → PDF 変換（private, FR-02）
   * puppeteer で HTML を PDF にレンダリングし、指定パスに書き出す。
   *
   * @throws INFRASTRUCTURE_ERROR — PDF レンダリング失敗の場合
   */
  private async convertToPdf(html: string, outputPath: string): Promise<void>;

  /**
   * パストラバーサルバリデーション（private, NFR-08）
   * 1. path.resolve() で絶対パスに正規化
   * 2. ".." セグメントを含まないことを検証
   * 3. 許可されたディレクトリ配下であることを検証
   *
   * @returns true: 安全, false: 拒否
   */
  private isValidOutputPath(outputPath: string): boolean;
}
```

### デフォルトテンプレート定数

```typescript
// apps/desktop/src/main/services/skill/doc-templates.ts

import { DocTemplate } from "@repo/shared";

/** デフォルトテンプレート（FR-09）— 7セクション構成 */
export const DEFAULT_DOC_TEMPLATE: DocTemplate = {
  id: "default",
  name: "Standard Documentation",
  description: "7セクション構成のスキルドキュメント標準テンプレート",
  sections: [
    {
      id: "overview",
      title: "概要",
      prompt:
        "このスキルの目的、主要機能、対象ユーザーを200文字以内で説明してください。SKILL.md の内容を要約してください。",
      required: true,
    },
    {
      id: "getting-started",
      title: "はじめに",
      prompt:
        "このスキルの基本的な使用手順をステップバイステップで説明してください。トリガーキーワードと典型的なワークフローを含めてください。",
      required: true,
    },
    {
      id: "configuration",
      title: "設定",
      prompt:
        "このスキルで利用可能な設定項目（Anchors、パラメータ、環境変数）を一覧テーブル形式で説明してください。設定項目がない場合は「設定項目なし」と記載してください。",
      required: false,
    },
    {
      id: "api",
      title: "API リファレンス",
      prompt:
        "このスキルが公開するインターフェース（入力/出力フォーマット、コマンド、IPC チャネル）を技術的に説明してください。",
      required: false,
    },
    {
      id: "examples",
      title: "使用例",
      prompt:
        "このスキルの具体的な使用例を3件以上、入力と期待される出力のペアで記載してください。",
      required: false,
    },
    {
      id: "troubleshooting",
      title: "トラブルシューティング",
      prompt:
        "このスキルで発生しうる一般的なエラーと解決策を3件以上挙げてください。エラーメッセージ、原因、解決手順の3列テーブル形式で記載してください。",
      required: false,
    },
    {
      id: "changelog",
      title: "変更履歴",
      prompt:
        "SKILL.md の変更履歴セクションから主要な変更を日付・バージョン・内容のテーブル形式で抽出してください。変更履歴がない場合は「変更履歴なし」と記載してください。",
      required: false,
    },
  ],
};
```

## 型定義設計

### 共有型定義（packages/shared/src/types/skill-docs.ts）

```typescript
/**
 * ドキュメント生成リクエスト（FR-01〜FR-06）
 */
export interface DocGenerationRequest {
  /** 対象スキル名（P42準拠: 空文字列・スペースのみ不可） */
  skillName: string;
  /** 出力形式 */
  outputFormat: "markdown" | "html" | "pdf";
  /** 使用例セクションを含めるか（FR-04） */
  includeExamples: boolean;
  /** API リファレンスセクションを含めるか（FR-05） */
  includeApiReference: boolean;
  /** ドキュメント言語（FR-03） */
  language: "ja" | "en";
  /** 追加セクション名（FR-06, 任意） */
  customSections?: string[];
}

/**
 * 生成済みドキュメント（FR-01）
 */
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

/**
 * ドキュメントセクション
 */
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

/**
 * ドキュメントテンプレート（FR-09, FR-10）
 */
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

/**
 * テンプレートセクション定義
 */
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

### re-export（packages/shared/src/types/index.ts）

```typescript
// 既存の export に追加
export type {
  DocGenerationRequest,
  GeneratedDoc,
  DocSection,
  DocTemplate,
  TemplateSection,
} from "./skill-docs";
```

## IPC 通信設計

### チャネル定数（apps/desktop/src/preload/channels.ts）

```typescript
// IPC_CHANNELS に追加
SKILL_DOCS_GENERATE: "skill:docs:generate",
SKILL_DOCS_PREVIEW: "skill:docs:preview",
SKILL_DOCS_EXPORT: "skill:docs:export",
SKILL_DOCS_TEMPLATES: "skill:docs:templates",
```

### ALLOWED_INVOKE_CHANNELS への追加

```typescript
// ALLOWED_INVOKE_CHANNELS 配列に追加（Preload → Main の invoke 許可）
IPC_CHANNELS.SKILL_DOCS_GENERATE,
IPC_CHANNELS.SKILL_DOCS_PREVIEW,
IPC_CHANNELS.SKILL_DOCS_EXPORT,
IPC_CHANNELS.SKILL_DOCS_TEMPLATES,
```

### IPC ハンドラ設計（registerSkillDocsHandlers / unregisterSkillDocsHandlers）

```typescript
// apps/desktop/src/main/ipc/skillDocsHandlers.ts

import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { validateIpcSender, toIPCValidationError } from "./ipc-security";
import { sanitizeErrorMessage } from "./error-sanitizer";
import { IPC_CHANNELS } from "../preload/channels";
import { SkillDocGenerator } from "../services/skill/SkillDocGenerator";
import { DEFAULT_DOC_TEMPLATE } from "../services/skill/doc-templates";
import { DocGenerationRequest, DocTemplate, GeneratedDoc } from "@repo/shared";

const VALID_OUTPUT_FORMATS = ["markdown", "html", "pdf"] as const;
const VALID_LANGUAGES = ["ja", "en"] as const;

export function registerSkillDocsHandlers(
  mainWindow: BrowserWindow,
  docGenerator: SkillDocGenerator,
): void {
  // ─── skill:docs:generate ───────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DOCS_GENERATE,
    async (event: IpcMainInvokeEvent, request: unknown) => {
      // Layer 1: Sender 検証（NFR-01）
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DOCS_GENERATE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // Layer 2: 引数バリデーション（NFR-02, P42準拠）
      if (request === null || typeof request !== "object") {
        return { success: false, error: "request must be an object" };
      }
      const req = request as Record<string, unknown>;

      // skillName: P42準拠3段バリデーション
      if (typeof req.skillName !== "string" || req.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      // outputFormat: 許可値リストチェック（NFR-11）
      if (
        typeof req.outputFormat !== "string" ||
        !VALID_OUTPUT_FORMATS.includes(
          req.outputFormat as (typeof VALID_OUTPUT_FORMATS)[number],
        )
      ) {
        return {
          success: false,
          error: `outputFormat must be one of: ${VALID_OUTPUT_FORMATS.join(", ")}`,
        };
      }
      // includeExamples: boolean チェック
      if (typeof req.includeExamples !== "boolean") {
        return { success: false, error: "includeExamples must be a boolean" };
      }
      // includeApiReference: boolean チェック
      if (typeof req.includeApiReference !== "boolean") {
        return {
          success: false,
          error: "includeApiReference must be a boolean",
        };
      }
      // language: 許可値リストチェック（NFR-12）
      if (
        typeof req.language !== "string" ||
        !VALID_LANGUAGES.includes(
          req.language as (typeof VALID_LANGUAGES)[number],
        )
      ) {
        return {
          success: false,
          error: `language must be one of: ${VALID_LANGUAGES.join(", ")}`,
        };
      }
      // customSections: 任意配列チェック
      if (req.customSections !== undefined) {
        if (
          !Array.isArray(req.customSections) ||
          !req.customSections.every((s: unknown) => typeof s === "string")
        ) {
          return {
            success: false,
            error: "customSections must be an array of strings",
          };
        }
      }

      // Layer 3: 内部サービス実行
      try {
        const doc = await docGenerator.generate(req as DocGenerationRequest);
        return { success: true, data: doc };
      } catch (error) {
        // Layer 4: エラーサニタイズ（NFR-03）
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // ─── skill:docs:preview ────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DOCS_PREVIEW,
    async (event: IpcMainInvokeEvent, args: unknown) => {
      // Layer 1: Sender 検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DOCS_PREVIEW,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // Layer 2: 引数バリデーション
      if (args === null || typeof args !== "object") {
        return { success: false, error: "args must be an object" };
      }
      const a = args as Record<string, unknown>;

      // skillName: P42準拠3段バリデーション
      if (typeof a.skillName !== "string" || a.skillName.trim() === "") {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      // template: 任意引数（undefined 許容、存在時はobject型チェック）

      // Layer 3: 内部サービス実行
      try {
        const doc = await docGenerator.preview(
          a.skillName as string,
          a.template as DocTemplate | undefined,
        );
        return { success: true, data: doc };
      } catch (error) {
        // Layer 4: エラーサニタイズ
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // ─── skill:docs:export ─────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DOCS_EXPORT,
    async (event: IpcMainInvokeEvent, args: unknown) => {
      // Layer 1: Sender 検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DOCS_EXPORT,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // Layer 2: 引数バリデーション
      if (args === null || typeof args !== "object") {
        return { success: false, error: "args must be an object" };
      }
      const a = args as Record<string, unknown>;

      // doc: オブジェクト型チェック
      if (a.doc === null || typeof a.doc !== "object") {
        return { success: false, error: "doc must be a GeneratedDoc object" };
      }
      // outputPath: P42準拠3段バリデーション
      if (typeof a.outputPath !== "string" || a.outputPath.trim() === "") {
        return {
          success: false,
          error: "outputPath must be a non-empty string",
        };
      }

      // Layer 3: 内部サービス実行
      try {
        await docGenerator.exportToFile(
          a.doc as GeneratedDoc,
          a.outputPath as string,
        );
        return { success: true, data: undefined };
      } catch (error) {
        // Layer 4: エラーサニタイズ
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );

  // ─── skill:docs:templates ──────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DOCS_TEMPLATES,
    async (event: IpcMainInvokeEvent) => {
      // Layer 1: Sender 検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DOCS_TEMPLATES,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        return toIPCValidationError(validation);
      }

      // Layer 2: 引数なし（バリデーション不要）

      // Layer 3: テンプレート一覧返却
      try {
        return { success: true, data: [DEFAULT_DOC_TEMPLATE] };
      } catch (error) {
        // Layer 4: エラーサニタイズ
        return { success: false, error: sanitizeErrorMessage(error) };
      }
    },
  );
}

export function unregisterSkillDocsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_GENERATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_PREVIEW);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_EXPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_TEMPLATES);
}
```

## Preload API 設計

### SkillAPI 拡張（apps/desktop/src/preload/skill-api.ts）

```typescript
// SkillAPI に docs 操作4メソッドを追加（safeInvokeUnwrap パターン）
docsGenerate: (request: DocGenerationRequest): Promise<GeneratedDoc> =>
  safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_GENERATE, request),

docsPreview: (skillName: string, template?: DocTemplate): Promise<GeneratedDoc> =>
  safeInvokeUnwrap<GeneratedDoc>(IPC_CHANNELS.SKILL_DOCS_PREVIEW, { skillName, template }),

docsExport: (doc: GeneratedDoc, outputPath: string): Promise<void> =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_DOCS_EXPORT, { doc, outputPath }),

docsTemplates: (): Promise<DocTemplate[]> =>
  safeInvokeUnwrap<DocTemplate[]>(IPC_CHANNELS.SKILL_DOCS_TEMPLATES),
```

### Preload 型定義追加（apps/desktop/src/preload/types.ts）

```typescript
// SkillAPI 型に追加
docsGenerate: (request: DocGenerationRequest) => Promise<GeneratedDoc>;
docsPreview: (skillName: string, template?: DocTemplate) =>
  Promise<GeneratedDoc>;
docsExport: (doc: GeneratedDoc, outputPath: string) => Promise<void>;
docsTemplates: () => Promise<DocTemplate[]>;
```

## エラーハンドリング設計

### エラーカテゴリ分類

| エラー種別                    | エラーコード範囲 | リトライ | 発生箇所                                                  |
| ----------------------------- | ---------------- | -------- | --------------------------------------------------------- |
| 引数バリデーション失敗        | 1000-1999        | 不可     | IPC ハンドラ Layer 2（skillName, outputFormat, language） |
| パストラバーサル検出          | 1000-1999        | 不可     | `isValidOutputPath()` で拒否                              |
| スキル未検出                  | 2000-2999        | 不可     | `analyzeSkillStructure()` でスキルディレクトリ不在        |
| LLM 通信エラー / タイムアウト | 3000-3999        | 可能     | `generateSection()` で LLM query 失敗                     |
| ファイル書き込み失敗          | 4000-4999        | 可能     | `exportToFile()` で `fs.writeFile` / `convertToPdf` 失敗  |

### IPC レスポンス統一形式（NFR-04）

```typescript
// 成功
{ success: true, data: GeneratedDoc }
{ success: true, data: DocTemplate[] }
{ success: true, data: undefined }  // exportToFile の場合

// バリデーションエラー（Layer 2）
{ success: false, error: "skillName must be a non-empty string" }
{ success: false, error: "outputFormat must be one of: markdown, html, pdf" }
{ success: false, error: "language must be one of: ja, en" }

// サービスエラー（Layer 3 → Layer 4 でサニタイズ済み）
{ success: false, error: "Skill not found: test-skill" }
{ success: false, error: "LLM query failed" }
{ success: false, error: "File write failed" }
```

## DI / 初期化設計

### SkillService Facade との統合

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts に追加
import { SkillDocGenerator } from "./SkillDocGenerator";

export class SkillService {
  // 既存のプロパティ...
  private docGenerator: SkillDocGenerator | null = null;

  /**
   * Setter Injection: LLM query 関数準備後に SkillDocGenerator を設定する。
   * SkillService Facade の L2 コンポーネントとして管理する。
   */
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

### 初期化フロー

```typescript
// apps/desktop/src/main/index.ts（BrowserWindow 作成後）

// Step 1: LLM query 関数の構築（既存 LLM サービスに委譲）
const llmQuery: LLMQueryFn = async (prompt) => {
  const response = await llmService.query(prompt);
  return { content: response };
};

// Step 2: SkillDocGenerator 生成（Constructor Injection: queryFn）
const docGenerator = new SkillDocGenerator(llmQuery);

// Step 3: SkillService Facade への L2 コンポーネント登録
skillService.setDocGenerator(docGenerator);

// Step 4: IPC ハンドラ登録（P5対策: register/unregister 独立関数）
registerSkillDocsHandlers(mainWindow, docGenerator);

// Step 5: アプリ終了時のクリーンアップ
app.on("before-quit", () => {
  unregisterSkillDocsHandlers();
});
```

## シーケンス図

### ドキュメント生成フロー

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

### ファイルエクスポートフロー

```
Renderer                  Preload                    Main (IPC Handler)           SkillDocGenerator
  |                         |                           |                            |
  |-- docsExport(doc,path)->|                           |                            |
  |                         |-- safeInvokeUnwrap -----> |                            |
  |                         |                           |-- L1: validateIpcSender -> |
  |                         |                           |-- L2: validate args -----> |
  |                         |                           |-- L3: exportToFile() ----> |
  |                         |                           |                            |-- isValidOutputPath(path)
  |                         |                           |                            |-- fs.writeFile(path, content)
  |                         |                           |<- { success: true } ------  |
  |                         |<- void ------------------- |                            |
  |<- void ----------------- |                           |                            |
```

## 統合テスト連携

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント     | 契約定義                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| IPC 通信         | 4チャネルで `validateIpcSender` + P42 バリデーション。レスポンスは `IpcResult<T>` 形式         |
| Preload Bridge   | `safeInvokeUnwrap<T>` でアンラップ。4チャネルが `ALLOWED_INVOKE_CHANNELS` に登録済み           |
| LLM query        | `LLMQueryFn` 型で Constructor Injection。戻り値は `{ content: string }`                        |
| ファイルシステム | `exportToFile()` は `fs.writeFile` を使用。出力先は `isValidOutputPath()` でバリデーション済み |
| PDF 変換         | `convertToPdf()` は puppeteer の `page.pdf()` を使用。Electron 環境での Chromium 利用          |
| スキルファイル   | `analyzeSkillStructure()` は `.claude/skills/{skillName}/SKILL.md` と `references/` を読み取る |
| 型共有           | `@repo/shared` の `skill-docs.ts` から型をインポート。Main/Preload 両方で同一型を参照          |

## 多角的チェック観点

| 観点             | 確認事項                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------- |
| P42 準拠         | `skill:docs:generate` の skillName、`skill:docs:export` の outputPath で3段バリデーション実施 |
| P44/P45 準拠     | ハンドラ引数名（skillName, outputPath, request, template）と Preload 側の渡し方が一致する     |
| P27 準拠         | チャネル名は `IPC_CHANNELS.SKILL_DOCS_*` 定数で参照。文字列リテラル不使用                     |
| P5 対策          | `registerSkillDocsHandlers()` / `unregisterSkillDocsHandlers()` で二重登録を防止              |
| NFR-07 準拠      | `generatedAt` は `new Date().toISOString()` で ISO 8601 文字列として返す                      |
| NFR-08 準拠      | `exportToFile()` の outputPath で `..` を含むパスを拒否する                                   |
| NFR-11 準拠      | `outputFormat` は `["markdown", "html", "pdf"]` 許可値リストで検証                            |
| NFR-12 準拠      | `language` は `["ja", "en"]` 許可値リストで検証                                               |
| エラーサニタイズ | 全ハンドラの catch ブロックで `sanitizeErrorMessage()` を適用してからレスポンスを返す         |
| Setter Injection | `SkillDocGenerator` は `SkillService.setDocGenerator()` で L2 コンポーネントとして登録        |

## 成果物

| 成果物             | パス                                     | 説明                                                    |
| ------------------ | ---------------------------------------- | ------------------------------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | SkillDocGenerator クラス設計、DI 構造、テンプレート設計 |
| API 仕様           | `outputs/phase-2/api-specification.md`   | IPC チャネル設計、Preload API 設計、型定義設計          |
| Phase 2 仕様書     | `phase-2-design.md`                      | 本ファイル                                              |

## 完了条件

- [ ] `SkillDocGenerator` のクラス設計（public API 3メソッド、private 5メソッド）が確定している
- [ ] IPC チャネル4本の引数バリデーション・レスポンス形式が設計されている
- [ ] Preload API 4メソッドが `safeInvokeUnwrap` パターンで設計されている
- [ ] 型定義 5インターフェース（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection）が確定している
- [ ] `outputFormat` に `"pdf"` が含まれ、`convertToPdf()` メソッドが設計されている
- [ ] デフォルトテンプレート（7セクション）の構造と各セクションの LLM プロンプトが定義されている
- [ ] エラーカテゴリ分類（5種）と IPC レスポンス形式が設計されている
- [ ] DI / 初期化フロー（Constructor Injection + Setter Injection + registerSkillDocsHandlers）が設計されている
- [ ] シーケンス図（生成フロー・エクスポートフロー）が作成されている
- [ ] P42/P44/P45/P27/P5 対策が設計に反映されている
- [ ] 統合テスト連携セクションで7つの統合ポイントの契約が定義されている
- [ ] 曖昧語（条件・閾値・対象が特定されない語）が残っていない
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 3: 設計レビューゲート
