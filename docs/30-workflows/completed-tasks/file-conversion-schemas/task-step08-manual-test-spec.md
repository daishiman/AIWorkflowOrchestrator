# T-08-1: 手動テスト仕様書

## 1. 概要

### 1.1 目的

本ドキュメントは、CONV-03-02（ファイル・変換スキーマ定義）モジュールの手動テスト手順を定義する。自動テストでは検証できないIDE機能（型推論、補完、インポート解決）の動作を確認する。

### 1.2 対象モジュール

- パス: `packages/shared/src/types/rag/file/`
- ファイル: `types.ts`, `schemas.ts`, `utils.ts`, `index.ts`

### 1.3 テスト環境

| 項目           | 要件                                        |
| -------------- | ------------------------------------------- |
| IDE            | VSCode（最新版推奨）                        |
| TypeScript拡張 | TypeScript Vue Plugin推奨                   |
| Node.js        | v20以上                                     |
| ビルド状態     | `pnpm --filter @repo/shared build` 成功済み |

---

## 2. 事前準備

### 2.1 環境セットアップ

```bash
# 1. プロジェクトルートに移動
cd /path/to/AIWorkflowOrchestrator

# 2. 依存関係インストール
pnpm install

# 3. 共有パッケージのビルド
pnpm --filter @repo/shared build

# 4. VSCodeでプロジェクトを開く
code .
```

### 2.2 テスト用ファイルの作成

VSCodeで以下のファイルを作成する：

**パス**: `packages/shared/src/types/rag/file/__tests__/manual-verification.ts`

```typescript
/**
 * 手動検証用ファイル
 * このファイルを使用してIDE機能をテストする
 */

// ここにテストコードを記述していく
```

---

## 3. テストケース

### TC-01: バレルエクスポート確認

#### 目的

index.ts からの一括インポートが正しく機能することを確認する。

#### 手順

1. `manual-verification.ts` に以下のコードを入力：

```typescript
import {
  FileEntity,
  FileTypes,
  fileEntitySchema,
  getFileTypeFromExtension,
} from "../index";
```

2. 各インポート名にマウスをホバーする

#### 期待結果

| 確認項目                | 期待結果                                      |
| ----------------------- | --------------------------------------------- |
| インポート文のエラー    | 赤い波線が表示されない                        |
| FileEntity ホバー       | `interface FileEntity` と型定義が表示される   |
| FileTypes ホバー        | `const FileTypes: { ... }` と定数が表示される |
| fileEntitySchema ホバー | Zodスキーマの型情報が表示される               |

#### 結果記録

- [ ] PASS
- [ ] FAIL（理由: ）

---

### TC-02: FileType 型推論確認

#### 目的

FileType 型の推論とリテラル型の表示を確認する。

#### 手順

1. 以下のコードを入力：

```typescript
import { FileType, FileTypes } from "../index";

// 変数を定義
const typeA: FileType = FileTypes.TYPESCRIPT;
const typeB: FileType = "text/markdown";
```

2. `typeA` 変数にホバーする
3. `typeB` 変数にホバーする
4. `FileType` 型にホバーする

#### 期待結果

| 確認項目        | 期待結果                                          |
| --------------- | ------------------------------------------------- |
| typeA ホバー    | `const typeA: "text/typescript"` または類似の表示 |
| typeB ホバー    | `const typeB: "text/markdown"` または類似の表示   |
| FileType ホバー | 16種類のMIMEタイプのユニオン型が表示される        |

#### 補足確認

5. 以下の**無効な値**を入力してエラーを確認：

```typescript
// @ts-expect-error - 無効なファイルタイプ
const invalidType: FileType = "invalid/type";
```

| 確認項目         | 期待結果                          |
| ---------------- | --------------------------------- |
| エラー波線       | `"invalid/type"` に赤い波線が表示 |
| エラーメッセージ | 型の不一致エラーが表示される      |

#### 結果記録

- [ ] PASS
- [ ] FAIL（理由: ）

---

### TC-03: FileEntity 型補完確認

#### 目的

FileEntity インターフェースのプロパティ補完が正しく機能することを確認する。

#### 手順

1. 以下のコードを入力（途中で止める）：

