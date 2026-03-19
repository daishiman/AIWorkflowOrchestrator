# 実装ガイド - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | UT-TASK06-007                                 |
| 再監査日   | 2026-03-19                                    |
| Phase      | 12 - ドキュメント                             |
| 対象成果物 | `apps/desktop/scripts/check-ipc-contracts.ts` |

## Part 1: 中学生でもわかる説明

### なぜ必要か

画面からボタンを押したとき、裏側では「この名前の仕事を、この形のデータで呼び出してください」という約束が動いている。ここがずれると、見た目は同じでも実際には動かない。

たとえば、教室の連絡係が「3年A組にプリントを配る」と名簿に書いたのに、職員室の名簿には「3A」ではなく「三年A組」と書いてあったら、人が見れば何となく分かっても機械は迷う。IPC 契約ドリフトは、これと同じで「呼び出す側の名簿」と「受ける側の名簿」が少しずつずれていく問題だ。

このずれはチャンネル名だけでなく、渡すデータの形でも起きる。だから人手でたまに眺めるだけでは足りず、毎回同じ基準で点検する仕組みが必要になる。

### 何をするか

このスクリプトは、プロジェクト全体を見回って「画面側の注文票」と「Main Process 側の受け口」が合っているかを自動で点検する。Renderer / Preload / Main の3か所を横断して読み取り、Main だけにあるもの、Preload だけにあるもの、引数の形が違うもの、定数を使わずに文字列を直書きしているものを検出する。

### 4つの検出ルール

| ルール | たとえ                                                   | 実際に見るもの                            |
| ------ | -------------------------------------------------------- | ----------------------------------------- |
| R-01   | 注文票はあるのに厨房に受け口がない、またはその逆         | Main / Preload の片側にだけあるチャンネル |
| R-02   | ラーメンを頼んだのに、厨房はセット注文の形を期待している | object vs primitive の引数不一致          |
| R-03   | 正式なメニュー番号ではなく手書きメモで注文している       | 文字列リテラルのチャンネル指定            |
| R-04   | メニュー表には載っているのに厨房で登録されていない       | 定数定義済みだが main 未登録のチャンネル  |

## Part 2: 開発者向け技術詳細

### TypeScript 型定義

```ts
type ArgPattern = "object" | "primitive" | "none" | "unknown";

interface HandlerEntry {
  channel: string;
  sourceFile: string;
  method: "handle" | "on";
  argPattern: ArgPattern;
}

interface PreloadEntry {
  channel: string;
  sourceFile: string;
  method: "safeInvoke" | "safeOn";
  argPattern: ArgPattern;
}

interface DriftReport {
  handlers: HandlerEntry[];
  preloads: PreloadEntry[];
  drifts: DriftEntry[];
  orphans: OrphanEntry[];
}

interface CliOptions {
  reportOnly: boolean;
  strict: boolean;
  format: "markdown" | "json";
}
```

### 現在の実装規模

| ファイル                                                     | 役割                      |
| ------------------------------------------------------------ | ------------------------- |
| `apps/desktop/scripts/check-ipc-contracts.ts`                | メインスクリプト（578行） |
| `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | テストスイート（49件）    |

### 主な処理

| 関数 / 群                                                | 役割                                                     |
| -------------------------------------------------------- | -------------------------------------------------------- |
| `extractMainHandlers`                                    | `ipcMain.handle` / `ipcMain.on` 系の main 登録を抽出する |
| `extractPreloadEntries`                                  | `safeInvoke` / `safeOn` の preload 呼び出しを抽出する    |
| `resolveChannelMap`, `resolveChannel`                    | 定数参照を実チャンネル名へ解決する                       |
| `classifyHandlerArgPattern`, `classifyPreloadArgPattern` | object / primitive / unknown を分類する                  |
| `matchAndValidate`                                       | R-01〜R-04 を適用し、drift/orphan を生成する             |
| `generateReport`, `main`                                 | Markdown/JSON 出力と CLI 制御を行う                      |

### 2026-03-19 再監査で反映済みの改善

- `safeInvoke<T>` / `safeOn<T>` の generic 呼び出しを抽出
- 複数行にまたがる preload 呼び出しを抽出
- typed object 引数を main 側 `object` と判定
- `IPC_CHANNELS` だけでなく `CHANNELS` / `CHAT_EDIT_CHANNELS` など複数 const object を収集
- full-ref と key fallback の両方でチャンネル解決
- R-04 を直接固定する回帰テスト追加

### API/CLI シグネチャ

```ts
function extractMainHandlers(
  fileContent: string,
  filePath: string,
): HandlerEntry[];
function extractPreloadEntries(
  fileContent: string,
  filePath: string,
): PreloadEntry[];
function resolveChannelMap(source: string): Map<string, string>;
function matchAndValidate(
  handlers: HandlerEntry[],
  preloads: PreloadEntry[],
  channelMap: Map<string, string>,
): DriftReport;
```

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts [--report-only] [--strict] [--format json]
```

