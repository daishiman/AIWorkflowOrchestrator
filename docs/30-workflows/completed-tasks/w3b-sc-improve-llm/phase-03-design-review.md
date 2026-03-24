# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 3                  |
| 機能名     | w3b-sc-improve-llm |
| 作成日     | 2026-03-22         |
| レビュー日 | 2026-03-23         |
| 判定       | **MINOR**          |

## 目的

Phase 2 で設計した improve() LLM 実装の妥当性を検証する。特に改善提案の適用安全性と破壊的変更防止策を重点的にレビューする。

## 実行タスク

1. 設計レビューチェックリスト実行
   - JSON Schema の堅牢性確認（LLM が不正 JSON を返した場合のハンドリング）
   - section/before/after/reason フィールドの型制約確認
2. 改善提案の適用安全性検証
   - before テキストが SKILL.md に存在しない場合の処理
   - after テキストで SKILL.md のフォーマットが壊れる可能性
   - 複数提案の適用順序と競合処理
3. 破壊的変更防止策の検証
   - SKILL.md バックアップ戦略（適用前の退避）
   - ロールバック可能な適用フロー設計の確認
4. plan() との AnthropicAdapter 共通化設計の妥当性確認（DRY 原則）
5. レビュー判定（PASS / MINOR / MAJOR）

## 参照資料

| 資料名                    | パス                                                                  | 説明                     |
| ------------------------- | --------------------------------------------------------------------- | ------------------------ |
| Phase 2 成果物            | `docs/30-workflows/w3b-sc-improve-llm/phase-02-design.md`             | 設計書                   |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | improve() 現行スタブ実装 |
| planPromptConstants       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | plan() 定数定義          |
| SkillFileManager          | `apps/desktop/src/main/services/skill/SkillFileManager.ts`            | SKILL.md 読み書き        |
| skillCreator 型定義       | `packages/shared/src/types/skillCreator.ts`                           | 型定義                   |
| improve-prompt            | `.claude/skills/skill-creator/agents/improve-prompt.md`               | 改善プロンプト定義       |
| コード品質ルール          | `.claude/rules/02-code-quality.md`                                    | エラーハンドリング原則   |
| 既知の落とし穴            | `.claude/rules/06-known-pitfalls.md`                                  | P19, P48: 型安全性       |

## 実行手順

### ステップ1: 設計レビューチェックリスト実行

JSON Schema の堅牢性、フィールド型制約を確認する。

### ステップ2: 改善提案の適用安全性検証

before/after テキストマッチ、複数提案の競合処理を検証する。

### ステップ3: 破壊的変更防止策の検証

バックアップ戦略、ロールバック可能性を確認する。

### ステップ4: plan() との共通化設計の妥当性確認

DRY 原則に基づき共通化ポイントの妥当性を確認する。

### ステップ5: レビュー判定

PASS / MINOR / MAJOR の判定を行い、指摘事項を記録する。

## 設計レビュー報告書

### 判定: MINOR

設計の基本方針（LLM呼び出しフロー、エラーハンドリング網羅性、バックアップ戦略、plan()との共通化）は妥当。
MINOR 指摘を2件検出。いずれも実装前（Phase 5 着手前）に対応すること。

---

### レビュー結果詳細

#### 1. JSON Schema の堅牢性

**判定: OK**

- `JSON.parse` 失敗時に `PARSE_ERROR` を返す設計は適切。
- `stripMarkdownCodeBlock` による前処理が plan() と共通化されており、LLM が Markdown コードブロックで囲んだ場合にも対応できる。
- `improvements` 配列が空（提案なし）の場合: 設計上は `applied: 0, skipped: 0` として正常終了する想定であり、仕様として妥当。LLM が改善不要と判断した結果として扱えばよい。
- `issue`/`pattern` フィールドが LLM レスポンスで欠損する可能性について: `mapToSuggestion()` 内で `${raw.issue} (改善パターン: ${raw.pattern})` を組み立てる際、`raw.issue` または `raw.pattern` が `undefined` の場合は文字列 `"undefined"` が混入する。実害は限定的だが、型ガードを `parseImproveResponse()` の `isValidImproveResponse()` に含めることで防止できる（後述 MINOR-2 と合わせて対処）。

