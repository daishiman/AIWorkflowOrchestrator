# 推論フローチャート

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 2                                              |

## 推論フロー

```
inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult
│
├─ result 初期化: { who: null, input: null, timing: null,
│                   output: null, tool: null, format: null }
├─ inferenceLog: string[] = []
│
├─ purpose = input?.purpose ?? ""
│
├─ [ツール推論] input.purpose（目的テキスト）
│   ├─ "Slack" を含む  → result.tool = "slack"
│   │                     inferenceLog.push("purpose に 'Slack' を検出 → tool = 'slack'")
│   ├─ "GitHub" を含む → result.tool = "github"
│   │                     inferenceLog.push("purpose に 'GitHub' を検出 → tool = 'github'")
│   ├─ "Notion" を含む → result.tool = "notion"
│   │                     inferenceLog.push("purpose に 'Notion' を検出 → tool = 'notion'")
│   └─ その他           → result.tool = null（フォールバック）
│
├─ [タイミング推論] input.purpose（目的テキスト）
│   ├─ /毎日|毎週|定期|スケジュール/.test(purpose)
│   │                     → result.timing = "scheduled"
│   │                     inferenceLog.push("定期実行キーワードを検出 → timing = 'scheduled'")
│   ├─ /リアルタイム|即座|すぐに/.test(purpose)
│   │                     → result.timing = "realtime"
│   │                     inferenceLog.push("リアルタイムキーワードを検出 → timing = 'realtime'")
│   └─ その他              → result.timing = null（フォールバック）
│
├─ [フォーマット推論] input.category（カテゴリ）
│   ├─ "code-support"   → result.format = "code"
│   │                     inferenceLog.push("category = 'code-support' → format = 'code'")
│   ├─ "data-analysis"  → result.format = "structured"
│   │                     inferenceLog.push("category = 'data-analysis' → format = 'structured'")
│   └─ その他              → result.format = null（フォールバック）
│
└─ 返却: { ...result, inferenceLog }
         ※ inferenceLog が空配列 [] でもエラーにしない（フォールバック動作）
```

## 先勝ちルール

複数のツール名が purpose に含まれる場合（例: "Slack と GitHub を使う"）、
if-else if 構造により最初にマッチした結果のみ採用する。

## 推論対象キーワード一覧

### ツール推論（大文字小文字区別あり）

| キーワード | result.tool |
| ---------- | ----------- |
| "Slack"    | "slack"     |
| "GitHub"   | "github"    |
| "Notion"   | "notion"    |

### タイミング推論（正規表現）

| キーワード                        | result.timing |
| --------------------------------- | ------------- |
| 毎日 / 毎週 / 定期 / スケジュール | "scheduled"   |
| リアルタイム / 即座 / すぐに      | "realtime"    |

### フォーマット推論（完全一致）

| category 値     | result.format |
| --------------- | ------------- |
| "code-support"  | "code"        |
| "data-analysis" | "structured"  |
