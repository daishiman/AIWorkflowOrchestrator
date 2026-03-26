# [#1598] [TASK-SC-13] authMode/apiKey パラメータ実装

## メタ情報

```yaml
issue_number: 1598
title: [TASK-SC-13] authMode/apiKey パラメータ実装
state: OPEN
priority: 中
scale: -
category: -
status: -
created_date: 2026-03-25
updated_date: 2026-03-25
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1598
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 中   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

planSkill / executePlan の `authMode` と `apiKey` パラメータを実装し、LLM プロバイダーの認証フローを完成させる。

## 背景

TASK-SC-07 で SkillCreateWizard に LLM 生成フローを接続した際、認証パラメータは省略されている。ユーザーが独自の API キーを使用する場合や、複数の LLM プロバイダーを切り替える場合に対応できない。

## 対応内容

- LLM プロバイダー設定 UI コンポーネントの設計
- `authMode` の型定義（`"env" | "user_key" | "oauth"` 等）
- SkillCreateWizard の handleLlmGenerate で authMode/apiKey を渡す実装
- Main Process 側の認証ロジック
- API キーの安全な保存（Electron safeStorage）

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SC-13-AUTH-MODE-API-KEY-IMPLEMENTATION.md`

## 関連

- 検出元: TASK-SC-07 Phase 12 レビュー
- 関連 Issue: #1588 (TASK-SC-07)
