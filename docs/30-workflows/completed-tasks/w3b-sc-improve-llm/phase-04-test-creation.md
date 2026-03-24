# Phase 4: テスト作成

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 4                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

improve() の LLM 実装に対するテストケースを設計・実装する。LLM モックテスト、改善提案 JSON Schema テスト、SKILL.md 読み込みテストを網羅する。

## 実行タスク

1. テストファイル作成
   - `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`
2. テストケース設計（TDD: テストファースト）
   - I-1: フィードバックと SKILL.md を渡すと LLM が呼ばれ改善提案が返る（正常系）
   - I-2: 改善提案 JSON が section/before/after/reason を含む（Schema検証）
   - I-3: SKILL.md が正常に読み込まれ user プロンプトに含まれる
   - I-4: LLM が不正 JSON を返した場合は `{ success: false, error: { code: "PARSE_ERROR" } }` を返す（P60対策: IPC wrapper 形式）
   - I-5: improve-prompt.md の内容が system プロンプトとして使用される。かつ `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION`（`=== IMPROVE RESPONSE FORMAT ===` マーカー）が system プロンプト末尾に付加されている（MINOR-2反映）
3. LLM モック設計
   - `ILLMAdapter.sendChat()` をモック化（plan.test.ts パターンに倣う: `vi.fn()` ベースの `createMockLLMAdapter()` ファクトリ）
   - 正常レスポンス（JSON 改善提案）と異常レスポンス（不正 JSON）の両パターン
4. SkillFileManager モック設計（MINOR-1 反映）
   - `readFile(skillName, "SKILL.md")` の成功・失敗パターンを `vi.fn()` でモック化
   - `createMockSkillFileManager()` ファクトリ関数として定義する
   - `readFile` 成功時は SKILL.md のテキストを返す（`Promise<string>`）
   - `readFile` 失敗時は `SkillNotFoundError` または `FileNotFoundError` をスロー
5. モック注入設計（MINOR-1 反映）
   - `RuntimeSkillCreatorFacade` のコンストラクタに `skillFileManager` を渡す
   - `new RuntimeSkillCreatorFacade({ skillExecutor, llmAdapter, resourceLoader, skillFileManager })` の形式
6. エラーレスポンス形式の確認（P60対策）
   - improve() のエラー戻り値は `{ success: false, error: { code: string, message: string } }` の IPC wrapper 形式
   - plan() との違い: plan() は throw するが、improve() は `{ success: false, error: {...} }` を返す設計（Phase 2 エラーハンドリング設計準拠）
7. 既存テストとの命名規則整合性確認
   - 同ディレクトリの既存テストファイルのインポートパスを参照（P63対策）
   - 参考: `RuntimeSkillCreatorFacade.plan.test.ts` の `import` 文を確認してから記述する
8. applyImprovement テスト設計（TDDサイクル完全化）
   - A-1: 正常適用（before テキストが SKILL.md に存在し、after に置換される）
   - A-2: before 不一致時のスキップ（skipped カウントが増加する）

## 参照資料

| 資料名                                 | パス                                                                                      | 説明                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Phase 2 設計書                         | `docs/30-workflows/w3b-sc-improve-llm/phase-02-design.md`                                 | JSON Schema、プロンプト設計                                          |
| Phase 3 設計レビュー報告書             | `docs/30-workflows/w3b-sc-improve-llm/phase-03-design-review.md`                          | MINOR-1/MINOR-2 対応方針                                             |
| 既存テスト（インポートパターン参照用） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | plan() テストのインポートパス確認                                    |
| 既存テストディレクトリ                 | `apps/desktop/src/main/services/runtime/__tests__/`                                       | 配下の既存テスト                                                     |
| planPromptConstants                    | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                           | IMPROVE_PROMPT_CONSTANTS の設計参照                                  |
| TDD 原則                               | `.claude/rules/02-code-quality.md`                                                        | テスト駆動開発の原則                                                 |
| 既知の落とし穴                         | `.claude/rules/06-known-pitfalls.md`                                                      | P9: テスト間状態リーク、P60: IPC レスポンス形式、P63: インポートパス |

## 実行手順

1. 参照資料の Phase 2 設計書と Phase 3 レビュー報告書を読み込み、テスト設計の前提を確認する
2. 既存テスト `RuntimeSkillCreatorFacade.plan.test.ts` のインポートパスとモック構造を確認する（P63対策）
3. テストファイルを作成し、モックファクトリ（`createMockLLMAdapter`, `createMockSkillFileManager`）を定義する
4. I-1〜I-5 のテストケースを TDD Red 状態で実装する
5. A-1, A-2 の applyImprovement テストを TDD Red 状態で実装する
6. `beforeEach` でモック状態のリセットを設定する（P9対策）
7. テスト実行して全テストが Red（未実装）状態であることを確認する

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

| 成果物           | パス                                                                                         | 説明                        |
| ---------------- | -------------------------------------------------------------------------------------------- | --------------------------- |
| テストファイル   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | improve() の TDD Red テスト |
| テストケース一覧 | 本ファイル内                                                                                 | I-1〜I-5、A-1〜A-2          |

## 完了条件

- [ ] テストファイルを作成した
- [ ] I-1（正常系 LLM 呼び出し）テストを実装した
- [ ] I-2（JSON Schema 検証: section/before/after/reason フィールドを確認）テストを実装した
- [ ] I-3（SKILL.md 読み込み確認: `readFile` の戻り値が user プロンプトに含まれる）テストを実装した
- [ ] I-4（不正 JSON エラーハンドリング: `{ success: false, error: { code: "PARSE_ERROR" } }` の IPC wrapper 形式で返ることを確認）テストを実装した（P60対策）
- [ ] I-5（system プロンプト確認: improve-prompt.md 内容 + `=== IMPROVE RESPONSE FORMAT ===` マーカーが system プロンプトに含まれる）テストを実装した（MINOR-2反映）
- [ ] A-1（applyImprovement 正常適用）テストを実装した
- [ ] A-2（before 不一致スキップ）テストを実装した
- [ ] `mockSkillFileManager` を `createMockSkillFileManager()` ファクトリで定義し、コンストラクタに注入した（MINOR-1反映）
- [ ] `beforeEach` でモック状態をリセットした（P9対策）
- [ ] インポートパスを `RuntimeSkillCreatorFacade.plan.test.ts` から確認して記述した（P63対策）
- [ ] テスト実行は Red（未実装）状態で終わることを確認した
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

Phase 5: 実装
