# Phase 2: スマートデフォルト推論フローチャート

## inferSmartDefaults(formData: SkillInfoFormData): SmartDefaultResult

1. purpose = data.purpose ?? ""
2. purposeLower = purpose.toLowerCase()

### ツール推論（大小文字不問）

- purposeLower.includes("slack") → tool = "slack"
- else if purposeLower.includes("github") → tool = "github"
- else if purposeLower.includes("notion") → tool = "notion"
- else → tool = null

### タイミング推論

- /毎日|毎週|定期|スケジュール/.test(purpose) → timing = "scheduled"
- else if /リアルタイム|即座|すぐに/.test(purpose) → timing = "realtime"
- else → timing = null

### フォーマット推論

- data.category === "code-support" → format = "code"
- else if data.category === "data-analysis" → format = "structured"
- else → format = null

## 出力: SmartDefaultResult

{ who: null, input: null, timing, output: null, tool, format, inferenceLog: string[] }
