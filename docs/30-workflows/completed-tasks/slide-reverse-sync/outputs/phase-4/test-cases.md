# テストケース一覧 - index.html→structure.md 逆同期機能

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 機能名   | slide-reverse-sync               |
| タスクID | task-feat-slide-reverse-sync-001 |
| 作成日   | 2026-01-10                       |
| Phase    | 4                                |
| スキル   | boundary-value-analysis          |

---

## 1. FileWatcher テストケース

### FW-01: index.html監視追加

**目的**: FileWatcherがindex.htmlも監視対象に含めることを確認

**前提条件**:

- FileWatcherインスタンスが作成済み

**テストステップ**:

1. createSlideWatcher()でウォッチャーを作成
2. start()を呼び出し
3. chokidar.watch()の呼び出し引数を確認

**期待結果**:

- `[projectPath/structure.md, projectPath/index.html]`が監視対象に含まれる

**テストコード**:

```typescript
it("FW-01: should watch index.html in addition to structure.md", () => {
  const watcher = createSlideWatcher(testProjectPath);
  watcher.start();

  expect(chokidar.watch).toHaveBeenCalledWith(
    expect.arrayContaining([
      `${testProjectPath}/structure.md`,
      `${testProjectPath}/index.html`,
    ]),
    expect.any(Object),
  );
});
```

---

### FW-02: HTML変更コールバック呼び出し

**目的**: index.html変更時にonHtmlChangeコールバックが呼び出されることを確認

**前提条件**:

- FileWatcherインスタンスが起動済み
- onHtmlChangeにコールバックが登録済み

**テストステップ**:

1. onHtmlChange()でコールバックを登録
2. index.htmlのchange イベントを発火
3. コールバックの呼び出しを確認

**期待結果**:

- コールバックがindex.htmlのパスで呼び出される

**テストコード**:

```typescript
it("FW-02: should call onHtmlChange callback on html change", () => {
  const watcher = createSlideWatcher(testProjectPath);
  const callback = vi.fn();

  watcher.onHtmlChange(callback);
  watcher.start();

  mockWatchInstance.emit("change", `${testProjectPath}/index.html`);

  expect(callback).toHaveBeenCalledWith(`${testProjectPath}/index.html`);
});
```

---

### FW-03: html skill起因変更の無視

**目的**: html skill起因のindex.html変更が無視されることを確認

**前提条件**:

- FileWatcherインスタンスが起動済み
- markAsSkillChange()でhtml skillがマーク済み

**テストステップ**:

1. markAsSkillChange()でindex.htmlをhtml skillとしてマーク
2. index.htmlのchangeイベントを発火
3. onHtmlChangeコールバックが呼び出されないことを確認

**期待結果**:

- コールバックが呼び出されない

**テストコード**:

```typescript
it("FW-03: should ignore html skill-originated changes", () => {
  const watcher = createSlideWatcher(testProjectPath);
  const callback = vi.fn();

  watcher.onHtmlChange(callback);
  watcher.start();

  watcher.markAsSkillChange(`${testProjectPath}/index.html`, "html");
  mockWatchInstance.emit("change", `${testProjectPath}/index.html`);

  expect(callback).not.toHaveBeenCalled();
});
```

---

### FW-04: modifier skill起因変更の無視

**目的**: modifier skill起因のstructure.md変更が無視されることを確認

**前提条件**:

- FileWatcherインスタンスが起動済み
- markAsSkillChange()でmodifier skillがマーク済み

**テストステップ**:

1. markAsSkillChange()でstructure.mdをmodifier skillとしてマーク
2. structure.mdのchangeイベントを発火
3. onStructureChangeコールバックが呼び出されないことを確認

**期待結果**:

- コールバックが呼び出されない

**テストコード**:

```typescript
it("FW-04: should ignore modifier skill-originated changes", () => {
  const watcher = createSlideWatcher(testProjectPath);
  const callback = vi.fn();

  watcher.onStructureChange(callback);
  watcher.start();

  watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "modifier");
  mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

  expect(callback).not.toHaveBeenCalled();
});
```

---

### FW-05: TTL経過後のHTML変更処理

**目的**: TTL（1秒）経過後にHTML変更が処理されることを確認

**前提条件**:

- FileWatcherインスタンスが起動済み
- markAsSkillChange()でマーク済み

**テストステップ**:

1. markAsSkillChange()でindex.htmlをマーク
2. 1001ms経過させる（vi.advanceTimersByTime）
3. index.htmlのchangeイベントを発火
4. onHtmlChangeコールバックが呼び出されることを確認

**期待結果**:

- TTL経過後はコールバックが呼び出される

**テストコード**:

