# 設計整合性レビュー

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 3                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. インターフェース整合性検証

### 1.1 Repository型とSlice型の整合性

| 項目           | Repository層              | Slice層           | 整合性 |
| -------------- | ------------------------- | ----------------- | ------ |
| テンプレート型 | PromptTemplate            | PromptTemplate    | ✅     |
| 作成入力       | CreatePromptTemplateInput | { name, content } | ✅     |
| 更新入力       | UpdatePromptTemplateInput | { name, content } | ✅     |
| ID型           | string (UUID)             | string            | ✅     |
| ユーザーID型   | string                    | string            | ✅     |
| 日時型         | Date                      | Date              | ✅     |

**結果**: 6/6 整合 (100%)

### 1.2 IPC通信の入出力型整合性

| チャネル                  | Main Process入力        | Renderer出力           | 整合性 |
| ------------------------- | ----------------------- | ---------------------- | ------ |
| system-prompt:list        | ListTemplatesRequest    | PromptTemplate[]       | ✅     |
| system-prompt:get         | GetTemplateRequest      | PromptTemplate         | ✅     |
| system-prompt:create      | CreateTemplateRequest   | PromptTemplate         | ✅     |
| system-prompt:update      | UpdateTemplateRequest   | PromptTemplate         | ✅     |
| system-prompt:delete      | DeleteTemplateRequest   | void                   | ✅     |
| system-prompt:migrate     | MigrateTemplatesRequest | MigrateTemplatesResult | ✅     |
| system-prompt:get-presets | なし                    | PromptTemplate[]       | ✅     |

**結果**: 7/7 整合 (100%)

### 1.3 DB型とドメイン型の変換整合性

| DBカラム   | DB型                   | ドメイン型 | 変換            | 整合性 |
| ---------- | ---------------------- | ---------- | --------------- | ------ |
| id         | TEXT                   | string     | そのまま        | ✅     |
| user_id    | TEXT                   | string     | そのまま        | ✅     |
| name       | TEXT                   | string     | そのまま        | ✅     |
| content    | TEXT                   | string     | そのまま        | ✅     |
| is_preset  | INTEGER (0/1)          | boolean    | mode: "boolean" | ✅     |
| created_at | INTEGER (timestamp_ms) | Date       | new Date()変換  | ✅     |
| updated_at | INTEGER (timestamp_ms) | Date       | new Date()変換  | ✅     |

**結果**: 7/7 整合 (100%)

---

## 2. データフロー整合性検証

