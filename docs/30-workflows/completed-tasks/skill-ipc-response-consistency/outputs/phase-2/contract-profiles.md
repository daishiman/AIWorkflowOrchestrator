# 契約プロファイル定義書

> **Phase 2 Task 2-1 成果物**
> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **入力**: outputs/phase-1/contract-matrix.md

---

## 1. プロファイルカテゴリ定義

### Profile-A: ラッパー返却型

| 項目                    | 内容                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**      | 成功: `{ success: true, data: T }` / 失敗: `{ success: false, error: string }`                                                                          |
| **エラーパターン**      | try/catch で捕捉し、サニタイズ済みメッセージを `{ success: false, error }` で返却。バリデーションエラーは `throw { code: "VALIDATION_ERROR", message }` |
| **Preload 選択**        | `safeInvokeUnwrap<T>` — ラッパーを展開して `T` を Renderer に渡す                                                                                       |
| **Renderer 受け取り型** | `T`（`data` フィールドの中身）                                                                                                                          |
| **エラー時 Renderer**   | `safeInvokeUnwrap` が `throw new Error(error)` するため、Renderer は `catch` で受け取る                                                                 |
| **適用基準**            | コレクション返却、複合オブジェクト返却、実行結果返却など、`data` フィールドで結果を包むチャネル                                                         |

### Profile-B: 直接返却型

| 項目                    | 内容                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **戻り値パターン**      | 成功: `T` を直接 return / エラー: `throw { code, message }`                        |
| **エラーパターン**      | 全てのエラーを `throw` で伝播。try/catch なし（サービス層の例外はそのまま伝播）    |
| **Preload 選択**        | `safeInvoke<T>` — Main の戻り値をそのまま Renderer に渡す                          |
| **Renderer 受け取り型** | `T`（Main の戻り値そのもの）                                                       |
| **エラー時 Renderer**   | Electron IPC がエラーをシリアライズして `Promise.reject` として伝播                |
| **適用基準**            | 単一エンティティ返却（インポート結果、削除結果など）。P44/P45 で修正済みのチャネル |

### Profile-C: プリミティブ返却型

| 項目                    | 内容                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **戻り値パターン**      | `boolean` / `T \| null` などのプリミティブ値を直接返却                                                             |
| **エラーパターン**      | バリデーションエラーは `throw { code: "VALIDATION_ERROR", message }`。リソース未初期化時は `false` / `null` を返却 |
| **Preload 選択**        | `safeInvoke<T>` — Main の戻り値をそのまま Renderer に渡す                                                          |
| **Renderer 受け取り型** | `boolean` / `T \| null`                                                                                            |
| **エラー時 Renderer**   | `throw` 経由で `Promise.reject` として伝播                                                                         |
| **適用基準**            | 状態確認、中断操作など、結果がプリミティブ値のチャネル                                                             |

### Profile-D: void 返却型

| 項目                    | 内容                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| **戻り値パターン**      | 戻り値なし（副作用のみ）                                                 |
| **エラーパターン**      | `throw` で伝播                                                           |
| **Preload 選択**        | `safeInvoke<void>`                                                       |
| **Renderer 受け取り型** | `void`                                                                   |
| **適用基準**            | 副作用のみのチャネル。現時点では skill: チャネルに該当なし（将来拡張用） |

---

## 2. 全20チャネルのプロファイル分類

### skillHandlers.ts（14チャネル）

| #   | チャネル                  | AS-IS パターン                       | TO-BE プロファイル | 変更要否                                           | 変更内容                                                                  |
| --- | ------------------------- | ------------------------------------ | ------------------ | -------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | `skill:list`              | W（ラッパー）                        | **Profile-A**      | エラーサニタイズ追加                               | `error.message` → `sanitizeErrorMessage(error, "スキャンに失敗しました")` |
| 2   | `skill:scan`              | W（ラッパー）                        | **Profile-A**      | エラーサニタイズ追加                               | 同上                                                                      |
| 3   | `skill:getImported`       | W（ラッパー）                        | **Profile-A**      | エラーサニタイズ追加 + `log.error` 統一            | `sanitizeErrorMessage` 内でログ出力                                       |
| 4   | `skill:import`            | D（直接返却）                        | **Profile-B**      | なし                                               | 現状維持。P44 で修正済み                                                  |
| 5   | `skill:remove`            | D（直接返却）                        | **Profile-B**      | なし                                               | 現状維持。P45 で修正済み                                                  |
| 6   | `skill:get-detail`        | W（ラッパー）                        | **Profile-A**      | エラーサニタイズ追加                               | `error.message` → `sanitizeErrorMessage`                                  |
| 7   | `skill:execute`           | W（ラッパー）                        | **Profile-A**      | エラーサニタイズ追加                               | 二重 success はドキュメント明記で対応                                     |
| 8   | `skill:abort`             | P（boolean）                         | **Profile-C**      | Preload 型定義修正                                 | `safeInvoke<void>` → `safeInvoke<boolean>`                                |
| 9   | `skill:get-status`        | P/D（null許容）                      | **Profile-C**      | なし                                               | 現状維持（型一致）                                                        |
| 10  | `skill:analyze`           | W（ラッパー）                        | **Profile-A**      | エラーサニタイズ追加                               | `error.message` → `sanitizeErrorMessage`                                  |
| 11  | `skill:improve`           | W（ラッパー）                        | **Profile-A**      | エラーサニタイズ追加 + analysis バリデーション強化 | truthy → 型チェック                                                       |
| 12  | `skill:optimize`          | W（ラッパー、return バリデーション） | **Profile-A**      | バリデーション throw 統一 + エラーサニタイズ追加   | `return { success: false }` → `throw { code, message }`                   |
| 13  | `skill:optimize:variants` | W（ラッパー、return バリデーション） | **Profile-A**      | 同上                                               | 同上                                                                      |
| 14  | `skill:optimize:evaluate` | W（ラッパー、return バリデーション） | **Profile-A**      | 同上                                               | 同上                                                                      |

