/**
 * SDK Message Utilities
 * SDK 生メッセージの前処理を共通化するヘルパー。
 *
 * SkillExecutor（既存スキル実行 lane）と sdkMessageNormalizer（skill-creator lane）の
 * 両方で使用される「unknown → record 判定」と「type フィールド読取り」を1箇所に集約する。
 * lane 固有の分岐・出力マッピングはここに含めない。
 */

/** SDK 生メッセージ候補を表す最小 record。lane 固有 shape はここに閉じ込めない。 */
export type SdkMessageRecord = Record<string, unknown>;

/**
 * unknown を SDK メッセージ候補 record に正規化する。
 * null / undefined / 非オブジェクト / 配列は除外する。
 *
 * @param message - 検証対象の値（型は unknown）
 * @returns 配列以外の object なら SdkMessageRecord、それ以外は null
 */
export function asSdkMessageRecord(message: unknown): SdkMessageRecord | null {
  if (
    message == null ||
    typeof message !== "object" ||
    Array.isArray(message)
  ) {
    return null;
  }
  return message as SdkMessageRecord;
}

/**
 * SDK メッセージ候補 record から type フィールドを安全に取り出す。
 * type が string でない場合は undefined を返す。
 *
 * @param message - SdkMessageRecord（asSdkMessageRecord の戻り値）
 * @returns type フィールドの値（string）、または undefined
 */
export function getSdkMessageType(
  message: SdkMessageRecord,
): string | undefined {
  return typeof message.type === "string" ? message.type : undefined;
}
