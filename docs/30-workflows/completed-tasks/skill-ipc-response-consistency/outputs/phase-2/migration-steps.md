# 移行手順: optimize 系 throw 統一 + sanitizeErrorMessage 適用

> **Phase 2 Task 2-4 成果物**
> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **入力**: outputs/phase-1/requirements.md, outputs/phase-2/contract-profiles.md

---

## 1. 移行戦略

ハイブリッド方式を採用する。ステップ単位で移行し、各ステップ完了後にテスト実行で回帰を確認する。

### 移行順序と依存関係

```
Step 1: sanitizeErrorMessage 全 catch 適用
  |（独立。戻り値パターン変更なし）
Step 2: optimize 系バリデーション throw 統一
  |（独立。Step 1 とは異なる箇所の変更）
Step 3: skill:abort 型定義確認
  |（独立。ドキュメント対応のみ）
Step 4: 契約プロファイル表の公式化
```

各ステップは独立しているため、任意の順序で実行可能。ただし Step 1 を先に実施することで、セキュリティ上の最重要課題（G-01: エラーメッセージ未サニタイズ）を早期に解消する。

---

## 2. Step 1: sanitizeErrorMessage 全 catch 適用

### 2.1 対象箇所

| #   | チャネル                | コード行（目安） | AS-IS                                                                       | TO-BE                         |
| --- | ----------------------- | ---------------- | --------------------------------------------------------------------------- | ----------------------------- |
| 1   | skill:list              | L94-99           | `error instanceof Error ? error.message : "スキャンに失敗しました"`         | `sanitizeErrorMessage(error)` |
| 2   | skill:scan              | L115-120         | `error instanceof Error ? error.message : "スキャンに失敗しました"`         | `sanitizeErrorMessage(error)` |
| 3   | skill:getImported       | L140-145         | `error instanceof Error ? error.message : "スキル取得に失敗しました"`       | `sanitizeErrorMessage(error)` |
| 4   | skill:get-detail        | L236-240         | `error instanceof Error ? error.message : "スキル取得に失敗しました"`       | `sanitizeErrorMessage(error)` |
| 5   | skill:execute           | L309-313         | `error instanceof Error ? error.message : "スキル実行に失敗しました"`       | `sanitizeErrorMessage(error)` |
| 6   | skill:analyze           | L401-406         | `error instanceof Error ? error.message : "スキル分析に失敗しました"`       | `sanitizeErrorMessage(error)` |
| 7   | skill:improve           | L441-445         | `error instanceof Error ? error.message : "スキル改善に失敗しました"`       | `sanitizeErrorMessage(error)` |
| 8   | skill:optimize          | L467-472         | `error instanceof Error ? error.message : "プロンプト最適化に失敗しました"` | `sanitizeErrorMessage(error)` |
| 9   | skill:optimize:variants | L501-507         | `error instanceof Error ? error.message : "バリアント生成に失敗しました"`   | `sanitizeErrorMessage(error)` |
| 10  | skill:optimize:evaluate | L534-539         | `error instanceof Error ? error.message : "プロンプト評価に失敗しました"`   | `sanitizeErrorMessage(error)` |

### 2.2 変更パターン

```typescript
// AS-IS（10チャネル共通パターン）
catch (error) {
  return {
    success: false,
    error:
      error instanceof Error ? error.message : "フォールバックメッセージ",
  };
}

// TO-BE
catch (error) {
  return {
    success: false,
    error: sanitizeErrorMessage(error),
  };
}
```

### 2.3 sanitizeErrorMessage 関数の仕様（既存実装）

`skillHandlers.ts` L33-59 に既に定義されているが、catch ブロックで使用されていない。

```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return DEFAULT_ERROR_MESSAGE; // "スキル処理でエラーが発生しました"
  }
  let message = error.message;
  message = message.replace(STACK_TRACE_PATTERN, ""); // スタックトレース除去
  message = message.replace(UNIX_PATH_PATTERN, "[path]"); // Unix パス置換
  message = message.replace(WINDOWS_PATH_PATTERN, "[path]"); // Windows パス置換
  message = message.replace(SENSITIVE_DATA_PATTERN, "$1=***"); // 機密情報マスク
  return message || DEFAULT_ERROR_MESSAGE;
}
```

### 2.4 テスト影響

- 既存テストでエラーメッセージの完全一致検証をしている箇所は期待値の更新が必要
- `error.message` に含まれるパスが `[path]` に置換されるため、パスを含むエラーメッセージの期待値が変わる
- 非 Error オブジェクト（文字列 throw 等）の場合は `"スキル処理でエラーが発生しました"` に統一される

