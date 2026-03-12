export const LIGHT_THEME_CONTRAST_WORKFLOW =
  "docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard";

export const LIGHT_THEME_SCREENSHOT_SCENARIOS = [
  {
    id: "TC-11-01",
    surface: "settings",
    theme: "light",
    route: "/phase11-light-theme-contrast-guard.html?surface=settings&theme=light",
    selector: '[data-testid="settings-view"]',
    output: "screenshots/TC-11-01-settings-light.png",
    reviewScope: "settings shell + theme selector + secondary text",
    priority: "A",
  },
  {
    id: "TC-11-02",
    surface: "dashboard",
    theme: "light",
    route: "/phase11-light-theme-contrast-guard.html?surface=dashboard&theme=light",
    selector: '[data-testid="dashboard-view"]',
    output: "screenshots/TC-11-02-dashboard-light.png",
    reviewScope: "surface hierarchy + border + panel readability",
    priority: "A",
  },
  {
    id: "TC-11-03",
    surface: "auth",
    theme: "light",
    route: "/phase11-light-theme-contrast-guard.html?surface=auth&theme=light",
    selector: '[data-testid="auth-view-panel"]',
    output: "screenshots/TC-11-03-auth-light.png",
    reviewScope: "glass panel + CTA + helper text readability",
    priority: "A",
  },
  {
    id: "TC-11-04",
    surface: "workspace-search",
    theme: "light",
    route: "/phase11-light-theme-contrast-guard.html?surface=workspace-search&theme=light",
    selector: '[data-testid="workspace-search-panel"]',
    output: "screenshots/TC-11-04-workspace-search-light.png",
    reviewScope: "panel + input + result row contrast",
    priority: "A",
  },
  {
    id: "TC-11-05",
    surface: "dashboard",
    theme: "dark",
    route: "/phase11-light-theme-contrast-guard.html?surface=dashboard&theme=dark",
    selector: '[data-testid="dashboard-view"]',
    output: "screenshots/TC-11-05-dashboard-dark-baseline.png",
    reviewScope: "dark baseline comparison",
    priority: "B",
  },
];

export const LIGHT_THEME_AUDIT_TARGETS = [
  {
    relativePath:
      "apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx",
    surface: "settings",
    bucket: "baseline",
  },
  {
    relativePath: "apps/desktop/src/renderer/views/AuthView/index.tsx",
    surface: "auth",
    bucket: "baseline",
  },
  {
    relativePath:
      "apps/desktop/src/renderer/components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx",
    surface: "workspace-search",
    bucket: "baseline",
  },
  {
    relativePath: "apps/desktop/src/renderer/views/SettingsView/index.tsx",
    surface: "settings",
    bucket: "current",
  },
  {
    relativePath: "apps/desktop/src/renderer/views/DashboardView/index.tsx",
    surface: "dashboard",
    bucket: "current",
  },
];

export const LIGHT_THEME_AUDIT_PATTERNS = [
  {
    id: "text-white",
    label: "text-white*",
    regex: /\btext-white(?:\/(?:10|20|30|40|50|60|70|80|90))?\b/g,
  },
  {
    id: "bg-white",
    label: "bg-white*",
    regex: /\bbg-white(?:\/(?:5|10|15|20|30|40|50|60|70|80|90))?\b/g,
  },
  {
    id: "border-white",
    label: "border-white*",
    regex: /\bborder-white(?:\/(?:10|20|30|40|50|60|70|80|90))?\b/g,
  },
  {
    id: "bg-slate",
    label: "bg-slate-*",
    regex: /\bbg-slate-\d+(?:\/\d+)?\b/g,
  },
  {
    id: "text-slate",
    label: "text-slate-*",
    regex: /\btext-slate-\d+(?:\/\d+)?\b/g,
  },
  {
    id: "border-slate",
    label: "border-slate-*",
    regex: /\bborder-slate-\d+(?:\/\d+)?\b/g,
  },
  {
    id: "bg-zinc",
    label: "bg-zinc-*",
    regex: /\bbg-zinc-\d+(?:\/\d+)?\b/g,
  },
  {
    id: "text-zinc",
    label: "text-zinc-*",
    regex: /\btext-zinc-\d+(?:\/\d+)?\b/g,
  },
  {
    id: "border-zinc",
    label: "border-zinc-*",
    regex: /\bborder-zinc-\d+(?:\/\d+)?\b/g,
  },
];

export const LIGHT_THEME_AUDIT_EXCLUSIONS = [
  /\/styles\/globals\.css$/,
  /\/styles\/tokens\.css$/,
  /\.test\.[cm]?[jt]sx?$/,
  /\/phase11-[^/]+\.(?:ts|tsx|html)$/,
];

export function createLightThemeScreenshotPlan(baseUrl) {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    scenarios: LIGHT_THEME_SCREENSHOT_SCENARIOS.map((scenario) => ({
      id: scenario.id,
      surface: scenario.surface,
      description: scenario.reviewScope,
      theme: scenario.theme,
      route: scenario.route,
      selector: scenario.selector,
      output: scenario.output,
      priority: scenario.priority,
    })),
  };
}
