# Phase 2: Reason Code カタログ

## RuntimeSkillCreatorDegradedReason

| code                          | 発生条件                                            | user-facing message                                          |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| `llm_adapter_unavailable`     | `llmAdapter` が未注入                               | `LLM アダプタが利用できません。設定を確認してください。`     |
| `resource_loader_unavailable` | `resourceLoader` が未注入かつ dynamic pipeline なし | `リソースローダーが利用できません。設定を確認してください。` |

## 既存 error code（参考）

| code               | 使用箇所                             | 説明                        |
| ------------------ | ------------------------------------ | --------------------------- |
| `VALIDATION_ERROR` | `improve()` 入力バリデーション       | skillName / feedback 空文字 |
| `READ_ERROR`       | `improve()` skillFileManager 不在    | SKILL.md 読み込み不可       |
| `PARSE_ERROR`      | `improve()` LLM レスポンスパース失敗 | JSON パース不可             |

## 優先順位（両方不足時）

`llmAdapter` チェックを先に行うため `llm_adapter_unavailable` が優先される。
