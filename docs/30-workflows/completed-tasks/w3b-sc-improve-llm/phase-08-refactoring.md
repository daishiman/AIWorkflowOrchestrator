# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 8                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

plan() と improve() に共通の AnthropicAdapter 呼び出しパターンを抽出し、コードの重複を排除する。コード品質を改善しつつ、テストが Green のまま保つ。

## 実行タスク

1. plan() と improve() の LLM 呼び出しコードを比較し、共通パターンを特定する
2. 共通ヘルパー関数の抽出
   - `callLLMWithSystemPrompt(systemPrompt, userPrompt, options?)` などの共通メソッドを抽出
   - または `AnthropicAdapter` クラスへの責務集約
3. `stripMarkdownCodeBlock()` の共有確認
   - plan() と improve() の両方で使用する `stripMarkdownCodeBlock()` が一箇所に定義されているか確認する
   - 重複定義がある場合は共通ユーティリティとして1箇所に集約する
4. 改善提案 JSON パーサーの独立モジュール化
   - `parseImproveResponse(rawText: string): Result<RuntimeSkillCreatorImproveSuggestion[], Error>` として切り出し
   - `mapToSuggestion(raw: unknown): RuntimeSkillCreatorImproveSuggestion` のヘルパーを明示的に配置する
   - Phase 2 設計で確定した配置先（`RuntimeSkillCreatorFacade.ts` 内のプライベート関数 or 独立ファイル）に従って配置する
5. `improvePromptConstants.ts` の整理
   - `IMPROVE_PROMPT_CONSTANTS`（システムプロンプト等の文字列定数）と `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION`（JSON Schema 指示文）が `improvePromptConstants.ts` に集約されているか確認する
   - plan() 側のプロンプト定数ファイルと命名規則が統一されているか確認する
6. エラーコード定数の整理
   - `SKILL_NOT_FOUND`, `READ_ERROR`, `VALIDATION_ERROR`, `PARSE_ERROR`, `LLM_ERROR` が定数として整理されているか確認する
   - `SKILL_CREATOR_ERROR_CODES` などの定数オブジェクトへ集約することを検討する
7. 不要なコメントと未使用 import の除去
8. リファクタリング後に全テストが Green であることを確認

## 参照資料

| 種別               | パス / 参照先                                                         |
| ------------------ | --------------------------------------------------------------------- |
| Phase 5 実装コード | `docs/30-workflows/w3b-sc-improve-llm/phase-05-implementation.md`     |
| 実装対象           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| コード品質ルール   | `.claude/rules/02-code-quality.md`（SRP、DRY 原則）                   |
| アーキテクチャ     | `.claude/rules/01-architecture.md`（設計原則）                        |

## 実行手順

1. Phase 5 実装コードを読み込み、plan() と improve() の共通パターンを特定する
2. 共通ヘルパー関数を抽出し、テストが Green のまま維持されることを確認する
3. `stripMarkdownCodeBlock()` の重複を確認・解消する
4. `parseImproveResponse()` / `mapToSuggestion()` を設計で確定した場所に配置する
5. `improvePromptConstants.ts` とエラーコード定数を整理する
6. 未使用 import と不要コメントを除去する
7. 全テストを実行して Green であることを確認する
8. リファクタリング結果記録テーブルを記入する

## リファクタリング結果記録

| 項目       | 実施前 | 実施後 | 改善内容 |
| ---------- | ------ | ------ | -------- |
| コード重複 |        |        |          |
| 関数数     |        |        |          |
| テスト結果 |        |        |          |

## 統合テスト連携

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

リファクタリング後のテスト継続成功確認を実施する。

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                           |
| ------------------ | -------- | -------------------------------------------------- |
| セキュリティ       | 該当     | パストラバーサル防止、ReadonlySkillErrorサニタイズ |
| アーキテクチャ     | 該当     | DI設計整合性、plan()との共通化                     |
| エラーハンドリング | 該当     | 全エラーコード定義・使用の網羅性                   |
| IPC通信            | 該当     | IPC wrapper形式準拠                                |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                    |
| -------------------- | -------- | --------------------------- |
| バックエンド（Main） | 該当     | RuntimeSkillCreatorFacade   |
| IPC通信              | 該当     | skill-creator:improve-skill |

## 成果物

| 成果物                     | パス / 説明                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| リファクタリング済みFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                    |
| 共通ヘルパー関数           | 共通ヘルパー関数（または AnthropicAdapter 拡張）                                                         |
| プロンプト定数ファイル     | `improvePromptConstants.ts`（`IMPROVE_PROMPT_CONSTANTS` + `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` を含む） |
| パーサー関数               | 独立した `parseImproveResponse()` / `mapToSuggestion()` 関数（Phase 2 設計で確定した配置場所）           |
| 共有ユーティリティ         | `stripMarkdownCodeBlock()` の共有化（plan() と improve() で重複がない状態）                              |

## 完了条件

- [ ] plan() と improve() の共通 LLM 呼び出しパターンを抽出した
- [ ] `stripMarkdownCodeBlock()` が plan() と improve() で共有されている（重複定義なし）
- [ ] `parseImproveResponse()` と `mapToSuggestion()` が設計で確定した場所に配置された
- [ ] `improvePromptConstants.ts` に `IMPROVE_PROMPT_CONSTANTS` と `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` が集約された
- [ ] エラーコード（SKILL_NOT_FOUND, READ_ERROR, VALIDATION_ERROR, PARSE_ERROR, LLM_ERROR）を定数として整理した
- [ ] 未使用 import を除去した
- [ ] リファクタリング後に全テストが Green のままであることを確認した
- [ ] `any` 型が導入されていないことを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 担当 | ステータス | 備考 |
| ---------- | ---- | ---------- | ---- |
| -          | -    | -          | -    |

## タスク100%実行確認【必須】

- [ ] 実行タスク1〜8の全項目を実行した
- [ ] 完了条件の全チェックボックスを確認した
- [ ] 成果物が全て生成された
- [ ] 未実行・スキップしたタスクは0件である

## 次のPhase

Phase 9: 品質検証
