/**
 * useMainlineExecutionAccess Hook Tests
 *
 * UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
 * Phase 4: TDD Red - TC-01〜TC-05 (実装前は FAIL)
 * Phase 6: Edge case tests 追加
 *
 * テスト戦略: resolveHealthPolicy を直接 spy せず、
 * buildMainlineExecutionAccessState への引数（healthPolicy）を通じて統合的に検証する。
 * この理由: Vitest forks+isolate 環境では @repo/shared/types の
 * vi.mock がプロダクションコードのインスタンスを intercept できないため。
 */
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// vi.mock は Vitest により import より先に hoisting される
vi.mock("../../features/mainline-access/mainlineAccess", () => ({
  buildMainlineExecutionAccessState: vi.fn(),
}));

vi.mock("../../store", () => ({
  useIsAuthenticated: vi.fn(),
  useValidateAuthMode: vi.fn(),
  useFetchProviders: vi.fn(),
  useSelectedProviderId: vi.fn(),
  useSelectedLLMProvider: vi.fn(),
  useSelectedLLMModel: vi.fn(),
  useLLMHealthStatus: vi.fn(),
  useCheckLLMHealth: vi.fn(),
}));

import { buildMainlineExecutionAccessState } from "../../features/mainline-access/mainlineAccess";
import {
  useCheckLLMHealth,
  useFetchProviders,
  useIsAuthenticated,
  useLLMHealthStatus,
  useSelectedLLMModel,
  useSelectedLLMProvider,
  useSelectedProviderId,
  useValidateAuthMode,
} from "../../store";
import { useMainlineExecutionAccess } from "../useMainlineExecutionAccess";

/** resolveHealthPolicy の実際の返り値: lastHealthCheck === null → unknown */
const expectedDefaultHealthPolicy = {
  isConnectionAvailable: false,
  isDegraded: false,
  isRateLimited: false,
  healthStatus: "unknown" as const,
  lastCheckedAt: null,
};

const CHECKED_AT = new Date("2026-04-08T00:00:00Z");

/** resolveHealthPolicy の実際の返り値: connectionStatus === "disconnected" + lastHealthCheck あり → unhealthy */
const expectedDisconnectedHealthPolicy = {
  isConnectionAvailable: false,
  isDegraded: false,
  isRateLimited: false,
  healthStatus: "unhealthy" as const,
  lastCheckedAt: CHECKED_AT,
};

/** resolveHealthPolicy の実際の返り値: connectionStatus === "connected" → healthy */
const expectedConnectedHealthPolicy = {
  isConnectionAvailable: true,
  isDegraded: false,
  isRateLimited: false,
  healthStatus: "healthy" as const,
  lastCheckedAt: CHECKED_AT,
};

beforeEach(() => {
  vi.clearAllMocks();

  // ストアフックのデフォルトモック
  vi.mocked(useIsAuthenticated).mockReturnValue(false);
  vi.mocked(useFetchProviders).mockReturnValue(
    vi.fn().mockResolvedValue(undefined),
  );
  vi.mocked(useValidateAuthMode).mockReturnValue(
    vi.fn().mockResolvedValue({ hasCredentials: false }),
  );
  vi.mocked(useCheckLLMHealth).mockReturnValue(
    vi.fn().mockResolvedValue(undefined),
  );
  vi.mocked(useSelectedProviderId).mockReturnValue(null);
  vi.mocked(useSelectedLLMProvider).mockReturnValue(undefined);
  vi.mocked(useSelectedLLMModel).mockReturnValue(undefined);
  vi.mocked(useLLMHealthStatus).mockReturnValue({} as never);

  vi.mocked(buildMainlineExecutionAccessState).mockReturnValue({} as never);
});

