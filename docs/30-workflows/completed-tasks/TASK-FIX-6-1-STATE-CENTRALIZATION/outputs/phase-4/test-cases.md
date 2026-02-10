# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| Phase    | 4                                 |
| 作成日   | 2026-02-09                        |
| 総数     | 56 テストケース                   |

---

## CAT-01: 初期状態テスト（10 件）

統合後の agentSlice の初期状態が正しく設定されていることを検証する。

| ID        | テストケース名                           | 検証内容                         | 優先度 |
| --------- | ---------------------------------------- | -------------------------------- | ------ |
| TS-6-1-01 | availableSkillsMetadata の初期値は空配列 | `availableSkillsMetadata === []` | HIGH   |
| TS-6-1-02 | importedSkills の初期値は空配列          | `importedSkills === []`          | HIGH   |
| TS-6-1-03 | selectedSkillName の初期値は null        | `selectedSkillName === null`     | HIGH   |
| TS-6-1-04 | skillExecutionStatus の初期値は null     | `skillExecutionStatus === null`  | HIGH   |
| TS-6-1-05 | streamingMessages の初期値は空配列       | `streamingMessages === []`       | HIGH   |
| TS-6-1-06 | pendingPermission の初期値は null        | `pendingPermission === null`     | HIGH   |
| TS-6-1-07 | skillError の初期値は null               | `skillError === null`            | HIGH   |
| TS-6-1-08 | isLoadingSkills の初期値は false         | `isLoadingSkills === false`      | MEDIUM |
| TS-6-1-09 | isScanning の初期値は false              | `isScanning === false`           | MEDIUM |
| TS-6-1-10 | isImporting の初期値は false             | `isImporting === false`          | MEDIUM |

### TS-6-1-01: availableSkillsMetadata の初期値は空配列

```typescript
it("TS-6-1-01: availableSkillsMetadataの初期値は空配列", () => {
  // Arrange
  const store = createTestStore();

  // Assert
  expect(store.availableSkillsMetadata).toEqual([]);
});
```

### TS-6-1-02: importedSkills の初期値は空配列

```typescript
it("TS-6-1-02: importedSkillsの初期値は空配列", () => {
  const store = createTestStore();
  expect(store.importedSkills).toEqual([]);
});
```

### TS-6-1-03: selectedSkillName の初期値は null

```typescript
it("TS-6-1-03: selectedSkillNameの初期値はnull", () => {
  const store = createTestStore();
  expect(store.selectedSkillName).toBeNull();
});
```

### TS-6-1-04: skillExecutionStatus の初期値は null

```typescript
it("TS-6-1-04: skillExecutionStatusの初期値はnull", () => {
  const store = createTestStore();
  expect(store.skillExecutionStatus).toBeNull();
});
```

### TS-6-1-05: streamingMessages の初期値は空配列

```typescript
it("TS-6-1-05: streamingMessagesの初期値は空配列", () => {
  const store = createTestStore();
  expect(store.streamingMessages).toEqual([]);
});
```

### TS-6-1-06: pendingPermission の初期値は null

```typescript
it("TS-6-1-06: pendingPermissionの初期値はnull", () => {
  const store = createTestStore();
  expect(store.pendingPermission).toBeNull();
});
```

### TS-6-1-07: skillError の初期値は null

```typescript
it("TS-6-1-07: skillErrorの初期値はnull", () => {
  const store = createTestStore();
  expect(store.skillError).toBeNull();
});
```

### TS-6-1-08: isLoadingSkills の初期値は false

```typescript
it("TS-6-1-08: isLoadingSkillsの初期値はfalse", () => {
  const store = createTestStore();
  expect(store.isLoadingSkills).toBe(false);
});
```

### TS-6-1-09: isScanning の初期値は false

```typescript
it("TS-6-1-09: isScanningの初期値はfalse", () => {
  const store = createTestStore();
  expect(store.isScanning).toBe(false);
});
```

### TS-6-1-10: isImporting の初期値は false

