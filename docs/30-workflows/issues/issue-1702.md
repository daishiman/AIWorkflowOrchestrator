# [#1702] [UT-RT-01-ERROR-MESSAGE-I18N-001] LLMAdapter actionableメッセージ i18n対応

## メタ情報

```yaml
issue_number: 1702
title: [UT-RT-01-ERROR-MESSAGE-I18N-001] LLMAdapter actionableメッセージ i18n対応
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1702
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

TASK-RT-01 で実装した `toActionableMessage()` 関数とエラーメッセージが日本語でハードコードされている。プロジェクト全体の i18n 基盤整備後に、これらの文字列を i18n キーへ置換する必要がある。

## 関連タスク

- 親タスク: TASK-RT-01
- タスク仕様書: `docs/30-workflows/unassigned-task/task-ut-rt-01-error-message-i18n-001.md`

## 完了条件

- `RuntimeSkillCreatorFacade.ts` 内の日本語ハードコード文字列が i18n キーに置換されている
- 対象: `skillCreator.error.apiKeyRequired`, `skillCreator.error.llmAdapterInitializing`, `skillCreator.error.llmAdapterFailed`
- i18n リソースファイルに英語・日本語の翻訳文字列が追加されている
- テストの文字列アサーションがキーベースに更新されている

## 優先度

Low - i18n 基盤整備後に対応。現時点では日本語ハードコードで機能的に問題なし。