### CLI オプション

| オプション          | 説明                                         |
| ------------------- | -------------------------------------------- |
| `--report-only`     | ドリフトがあっても exit 0 でレポートだけ出す |
| `--strict`          | error レベルの drift で exit 1 を返す        |
| `--format json`     | JSON 形式で出力する                          |
| `--format markdown` | 人が読む Markdown 形式で出力する             |

### 使用例

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict
```

```ts
import { matchAndValidate } from "../check-ipc-contracts";

const report = matchAndValidate(handlers, preloads, channelMap);
console.log(report.drifts.length);
```

### 現在の実測値

| 項目            | 値                                          |
| --------------- | ------------------------------------------- |
| Main handlers   | 216                                         |
| Preload entries | 189                                         |
| Drifts          | 197                                         |
| Orphans         | 119                                         |
| 実行時間        | 3.46秒                                      |
| Coverage        | Line 95.31% / Branch 90.84% / Function 100% |

### エラーハンドリング

- `--strict` は error レベルの drift を検出したときだけ exit 1 を返し、CI やローカル品質ゲートに組み込みやすい
- `--report-only` は drift が残っていても exit 0 を返すため、棚卸しや現状把握で使う
- static parsing が完全に解けないケースは `unknown` として残し、誤った「完全一致」判定を避ける
- JSON 出力は `jq` で処理できる形を維持し、壊れた場合は Phase 9/12 の検証で即検出する

### エッジケース

- `safeInvoke<T>` / `safeOn<T>` の generic 呼び出し
- 複数行にまたがる preload 呼び出し
- `CHANNELS.FOO` や `CHAT_EDIT_CHANNELS.BAR` のような full-ref 解決
- alias / 再export / 動的定数は完全対応しておらず、EXT-002 へ分離
- tuple array main registration は未抽出で、EXT-001 へ分離

### 既知の制約

| 制約ID | 内容                                                                    | 対応未タスク          |
| ------ | ----------------------------------------------------------------------- | --------------------- |
| C-01   | `[IPC_CHANNELS.X, handler]` 形式のタプル配列経由 main 登録は未抽出      | UT-TASK06-007-EXT-001 |
| C-02   | エイリアス / 再export / 動的定数経由のチャンネル解決は完全ではない      | UT-TASK06-007-EXT-002 |
| C-03   | `ipcMain.on` と `safeOn` の parity はまだノイズが多い                   | UT-TASK06-007-EXT-003 |
| C-04   | 単一ファイル 578 行で NFR-05 の目安を超過                               | UT-TASK06-007-EXT-004 |
| C-05   | R-02 は object vs primitive 中心の heuristic で、P45 完全自動化ではない | UT-TASK06-007-EXT-005 |

### 設定項目と定数一覧

| 項目                     | 現在値 / 形式       | 用途                                   |
| ------------------------ | ------------------- | -------------------------------------- |
| `--report-only`          | boolean             | 品質ゲートを fail させず棚卸しだけ行う |
| `--strict`               | boolean             | error drift を exit code 1 に変換する  |
| `--format`               | `markdown` / `json` | 人間向けと機械向けの出力を切り替える   |
| `PRELOAD_PATTERN`        | 正規表現            | preload 側呼び出し抽出                 |
| `CHANNEL_OBJECT_PATTERN` | 正規表現            | const object から channel map を抽出   |
| `R-01`〜`R-04`           | 4ルール             | drift / orphan の分類基準              |

### テスト観点

- generic / multiline preload extraction
- typed object handler classification
- full-ref channel resolution
- R-01〜R-04 の出力
- CLI の `report-only` / `strict` / `json`

### 注意

- このスクリプトは静的解析ベースであり、repo を「正常」と宣言するツールではない
- PASS は「診断器として機能する」ことを意味し、repo 内の drift 件数ゼロを意味しない
- P45 の意味的ドリフトは follow-up で継続する
