/**
 * @file Community IPC Handlers
 * @module main/ipc/communityHandlers
 * @description IPC handlers for community visualization operations
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
import type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";

// TODO: Replace with actual service implementation
// Currently using mock data for development and testing

/**
 * Generate mock community data for development
 */
function generateMockCommunities(): Community[] {
  const now = new Date();

  const communities: Community[] = [
    {
      id: "community-level0-1" as CommunityId,
      level: 0,
      size: 10,
      memberEntityIds: [
        "entity-1" as EntityId,
        "entity-2" as EntityId,
        "entity-3" as EntityId,
      ],
      childCommunityIds: [],
      parentCommunityId: "community-level1-1" as CommunityId,
      internalEdges: 15,
      externalEdges: 5,
      modularity: 0.65,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "community-level0-2" as CommunityId,
      level: 0,
      size: 8,
      memberEntityIds: ["entity-4" as EntityId, "entity-5" as EntityId],
      childCommunityIds: [],
      parentCommunityId: "community-level1-1" as CommunityId,
      internalEdges: 12,
      externalEdges: 4,
      modularity: 0.58,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "community-level0-3" as CommunityId,
      level: 0,
      size: 12,
      memberEntityIds: [
        "entity-6" as EntityId,
        "entity-7" as EntityId,
        "entity-8" as EntityId,
        "entity-9" as EntityId,
      ],
      childCommunityIds: [],
      parentCommunityId: "community-level1-2" as CommunityId,
      internalEdges: 18,
      externalEdges: 6,
      modularity: 0.72,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "community-level1-1" as CommunityId,
      level: 1,
      size: 18,
      memberEntityIds: [],
      childCommunityIds: [
        "community-level0-1" as CommunityId,
        "community-level0-2" as CommunityId,
      ],
      parentCommunityId: "community-level2-1" as CommunityId,
      internalEdges: 27,
      externalEdges: 8,
      modularity: 0.68,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "community-level1-2" as CommunityId,
      level: 1,
      size: 12,
      memberEntityIds: [],
      childCommunityIds: ["community-level0-3" as CommunityId],
      parentCommunityId: "community-level2-1" as CommunityId,
      internalEdges: 18,
      externalEdges: 6,
      modularity: 0.72,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "community-level2-1" as CommunityId,
      level: 2,
      size: 30,
      memberEntityIds: [],
      childCommunityIds: [
        "community-level1-1" as CommunityId,
        "community-level1-2" as CommunityId,
      ],
      parentCommunityId: undefined,
      internalEdges: 45,
      externalEdges: 0,
      modularity: 0.7,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return communities;
}

/**
 * Generate mock entity data for development
 */
function generateMockEntities(entityIds: readonly EntityId[]): StoredEntity[] {
  return entityIds.map((id) => ({
    id,
    name: `Entity ${id}`,
    normalizedName: `entity_${id}`.toLowerCase(),
    type: "concept" as const,
    description: `Description for ${id}`,
    sourceDocumentIds: [],
    sourceChunkIds: [],
    textUnit: null,
    extractedAt: new Date(),
    updatedAt: new Date(),
    mentions: 1,
  }));
}

/**
 * Generate mock community summary
 */
function generateMockSummary(communityId: CommunityId): CommunitySummary {
  return {
    communityId,
    level: 0,
    summary: `This community focuses on a core set of related concepts and entities that share common attributes and relationships.`,
    keywords: ["architecture", "design", "patterns"],
    mainEntities: ["Entity 1", "Entity 2", "Entity 3"],
    mainRelations: ["relates_to", "contains", "depends_on"],
    sentiment: "neutral",
    confidence: 0.85,
    tokenCount: 150,
    createdAt: new Date(),
  };
}

// Mock data storage
const mockCommunities = generateMockCommunities();

/**
 * Register all community-related IPC handlers
 */
export function registerCommunityHandlers(): void {
  // Get all communities
  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_ALL,
    async (): Promise<CommunityGetAllResponse> => {
      try {
        return {
          ok: true,
          value: mockCommunities,
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "FETCH_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        };
      }
    },
  );

  // Get communities by level
  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_BY_LEVEL,
    async (_, level: number): Promise<CommunityGetByLevelResponse> => {
      try {
        const filtered = mockCommunities.filter((c) => c.level === level);
        return {
          ok: true,
          value: filtered,
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "FETCH_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        };
      }
    },
  );

  // Get community by ID
  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_BY_ID,
    async (_, id: CommunityId): Promise<CommunityGetByIdResponse> => {
      try {
        const community = mockCommunities.find((c) => c.id === id);
        if (!community) {
          return {
            ok: false,
            error: {
              code: "NOT_FOUND",
              message: `Community with ID ${id} not found`,
            },
          };
        }
        return {
          ok: true,
          value: community,
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "FETCH_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        };
      }
    },
  );

  // Get community members
  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_MEMBERS,
    async (_, id: CommunityId): Promise<CommunityGetMembersResponse> => {
      try {
        const community = mockCommunities.find((c) => c.id === id);
        if (!community) {
          return {
            ok: false,
            error: {
              code: "NOT_FOUND",
              message: `Community with ID ${id} not found`,
            },
          };
        }
        const members = generateMockEntities(community.memberEntityIds);
        return {
          ok: true,
          value: members,
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "FETCH_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        };
      }
    },
  );

  // Get community summary
  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_GET_SUMMARY,
    async (_, id: CommunityId): Promise<CommunityGetSummaryResponse> => {
      try {
        const community = mockCommunities.find((c) => c.id === id);
        if (!community) {
          return {
            ok: false,
            error: {
              code: "NOT_FOUND",
              message: `Community with ID ${id} not found`,
            },
          };
        }
        const summary = generateMockSummary(id);
        return {
          ok: true,
          value: summary,
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "FETCH_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        };
      }
    },
  );

  // Search communities
  ipcMain.handle(
    IPC_CHANNELS.COMMUNITY_SEARCH,
    async (_, query: string): Promise<CommunitySearchResponse> => {
      try {
        // Simple mock search - matches communities by size or ID
        const lowerQuery = query.toLowerCase();
        const results = mockCommunities.filter(
          (c) =>
            c.id.toLowerCase().includes(lowerQuery) ||
            c.memberEntityIds.some((id) =>
              id.toLowerCase().includes(lowerQuery),
            ),
        );
        return {
          ok: true,
          value: results,
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "SEARCH_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        };
      }
    },
  );
}
