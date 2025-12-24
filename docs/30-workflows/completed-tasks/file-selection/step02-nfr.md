# ファイル選択機能 - 非機能要件詳細仕様書

> **ドキュメントID**: CONV-01-NFR
> **作成日**: 2025-12-16
> **作成者**: .claude/agents/req-analyst.md, .claude/agents/electron-security.md
> **ステータス**: 承認待ち
> **関連ドキュメント**: [step01-requirements.md](./step01-requirements.md)

---

## 1. 概要

本ドキュメントは、ファイル選択機能の非機能要件（NFR: Non-Functional Requirements）を技術実装レベルで詳細に定義する。

### 1.1 目的

- セキュリティ、パフォーマンス、ユーザビリティの具体的な実装指針を提供
- Electronアプリケーション特有のセキュリティリスクへの対策を明確化
- TDD対応のテスト可能な非機能要件基準の設定

### 1.2 対象読者

- 実装エンジニア（.claude/agents/electron-ui-dev.md, .claude/agents/sec-auditor.md）
- テストエンジニア（.claude/agents/unit-tester.md, .claude/agents/e2e-tester.md）
- セキュリティレビュアー（.claude/agents/electron-security.md）

---

## 2. セキュリティ要件（NFR-SEC）

### 2.1 IPC通信のセキュリティ（NFR-SEC-001）

#### 要件

| 項目   | 内容                                                                 |
| ------ | -------------------------------------------------------------------- |
| 要件ID | NFR-SEC-001                                                          |
| 優先度 | Critical                                                             |
| 説明   | Electron IPC通信を安全に実装し、XSS/コードインジェクション攻撃を防ぐ |

#### 実装要件

| 項目             | 要求事項                                             |
| ---------------- | ---------------------------------------------------- |
| nodeIntegration  | `false` に設定（必須）                               |
| contextIsolation | `true` に設定（必須）                                |
| sandbox          | `true` に設定（推奨）                                |
| contextBridge    | すべてのIPC通信はcontextBridge経由で公開             |
| IPC引数検証      | すべての引数をZodスキーマで検証                      |
| 許可リスト方式   | 許可されたチャネルのみ通信可能（ホワイトリスト管理） |

#### 実装例

```typescript
// apps/desktop/src/main/preload.ts
import { contextBridge, ipcRenderer } from "electron";
import { z } from "zod";

// Zodスキーマ定義
const OpenDialogRequestSchema = z.object({
  title: z.string().optional(),
  multiSelections: z.boolean().optional(),
  filters: z
    .array(
      z.object({
        name: z.string(),
        extensions: z.array(z.string()),
      }),
    )
    .optional(),
});

// 許可されたチャネルのホワイトリスト
const ALLOWED_CHANNELS = [
  "file:open-dialog",
  "file:get-metadata",
  "file:validate-path",
] as const;

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: async (request: unknown) => {
    // 入力検証
    const validated = OpenDialogRequestSchema.parse(request);
    return ipcRenderer.invoke("file:open-dialog", validated);
  },
});
```

#### テスト基準

```gherkin
Given 悪意のあるスクリプトがIPC通信を試みる
When nodeIntegrationが無効化されている
Then スクリプトの実行が阻止される
And contextBridgeで公開されたAPIのみが利用可能

Given 不正なIPC引数が送信される
When Zodバリデーションが実行される
Then エラーが返される
And 処理が中断される
```

---

### 2.2 ファイルパス検証（NFR-SEC-002）

#### 要件

| 項目   | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 要件ID | NFR-SEC-002                                                              |
| 優先度 | Critical                                                                 |
| 説明   | パストラバーサル攻撃を防ぎ、許可されたディレクトリのみアクセス可能にする |

#### 実装要件

| 項目                     | 要求事項                                           |
| ------------------------ | -------------------------------------------------- |
| パス正規化               | `path.normalize()` で正規化                        |
| 絶対パス変換             | `path.resolve()` で絶対パスに変換                  |
| ディレクトリトラバーサル | `..` を含むパスを拒否                              |
| シンボリックリンク検証   | `fs.realpath()` でリンク先を確認                   |
| 許可ディレクトリ検証     | ホームディレクトリ外へのアクセスを制限（設定可能） |

#### 実装例

```typescript
// apps/desktop/src/main/utils/path-validator.ts
import path from "path";
import fs from "fs/promises";
import os from "os";

export async function validateFilePath(filePath: string): Promise<boolean> {
  try {
    // 1. 正規化
    const normalized = path.normalize(filePath);

    // 2. 絶対パスに変換
    const absolute = path.resolve(normalized);

    // 3. パストラバーサル検証
    if (absolute.includes("..")) {
      return false;
    }

    // 4. シンボリックリンク解決
    const realPath = await fs.realpath(absolute);

    // 5. 許可ディレクトリ内か確認（ホームディレクトリ内のみ許可）
    const homeDir = os.homedir();
    if (!realPath.startsWith(homeDir)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
```

