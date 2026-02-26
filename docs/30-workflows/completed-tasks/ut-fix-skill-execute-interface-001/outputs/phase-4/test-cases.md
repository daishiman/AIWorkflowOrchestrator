# Phase 4 テストケース一覧

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 4

## 正常系（skillNameパス）

| ID           | 入力                                                                     | 期待結果                                                                                          | 反映先ファイル  | 優先度 |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | --------------- | ------ |
| EXE-HAPPY-01 | `{ skillName: "test-skill", prompt: "hello" }`                           | scanAvailableSkills → find → executeSkill(skill.id, {prompt}) → `{ success: true, data: result }` | execute.test.ts | High   |
| EXE-HAPPY-02 | `{ skillName: "test-skill", prompt: "hello", workingDirectory: "/tmp" }` | workingDirectory省略時と同等の処理で実行成功                                                      | execute.test.ts | Medium |
| EXE-HAPPY-03 | `{ skillName: " test-skill ", prompt: "hello" }`                         | trim後の値でskillName検索（現状はtrimなし検索だが、バリデーション通過後の動作）                   | execute.test.ts | Medium |

## 正常系（skillIdパス）

| ID           | 入力                                                  | 期待結果                                                                         | 反映先ファイル  | 優先度 |
| ------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- | --------------- | ------ |
| EXE-HAPPY-04 | `{ skillId: "abc-123", params: { prompt: "hello" } }` | executeSkill("abc-123", { prompt: "hello" }) → `{ success: true, data: result }` | execute.test.ts | High   |
| EXE-HAPPY-05 | `{ skillId: "abc-123" }`                              | executeSkill("abc-123", undefined) → 成功                                        | execute.test.ts | Medium |

## 型ガード分岐

| ID           | 入力                                                      | 期待結果                                                           | 反映先ファイル  | 優先度 |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------------------ | --------------- | ------ |
| EXE-GUARD-01 | `{ skillName: "test", prompt: "hi" }`                     | isSkillNameRequest → true → skillNameパス                          | execute.test.ts | High   |
| EXE-GUARD-02 | `{ skillId: "abc-123" }`                                  | isSkillNameRequest → false → skillIdパス                           | execute.test.ts | High   |
| EXE-GUARD-03 | `{ skillName: "test", skillId: "abc-123", prompt: "hi" }` | `"skillName" in payload` → true → skillNameパス（skillNameが優先） | execute.test.ts | High   |

## バリデーション異常系 - skillName（P42準拠）

| ID         | 入力                                     | 期待結果                                                                              | 反映先ファイル     | 優先度 |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------- | ------------------ | ------ |
| EXE-VAL-01 | `{ skillName: "", prompt: "hello" }`     | throw `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` | validation.test.ts | High   |
| EXE-VAL-02 | `{ skillName: "   ", prompt: "hello" }`  | throw `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` | validation.test.ts | High   |
| EXE-VAL-03 | `{ skillName: "\t\n", prompt: "hello" }` | throw VALIDATION_ERROR                                                                | validation.test.ts | High   |
| EXE-VAL-04 | `{ skillName: null, prompt: "hello" }`   | throw VALIDATION_ERROR（typeof !== "string"）                                         | validation.test.ts | High   |
| EXE-VAL-05 | `{ skillName: 123, prompt: "hello" }`    | throw VALIDATION_ERROR（typeof !== "string"）                                         | validation.test.ts | High   |

## バリデーション異常系 - skillId（P42準拠）

| ID         | 入力                 | 期待結果                                                                            | 反映先ファイル     | 優先度 |
| ---------- | -------------------- | ----------------------------------------------------------------------------------- | ------------------ | ------ |
| EXE-VAL-06 | `{ skillId: "" }`    | throw `{ code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }` | validation.test.ts | High   |
| EXE-VAL-07 | `{ skillId: "   " }` | throw VALIDATION_ERROR                                                              | validation.test.ts | High   |
| EXE-VAL-08 | `{ skillId: null }`  | throw VALIDATION_ERROR                                                              | validation.test.ts | High   |
| EXE-VAL-09 | `{ skillId: 123 }`   | throw VALIDATION_ERROR                                                              | validation.test.ts | High   |

