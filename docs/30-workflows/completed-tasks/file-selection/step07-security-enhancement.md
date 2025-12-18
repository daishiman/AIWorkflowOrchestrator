# Step 07: セキュリティ強化とバグ修正

## 概要

ファイル選択機能のIPCハンドラにおいて、以下の改善が必要です：

1. **戻り値形式の統一** (VALIDATE_PATH: 3件)
2. **部分成功ハンドリング** (GET_MULTIPLE_METADATA: 1件)
3. **セキュリティ機能の実装** (SEC-M1, SEC-M2, レート制限: 3件)

---

## カテゴリ1: VALIDATE_PATH 戻り値形式の修正

### 問題1-1: 存在しないパスの場合

**現状:**

```typescript
{
  success: true,
  data: { valid: true, exists: false }
}
```

**期待:**

```typescript
{
  success: true,
  data: { valid: true, exists: false, isFile: false, isDirectory: false }
}
```

**原因:** 存在しないパスの場合、`isFile`と`isDirectory`が返されていない。

### 問題1-2: パストラバーサル検出時

**現状:**

```typescript
{
  success: false,
  error: "バリデーションエラー: ..."
}
```

**期待:**

```typescript
{
  success: true,
  data: { valid: false, exists: false, isFile: false, isDirectory: false, error: "..." }
}
```

**原因:** Zodスキーマでパストラバーサルチェックしているため、`safeParse`で失敗している。ハンドラ側でチェックすべき。

### 問題1-3: 許可されていないディレクトリ

**現状:**

```typescript
{
  success: true,
  data: { valid: false, error: "..." }
}
```

**期待:**

```typescript
{
  success: true,
  data: { valid: false, exists: false, isFile: false, isDirectory: false, error: "..." }
}
```

**原因:** 許可されていないディレクトリの場合も`exists`等のフィールドを返すべき。

---

## カテゴリ2: GET_MULTIPLE_METADATA 部分成功ハンドリング

### 問題2-1: パストラバーサルを含むパスがある場合

**現状:**

```typescript
{
  success: false,
  error: "バリデーションエラー: ..."
}
```

**期待:**

```typescript
{
  success: true,
  data: {
    files: [/* 有効なファイルのメタデータ */],
    errors: [{ filePath: "...", error: "..." }]
  }
}
```

**原因:** Zodスキーマで配列内の各パスをチェックしているため、1つでも不正なパスがあると全体が失敗する。

---

## カテゴリ3: セキュリティ機能の実装

### SEC-M1: 送信元検証

**要件:**

- IPC通信の送信元（webContents）を検証
- メインウィンドウ以外からのリクエストを拒否

**実装方針:**

```typescript
function validateSender(event: Electron.IpcMainInvokeEvent): boolean {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  return focusedWindow?.webContents.id === event.sender.id;
}
```

### SEC-M2: 危険な拡張子フィルタリング

**要件:**

- カスタムフィルターに危険な拡張子が含まれていたら拒否
- 危険な拡張子: exe, bat, cmd, com, msi, dll, scr, pif, vbs, js, ps1

**実装方針:**

```typescript
const DANGEROUS_EXTENSIONS = [
  "exe",
  "bat",
  "cmd",
  "com",
  "msi",
  "dll",
  "scr",
  "pif",
  "vbs",
  "js",
  "ps1",
];

function hasDangerousExtension(filters: DialogFileFilter[]): boolean {
  return filters.some((f) =>
    f.extensions.some((ext) =>
      DANGEROUS_EXTENSIONS.includes(ext.toLowerCase()),
    ),
  );
}
```

### レート制限

**要件:**

- 短時間（1秒）に大量（10回以上）のリクエストで拒否
- 一定時間後に制限解除

**実装方針:**

```typescript
const rateLimiter = new Map<number, number[]>(); // senderId -> timestamps
const RATE_LIMIT_WINDOW = 1000; // 1秒
const RATE_LIMIT_MAX = 10; // 最大10回

function checkRateLimit(senderId: number): boolean {
  const now = Date.now();
  const timestamps = rateLimiter.get(senderId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (recent.length >= RATE_LIMIT_MAX) {
    return false;
  }

  recent.push(now);
  rateLimiter.set(senderId, recent);
  return true;
}
```

---

## 実装タスク

### T-SEC-01: Zodスキーマからパストラバーサルチェックを削除

**ファイル:** `packages/shared/schemas/file-selection.schema.ts`

**変更内容:**

- `validateFilePathRequestSchema`からパストラバーサルの`.refine()`を削除
- ハンドラ側でチェックするように変更

### T-SEC-02: VALIDATE_PATH ハンドラの修正

**ファイル:** `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`

**変更内容:**

- パストラバーサルチェックをハンドラ側に移動
- 存在しないパスの場合も`isFile`, `isDirectory`を返す
- 許可されていないディレクトリの場合も全フィールドを返す

### T-SEC-03: GET_MULTIPLE_METADATA ハンドラの修正

**ファイル:** `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`

**変更内容:**

- 個別のパス検証をスキーマからハンドラに移動
- 部分成功を返すように修正

### T-SEC-04: 送信元検証の実装

**ファイル:** `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`

**変更内容:**

- `validateSender`関数の追加
- 全ハンドラで送信元検証を実行

### T-SEC-05: 危険な拡張子フィルタリングの実装

**ファイル:** `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`

**変更内容:**

- `DANGEROUS_EXTENSIONS`定数の追加
- `hasDangerousExtension`関数の追加
- `handleOpenDialog`で検証実行

### T-SEC-06: レート制限の実装

**ファイル:** `apps/desktop/src/main/ipc/fileSelectionHandlers.ts`

**変更内容:**

- `RateLimiter`クラスまたは関数の追加
- 全ハンドラでレート制限チェックを実行

---

## テストケース（既存）

以下のテストは既にRed状態で存在：

1. `パストラバーサルを含むパスがある場合、そのファイルはエラーになる`
2. `存在しないパスの場合、exists: falseを返す`
3. `パストラバーサルを含むパスはvalid: falseを返す`
4. `許可されていないディレクトリはvalid: falseを返す`
5. `不正な送信元からのリクエストは拒否する`
6. `危険な拡張子を含むカスタムフィルターは拒否する`
7. `短時間に大量のリクエストを送ると拒否される`

---

## 完了条件

- [ ] 全7件のテストがパスする
- [ ] セキュリティ機能が正しく動作する
- [ ] 既存のテスト（30件）が引き続きパスする
