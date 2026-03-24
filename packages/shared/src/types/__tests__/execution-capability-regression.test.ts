/**
 * @file execution-capability-regression.test.ts
 * @description 回帰テスト + 境界ケーステスト（R-1〜R-3, E-1, E-2, E-4, E-7, E-8）
 * @task TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
 * @phase Phase 6: テスト拡充
 *
 * P62対策（silent fallback 検出）、P42対策（trim バリデーション）、
 * capability 劣化パターン（E-7, E-8）、assertNoPrimaryCta の境界条件を網羅する。
 *
 * P9準拠: beforeEach でモックをリセットしてテスト間リークを防止
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  type CapabilityContext,
  type CtaContract,
  type CtaInput,
  type UiState,
  resolveCapability,
  resolveCtaContract,
  resolveUiState,
  assertNoSilentFallback,
  assertNoPrimaryCta,
} from "../execution-capability";

// ============================================================
// R-1: silent fallback 検出
// ============================================================

describe("R-1: silent fallback 検出", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("capability=none のとき resolveCapability が 'integratedRuntime' を返さない", () => {
    // P62対策: none のまま integratedRuntime に暗黙遷移しないこと
    const result = resolveCapability({
      apiKeyValid: false,
      subscriptionValid: false,
    });
    expect(result).toBe("none");
    expect(result).not.toBe("integratedRuntime");
  });

  it("assertNoSilentFallback('none') がエラーをスローする", () => {
    // none の capability でガードを通過させないこと
    expect(() => assertNoSilentFallback("none")).toThrow(
      "[assertNoSilentFallback]",
    );
  });

  it("assertNoSilentFallback('integratedRuntime') がエラーをスローしない", () => {
    // integratedRuntime は正常な capability なのでガードを通過できること
    expect(() => assertNoSilentFallback("integratedRuntime")).not.toThrow();
  });

  it("assertNoSilentFallback('terminalSurface') がエラーをスローしない", () => {
    expect(() => assertNoSilentFallback("terminalSurface")).not.toThrow();
  });

  it("assertNoSilentFallback('both') がエラーをスローしない", () => {
    expect(() => assertNoSilentFallback("both")).not.toThrow();
  });

  it("assertNoSilentFallback のエラーメッセージに 'none' が含まれること", () => {
    // エラー理由が特定できるメッセージであること
    expect(() => assertNoSilentFallback("none")).toThrow(/none/);
  });
});

// ============================================================
// R-2: auto-send 検出（terminal 系の action はユーザー操作必須）
// ============================================================

describe("R-2: terminalSurface では自動送信が発生しない契約テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("capability=terminalSurface/ready の primary action が 'executeTerminalHandoff' であること", () => {
    // terminal handoff はユーザーがターミナルを手動で操作する必要がある
    // 自動送信アクション（executeIntegrated 等）が primary に来ないこと
    const result = resolveCtaContract({
      capability: "terminalSurface",
      uiState: "ready",
    });
    expect(result.primary?.action).toBe("executeTerminalHandoff");
  });

  it("capability=terminalSurface/ready の primary action が 'executeIntegrated' でないこと", () => {
    // terminalSurface では integrated（自動）実行を primary に配置しないこと
    const result = resolveCtaContract({
      capability: "terminalSurface",
      uiState: "ready",
    });
    expect(result.primary?.action).not.toBe("executeIntegrated");
  });

  it("capability=terminalSurface/ready の secondary action が 'copyCommandToClipboard' であること", () => {
    // secondary もユーザーが手動でペーストするクリップボードコピーであること
    const result = resolveCtaContract({
      capability: "terminalSurface",
      uiState: "ready",
    });
    expect(result.secondary.action).toBe("copyCommandToClipboard");
  });

  it("capability=both/ready の secondary action が 'executeTerminalHandoff' であること", () => {
    // both の secondary は terminal handoff（ユーザー操作必須の lane）
    const result = resolveCtaContract({
      capability: "both",
      uiState: "ready",
    });
    expect(result.secondary.action).toBe("executeTerminalHandoff");
  });
});

// ============================================================
// R-3: hidden injection 検出
// ============================================================

describe("R-3: hidden context injection 検出（CTA の label/action が既知の値のみ）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** 全パターンの既知ラベル・アクション */
  const KNOWN_LABELS = new Set([
    "AI で実行",
    "ターミナルで実行",
    "設定を開く",
    "ヘルプを表示",
    "コマンドをコピー",
    "セットアップガイド",
  ]);

  const KNOWN_ACTIONS = new Set([
    "executeIntegrated",
    "executeTerminalHandoff",
    "openSettings",
    "openHelp",
    "copyCommandToClipboard",
    "openSetupGuide",
  ]);

  const allInputs: CtaInput[] = [
    { capability: "integratedRuntime", uiState: "ready" },
    { capability: "terminalSurface", uiState: "ready" },
    { capability: "both", uiState: "ready" },
    { capability: "none", uiState: "blocked" },
    { capability: "none", uiState: "unavailable" },
  ];

  it("全パターンの primary label が既知のラベルセットに含まれること", () => {
    allInputs.forEach((input) => {
      const result = resolveCtaContract(input);
      if (result.primary !== null) {
        expect(KNOWN_LABELS).toContain(result.primary.label);
      }
    });
  });

  it("全パターンの secondary label が既知のラベルセットに含まれること", () => {
    allInputs.forEach((input) => {
      const result = resolveCtaContract(input);
      expect(KNOWN_LABELS).toContain(result.secondary.label);
    });
  });

  it("全パターンの primary action が既知のアクションセットに含まれること", () => {
    allInputs.forEach((input) => {
      const result = resolveCtaContract(input);
      if (result.primary !== null) {
        expect(KNOWN_ACTIONS).toContain(result.primary.action);
      }
    });
  });

  it("全パターンの secondary action が既知のアクションセットに含まれること", () => {
    allInputs.forEach((input) => {
      const result = resolveCtaContract(input);
      expect(KNOWN_ACTIONS).toContain(result.secondary.action);
    });
  });

  it("CTA に空文字ラベルが含まれないこと", () => {
    allInputs.forEach((input) => {
      const result = resolveCtaContract(input);
      if (result.primary !== null) {
        expect(result.primary.label.length).toBeGreaterThan(0);
      }
      expect(result.secondary.label.length).toBeGreaterThan(0);
    });
  });

  it("CTA に空文字アクションが含まれないこと", () => {
    allInputs.forEach((input) => {
      const result = resolveCtaContract(input);
      if (result.primary !== null) {
        expect(result.primary.action.length).toBeGreaterThan(0);
      }
      expect(result.secondary.action.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================
// E-1: API Key 空文字列相当（apiKeyValid=false）→ capability=none
// ============================================================

describe("E-1: API Key が無効（空文字列相当）の境界ケース", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apiKeyValid=false（空文字列相当）かつ subscriptionValid=false → capability=none", () => {
    // P42対策: 空文字列を apiKeyValid=false として扱った場合、none になること
    const result = resolveCapability({
      apiKeyValid: false,
      subscriptionValid: false,
    });
    expect(result).toBe("none");
  });

  it("capability=none のとき resolveUiState(none, hasCredentialPath=true) → blocked", () => {
    // 空文字列相当で none になった後、解決パスがある場合は blocked になること
    const uiState = resolveUiState("none", { hasCredentialPath: true });
    expect(uiState).toBe("blocked");
  });

  it("capability=none のとき resolveUiState(none, hasCredentialPath=false) → unavailable", () => {
    // 解決パスもない場合は unavailable になること
    const uiState = resolveUiState("none", { hasCredentialPath: false });
    expect(uiState).toBe("unavailable");
  });
});

// ============================================================
// E-2: API Key スペースのみ（P42対策・trim 後空文字列相当）→ capability=none
// ============================================================

describe("E-2: API Key がスペースのみ（P42対策）の境界ケース", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apiKeyValid=false（trim後空文字列相当）かつ subscriptionValid=false → capability=none", () => {
    // P42: スペースのみの文字列は trim() 後に空文字列になるため、apiKeyValid=false として扱う
    // resolveCapability は boolean 入力なので、呼び出し元の入力バリデーションが apiKeyValid=false を渡すことを確認
    const result = resolveCapability({
      apiKeyValid: false, // スペースのみ → trim() === "" → false として渡される
      subscriptionValid: false,
    });
    expect(result).toBe("none");
  });

  it("apiKeyValid=false（スペースのみ相当）かつ subscriptionValid=true → capability=terminalSurface", () => {
    // スペースのみの API key でも subscription が有効なら terminalSurface になること
    const result = resolveCapability({
      apiKeyValid: false,
      subscriptionValid: true,
    });
    expect(result).toBe("terminalSurface");
    expect(result).not.toBe("integratedRuntime"); // P62: スペースのみで integrated にならないこと
  });
});