## バリデーション異常系 - prompt（DG-01対応、改善計画）

| ID         | 入力                                   | 期待結果（改善後）                            | 反映先ファイル     | 優先度 |
| ---------- | -------------------------------------- | --------------------------------------------- | ------------------ | ------ |
| EXE-VAL-10 | `{ skillName: "test", prompt: null }`  | throw VALIDATION_ERROR（現状: Service層到達） | validation.test.ts | Medium |
| EXE-VAL-11 | `{ skillName: "test", prompt: 123 }`   | throw VALIDATION_ERROR（現状: Service層到達） | validation.test.ts | Medium |
| EXE-VAL-12 | `{ skillName: "test", prompt: "" }`    | throw VALIDATION_ERROR（現状: Service層到達） | validation.test.ts | Medium |
| EXE-VAL-13 | `{ skillName: "test", prompt: "   " }` | throw VALIDATION_ERROR（現状: Service層到達） | validation.test.ts | Medium |

## 名前解決（マッピング）

| ID         | 条件                                                   | 期待結果                                                   | 反映先ファイル   | 優先度 |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------- | ---------------- | ------ |
| EXE-MAP-01 | skillName "test-skill" が利用可能スキル一覧に存在      | `executeSkill(skill.id, { prompt })` が呼ばれる            | delegate.test.ts | High   |
| EXE-MAP-02 | skillName "not-found" が利用可能スキル一覧に存在しない | `{ success: false, error: "スキルが見つかりません" }` 返却 | execute.test.ts  | High   |
| EXE-MAP-03 | scanAvailableSkills が例外をthrow                      | catch節で `{ success: false, error: ... }` 返却            | execute.test.ts  | Medium |

## エラーハンドリング

| ID         | 条件                            | 期待結果                                                | 反映先ファイル  | 優先度 |
| ---------- | ------------------------------- | ------------------------------------------------------- | --------------- | ------ |
| EXE-ERR-01 | executeSkill が Error をthrow   | `{ success: false, error: error.message }`              | execute.test.ts | High   |
| EXE-ERR-02 | executeSkill が非Error値をthrow | `{ success: false, error: "スキル実行に失敗しました" }` | execute.test.ts | Medium |

## セキュリティ

| ID         | 条件                             | 期待結果                   | 反映先ファイル     | 優先度 |
| ---------- | -------------------------------- | -------------------------- | ------------------ | ------ |
| EXE-SEC-01 | sender検証失敗（不正ウィンドウ） | throw toIPCValidationError | validation.test.ts | High   |

## 回帰

| ID         | 条件                | 期待結果           | 反映先ファイル     | 優先度 |
| ---------- | ------------------- | ------------------ | ------------------ | ------ |
| EXE-REG-01 | skill:import 正常系 | 既存契約のままPASS | validation.test.ts | Medium |
| EXE-REG-02 | skill:remove 正常系 | 既存契約のままPASS | validation.test.ts | Medium |

## テストケース集計

| カテゴリ                    | 件数   | High   | Medium |
| --------------------------- | ------ | ------ | ------ |
| 正常系                      | 5      | 2      | 3      |
| 型ガード                    | 3      | 3      | 0      |
| バリデーション（skillName） | 5      | 5      | 0      |
| バリデーション（skillId）   | 4      | 4      | 0      |
| バリデーション（prompt）    | 4      | 0      | 4      |
| 名前解決                    | 3      | 2      | 1      |
| エラーハンドリング          | 2      | 1      | 1      |
| セキュリティ                | 1      | 1      | 0      |
| 回帰                        | 2      | 0      | 2      |
| **合計**                    | **29** | **18** | **11** |

## 完了記録

- [x] 正常/異常ケースを定義（29ケース）
- [x] P42観点を反映（skillName/skillId/prompt の各パス）
- [x] 反映先3ファイルへ紐付け
- [x] DG-01（promptバリデーション）の改善計画ケースを含む
