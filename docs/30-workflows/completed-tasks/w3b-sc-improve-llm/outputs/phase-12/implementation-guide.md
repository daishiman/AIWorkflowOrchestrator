# 実装ガイド: improve() LLM 統合

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 機能名   | w3b-sc-improve-llm     |
| 作成日   | 2026-03-23             |

---

## Part 1: 概念的説明（中学生レベル）

作文を書いたあと、先生に「ここをもっとこうしたら良くなるよ」と赤ペンで添削してもらうことがありますよね。「スキル改善提案」はまさにそれと同じ仕組みです。自分で作ったスキル（アプリに新しい能力を追加するための設計書のようなもの）を、AI の先生に見てもらい、「この部分はこう直すともっと良くなりますよ」という具体的なアドバイスをもらいます。

なぜこの仕組みが必要なのでしょうか。人が書いた文章にはどうしても見落としや改善の余地があります。自分ではうまく書けたと思っていても、別の視点で見ると「ここの説明が足りない」「この手順の順番を変えた方がわかりやすい」ということがよくあります。AI に第三者の目で確認してもらうことで、スキルの品質を効率よく高められます。

たとえば、あなたが「ファイルを整理するスキル」を作ったとします。そこに「エラーが起きたときの対応が書かれていないよ」「この手順の説明をもう少し具体的にしよう」といったフィードバック（改善してほしいポイント）を添えて AI に送ります。すると AI は設計書の中身を読み、フィードバックを参考にしながら、「どのセクションの」「どの文章を」「どう変えるべきか」「なぜ変えるのか」を整理して返してくれます。

この一連の流れを図にすると、次のようになります。

```
あなた: 「このスキルを見て、こういう点を改善したい」
  ↓
アプリ: スキルの設計書ファイルを読み込む
  ↓
アプリ: あなたの要望と設計書の中身を AI に送る
  ↓
AI: 設計書を分析し、改善案をまとめて返す
  ↓
アプリ: AI の回答を整理して、改善案の一覧として表示する
```

ここで大切な工夫が一つあります。AI は自由に文章を書けるため、そのまま頼むと「長い説明文」や「まとまりのない回答」が返ってくることがあります。そこで、AI に「答え方のルール」をあらかじめ伝えています。これが IMPROVE_RESPONSE_SCHEMA_INSTRUCTION（レスポンス書式指示）です。「回答は決まった形の箱（JSON という構造化データ）に入れて返してね。余計な説明は書かないでね」というルールを伝えることで、アプリが AI の回答を正しく読み取れるようにしています。テストの解答用紙に「記号で答えなさい」と書いてあるようなものです。

こうして AI から受け取った改善案は、「対象セクション」「変更前の文章」「変更後の文章」「変更理由」という4つの情報にきれいに整理されます。あなたはこの一覧を見て、納得できる提案だけを実際にスキルに反映させることができます。先生の添削を全部受け入れる必要はなく、自分で選べるのがポイントです。

---

## Part 2: 開発者向け実装詳細

### アーキテクチャ概要

`RuntimeSkillCreatorFacade.improve()` は plan() と同じパターンで LLM を呼び出し、スキル改善提案を構造化 JSON で返します。

```
Renderer
  -> Preload(improveSkillWithFeedback)
  -> IPC(skill-creator:improve-skill)
  -> Main Handler
    -> RuntimeSkillCreatorFacade.improve(skillName, feedback, authMode, apiKey)
      -> resolveDecision(authMode, apiKey)
        [terminal_handoff] -> TerminalHandoffBuilder.build() -> return
        [integrated_api]
          -> P42 バリデーション(skillName, feedback)
          -> Graceful degradation check
          -> SkillFileManager.readFile(skillName, "SKILL.md")
          -> ResourceLoader.loadAgent("improve-prompt")
          -> buildImproveUserPrompt(feedback, skillContent)
          -> ILLMAdapter.sendChat({ systemPrompt, messages, ... })
          -> parseImproveResponse(response.content)
          -> return { improveId, suggestions }
```

### 主要関数の責務

| 関数                                             | 責務                                                                                          | 入力                                   | 出力                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `buildImproveUserPrompt(feedback, skillContent)` | フィードバックと SKILL.md を user プロンプトに結合                                            | feedback: string, skillContent: string | テンプレート化された文字列                                                   |
| `parseImproveResponse(responseText)`             | LLM レスポンス文字列を JSON パースし、バリデーション後に構造化配列へ変換                      | responseText: string                   | `{ success: true, suggestions, revisedSpec }` or `{ success: false, error }` |
| `isValidImproveResponse(value)`                  | type predicate で LLM レスポンスのスキーマを検証（P49: `in` 演算子使用）                      | value: unknown                         | boolean                                                                      |
| `mapToSuggestion(raw)`                           | LLM の `issue`/`pattern` を `reason` に統合して `RuntimeSkillCreatorImproveSuggestion` に変換 | LLMImprovement                         | RuntimeSkillCreatorImproveSuggestion                                         |
| `handleImproveError(error)`                      | エラーを IPC wrapper 形式 `{ success: false, error: { code, message } }` に変換               | unknown                                | RuntimeSkillCreatorImproveResponse                                           |
| `stripMarkdownCodeBlock(text)`                   | LLM が Markdown コードブロックで囲んだ場合に除去する（plan() と共有）                         | string                                 | string                                                                       |

