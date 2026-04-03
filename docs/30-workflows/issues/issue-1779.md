# [#1779] [TASK-P0-07-MANIFEST-PHASE-ID-CANONICALIZATION-001] manifest phase ID 正規名称のドキュメント化

## メタ情報

```yaml
issue_number: 1779
title: [TASK-P0-07-MANIFEST-PHASE-ID-CANONICALIZATION-001] manifest phase ID 正規名称のドキュメント化
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-30
updated_date: 2026-03-30
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1779
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`workflow-manifest.json` の phase ID 正規名称（`requirements-gathering` / `plan` / `improve`）をドキュメント化する。

## 背景

TASK-P0-07 でテストフィクスチャの phase ID を `phase-plan` から正規名称に統一した。しかし、この正規名称はどこにもドキュメントとして定義されていない。`workflow-manifest.json` を作成する開発者が正しい phase ID を知る手段がない状態になっている。

## 受入基準

- [ ] canonical phase ID 一覧がドキュメント化されている
- [ ] 各 phase ID の意味・用途が説明されている
- [ ] `OPERATION_PHASE_IDS` との対応関係が明示されている

## 期待する出力

```markdown
### 正規 phase ID 一覧（skill-creator workflow）

| Phase ID                 | 用途             | Operation |
| ------------------------ | ---------------- | --------- |
| `requirements-gathering` | 要件収集フェーズ | plan      |
| `plan`                   | 計画立案フェーズ | plan      |
| `improve`                | 改善提案フェーズ | improve   |
```

## 仕様書

`docs/30-workflows/unassigned-task/task-p0-07-manifest-phase-id-canonicalization-001.md`

## 発見元

TASK-P0-07 (hardcoded-agent-names-dynamic-resolution) Phase 12 unassigned-task-detection（2026-03-30）
