/**
 * @file サンプルTypeScriptファイル
 * @description 手動テスト用のTypeScriptコードサンプル
 */

// =============================================================================
// インポート
// =============================================================================

import { readFile } from "fs/promises";

// ローカル型定義
type Result<T, E> = { success: true; data: T } | { success: false; error: E };

// =============================================================================
// 型定義
// =============================================================================

/**
 * ユーザー情報
 */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * ユーザー作成オプション
 */
export type CreateUserOptions = Omit<User, "id" | "createdAt">;

// =============================================================================
// クラス
// =============================================================================

/**
 * ユーザーサービス
 */
export class UserService {
  private users: Map<string, User> = new Map();

  /**
   * ユーザーを作成
   */
  createUser(options: CreateUserOptions): User {
    const user: User = {
      id: crypto.randomUUID(),
      ...options,
      createdAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  /**
   * ユーザーを取得
   */
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * すべてのユーザーを取得
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
}

// =============================================================================
// 関数
// =============================================================================

/**
 * ファイルを読み込む
 */
export async function loadFile(path: string): Promise<Result<string, Error>> {
  try {
    const content = await readFile(path, "utf-8");
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * 配列をフィルタリング
 */
export const filterArray = <T>(
  array: T[],
  predicate: (item: T) => boolean,
): T[] => {
  return array.filter(predicate);
};
