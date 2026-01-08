# テストケース一覧 - ConversionLogger サービス

## 文書情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | CONV-05-01      |
| 機能名   | logging-service |
| Phase    | 4               |
| 作成日   | 2026-01-07      |
| 作成者   | Claude Code     |

---

## 1. ユニットテスト

### 1.1 INFOログ記録（AC-001）

#### TC-001: info()メソッドでINFOログを記録できる

```gherkin
Given: ConversionLoggerインスタンスが生成されている
  And: LogRepositoryモックが注入されている
When: info()を以下の入力で呼び出す
  | fileId   | file-123 |
  | fileName | test.md  |
  | action   | convert  |
  | message  | 変換開始 |
Then: Result.successがtrueである
  And: Result.data.levelが"info"である
  And: Result.data.fileIdが"file-123"である
  And: Result.data.idがUUID形式である
  And: Result.data.timestampがDate型である
```

**テストコード**:

```typescript
it("INFOログを正常に記録できる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
  const input: ConversionLogInput = {
    fileId: "file-123",
    fileName: "test.md",
    action: "convert",
    message: "変換開始",
  };

  // Act
  const result = await logger.info(input);

  // Assert
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.level).toBe("info");
    expect(result.data.fileId).toBe("file-123");
    expect(result.data.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(result.data.timestamp).toBeInstanceOf(Date);
  }
});
```

---

### 1.2 WARNログ記録（AC-002）

#### TC-002: warn()メソッドでWARNログを記録できる

```gherkin
Given: ConversionLoggerインスタンスが生成されている
When: warn()を以下の入力で呼び出す
  | fileId   | file-456                 |
  | fileName | large.pdf                |
  | action   | convert                  |
  | message  | ファイルサイズが大きい   |
Then: Result.successがtrueである
  And: Result.data.levelが"warn"である
```

**テストコード**:

```typescript
it("WARNログを正常に記録できる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo);
  const input: ConversionLogInput = {
    fileId: "file-456",
    fileName: "large.pdf",
    action: "convert",
    message: "ファイルサイズが大きい",
  };

  // Act
  const result = await logger.warn(input);

  // Assert
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.level).toBe("warn");
  }
});
```

---

### 1.3 ERRORログ記録（AC-003, AC-004）

#### TC-003: error()メソッドでERRORログをスタックトレース付きで記録できる

```gherkin
Given: ConversionLoggerインスタンスが生成されている
  And: エラーオブジェクトが存在する
When: error()をErrorオブジェクトと共に呼び出す
Then: Result.successがtrueである
  And: Result.data.levelが"error"である
  And: Result.data.errorStackが定義されている
```

**テストコード**:

```typescript
it("ERRORログにスタックトレースを含められる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo);
  const input: ConversionLogInput = {
    fileId: "file-789",
    fileName: "corrupt.doc",
    action: "convert",
    message: "変換失敗",
  };
  const error = new Error("変換に失敗しました");

  // Act
  const result = await logger.error(input, error);

  // Assert
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.level).toBe("error");
    expect(result.data.errorStack).toBeDefined();
    expect(result.data.errorStack).toContain("Error: 変換に失敗しました");
  }
});
```

#### TC-004: error()メソッドでERRORログをErrorオブジェクトなしで記録できる

```typescript
it("ERRORログをErrorオブジェクトなしで記録できる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo);
  const input: ConversionLogInput = {
    fileId: "file-999",
    fileName: "unknown.txt",
    action: "convert",
    message: "不明なエラー",
  };

  // Act
  const result = await logger.error(input);

  // Assert
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.level).toBe("error");
    expect(result.data.errorStack).toBeUndefined();
  }
});
```

---

### 1.4 バッファリング動作（AC-005, AC-006）

#### TC-005: ログがバッファに蓄積される

```typescript
it("ログがバッファに蓄積される", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act
  await logger.info(input);
  await logger.info(input);
  await logger.info(input);

  // Assert
  expect(mockRepo.bulkInsert).not.toHaveBeenCalled();
});
```

