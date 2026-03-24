# Phase 1: 要件定義

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 1                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

`RuntimeSkillCreatorFacade.improve()` の現行スタブ実装を調査し、LLM によるスキル改善提案生成の要件を定義する。improve-prompt.md の内容を確認し、改善提案の型定義（section, before, after, reason）を決定する。

## 背景知識

- **AuthMode**: 認証モードの列挙型。`api-key`（直接API キー指定）または `subscription`（サブスクリプション認証）を取る
- **terminal_handoff / integrated_api**: `resolveDecision()` が返す実行経路。`terminal_handoff` は外部ターミナルに処理を委譲するモード、`integrated_api` はアプリ内蔵のLLMアダプタで直接API呼び出しを行うモード
- **LLMレスポンス形式制御**: LLMは指示なしだとMarkdownや説明文付きで応答する傾向がある。JSON形式のみを確実に返させるには、システムプロンプトに明示的なスキーマ指示（`IMPROVE_RESPONSE_SCHEMA_INSTRUCTION`）を付加する必要がある

## 実行タスク

1. `RuntimeSkillCreatorFacade.improve()` の現行スタブ実装を読み取り、インターフェースと戻り値型を確認する
2. `.claude/skills/skill-creator/agents/improve-prompt.md` の内容を読み取り、プロンプト設計に必要な情報を抽出する
3. `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorImproveResult` 型の現状を確認する
4. 改善提案の型定義要件を策定する（section, before, after, reason フィールド）
5. 関連する受入基準 AC-5 の達成条件を明確化する
6. 既存の plan() / execute() との整合性を確認する

## 参照資料

| 資料名                    | パス                                                                  | 説明                                |
| ------------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | improve() 現行スタブ実装            |
| skillCreator 型定義       | `packages/shared/src/types/skillCreator.ts`                           | RuntimeSkillCreatorImproveResult 型 |
| improve-prompt            | `.claude/skills/skill-creator/agents/improve-prompt.md`               | 改善プロンプト定義                  |
| Preload 型定義            | `apps/desktop/src/preload/types.ts`                                   | IPC型定義                           |
| 関連FR                    | FR-3                                                                  | 機能要件                            |
| 関連AC                    | AC-5                                                                  | 受入基準                            |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# improve() が既に実装されているか確認
grep -n "improve" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

| 判定     | 条件                            | 対応                                   |
| -------- | ------------------------------- | -------------------------------------- |
| 未実装   | スタブのみ存在                  | 通常どおり要件定義を進める             |
| 部分実装 | 一部ロジックが既に存在          | 実装済み部分を調査し、差分のみ要件化   |
| 実装済み | LLM呼び出しロジックが完全に存在 | Phase 4-5 を「検証・補完」モードに切替 |

### ステップ1: improve() 現行スタブ実装の調査

`RuntimeSkillCreatorFacade.ts` を読み取り、シグネチャ・分岐・戻り値型を確認する。

### ステップ2: improve-prompt.md の内容読み取り

出力スキーマと型齟齬を調査し、フィールドマッピング方針を策定する。

### ステップ3: RuntimeSkillCreatorImproveResult 型の現状確認

`packages/shared/src/types/skillCreator.ts` の型定義を確認する。

### ステップ4: 改善提案の型定義要件策定

section, before, after, reason フィールドの仕様を定義する。

### ステップ5: AC-5 達成条件の明文化

入力・処理・出力・エラーケースを明確化する。

### ステップ6: plan() / execute() との整合性確認

プロンプト読み込み・LLM呼び出し・レスポンスパースの共通パターンを確認する。

## 調査結果

### 1. improve() 現行スタブ実装（RuntimeSkillCreatorFacade.ts）

**シグネチャ**:

```typescript
improve(
  skillName: string,
  feedback: string,
  authMode: AuthMode,
  apiKey: string | null
): Promise<RuntimeSkillCreatorImproveResponse>
```