```typescript
import { FileEntity, FileId, FileTypes, FileCategories } from "../index";

const file: FileEntity = {
  // ここでCtrl+Space（またはCmd+Space）を押す
};
```

2. `{` の後で補完を発動（Ctrl+Space / Cmd+Space）
3. 表示される候補を確認

#### 期待結果

| 確認項目             | 期待結果                                      |
| -------------------- | --------------------------------------------- |
| 補完候補の表示       | id, name, path, mimeType 等のプロパティが表示 |
| 必須プロパティの表示 | 12個全てのプロパティが候補に含まれる          |
| 型情報の表示         | 各プロパティの型が候補横に表示される          |

4. 全プロパティを入力して型エラーがないことを確認：

```typescript
const file: FileEntity = {
  id: "550e8400-e29b-41d4-a716-446655440000" as FileId,
  name: "test.ts",
  path: "/path/to/test.ts",
  mimeType: FileTypes.TYPESCRIPT,
  category: FileCategories.CODE,
  size: 1024,
  hash: "a".repeat(64),
  encoding: "utf-8",
  lastModified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
};
```

| 確認項目          | 期待結果                 |
| ----------------- | ------------------------ |
| 型エラー          | 赤い波線が表示されない   |
| file 変数のホバー | FileEntity型が表示される |

#### 結果記録

- [ ] PASS
- [ ] FAIL（理由: ）

---

### TC-04: Zodスキーマ バリデーション確認

#### 目的

Zodスキーマによるランタイムバリデーションが正しく機能することを確認する。

#### 手順

1. 以下のコードを入力：

```typescript
import { fileEntitySchema, fileTypeSchema } from "../index";

// 正常データ
const validData = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "test.ts",
  path: "/path/to/test.ts",
  mimeType: "text/typescript",
  category: "code",
  size: 1024,
  hash: "a".repeat(64),
  encoding: "utf-8",
  lastModified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
};

// パース実行
const result1 = fileEntitySchema.safeParse(validData);
console.log("正常データ:", result1.success); // true

// 異常データ
const invalidData = {
  id: "invalid-uuid",
  name: "",
};

const result2 = fileEntitySchema.safeParse(invalidData);
console.log("異常データ:", result2.success); // false
if (!result2.success) {
  console.log("エラー:", result2.error.issues);
}
```

2. ファイルを保存し、以下のコマンドで実行：

```bash
npx tsx packages/shared/src/types/rag/file/__tests__/manual-verification.ts
```

#### 期待結果

| 確認項目       | 期待結果                                     |
| -------------- | -------------------------------------------- |
| 正常データ結果 | `true` が出力される                          |
| 異常データ結果 | `false` が出力される                         |
| エラー詳細     | UUID形式エラー、必須フィールドエラー等が表示 |

#### 結果記録

- [ ] PASS
- [ ] FAIL（理由: ）

---

### TC-05: ユーティリティ関数 動作確認

#### 目的

各ユーティリティ関数が正しく動作することを確認する。

#### 手順

1. 以下のコードを入力：

