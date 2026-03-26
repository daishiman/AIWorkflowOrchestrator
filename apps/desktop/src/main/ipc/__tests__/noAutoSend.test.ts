/**
 * No Auto-Send テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: NAS-01〜NAS-06
 *
 * transcript/session結果/エラーログの自動送信チャネルが存在しないことを検証する。
 */

import { describe, it, expect } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../../../preload/channels";

/** 全 allowed channels を結合した配列 */
const ALL_ALLOWED = [
  ...ALLOWED_INVOKE_CHANNELS,
  ...ALLOWED_ON_CHANNELS,
] as string[];

/** IPC_CHANNELS の全値を配列化 */
const ALL_CHANNEL_VALUES = Object.values(IPC_CHANNELS) as string[];

describe("No Auto-Send (NAS)", () => {
  // NAS-01: transcript 自動送信 IPC チャネルが存在しない
  it("NAS-01: no transcript auto-send channel in ALLOWED_INVOKE_CHANNELS", () => {
    const autoSendPatterns = [
      "transcript:send",
      "transcript:auto-send",
      "transcript:upload",
      "session:auto-report",
      "telemetry:send",
    ];

    for (const pattern of autoSendPatterns) {
      expect(ALL_ALLOWED).not.toContain(pattern);
      expect(ALL_CHANNEL_VALUES).not.toContain(pattern);
    }
  });

  // NAS-02: session 結果の自動報告 IPC チャネルが存在しない
  it("NAS-02: no session result auto-report channel", () => {
    const autoReportPatterns = [
      "session:auto-report",
      "session:report-result",
      "execution:auto-report",
      "result:auto-send",
    ];

    for (const pattern of autoReportPatterns) {
      expect(ALL_ALLOWED).not.toContain(pattern);
      expect(ALL_CHANNEL_VALUES).not.toContain(pattern);
    }
  });

  // NAS-03: エラーログ自動送信 IPC チャネルが存在しない
  it("NAS-03: no error log auto-send channel", () => {
    const errorAutoSendPatterns = [
      "error:auto-send",
      "error:report",
      "crash:report",
      "log:auto-send",
    ];

    for (const pattern of errorAutoSendPatterns) {
      expect(ALL_ALLOWED).not.toContain(pattern);
      expect(ALL_CHANNEL_VALUES).not.toContain(pattern);
    }
  });

  // NAS-04: approval token なしの LLM API 呼び出しが阻止される
  // (ApprovalGate integration は approvalGate.test.ts でカバー。
  //  ここでは IPC channel 観点で「自動実行用チャネル」がないことを検証)
  it("NAS-04: no unapproved LLM auto-execute channel", () => {
    const autoExecPatterns = [
      "llm:auto-execute",
      "ai:auto-execute",
      "execution:auto-start",
    ];

    for (const pattern of autoExecPatterns) {
      expect(ALL_ALLOWED).not.toContain(pattern);
      expect(ALL_CHANNEL_VALUES).not.toContain(pattern);
    }
  });

  // NAS-05: Manual Share Rail は 3 ステップ必要（channel 構造の検証）
  // 自動共有チャネルが存在せず、明示的な操作チャネルのみであることを確認
  it("NAS-05: no single-step auto-share channel exists", () => {
    const autoSharePatterns = [
      "transcript:auto-share",
      "session:auto-share",
      "share:auto",
    ];

    for (const pattern of autoSharePatterns) {
      expect(ALL_ALLOWED).not.toContain(pattern);
      expect(ALL_CHANNEL_VALUES).not.toContain(pattern);
    }
  });

  // NAS-06: hidden parsing エンドポイントが存在しない
  it("NAS-06: no hidden parsing endpoint exists", () => {
    const hiddenParsingPatterns = [
      "parse:hidden",
      "data:parse",
      "analysis:auto",
      "extract:auto",
      "scrape:auto",
    ];

    for (const pattern of hiddenParsingPatterns) {
      expect(ALL_ALLOWED).not.toContain(pattern);
      expect(ALL_CHANNEL_VALUES).not.toContain(pattern);
    }

    // 追加: 既知チャネルに非明示のデータ解析パターンが含まれていないことを検証
    const suspiciousChannels = ALL_CHANNEL_VALUES.filter(
      (ch) =>
        ch.includes("parse") && !ch.includes("agent") && !ch.includes("skill"),
    );
    expect(suspiciousChannels).toEqual([]);
  });
});