```typescript
it("TS-6-1-10: isImportingの初期値はfalse", () => {
  const store = createTestStore();
  expect(store.isImporting).toBe(false);
});
```

---

## CAT-02: 既存機能維持テスト（3 件）

agentSlice の既存機能が統合後も正しく動作することを検証する。

| ID        | テストケース名                     | 検証内容                           | 優先度 |
| --------- | ---------------------------------- | ---------------------------------- | ------ |
| TS-6-1-11 | 既存の skills 配列が維持される     | `skills` が配列として存在          | HIGH   |
| TS-6-1-12 | 既存の executionState が維持される | `executionState.status === "idle"` | HIGH   |
| TS-6-1-13 | 既存の previewContent が維持される | `previewContent` プロパティが存在  | MEDIUM |

### TS-6-1-11: 既存の skills 配列が維持される

```typescript
it("TS-6-1-11: 既存のskills配列が維持される", () => {
  const store = createTestStore();
  expect(store.skills).toBeDefined();
  expect(Array.isArray(store.skills)).toBe(true);
});
```

### TS-6-1-12: 既存の executionState が維持される

```typescript
it("TS-6-1-12: 既存のexecutionStateが維持される", () => {
  const store = createTestStore();
  expect(store.executionState).toBeDefined();
  expect(store.executionState.status).toBe("idle");
});
```

### TS-6-1-13: 既存の previewContent が維持される

```typescript
it("TS-6-1-13: 既存のpreviewContentが維持される", () => {
  const store = createTestStore();
  expect("previewContent" in store).toBe(true);
});
```

---

## CAT-03: スキル取得テスト（5 件）

fetchSkills アクションの動作を検証する。

| ID        | テストケース名                                      | 検証内容                                  | 優先度 |
| --------- | --------------------------------------------------- | ----------------------------------------- | ------ |
| TS-6-1-14 | fetchSkills メソッドが存在する                      | `typeof store.fetchSkills === "function"` | HIGH   |
| TS-6-1-15 | fetchSkills 呼び出し時に isLoadingSkills が true    | ローディング状態が設定される              | HIGH   |
| TS-6-1-16 | fetchSkills 成功時に availableSkillsMetadata が設定 | スキル一覧が正しく設定される              | HIGH   |
| TS-6-1-17 | fetchSkills 成功時に importedSkills が設定          | インポート済み一覧が設定される            | HIGH   |
| TS-6-1-18 | fetchSkills 失敗時に skillError が設定              | エラーメッセージが設定される              | HIGH   |

### TS-6-1-14: fetchSkills メソッドが存在する

```typescript
it("TS-6-1-14: fetchSkillsメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store.fetchSkills).toBe("function");
});
```

### TS-6-1-15: fetchSkills 呼び出し時に isLoadingSkills が true になる

```typescript
it("TS-6-1-15: fetchSkills呼び出し時にisLoadingSkillsがtrueになる", async () => {
  const store = createTestStore();
  setupMockElectronAPI();

  const fetchPromise = store.fetchSkills();
  expect(store.isLoadingSkills).toBe(true);

  await fetchPromise;
});
```

### TS-6-1-16: fetchSkills 成功時に availableSkillsMetadata が設定される

```typescript
it("TS-6-1-16: fetchSkills成功時にavailableSkillsMetadataが設定される", async () => {
  const store = createTestStore();
  setupMockElectronAPI({
    skillList: mockAvailableSkills,
    skillGetImported: mockImportedSkills,
  });

  await store.fetchSkills();

  expect(store.availableSkillsMetadata).toEqual(mockAvailableSkills);
});
```

### TS-6-1-17: fetchSkills 成功時に importedSkills が設定される

```typescript
it("TS-6-1-17: fetchSkills成功時にimportedSkillsが設定される", async () => {
  const store = createTestStore();
  setupMockElectronAPI({
    skillList: mockAvailableSkills,
    skillGetImported: mockImportedSkills,
  });

  await store.fetchSkills();

  expect(store.importedSkills).toEqual(mockImportedSkills);
});
```