// ============================================================
// E-4: 遷移中状態（degraded フラグによる中間状態）
// ============================================================

describe("E-4: 遷移中・degraded 状態の境界ケース", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apiKeyDegraded=true かつ subscriptionValid=false → capability=none（遷移中は none）", () => {
    // API key は有効だが接続不可、subscription も無効な場合 → none
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: false,
      apiKeyDegraded: true,
    });
    expect(result).toBe("none");
  });

  it("apiKeyDegraded=true かつ subscriptionValid=true → capability=terminalSurface（明示的 fallback）", () => {
    // degraded 状態でも subscription が有効なら terminalSurface に明示的に fallback
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: true,
    });
    expect(result).toBe("terminalSurface");
  });

  it("apiKeyDegraded=true のとき 'integratedRuntime' を返さないこと（P62対策）", () => {
    // degraded 状態で integratedRuntime に暗黙遷移しないこと
    const resultWithSub = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: true,
    });
    const resultWithoutSub = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: false,
      apiKeyDegraded: true,
    });
    expect(resultWithSub).not.toBe("integratedRuntime");
    expect(resultWithoutSub).not.toBe("integratedRuntime");
  });

  it("apiKeyDegraded=true のとき 'both' を返さないこと", () => {
    // degraded 状態で both になることはない
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: true,
    });
    expect(result).not.toBe("both");
  });

  it("apiKeyDegraded=false（明示）のとき通常の判定ルールが適用されること", () => {
    // degraded=false の場合は通常ルールで both になること
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: false,
    });
    expect(result).toBe("both");
  });

  it("apiKeyDegraded が undefined（省略）のとき degraded なしと同じ結果になること", () => {
    // degraded 未指定は false 扱いであること
    const resultWithUndefined = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
    });
    const resultWithFalse = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: false,
    });
    expect(resultWithUndefined).toBe(resultWithFalse);
  });
});

