# 型変換設計

## メタ情報

| 項目         | 値                                         |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名       | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日       | 2026-02-09                                 |
| 仕様書参照先 | phase-02-design.md                         |

---

## 1. 入力型変換

### 1.1 ハンドラー引数 → SkillExecutionRequest

#### 元の型定義（ハンドラー引数）

```typescript
/**
 * ハンドラー引数の型定義
 */
interface SkillExecuteHandlerArgs {
  skillId: string;
  params?: {
    prompt?: string;
    timeout?: number;
    sessionId?: string;
    retryConfig?: Partial<RetryConfig>;
  };
}
```

#### 変換先の型定義（SkillExecutionRequest）

```typescript
/**
 * SkillExecutor.execute() が期待する SkillExecutionRequest
 * (apps/desktop/src/main/services/skill/SkillExecutor.ts で定義)
 */
interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
  sessionId?: string;
  retryConfig?: Partial<RetryConfig>;
}
```

#### フィールドマッピング

| ハンドラー引数           | SkillExecutionRequest | 必須/任意 | 変換ロジック                 |
| ------------------------ | --------------------- | --------- | ---------------------------- |
| args.skillId             | skillId               | 必須      | そのまま渡す                 |
| args.params?.prompt      | prompt                | 必須      | trim() して渡す              |
| args.params?.timeout     | timeout               | 任意      | number型の場合のみ渡す       |
| args.params?.sessionId   | sessionId             | 任意      | string型の場合のみ渡す       |
| args.params?.retryConfig | retryConfig           | 任意      | Partial<RetryConfig>型で渡す |

#### 変換関数

```typescript
/**
 * ハンドラー引数から SkillExecutionRequest を構築
 * @param args - ハンドラーが受け取った引数
 * @returns SkillExecutionRequest オブジェクト
 */
function buildSkillExecutionRequest(
  args: SkillExecuteHandlerArgs,
): SkillExecutionRequest {
  return {
    skillId: args.skillId,
    prompt: (args.params?.prompt ?? "").trim(),
    timeout:
      typeof args.params?.timeout === "number"
        ? args.params.timeout
        : undefined,
    sessionId:
      typeof args.params?.sessionId === "string"
        ? args.params.sessionId
        : undefined,
    retryConfig: args.params?.retryConfig,
  };
}
```

---

## 2. メタデータ変換

### 2.1 Skill → SkillMetadata

#### 元の型定義（Skill）

```typescript
/**
 * Skill 型（packages/shared/src/types/skill.ts）
 */
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: SkillCategory | string;
  environment?: EnvironmentConfig;
  license?: string;
  allowedTools?: string[];
  tags?: string[];
  dependencies?: string[];
  lastModified: Date; // <- 除外対象
}
```

#### 変換先の型定義（SkillMetadata）

```typescript
/**
 * SkillMetadata 型（SkillExecutor.ts で定義）
 * Skill型から lastModified を除外した型
 */
interface SkillMetadata extends Omit<Skill, "lastModified"> {
  // Skill型から継承（lastModified を除く）
}
```

#### 変換関数

```typescript
/**
 * Skill から SkillMetadata に変換
 * @param skill - Skillオブジェクト
 * @returns SkillMetadata オブジェクト（lastModified除外）
 */
function toSkillMetadata(skill: Skill): SkillMetadata {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lastModified, ...metadata } = skill;
  return metadata;
}
```

#### フィールド一覧

| フィールド   | 型                      | 継承 | 備考               |
| ------------ | ----------------------- | ---- | ------------------ |
| id           | string                  | YES  | スキルID           |
| name         | string                  | YES  | スキル名           |
| slug         | string                  | YES  | URLスラッグ        |
| description  | string                  | YES  | 説明               |
| path         | string                  | YES  | ファイルパス       |
| triggers     | string[]                | YES  | トリガー一覧       |
| anchors      | Anchor[]                | YES  | アンカー一覧       |
| category     | SkillCategory \| string | YES  | カテゴリ（任意）   |
| environment  | EnvironmentConfig       | YES  | 環境設定（任意）   |
| license      | string                  | YES  | ライセンス（任意） |
| allowedTools | string[]                | YES  | 許可ツール（任意） |
| tags         | string[]                | YES  | タグ（任意）       |
| dependencies | string[]                | YES  | 依存関係（任意）   |
| lastModified | Date                    | NO   | **除外**           |

---

## 3. 出力型変換

### 3.1 SkillExecutionResponse → ハンドラーレスポンス

#### 元の型定義（SkillExecutionResponse）

