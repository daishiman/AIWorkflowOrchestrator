# Repository層インターフェース設計書

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 2                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. 型定義

### 1.1 ドメインエンティティ型

```typescript
// packages/shared/src/repositories/types/system-prompt.ts

/**
 * システムプロンプトテンプレート
 *
 * ドメインエンティティとしてのテンプレート型。
 * DBレコードからアプリケーション層で使用する形式に変換。
 */
export interface PromptTemplate {
  /** テンプレートID（UUID v4、プリセットは "preset-*" 形式） */
  id: string;

  /** 所有者ユーザーID（プリセットは "__SYSTEM__"） */
  userId: string;

  /** テンプレート名（1-50文字） */
  name: string;

  /** テンプレート内容（1-4000文字） */
  content: string;

  /** プリセットフラグ（true: 編集・削除不可） */
  isPreset: boolean;

  /** 作成日時 */
  createdAt: Date;

  /** 更新日時 */
  updatedAt: Date;
}
```

### 1.2 入力型

```typescript
/**
 * テンプレート作成入力
 */
export interface CreatePromptTemplateInput {
  /** テンプレート名（1-50文字、トリム後） */
  name: string;

  /** テンプレート内容（1-4000文字） */
  content: string;
}

/**
 * テンプレート更新入力
 */
export interface UpdatePromptTemplateInput {
  /** テンプレート名（1-50文字、トリム後、省略可能） */
  name?: string;

  /** テンプレート内容（1-4000文字、省略可能） */
  content?: string;
}
```

### 1.3 検索・フィルタ型

```typescript
/**
 * テンプレート検索オプション
 */
export interface FindTemplatesOptions {
  /** 取得上限 */
  limit?: number;

  /** オフセット */
  offset?: number;

  /** プリセットを含めるか（デフォルト: true） */
  includePresets?: boolean;

  /** ソート順（デフォルト: createdAt DESC） */
  orderBy?: "createdAt" | "updatedAt" | "name";

  /** ソート方向（デフォルト: DESC） */
  orderDirection?: "ASC" | "DESC";
}
```

---

## 2. Repositoryインターフェース

### 2.1 ISystemPromptRepository

```typescript
// packages/shared/src/repositories/types/system-prompt.ts

/**
 * システムプロンプトリポジトリインターフェース
 *
 * テンプレートのCRUD操作を提供する。
 * 認可チェックはService層で実施するため、Repository層では行わない。
 */
export interface ISystemPromptRepository {
  // ============================================================
  // 取得系
  // ============================================================

  /**
   * ユーザーの全テンプレートを取得する
   *
   * @param userId ユーザーID
   * @param options 検索オプション
   * @returns テンプレート一覧（プリセット + カスタム）
   */
  findAllByUserId(
    userId: string,
    options?: FindTemplatesOptions,
  ): Promise<PromptTemplate[]>;

  /**
   * IDでテンプレートを取得する
   *
   * @param id テンプレートID
   * @returns テンプレート（存在しない場合はnull）
   */
  findById(id: string): Promise<PromptTemplate | null>;

  /**
   * 全プリセットテンプレートを取得する
   *
   * @returns プリセットテンプレート一覧
   */
  findAllPresets(): Promise<PromptTemplate[]>;

  // ============================================================
  // 作成・更新・削除
  // ============================================================

  /**
   * テンプレートを作成する
   *
   * @param userId 所有者ユーザーID
   * @param data 作成データ
   * @returns 作成されたテンプレート
   * @throws ユーザー内で名前が重複している場合
   */
  create(
    userId: string,
    data: CreatePromptTemplateInput,
  ): Promise<PromptTemplate>;

  /**
   * テンプレートを更新する
   *
   * @param id テンプレートID
   * @param data 更新データ
   * @returns 更新されたテンプレート
   * @throws テンプレートが存在しない場合
   */
  update(id: string, data: UpdatePromptTemplateInput): Promise<PromptTemplate>;

  /**
   * テンプレートを削除する
   *
   * @param id テンプレートID
   * @throws テンプレートが存在しない場合
   */
  delete(id: string): Promise<void>;

  // ============================================================
  // ユーティリティ
  // ============================================================

  /**
   * テンプレートがプリセットかどうかを確認する
   *
   * @param id テンプレートID
   * @returns プリセットの場合true
   */
  isPreset(id: string): Promise<boolean>;

  /**
   * ユーザー内で名前が存在するか確認する
   *
   * @param userId ユーザーID
   * @param name テンプレート名
   * @param excludeId 除外するID（更新時の自身を除外）
   * @returns 存在する場合true
   */
  existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * テンプレートが存在するか確認する
   *
   * @param id テンプレートID
   * @returns 存在する場合true
   */
  exists(id: string): Promise<boolean>;
}
```