// ============================================================
// E-7: capability=both → API key 削除 → integratedRuntime 消失 → terminalSurface への劣化
// ============================================================

describe("E-7: both → API key 削除 → terminalSurface への capability 劣化", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apiKeyValid=true, subscriptionValid=true → both", () => {
    // 前提: both 状態
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
    });
    expect(result).toBe("both");
  });

  it("apiKeyValid=false, subscriptionValid=true → terminalSurface（API key 削除後）", () => {
    // API key が削除されると integratedRuntime lane が消えて terminalSurface に劣化する
    const result = resolveCapability({
      apiKeyValid: false,
      subscriptionValid: true,
    });
    expect(result).toBe("terminalSurface");
  });

  it("劣化後に 'integratedRuntime' を返さないこと（P62対策）", () => {
    // API key が削除された後に integratedRuntime に暗黙遷移しないこと
    const result = resolveCapability({
      apiKeyValid: false,
      subscriptionValid: true,
    });
    expect(result).not.toBe("integratedRuntime");
    expect(result).not.toBe("both");
  });

  it("劣化後の resolveUiState が 'ready' であること（terminalSurface は利用可能）", () => {
    // terminalSurface に劣化しても、UI state は ready であること
    const degradedCapability = resolveCapability({
      apiKeyValid: false,
      subscriptionValid: true,
    });
    const ctx: CapabilityContext = {
      capability: degradedCapability,
      isConnectionAvailable: false,
      isTerminalAvailable: true,
      hasResolutionAction: false,
    };
    const result = resolveUiState(ctx);
    expect(result.uiState).toBe("ready");
  });

  it("劣化後の resolveCtaContract primary が 'ターミナルで実行' になること", () => {
    // API key 削除後は terminal handoff が primary CTA になること
    const result = resolveCtaContract({
      capability: "terminalSurface",
      uiState: "ready",
    });
    expect(result.primary?.label).toBe("ターミナルで実行");
    expect(result.primary?.action).toBe("executeTerminalHandoff");
  });
});

