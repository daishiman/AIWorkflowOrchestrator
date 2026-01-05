import { createStore } from "./store-core";

export const store = createStore({
  initialState: {
    entities: { items: { byId: {}, allIds: [] } },
    ui: { isLoading: false },
  },
  reducers: {
    setLoading(state, payload: boolean) {
      return { ...state, ui: { ...state.ui, isLoading: payload } };
    },
  },
});