### TS-6-1-18: fetchSkills 失敗時に skillError が設定される

```typescript
it("TS-6-1-18: fetchSkills失敗時にskillErrorが設定される", async () => {
  const store = createTestStore();
  setupMockElectronAPI({
    skillListError: new Error("API error"),
  });

  await store.fetchSkills();

  expect(store.skillError).toContain("スキル一覧の取得に失敗");
});
```

---

## CAT-04: スキルインポートテスト（3 件）

importSkill アクションの動作を検証する。

| ID        | テストケース名                                   | 検証内容                                  | 優先度 |
| --------- | ------------------------------------------------ | ----------------------------------------- | ------ |
| TS-6-1-19 | importSkill メソッドが存在する                   | `typeof store.importSkill === "function"` | HIGH   |
| TS-6-1-20 | importSkill 呼び出し時に isImporting が true     | ローディング状態が設定される              | HIGH   |
| TS-6-1-21 | importSkill 成功時に importedSkills に追加される | スキルが一覧に追加される                  | HIGH   |

### TS-6-1-19: importSkill メソッドが存在する

```typescript
it("TS-6-1-19: importSkillメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store.importSkill).toBe("function");
});
```

### TS-6-1-20: importSkill 呼び出し時に isImporting が true になる

```typescript
it("TS-6-1-20: importSkill呼び出し時にisImportingがtrueになる", async () => {
  const store = createTestStore();
  setupMockElectronAPI();

  const importPromise = store.importSkill("test-skill-1");
  expect(store.isImporting).toBe(true);

  await importPromise;
});
```

### TS-6-1-21: importSkill 成功時に importedSkills に追加される

```typescript
it("TS-6-1-21: importSkill成功時にimportedSkillsに追加される", async () => {
  const store = createTestStore();
  store.availableSkillsMetadata = mockAvailableSkills;
  setupMockElectronAPI({
    skillImport: mockImportedSkills[0],
  });

  await store.importSkill("test-skill-1");

  expect(store.importedSkills).toContainEqual(
    expect.objectContaining({ name: "test-skill-1" }),
  );
});
```

---

## CAT-05: スキル削除テスト（3 件）

removeSkill アクションの動作を検証する。

| ID        | テストケース名                                            | 検証内容                                  | 優先度 |
| --------- | --------------------------------------------------------- | ----------------------------------------- | ------ |
| TS-6-1-22 | removeSkill メソッドが存在する                            | `typeof store.removeSkill === "function"` | HIGH   |
| TS-6-1-23 | removeSkill 成功時に importedSkills から削除される        | スキルが一覧から削除される                | HIGH   |
| TS-6-1-24 | 選択中のスキルが削除された場合、selectedSkillName が null | 選択状態がリセットされる                  | HIGH   |

### TS-6-1-22: removeSkill メソッドが存在する

```typescript
it("TS-6-1-22: removeSkillメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store.removeSkill).toBe("function");
});
```

### TS-6-1-23: removeSkill 成功時に importedSkills から削除される

```typescript
it("TS-6-1-23: removeSkill成功時にimportedSkillsから削除される", async () => {
  const store = createTestStore();
  store.importedSkills = mockImportedSkills;
  setupMockElectronAPI();

  await store.removeSkill("test-skill-1");

  expect(store.importedSkills).not.toContainEqual(
    expect.objectContaining({ name: "test-skill-1" }),
  );
});
```

### TS-6-1-24: 選択中のスキルが削除された場合、selectedSkillName が null になる

```typescript
it("TS-6-1-24: 選択中のスキルが削除された場合、selectedSkillNameがnullになる", async () => {
  const store = createTestStore();
  store.importedSkills = mockImportedSkills;
  store.selectedSkillName = "test-skill-1";
  setupMockElectronAPI();

  await store.removeSkill("test-skill-1");

  expect(store.selectedSkillName).toBeNull();
});
```

---

## CAT-06: スキル選択テスト（3 件）