```typescript
it("FW-05: should process html changes after TTL", () => {
  const watcher = createSlideWatcher(testProjectPath);
  const callback = vi.fn();

  watcher.onHtmlChange(callback);
  watcher.start();

  watcher.markAsSkillChange(`${testProjectPath}/index.html`, "html");
  vi.advanceTimersByTime(1001);
  mockWatchInstance.emit("change", `${testProjectPath}/index.html`);

  expect(callback).toHaveBeenCalledWith(`${testProjectPath}/index.html`);
});
```

---

### FW-06: 双方向ループ防止

**目的**: 順方向→逆方向の連鎖が防止されることを確認

**前提条件**:

- FileWatcherインスタンスが起動済み
- 双方向のコールバックが登録済み

**テストステップ**:

1. structure.md変更 → html skill実行 → index.html更新
2. index.html更新がマーク済みなので逆同期が発火しないことを確認

**期待結果**:

- 連鎖的な同期が発生しない

**テストコード**:

```typescript
it("FW-06: should handle bidirectional loop prevention", () => {
  const watcher = createSlideWatcher(testProjectPath);
  const structureCallback = vi.fn();
  const htmlCallback = vi.fn();

  watcher.onStructureChange(structureCallback);
  watcher.onHtmlChange(htmlCallback);
  watcher.start();

  // 順方向同期をシミュレート
  mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);
  expect(structureCallback).toHaveBeenCalled();

  // html skill による index.html 更新をマーク
  watcher.markAsSkillChange(`${testProjectPath}/index.html`, "html");

  // index.html の変更イベント（スキル起因）
  mockWatchInstance.emit("change", `${testProjectPath}/index.html`);

  // htmlCallback は呼び出されない（スキル起因なので）
  expect(htmlCallback).not.toHaveBeenCalled();
});
```

---

## 2. SyncManager テストケース

### SM-01: reverseSync でmodifier skill実行

**目的**: reverseSync()がmodifier skillを実行することを確認

**前提条件**:

- SyncManagerインスタンスが作成済み
- モックのSkillExecutorが設定済み

**テストステップ**:

1. reverseSync()を呼び出し
2. SkillExecutor.execute()が'modifier'で呼び出されることを確認

**期待結果**:

- execute('modifier', projectPath)が呼び出される

**テストコード**:

```typescript
it("SM-01: should execute modifier skill on reverseSync", async () => {
  const mockExecutor = createMockExecutor();
  const manager = createSyncManager(mockExecutor);

  await manager.reverseSync(testProjectPath);

  expect(mockExecutor.execute).toHaveBeenCalledWith(
    "modifier",
    testProjectPath,
  );
});
```

---

### SM-02: 成功時の変更内容返却

**目的**: reverseSync成功時に変更内容が返却されることを確認

**前提条件**:

- SkillExecutorが成功レスポンスを返す設定

**テストステップ**:

1. モックで変更内容を含む成功レスポンスを設定
2. reverseSync()を呼び出し
3. 返却値を確認

**期待結果**:

- changes配列が返却される

**テストコード**:

```typescript
it("SM-02: should return structure changes on success", async () => {
  const mockExecutor = createMockExecutor();
  const expectedChanges = [
    { type: "modify", section: "slide-1", content: "updated", reason: "test" },
  ];
  (mockExecutor.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
    success: true,
    changes: expectedChanges,
  });

  const manager = createSyncManager(mockExecutor);
  const result = await manager.reverseSync(testProjectPath);

  expect(result.changes).toEqual(expectedChanges);
});
```

---

### SM-03: 失敗時のエラー処理

**目的**: reverseSync失敗時にエラーがスローされることを確認

**前提条件**:

- SkillExecutorが失敗レスポンスを返す設定

**テストステップ**:

1. モックで失敗レスポンスを設定
2. reverseSync()を呼び出し
3. エラーがスローされることを確認

**期待結果**:

- エラーがスローされる

**テストコード**:

```typescript
it("SM-03: should throw error on reverseSync failure", async () => {
  const mockExecutor = createMockExecutor();
  (mockExecutor.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
    success: false,
    error: "Modifier skill failed",
  });

  const manager = createSyncManager(mockExecutor);

  await expect(manager.reverseSync(testProjectPath)).rejects.toThrow(
    "Modifier skill failed",
  );
});
```

---

### SM-04: 同期方向の更新

**目的**: reverseSync時に同期方向が'reverse'に設定されることを確認

**前提条件**:

- SyncManagerインスタンスが作成済み

**テストステップ**:

1. reverseSync()を呼び出し
2. getStatus()で同期方向を確認

**期待結果**:

- direction が 'reverse' になる

**テストコード**:

