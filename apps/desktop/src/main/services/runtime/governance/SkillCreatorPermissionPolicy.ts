/**
 * SkillCreatorPermissionPolicy - Phase別 tool policy 定義
 *
 * TASK-P0-09: claude-sdk-permission-hooks-governance
 *
 * plan / execute / verify / improve ごとに permissionMode と
 * allowedTools / disallowedTools / canUseTool を定義する。
 * dynamic skill-creator 実行の安全境界を固定し、
 * 主処理を固定化しない。
 */

import type {
  SkillCreatorGovernancePhase,
  SkillCreatorSdkPolicy,
  SkillCreatorToolDecision,
} from "@repo/shared/types";

/** read 系ツール */
const READ_TOOLS = ["Read", "Glob", "Grep", "Bash", "Agent"] as const;

/** test / validate 系ツール */
const TEST_TOOLS = ["Read", "Glob", "Grep", "Bash", "Agent"] as const;

/** write 系ツール（execute phase で限定許可） */
const WRITE_TOOLS = [
  "Read",
  "Glob",
  "Grep",
  "Bash",
  "Agent",
  "Write",
  "Edit",
] as const;

/** improve 用限定 edit ツール */
const IMPROVE_TOOLS = [
  "Read",
  "Glob",
  "Grep",
  "Bash",
  "Agent",
  "Edit",
] as const;

/** 破壊的ツール（全 phase で disallow） */
const DESTRUCTIVE_TOOLS = ["NotebookEdit"] as const;

/**
 * Phase ごとの policy 定義テーブル。
 * `Object.freeze` で実行時改変を防ぐ。
 */
const POLICY_TABLE: Readonly<
  Record<SkillCreatorGovernancePhase, SkillCreatorSdkPolicy>
> = Object.freeze({
  plan: {
    phase: "plan",
    permissionMode: "default",
    allowedTools: [...READ_TOOLS],
    disallowedTools: ["Write", "Edit", ...DESTRUCTIVE_TOOLS],
  },
  execute: {
    phase: "execute",
    permissionMode: "acceptEdits",
    allowedTools: [...WRITE_TOOLS],
    disallowedTools: [...DESTRUCTIVE_TOOLS],
  },
  verify: {
    phase: "verify",
    permissionMode: "default",
    allowedTools: [...TEST_TOOLS],
    disallowedTools: ["Write", "Edit", ...DESTRUCTIVE_TOOLS],
  },
  improve: {
    phase: "improve",
    permissionMode: "acceptEdits",
    allowedTools: [...IMPROVE_TOOLS],
    disallowedTools: ["Write", ...DESTRUCTIVE_TOOLS],
  },
});

/**
 * 指定 phase の policy を返す。
 */
export function getPolicy(
  phase: SkillCreatorGovernancePhase,
): SkillCreatorSdkPolicy {
  return POLICY_TABLE[phase];
}

/**
 * tool が許可されるか判定する。
 * allowedTools / disallowedTools を評価し、理由付きの判定結果を返す。
 *
 * @param toolName - 評価対象の tool 名
 * @param phase - 現在の governance phase
 * @param context - 追加の判定コンテキスト（省略可）
 * @returns SkillCreatorToolDecision
 */
export function canUseTool(
  toolName: string,
  phase: SkillCreatorGovernancePhase,
  context?: CanUseToolContext,
): SkillCreatorToolDecision {
  const policy = getPolicy(phase);

  if (policy.disallowedTools.includes(toolName)) {
    return {
      allowed: false,
      reason: `Tool "${toolName}" is disallowed in phase "${phase}"`,
      phase,
      toolName,
    };
  }

  if (
    policy.allowedTools.length > 0 &&
    !policy.allowedTools.includes(toolName)
  ) {
    return {
      allowed: false,
      reason: `Tool "${toolName}" is not in allowedTools for phase "${phase}"`,
      phase,
      toolName,
    };
  }

  // TODO(human): execute / improve phase のコンテキスト依存判定
  // context が渡された場合、追加の判定ロジックをここに実装する。
  // 例: execute phase で targetPath が生成対象 skill dir 外なら deny
  // 例: improve phase で targetPath が改善対象ファイル外なら deny
  if (context) {
    const contextDecision = evaluateContextPolicy(toolName, phase, context);
    if (contextDecision) {
      return contextDecision;
    }
  }

  return {
    allowed: true,
    reason: `Tool "${toolName}" is permitted in phase "${phase}"`,
    phase,
    toolName,
  };
}

/**
 * canUseTool の追加コンテキスト。
 * execute / improve phase で対象パスや provenance を考慮する場合に使用。
 */
export interface CanUseToolContext {
  /** 操作対象のファイルパス */
  targetPath?: string;
  /** 許可された skill ディレクトリ root */
  allowedSkillRoot?: string;
}

/**
 * コンテキスト依存の追加判定。
 * null を返した場合は基本判定が適用される。
 */
function evaluateContextPolicy(
  toolName: string,
  phase: SkillCreatorGovernancePhase,
  context: CanUseToolContext,
): SkillCreatorToolDecision | null {
  // execute / improve で write 系ツールを使う場合、
  // targetPath が allowedSkillRoot 配下かを確認する
  if (
    (phase === "execute" || phase === "improve") &&
    (toolName === "Write" || toolName === "Edit") &&
    context.targetPath &&
    context.allowedSkillRoot
  ) {
    const normalizedTarget = context.targetPath.replace(/\\/g, "/");
    const normalizedRoot = context.allowedSkillRoot.replace(/\\/g, "/");
    if (!normalizedTarget.startsWith(normalizedRoot)) {
      return {
        allowed: false,
        reason: `Tool "${toolName}" targets "${context.targetPath}" which is outside allowed skill root "${context.allowedSkillRoot}" in phase "${phase}"`,
        phase,
        toolName,
      };
    }
  }
  return null;
}

/**
 * 全 phase の policy テーブルを返す（テスト・UI 表示向け）。
 */
export function getAllPolicies(): Readonly<
  Record<SkillCreatorGovernancePhase, SkillCreatorSdkPolicy>
> {
  return POLICY_TABLE;
}