#### テスト基準

```gherkin
Given ユーザーが "../../../etc/passwd" というパスを指定
When パス検証が実行される
Then 検証が失敗する
And ファイルアクセスが拒否される

Given ユーザーがシンボリックリンクを指定
When リンク先が許可ディレクトリ外
Then 検証が失敗する
```

---

### 2.3 入力検証（NFR-SEC-003）

#### 要件

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| 要件ID | NFR-SEC-003                                               |
| 優先度 | High                                                      |
| 説明   | すべてのユーザー入力をZodスキーマで検証し、型安全性を確保 |

#### Zodスキーマ定義

```typescript
// packages/shared/src/schemas/file-selection.schema.ts
import { z } from "zod";

// ファイルフィルタ型
export const FileFilterSchema = z.enum([
  "all",
  "office",
  "text",
  "media",
  "image",
]);

// ファイルメタ情報スキーマ
export const SelectedFileSchema = z.object({
  id: z.string().uuid(),
  path: z.string().min(1),
  name: z.string().min(1),
  extension: z.string().regex(/^\.[a-z0-9]+$/i),
  size: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  lastModified: z.date(),
  createdAt: z.date(),
});

// IPC通信スキーマ
export const OpenDialogRequestSchema = z.object({
  title: z.string().max(100).optional(),
  multiSelections: z.boolean().optional(),
  filters: z
    .array(
      z.object({
        name: z.string().max(50),
        extensions: z.array(z.string().max(10)),
      }),
    )
    .max(10)
    .optional(),
});

export const GetMetadataRequestSchema = z.object({
  filePath: z.string().min(1).max(1000),
});
```

#### テスト基準

```gherkin
Given 不正な拡張子（数字のみ "123"）が入力される
When Zodバリデーションが実行される
Then バリデーションエラーが返される

Given ファイルパスが1001文字以上
When Zodバリデーションが実行される
Then バリデーションエラーが返される
```

---

## 3. パフォーマンス要件（NFR-PERF）

### 3.1 応答時間（NFR-PERF-001）

#### 要件

| 項目   | 内容                                     |
| ------ | ---------------------------------------- |
| 要件ID | NFR-PERF-001                             |
| 優先度 | High                                     |
| 説明   | すべての操作に対して応答時間の上限を設定 |

#### 測定基準

| 操作                        | 目標値（95パーセンタイル） | 最大許容値 |
| --------------------------- | -------------------------- | ---------- |
| ダイアログ表示              | < 150ms                    | < 300ms    |
| ファイルメタ情報取得（1件） | < 30ms                     | < 100ms    |
| 10ファイル選択              | < 500ms                    | < 1000ms   |
| 100ファイル選択             | < 1.5秒                    | < 3秒      |
| ドロップゾーンハイライト    | < 50ms                     | < 150ms    |

#### 実装要件

| 項目               | 要求事項                                            |
| ------------------ | --------------------------------------------------- |
| 並列処理           | 複数ファイルのメタ情報取得は `Promise.all` で並列化 |
| タイムアウト設定   | IPC通信に3秒のタイムアウトを設定                    |
| パフォーマンス計測 | `performance.mark()` でボトルネック測定             |
| プログレス表示     | 10ファイル以上の場合は進捗バーを表示                |

#### 実装例

```typescript
// apps/desktop/src/renderer/hooks/useFileSelection.ts
import { performance } from "perf_hooks";

async function getMultipleMetadata(filePaths: string[]) {
  const start = performance.now();

  // 並列処理
  const results = await Promise.all(
    filePaths.map((path) =>
      window.electronAPI
        .getMetadata(path)
        .catch((error) => ({ success: false, error })),
    ),
  );

  const end = performance.now();
  const duration = end - start;

  // パフォーマンス目標確認
  if (duration > 3000) {
    console.warn(`Metadata retrieval took ${duration}ms (target: <3000ms)`);
  }

  return results;
}
```

#### テスト基準

```gherkin
Given ユーザーが10ファイルを選択
When メタ情報取得が並列実行される
Then 500ms以内に完了する

Given ユーザーが100ファイルを選択
When メタ情報取得が並列実行される
Then 1.5秒以内に完了する
```

---

### 3.2 メモリ使用量（NFR-PERF-002）

#### 要件

| 項目   | 内容                                             |
| ------ | ------------------------------------------------ |
| 要件ID | NFR-PERF-002                                     |
| 優先度 | Medium                                           |
| 説明   | メモリリークを防ぎ、大量ファイル選択時も安定動作 |

