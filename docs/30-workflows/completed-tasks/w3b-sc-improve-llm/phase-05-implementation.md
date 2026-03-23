# Phase 5: 実装

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 5                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

Phase 4 で作成したテストを Green にする実装を行う。improve() の LLM 呼び出し実装、改善提案パーサー、SkillFileWriter 連携を実装する。

## 実行タスク

1. `packages/shared/src/types/skillCreator.ts` の型定義拡充
   - `RuntimeSkillCreatorImproveSuggestion` 型追加（確定インターフェース）:
     ```typescript
     interface RuntimeSkillCreatorImproveSuggestion {
       section: string;
       before: string;
       after: string;
       reason: string; // issue + pattern を統合した文字列
     }
     ```
   - `RuntimeSkillCreatorImproveResult` 型更新
2. `RuntimeSkillCreatorFacadeDeps` への DI 追加（MINOR-1反映）
   - `skillFileManager: SkillFileManager` を **必須 DI**（non-optional）として追加する
   - コンストラクタで `this.skillFileManager = deps.skillFileManager` として保持する
   - graceful degradation の対象外とする（SKILL.md 読み込みは improve() の必須処理）
   - `RuntimeSkillCreatorFacadeDeps` に `skillFileManager: SkillFileManager` を追加する前に、`grep -rn "new RuntimeSkillCreatorFacade" apps/desktop/src/` で全インスタンス化箇所を特定し、`skillFileManager` を渡す修正箇所リストを作成する
3. `apps/desktop/src/main/services/runtime/improvePromptConstants.ts` の新規作成（MINOR-2反映）
   - `planPromptConstants.ts` と同パターン
   - `IMPROVE_PROMPT_CONSTANTS` 定義（AGENT_NAME: "improve-prompt"、DEFAULT_MAX_TOKENS: 8192 等）
   - `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` 定数定義（JSON スキーマと "JSON のみを返せ" 指示を含む）
   - `IMPROVE_PROMPT_CONSTANTS.RESPONSE_FORMAT_START` = `"=== IMPROVE RESPONSE FORMAT ==="`
4. `RuntimeSkillCreatorFacade.improve()` の LLM 呼び出し実装
   - `ResourceLoader.loadAgent("improve-prompt")` で improve-prompt.md を読み込む（fs.readFileSync ではなく ResourceLoader を使用）
   - `SkillFileManager.readFile(skillName, "SKILL.md")` で SKILL.md を読み込む
   - system プロンプト = improve-prompt.md 内容 + `\n\n${IMPROVE_RESPONSE_SCHEMA_INSTRUCTION}`（MINOR-2反映）
   - user プロンプト = `buildImproveUserPrompt(feedback, skillContent)` で生成
   - `ILLMAdapter.sendChat()` で LLM を呼び出す（plan() と同一インターフェース）
5. 改善提案 JSON パーサー実装
   - `parseImproveResponse(content: string)`: LLM レスポンス文字列から JSON 部分を抽出（`stripMarkdownCodeBlock` 共用）
   - `isValidImproveResponse(data: unknown)`: type predicate でスキーマ検証（`in` 演算子使用、P49対策）
   - `mapToSuggestion(raw: LLMImprovement): RuntimeSkillCreatorImproveSuggestion`: `reason: \`${raw.issue} (改善パターン: ${raw.pattern})\`` で変換
     - `reason` 組み立て時に `raw.issue` または `raw.pattern` が undefined/空文字列の場合のフォールバックを実装する
       ```typescript
       reason: [raw.issue, raw.pattern ? `(改善パターン: ${raw.pattern})` : ""]
         .filter(Boolean)
         .join(" ") || "改善理由の詳細は提供されていません";
       ```
   - 不正 JSON 時は `{ success: false, error: { code: "PARSE_ERROR", message: string } }` を返す（P60対策）
6. エラーハンドリング実装（Phase 2 エラーコード準拠）
   - `SkillNotFoundError` → `{ success: false, error: { code: "SKILL_NOT_FOUND" } }`
   - `FileNotFoundError` → `{ success: false, error: { code: "READ_ERROR" } }`
   - `ReadonlySkillError` → applyImprovement() で `{ success: false, error: { code: "READONLY_SKILL" } }`（Phase 3 レビュー言及）
   - LLM 呼び出し失敗 → `{ success: false, error: { code: "LLM_ERROR" } }`
   - バリデーション失敗（空フィードバック等）→ `{ success: false, error: { code: "VALIDATION_ERROR" } }`（P42準拠 3段バリデーション）
7. SkillFileWriter 連携（承認後の適用フロー）
   - `applyImprovement(skillName, suggestions)` メソッド実装
   - before/after テキストによる文字列置換（全 suggestions を順次適用）
   - `SkillFileManager.writeFile()` による適用（自動バックアップ付き）
   - before 不一致はスキップ（エラーにしない）、applied/skipped カウントを返す
8. IPC レスポンス形式の確認（P60 対策）
   - improve() の全戻り値は `{ success: boolean, data?: T, error?: { code: string, message: string } }` の wrapper 形式
   - plan() と異なり、improve() は throw ではなく `{ success: false, error: {...} }` を返す