---

## 3. Repository実装

### 3.1 クラス定義

```typescript
// packages/shared/src/repositories/system-prompt-repository.ts

import { eq, and, desc, asc, or, ne, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import {
  systemPromptTemplates,
  type SystemPromptTemplateRecord,
} from "../db/schema/systemPrompt.js";
import type {
  ISystemPromptRepository,
  PromptTemplate,
  CreatePromptTemplateInput,
  UpdatePromptTemplateInput,
  FindTemplatesOptions,
} from "./types/system-prompt.js";

/** プリセット用システムユーザーID */
const SYSTEM_USER_ID = "__SYSTEM__";

/**
 * システムプロンプトリポジトリ実装
 */
export class SystemPromptRepository implements ISystemPromptRepository {
  constructor(private db: BetterSQLite3Database) {}

  async findAllByUserId(
    userId: string,
    options: FindTemplatesOptions = {},
  ): Promise<PromptTemplate[]> {
    const {
      limit,
      offset,
      includePresets = true,
      orderBy = "createdAt",
      orderDirection = "DESC",
    } = options;

    // ユーザーのテンプレート + プリセット を取得
    const condition = includePresets
      ? or(
          eq(systemPromptTemplates.userId, userId),
          eq(systemPromptTemplates.userId, SYSTEM_USER_ID),
        )
      : eq(systemPromptTemplates.userId, userId);

    // ソート設定
    const orderColumn = {
      createdAt: systemPromptTemplates.createdAt,
      updatedAt: systemPromptTemplates.updatedAt,
      name: systemPromptTemplates.name,
    }[orderBy];

    const orderFn = orderDirection === "ASC" ? asc : desc;

    let query = this.db
      .select()
      .from(systemPromptTemplates)
      .where(condition)
      .orderBy(orderFn(orderColumn));

    if (limit !== undefined) {
      query = query.limit(limit);
    }
    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const rows = await query;
    return rows.map(this.mapToEntity);
  }

  async findById(id: string): Promise<PromptTemplate | null> {
    const rows = await this.db
      .select()
      .from(systemPromptTemplates)
      .where(eq(systemPromptTemplates.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.mapToEntity(rows[0]);
  }

  async findAllPresets(): Promise<PromptTemplate[]> {
    const rows = await this.db
      .select()
      .from(systemPromptTemplates)
      .where(eq(systemPromptTemplates.isPreset, true))
      .orderBy(asc(systemPromptTemplates.name));

    return rows.map(this.mapToEntity);
  }

  async create(
    userId: string,
    data: CreatePromptTemplateInput,
  ): Promise<PromptTemplate> {
    const trimmedName = data.name.trim();

    // 名前重複チェック
    const exists = await this.existsByUserIdAndName(userId, trimmedName);
    if (exists) {
      throw new Error("テンプレート名が重複しています");
    }

    const now = new Date();
    const id = crypto.randomUUID();

    await this.db.insert(systemPromptTemplates).values({
      id,
      userId,
      name: trimmedName,
      content: data.content,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      userId,
      name: trimmedName,
      content: data.content,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(
    id: string,
    data: UpdatePromptTemplateInput,
  ): Promise<PromptTemplate> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("テンプレートが見つかりません");
    }

    const updates: Partial<SystemPromptTemplateRecord> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      // 名前変更時の重複チェック（自身を除外）
      const exists = await this.existsByUserIdAndName(
        existing.userId,
        trimmedName,
        id,
      );
      if (exists) {
        throw new Error("テンプレート名が重複しています");
      }
      updates.name = trimmedName;
    }

    if (data.content !== undefined) {
      updates.content = data.content;
    }

    await this.db
      .update(systemPromptTemplates)
      .set(updates)
      .where(eq(systemPromptTemplates.id, id));

    return {
      ...existing,
      name: updates.name ?? existing.name,
      content: updates.content ?? existing.content,
      updatedAt: updates.updatedAt as Date,
    };
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(systemPromptTemplates)
      .where(eq(systemPromptTemplates.id, id));

    // Drizzle ORMのdelete結果から削除件数を取得
    // 削除されなかった場合はエラー
    if (!result) {
      throw new Error("テンプレートが見つかりません");
    }
  }

  async isPreset(id: string): Promise<boolean> {
    const rows = await this.db
      .select({ isPreset: systemPromptTemplates.isPreset })
      .from(systemPromptTemplates)
      .where(eq(systemPromptTemplates.id, id))
      .limit(1);

    if (rows.length === 0) {
      return false;
    }

    return rows[0].isPreset;
  }

  async existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const conditions = [
      or(
        eq(systemPromptTemplates.userId, userId),
        eq(systemPromptTemplates.userId, SYSTEM_USER_ID),
      ),
      eq(systemPromptTemplates.name, name),
    ];

    if (excludeId) {
      conditions.push(ne(systemPromptTemplates.id, excludeId));
    }

    const rows = await this.db
      .select({ id: systemPromptTemplates.id })
      .from(systemPromptTemplates)
      .where(and(...conditions))
      .limit(1);

    return rows.length > 0;
  }

  async exists(id: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: systemPromptTemplates.id })
      .from(systemPromptTemplates)
      .where(eq(systemPromptTemplates.id, id))
      .limit(1);

    return rows.length > 0;
  }

  /**
   * DBレコードをドメインエンティティに変換
   */
  private mapToEntity(record: SystemPromptTemplateRecord): PromptTemplate {
    return {
      id: record.id,
      userId: record.userId,
      name: record.name,
      content: record.content,
      isPreset: record.isPreset,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    };
  }
}
```