#### 実装要件

| 項目             | 要求事項                                       |
| ---------------- | ---------------------------------------------- |
| メモリ上限       | ファイルリスト保持に100MB以上使用しない        |
| ページネーション | 1000ファイル以上の選択時は仮想スクロールを使用 |
| クリーンアップ   | コンポーネントアンマウント時にリスナーを削除   |
| WeakMap使用      | ファイルオブジェクトの参照をWeakMapで管理      |

---

## 4. ユーザビリティ要件（NFR-UX）

### 4.1 アクセシビリティ（NFR-UX-001）

#### 要件

| 項目   | 内容                                          |
| ------ | --------------------------------------------- |
| 要件ID | NFR-UX-001                                    |
| 優先度 | High                                          |
| 説明   | WCAG 2.1 Level AA準拠、キーボード操作完全対応 |

#### 実装要件

| 項目                     | 要求事項                                          |
| ------------------------ | ------------------------------------------------- |
| ARIA属性                 | すべてのインタラクティブ要素にrole/aria-label設定 |
| キーボードナビゲーション | Tab/Shift+Tab/Enter/Escape/Spaceで完全操作可能    |
| フォーカス管理           | フォーカストラップ、フォーカス可視化              |
| スクリーンリーダー対応   | 状態変化を `aria-live` で通知                     |
| コントラスト比           | テキストとボタンのコントラスト比 4.5:1以上        |

#### 実装例

```typescript
// FileSelector.tsx
<button
  onClick={handleOpenDialog}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenDialog();
    }
  }}
  aria-label="ファイル選択ダイアログを開く"
  aria-describedby="file-selector-help"
>
  ファイルを選択
</button>

<div
  role="region"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {files.length}個のファイルが選択されています
</div>
```

#### テスト基準

```gherkin
Given スクリーンリーダーが有効
When ファイルが選択される
Then "1個のファイルが選択されています"と読み上げられる

Given キーボードのみで操作
When Tabキーでボタンにフォーカス後Enterキーを押す
Then ダイアログが開く
```

---

### 4.2 視覚的フィードバック（NFR-UX-002）

#### 要件

| 項目   | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| 要件ID | NFR-UX-002                                                 |
| 優先度 | High                                                       |
| 説明   | すべてのインタラクションに即座の視覚的フィードバックを提供 |

#### 実装要件

| 状態         | 視覚的フィードバック                   | 表示タイミング |
| ------------ | -------------------------------------- | -------------- |
| ホバー       | 背景色変化、ボーダーハイライト         | < 16ms         |
| フォーカス   | アウトラインリング表示                 | < 16ms         |
| ドラッグ中   | ドロップゾーンハイライト、カーソル変更 | < 50ms         |
| ローディング | スピナー + プログレスバー（10件以上）  | < 100ms        |
| エラー       | 赤色アラート + エラーアイコン          | 即座           |
| 成功         | 緑色チェックマーク（フェードアウト）   | 即座           |

---

## 5. 可用性要件（NFR-AVAIL）

### 5.1 エラーハンドリング（NFR-AVAIL-001）

#### 要件

| 項目   | 内容                                                             |
| ------ | ---------------------------------------------------------------- |
| 要件ID | NFR-AVAIL-001                                                    |
| 優先度 | High                                                             |
| 説明   | すべてのエラーを適切にハンドリングし、ユーザーに分かりやすく通知 |

#### エラー分類と対応

| エラー分類                 | HTTPステータス相当 | ユーザーへの表示例                               | リトライ可否 |
| -------------------------- | ------------------ | ------------------------------------------------ | ------------ |
| ファイルアクセス権限エラー | 403                | "このファイルにアクセスする権限がありません"     | 不可         |
| ファイル未検出             | 404                | "ファイルが見つかりませんでした"                 | 可能         |
| パス検証エラー             | 400                | "不正なファイルパスです"                         | 不可         |
| IPC通信タイムアウト        | 504                | "処理がタイムアウトしました。再試行してください" | 可能         |
| 予期しないエラー           | 500                | "エラーが発生しました。再起動してください"       | 可能         |

#### 実装例

```typescript
// apps/desktop/src/renderer/utils/error-handler.ts
export interface FileSelectionError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
}

export function handleFileError(error: unknown): FileSelectionError {
  if (error instanceof Error) {
    // エラーコードに基づく分類
    if (error.message.includes("EACCES")) {
      return {
        code: "FILE_ACCESS_DENIED",
        message: error.message,
        userMessage: "このファイルにアクセスする権限がありません",
        retryable: false,
      };
    }

    if (error.message.includes("ENOENT")) {
      return {
        code: "FILE_NOT_FOUND",
        message: error.message,
        userMessage: "ファイルが見つかりませんでした",
        retryable: true,
      };
    }
  }

  // デフォルトエラー
  return {
    code: "UNKNOWN_ERROR",
    message: String(error),
    userMessage: "エラーが発生しました。再起動してください",
    retryable: true,
  };
}
```

