# セキュリティレビュー

## メタ情報

| 項目   | 内容                                                 |
| ------ | ---------------------------------------------------- |
| Phase  | 3                                                    |
| タスク | 4                                                    |
| 対象   | schema-design.md, error-handling-design.md           |
| 参照   | security-principles.md, security-input-validation.md |
| 作成日 | 2026-01-24                                           |

---

## 1. データ保護

### 1.1 機密情報の分類

| データ種別           | 機密レベル | 設計での対応                  | 評価    |
| -------------------- | ---------- | ----------------------------- | ------- |
| スキル名             | 内部       | バリデーション実施            | ✅ 適切 |
| 権限設定             | 機密       | electron-store (ローカル保存) | ✅ 適切 |
| メタデータキャッシュ | 内部       | ローカルファイルに保存        | ✅ 適切 |
| 最終使用日時         | 内部       | プライバシー考慮不要          | ✅ 適切 |

### 1.2 保存場所のセキュリティ

| 項目         | 設計での対応                          | 評価    |
| ------------ | ------------------------------------- | ------- |
| ストレージ   | electron-store (ユーザーディレクトリ) | ✅ 適切 |
| 暗号化       | OSレベルの保護 (FileVault/BitLocker)  | ✅ 適切 |
| アクセス制御 | Electronプロセス内のみアクセス可能    | ✅ 適切 |

**security-principles.md準拠確認**:

- ✅ 機密情報のソースコード内ハードコード: なし
- ✅ localStorage/IndexedDB使用: なし（Main Process）
- ✅ コンソールログへの機密情報出力: エラーログのみ、データ本体なし

---

## 2. 入力バリデーション

### 2.1 スキル名検証

**schema-design.md L219-232 の設計**:

```typescript
const SKILL_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

function validateSkillName(name: string): boolean {
  return SKILL_NAME_PATTERN.test(name);
}
```

| 検証項目         | 対策                             | 評価    |
| ---------------- | -------------------------------- | ------- |
| 最小長           | 1文字以上                        | ✅ 適切 |
| 最大長           | 128文字以下                      | ✅ 適切 |
| 許可文字         | 英数字、ハイフン、アンダースコア | ✅ 適切 |
| パストラバーサル | `/`, `\`, `..` 禁止              | ✅ 適切 |
| Null byte        | `\0` 禁止                        | ✅ 適切 |
| URL encoding     | `%2e` 等禁止（パターン外）       | ✅ 適切 |

**security-input-validation.md準拠確認**:

- ✅ ホワイトリスト方式: 正規表現で許可パターンを定義
- ✅ 長さ制限: 最大128文字
- ✅ サーバーサイド必須: Main Processでバリデーション

### 2.2 ツール名検証

**api-design.md L497-502 の設計**:

```typescript
function validateToolName(name: string): void {
  if (!name || typeof name !== "string") {
    throw new Error("Tool name is required");
  }
}
```

| 検証項目     | 対策                  | 評価    |
| ------------ | --------------------- | ------- |
| 必須チェック | 空文字・undefined拒否 | ✅ 適切 |
| 型チェック   | string型のみ許可      | ✅ 適切 |

---

## 3. パストラバーサル対策

### 3.1 スキル名によるファイルパス構築

| リスク       | 対策                           | 評価    |
| ------------ | ------------------------------ | ------- |
| `../` 攻撃   | SKILL_NAME_PATTERN で `/` 禁止 | ✅ 適切 |
| `..\\` 攻撃  | SKILL_NAME_PATTERN で `\` 禁止 | ✅ 適切 |
| Null byte    | パターンで `\0` 禁止           | ✅ 適切 |
| URL encoding | `%2e` 等はパターン外で拒否     | ✅ 適切 |

**slideSettingsStore.ts との比較**:

```typescript
// slideSettingsStore.ts L75-96 (参考)
function detectPathTraversal(targetPath: string): string | null {
  if (targetPath.includes("\0")) return "Invalid path: null byte detected";
  if (targetPath.includes("..")) return "Path traversal not allowed";
  if (targetPath.includes("%2e"))
    return "URL encoded path traversal not allowed";
  return null;
}

