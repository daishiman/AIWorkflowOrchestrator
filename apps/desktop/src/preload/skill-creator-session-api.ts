/**
 * Skill Creator Session API - Preload から Renderer に公開する session API
 *
 * TASK-SDK-SC-01: SDK Session Bridge
 */

import { ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "./channels";
import { invokeWithTimeout } from "./ipc-utils";
import type {
  SkillCreatorSessionCompleteEvent,
  SkillCreatorSessionErrorEvent,
  UserInputAnswer,
  UserInputQuestion,
} from "@repo/shared/types";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}

function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

export interface SkillCreatorSessionAPI {
  startSession: (request: string, sessionId?: string) => Promise<void>;
  sendAnswer: (answer: UserInputAnswer) => Promise<void>;
  onQuestion: (callback: (question: UserInputQuestion) => void) => () => void;
  onComplete: (
    callback: (event: SkillCreatorSessionCompleteEvent) => void,
  ) => () => void;
  onError: (
    callback: (event: SkillCreatorSessionErrorEvent) => void,
  ) => () => void;
}

export const skillCreatorSessionAPI: SkillCreatorSessionAPI = {
  startSession: (request: string, sessionId?: string) =>
    safeInvoke<void>(IPC_CHANNELS.START_SESSION, { request, sessionId }),
  sendAnswer: (answer: UserInputAnswer) =>
    safeInvoke<void>(IPC_CHANNELS.ANSWER, answer),
  onQuestion: (callback: (question: UserInputQuestion) => void) =>
    safeOn<UserInputQuestion>(IPC_CHANNELS.QUESTION_RECEIVED, callback),
  onComplete: (callback: (event: SkillCreatorSessionCompleteEvent) => void) =>
    safeOn<SkillCreatorSessionCompleteEvent>(
      IPC_CHANNELS.SESSION_COMPLETE,
      callback,
    ),
  onError: (callback: (event: SkillCreatorSessionErrorEvent) => void) =>
    safeOn<SkillCreatorSessionErrorEvent>(IPC_CHANNELS.SESSION_ERROR, callback),
};
