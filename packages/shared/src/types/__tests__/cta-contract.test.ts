/**
 * @file cta-contract.test.ts
 * @description Concern C: CTA 表示契約テスト（CC-1 〜 CC-5）
 * @task TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
 * @phase Phase 4: テスト作成（TDD RED）
 *
 * contract-matrix.md の Concern C に基づき、
 * CTA の表示ラベルと DOM 存在条件を検証する。
 *
 * ownership: CTA の表示・非表示は capability x state の組み合わせだけで決定する。
 *
 * | capability / uiState          | primary CTA         | secondary CTA        | primary DOM |
 * | ----------------------------- | ------------------- | -------------------- | ----------- |
 * | integratedRuntime / ready     | "AI で実行"         | "設定を開く"         | あり        |
 * | terminalSurface / ready       | "ターミナルで実行"  | "コマンドをコピー"   | あり        |
 * | both / ready                  | "AI で実行"         | "ターミナルで実行"   | あり        |
 * | none / blocked                | "設定を開く"        | "ヘルプを表示"       | あり        |
 * | none / unavailable            | （非表示）          | "セットアップガイド" | なし        |
 *
 * P9準拠: beforeEach でモックをリセットしてテスト間リークを防止
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { type CtaInput, resolveCtaContract } from "../execution-capability";

// ============================================================
// テストフィクスチャ
// ============================================================

/**
 * CC-1: ready / integratedRuntime
 * API key が有効で即時実行可能な状態
 */
const ctaInputIntegratedReady: CtaInput = {
  capability: "integratedRuntime",
  uiState: "ready",
};

/**
 * CC-2: ready / terminalSurface
 * subscription のみ有効で terminal handoff が利用可能な状態
 */
const ctaInputTerminalReady: CtaInput = {
  capability: "terminalSurface",
  uiState: "ready",
};

/**
 * CC-3: ready / both
 * 両方の lane が利用可能な状態
 */
const ctaInputBothReady: CtaInput = {
  capability: "both",
  uiState: "ready",
};

/**
 * CC-4: blocked / none
 * 両方の lane が無効で、設定画面で復旧可能な状態
 */
const ctaInputNoneBlocked: CtaInput = {
  capability: "none",
  uiState: "blocked",
  blockedAction: {
    label: "設定を開く",
    targetRoute: "/settings/api-key",
  },
};

/**
 * CC-5: unavailable / none
 * 両方の lane が無効で、解決方法がない状態
 */
const ctaInputNoneUnavailable: CtaInput = {
  capability: "none",
  uiState: "unavailable",
};

// ============================================================
// Concern C テスト
// ============================================================

