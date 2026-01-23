/**
 * システムプロンプトテンプレートリポジトリ
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/repository-interface-design.md
 */

import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import type {
  PromptTemplate,
  CreatePromptTemplateInput,
  UpdatePromptTemplateInput,
  FindTemplatesOptions,
  ISystemPromptRepository,
} from "./types/system-prompt.js";
import { SYSTEM_USER_ID } from "../db/schema/system-prompt.js";

/**
 * システムプロンプトテンプレートリポジトリ
 *
 * カスタムおよびプリセットシステムプロンプトテンプレートのCRUD操作を提供する。
 */
export class SystemPromptRepository implements ISystemPromptRepository {
  private sqlite: Database.Database;

  constructor(private db: BetterSQLite3Database) {
    // Drizzle ORMインスタンスから生のbetter-sqlite3インスタンスを取得
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sqlite = (db as any).$client as Database.Database;
  }

  /**
   * ユーザーIDでテンプレート一覧を取得
   */
  async findAllByUserId(
    userId: string,
    options: FindTemplatesOptions = {},
  ): Promise<PromptTemplate[]> {
    const {
      limit = 100,
      offset = 0,
      includePresets = true,
      orderBy = "createdAt",
      orderDirection = "DESC",
    } = options;

    // ソートカラムのマッピング
    const sortColumnMap: Record<string, string> = {
      createdAt: "created_at",
      updatedAt: "updated_at",
      name: "name",
    };
    const sortColumn = sortColumnMap[orderBy] || "created_at";
    const sortDir = orderDirection === "ASC" ? "ASC" : "DESC";

    let query: string;
    const params: unknown[] = [];

    if (includePresets) {
      query = `
        SELECT * FROM system_prompt_templates
        WHERE user_id = ? OR is_preset = 1
        ORDER BY ${sortColumn} ${sortDir}
        LIMIT ? OFFSET ?
      `;
      params.push(userId, limit, offset);
    } else {
      query = `
        SELECT * FROM system_prompt_templates
        WHERE user_id = ? AND is_preset = 0
        ORDER BY ${sortColumn} ${sortDir}
        LIMIT ? OFFSET ?
      `;
      params.push(userId, limit, offset);
    }

    const stmt = this.sqlite.prepare(query);
    const rows = stmt.all(...params) as Record<string, unknown>[];

    return rows.map((row) => this.mapRowToTemplate(row));
  }

  /**
   * IDでテンプレートを取得
   */
  async findById(id: string): Promise<PromptTemplate | null> {
    const row = this.db.get(sql`
      SELECT * FROM system_prompt_templates
      WHERE id = ${id}
    `) as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToTemplate(row);
  }

  /**
   * 全プリセットテンプレートを取得
   */
  async findAllPresets(): Promise<PromptTemplate[]> {
    const rows = this.db.all(sql`
      SELECT * FROM system_prompt_templates
      WHERE is_preset = 1
      ORDER BY name ASC
    `) as Record<string, unknown>[];

    return rows.map((row) => this.mapRowToTemplate(row));
  }

  /**
   * テンプレートを作成
   */
  async create(
    userId: string,
    data: CreatePromptTemplateInput,
  ): Promise<PromptTemplate> {
    // 入力バリデーション
    const trimmedName = data.name.trim();
    if (!trimmedName || trimmedName.length === 0) {
      throw new Error("テンプレート名は必須です");
    }
    if (trimmedName.length > 50) {
      throw new Error("テンプレート名は50文字以内にしてください");
    }
    if (!data.content || data.content.length === 0) {
      throw new Error("テンプレート本文は必須です");
    }
    if (data.content.length > 4000) {
      throw new Error("テンプレート本文は4000文字以内にしてください");
    }

    // 名前重複チェック（ユーザーのテンプレート + プリセット）
    const duplicateExists = await this.existsByUserIdAndName(
      userId,
      trimmedName,
    );
    if (duplicateExists) {
      throw new Error("同名のテンプレートが既に存在します");
    }

    // プリセットとの重複チェック
    const presetDuplicate = await this.existsByUserIdAndName(
      SYSTEM_USER_ID,
      trimmedName,
    );
    if (presetDuplicate) {
      throw new Error("同名のプリセットテンプレートが存在します");
    }

    const id = uuidv4();
    const now = Date.now();

    this.db.run(sql`
      INSERT INTO system_prompt_templates (
        id, user_id, name, content, is_preset, created_at, updated_at
      ) VALUES (
        ${id},
        ${userId},
        ${trimmedName},
        ${data.content},
        ${0},
        ${now},
        ${now}
      )
    `);

    const created = await this.findById(id);
    if (!created) {
      throw new Error("テンプレートの作成に失敗しました");
    }

    return created;
  }

