# Phase 2 設計書: IPC契約ドリフト自動検出スクリプト

## タスクID: UT-TASK06-007

## 作成日: 2026-03-18

## 1. 処理フロー

```
入力:
  apps/desktop/src/main/**/*.ts         (Mainハンドラ定義)
  apps/desktop/src/preload/*.ts         (Preload API定義、テスト除外)
  apps/desktop/src/preload/channels.ts  (チャンネル定数)

処理フロー:
  1. Extract: fs.readFileSyncでソースファイルを読み込み、正規表現でパターン抽出
     - Main側: ipcMain.handle/on のチャンネル名・引数パターン
     - Preload側: safeInvoke/safeOn のチャンネル名・引数パターン
  2. Match: チャンネル名でMain側とPreload側をJOIN
  3. Validate: 4つの検出ルール(R-01~R-04)を適用
  4. Report: Markdown/JSON形式でレポートを生成、exit codeを設定

出力:
  stdout: 不一致レポート (Markdown or JSON)
  exit 0: 整合 or --report-only モード
  exit 1: 不一致検出 (デフォルト or --strict)
  exit 2: スクリプトエラー
```

## 2. モジュール構成・型定義

単一ファイル `apps/desktop/scripts/check-ipc-contracts.ts` に全てを収める（200行以内目標）。

```typescript
// --- 型定義 ---
interface HandlerEntry {
  channel: string; // チャンネル名 or IPC_CHANNELS定数参照
  argPattern: "object" | "primitive" | "none" | "unknown";
  filePath: string;
  line: number;
  rawSignature: string;
}

interface PreloadEntry {
  channel: string;
  argPattern: "object" | "primitive" | "none" | "unknown";
  filePath: string;
  line: number;
  rawArgs: string;
}

interface DriftEntry {
  channel: string;
  rule: "R-01" | "R-02" | "R-03" | "R-04";
  severity: "error" | "warning";
  message: string;
  mainSide?: { file: string; line: number; detail: string };
  preloadSide?: { file: string; line: number; detail: string };
}

interface OrphanEntry {
  channel: string;
  side: "main-only" | "preload-only";
  file: string;
  line: number;
}

interface DriftReport {
  timestamp: string;
  summary: {
    totalHandlers: number;
    totalPreloads: number;
    drifts: number;
    orphans: number;
  };
  drifts: DriftEntry[];
  orphans: OrphanEntry[];
  passed: boolean;
}

// --- 抽出関数 ---
export function extractMainHandlers(sourceFiles: string[]): HandlerEntry[];
export function extractPreloadEntries(sourceFiles: string[]): PreloadEntry[];

// --- 検出関数 ---
export function matchAndValidate(
  handlers: HandlerEntry[],
  preloads: PreloadEntry[],
): DriftReport;

// --- レポート関数 ---
export function generateReport(
  report: DriftReport,
  format: "markdown" | "json",
): string;

// --- メイン ---
export function main(argv: string[]): void;
```

## 3. 抽出パターン設計

### Mainハンドラ抽出

ソースファイルを行ごとに読み、以下の正規表現でマッチ:

