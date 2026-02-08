# Phase 4: テストケース一覧

## テストファイル

`apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts`

## テストケース

### 1. ExecutionState 型の互換性テスト

| TC-ID  | テスト名                                                 | 検証内容                                                        | 期待結果                 |
| ------ | -------------------------------------------------------- | --------------------------------------------------------------- | ------------------------ |
| TC-1-1 | 全ての ExecutionState 値が @repo/shared と一致すること   | pending, running, completed, aborted, error の5つの状態値が存在 | 5つの状態全てが有効      |
| TC-1-2 | SkillExecutor が ExecutionState を正しく使用していること | getActiveExecutions() が空配列を返す                            | Array.isArray() === true |

### 2. ExecutionInfo 型の互換性テスト

| TC-ID  | テスト名                                                | 検証内容                                       | 期待結果                |
| ------ | ------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| TC-2-1 | ExecutionInfo の構造が @repo/shared と一致すること      | id, skillId, state, startedAt の存在と型を確認 | 全プロパティが正しい型  |
| TC-2-2 | オプショナルプロパティ completedAt が正しく扱われること | completedAt ありなし両ケースを検証             | undefined または number |

### 3. SkillExecutionErrorCode 型の互換性テスト

| TC-ID  | テスト名                                                        | 検証内容                | 期待結果                    |
| ------ | --------------------------------------------------------------- | ----------------------- | --------------------------- |
| TC-3-1 | 全ての SkillExecutionErrorCode 値が @repo/shared と一致すること | 9つのエラーコードが存在 | 9つのエラーコード全てが有効 |

### 4. SkillExecutionError 型の互換性テスト

| TC-ID  | テスト名                                                  | 検証内容                                | 期待結果                 |
| ------ | --------------------------------------------------------- | --------------------------------------- | ------------------------ |
| TC-4-1 | SkillExecutionError の構造が @repo/shared と一致すること  | code, message の存在と型を確認          | 全プロパティが正しい型   |
| TC-4-2 | オプショナルプロパティ details が正しく扱われること       | details ありなし両ケースを検証          | undefined または unknown |
| TC-4-3 | 全てのエラーコードで SkillExecutionError が作成できること | 9つのエラーコード全てでオブジェクト作成 | 全て作成可能             |

### 5. ExecutionContext 型の互換性テスト

| TC-ID  | テスト名                                                | 検証内容                                                        | 期待結果               |
| ------ | ------------------------------------------------------- | --------------------------------------------------------------- | ---------------------- |
| TC-5-1 | ExecutionContext の構造が @repo/shared と一致すること   | id, skillId, abortController, state, startedAt の存在と型を確認 | 全プロパティが正しい型 |
| TC-5-2 | abortController が正しく機能すること                    | abort() 呼び出し後に signal.aborted が true                     | aborted === true       |
| TC-5-3 | オプショナルプロパティ completedAt が正しく扱われること | completedAt ありの場合を検証                                    | number 型              |

### 6. 型の整合性統合テスト

| TC-ID  | テスト名                                     | 検証内容                                       | 期待結果           |
| ------ | -------------------------------------------- | ---------------------------------------------- | ------------------ |
| TC-6-1 | ExecutionContext から ExecutionInfo への変換 | コンテキストから情報への変換が正しく行われる   | 全プロパティが一致 |
| TC-6-2 | ExecutionState の遷移が正しく行われること    | pending -> running -> completed の遷移パターン | 遷移が有効         |

## テストカバレッジ目標

| 指標             | 目標値 |
| ---------------- | ------ |
| 型網羅           | 100%   |
| プロパティ網羅   | 100%   |
| エラーコード網羅 | 100%   |

## 作成日

2026-02-07
