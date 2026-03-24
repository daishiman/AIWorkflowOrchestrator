/**
 * ModifierSkill - 逆同期機能のスキル実装
 * @module main/slide/modifier-skill
 *
 * index.htmlの変更をstructure.mdに反映するためのスキル。
 * Claude Agent SDKを使用してHTML差分を解析し、
 * structure.md形式の更新内容を生成する。
 */

import { readFile } from "fs/promises";
import { getAgentAPI } from "./agent-client";
import type { ModifierResponse, StructureChange } from "@repo/shared";
export type { ModifierResponse, StructureChange };

/**
 * HTMLファイルの最大サイズ（10MB）
 */
const MAX_HTML_SIZE = 10 * 1024 * 1024;

/**
 * Modifier Skillのコンテキスト
 */
export interface ModifierContext {
  projectPath: string;
  htmlContent: string;
  structureContent: string;
}

/**
 * Modifier Skillのインターフェース
 */
export interface ModifierSkill {
  execute(projectPath: string): Promise<ModifierResponse>;
  abort(): void;
}

/**
 * Modifierプロンプトを構築する
 * @param context - ModifierContext
 * @returns プロンプト文字列
 */
export function buildModifierPrompt(context: ModifierContext): string {
  return `あなたはスライドのHTMLとstructure.mdを比較し、差分を検出するエキスパートです。

## タスク
以下のHTMLコンテンツと現在のstructure.mdを比較し、HTMLで行われた変更をstructure.md形式で出力してください。

## HTMLコンテンツ
\`\`\`html
${context.htmlContent}
\`\`\`

## 現在のstructure.md
\`\`\`markdown
${context.structureContent}
\`\`\`

## 出力形式
以下のJSON形式で変更箇所を出力してください。変更がない場合は空の配列を返してください。

\`\`\`json
{
  "changes": [
    {
      "type": "modify" | "add" | "delete",
      "section": "セクション名（例: # スライド1）",
      "before": "変更前の内容（modify/deleteの場合）",
      "after": "変更後の内容（modify/addの場合）"
    }
  ]
}
\`\`\`

## ルール
1. typeは "modify"（変更）、"add"（追加）、"delete"（削除）のいずれか
2. sectionは変更されたセクションのMarkdown見出し（例: "# スライド1"）
3. modifyの場合はbeforeとafterの両方が必要
4. addの場合はafterのみ必要
5. deleteの場合はbeforeのみ必要
6. 変更がない場合は "changes": [] を返す

JSON形式のみを出力してください。`;
}

/**
 * 変更タイプが有効かどうかを検証する
 */
function isValidChangeType(type: unknown): type is "modify" | "add" | "delete" {
  return type === "modify" || type === "add" || type === "delete";
}

/**
 * 構造変更が有効かどうかを検証する
 */
function isValidStructureChange(change: unknown): change is StructureChange {
  if (typeof change !== "object" || change === null) {
    return false;
  }

  const c = change as Record<string, unknown>;

  // typeの検証
  if (!isValidChangeType(c.type)) {
    return false;
  }

  // sectionの検証
  if (typeof c.section !== "string" || c.section.length === 0) {
    return false;
  }

  // typeに応じた必須フィールドの検証
  switch (c.type) {
    case "modify":
      if (typeof c.before !== "string" || typeof c.after !== "string") {
        return false;
      }
      break;
    case "add":
      if (typeof c.after !== "string") {
        return false;
      }
      break;
    case "delete":
      if (typeof c.before !== "string") {
        return false;
      }
      break;
  }

  return true;
}

/**
 * JSONブロックからJSONを抽出する
 */
function extractJsonFromMarkdown(response: string): string | null {
  // ```json ... ``` ブロックを探す
  const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // ``` ... ``` ブロックを探す（json指定なし）
  const codeBlockMatch = response.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // JSONとして直接パースを試みる
  return response.trim();
}

/**
 * Modifierレスポンスをパースする
 * @param response - Agent SDKからのレスポンス文字列
 * @returns ModifierResponse
 */
export function parseModifierResponse(response: string): ModifierResponse {
  // 空のレスポンスをチェック
  if (!response || response.trim() === "") {
    return {
      success: false,
      error: "Empty response from Agent SDK",
    };
  }

  // nullリテラルをチェック
  if (response.trim() === "null") {
    return {
      success: false,
      error: "Invalid response: null",
    };
  }

  // JSONを抽出
  const jsonStr = extractJsonFromMarkdown(response);
  if (!jsonStr) {
    return {
      success: false,
      error: "No valid JSON found in response",
    };
  }

  // JSONをパース
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return {
      success: false,
      error: "Failed to parse JSON response",
    };
  }

  // オブジェクトであることを確認
  if (typeof parsed !== "object" || parsed === null) {
    return {
      success: false,
      error: "Invalid response format: expected object",
    };
  }

  const obj = parsed as Record<string, unknown>;

  // changesフィールドの検証
  if (!Array.isArray(obj.changes)) {
    return {
      success: false,
      error: "Invalid response format: changes must be an array",
    };
  }

  // 各変更を検証
  const validatedChanges: StructureChange[] = [];
  for (const change of obj.changes) {
    if (!isValidStructureChange(change)) {
      return {
        success: false,
        error: "Invalid change format in response",
      };
    }
    validatedChanges.push(change);
  }

  return {
    success: true,
    changes: validatedChanges,
    fallback_reason:
      typeof obj.fallback_reason === "string" ? obj.fallback_reason : undefined,
    suggested_action:
      typeof obj.suggested_action === "string"
        ? obj.suggested_action
        : undefined,
  };
}

/**
 * ModifierSkillを作成する
 * @returns ModifierSkill
 */
export function createModifierSkill(): ModifierSkill {
  const agentAPI = getAgentAPI();

  return {
    async execute(projectPath: string): Promise<ModifierResponse> {
      try {
        // ファイルを読み込む
        const htmlPath = `${projectPath}/index.html`;
        const structurePath = `${projectPath}/structure.md`;

        const [htmlContent, structureContent] = await Promise.all([
          readFile(htmlPath, "utf-8"),
          readFile(structurePath, "utf-8"),
        ]);

        // HTMLサイズチェック
        if (htmlContent.length > MAX_HTML_SIZE) {
          return {
            success: false,
            error: "HTML file size exceeds limit (10MB)",
          };
        }

        // コンテキストを構築
        const context: ModifierContext = {
          projectPath,
          htmlContent,
          structureContent,
        };

        // プロンプトを構築
        const prompt = buildModifierPrompt(context);

        // Agent SDKにクエリを送信
        const response = await agentAPI.query({
          prompt,
          options: {
            timeout: 30000,
            systemPrompt:
              "You are a slide structure analyzer. Analyze HTML changes and output JSON format only.",
          },
        });

        // レスポンスをパース
        return parseModifierResponse(response.content);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        // タイムアウトエラーの特別処理
        if (message.includes("timeout")) {
          return {
            success: false,
            error: "Request timeout",
          };
        }

        return {
          success: false,
          error: message,
        };
      }
    },

    abort(): void {
      agentAPI.abort();
    },
  };
}
