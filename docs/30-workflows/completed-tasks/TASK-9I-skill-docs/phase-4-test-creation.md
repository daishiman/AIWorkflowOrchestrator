# Phase 4: テスト作成（TDD: Red）— TASK-9I スキルドキュメント生成

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 4                                                |
| 機能名     | TASK-9I-skill-docs                               |
| 作成日     | 2026-02-28                                       |
| 前提Phase  | Phase 1-3（要件定義・設計・設計レビュー）        |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

スキルドキュメント生成機能（SkillDocGenerator サービス・IPCハンドラー・型定義）のテストを**実装より先に作成**し、全テストが **Red 状態**（失敗）であることを確認する。TDD の Red フェーズとして、テストが実装の仕様書となる。

## 実行タスク

### Task 1: 型定義テスト作成（`skill-docs.test.ts`）

**配置先**: `packages/shared/src/types/__tests__/skill-docs.test.ts`

#### 1.1 テストケース一覧

| No   | テスト項目                                                                                                               | 期待結果                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| T-01 | DocGenerationRequest 型が必須フィールド（skillName, outputFormat, includeExamples, includeApiReference, language）を持つ | TypeScript コンパイルが通る        |
| T-02 | DocGenerationRequest の outputFormat が `"markdown" \| "html"` の2種類を受け入れる                                       | 各 outputFormat で型チェックが通る |
| T-03 | DocGenerationRequest の language が `"ja" \| "en"` の2種類を受け入れる                                                   | 各 language で型チェックが通る     |
| T-04 | DocGenerationRequest の customSections がオプショナル（`string[] \| undefined`）である                                   | undefined と配列の両方が代入可能   |
| T-05 | GeneratedDoc 型が必須フィールド（skillName, format, content, sections, generatedAt, wordCount）を持つ                    | TypeScript コンパイルが通る        |
| T-06 | DocSection 型が必須フィールド（id, title, content, order）を持つ                                                         | TypeScript コンパイルが通る        |
| T-07 | DocTemplate の sections が空配列でも有効である                                                                           | `sections: []` が許容される        |
| T-08 | TemplateSection の required が boolean 型である                                                                          | `true` / `false` の両方が代入可能  |

---

### Task 2: SkillDocGenerator テスト作成（`SkillDocGenerator.test.ts`）

**配置先**: `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts`

#### 2.1 テスト基盤セットアップ

```typescript
// LLM queryFn モック
const mockQueryFn = vi.fn().mockResolvedValue({
  content: "# Generated Documentation\n\nThis is generated content.",
});

// SkillFileManager モック（スキル構造解析用）
const mockSkillFileManager = {
  readSkillFile: vi.fn().mockResolvedValue("# SKILL.md content"),
  listSkillFiles: vi.fn().mockResolvedValue(["SKILL.md", "references/api.md"]),
  skillExists: vi.fn().mockResolvedValue(true),
};
```

**beforeEach でのリセット（P9対策）**:

```typescript
let generator: SkillDocGenerator;

beforeEach(() => {
  vi.clearAllMocks();
  generator = new SkillDocGenerator(mockQueryFn, mockSkillFileManager);
});
```

#### 2.2 テストケース一覧（generate — 正常系）