selectSkillByName アクションの動作を検証する。

| ID        | テストケース名                                                | 検証内容                                        | 優先度 |
| --------- | ------------------------------------------------------------- | ----------------------------------------------- | ------ |
| TS-6-1-25 | selectSkillByName メソッドが存在する                          | `typeof store.selectSkillByName === "function"` | HIGH   |
| TS-6-1-26 | selectSkillByName 呼び出し時に selectedSkillName が設定される | スキル名が正しく設定される                      | HIGH   |
| TS-6-1-27 | selectSkillByName(null) で selectedSkillName が null になる   | 選択解除が機能する                              | HIGH   |

### TS-6-1-25: selectSkillByName メソッドが存在する

```typescript
it("TS-6-1-25: selectSkillByNameメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store.selectSkillByName).toBe("function");
});
```

### TS-6-1-26: selectSkillByName 呼び出し時に selectedSkillName が設定される

```typescript
it("TS-6-1-26: selectSkillByName呼び出し時にselectedSkillNameが設定される", () => {
  const store = createTestStore();

  store.selectSkillByName("test-skill-1");

  expect(store.selectedSkillName).toBe("test-skill-1");
});
```

### TS-6-1-27: selectSkillByName(null) で selectedSkillName が null になる

```typescript
it("TS-6-1-27: selectSkillByName(null)でselectedSkillNameがnullになる", () => {
  const store = createTestStore();
  store.selectedSkillName = "test-skill-1";

  store.selectSkillByName(null);

  expect(store.selectedSkillName).toBeNull();
});
```

---

## CAT-07: スキル実行テスト（8 件）

executeSkill アクションと race condition 対策を検証する。

| ID        | テストケース名                                                | 検証内容                                   | 優先度 |
| --------- | ------------------------------------------------------------- | ------------------------------------------ | ------ |
| TS-6-1-28 | executeSkill メソッドが存在する                               | `typeof store.executeSkill === "function"` | HIGH   |
| TS-6-1-29 | executeSkill 呼び出し前に executionId が事前生成される        | race condition 対策の確認                  | HIGH   |
| TS-6-1-30 | executeSkill 呼び出し直後に isExecuting が true になる        | 実行中フラグが設定される                   | HIGH   |
| TS-6-1-31 | executeSkill 呼び出し直後に streamingMessages がクリアされる  | 前回のメッセージがクリアされる             | HIGH   |
| TS-6-1-32 | executeSkill 呼び出し直後に skillExecutionStatus が running   | ステータスが running に設定される          | HIGH   |
| TS-6-1-33 | IPC 応答後に executionId がサーバー値で更新される             | サーバー側 ID で置換される                 | HIGH   |
| TS-6-1-34 | selectedSkillName が null の場合、executeSkill は早期リターン | 無効な実行を防止                           | HIGH   |
| TS-6-1-35 | executeSkill 失敗時に skillExecutionStatus が error になる    | エラーハンドリングの確認                   | HIGH   |

### TS-6-1-28: executeSkill メソッドが存在する

```typescript
it("TS-6-1-28: executeSkillメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store.executeSkill).toBe("function");
});
```

### TS-6-1-29: executeSkill 呼び出し前に executionId が事前生成される

```typescript
it("TS-6-1-29: executeSkill呼び出し前にexecutionIdが事前生成される", async () => {
  const store = createTestStore();
  store.selectedSkillName = "test-skill-1";
  store.importedSkills = mockImportedSkills;

  let capturedExecutionId: string | null = null;
  setupMockElectronAPI({
    skillExecute: async (params: {
      skillName: string;
      prompt: string;
      tempExecutionId?: string;
    }) => {
      capturedExecutionId = params.tempExecutionId ?? null;
      return { executionId: "server-exec-123", success: true };
    },
  });

  const executePromise = store.executeSkill("テストプロンプト");

  // IPC呼び出し前にexecutionIdが設定されていることを確認
  expect(store.executionId).not.toBeNull();
  expect(store.executionId).toMatch(/^[a-f0-9-]{36}$/); // UUID形式

  await executePromise;

  // tempExecutionIdがIPCに渡されたことを確認
  expect(capturedExecutionId).toBe(store.executionId);
});
```

