/**
 * SkillCreatorAuditSink - Governance 監査イベント収集
 *
 * TASK-P0-09: claude-sdk-permission-hooks-governance
 *
 * Hooks が生成した監査イベントを収集・保持する。
 * main プロセスで一元管理し、renderer は IPC 経由で read-only 参照する。
 */

import type {
  SkillCreatorGovernanceAuditEvent,
  SkillCreatorGovernancePhase,
  SkillCreatorHookEventType,
  SkillCreatorToolDecision,
  SkillCreatorWorkflowSourceProvenance,
} from "@repo/shared/types";

/** AuditSink の最大イベント保持数（メモリ上限保護） */
const MAX_EVENTS = 500;

export class SkillCreatorAuditSink {
  private events: SkillCreatorGovernanceAuditEvent[] = [];
  private readonly maxEvents: number;

  constructor(maxEvents: number = MAX_EVENTS) {
    this.maxEvents = maxEvents;
  }

  /**
   * 監査イベントを記録する。
   * maxEvents を超えた場合は古いイベントから破棄される。
   */
  record(event: SkillCreatorGovernanceAuditEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * 便利メソッド: 構造化された監査イベントを生成して記録する。
   */
  recordEvent(params: {
    eventType: SkillCreatorHookEventType;
    sessionId: string;
    phase: SkillCreatorGovernancePhase;
    toolName?: string;
    decision?: SkillCreatorToolDecision;
    provenance?: SkillCreatorWorkflowSourceProvenance;
    metadata?: Record<string, unknown>;
  }): SkillCreatorGovernanceAuditEvent {
    const event: SkillCreatorGovernanceAuditEvent = {
      ...params,
      timestamp: new Date().toISOString(),
    };
    this.record(event);
    return event;
  }

  /**
   * 全監査イベントを返す（UI 表示向け、read-only コピー）。
   */
  getEvents(): readonly SkillCreatorGovernanceAuditEvent[] {
    return [...this.events];
  }

  /**
   * 直近 N 件の監査イベントを返す。
   */
  getRecentEvents(count: number): SkillCreatorGovernanceAuditEvent[] {
    if (!Number.isFinite(count) || count <= 0) {
      return [];
    }
    return this.events.slice(-count);
  }

  /**
   * 指定 sessionId のイベントのみ返す。
   */
  getEventsBySession(sessionId: string): SkillCreatorGovernanceAuditEvent[] {
    return this.events.filter((e) => e.sessionId === sessionId);
  }

  /**
   * denial イベントのみ返す（decision.allowed === false）。
   */
  getDenialEvents(): SkillCreatorGovernanceAuditEvent[] {
    return this.events.filter((e) => e.decision && !e.decision.allowed);
  }

  /**
   * 全イベントをクリアする。
   */
  clear(): void {
    this.events = [];
  }

  /**
   * 現在のイベント数を返す。
   */
  get size(): number {
    return this.events.length;
  }
}
