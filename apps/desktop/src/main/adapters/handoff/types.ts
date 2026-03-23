/**
 * HandoffSource Discriminated Union
 *
 * 4 種の呼び出し元（surface）から toHandoffGuidance adapter への入力型。
 * `kind` フィールドで判別し、kind 別に必要なフィールドが異なる。
 */
import type { HandoffGuidance } from "@repo/shared/types";

/** Chat Edit 画面からの handoff（MN-2 対応: 必要フィールドのみ抽出） */
export interface ChatEditHandoffSource {
  readonly kind: "chat-edit";
  readonly request: {
    readonly prompt: string;
    readonly workspacePath?: string;
    readonly contextFiles?: readonly string[];
  };
}

/** Agent 実行からの handoff */
export interface AgentHandoffSource {
  readonly kind: "agent";
  readonly skillId?: string;
  readonly prompt?: string;
  readonly workingDirectory?: string;
}

/** Skill 実行からの handoff */
export interface SkillHandoffSource {
  readonly kind: "skill";
  readonly skillName?: string;
  readonly skillId?: string;
  readonly prompt?: string;
  readonly workingDirectory?: string;
}

/** Bundle（プロンプトバンドル）からの handoff */
export interface BundleHandoffSource {
  readonly kind: "bundle";
  readonly launcher: string;
  readonly promptBundle: string;
}

/** Discriminated Union: 4 種の HandoffSource */
export type HandoffSource =
  | ChatEditHandoffSource
  | AgentHandoffSource
  | SkillHandoffSource
  | BundleHandoffSource;

// HandoffGuidance 型は @repo/shared/types から re-export
export type { HandoffGuidance };
