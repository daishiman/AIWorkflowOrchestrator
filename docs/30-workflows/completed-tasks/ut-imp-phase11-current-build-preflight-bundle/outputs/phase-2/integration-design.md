# Phase 2 capture 統合設計

## 変更点

| 対象                                                        | 設計内容                                                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `capture-light-theme-contrast-regression-guard-phase11.mjs` | 起動直後に shared core を実行し、`preflight` を metadata に保存する                      |
| `apps/desktop/package.json`                                 | `preflight:light-theme-contrast-guard` を追加し、既存 screenshot script と命名をそろえる |
| `phase11-static-server.mjs`                                 | core から primitive として利用し、capture からは直接 orchestration しない                |
| Phase 11 outputs                                            | `manual-test-plan/result` に `preflight -> capture` 順を固定する                         |

## metadata 反映

```json
{
  "generatedAt": "2026-03-13T00:00:00+09:00",
  "baseUrl": "http://127.0.0.1:4173",
  "preflight": {
    "bundleName": "phase11-current-build-preflight",
    "summary": {
      "status": "pass",
      "failedBucket": null,
      "readyForCapture": true,
      "autoServed": true,
      "exitCode": 0
    },
    "checks": [],
    "guidance": []
  }
}
```

## fail fast

- `summary.status=fail` の場合は screenshot を開始しない。
- stderr/stdout に next action を出し、metadata にも同値内容を保存する。
