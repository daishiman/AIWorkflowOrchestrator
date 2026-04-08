# Phase 2: 推論フローチャート — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

```
inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult
│
├─ result 初期化: { who: null, input: null, timing: null,
│                   output: null, tool: null, format: null }
├─ inferenceLog: string[] = []
├─ purpose = normalizePurpose(input?.purpose)  // trim / null → ""
│
├─ [purpose が "" でない場合のみ]
│   ├─ [ツール推論] 先勝ちルール: Slack > GitHub > Notion
│   │   ├─ "Slack" を含む  → result.tool = "slack"
│   │   │                    inferenceLog.push("purpose に 'Slack' を検出 → tool = 'slack'")
│   │   ├─ "GitHub" を含む → result.tool = "github"
│   │   │                    inferenceLog.push("purpose に 'GitHub' を検出 → tool = 'github'")
│   │   ├─ "Notion" を含む → result.tool = "notion"
│   │   │                    inferenceLog.push("purpose に 'Notion' を検出 → tool = 'notion'")
│   │   └─ その他          → result.tool = null
│   │
│   └─ [タイミング推論]
│       ├─ /毎日|毎週|定期|スケジュール/.test(purpose)
│       │                    → result.timing = "scheduled"
│       │                    inferenceLog.push("定期実行キーワードを検出 → timing = 'scheduled'")
│       ├─ /リアルタイム|即座|すぐに/.test(purpose)
│       │                    → result.timing = "realtime"
│       │                    inferenceLog.push("リアルタイムキーワードを検出 → timing = 'realtime'")
│       └─ その他           → result.timing = null
│
├─ [フォーマット推論] category は purpose と独立して評価
│   ├─ "code-support"   → result.format = "code"
│   │                    inferenceLog.push("category = 'code-support' → format = 'code'")
│   ├─ "data-analysis"  → result.format = "structured"
│   │                    inferenceLog.push("category = 'data-analysis' → format = 'structured'")
│   └─ その他           → result.format = null
│
└─ 返却: { ...result, inferenceLog }
         ※ inferenceLog が空配列 [] でもエラーにしない
```

## フォールバック設計

| フォールバックケース                 | 挙動                                           |
| ------------------------------------ | ---------------------------------------------- |
| `input.purpose` が undefined / null  | `tool`・`timing` = null（category 推論は継続） |
| `input.purpose` が空文字 ""          | `tool`・`timing` = null（category 推論は継続） |
| `input.purpose` が空白のみ           | trim 後 "" 扱い → `tool`・`timing` = null      |
| `input.category` が undefined / null | `result.format = null`                         |
| 全フィールドが推論できない           | `inferenceLog = []`                            |
| 複数ツール名が含まれる               | 先に一致したツールのみ採用（先勝ちルール）     |