```
/ipcMain\.(handle|on)\s*\(\s*(?:(['"`])([^'"`]+)\2|([A-Z_]+(?:\.[A-Z_]+)+))/
```

- グループ3: 文字列リテラルのチャンネル名
- グループ4: IPC_CHANNELS定数参照

引数パターン判定（同一行または次行を確認）:

- `{ ... }` を含む → `object`
- 単一識別子（event以降） → `primitive`
- eventのみ → `none`
- 判定不能 → `unknown`

### Preload API抽出

```
/safe(Invoke|On)\s*\(\s*(?:(['"`])([^'"`]+)\2|([A-Z_]+(?:\.[A-Z_]+)+))(?:\s*,\s*(.+))?\)/
```

- グループ3: 文字列リテラルのチャンネル名
- グループ4: IPC_CHANNELS定数参照
- グループ5: 引数部分

引数パターン判定:

- `{` で始まる → `object`
- 引数あり（カンマ後に値） → `primitive`
- 引数なし → `none`

## 4. 検出ルール設計

| ルールID | ルール名                 | ロジック                                                                | 重大度  |
| -------- | ------------------------ | ----------------------------------------------------------------------- | ------- |
| R-01     | チャンネル孤児           | Main側集合とPreload側集合の差集合を検出                                 | warning |
| R-02     | 引数形式不一致           | 同一チャンネルでMain.argPattern != Preload.argPattern (both != unknown) | error   |
| R-03     | チャンネル名ハードコード | 文字列リテラル（'...'/"..."）でチャンネル名を直接指定                   | warning |
| R-04     | 未登録チャンネル         | Preload側にあるがMain側にhandleされていない                             | error   |

### ルール適用フロー

```
allChannels = union(mainChannels, preloadChannels)

for channel in allChannels:
  if channel in main AND channel not in preload:
    add orphan(main-only, warning)  // R-01
  if channel not in main AND channel in preload:
    add drift(R-04, error)          // R-04 > R-01
  if channel in main AND channel in preload:
    if main.argPattern != preload.argPattern
       AND main.argPattern != 'unknown'
       AND preload.argPattern != 'unknown':
      add drift(R-02, error)

// R-03: 文字列リテラル検出（別パスで走査）
for entry in [...handlers, ...preloads]:
  if entry.channel matches string literal pattern (not IPC_CHANNELS):
    add drift(R-03, warning)
```

## 5. CLIインターフェース設計

| オプション      | 型      | デフォルト | 説明                         |
| --------------- | ------- | ---------- | ---------------------------- |
| `--report-only` | boolean | false      | 不一致検出してもexit 0で終了 |
| `--strict`      | boolean | true       | 不一致検出時にexit 1で終了   |
| `--format`      | string  | "markdown" | 出力形式（markdown/json）    |
| `--help`        | boolean | false      | ヘルプ表示                   |

CLIパーシングは `process.argv.slice(2)` を手動パース（外部依存なし）。

## 6. レポート出力形式設計

### Markdown形式

```markdown
# IPC Contract Drift Report

**Generated**: 2026-03-18T10:00:00Z
**Summary**: 324 handlers, 150 preloads, 0 drifts, 0 orphans

## Drifts (0)

(none)

## Orphans (0)

(none)

## Result: PASS
```

### JSON形式

```json
{
  "timestamp": "2026-03-18T10:00:00Z",
  "summary": {
    "totalHandlers": 324,
    "totalPreloads": 150,
    "drifts": 0,
    "orphans": 0
  },
  "drifts": [],
  "orphans": [],
  "passed": true
}
```

## 7. Phase 9 統合設計

`phase-templates.md` の Phase 9 セクションに追加:

```
### IPC契約ドリフト検証
- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が exit 0 で完了する
- [ ] 検出されたドリフトの妥当性を確認している
```

## 8. ファイル配置

| ファイル                                                     | 役割             |
| ------------------------------------------------------------ | ---------------- |
| `apps/desktop/scripts/check-ipc-contracts.ts`                | メインスクリプト |
| `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | ユニットテスト   |

## 9. IPC_CHANNELS定数解決戦略

Main側・Preload側ともに `IPC_CHANNELS.XXX` 形式の定数参照が多い。チャンネル名の照合には:

1. `channels.ts` を読み込み、`IPC_CHANNELS` オブジェクトのキー→値マッピングを構築
2. 抽出結果の `IPC_CHANNELS.XXX` を実際のチャンネル名（例: `"skill:import"`）に解決
3. 解決後のチャンネル名でMain/Preload間を照合

## 完了条件チェック

- [x] 処理フロー（抽出→照合→検出→レポート）が定義されている
- [x] モジュール構成と型定義が設計されている
- [x] 4つの検出ルール（R-01〜R-04）が定義されている
- [x] CLIインターフェース（--report-only / --strict / --format）が設計されている
- [x] レポート出力形式（Markdown/JSON）が設計されている
- [x] Phase 9 統合の追加チェック項目が設計されている
- [x] ファイル配置が決定されている
- [x] 本Phase内の全タスクを100%実行完了