### IMPROVE_RESPONSE_SCHEMA_INSTRUCTION（MINOR-2 対応）

`improvePromptConstants.ts` に定義。system プロンプトの末尾に付加し、LLM に JSON のみを返すよう指示します。plan() の `PLAN_RESPONSE_SCHEMA_INSTRUCTION` と同パターン。

```typescript
export const IMPROVE_RESPONSE_SCHEMA_INSTRUCTION = `=== IMPROVE RESPONSE FORMAT ===
You must respond with ONLY a valid JSON object (no markdown, no explanation).
...
=== END IMPROVE RESPONSE FORMAT ===`;
```

### DI 設計

`RuntimeSkillCreatorFacadeDeps` に `skillFileManager?: SkillFileManager` を追加（optional）。improve() では SKILL.md 読み込みに必須だが、plan() / execute() では不要のため optional 設計。

```typescript
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileManager?: SkillFileManager; // TASK-SC-05 追加
}
```

### stripMarkdownCodeBlock 共有（DRY 原則）

`stripMarkdownCodeBlock()` は `RuntimeSkillCreatorFacade.ts` 内のモジュールスコープ関数として1箇所に定義され、`parsePlanResponse()` と `parseImproveResponse()` の両方から呼ばれます。LLM がレスポンスを ` ```json ... ``` ` で囲む場合に除去する前処理です。

### エラーコード一覧

| コード             | 条件                               | 検出方法                                 |
| ------------------ | ---------------------------------- | ---------------------------------------- |
| `VALIDATION_ERROR` | skillName/feedback が空/空白のみ   | P42 準拠 3段バリデーション               |
| `SKILL_NOT_FOUND`  | スキルディレクトリが存在しない     | SkillFileManager.readFile がスロー       |
| `READ_ERROR`       | SKILL.md ファイルが存在しない      | FileNotFoundError                        |
| `PARSE_ERROR`      | LLM レスポンスが不正 JSON          | parseImproveResponse()                   |
| `LLM_ERROR`        | LLM 呼び出し失敗（タイムアウト等） | sendChat がスロー                        |
| `READONLY_SKILL`   | ~/.claude/skills/ 配下のスキル     | applyImprovement 時の ReadonlySkillError |

### 改善提案 JSON Schema

```json
{
  "section": "string - 対象セクション名",
  "before": "string - 変更前テキスト",
  "after": "string - 変更後テキスト",
  "reason": "string - 変更理由（issue + pattern を統合）"
}
```

---

## IPC ドキュメント

### skill-creator:improve-skill

**リクエスト:**

```typescript
{ skillName: string; feedback: string; authMode?: AuthMode; apiKey?: string | null }
```

**レスポンス（成功時）:**

```typescript
{ improveId: string; suggestions: RuntimeSkillCreatorImproveSuggestion[]; revisedSpec?: string }
```

**レスポンス（失敗時）:**

```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
  }
}
```

**RuntimeSkillCreatorImproveSuggestion:**

```typescript
{
  section: string;
  before: string;
  after: string;
  reason: string;
}
```

---

## テスト結果サマリー

| カテゴリ                          | テスト数 | 結果       |
| --------------------------------- | -------- | ---------- |
| 正常系 (I-1〜I-5)                 | 5        | PASS       |
| applyImprovement (A-1, A-2)       | 2        | PASS       |
| エラー系 (E-1〜E-5)               | 5        | PASS       |
| 境界値 (E-6〜E-8)                 | 3        | PASS       |
| Graceful degradation (E-10, E-11) | 2        | PASS       |
| Terminal handoff (E-12)           | 1        | PASS       |
| バリデーション (E-13, E-14)       | 2        | PASS       |
| 単体テスト (E-15)                 | 1        | PASS       |
| **合計**                          | **21**   | **全PASS** |

### カバレッジ

| 指標              | 測定値 | 基準 | 判定 |
| ----------------- | ------ | ---- | ---- |
| Line Coverage     | 91.2%  | 80%+ | PASS |
| Branch Coverage   | 78.07% | 60%+ | PASS |
| Function Coverage | 100%   | 80%+ | PASS |