**実装状況**:

- `terminal_handoff` 分岐: 実装済み（L202-208）
- `integrated_api` 分岐: スタブ（L211-218）- ハードコード文字列を返すだけで LLM 呼び出しなし
- graceful degradation パターン: **未実装**（plan() には L101-113 で実装済み）

**対応方針**: `integrated_api` 分岐に LLM 呼び出しロジックを実装し、plan() と同パターンの graceful degradation を追加する。

### 2. improve-prompt.md の出力スキーマと型齟齬の解決方針

**improve-prompt.md が定義する出力スキーマ**:

```json
{
  "skillName": "string",
  "targetAgent": "string",
  "analysisResults": {
    "structureScore": "number",
    "clarityScore": "number"
  },
  "improvements": [
    {
      "section": "string",
      "issue": "string",
      "pattern": "string",
      "before": "string",
      "after": "string"
    }
  ],
  "improvedContent": "string"
}
```

**型齟齬の詳細**:

| フィールド   | improve-prompt.md | 仕様書（旧） | 解決後（確定）   |
| ------------ | ----------------- | ------------ | ---------------- |
| 問題点の説明 | `issue`           | -            | `reason` に統合  |
| 改善パターン | `pattern`         | -            | `reason` に統合  |
| 変更理由     | -                 | `reason`     | `reason`（確定） |

**解決方針（確定）**: LLM レスポンスパース時に `issue` と `pattern` を結合して `reason` フィールドに変換する。

```typescript
reason: `${improvement.issue} (改善パターン: ${improvement.pattern})`;
```

これにより、フロントエンドの型定義（`RuntimeSkillCreatorImproveSuggestion`）は `reason` 1フィールドで統一し、improve-prompt.md のプロンプト仕様を変更する必要がない。

### 3. RuntimeSkillCreatorImproveResult 型の現状と変更案

**現状**（`packages/shared/src/types/skillCreator.ts` L351-355）:

```typescript
interface RuntimeSkillCreatorImproveResult {
  improveId: string;
  suggestions: string[]; // 構造化されていない文字列配列
  revisedSpec?: string;
}
```

**変更案（Phase 2 設計書で確定する型定義）**:

```typescript
interface RuntimeSkillCreatorImproveSuggestion {
  section: string; // 対象セクション名（例: "4. 実行仕様"）
  before: string; // 変更前テキスト
  after: string; // 変更後テキスト
  reason: string; // 変更理由（issue + pattern を統合したフォーマット）
}

interface RuntimeSkillCreatorImproveResult {
  improveId: string;
  suggestions: RuntimeSkillCreatorImproveSuggestion[]; // 構造化された配列
  revisedSpec?: string;
}
```

### 4. AC-5 達成条件の明文化

**AC-5「フィードバックを入力すると改善提案が返る」の達成条件**:

| 項目   | 内容                                                                                       |
| ------ | ------------------------------------------------------------------------------------------ |
| 入力   | `skillName`（対象スキル名）+ `feedback`（ユーザーが入力した自然言語フィードバック文字列）  |
| 処理   | `AnthropicAdapter` 経由で LLM を呼び出し、improve-prompt.md をシステムプロンプトとして使用 |
| 出力   | `section` / `before` / `after` / `reason` を含む構造化された改善提案の配列                 |
| 承認後 | `SkillFileManager.writeFile()` で対象スキルの `SKILL.md` を `revisedSpec` で上書き更新     |

**エラーケース**:

- `skillName` が空文字列または空白のみ → バリデーションエラー（P42準拠3段バリデーション）
- `feedback` が空文字列または空白のみ → バリデーションエラー
- LLM レスポンスの JSON パース失敗 → `parseImproveResponse()` でエラー返却
- LLM 呼び出し失敗（ネットワーク障害等） → graceful degradation（plan() と同パターン）

### 5. plan() との整合性確認

