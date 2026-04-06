import type { LoadedWorkflowManifest } from "@repo/shared/types";
import type { PhaseResourceRequest } from "./PhaseResourcePlanner";

/** manifest の構造・内容が不正であることを示す専用エラー */
export class WorkflowManifestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowManifestValidationError";
  }
}

/**
 * manifest の指定 phase から PhaseResourceRequest[] を動的に組み立てる。
 * manifest にフェーズが存在しない / resourceIds が空の場合は WorkflowManifestValidationError をスローする。
 */
export function buildPhaseResourceRequestsFromManifest(
  manifest: LoadedWorkflowManifest,
  phaseId: string,
  fallback: readonly PhaseResourceRequest[],
): PhaseResourceRequest[] {
  const phase = manifest.phases.find((p) => p.id === phaseId);

  if (!phase) {
    throw new WorkflowManifestValidationError(
      `workflow-manifest.json: phase "${phaseId}" が存在しません。manifest を修正するか、manifest を削除してください。`,
    );
  }

  if (!phase.resourceIds || phase.resourceIds.length === 0) {
    throw new WorkflowManifestValidationError(
      `workflow-manifest.json: phase "${phaseId}" の resourceIds が空です。manifest を修正するか、manifest を削除してください。`,
    );
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
    throw new WorkflowManifestValidationError(
      `workflow-manifest.json: phase "${phaseId}" の resourceIds に有効なリソースが存在しません。manifest を修正するか、manifest を削除してください。`,
    );
  }

  // fallback は manifest 不在時のみ使用するため、ここでは参照しない
  void fallback;

  return result;
}
