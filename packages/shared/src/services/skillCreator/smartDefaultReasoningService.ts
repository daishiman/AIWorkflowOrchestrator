import type {
  SkillInfoFormData,
  SmartDefaultResult,
} from "../../types/skillCreator";

// ============================================================
// 推論ルール定数（キーワード追加・変更はここのみ変更）
// ============================================================

const TOOL_KEYWORDS: Array<{
  keyword: string;
  tool: NonNullable<SmartDefaultResult["tool"]>;
}> = [
  { keyword: "slack", tool: "slack" },
  { keyword: "github", tool: "github" },
  { keyword: "notion", tool: "notion" },
];

const SCHEDULED_PATTERN = /毎日|毎週|定期|スケジュール/;
const REALTIME_PATTERN = /リアルタイム|即座|すぐに/;

// ============================================================
// 内部推論ヘルパー
// ============================================================

function inferTool(purpose: string): {
  tool: SmartDefaultResult["tool"];
  log: string | null;
} {
  const normalizedPurpose = purpose.toLowerCase();
  for (const { keyword, tool } of TOOL_KEYWORDS) {
    if (normalizedPurpose.includes(keyword)) {
      return {
        tool,
        log: `purpose に '${keyword}' を検出 → tool = '${tool}'`,
      };
    }
  }
  return { tool: null, log: null };
}

function inferTiming(purpose: string): {
  timing: SmartDefaultResult["timing"];
  log: string | null;
} {
  if (SCHEDULED_PATTERN.test(purpose)) {
    return {
      timing: "scheduled",
      log: "定期実行キーワードを検出 → timing = 'scheduled'",
    };
  }
  if (REALTIME_PATTERN.test(purpose)) {
    return {
      timing: "realtime",
      log: "リアルタイムキーワードを検出 → timing = 'realtime'",
    };
  }
  return { timing: null, log: null };
}

function inferFormat(category: SkillInfoFormData["category"]): {
  format: SmartDefaultResult["format"];
  log: string | null;
} {
  if (category.includes("code-support")) {
    return {
      format: "code",
      log: "category includes 'code-support' → format = 'code'",
    };
  }
  if (category.includes("data-analysis")) {
    return {
      format: "structured",
      log: "category includes 'data-analysis' → format = 'structured'",
    };
  }
  return { format: null, log: null };
}

function createEmptyResult(): Omit<SmartDefaultResult, "inferenceLog"> {
  return {
    who: null,
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };
}

function normalizePurpose(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

// ============================================================
// 公開 API
// ============================================================

/**
 * ユーザー入力（SkillInfoFormData）からスマートデフォルト推論結果を生成する
 *
 * `purpose` は tool/timing の推論対象、`category` は format の独立推論対象。
 * 推論できなかったフィールドは null を返す（フォールバック）。
 * 推論件数が0件でも inferenceLog は空配列 [] として返す。
 *
 * @param input スキル情報入力フォームの値
 * @returns SmartDefaultResult 推論結果
 */
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult {
  const result = createEmptyResult();
  const inferenceLog: string[] = [];
  const purpose = normalizePurpose(input?.purpose);

  // purpose は tool/timing の推論対象。空欄でも category の format 推論は継続する。
  if (purpose !== "") {
    const toolResult = inferTool(purpose);
    result.tool = toolResult.tool;
    if (toolResult.log) {
      inferenceLog.push(toolResult.log);
    }

    const timingResult = inferTiming(purpose);
    result.timing = timingResult.timing;
    if (timingResult.log) {
      inferenceLog.push(timingResult.log);
    }
  }

  // category は purpose と独立に評価する。
  const formatResult = inferFormat(input?.category);
  result.format = formatResult.format;
  if (formatResult.log) {
    inferenceLog.push(formatResult.log);
  }

  return {
    ...result,
    inferenceLog,
  };
}