describe("Concern C: resolveCtaContract - CTA 表示契約", () => {
  // P9準拠: テスト間状態リーク防止
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------
  // CC-1: ready / integratedRuntime
  // ----------------------------------------------------------
  describe("CC-1: ready / integratedRuntime", () => {
    it("primary CTA ラベルが 'AI で実行' であること", () => {
      // integratedRuntime では in-app AI 実行を促すラベルが必須
      const result = resolveCtaContract(ctaInputIntegratedReady);
      expect(result.primary?.label).toBe("AI で実行");
    });

    it("secondary CTA ラベルが '設定を開く' であること", () => {
      // secondary は settings 画面遷移（integratedRuntime に固有）
      const result = resolveCtaContract(ctaInputIntegratedReady);
      expect(result.secondary?.label).toBe("設定を開く");
    });

    it("primary CTA が DOM に存在すること（primary は null でない）", () => {
      const result = resolveCtaContract(ctaInputIntegratedReady);
      expect(result.primary).not.toBeNull();
      expect(result.primary).toBeDefined();
    });

    it("primary CTA が 'ターミナルで実行' でないこと（no-op 禁止）", () => {
      // integratedRuntime では terminal ラベルを使わないこと
      const result = resolveCtaContract(ctaInputIntegratedReady);
      expect(result.primary?.label).not.toBe("ターミナルで実行");
    });
  });

  // ----------------------------------------------------------
  // CC-2: ready / terminalSurface
  // ----------------------------------------------------------
  describe("CC-2: ready / terminalSurface", () => {
    it("primary CTA ラベルが 'ターミナルで実行' であること", () => {
      // terminalSurface では terminal surface を開く CTA が必須
      const result = resolveCtaContract(ctaInputTerminalReady);
      expect(result.primary?.label).toBe("ターミナルで実行");
    });

    it("secondary CTA ラベルが 'コマンドをコピー' であること", () => {
      // secondary はクリップボードへのコピー（terminalSurface に固有）
      const result = resolveCtaContract(ctaInputTerminalReady);
      expect(result.secondary?.label).toBe("コマンドをコピー");
    });

    it("primary CTA が DOM に存在すること", () => {
      const result = resolveCtaContract(ctaInputTerminalReady);
      expect(result.primary).not.toBeNull();
      expect(result.primary).toBeDefined();
    });

    it("primary CTA が 'AI で実行' でないこと（terminalSurface では integrated を使わない）", () => {
      const result = resolveCtaContract(ctaInputTerminalReady);
      expect(result.primary?.label).not.toBe("AI で実行");
    });
  });

  // ----------------------------------------------------------
  // CC-3: ready / both
  // ----------------------------------------------------------
  describe("CC-3: ready / both", () => {
    it("primary CTA ラベルが 'AI で実行' であること（integratedRuntime 優先）", () => {
      // both では integratedRuntime が primary lane
      // より便利な in-app 実行を推奨する
      const result = resolveCtaContract(ctaInputBothReady);
      expect(result.primary?.label).toBe("AI で実行");
    });

    it("secondary CTA ラベルが 'ターミナルで実行' であること", () => {
      // secondary は terminalSurface への代替 lane
      const result = resolveCtaContract(ctaInputBothReady);
      expect(result.secondary?.label).toBe("ターミナルで実行");
    });

    it("primary CTA が DOM に存在すること", () => {
      const result = resolveCtaContract(ctaInputBothReady);
      expect(result.primary).not.toBeNull();
      expect(result.primary).toBeDefined();
    });

    it("primary が 'ターミナルで実行' でないこと（優先順は integratedRuntime）", () => {
      // both では terminal が primary にならないこと
      const result = resolveCtaContract(ctaInputBothReady);
      expect(result.primary?.label).not.toBe("ターミナルで実行");
    });
  });

  // ----------------------------------------------------------
  // CC-4: blocked / none
  // ----------------------------------------------------------
  describe("CC-4: blocked / none", () => {
    it("primary CTA ラベルが '設定を開く' であること（blockedAction.label に準拠）", () => {
      // blocked 状態では blockedAction の label を primary CTA に使用する
      const result = resolveCtaContract(ctaInputNoneBlocked);
      expect(result.primary?.label).toBe("設定を開く");
    });

    it("secondary CTA ラベルが 'ヘルプを表示' であること", () => {
      // secondary は help / troubleshooting（blocked 全セル共通）
      const result = resolveCtaContract(ctaInputNoneBlocked);
      expect(result.secondary?.label).toBe("ヘルプを表示");
    });

    it("primary CTA が DOM に存在すること（blocked では primary が必須）", () => {
      // blocked 状態では primary CTA を DOM に含めること（disabled ではなく有効）
      const result = resolveCtaContract(ctaInputNoneBlocked);
      expect(result.primary).not.toBeNull();
      expect(result.primary).toBeDefined();
    });

    it("primary CTA が no-op でないこと（action が設定されていること）", () => {
      // action が undefined や空でないこと
      const result = resolveCtaContract(ctaInputNoneBlocked);
      expect(result.primary?.action).toBeDefined();
      expect(result.primary?.action).not.toBeNull();
    });
  });

  // ----------------------------------------------------------
  // CC-5: unavailable / none
  // ----------------------------------------------------------
  describe("CC-5: unavailable / none", () => {
    it("primary CTA が null であること（DOM に含めない）", () => {
      // unavailable 状態では primary CTA を DOM に含めない
      // disabled 属性付きの CTA ではなく、完全に非表示（null）
      const result = resolveCtaContract(ctaInputNoneUnavailable);
      expect(result.primary).toBeNull();
    });

    it("secondary CTA ラベルが 'セットアップガイド' であること", () => {
      // unavailable では setup / install 案内を secondary CTA に表示する
      const result = resolveCtaContract(ctaInputNoneUnavailable);
      expect(result.secondary?.label).toBe("セットアップガイド");
    });

    it("secondary CTA が DOM に存在すること", () => {
      // secondary は存在する（ユーザーへの案内を提供）
      const result = resolveCtaContract(ctaInputNoneUnavailable);
      expect(result.secondary).not.toBeNull();
      expect(result.secondary).toBeDefined();
    });

    it("primary CTA が disabled 属性付きで存在しないこと（null であること）", () => {
      // contract-matrix の禁止条件: disabled CTA を DOM に含めない
      // primary が null（非存在）であることを確認し、
      // disabled 属性付きで存在しないことを型で保証する
      const result = resolveCtaContract(ctaInputNoneUnavailable);
      expect(result.primary).toBeNull();
      // disabled フラグが true の primary が存在しないことを確認
      if (result.primary !== null) {
        // primary が null でない場合はテスト失敗（このブランチに入らないことが正解）
        expect(result.primary).toBeNull();
      }
    });
  });

  // ----------------------------------------------------------
  // 型安全性テスト: CtaContract の形状
  // ----------------------------------------------------------
  describe("型テスト: CtaContract の形状", () => {
    it("resolveCtaContract が CtaContract 形状のオブジェクトを返すこと", () => {
      // primary / secondary フィールドが存在すること
      const result = resolveCtaContract(ctaInputIntegratedReady);
      expect(result).toHaveProperty("primary");
      expect(result).toHaveProperty("secondary");
    });

    it("primary が存在する場合、label と action を持つこと", () => {
      const result = resolveCtaContract(ctaInputIntegratedReady);
      if (result.primary !== null) {
        expect(result.primary).toHaveProperty("label");
        expect(result.primary).toHaveProperty("action");
        expect(typeof result.primary.label).toBe("string");
      }
    });

    it("secondary が存在する場合、label と action を持つこと", () => {
      const result = resolveCtaContract(ctaInputTerminalReady);
      if (result.secondary !== null && result.secondary !== undefined) {
        expect(result.secondary).toHaveProperty("label");
        expect(result.secondary).toHaveProperty("action");
        expect(typeof result.secondary.label).toBe("string");
      }
    });

    it("全ての入力パターンで primary が null または有効なオブジェクトであること", () => {
      const inputs: CtaInput[] = [
        ctaInputIntegratedReady,
        ctaInputTerminalReady,
        ctaInputBothReady,
        ctaInputNoneBlocked,
        ctaInputNoneUnavailable,
      ];

      inputs.forEach((input) => {
        const result = resolveCtaContract(input);
        // primary は null（非表示）か、label/action を持つオブジェクトのどちらかであること
        if (result.primary !== null) {
          expect(result.primary).toBeDefined();
          expect(typeof result.primary?.label).toBe("string");
        }
      });
    });
  });
});