| No   | テスト項目                                                                   | 期待結果                                                                |
| ---- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| G-01 | Markdown 形式でドキュメントが生成される                                      | `GeneratedDoc.format` が `"markdown"` である                            |
| G-02 | HTML 形式でドキュメントが生成される                                          | `GeneratedDoc.format` が `"html"` であり content に `<html>` タグを含む |
| G-03 | 日本語（`language: "ja"`）でドキュメントが生成される                         | `mockQueryFn` の呼び出しプロンプトに日本語指定が含まれる                |
| G-04 | 英語（`language: "en"`）でドキュメントが生成される                           | `mockQueryFn` の呼び出しプロンプトに英語指定が含まれる                  |
| G-05 | `includeExamples: true` の場合にサンプルセクションが含まれる                 | `GeneratedDoc.sections` に使用例セクションが含まれる                    |
| G-06 | `includeExamples: false` の場合にサンプルセクションが省略される              | `GeneratedDoc.sections` に使用例セクションが含まれない                  |
| G-07 | `includeApiReference: true` の場合に API リファレンスセクションが含まれる    | `GeneratedDoc.sections` に API リファレンスセクションが含まれる         |
| G-08 | `includeApiReference: false` の場合に API リファレンスセクションが省略される | `GeneratedDoc.sections` に API リファレンスセクションが含まれない       |
| G-09 | `customSections` に指定したセクション名が追加される                          | `GeneratedDoc.sections` にカスタムセクション名が存在する                |
| G-10 | `generatedAt` が ISO 8601 形式の文字列である                                 | `new Date(generatedAt).toISOString() === generatedAt` が成立する        |
| G-11 | `wordCount` が content の総文字数と一致する                                  | `wordCount` が全セクション content の合計文字数と一致する               |
| G-12 | 各セクションが `id`, `title`, `content`, `order` を持つ                      | 全セクションが4つの必須フィールドを持つ                                 |
| G-13 | セクションの `order` が昇順で連番である                                      | `sections[i].order === i + 1` が全セクションで成立する                  |

#### 2.3 テストケース一覧（generate — エラー系）

| No   | テスト項目                                                           | 期待結果                                                      |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| G-14 | 存在しないスキル名で generate すると Error がスローされる            | `"Skill not found: nonexistent-skill"` メッセージを含む Error |
| G-15 | LLM queryFn が reject した場合に Error がスローされる                | LLM のエラーメッセージを含む Error                            |
| G-16 | LLM queryFn が 30 秒以上応答しない場合にタイムアウトする             | タイムアウトエラーがスローされる                              |
| G-17 | `outputFormat` が不正な値（`"pdf"` 等）の場合に Error がスローされる | バリデーションエラーがスローされる                            |

#### 2.4 テストケース一覧（preview）

| No   | テスト項目                                                       | 期待結果                                                     |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| P-01 | テンプレートなしでプレビューが生成される                         | デフォルトテンプレートで `GeneratedDoc` が返却される         |
| P-02 | カスタムテンプレートでプレビューが生成される                     | テンプレートの `sections` と同数のセクションが生成される     |
| P-03 | カスタムテンプレートの `required: true` セクションが全て含まれる | required セクションが全て `GeneratedDoc.sections` に存在する |
| P-04 | 存在しないスキル名で preview すると Error がスローされる         | `"Skill not found: ..."` メッセージを含む Error              |

#### 2.5 テストケース一覧（exportToFile）

| No   | テスト項目                                               | 期待結果                                            |
| ---- | -------------------------------------------------------- | --------------------------------------------------- |
| E-01 | Markdown ドキュメントがファイルに書き出される            | `fs.writeFile` が content と共に呼び出される        |
| E-02 | HTML ドキュメントがファイルに書き出される                | `fs.writeFile` が HTML content と共に呼び出される   |
| E-03 | パストラバーサルパス（`../../etc/passwd`）が拒否される   | バリデーションエラーがスローされる                  |
| E-04 | パストラバーサルパス（`/tmp/../etc/passwd`）が拒否される | バリデーションエラーがスローされる                  |
| E-05 | ファイルシステムエラー時に Error がスローされる          | `fs.writeFile` が reject した場合にエラーが伝播する |

#### 2.6 テストケース一覧（DI 検証）

| No   | テスト項目                               | 期待結果                                                 |
| ---- | ---------------------------------------- | -------------------------------------------------------- |
| D-01 | queryFn がコンストラクタで注入される     | `generate()` 呼び出し時に注入された queryFn が使用される |
| D-02 | queryFn のモック差し替えが正常に動作する | 異なるモック関数で異なる結果が返却される                 |

#### 2.7 テストケース一覧（analyzeSkillStructure — private メソッドの間接テスト）

