#!/usr/bin/env node
/**
 * OpenAPI 仕様から cURL コマンド例を生成するスクリプト
 *
 * 用途:
 * - OpenAPI 仕様ファイルから cURL コマンドを自動生成
 * - ドキュメントへの埋め込み用 Markdown 生成
 * - 複数言語のHTTPクライアント例を生成
 */

import { readFileSync, writeFileSync } from "fs";
import YAML from "yaml";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
};

function loadOpenAPISpec(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return YAML.parse(content);
  } catch (error) {
    console.error(`❌ ファイル読み込みエラー: ${filePath}`);
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

function generateCurlCommand(baseUrl, path, method, operation) {
  const url = `${baseUrl}${path}`;
  const httpMethod = method.toUpperCase();

  let curl = `curl -X ${httpMethod} "${url}"`;

  // ヘッダーの追加
  const headers = [];

  // 認証ヘッダー
  if (operation.security) {
    headers.push(`-H "Authorization: Bearer YOUR_TOKEN"`);
  }

  // Content-Type ヘッダー
  if (operation.requestBody) {
    const contentType =
      Object.keys(operation.requestBody.content || {})[0] || "application/json";
    headers.push(`-H "Content-Type: ${contentType}"`);
  }

  // Accept ヘッダー
  if (operation.responses) {
    headers.push(`-H "Accept: application/json"`);
  }

  curl += headers.length > 0 ? " \\\n  " + headers.join(" \\\n  ") : "";

  // リクエストボディの追加
  if (operation.requestBody && operation.requestBody.content) {
    const contentType = Object.keys(operation.requestBody.content)[0];
    const schema = operation.requestBody.content[contentType].schema;
    const example =
      operation.requestBody.content[contentType].example ||
      generateExampleFromSchema(schema);

    curl += ` \\\n  -d '${JSON.stringify(example, null, 2)}'`;
  }

  // パラメータの追加（クエリ、パス）
  if (operation.parameters) {
    const queryParams = operation.parameters
      .filter((p) => p.in === "query" && p.required)
      .map((p) => `${p.name}=${p.example || "value"}`)
      .join("&");

    if (queryParams) {
      curl = curl.replace(url, `${url}?${queryParams}`);
    }
  }

  return curl;
}

function generateExampleFromSchema(schema) {
  if (!schema) return {};

  if (schema.example) return schema.example;

  const example = {};

  if (schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      const prop = schema.properties[key];

      if (prop.example !== undefined) {
        example[key] = prop.example;
      } else if (prop.type === "string") {
        example[key] = prop.enum ? prop.enum[0] : "string";
      } else if (prop.type === "number" || prop.type === "integer") {
        example[key] = 123;
      } else if (prop.type === "boolean") {
        example[key] = true;
      } else if (prop.type === "array") {
        example[key] = [];
      } else if (prop.type === "object") {
        example[key] = {};
      }
    });
  }

  return example;
}

function generateMarkdownDocs(spec) {
  const baseUrl = spec.servers?.[0]?.url || "https://api.example.com";
  let markdown = `# API cURL コマンド例\n\n`;
  markdown += `**Base URL:** \`${baseUrl}\`\n\n`;
  markdown += `**生成日:** ${new Date().toLocaleDateString("ja-JP")}\n\n`;
  markdown += `---\n\n`;

  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        const summary = operation.summary || path;
        const description = operation.description || "";

        markdown += `## ${method.toUpperCase()} ${path}\n\n`;
        markdown += `**概要:** ${summary}\n\n`;

        if (description) {
          markdown += `${description}\n\n`;
        }

        // cURL コマンド
        markdown += `### cURL\n\n`;
        markdown += `\`\`\`bash\n`;
        markdown += generateCurlCommand(baseUrl, path, method, operation);
        markdown += `\n\`\`\`\n\n`;

        // レスポンス例
        if (operation.responses && operation.responses["200"]) {
          const response = operation.responses["200"];
          markdown += `### レスポンス例\n\n`;

          if (response.content && response.content["application/json"]) {
            const example = response.content["application/json"].example;

            markdown += `\`\`\`json\n`;
            markdown += JSON.stringify(
              example || { message: "Success" },
              null,
              2,
            );
            markdown += `\n\`\`\`\n\n`;
          }
        }

        markdown += `---\n\n`;
      }
    });
  });

  return markdown;
}

// メイン実行
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(
    "使用方法: generate-curl-examples.js <openapi.yaml> [出力ファイル]",
  );
  console.log("例: generate-curl-examples.js openapi.yaml curl-examples.md");
  process.exit(1);
}

const [specPath, outputPath = "curl-examples.md"] = args;

console.log(`${colors.blue}📝 cURL コマンド例を生成中...${colors.reset}\n`);

const spec = loadOpenAPISpec(specPath);
const markdown = generateMarkdownDocs(spec);

writeFileSync(outputPath, markdown, "utf-8");

console.log(
  `${colors.green}✅ cURL コマンド例を生成しました: ${outputPath}${colors.reset}`,
);
console.log(`\n📄 次のステップ:`);
console.log(`   1. ${outputPath} をレビュー`);
console.log(`   2. 必要に応じて例を編集`);
console.log(`   3. ドキュメントに埋め込み`);
