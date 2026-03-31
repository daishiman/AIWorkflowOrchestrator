import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import type {
  AgentConfig,
  LoadedWorkflowManifest,
  WorkflowManifest,
  WorkflowManifestHook,
  WorkflowManifestPhase,
  WorkflowManifestResourceDescriptor,
} from "@repo/shared/types";
import { WORKFLOW_MANIFEST_SCHEMA_VERSION } from "@repo/shared/types";

type ManifestCacheEntry = {
  cacheKey: string;
  manifestContentHash: string;
  manifest: LoadedWorkflowManifest;
};

const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  "schemaVersion",
  "workflowId",
  "phases",
  "resources",
  "entry",
  "exit",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueStrings(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function ensureUniqueArrayValues(name: string, values: string[]): void {
  if (!uniqueStrings(values)) {
    throw new Error(`${name} は一意である必要があります`);
  }
}

function ensureTopLevelFields(manifest: Record<string, unknown>): void {
  for (const key of Object.keys(manifest)) {
    if (!ALLOWED_TOP_LEVEL_FIELDS.has(key)) {
      throw new Error(`workflow manifest に未許可フィールドがあります: ${key}`);
    }
  }
}

function validateHooks(name: string, hooks: unknown): WorkflowManifestHook[] {
  if (!Array.isArray(hooks) || hooks.length === 0) {
    throw new Error(`${name} は1件以上の hook 配列である必要があります`);
  }

  const typedHooks = hooks.map((hook, index) => {
    if (!isRecord(hook)) {
      throw new Error(`${name}[${index}] は object である必要があります`);
    }
    if (!isNonEmptyString(hook.id) || !isNonEmptyString(hook.command)) {
      throw new Error(`${name}[${index}] は id / command が必須です`);
    }
    if (
      hook.description !== undefined &&
      typeof hook.description !== "string"
    ) {
      throw new Error(`${name}[${index}].description は string のみ許可します`);
    }
    return {
      id: hook.id.trim(),
      command: hook.command.trim(),
      description: hook.description,
    };
  });

  if (!uniqueStrings(typedHooks.map((hook) => hook.id))) {
    throw new Error(`${name} の hook id は一意である必要があります`);
  }

  return typedHooks;
}

function validateResources(
  resources: unknown,
): WorkflowManifestResourceDescriptor[] {
  if (!Array.isArray(resources)) {
    throw new Error("resources は配列である必要があります");
  }

  const typedResources = resources.map((resource, index) => {
    if (!isRecord(resource)) {
      throw new Error(`resources[${index}] は object である必要があります`);
    }
    if (
      !isNonEmptyString(resource.id) ||
      !isNonEmptyString(resource.kind) ||
      !isNonEmptyString(resource.path)
    ) {
      throw new Error(`resources[${index}] は id / kind / path が必須です`);
    }

    if (!["agent", "reference", "schema", "asset"].includes(resource.kind)) {
      throw new Error(
        `resources[${index}].kind は agent/reference/schema/asset のいずれかである必要があります`,
      );
    }

    if (
      resource.optional !== undefined &&
      typeof resource.optional !== "boolean"
    ) {
      throw new Error(`resources[${index}].optional は boolean のみ許可します`);
    }

    if (resource.phaseIds !== undefined) {
      if (
        !Array.isArray(resource.phaseIds) ||
        !resource.phaseIds.every((value) => isNonEmptyString(value))
      ) {
        throw new Error(
          `resources[${index}].phaseIds は string 配列のみ許可します`,
        );
      }
    }

    const phaseIds = resource.phaseIds?.map((value: string) => value.trim());
    if (phaseIds) {
      ensureUniqueArrayValues(`resources[${index}].phaseIds`, phaseIds);
    }

    return {
      id: resource.id.trim(),
      kind: resource.kind,
      path: resource.path.trim(),
      optional: resource.optional,
      phaseIds,
    } as WorkflowManifestResourceDescriptor;
  });

  if (!uniqueStrings(typedResources.map((resource) => resource.id))) {
    throw new Error("resources.id は一意である必要があります");
  }

  return typedResources;
}

function validatePhases(phases: unknown): WorkflowManifestPhase[] {
  if (!Array.isArray(phases) || phases.length === 0) {
    throw new Error("phases は1件以上の配列である必要があります");
  }

  const typedPhases = phases.map((phase, index) => {
    if (!isRecord(phase)) {
      throw new Error(`phases[${index}] は object である必要があります`);
    }
    if (
      !isNonEmptyString(phase.id) ||
      !isNonEmptyString(phase.title) ||
      !isNonEmptyString(phase.entryHookId) ||
      !isNonEmptyString(phase.exitHookId)
    ) {
      throw new Error(
        `phases[${index}] は id / title / entryHookId / exitHookId が必須です`,
      );
    }

    if (phase.dependsOn !== undefined) {
      if (
        !Array.isArray(phase.dependsOn) ||
        !phase.dependsOn.every((value) => isNonEmptyString(value))
      ) {
        throw new Error(
          `phases[${index}].dependsOn は string 配列のみ許可します`,
        );
      }
    }

    if (phase.resourceIds !== undefined) {
      if (
        !Array.isArray(phase.resourceIds) ||
        !phase.resourceIds.every((value) => isNonEmptyString(value))
      ) {
        throw new Error(
          `phases[${index}].resourceIds は string 配列のみ許可します`,
        );
      }
    }

    const dependsOn = phase.dependsOn?.map((value: string) => value.trim());
    if (dependsOn) {
      ensureUniqueArrayValues(`phases[${index}].dependsOn`, dependsOn);
    }

    const resourceIds = phase.resourceIds?.map((value: string) => value.trim());
    if (resourceIds) {
      ensureUniqueArrayValues(`phases[${index}].resourceIds`, resourceIds);
    }

    return {
      id: phase.id.trim(),
      title: phase.title.trim(),
      dependsOn,
      resourceIds,
      entryHookId: phase.entryHookId.trim(),
      exitHookId: phase.exitHookId.trim(),
    };
  });

  if (!uniqueStrings(typedPhases.map((phase) => phase.id))) {
    throw new Error("phases.id は一意である必要があります");
  }

  return typedPhases;
}

function assertPhaseReferences(
  phases: WorkflowManifestPhase[],
  resourceIds: Set<string>,
  entryIds: Set<string>,
  exitIds: Set<string>,
): void {
  const phaseIds = new Set(phases.map((phase) => phase.id));

  phases.forEach((phase, index) => {
    if (!entryIds.has(phase.entryHookId)) {
      throw new Error(`phases[${index}].entryHookId が entry に存在しません`);
    }
    if (!exitIds.has(phase.exitHookId)) {
      throw new Error(`phases[${index}].exitHookId が exit に存在しません`);
    }
    for (const dependency of phase.dependsOn ?? []) {
      if (!phaseIds.has(dependency)) {
        throw new Error(
          `phase ${phase.id} の dependsOn が未定義です: ${dependency}`,
        );
      }
    }
    for (const resourceId of phase.resourceIds ?? []) {
      if (!resourceIds.has(resourceId)) {
        throw new Error(
          `phase ${phase.id} の resourceId が未定義です: ${resourceId}`,
        );
      }
    }
  });

  const position = new Map(phases.map((phase, index) => [phase.id, index]));
  phases.forEach((phase) => {
    for (const dependency of phase.dependsOn ?? []) {
      if ((position.get(dependency) ?? -1) >= (position.get(phase.id) ?? -1)) {
        throw new Error(
          `phase 順序が不正です: ${phase.id} より前に ${dependency} を配置してください`,
        );
      }
    }
  });
}

function assertResourcePhaseReferences(
  phases: WorkflowManifestPhase[],
  resources: WorkflowManifestResourceDescriptor[],
): void {
  const phaseIds = new Set(phases.map((phase) => phase.id));
  const phaseResourceMap = new Map(
    phases.map((phase) => [phase.id, new Set(phase.resourceIds ?? [])]),
  );
  const resourceMap = new Map(
    resources.map((resource) => [resource.id, resource]),
  );

  resources.forEach((resource) => {
    for (const phaseId of resource.phaseIds ?? []) {
      if (!phaseIds.has(phaseId)) {
        throw new Error(
          `resource ${resource.id} の phaseId が未定義です: ${phaseId}`,
        );
      }

      if (!phaseResourceMap.get(phaseId)?.has(resource.id)) {
        throw new Error(
          `resource ${resource.id} が phaseIds で参照する ${phaseId} が phases.resourceIds と一致しません`,
        );
      }
    }
  });

  phases.forEach((phase) => {
    for (const resourceId of phase.resourceIds ?? []) {
      const resource = resourceMap.get(resourceId);
      if (!resource?.phaseIds) {
        continue;
      }

      if (!resource.phaseIds.includes(phase.id)) {
        throw new Error(
          `phase ${phase.id} の resourceId ${resourceId} が resources.phaseIds と一致しません`,
        );
      }
    }
  });
}

function buildResourceDescriptorHash(
  resources: Array<{
    id: string;
    kind: string;
    absolutePath: string;
    phaseIds?: string[];
  }>,
): string {
  const payload = resources.map((resource) => ({
    id: resource.id,
    kind: resource.kind,
    absolutePath: resource.absolutePath,
    phaseIds: resource.phaseIds ?? [],
  }));
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function buildManifestContentHash(manifest: WorkflowManifest): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(manifest))
    .digest("hex");
}