## 参照資料

| 資料名                     | パス                                                                                         | 説明                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Phase 4 テストファイル     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | Red 状態のテスト                                                                          |
| Phase 2 設計書             | `docs/30-workflows/w3b-sc-improve-llm/phase-02-design.md`                                    | JSON Schema、プロンプト設計、エラーコード一覧                                             |
| Phase 3 設計レビュー報告書 | `docs/30-workflows/w3b-sc-improve-llm/phase-03-design-review.md`                             | MINOR-1: DI追加、MINOR-2: SCHEMA_INSTRUCTION                                              |
| RuntimeSkillCreatorFacade  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                        | 実装対象ファイル                                                                          |
| planPromptConstants        | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                              | improvePromptConstants.ts の設計パターン参照                                              |
| skillCreator 型定義        | `packages/shared/src/types/skillCreator.ts`                                                  | 型定義拡充対象                                                                            |
| SkillFileManager           | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                                   | readFile/writeFile/SkillNotFoundError/ReadonlySkillError の API 確認                      |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                           | Result<T,E> パターン、any 型禁止                                                          |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                         | P19: 型キャスト、P42: trim() バリデーション、P49: type predicate、P60: IPC レスポンス形式 |

## 実行手順

1. Phase 4 のテストファイルを確認し、全テストが Red 状態であることを検証する
2. `packages/shared/src/types/skillCreator.ts` に型定義を追加する
3. `grep -rn "new RuntimeSkillCreatorFacade" apps/desktop/src/` でインスタンス化箇所を特定する
4. `RuntimeSkillCreatorFacadeDeps` に `skillFileManager` を DI 追加し、全インスタンス化箇所を修正する
5. `improvePromptConstants.ts` を作成する
6. `improve()` の LLM 呼び出しロジックを実装する
7. パーサー（`parseImproveResponse`, `isValidImproveResponse`, `mapToSuggestion`）を実装する
8. エラーハンドリングを実装する
9. `applyImprovement()` を実装する
10. Phase 4 のテストを実行し、全テストが Green になることを確認する

## 統合テスト連携

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                                                                 |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 該当     | P42準拠3段バリデーション（skillName, feedback）                                                          |
| エラーハンドリング | 該当     | 6種エラーコード（SKILL_NOT_FOUND, READ_ERROR, VALIDATION_ERROR, PARSE_ERROR, LLM_ERROR, READONLY_SKILL） |
| IPC通信            | 該当     | IPC wrapper形式 `{ success: boolean, data?, error? }`（P60対策）                                         |
| アーキテクチャ     | 該当     | DI設計（SkillFileManager必須注入）、plan()との共通化                                                     |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                             |
| -------------------- | -------- | ------------------------------------ |
| バックエンド（Main） | 該当     | RuntimeSkillCreatorFacade サービス層 |
| IPC通信              | 該当     | skill-creator:improve-skill ハンドラ |
| Preload/セキュリティ | 該当     | improveSkillWithFeedback API         |

## 成果物

| 成果物                             | パス                                                                  | 説明                                    |
| ---------------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| 更新済み RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | improve() 実装、DI 追加                 |
| 更新済み skillCreator 型定義       | `packages/shared/src/types/skillCreator.ts`                           | RuntimeSkillCreatorImproveSuggestion 型 |
| 新規 improvePromptConstants        | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`    | MINOR-2対応                             |
| 改善提案 JSON パーサー             | 実装ファイル内                                                        | parseImproveResponse, mapToSuggestion   |

## 完了条件

- [ ] `RuntimeSkillCreatorImproveSuggestion` 型を定義した（section, before, after, reason）
- [ ] `RuntimeSkillCreatorFacadeDeps` に `skillFileManager: SkillFileManager` を必須 DI として追加した（MINOR-1反映）
- [ ] `improvePromptConstants.ts` を作成し `IMPROVE_PROMPT_CONSTANTS` と `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` を定義した（MINOR-2反映）
- [ ] improve() が `ResourceLoader.loadAgent("improve-prompt")` でプロンプトを読み込んでいる
- [ ] system プロンプト末尾に `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` を付加している（MINOR-2反映）
- [ ] `SkillFileManager.readFile(skillName, "SKILL.md")` で SKILL.md を読み込んでいる
- [ ] `parseImproveResponse()` と `mapToSuggestion()` を実装した
- [ ] 不正 JSON 時は `{ success: false, error: { code: "PARSE_ERROR" } }` を返す実装を完了した（P60対策）
- [ ] エラーコード（SKILL_NOT_FOUND, READ_ERROR, VALIDATION_ERROR, PARSE_ERROR, LLM_ERROR, READONLY_SKILL）を実装した
- [ ] SkillFileWriter 連携（applyImprovement: applied/skipped カウント返却）を実装した
- [ ] Phase 4 のテストが全て Green になった
- [ ] `any` 型を使用していない
- [ ] `isValidImproveResponse()` 型ガードで `in` 演算子を使用した（P49対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 6: テスト拡充
