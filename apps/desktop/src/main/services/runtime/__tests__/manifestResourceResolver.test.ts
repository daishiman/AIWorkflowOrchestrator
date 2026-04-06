import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import type { LoadedWorkflowManifest } from "@repo/shared/types";
import type { PhaseResourceRequest } from "../PhaseResourcePlanner";
import {
  buildPhaseResourceRequestsFromManifest,
  WorkflowManifestValidationError,
} from "../manifestResourceResolver";
import { PLAN_RESOURCE_REQUESTS } from "../planPromptConstants";
import { IMPROVE_RESOURCE_REQUESTS } from "../improvePromptConstants";

function createMockManifest(
  overrides: Partial<LoadedWorkflowManifest> = {},
): LoadedWorkflowManifest {
  return {
    schemaVersion: 1 as const,
    workflowId: "test-workflow",
    sourcePath: "/tmp/workflow-manifest.json",
    manifestDir: "/tmp",
    manifestMtimeMs: Date.now(),
    manifestContentHash: "abc123",
    resourceDescriptorHash: "def456",
    cacheKey: "abc123:def456",
    phases: [
      {
        id: "plan",
        title: "Plan Phase",
        resourceIds: [
          "discover-problem",
          "design-workflow",
          "plan-structure",
          "overview",
        ],
        entryHookId: "entry-hook",
        exitHookId: "exit-hook",
      },
      {
        id: "improve",
        title: "Improve Phase",
        resourceIds: ["improve-prompt", "feedback-loop"],
        entryHookId: "entry-hook",
        exitHookId: "exit-hook",
      },
    ],
    resources: [
      {
        id: "discover-problem",
        kind: "agent",
        path: "./agents/discover-problem.md",
        absolutePath: "/tmp/agents/discover-problem.md",
      },
      {
        id: "design-workflow",
        kind: "agent",
        path: "./agents/design-workflow.md",
        absolutePath: "/tmp/agents/design-workflow.md",
      },
      {
        id: "plan-structure",
        kind: "agent",
        path: "./agents/plan-structure.md",
        absolutePath: "/tmp/agents/plan-structure.md",
      },
      {
        id: "overview",
        kind: "reference",
        path: "./references/overview.md",
        absolutePath: "/tmp/references/overview.md",
      },
      {
        id: "improve-prompt",
        kind: "agent",
        path: "./agents/improve-prompt.md",
        absolutePath: "/tmp/agents/improve-prompt.md",
      },
      {
        id: "feedback-loop",
        kind: "reference",
        path: "./references/feedback-loop.md",
        absolutePath: "/tmp/references/feedback-loop.md",
      },
    ],
    entry: [],
    exit: [],
    ...overrides,
  };
}

const STATIC_FALLBACK: readonly PhaseResourceRequest[] = [
  {
    id: "static-agent",
    kind: "agent",
    relativePath: "agents/static-agent.md",
    tier: "required-core",
    required: true,
  },
];

