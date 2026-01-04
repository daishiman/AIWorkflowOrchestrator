export type EntityId = string;

export interface EntityMap<T> {
  byId: Record<EntityId, T>;
  allIds: EntityId[];
}

export interface UiState {
  isLoading: boolean;
  error?: string;
}

export interface RootState {
  entities: {
    items: EntityMap<{ id: EntityId; name: string }>;
  };
  ui: UiState;
}