#### TC-006: バッファサイズ到達時に自動フラッシュされる

```typescript
it("バッファが満杯になると自動フラッシュされる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, {
    bufferSize: 2,
    flushIntervalMs: 0, // タイマー無効
  });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act
  await logger.info(input);
  await logger.info(input);

  // Assert
  expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
  expect(mockRepo.bulkInsert).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ level: "info" }),
      expect.objectContaining({ level: "info" }),
    ]),
  );
});
```

---

### 1.5 時間ベース自動フラッシュ（AC-007）

#### TC-007: 指定時間経過後に自動フラッシュされる

```typescript
it("自動フラッシュタイマーが動作する", async () => {
  // Arrange
  vi.useFakeTimers();
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, {
    bufferSize: 100,
    flushIntervalMs: 100,
  });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act
  await logger.info(input);
  expect(mockRepo.bulkInsert).not.toHaveBeenCalled();

  // 100ms経過
  await vi.advanceTimersByTimeAsync(100);

  // Assert
  expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);

  // Cleanup
  logger.dispose();
  vi.useRealTimers();
});
```

---

### 1.6 バッチログ記録（AC-008）

#### TC-008: batch()で複数ログを一括記録できる

```typescript
it("バッチログ記録が動作する", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
  const logs = [
    {
      level: "info" as const,
      input: {
        fileId: "1",
        fileName: "a.md",
        action: "convert" as const,
        message: "開始",
      },
    },
    {
      level: "warn" as const,
      input: {
        fileId: "2",
        fileName: "b.md",
        action: "convert" as const,
        message: "警告",
      },
    },
    {
      level: "error" as const,
      input: {
        fileId: "3",
        fileName: "c.md",
        action: "convert" as const,
        message: "失敗",
      },
    },
  ];

  // Act
  const result = await logger.batch(logs);

  // Assert
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toHaveLength(3);
    expect(result.data[0].level).toBe("info");
    expect(result.data[1].level).toBe("warn");
    expect(result.data[2].level).toBe("error");
  }
});
```

---

### 1.7 手動フラッシュ（AC-009, AC-010）

#### TC-009: flush()で明示的にバッファを保存できる

```typescript
it("手動フラッシュが動作する", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  await logger.info(input);
  await logger.info(input);
  await logger.info(input);

  // Act
  const result = await logger.flush();

  // Assert
  expect(result.success).toBe(true);
  expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
  expect(mockRepo.bulkInsert).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ level: "info" })]),
  );
});
```

#### TC-010: 空バッファのフラッシュでもエラーにならない

```typescript
it("空バッファのフラッシュでもエラーにならない", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo);

  // Act
  const result = await logger.flush();

  // Assert
  expect(result.success).toBe(true);
  expect(mockRepo.bulkInsert).not.toHaveBeenCalled();
});
```

---

### 1.8 リソース解放（AC-011）

#### TC-011: dispose()でリソースが正しく解放される

```typescript
it("dispose時にフラッシュされる", async () => {
  // Arrange
  vi.useFakeTimers();
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, {
    bufferSize: 100,
    flushIntervalMs: 1000,
  });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  await logger.info(input);
  await logger.info(input);

  // Act
  logger.dispose();

  // Assert
  expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
  expect(mockRepo.bulkInsert).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ level: "info" })]),
  );

  // Cleanup
  vi.useRealTimers();
});
```

---

### 1.9 Repository障害時（AC-012）

#### TC-012: LogRepository障害時にエラーが正しく伝播する

```typescript
it("Repository障害時にエラーが伝播する", async () => {
  // Arrange
  const mockRepo = createFailingMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 1 });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act
  const result = await logger.info(input);

  // Assert (バッファサイズ1なので即フラッシュしてエラーになる)
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBeInstanceOf(Error);
  }
});
```

---

## 2. 境界値テスト

### 2.1 bufferSize境界値

#### BV-001: bufferSize=0（即時フラッシュ）

```typescript
it("bufferSize=0で即時フラッシュされる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 0 });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act
  await logger.info(input);

  // Assert
  expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
});
```

