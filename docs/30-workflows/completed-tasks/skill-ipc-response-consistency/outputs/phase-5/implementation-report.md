# Phase 5: 実装レポート (TDD Green)

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 5                                         |
| ステータス | 完了                                      |
| 実行日     | 2026-02-27                                |

---

## 変更ファイル一覧

| ファイル                                                    | 変更種別 | 内容                                                             |
| ----------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | 修正     | sanitizeErrorMessage追加、optimize系throw統一、全catchサニタイズ |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 修正     | 既存テストのエラーメッセージ期待値を新契約に合わせて更新         |

---

## 実装内容

### 変更1: sanitizeErrorMessage 関数の追加

**対象**: `skillHandlers.ts` L33-58

skillCreatorHandlers.ts と同パターンの sanitizeErrorMessage 関数を追加。以下のサニタイゼーションルールを適用:

| パターン            | 正規表現                                            | 置換先               |
| ------------------- | --------------------------------------------------- | -------------------- |
| スタックトレース    | `/\n\s+at\s+.*/g`                                   | 除去                 |
| Unixパス            | `/\/[\w./\\-]+/g`                                   | `[path]`             |
| Windowsパス         | `/[A-Z]:\\[\w.\\-]+/gi`                             | `[path]`             |
| IPアドレス:ポート   | `/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?/g`      | `[host]`             |
| JS ランタイムエラー | `/Cannot read properties? of (undefined\|null).*$/` | デフォルトメッセージ |
| 機密情報            | `/(token\|key\|password\|secret)=\S+/gi`            | `$1=***`             |
| 非Error例外         | `!(error instanceof Error)`                         | デフォルトメッセージ |

**デフォルトメッセージ**: `"スキル処理でエラーが発生しました"`

### 変更2: optimize系バリデーション統一

**対象チャンネル**:

- `skill:optimize` (L478-481)
- `skill:optimize:variants` (L512-515)
- `skill:optimize:evaluate` (L549-552)

**変更前** (不統一パターン):

```typescript
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  return { success: false, error: "プロンプトが指定されていません" };
}
```

**変更後** (統一パターン):

```typescript
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "prompt must be a non-empty string",
  };
}
```

### 変更3: 全catch ブロックの sanitizeErrorMessage 適用

**対象**: 10箇所の catch ブロック

| チャンネル              | 変更前                                                | 変更後                        |
| ----------------------- | ----------------------------------------------------- | ----------------------------- |
| skill:list              | `error.message \|\| "スキャンに失敗しました"`         | `sanitizeErrorMessage(error)` |
| skill:scan              | `error.message \|\| "スキャンに失敗しました"`         | `sanitizeErrorMessage(error)` |
| skill:getImported       | `error.message \|\| "スキル取得に失敗しました"`       | `sanitizeErrorMessage(error)` |
| skill:get-detail        | `error.message \|\| "スキル取得に失敗しました"`       | `sanitizeErrorMessage(error)` |
| skill:execute           | `error.message \|\| "スキル実行に失敗しました"`       | `sanitizeErrorMessage(error)` |
| skill:analyze           | `error.message \|\| "スキル分析に失敗しました"`       | `sanitizeErrorMessage(error)` |
| skill:improve           | `error.message \|\| "スキル改善に失敗しました"`       | `sanitizeErrorMessage(error)` |
| skill:optimize          | `error.message \|\| "プロンプト最適化に失敗しました"` | `sanitizeErrorMessage(error)` |
| skill:optimize:variants | `error.message \|\| "バリアント生成に失敗しました"`   | `sanitizeErrorMessage(error)` |
| skill:optimize:evaluate | `error.message \|\| "プロンプト評価に失敗しました"`   | `sanitizeErrorMessage(error)` |

### 変更4: log.error の追加

全catch ブロックに `log.error("[skillHandlers] <channel> failed:", error)` を追加。一部のハンドラ（list, get-detail 等）は log.error が未使用だったため統一。

---

## テスト結果

| テストファイル                    | テスト数 | 結果                   |
| --------------------------------- | -------- | ---------------------- |
| skillHandlers.contract.test.ts    | 54       | 全PASS                 |
| skillHandlers.test.ts             | 79       | 全PASS (1件期待値修正) |
| skillHandlers.validation.test.ts  | 53       | 全PASS                 |
| skillHandlers.delegate.test.ts    | 14       | 全PASS                 |
| skillHandlers.execute.test.ts     | 19       | 全PASS                 |
| skillHandlers.improve.test.ts     | 17       | 全PASS                 |
| skillHandlers.integration.test.ts | 8        | 全PASS                 |
| **合計**                          | **240**  | **全PASS**             |

### 既存テストへの影響

1件の既存テスト修正:

- `SH-SC-09`: 非Error例外のデフォルトメッセージ期待値を `"スキャンに失敗しました"` → `"スキル処理でエラーが発生しました"` に変更（sanitizeErrorMessage の統一デフォルトメッセージに合わせて）

---

## AR制約準拠確認

| 制約 | 状態 | 確認内容                                       |
| ---- | ---- | ---------------------------------------------- |
| AR-1 | ✅   | IPC_CHANNELS定数使用（ハードコード文字列なし） |
| AR-2 | ✅   | validateIpcSender全14ハンドラで使用            |
| AR-3 | ✅   | エラーサニタイズによる内部情報漏洩防止         |
| AR-4 | ✅   | P42 3段バリデーション全チャンネル適用          |
| AR-5 | ✅   | Profile A/B/C の戻り値形式統一                 |
| AR-6 | ✅   | throw統一（optimize系の return → throw 修正）  |
| AR-7 | ✅   | 既存テストリグレッションなし                   |
