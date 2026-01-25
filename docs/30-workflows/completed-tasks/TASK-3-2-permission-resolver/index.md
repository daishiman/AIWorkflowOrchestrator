---
id: TASK-3-2
tier: 1
title: PermissionResolver 実装
phase: 3
depends_on: [TASK-1-1]
parallel_with: [TASK-3-1]
blocks: [TASK-4-2]
status: pending
priority: high
estimated_complexity: small
tags: [backend, main-process, service]
created_at: 2026-01-25
---

# PermissionResolver 実装 - メインタスク仕様書

## 概要

権限確認リクエストの待機・解決を管理するクラス `PermissionResolver` を実装する。
Renderer から IPC 経由で送られる権限応答を受け取り、待機中のリクエストを解決する。

このクラスは SkillExecutor と連携し、Claude Agent SDK の Hooks 機能からの権限確認リクエストを
ユーザー応答まで待機し、その結果を返す責務を担う。

## アーキテクチャ上の位置づけ

```
┌─────────────────────────────────────────────────────────┐
│ Interface Adapters (外側)                               │
│  └─ IPC Handlers, Zustand Store                        │
├─────────────────────────────────────────────────────────┤
│ Application Business Rules                              │
│  └─ SkillExecutor, PermissionResolver ← ★ここ          │
├─────────────────────────────────────────────────────────┤
│ Enterprise Business Rules (内側)                        │
│  └─ SkillMetadata, ImportedSkill                       │
└─────────────────────────────────────────────────────────┘
```

## 入力

- TASK-1-1 の型定義（`PermissionRequest`, `PermissionResponse`）

## 出力

- `apps/desktop/src/main/services/skill/PermissionResolver.ts`
- `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts`
- `apps/desktop/src/main/services/skill/index.ts` への export 追加

## Phase一覧

| Phase | 名称                 | 目的                           | ステータス |
| ----- | -------------------- | ------------------------------ | ---------- |
| 1     | 要件定義             | 目的・スコープ・受け入れ基準   | pending    |
| 2     | 設計                 | クラス設計・インターフェース   | pending    |
| 3     | 設計レビューゲート   | 設計の妥当性検証               | pending    |
| 4     | テスト作成           | TDD: Red（失敗テスト作成）     | pending    |
| 5     | 実装                 | TDD: Green（テストを通す実装） | pending    |
| 6     | テスト拡充           | エッジケース・カバレッジ向上   | pending    |
| 7     | テストカバレッジ確認 | カバレッジ目標検証             | pending    |
| 8     | リファクタリング     | TDD: Refactor（品質改善）      | pending    |
| 9     | 品質保証             | 静的解析・セキュリティ         | pending    |
| 10    | 最終レビューゲート   | 全体品質・整合性検証           | pending    |
| 11    | 手動テスト検証       | 実環境動作確認                 | pending    |
| 12    | ドキュメント更新     | 仕様反映・実装ガイド           | pending    |
| 13    | PR作成               | コミット・PR・CI確認           | pending    |

## 主要機能

### クラス構造

```typescript
interface PendingRequest {
  resolve: (response: PermissionResponse) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}

export class PermissionResolver {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTimeout: number = 300000; // 5分

  constructor(defaultTimeout?: number);

  async waitForResponse(
    requestId: string,
    signal?: AbortSignal,
  ): Promise<PermissionResponse>;

  resolveRequest(response: PermissionResponse): void;

  cancelRequest(requestId: string, reason?: string): void;

  cancelAll(): void;

  get pendingCount(): number;
}
```

## 依存関係

### 依存するタスク

- **TASK-1-1**: 共通型定義（`PermissionRequest`, `PermissionResponse`）

### 並行可能なタスク

- **TASK-3-1**: SkillExecutor 実装（同Phase、独立）

### ブロックするタスク

- **TASK-4-2**: IPC Handlers 実装（本タスクの PermissionResolver を利用）

## 技術要件

### 使用技術

- TypeScript
- Node.js 標準 API（タイマー、AbortController）

### 依存パッケージ

なし（Node.js 標準のみ使用）

## 品質基準

### カバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 90%+ |
| Branch Coverage   | 80%+ |
| Function Coverage | 100% |

### テスト要件

- 単体テスト: 正常系・異常系・タイムアウト・AbortSignal
- 並行リクエスト処理の検証
- メモリリーク防止（タイマークリーンアップ）

## 参考資料

| 資料                 | パス                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`         |
| タスク元定義         | `docs/30-workflows/skill-import-agent-system/tasks/task-3-2-permission-resolver.md` |
| 型定義               | `packages/shared/src/types/skill.ts`                                                |
| エキスパートレビュー | `docs/30-workflows/skill-import-agent-system/expert-review.md`                      |

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
