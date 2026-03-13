# 実装ガイド

## Part 1: 中学生レベルの説明

登校前の持ち物チェックを 1 枚の紙にまとめるイメージです。  
教科書、宿題、上履き、連絡帳を別々に見ていると、どれかを忘れても気づくのが遅れます。今回の preflight bundle は、それと同じで、スクリーンショットを撮る前に「部品は入っているか」「作り終わっているか」「専用画面はあるか」「見に行く先へつながるか」を 1 回で点検します。

なぜ必要か:

- screenshot 実行失敗を UI バグと環境不備で混同しないため
- `build` / `harness` / `baseUrl` / `native dependency` を 1 回で切り分けるため

何をしたか:

- 事前点検を `phase11-current-build-preflight` という 1 コマンドへまとめた
- 失敗したときは「次に何をするか」をそのまま表示するようにした
- screenshot script も同じ点検結果を使うようにした

## Part 2: 開発者向け説明

### 役割分離

| 層                   | 責務                                             |
| -------------------- | ------------------------------------------------ |
| shared core          | 4 bucket 判定、blocked、guidance、cleanup        |
| thin CLI wrapper     | argv 解析、stdout / JSON / write / exit code     |
| capture consumer     | screenshot 実行前に core を呼び、metadata に保存 |
| static server helper | loopback 用 auto serve primitive                 |

### TypeScript 風インターフェース

```ts
type PreflightBucket = "native" | "build" | "harness" | "baseUrl";
type PreflightStatus = "pass" | "fail" | "blocked";

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

### APIシグネチャ

```ts
runPhase11CurrentBuildPreflight(options?: {
  baseUrl?: string;
  autoServe?: boolean;
}): Promise<{ result: Phase11PreflightResult; cleanup: (() => Promise<void>) | null }>;
```

### 使用例

```bash
node apps/desktop/scripts/phase11-current-build-preflight.mjs --json
node apps/desktop/scripts/phase11-current-build-preflight.mjs \
  --json \
  --write docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle/outputs/phase-11/preflight-report.json
pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard
```

### エラーハンドリング

| bucket  | exit code | guidance                                            |
| ------- | --------- | --------------------------------------------------- |
| native  | 10        | `pnpm install --force`                              |
| build   | 20        | `pnpm --filter @repo/desktop build`                 |
| harness | 30        | `electron.vite.config.ts` の input 確認             |
| baseUrl | 40        | `--no-auto-serve` を外す、または reachable URL 指定 |

### 設定項目と定数一覧

| 項目            | 値 / 意味                                                               |
| --------------- | ----------------------------------------------------------------------- |
| bundleName      | `phase11-current-build-preflight`                                       |
| default baseUrl | `http://127.0.0.1:4173`                                                 |
| readiness route | `/phase11-light-theme-contrast-guard.html?surface=settings&theme=light` |
| package script  | `preflight:light-theme-contrast-guard`                                  |

### エッジケース

- bare `esbuild` 解決ができない workspace でも、`vite` が参照する `esbuild` を使って native probe する。
- auto serve は loopback のみ許可し、remote URL は fail fast にする。
- failure simulation のように `out/renderer` を直接触る検証は直列で実行する。
