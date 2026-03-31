/**
 * AgentNameResolver ユニットテスト
 *
 * TASK-P0-07: hardcoded-agent-names-dynamic-resolution
 * Phase 4/5: TDD — 全パターン網羅
 */

import { describe, expect, it } from "vitest";
import {
  AgentNameResolver,
  DEFAULT_PLAN_AGENT_NAMES,
} from "../AgentNameResolver";
import type { LoadedWorkflowManifest } from "@repo/shared/types";
import type { PhaseResourceRequest } from "../PhaseResourcePlanner";

// ---------- helpers ----------

function makeManifest(
  agentIds: string[],
  referenceIds: string[] = [],
): LoadedWorkflowManifest {
  const resources = [
    ...agentIds.map((id) => ({
      id,
      kind: "agent" as const,
      path: `./agents/${id}.md`,
      absolutePath: `/skills/agents/${id}.md`,
    })),
    ...referenceIds.map((id) => ({
      id,
      kind: "reference" as const,
      path: `./references/${id}.md`,
      absolutePath: `/skills/references/${id}.md`,
    })),
  ];

  return {
    schemaVersion: 1,
    workflowId: "test-workflow",
    phases: [],
    resources,
    entry: [],
    exit: [],
    sourcePath: "/skills/workflow-manifest.json",
    manifestDir: "/skills",
    manifestMtimeMs: 0,
    manifestContentHash: "abc",
    resourceDescriptorHash: "def",
    cacheKey: "test:0:1:def",
  } as unknown as LoadedWorkflowManifest;
}

function makeRequests(
  defs: Array<{ id: string; kind: "agent" | "reference" | "schema" | "asset" }>,
): PhaseResourceRequest[] {
  return defs.map((d) => ({
    id: d.id,
    kind: d.kind,
    relativePath: `agents/${d.id}.md`,
    tier: "required-core" as const,
    required: true,
    legacyCategory: "agents" as const,
    legacyName: `${d.id}.md`,
  }));
}

// ---------- tests ----------

describe("AgentNameResolver", () => {
  const resolver = new AgentNameResolver();

  // ===== resolveFromManifest =====

  describe("resolveFromManifest", () => {
    it("AC-2/AC-4: agent リソースが 3 件の manifest → 3 ID を返す", () => {
      const manifest = makeManifest([
        "discover-problem",
        "design-workflow",
        "plan-structure",
      ]);
      const config = resolver.resolveFromManifest(manifest);
      expect(config.names).toEqual([
        "discover-problem",
        "design-workflow",
        "plan-structure",
      ]);
    });

    it("AC-2: agent リソースが 1 件の manifest → 1 ID を返す", () => {
      const manifest = makeManifest(["single-agent"]);
      const config = resolver.resolveFromManifest(manifest);
      expect(config.names).toEqual(["single-agent"]);
    });

    it("AC-3: agent リソースが 0 件の manifest → DEFAULT_PLAN_AGENT_NAMES にフォールバック", () => {
      const manifest = makeManifest([]);
      const config = resolver.resolveFromManifest(manifest);
      expect(config.names).toEqual(DEFAULT_PLAN_AGENT_NAMES);
    });

    it("AC-3: カスタム defaultNames を渡した場合はそちらにフォールバック", () => {
      const manifest = makeManifest([]);
      const customDefaults = ["custom-a", "custom-b"] as const;
      const config = resolver.resolveFromManifest(manifest, customDefaults);
      expect(config.names).toEqual(["custom-a", "custom-b"]);
    });

    it("AC-4: 異なるエージェント名を持つマニフェスト → 正しく解決される", () => {
      const manifest = makeManifest(["custom-agent-x", "custom-agent-y"]);
      const config = resolver.resolveFromManifest(manifest);
      expect(config.names).toEqual(["custom-agent-x", "custom-agent-y"]);
    });

    it("AC-4: reference リソースが混在していても agent ID のみ返す", () => {
      const manifest = makeManifest(
        ["agent-a", "agent-b"],
        ["ref-overview", "ref-patterns"],
      );
      const config = resolver.resolveFromManifest(manifest);
      expect(config.names).toEqual(["agent-a", "agent-b"]);
      expect(config.names).not.toContain("ref-overview");
    });

    it("順序が維持される", () => {
      const manifest = makeManifest(["z-agent", "a-agent", "m-agent"]);
      const config = resolver.resolveFromManifest(manifest);
      expect(config.names).toEqual(["z-agent", "a-agent", "m-agent"]);
    });
  });

  // ===== resolveFromRequests =====

  describe("resolveFromRequests", () => {
    it("AC-3/AC-6: agent のみの配列 → 全 ID を返す", () => {
      const requests = makeRequests([
        { id: "discover-problem", kind: "agent" },
        { id: "design-workflow", kind: "agent" },
        { id: "plan-structure", kind: "agent" },
      ]);
      const config = resolver.resolveFromRequests(requests);
      expect(config.names).toEqual([
        "discover-problem",
        "design-workflow",
        "plan-structure",
      ]);
    });

    it("AC-3: reference 混在 → agent ID のみフィルタ", () => {
      const requests = makeRequests([
        { id: "discover-problem", kind: "agent" },
        { id: "overview", kind: "reference" },
        { id: "plan-structure", kind: "agent" },
      ]);
      const config = resolver.resolveFromRequests(requests);
      expect(config.names).toEqual(["discover-problem", "plan-structure"]);
      expect(config.names).not.toContain("overview");
    });

    it("AC-3: 空配列 → names が空", () => {
      const config = resolver.resolveFromRequests([]);
      expect(config.names).toEqual([]);
    });

    it("AC-6: improve 用シングルエージェント配列 → 1 ID", () => {
      const requests = makeRequests([
        { id: "improve-prompt", kind: "agent" },
        { id: "feedback-loop", kind: "reference" },
      ]);
      const config = resolver.resolveFromRequests(requests);
      expect(config.names).toEqual(["improve-prompt"]);
    });
  });

  // ===== DEFAULT_PLAN_AGENT_NAMES =====

  describe("DEFAULT_PLAN_AGENT_NAMES", () => {
    it("PLAN_RESOURCE_REQUESTS の agent エントリと同名であること", () => {
      expect(DEFAULT_PLAN_AGENT_NAMES).toContain("discover-problem");
      expect(DEFAULT_PLAN_AGENT_NAMES).toContain("design-workflow");
      expect(DEFAULT_PLAN_AGENT_NAMES).toContain("plan-structure");
      expect(DEFAULT_PLAN_AGENT_NAMES).toHaveLength(3);
    });
  });
});