### 2.1 Renderer → IPC → Main → Repository → DB

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Renderer   │────▶│     IPC      │────▶│     Main     │
│  (Slice)     │     │  (channels)  │     │  (Handler)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │ systemPromptAPI    │ system-prompt:*    │ repository
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   State      │     │  Validation  │     │   Drizzle    │
│  (Zustand)   │◀────│   (Zod)      │◀────│   (SQLite)   │
└──────────────┘     └──────────────┘     └──────────────┘
```

| フロー箇所           | 入力型                | 出力型               | 検証方法   | 整合性 |
| -------------------- | --------------------- | -------------------- | ---------- | ------ |
| Slice → Preload      | TS型                  | IPCリクエスト        | TypeScript | ✅     |
| Preload → IPC        | IPCリクエスト         | IPCレスポンス        | Zod        | ✅     |
| Handler → Repository | ドメイン入力型        | ドメインエンティティ | TypeScript | ✅     |
| Repository → Drizzle | Drizzle Insert/Update | DBレコード           | Drizzle    | ✅     |

**結果**: 4/4 整合 (100%)

### 2.2 エラー伝播パスの整合性

| エラー発生箇所 | エラー型                        | IPC変換後                  | Slice処理   | 整合性 |
| -------------- | ------------------------------- | -------------------------- | ----------- | ------ |
| Repository     | TemplateNotFoundError           | { code, message }          | error state | ✅     |
| Repository     | DuplicateTemplateNameError      | { code, message }          | error state | ✅     |
| Handler        | PresetNotEditableError          | { code, message }          | error state | ✅     |
| Handler        | UnauthorizedTemplateAccessError | { code, message }          | error state | ✅     |
| Handler        | ZodError                        | { code, message, details } | error state | ✅     |
| IPC Validator  | IPCValidationError              | { code, message }          | error state | ✅     |

**結果**: 6/6 整合 (100%)

---

## 3. 既存システムとの整合性検証

### 3.1 既存データベーススキーマとの整合性

| 項目             | 既存(chat_sessions)     | 新規(system_prompt_templates) | 整合性 |
| ---------------- | ----------------------- | ----------------------------- | ------ |
| テーブル命名     | snake_case              | snake_case                    | ✅     |
| カラム命名       | snake_case              | snake_case                    | ✅     |
| 主キー形式       | TEXT (UUID)             | TEXT (UUID)                   | ✅     |
| 日時形式         | ISO8601 TEXT            | UNIX timestamp INTEGER        | ⚠️     |
| インデックス命名 | {table}\_{column}\_idx  | {table}\_{column}\_idx        | ✅     |
| ユニーク制約命名 | {table}\_{columns}\_unq | {table}\_{columns}\_unq       | ✅     |

**注記**: 日時形式について、既存テーブルはISO8601文字列を使用しているが、新規テーブルはパフォーマンス考慮でUNIX timestampを使用。Drizzle ORMの`mode: "timestamp_ms"`により透過的に変換されるため、アプリケーション層での影響なし。

**結果**: 5/6 整合 (83%) ※ 許容範囲

### 3.2 既存Repositoryパターンとの一貫性

| パターン           | 既存(ChatSessionRepository) | 新規(SystemPromptRepository) | 整合性 |
| ------------------ | --------------------------- | ---------------------------- | ------ |
| コンストラクタDI   | db: BetterSQLite3Database   | db: BetterSQLite3Database    | ✅     |
| 非同期メソッド     | async/await                 | async/await                  | ✅     |
| エラーハンドリング | カスタムエラー型            | カスタムエラー型             | ✅     |
| 型変換メソッド     | mapToEntity()               | mapToEntity()                | ✅     |
| CRUD命名規則       | find/create/update/delete   | find/create/update/delete    | ✅     |

**結果**: 5/5 整合 (100%)

### 3.3 既存IPC Handlerパターンとの一貫性

| パターン           | 既存(session-persistence) | 新規(system-prompt)              | 整合性 |
| ------------------ | ------------------------- | -------------------------------- | ------ |
| ハンドラー登録     | registerXxxHandlers()     | registerSystemPromptHandlers()   | ✅     |
| ハンドラー解除     | unregisterXxxHandlers()   | unregisterSystemPromptHandlers() | ✅     |
| エラーハンドリング | handleError()関数         | handleError()関数                | ✅     |
| レスポンス形式     | { success, data/error }   | { success, data/error }          | ✅     |
| Zodバリデーション  | 入力パラメータ検証        | 入力パラメータ検証               | ✅     |

**結果**: 5/5 整合 (100%)

---

## 4. 問題リスト

| ID   | 重要度 | 問題内容 | 対処方針 |
| ---- | ------ | -------- | -------- |
| なし | -      | -        | -        |

---

## 5. 総合判定

| 検証カテゴリ            | 整合項目数 | 総項目数 | 整合率    |
| ----------------------- | ---------- | -------- | --------- |
| Repository型とSlice型   | 6          | 6        | 100%      |
| IPC通信の入出力型       | 7          | 7        | 100%      |
| DB型とドメイン型        | 7          | 7        | 100%      |
| データフロー            | 4          | 4        | 100%      |
| エラー伝播パス          | 6          | 6        | 100%      |
| 既存DBスキーマ          | 5          | 6        | 83%       |
| 既存Repositoryパターン  | 5          | 5        | 100%      |
| 既存IPC Handlerパターン | 5          | 5        | 100%      |
| **合計**                | **45**     | **46**   | **97.8%** |

**判定結果**: ✅ PASS

日時形式の差異は意図的な設計判断であり、アプリケーション層に影響しないため問題なし。

---

## 6. 完了条件

- [x] インターフェース整合性が検証されている
- [x] データフロー整合性が検証されている
- [x] 既存システムとの整合性が検証されている
- [x] 問題リストが作成されている（問題なし）
- [x] 判定結果がPASSである
