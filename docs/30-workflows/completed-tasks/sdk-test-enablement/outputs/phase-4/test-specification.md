# Phase 4: テストケース仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| Phase      | 4                                 |
| ステータス | 完了                              |
| 実行日     | 2026-02-13                        |

## テストケース仕様（17箇所）

### カテゴリA: 引数検証（3箇所）

#### SDK-SE-01: スキル名マッピング検証（skill-executor.test.ts）

- **テストID**: SDK-SE-01
- **ファイル**: skill-executor.test.ts L403-427
- **現状**: `mockAgentAPI.query` の `toHaveBeenCalledWith` がコメントアウト状態
- **有効化方法**: コメントアウトはされていない。既にアサーションが存在する。ただし `expect(result.output).toContain(expectedSkillName)` は現在のシミュレーション実装に依存していた。SDK統合後の実装では `mockAgentAPI.query` が実際に呼ばれるため、以下のアサーションが通る：
  ```typescript
  expect(mockAgentAPI.query).toHaveBeenCalledWith(
    expect.objectContaining({
      prompt: expect.any(String),
      options: expect.objectContaining({
        systemPrompt: expect.any(String),
        timeout: 30000,
      }),
    }),
  );
  ```
- **注意**: このテストは既にアサーションが含まれており、SDK統合済みの実装でPASSする可能性が高い。確認が必要。

#### SDK-SE-02: projectPath コンテキスト検証（skill-executor.test.ts）

- **テストID**: SDK-SE-02
- **ファイル**: skill-executor.test.ts L431-457
- **現状**: `mockAgentAPI.query` の `toHaveBeenCalledWith` でprojectPath検証がコメント状態
- **有効化方法**: 既にアサーションが書かれているが、SDK統合前は「SDK統合後は以下を有効化」のコメントがあった。現在のSDK統合済み実装では `prompt` に projectPath が含まれるため通る。

#### SDK-INT-01: SDKパラメータ検証（sdk-integration.test.ts）

- **テストID**: SDK-INT-01
- **ファイル**: sdk-integration.test.ts L444-453
- **現状**: `// TODO: SDK統合後、パラメータが正しく渡されることを検証` のTODOコメント付きで `expect(result.success).toBe(true)` のみ
- **有効化方法**: mockCreateの引数を検証するアサーション追加
  ```typescript
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: "user",
          content: expect.stringContaining(projectPath),
        }),
      ]),
    }),
    expect.objectContaining({
      signal: expect.any(AbortSignal),
    }),
  );
  ```

### カテゴリB: タイムアウト検証（1箇所）

#### SDK-SE-05: 30秒タイムアウトテスト（skill-executor.test.ts）

- **テストID**: SDK-SE-05
- **ファイル**: skill-executor.test.ts L489-505
- **現状**: 既にSDK統合用のタイムアウトテストコードが書かれている。`mockAgentAPI.query.mockImplementation(() => new Promise(() => {}))` で応答しないモックを設定し、`vi.advanceTimersByTimeAsync(30000)` で30秒経過させる実装が存在。
- **有効化方法**: このテストは既にSDK統合済みのアサーションが含まれている。実装コードがタイムアウトを正しくハンドルしていればPASSする。確認が必要。

### カテゴリC: エラーハンドリング（10箇所）

#### SDK-SE-13: API key not found（skill-executor.test.ts）

- **テストID**: SDK-SE-13
- **ファイル**: skill-executor.test.ts L625-638
- **現状**: 既に `mockAgentAPI.query.mockRejectedValue(new Error("API key not configured"))` が設定済み。アサーションも `expect(result.success).toBe(false); expect(result.error).toBe("API key not configured")` と書かれている。
- **確認**: このテストは既に有効化済みの可能性。実行して確認。

#### SDK-SE-14: SDK呼び出し失敗（skill-executor.test.ts）

- **テストID**: SDK-SE-14
- **ファイル**: skill-executor.test.ts L641-652
- **現状**: `// TODO: SDK統合後に実装` コメントあり。`expect(result.success).toBe(true)` で成功を期待しているダミーテスト。
- **有効化方法**:
  ```typescript
  // TODOコメント除去
  mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));
  const executor = createSkillExecutor();
  const resultPromise = executor.execute("html", testProjectPath);
  await vi.advanceTimersByTimeAsync(1000);
  const result = await resultPromise;
  expect(result.success).toBe(false);
  expect(result.error).toBe("SDK call failed");
  ```

#### AC-06: APIエラーシミュレーション（agent-client.test.ts）

- **テストID**: AC-06
- **ファイル**: agent-client.test.ts L199-212
- **現状**: `// TODO: SDK統合後、実際のAPIエラーをシミュレートする` コメントあり。成功を返すだけ。
- **有効化方法**:
  ```typescript
  mockCreate.mockRejectedValueOnce(new Error("API request failed"));
  const queryPromise = agentAPI.query({...});
  await expect(queryPromise).rejects.toThrow("API request failed");
  ```

#### SDK-AC-01: safeStorage APIキー取得（agent-client.test.ts）