#### 2. 改善提案の適用安全性

**判定: OK（注意点1件あり → MINOR-1 の対応方針に含める）**

- `before` テキストが SKILL.md に存在しない場合のスキップ設計は適切。エラーにしないことで部分適用を許容する設計は妥当。
- `SkillFileManager.writeFile()` の自動バックアップにより、適用後に内容が壊れた場合も `restoreBackup()` でロールバック可能。
- **注意点: 複数提案の競合処理**
  - 複数の `suggestions` を順次適用する際、先行する適用によって SKILL.md 本文が変化すると、後続 `suggestion` の `before` テキストがマッチしなくなる可能性がある（例: 先行 suggestion が before テキストの一部を変更した場合）。
  - 設計では `before` 不一致はスキップとなっており、この挙動は許容できる。ただし適用ログ（`applied`/`skipped` カウント）でユーザーに通知する仕様は維持すること。
  - 設計書に「順次適用時の競合リスクと許容方針」を明記することを推奨する（MINOR-1 対応方針に含める）。

#### 3. 破壊的変更防止策

**判定: OK**

- `SkillFileManager.writeFile()` は既存ファイルの自動バックアップ（`SKILL.md.backup.<timestamp>`）を実施する。実装を確認済み。
- `SkillFileManager.restoreBackup()` が利用可能であり、IPC 経由でロールバック操作が可能。
- `SkillFileManager.writeFile()` が `ReadonlySkillError` をスローする場合（`~/.claude/skills/` 配下のスキル）、書き込み自体が拒否されるため破壊的変更は発生しない。この挙動はエラーハンドリング表に追加すべき（MINOR-1 対応方針に含める）。

#### 4. plan() との共通化設計の妥当性

**判定: OK**

- `stripMarkdownCodeBlock` の共有: 適切。同一ファイル内のモジュールスコープ関数として既に存在し、`parseImproveResponse()` からも参照可能。
- `IMPROVE_PROMPT_CONSTANTS`: `planPromptConstants.ts` と同パターン。`DEFAULT_MAX_TOKENS: 8192`（plan は 4096）は `improvedContent` 全文を含む出力を想定しており妥当。
- Graceful degradation ガード（`if (!this.llmAdapter || !this.resourceLoader)`）: plan() の L101-113 と同パターンであり一貫性がある。
- `ILLMAdapter.sendChat()` の呼び出し構造: plan() と同一インターフェースを使用しており問題なし。

#### 5. DI と依存関係（SkillFileManager の未定義）

**判定: MINOR-1**

- `RuntimeSkillCreatorFacadeDeps` インターフェース（`RuntimeSkillCreatorFacade.ts` L39-45）に `skillFileManager` が含まれていない。
- `improve()` の `integrated_api` 分岐で `SkillFileManager.readFile(skillName, "SKILL.md")` を呼ぶ設計だが、現状では依存注入の経路が未定義。
- **対応方針**: Phase 5 実装前に `RuntimeSkillCreatorFacadeDeps` に `skillFileManager?: SkillFileManager` を追加し、コンストラクタで `this.skillFileManager` として保持する。Graceful degradation チェック対象にも含める（`!this.llmAdapter || !this.resourceLoader || !this.skillFileManager`）。または `skillFileManager` は必須 DI（non-optional）とし、graceful degradation の対象外とすることも検討する（SKILL.md 読み込みは improve() の必須処理のため必須 DI が適切）。

#### 6. user プロンプトへの JSON 形式指示の欠如

**判定: MINOR-2**