```typescript
import {
  getFileTypeFromExtension,
  getFileTypeFromPath,
  getFileCategoryFromType,
  formatFileSize,
  parseFileSize,
  calculateFileHashSync,
  isValidFileExtension,
  isValidHash,
  extractFileName,
  extractFileExtension,
} from "../index";

// テスト実行
console.log("=== ユーティリティ関数テスト ===\n");

// 拡張子からタイプ推定
console.log(
  "getFileTypeFromExtension('.ts'):",
  getFileTypeFromExtension(".ts"),
);
console.log(
  "getFileTypeFromExtension('.md'):",
  getFileTypeFromExtension(".md"),
);
console.log(
  "getFileTypeFromExtension('.xyz'):",
  getFileTypeFromExtension(".xyz"),
);

// パスからタイプ推定
console.log(
  "\ngetFileTypeFromPath('/path/to/file.ts'):",
  getFileTypeFromPath("/path/to/file.ts"),
);

// タイプからカテゴリ
console.log(
  "\ngetFileCategoryFromType('text/typescript'):",
  getFileCategoryFromType("text/typescript"),
);

// ファイルサイズフォーマット
console.log("\nformatFileSize(0):", formatFileSize(0));
console.log("formatFileSize(1024):", formatFileSize(1024));
console.log("formatFileSize(1536):", formatFileSize(1536));
console.log("formatFileSize(1048576):", formatFileSize(1048576));

// ファイルサイズパース
console.log("\nparseFileSize('1 KB'):", parseFileSize("1 KB"));
console.log("parseFileSize('1.5 MB'):", parseFileSize("1.5 MB"));

// ハッシュ計算
const hashResult = calculateFileHashSync("Hello, World!");
console.log("\ncalculateFileHashSync('Hello, World!'):", hashResult);

// バリデーション
console.log("\nisValidFileExtension('.ts'):", isValidFileExtension(".ts"));
console.log("isValidFileExtension('.xyz'):", isValidFileExtension(".xyz"));
console.log("isValidHash('a'.repeat(64)):", isValidHash("a".repeat(64)));
console.log("isValidHash('invalid'):", isValidHash("invalid"));

// ファイル名・拡張子抽出
console.log(
  "\nextractFileName('/path/to/file.ts'):",
  extractFileName("/path/to/file.ts"),
);
console.log(
  "extractFileExtension('/path/to/file.ts'):",
  extractFileExtension("/path/to/file.ts"),
);
```

2. ファイルを保存し、以下のコマンドで実行：

```bash
npx tsx packages/shared/src/types/rag/file/__tests__/manual-verification.ts
```

#### 期待結果

| 関数                     | 入力               | 期待出力                                    |
| ------------------------ | ------------------ | ------------------------------------------- |
| getFileTypeFromExtension | '.ts'              | 'text/typescript'                           |
| getFileTypeFromExtension | '.md'              | 'text/markdown'                             |
| getFileTypeFromExtension | '.xyz'             | 'application/octet-stream'                  |
| getFileTypeFromPath      | '/path/to/file.ts' | 'text/typescript'                           |
| getFileCategoryFromType  | 'text/typescript'  | 'code'                                      |
| formatFileSize           | 0                  | '0 Bytes'                                   |
| formatFileSize           | 1024               | '1.00 KB'                                   |
| formatFileSize           | 1048576            | '1.00 MB'                                   |
| parseFileSize            | '1 KB'             | { success: true, data: 1024 }               |
| calculateFileHashSync    | 'Hello, World!'    | { success: true, data: '64文字のハッシュ' } |
| isValidFileExtension     | '.ts'              | true                                        |
| isValidFileExtension     | '.xyz'             | false                                       |
| isValidHash              | 'a'.repeat(64)     | true                                        |
| extractFileName          | '/path/to/file.ts' | 'file.ts'                                   |
| extractFileExtension     | '/path/to/file.ts' | '.ts'                                       |

#### 結果記録

- [ ] PASS
- [ ] FAIL（理由: ）

---

### TC-06: 非同期ハッシュ計算確認

#### 目的

非同期ハッシュ計算関数が正しく動作することを確認する。

#### 手順

1. 以下のコードを入力：

```typescript
import { calculateFileHash } from "../index";

async function testAsyncHash() {
  console.log("=== 非同期ハッシュ計算テスト ===\n");

  // 文字列のハッシュ
  const result1 = await calculateFileHash("Hello, World!");
  console.log("文字列ハッシュ:", result1);

  // 同じ入力は同じハッシュ
  const result2 = await calculateFileHash("Hello, World!");
  console.log("同一入力の再計算:", result2);
  console.log(
    "ハッシュ一致:",
    result1.success && result2.success && result1.data === result2.data,
  );

  // 異なる入力は異なるハッシュ
  const result3 = await calculateFileHash("Hello, World");
  console.log("異なる入力のハッシュ:", result3);
  console.log(
    "ハッシュ不一致:",
    result1.success && result3.success && result1.data !== result3.data,
  );

  // ArrayBufferのハッシュ
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode("Hello, World!");
  const result4 = await calculateFileHash(uint8Array);
  console.log("Uint8Arrayハッシュ:", result4);
  console.log(
    "文字列と同じハッシュ:",
    result1.success && result4.success && result1.data === result4.data,
  );
}

testAsyncHash();
```

2. ファイルを保存し、以下のコマンドで実行：

