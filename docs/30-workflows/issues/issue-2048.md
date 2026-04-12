# [#2048] refactor(skill-wizard): resolveExternalIntegration 外部連携判定定数化・共通化 [UT-W2-03A-RESOLVE-INTEGRATION-CONST-001]

## メタ情報

```yaml
issue_number: 2048
title: refactor(skill-wizard): resolveExternalIntegration 外部連携判定定数化・共通化 [UT-W2-03A-RESOLVE-INTEGRATION-CONST-001]
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-08
updated_date: 2026-04-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2048
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

W2-seq-03a の実装で追加された `resolveExternalIntegration()` 関数内の外部連携ツール（Slack / GitHub / Notion）判定ロジックについて、表示名と判定値の対応を定数として切り出す。

## 背景

現状、`purpose.toLowerCase()` で判定する際の判定値と表示名がハードコードされており、新ツール追加時に複数箇所を修正する必要がある。

## 変更内容

- `EXTERNAL_INTEGRATION_MAP` 定数を `SkillCreateWizard.tsx` に追加
- `resolveExternalIntegration()` が定数を参照する形にリファクタリング
- 新ツール追加時に定数への追記1箇所で済む構造に変更

## 完了条件

- [ ] `EXTERNAL_INTEGRATION_MAP` 定数が定義されている
- [ ] `resolveExternalIntegration()` が定数を参照している
- [ ] 既存テストが全て PASS

## 発見元

W2-seq-03a Phase 12 スキルフィードバックレポート（2026-04-08）

## 仕様書

`docs/30-workflows/unassigned-task/UT-W2-03A-RESOLVE-INTEGRATION-CONST-001.md`
