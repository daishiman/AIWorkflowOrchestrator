import type { RuntimeSkillCreatorVerifyCheck } from "@repo/shared/types";

/**
 * verify チェック結果を improve 用のフィードバック文字列に変換する。
 * error → warning の優先順で、severity === "info"（PASS）は除外する。
 *
 * @param checks - verify チェック結果の配列
 * @returns フィードバック文字列。失敗チェックがない場合は空文字列
 */
export function formatVerifyChecksAsFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
): string {
  const failedChecks = checks.filter((c) => c.severity !== "info");

  if (failedChecks.length === 0) {
    return "";
  }

  const severityOrder: Record<string, number> = {
    error: 0,
    warning: 1,
    info: 2,
  };
  const sorted = [...failedChecks].sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99),
  );

  const lines = sorted.map(
    (c) => `[${c.severity.toUpperCase()}] ${c.id}: ${c.summary}`,
  );

  return `以下の検証チェックに失敗しました。修正してください:\n\n${lines.join("\n")}`;
}
