/**
 * SDK Message Normalizer
 * TASK-RT-06: Claude Code SDK SDKMessage → SkillCreatorSdkEvent 正規化
 *
 * `query()` が返す SDK 生メッセージを lane 安定契約 (`SkillCreatorSdkEvent`) に変換する。
 * Facade 内で使用し、IPC / renderer / WorkflowEngine が SDK 内部構造に依存しないようにする。
 */

import type {
  SkillCreatorSdkEvent,
  SkillCreatorSdkPermissionDenial,
  SkillCreatorWorkflowSourceProvenance,
} from "@repo/shared/types";
import { asSdkMessageRecord, getSdkMessageType } from "./sdkMessageUtils";

/** normalizer に渡すコンテキスト */
export interface NormalizerContext {
  /** skill-creator source provenance */
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  /** 前イベントから引き継いだ sessionId（stream 処理時に伝播用） */
  sessionId?: string;
}

/**
 * SDK 生メッセージ 1 件を lane 正規化イベントに変換する。
 *
 * @param rawMessage - `query()` から受信した SDK 生メッセージ（型は unknown）
 * @param context - normalizer コンテキスト（provenance, 伝播 sessionId）
 * @returns 正規化済み `SkillCreatorSdkEvent`
 */
export function normalizeSdkMessage(
  rawMessage: unknown,
  context: NormalizerContext,
): SkillCreatorSdkEvent {
  // shared helper による前処理
  const msg = asSdkMessageRecord(rawMessage);
  if (!msg) {
    return buildErrorEvent("Invalid SDK message: null or non-object", context);
  }

  const msgType = getSdkMessageType(msg);

  if (!msgType) {
    return buildErrorEvent("Invalid SDK message: missing type field", context);
  }

  switch (msgType) {
    case "system":
      return normalizeSystemMessage(msg, context);
    case "assistant":
      return normalizeAssistantMessage(msg, context);
    case "result":
      return normalizeResultMessage(msg, context);
    default:
      return buildErrorEvent(`Unknown SDK message type: ${msgType}`, context);
  }
}

/**
 * SDK 生メッセージのストリーム全体を正規化する。
 * init メッセージから取得した sessionId を後続メッセージに伝播する。
 *
 * @param rawMessages - SDK 生メッセージの配列
 * @param context - normalizer コンテキスト
 * @returns 正規化済みイベントの配列
 */
export function normalizeSdkStream(
  rawMessages: unknown[],
  context: NormalizerContext,
): SkillCreatorSdkEvent[] {
  const events: SkillCreatorSdkEvent[] = [];
  let propagatedSessionId = context.sessionId;

  for (const raw of rawMessages) {
    const ctx: NormalizerContext = {
      ...context,
      sessionId: propagatedSessionId,
    };
    const event = normalizeSdkMessage(raw, ctx);

    // init イベントの sessionId を後続に伝播
    if (event.eventType === "init" && event.sessionId) {
      propagatedSessionId = event.sessionId;
    }

    // result が自身の sessionId を持つ場合はそれを使う
    // 持たない場合は伝播された sessionId を使う
    if (event.eventType !== "init" && !event.sessionId && propagatedSessionId) {
      event.sessionId = propagatedSessionId;
    }

    events.push(event);
  }

  return events;
}

// ── Internal helpers ──────────────────────────────────

function normalizeSystemMessage(
  msg: Record<string, unknown>,
  context: NormalizerContext,
): SkillCreatorSdkEvent {
  const subtype = typeof msg.subtype === "string" ? msg.subtype : undefined;

  if (subtype === "init") {
    const sessionId =
      typeof msg.session_id === "string" ? msg.session_id : undefined;
    return {
      eventType: "init",
      sessionId,
      sourceProvenance: context.sourceProvenance,
    };
  }

  return buildErrorEvent(`Unknown system subtype: ${subtype}`, context);
}

function normalizeAssistantMessage(
  msg: Record<string, unknown>,
  context: NormalizerContext,
): SkillCreatorSdkEvent {
  const content = Array.isArray(msg.content) ? msg.content : [];
  const permissionDenied = msg.permission_denied === true;

  // text コンテンツの抽出
  const textBlock = content.find(
    (c: unknown) =>
      c != null &&
      typeof c === "object" &&
      (c as Record<string, unknown>).type === "text",
  ) as Record<string, unknown> | undefined;
  const text =
    textBlock && typeof textBlock.text === "string"
      ? textBlock.text
      : undefined;

  // tool_result with is_error → error イベント
  const errorToolResult = content.find(
    (c: unknown) =>
      c != null &&
      typeof c === "object" &&
      (c as Record<string, unknown>).type === "tool_result" &&
      (c as Record<string, unknown>).is_error === true,
  ) as Record<string, unknown> | undefined;

  if (errorToolResult && !permissionDenied) {
    const errorContent =
      typeof errorToolResult.content === "string"
        ? errorToolResult.content
        : "Tool error";
    return {
      eventType: "error",
      text: errorContent,
      sourceProvenance: context.sourceProvenance,
    };
  }

  // permission denial の処理
  const permissionDenials: SkillCreatorSdkPermissionDenial[] = [];
  if (permissionDenied) {
    const deniedTool =
      typeof msg.denied_tool === "string" ? msg.denied_tool : "unknown";
    const deniedReason =
      typeof msg.denied_reason === "string"
        ? msg.denied_reason
        : "Permission denied";
    permissionDenials.push({ toolName: deniedTool, reason: deniedReason });
  }

  const event: SkillCreatorSdkEvent = {
    eventType: "assistant",
    text,
    sourceProvenance: context.sourceProvenance,
  };

  if (permissionDenials.length > 0) {
    event.permissionDenials = permissionDenials;
  }

  const stopReason =
    typeof msg.stop_reason === "string" ? msg.stop_reason : undefined;
  if (stopReason) {
    event.stopReason = stopReason;
  }

  return event;
}

function normalizeResultMessage(
  msg: Record<string, unknown>,
  context: NormalizerContext,
): SkillCreatorSdkEvent {
  const subtype = typeof msg.subtype === "string" ? msg.subtype : undefined;
  const sessionId =
    typeof msg.session_id === "string" ? msg.session_id : undefined;
  const stopReason =
    typeof msg.stop_reason === "string" ? msg.stop_reason : undefined;

  // error text: error フィールド or result フィールド
  let text: string | undefined;
  if (typeof msg.error === "string") {
    text = msg.error;
  } else if (typeof msg.result === "string") {
    text = msg.result;
  }

  return {
    eventType: "result",
    sessionId,
    resultSubtype: subtype,
    text,
    stopReason,
    sourceProvenance: context.sourceProvenance,
  };
}

function buildErrorEvent(
  message: string,
  context: NormalizerContext,
): SkillCreatorSdkEvent {
  return {
    eventType: "error",
    text: message,
    sourceProvenance: context.sourceProvenance,
  };
}
