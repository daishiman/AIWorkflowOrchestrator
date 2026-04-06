import fs from "fs/promises";
import path from "path";
import type {
  LoadedWorkflowManifest,
  NormalizedWorkflowManifestResourceDescriptor,
} from "@repo/shared/types";
import {
  getSkillCreatorRootCandidates,
  type SkillCreatorRootCandidateSource,
} from "../skill/constants";

export type SkillCreatorSourceMode =
  | "manifest"
  | SkillCreatorRootCandidateSource;

export interface SkillCreatorFoundationSnapshot {
  sourcePath: string;
  manifestDir: string;
  manifestMtimeMs: number;
  resourceDescriptorHash: string;
  cacheKey: string;
}

export interface SkillCreatorSourceCandidate {
  source: SkillCreatorSourceMode;
  rootPath: string;
  structureSignature: string;
  availableEntries: string[];
  missingRequiredPaths: string[];
}

export interface SkillCreatorRejectedRoot {
  source: SkillCreatorSourceMode;
  rootPath: string;
  reason: "structure_mismatch";
  missingRequiredPaths: string[];
}

export interface SkillCreatorSourceResolutionInput {
  explicitRoot?: string;
  manifest?: LoadedWorkflowManifest;
  requiredRelativePaths?: string[];
}

export interface SkillCreatorSourceResolutionResult {
  foundationSnapshot?: SkillCreatorFoundationSnapshot;
  manifestResources: Map<string, NormalizedWorkflowManifestResourceDescriptor>;
  candidateRoots: SkillCreatorSourceCandidate[];
  rejectedRoots: SkillCreatorRejectedRoot[];
  degradeReasons: string[];
}

const STANDARD_STRUCTURE_ENTRIES = [
  "SKILL.md",
  "agents",
  "references",
  "assets",
  "schemas",
  "scripts",
  "workflow-manifest.json",
] as const;

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function buildStructureSignature(entries: string[]): string {
  return STANDARD_STRUCTURE_ENTRIES.map((entry) =>
    entries.includes(entry) ? `${entry}:1` : `${entry}:0`,
  ).join("|");
}

export class SkillCreatorSourceResolver {
  async resolve(
    input: SkillCreatorSourceResolutionInput = {},
  ): Promise<SkillCreatorSourceResolutionResult> {
    const manifestResources = new Map<
      string,
      NormalizedWorkflowManifestResourceDescriptor
    >(
      (input.manifest?.resources ?? []).map((resource) => [
        resource.id,
        resource,
      ]),
    );
    const requiredRelativePaths = Array.from(
      new Set(input.requiredRelativePaths ?? []),
    );
    const candidateDefs: Array<{
      source: SkillCreatorSourceMode;
      rootPath: string;
    }> = [];

    if (input.manifest) {
      candidateDefs.push({
        source: "manifest",
        rootPath: input.manifest.manifestDir,
      });
    }

    for (const candidate of getSkillCreatorRootCandidates(input.explicitRoot)) {
      candidateDefs.push({
        source: candidate.source,
        rootPath: candidate.path,
      });
    }

    const seenRoots = new Set<string>();
    const candidateRoots: SkillCreatorSourceCandidate[] = [];
    const rejectedRoots: SkillCreatorRejectedRoot[] = [];

    for (const candidate of candidateDefs) {
      const resolvedRoot = path.resolve(candidate.rootPath);
      if (seenRoots.has(resolvedRoot)) {
        continue;
      }
      seenRoots.add(resolvedRoot);

      const availableEntries: string[] = [];
      for (const entry of STANDARD_STRUCTURE_ENTRIES) {
        if (await pathExists(path.join(resolvedRoot, entry))) {
          availableEntries.push(entry);
        }
      }

      const missingRequiredPaths: string[] = [];
      for (const relativePath of requiredRelativePaths) {
        if (!(await pathExists(path.join(resolvedRoot, relativePath)))) {
          missingRequiredPaths.push(relativePath);
        }
      }

      const rootInfo: SkillCreatorSourceCandidate = {
        source: candidate.source,
        rootPath: resolvedRoot,
        structureSignature: buildStructureSignature(availableEntries),
        availableEntries,
        missingRequiredPaths,
      };

      candidateRoots.push(rootInfo);
      if (missingRequiredPaths.length > 0) {
        rejectedRoots.push({
          source: candidate.source,
          rootPath: resolvedRoot,
          reason: "structure_mismatch",
          missingRequiredPaths,
        });
      }
    }

    return {
      foundationSnapshot: input.manifest
        ? {
            sourcePath: input.manifest.sourcePath,
            manifestDir: input.manifest.manifestDir,
            manifestMtimeMs: input.manifest.manifestMtimeMs,
            resourceDescriptorHash: input.manifest.resourceDescriptorHash,
            cacheKey: input.manifest.cacheKey,
          }
        : undefined,
      manifestResources,
      candidateRoots,
      rejectedRoots,
      degradeReasons: rejectedRoots.length > 0 ? ["structure_mismatch"] : [],
    };
  }
}