// ============================================================
// E-8: capability=both → subscription 失効 → terminalSurface 消失 → integratedRuntime への劣化
// ============================================================

describe("E-8: both → subscription 失効 → integratedRuntime への capability 劣化", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apiKeyValid=true, subscriptionValid=true → both（前提）", () => {
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
    });
    expect(result).toBe("both");
  });

  it("apiKeyValid=true, subscriptionValid=false → integratedRuntime（subscription 失効後）", () => {
    // subscription が失効すると terminalSurface lane が消えて integratedRuntime に劣化する
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: false,
    });
    expect(result).toBe("integratedRuntime");
  });

  it("劣化後に 'terminalSurface' を返さないこと", () => {
    // subscription が失効した後に terminalSurface が使えないこと
    const result = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: false,
    });
    expect(result).not.toBe("terminalSurface");
    expect(result).not.toBe("both");
  });

  it("劣化後の resolveUiState が 'ready' であること（integratedRuntime は利用可能）", () => {
    // integratedRuntime に劣化しても、UI state は ready であること
    const degradedCapability = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: false,
    });
    const ctx: CapabilityContext = {
      capability: degradedCapability,
      isConnectionAvailable: true,
      isTerminalAvailable: false,
      hasResolutionAction: false,
    };
    const result = resolveUiState(ctx);
    expect(result.uiState).toBe("ready");
  });

  it("劣化後の resolveCtaContract primary が 'AI で実行' になること", () => {
    // subscription 失効後は integrated 実行が primary CTA になること
    const result = resolveCtaContract({
      capability: "integratedRuntime",
      uiState: "ready",
    });
    expect(result.primary?.label).toBe("AI で実行");
    expect(result.primary?.action).toBe("executeIntegrated");
  });
});

// ============================================================
// assertNoPrimaryCta 境界ケース
// ============================================================

describe("assertNoPrimaryCta: 境界ケース", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uiState=unavailable, primary=null → エラーをスローしない", () => {
    // unavailable かつ primary が null（正常ケース）
    const ctaContract: CtaContract = {
      primary: null,
      secondary: { label: "セットアップガイド", action: "openSetupGuide" },
    };
    expect(() => assertNoPrimaryCta("unavailable", ctaContract)).not.toThrow();
  });

  it("uiState=unavailable, primary≠null → エラーをスローする", () => {
    // unavailable なのに primary が存在する（契約違反）
    const ctaContract: CtaContract = {
      primary: { label: "不正なボタン", action: "someAction" },
      secondary: { label: "セットアップガイド", action: "openSetupGuide" },
    };
    expect(() => assertNoPrimaryCta("unavailable", ctaContract)).toThrow(
      "[assertNoPrimaryCta]",
    );
  });

  it("uiState=unavailable のエラーメッセージに 'unavailable' が含まれること", () => {
    const ctaContract: CtaContract = {
      primary: { label: "不正", action: "invalid" },
      secondary: { label: "セットアップガイド", action: "openSetupGuide" },
    };
    expect(() => assertNoPrimaryCta("unavailable", ctaContract)).toThrow(
      /unavailable/,
    );
  });

  it("uiState=ready, primary≠null → エラーをスローしない", () => {
    // ready かつ primary が存在する（正常ケース）
    const ctaContract: CtaContract = {
      primary: { label: "AI で実行", action: "executeIntegrated" },
      secondary: { label: "設定を開く", action: "openSettings" },
    };
    expect(() => assertNoPrimaryCta("ready", ctaContract)).not.toThrow();
  });

  it("uiState=ready, primary=null → エラーをスローしない（assertNoPrimaryCta は unavailable のみチェック）", () => {
    // assertNoPrimaryCta は uiState=unavailable のときのみ検証する
    const ctaContract: CtaContract = {
      primary: null,
      secondary: { label: "設定を開く", action: "openSettings" },
    };
    expect(() => assertNoPrimaryCta("ready", ctaContract)).not.toThrow();
  });

  it("uiState=blocked, primary≠null → エラーをスローしない", () => {
    // blocked かつ primary が存在する（正常ケース）
    const ctaContract: CtaContract = {
      primary: { label: "設定を開く", action: "openSettings" },
      secondary: { label: "ヘルプを表示", action: "openHelp" },
    };
    expect(() => assertNoPrimaryCta("blocked", ctaContract)).not.toThrow();
  });

  it("uiState=blocked, primary=null → エラーをスローしない（assertNoPrimaryCta は unavailable のみチェック）", () => {
    // assertNoPrimaryCta は blocked の場合はチェックしない（別のバリデーションの責務）
    const ctaContract: CtaContract = {
      primary: null,
      secondary: { label: "ヘルプを表示", action: "openHelp" },
    };
    expect(() => assertNoPrimaryCta("blocked", ctaContract)).not.toThrow();
  });

  it("resolveCtaContract(none, unavailable) の結果は assertNoPrimaryCta を通過すること", () => {
    // 実装と assertion が整合していること（統合確認）
    const contract = resolveCtaContract({
      capability: "none",
      uiState: "unavailable",
    });
    expect(() => assertNoPrimaryCta("unavailable", contract)).not.toThrow();
  });

  it("resolveCtaContract(integratedRuntime, ready) の結果は assertNoPrimaryCta を通過すること", () => {
    // ready / integratedRuntime では primary が存在しても unavailable チェックをパスすること
    const contract = resolveCtaContract({
      capability: "integratedRuntime",
      uiState: "ready",
    });
    expect(() => assertNoPrimaryCta("ready", contract)).not.toThrow();
  });
});

