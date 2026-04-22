# テストケースマトリクス: TASK-SC-IMPROVE-PROMPT-IMPL-001

## 正常系

| TC    | 観測点                                    | 期待結果                                                  |
| ----- | ----------------------------------------- | --------------------------------------------------------- |
| TC-01 | LLM あり: readFile → generate → writeFile | 各モックが指定引数で呼ばれる                              |
| TC-02 | LLM なし: executeJson (improve_skill.js)  | executeJson が --name, --auto-apply で呼ばれる            |
| TC-08 | progress 順序                             | loading-skill → analyzing → improving → validating → done |

## 異常系

| TC    | 条件              | 期待結果                                  |
| ----- | ----------------- | ----------------------------------------- |
| TC-03 | readFile が throw | improveSkill() フォールバック             |
| TC-04 | generate が throw | improveSkill() フォールバック             |
| TC-05 | abort 済み signal | AbortError がスロー                       |
| TC-07 | readFile 後 abort | AbortError がスロー、writeFile 未呼び出し |

## 回帰

| TC    | 条件          | 期待結果                     |
| ----- | ------------- | ---------------------------- |
| TC-09 | create モード | result に skill 名が含まれる |
| TC-10 | update モード | result に skill 名が含まれる |
