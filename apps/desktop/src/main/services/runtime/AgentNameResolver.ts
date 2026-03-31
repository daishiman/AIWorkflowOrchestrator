/**
 * AgentNameResolver — エージェント名の動的解決ユーティリティ
 *
 * TASK-P0-07: hardcoded-agent-names-dynamic-resolution
 *
 * ハードコードされた AGENT_NAMES 定数を排除し、
 * LoadedWorkflowManifest または PhaseResourceRequest 配列から
 * エージェント名を動的に解決する。
 *
 * フォールバック順序: manifest → defaultNames → PLAN_RESOURCE_REQUESTS 由来
 */

import type { AgentConfig, LoadedWorkflowManifest } from "@repo/shared/types";
import type { PhaseResourceRequest } from "./PhaseResourcePlanner";

/**
 * plan() フェーズのデフォルトエージェント名。
 * PLAN_RESOURCE_REQUESTS の agent エントリと同一。
 * ManifestLoader が利用できない legacy path でのフォールバックに使用する。
 */
export const DEFAULT_PLAN_AGENT_NAMES: readonly string[] = [
  "discover-problem",
  "design-workflow",
  "plan-structure",
] as const;

export class AgentNameResolver {
  /**
   * LoadedWorkflowManifest からエージェント名を解決する。
   *
   * manifest の resources のうち kind === "agent" のものの ID を返す。
   * agent リソースが存在しない場合は defaultNames にフォールバックする。
   *
   * @param manifest - 読み込み済みワークフローマニフェスト
   * @param defaultNames - フォールバック用デフォルト名（省略時は DEFAULT_PLAN_AGENT_NAMES）
   */
  resolveFromManifest(
    manifest: LoadedWorkflowManifest,
    defaultNames: readonly string[] = DEFAULT_PLAN_AGENT_NAMES,
  ): AgentConfig {
    const agentIds = manifest.resources
      .filter((r) => r.kind === "agent")
      .map((r) => r.id);
    return { names: agentIds.length > 0 ? agentIds : defaultNames };
  }

  /**
   * PhaseResourceRequest 配列からエージェント名を解決する。
   *
   * kind === "agent" のエントリの ID のみを返す。
   * ManifestLoader が利用できない legacy path でのフォールバックとして使用する。
   *
   * @param requests - フェーズリソースリクエスト配列（PLAN_RESOURCE_REQUESTS 等）
   */
  resolveFromRequests(requests: readonly PhaseResourceRequest[]): AgentConfig {
    const names = requests.filter((r) => r.kind === "agent").map((r) => r.id);
    return { names };
  }
}
