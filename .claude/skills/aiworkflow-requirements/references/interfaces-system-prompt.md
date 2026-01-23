# システムプロンプトインターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

システムプロンプト機能は、ユーザーがAIの振る舞いをカスタマイズするためのテンプレート管理機能を提供する。TursoデータベースによるクラウドバックアップとEmbedded Replicaによるオフライン対応を実現している。

**実装期間**: 2026-01-22
**タスクドキュメント**: `docs/30-workflows/system-prompt-db/`

---

## Repository インターフェース

### ISystemPromptRepository

```typescript
interface ISystemPromptRepository {
  /**
   * ユーザーのテンプレート一覧を取得
   * @param userId - ユーザーID
   * @param options - 取得オプション（ページネーション、ソート）
   * @returns テンプレート配列
   */
  findAllByUserId(
    userId: string,
    options?: FindAllOptions
  ): Promise<SystemPromptTemplate[]>;

  /**
   * IDでテンプレートを取得
   * @param id - テンプレートID
   * @returns テンプレートまたはnull
   */
  findById(id: string): Promise<SystemPromptTemplate | null>;

  /**
   * プリセットテンプレート一覧を取得
   * @returns プリセットテンプレート配列
   */
  findAllPresets(): Promise<SystemPromptTemplate[]>;

  /**
   * テンプレートを作成
   * @param userId - ユーザーID
   * @param data - 作成データ
   * @returns 作成されたテンプレート
   * @throws ValidationError - バリデーション失敗時
   * @throws DuplicateNameError - 名前重複時
   */
  create(
    userId: string,
    data: CreateSystemPromptData
  ): Promise<SystemPromptTemplate>;

  /**
   * テンプレートを更新
   * @param id - テンプレートID
   * @param data - 更新データ
   * @returns 更新されたテンプレート
   * @throws NotFoundError - テンプレート未発見時
   * @throws PresetProtectedError - プリセット更新時
   */
  update(
    id: string,
    data: UpdateSystemPromptData
  ): Promise<SystemPromptTemplate>;

  /**
   * テンプレートを削除
   * @param id - テンプレートID
   * @throws NotFoundError - テンプレート未発見時
   * @throws PresetProtectedError - プリセット削除時
   */
  delete(id: string): Promise<void>;

  /**
   * プリセットかどうかを判定
   * @param id - テンプレートID
   * @returns プリセットならtrue
   */
  isPreset(id: string): Promise<boolean>;

  /**
   * ユーザー内で名前が重複しているか確認
   * @param userId - ユーザーID
   * @param name - テンプレート名
   * @returns 重複していればtrue
   */
  existsByUserIdAndName(userId: string, name: string): Promise<boolean>;

  /**
   * テンプレートが存在するか確認
   * @param id - テンプレートID
   * @returns 存在すればtrue
   */
  exists(id: string): Promise<boolean>;
}
```

### FindAllOptions

```typescript
interface FindAllOptions {
  /** 取得件数上限（デフォルト: 100） */
  limit?: number;
  /** オフセット（デフォルト: 0） */
  offset?: number;
  /** ソート対象カラム */
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  /** ソート順序 */
  sortOrder?: 'asc' | 'desc';
}
```

---

## エンティティ型定義

### SystemPromptTemplate

```typescript
interface SystemPromptTemplate {
  /** UUID形式のテンプレートID */
  id: string;
  /** 所有者のユーザーID */
  userId: string;
  /** テンプレート名（1-50文字） */
  name: string;
  /** プロンプト内容（1-4000文字） */
  content: string;
  /** プリセットフラグ */
  isPreset: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}
```

### CreateSystemPromptData

```typescript
interface CreateSystemPromptData {
  /** テンプレート名（必須、1-50文字） */
  name: string;
  /** プロンプト内容（必須、1-4000文字） */
  content: string;
}
```

### UpdateSystemPromptData

```typescript
interface UpdateSystemPromptData {
  /** テンプレート名（任意、1-50文字） */
  name?: string;
  /** プロンプト内容（任意、1-4000文字） */
  content?: string;
}
```

---

## IPC チャネル仕様

### チャネル定義

| チャネル                  | 説明               | メソッド |
| ------------------------- | ------------------ | -------- |
| system-prompt:list        | 一覧取得           | GET      |
| system-prompt:get         | 単一取得           | GET      |
| system-prompt:create      | 作成               | POST     |
| system-prompt:update      | 更新               | PATCH    |
| system-prompt:delete      | 削除               | DELETE   |
| system-prompt:migrate     | マイグレーション   | POST     |
| system-prompt:get-presets | プリセット取得     | GET      |

