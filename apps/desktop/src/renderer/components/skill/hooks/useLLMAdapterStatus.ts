import { useEffect, useState } from "react";
import type { LLMAdapterStatusPayload } from "@repo/shared/types";

export interface LLMAdapterStatusState extends LLMAdapterStatusPayload {}

function getSkillCreatorApi() {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: unknown };
    skillCreatorAPI?: unknown;
  };
  const bridge =
    runtimeWindow.electronAPI?.skillCreator ?? runtimeWindow.skillCreatorAPI;

  return bridge as
    | {
        getAdapterStatus?: () => Promise<{
          success: boolean;
          data?: LLMAdapterStatusPayload;
        }>;
        onAdapterStatusChanged?: (
          cb: (payload: LLMAdapterStatusPayload) => void,
        ) => () => void;
      }
    | undefined;
}

export function useLLMAdapterStatus(): LLMAdapterStatusState {
  const [state, setState] = useState<LLMAdapterStatusState>({
    status: "initializing",
    failureReason: null,
  });

  useEffect(() => {
    const api = getSkillCreatorApi();
    if (!api) return;

    let cancelled = false;

    // pull: マウント時に現在の状態を取得（失敗時は初期状態維持）
    const pull = api.getAdapterStatus?.();
    if (pull) {
      void pull
        .then((result) => {
          if (cancelled) return;
          if (result.success && result.data) {
            setState({
              status: result.data.status,
              failureReason: result.data.failureReason,
            });
          }
        })
        .catch(() => {
          // graceful degradation: 初期状態維持
        });
    }

    // push: 状態変化を購読（API が無い場合は no-op）
    const unsubscribe =
      api.onAdapterStatusChanged?.((payload) => {
        if (cancelled) return;
        setState({
          status: payload.status,
          failureReason: payload.failureReason,
        });
      }) ?? (() => {});

    return () => {
      cancelled = true;
      try {
        unsubscribe();
      } catch {
        // unsubscribe は例外を投げない前提だが、念のため握りつぶす
      }
    };
  }, []);

  return state;
}
