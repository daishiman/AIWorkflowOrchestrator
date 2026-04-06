import type { LoadedWorkflowManifest } from "@repo/shared/types";
import type { PhaseResourceRequest } from "./PhaseResourcePlanner";

/**
 * manifest の指定 phase から PhaseResourceRequest[] を動的に組み立てる。
 * manifest にフェーズが存在しない / resourceIds が空の場合は fallback を返す。
 */
export function buildPhaseResourceRequestsFromManifest(
  manifest: LoadedWorkflowManifest,
  phaseId: string,
  fallback: readonly PhaseResourceRequest[],
): PhaseResourceRequest[] {
  const phase = manifest.phases.find((p) => p.id === phaseId);

  if (!phase) {
    console.warn(
      `[manifestResourceResolver] manifest phase "${phaseId}" not found or has no resourceIds, falling back to static resource requests`,
    );
    return [...fallback];
  }

  if (!phase.resourceIds || phase.resourceIds.length === 0) {
    console.warn(
      `[manifestResourceResolver] manifest phase "${phaseId}" not found or has no resourceIds, falling back to static resource requests`,
    );
    return [...fallback];
  }

  const result: PhaseResourceRequest[] = [];
  for (const resourceId of phase.resourceIds) {
    const resource = manifest.resources.find((r) => r.id === resourceId);
    if (!resource) {
      console.warn(
        `[manifestResourceResolver] manifest resource "${resourceId}" not found in resources[], skipping`,
      );
      continue;
    }

    const isAgent = resource.kind === "agent";
    result.push({
      id: resource.id,
      kind: resource.kind,
      relativePath: resource.path.replace(/^\.\//, ""),
      tier: isAgent ? "required-core" : "optional-quality",
      required: isAgent,
    });
  }

  if (result.length === 0) {
    console.warn(
      `[manifestResourceResolver] manifest phase "${phaseId}" not found or has no resourceIds, falling back to static resource requests`,
    );
    return [...fallback];
  }

  return result;
}