```typescript
it("SM-04: should update sync direction on reverseSync", async () => {
  const mockExecutor = createMockExecutor();
  const manager = createSyncManager(mockExecutor);

  // 状態変更をキャプチャするためのスパイ
  const statusSpy = vi.spyOn(manager, "getStatus");

  await manager.reverseSync(testProjectPath);
  const status = await manager.getStatus(testProjectPath);

  expect(status.direction).toBe("reverse");
});
```

---

### SM-05: キャンセル処理

**目的**: 逆同期中のキャンセルが正常に動作することを確認

**前提条件**:

- 逆同期が実行中

**テストステップ**:

1. reverseSync()を開始（await しない）
2. cancel()を呼び出し
3. SkillExecutor.cancel()が呼び出されることを確認

**期待結果**:

- キャンセルが伝播される

**テストコード**:

```typescript
it("SM-05: should handle cancel during reverseSync", async () => {
  const mockExecutor = createMockExecutor();
  // 遅延を持たせる
  (mockExecutor.execute as ReturnType<typeof vi.fn>).mockImplementation(
    () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 5000),
      ),
  );

  const manager = createSyncManager(mockExecutor);

  const syncPromise = manager.reverseSync(testProjectPath);
  manager.cancel();

  expect(mockExecutor.cancel).toHaveBeenCalled();
});
```

---

### SM-06: 進捗通知

**目的**: 逆同期中に進捗が通知されることを確認

**前提条件**:

- 進捗コールバックが登録済み

**テストステップ**:

1. onProgress()でコールバックを登録
2. reverseSync()を実行
3. 進捗コールバックが呼び出されることを確認

**期待結果**:

- 進捗値（0-100）が通知される

**テストコード**:

```typescript
it("SM-06: should emit progress during reverseSync", async () => {
  const mockExecutor = createMockExecutor();
  const progressCallback = vi.fn();

  const manager = createSyncManager(mockExecutor);
  manager.onProgress(progressCallback);

  await manager.reverseSync(testProjectPath);

  expect(mockExecutor.onProgress).toHaveBeenCalledWith(progressCallback);
});
```

---

## 3. ModifierSkill テストケース

### MS-01: プロンプト構築

**目的**: 正しいプロンプトが構築されることを確認

**前提条件**:

- コンテキスト（previousHtml, currentHtml, currentStructure）が設定済み

**テストステップ**:

1. buildModifierPrompt()を呼び出し
2. 返却されるプロンプト文字列を確認

**期待結果**:

- 変更前HTML、変更後HTML、現在のstructure.mdが含まれる

**テストコード**:

```typescript
it("MS-01: should build correct prompt from context", () => {
  const context = {
    previousHtml: "<html>old</html>",
    currentHtml: "<html>new</html>",
    currentStructure: "# Structure",
  };

  const prompt = buildModifierPrompt(context);

  expect(prompt).toContain("## 変更前のindex.html");
  expect(prompt).toContain("<html>old</html>");
  expect(prompt).toContain("## 変更後のindex.html");
  expect(prompt).toContain("<html>new</html>");
  expect(prompt).toContain("## 現在のstructure.md");
  expect(prompt).toContain("# Structure");
});
```

---

### MS-02: JSONレスポンスのパース

**目的**: 有効なJSONレスポンスが正しくパースされることを確認

**前提条件**:

- 有効なJSONレスポンス文字列

**テストステップ**:

1. parseModifierResponse()を呼び出し
2. パース結果を確認

**期待結果**:

- success, changes, updatedStructure が正しくパースされる

**テストコード**:

```typescript
it("MS-02: should parse valid JSON response", () => {
  const rawResponse = JSON.stringify({
    success: true,
    changes: [
      { type: "add", section: "slide-1", content: "new", reason: "added" },
    ],
    updatedStructure: "# Updated",
  });

  const result = parseModifierResponse(rawResponse);

  expect(result.success).toBe(true);
  expect(result.changes).toHaveLength(1);
  expect(result.updatedStructure).toBe("# Updated");
});
```

---

### MS-03: マークダウンブロックからのJSON抽出

**目的**: マークダウンコードブロック内のJSONが正しく抽出されることを確認

**前提条件**:

- マークダウンコードブロックで囲まれたJSON

**テストステップ**:

1. parseModifierResponse()を呼び出し
2. JSON部分が抽出・パースされることを確認

**期待結果**:

- コードブロック内のJSONがパースされる

**テストコード**:

```typescript
it("MS-03: should extract JSON from markdown block", () => {
  const rawResponse = `
