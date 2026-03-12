# Light Theme Contrast Guard 実装ガイド

## Part 1: なぜこの guard が必要か

### なぜ必要か

ライトテーマの不具合は、画面が真っ白に壊れるよりも厄介です。理由は、見た目は表示されていても、補助テキストや panel 境界だけが少し薄くなり、レビュー時に見逃されやすいからです。

この guard は、そうした「少しだけ読みにくい」を毎回の build で拾うための再発防止策です。実装修正そのものをするのではなく、どこに remediation を回すべきかを早く判断できる状態を作ります。

### たとえば

教室の名簿を想像してください。名前が書いてあっても、鉛筆が薄すぎると出席確認で見落とします。  
この guard は「名簿を書き直す人」ではなく、「薄すぎる行に付箋を貼る人」です。

### 何をするか

1. representative な 4 画面と比較用 1 画面を current build から再撮影する。
2. hardcoded color utility を audit して `current` と `baseline` に分ける。
3. Phase 11 のスクリーンショット証跡と、Phase 12 の仕様同期をつなぐ。

## Part 2: 実装詳細

### TypeScript 型定義

```typescript
type AuditBucket = "current" | "baseline";
type Surface = "settings" | "dashboard" | "auth" | "workspace-search";

interface LightThemeAuditHit {
  relativePath: string;
  surface: Surface | "unknown";
  bucket: AuditBucket;
  lineNumber: number;
  patternId: string;
  patternLabel: string;
  token: string;
  lineText: string;
}

interface LightThemeGuardReport {
  generatedAt: string;
  missingTargets: string[];
  hits: LightThemeAuditHit[];
  summary: {
    totalViolations: number;
    currentViolations: number;
    baselineViolations: number;
    byFile: Record<string, number>;
    byPattern: Record<string, number>;
  };
}
```

### CLIシグネチャ

```bash
pnpm --filter @repo/desktop guard:light-theme -- --json
pnpm --filter @repo/desktop guard:light-theme -- --write docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/light-theme-contrast-audit-report.json
pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard
```

### 使用例

```bash
pnpm --filter @repo/desktop build
python3 -m http.server 4173 --bind 127.0.0.1 --directory apps/desktop/out/renderer
pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard
```

```typescript
import { auditConfiguredTargets } from "./light-theme-contrast-guard.mjs";

const report = await auditConfiguredTargets();
console.log(report.summary.currentViolations);
console.log(report.summary.baselineViolations);
```

### 構成

| ファイル                                                    | 役割                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| `light-theme-contrast-guard.config.mjs`                     | screenshot scenario, selector, audit target, exclusion の正本 |
| `light-theme-contrast-guard.mjs`                            | audit 実行、summary 生成、JSON export                         |
| `capture-light-theme-contrast-regression-guard-phase11.mjs` | current build から TC-11-01..05 を capture                    |
| `phase11-light-theme-contrast-guard.tsx`                    | representative screen harness                                 |

### 設定可能なパラメータ

| 項目                       | 値                              |
| -------------------------- | ------------------------------- |
| `PHASE11_CAPTURE_BASE_URL` | default `http://127.0.0.1:4173` |
| viewport                   | `1440 x 960`                    |
| target bucket              | `current` / `baseline`          |
| capture scenarios          | 5 cases                         |

### エラーハンドリング

- build 失敗時は screenshot を続行しない。`pnpm --filter @repo/desktop build` を先に通す。
- static serve 未起動時は `page.goto()` が失敗するため、`baseUrl` 疎通を事前に確認する。
- selector 未検出時は capture せず fail とし、`data-testid` 契約を先に補う。
- WorkspaceSearch は検索結果がないと review scope が欠けるため、preCapture で検索を実行する。

### エッジケース

| ケース                                         | 対処                                                   |
| ---------------------------------------------- | ------------------------------------------------------ |
| harness 自体の utility class が audit に混ざる | `LIGHT_THEME_AUDIT_EXCLUSIONS` で除外する              |
| `current=0` でも既存 backlog が多い            | `baselineViolations` を別欄で必ず記録する              |
| build input に harness HTML がない             | `electron.vite.config.ts` の renderer input に追加する |
| panel root に `data-testid` を渡せない         | `GlassPanel` の props 透過で解消する                   |

### 運用上の注意

1. この guard は remediation task ではない。
2. Theme remediation は `task-fix-light-theme-shared-color-migration-001` に routing する。
3. `.claude` を正本とし、`.agents` は mirror drift を記録対象として扱う。
