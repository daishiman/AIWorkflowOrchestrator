import React from "react";
import ReactDOM from "react-dom/client";
import { SkillCreatorConversationPanel } from "./components/skill-creator/SkillCreatorConversationPanel";
import "./styles/globals.css";
import type {
  SkillCreatorSessionCompleteEvent,
  SkillCreatorSessionErrorEvent,
  UserInputAnswer,
  UserInputQuestion,
} from "@repo/shared/types";

type SkillCreatorSessionAPI = {
  startSession: (request: string, sessionId?: string) => Promise<void>;
  sendAnswer: (answer: UserInputAnswer) => Promise<void>;
  onQuestion: (callback: (question: UserInputQuestion) => void) => () => void;
  onComplete: (
    callback: (event: SkillCreatorSessionCompleteEvent) => void,
  ) => () => void;
  onError: (
    callback: (event: SkillCreatorSessionErrorEvent) => void,
  ) => () => void;
};

type HarnessController = {
  emitQuestion: (question: UserInputQuestion) => void;
  emitComplete: (result?: string) => void;
  emitError: (error: string) => void;
  resolvePendingAnswer: () => void;
  lastAnswer: UserInputAnswer | null;
};

declare global {
  interface Window {
    skillCreatorSessionAPI: SkillCreatorSessionAPI;
    __PHASE11_SKILL_CREATOR_CONVERSATION_UI__?: HarnessController;
  }
}

const questionListeners = new Set<(question: UserInputQuestion) => void>();
const completeListeners = new Set<
  (event: SkillCreatorSessionCompleteEvent) => void
>();
const errorListeners = new Set<
  (event: SkillCreatorSessionErrorEvent) => void
>();

let pendingAnswerResolve: (() => void) | null = null;
let lastAnswer: UserInputAnswer | null = null;

document.documentElement.setAttribute("data-theme", "light");
document.documentElement.style.colorScheme = "light";

window.skillCreatorSessionAPI = {
  startSession: async () => undefined,
  sendAnswer: async (answer: UserInputAnswer) => {
    lastAnswer = answer;
    await new Promise<void>((resolve) => {
      pendingAnswerResolve = resolve;
    });
  },
  onQuestion: (callback: (question: UserInputQuestion) => void) => {
    questionListeners.add(callback);
    return () => {
      questionListeners.delete(callback);
    };
  },
  onComplete: (callback: (event: SkillCreatorSessionCompleteEvent) => void) => {
    completeListeners.add(callback);
    return () => {
      completeListeners.delete(callback);
    };
  },
  onError: (callback: (event: SkillCreatorSessionErrorEvent) => void) => {
    errorListeners.add(callback);
    return () => {
      errorListeners.delete(callback);
    };
  },
};

window.__PHASE11_SKILL_CREATOR_CONVERSATION_UI__ = {
  emitQuestion: (question: UserInputQuestion) => {
    for (const listener of questionListeners) {
      listener(question);
    }
  },
  emitComplete: (result = "conversation complete") => {
    const payload: SkillCreatorSessionCompleteEvent = { result };
    for (const listener of completeListeners) {
      listener(payload);
    }
  },
  emitError: (error: string) => {
    const payload: SkillCreatorSessionErrorEvent = { error };
    for (const listener of errorListeners) {
      listener(payload);
    }
  },
  resolvePendingAnswer: () => {
    pendingAnswerResolve?.();
    pendingAnswerResolve = null;
  },
  get lastAnswer() {
    return lastAnswer;
  },
};

function Harness(): JSX.Element {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <main className="mx-auto flex min-h-screen max-w-[1200px] items-center justify-center px-6 py-8">
        <section
          className="w-full overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lg)]"
          data-testid="phase11-skill-creator-conversation-ui-shell"
        >
          <div className="border-b border-[var(--border-subtle)] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--status-primary)]">
              Phase 11 Visual Audit
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Skill Creator Conversation UI
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              質問受信・回答送信の rendering / interaction / terminal state を
              実コードで視覚確認するためのハーネスです。
            </p>
          </div>
          <div className="p-6">
            <SkillCreatorConversationPanel />
          </div>
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Harness />);
