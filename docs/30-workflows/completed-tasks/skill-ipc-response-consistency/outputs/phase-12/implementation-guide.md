# Phase 12: 実装ガイド

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 12                                        |
| ステータス | 完了                                      |
| 実行日     | 2026-02-27                                |

---

## Part 1: 概念説明（中学生レベル）

### IPC レスポンス統一とは？

想像してみてください。あなたがレストランで注文するとき、14人のウェイターが働いています。お客さん（Renderer）が料理を注文すると、ウェイター（IPC ハンドラ）がキッチン（Main Process）から料理を受け取って戻ってきます。

**問題**: 14人のウェイターが、それぞれ違う形式で料理を出していました。

- あるウェイターは「成功しました！こちらが料理です」と言って渡す（Profile A）
- 別のウェイターは無言で料理を置く（Profile B）
- また別のウェイターは「はい」か「いいえ」だけ言う（Profile C）
- エラーの時、あるウェイターはキッチンの秘密のレシピまで教えてしまう

**解決**: 全ウェイターに統一ルールを作りました。

1. **注文チェック**: お客さんの注文が正しいか3段階で確認（型チェック → 空チェック → 空白チェック）
2. **身分証確認**: お客さんが正しい人か毎回確認（validateIpcSender）
3. **エラー対応**: 問題が起きたら、キッチンの秘密は絶対に漏らさない（sanitizeErrorMessage）

### 3つのプロファイル

| プロファイル | 例え                              | 使うチャンネル数 |
| ------------ | --------------------------------- | ---------------- |
| Profile A    | 「成功/失敗」と一緒にデータを渡す | 10               |
| Profile B    | 料理をそのまま渡す                | 2                |
| Profile C    | 「はい」か「いいえ」だけ          | 2                |

---

## Part 2: 開発者向け実装詳細

### 変更概要

skillHandlers.ts の14個の IPC ハンドラに対して、以下の統一を実施。

### 1. sanitizeErrorMessage 関数

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts L33-58

const STACK_TRACE_PATTERN = /\n\s+at\s+.*/g;
const UNIX_PATH_PATTERN = /\/[\w./\\-]+/g;
const WINDOWS_PATH_PATTERN = /[A-Z]:\\[\w.\\-]+/gi;
const SENSITIVE_DATA_PATTERN = /(token|key|password|secret)=\S+/gi;
const IP_ADDRESS_PATTERN = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?/g;
const JS_RUNTIME_ERROR_PATTERN =
  /Cannot read properties? of (undefined|null).*$/;
const DEFAULT_ERROR_MESSAGE = "スキル処理でエラーが発生しました";

function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return DEFAULT_ERROR_MESSAGE;
  let message = error.message;
  if (JS_RUNTIME_ERROR_PATTERN.test(message)) return DEFAULT_ERROR_MESSAGE;
  message = message.replace(STACK_TRACE_PATTERN, "");
  message = message.replace(UNIX_PATH_PATTERN, "[path]");
  message = message.replace(WINDOWS_PATH_PATTERN, "[path]");
  message = message.replace(IP_ADDRESS_PATTERN, "[host]");
  message = message.replace(SENSITIVE_DATA_PATTERN, "$1=***");
  return message || DEFAULT_ERROR_MESSAGE;
}
```

**サニタイズルール一覧:**

| パターン          | 置換先               | 防止する情報漏洩     |
| ----------------- | -------------------- | -------------------- |
| スタックトレース  | 除去                 | ファイル構造         |
| Unixパス          | `[path]`             | サーバーパス         |
| Windowsパス       | `[path]`             | ローカルパス         |
| IPアドレス:ポート | `[host]`             | ネットワーク構成     |
| JS runtime error  | デフォルトメッセージ | 内部オブジェクト構造 |
| 機密情報(token等) | `$1=***`             | APIキー等            |
| 非Error例外       | デフォルトメッセージ | 未知の例外内容       |

### 2. optimize系バリデーション統一

```typescript
// 変更前（return方式）
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  return { success: false, error: "プロンプトが指定されていません" };
}

// 変更後（throw方式 - 他チャンネルと統一）
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "prompt must be a non-empty string",
  };
}
```

**影響チャンネル**: `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate`

### 3. 契約プロファイルとPreload対応

| Profile | Main の戻り値形式                      | Preload ユーティリティ | チャンネル                                                                                                     |
| ------- | -------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| A       | `{ success: boolean, data?, error? }`  | `safeInvokeUnwrap`     | list, scan, getImported, get-detail, execute, analyze, improve, optimize, optimize:variants, optimize:evaluate |
| B       | 直接値（ImportedSkill / RemoveResult） | `safeInvoke`           | import, remove                                                                                                 |
| C       | プリミティブ（boolean / null）         | `safeInvoke`           | abort, get-status                                                                                              |

### 4. テストアーキテクチャ

```
skillHandlers.test.ts          (70テスト) - 基本ハンドラテスト
skillHandlers.contract.test.ts (54テスト) - 契約プロファイル検証（Phase 4追加）
skillHandlers.validation.test.ts (61テスト) - P42バリデーション
skillHandlers.execute.test.ts  (18テスト) - スキル実行
skillHandlers.improve.test.ts  (18テスト) - スキル改善
skillHandlers.delegate.test.ts (11テスト) - 委譲パターン
skillHandlers.integration.test.ts (8テスト) - 統合テスト
─────────────────────────────────────────────
合計: 240テスト
```

### 5. AR制約準拠

| 制約 | 内容                                | 実装方法                            |
| ---- | ----------------------------------- | ----------------------------------- |
| AR-1 | IPC_CHANNELS 定数でチャンネル名参照 | 全14ハンドラで定数参照              |
| AR-2 | 全ハンドラで validateIpcSender      | catch外の最初の処理として実行       |
| AR-3 | sanitizeErrorMessage でサニタイズ   | 全catchブロックで適用               |
| AR-4 | P42 3段バリデーション               | typeof → === "" → .trim() === ""    |
| AR-5 | Profile A/B/C 戻り値統一            | safeInvoke/safeInvokeUnwrap使い分け |
| AR-6 | throw統一                           | optimize系の return → throw 修正    |
| AR-7 | リグレッションなし                  | 既存テスト1件の期待値修正のみ       |
