/**
 * toHandoffGuidance - HandoffSource -> HandoffGuidance adapter
 *
 * Discriminated Union の kind フィールドで分岐し、
 * 各 Consumer 固有の入力を HandoffGuidance 統一 DTO に変換する純粋関数。
 *
 * セキュリティ:
 * - shell injection 対策: 4 種エスケープ（$, バッククォート, ダブルクォート, バックスラッシュ）
 * - 機密情報除外: API キーパターンをサニタイズ
 * - 改行・タブ文字を空白に置換
 */
import type {
  HandoffSource,
  HandoffGuidance,
  ChatEditHandoffSource,
  AgentHandoffSource,
  SkillHandoffSource,
  BundleHandoffSource,
} from "./types";

/**
 * shell injection 対策: 4 種エスケープ
 */
function sanitizeForShell(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ");
}

/**
 * 機密情報のサニタイズ
 */
function redactSecrets(input: string): string {
  return input
    .replace(/sk-[a-zA-Z0-9]{10,}/g, "[REDACTED]")
    .replace(/key-[a-zA-Z0-9]{10,}/g, "[REDACTED]")
    .replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/ghp_[a-zA-Z0-9]{36}/g, "[REDACTED]")
    .replace(/xoxb-[a-zA-Z0-9-]+/g, "[REDACTED]")
    .replace(/AIza[a-zA-Z0-9_-]{35}/g, "[REDACTED]");
}

/**
 * パス文字列のサニタイズ（ダブルクォート内に埋め込む用途）
 */
function sanitizePath(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * ランチャー名のバリデーション（アルファベット・数字・ハイフン・アンダースコアのみ許可）
 */
function validateLauncher(launcher: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(launcher)) {
    throw new Error(`Invalid launcher name: "${launcher}"`);
  }
  return launcher;
}

function buildFromChatEdit(
  source: ChatEditHandoffSource,
  reason: string,
): HandoffGuidance {
  const req = source.request;
  const safePrompt = sanitizeForShell(redactSecrets(req.prompt?.trim() || ""));

  const parts = ["claude"];
  if (req.workspacePath) {
    parts.push(`--add-dir "${sanitizePath(req.workspacePath)}"`);
  }
  parts.push(`"${safePrompt}"`);

  const fileParts =
    req.contextFiles && req.contextFiles.length > 0
      ? req.contextFiles.join(",")
      : "none";
  let contextSummary = `surface=chat-edit files=${fileParts}`;
  if (req.workspacePath) {
    contextSummary += ` workspace=${req.workspacePath}`;
  }

  return {
    terminalCommand: parts.join(" "),
    contextSummary,
    reason,
  };
}

function buildFromAgent(
  source: AgentHandoffSource,
  reason: string,
): HandoffGuidance {
  const prompt =
    source.prompt?.trim() ||
    "現在のコンテキストからエージェント実行を続けてください";
  const safePrompt = sanitizeForShell(redactSecrets(prompt));

  const parts = ["claude"];
  if (source.workingDirectory) {
    parts.push(`--add-dir "${sanitizePath(source.workingDirectory)}"`);
  }
  parts.push(`-p "${safePrompt}"`);

  const skillId =
    typeof source.skillId === "string" && source.skillId.trim() !== ""
      ? source.skillId
      : "unknown";

  return {
    terminalCommand: parts.join(" "),
    contextSummary: `surface=agent skill=${skillId}`,
    reason,
  };
}

function buildFromSkill(
  source: SkillHandoffSource,
  reason: string,
): HandoffGuidance {
  const prompt =
    source.prompt?.trim() ||
    (source.skillName?.trim()
      ? `「${source.skillName}」のスキル実行を続けてください`
      : "最新のコンテキストでスキル実行を続けてください");
  const safePrompt = sanitizeForShell(redactSecrets(prompt));

  const parts = ["claude"];
  if (source.workingDirectory) {
    parts.push(`--add-dir "${sanitizePath(source.workingDirectory)}"`);
  }
  parts.push(`-p "${safePrompt}"`);

  const skillToken =
    (source.skillName && source.skillName.trim()) ||
    (source.skillId && source.skillId.trim()) ||
    "unknown";

  return {
    terminalCommand: parts.join(" "),
    contextSummary: `surface=skill skill=${skillToken}`,
    reason,
  };
}

function buildFromBundle(
  source: BundleHandoffSource,
  reason: string,
): HandoffGuidance {
  const safePrompt = sanitizeForShell(redactSecrets(source.promptBundle));
  const safeLauncher = validateLauncher(source.launcher);
  const terminalCommand = `${safeLauncher} -p "${safePrompt}"`;

  return {
    terminalCommand,
    contextSummary: `surface=bundle launcher=${safeLauncher}`,
    reason,
  };
}

// TODO: [MN-1] Skill Docs Consumer (C4) の handoff source 追加
// - Skill Docs 画面からの handoff 起点が実装された時点で、
//   SkillDocsHandoffSource を HandoffSource union に追加する
// - 対応する buildFromSkillDocs 関数を実装する

/**
 * HandoffSource -> HandoffGuidance adapter 関数
 *
 * @param source - Consumer 固有の入力データ
 * @param reason - handoff になった理由
 * @returns HandoffGuidance
 */
export function toHandoffGuidance(
  source: HandoffSource,
  reason: string,
): HandoffGuidance {
  switch (source.kind) {
    case "chat-edit":
      return buildFromChatEdit(source, reason);
    case "agent":
      return buildFromAgent(source, reason);
    case "skill":
      return buildFromSkill(source, reason);
    case "bundle":
      return buildFromBundle(source, reason);
    default: {
      const _exhaustive: never = source;
      throw new Error(
        `Unknown HandoffSource kind: ${JSON.stringify(_exhaustive)}`,
      );
    }
  }
}
