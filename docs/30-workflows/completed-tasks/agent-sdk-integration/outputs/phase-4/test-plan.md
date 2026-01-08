# Agent SDK統合 テスト計画書

> Phase 4 成果物
> 作成日: 2026-01-08
> スキル: tdd-principles, test-doubles, boundary-value-analysis

---

## 1. テスト戦略

### 1.1 TDDアプローチ

本プロジェクトではTDD（Test-Driven Development）を採用し、以下のサイクルを実践する:

1. **Red**: 失敗するテストを先に作成
2. **Green**: テストが通る最小限の実装
3. **Refactor**: コード品質の改善

### 1.2 テストピラミッド

```
                    ┌─────────┐
                    │  E2E    │  少数・高コスト
                    ├─────────┤
                    │ 統合    │  中程度
                    ├─────────┤
                    │ ユニット │  多数・低コスト
                    └─────────┘
```

| 種別     | 比率 | 実行頻度   | 対象                      |
| -------- | ---- | ---------- | ------------------------- |
| ユニット | 70%  | 毎コミット | 純粋関数、クラスメソッド  |
| 統合     | 20%  | 毎プッシュ | IPC通信、モジュール間連携 |
| E2E      | 10%  | 手動/CI    | ユーザーシナリオ          |

---

## 2. カバレッジ目標

### 2.1 全体目標

| メトリクス | 目標    | 最低限 |
| ---------- | ------- | ------ |
| Line       | 80%以上 | 70%    |
| Branch     | 60%以上 | 50%    |
| Function   | 80%以上 | 70%    |
| Statement  | 80%以上 | 70%    |

### 2.2 モジュール別目標

| モジュール         | Line目標 | 優先度 |
| ------------------ | -------- | ------ |
| validation.ts      | 95%      | 高     |
| errors.ts          | 90%      | 高     |
| session-manager.ts | 85%      | 高     |
| agent-client.ts    | 80%      | 高     |
| agent-handler.ts   | 75%      | 中     |
| useAgent.ts        | 75%      | 中     |

---

## 3. テスト対象モジュール

### 3.1 ユニットテスト対象

| ファイル                                       | テスト対象                | テスト数 |
| ---------------------------------------------- | ------------------------- | -------- |
| `packages/shared/src/agent/validation.ts`      | Zodスキーマバリデーション | 15+      |
| `packages/shared/src/agent/errors.ts`          | エラークラス階層          | 10+      |
| `packages/shared/src/agent/session-manager.ts` | セッション管理            | 12+      |
| `packages/shared/src/agent/agent-client.ts`    | SDKクライアント           | 15+      |

### 3.2 統合テスト対象

| ファイル                                       | テスト対象  | テスト数 |
| ---------------------------------------------- | ----------- | -------- |
| `apps/desktop/src/main/agent/agent-handler.ts` | IPCハンドラ | 10+      |
| `apps/desktop/src/renderer/hooks/useAgent.ts`  | React Hook  | 8+       |

---

## 4. テストダブル戦略

### 4.1 モック対象

| 対象              | モック方法                                | 理由                         |
| ----------------- | ----------------------------------------- | ---------------------------- |
| Claude Agent SDK  | vi.mock('@anthropic-ai/claude-agent-sdk') | 外部API依存排除              |
| Electron IPC      | vi.mock('electron')                       | プロセス間通信のシミュレート |
| crypto.randomUUID | vi.fn()                                   | 決定性テスト                 |
| Date.now          | vi.fn()                                   | 時間依存テスト               |

### 4.2 スタブ設計

```typescript
// SDK スタブ
const mockSDK = {
  query: vi.fn().mockResolvedValue({
    id: "test-id",
    messages: [],
  }),
  abort: vi.fn(),
};

// IPC スタブ
const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
};

const mockIpcRenderer = {
  invoke: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
};
```

---

## 5. 境界値テスト

### 5.1 プロンプト長境界値

| ケース   | 入力値      | 期待結果             |
| -------- | ----------- | -------------------- |
| 最小未満 | 空文字 ('') | バリデーションエラー |
| 最小     | 1文字 ('a') | 成功                 |
| 最大     | 10000文字   | 成功                 |
| 最大超過 | 10001文字   | バリデーションエラー |

### 5.2 タイムアウト境界値

| ケース   | 入力値   | 期待結果             |
| -------- | -------- | -------------------- |
| 最小未満 | 999ms    | バリデーションエラー |
| 最小     | 1000ms   | 成功                 |
| 最大     | 300000ms | 成功                 |
| 最大超過 | 300001ms | バリデーションエラー |

### 5.3 セッションID境界値

