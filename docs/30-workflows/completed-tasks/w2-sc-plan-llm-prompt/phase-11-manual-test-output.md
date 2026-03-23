# Phase 11: 手動テスト - 出力文書

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 11                         |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-23                 |

## 環境

- CLI 環境（P53 準拠: テストログで代替記録）
- Vitest v2.1.9
- Node.js（desktop パッケージ内実行）

## 1. 正常系テスト（自動テストによる間接的検証）

### シナリオ A: GitHub Issue 分類スキル

**入力**: `"GitHubのIssueを自動分類するスキルを作りたい"`

**テスト結果（LLM モック）**:

```json
{
  "planId": "plan-1710000000000",
  "skillSpec": "テスト入力",
  "estimatedSteps": 2,
  "skillName": "github-issue-classifier",
  "description": "GitHubのIssueを自動分類するスキル",
  "agents": [
    { "name": "classify-issues", "role": "Issueの内容を分析して分類する" }
  ],
  "scripts": [
    { "name": "validate-labels.js", "purpose": "ラベルの妥当性を検証する" }
  ],
  "triggers": ["GitHub Issue作成時"],
  "anchors": ["GitHub API v4"]
}
```

**検証**: skillName/description/agents/scripts/triggers/anchors が全て構造化されて返却。PASS。

### シナリオ B: system prompt に agent 仕様書が含まれる

**検証内容**: `sendChat` 呼び出し時の `systemPrompt` にDISCOVER_CONTENT/DESIGN_CONTENT/PLAN_CONTENT が含まれることをモックで確認。PASS。

### シナリオ C: user prompt に入力テキストが含まれる

**検証内容**: `sendChat.messages[0].content` が入力テキストと一致。PASS。

## 2. terminal_handoff 経路テスト

**テスト結果**:

- LLM 呼び出し（`sendChat`）: 0回（未呼び出し確認済み）
- ResourceLoader（`loadAgent`）: 0回（未呼び出し確認済み）
- レスポンス: `{ type: "terminal_handoff", bundle: { launcher: "claude", ... } }`

**判定**: terminal_handoff 経路は LLM に影響なし。PASS。

## 3. エラー系テスト

| シナリオ                        | 期待動作                     | 結果 |
| ------------------------------- | ---------------------------- | ---- |
| LLM 空文字列レスポンス          | パースエラーがスロー         | PASS |
| LLM 非 JSON レスポンス          | パースエラーがスロー         | PASS |
| LLM 部分 JSON（skillName 欠如） | バリデーションエラーがスロー | PASS |
| LLM agents 空配列               | バリデーションエラーがスロー | PASS |
| LLM API タイムアウト            | エラーが伝播                 | PASS |
| ResourceLoader 1ファイル失敗    | エラーが伝播                 | PASS |
| ResourceLoader 全ファイル失敗   | 最初のエラーが伝播           | PASS |
| 空文字列入力                    | バリデーションエラーがスロー | PASS |
| スペースのみ入力                | バリデーションエラーがスロー | PASS |
| skillName 空文字列              | バリデーションエラーがスロー | PASS |

## 4. Graceful degradation テスト

| シナリオ              | 期待動作               | 結果 |
| --------------------- | ---------------------- | ---- |
| llmAdapter 未注入     | スタブレスポンスを返す | PASS |
| resourceLoader 未注入 | スタブレスポンスを返す | PASS |

## 5. 実API接続テスト

**注記**: CLI 環境のため実際の Anthropic API 接続は未実施。本番環境での動作確認はデプロイ後に実施予定。モックテスト18件で LLM 統合ロジックの正確性は検証済み。

## テスト実行結果

```
Test Files  1 passed (1)
     Tests  18 passed (18)
  Duration  1.66s
```
