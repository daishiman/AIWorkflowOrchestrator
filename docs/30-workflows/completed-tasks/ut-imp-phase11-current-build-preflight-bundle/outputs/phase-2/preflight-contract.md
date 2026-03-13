# Phase 2 preflight 契約設計

## 採用構造

- 採用案: `shared preflight core + thin CLI wrapper + capture consumer`
- core が唯一の判定正本となり、wrapper は入出力変換、capture は結果消費だけを担当する。

## bundle 契約

| 項目            | 値                                                                      |
| --------------- | ----------------------------------------------------------------------- |
| bundleName      | `phase11-current-build-preflight`                                       |
| 判定順          | `native -> build -> harness -> baseUrl`                                 |
| exit code       | `0=pass`, `10=native`, `20=build`, `30=harness`, `40=baseUrl`           |
| default baseUrl | `http://127.0.0.1:4173`                                                 |
| readiness route | `/phase11-light-theme-contrast-guard.html?surface=settings&theme=light` |
| metadata keys   | `bundleName`, `timestamp`, `baseUrl`, `summary`, `checks`, `guidance`   |

## shared core API

```ts
type PreflightBucket = "native" | "build" | "harness" | "baseUrl";
type PreflightStatus = "pass" | "fail" | "blocked";

interface Phase11PreflightOptions {
  baseUrl?: string;
  autoServe?: boolean;
}

interface Phase11PreflightCheck {
  bucket: PreflightBucket;
  status: PreflightStatus;
  summary: string;
  details: string[];
  nextActions: string[];
}

interface Phase11PreflightResult {
  bundleName: "phase11-current-build-preflight";
  timestamp: string;
  baseUrl: string;
  summary: {
    status: "pass" | "fail";
    failedBucket: PreflightBucket | null;
    readyForCapture: boolean;
    autoServed: boolean;
    exitCode: 0 | 10 | 20 | 30 | 40;
  };
  checks: Phase11PreflightCheck[];
  guidance: Array<{ bucket: PreflightBucket; message: string }>;
}
```

## CLI 契約

- 入力:
  - `--base-url <url>`
  - `--json`
  - `--write <path>`
  - `--no-auto-serve`
- 出力:
  - 標準出力: human readable summary または JSON
  - 書込: `--write` 指定時に JSON
  - 終了コード: first failed bucket に対応