#### BV-002: bufferSize=1（毎回フラッシュ）

```typescript
it("bufferSize=1で毎回フラッシュされる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 1 });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act
  await logger.info(input);
  await logger.info(input);
  await logger.info(input);

  // Assert
  expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(3);
});
```

#### BV-003: bufferSize=100（デフォルト）

```typescript
it("bufferSize=100でバッファリングされる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act: 99件追加
  for (let i = 0; i < 99; i++) {
    await logger.info(input);
  }

  // Assert: まだフラッシュされていない
  expect(mockRepo.bulkInsert).not.toHaveBeenCalled();

  // Act: 100件目
  await logger.info(input);

  // Assert: フラッシュされる
  expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
});
```

### 2.2 flushIntervalMs境界値

#### BV-005: flushIntervalMs=0（タイマー無効）

```typescript
it("flushIntervalMs=0でタイマーが無効になる", async () => {
  // Arrange
  vi.useFakeTimers();
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, {
    bufferSize: 100,
    flushIntervalMs: 0,
  });
  const input: ConversionLogInput = {
    fileId: "file-001",
    fileName: "test.md",
    action: "convert",
    message: "テスト",
  };

  // Act
  await logger.info(input);
  await vi.advanceTimersByTimeAsync(10000); // 10秒経過

  // Assert: タイマーによるフラッシュは発生しない
  expect(mockRepo.bulkInsert).not.toHaveBeenCalled();

  // Cleanup
  logger.dispose();
  vi.useRealTimers();
});
```

### 2.3 バッチサイズ境界値

#### BV-008: 空のバッチ

```typescript
it("空のバッチを処理できる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo);

  // Act
  const result = await logger.batch([]);

  // Assert
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toHaveLength(0);
  }
});
```

#### BV-009: 大量バッチ（1000件）

```typescript
it("大量のバッチログを処理できる", async () => {
  // Arrange
  const mockRepo = createMockLogRepository();
  const logger = new ConversionLogger(mockRepo, { bufferSize: 1000 });
  const logs = Array.from({ length: 1000 }, (_, i) => ({
    level: "info" as const,
    input: {
      fileId: `file-${i}`,
      fileName: `test-${i}.md`,
      action: "convert" as const,
      message: `メッセージ${i}`,
    },
  }));

  // Act
  const result = await logger.batch(logs);

  // Assert
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toHaveLength(1000);
  }
});
```

---

## 3. テストケースマトリクス

| テストID | カテゴリ | 対応AC/要件 | 優先度 | 自動化 |
| -------- | -------- | ----------- | ------ | ------ |
| TC-001   | 正常系   | AC-001      | Must   | [x]    |
| TC-002   | 正常系   | AC-002      | Must   | [x]    |
| TC-003   | 正常系   | AC-003      | Must   | [x]    |
| TC-004   | 代替系   | AC-004      | Should | [x]    |
| TC-005   | 正常系   | AC-005      | Must   | [x]    |
| TC-006   | 正常系   | AC-006      | Must   | [x]    |
| TC-007   | 正常系   | AC-007      | Must   | [x]    |
| TC-008   | 正常系   | AC-008      | Should | [x]    |
| TC-009   | 正常系   | AC-009      | Must   | [x]    |
| TC-010   | エッジ   | AC-010      | Must   | [x]    |
| TC-011   | 正常系   | AC-011      | Must   | [x]    |
| TC-012   | 異常系   | AC-012      | Must   | [x]    |
| BV-001   | 境界値   | -           | Should | [x]    |
| BV-002   | 境界値   | -           | Should | [x]    |
| BV-003   | 境界値   | -           | Should | [x]    |
| BV-005   | 境界値   | -           | Should | [x]    |
| BV-008   | 境界値   | -           | Should | [x]    |
| BV-009   | 境界値   | -           | Should | [x]    |

---

## 4. 承認

| 役割         | 判定     | 日付       |
| ------------ | -------- | ---------- |
| テスト設計者 | Complete | 2026-01-07 |
