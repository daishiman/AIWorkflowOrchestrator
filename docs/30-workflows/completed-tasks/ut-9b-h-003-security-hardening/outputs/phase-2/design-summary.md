# Phase 2: 設計 成果物 — UT-9B-H-003

## ステータス: ✅ 完了

## メタ情報

| 項目     | 内容        |
| -------- | ----------- |
| タスクID | UT-9B-H-003 |
| Phase    | 2           |
| 完了日   | 2026-02-12  |

## 設計サマリ

### 1. validatePath()

```typescript
function validatePath(inputPath: string, paramName: string): string | null;
```

**バリデーションロジック（実行順序）**:

1. 空文字列チェック: `!inputPath` → `null`
2. NULLバイトチェック: `inputPath.includes('\0')` → `null`
3. UNCパスチェック: `inputPath.startsWith('\\\\')` → `null`
4. トラバーサルチェック: `inputPath.includes('../')` または `inputPath.includes('..\')` → `null`
5. 正規化: `path.resolve(inputPath)` を返却

**適用箇所**:
| チャンネル | パラメータ |
|-----------|-----------|
| skill-creator:create | tasksDir, skillDir |
| skill-creator:execute-tasks | tasksDir, skillDir |
| skill-creator:validate | skillDir |

### 2. sanitizeErrorMessage()

```typescript
function sanitizeErrorMessage(error: unknown): string;
```

**サニタイズパターン**:
| パターン | 正規表現 | 置換後 |
|---------|---------|-------|
| Unixファイルパス | `/\/[^\s:]+/g` | [path] |
| Windowsファイルパス | `/[A-Z]:\\[^\s:]+/gi` | [path] |
| スタックトレース | `/\bat\s+.+/g` | "" |
| 機密キー値 | `/(key\|token\|secret\|password\|api[_-]?key)\s*[=:]\s*\S+/gi` | [redacted] |

**フォールバック**: "スキル作成処理でエラーが発生しました"

### 3. ALLOWED_SCHEMA_NAMES

```typescript
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;
```

### 4. エラーレスポンス統一形式

```typescript
// パスバリデーション失敗
{ success: false, error: `無効なパスが指定されました: ${paramName}` }

// schemaName失敗
{ success: false, error: `無効なスキーマ名が指定されました: ${schemaName}` }

// 内部エラー
{ success: false, error: sanitizeErrorMessage(error) }
```

### 5. ファイル内配置

```
skillCreatorHandlers.ts
├── import文
├── ALLOWED_SCHEMA_NAMES 定数
├── validatePath() 関数
├── sanitizeErrorMessage() 関数
├── registerSkillCreatorHandlers()
│   ├── detect-mode → catch: sanitizeErrorMessage
│   ├── create → validatePath + catch: sanitizeErrorMessage
│   ├── execute-tasks → validatePath + catch: sanitizeErrorMessage
│   ├── validate → validatePath + catch: sanitizeErrorMessage
│   ├── validate-schema → ALLOWED_SCHEMA_NAMES + catch: sanitizeErrorMessage
│   └── progress（変更なし）
```

## 設計判断の根拠

| 判断                                     | 根拠                                                |
| ---------------------------------------- | --------------------------------------------------- |
| ベースディレクトリ制約を設けない         | SkillCreatorServiceが動的にベースパスを決定するため |
| sanitizeErrorMessageを同一ファイルに配置 | 局所的利用のため共通化不要                          |
| ALLOWED_SCHEMA_NAMESを静的配列で定義     | スキーマ名は固定的、`as const`で型安全              |
| progressチャンネルは対策対象外           | Main→Renderer方向でRenderer入力なし                 |

## 完了条件チェック

- [x] validatePath()のシグネチャとロジックが定義されている
- [x] sanitizeErrorMessage()のシグネチャとロジックが定義されている
- [x] ALLOWED_SCHEMA_NAMESの定数定義と検証ロジックが定義されている
- [x] 各関数の適用箇所が明示されている
- [x] エラーレスポンス形式がIpcResult<T>型に準拠している
- [x] 既存パターンとの一貫性が示されている
- [x] 設計判断の根拠が記録されている