| No   | テスト項目                                              | 期待結果                                               |
| ---- | ------------------------------------------------------- | ------------------------------------------------------ |
| A-01 | `generate()` 呼び出し時にスキルディレクトリが解析される | queryFn に渡されるプロンプトにスキル構造情報が含まれる |

---

### Task 3: IPC ハンドラーテスト作成（`skillHandlers.docs.test.ts`）

**配置先**: `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`

#### 3.1 テスト基盤セットアップ

```typescript
// electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// ipc-validator モック
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));
```

**SkillDocGenerator モック**:

```typescript
const mockSkillDocGenerator = {
  generate: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    format: "markdown",
    content: "# Test\n\nContent",
    sections: [{ id: "s1", title: "Overview", content: "Content", order: 1 }],
    generatedAt: "2026-02-28T00:00:00.000Z",
    wordCount: 7,
  }),
  preview: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    format: "markdown",
    content: "# Preview\n\nContent",
    sections: [{ id: "s1", title: "Overview", content: "Content", order: 1 }],
    generatedAt: "2026-02-28T00:00:00.000Z",
    wordCount: 7,
  }),
  exportToFile: vi.fn().mockResolvedValue(undefined),
};
```

**beforeEach でのリセット（P9対策）**:

```typescript
let handlerMap: Map<string, Function>;

beforeEach(() => {
  vi.clearAllMocks();
  handlerMap = new Map();
  registerSkillDocsHandlers(mockMainWindow, mockSkillDocGenerator);
});
```

#### 3.2 テストケース一覧（正常系）

| No   | チャンネル             | テスト項目                               | 期待結果                                 |
| ---- | ---------------------- | ---------------------------------------- | ---------------------------------------- |
| H-01 | `skill:docs:generate`  | ドキュメントを生成する                   | `{ success: true, data: GeneratedDoc }`  |
| H-02 | `skill:docs:preview`   | スキル名のみでプレビューを生成する       | `{ success: true, data: GeneratedDoc }`  |
| H-03 | `skill:docs:preview`   | テンプレート付きでプレビューを生成する   | `{ success: true, data: GeneratedDoc }`  |
| H-04 | `skill:docs:export`    | ドキュメントをファイルにエクスポートする | `{ success: true }`                      |
| H-05 | `skill:docs:templates` | テンプレート一覧を取得する               | `{ success: true, data: DocTemplate[] }` |

#### 3.3 テストケース一覧（バリデーションエラー — P42準拠3段バリデーション）

| No   | チャンネル            | テスト項目                                               | 期待結果                                                                   |
| ---- | --------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| H-06 | `skill:docs:generate` | `skillName` が空文字列                                   | `{ success: false, error: "skillName must be a non-empty string" }`        |
| H-07 | `skill:docs:generate` | `skillName` がスペースのみ `"   "`                       | `{ success: false, error: "skillName must be a non-empty string" }`        |
| H-08 | `skill:docs:generate` | `skillName` が文字列以外（数値）                         | `{ success: false, error: "skillName must be a non-empty string" }`        |
| H-09 | `skill:docs:generate` | `outputFormat` が不正な値 `"pdf"`                        | `{ success: false, error: "outputFormat must be one of: markdown, html" }` |
| H-10 | `skill:docs:generate` | `outputFormat` が未指定（undefined）                     | `{ success: false, error: "outputFormat must be one of: markdown, html" }` |
| H-11 | `skill:docs:generate` | `language` が不正な値 `"fr"`                             | `{ success: false, error: "language must be one of: ja, en" }`             |
| H-12 | `skill:docs:preview`  | `skillName` が空文字列                                   | `{ success: false, error: "skillName must be a non-empty string" }`        |
| H-13 | `skill:docs:preview`  | `skillName` がスペースのみ `"   "`                       | `{ success: false, error: "skillName must be a non-empty string" }`        |
| H-14 | `skill:docs:export`   | `outputPath` が空文字列                                  | `{ success: false, error: "outputPath must be a non-empty string" }`       |
| H-15 | `skill:docs:export`   | `outputPath` がスペースのみ `"   "`                      | `{ success: false, error: "outputPath must be a non-empty string" }`       |
| H-16 | `skill:docs:export`   | `doc` が未指定（undefined）                              | `{ success: false, error: "doc must be a valid object" }`                  |
| H-17 | `skill:docs:export`   | `outputPath` にパストラバーサル文字列 `../../etc/passwd` | `{ success: false, error: "Invalid output path" }`                         |