Here is the analysis result:
\`\`\`json
{"success": true, "changes": [], "updatedStructure": "# Test"}
\`\`\`
`;

  const result = parseModifierResponse(rawResponse);

  expect(result.success).toBe(true);
  expect(result.updatedStructure).toBe("# Test");
});
```

---

### MS-04: 不正レスポンスのエラー処理

**目的**: 不正なJSONレスポンスでエラーが返されることを確認

**前提条件**:

- 不正なJSON文字列

**テストステップ**:

1. 不正なJSONでparseModifierResponse()を呼び出し
2. エラーレスポンスが返されることを確認

**期待結果**:

- success: false, error メッセージが返される

**テストコード**:

```typescript
it("MS-04: should return error on invalid response", () => {
  const rawResponse = "not valid json {{{";

  const result = parseModifierResponse(rawResponse);

  expect(result.success).toBe(false);
  expect(result.error).toContain("パースに失敗");
});
```

---

### MS-05: 変更形式のバリデーション

**目的**: 変更オブジェクトの形式が正しく検証されることを確認

**前提条件**:

- 不完全なchangesオブジェクト

**テストステップ**:

1. 必須フィールドが欠けた変更でバリデーション
2. バリデーションエラーを確認

**期待結果**:

- バリデーションエラーが検出される

**テストコード**:

```typescript
it("MS-05: should validate structure changes format", () => {
  const invalidChange = {
    type: "invalid_type", // 不正な type
    // section が欠落
    content: "test",
  };

  expect(() => validateStructureChange(invalidChange)).toThrow();
});
```

---

### MS-06: 空の変更配列処理

**目的**: 空のchanges配列が正しく処理されることを確認

**前提条件**:

- 空のchanges配列を含むレスポンス

**テストステップ**:

1. 空のchanges配列でparseModifierResponse()を呼び出し
2. 成功として処理されることを確認

**期待結果**:

- 変更なしとして正常に処理される

**テストコード**:

```typescript
it("MS-06: should handle empty changes array", () => {
  const rawResponse = JSON.stringify({
    success: true,
    changes: [],
    updatedStructure: "# Unchanged",
  });

  const result = parseModifierResponse(rawResponse);

  expect(result.success).toBe(true);
  expect(result.changes).toHaveLength(0);
});
```

---

## 4. 境界値テストケース

### BV-01〜BV-04: ファイルサイズ境界

**テストコード**:

```typescript
describe("file size boundaries", () => {
  it("BV-01: should accept html at size limit (10MB)", async () => {
    const tenMB = "x".repeat(10 * 1024 * 1024);
    vi.mocked(fs.readFile).mockResolvedValue(tenMB);

    await expect(validateFileSize(htmlPath)).resolves.not.toThrow();
  });

  it("BV-02: should reject html over size limit", async () => {
    const overLimit = "x".repeat(10 * 1024 * 1024 + 1);
    vi.mocked(fs.readFile).mockResolvedValue(overLimit);

    await expect(validateFileSize(htmlPath)).rejects.toThrow(
      "File size exceeds limit",
    );
  });

  it("BV-03: should accept structure.md at limit (1MB)", async () => {
    const oneMB = "x".repeat(1 * 1024 * 1024);
    vi.mocked(fs.readFile).mockResolvedValue(oneMB);

    await expect(validateFileSize(structurePath)).resolves.not.toThrow();
  });

  it("BV-04: should reject structure.md over limit", async () => {
    const overLimit = "x".repeat(1 * 1024 * 1024 + 1);
    vi.mocked(fs.readFile).mockResolvedValue(overLimit);

    await expect(validateFileSize(structurePath)).rejects.toThrow(
      "File size exceeds limit",
    );
  });
});
```

### BV-05〜BV-06: タイムアウト境界

**テストコード**:

```typescript
describe("timeout boundaries", () => {
  it("BV-05: should complete just before timeout", async () => {
    vi.mocked(agentAPI.query).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve("result"), 29999)),
    );

    await expect(executeModifierSkill(context)).resolves.toBeDefined();
  });

  it("BV-06: should timeout at 30 seconds", async () => {
    vi.mocked(agentAPI.query).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve("result"), 30001)),
    );

    await expect(executeModifierSkill(context)).rejects.toThrow("Timeout");
  });
});
```

### BV-07〜BV-08: TTL境界

**テストコード**:

```typescript
describe("TTL boundaries", () => {
  it("BV-07: should ignore change at 999ms", () => {
    watcher.markAsSkillChange(path, "html");
    vi.advanceTimersByTime(999);
    mockWatchInstance.emit("change", path);

    expect(callback).not.toHaveBeenCalled();
  });

  it("BV-08: should process change at 1001ms", () => {
    watcher.markAsSkillChange(path, "html");
    vi.advanceTimersByTime(1001);
    mockWatchInstance.emit("change", path);

    expect(callback).toHaveBeenCalled();
  });
});
```

---

## 5. 関連ドキュメント

| ドキュメント     | パス                                         |
| ---------------- | -------------------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`      |
| 統合テスト設計書 | `outputs/phase-4/integration-test-design.md` |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     |
