import type {
  SafetyGatePort,
  SafetyGateResult,
  SafetyCheckDetail,
  SafetyGrade,
  ToolRiskLevel,
  IPermissionStore,
} from "@repo/shared";

export interface ToolInfo {
  name: string;
  riskLevel: ToolRiskLevel;
}

export interface SkillMetadataProvider {
  getRequiredTools(skillName: string): Promise<ToolInfo[]>;
  getAccessPaths(skillName: string): Promise<string[]>;
}

export interface DefaultSafetyGateDeps {
  permissionStore: IPermissionStore;
  metadataProvider: SkillMetadataProvider;
  protectedPaths: readonly string[];
}

export class DefaultSafetyGate implements SafetyGatePort {
  private readonly permissionStore: IPermissionStore;
  private readonly metadataProvider: SkillMetadataProvider;
  private readonly protectedPaths: readonly string[];

  constructor(deps: DefaultSafetyGateDeps) {
    this.permissionStore = deps.permissionStore;
    this.metadataProvider = deps.metadataProvider;
    this.protectedPaths = deps.protectedPaths;
  }

  async evaluate(skillName: string): Promise<SafetyGateResult> {
    const tools = await this.metadataProvider.getRequiredTools(skillName);
    const accessPaths = await this.metadataProvider.getAccessPaths(skillName);

    const details: SafetyCheckDetail[] = [
      ...this.checkCriticalTools(tools),
      ...this.checkHighTools(tools),
      ...this.checkNoPermanentApproval(tools),
      ...this.checkAllLowTools(tools),
      ...this.checkProtectedPaths(accessPaths),
    ];

    const overallGrade = this.calculateOverallGrade(details);

    return {
      skillName,
      evaluatedAt: Date.now(),
      overallGrade,
      details,
    };
  }

  private checkCriticalTools(tools: ToolInfo[]): SafetyCheckDetail[] {
    return tools
      .filter((t) => t.riskLevel === "critical")
      .map((t) => ({
        checkId: "CRITICAL_TOOL_REQUIRED" as const,
        toolName: t.name,
        riskLevel: "critical" as const,
        status: "blocked" as const,
        message: `ツール "${t.name}" は critical リスクレベルのため使用がブロックされました`,
      }));
  }

  private checkHighTools(tools: ToolInfo[]): SafetyCheckDetail[] {
    return tools
      .filter((t) => t.riskLevel === "high")
      .map((t) => ({
        checkId: "HIGH_TOOL_REQUIRED" as const,
        toolName: t.name,
        riskLevel: "high" as const,
        status: "warned" as const,
        message: `ツール "${t.name}" は high リスクレベルです。実行時に毎回確認が必要です`,
      }));
  }

  private checkNoPermanentApproval(tools: ToolInfo[]): SafetyCheckDetail[] {
    return tools
      .filter((t) => t.riskLevel === "medium" || t.riskLevel === "low")
      .filter((t) => !this.permissionStore.isToolAllowed(t.name))
      .map((t) => ({
        checkId: "NO_PERMANENT_APPROVAL" as const,
        toolName: t.name,
        riskLevel: t.riskLevel,
        status: "warned" as const,
        message: `ツール "${t.name}" に恒久許可が付与されていません`,
      }));
  }

  private checkAllLowTools(tools: ToolInfo[]): SafetyCheckDetail[] {
    if (tools.length > 0 && tools.every((t) => t.riskLevel === "low")) {
      return [
        {
          checkId: "ALL_LOW_TOOLS" as const,
          toolName: "*",
          riskLevel: "low" as const,
          status: "passed" as const,
          message: "全ツールが低リスクです",
        },
      ];
    }
    return [];
  }

  private checkProtectedPaths(accessPaths: string[]): SafetyCheckDetail[] {
    const results: SafetyCheckDetail[] = [];

    for (const accessPath of accessPaths) {
      const normalizedAccess = this.normalizePath(accessPath);

      for (const protectedPath of this.protectedPaths) {
        const normalizedProtected = this.normalizePath(protectedPath);

        if (
          normalizedAccess === normalizedProtected ||
          normalizedAccess.startsWith(normalizedProtected + "/")
        ) {
          results.push({
            checkId: "PROTECTED_PATH_ACCESS" as const,
            toolName: accessPath,
            riskLevel: "critical" as const,
            status: "blocked" as const,
            message: `パス "${accessPath}" は保護対象パス "${protectedPath}" 配下のためアクセスがブロックされました`,
          });
        }
      }
    }

    return results;
  }

  private normalizePath(p: string): string {
    return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
  }

  private calculateOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
    if (details.some((d) => d.status === "blocked")) {
      return "UNSAFE";
    }
    if (details.some((d) => d.status === "warned")) {
      return "SAFE_WITH_WARNINGS";
    }
    return "SAFE";
  }
}