#### 3.4 テストケース一覧（サービスエラー）

| No   | チャンネル            | テスト項目                     | 期待結果                                                              |
| ---- | --------------------- | ------------------------------ | --------------------------------------------------------------------- |
| H-18 | `skill:docs:generate` | 存在しないスキル名で生成       | `{ success: false, error: "Skill not found: ..." }`                   |
| H-19 | `skill:docs:generate` | LLM queryFn がエラーを返す     | `{ success: false, error: "Document generation failed" }`             |
| H-20 | `skill:docs:preview`  | 存在しないスキル名でプレビュー | `{ success: false, error: "Skill not found: ..." }`                   |
| H-21 | `skill:docs:export`   | ファイルシステムエラー         | `{ success: false, error: "Export failed" }`                          |
| H-22 | 全チャンネル共通      | 予期しない Error               | `{ success: false, error: "Internal error" }`（内部情報を漏洩しない） |

#### 3.5 テストケース一覧（セキュリティ）

| No   | テスト項目                                                          | 期待結果                                             |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| H-23 | validateIpcSender が `{ valid: false }` を返す場合                  | `toIPCValidationError` の結果が throw される         |
| H-24 | 全4チャンネルで validateIpcSender が呼び出される                    | 各ハンドラーで `validateIpcSender` が1回呼び出される |
| H-25 | validateIpcSender に正しい引数（event, channel, options）が渡される | `getAllowedWindows` が `[mainWindow]` を返す         |

#### 3.6 テストケース一覧（登録・解除）

| No   | テスト項目                                                  | 期待結果                                  |
| ---- | ----------------------------------------------------------- | ----------------------------------------- |
| H-26 | `registerSkillDocsHandlers` で4チャンネル全てが登録される   | `ipcMain.handle` が4回呼び出される        |
| H-27 | `unregisterSkillDocsHandlers` で4チャンネル全てが解除される | `ipcMain.removeHandler` が4回呼び出される |
| H-28 | 登録されるチャンネル名が全て `IPC_CHANNELS` 定数を使用      | ハードコード文字列が存在しない            |

#### 3.7 テストケース一覧（IPC シリアライズ）

| No   | テスト項目                                                   | 期待結果                                              |
| ---- | ------------------------------------------------------------ | ----------------------------------------------------- |
| H-29 | generate レスポンスの `generatedAt` が ISO 8601 文字列である | `typeof generatedAt === "string"` かつ ISO 8601 形式  |
| H-30 | preview レスポンスの `generatedAt` が ISO 8601 文字列である  | `new Date(generatedAt).toISOString() === generatedAt` |

---

## 参照資料

| 資料                                                                             | 用途                         |
| -------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 成果物（phase-1-requirements.md）                                        | 要件・受け入れ基準           |
| Phase 2 成果物（phase-2-design.md）                                              | 設計成果物                   |
| Phase 3 成果物（phase-3-design-review.md）                                       | レビュー結果                 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                     | 既存IPCハンドラーパターン    |
| `apps/desktop/src/main/ipc/skillHandlers.ts` L592-610                            | `validateStringArg` 共通関数 |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`                  | テストパターン参考           |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`      | セキュリティテストパターン   |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`             | IPC チャネル定義             |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`     | IPC セキュリティパターン     |
| `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力バリデーション規約       |
| `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`    | サービス層アーキテクチャ     |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`            | エラー処理方針               |
| `.claude/rules/04-electron-security.md`                                          | IPC セキュリティ原則         |
| `.claude/rules/06-known-pitfalls.md#P9`                                          | テスト間変数リーク防止       |
| `.claude/rules/06-known-pitfalls.md#P39`                                         | happy-dom userEvent 非互換   |
| `.claude/rules/06-known-pitfalls.md#P40`                                         | テスト実行ディレクトリ依存   |
| `.claude/rules/06-known-pitfalls.md#P42`                                         | .trim() 3段バリデーション    |

