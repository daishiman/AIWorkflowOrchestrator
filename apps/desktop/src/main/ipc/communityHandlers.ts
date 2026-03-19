/**
 * @file Community IPC Handlers
 * @module main/ipc/communityHandlers
 * @description IPC handlers for community visualization operations (guidance-only)
 */

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  CommunityGetAllResponse,
  CommunityGetByLevelResponse,
  CommunityGetByIdResponse,
  CommunityGetMembersResponse,
  CommunityGetSummaryResponse,
  CommunitySearchResponse,
} from "../../preload/types";

const GUIDANCE_RESPONSE = {
  ok: false,
  error: {
    code: "NOT_IN_SCOPE",
    message:
      "コミュニティ機能は現在利用できません。今後のリリースで対応予定です。",
  },
} as const;

/**
 * Register all community-related IPC handlers
 */
export function registerCommunityHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_ALL,
    async (): Promise<CommunityGetAllResponse> => GUIDANCE_RESPONSE,
  );

  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_BY_LEVEL,
    async (): Promise<CommunityGetByLevelResponse> => GUIDANCE_RESPONSE,
  );

  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_BY_ID,
    async (): Promise<CommunityGetByIdResponse> => GUIDANCE_RESPONSE,
  );

  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_MEMBERS,
    async (): Promise<CommunityGetMembersResponse> => GUIDANCE_RESPONSE,
  );

  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_SUMMARY,
    async (): Promise<CommunityGetSummaryResponse> => GUIDANCE_RESPONSE,
  );

  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_SEARCH,
    async (): Promise<CommunitySearchResponse> => GUIDANCE_RESPONSE,
  );
}

export function unregisterCommunityHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.COMMUNITY_GET_ALL);
  ipcMain.removeHandler(IPC_CHANNELS.COMMUNITY_GET_BY_LEVEL);
  ipcMain.removeHandler(IPC_CHANNELS.COMMUNITY_GET_BY_ID);
  ipcMain.removeHandler(IPC_CHANNELS.COMMUNITY_GET_MEMBERS);
  ipcMain.removeHandler(IPC_CHANNELS.COMMUNITY_GET_SUMMARY);
  ipcMain.removeHandler(IPC_CHANNELS.COMMUNITY_SEARCH);
}