- `plan()` では `PLAN_RESPONSE_SCHEMA_INSTRUCTION` を system プロンプトの末尾に付加し、JSON 出力形式を明示的に LLM に伝えている（`planPromptConstants.ts` の `PLAN_RESPONSE_SCHEMA_INSTRUCTION` 参照）。
- `improve()` の設計では、`improve-prompt.md` の S5.2 に出力スキーマが定義されているが、これはファイルに記述された静的な仕様説明であり、LLM が実際の呼び出し時に system プロンプトとして受け取る保証はない（`ResourceLoader.loadAgent("improve-prompt")` が読み込む内容次第）。
- improve-prompt.md の実ファイルを確認したところ、S5.2 の出力スキーマは `generate_prompt.js` への受け渡し用の記述であり、「JSON のみを返せ」という明示的な指示が含まれていない。LLM は説明文として読み込み、Markdown テキストや説明付きの応答を返す可能性がある。
- **対応方針**: `IMPROVE_PROMPT_CONSTANTS` に `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` 定数を追加し、`buildImproveUserPrompt()` の末尾または system プロンプトの末尾に付加する。内容は `PLAN_RESPONSE_SCHEMA_INSTRUCTION` と同パターンで、JSON スキーマと「JSON のみを返せ（markdown/説明不要）」の旨を明記する。

---

### MINOR 指摘サマリー

| No.     | 指摘箇所                                       | 内容                                                                          | 対応方針                                                                                         | 対応タイミング |
| ------- | ---------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------- |
| MINOR-1 | `RuntimeSkillCreatorFacadeDeps`                | `skillFileManager` が DI インターフェースに未定義                             | `skillFileManager: SkillFileManager` を必須 DI として追加。graceful degradation から除外         | Phase 5 実装前 |
| MINOR-2 | `buildImproveUserPrompt()` / system プロンプト | JSON 出力形式の明示的な指示が欠如。LLM が Markdown テキストで返す可能性がある | `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` を定義し system プロンプトまたは user プロンプト末尾に付加 | Phase 5 実装前 |

---

### 次フェーズへの移行条件

MINOR 指摘は Phase 5 実装前に対応すること。Phase 4（テスト作成）は並行して着手可能だが、MINOR-1/MINOR-2 の対応内容をテスト設計に反映すること（例: `skillFileManager` モックの注入、JSON 形式強制指示の有無による LLM レスポンスパースのテスト）。

## 統合テスト連携

本Phaseは設計レビューPhaseのため、統合テストの直接実施は不要。
Phase 4以降で統合テストを設計・実行する際の観点として、レビューで検出した事項を記録する。

| 統合テスト観点               | 内容                                                                    | 備考                     |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------ |
| MINOR-1: SkillFileManager DI | `skillFileManager` 未注入時の挙動（graceful degradation 対象外）        | Phase 4 テスト設計に反映 |
| MINOR-2: JSON形式指示        | `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` 付加時のLLMレスポンスパーステスト | Phase 4 テスト設計に反映 |
| 競合処理の適用ログ           | 複数suggestions順次適用時の `applied`/`skipped` カウント正確性          | Phase 6 統合テスト       |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                              |
| ------------------ | -------- | --------------------------------------------------------------------- |
| セキュリティ       | 該当     | P42準拠バリデーション設計の妥当性確認済み                             |
| アーキテクチャ     | 該当     | DI設計（SkillFileManager注入 MINOR-1）、Facade パターン妥当性確認済み |
| エラーハンドリング | 該当     | 7種エラーケース網羅確認済み、ReadonlySkillError 追加推奨              |
| IPC通信            | 該当     | skill-creator:improve-skill ハンドラ仕様の整合性確認済み              |

## 成果物

| 成果物             | パス                                                             | 説明                            |
| ------------------ | ---------------------------------------------------------------- | ------------------------------- |
| 設計レビュー報告書 | `docs/30-workflows/w3b-sc-improve-llm/phase-03-design-review.md` | 本ファイル（判定: MINOR）       |
| 指摘事項リスト     | 本ファイル内「MINOR 指摘サマリー」セクション                     | MINOR-1, MINOR-2 の対応方針付き |

## 完了条件

- [x] JSON Schema 堅牢性を確認した（不正 JSON 時のフォールバック）
- [x] 改善提案の適用安全性を検証した（before 不一致、フォーマット破壊）
- [x] 破壊的変更防止策（バックアップ・ロールバック）を確認した
- [x] AnthropicAdapter 共通化設計の妥当性を確認した
- [x] レビュー判定を PASS / MINOR / MAJOR で明記した
- [x] MINOR 以上の指摘は全て対応方針を記載した
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

Phase 4: テスト作成
