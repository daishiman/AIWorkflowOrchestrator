/**
 * SkillDocsCapabilityResolver - Skill Docs 生成の capability を判定する (TASK-04)
 *
 * LLMDocQueryAdapter の状態に基づいて、3つの capability パスを判定する:
 * 1. integrated-api: API key 有効 → docs 生成実行可能
 * 2. guidance-only: API key 未設定 → guidance block 表示
 * 3. terminal-handoff: API key 有効だが LLM 到達不可 → terminal へ誘導
 */
import type { ILLMDocQueryAdapter } from "./LLMDocQueryAdapter";
import type { SkillDocsCapabilityResult } from "@repo/shared";

export class SkillDocsCapabilityResolver {
  private readonly adapter: ILLMDocQueryAdapter;

  constructor(adapter: ILLMDocQueryAdapter) {
    this.adapter = adapter;
  }

  async resolve(): Promise<SkillDocsCapabilityResult> {
    if (!(await this.adapter.isAvailable())) {
      return {
        capability: "guidance-only",
        guidance: "設定画面から API key を設定してください",
      };
    }

    return {
      capability: "integrated-api",
      provider: this.adapter.getProviderName(),
    };
  }
}
