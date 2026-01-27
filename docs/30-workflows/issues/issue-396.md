# [#396] [UT-003] E2Eテスト追加（チャット履歴）

## メタ情報

```yaml
issue_number: 396
title: [UT-003] E2Eテスト追加（チャット履歴）
state: OPEN
priority: 中
scale: -
category: -
status: -
created_date: 2026-01-21
updated_date: 2026-01-21
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/396
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 中   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

Playwrightを使用したE2Eテストを作成し、チャット履歴機能の主要シナリオを自動検証可能にする。フィーチャーフラグによる新旧アーキテクチャ切り替えテストを含む。

## タスク情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-003                                                            |
| 優先度       | 中                                                                |
| 見積もり規模 | 中規模                                                            |
| 依存タスク   | ARCH-001 (完了), UT-005, UT-006, フィーチャーフラグ               |
| ステータス   | 待機中（フィーチャーフラグ実装待ち）                              |
| 仕様書       | `docs/30-workflows/unassigned-task/task-e2e-test-chat-history.md` |

## 成果物

- `chat-history.spec.ts`
- `feature-flag-toggle.spec.ts`
- `ChatHistoryPage.ts` (Page Object)
- `chat-history.fixtures.ts`
- CI/CD統合設定

## 完了条件

### 機能要件

- [ ] 全E2Eテストケース（E2E-01〜E2E-08）がPASS
- [ ] フィーチャーフラグテスト（FF-01〜FF-04）がPASS
- [ ] Page Objectパターンで実装されている

### CI/CD要件

- [ ] GitHub ActionsでE2Eテストが実行される
- [ ] テストレポートがアーティファクトとして保存される

## 関連

- 依存タスク: UT-005, UT-006, フィーチャーフラグ実装
- 関連タスク: ARCH-001 Clean Architecture Refactoring
- 関連タスク: UT-002 手動テスト

---

📋 Generated from task specification
