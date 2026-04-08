# Phase 4: テスト仕様書 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## テストケース一覧（TC-01〜TC-15）

### ツール推論（TC-01〜TC-04）

| TC ID | テスト説明                                                          | 入力（purpose）            | 入力（category） | 期待値（tool） |
| ----- | ------------------------------------------------------------------- | -------------------------- | ---------------- | -------------- |
| TC-01 | purpose に 'Slack' を含む場合、tool = 'slack' を推論する            | "Slack通知を送る"          | null             | "slack"        |
| TC-02 | purpose に 'GitHub' を含む場合、tool = 'github' を推論する          | "GitHubのPRをレビューする" | null             | "github"       |
| TC-03 | purpose に 'Notion' を含む場合、tool = 'notion' を推論する          | "Notionにページを作成する" | null             | "notion"       |
| TC-04 | ツール名が含まれない場合、tool = null を返す（AC-4 フォールバック） | "汎用的なタスクを実行する" | null             | null           |

### タイミング推論（TC-05〜TC-09）

| TC ID | テスト説明                                                           | 入力（purpose）          | 期待値（timing） |
| ----- | -------------------------------------------------------------------- | ------------------------ | ---------------- |
| TC-05 | purpose に '毎日' を含む場合、timing = 'scheduled' を推論する        | "毎日レポートを生成する" | "scheduled"      |
| TC-06 | purpose に '毎週' を含む場合、timing = 'scheduled' を推論する        | "毎週サマリーを送る"     | "scheduled"      |
| TC-07 | purpose に '定期' を含む場合、timing = 'scheduled' を推論する        | "定期的に実行する"       | "scheduled"      |
| TC-08 | purpose に 'リアルタイム' を含む場合、timing = 'realtime' を推論する | "リアルタイムで通知する" | "realtime"       |
| TC-09 | タイミングキーワードが含まれない場合、timing = null を返す           | "コードを解析する"       | null             |

### フォーマット推論（TC-10〜TC-12）

| TC ID | テスト説明                                                           | 入力（category） | 期待値（format） |
| ----- | -------------------------------------------------------------------- | ---------------- | ---------------- |
| TC-10 | category = 'code-support' の場合、format = 'code' を推論する         | "code-support"   | "code"           |
| TC-11 | category = 'data-analysis' の場合、format = 'structured' を推論する  | "data-analysis"  | "structured"     |
| TC-12 | category が null の場合、format = null を返す（AC-4 フォールバック） | null             | null             |

### inferenceLog（TC-13〜TC-14）

| TC ID | テスト説明                                                              | 入力                                       | 期待値（inferenceLog）                |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------- |
| TC-13 | 推論が1件の場合、inferenceLog に1件の記録が含まれる                     | purpose: "Slack通知を送る", category: null | length = 1, エントリに "slack" を含む |
| TC-14 | 推論が0件の場合、inferenceLog は空配列 [] を返す（AC-4 フォールバック） | purpose: "", category: null                | []                                    |

### フォールバック（TC-15）

| TC ID | テスト説明                                                                 | 入力                                  | 期待値                                                                                              |
| ----- | -------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| TC-15 | purpose が空文字の場合、tool/timing は null、category は独立推論を継続する | purpose: "", category: "code-support" | tool=null, timing=null, format="code", inferenceLog=["category = 'code-support' → format = 'code'"] |

## テスト実行コマンド

```bash
pnpm vitest run packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts
```

## テストファイルパス

```
packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts
```
