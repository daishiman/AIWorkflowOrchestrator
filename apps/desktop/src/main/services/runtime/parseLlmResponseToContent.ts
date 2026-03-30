/**
 * parseLlmResponseToContent - LLM 応答からスキルコンテンツを抽出
 *
 * TASK-P0-05: execute() 内で LLM 応答を解析し SkillGeneratedContent に変換する。
 * RuntimeSkillCreatorFacade の肥大化を防ぐため独立ユーティリティとして切り出し。
 */

import type {
  SkillCreatorSdkEvent,
  SkillGeneratedContent,
} from "@repo/shared/types";

/**
 * コードブロック抽出用正規表現
 * - 見出し行（### filepath）はオプション
 * - 言語注釈（```markdown 等）はオプション
 */
const REGEX_CODE_BLOCK =
  /(?:^|\n)#{2,}\s+(?<heading>.+?)\s*\n```(?:\w+)?\n(?<content>[\s\S]*?)```|(?:^|\n)```(?:\w+)?\n(?<plainContent>[\s\S]*?)```/g;

/**
 * SDKイベント配列から LLM 応答テキストを結合し、
 * コードブロックを抽出して SkillGeneratedContent に変換する。
 *
 * コードブロックが 0 件の場合は null を返す（正常ケース）。
 */
export function parseLlmResponseToContent(
  sdkEvents: SkillCreatorSdkEvent[],
): SkillGeneratedContent | null {
  // Step 1: assistant / result イベントのテキストを結合
  const fullText = sdkEvents
    .filter((e) => e.eventType === "assistant" || e.eventType === "result")
    .map((e) => e.text ?? "")
    .join("");

  if (fullText.trim() === "") {
    return null;
  }

  // Step 2: コードブロック抽出（見出し行付き・なし両対応）
  const blocks: Array<{ heading: string | null; content: string }> = [];
  let match: RegExpExecArray | null;

  // 正規表現の lastIndex をリセット
  REGEX_CODE_BLOCK.lastIndex = 0;
  while ((match = REGEX_CODE_BLOCK.exec(fullText)) !== null) {
    const heading = match.groups?.heading?.trim() ?? null;
    const content = (
      match.groups?.content ??
      match.groups?.plainContent ??
      ""
    ).trim();
    blocks.push({ heading, content });
  }

  // Step 3: コードブロック 0 件 → null
  if (blocks.length === 0) {
    return null;
  }

  // Step 4: 分類
  const result: SkillGeneratedContent = {
    skillMd: "",
    agents: [],
    scripts: [],
    references: [],
  };

  for (const block of blocks) {
    const heading = block.heading;

    if (heading === "SKILL.md" || heading?.endsWith("/SKILL.md")) {
      if (!result.skillMd) {
        result.skillMd = block.content;
      }
    } else if (heading?.startsWith("agents/")) {
      const name = normalizeMarkdownAssetName(heading.replace("agents/", ""));
      result.agents.push({ name, content: block.content });
    } else if (heading?.startsWith("scripts/")) {
      const name = heading.replace("scripts/", "");
      result.scripts.push({ name, content: block.content });
    } else if (heading?.startsWith("references/")) {
      const name = normalizeMarkdownAssetName(
        heading.replace("references/", ""),
      );
      result.references.push({ name, content: block.content });
    } else {
      // 見出しなし or 分類不能: skillMd 未設定なら skillMd に割り当て
      if (!result.skillMd) {
        result.skillMd = block.content;
      }
    }
  }

  return result;
}

function normalizeMarkdownAssetName(name: string): string {
  return name.replace(/\.md$/i, "");
}