### TS-6-1-30: executeSkill 呼び出し直後に isExecuting が true になる

```typescript
it("TS-6-1-30: executeSkill呼び出し直後にisExecutingがtrueになる", async () => {
  const store = createTestStore();
  store.selectedSkillName = "test-skill-1";
  store.importedSkills = mockImportedSkills;
  setupMockElectronAPI();

  const executePromise = store.executeSkill("テストプロンプト");

  expect(store.isExecuting).toBe(true);

  await executePromise;
});
```

### TS-6-1-31: executeSkill 呼び出し直後に streamingMessages がクリアされる

```typescript
it("TS-6-1-31: executeSkill呼び出し直後にstreamingMessagesがクリアされる", async () => {
  const store = createTestStore();
  store.selectedSkillName = "test-skill-1";
  store.importedSkills = mockImportedSkills;
  store.streamingMessages = [mockStreamMessage];
  setupMockElectronAPI();

  const executePromise = store.executeSkill("テストプロンプト");

  expect(store.streamingMessages).toEqual([]);

  await executePromise;
});
```

### TS-6-1-32: executeSkill 呼び出し直後に skillExecutionStatus が running になる

```typescript
it("TS-6-1-32: executeSkill呼び出し直後にskillExecutionStatusがrunningになる", async () => {
  const store = createTestStore();
  store.selectedSkillName = "test-skill-1";
  store.importedSkills = mockImportedSkills;
  setupMockElectronAPI();

  const executePromise = store.executeSkill("テストプロンプト");

  expect(store.skillExecutionStatus).toBe("running");

  await executePromise;
});
```

### TS-6-1-33: IPC 応答後に executionId がサーバー値で更新される

```typescript
it("TS-6-1-33: IPC応答後にexecutionIdがサーバー値で更新される", async () => {
  const store = createTestStore();
  store.selectedSkillName = "test-skill-1";
  store.importedSkills = mockImportedSkills;
  setupMockElectronAPI({
    skillExecute: { executionId: "server-exec-456", success: true },
  });

  await store.executeSkill("テストプロンプト");

  expect(store.executionId).toBe("server-exec-456");
});
```

### TS-6-1-34: selectedSkillName が null の場合、executeSkill は早期リターンする

```typescript
it("TS-6-1-34: selectedSkillNameがnullの場合、executeSkillは早期リターンする", async () => {
  const store = createTestStore();
  store.selectedSkillName = null;
  const mockExecute = vi.fn();
  setupMockElectronAPI({ skillExecute: mockExecute });

  await store.executeSkill("テストプロンプト");

  expect(mockExecute).not.toHaveBeenCalled();
  expect(store.isExecuting).toBe(false);
});
```

### TS-6-1-35: executeSkill 失敗時に skillExecutionStatus が error になる

```typescript
it("TS-6-1-35: executeSkill失敗時にskillExecutionStatusがerrorになる", async () => {
  const store = createTestStore();
  store.selectedSkillName = "test-skill-1";
  store.importedSkills = mockImportedSkills;
  setupMockElectronAPI({
    skillExecuteError: new Error("実行失敗"),
  });

  await store.executeSkill("テストプロンプト");

  expect(store.skillExecutionStatus).toBe("error");
  expect(store.skillError).toContain("実行開始に失敗");
});
```

---

## CAT-08: 実行中断テスト（4 件）

abortExecution アクションの動作を検証する。

| ID        | テストケース名                                                | 検証内容                                     | 優先度 |
| --------- | ------------------------------------------------------------- | -------------------------------------------- | ------ |
| TS-6-1-36 | abortExecution メソッドが存在する                             | `typeof store.abortExecution === "function"` | HIGH   |
| TS-6-1-37 | abortExecution 呼び出し時に isExecuting が false になる       | 実行中フラグがクリアされる                   | HIGH   |
| TS-6-1-38 | abortExecution 呼び出し時に skillExecutionStatus が cancelled | ステータスが cancelled に設定される          | HIGH   |
| TS-6-1-39 | executionId が null の場合、abort は呼び出されない            | 無効な中断を防止                             | MEDIUM |

