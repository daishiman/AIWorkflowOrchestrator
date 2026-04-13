# trackEvent スタブ注入パターン詳細設計

## wizard-tracking-stub.ts 関数シグネチャ

```typescript
export async function initTrackingCapture(page: Page): Promise<void>;
export async function injectOnboardingStoreMock(
  page: Page,
  overrides?: {
    hasCompleted?: boolean;
    userName?: string;
    selectedStarterTool?: string | null;
  },
): Promise<void>;
export async function getTrackedEvents(page: Page): Promise<TrackEventEntry[]>;
export async function clearTrackedEvents(page: Page): Promise<void>;
export async function assertEventFired<K extends keyof SkillWizardEvents>(
  page: Page,
  eventName: K,
  payload?: Partial<SkillWizardEvents[K]>,
): Promise<void>;
```

## trackEvent.e2e-stub.ts 設計

```typescript
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  (window.__trackEventCalls ??= []).push({ eventName, payload });
}
```

## vite.e2e.config.ts alias 設計

```typescript
[resolve(__dirname, "src/renderer/utils/trackEvent.ts")]:
  resolve(__dirname, "e2e/helpers/trackEvent.e2e-stub.ts"),
```

## onboarding ストア注入

- `page.addInitScript` で `window.electronAPI.store.get` を上書きし、`onboarding.hasCompleted` を `true` として扱う
- `userName` と `selectedStarterTool` はテストの初期値として安全な既定値を返す
- 既存の `window.electronAPI` があれば保持し、`store.get` のみを差し替える