async function renderAccessHook(): Promise<void> {
  await act(async () => {
    renderHook(() => useMainlineExecutionAccess());
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

// ====================================================================
// TC-01〜TC-05: resolveHealthPolicy 統合テスト（Phase 4 TDD Red）
// buildMainlineExecutionAccessState への healthPolicy 引数を通じて検証
// ====================================================================
describe("resolveHealthPolicy の統合", () => {
  it("TC-01: フックレンダリング時に buildMainlineExecutionAccessState に healthPolicy が渡されること", async () => {
    await renderAccessHook();

    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining({
          healthStatus: expect.any(String),
          isConnectionAvailable: expect.any(Boolean),
        }),
      }),
    );
  });

  it("TC-02: buildMainlineExecutionAccessState に healthPolicy が渡されること", async () => {
    // デフォルト状態（プロバイダー未選択 = lastHealthCheck: null）では
    // resolveHealthPolicy → { healthStatus: "unknown", isConnectionAvailable: false }
    await renderAccessHook();

    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining(expectedDefaultHealthPolicy),
      }),
    );
  });

  it("TC-03: disconnected 状態の判定が resolveHealthPolicy 経由であること（apiKeyDegraded 独自ロジックが除去されていること）", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue("anthropic" as never);
    vi.mocked(useLLMHealthStatus).mockReturnValue({
      anthropic: {
        status: "disconnected" as const,
        providerId: "anthropic",
        checkedAt: CHECKED_AT,
      },
    } as never);

    await renderAccessHook();

    // resolveHealthPolicy が disconnected + lastHealthCheck あり → unhealthy を返す
    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining({
          healthStatus: "unhealthy",
          isConnectionAvailable: false,
        }),
      }),
    );
    // apiKeyDegraded が buildMainlineExecutionAccessState に渡されていないこと（FR-03）
    const callArg = vi.mocked(buildMainlineExecutionAccessState).mock
      .calls[0][0];
    expect(callArg).not.toHaveProperty("apiKeyDegraded");
  });

  it("TC-04: connected 状態で healthPolicy.isConnectionAvailable が true になること", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue("anthropic" as never);
    vi.mocked(useLLMHealthStatus).mockReturnValue({
      anthropic: {
        status: "connected" as const,
        providerId: "anthropic",
        checkedAt: CHECKED_AT,
      },
    } as never);

    await renderAccessHook();

    // resolveHealthPolicy が connected → healthy を返す
    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining({
          healthStatus: "healthy",
          isConnectionAvailable: true,
        }),
      }),
    );
  });

  it("TC-05: disconnected 状態で buildMainlineExecutionAccessState に healthPolicy が渡されること", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue("anthropic" as never);
    vi.mocked(useLLMHealthStatus).mockReturnValue({
      anthropic: {
        status: "disconnected" as const,
        providerId: "anthropic",
        checkedAt: CHECKED_AT,
      },
    } as never);

    await renderAccessHook();

    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining(expectedDisconnectedHealthPolicy),
      }),
    );
  });
});

// ====================================================================
// Phase 6: Edge case - selectedHealthStatus が undefined の場合
// ====================================================================
describe("selectedHealthStatus が undefined の場合（プロバイダー未選択時）", () => {
  it("TC-6-1-1: プロバイダー未選択時は healthPolicy.healthStatus が unknown になること", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue(null);
    vi.mocked(useLLMHealthStatus).mockReturnValue({} as never);

    await renderAccessHook();

    // lastHealthCheck: null → resolveHealthPolicy → { healthStatus: "unknown" }
    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining({
          healthStatus: "unknown",
          isConnectionAvailable: false,
          lastCheckedAt: null,
        }),
      }),
    );
  });

  it("TC-6-1-2: プロバイダーIDが存在するが healthStatus がない場合も unknown になること", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue("anthropic" as never);
    vi.mocked(useLLMHealthStatus).mockReturnValue({} as never);

    await renderAccessHook();

    // selectedHealthStatus: undefined → lastHealthCheck: null → healthStatus: "unknown"
    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining({
          healthStatus: "unknown",
          isConnectionAvailable: false,
          lastCheckedAt: null,
        }),
      }),
    );
  });
});

// ====================================================================
// Phase 6: 各 connectionStatus パターンのテスト
// ====================================================================
describe("各 connectionStatus パターンのテスト", () => {
  it("TC-6-3-1: connected 状態で healthPolicy.healthStatus が healthy になること", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue("anthropic" as never);
    vi.mocked(useLLMHealthStatus).mockReturnValue({
      anthropic: {
        status: "connected" as const,
        providerId: "anthropic",
        checkedAt: CHECKED_AT,
      },
    } as never);

    await renderAccessHook();

    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining(expectedConnectedHealthPolicy),
      }),
    );
  });

  it("TC-6-3-2: disconnected 状態で healthPolicy.healthStatus が unhealthy になること", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue("anthropic" as never);
    vi.mocked(useLLMHealthStatus).mockReturnValue({
      anthropic: {
        status: "disconnected" as const,
        providerId: "anthropic",
        checkedAt: CHECKED_AT,
      },
    } as never);

    await renderAccessHook();

    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining({
          healthStatus: "unhealthy",
          isConnectionAvailable: false,
        }),
      }),
    );
  });

  it("TC-6-3-3: error 状態で healthPolicy.healthStatus が unhealthy になること", async () => {
    vi.mocked(useSelectedProviderId).mockReturnValue("anthropic" as never);
    vi.mocked(useLLMHealthStatus).mockReturnValue({
      anthropic: {
        status: "error" as const,
        providerId: "anthropic",
        checkedAt: CHECKED_AT,
        errorMessage: "Connection error",
      },
    } as never);

    await renderAccessHook();

    expect(buildMainlineExecutionAccessState).toHaveBeenCalledWith(
      expect.objectContaining({
        healthPolicy: expect.objectContaining({
          healthStatus: "unhealthy",
          isConnectionAvailable: false,
        }),
      }),
    );
  });
});

// ====================================================================
// Phase 6: 将来対応 / 未実装（TODO）
// ====================================================================
// TODO(UT-HEALTH-POLICY-MAINLINE-MIGRATION-001):
// isRateLimited が true の場合、resolveHealthPolicy() が
// DEGRADED または BLOCKED を返すよう将来拡張予定。
// 設計確定後に以下テストを有効化すること。
//
// describe("将来対応 / 未実装", () => {
//   it.todo('isRateLimited=true のとき healthPolicy が DEGRADED になること');
// });
