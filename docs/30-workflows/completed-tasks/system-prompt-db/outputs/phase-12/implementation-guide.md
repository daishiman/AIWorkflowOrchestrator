# システムプロンプトDB永続化 - 実装ガイド

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 12                                     |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 1. システム概要

### システムプロンプトテンプレートとは

システムプロンプトテンプレートは、AIの振る舞いを事前に定義したテキストです。例えば「翻訳アシスタント」テンプレートを選択すると、AIは翻訳に特化した応答を行います。

### なぜデータベース永続化が必要か

これまでテンプレートは`electron-store`（ローカルファイル）に保存されていました。しかし、以下の課題がありました：

1. **複数デバイス間の同期ができない** - 自宅PCと会社PCで同じテンプレートを使いたい
2. **オフライン対応が不完全** - ネットワーク切断時のデータ保護が弱い
3. **検索・フィルタリングが遅い** - 大量のテンプレートを扱うと動作が遅くなる

データベース（Turso + SQLite）に移行することで、これらの課題を解決します。

### ユーザーにとってのメリット

| メリット         | 説明                                                   |
| ---------------- | ------------------------------------------------------ |
| 複数デバイス同期 | 自宅・会社・モバイルで同じテンプレートにアクセス       |
| オフライン対応   | ネット接続がなくてもテンプレートの作成・編集が可能     |
| 高速検索         | 数百件のテンプレートでも瞬時に検索できる               |
| 自動バックアップ | クラウドにデータが自動バックアップされる               |
| データ安全性     | マイグレーション時のバックアップ機能でデータ損失を防止 |

## 2. 機能概要

### CRUD操作の概要

| 操作   | 説明                         | 使用例                     |
| ------ | ---------------------------- | -------------------------- |
| Create | 新しいテンプレートを作成     | 「マーケティング用」を追加 |
| Read   | テンプレート一覧・詳細を表示 | 保存済みテンプレートを確認 |
| Update | 既存テンプレートを編集       | プロンプト内容を改善       |
| Delete | 不要なテンプレートを削除     | 使わなくなったものを整理   |

### オフライン対応の仕組み

```
[ユーザー操作]
     ↓
[ローカルSQLite（即座に保存）]
     ↓
[オンライン復帰時]
     ↓
[Tursoクラウド（自動同期）]
```

1. テンプレートの保存はまずローカルのSQLiteに書き込まれます
2. ネットワーク接続がなくても操作は完了します
3. オンラインに戻ると自動的にクラウドと同期されます

### マイグレーションの流れ

既存ユーザーのデータを自動で移行します：

```
1. アプリ起動
     ↓
2. マイグレーション必要性チェック
     ↓
3. [必要な場合] バックアップ作成
     ↓
4. [必要な場合] データ移行
     ↓
5. 移行完了フラグを設定
     ↓
6. 通常起動
```

## 3. 用語集

| 用語                 | 説明                                                 |
| -------------------- | ---------------------------------------------------- |
| テンプレート         | 保存されたシステムプロンプトの雛形                   |
| プリセット           | システム提供の編集・削除不可なテンプレート           |
| カスタムテンプレート | ユーザーが作成したテンプレート                       |
| 同期                 | ローカルとクラウド間でデータを一致させる処理         |
| マイグレーション     | 旧形式から新形式へのデータ移行処理                   |
| Turso                | クラウドデータベースサービス（SQLite互換）           |
| Embedded Replica     | ローカルにSQLiteコピーを持つ仕組み（オフライン対応） |

---

# Part 2: 技術的詳細（開発者向け）

## 1. アーキテクチャ概要

### レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   React Components                       ││
│  │  (SystemPromptPanel, TemplateSelector, etc.)             ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Zustand Store                          ││
│  │  (systemPromptSlice)                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                              ↓ IPC                           │
├─────────────────────────────────────────────────────────────┤
│                     Main Process                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   IPC Handlers                           ││
│  │  (systemPromptHandlers.ts)                               ││
│  └─────────────────────────────────────────────────────────┘│
│                              ↓                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              SystemPromptRepository                      ││
│  │  (system-prompt-repository.ts)                           ││
│  └─────────────────────────────────────────────────────────┘│
│                              ↓                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Drizzle ORM + SQLite                        ││
│  │  (Turso Embedded Replica)                                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### データフロー

```
[User Action] → [React Component] → [Zustand Action]
     ↓
[preloadBridge.invoke('system-prompt:xxx')]
     ↓
[IPC Handler (Main Process)]
     ↓
[SystemPromptRepository]
     ↓
[Drizzle ORM → SQLite/Turso]
     ↓
[Result → IPC Response → Zustand State Update → UI Re-render]
```

### 依存関係

```
packages/shared/
├── src/repositories/
│   └── system-prompt-repository.ts  ← Drizzle ORM
├── src/store/slices/
│   └── systemPromptSlice.ts         ← Zustand
└── src/types/
    └── system-prompt.ts             ← 共通型定義

apps/desktop/
├── src/main/ipc/
│   └── systemPromptHandlers.ts      ← IPC Handler
├── src/main/migration/
│   └── electron-store-migration.ts  ← Migration
└── src/preload/
    └── bridges/systemPromptBridge.ts ← IPC Bridge
```

## 2. API/インターフェース

### ISystemPromptRepository インターフェース

