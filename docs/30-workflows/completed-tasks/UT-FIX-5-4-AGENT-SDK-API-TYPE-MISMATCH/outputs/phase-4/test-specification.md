# abort()メソッド型定義テスト仕様

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 4          |
| タスクID | UT-FIX-5-4 |
| 作成日   | 2026-02-10 |

## テスト対象

- ファイル: `apps/desktop/src/preload/types.ts` (AgentSDKAPI.abort)
- ファイル: `packages/shared/src/agent/types.ts` (AgentAPI.abort)

## 前提条件

- UT-FIX-5-3のセキュリティ修正が完了していること
- `safeInvoke` が正しく `IPC_CHANNELS.AGENT_ABORT` を呼び出すこと

## テスト環境

- テストフレームワーク: Vitest
- モック: `electron` モジュールの `ipcRenderer`
- 型テスト: `expectTypeOf` (vitest)

## テストデータ

- 正常系: `mockInvoke` が `Promise.resolve(undefined)` を返す
- 異常系: `mockInvoke` が `Promise.reject(new Error("IPC Error"))` を返す

## テストファイル

| ファイル                                                       | 説明                 |
| -------------------------------------------------------------- | -------------------- |
| `apps/desktop/src/preload/__tests__/agentSDKAPI.abort.test.ts` | ランタイム動作テスト |
| `apps/desktop/src/preload/__tests__/agentSDKAPI.types.test.ts` | 型レベルテスト       |

## テストカテゴリ

### 1. IPC Channel定義

- チャンネル定義の存在確認
- ホワイトリスト登録確認

### 2. 戻り値の型検証

- Promiseインスタンス検証
- await可能性検証

### 3. Promise動作検証

- 成功時のresolve
- 失敗時のreject

### 4. 一貫性検証

- 他メソッドとの戻り値型一貫性

### 5. 型レベルテスト

- `expectTypeOf`による型検証
