/**
 * ExecutionConsoleView - 実行コンソール統合ビュー
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * Layer 1 (Primary Surface) + Layer 2 (Safety Surface) + Layer 3 (Detail Surface) を統合。
 * Session State Machine に基づいて各コンポーネントの表示/非表示を制御する。
 */

import React, { useState, useCallback, useEffect } from "react";
import { SessionDisclosureBanner } from "../../components/execution/SessionDisclosureBanner";
import { ApprovalSheet } from "../../components/execution/ApprovalSheet";
import {
  AdvancedConsolePanel,
  type SessionState,
} from "../../components/execution/AdvancedConsolePanel";
import { useApprovalFlow } from "../../hooks/useApprovalFlow";
import { useAdvancedConsole } from "../../hooks/useAdvancedConsole";

export interface ExecutionConsoleViewProps {
  sessionId?: string;
  sessionState?: SessionState;
}

/** Disclosure banner を表示する state の集合 */
const DISCLOSURE_VISIBLE_STATES: ReadonlySet<SessionState> = new Set([
  "ready",
  "handoff",
  "running",
  "done",
  "aborted",
]);

export const ExecutionConsoleView: React.FC<ExecutionConsoleViewProps> = ({
  sessionId = "",
  sessionState = "collapsed",
}) => {
  // Disclosure banner state
  const [disclosureDismissed, setDisclosureDismissed] = useState(false);
  const [disclosureInfo, setDisclosureInfo] = useState({
    aiServiceName: "",
    externalDestinations: [] as string[],
  });

  // Approval flow
  const { currentRequest, approve, reject } = useApprovalFlow(sessionId);

  // Advanced console
  const advancedConsole = useAdvancedConsole(sessionId);

  // Disclosure info 取得
  useEffect(() => {
    if (!sessionId || !DISCLOSURE_VISIBLE_STATES.has(sessionState)) return;

    let cancelled = false;
    const fetchDisclosure = async () => {
      try {
        const electronAPI = (
          window as {
            electronAPI?: {
              invoke: <T>(channel: string, payload?: unknown) => Promise<T>;
            };
          }
        ).electronAPI;
        if (!electronAPI) return;

        const result = await electronAPI.invoke<{
          success: boolean;
          data?: { aiServiceName: string; externalDestinations: string[] };
        }>("execution:get-disclosure-info");

        if (cancelled) return;
        if (result?.success && result.data) {
          setDisclosureInfo(result.data);
        }
      } catch {
        // disclosure 取得失敗はフォールバック表示で対応
      }
    };

    void fetchDisclosure();
    return () => {
      cancelled = true;
    };
  }, [sessionId, sessionState]);

  // Disclosure banner dismiss/reopen
  const handleDismiss = useCallback(() => {
    setDisclosureDismissed(true);
  }, []);

  const handleReopen = useCallback(() => {
    setDisclosureDismissed(false);
  }, []);

  // Session state が collapsed に戻ったら dismiss 状態をリセット
  useEffect(() => {
    if (sessionState === "collapsed") {
      setDisclosureDismissed(false);
    }
  }, [sessionState]);

  const showDisclosure =
    DISCLOSURE_VISIBLE_STATES.has(sessionState) && !disclosureDismissed;

  const isGuidanceOnly = sessionState === "guidance-only";

  return (
    <div
      className="flex h-full flex-col gap-3 p-4"
      data-testid="execution-console-view"
    >
      {/* Layer 2: Disclosure Banner (DSC-R1) */}
      {showDisclosure && (
        <SessionDisclosureBanner
          aiServiceName={disclosureInfo.aiServiceName || "AI サービス"}
          externalDestinations={disclosureInfo.externalDestinations}
          onDismiss={handleDismiss}
          canReopen={true}
        />
      )}

      {/* guidance-only state の disclosure (DSC-R5) */}
      {isGuidanceOnly && (
        <SessionDisclosureBanner
          aiServiceName=""
          externalDestinations={[]}
          onDismiss={() => {}}
          canReopen={false}
          isGuidanceOnly={true}
        />
      )}

      {/* Dismiss 後の再表示アイコン (DSC-R2) */}
      {DISCLOSURE_VISIBLE_STATES.has(sessionState) && disclosureDismissed && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleReopen}
            className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            data-testid="disclosure-reopen"
            aria-label="AI 利用情報を再表示"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </div>
      )}

      {/* Layer 2: Approval Sheet */}
      {currentRequest && (
        <ApprovalSheet
          operationType={currentRequest.operationType}
          description={currentRequest.description}
          destination={currentRequest.destination}
          dataSummary={currentRequest.dataSummary}
          aiServiceName={disclosureInfo.aiServiceName || "AI サービス"}
          externalDestinations={disclosureInfo.externalDestinations}
          onApprove={approve}
          onReject={reject}
        />
      )}

      {/* Layer 1: Primary Surface (placeholder for Session Dock etc.) */}
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--text-secondary)]">
          {sessionState === "collapsed"
            ? "セッションを開始してください"
            : `セッション状態: ${sessionState}`}
        </p>
      </div>

      {/* Layer 3: Advanced Console (opt-in detail layer) */}
      <AdvancedConsolePanel
        isOpen={advancedConsole.isOpen}
        onToggle={advancedConsole.toggle}
        terminalOutput={advancedConsole.terminalOutput}
        copyCommand={advancedConsole.copyCommand ?? undefined}
        sessionState={sessionState}
      />
    </div>
  );
};

export default ExecutionConsoleView;
