# Phase 4 — テスト作成方針

## メタ情報

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH4 |
| フェーズ       | Phase 4（テスト作成）                |
| ステータス     | completed                            |
| 前フェーズ     | Phase 3（設計レビュー）              |
| 次フェーズ     | Phase 5（実装）                      |

---

## 1. テスト方針

### 1.1 最優先検証コマンド

実装の正しさを確認する最上位のテストは **verify-ipc-4layer.cjs の Rule-2 PASS** である。

```bash
node scripts/verify-ipc-4layer.cjs
```

期待する出力（Rule-2 部分）:

```
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS
```

このスクリプトは `ipcMain.handle(channel, ...)` の登録を静的解析により確認するため、実装後は必ずこのコマンドで検証すること。

### 1.2 単体テストの追加対象

各ハンドラファイルに対応するテストファイルへ追加する。既存テストファイルが存在するため、新規ファイルは原則作成しない。

| テストファイル                                                | 追加するテストケース                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`              | `auth:start-oauth-flow`・`auth:test-callback` の各ハンドラ                                |
| `apps/desktop/src/main/ipc/storeHandlers.test.ts`             | `settings:get`・`settings:update` の各ハンドラ                                            |
| `apps/desktop/src/main/ipc/agentHandlers.ts` 配下の対応テスト | `agent:get-skills`・`agent:get-skill-detail`・`agent:execute`・`agent:permission-respond` |

> `agentHandlers.ts` の既存テストファイルが存在しない場合は `agentHandlers.test.ts` を新規作成する。

---

## 2. 各ハンドラのテストケース定義

### 2.1 `auth:start-oauth-flow`

```typescript
describe("auth:start-oauth-flow", () => {
  it("有効なproviderを渡すとOAuthフローを開始してsuccessを返す", async () => {
    // arrange: provider = 'google'
    // act: IPC_CHANNELS.AUTH_START_OAUTH_FLOW を invoke
    // assert: { success: true } が返る
  });

  it("無効なproviderを渡すとINVALID_PROVIDERエラーを返す", async () => {
    // arrange: provider = 'invalid_provider'
    // act: IPC_CHANNELS.AUTH_START_OAUTH_FLOW を invoke
    // assert: { success: false, error: { code: 'INVALID_PROVIDER' } }
  });

  it("providerが省略されるとINVALID_PROVIDERエラーを返す", async () => {
    // arrange: 引数なし
    // assert: { success: false }
  });
});
```

### 2.2 `auth:test-callback`

```typescript
describe("auth:test-callback", () => {
  it("開発環境（NODE_ENV=development）ではコールバックURLを処理できる", async () => {
    // arrange: process.env.NODE_ENV = 'development'
    // act: IPC_CHANNELS.AUTH_TEST_CALLBACK を invoke
    // assert: { success: true } が返る（または適切な処理結果）
  });

  it("本番環境（NODE_ENV=production）では FORBIDDEN エラーを返す", async () => {
    // arrange: process.env.NODE_ENV = 'production'
    // act: IPC_CHANNELS.AUTH_TEST_CALLBACK を invoke
    // assert: { success: false, error: { code: 'FORBIDDEN' } } または同等のエラー
  });

  it("NODE_ENVが未設定（undefined）の場合も本番扱いとなりFORBIDDENを返す", async () => {
    // arrange: delete process.env.NODE_ENV
    // assert: { success: false }
  });
});
```

### 2.3 `settings:get`

```typescript
describe("settings:get", () => {
  it("存在するキーを指定すると値を返す", async () => {
    // arrange: settings に { theme: 'dark' } を保存済み
    // act: IPC_CHANNELS.USER_SETTINGS_GET を invoke({ key: 'theme' })
    // assert: { success: true, data: 'dark' }
  });

  it("存在しないキーとdefaultValueを指定するとdefaultValueを返す", async () => {
    // act: invoke({ key: 'nonexistent', defaultValue: 'default' })
    // assert: { success: true, data: 'default' }
  });

  it("不正なキー（空文字）を指定するとバリデーションエラーを返す", async () => {
    // act: invoke({ key: '' })
    // assert: { success: false }
  });
});
```

### 2.4 `settings:update`

```typescript
describe("settings:update", () => {
  it("有効なキーと値でsettingsを更新できる", async () => {
    // act: IPC_CHANNELS.USER_SETTINGS_UPDATE を invoke({ key: 'theme', value: 'light' })
    // assert: { success: true }
  });

  it("不正なキーを指定するとバリデーションエラーを返す", async () => {
    // act: invoke({ key: '', value: 'light' })
    // assert: { success: false }
  });
});
```

### 2.5 `agent:get-skills`

```typescript
describe("agent:get-skills", () => {
  it("スキル一覧を返す", async () => {
    // act: IPC_CHANNELS.AGENT_GET_SKILLS を invoke
    // assert: { success: true, data: Array<Skill> }
  });

  it("スキルが0件の場合も空配列を返す", async () => {
    // assert: { success: true, data: [] }
  });
});
```

### 2.6 `agent:get-skill-detail`

```typescript
describe("agent:get-skill-detail", () => {
  it("存在するskillIdを指定するとスキル詳細を返す", async () => {
    // act: IPC_CHANNELS.AGENT_GET_SKILL_DETAIL を invoke({ skillId: 'existing-id' })
    // assert: { success: true, data: SkillDetail }
  });

  it("存在しないskillIdを指定するとNOT_FOUNDエラーを返す", async () => {
    // assert: { success: false, error: { code: 'NOT_FOUND' } }
  });

  it("skillIdが省略されるとVALIDATION_ERRORを返す", async () => {
    // assert: { success: false }
  });
});
```

### 2.7 `agent:execute`

```typescript
describe("agent:execute", () => {
  it("有効なリクエストでエージェント実行を開始できる", async () => {
    // act: IPC_CHANNELS.AGENT_EXECUTE を invoke({ prompt: 'Hello', skillId: 'skill-1' })
    // assert: { success: true, executionId: string }
  });

  it("promptが空文字の場合はVALIDATION_ERRORを返す", async () => {
    // act: invoke({ prompt: '', skillId: 'skill-1' })
    // assert: { success: false }
  });
});
```

### 2.8 `agent:permission-respond`

```typescript
describe("agent:permission-respond", () => {
  it("有効なrequestIdとapproved=trueで承認できる", async () => {
    // act: IPC_CHANNELS.AGENT_PERMISSION_RESPOND を invoke({ requestId: 'req-1', approved: true })
    // assert: { success: true }
  });

  it("有効なrequestIdとapproved=falseで拒否できる", async () => {
    // assert: { success: true }（拒否処理自体は成功）
  });

  it("requestIdが省略されるとVALIDATION_ERRORを返す", async () => {
    // assert: { success: false }
  });
});
```

---

## 3. テスト実装上の注意

1. **モックの使用**: `ipcMain` は Electron モジュールのためモックが必要。既存の `__mocks__` ディレクトリ（`apps/desktop/src/main/ipc/__mocks__/`）の規約に従うこと
2. **any型禁止**: テストコードにおいても `any` 型は使用禁止。`unknown` を使用してから型ガードを行うこと
3. **本番環境ガード**: `auth:test-callback` のテストでは `process.env.NODE_ENV` の前後復元を忘れないこと（`afterEach` でリセット）
4. **テスト分離**: 各テストは独立して実行可能であること。共有状態があればテスト前後でリセットすること
