# 未到達分析

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 7                                              |

## 未到達コード分析

カバレッジ計測結果: **100%**（行・分岐・関数・文 全て）

未到達コードは **0件**。追加テストは不要。

## 全分岐カバー状況

| 分岐                                   | カバー状況 |
| -------------------------------------- | ---------- |
| purpose に "Slack" を含む              | ✅         |
| purpose に "GitHub" を含む             | ✅         |
| purpose に "Notion" を含む             | ✅         |
| purpose に定期実行キーワードを含む     | ✅         |
| purpose にリアルタイムキーワードを含む | ✅         |
| category === "code-support"            | ✅         |
| category === "data-analysis"           | ✅         |
| 全キーワード非該当（フォールバック）   | ✅         |
| `input?.purpose ?? ""` の null 処理    | ✅         |
| `input?.category` の null 処理         | ✅         |
