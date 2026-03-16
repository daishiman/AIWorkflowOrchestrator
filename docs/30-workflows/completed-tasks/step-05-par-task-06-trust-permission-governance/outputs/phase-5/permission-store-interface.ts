// apps/desktop/src/main/permissions/ への追加内容（正本）
// Task-06 Phase 5 成果物: AllowedToolEntry / AllowedToolEntryV2 / PermissionStoreInterface / calcExpiresAt 型定義

/**
 * 既存型（変更なし。破壊禁止）。
 * electron-store に永続化されている既存エントリはこの型で読み込まれる。
 * AllowedToolEntryV2 への移行は後方互換性を保ちながら段階的に行う。
 */
export interface AllowedToolEntry {
  toolName: string;
  allowedAt: number; // Unix timestamp (ms)
}

/**
 * 拡張型。既存の AllowedToolEntry に失効情報を追加。
 *
 * 後方互換性ルール:
 * - expiresAt が undefined の既存エントリは「無期限有効」として扱う
 * - skillName が undefined のエントリは「全スキルに適用」として扱う
 * - expiryPolicy が undefined の既存エントリは "permanent" として扱う
 *
 * TC-T-004 不変条件:
 * - AllowedToolEntry 型（expiresAt なし）は AllowedToolEntryV2 型に代入可能
 *   （TypeScript の構造的部分型による互換性保証）
 */
export interface AllowedToolEntryV2 extends AllowedToolEntry {
  /** 失効タイムスタンプ（Unix ms）。undefined = 無期限 */
  expiresAt?: number;
  /** 適用対象スキル名。undefined = 全スキルに適用 */
  skillName?: string;
  /** 失効ポリシー種別 */
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}

/**
 * PermissionStore の公開メソッド仕様。
 * TC-ST-001 の検証対象。
 *
 * isToolAllowed 6分岐フロー:
 * 1. entry が存在しない → false を返す
 * 2. expiresAt === undefined → true を返す（無期限有効）
 * 3. expiresAt < Date.now() → electron-store から削除して false を返す（失効）
 * 4. expiresAt >= Date.now() → true を返す（有効期限内）
 * 5. skillName が定義されており呼び出し時の skillName と不一致 → false を返す
 * 6. それ以外（全条件クリア）→ true を返す
 *
 * revokeSessionEntries の動作:
 * - expiryPolicy === "session" のエントリを全て削除する
 * - sessionId はログ記録用のみ（フィルタリング条件ではない）
 */
export interface PermissionStoreInterface {
  /**
   * 指定ツールが許可済みかどうかを判定する。
   * @param toolName - 判定対象のツール名
   * @param skillName - 呼び出し元スキル名（省略時は全スキルに対する許可を確認）
   */
  isToolAllowed(toolName: string, skillName?: string): boolean;

  /**
   * ツールを許可リストに追加する。
   * 同一 toolName のエントリが存在する場合は上書きする。
   * @param entry - 追加するエントリ（expiryPolicy に基づき expiresAt を自動計算）
   */
  allowTool(entry: AllowedToolEntryV2): void;

  /**
   * 指定ツールの許可を取り消す。
   * 履歴テーブルには decision: "revoked" として記録する。
   * @param toolName - 取り消し対象のツール名
   */
  revokeTool(toolName: string): void;

  /**
   * 全ての許可エントリを削除する。
   * 設定リセット・スキル削除時に呼び出す。
   */
  revokeAll(): void;

  /**
   * セッション中の approve_once エントリを全て削除する。
   * アプリ再起動時・abort フロー実行時に呼び出す。
   * @param sessionId - ログ記録用セッション ID
   */
  revokeSessionEntries(sessionId: string): void;

  /**
   * 現在有効な許可エントリを全て返す。
   * 期限切れエントリは返却前に自動削除する。
   */
  getAllowedTools(): AllowedToolEntryV2[];
}

/**
 * 失効ポリシー別 expiresAt 計算関数。
 * TC-ST-002 の検証対象。
 *
 * 計算ルール一覧:
 * | ポリシー  | expiresAt 計算式        | 備考                        |
 * | --------- | ----------------------- | --------------------------- |
 * | session   | undefined               | electron-store に書かない    |
 * | time_24h  | allowedAt + 86_400_000  | 24時間後（1日）             |
 * | time_7d   | allowedAt + 604_800_000 | 7日後（1週間）              |
 * | permanent | undefined               | 明示取り消しまで有効        |
 *
 * @param policy - 失効ポリシー種別
 * @param allowedAt - 許可記録タイムスタンプ（Unix ms）
 * @returns 失効タイムスタンプ（Unix ms）。undefined の場合は無期限
 */
export function calcExpiresAt(
  policy: NonNullable<AllowedToolEntryV2["expiryPolicy"]>,
  allowedAt: number,
): number | undefined {
  switch (policy) {
    case "session":
      // セッション管理はメモリ上のみ。electron-store には書き込まない
      return undefined;
    case "time_24h":
      // 86_400_000 ms = 60 * 60 * 24 * 1000 = 24時間
      return allowedAt + 86_400_000;
    case "time_7d":
      // 604_800_000 ms = 60 * 60 * 24 * 7 * 1000 = 7日間
      return allowedAt + 604_800_000;
    case "permanent":
      // 明示的な取り消しまで有効。electron-store に書き込む
      return undefined;
  }
}

/**
 * 承認履歴の最大保持件数。
 * 超過時は最古エントリを削除する（FIFO方式）。
 * 変更する場合は TC-ST-003 のテストも更新すること。
 */
export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;