// SkillImportStore設計
// SKILL_NAME_PATTERN で事前に許可文字のみに制限
// → パストラバーサル文字は許可されない
```

**評価**: ✅ PASS - ホワイトリスト方式でより強固

### 3.2 キャッシュ内パスの検証

| シナリオ               | 対策                                 | 評価    |
| ---------------------- | ------------------------------------ | ------- |
| SkillMetadata.path     | スキャナーで生成（ユーザー入力なし） | ✅ 適切 |
| キャッシュデータ改ざん | JSON Schemaでバリデーション          | ✅ 適切 |

---

## 4. エラー情報漏洩防止

### 4.1 エラーメッセージ

| エラー種別   | メッセージ内容                   | 評価    |
| ------------ | -------------------------------- | ------- |
| 無効スキル名 | "Invalid skill name: {name}"     | ⚠️ 注意 |
| スキル未存在 | 静かに無視                       | ✅ 適切 |
| ストア破損   | "Failed to read imported skills" | ✅ 適切 |

**MINOR指摘**:

- "Invalid skill name: {name}" で入力値がエラーメッセージに含まれる
- 悪意ある入力がログに残る可能性
- **対策**: 入力値の長さを制限してログ出力、または入力値をマスク

### 4.2 IPC経由のエラー伝搬

**error-handling-design.md L247-282**:

```typescript
ipcMain.handle("skill:addImport", async (_, skillName: string) => {
  try {
    skillImportStore.addImport(skillName);
    return { success: true };
  } catch (error) {
    if (isSkillStoreError(error)) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message, // 内部メッセージ
          retryable: error.retryable,
        },
      };
    }
    return {
      success: false,
      error: {
        code: SKILL_STORE_ERRORS.INTERNAL_ERROR,
        message: "An unexpected error occurred", // 一般化されたメッセージ
        retryable: false,
      },
    };
  }
});
```

| シナリオ         | 対応                     | 評価    |
| ---------------- | ------------------------ | ------- |
| 既知エラー       | コード化されたメッセージ | ✅ 適切 |
| 未知エラー       | 一般化されたメッセージ   | ✅ 適切 |
| スタックトレース | Rendererに送信しない     | ✅ 適切 |

---

## 5. JSON Schema バリデーション

### 5.1 ストアデータの検証

**schema-design.md L155-211**:

| フィールド     | バリデーション                       | 評価    |
| -------------- | ------------------------------------ | ------- |
| schemaVersion  | number, minimum: 1                   | ✅ 適切 |
| importedSkills | object, additionalProperties定義     | ✅ 適切 |
| skillSettings  | object, additionalProperties定義     | ✅ 適切 |
| name           | string, minLength: 1, maxLength: 128 | ✅ 適切 |
| status         | enum: ["active", "disabled"]         | ✅ 適切 |
| 日時フィールド | format: "date-time"                  | ✅ 適切 |

### 5.2 データ改ざん防止

| シナリオ         | 対策                               | 評価    |
| ---------------- | ---------------------------------- | ------- |
| ファイル直接編集 | 起動時にJSON Schema検証            | ✅ 適切 |
| 不正な値挿入     | electron-storeで自動バリデーション | ✅ 適切 |
| スキーマ不一致   | マイグレーションで修復             | ✅ 適切 |

---

## 6. アクセス制御

### 6.1 Electronプロセス分離

| 観点             | 設計での対応                   | 評価    |
| ---------------- | ------------------------------ | ------- |
| Main Process限定 | ストアはMain Processでのみ動作 | ✅ 適切 |
| IPC経由アクセス  | contextBridge使用              | ✅ 適切 |
| Renderer分離     | nodeIntegration: false想定     | ✅ 適切 |

### 6.2 権限記憶の安全性

| リスク         | 対策                         | 評価    |
| -------------- | ---------------------------- | ------- |
| 不正な権限上昇 | スキル単位で権限を分離       | ✅ 適切 |
| 権限の永続化   | ユーザー明示的な設定のみ記憶 | ✅ 適切 |
| 権限のリセット | removeImportで関連設定も削除 | ✅ 適切 |

---

## 7. セキュリティチェックリスト

### 7.1 OWASP準拠確認

| 脆弱性カテゴリ         | 関連性 | 対策状況                       |
| ---------------------- | ------ | ------------------------------ |
| インジェクション       | 低     | 入力バリデーション実施         |
| 認証破綻               | N/A    | 認証機能なし                   |
| 機密データ露出         | 低     | ローカルストレージ、暗号化不要 |
| XXE                    | N/A    | XML使用なし                    |
| アクセス制御           | 低     | Main Process限定               |
| セキュリティ設定       | 低     | electron-storeデフォルト設定   |
| XSS                    | N/A    | Main Process、DOM操作なし      |
| 安全でない逆シリアル化 | 低     | JSON.parse使用、型検証あり     |
| 既知の脆弱性           | 低     | electron-store最新版使用       |
| ログ・監視不足         | 低     | エラーログ出力設計済み         |

### 7.2 Electron固有のセキュリティ

| 項目             | 設計での対応         | 評価    |
| ---------------- | -------------------- | ------- |
| contextIsolation | ストアはMain Process | ✅ 適切 |
| nodeIntegration  | IPC経由でアクセス    | ✅ 適切 |
| sandbox          | Renderer影響なし     | ✅ 適切 |

---

## 8. 発見された問題

### 8.1 MINOR: エラーメッセージに入力値が含まれる

| 項目   | 内容                                   |
| ------ | -------------------------------------- |
| 重要度 | MINOR                                  |
| 箇所   | validateSkillName エラーメッセージ     |
| リスク | 悪意ある入力がログに残る可能性         |
| 対策案 | 入力値を最初の20文字に制限してログ出力 |

**修正提案**:

```typescript
// 現在
throw new Error(`Invalid skill name: ${name}`);

// 修正後
const truncatedName = name.length > 20 ? name.slice(0, 20) + "..." : name;
throw new SkillStoreError(
  SKILL_STORE_ERRORS.INVALID_SKILL_NAME,
  `Invalid skill name: ${truncatedName}`,
);
```

---

## 9. レビュー結果

| 観点             | 結果                                    |
| ---------------- | --------------------------------------- |
| データ保護       | ✅ PASS - 適切な機密レベル分類          |
| 入力検証         | ✅ PASS - ホワイトリスト方式で堅牢      |
| ファイルアクセス | ✅ PASS - パストラバーサル対策済み      |
| エラー情報       | ⚠️ MINOR - 入力値のログ出力に改善の余地 |

---

## 10. 結論

**判定: MINOR**

セキュリティ設計は全体的に適切だが、1件のMINOR指摘がある。

**MINOR指摘**:

- エラーメッセージに入力値が含まれる（入力値長制限で対策可能）

**対応方針**:

- Phase 5（実装）時にエラーメッセージを修正
- 入力値を最初の20文字に制限してログ出力

**総合評価**: 実装を進めて問題なし。MINOR指摘は実装時に対応する。
