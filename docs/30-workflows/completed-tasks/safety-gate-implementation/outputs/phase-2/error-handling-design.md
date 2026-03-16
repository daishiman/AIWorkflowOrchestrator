# Phase 2: エラーハンドリング設計書

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 2                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 1. エラー分類

### 1-1. バリデーションエラー（IPC 層で発生）

| エラーコード     | 発生条件                                     | HTTP相当 | リトライ               |
| ---------------- | -------------------------------------------- | -------- | ---------------------- |
| UNAUTHORIZED     | event.sender !== mainWindow.webContents      | 401      | 不可                   |
| VALIDATION_ERROR | skillName が非文字列/空文字列/トリム空文字列 | 400      | 不可（入力修正が必要） |

### 1-2. ビジネスエラー（DefaultSafetyGate / MetadataProvider で発生）

| エラーコード        | 発生条件                       | HTTP相当 | リトライ |
| ------------------- | ------------------------------ | -------- | -------- |
| SKILL_NOT_FOUND     | 指定スキルが存在しない         | 404      | 不可     |
| HISTORY_UNAVAILABLE | スキルの実行履歴が取得できない | 503      | 可能     |

### 1-3. 内部エラー

| エラーコード   | 発生条件     | HTTP相当 | リトライ |
| -------------- | ------------ | -------- | -------- |
| INTERNAL_ERROR | 想定外の例外 | 500      | 不可     |

## 2. エラー伝搬フロー

```
SkillMetadataProvider
  │ throw { code: "SKILL_NOT_FOUND", message: "..." }
  ▼
DefaultSafetyGate.evaluate()
  │ (try-catch なし — そのまま伝搬)
  ▼
safetyGateHandlers.ts (IPC ハンドラ)
  │ catch (error: unknown) → エラーコード抽出 → サニタイズ
  ▼
Renderer プロセス
  │ { success: false, error: { code, message } }
```

### エラー抽出ロジック（IPC ハンドラ内）

```typescript
catch (error: unknown) {
  // 構造化エラーの場合: code プロパティを抽出
  const errorObj =
    error != null && typeof error === "object" && "code" in error
      ? (error as { code: string; message?: string })
      : { code: "INTERNAL_ERROR", message: "Safety evaluation failed" };

  return {
    success: false,
    error: {
      code: errorObj.code,
      message: errorObj.message ?? "Safety evaluation failed",
    },
  };
}
```

**設計判断:**

- `error` は `unknown` 型で受け取り、実行時に `typeof` / `in` 演算子で型チェック（P49 準拠）
- `as` キャストは型チェック通過後にのみ使用
- 想定外エラーは `INTERNAL_ERROR` にフォールバック

## 3. エラーサニタイズ

Renderer に返却するエラーメッセージには以下を含めない:

| 含めてはいけない情報        | 理由                       |
| --------------------------- | -------------------------- |
| ファイルシステムの絶対パス  | ディレクトリ構造の漏洩防止 |
| スタックトレース            | 内部実装の漏洩防止         |
| IPermissionStore の内部状態 | セキュリティ情報の漏洩防止 |

## 4. テストで検証すべきエラーケース

| テストID | エラーケース                                                          | 期待する戻り値                                               |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| ER-1     | metadataProvider.getRequiredTools が SKILL_NOT_FOUND を throw         | `{ success: false, error: { code: "SKILL_NOT_FOUND" } }`     |
| ER-2     | metadataProvider.getAccessPaths が HISTORY_UNAVAILABLE を throw       | `{ success: false, error: { code: "HISTORY_UNAVAILABLE" } }` |
| ER-3     | metadataProvider が Error インスタンスを throw（code プロパティなし） | `{ success: false, error: { code: "INTERNAL_ERROR" } }`      |
| I-3      | skillName が undefined                                                | `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| I-4      | skillName が空文字列                                                  | `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| I-5      | skillName がスペースのみ                                              | `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| I-6      | 不正な送信元                                                          | `{ success: false, error: { code: "UNAUTHORIZED" } }`        |
