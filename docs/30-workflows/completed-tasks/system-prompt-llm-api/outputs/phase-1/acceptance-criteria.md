# 受け入れ基準書 - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 1                           |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

## 機能要件 受け入れ基準

### AC-FR-001: システムプロンプト付きメッセージのLLM API送信

| AC ID        | 条件                                                                | 検証方法   |
| ------------ | ------------------------------------------------------------------- | ---------- |
| AC-FR-001-01 | systemPromptが指定された場合、LLM APIにsystemロールとして送信される | 単体テスト |
| AC-FR-001-02 | systemPromptが未指定の場合、userメッセージのみ送信される            | 単体テスト |
| AC-FR-001-03 | LLMからの応答がAIChatResponse.data.messageに格納される              | 単体テスト |
| AC-FR-001-04 | conversationIdが応答に含まれる                                      | 単体テスト |

**テストシナリオ**:

```gherkin
Scenario: システムプロンプト付きでチャット送信
  Given ユーザーがシステムプロンプトを設定している
  And ユーザーがメッセージを入力する
  When AI_CHATチャンネルにリクエストを送信する
  Then LLM APIが呼び出される
  And systemロールのメッセージが最初に送信される
  And userロールのメッセージが次に送信される
  And AIの応答が正常に返される
```

### AC-FR-002: LLMアダプターとの連携

| AC ID        | 条件                                                               | 検証方法   |
| ------------ | ------------------------------------------------------------------ | ---------- |
| AC-FR-002-01 | LLMAdapterFactory.getAdapter()が正しいプロバイダーIDで呼び出される | 単体テスト |
| AC-FR-002-02 | adapter.sendChat()がLLMChatRequestInputで呼び出される              | 単体テスト |
| AC-FR-002-03 | AdapterChatResponseがAIChatResponseに正しく変換される              | 単体テスト |

**テストシナリオ**:

```gherkin
Scenario: OpenAIアダプターでチャット送信
  Given OpenAIがLLMプロバイダーとして選択されている
  And APIキーが設定されている
  When AI_CHATリクエストを送信する
  Then OpenAIAdapterのsendChatが呼び出される
  And レスポンスが正常に変換される
```

### AC-FR-003: プロバイダー/モデル選択

| AC ID        | 条件                                                   | 検証方法   |
| ------------ | ------------------------------------------------------ | ---------- |
| AC-FR-003-01 | 現在選択されているプロバイダーのアダプターが使用される | 単体テスト |
| AC-FR-003-02 | 現在選択されているモデルIDがリクエストに含まれる       | 単体テスト |
| AC-FR-003-03 | 4つのプロバイダー全てでAPI呼び出しが正常に動作する     | 統合テスト |

**テストシナリオ（各プロバイダー）**:

```gherkin
Scenario Outline: <provider>でチャット送信
  Given <provider>がLLMプロバイダーとして選択されている
  And APIキーが設定されている
  When AI_CHATリクエストを送信する
  Then <provider>のAPIが呼び出される
  And 正常なレスポンスが返される

  Examples:
    | provider  |
    | OpenAI    |
    | Anthropic |
    | Google    |
    | xAI       |
```

### AC-FR-004: エラーハンドリング

| AC ID        | 条件                                                               | 検証方法   |
| ------------ | ------------------------------------------------------------------ | ---------- |
| AC-FR-004-01 | APIキー未設定時、success=falseとエラーメッセージが返る             | 単体テスト |
| AC-FR-004-02 | APIキー無効時、適切なエラーコードと設定誘導メッセージが返る        | 単体テスト |
| AC-FR-004-03 | ネットワークエラー時、リトライ可能であることを示すレスポンスが返る | 単体テスト |
| AC-FR-004-04 | レート制限時、待機時間の情報が含まれる                             | 単体テスト |
| AC-FR-004-05 | 例外発生時、システムがクラッシュせずエラーレスポンスが返る         | 単体テスト |

**テストシナリオ**:

```gherkin
Scenario: APIキー未設定でチャット送信
  Given プロバイダーが選択されている
  And APIキーが設定されていない
  When AI_CHATリクエストを送信する
  Then success=falseのレスポンスが返る
  And errorにAPIキー未設定のメッセージが含まれる

Scenario: レート制限エラー
  Given APIが429 Too Many Requestsを返す
  When AI_CHATリクエストを送信する
  Then success=falseのレスポンスが返る
  And errorにレート制限のメッセージが含まれる
```

---

## 非機能要件 受け入れ基準

### AC-NFR-001: レスポンス時間

| AC ID         | 条件                                          | 検証方法   |
| ------------- | --------------------------------------------- | ---------- |
| AC-NFR-001-01 | ネットワーク正常時、2秒以内に最初の応答が返る | 手動テスト |

**測定方法**:

```typescript
const startTime = performance.now();
const response = await ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT, request);
const endTime = performance.now();
console.log(`Response time: ${endTime - startTime}ms`);
```

### AC-NFR-002: テストカバレッジ

| AC ID         | 条件                    | 検証方法 |
| ------------- | ----------------------- | -------- |
| AC-NFR-002-01 | Line Coverage ≥ 80%     | CI/CD    |
| AC-NFR-002-02 | Branch Coverage ≥ 60%   | CI/CD    |
| AC-NFR-002-03 | Function Coverage ≥ 80% | CI/CD    |

**測定コマンド**:

```bash
pnpm --filter @repo/desktop test:coverage
```

### AC-NFR-003: 型安全性

| AC ID         | 条件                           | 検証方法 |
| ------------- | ------------------------------ | -------- |
| AC-NFR-003-01 | TypeScriptコンパイルエラー 0件 | CI/CD    |

**検証コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
```

### AC-NFR-004: コード品質

| AC ID         | 条件              | 検証方法 |
| ------------- | ----------------- | -------- |
| AC-NFR-004-01 | ESLintエラー 0件  | CI/CD    |
| AC-NFR-004-02 | ESLint警告 最小化 | CI/CD    |

**検証コマンド**:

```bash
pnpm --filter @repo/desktop lint
```

---

## 統合テスト 受け入れ基準

### AC-INT-001: IPC通信

| AC ID         | 条件                                                      | 検証方法   |
| ------------- | --------------------------------------------------------- | ---------- |
| AC-INT-001-01 | Renderer → Main → LLM API → Main → Rendererのフローが動作 | 統合テスト |
| AC-INT-001-02 | IPC_CHANNELS.AI_CHATが正常に処理される                    | 統合テスト |

### AC-INT-002: プロバイダー間切り替え

| AC ID         | 条件                                                        | 検証方法   |
| ------------- | ----------------------------------------------------------- | ---------- |
| AC-INT-002-01 | プロバイダー切り替え後、新しいプロバイダーのAPIが使用される | 手動テスト |
| AC-INT-002-02 | 切り替え時にエラーが発生しない                              | 手動テスト |

---

## テスト計画サマリ

| テスト種別 | テスト数目安 | 対象                          |
| ---------- | ------------ | ----------------------------- |
| 単体テスト | 15-20件      | aiHandlers.ts、メッセージ構築 |
| 統合テスト | 5-8件        | IPC通信、アダプター連携       |
| 手動テスト | 8件          | 各プロバイダーでの実動作確認  |

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
