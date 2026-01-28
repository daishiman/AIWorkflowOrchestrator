# Phase 6: テスト拡充 - SkillSlice実装

## 概要

Phase 5の基本実装に対して、エッジケース・異常系・統合テストを追加し、テストカバレッジを向上させる。

## 追加テストケース

### 1. エッジケーステスト（TS-6-1-60〜TS-6-1-69）

| テストID  | テスト内容                           | 期待結果               |
| --------- | ------------------------------------ | ---------------------- |
| TS-6-1-60 | fetchSkills中に再度fetchSkillsを呼ぶ | 最後の呼び出しが有効   |
| TS-6-1-61 | importSkill中に同じスキルをimport    | エラーまたは無視       |
| TS-6-1-62 | 存在しないスキルをremove             | エラー処理             |
| TS-6-1-63 | 実行中にexecuteSkillを呼ぶ           | 新しい実行が開始       |
| TS-6-1-64 | 権限待ち中にabortExecution           | キャンセル処理         |
| TS-6-1-65 | 空のpromptでexecuteSkill             | バリデーションエラー   |
| TS-6-1-66 | streamingMessagesが大量の場合        | パフォーマンス問題なし |
| TS-6-1-67 | 同時に複数のスキルをインポート       | 全て成功               |
| TS-6-1-68 | IPC APIがundefinedの場合             | エラーハンドリング     |
| TS-6-1-69 | 型が不正なレスポンスを受け取った場合 | エラーハンドリング     |

### 2. 状態遷移テスト（TS-6-1-70〜TS-6-1-79）

| テストID  | テスト内容                                  | 期待結果   |
| --------- | ------------------------------------------- | ---------- |
| TS-6-1-70 | idle → running → completed 遷移             | 正常遷移   |
| TS-6-1-71 | idle → running → error 遷移                 | 正常遷移   |
| TS-6-1-72 | idle → running → cancelled 遷移             | 正常遷移   |
| TS-6-1-73 | running → permission_pending → running 遷移 | 正常遷移   |
| TS-6-1-74 | running → permission_pending → error 遷移   | 正常遷移   |
| TS-6-1-75 | completed → running（再実行）               | 正常遷移   |
| TS-6-1-76 | error → running（再実行）                   | 正常遷移   |
| TS-6-1-77 | cancelled → running（再実行）               | 正常遷移   |
| TS-6-1-78 | 不正な状態遷移の拒否                        | 遷移しない |
| TS-6-1-79 | 複数の状態フラグの整合性                    | 整合性維持 |

### 3. IPCイベントテスト（TS-6-1-80〜TS-6-1-86）

| テストID  | テスト内容                        | 期待結果           |
| --------- | --------------------------------- | ------------------ |
| TS-6-1-80 | 異なるexecutionIdのイベントを無視 | 無視される         |
| TS-6-1-81 | 連続したstreamイベントの処理      | 全て処理される     |
| TS-6-1-82 | completeとerrorが同時に来た場合   | 先着優先           |
| TS-6-1-83 | リスナー解除後のイベント          | 処理されない       |
| TS-6-1-84 | 権限リクエストのタイムアウト      | タイムアウト処理   |
| TS-6-1-85 | 不正な形式のイベントデータ        | エラーハンドリング |
| TS-6-1-86 | イベント処理中の例外              | エラーハンドリング |

### 4. 統合テスト（TS-6-1-90〜TS-6-1-95）

| テストID  | テスト内容                       | 期待結果     |
| --------- | -------------------------------- | ------------ |
| TS-6-1-90 | スキルリスト取得→選択→実行フロー | 全工程成功   |
| TS-6-1-91 | スキャン→インポート→実行フロー   | 全工程成功   |
| TS-6-1-92 | 実行→権限要求→承認→完了フロー    | 全工程成功   |
| TS-6-1-93 | 実行→権限要求→拒否→エラーフロー  | 全工程成功   |
| TS-6-1-94 | 複数スキルの連続実行             | 全て正常完了 |
| TS-6-1-95 | エラー後のリカバリーフロー       | 正常に回復   |

## テストファイル追加

### エッジケーステスト

**パス**: `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.edge-cases.test.ts`

```typescript
/**
 * @file skillSlice エッジケーステスト
 * @description 境界値・異常系のテスト
 * @testIds TS-6-1-60〜TS-6-1-69
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSkillSlice, type SkillSlice } from "../skillSlice";

describe("skillSlice - エッジケース", () => {
  // テスト実装
});
```

### 状態遷移テスト

**パス**: `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.state-transition.test.ts`

```typescript
/**
 * @file skillSlice 状態遷移テスト
 * @description 状態遷移の正当性を検証
 * @testIds TS-6-1-70〜TS-6-1-79
 * @feature skill-import-agent-system
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSkillSlice, type SkillSlice } from "../skillSlice";

describe("skillSlice - 状態遷移", () => {
  // テスト実装
});
```

## モックデータ拡張

```typescript
// エッジケース用モックデータ
const mockLargeStreamingMessages: SkillStreamMessage[] = Array.from(
  { length: 1000 },
  (_, i) => ({
    executionId: "exec-123",
    type: "assistant",
    content: { text: `メッセージ ${i}`, isPartial: false },
    timestamp: Date.now() + i,
  }),
);

// 不正なレスポンス
const mockInvalidResponse = {
  executionId: null,
  success: "invalid", // boolean期待
};

// タイムアウト用モック
const mockSlowAPI = vi
  .fn()
  .mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 10000)),
  );
```

## 完了条件

| 条件                       | 状態 |
| -------------------------- | ---- |
| エッジケーステスト10件追加 | [ ]  |
| 状態遷移テスト10件追加     | [ ]  |
| IPCイベントテスト7件追加   | [ ]  |
| 統合テスト6件追加          | [ ]  |
| 全テストが通過             | [ ]  |

## 実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test skillSlice

# エッジケーステストのみ
pnpm --filter @repo/desktop test skillSlice.edge-cases

# 状態遷移テストのみ
pnpm --filter @repo/desktop test skillSlice.state-transition
```