---

## 4. エラーハンドリング

### 4.1 エラー型定義

```typescript
// packages/shared/src/errors/system-prompt-errors.ts

/**
 * システムプロンプト関連エラーの基底クラス
 */
export class SystemPromptError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "SystemPromptError";
  }
}

/**
 * テンプレートが見つからないエラー
 */
export class TemplateNotFoundError extends SystemPromptError {
  constructor(id: string) {
    super(`テンプレートが見つかりません: ${id}`, "TEMPLATE_NOT_FOUND");
    this.name = "TemplateNotFoundError";
  }
}

/**
 * テンプレート名重複エラー
 */
export class DuplicateTemplateNameError extends SystemPromptError {
  constructor(name: string) {
    super(`テンプレート名が重複しています: ${name}`, "DUPLICATE_NAME");
    this.name = "DuplicateTemplateNameError";
  }
}

/**
 * プリセット編集不可エラー
 */
export class PresetNotEditableError extends SystemPromptError {
  constructor(id: string) {
    super(
      `プリセットテンプレートは編集できません: ${id}`,
      "PRESET_NOT_EDITABLE",
    );
    this.name = "PresetNotEditableError";
  }
}

/**
 * プリセット削除不可エラー
 */
export class PresetNotDeletableError extends SystemPromptError {
  constructor(id: string) {
    super(
      `プリセットテンプレートは削除できません: ${id}`,
      "PRESET_NOT_DELETABLE",
    );
    this.name = "PresetNotDeletableError";
  }
}

/**
 * 認可エラー
 */
export class UnauthorizedTemplateAccessError extends SystemPromptError {
  constructor(id: string) {
    super(`このテンプレートへのアクセス権限がありません`, "UNAUTHORIZED");
    this.name = "UnauthorizedTemplateAccessError";
  }
}
```