```typescript
interface ISystemPromptRepository {
  // 一覧取得
  findAllByUserId(
    userId: string,
    options?: FindAllOptions,
  ): Promise<SystemPromptTemplate[]>;

  // ID検索
  findById(id: string): Promise<SystemPromptTemplate | null>;

  // プリセット一覧
  findAllPresets(): Promise<SystemPromptTemplate[]>;

  // 作成
  create(
    userId: string,
    data: CreateSystemPromptData,
  ): Promise<SystemPromptTemplate>;

  // 更新
  update(
    id: string,
    data: UpdateSystemPromptData,
  ): Promise<SystemPromptTemplate>;

  // 削除
  delete(id: string): Promise<void>;

  // プリセット判定
  isPreset(id: string): Promise<boolean>;

  // 名前重複チェック
  existsByUserIdAndName(userId: string, name: string): Promise<boolean>;

  // 存在確認
  exists(id: string): Promise<boolean>;
}

interface FindAllOptions {
  limit?: number; // デフォルト: 100
  offset?: number; // デフォルト: 0
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
```

### IPC チャネル一覧

| チャネル                  | 説明             | リクエスト型                      | レスポンス型                     |
| ------------------------- | ---------------- | --------------------------------- | -------------------------------- |
| system-prompt:list        | 一覧取得         | `{ userId, options? }`            | `Result<SystemPromptTemplate[]>` |
| system-prompt:get         | 単一取得         | `{ id, userId }`                  | `Result<SystemPromptTemplate>`   |
| system-prompt:create      | 作成             | `{ userId, name, content }`       | `Result<SystemPromptTemplate>`   |
| system-prompt:update      | 更新             | `{ id, userId, name?, content? }` | `Result<SystemPromptTemplate>`   |
| system-prompt:delete      | 削除             | `{ id, userId }`                  | `Result<void>`                   |
| system-prompt:migrate     | マイグレーション | `{ userId }`                      | `Result<MigrationResult>`        |
| system-prompt:get-presets | プリセット取得   | `{}`                              | `Result<SystemPromptTemplate[]>` |

### 型定義

```typescript
interface SystemPromptTemplate {
  id: string;
  userId: string;
  name: string;
  content: string;
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateSystemPromptData {
  name: string; // 1-50文字
  content: string; // 1-4000文字
}

interface UpdateSystemPromptData {
  name?: string; // 1-50文字
  content?: string; // 1-4000文字
}

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

## 3. データベーススキーマ

### system_prompt_templates テーブル

```sql
CREATE TABLE system_prompt_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_preset INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- インデックス
CREATE INDEX system_prompt_templates_user_id_idx
  ON system_prompt_templates(user_id);
CREATE INDEX system_prompt_templates_name_idx
  ON system_prompt_templates(name);
CREATE INDEX system_prompt_templates_is_preset_idx
  ON system_prompt_templates(is_preset);
CREATE UNIQUE INDEX system_prompt_templates_user_name_unq
  ON system_prompt_templates(user_id, name);
```

### 制約

| 制約                   | 説明                             |
| ---------------------- | -------------------------------- |
| PRIMARY KEY (id)       | UUID形式の一意識別子             |
| NOT NULL (user_id)     | ユーザーIDは必須                 |
| NOT NULL (name)        | テンプレート名は必須（1-50文字） |
| NOT NULL (content)     | コンテンツは必須（1-4000文字）   |
| UNIQUE (user_id, name) | 同一ユーザー内で名前の重複を禁止 |

## 4. テスト実行ガイド

### ユニットテスト

```bash
# Repository テスト
pnpm --filter @repo/shared test -- --grep "SystemPromptRepository"

# IPC Handler テスト
pnpm --filter @repo/desktop test -- --grep "systemPromptHandlers"

# Migration テスト
pnpm --filter @repo/desktop test -- --grep "electronStoreMigration"

# Slice テスト
pnpm --filter @repo/shared test -- --grep "systemPromptSlice"
```

### 結合テスト

```bash
# 全テスト実行
pnpm --filter @repo/shared test

# カバレッジ付き実行
pnpm --filter @repo/shared test -- --coverage
```

### テスト結果確認

```bash
# カバレッジレポート表示
open coverage/lcov-report/index.html
```

## 5. エラーコード一覧

| コード                                   | 説明                       | 対処法                     |
| ---------------------------------------- | -------------------------- | -------------------------- |
| system-prompt/not-found                  | テンプレートが見つからない | IDを確認                   |
| system-prompt/validation-failed          | バリデーションエラー       | 入力値を確認               |
| system-prompt/duplicate-name             | 名前重複                   | 別の名前を使用             |
| system-prompt/preset-protected           | プリセット保護             | カスタムテンプレートを使用 |
| system-prompt/unauthorized               | 認可エラー                 | 正しいユーザーでログイン   |
| system-prompt/repository-not-initialized | Repository未初期化         | アプリを再起動             |

---

## 関連ドキュメント

| ドキュメント               | パス                                             |
| -------------------------- | ------------------------------------------------ |
| 機能要件定義書             | `outputs/phase-1/requirements-functional.md`     |
| 非機能要件定義書           | `outputs/phase-1/requirements-non-functional.md` |
| データベーススキーマ設計   | `outputs/phase-2/database-schema-design.md`      |
| Repositoryインターフェース | `outputs/phase-2/repository-interface-design.md` |
| 品質保証レポート           | `outputs/phase-9/quality-assurance-report.md`    |

---

## 作成日

2026-01-22
