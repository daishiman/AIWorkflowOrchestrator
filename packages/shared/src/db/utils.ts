/**
 * データベースユーティリティ関数
 *
 * COALESCE、ページネーション、バッチ処理等の汎用ユーティリティ
 */
import { sql, SQL } from "drizzle-orm";

/**
 * SQL COALESCE関数
 * 最初のNULLでない値を返す
 *
 * @example
 * ```typescript
 * const result = await db
 *   .select({ name: coalesce(users.nickname, users.name, sql`'Anonymous'`) })
 *   .from(users);
 * ```
 */
export function coalesce<T>(...values: (SQL | T)[]): SQL {
  if (values.length === 0) {
    throw new Error("coalesce requires at least one argument");
  }

  const sqlValues = values.map((v) => (v instanceof SQL ? v : sql`${v}`));

  return sql`COALESCE(${sql.join(sqlValues, sql`, `)})`;
}

/**
 * JSON配列の長さを取得
 *
 * @example
 * ```typescript
 * const result = await db
 *   .select({
 *     messageCount: jsonArrayLength(sessions.messages)
 *   })
 *   .from(sessions);
 * ```
 */
export function jsonArrayLength(column: SQL): SQL {
  return sql`json_array_length(${column})`;
}

/**
 * 現在のタイムスタンプを取得（ISO 8601形式、UTC）
 *
 * @example
 * ```typescript
 * await db.insert(users).values({
 *   id: uuid(),
 *   createdAt: currentTimestamp(),
 *   updatedAt: currentTimestamp(),
 * });
 * ```
 */
export function currentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * ページネーション用のオフセット計算
 *
 * @param page ページ番号（1から開始）
 * @param pageSize ページサイズ
 * @returns { offset, limit }
 *
 * @example
 * ```typescript
 * const { offset, limit } = paginate(2, 20);
 * const results = await db
 *   .select()
 *   .from(users)
 *   .offset(offset)
 *   .limit(limit);
 * ```
 */
export function paginate(
  page: number,
  pageSize: number,
): { offset: number; limit: number } {
  if (page < 1) {
    throw new Error("Page number must be >= 1");
  }
  if (pageSize < 1) {
    throw new Error("Page size must be >= 1");
  }

  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

/**
 * バッチ処理用のチャンク分割
 *
 * @param items 処理する項目の配列
 * @param batchSize バッチサイズ（デフォルト: 1000）
 * @returns チャンクの配列
 *
 * @example
 * ```typescript
 * const users = [...]; // 10000件のユーザーデータ
 * const batches = batchProcess(users, 1000);
 *
 * for (const batch of batches) {
 *   await db.insert(usersTable).values(batch);
 * }
 * ```
 */
export function batchProcess<T>(items: T[], batchSize = 1000): T[][] {
  if (batchSize < 1) {
    throw new Error("Batch size must be >= 1");
  }

  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * ON CONFLICT DO NOTHING相当の処理
 * SQLiteではINSERT OR IGNOREを使用
 *
 * @example
 * ```typescript
 * await db.run(sql`
 *   INSERT OR IGNORE INTO users (id, name) VALUES (${id}, ${name})
 * `);
 * ```
 */
export function onConflictDoNothing(): SQL {
  return sql`OR IGNORE`;
}

/**
 * ON CONFLICT DO UPDATE相当の処理
 * SQLiteではINSERT OR REPLACEを使用
 *
 * @example
 * ```typescript
 * await db.run(sql`
 *   INSERT OR REPLACE INTO users (id, name, updated_at)
 *   VALUES (${id}, ${name}, ${currentTimestamp()})
 * `);
 * ```
 */
export function onConflictDoUpdate(): SQL {
  return sql`OR REPLACE`;
}

/**
 * UUID v4 生成
 * ブラウザ環境とNode.js環境の両方で動作
 */
export function uuid(): string {
  // Node.js環境
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // フォールバック（RFC4122準拠のUUID v4）
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
