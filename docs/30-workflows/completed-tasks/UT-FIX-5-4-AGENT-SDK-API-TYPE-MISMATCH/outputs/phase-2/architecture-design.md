# UT-FIX-5-4 アーキテクチャ設計書

## 概要

本ドキュメントは、AgentSDKAPI abort()メソッドの型定義修正におけるアーキテクチャ設計を記述する。

## 現状アーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AgentSDKPage / useAgent                               │ │
│  │    └── window.agentSDKAPI.abort()                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ IPC (contextBridge)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Preload Process                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  preload/index.ts                                      │ │
│  │    └── agentSDKAPI.abort()                             │ │
│  │                                                        │ │
│  │  preload/types.ts (型定義)                             │ │
│  │    └── AgentSDKAPI.abort: () => void ← 修正対象        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ IPC (safeInvoke)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Main Process                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  agent-handler.ts                                      │ │
│  │    └── handleAbort()                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Shared Package                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  packages/shared/src/agent/types.ts                    │ │
│  │    └── AgentAPI.abort(): void ← 修正対象               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 型定義の関係

```typescript
// packages/shared/src/agent/types.ts
export interface AgentAPI {
  abort(): void; // ← 共有型定義
  // ...
}

// apps/desktop/src/preload/types.ts
export interface AgentSDKAPI {
  abort: () => void; // ← Preload固有の型定義
  // ...
}
```

## 設計方針

### 方針1: 型定義の一貫性確保

両方の型定義ファイルで戻り値型を`Promise<void>`に統一する。

**理由**:

- IPC通信は本質的に非同期であり、`Promise<void>`が適切
- 将来的なawait対応を容易にする
- 他のメソッド（query, createSession等）と一貫した設計

### 方針2: 後方互換性の維持

呼び出し側のコードを変更しない。

**理由**:

- `void` → `Promise<void>` はTypeScriptで後方互換
- 既存の `abort()` 呼び出しはそのまま動作
- `await abort()` も新たに使用可能

### 方針3: P23パターン準拠

2箇所の型定義を同時に更新する。

**理由**:

- 型定義の不整合防止
- 開発者の混乱回避
- 同一コミットでの変更を保証

## 修正設計

### 修正箇所1: preload/types.ts

```typescript
// 修正前（行1289）
export interface AgentSDKAPI {
  // ...
  abort: () => void;
  // ...
}

// 修正後
export interface AgentSDKAPI {
  // ...
  abort: () => Promise<void>;
  // ...
}
```

### 修正箇所2: shared/agent/types.ts

```typescript
// 修正前（行236）
export interface AgentAPI {
  // ...
  abort(): void;
  // ...
}

// 修正後
export interface AgentAPI {
  // ...
  abort(): Promise<void>;
  // ...
}
```

## 呼び出し箇所の影響分析

### 影響なし（変更不要）

| ファイル                   | 呼び出しパターン              | 理由         |
| -------------------------- | ----------------------------- | ------------ |
| agent-handler.ts:84        | `this.agentClient.abort();`   | 戻り値未使用 |
| agent-handler.ts:100       | `this.agentClient.abort();`   | 戻り値未使用 |
| AgentSDKPage/index.tsx:305 | `window.agentSDKAPI.abort();` | 戻り値未使用 |
| useAgent.ts:170            | `agentAPI.abort();`           | 戻り値未使用 |

### TypeScript互換性

```typescript
// 以下のパターンはすべて有効
abort();                    // OK: Promiseを無視
await abort();              // OK: Promiseを待機
abort().then(...);          // OK: Promiseチェーン
abort().catch(...);         // OK: エラーハンドリング
```

## テスト設計

### 型チェックテスト

```bash
# 修正後に実行
pnpm typecheck

# 期待結果: abort()関連のエラーなし
```

### 既存テスト確認

以下のテストファイルが abort() を使用:

- `agent-client.test.ts`
- `useAgent.test.ts`

修正による影響: なし（戻り値未使用のため）

## リスク軽減策

### 同時更新の保証

1. 両ファイルを同一コミットで更新
2. TypeCheck で整合性を検証
3. レビューで両箇所の確認を必須化

### ロールバック計画

修正が問題を起こした場合:

1. 両ファイルを `void` に戻す
2. 単純な2行変更のため、即座にロールバック可能