describe("buildPhaseResourceRequestsFromManifest", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------------
  // T-P7-09: plan フェーズの正常系
  // ----------------------------------------------------------------
  it("T-P7-09: plan フェーズのリソースを manifest から正しく組み立てる", () => {
    const manifest = createMockManifest();
    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      PLAN_RESOURCE_REQUESTS,
    );

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      id: "discover-problem",
      kind: "agent",
      relativePath: "agents/discover-problem.md",
      tier: "required-core",
      required: true,
    });
    expect(result[1]).toEqual({
      id: "design-workflow",
      kind: "agent",
      relativePath: "agents/design-workflow.md",
      tier: "required-core",
      required: true,
    });
    expect(result[2]).toEqual({
      id: "plan-structure",
      kind: "agent",
      relativePath: "agents/plan-structure.md",
      tier: "required-core",
      required: true,
    });
    expect(result[3]).toEqual({
      id: "overview",
      kind: "reference",
      relativePath: "references/overview.md",
      tier: "optional-quality",
      required: false,
    });
  });

  // ----------------------------------------------------------------
  // T-P7-09b: improve フェーズの正常系
  // ----------------------------------------------------------------
  it("T-P7-09b: improve フェーズのリソースを manifest から正しく組み立てる", () => {
    const manifest = createMockManifest();
    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "improve",
      IMPROVE_RESOURCE_REQUESTS,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "improve-prompt",
      kind: "agent",
      relativePath: "agents/improve-prompt.md",
      tier: "required-core",
      required: true,
    });
    expect(result[1]).toEqual({
      id: "feedback-loop",
      kind: "reference",
      relativePath: "references/feedback-loop.md",
      tier: "optional-quality",
      required: false,
    });
  });

  // ----------------------------------------------------------------
  // T-P7-09c: resource.path 先頭 "./" 除去
  // ----------------------------------------------------------------
  it("T-P7-09c: resource.path の先頭 './' を除去して relativePath にマッピングする", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan",
          resourceIds: ["test-agent"],
          entryHookId: "e",
          exitHookId: "x",
        },
      ],
      resources: [
        {
          id: "test-agent",
          kind: "agent",
          path: "./deep/nested/agent.md",
          absolutePath: "/tmp/deep/nested/agent.md",
        },
      ],
    });

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      STATIC_FALLBACK,
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.relativePath).toBe("deep/nested/agent.md");
  });

  // ----------------------------------------------------------------
  // T-P7-10a: manifest に対象 phaseId が存在しない場合は ValidationError
  // ----------------------------------------------------------------
  it("T-P7-10a: manifest に対象 phaseId が存在しない場合、WorkflowManifestValidationError をスローする", () => {
    const manifest = createMockManifest({
      phases: [],
    });

    expect(() =>
      buildPhaseResourceRequestsFromManifest(manifest, "plan", STATIC_FALLBACK),
    ).toThrow(WorkflowManifestValidationError);
  });

  // ----------------------------------------------------------------
  // T-P7-10b: resourceIds が undefined の場合は ValidationError
  // ----------------------------------------------------------------
  it("T-P7-10b: resourceIds が undefined の場合、WorkflowManifestValidationError をスローする", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan",
          resourceIds: undefined,
          entryHookId: "e",
          exitHookId: "x",
        },
      ],
    });

    expect(() =>
      buildPhaseResourceRequestsFromManifest(manifest, "plan", STATIC_FALLBACK),
    ).toThrow(WorkflowManifestValidationError);
  });

  // ----------------------------------------------------------------
  // T-P7-10c: resourceIds が空配列の場合は ValidationError
  // ----------------------------------------------------------------
  it("T-P7-10c: resourceIds が空配列の場合、WorkflowManifestValidationError をスローする", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan",
          resourceIds: [],
          entryHookId: "e",
          exitHookId: "x",
        },
      ],
    });

    expect(() =>
      buildPhaseResourceRequestsFromManifest(manifest, "plan", STATIC_FALLBACK),
    ).toThrow(WorkflowManifestValidationError);
  });

  // ----------------------------------------------------------------
  // T-P7-10d: 全 ID が resources に見つからない場合は ValidationError
  // ----------------------------------------------------------------
  it("T-P7-10d: 全 ID が manifest.resources に見つからない場合、WorkflowManifestValidationError をスローする", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan",
          resourceIds: ["nonexistent-1", "nonexistent-2"],
          entryHookId: "e",
          exitHookId: "x",
        },
      ],
      resources: [],
    });

    expect(() =>
      buildPhaseResourceRequestsFromManifest(manifest, "plan", STATIC_FALLBACK),
    ).toThrow(WorkflowManifestValidationError);
  });

  // ----------------------------------------------------------------
  // T-P7-10e: ValidationError のメッセージに phaseId が含まれる
  // ----------------------------------------------------------------
  it("T-P7-10e: WorkflowManifestValidationError のメッセージに phaseId が含まれる", () => {
    const manifest = createMockManifest({
      phases: [],
    });

    expect(() =>
      buildPhaseResourceRequestsFromManifest(manifest, "plan", STATIC_FALLBACK),
    ).toThrow(
      expect.objectContaining({ message: expect.stringContaining("plan") }),
    );
  });

  // ================================================================
  // Phase 6: テスト拡充 — エッジケース・回帰ガード
  // ================================================================

  // ----------------------------------------------------------------
  // T-P7-11: リソース ID 未発見時のスキップ動作
  // ----------------------------------------------------------------
  describe("リソース ID 未発見時のスキップ動作", () => {
    it("T-P7-11: resourceIds の一部が resources[] に見つからない場合、見つかったもののみ返す", () => {
      const manifest = createMockManifest({
        phases: [
          {
            id: "plan",
            title: "Plan Phase",
            resourceIds: [
              "discover-problem",
              "nonexistent-resource",
              "overview",
            ],
            entryHookId: "plan-entry",
            exitHookId: "plan-exit",
          },
        ],
      });

      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        PLAN_RESOURCE_REQUESTS,
      );

      // nonexistent-resource はスキップされ、2件のみ返される
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(["discover-problem", "overview"]);
    });

    it("T-P7-11b: 未発見リソースのスキップ時に warn ログが出力される", () => {
      const manifest = createMockManifest({
        phases: [
          {
            id: "plan",
            title: "Plan Phase",
            resourceIds: ["discover-problem", "nonexistent-resource"],
            entryHookId: "plan-entry",
            exitHookId: "plan-exit",
          },
        ],
      });

      buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        PLAN_RESOURCE_REQUESTS,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("nonexistent-resource"),
      );
    });
  });

  // ----------------------------------------------------------------
  // T-P7-12: パス変換
  // ----------------------------------------------------------------
  describe("パス変換", () => {
    it("T-P7-12: resource.path 先頭の './' が除去される", () => {
      const manifest = createMockManifest({
        resources: [
          {
            id: "agent-test",
            kind: "agent",
            path: "./agents/test-agent.md",
            absolutePath: "/tmp/agents/test-agent.md",
          },
        ],
        phases: [
          {
            id: "plan",
            title: "Plan",
            resourceIds: ["agent-test"],
            entryHookId: "e",
            exitHookId: "x",
          },
        ],
      });

      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        [],
      );

      expect(result[0]!.relativePath).toBe("agents/test-agent.md");
    });

    it("T-P7-12b: resource.path に './' プレフィックスがない場合はそのまま使用される", () => {
      const manifest = createMockManifest({
        resources: [
          {
            id: "agent-test",
            kind: "agent",
            path: "agents/test-agent.md",
            absolutePath: "/tmp/agents/test-agent.md",
          },
        ],
        phases: [
          {
            id: "plan",
            title: "Plan",
            resourceIds: ["agent-test"],
            entryHookId: "e",
            exitHookId: "x",
          },
        ],
      });

      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        [],
      );

      expect(result[0]!.relativePath).toBe("agents/test-agent.md");
    });

    it("T-P7-12c: resource.path に深いネストがある場合も先頭 './' のみ除去", () => {
      const manifest = createMockManifest({
        resources: [
          {
            id: "ref-deep",
            kind: "reference",
            path: "./sub/dir/deep-ref.md",
            absolutePath: "/tmp/sub/dir/deep-ref.md",
          },
        ],
        phases: [
          {
            id: "plan",
            title: "Plan",
            resourceIds: ["ref-deep"],
            entryHookId: "e",
            exitHookId: "x",
          },
        ],
      });

      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        [],
      );

      expect(result[0]!.relativePath).toBe("sub/dir/deep-ref.md");
    });
  });

  // ----------------------------------------------------------------
  // T-P7-13: kind → tier マッピング
  // ----------------------------------------------------------------
  describe("kind → tier マッピング", () => {
    it.each([
      {
        kind: "agent" as const,
        expectedTier: "required-core",
        expectedRequired: true,
      },
      {
        kind: "reference" as const,
        expectedTier: "optional-quality",
        expectedRequired: false,
      },
      {
        kind: "schema" as const,
        expectedTier: "optional-quality",
        expectedRequired: false,
      },
      {
        kind: "asset" as const,
        expectedTier: "optional-quality",
        expectedRequired: false,
      },
    ])(
      "T-P7-13: kind=$kind → tier=$expectedTier, required=$expectedRequired",
      ({ kind, expectedTier, expectedRequired }) => {
        const manifest = createMockManifest({
          resources: [
            {
              id: `test-${kind}`,
              kind,
              path: `./test/${kind}.md`,
              absolutePath: `/tmp/test/${kind}.md`,
            },
          ],
          phases: [
            {
              id: "plan",
              title: "Plan",
              resourceIds: [`test-${kind}`],
              entryHookId: "e",
              exitHookId: "x",
            },
          ],
        });

        const result = buildPhaseResourceRequestsFromManifest(
          manifest,
          "plan",
          [],
        );

        expect(result[0]!.tier).toBe(expectedTier);
        expect(result[0]!.required).toBe(expectedRequired);
      },
    );
  });

  // ----------------------------------------------------------------
  // T-P7-14: 複数フェーズがある場合の ValidationError 境界
  // ----------------------------------------------------------------
  describe("複数フェーズがある場合の ValidationError 境界", () => {
    it("T-P7-14: manifest に複数フェーズがあり、対象フェーズのみ未定義の場合、plan は ValidationError・improve は manifest 由来", () => {
      const manifest = createMockManifest({
        phases: [
          // plan は存在しない — improve のみ定義
          {
            id: "improve",
            title: "Improve Phase",
            resourceIds: ["improve-prompt"],
            entryHookId: "improve-entry",
            exitHookId: "improve-exit",
          },
        ],
      });

      // plan は ValidationError
      expect(() =>
        buildPhaseResourceRequestsFromManifest(
          manifest,
          "plan",
          PLAN_RESOURCE_REQUESTS,
        ),
      ).toThrow(WorkflowManifestValidationError);

      // improve は manifest 由来
      const improveResult = buildPhaseResourceRequestsFromManifest(
        manifest,
        "improve",
        IMPROVE_RESOURCE_REQUESTS,
      );
      expect(improveResult).not.toEqual([...IMPROVE_RESOURCE_REQUESTS]);
      expect(improveResult[0]!.id).toBe("improve-prompt");
    });

    it("T-P7-14b: resourceIds の全 ID が未発見で結果が空 → ValidationError", () => {
      const manifest = createMockManifest({
        phases: [
          {
            id: "plan",
            title: "Plan Phase",
            resourceIds: ["ghost-1", "ghost-2", "ghost-3"],
            entryHookId: "plan-entry",
            exitHookId: "plan-exit",
          },
        ],
        resources: [
          {
            id: "unrelated-agent",
            kind: "agent",
            path: "./agents/unrelated.md",
            absolutePath: "/tmp/agents/unrelated.md",
          },
        ],
      });

      expect(() =>
        buildPhaseResourceRequestsFromManifest(
          manifest,
          "plan",
          PLAN_RESOURCE_REQUESTS,
        ),
      ).toThrow(WorkflowManifestValidationError);
    });

    it("T-P7-14c: manifest の phases が空配列の場合、ValidationError をスローする", () => {
      const manifest = createMockManifest({
        phases: [],
      });

      expect(() =>
        buildPhaseResourceRequestsFromManifest(
          manifest,
          "plan",
          PLAN_RESOURCE_REQUESTS,
        ),
      ).toThrow(WorkflowManifestValidationError);
    });
  });
});
