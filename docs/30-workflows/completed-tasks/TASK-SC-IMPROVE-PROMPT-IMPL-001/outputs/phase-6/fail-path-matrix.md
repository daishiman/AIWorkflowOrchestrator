# Fail Path マトリクス

## カバー済み

| TC    | 条件                                  | 期待挙動                            | テスト |
| ----- | ------------------------------------- | ----------------------------------- | ------ |
| TC-03 | readFile が throw                     | improveSkill() フォールバック       | ✓      |
| TC-04 | LLM generate が throw                 | improveSkill() フォールバック       | ✓      |
| TC-05 | cancelCurrentOperation() 中断         | AbortError スロー                   | ✓      |
| TC-07 | readFile 後 abort (LLM が AbortError) | AbortError スロー、writeFile 未呼出 | ✓      |

## MINOR-01 追跡（Phase 3 設計レビューより）

LLM が frontmatter を壊す場合: 本タスクスコープでは LLM 応答全文をそのまま writeFile するため、
frontmatter 保護は agentDef の指示に委ねる（テストでは IMPROVED_SKILL_MD が正しい frontmatter を持つ前提）。
本 MINOR を Phase 12 に引き継ぎ記録する。
