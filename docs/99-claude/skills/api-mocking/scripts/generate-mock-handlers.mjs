#!/usr/bin/env node

/**
 * MSWモックハンドラー自動生成スクリプト
 *
 * OpenAPI仕様やAPIエンドポイントリストからMSWハンドラーを自動生成します。
 *
 * 使用法:
 *   node generate-mock-handlers.mjs [options]
 *
 * オプション:
 *   --input <file>         入力ファイル（JSON、YAML、またはテキストファイル）
 *   --output <file>        出力ファイル（デフォルト: tests/mocks/generated-handlers.ts）
 *   --type <type>          入力ファイルの種類（openapi|endpoints|auto）
 *   --base-path <path>     APIのベースパス（デフォルト: /api）
 *
 * 例:
 *   node generate-mock-handlers.mjs --input openapi.json --type openapi
 *   node generate-mock-handlers.mjs --input endpoints.txt --type endpoints
 *   node generate-mock-handlers.mjs --input api-spec.yaml --type auto --output custom-handlers.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

class MockHandlerGenerator {
  constructor(options = {}) {
    this.inputFile = options.inputFile || null;
    this.outputFile = options.outputFile || "tests/mocks/generated-handlers.ts";
    this.inputType = options.inputType || "auto";
    this.basePath = options.basePath || "/api";
  }

  /**
   * メイン処理
   */
  run() {
    console.log("🔧 MSW Mock Handler Generator\n");

    if (!this.inputFile) {
      console.error("❌ Error: --input file is required");
      process.exit(1);
    }

    if (!existsSync(this.inputFile)) {
      console.error(`❌ Error: Input file not found: ${this.inputFile}`);
      process.exit(1);
    }

    console.log(`Input file: ${this.inputFile}`);
    console.log(`Output file: ${this.outputFile}`);
    console.log(`Input type: ${this.inputType}`);
    console.log(`Base path: ${this.basePath}\n`);

    // ステップ1: 入力ファイルを読み込み
    const input = this.readInput();

    // ステップ2: エンドポイント情報を抽出
    const endpoints = this.parseEndpoints(input);

    console.log(`Found ${endpoints.length} endpoint(s):\n`);
    endpoints.forEach((ep, index) => {
      console.log(`  ${index + 1}. ${ep.method.toUpperCase()} ${ep.path}`);
    });
    console.log("");

    // ステップ3: MSWハンドラーを生成
    const handlers = this.generateHandlers(endpoints);

    // ステップ4: ファイルに書き出し
    this.writeOutput(handlers);

    console.log(`\n✅ Mock handlers generated: ${this.outputFile}\n`);
    return 0;
  }

  /**
   * 入力ファイルを読み込み
   */
  readInput() {
    const content = readFileSync(this.inputFile, "utf-8");

    // 自動判定
    if (this.inputType === "auto") {
      if (this.inputFile.endsWith(".json")) {
        this.inputType = "openapi";
      } else if (
        this.inputFile.endsWith(".yaml") ||
        this.inputFile.endsWith(".yml")
      ) {
        this.inputType = "openapi";
      } else {
        this.inputType = "endpoints";
      }
    }

    return content;
  }

  /**
   * エンドポイント情報を抽出
   */
  parseEndpoints(input) {
    if (this.inputType === "openapi") {
      return this.parseOpenAPI(input);
    } else if (this.inputType === "endpoints") {
      return this.parseEndpointsList(input);
    }

    return [];
  }

  /**
   * OpenAPI仕様からエンドポイントを抽出
   */
  parseOpenAPI(content) {
    const spec = JSON.parse(content);
    const endpoints = [];

    if (!spec.paths) {
      console.warn("⚠️  No paths found in OpenAPI spec");
      return endpoints;
    }

    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (["get", "post", "put", "patch", "delete"].includes(method)) {
          endpoints.push({
            method,
            path: this.normalizePath(path),
            summary: operation.summary || "",
            operationId: operation.operationId || "",
            parameters: operation.parameters || [],
            requestBody: operation.requestBody || null,
            responses: operation.responses || {},
          });
        }
      }
    }

    return endpoints;
  }

  /**
   * エンドポイントリストからエンドポイントを抽出
   */
  parseEndpointsList(content) {
    const lines = content.split("\n").filter((line) => line.trim());
    const endpoints = [];

    for (const line of lines) {
      // 形式: GET /users/:id
      const match = line.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/i);

      if (match) {
        const [, method, path] = match;
        endpoints.push({
          method: method.toLowerCase(),
          path: this.normalizePath(path),
          summary: "",
          operationId: "",
          parameters: [],
          requestBody: null,
          responses: {},
        });
      }
    }

    return endpoints;
  }

  /**
   * パスを正規化
   */
  normalizePath(path) {
    // OpenAPIの{id}をPlaywrightの:id形式に変換
    return path.replace(/\{([^}]+)\}/g, ":$1");
  }

  /**
   * MSWハンドラーを生成
   */
  generateHandlers(endpoints) {
    let code = `/**
 * Auto-generated MSW Mock Handlers
 *
 * Generated at: ${new Date().toISOString()}
 * Source: ${this.inputFile}
 */

import { http, HttpResponse } from 'msw';

export const generatedHandlers = [\n`;

    for (const endpoint of endpoints) {
      code += this.generateHandler(endpoint);
    }

    code += `];\n`;

    return code;
  }

  /**
   * 単一のハンドラーを生成
   */
  generateHandler(endpoint) {
    const { method, path, summary } = endpoint;
    const hasParams = path.includes(":");
    const hasBody = ["post", "put", "patch"].includes(method);

    let handler = "";

    // コメント
    if (summary) {
      handler += `  // ${summary}\n`;
    }

    // ハンドラー定義
    handler += `  http.${method}('${this.basePath}${path}'`;

    // パラメータ
    if (hasParams || hasBody) {
      handler += ", async ({ ";
      if (hasParams) handler += "params";
      if (hasParams && hasBody) handler += ", ";
      if (hasBody) handler += "request";
      handler += " }) => {\n";

      // パラメータ処理
      if (hasParams) {
        const paramNames = this.extractParamNames(path);
        handler += `    const { ${paramNames.join(", ")} } = params;\n\n`;
      }

      // リクエストボディ処理
      if (hasBody) {
        handler += `    const body = await request.json();\n\n`;
      }

      // レスポンス
      handler += this.generateResponse(endpoint);
      handler += `  }),\n\n`;
    } else {
      handler += ", () => {\n";
      handler += this.generateResponse(endpoint);
      handler += `  }),\n\n`;
    }

    return handler;
  }

  /**
   * パスからパラメータ名を抽出
   */
  extractParamNames(path) {
    const matches = path.matchAll(/:([a-zA-Z0-9_]+)/g);
    return Array.from(matches, (m) => m[1]);
  }

  /**
   * レスポンスコードを生成
   */
  generateResponse(endpoint) {
    const { method, responses } = endpoint;

    // デフォルトレスポンス
    let statusCode = 200;
    if (method === "post") statusCode = 201;
    if (method === "delete") statusCode = 204;

    // OpenAPIのレスポンス定義から取得
    const responseKeys = Object.keys(responses);
    if (responseKeys.length > 0) {
      const successKey = responseKeys.find((key) => key.startsWith("2"));
      if (successKey) {
        statusCode = parseInt(successKey, 10);
      }
    }

    let code = "";

    if (statusCode === 204) {
      // No Content
      code += `    return new HttpResponse(null, { status: ${statusCode} });\n`;
    } else {
      // JSONレスポンス
      code += `    return HttpResponse.json(\n`;
      code += `      {\n`;
      code += `        // TODO: Customize response data\n`;
      code += `        message: 'Mock response for ${endpoint.method.toUpperCase()} ${
        endpoint.path
      }',\n`;
      code += `      },\n`;
      code += `      { status: ${statusCode} }\n`;
      code += `    );\n`;
    }

    return code;
  }

  /**
   * 出力ファイルに書き込み
   */
  writeOutput(content) {
    const outputPath = resolve(process.cwd(), this.outputFile);
    writeFileSync(outputPath, content, "utf-8");
    console.log(`✅ Generated: ${outputPath}`);
  }
}

