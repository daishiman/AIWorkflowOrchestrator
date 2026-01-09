/**
 * IConversionLogger モック
 *
 * @module @repo/shared/services/history/__tests__/mocks
 */

import { ok } from "../../../../types/rag/result";
import type { Result } from "../../../../types/rag/result";
import type {
  IConversionLogger,
  ConversionLog,
  ConversionLogInput,
  LogLevel,
} from "../../../logging/types";

/**
 * モック用ログエントリ作成ヘルパー
 */
function createMockLog(
  level: LogLevel,
  input: ConversionLogInput,
): ConversionLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    level,
    fileId: input.fileId,
    fileName: input.fileName,
    conversionId: input.conversionId,
    action: input.action,
    message: input.message,
    details: input.details,
    durationMs: input.durationMs,
  };
}

/**
 * IConversionLogger モック実装
 */
export function createMockLogger(): IConversionLogger & {
  _logs: ConversionLog[];
  _getLogs: () => ConversionLog[];
  _clear: () => void;
} {
  const logs: ConversionLog[] = [];

  return {
    _logs: logs,
    _getLogs: () => logs,
    _clear: () => {
      logs.length = 0;
    },

    async info(input: ConversionLogInput): Promise<Result<ConversionLog>> {
      const log = createMockLog("info", input);
      logs.push(log);
      return ok(log);
    },

    async warn(input: ConversionLogInput): Promise<Result<ConversionLog>> {
      const log = createMockLog("warn", input);
      logs.push(log);
      return ok(log);
    },

    async error(
      input: ConversionLogInput,
      error?: Error,
    ): Promise<Result<ConversionLog>> {
      const log = createMockLog("error", input);
      if (error) {
        log.errorStack = error.stack;
      }
      logs.push(log);
      return ok(log);
    },

    async batch(
      items: Array<{ level: LogLevel; input: ConversionLogInput }>,
    ): Promise<Result<ConversionLog[]>> {
      const result: ConversionLog[] = [];
      for (const { level, input } of items) {
        const log = createMockLog(level, input);
        logs.push(log);
        result.push(log);
      }
      return ok(result);
    },

    async flush(): Promise<Result<void>> {
      return ok(undefined);
    },

    dispose(): void {
      // no-op
    },
  };
}