```bash
npx tsx packages/shared/src/types/rag/file/__tests__/manual-verification.ts
```

#### 期待結果

| 確認項目             | 期待結果                             |
| -------------------- | ------------------------------------ |
| 文字列ハッシュ       | 64文字の16進数文字列が返される       |
| 同一入力の再計算     | 同じハッシュ値が返される             |
| 異なる入力のハッシュ | 異なるハッシュ値が返される           |
| Uint8Arrayハッシュ   | 同じ内容なら同じハッシュ値が返される |

#### 結果記録

- [ ] PASS
- [ ] FAIL（理由: ）

---

### TC-07: エラーメッセージ日本語確認

#### 目的

Zodスキーマのエラーメッセージが日本語で表示されることを確認する。

#### 手順

1. 以下のコードを入力：

```typescript
import { fileEntitySchema, fileTypeSchema, fileCategorySchema } from "../index";

console.log("=== エラーメッセージ確認 ===\n");

// 無効なファイルタイプ
const typeResult = fileTypeSchema.safeParse("invalid/type");
if (!typeResult.success) {
  console.log("FileType エラー:");
  typeResult.error.issues.forEach((issue) => {
    console.log(`  - ${issue.message}`);
  });
}

// 無効なカテゴリ
const categoryResult = fileCategorySchema.safeParse("invalid");
if (!categoryResult.success) {
  console.log("\nFileCategory エラー:");
  categoryResult.error.issues.forEach((issue) => {
    console.log(`  - ${issue.message}`);
  });
}

// 無効なファイルエンティティ（複数エラー）
const entityResult = fileEntitySchema.safeParse({
  id: "invalid-uuid",
  name: "",
  path: "",
  mimeType: "invalid/type",
  category: "invalid",
  size: -100,
  hash: "short",
  encoding: "",
});
if (!entityResult.success) {
  console.log("\nFileEntity エラー:");
  entityResult.error.issues.forEach((issue) => {
    console.log(`  - [${issue.path.join(".")}] ${issue.message}`);
  });
}
```

2. ファイルを保存し、以下のコマンドで実行：

```bash
npx tsx packages/shared/src/types/rag/file/__tests__/manual-verification.ts
```

#### 期待結果

| 確認項目            | 期待結果                                   |
| ------------------- | ------------------------------------------ |
| FileType エラー     | 日本語のエラーメッセージが表示される       |
| FileCategory エラー | 日本語のエラーメッセージが表示される       |
| FileEntity エラー   | 各フィールドの日本語エラーメッセージが表示 |

**期待されるエラーメッセージ例**:

- 「無効なファイルタイプです」
- 「ファイル名は1文字以上である必要があります」
- 「ハッシュは64文字（SHA-256形式）である必要があります」

#### 結果記録

- [ ] PASS
- [ ] FAIL（理由: ）

---

## 4. テスト結果サマリー

### 4.1 結果一覧

| TC番号 | テスト項目                | 結果 | 実施日 | 実施者 |
| ------ | ------------------------- | ---- | ------ | ------ |
| TC-01  | バレルエクスポート確認    |      |        |        |
| TC-02  | FileType 型推論確認       |      |        |        |
| TC-03  | FileEntity 型補完確認     |      |        |        |
| TC-04  | Zodスキーマバリデーション |      |        |        |
| TC-05  | ユーティリティ関数動作    |      |        |        |
| TC-06  | 非同期ハッシュ計算        |      |        |        |
| TC-07  | エラーメッセージ日本語    |      |        |        |

### 4.2 総合判定

- [ ] **PASS** - 全テストケース合格
- [ ] **FAIL** - 不合格テストケースあり

### 4.3 備考

（テスト実施時の特記事項があれば記載）

---

## 5. 付録

### 5.1 トラブルシューティング

#### インポートエラーが発生する場合

```bash
# ビルドを再実行
pnpm --filter @repo/shared build

# TypeScriptサーバーを再起動
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### 型情報が表示されない場合

```bash
# node_modules を削除して再インストール
rm -rf node_modules
pnpm install
pnpm --filter @repo/shared build
```

### 5.2 参考リンク

- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [VSCode TypeScript](https://code.visualstudio.com/docs/typescript/typescript-compiling)