### TS-6-1-36: abortExecution メソッドが存在する

```typescript
it("TS-6-1-36: abortExecutionメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store.abortExecution).toBe("function");
});
```

### TS-6-1-37: abortExecution 呼び出し時に isExecuting が false になる

```typescript
it("TS-6-1-37: abortExecution呼び出し時にisExecutingがfalseになる", () => {
  const store = createTestStore();
  store.executionId = "exec-123";
  store.isExecuting = true;
  setupMockElectronAPI();

  store.abortExecution();

  expect(store.isExecuting).toBe(false);
});
```

### TS-6-1-38: abortExecution 呼び出し時に skillExecutionStatus が cancelled になる

```typescript
it("TS-6-1-38: abortExecution呼び出し時にskillExecutionStatusがcancelledになる", () => {
  const store = createTestStore();
  store.executionId = "exec-123";
  store.isExecuting = true;
  store.skillExecutionStatus = "running";
  setupMockElectronAPI();

  store.abortExecution();

  expect(store.skillExecutionStatus).toBe("cancelled");
});
```

### TS-6-1-39: executionId が null の場合、abort は呼び出されない

```typescript
it("TS-6-1-39: executionIdがnullの場合、abortは呼び出されない", () => {
  const store = createTestStore();
  store.executionId = null;
  const mockAbort = vi.fn();
  setupMockElectronAPI({ skillAbort: mockAbort });

  store.abortExecution();

  expect(mockAbort).not.toHaveBeenCalled();
});
```

---

## CAT-09: ストリームハンドラテスト（9 件）

IPC リスナーハンドラの動作を検証する。

| ID        | テストケース名                                                    | 検証内容                            | 優先度 |
| --------- | ----------------------------------------------------------------- | ----------------------------------- | ------ |
| TS-6-1-40 | \_handleStreamMessage メソッドが存在する                          | ハンドラが定義されている            | HIGH   |
| TS-6-1-41 | \_handleStreamMessage 呼び出し時に streamingMessages に追加される | メッセージが配列に追加される        | HIGH   |
| TS-6-1-42 | 複数の \_handleStreamMessage 呼び出しで順序が維持される           | メッセージ順序の保証                | HIGH   |
| TS-6-1-43 | \_handleComplete メソッドが存在する                               | ハンドラが定義されている            | HIGH   |
| TS-6-1-44 | \_handleComplete 呼び出し時に isExecuting が false になる         | 実行状態がリセットされる            | HIGH   |
| TS-6-1-45 | \_handleComplete 呼び出し時に skillExecutionStatus が completed   | ステータスが completed に設定される | HIGH   |
| TS-6-1-46 | \_handleError メソッドが存在する                                  | ハンドラが定義されている            | HIGH   |
| TS-6-1-47 | \_handleError 呼び出し時に isExecuting が false になる            | 実行状態がリセットされる            | HIGH   |
| TS-6-1-48 | \_handleError 呼び出し時に skillExecutionStatus が error になる   | ステータスが error に設定される     | HIGH   |

### TS-6-1-40: \_handleStreamMessage メソッドが存在する

```typescript
it("TS-6-1-40: _handleStreamMessageメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store._handleStreamMessage).toBe("function");
});
```

### TS-6-1-41: \_handleStreamMessage 呼び出し時に streamingMessages に追加される

```typescript
it("TS-6-1-41: _handleStreamMessage呼び出し時にstreamingMessagesに追加される", () => {
  const store = createTestStore();

  store._handleStreamMessage(mockStreamMessage);

  expect(store.streamingMessages).toContainEqual(mockStreamMessage);
});
```

