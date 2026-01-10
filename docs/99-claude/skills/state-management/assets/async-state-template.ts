export interface AsyncState<T> {
  status: "idle" | "loading" | "success" | "error";
  data?: T;
  error?: string;
  requestId?: string;
}

export const createAsyncState = <T>(): AsyncState<T> => ({
  status: "idle",
});