export class ManifestLoader {
  private readonly cache = new Map<string, ManifestCacheEntry>();

  async loadManifest(manifestPath: string): Promise<LoadedWorkflowManifest> {
    const absoluteManifestPath = path.resolve(manifestPath);
    const manifestDir = path.dirname(absoluteManifestPath);
    const stat = await fs.stat(absoluteManifestPath);
    const raw = await fs.readFile(absoluteManifestPath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    const manifest = this.validateManifest(parsed);
    const manifestContentHash = buildManifestContentHash(manifest);
    const normalizedResources = await Promise.all(
      manifest.resources.map(async (resource) => {
        const absolutePath = path.resolve(manifestDir, resource.path);
        if (!resource.optional) {
          await fs.access(absolutePath);
        }
        return {
          ...resource,
          absolutePath,
        };
      }),
    );
    const resourceDescriptorHash =
      buildResourceDescriptorHash(normalizedResources);
    const cacheKey = [
      absoluteManifestPath,
      stat.mtimeMs.toString(),
      manifest.schemaVersion.toString(),
      resourceDescriptorHash,
    ].join(":");

    const cached = this.cache.get(absoluteManifestPath);
    if (
      cached?.cacheKey === cacheKey &&
      cached.manifestContentHash === manifestContentHash
    ) {
      return cached.manifest;
    }

    const loadedManifest: LoadedWorkflowManifest = {
      ...manifest,
      sourcePath: absoluteManifestPath,
      manifestDir,
      manifestMtimeMs: stat.mtimeMs,
      manifestContentHash,
      resourceDescriptorHash,
      cacheKey,
      resources: normalizedResources,
    };

    this.cache.set(absoluteManifestPath, {
      cacheKey,
      manifestContentHash,
      manifest: loadedManifest,
    });

    return loadedManifest;
  }

  extractAgentConfig(manifest: LoadedWorkflowManifest): AgentConfig {
    const names = manifest.resources
      .filter((r) => r.kind === "agent")
      .map((r) => r.id);
    return { names };
  }

  invalidate(manifestPath?: string): void {
    if (manifestPath) {
      this.cache.delete(path.resolve(manifestPath));
      return;
    }
    this.cache.clear();
  }

  private validateManifest(value: unknown): WorkflowManifest {
    if (!isRecord(value)) {
      throw new Error("workflow manifest は object である必要があります");
    }

    ensureTopLevelFields(value);

    if (value.schemaVersion !== WORKFLOW_MANIFEST_SCHEMA_VERSION) {
      throw new Error(
        `schemaVersion は ${WORKFLOW_MANIFEST_SCHEMA_VERSION} のみ受理します`,
      );
    }
    if (!isNonEmptyString(value.workflowId)) {
      throw new Error("workflowId は必須です");
    }

    const entry = validateHooks("entry", value.entry);
    const exit = validateHooks("exit", value.exit);
    const resources = validateResources(value.resources);
    const phases = validatePhases(value.phases);

    assertPhaseReferences(
      phases,
      new Set(resources.map((resource) => resource.id)),
      new Set(entry.map((hook) => hook.id)),
      new Set(exit.map((hook) => hook.id)),
    );
    assertResourcePhaseReferences(phases, resources);

    return {
      schemaVersion: WORKFLOW_MANIFEST_SCHEMA_VERSION,
      workflowId: value.workflowId.trim(),
      phases,
      resources,
      entry,
      exit,
    };
  }
}