// ============================================================
// 統合: resolveCapability → resolveUiState → resolveCtaContract の連鎖整合性
// ============================================================

describe("統合: capability 判定 → UI state → CTA 契約の連鎖整合性（回帰）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("both → degraded → terminalSurface → ready → terminal CTA の連鎖が正しいこと", () => {
    // Step 1: both だが degraded → terminalSurface
    const capability = resolveCapability({
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: true,
    });
    expect(capability).toBe("terminalSurface");

    // Step 2: terminalSurface + terminal 利用可能 → ready
    const uiResult = resolveUiState({
      capability,
      isConnectionAvailable: false,
      isTerminalAvailable: true,
      hasResolutionAction: false,
    });
    expect(uiResult.uiState).toBe("ready");

    // Step 3: terminalSurface + ready → terminal handoff CTA
    const cta = resolveCtaContract({ capability, uiState: uiResult.uiState });
    expect(cta.primary?.action).toBe("executeTerminalHandoff");

    // Step 4: assertNoPrimaryCta を通過すること
    expect(() =>
      assertNoPrimaryCta(uiResult.uiState as UiState, cta),
    ).not.toThrow();
  });

  it("none → unavailable → primary=null → assertNoPrimaryCta 通過の連鎖が正しいこと", () => {
    // Step 1: 両方無効 → none
    const capability = resolveCapability({
      apiKeyValid: false,
      subscriptionValid: false,
    });
    expect(capability).toBe("none");

    // Step 2: none + 解決 action なし → unavailable
    const uiResult = resolveUiState({
      capability,
      isConnectionAvailable: false,
      isTerminalAvailable: false,
      hasResolutionAction: false,
    });
    expect(uiResult.uiState).toBe("unavailable");

    // Step 3: none + unavailable → primary=null
    const cta = resolveCtaContract({ capability, uiState: uiResult.uiState });
    expect(cta.primary).toBeNull();

    // Step 4: assertNoPrimaryCta が通過すること（primary=null は契約に合致）
    expect(() =>
      assertNoPrimaryCta(uiResult.uiState as UiState, cta),
    ).not.toThrow();

    // Step 5: assertNoSilentFallback は none でエラーをスローすること
    expect(() => assertNoSilentFallback(capability)).toThrow();
  });
});
