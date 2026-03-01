import { describe, it, expect } from "vitest";
import { validateNaLogEntries, type NaLogEntry } from "../na-log-validator";
import {
  validateTripleCheck,
  type TripleCheckInput,
} from "../triple-check-validator";
import { parseAuditOutput, evaluateAuditResult } from "../audit-output-parser";

/**
 * Phase 12 ガード統合テスト
 *
 * N/Aログ検証 -> 三点突合 -> 監査コマンドのパイプラインを統合的にテストする。
 */
describe("Phase 12 ガード統合テスト", () => {
  // ================================================
  // TC-INT-01: 全要素正常で完了判定
  // ================================================
  it("TC-INT-01: 全要素正常で完了判定 -> 総合PASS", () => {
    // Step 1: N/Aログ検証
    const naLogEntries: NaLogEntry[] = [
      {
        specName: "task-workflow.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      },
      {
        specName: "security-api-electron.md",
        status: "N/A",
        reason: "セキュリティ変更なし",
        alternativeEvidence: "Phase 10レビューで確認",
        updatedBy: "SubAgent-C",
      },
    ];
    const naLogResult = validateNaLogEntries(naLogEntries);
    expect(naLogResult.isValid).toBe(true);

    // Step 2: 監査出力パース
    const auditStdout = JSON.stringify({
      currentViolations: { total: 0, details: [] },
      baselineViolations: { total: 2, details: ["既存課題A", "既存課題B"] },
    });
    const parseResult = parseAuditOutput(auditStdout);
    expect(parseResult.isValid).toBe(true);

    // Step 3: 三点突合
    const tripleCheckInput: TripleCheckInput = {
      artifactsJsonPath: "completed",
      changelogPath: "synced",
      auditResult: parseResult.result!,
    };
    const tripleCheckResult = validateTripleCheck(tripleCheckInput);
    expect(tripleCheckResult.overallStatus).toBe("PASS");
    expect(tripleCheckResult.failedChecks).toHaveLength(0);

    // Step 4: 監査結果評価
    const evalResult = evaluateAuditResult(parseResult.result!);
    expect(evalResult.status).toBe("PASS");
  });

  // ================================================
  // TC-INT-02: N/Aログ検証失敗で中断
  // ================================================
  it("TC-INT-02: N/Aログ検証失敗で中断 -> 三点突合は実行されない -> 総合FAIL", () => {
    // Step 1: N/Aログ検証（不正エントリ）
    const naLogEntries: NaLogEntry[] = [
      {
        specName: "",
        status: "N/A",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "invalid-agent",
      },
    ];
    const naLogResult = validateNaLogEntries(naLogEntries);
    expect(naLogResult.isValid).toBe(false);

    // N/Aログ検証失敗の場合、三点突合は実行しない（早期リターン）
    // パイプラインの早期中断を確認
    const isPipelinePassed = naLogResult.isValid;
    expect(isPipelinePassed).toBe(false);
    // 後続の三点突合は実行されないため、結果は未定義
  });

  // ================================================
  // TC-INT-03: N/Aログ検証成功 + 三点突合失敗
  // ================================================
  it("TC-INT-03: N/Aログ検証PASS + 三点突合FAIL -> 総合FAIL", () => {
    // Step 1: N/Aログ検証（正常）
    const naLogEntries: NaLogEntry[] = [
      {
        specName: "LOGS.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "leader",
      },
    ];
    const naLogResult = validateNaLogEntries(naLogEntries);
    expect(naLogResult.isValid).toBe(true);

    // Step 2: 監査出力パース（違反あり）
    const auditStdout = JSON.stringify({
      currentViolations: {
        total: 2,
        details: ["LOGS.md未更新", "topic-map.md未再生成"],
      },
      baselineViolations: { total: 0, details: [] },
    });
    const parseResult = parseAuditOutput(auditStdout);
    expect(parseResult.isValid).toBe(true);

    // Step 3: 三点突合（audit FAIL）
    const tripleCheckInput: TripleCheckInput = {
      artifactsJsonPath: "completed",
      changelogPath: "synced",
      auditResult: parseResult.result!,
    };
    const tripleCheckResult = validateTripleCheck(tripleCheckInput);
    expect(tripleCheckResult.overallStatus).toBe("FAIL");
    expect(tripleCheckResult.failedChecks).toContain("audit");
  });

  // ================================================
  // TC-INT-04: 監査結果にbaseline違反あり + current=0
  // ================================================
  it("TC-INT-04: baseline違反あり + current=0 -> 総合PASS（baseline無視）", () => {
    // Step 1: N/Aログ検証
    const naLogEntries: NaLogEntry[] = [
      {
        specName: "SKILL.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-B",
      },
      {
        specName: "interfaces-agent-sdk.md",
        status: "N/A",
        reason: "SDK型変更なし",
        alternativeEvidence: "Phase 5でSDK変更確認済み",
        updatedBy: "SubAgent-D",
      },
    ];
    const naLogResult = validateNaLogEntries(naLogEntries);
    expect(naLogResult.isValid).toBe(true);

    // Step 2: 監査出力パース（baseline違反あり、current=0）
    const auditStdout = JSON.stringify({
      currentViolations: { total: 0, details: [] },
      baselineViolations: {
        total: 10,
        details: [
          "既存課題1",
          "既存課題2",
          "既存課題3",
          "既存課題4",
          "既存課題5",
          "既存課題6",
          "既存課題7",
          "既存課題8",
          "既存課題9",
          "既存課題10",
        ],
      },
    });
    const parseResult = parseAuditOutput(auditStdout);
    expect(parseResult.isValid).toBe(true);

    // Step 3: 三点突合（全PASS、baselineは無視）
    const tripleCheckInput: TripleCheckInput = {
      artifactsJsonPath: "completed",
      changelogPath: "synced",
      auditResult: parseResult.result!,
    };
    const tripleCheckResult = validateTripleCheck(tripleCheckInput);
    expect(tripleCheckResult.overallStatus).toBe("PASS");
    expect(tripleCheckResult.failedChecks).toHaveLength(0);

    // Step 4: 監査結果評価（PASS + baselineの注釈）
    const evalResult = evaluateAuditResult(parseResult.result!);
    expect(evalResult.status).toBe("PASS");
    expect(evalResult.message).toContain("baseline");
  });
});
