# 受け入れ基準: SkillService.executeSkill() の SkillExecutor 委譲

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase    | 1                                     |
| 作成日   | 2026-02-11                            |

---

## 1. 機能要件の受け入れ基準

### AC-001: スキル実行委譲

| ID       | 基準                                                                     | 検証方法       |
| -------- | ------------------------------------------------------------------------ | -------------- |
| AC-001-1 | `skill:execute` ハンドラーが `SkillExecutor.execute()` を直接呼び出す    | ユニットテスト |
| AC-001-2 | `SkillService.executeSkill()` のスタブ呼び出しがハンドラーから削除される | コードレビュー |
| AC-001-3 | `SkillService.executeSkill()` に `@deprecated` コメントが追加される      | コードレビュー |

#### テストケース (AC-001-1)

```typescript
describe("skill:execute handler", () => {
  it("should call SkillExecutor.execute() with correct parameters", async () => {
    const mockExecute = vi.fn().mockResolvedValue({
      executionId: "exec-123",
      success: true,
    });
    mockSkillExecutor.execute = mockExecute;

    await invokeHandler("skill:execute", {
      skillId: "skill-1",
      params: { prompt: "test" },
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "test", skillId: "skill-1" }),
      expect.objectContaining({ id: "skill-1" }),
    );
  });
});
```

---

### AC-002: ストリーミング応答の配信

| ID       | 基準                                                       | 検証方法       |
| -------- | ---------------------------------------------------------- | -------------- |
| AC-002-1 | `SKILL_CHANNELS.SKILL_STREAM` 経由でメッセージが配信される | 統合テスト     |
| AC-002-2 | `text` タイプのメッセージが正しく送信される                | ユニットテスト |
| AC-002-3 | `tool_use` タイプのメッセージが正しく送信される            | ユニットテスト |
| AC-002-4 | `error` タイプのメッセージがエラー時に送信される           | ユニットテスト |
| AC-002-5 | `complete` タイプのメッセージが完了時に送信される          | ユニットテスト |
| AC-002-6 | `retry` タイプのメッセージがリトライ時に送信される         | ユニットテスト |

#### テストケース (AC-002-1)

```typescript
describe("streaming", () => {
  it("should send messages via SKILL_STREAM channel", async () => {
    const sendSpy = vi.spyOn(mainWindow.webContents, "send");

    await executeSkill(request, skill);

    expect(sendSpy).toHaveBeenCalledWith(
      SKILL_CHANNELS.SKILL_STREAM,
      expect.objectContaining({ type: "text" }),
    );
  });
});
```

---

### AC-003: 実行パラメータの引き継ぎ

| ID       | 基準                                                           | 検証方法       |
| -------- | -------------------------------------------------------------- | -------------- |
| AC-003-1 | `params.prompt` が `SkillExecutionRequest.prompt` に変換される | ユニットテスト |
| AC-003-2 | `params.message` が `prompt` として使用される（互換性）        | ユニットテスト |
| AC-003-3 | `params.timeout` が正しく渡される                              | ユニットテスト |
| AC-003-4 | `params` が `undefined` の場合、空文字列のpromptが使用される   | ユニットテスト |

#### テストケース (AC-003-1, AC-003-2)

```typescript
describe("extractPromptFromParams", () => {
  it("should extract prompt from params.prompt", () => {
    expect(extractPromptFromParams({ prompt: "hello" })).toBe("hello");
  });

  it("should fallback to params.message", () => {
    expect(extractPromptFromParams({ message: "world" })).toBe("world");
  });

  it("should prefer prompt over message", () => {
    expect(extractPromptFromParams({ prompt: "a", message: "b" })).toBe("a");
  });

  it("should return empty string for undefined params", () => {
    expect(extractPromptFromParams(undefined)).toBe("");
  });
});
```

---

### AC-004: 中断機能の連携

| ID       | 基準                                                | 検証方法       |
| -------- | --------------------------------------------------- | -------------- |
| AC-004-1 | 実行中のスキルが `abort()` で中断できる             | 統合テスト     |
| AC-004-2 | 中断時に `ABORTED` ステータスがRendererに通知される | ユニットテスト |
| AC-004-3 | 中断後は新しいストリームメッセージが送信されない    | ユニットテスト |

#### テストケース (AC-004-1)

```typescript
describe("abort", () => {
  it("should abort running execution", async () => {
    const execution = executor.execute(request, skill);

    // 実行開始を待機
    await new Promise((r) => setTimeout(r, 100));

    const aborted = executor.abort(executionId);

    expect(aborted).toBe(true);
    const result = await execution;
    expect(result.error?.code).toBe("ABORTED");
  });
});
```

---

### AC-005: 実行状態の取得

| ID       | 基準                                             | 検証方法       |
| -------- | ------------------------------------------------ | -------------- |
| AC-005-1 | 実行中の状態（`running`）が正しく取得できる      | ユニットテスト |
| AC-005-2 | 完了後の状態（`completed`）が正しく取得できる    | ユニットテスト |
| AC-005-3 | エラー後の状態（`error`）が正しく取得できる      | ユニットテスト |
| AC-005-4 | 存在しないexecutionIdの場合は `undefined` が返る | ユニットテスト |

---

## 2. 非機能要件の受け入れ基準

### AC-N001: セキュリティ

| ID        | 基準                                               | 検証方法       |
| --------- | -------------------------------------------------- | -------------- |
| AC-N001-1 | `validateIpcSender()` による送信元検証が維持される | コードレビュー |
| AC-N001-2 | `safeInvoke/safeOn` パターンが維持される           | コードレビュー |
| AC-N001-3 | `IPC_CHANNELS` ホワイトリストが維持される          | コードレビュー |
| AC-N001-4 | ハードコード文字列でチャンネル名を指定していない   | grepで検証     |

