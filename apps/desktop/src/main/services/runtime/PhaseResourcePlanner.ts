import fs from "fs/promises";
import path from "path";
import type {
  WorkflowManifestResourceKind,
  NormalizedWorkflowManifestResourceDescriptor,
} from "@repo/shared/types";
import type { ResourceCategory } from "../skill/ResourceLoader";
import type {
  SkillCreatorFoundationSnapshot,
  SkillCreatorSourceCandidate,
  SkillCreatorSourceMode,
  SkillCreatorSourceResolutionResult,
} from "./SkillCreatorSourceResolver";

export type SkillCreatorOperation = "plan" | "execute" | "improve" | "verify";
export type SkillCreatorBudgetTier =
  | "required-core"
  | "required-context"
  | "optional-quality"
  | "optional-deep-dive";
export type SkillCreatorDegradeReason =
  | "budget_overflow"
  | "required_resource_missing"
  | "source_conflict"
  | "structure_mismatch"
  | "provenance_incomplete";

export interface PhaseResourceRequest {
  id: string;
  kind: WorkflowManifestResourceKind;
  relativePath: string;
  tier: SkillCreatorBudgetTier;
  required: boolean;
  legacyCategory?: ResourceCategory;
  legacyName?: string;
}

export interface PlannedSkillCreatorResource {
  id: string;
  kind: WorkflowManifestResourceKind;
  relativePath: string;
  absolutePath: string;
  tier: SkillCreatorBudgetTier;
  required: boolean;
  bytes: number;
  sourceMode: SkillCreatorSourceMode;
  selectedRoot: string;
  structureSignature?: string;
  suppressedRoots: string[];
  legacyCategory?: ResourceCategory;
  legacyName?: string;
}

export interface DroppedSkillCreatorResource {
  id: string;
  tier: SkillCreatorBudgetTier;
  reason: SkillCreatorDegradeReason;
}

export interface PhaseResourcePlanningSnapshot {
  foundationSnapshot?: SkillCreatorFoundationSnapshot;
  resolvedSkillCreatorRoot?: string;
  candidateRoots: string[];
  selectedResourceIds: string[];
  droppedResourceIds: string[];
  structureSignature?: string;
  selectedRoots: string[];
  degradeReasons: SkillCreatorDegradeReason[];
}

export interface PhaseResourcePlanningResult {
  resources: PlannedSkillCreatorResource[];
  droppedResources: DroppedSkillCreatorResource[];
  degradeReasons: SkillCreatorDegradeReason[];
  snapshot: PhaseResourcePlanningSnapshot;
}

export interface PhaseResourcePlannerInput {
  operation: SkillCreatorOperation;
  requests: readonly PhaseResourceRequest[];
  resolution: SkillCreatorSourceResolutionResult;
  maxBytes: number;
}

const OPTIONAL_DROP_ORDER: Record<SkillCreatorBudgetTier, number> = {
  "required-core": 0,
  "required-context": 1,
  "optional-quality": 2,
  "optional-deep-dive": 3,
};

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readFileSize(targetPath: string): Promise<number> {
  const stat = await fs.stat(targetPath);
  return stat.size;
}

function getPreferredCandidate(
  candidates: SkillCreatorSourceCandidate[],
): SkillCreatorSourceCandidate | undefined {
  return candidates.find(
    (candidate) => candidate.missingRequiredPaths.length === 0,
  );
}

function getStructureSignature(
  candidates: SkillCreatorSourceCandidate[],
  rootPath: string,
): string | undefined {
  return candidates.find((candidate) => candidate.rootPath === rootPath)
    ?.structureSignature;
}

function manifestDescriptorFor(
  manifestResources: Map<string, NormalizedWorkflowManifestResourceDescriptor>,
  request: PhaseResourceRequest,
): NormalizedWorkflowManifestResourceDescriptor | undefined {
  return manifestResources.get(request.id);
}