improve() 実装は以下の点で plan() と同パターンに合わせる:

| 項目                 | plan() の実装                               | improve() の実装方針                  |
| -------------------- | ------------------------------------------- | ------------------------------------- |
| プロンプト読み込み   | `ResourceLoader.loadAgent()`                | `ResourceLoader.loadAgent()` を使用   |
| LLM 呼び出し         | `ILLMAdapter.sendChat(LLMChatRequestInput)` | 同パターンを使用                      |
| レスポンスパース     | `parsePlanResponse()`                       | `parseImproveResponse()` を新規作成   |
| 定数管理             | `PLAN_PROMPT_CONSTANTS`                     | `IMPROVE_PROMPT_CONSTANTS` を新規作成 |
| graceful degradation | L101-113 で実装済み                         | 同パターンを追加                      |

### 6. Preload API の確認

- メソッド名: `improveSkillWithFeedback(skillName, feedback, authMode, apiKey)`
- IPC チャンネル: `IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL`
- 送受信形式: `{ skillName, feedback, authMode, apiKey }` オブジェクト（IPC ハンドラ側もオブジェクト形式で受け取る）
- P44準拠: IPC ハンドラとPreload側のインターフェースは一致している

## 統合テスト連携

本Phaseは要件定義Phaseのため、統合テストの直接実施は不要。
Phase 4以降で統合テストを設計・実行する際の観点を記録する。

| 統合テスト観点        | 内容                                                             | 備考                       |
| --------------------- | ---------------------------------------------------------------- | -------------------------- |
| IPC チャンネル疎通    | `skill-creator:improve-skill` ハンドラが正しく登録・応答すること | Phase 4 でテスト設計       |
| LLM レスポンスパース  | JSON パース成功/失敗の両ケースを検証                             | Phase 4 でテストケース作成 |
| SkillFileManager 連携 | `readFile()` / `writeFile()` との統合動作                        | Phase 6 で統合テスト拡充   |
| graceful degradation  | `llmAdapter` 未注入時にスタブレスポンスを返すこと                | Phase 4 でテスト設計       |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                                                   |
| ------------------ | -------- | ------------------------------------------------------------------------------------------ |
| セキュリティ       | 該当     | P42準拠3段バリデーション（skillName, feedback）、パストラバーサル防止                      |
| アーキテクチャ     | 該当     | DI設計（SkillFileManager注入）、Facade パターン、plan()との共通化                          |
| エラーハンドリング | 該当     | 6種エラーコード網羅（VALIDATION, SKILL_NOT_FOUND, READ, PARSE, LLM, graceful degradation） |
| IPC通信            | 該当     | skill-creator:improve-skill ハンドラ仕様、P44準拠インターフェース整合                      |

## 成果物

| 成果物                                 | パス                                                            | 説明                                  |
| -------------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| 要件定義書                             | `docs/30-workflows/w3b-sc-improve-llm/phase-01-requirements.md` | 本ファイル                            |
| improve() 現行インターフェース調査メモ | 本ファイル内「調査結果」セクション1                             | シグネチャ・分岐・戻り値型の調査結果  |
| 改善提案型定義要件リスト               | 本ファイル内「調査結果」セクション3                             | section, before, after, reason の仕様 |
| AC-5 達成条件の明文化                  | 本ファイル内「調査結果」セクション4                             | 入力・処理・出力・エラーケースの定義  |

## 完了条件

- [x] `improve()` の現行スタブ実装を確認した
- [x] `improve-prompt.md` の内容を読み取り、プロンプト設計方針を策定した
- [x] `RuntimeSkillCreatorImproveResult` 型の現状を確認した
- [x] 改善提案フィールド（section, before, after, reason）の仕様を定義した
- [x] AC-5「フィードバックを入力すると改善提案が返る」の達成条件を明文化した
- [x] plan() / execute() との型・フロー整合性を確認した
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 2: 設計
