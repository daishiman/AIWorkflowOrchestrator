#!/usr/bin/env node
/**
 * OpenAPI仕様からcURL例を生成するスクリプト
 *
 * Exit codes:
 *   0: success
 *   1: general error
 *   2: argument error
 *   3: file not found
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import YAML from "yaml";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_NOT_FOUND = 3;

function showHelp() {
  console.log(`
OpenAPI仕様からcURL例を生成

Usage:
  node scripts/generate-curl-examples.mjs --spec <path> [options]

Options:
  --spec <path>      OpenAPI仕様ファイル（必須）
  --output <path>    出力ファイル（任意, default: curl-examples.md）
  --base-url <url>   ベースURLを上書き（任意）
  -h, --help         ヘルプを表示
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function requireArg(value, name) {
  if (!value) {
    console.error(`Error: ${name} が必要です`);
    process.exit(EXIT_ARGS_ERROR);
  }
}

function loadOpenAPISpec(filePath) {
  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return YAML.parse(content);
  } catch (error) {
    console.error(`Error: failed to parse spec: ${error.message}`);
    process.exit(EXIT_ERROR);
  }
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

function generateCurlCommand(baseUrl, path, method, operation) {
  const url = `${baseUrl}${path}`;
  const httpMethod = method.toUpperCase();

  let curl = `curl -X ${httpMethod} "${url}"`;
  const headers = [];

  if (operation.security) {
    headers.push(`-H "Authorization: Bearer YOUR_TOKEN"`);
  }

  if (operation.requestBody) {
    const contentType =
      Object.keys(operation.requestBody.content || {})[0] || "application/json";
    headers.push(`-H "Content-Type: ${contentType}"`);
  }

  headers.push(`-H "Accept: application/json"`);

  if (headers.length > 0) {
    curl += " \\\n  " + headers.join(" \\\n  ");
  }

  if (operation.requestBody && operation.requestBody.content) {
    const contentType = Object.keys(operation.requestBody.content)[0];
    const schema = operation.requestBody.content[contentType].schema;
    const example =
      operation.requestBody.content[contentType].example ||
      generateExampleFromSchema(schema);

    curl += ` \\\n  -d '${JSON.stringify(example, null, 2)}'`;
  }

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

function generateMarkdownDocs(spec, baseUrlOverride) {
  const baseUrl = baseUrlOverride || spec.servers?.[0]?.url || "https://api.example.com";
  const date = new Date().toISOString().split("T")[0];
  let markdown = "# API cURL コマンド例\n\n";
  markdown += `**Base URL:** \`${baseUrl}\`\n\n`;
  markdown += `**生成日:** ${date}\n\n`;
  markdown += "---\n\n";

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

        markdown += "### cURL\n\n";
        markdown += "```bash\n";
        markdown += generateCurlCommand(baseUrl, path, method, operation);
        markdown += "\n```\n\n";

        if (operation.responses && operation.responses["200"]) {
          const response = operation.responses["200"];
          if (response.content && response.content["application/json"]) {
            const example = response.content["application/json"].example;
            markdown += "### レスポンス例\n\n";
            markdown += "```json\n";
            markdown += JSON.stringify(example || { message: "Success" }, null, 2);
            markdown += "\n```\n\n";
          }
        }

        markdown += "---\n\n";
      }
    });
  });

  return markdown;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const specArg = getArg(args, "--spec");
  const outputArg = getArg(args, "--output") || "curl-examples.md";
  const baseUrlArg = getArg(args, "--base-url");

  requireArg(specArg, "--spec");

  const specPath = resolve(process.cwd(), specArg);
  const outputPath = resolve(process.cwd(), outputArg);

  const spec = loadOpenAPISpec(specPath);
  const markdown = generateMarkdownDocs(spec, baseUrlArg);

  writeFileSync(outputPath, markdown, "utf-8");
  console.log(`Generated cURL examples: ${outputPath}`);
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
