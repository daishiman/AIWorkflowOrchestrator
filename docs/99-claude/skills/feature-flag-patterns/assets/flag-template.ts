/**
 * Feature Flag Template
 *
 * このテンプレートを使用して新しい機能フラグを定義します。
 */

export interface FeatureFlag {
  /** フラグの一意識別子 */
  name: string;
  /** フラグのタイプ: release | experiment | ops | permission */
  type: "release" | "experiment" | "ops" | "permission";
  /** フラグがオフの場合のデフォルト値 */
  defaultValue: boolean;
  /** フラグのオーナー（チームまたは個人） */
  owner: string;
  /** フラグの説明 */
  description?: string;
  /** 有効期限（ISO 8601形式） */
  expiresAt?: string;
  /** ロールアウト設定 */
  rollout?: {
    /** パーセンテージ（0-100） */
    percentage?: number;
    /** 対象ユーザーグループ */
    cohorts?: string[];
  };
}

// 例: 新機能のリリースフラグ
export const newDashboardFlag: FeatureFlag = {
  name: "new-dashboard",
  type: "release",
  defaultValue: false,
  owner: "frontend-team",
  description: "新しいダッシュボードUI",
  expiresAt: "2026-03-01",
  rollout: {
    percentage: 10,
  },
};

// フラグ評価関数
export function isEnabled(
  flag: FeatureFlag,
  context?: { userId?: string },
): boolean {
  // 1. ロールアウト設定がある場合はパーセンテージで判定
  if (flag.rollout?.percentage !== undefined && context?.userId) {
    const hash = hashUserId(context.userId);
    return hash < flag.rollout.percentage;
  }

  // 2. デフォルト値を返す
  return flag.defaultValue;
}

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) % 100;
  }
  return hash;
}
