/**
 * TASK-UI-02: Session IPC 廃止済み。
 * Runtime IPC（creatorHandlers.ts）が正本。このファイルは型互換のためのスタブ。
 * ElectronAPI の skillCreatorSession プロパティ型を満たすために残存。
 */

import type {
  SkillCreatorSessionCompleteEvent,
  SkillCreatorSessionErrorEvent,
  UserInputAnswer,
  UserInputQuestion,
} from "@repo/shared/types";

export interface ExternalApiConfigRequiredEvent {
  apiName?: string;
  description?: string;
}

export interface SkillCreatorSessionAPI {
  startSession: (request: string, sessionId?: string) => Promise<void>;
  sendAnswer: (answer: UserInputAnswer) => Promise<void>;
  onQuestion: (callback: (question: UserInputQuestion) => void) => () => void;
  onExternalApiConfigRequired: (
    callback: (event: ExternalApiConfigRequiredEvent) => void,
  ) => () => void;
  onComplete: (
    callback: (event: SkillCreatorSessionCompleteEvent) => void,
  ) => () => void;
  onError: (
    callback: (event: SkillCreatorSessionErrorEvent) => void,
  ) => () => void;
}

// TASK-UI-02: 全メソッドがno-op。Session IPC は廃止済み。
export const skillCreatorSessionAPI: SkillCreatorSessionAPI = {
  startSession: () => Promise.resolve(),
  sendAnswer: () => Promise.resolve(),
  onQuestion: () => () => {},
  onExternalApiConfigRequired: () => () => {},
  onComplete: () => () => {},
  onError: () => () => {},
};