### レスポンス形式

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

---

## エラーコード体系

| コード                                   | HTTP相当 | 説明                       |
| ---------------------------------------- | -------- | -------------------------- |
| system-prompt/not-found                  | 404      | テンプレートが見つからない |
| system-prompt/validation-failed          | 400      | バリデーションエラー       |
| system-prompt/duplicate-name             | 409      | 名前重複                   |
| system-prompt/preset-protected           | 403      | プリセット保護             |
| system-prompt/unauthorized               | 401      | 認可エラー                 |
| system-prompt/create-failed              | 500      | 作成失敗                   |
| system-prompt/update-failed              | 500      | 更新失敗                   |
| system-prompt/delete-failed              | 500      | 削除失敗                   |
| system-prompt/list-failed                | 500      | 一覧取得失敗               |
| system-prompt/repository-not-initialized | 500      | Repository未初期化         |

---

## バリデーションルール

### テンプレート名（name）

| ルール         | 条件             | エラーメッセージ                         |
| -------------- | ---------------- | ---------------------------------------- |
| 必須           | 空文字列不可     | テンプレート名は必須です                 |
| 最小文字数     | 1文字以上        | テンプレート名は必須です                 |
| 最大文字数     | 50文字以下       | テンプレート名は50文字以内にしてください |
| 空白トリム     | 前後空白を削除   | -                                        |
| ユニーク制約   | ユーザー内で一意 | 同じ名前のテンプレートが既に存在します   |

### コンテンツ（content）

| ルール     | 条件           | エラーメッセージ                       |
| ---------- | -------------- | -------------------------------------- |
| 必須       | 空文字列不可   | コンテンツは必須です                   |
| 最小文字数 | 1文字以上      | コンテンツは必須です                   |
| 最大文字数 | 4000文字以下   | コンテンツは4000文字以内にしてください |

---

## セキュリティ仕様

### 認可チェック

| 操作   | チェック内容                         |
| ------ | ------------------------------------ |
| 取得   | userId一致確認                       |
| 作成   | userIdが有効であること               |
| 更新   | userId一致確認 + プリセット保護      |
| 削除   | userId一致確認 + プリセット保護      |

### SQLインジェクション対策

- Drizzle ORMの`sql`テンプレートリテラルを使用
- パラメータ化クエリを一貫して使用
- ユーザー入力を直接SQLに挿入しない

---

## データ永続化

### ストレージ構成

| データ               | ストレージ       | 同期     |
| -------------------- | ---------------- | -------- |
| カスタムテンプレート | Turso + SQLite   | 自動同期 |
| プリセットテンプレート | コード内定数   | なし     |

### オフライン対応

- Turso Embedded Replicaによるローカルコピー
- オフライン時もCRUD操作可能
- オンライン復帰時に自動同期

---

## マイグレーション仕様

### electron-store → Turso マイグレーション

| 機能                 | 説明                                   |
| -------------------- | -------------------------------------- |
| needsMigration()     | マイグレーション必要性チェック         |
| migrate()            | データ移行実行（部分成功対応）         |
| createBackup()       | 移行前バックアップ作成（JSON形式）     |
| restoreBackup()      | 失敗時のバックアップからの復元         |

### マイグレーションステータス

| ステータス     | 説明                         |
| -------------- | ---------------------------- |
| not_started    | 未開始                       |
| in_progress    | 実行中                       |
| completed      | 完了                         |
| failed         | 失敗（リトライ対象）         |

---

## 完了タスク

### TASK-CHAT-SYSPROMPT-DB-001（2026-01-22）

- システムプロンプトのデータベース永続化
- Repository層実装
- IPC Handler実装
- electron-store → Tursoマイグレーション
- 213テスト作成（カバレッジ84%+）

---

## 関連ドキュメント

- [システムプロンプト設定UI](./ui-ux-system-prompt.md)
- [データベーススキーマ](./database-schema.md)
- [認証インターフェース](./interfaces-auth.md)
- [チャット履歴インターフェース](./interfaces-chat-history.md)
- [実装ガイド](../../docs/30-workflows/completed-tasks/system-prompt-db/outputs/phase-12/implementation-guide.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                               |
| ---------- | ---------- | -------------------------------------- |
| 1.0.0      | 2026-01-22 | 初版作成（DB永続化実装完了）           |
