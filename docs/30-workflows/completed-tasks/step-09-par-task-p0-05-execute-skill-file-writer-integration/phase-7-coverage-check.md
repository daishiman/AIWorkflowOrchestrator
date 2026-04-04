# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 7                                     |
| Phase名    | カバレッジ確認                        |
| 対象機能   | execute-skill-file-writer-integration |
| 前提Phase  | Phase 6: テスト拡充                   |
| 次Phase    | Phase 8: リファクタリング             |
| ステータス | not_started                           |
| 作成日     | 2026-03-30                            |

## 目的

Phase 4〜6 で作成したテストが AC-1〜AC-5 を網羅しているか確認し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすことを検証する。

## 実行タスク

### Task 7-1: カバレッジ計測

対象ファイル一覧:

| ファイル                                                                             | 役割                          | 主要テスト観点   |
| ------------------------------------------------------------------------------------ | ----------------------------- | ---------------- |
| `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts`                | LLM応答パーサーユーティリティ | AC-1, AC-2       |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（execute部分） | persist連携フロー             | AC-3, AC-4, AC-5 |
| `packages/shared/src/types/skillCreator.ts`                                          | ExecuteResult型拡張           | AC-4（型定義）   |

計測コマンド:

```bash
# パーサー単体カバレッジ
pnpm vitest run --coverage apps/desktop/src/main/services/runtime/parseLlmResponseToContent.test.ts

# Facade execute() 連携カバレッジ
pnpm vitest run --coverage apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.test.ts

# 全体カバレッジ（対象ファイル指定）
pnpm vitest run --coverage --reporter=verbose
```

カバレッジ基準:

| メトリクス | 基準 | 説明                             |
| ---------- | ---- | -------------------------------- |
| Line       | 80%+ | 実装行の網羅率                   |
| Branch     | 60%+ | 分岐（if/else, try/catch）網羅率 |
| Function   | 80%+ | 関数・メソッド単位の網羅率       |

### Task 7-2: AC カバレッジマッピング

AC-1〜AC-5 の各項目に対して、どのテストケースが対応するかを表にまとめる。

| AC   | 基準内容                                      | 対応テストケース（例）                                           | カバー状況 |
| ---- | --------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| AC-1 | LLM応答を解析しコードブロック抽出             | パーサーUT: コードブロック抽出、見出し行からファイル名抽出       | 未確認     |
| AC-2 | 抽出結果が`SkillGeneratedContent`型に変換     | パーサーUT: skillMd/agents/scripts/references の分類             | 未確認     |
| AC-3 | `SkillFileWriter.persist()`でファイル書き出し | Facade UT: persist()がモック経由で正しい引数で呼ばれる           | 未確認     |
| AC-4 | 書き出し結果が`ExecuteResult`に含まれる       | Facade UT: persistResult/persistError が結果に設定される         | 未確認     |
| AC-5 | 解析失敗時のエラーハンドリング                | パーサーUT: 空応答→null、Facade UT: persist失敗→persistError設定 | 未確認     |

### Task 7-3: ブランチカバレッジ重点確認

以下の分岐パスが全てテストされていることを確認する:

- `parseLlmResponseToContent()` がコードブロック0件で `null` を返すパス
- `parseLlmResponseToContent()` が例外をスローするパス
- `content === null` で persist をスキップするパス
- `skillFileWriter` が DI されていない（undefined）で graceful degradation するパス
- `persist()` が成功するパス
- `persist()` が例外をスローするパス（`persistError` 設定、`success` は `true` 維持）
- `response.success === false` で persist をスキップするパス

### Task 7-4: カバレッジ不足箇所の特定

基準未達の場合:

1. 不足箇所を特定し、追加テストケースの候補を列挙する
2. Phase 6 へのフィードバック（追加テスト必要）または Phase 8 のリファクタリング候補として記録する

## 参照資料

| 資料名         | パス                                                                  | 説明                         |
| -------------- | --------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件   | `phase-1-requirements.md`                                             | AC-1〜AC-5 定義              |
| Phase 2 設計   | `phase-2-design.md`                                                   | エラーハンドリング分岐設計   |
| Phase 4 テスト | `phase-4-test-creation.md`                                            | 初期テスト設計               |
| Phase 6 拡充   | `phase-6-test-expansion.md`                                           | edge case テスト             |
| Facade実装     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | カバレッジ計測対象           |
| パーサー実装   | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts` | カバレッジ計測対象           |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                           | ExecuteResult 拡張フィールド |

## 統合テスト連携

- パーサー → Facade execute() → persist() の一連フローがカバレッジの中核ケース
- 行数カバレッジよりも AC カバレッジマッピング（concern coverage）を優先して判定する
- Phase 8 に渡す重複削減候補をカバレッジ分析から特定する

## 成果物

| 成果物             | パス                                 | 説明                                          |
| ------------------ | ------------------------------------ | --------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC マッピング表、カバレッジ数値、不足箇所一覧 |

## 完了条件

- [ ] カバレッジ計測が完了し、Line/Branch/Function の数値が記録されている
- [ ] AC-1〜AC-5 の全項目に対するテストカバレッジマッピング表が作成されている
- [ ] Task 7-3 の全分岐パスがテストされていることが確認されている
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たしている（未達の場合は追加テスト候補が記録されている）
- [ ] Phase 8 に渡す重複削減候補が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
