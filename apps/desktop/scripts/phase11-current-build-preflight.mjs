#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  formatPhase11CurrentBuildPreflightReport,
  runPhase11CurrentBuildPreflight,
} from "./phase11-current-build-preflight-core.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");

export function parsePhase11CurrentBuildPreflightArgs(argv) {
  const options = {
    baseUrl: undefined,
    json: false,
    noAutoServe: false,
    write: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case "--base-url": {
        const nextValue = argv[index + 1];
        if (!nextValue || nextValue.startsWith("--")) {
          throw new Error("`--base-url` requires a value.");
        }
        options.baseUrl = nextValue;
        index += 1;
        break;
      }
      case "--json":
        options.json = true;
        break;
      case "--no-auto-serve":
        options.noAutoServe = true;
        break;
      case "--write": {
        const nextValue = argv[index + 1];
        if (!nextValue || nextValue.startsWith("--")) {
          throw new Error("`--write` requires a value.");
        }
        options.write = nextValue;
        index += 1;
        break;
      }
      default:
        throw new Error(`Unknown option: ${token}`);
    }
  }

  return options;
}

export async function runPhase11CurrentBuildPreflightCli(
  argv,
  injected = {},
) {
  const options = parsePhase11CurrentBuildPreflightArgs(argv);
  const { result, cleanup } = await (
    injected.runPreflight ?? runPhase11CurrentBuildPreflight
  )({
    baseUrl: options.baseUrl,
    autoServe: !options.noAutoServe,
  });

  try {
    const output = options.json
      ? `${JSON.stringify(result, null, 2)}\n`
      : formatPhase11CurrentBuildPreflightReport(result);

    let resolvedWritePath = null;
    if (options.write) {
      resolvedWritePath = path.isAbsolute(options.write)
        ? options.write
        : path.join(injected.repoRoot ?? repoRoot, options.write);
      await (injected.mkdir ?? fs.mkdir)(path.dirname(resolvedWritePath), {
        recursive: true,
      });
      await (injected.writeFile ?? fs.writeFile)(
        resolvedWritePath,
        JSON.stringify(result, null, 2),
        "utf8",
      );
    }

    return {
      exitCode: result.summary.exitCode,
      output,
      result,
      writePath: resolvedWritePath,
    };
  } finally {
    await cleanup?.();
  }
}

async function main() {
  try {
    const cliResult = await runPhase11CurrentBuildPreflightCli(
      process.argv.slice(2),
    );
    process.stdout.write(cliResult.output);
    process.exitCode = cliResult.exitCode;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `[phase11-current-build-preflight] failed: ${message}\n`,
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