### TS-6-1-42: 複数の \_handleStreamMessage 呼び出しで順序が維持される

```typescript
it("TS-6-1-42: 複数の_handleStreamMessage呼び出しで順序が維持される", () => {
  const store = createTestStore();
  const msg1 = { ...mockStreamMessage, timestamp: 1 };
  const msg2 = { ...mockStreamMessage, timestamp: 2 };

  store._handleStreamMessage(msg1);
  store._handleStreamMessage(msg2);

  expect(store.streamingMessages).toHaveLength(2);
  expect(store.streamingMessages[0].timestamp).toBe(1);
  expect(store.streamingMessages[1].timestamp).toBe(2);
});
```

### TS-6-1-43: \_handleComplete メソッドが存在する

```typescript
it("TS-6-1-43: _handleCompleteメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store._handleComplete).toBe("function");
});
```

### TS-6-1-44: \_handleComplete 呼び出し時に isExecuting が false になる

```typescript
it("TS-6-1-44: _handleComplete呼び出し時にisExecutingがfalseになる", () => {
  const store = createTestStore();
  store.isExecuting = true;

  store._handleComplete("exec-123");

  expect(store.isExecuting).toBe(false);
});
```

### TS-6-1-45: \_handleComplete 呼び出し時に skillExecutionStatus が completed になる

```typescript
it("TS-6-1-45: _handleComplete呼び出し時にskillExecutionStatusがcompletedになる", () => {
  const store = createTestStore();
  store.skillExecutionStatus = "running";

  store._handleComplete("exec-123");

  expect(store.skillExecutionStatus).toBe("completed");
});
```

### TS-6-1-46: \_handleError メソッドが存在する

```typescript
it("TS-6-1-46: _handleErrorメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store._handleError).toBe("function");
});
```

### TS-6-1-47: \_handleError 呼び出し時に isExecuting が false になる

```typescript
it("TS-6-1-47: _handleError呼び出し時にisExecutingがfalseになる", () => {
  const store = createTestStore();
  store.isExecuting = true;

  store._handleError("exec-123", "エラーメッセージ");

  expect(store.isExecuting).toBe(false);
});
```

### TS-6-1-48: \_handleError 呼び出し時に skillExecutionStatus が error になる

```typescript
it("TS-6-1-48: _handleError呼び出し時にskillExecutionStatusがerrorになる", () => {
  const store = createTestStore();
  store.skillExecutionStatus = "running";

  store._handleError("exec-123", "エラーメッセージ");

  expect(store.skillExecutionStatus).toBe("error");
});
```

---

## CAT-10: 権限管理テスト（8 件）

権限リクエストと応答の処理を検証する。

| ID        | テストケース名                                                                    | 検証内容                                     | 優先度 |
| --------- | --------------------------------------------------------------------------------- | -------------------------------------------- | ------ |
| TS-6-1-49 | \_handleError 呼び出し時に skillError が設定される                                | エラーメッセージが保存される                 | HIGH   |
| TS-6-1-50 | \_handlePermissionRequest メソッドが存在する                                      | ハンドラが定義されている                     | HIGH   |
| TS-6-1-51 | \_handlePermissionRequest 呼び出し時に pendingPermission が設定される             | 権限リクエストが保存される                   | HIGH   |
| TS-6-1-52 | \_handlePermissionRequest 呼び出し時に skillExecutionStatus が permission_pending | ステータスが permission_pending に設定される | HIGH   |
| TS-6-1-53 | respondToSkillPermission メソッドが存在する                                       | メソッドが定義されている                     | HIGH   |
| TS-6-1-54 | respondToSkillPermission(true) 呼び出し時に pendingPermission が null             | 権限リクエストがクリアされる                 | HIGH   |
| TS-6-1-55 | respondToSkillPermission(false) 呼び出し時に pendingPermission が null            | 権限リクエストがクリアされる                 | HIGH   |
| TS-6-1-56 | pendingPermission が null の場合、IPC は呼び出されない                            | 無効な応答を防止                             | MEDIUM |