// CLI処理
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: null,
    outputFile: "tests/mocks/generated-handlers.ts",
    inputType: "auto",
    basePath: "/api",
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--input":
        options.inputFile = args[++i];
        break;
      case "--output":
        options.outputFile = args[++i];
        break;
      case "--type":
        options.inputType = args[++i];
        break;
      case "--base-path":
        options.basePath = args[++i];
        break;
      case "--help":
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown option: ${args[i]}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
MSWモックハンドラー自動生成スクリプト

使用法:
  node generate-mock-handlers.mjs [options]

オプション:
  --input <file>         入力ファイル（JSON、YAML、またはテキストファイル）
  --output <file>        出力ファイル（デフォルト: tests/mocks/generated-handlers.ts）
  --type <type>          入力ファイルの種類（openapi|endpoints|auto）
  --base-path <path>     APIのベースパス（デフォルト: /api）
  --help                 このヘルプを表示

入力ファイル形式:

1. OpenAPI仕様（JSON/YAML）
   openapi.json、openapi.yamlなど

2. エンドポイントリスト（テキストファイル）
   各行に「メソッド パス」形式で記載

   例（endpoints.txt）:
   GET /users
   GET /users/:id
   POST /users
   PUT /users/:id
   DELETE /users/:id

例:
  node generate-mock-handlers.mjs --input openapi.json --type openapi
  node generate-mock-handlers.mjs --input endpoints.txt --type endpoints
  node generate-mock-handlers.mjs --input api-spec.yaml --type auto --output custom-handlers.ts
  `);
}

function main() {
  try {
    const options = parseArgs();
    const generator = new MockHandlerGenerator(options);
    const exitCode = generator.run();
    process.exit(exitCode);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmainを実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MockHandlerGenerator };
