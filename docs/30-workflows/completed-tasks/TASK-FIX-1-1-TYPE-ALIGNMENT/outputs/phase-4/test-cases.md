# テストケース一覧: TASK-FIX-1-1-TYPE-ALIGNMENT

## 1. ExecutionState型テスト

| ID   | テストケース               | 期待結果                 |
| ---- | -------------------------- | ------------------------ |
| ES-1 | 5種類の値が定義されている  | pending, running等含む   |
| ES-2 | 各値が正しい文字列リテラル | TypeScript型チェック通過 |

---

## 2. ExecutionInfo型テスト

| ID   | テストケース                       | 期待結果      |
| ---- | ---------------------------------- | ------------- |
| EI-1 | 必須フィールド（id, skillId等）    | 正しい構造    |
| EI-2 | state フィールドはExecutionState型 | 型一致        |
| EI-3 | completedAtはオプション            | undefined許容 |

---

## 3. SkillExecutionErrorCode型テスト

| ID    | テストケース              | 期待結果     |
| ----- | ------------------------- | ------------ |
| SEC-1 | 9種類のエラーコードが定義 | 全コード含む |
| SEC-2 | EXECUTION_FAILED含む      | 値存在       |
| SEC-3 | SKILL_NOT_FOUND含む       | 値存在       |
| SEC-4 | SDK_ERROR含む             | 値存在       |

---

## 4. SkillExecutionError型テスト

| ID   | テストケース                    | 期待結果       |
| ---- | ------------------------------- | -------------- |
| SE-1 | 必須フィールド（code, message） | 正しい構造     |
| SE-2 | codeはSkillExecutionErrorCode型 | 型一致         |
| SE-3 | detailsはオプション             | undefined許容  |
| SE-4 | detailsはunknown型              | 任意の値を許容 |

---

## 5. ExecutionContext型テスト

| ID   | テストケース                       | 期待結果         |
| ---- | ---------------------------------- | ---------------- |
| EC-1 | 必須フィールド全て定義             | 正しい構造       |
| EC-2 | abortControllerはAbortController型 | インスタンス一致 |
| EC-3 | stateはExecutionState型            | 型一致           |
| EC-4 | completedAtはオプション            | undefined許容    |

---

## 6. SKILL_EXECUTION_DEFAULTS定数テスト

| ID    | テストケース                  | 期待結果 |
| ----- | ----------------------------- | -------- |
| SED-1 | 定数がexportされている        | defined  |
| SED-2 | DEFAULT_TIMEOUT = 30000       | 値一致   |
| SED-3 | MAX_CONCURRENT_EXECUTIONS = 5 | 値一致   |
| SED-4 | MAX_RETRIES = 3               | 値一致   |
| SED-5 | INITIAL_RETRY_DELAY = 1000    | 値一致   |
| SED-6 | MAX_RETRY_DELAY = 4000        | 値一致   |

---

## 7. 型エクスポート検証テスト

| ID   | テストケース                               | 期待結果         |
| ---- | ------------------------------------------ | ---------------- |
| EX-1 | skill.tsから全移行型をimport可能           | コンパイル成功   |
| EX-2 | skill-execution.ts削除後importエラー       | モジュール不存在 |
| EX-3 | SKILL_EXECUTION_DEFAULTSがskill.tsから取得 | 値取得可能       |

---

## 8. 既存テストとの整合性

| ID    | テストケース                           | 期待結果 |
| ----- | -------------------------------------- | -------- |
| CMP-1 | SkillStreamMessage既存テストが動作     | 影響なし |
| CMP-2 | SkillExecutionRequest既存テストが動作  | 影響なし |
| CMP-3 | SkillPermissionRequest既存テストが動作 | 影響なし |

---

## テスト実行ステータス

| Phase | ステータス | 備考                         |
| ----- | ---------- | ---------------------------- |
| 4     | Red        | 移行型テストは型未定義で失敗 |
| 5     | Green      | 型移行後に全テストパス       |
| 6     | Refactor   | カバレッジ拡充               |