### TS-6-1-49: \_handleError 呼び出し時に skillError が設定される

```typescript
it("TS-6-1-49: _handleError呼び出し時にskillErrorが設定される", () => {
  const store = createTestStore();

  store._handleError("exec-123", "テストエラー");

  expect(store.skillError).toBe("テストエラー");
});
```

### TS-6-1-50: \_handlePermissionRequest メソッドが存在する

```typescript
it("TS-6-1-50: _handlePermissionRequestメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store._handlePermissionRequest).toBe("function");
});
```

### TS-6-1-51: \_handlePermissionRequest 呼び出し時に pendingPermission が設定される

```typescript
it("TS-6-1-51: _handlePermissionRequest呼び出し時にpendingPermissionが設定される", () => {
  const store = createTestStore();

  store._handlePermissionRequest(mockPermissionRequest);

  expect(store.pendingPermission).toEqual(mockPermissionRequest);
});
```

### TS-6-1-52: \_handlePermissionRequest 呼び出し時に skillExecutionStatus が permission_pending になる

```typescript
it("TS-6-1-52: _handlePermissionRequest呼び出し時にskillExecutionStatusがpermission_pendingになる", () => {
  const store = createTestStore();
  store.skillExecutionStatus = "running";

  store._handlePermissionRequest(mockPermissionRequest);

  expect(store.skillExecutionStatus).toBe("permission_pending");
});
```

### TS-6-1-53: respondToSkillPermission メソッドが存在する

```typescript
it("TS-6-1-53: respondToSkillPermissionメソッドが存在する", () => {
  const store = createTestStore();
  expect(typeof store.respondToSkillPermission).toBe("function");
});
```

### TS-6-1-54: respondToSkillPermission(true) 呼び出し時に pendingPermission が null になる

```typescript
it("TS-6-1-54: respondToSkillPermission(true)呼び出し時にpendingPermissionがnullになる", () => {
  const store = createTestStore();
  store.pendingPermission = mockPermissionRequest;
  setupMockElectronAPI();

  store.respondToSkillPermission(true);

  expect(store.pendingPermission).toBeNull();
});
```

### TS-6-1-55: respondToSkillPermission(false) 呼び出し時に pendingPermission が null になる

```typescript
it("TS-6-1-55: respondToSkillPermission(false)呼び出し時にpendingPermissionがnullになる", () => {
  const store = createTestStore();
  store.pendingPermission = mockPermissionRequest;
  setupMockElectronAPI();

  store.respondToSkillPermission(false);

  expect(store.pendingPermission).toBeNull();
});
```

### TS-6-1-56: pendingPermission が null の場合、IPC は呼び出されない

```typescript
it("TS-6-1-56: pendingPermissionがnullの場合、IPCは呼び出されない", () => {
  const store = createTestStore();
  store.pendingPermission = null;
  const mockSendPermission = vi.fn();
  setupMockElectronAPI({ skillSendPermissionResponse: mockSendPermission });

  store.respondToSkillPermission(true);

  expect(mockSendPermission).not.toHaveBeenCalled();
});
```

---

## サマリー

| カテゴリ                   | テスト数 | HIGH   | MEDIUM |
| -------------------------- | -------- | ------ | ------ |
| CAT-01: 初期状態           | 10       | 7      | 3      |
| CAT-02: 既存機能維持       | 3        | 2      | 1      |
| CAT-03: スキル取得         | 5        | 5      | 0      |
| CAT-04: スキルインポート   | 3        | 3      | 0      |
| CAT-05: スキル削除         | 3        | 3      | 0      |
| CAT-06: スキル選択         | 3        | 3      | 0      |
| CAT-07: スキル実行         | 8        | 8      | 0      |
| CAT-08: 実行中断           | 4        | 3      | 1      |
| CAT-09: ストリームハンドラ | 9        | 9      | 0      |
| CAT-10: 権限管理           | 8        | 7      | 1      |
| **合計**                   | **56**   | **50** | **6**  |