| ケース       | 入力値                                 | 期待結果                |
| ------------ | -------------------------------------- | ----------------------- |
| 空文字       | ''                                     | バリデーションエラー    |
| 不正形式     | 'invalid-uuid'                         | バリデーションエラー    |
| 有効UUID     | '550e8400-e29b-41d4-a716-446655440000' | 成功                    |
| 存在しないID | '11111111-1111-1111-1111-111111111111' | SESSION_NOT_FOUNDエラー |

---

## 6. テストシナリオマトリクス

### 6.1 正常系シナリオ

| ID   | シナリオ               | 入力                          | 期待出力             |
| ---- | ---------------------- | ----------------------------- | -------------------- |
| N-01 | 基本クエリ実行         | prompt="Hello"                | SDKMessageストリーム |
| N-02 | タイムアウト指定クエリ | prompt="Hello", timeout=60000 | 60秒以内にレスポンス |
| N-03 | セッション作成         | なし                          | sessionId (UUID v4)  |
| N-04 | セッション再開         | sessionId="valid-uuid"        | void                 |
| N-05 | セッション破棄         | sessionId="valid-uuid"        | void                 |
| N-06 | ステータス取得         | なし                          | AgentStatus          |

### 6.2 異常系シナリオ

| ID   | シナリオ             | 入力                   | 期待エラー            |
| ---- | -------------------- | ---------------------- | --------------------- |
| E-01 | 空プロンプト         | prompt=""              | VALIDATION_ERROR      |
| E-02 | 長すぎるプロンプト   | prompt=10001文字       | VALIDATION_ERROR      |
| E-03 | 不正タイムアウト     | timeout=0              | VALIDATION_ERROR      |
| E-04 | 存在しないセッション | sessionId="invalid"    | SESSION_NOT_FOUND     |
| E-05 | SDK初期化失敗        | apiKey=invalid         | INITIALIZATION_FAILED |
| E-06 | クエリタイムアウト   | timeout=1000 (遅いAPI) | TIMEOUT               |
| E-07 | ユーザーキャンセル   | abort()呼び出し        | ABORTED               |

---

## 7. 受け入れ基準とテストマッピング

### 7.1 AC-001: SDK初期化

| AC ID    | テストファイル       | テストケース                       |
| -------- | -------------------- | ---------------------------------- |
| AC-001-1 | agent-client.test.ts | should initialize SDK with API key |
| AC-001-2 | agent-client.test.ts | should handle initialization error |

### 7.2 AC-002: クエリ実行

| AC ID    | テストファイル       | テストケース                        |
| -------- | -------------------- | ----------------------------------- |
| AC-002-1 | agent-client.test.ts | should execute query successfully   |
| AC-002-2 | agent-client.test.ts | should stream messages via callback |

### 7.3 AC-003: エラー処理

| AC ID    | テストファイル       | テストケース                          |
| -------- | -------------------- | ------------------------------------- |
| AC-003-1 | errors.test.ts       | should create error with correct code |
| AC-003-2 | errors.test.ts       | should serialize/deserialize error    |
| AC-003-3 | agent-client.test.ts | should handle SDK errors              |
| AC-003-4 | agent-client.test.ts | should retry on transient errors      |

### 7.4 AC-004: セッション管理

| AC ID    | テストファイル          | テストケース           |
| -------- | ----------------------- | ---------------------- |
| AC-004-1 | session-manager.test.ts | should create session  |
| AC-004-2 | session-manager.test.ts | should resume session  |
| AC-004-3 | session-manager.test.ts | should destroy session |

### 7.5 AC-005: バリデーション

| AC ID    | テストファイル     | テストケース                     |
| -------- | ------------------ | -------------------------------- |
| AC-005-1 | validation.test.ts | should validate prompt length    |
| AC-005-2 | validation.test.ts | should validate timeout range    |
| AC-005-3 | validation.test.ts | should validate sessionId format |
| AC-005-4 | validation.test.ts | should reject extra fields       |

---

## 8. テスト実行コマンド

### 8.1 ユニットテスト

```bash
# Shared パッケージ
pnpm --filter @repo/shared test:run

# 特定ファイル
pnpm --filter @repo/shared test:run -- agent
```

### 8.2 統合テスト

```bash
# Desktop アプリ
pnpm --filter @repo/desktop test:run

# 特定ディレクトリ
pnpm --filter @repo/desktop test:run -- agent
```

### 8.3 カバレッジ計測

```bash
# カバレッジレポート生成
pnpm --filter @repo/shared test:coverage
pnpm --filter @repo/desktop test:coverage
```

---

## 9. Phase 4 完了チェックリスト

- [ ] すべてのテストファイルが作成されている
- [ ] すべてのテストがRed状態（失敗）である
- [ ] 境界値テストが含まれている
- [ ] 正常系/異常系が網羅されている
- [ ] テストダブルが適切に設計されている
- [ ] カバレッジ目標が設定されている

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