```typescript
/**
 * SkillExecutor.execute() が返す SkillExecutionResponse
 */
interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError;
}

/**
 * SkillExecutionError 型
 */
interface SkillExecutionError {
  code: SkillExecutionErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

#### 変換先の型定義（ハンドラーレスポンス）

```typescript
/**
 * ハンドラーが返すレスポンス型
 * Discriminated Union パターンを使用
 */
type HandlerResponse =
  | { success: true; data: { executionId: string } }
  | { success: false; error: string };
```

#### 変換関数

```typescript
/**
 * SkillExecutionResponse をハンドラーレスポンス形式に変換
 * @param response - SkillExecutor.execute() の戻り値
 * @returns ハンドラーレスポンス
 */
function mapExecutionResponse(
  response: SkillExecutionResponse,
): HandlerResponse {
  if (response.success) {
    return {
      success: true,
      data: { executionId: response.executionId },
    };
  }
  return {
    success: false,
    error: response.error?.message ?? "スキル実行に失敗しました",
  };
}
```

#### マッピング表

| SkillExecutionResponse | ハンドラーレスポンス                            |
| ---------------------- | ----------------------------------------------- |
| success: true          | { success: true, data: { executionId: "..." } } |
| success: false         | { success: false, error: "<メッセージ>" }       |
| error.code             | （レスポンスには含まない）                      |
| error.message          | error フィールドに設定                          |
| error.details          | （レスポンスには含まない、ログのみ）            |

---

## 4. エラーレスポンス生成

### 4.1 ヘルパー関数

```typescript
/**
 * エラーレスポンス生成ヘルパー
 * @param message - エラーメッセージ
 * @returns エラーレスポンスオブジェクト
 */
function createErrorResponse(message: string): {
  success: false;
  error: string;
} {
  return { success: false, error: message };
}
```

### 4.2 エラーメッセージマッピング

| エラーケース            | 日本語メッセージ                                                     |
| ----------------------- | -------------------------------------------------------------------- |
| skillId が空            | "skillId must be a non-empty string"                                 |
| prompt が空             | "prompt must be a non-empty string"                                  |
| SkillExecutor 未初期化  | "スキル実行エンジンが初期化されていません"                           |
| スキル未取得            | "スキルが見つかりません"                                             |
| スキル未インポート      | "スキルがインポートされていません"                                   |
| MAX_CONCURRENT_EXCEEDED | "同時実行数の上限に達しました。しばらくしてから再試行してください。" |
| AUTHENTICATION_ERROR    | "認証に失敗しました。設定画面でAPIキーを確認してください。"          |
| TIMEOUT                 | "実行がタイムアウトしました。"                                       |
| デフォルト              | "スキル実行に失敗しました"                                           |

---

## 5. 型安全性の保証

### 5.1 TypeScript 型ガード

```typescript
/**
 * prompt パラメータの型ガード
 */
function isValidPrompt(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * skillId パラメータの型ガード
 */
function isValidSkillId(value: unknown): value is string {
  return typeof value === "string" && value !== "";
}

/**
 * timeout パラメータの型ガード
 */
function isValidTimeout(value: unknown): value is number {
  return typeof value === "number" && value > 0;
}
```

### 5.2 strict モード対応

- `strict: true` 設定下でコンパイル可能であること
- `any` 型を使用しないこと
- 型アサーション（`as`）を最小限に抑えること
- オプショナルチェーン（`?.`）と Nullish coalescing（`??`）を活用

---

## 6. 関連型定義の参照先

| 型名                    | 定義ファイル                                          |
| ----------------------- | ----------------------------------------------------- |
| Skill                   | packages/shared/src/types/skill.ts                    |
| SkillExecutionRequest   | apps/desktop/src/main/services/skill/SkillExecutor.ts |
| SkillExecutionResponse  | apps/desktop/src/main/services/skill/SkillExecutor.ts |
| SkillMetadata           | apps/desktop/src/main/services/skill/SkillExecutor.ts |
| SkillExecutionError     | apps/desktop/src/main/services/skill/SkillExecutor.ts |
| SkillExecutionErrorCode | apps/desktop/src/main/services/skill/SkillExecutor.ts |
| RetryConfig             | apps/desktop/src/main/services/skill/SkillExecutor.ts |

---

## 7. 成果物チェックリスト

- [x] 入力型変換（ハンドラー引数 → SkillExecutionRequest）が設計されている
- [x] メタデータ変換（Skill → SkillMetadata）が設計されている
- [x] 出力型変換（SkillExecutionResponse → ハンドラーレスポンス）が設計されている
- [x] エラーレスポンス生成のヘルパーが設計されている
- [x] 型安全性の保証方法が定義されている
- [x] 関連型定義の参照先が整理されている