#### テスト基準

```gherkin
Given ファイルアクセス権限がない
When ファイル選択を試みる
Then "アクセス権限がありません"と表示される
And リトライボタンは表示されない

Given ファイルが削除されている
When メタ情報取得を試みる
Then "ファイルが見つかりませんでした"と表示される
And リトライボタンが表示される
```

---

### 5.2 オフライン対応（NFR-AVAIL-002）

#### 要件

| 項目   | 内容                                 |
| ------ | ------------------------------------ |
| 要件ID | NFR-AVAIL-002                        |
| 優先度 | Medium                               |
| 説明   | ネットワーク接続なしで完全に動作する |

#### 実装要件

- すべての処理がローカルで完結
- 外部APIへの依存なし
- オフライン状態の検知と通知（将来のクラウド連携時のため）

---

## 6. 互換性要件（NFR-COMPAT）

### 6.1 クロスプラットフォーム対応（NFR-COMPAT-001）

#### 要件

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| 要件ID | NFR-COMPAT-001                        |
| 優先度 | High                                  |
| 説明   | macOS/Windows/Linuxで同一の動作を保証 |

#### 実装要件

| 項目                | 要求事項                              |
| ------------------- | ------------------------------------- |
| パス区切り文字      | `path.sep` を使用、ハードコード禁止   |
| 改行コード          | `os.EOL` を使用                       |
| ファイルシステムAPI | `fs.promises` を使用（同期APIは禁止） |
| ダイアログAPI       | Electron dialog APIの互換性を確認     |

#### テスト基準

```gherkin
Given macOS環境
When ファイル選択を実行
Then Windowsと同じ結果が得られる

Given Windowsのパス（C:\Users\...）
When パス処理が実行される
Then 正しく正規化される
```

---

## 7. 保守性要件（NFR-MAINT）

### 7.1 テストカバレッジ（NFR-MAINT-001）

#### 要件

| 項目   | 内容                          |
| ------ | ----------------------------- |
| 要件ID | NFR-MAINT-001                 |
| 優先度 | High                          |
| 説明   | テストカバレッジ80%以上を維持 |

#### カバレッジ目標

| 測定対象           | 目標カバレッジ |
| ------------------ | -------------- |
| Line Coverage      | ≥ 80%          |
| Branch Coverage    | ≥ 75%          |
| Function Coverage  | ≥ 85%          |
| Statement Coverage | ≥ 80%          |

---

### 7.2 コード品質（NFR-MAINT-002）

#### 要件

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| 要件ID | NFR-MAINT-002                      |
| 優先度 | High                               |
| 説明   | TypeScript strict mode、ESLint準拠 |

#### 実装要件

| 項目                    | 要求事項                          |
| ----------------------- | --------------------------------- |
| TypeScript strictモード | `tsconfig.json` で `strict: true` |
| ESLintエラー            | 0件（警告は許容しない）           |
| Prettier整形            | すべてのファイルでPrettier適用    |
| JSDoc記述               | すべての公開関数・型にJSDoc記述   |

---

## 8. 検証方法

### 8.1 セキュリティ検証

```bash
# Electronセキュリティチェッカー
pnpm exec electronegativity --input apps/desktop

# Zodスキーマ検証テスト
pnpm --filter @repo/shared test:schemas
```

### 8.2 パフォーマンス検証

```bash
# パフォーマンステスト
pnpm --filter @repo/desktop test:performance

# Lighthouseベンチマーク
pnpm exec lighthouse-ci
```

### 8.3 アクセシビリティ検証

```bash
# axe-core自動検証
pnpm --filter @repo/desktop test:a11y

# 手動キーボード操作テスト
# スクリーンリーダー検証（VoiceOver/NVDA）
```

---

## 9. 承認

| 役割                   | 名前               | 日付       | 承認状況 |
| ---------------------- | ------------------ | ---------- | -------- |
| NFR定義者              | .claude/agents/req-analyst.md       | 2025-12-16 | 作成済み |
| セキュリティレビュアー | .claude/agents/electron-security.md |            | 未承認   |
| パフォーマンス確認     | .claude/agents/code-quality.md      |            | 未承認   |
| 最終承認者             |                    |            | 未承認   |

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 変更者                           |
| ---------- | ---------- | -------- | -------------------------------- |
| 1.0        | 2025-12-16 | 初版作成 | .claude/agents/req-analyst.md, .claude/agents/electron-security.md |