## 統合テスト連携

| 連携先                | 内容                                                           |
| --------------------- | -------------------------------------------------------------- |
| Phase 5（実装）       | Phase 4 で定義したテスト仕様を満たす実装を追加する             |
| Phase 6（テスト拡充） | Phase 4 で不足する境界値・エッジケース・組合せテストを拡張する |
| Phase 9（品質保証）   | 全テスト PASS + lint + typecheck 通過を品質ゲートとする        |

## 多角的チェック観点

| 観点              | 確認事項                                                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト網羅性      | 型定義（8テスト）・サービス正常系（13テスト）・サービスエラー系（4テスト）・プレビュー（4テスト）・エクスポート（5テスト）・DI（2テスト）・構造解析（1テスト）の7カテゴリが網羅されている |
| P42準拠           | 全文字列引数に3段バリデーション（typeof → 空文字列 → trim()）テストが存在する                                                                                                             |
| セキュリティ      | validateIpcSender の呼び出し検証が全4チャンネルで実施されている                                                                                                                           |
| IPC シリアライズ  | generatedAt が ISO 8601 文字列として返却されることが検証されている                                                                                                                        |
| DI テスタビリティ | queryFn のモック差し替えによるユニットテストが実行可能であることが検証されている                                                                                                          |
| エラーサニタイズ  | 予期しないエラーで内部情報（スタックトレース、ファイルパス）が漏洩しないことが検証されている                                                                                              |
| パストラバーサル  | exportToFile の outputPath にパストラバーサル文字列が拒否されることが検証されている                                                                                                       |

## 成果物

| 成果物                                                                            | 説明                                 |
| --------------------------------------------------------------------------------- | ------------------------------------ |
| `packages/shared/src/types/__tests__/skill-docs.test.ts`                          | 型定義テスト（8テスト）              |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts`                  | SkillDocGenerator テスト（29テスト） |
| `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`                            | IPC ハンドラーテスト（30テスト）     |
| `docs/30-workflows/TASK-9I-skill-docs/outputs/phase-4/test-specification.md`      | テスト仕様書（Red 状態確認結果）     |
| `docs/30-workflows/TASK-9I-skill-docs/outputs/phase-4/test-cases.md`              | テストケース一覧                     |
| `docs/30-workflows/TASK-9I-skill-docs/outputs/phase-4/integration-test-design.md` | 統合テスト設計                       |

## 完了条件

- [ ] 3つのテストファイルが作成されている
- [ ] 型定義テスト（8テスト）が記述されている
- [ ] SkillDocGenerator テスト（29テスト）が記述されている
- [ ] IPC ハンドラーテスト（30テスト）が記述されている
- [ ] 全テスト（67テスト）が **Red 状態**（失敗）である（実装が存在しないため）
- [ ] テストファイル内にハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数を使用）
- [ ] `beforeEach` で全モックがリセットされている（P9対策）
- [ ] IPC バリデーションテストが P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を検証している
- [ ] セキュリティテストで `validateIpcSender` の呼び出しと `getAllowedWindows` コールバックが検証されている
- [ ] パストラバーサル攻撃防止テストが `exportToFile` ハンドラーに対して存在する
- [ ] DI パターン（queryFn のモック差し替え）が検証されている
- [ ] テスト実行は `cd apps/desktop && pnpm vitest run` で行う（P40対策）
- [ ] `outputs/phase-4/test-specification.md` に Red 状態確認結果を記録済み
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 5（実装）へ進む。テストを通すための最小限のプロダクションコードを実装する。