### 2.5 ロールバック方針

このステップは catch ブロック内の変更のみであり、正常系の処理パスに影響しない。問題が発生した場合は `sanitizeErrorMessage(error)` を元の `error instanceof Error ? error.message : "..."` に戻すだけで完了。

---

## 3. Step 2: optimize 系バリデーション throw 統一

### 3.1 対象箇所

| #   | チャネル                | コード行（目安） | AS-IS                                                                | TO-BE                                                                              |
| --- | ----------------------- | ---------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | skill:optimize          | L460-462         | `return { success: false, error: "プロンプトが指定されていません" }` | `throw { code: "VALIDATION_ERROR", message: "prompt must be a non-empty string" }` |
| 2   | skill:optimize:variants | L492-494         | 同上                                                                 | 同上                                                                               |
| 3   | skill:optimize:evaluate | L527-529         | 同上                                                                 | 同上                                                                               |

### 3.2 変更パターン

```typescript
// AS-IS
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  return { success: false, error: "プロンプトが指定されていません" };
}

// TO-BE
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "prompt must be a non-empty string",
  };
}
```

### 3.3 Renderer 側への影響分析

Preload 側は `safeInvokeUnwrap` を使用していないため（analyze/improve/optimize 系は skill-api.ts に未定義）、直接影響はない。ただし、将来 Preload メソッドが追加される場合を考慮すると:

- `safeInvokeUnwrap` 使用時: AS-IS では `{ success: false }` を `safeInvokeUnwrap` が `throw new Error(error)` に変換。TO-BE では Main 側の throw が Electron IPC 経由で `Promise.reject` として伝播。いずれも Renderer の catch に到達するため、Renderer 到達時の挙動は同一
- `safeInvoke` 使用時: AS-IS では `{ success: false, error }` がそのまま Renderer に到達。TO-BE では throw が `Promise.reject` として到達。Renderer 側のエラーハンドリング方式が変わるため注意が必要

### 3.4 テスト影響

- バリデーション失敗テストの期待値を変更する必要がある
  - AS-IS: `expect(result).toEqual({ success: false, error: "..." })`
  - TO-BE: `await expect(handler(...)).rejects.toThrow()` または `rejects.toEqual({ code: "VALIDATION_ERROR", message: "..." })`
- 正常系テストへの影響なし

### 3.5 ロールバック方針

3箇所の throw を return に戻すだけで完了。各チャネルは独立しているため、1チャネルずつ戻すことも可能。

---

## 4. Step 3: skill:abort 型定義確認

### 4.1 対応内容

| 項目     | 内容                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| 変更種別 | ドキュメント対応のみ（コード変更なし）                                                               |
| 対象     | `skill-api.ts` の SkillAPI インターフェース内コメント                                                |
| 理由     | Main 側が boolean を返すが、Renderer 側が戻り値を使用していないため、型定義は `Promise<void>` を維持 |

### 4.2 追加するコメント

```typescript
/**
 * 実行中のスキルを中断する
 * @param executionId - 中断対象の実行ID
 * @note Profile-C: Main側はboolean(中断成否)を返すが、
 *       Renderer側はfire-and-forgetパターンで戻り値を使用しない。
 *       型定義はvoidを維持する。
 */
abort: (executionId: string) => Promise<void>;
```

---

## 5. Step 4: 契約プロファイル表の公式化

### 5.1 対応内容

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 変更種別 | ドキュメント作成のみ                                            |
| 成果物   | `outputs/phase-2/contract-profiles.md`（作成済み）              |
| 追加対応 | skill-api.ts の JSDoc に各メソッドの Profile 分類をコメント追加 |

---

## 6. 移行実行チェックリスト

### Step 1 完了チェック

- [ ] 10チャネルの catch ブロックで `sanitizeErrorMessage(error)` が使用されている
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/skillHandlers` が PASS
- [ ] `pnpm typecheck` が成功

### Step 2 完了チェック

- [ ] 3チャネルのバリデーション失敗時が throw に変更されている
- [ ] バリデーションテストの期待値が更新されている
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/skillHandlers` が PASS

### Step 3 完了チェック

- [ ] skill-api.ts の abort メソッドに Profile-C コメントが追加されている

### Step 4 完了チェック

- [ ] contract-profiles.md が作成されている

### 全体完了チェック

- [ ] `pnpm typecheck` が成功
- [ ] `pnpm test` が全 PASS
- [ ] 全ギャップ（G-01, G-04）が解消されている
