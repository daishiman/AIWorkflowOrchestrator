# Phase 4: 統合テスト設計

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase    | 4                                  |
| 作成日   | 2026-02-09                         |

## 1. 統合テスト概要

本ドキュメントでは、SkillAPI統一に関する統合テストの設計を定義する。

### 1.1 テストレイヤー

```
┌─────────────────────────────────────────────────────┐
│                   Renderer Process                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Hooks     │  │    Store    │  │  Components │  │
│  │             │  │             │  │             │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                │          │
│         └────────────────┼────────────────┘          │
│                          │                           │
│                          ▼                           │
│              window.electronAPI.skill                │
└─────────────────────────────────────────────────────┘
                           │
                           │ contextBridge
                           ▼
┌─────────────────────────────────────────────────────┐
│                   Preload Script                     │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │                  skillAPI                    │    │
│  │  ┌─────────────┐  ┌─────────────┐           │    │
│  │  │  safeInvoke │  │   safeOn    │           │    │
│  │  └──────┬──────┘  └──────┬──────┘           │    │
│  └─────────┼────────────────┼──────────────────┘    │
│            │                │                        │
│            └────────────────┼────────────────────────│
│                             │                        │
└─────────────────────────────────────────────────────┘
                              │
                              │ IPC Channels
                              ▼
┌─────────────────────────────────────────────────────┐
│                    Main Process                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ IPCHandler  │  │SkillExecutor│  │SkillManager │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 2. 統合テストシナリオ

### 2.1 API接続テスト

| シナリオID | 名称                     | 説明                                           | 検証ポイント                              |
| ---------- | ------------------------ | ---------------------------------------------- | ----------------------------------------- |
| IT-001     | 13メソッド疎通           | electronAPI.skillの全メソッドがIPC呼び出し可能 | safeInvoke/safeOnが正しいチャンネルを使用 |
| IT-002     | チャンネルホワイトリスト | 許可チャンネルのみIPC呼び出し可能              | 不正チャンネルのreject                    |

### 2.2 データフローテスト

| シナリオID | 名称                 | 説明                            | 検証ポイント       |
| ---------- | -------------------- | ------------------------------- | ------------------ |
| IT-003     | Renderer→Preload→IPC | 呼び出し経路の検証              | 引数の正しい伝播   |
| IT-004     | IPC→Preload→Renderer | レスポンス経路の検証            | 戻り値の正しい伝播 |
| IT-005     | イベントストリーム   | Main→Preload→Rendererのイベント | コールバック発火   |

### 2.3 エラーハンドリングテスト

| シナリオID | 名称           | 説明                      | 検証ポイント    |
| ---------- | -------------- | ------------------------- | --------------- |
| IT-006     | IPC通信エラー  | 通信障害時のエラー伝播    | Promiseのreject |
| IT-007     | 不正チャンネル | 許可外チャンネルの拒否    | Error throw     |
| IT-008     | タイムアウト   | IPC呼び出しのタイムアウト | 適切なエラー    |

### 2.4 状態同期テスト

| シナリオID | 名称          | 説明                                       | 検証ポイント      |
| ---------- | ------------- | ------------------------------------------ | ----------------- |
| IT-009     | Store API使用 | skillSliceがelectronAPI.skillを使用        | 正しいAPI呼び出し |
| IT-010     | Hooks API使用 | useSkillExecutionがelectronAPI.skillを使用 | 正しいAPI呼び出し |

## 3. テスト実装

### 3.1 skill-api.unification.test.ts

**位置:** `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`

```typescript
// 統一API公開テスト
describe("SkillAPI Unification", () => {
  describe("window.electronAPI.skill", () => {
    it("should expose all 13 methods", () => {
      // 13メソッドの存在確認
    });
  });

  describe("window.skillAPI (deprecated)", () => {
    it("should not be defined after unification", () => {
      // RED: Phase 5実装後にGREEN
    });
  });
});

// 型安全性テスト
describe("SkillAPI Type Safety", () => {
  // 各メソッドの戻り値型検証
});

// 境界値テスト
describe("SkillAPI Boundary Tests", () => {
  // 空文字列、null、undefined処理
});

// 統合シナリオテスト
describe("SkillAPI Integration Scenarios", () => {
  // 実際のユースケースフロー
});
```

### 3.2 既存テストとの関係

| テストファイル                  | 役割                 | 本タスクでの変更 |
| ------------------------------- | -------------------- | ---------------- |
| `skill-api.test.ts`             | 13メソッドの基本動作 | 変更なし（維持） |
| `skill-api.permission.test.ts`  | 権限系メソッド       | 変更なし（維持） |
| `skill-api.unification.test.ts` | 統一検証             | **新規作成**     |

## 4. IPCチャンネル検証

### 4.1 Invokeチャンネル（Renderer→Main）

| チャンネル                  | メソッド                 | 検証済み |
| --------------------------- | ------------------------ | -------- |
| `skill:list`                | list()                   | Yes      |
| `skill:getImported`         | getImported()            | Yes      |
| `skill:import`              | import()                 | Yes      |
| `skill:remove`              | remove()                 | Yes      |
| `skill:scan`                | rescan()                 | Yes      |
| `skill:execute`             | execute()                | Yes      |
| `skill:abort`               | abort()                  | Yes      |
| `skill:get-status`          | getExecutionStatus()     | Yes      |
| `skill:permission:response` | sendPermissionResponse() | Yes      |

### 4.2 Onチャンネル（Main→Renderer）

| チャンネル                 | メソッド              | 検証済み |
| -------------------------- | --------------------- | -------- |
| `skill:stream`             | onStream()            | Yes      |
| `skill:complete`           | onComplete()          | Yes      |
| `skill:error`              | onError()             | Yes      |
| `skill:permission:request` | onPermissionRequest() | Yes      |

## 5. セキュリティ検証

### 5.1 safeInvoke検証

```typescript
// 許可チャンネルのみ通過
expect(ALLOWED_INVOKE_CHANNELS).toContain("skill:list");
expect(ALLOWED_INVOKE_CHANNELS).not.toContain("skill:invalid");
```

### 5.2 safeOn検証

```typescript
// 許可チャンネルのみリスナー登録
expect(ALLOWED_ON_CHANNELS).toContain("skill:stream");
expect(ALLOWED_ON_CHANNELS).not.toContain("skill:invalid:stream");
```

## 6. テスト実行

### 6.1 コマンド

```bash
# 単体テスト実行
pnpm --filter @repo/desktop test skill-api.unification

# 全Skill関連テスト
pnpm --filter @repo/desktop test skill-api

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage skill-api
```

### 6.2 期待結果

**Phase 4終了時（Red状態）:**

```
 FAIL  skill-api.unification.test.ts
   SkillAPI Unification
     window.skillAPI (deprecated)
       ✗ should not be defined after unification
```

**Phase 5終了時（Green状態）:**

```
 PASS  skill-api.unification.test.ts
   SkillAPI Unification
     window.electronAPI.skill
       ✓ should expose all 13 methods
       ✓ should have exactly 13 methods
     window.skillAPI (deprecated)
       ✓ should not be defined after unification
```

## 7. 関連資料

| 資料               | パス                                                               |
| ------------------ | ------------------------------------------------------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                            |
| テストケース       | `outputs/phase-4/test-cases.md`                                    |
| 新規テストファイル | `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts` |
| 既存テストファイル | `apps/desktop/src/preload/__tests__/skill-api.test.ts`             |
