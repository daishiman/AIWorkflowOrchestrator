# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 7                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

improve() の全分岐のカバレッジを確認し、基準値（Line 80%、Branch 60%、Function 80%）を満たしていることを確認する。未達の場合は Phase 6 へ戻る。

## 実行タスク

1. カバレッジ計測コマンドを実行
   ```bash
   pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/runtime/RuntimeSkillCreatorFacade.ts
   ```
2. カバレッジレポートを確認
   - Line Coverage: 80% 以上（推奨 90%）
   - Branch Coverage: 60% 以上（推奨 70%）
   - Function Coverage: 80% 以上（推奨 90%）
3. improve() の全分岐カバレッジを個別確認
   - 正常系（integrated_api 分岐: LLM 呼び出し成功）
   - terminal_handoff 分岐（LLM・SkillFileManager 未呼び出し）
   - graceful degradation 分岐（llmAdapter または resourceLoader 未注入時のスタブ返却）
   - スキル不存在エラー（`SKILL_NOT_FOUND`）
   - SKILL.md 読み込み失敗エラー（`READ_ERROR`）
   - LLM 呼び出し失敗エラー（`LLM_ERROR`）
   - 不正 JSON パースエラー（`PARSE_ERROR`）
   - バリデーションエラー（空フィードバック、スペースのみフィードバック）（`VALIDATION_ERROR`）
   - 提案 0 件ケース（正常終了）
   - ReadonlySkillError（`READONLY_SKILL`: applyImprovement 適用時の書き込み拒否）
   - before テキスト不一致のスキップ（applyImprovement の skipped カウント）
4. `improvePromptConstants.ts` のカバレッジ確認
   - `IMPROVE_PROMPT_CONSTANTS` と `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` の各プロパティが I-5 テストで参照されているか確認
5. 未達分岐がある場合は Phase 6 へ戻る

## 参照資料

| 資料名                         | パス                                                                                         | 説明                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Phase 6 拡充済みテストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 全テストケース                                       |
| コード品質ルール               | `.claude/rules/02-code-quality.md`                                                           | カバレッジ基準                                       |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                                         | P41: v8 カバレッジプロバイダのインライン関数カウント |

## 実行手順

1. カバレッジ計測コマンドを実行する
2. Line / Branch / Function の各カバレッジ値を確認する
3. improve() の全主要分岐がカバーされているか個別に確認する
4. `improvePromptConstants.ts` のカバレッジを確認する（P41対策）
5. 基準未達の分岐がある場合は Phase 6 へ戻り追加テストを実装する
6. カバレッジ結果を本ファイルのカバレッジ結果記録テーブルに記録する

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

## カバレッジ結果記録

| 指標              | 測定値 | 基準 | 判定 |
| ----------------- | ------ | ---- | ---- |
| Line Coverage     |        | 80%+ |      |
| Branch Coverage   |        | 60%+ |      |
| Function Coverage |        | 80%+ |      |

## 成果物

| 成果物                     | パス         | 説明                       |
| -------------------------- | ------------ | -------------------------- |
| カバレッジレポートサマリー | 本ファイル内 | テキスト記録               |
| 各指標の達成状況表         | 本ファイル内 | カバレッジ結果記録テーブル |

## 完了条件

- [ ] カバレッジ計測コマンドを実行した
- [ ] Line Coverage 80% 以上を確認した
- [ ] Branch Coverage 60% 以上を確認した
- [ ] Function Coverage 80% 以上を確認した
- [ ] improve() の全主要分岐がカバーされていることを確認した（integrated_api / terminal_handoff / graceful degradation の3ルート）
- [ ] `improvePromptConstants.ts` の全エクスポートがテストで参照されていることを確認した（P41: v8 インライン関数カウント対策）
- [ ] 未達の場合は Phase 6 へ戻り追加テストを実装した
- [ ] カバレッジ達成状況を本ファイルに記録した
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

Phase 8: リファクタリング