---

## 5. 認可ロジック設計

### 5.1 Service層での認可チェック

Repository層では認可チェックを行わず、Service層で実施する。

```typescript
// Service層での認可チェック例

/**
 * テンプレート所有者検証
 *
 * @param templateId テンプレートID
 * @param requestUserId リクエストユーザーID
 * @throws UnauthorizedTemplateAccessError 所有者でない場合
 */
private async verifyTemplateOwnership(
  templateId: string,
  requestUserId: string,
): Promise<PromptTemplate> {
  const template = await this.repository.findById(templateId);

  // 存在チェックと認可チェックで同一エラー（情報漏洩防止）
  if (!template) {
    throw new UnauthorizedTemplateAccessError(templateId);
  }

  // プリセットは全ユーザーがアクセス可能
  if (template.isPreset) {
    return template;
  }

  // カスタムテンプレートは所有者のみ
  if (template.userId !== requestUserId) {
    throw new UnauthorizedTemplateAccessError(templateId);
  }

  return template;
}

/**
 * プリセット保護チェック
 *
 * @param templateId テンプレートID
 * @throws PresetNotEditableError プリセットの場合
 */
private async verifyNotPreset(
  templateId: string,
): Promise<void> {
  const isPreset = await this.repository.isPreset(templateId);
  if (isPreset) {
    throw new PresetNotEditableError(templateId);
  }
}
```

### 5.2 認可マトリクス

| 操作     | プリセット | 自分のテンプレート | 他人のテンプレート |
| -------- | ---------- | ------------------ | ------------------ |
| 一覧取得 | 許可       | 許可               | 拒否               |
| 詳細取得 | 許可       | 許可               | 拒否               |
| 作成     | -          | 許可               | -                  |
| 更新     | 拒否       | 許可               | 拒否               |
| 削除     | 拒否       | 許可               | 拒否               |

---

## 6. テスト設計

### 6.1 単体テストケース

| テストカテゴリ        | テストケース                             |
| --------------------- | ---------------------------------------- |
| findAllByUserId       | ユーザーのテンプレートとプリセットを取得 |
| findAllByUserId       | プリセット除外オプションが機能する       |
| findAllByUserId       | ソート・ページネーションが機能する       |
| findById              | 存在するIDで取得できる                   |
| findById              | 存在しないIDでnullを返す                 |
| findAllPresets        | プリセットのみ取得できる                 |
| create                | 正常に作成できる                         |
| create                | 名前重複時にエラー                       |
| create                | 名前のトリムが機能する                   |
| update                | 正常に更新できる                         |
| update                | 存在しないIDでエラー                     |
| update                | 名前変更時の重複チェック                 |
| delete                | 正常に削除できる                         |
| delete                | 存在しないIDでエラー                     |
| isPreset              | プリセットIDでtrueを返す                 |
| isPreset              | カスタムIDでfalseを返す                  |
| existsByUserIdAndName | 存在する名前でtrueを返す                 |
| existsByUserIdAndName | 除外IDが機能する                         |

### 6.2 結合テストケース

| テストシナリオ | 検証内容                               |
| -------------- | -------------------------------------- |
| CRUD一連の流れ | 作成→取得→更新→削除が正常動作          |
| プリセット保護 | プリセットの更新・削除が拒否される     |
| ユーザー分離   | 他ユーザーのテンプレートが取得できない |
| 名前重複       | 同名テンプレートの作成がエラー         |

---

## 7. 完了条件

- [x] ドメインエンティティ型が定義されている
- [x] 入力型が定義されている
- [x] Repositoryインターフェースが定義されている
- [x] Repository実装の設計が完了している
- [x] エラー型が定義されている
- [x] 認可ロジックが設計されている
- [x] テストケースが設計されている

---

## 8. 関連ドキュメント

| ドキュメント           | パス                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| チャット履歴Repository | `packages/shared/src/repositories/chat-session-repository.ts`                  |
| インターフェース仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` |
| DBスキーマ設計         | `outputs/phase-2/database-schema-design.md`                                    |