#### 検証コマンド (AC-N001-4)

```bash
# IPC_CHANNELSを使用せずにハードコードされたチャンネル名がないか確認
grep -rn "'skill:" apps/desktop/src/main/ipc/skillHandlers.ts | grep -v IPC_CHANNELS | grep -v "//.*skill:"
```

---

### AC-N002: エラーハンドリング

| ID        | 基準                                                            | 検証方法       |
| --------- | --------------------------------------------------------------- | -------------- |
| AC-N002-1 | 認証エラー時に `AUTHENTICATION_ERROR` が返される                | ユニットテスト |
| AC-N002-2 | スキル未発見時に `SKILL_NOT_FOUND` が返される                   | ユニットテスト |
| AC-N002-3 | SkillExecutor未初期化時に `EXECUTOR_NOT_INITIALIZED` が返される | ユニットテスト |
| AC-N002-4 | エラー詳細が内部情報を漏洩しない（サニタイズ済み）              | コードレビュー |
| AC-N002-5 | APIキーがログに出力されない                                     | コードレビュー |

#### テストケース (AC-N002-1, AC-N002-2)

```typescript
describe("error handling", () => {
  it("should return SKILL_NOT_FOUND when skill does not exist", async () => {
    mockSkillService.getSkillById.mockResolvedValue(null);

    const result = await invokeHandler("skill:execute", { skillId: "unknown" });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("SKILL_NOT_FOUND");
  });

  it("should return AUTHENTICATION_ERROR when API key is missing", async () => {
    mockAuthKeyService.getKey.mockResolvedValue(null);
    delete process.env.ANTHROPIC_API_KEY;

    const result = await invokeHandler("skill:execute", { skillId: "skill-1" });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("AUTHENTICATION_ERROR");
  });
});
```

---

### AC-N003: 後方互換性

| ID        | 基準                                                  | 検証方法       |
| --------- | ----------------------------------------------------- | -------------- |
| AC-N003-1 | `skill:execute` のレスポンス形式が維持される          | 統合テスト     |
| AC-N003-2 | 既存の `useSkillExecution` フックが変更なしで動作する | E2Eテスト      |
| AC-N003-3 | Renderer側コードの変更が不要                          | コードレビュー |

#### レスポンス形式検証 (AC-N003-1)

```typescript
// 成功時
{
  success: true,
  data: {
    executionId: string;
  }
}

// 失敗時
{
  success: false,
  error: string;
  errorCode?: string;
}
```

---

### AC-N004: パフォーマンス

| ID        | 基準                               | 検証方法   |
| --------- | ---------------------------------- | ---------- |
| AC-N004-1 | 委譲による追加レイテンシが50ms以下 | 計測テスト |

---

## 3. 境界値テスト

| ID    | テストケース                                   | 期待結果                         |
| ----- | ---------------------------------------------- | -------------------------------- |
| BV-01 | `skillId` が空文字の場合                       | バリデーションエラー             |
| BV-02 | `skillId` が null/undefined の場合             | バリデーションエラー             |
| BV-03 | `params` が undefined の場合                   | 空文字列のpromptで正常実行       |
| BV-04 | `params.prompt` と `params.message` 両方がある | `prompt` が優先される            |
| BV-05 | 同時実行数が上限（5）に達した場合              | `MAX_CONCURRENT_EXCEEDED` エラー |

---

## 4. 異常系テスト

| ID    | テストケース                              | 期待結果                          |
| ----- | ----------------------------------------- | --------------------------------- |
| EX-01 | スキルが存在しない                        | `SKILL_NOT_FOUND` エラー          |
| EX-02 | SkillExecutorが未初期化                   | `EXECUTOR_NOT_INITIALIZED` エラー |
| EX-03 | APIキーが未設定                           | `AUTHENTICATION_ERROR` エラー     |
| EX-04 | SDK実行中にネットワークエラー             | リトライ後、`EXECUTION_FAILED`    |
| EX-05 | SDK実行中にタイムアウト                   | `TIMEOUT` エラー                  |
| EX-06 | ユーザーによる中断                        | `ABORTED` エラー                  |
| EX-07 | BrowserWindowが破棄された状態でストリーム | 安全にスキップ                    |

---

## 5. 統合テストシナリオ

### IT-01: 正常系 E2E フロー

```gherkin
Feature: スキル実行
  Scenario: スキルの正常実行
    Given 有効なスキル "test-skill" がインポートされている
    And 有効なAPIキーが設定されている
    When Rendererから skill:execute を呼び出す
    Then SkillExecutor.execute() が呼び出される
    And ストリーミングメッセージが SKILL_STREAM 経由で配信される
    And 完了メッセージ (type: 'complete') が送信される
    And success: true のレスポンスが返る
```

### IT-02: 中断フロー

```gherkin
Feature: スキル実行中断
  Scenario: 実行中のスキルを中断
    Given スキル "test-skill" が実行中
    When Rendererから skill:abort を呼び出す
    Then 実行が中断される
    And error メッセージ (content: 'Execution aborted') が送信される
    And 実行状態が 'aborted' になる
```

---

## 6. カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 対象ファイル

- `apps/desktop/src/main/ipc/skillHandlers.ts` (skill:execute ハンドラー部分)
- 新規追加関数 (`extractPromptFromParams`, `convertToSkillMetadata`)