  /**
   * テンプレートを更新
   */
  async update(
    id: string,
    data: UpdatePromptTemplateInput,
  ): Promise<PromptTemplate> {
    // 存在チェック
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("テンプレートが見つかりません");
    }

    // プリセット保護
    if (existing.isPreset) {
      throw new Error("プリセットテンプレートは編集できません");
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName || trimmedName.length === 0) {
        throw new Error("テンプレート名は必須です");
      }
      if (trimmedName.length > 50) {
        throw new Error("テンプレート名は50文字以内にしてください");
      }

      // 名前変更時の重複チェック
      if (trimmedName !== existing.name) {
        const duplicateExists = await this.existsByUserIdAndName(
          existing.userId,
          trimmedName,
          id,
        );
        if (duplicateExists) {
          throw new Error("同名のテンプレートが既に存在します");
        }

        // プリセットとの重複チェック
        const presetDuplicate = await this.existsByUserIdAndName(
          SYSTEM_USER_ID,
          trimmedName,
        );
        if (presetDuplicate) {
          throw new Error("同名のプリセットテンプレートが存在します");
        }
      }

      sets.push("name = ?");
      values.push(trimmedName);
    }

    if (data.content !== undefined) {
      if (!data.content || data.content.length === 0) {
        throw new Error("テンプレート本文は必須です");
      }
      if (data.content.length > 4000) {
        throw new Error("テンプレート本文は4000文字以内にしてください");
      }

      sets.push("content = ?");
      values.push(data.content);
    }

    if (sets.length === 0) {
      return existing;
    }

    // updated_atを更新
    sets.push("updated_at = ?");
    values.push(Date.now());

    values.push(id);

    const stmt = this.sqlite.prepare(`
      UPDATE system_prompt_templates
      SET ${sets.join(", ")}
      WHERE id = ?
    `);
    stmt.run(...values);

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error("テンプレートの更新に失敗しました");
    }

    return updated;
  }

  /**
   * テンプレートを削除
   */
  async delete(id: string): Promise<void> {
    // 存在チェック
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("テンプレートが見つかりません");
    }

    // プリセット保護
    if (existing.isPreset) {
      throw new Error("プリセットテンプレートは削除できません");
    }

    this.db.run(sql`
      DELETE FROM system_prompt_templates
      WHERE id = ${id}
    `);
  }

  /**
   * プリセットテンプレートか判定
   */
  async isPreset(id: string): Promise<boolean> {
    const row = this.db.get(sql`
      SELECT is_preset FROM system_prompt_templates
      WHERE id = ${id}
    `) as { is_preset: number } | undefined;

    if (!row) {
      return false;
    }

    return row.is_preset === 1;
  }

  /**
   * ユーザーと名前でテンプレートが存在するか確認
   */
  async existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    if (excludeId) {
      const row = this.db.get(sql`
        SELECT 1 FROM system_prompt_templates
        WHERE user_id = ${userId} AND name = ${name} AND id != ${excludeId}
        LIMIT 1
      `);
      return row !== undefined;
    }

    const row = this.db.get(sql`
      SELECT 1 FROM system_prompt_templates
      WHERE user_id = ${userId} AND name = ${name}
      LIMIT 1
    `);
    return row !== undefined;
  }

  /**
   * テンプレートが存在するか確認
   */
  async exists(id: string): Promise<boolean> {
    const row = this.db.get(sql`
      SELECT 1 FROM system_prompt_templates
      WHERE id = ${id}
      LIMIT 1
    `);
    return row !== undefined;
  }

  /**
   * DBの行をPromptTemplateオブジェクトにマッピングする
   */
  private mapRowToTemplate(row: Record<string, unknown>): PromptTemplate {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      name: row.name as string,
      content: row.content as string,
      isPreset: (row.is_preset as number) === 1,
      createdAt: new Date(row.created_at as number),
      updatedAt: new Date(row.updated_at as number),
    };
  }
}
