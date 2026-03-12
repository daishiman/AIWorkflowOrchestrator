import type {
  ChatMessage,
  ChatMode,
  ChatSessionContext,
  ChatSessionRecord,
  SkillLifecycleChatJob,
} from "../../store/types";

interface FileLike {
  name?: string;
  path: string;
}

const MODE_LABELS: Record<ChatMode, string> = {
  general: "通常会話",
  workspace: "Workspace",
  "skill-lifecycle": "Skill Lifecycle",
};

const JOB_LABELS: Record<SkillLifecycleChatJob, string> = {
  create: "作成",
  use: "利用",
  improve: "改善",
};

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function createChatEntityId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createChatSessionContext(
  overrides: Partial<ChatSessionContext> = {},
): ChatSessionContext {
  return {
    workspacePath: overrides.workspacePath ?? null,
    selectedFilePaths: overrides.selectedFilePaths ?? [],
    selectedFileNames: overrides.selectedFileNames ?? [],
    selectedSkillName: overrides.selectedSkillName ?? null,
    lifecycleJob: overrides.lifecycleJob ?? null,
    entryPoint: overrides.entryPoint,
    handoffLabel: overrides.handoffLabel ?? null,
  };
}

export function mergeChatSessionContext(
  current: ChatSessionContext,
  updates: Partial<ChatSessionContext>,
): ChatSessionContext {
  return createChatSessionContext({
    ...current,
    ...updates,
    selectedFilePaths: updates.selectedFilePaths ?? current.selectedFilePaths,
    selectedFileNames: updates.selectedFileNames ?? current.selectedFileNames,
  });
}

export function buildWorkspaceChatContext(
  selectedFiles: FileLike[],
  workspacePath?: string | null,
): ChatSessionContext {
  const selectedFilePaths = selectedFiles.map((file) => file.path);
  const selectedFileNames = selectedFiles.map(
    (file) => file.name ?? file.path.split("/").pop() ?? file.path,
  );

  return createChatSessionContext({
    workspacePath: workspacePath ?? null,
    selectedFilePaths,
    selectedFileNames,
    entryPoint: "workspace",
    handoffLabel:
      selectedFileNames.length > 0
        ? `${selectedFileNames.length}件のファイルを背景情報として引き継ぎ`
        : "Workspace から会話を開始",
  });
}

export function buildChatSessionTitle(
  mode: ChatMode,
  context: ChatSessionContext,
  now = new Date(),
): string {
  if (mode === "workspace") {
    const workspaceName =
      context.workspacePath?.split("/").filter(Boolean).pop() ?? "workspace";
    return `Workspace: ${workspaceName}`;
  }

  if (mode === "skill-lifecycle") {
    const jobLabel = context.lifecycleJob
      ? JOB_LABELS[context.lifecycleJob]
      : "会話";
    const skillLabel = context.selectedSkillName
      ? ` / ${context.selectedSkillName}`
      : "";
    return `Skill Lifecycle ${jobLabel}${skillLabel}`;
  }

  return `${MODE_LABELS[mode]} ${formatClock(now)}`;
}

export function createWelcomeMessage(
  mode: ChatMode,
  context: ChatSessionContext,
  sessionId: string,
): ChatMessage {
  if (mode === "workspace") {
    const fileLabel =
      context.selectedFileNames.length > 0
        ? `対象ファイル: ${context.selectedFileNames.join(", ")}`
        : "対象ファイルが未選択です";

    return {
      id: createChatEntityId("assistant"),
      role: "assistant",
      content: `Workspace会話モードです。ファイル文脈を保ったまま進めます。\n${fileLabel}`,
      timestamp: new Date(),
      sessionId,
      mode,
    };
  }

  if (mode === "skill-lifecycle") {
    const jobLabel = context.lifecycleJob
      ? JOB_LABELS[context.lifecycleJob]
      : "作業";
    const handoff =
      context.handoffLabel ??
      "Skill Center から受け取った意図を会話へ引き継ぎます。";

    return {
      id: createChatEntityId("assistant"),
      role: "assistant",
      content: `Skill Lifecycleモードです。${jobLabel}の意図を崩さずに会話を進めます。\n${handoff}`,
      timestamp: new Date(),
      sessionId,
      mode,
    };
  }

  return {
    id: createChatEntityId("assistant"),
    role: "assistant",
    content:
      "こんにちは。通常会話モードです。必要な質問をそのまま入力してください。",
    timestamp: new Date(),
    sessionId,
    mode,
  };
}

export function createChatSessionRecord(
  mode: ChatMode,
  context: ChatSessionContext,
): ChatSessionRecord {
  const sessionId = createChatEntityId("session");
  const now = new Date();

  return {
    id: sessionId,
    mode,
    title: buildChatSessionTitle(mode, context, now),
    messages: [createWelcomeMessage(mode, context, sessionId)],
    createdAt: now,
    updatedAt: now,
    context,
    lastUserMessage: null,
    lastError: null,
  };
}

export function buildChatModeSystemPrompt(
  basePrompt: string,
  session: ChatSessionRecord,
): string | undefined {
  const parts: string[] = [];

  if (basePrompt.trim()) {
    parts.push(basePrompt.trim());
  }

  if (session.mode === "workspace") {
    parts.push(
      "Workspace mode: 回答では背景情報として渡されたファイル群を優先し、通常会話の文脈とは混ぜないこと。",
    );

    if (session.context.workspacePath) {
      parts.push(`workspacePath: ${session.context.workspacePath}`);
    }

    if (session.context.selectedFilePaths.length > 0) {
      parts.push(
        `selectedFiles:\n${session.context.selectedFilePaths.map((file) => `- ${file}`).join("\n")}`,
      );
    }
  }

  if (session.mode === "skill-lifecycle") {
    const jobLabel = session.context.lifecycleJob
      ? JOB_LABELS[session.context.lifecycleJob]
      : "作業";

    parts.push(
      `Skill lifecycle mode: 現在のジョブは「${jobLabel}」。ユーザーに planner / subagent / codex など内部実装の都合を露出しないこと。`,
    );

    if (session.context.selectedSkillName) {
      parts.push(`selectedSkillName: ${session.context.selectedSkillName}`);
    }

    if (session.context.handoffLabel) {
      parts.push(`handoff: ${session.context.handoffLabel}`);
    }
  }

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join("\n\n");
}

export function summarizeChatSession(session: ChatSessionRecord): string {
  if (session.mode === "workspace") {
    const fileCount = session.context.selectedFileNames.length;
    return fileCount > 0
      ? `${fileCount}件のファイルを文脈として利用`
      : "Workspace 文脈なし";
  }

  if (session.mode === "skill-lifecycle") {
    const jobLabel = session.context.lifecycleJob
      ? JOB_LABELS[session.context.lifecycleJob]
      : "会話";
    const skillLabel = session.context.selectedSkillName
      ? ` / ${session.context.selectedSkillName}`
      : "";
    return `${jobLabel}${skillLabel}`;
  }

  return "通常会話";
}

export function getChatModeLabel(mode: ChatMode): string {
  return MODE_LABELS[mode];
}

export function getSkillLifecycleJobLabel(job: SkillLifecycleChatJob): string {
  return JOB_LABELS[job];
}
