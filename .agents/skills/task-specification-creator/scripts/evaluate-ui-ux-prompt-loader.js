import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENTS_DIR = path.resolve(__dirname, "../agents");

/**
 * エージェント仕様書からセクションを読み込む
 *
 * agents/ 配下のプロンプトファイルを検索する
 * sections で指定したセクション名を結合して返す
 * {{key}} プレースホルダーを variables で置換する
 *
 * @param {string} promptFile
 * @param {Record<string, string>} variables
 * @param {string[]} sections
 * @returns {string}
 */
export function loadPrompt(promptFile, variables = {}, sections = ["プロンプト本文"]) {
  const filePath = path.join(AGENTS_DIR, promptFile);
  const content = fs.readFileSync(filePath, "utf-8");

  const parts = [];

  for (const section of sections) {
    // ## または ### の見出し（番号付き "### 4.2 評価プロンプト" 形式にも対応）
    const pattern = new RegExp(
      `#{2,3}\\s+(?:\\d+\\.\\d+\\s+)?${section}\\s*\\n([\\s\\S]*?)(?=\\n#{2,3}\\s|$)`,
    );
    const match = content.match(pattern);
    if (!match && section === "プロンプト本文") {
      throw new Error(
        `プロンプトファイル ${promptFile} に "## プロンプト本文" セクションが見つかりません`,
      );
    }
    if (match) {
      parts.push(match[1].trim());
    }
  }

  let prompt = parts.join("\n\n");

  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }

  return prompt;
}