### skillFileHandlers.ts（6チャネル）

| #   | チャネル              | AS-IS パターン                 | TO-BE プロファイル | 変更要否                                   | 変更内容                                                   |
| --- | --------------------- | ------------------------------ | ------------------ | ------------------------------------------ | ---------------------------------------------------------- |
| 15  | `skill:readFile`      | W（ラッパー、safe エラー処理） | **Profile-A**      | バリデーション throw 統一                  | `return { success: false }` → `throw { code, message }`    |
| 16  | `skill:writeFile`     | W（ラッパー、data欠落）        | **Profile-A**      | data フィールド補完 + バリデーション throw | `{ success: true }` → `{ success: true, data: undefined }` |
| 17  | `skill:createFile`    | W（ラッパー、data欠落）        | **Profile-A**      | 同上                                       | 同上                                                       |
| 18  | `skill:deleteFile`    | W（ラッパー、data欠落）        | **Profile-A**      | data フィールド補完 + バリデーション throw | 同上                                                       |
| 19  | `skill:listBackups`   | W（ラッパー、safe エラー処理） | **Profile-A**      | バリデーション throw 統一                  | `return { success: false }` → `throw { code, message }`    |
| 20  | `skill:restoreBackup` | W（ラッパー、data欠落）        | **Profile-A**      | data フィールド補完 + バリデーション throw | 同上                                                       |

---

## 3. プロファイル分布サマリー

| プロファイル              | チャネル数 | 対象                                                                                                                                                                                                                                                                                    |
| ------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile-A（ラッパー）     | 16         | skill:list, skill:scan, skill:getImported, skill:get-detail, skill:execute, skill:analyze, skill:improve, skill:optimize, skill:optimize:variants, skill:optimize:evaluate, skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup |
| Profile-B（直接返却）     | 2          | skill:import, skill:remove                                                                                                                                                                                                                                                              |
| Profile-C（プリミティブ） | 2          | skill:abort, skill:get-status                                                                                                                                                                                                                                                           |
| Profile-D（void）         | 0          | （将来拡張用）                                                                                                                                                                                                                                                                          |
| **合計**                  | **20**     |                                                                                                                                                                                                                                                                                         |

---

## 4. TO-BE 状態の契約一覧

### Profile-A チャネルの TO-BE

```typescript
// 統一パターン（Profile-A）
ipcMain.handle(CHANNEL, async (event, args) => {
  // Step 1: 送信元検証
  const validation = validateIpcSender(event, CHANNEL, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) throw toIPCValidationError(validation);

  // Step 2: バリデーション（throw 統一）
  if (typeof args?.param !== "string" || args.param.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "param must be a non-empty string",
    };
  }

  // Step 3: ビジネスロジック
  try {
    const result = await service.operation(args.param);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: sanitizeErrorMessage(error, "操作に失敗しました"),
    };
  }
});
```

### Profile-B チャネルの TO-BE

```typescript
// 統一パターン（Profile-B）
ipcMain.handle(CHANNEL, async (event, param: string) => {
  // Step 1: 送信元検証
  const validation = validateIpcSender(event, CHANNEL, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) throw toIPCValidationError(validation);

  // Step 2: P42 準拠バリデーション
  if (typeof param !== "string" || param.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "param must be a non-empty string",
    };
  }

  // Step 3: ビジネスロジック（例外はそのまま throw で伝播）
  return service.operation(param);
});
```

### Profile-C チャネルの TO-BE

```typescript
// 統一パターン（Profile-C）
ipcMain.handle(CHANNEL, async (event, param: string) => {
  // Step 1: 送信元検証
  const validation = validateIpcSender(event, CHANNEL, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) throw toIPCValidationError(validation);

  // Step 2: P42 準拠バリデーション
  if (typeof param !== "string" || param.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "param must be a non-empty string",
    };
  }

  // Step 3: プリミティブ返却
  if (!instance) return false; // or null
  return instance.operation(param);
});
```
