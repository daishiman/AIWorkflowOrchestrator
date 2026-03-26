# [#1493] [UT-WORKSPACE-MOCK-CONTROLLER-DEDUP-001] WorkspaceView テストの createMockController ヘルパー共通化

## メタ情報

```yaml
issue_number: 1493
title: [UT-WORKSPACE-MOCK-CONTROLLER-DEDUP-001] WorkspaceView テストの createMockController ヘルパー共通化
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1493
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`apps/desktop/src/renderer/views/WorkspaceView/__tests__/` 配下の複数テストファイルに `createMockController()` ファクトリ関数が重複定義されている。共通テストヘルパーに抽出して DRY 原則を確保する。

## 現在の重複箇所

- `WorkspaceChatPanel.guidance.test.tsx`: `createMockController()` 定義
- `WorkspaceChatPanel.integration.test.tsx`: 同一シグネチャの `createMockController()` 定義

## 実装方針

1. `__tests__/testHelpers.ts` に共通 `createMockController()` を作成
2. 既存テストファイルから import に置き換え
3. 全テスト PASS を確認

## 受け入れ基準

- [ ] `__tests__/testHelpers.ts` に定義が集約されている
- [ ] `grep -rn "createMockController"` で定義が1箇所のみ
- [ ] 全既存テストが PASS（リグレッションなし）

## 関連

- 発見元: TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION 30種思考法分析（2026-03-23）
- 指示書: `docs/30-workflows/unassigned-task/task-ut-workspace-mock-controller-dedup-001.md`
- 関連 Pitfall: P21（DI追加時のテストモック大規模修正）、P35（DI追加時テストモック修正）
