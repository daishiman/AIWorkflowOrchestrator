# Phase 1: スコープ定義書

## タスク概要

TASK-P0-05: `RuntimeSkillCreatorFacade.execute()` 完了後に `SkillFileWriter.persist()` が確実に呼ばれることを確認・テスト・ドキュメント化する。

## スコープ（含む）

- `execute()` -> `SkillFileWriter.persist()` 統合の動作確認
- `parseLlmResponseToContent()` -> `persist()` データフロー確認
- `persistResult` / `persistError` の `executeResult` への含有確認
- `SkillFileWriter` DI 注入パスの確認（未注入時は warn + スキップ）
- PATH_TRAVERSAL / rollback / 回帰ガードの統合観点確認
- `SkillCreatorOutputHandler` は別系統として扱い、混同防止を明文化

## スコープ（含まない）

- UI の結果表示パネル（別タスク）
- verify -> improve の閉ループ（別タスク）

## 受入条件（AC）: Current Facts に揃えたテスト参照

| AC ID | 受入条件（要約）                                           | 検証テスト（例）        |
| ----- | ---------------------------------------------------------- | ----------------------- |
| AC-1  | persist が正しい引数で呼ばれる                             | F-01                    |
| AC-2  | parse -> persist の受け渡しが正しい                        | F-01                    |
| AC-3  | persistResult が executeResult に含まれる                  | F-02, E-26              |
| AC-4  | persistError が executeResult に含まれる                   | F-03, E-10 ~ E-15, E-27 |
| AC-5  | execute 失敗時は persist されない                          | F-06                    |
| AC-6  | parse null/コードブロックなし時は persist がスキップされる | F-05, E-28              |
| AC-7  | DI 未注入でも warn して正常完了する                        | F-04, E-16, E-29        |
| AC-8  | PATH_TRAVERSAL が拒否され persistError に記録される        | E-11, E-21 ~ E-23       |
| AC-10 | ロールバックが統合観点で担保されている                     | E-24, E-25              |