- **テストID**: SDK-AC-01
- **ファイル**: agent-client.test.ts L524-536
- **現状**: TODOコメントあり。`expect(response).toBeDefined()` のみ。
- **有効化方法**: mockCreateの呼び出し確認（APIキー取得はクエリ実行時に内部で行われるため、mockCreateが呼ばれること自体がAPIキー取得成功の証拠）
  ```typescript
  // TODOコメント除去
  // safeStorageからAPIキーが取得され、SDK呼び出しが行われることを検証
  expect(mockCreate).toHaveBeenCalled();
  ```

#### SDK-AC-02: 環境変数フォールバック（agent-client.test.ts）

- **テストID**: SDK-AC-02
- **ファイル**: agent-client.test.ts L538-550
- **有効化方法**: safeStorage.isEncryptionAvailableをfalseにし、環境変数で呼び出しが成功することを検証
  ```typescript
  // TODOコメント除去
  // safeStorageが使えない状態を作り、環境変数フォールバックを検証
  const { safeStorage } = await import("electron");
  vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);
  // 環境変数ANTHROPIC_API_KEYは beforeEach で設定済み
  expect(mockCreate).toHaveBeenCalled();
  expect(response).toBeDefined();
  ```

#### SDK-AC-03: APIキー未検出エラー（agent-client.test.ts）

- **テストID**: SDK-AC-03
- **ファイル**: agent-client.test.ts L552-565
- **有効化方法**: 環境変数を削除し、APIキー未検出エラーを発生させる
  ```typescript
  delete process.env.ANTHROPIC_API_KEY;
  resetAgentAPI();
  const newAPI = getAgentAPI();
  await expect(newAPI.query({...})).rejects.toThrow("API key not configured");
  ```

#### SDK-AC-04: モデル名検証（agent-client.test.ts）

- **テストID**: SDK-AC-04
- **ファイル**: agent-client.test.ts L569-581
- **有効化方法**:
  ```typescript
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ model: "claude-sonnet-4-20250514" }),
    expect.anything(),
  );
  ```

#### SDK-AC-05: max_tokens設定検証（agent-client.test.ts）

- **テストID**: SDK-AC-05
- **ファイル**: agent-client.test.ts L583-595
- **有効化方法**:
  ```typescript
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ max_tokens: 8192 }),
    expect.anything(),
  );
  ```

#### SDK-AC-06: systemPrompt渡し検証（agent-client.test.ts）

- **テストID**: SDK-AC-06
- **ファイル**: agent-client.test.ts L597-612
- **有効化方法**:
  ```typescript
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ system: "You are a slide designer." }),
    expect.anything(),
  );
  ```

#### SDK-AC-09: 401 Unauthorizedハンドリング（agent-client.test.ts）

- **テストID**: SDK-AC-09
- **ファイル**: agent-client.test.ts L642-654
- **有効化方法**:
  ```typescript
  const authError = new Error("Unauthorized");
  (authError as any).status = 401;
  mockCreate.mockRejectedValueOnce(authError);
  await expect(agentAPI.query({...})).rejects.toThrow("Unauthorized");
  ```
  注: anyを避けるため、Object.assignを使用
  ```typescript
  const authError = Object.assign(new Error("Unauthorized"), { status: 401 });
  ```

#### SDK-AC-10: 500 Internal Server Errorハンドリング（agent-client.test.ts）

- **テストID**: SDK-AC-10
- **ファイル**: agent-client.test.ts L656-668
- **有効化方法**:
  ```typescript
  const serverError = Object.assign(new Error("Internal Server Error"), { status: 500 });
  mockCreate.mockRejectedValueOnce(serverError);
  await expect(agentAPI.query({...})).rejects.toThrow("Internal Server Error");
  ```

#### INT-02: 無効APIキーエラー（sdk-integration.test.ts）

- **テストID**: INT-02
- **ファイル**: sdk-integration.test.ts L136-152
- **現状**: TODOコメント + コメントアウトされた期待値
- **有効化方法**:
  ```typescript
  mockCreate.mockRejectedValueOnce(new Error("Invalid API key"));
  // 実行
  expect(result.success).toBe(false);
  expect(result.error).toContain("Invalid API key");
  ```

#### INT-05: SDK障害時エラーメッセージ（sdk-integration.test.ts）

- **テストID**: INT-05
- **ファイル**: sdk-integration.test.ts L196-209
- **現状**: TODOコメントあり。キャンセルでエラーシミュレートしている
- **有効化方法**: mockCreateでSDKエラーをシミュレート
  ```typescript
  mockCreate.mockRejectedValueOnce(new Error("SDK service unavailable"));
  const resultPromise = executor.execute("html", projectPath);
  await vi.advanceTimersByTimeAsync(1000);
  const result = await resultPromise;
  expect(result.success).toBe(false);
  expect(result.error).toBe("SDK service unavailable");
  ```

## 完了条件チェック

- [x] 17箇所全てのテストケース仕様が詳細化されている
- [x] 各テストの現状・有効化方法・期待値が明確
- [x] モック戦略（mockCreate / mockAgentAPI.query）が統一されている
- [x] P9/P13対策が各テストケースに反映されている