export class PhaseResourcePlanner {
  async plan(
    input: PhaseResourcePlannerInput,
  ): Promise<PhaseResourcePlanningResult> {
    const degradeReasons = new Set<SkillCreatorDegradeReason>(
      input.resolution.degradeReasons as SkillCreatorDegradeReason[],
    );
    const preferredCandidate = getPreferredCandidate(
      input.resolution.candidateRoots,
    );
    const resolvedResources: PlannedSkillCreatorResource[] = [];
    const droppedResources: DroppedSkillCreatorResource[] = [];
    const selectedRoots = new Set<string>();

    for (const request of input.requests) {
      const manifestDescriptor = manifestDescriptorFor(
        input.resolution.manifestResources,
        request,
      );
      const fallbackMatches: SkillCreatorSourceCandidate[] = [];

      for (const candidate of input.resolution.candidateRoots) {
        const absolutePath = path.join(
          candidate.rootPath,
          request.relativePath,
        );
        if (await pathExists(absolutePath)) {
          fallbackMatches.push(candidate);
        }
      }

      let absolutePath: string | undefined;
      let selectedRoot: string | undefined;
      let sourceMode: SkillCreatorSourceMode | undefined;
      let suppressedRoots: string[] = [];
      let structureSignature: string | undefined;

      if (
        manifestDescriptor &&
        (await pathExists(manifestDescriptor.absolutePath))
      ) {
        absolutePath = manifestDescriptor.absolutePath;
        selectedRoot = input.resolution.foundationSnapshot?.manifestDir;
        sourceMode = "manifest";
      } else if (fallbackMatches.length > 0) {
        const selectedCandidate =
          (preferredCandidate &&
            fallbackMatches.find(
              (candidate) => candidate.rootPath === preferredCandidate.rootPath,
            )) ??
          fallbackMatches[0];
        absolutePath = path.join(
          selectedCandidate.rootPath,
          request.relativePath,
        );
        selectedRoot = selectedCandidate.rootPath;
        sourceMode = selectedCandidate.source;
        structureSignature = selectedCandidate.structureSignature;
        suppressedRoots = fallbackMatches
          .filter(
            (candidate) => candidate.rootPath !== selectedCandidate.rootPath,
          )
          .map((candidate) => candidate.rootPath);
        if (suppressedRoots.length > 0) {
          degradeReasons.add("source_conflict");
        }
      }

      if (!absolutePath || !selectedRoot || !sourceMode) {
        if (request.required) {
          degradeReasons.add("required_resource_missing");
          throw new Error(
            `required_resource_missing:${input.operation}:${request.id}`,
          );
        }
        droppedResources.push({
          id: request.id,
          tier: request.tier,
          reason: "required_resource_missing",
        });
        degradeReasons.add("required_resource_missing");
        continue;
      }

      const bytes = await readFileSize(absolutePath);
      selectedRoots.add(selectedRoot);
      resolvedResources.push({
        id: request.id,
        kind: request.kind,
        relativePath: request.relativePath,
        absolutePath,
        tier: request.tier,
        required: request.required,
        bytes,
        sourceMode,
        selectedRoot,
        structureSignature:
          structureSignature ??
          getStructureSignature(input.resolution.candidateRoots, selectedRoot),
        suppressedRoots,
        legacyCategory: request.legacyCategory,
        legacyName: request.legacyName,
      });
    }

    let totalBytes = resolvedResources.reduce(
      (sum, resource) => sum + resource.bytes,
      0,
    );
    if (totalBytes > input.maxBytes) {
      const optionalResources = resolvedResources
        .filter((resource) => !resource.required)
        .sort(
          (left, right) =>
            OPTIONAL_DROP_ORDER[right.tier] - OPTIONAL_DROP_ORDER[left.tier],
        );
      for (const resource of optionalResources) {
        if (totalBytes <= input.maxBytes) {
          break;
        }
        const index = resolvedResources.findIndex(
          (candidate) => candidate.id === resource.id,
        );
        if (index === -1) {
          continue;
        }
        resolvedResources.splice(index, 1);
        droppedResources.push({
          id: resource.id,
          tier: resource.tier,
          reason: "budget_overflow",
        });
        totalBytes -= resource.bytes;
        degradeReasons.add("budget_overflow");
      }
    }

    if (selectedRoots.size === 0) {
      degradeReasons.add("provenance_incomplete");
    }

    const selectedRootList = Array.from(selectedRoots);
    const resolvedSkillCreatorRoot =
      selectedRootList[0] ?? preferredCandidate?.rootPath;
    const structureSignature = resolvedSkillCreatorRoot
      ? (getStructureSignature(
          input.resolution.candidateRoots,
          resolvedSkillCreatorRoot,
        ) ?? resolvedResources[0]?.structureSignature)
      : resolvedResources[0]?.structureSignature;

    return {
      resources: resolvedResources,
      droppedResources,
      degradeReasons: Array.from(degradeReasons),
      snapshot: {
        foundationSnapshot: input.resolution.foundationSnapshot,
        resolvedSkillCreatorRoot,
        candidateRoots: input.resolution.candidateRoots.map(
          (candidate) => candidate.rootPath,
        ),
        selectedResourceIds: resolvedResources.map((resource) => resource.id),
        droppedResourceIds: droppedResources.map((resource) => resource.id),
        structureSignature,
        selectedRoots: selectedRootList,
        degradeReasons: Array.from(degradeReasons),
      },
    };
  }
}
