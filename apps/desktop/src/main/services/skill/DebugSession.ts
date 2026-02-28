import { randomUUID } from "crypto";
import type {
  DebugSessionStatus,
  DebugSessionState,
  Breakpoint,
  DebugStep,
  DebugStepType,
  CallStackEntry,
  CallStackEntryType,
} from "@repo/shared";
import { VALID_DEBUG_TRANSITIONS, DEBUG_CONSTANTS } from "@repo/shared";

/**
 * デバッグセッション管理クラス
 *
 * 個別のデバッグセッションの状態を管理する。
 * 状態遷移、ブレークポイント管理、変数管理、コールスタック管理、ステップ管理を提供する。
 */
export class DebugSession {
  private readonly _id: string;
  private readonly _skillName: string;
  private _status: DebugSessionStatus;
  private _breakpoints: Breakpoint[];
  private _currentStep: DebugStep | undefined;
  private _variables: Record<string, unknown>;
  private _callStack: CallStackEntry[];
  private readonly _startedAt: string;
  private _stepHistory: DebugStep[];
  private _stepCounter: number;
  private _error: string | undefined;

  constructor(skillName: string) {
    this._id = randomUUID();
    this._skillName = skillName;
    this._status = "idle";
    this._breakpoints = [];
    this._currentStep = undefined;
    this._variables = {};
    this._callStack = [];
    this._startedAt = new Date().toISOString();
    this._stepHistory = [];
    this._stepCounter = 0;
    this._error = undefined;
  }

  get id(): string {
    return this._id;
  }

  get skillName(): string {
    return this._skillName;
  }

  get status(): DebugSessionStatus {
    return this._status;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状態遷移メソッド
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private transition(target: DebugSessionStatus): void {
    const allowed = VALID_DEBUG_TRANSITIONS[this._status];
    if (!allowed.includes(target)) {
      throw new Error(`Invalid state transition: ${this._status} -> ${target}`);
    }
    this._status = target;
  }

  start(): void {
    this.transition("running");
  }

  pause(): void {
    this.transition("paused");
  }

  resume(): void {
    this.transition("running");
  }

  complete(): void {
    this.transition("completed");
  }

  fail(error: string): void {
    this._error = error;
    this.transition("error");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ブレークポイント管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  addBreakpoint(bp: Omit<Breakpoint, "id">): Breakpoint {
    if (this._breakpoints.length >= DEBUG_CONSTANTS.MAX_BREAKPOINTS) {
      throw new Error(
        `Maximum breakpoints limit reached: ${DEBUG_CONSTANTS.MAX_BREAKPOINTS}`,
      );
    }
    const breakpoint: Breakpoint = {
      ...bp,
      id: randomUUID(),
    };
    this._breakpoints.push(breakpoint);
    return breakpoint;
  }

  removeBreakpoint(breakpointId: string): boolean {
    const index = this._breakpoints.findIndex((bp) => bp.id === breakpointId);
    if (index === -1) {
      return false;
    }
    this._breakpoints.splice(index, 1);
    return true;
  }

  getBreakpoints(): readonly Breakpoint[] {
    return [...this._breakpoints];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 変数管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  setVariable(path: string, value: unknown): void {
    const parts = path.split(".");
    if (parts.length === 1) {
      this._variables[path] = value;
      return;
    }

    // ドット記法でのネスト設定
    let current: Record<string, unknown> = this._variables;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (
        current[key] === undefined ||
        current[key] === null ||
        typeof current[key] !== "object"
      ) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }

  getVariable(path: string): unknown {
    const parts = path.split(".");
    let current: unknown = this._variables;
    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      if (typeof current !== "object") {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  getVariables(): Record<string, unknown> {
    return { ...this._variables };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // コールスタック管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  pushCallStack(name: string, type: CallStackEntryType): void {
    if (this._callStack.length >= DEBUG_CONSTANTS.MAX_CALL_STACK_DEPTH) {
      throw new Error(
        `Maximum call stack depth reached: ${DEBUG_CONSTANTS.MAX_CALL_STACK_DEPTH}`,
      );
    }
    const entry: CallStackEntry = {
      depth: this._callStack.length,
      name,
      type,
      startTime: new Date().toISOString(),
    };
    this._callStack.push(entry);
  }

  popCallStack(): CallStackEntry | undefined {
    if (this._callStack.length === 0) {
      return undefined;
    }
    return this._callStack.pop();
  }

  getCallStack(): readonly CallStackEntry[] {
    return [...this._callStack];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  recordStep(
    type: DebugStepType,
    options?: {
      toolName?: string;
      hookType?: string;
      input?: unknown;
      output?: unknown;
    },
  ): DebugStep {
    if (this._stepCounter >= DEBUG_CONSTANTS.MAX_STEPS) {
      throw new Error(
        `Maximum steps limit reached: ${DEBUG_CONSTANTS.MAX_STEPS}`,
      );
    }
    this._stepCounter++;
    const step: DebugStep = {
      stepNumber: this._stepCounter,
      type,
      toolName: options?.toolName,
      hookType: options?.hookType,
      input: options?.input,
      output: options?.output,
      timestamp: new Date().toISOString(),
    };
    this._currentStep = step;
    this._stepHistory.push(step);
    return step;
  }

  getCurrentStep(): DebugStep | undefined {
    return this._currentStep;
  }

  getStepHistory(): DebugStep[] {
    return [...this._stepHistory];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // シリアライズ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  toJSON(): DebugSessionState {
    return {
      id: this._id,
      skillName: this._skillName,
      status: this._status,
      breakpoints: [...this._breakpoints],
      currentStep: this._currentStep,
      variables: { ...this._variables },
      callStack: [...this._callStack],
      startedAt: this._startedAt,
      error: this._error,
      steps: [...this._stepHistory],
    };
  }
}
