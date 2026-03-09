import type { ViewType } from "../store/types";

const PUBLIC_UNAUTHENTICATED_VIEWS: readonly ViewType[] = ["settings"];

export interface ShouldResetUnauthenticatedViewInput {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentView: ViewType;
}

export const isPublicUnauthenticatedView = (view: ViewType): boolean =>
  PUBLIC_UNAUTHENTICATED_VIEWS.includes(view);

export const shouldResetUnauthenticatedView = ({
  isAuthenticated,
  isLoading,
  currentView,
}: ShouldResetUnauthenticatedViewInput): boolean =>
  !isAuthenticated &&
  !isLoading &&
  currentView !== "dashboard" &&
  !isPublicUnauthenticatedView(currentView);
