# Phase 4 テスト仕様書

## メタ情報

| 項目           | 内容                               |
| -------------- | ---------------------------------- |
| タスクID       | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| Phase          | 4                                  |
| テスト対象     | `scripts/verify-ipc-4layer.cjs`    |
| テストフレーム | Vitest                             |
| テストケース数 | 78件                               |
| 作成日         | 2026-04-14                         |

---

## テスト対象

- **スクリプト**: `scripts/verify-ipc-4layer.cjs` (CommonJS 単一ファイル)
- **外部依存**: なし（`fs`, `path` のみ使用）
- **テスト用エクスポート**: `module.exports` でパーサー・バリデーター・レポーター関数を公開

---

## テストファイル構成

| テストファイル                                           | テスト数 | カテゴリ     |
| -------------------------------------------------------- | -------- | ------------ |
| `scripts/__tests__/verify-ipc-4layer/parsers.test.ts`    | 34件     | パーサー単体 |
| `scripts/__tests__/verify-ipc-4layer/validators.test.ts` | 20件     | バリデーター |
| `scripts/__tests__/verify-ipc-4layer/reporter.test.ts`   | 8件      | レポーター   |
| `scripts/__tests__/verify-ipc-4layer/e2e.test.ts`        | 7件      | E2E結合      |
| **合計**                                                 | **78件** |              |

---

## 1. パーサーテスト (34件)

### 1.1 stripComments (8件)

コメント除去ユーティリティのテスト。ステートマシン方式により文字列リテラル内のコメントパターンを保護する。

| #   | テストケース                                             | 検証内容                                        |
| --- | -------------------------------------------------------- | ----------------------------------------------- |
| 1   | 行コメントを除去する                                     | `//` コメントが除去され、コード部分が保持される |
| 2   | ブロックコメントを除去する                               | `/* ... */` が除去される                        |
| 3   | 複数行ブロックコメントを除去する                         | `/** ... */` JSDoc形式が除去される              |
| 4   | 文字列内のコメントパターンを保持する（ダブルクォート）   | `"http://..."` が保持される                     |
| 5   | 文字列内のコメントパターンを保持する（シングルクォート） | `'http://...'` が保持される                     |
| 6   | テンプレートリテラル内のコメントパターンを保持する       | `` `http://...` `` が保持される                 |
| 7   | エスケープされたクォートを正しく処理する                 | `\"` を含む文字列が正しくパースされる           |
| 8   | 空文字列を処理できる                                     | 空文字列入力で空文字列を返す                    |

### 1.2 parseSharedChannels (7件)

`shared/channels.ts` からチャネル名（`domain:operation` 形式）を抽出する。

| #   | テストケース                                                                    | 検証内容                                   |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | `export const XXX_CHANNELS = { ... } as const` パターンからチャネル名を抽出する | 標準パターンの正規表現マッチ               |
| 2   | コメント行を除外する                                                            | `stripComments` 連携によるコメント除外     |
| 3   | 複数 export ブロックに対応する                                                  | 複数グループからの集約                     |
| 4   | camelCase チャネル名を抽出する                                                  | `chat:exportSession` 形式への対応          |
| 5   | コロンを含む複合チャネル名を抽出する                                            | `skill:permission:request` 形式への対応    |
| 6   | 単独 export const 文字列リテラルを抽出する                                      | `export const X = "..." as const` パターン |
| 7   | 空コンテンツでは空の Set を返す                                                 | 境界値テスト                               |

### 1.3 parseSharedGroupMap (3件)

shared のグループ定数マップ（`CHAT_CHANNELS` -> `{ EXPORT: "chat:export" }`）を構築する。

| #   | テストケース                 | 検証内容                                  |
| --- | ---------------------------- | ----------------------------------------- |
| 1   | グループ定数マップを構築する | `Map<string, Map<string, string>>` の構造 |
| 2   | 単独 export const も取得する | 単独定数のマップ化                        |
| 3   | 複数グループを取得する       | 複数エクスポートブロックの集約            |

### 1.4 parsePreloadWhitelist (4件)

`preload/channels.ts` の `IPC_CHANNELS` + `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` から invoke/on/defined チャネルを解決する。

| #   | テストケース                                                           | 検証内容             |
| --- | ---------------------------------------------------------------------- | -------------------- |
| 1   | IPC_CHANNELS と ALLOWED_INVOKE_CHANNELS から invoke チャネルを解決する | 参照解決パイプライン |
| 2   | defined プロパティに IPC_CHANNELS の全チャネルを含む                   | 全定義チャネルの収集 |
| 3   | 空の場合、空の Set を返す                                              | 境界値テスト         |
| 4   | `{ invoke, on, defined }` の3プロパティを持つ                          | 戻り値構造の検証     |

### 1.5 parseMainHandlersFromContent (6件)

ファイル内容から `ipcMain.handle` / `ipcMain.on` パターンでチャネル名を抽出する。6種のハンドラ登録パターン（直接文字列/定数参照/DI/ラッパー/ファクトリ/ローカル定数）に対応。

| #   | テストケース                                              | 検証内容           |
| --- | --------------------------------------------------------- | ------------------ |
| 1   | `ipcMain.handle("channel", ...)` からチャネル名を抽出する | 直接文字列パターン |
| 2   | `ipcMain.on("channel", ...)` からチャネル名を抽出する     | on パターン        |
| 3   | IPC_CHANNELS.KEY 参照の場合、参照マーカーを返す           | 定数参照パターン   |
| 4   | コメント内のパターンを除外する                            | stripComments 連携 |
| 5   | 複数のハンドラを抽出する                                  | 複数パターン集約   |
| 6   | 空コンテンツでは空の Set を返す                           | 境界値テスト       |

### 1.6 parseMainHandlers (3件)

ディレクトリ走査版の main ハンドラパーサー。`*.ts` ファイルを再帰的に読み取り、テストファイルを除外する。

| #   | テストケース                                            | 検証内容                            |
| --- | ------------------------------------------------------- | ----------------------------------- |
| 1   | 一時ディレクトリ内の .ts ファイルからハンドラを抽出する | ディレクトリ走査 + ファイル読み込み |
| 2   | テストファイル (.test.ts) を除外する                    | テストファイル除外ロジック          |
| 3   | 存在しないディレクトリでは空の Set を返す               | エラーハンドリング                  |

### 1.7 parseRendererUsageFromContent (8件)

`safeInvoke` / `safeOn` のチャネル名を抽出する。ジェネリック型パラメータ付きパターンにも対応。

| #   | テストケース                                          | 検証内容                      |
| --- | ----------------------------------------------------- | ----------------------------- |
| 1   | `safeInvoke("channel", ...)` からチャネル名を抽出する | 直接文字列パターン            |
| 2   | `safeOn("channel", ...)` からチャネル名を抽出する     | on パターン                   |
| 3   | ジェネリック型パラメータ付きの safeInvoke を処理する  | `safeInvoke<T>(...)` パターン |
| 4   | ジェネリック型パラメータ付きの safeOn を処理する      | `safeOn<T>(...)` パターン     |
| 5   | IPC_CHANNELS.KEY 参照をチャネルマップで解決する       | 参照解決パターン              |
| 6   | チャネルマップがない場合、参照マーカーを返す          | フォールバック動作            |
| 7   | コメント内の safeInvoke を除外する                    | stripComments 連携            |
| 8   | 空コンテンツでは空の Set を返す                       | 境界値テスト                  |

### 1.8 parseRendererUsage (3件)

ディレクトリ走査版の renderer パーサー。`channels.ts`, `types.ts`, `types.d.ts` を走査対象から除外する。

| #   | テストケース                                                       | 検証内容                              |
| --- | ------------------------------------------------------------------ | ------------------------------------- |
| 1   | 一時ディレクトリ内の .ts ファイルから safeInvoke/safeOn を抽出する | ディレクトリ走査 + チャネルマップ連携 |
| 2   | channels.ts, types.ts, types.d.ts を走査対象から除外する           | 除外ルール                            |
| 3   | 存在しないディレクトリでは空の Set を返す                          | エラーハンドリング                    |

### 1.9 buildPreloadChannelMap (2件)

preload の `IPC_CHANNELS` オブジェクトからキー -> チャネル名のマップを構築する。

| #   | テストケース                                  | 検証内容           |
| --- | --------------------------------------------- | ------------------ |
| 1   | IPC_CHANNELS から キー -> 値 マップを構築する | 基本的なマップ構築 |
| 2   | 空の IPC_CHANNELS では空マップを返す          | 境界値テスト       |

---

## 2. バリデーターテスト (20件)

### 2.1 validateSharedToPreload (Rule-1: shared &#8838; preload) (6件)

shared で定義されたチャネルが preload ホワイトリストに登録されているかを検証する。

| #   | テストケース                                                | 検証内容                       |
| --- | ----------------------------------------------------------- | ------------------------------ |
| 1   | 正常系: 全チャネルが preload に登録されている場合 PASS      | rule="Rule-1", status="pass"   |
| 2   | 異常系: shared にあり preload にないチャネルがある場合 FAIL | missing にチャネル名が含まれる |
| 3   | 空の shared の場合 PASS                                     | 境界値テスト                   |
| 4   | 空の preload の場合、shared にチャネルがあれば FAIL         | 境界値テスト                   |
| 5   | 両方空の場合 PASS                                           | 境界値テスト                   |
| 6   | description プロパティが存在する                            | 戻り値構造の検証               |

### 2.2 validatePreloadToMain (Rule-2: preload &#8838; handler) (7件)

preload invoke ホワイトリストのチャネルが main ハンドラに実装されているかを検証する。

| #   | テストケース                                                     | 検証内容                           |
| --- | ---------------------------------------------------------------- | ---------------------------------- |
| 1   | 正常系: 全 invoke チャネルが main に実装されている場合 PASS      | rule="Rule-2", status="pass"       |
| 2   | 異常系: preload invoke にあり main にないチャネルがある場合 FAIL | missing にチャネル名が含まれる     |
| 3   | on チャネルは検証対象に含まれない (invoke のみ)                  | on チャネルが main に無くても PASS |
| 4   | 空の preload invoke の場合 PASS                                  | 境界値テスト                       |
| 5   | 空の main の場合、invoke にチャネルがあれば FAIL                 | 境界値テスト                       |
| 6   | 両方空の場合 PASS                                                | 境界値テスト                       |
| 7   | description プロパティが存在する                                 | 戻り値構造の検証                   |

### 2.3 validateRendererToShared (Rule-3: consumer &#8838; shared) (6件)

renderer で使用されたチャネルが shared/preload に定義されているかを検証する。

| #   | テストケース                                                            | 検証内容                       |
| --- | ----------------------------------------------------------------------- | ------------------------------ |
| 1   | 正常系: 全 renderer チャネルが shared/preload に定義されている場合 PASS | rule="Rule-3", status="pass"   |
| 2   | 異常系: renderer にあり shared/preload にないチャネルがある場合 FAIL    | missing にチャネル名が含まれる |
| 3   | 空の renderer の場合 PASS                                               | 境界値テスト                   |
| 4   | shared と preload.defined の和集合で判定する                            | 和集合ロジックの検証           |
| 5   | 全て空の場合 PASS                                                       | 境界値テスト                   |
| 6   | description プロパティが存在する                                        | 戻り値構造の検証               |

### 2.4 バリデーターテスト内訳集計

| バリデーター             | 正常系 | 異常系 | 境界値       | 構造検証     | 小計   |
| ------------------------ | ------ | ------ | ------------ | ------------ | ------ |
| validateSharedToPreload  | 1      | 1      | 3            | 1            | 6      |
| validatePreloadToMain    | 1      | 1      | 3            | 1 (+on除外1) | 7      |
| validateRendererToShared | 1      | 1      | 2 (+和集合1) | 1            | 6      |
| **合計**                 |        |        |              |              | **20** |

---

## 3. レポーターテスト (8件)

### 3.1 formatReport (8件)

バリデーション結果配列を人間可読なテキストレポートにフォーマットする。

| #   | テストケース                                 | 検証内容                                  |
| --- | -------------------------------------------- | ----------------------------------------- |
| 1   | 全ルール PASS のレポートを生成する           | hasErrors=false, "Passed: 3", "Failed: 0" |
| 2   | FAIL ルールがある場合 hasErrors=true を返す  | hasErrors=true, "FAIL" 含む               |
| 3   | FAIL 時に ::error:: アノテーションを含む     | GitHub Actions annotations 形式           |
| 4   | missing チャネル数をレポートに含む           | "FAIL (3 missing)" 形式                   |
| 5   | ヘッダーとサマリーセクションを含む           | "=== IPC 4-Layer ...", "--- Summary ---"  |
| 6   | 空の結果配列に対して正常なレポートを生成する | "Total rules: 0"                          |
| 7   | 全ルール FAIL のレポートを生成する           | "Passed: 0", "Failed: 3"                  |
| 8   | text プロパティが string 型である            | 戻り値型の検証                            |

---

## 4. E2E 結合テスト (7件)

### 4.1 テストフィクスチャ

テスト用に以下の4層フィクスチャを定義し、パイプライン全体を結合検証する:

- `SHARED_FIXTURE`: 3グループ6チャネル（FILE_CHANNELS, CHAT_CHANNELS, 単独定数）
- `PRELOAD_FIXTURE`: IPC_CHANNELS 7件 + ALLOWED_INVOKE/ON リスト
- `MAIN_HANDLER_FIXTURE`: ipcMain.handle 6件
- `RENDERER_FIXTURE`: safeInvoke 2件 + safeOn 1件

### 4.2 テストケース (7件)

| #   | テストケース                                                                | 検証内容                                                      | 対応要件   |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------- |
| 1   | 全ルール PASS の正常系シナリオ                                              | 4層フィクスチャ -> parse -> validate -> report 全パイプライン | AC-5, FR-5 |
| 2   | Rule-1 FAIL: shared に定義があるが preload ホワイトリストに漏れがあるケース | `test:two` が missing                                         | AC-2, FR-1 |
| 3   | Rule-2 FAIL: preload invoke に登録があるが main handler が未実装のケース    | `action:two` が missing                                       | AC-3, FR-2 |
| 4   | Rule-3 FAIL: renderer で使用するチャネルが shared/preload に未定義のケース  | `unknown:channel` が missing                                  | AC-4, FR-3 |
| 5   | 全ルール FAIL のシナリオでレポートに全エラーが含まれる                      | "Failed: 3" + 全チャネル名含む                                | FR-4, FR-5 |
| 6   | resolveMainChannelRefs が IPC_CHANNELS 参照を正しく解決する                 | 参照マーカー -> 実チャネル名解決                              | FR-6       |
| 7   | camelCase チャネル名が全パイプラインで正しく処理される                      | `chat:exportSession`, `skill:getDetail`                       | FR-6       |

---

## テストカバレッジ対象関数一覧

| 関数名                          | テストファイル     | テスト数 |
| ------------------------------- | ------------------ | -------- |
| `stripComments`                 | parsers.test.ts    | 8        |
| `parseSharedChannels`           | parsers.test.ts    | 7        |
| `parseSharedGroupMap`           | parsers.test.ts    | 3        |
| `parsePreloadWhitelist`         | parsers.test.ts    | 4        |
| `parseMainHandlersFromContent`  | parsers.test.ts    | 6        |
| `parseMainHandlers`             | parsers.test.ts    | 3        |
| `parseRendererUsageFromContent` | parsers.test.ts    | 8        |
| `parseRendererUsage`            | parsers.test.ts    | 3        |
| `buildPreloadChannelMap`        | parsers.test.ts    | 2        |
| `validateSharedToPreload`       | validators.test.ts | 6        |
| `validatePreloadToMain`         | validators.test.ts | 7        |
| `validateRendererToShared`      | validators.test.ts | 6 (+1\*) |
| `formatReport`                  | reporter.test.ts   | 8        |
| `resolveMainChannelRefs`        | e2e.test.ts        | 1        |
| (全パイプライン結合)            | e2e.test.ts        | 6        |

> (\*) validators.test.ts の validateRendererToShared は6件。E2E テストでも Rule-3 シナリオとして間接的に検証される。

---

## 要件トレーサビリティマトリクス

| 要件  | AC   | テストケース                                                               |
| ----- | ---- | -------------------------------------------------------------------------- |
| FR-1  | AC-2 | validateSharedToPreload 異常系, E2E Rule-1 FAIL                            |
| FR-2  | AC-3 | validatePreloadToMain 異常系, E2E Rule-2 FAIL                              |
| FR-3  | AC-4 | validateRendererToShared 異常系, E2E Rule-3 FAIL                           |
| FR-4  | AC-5 | E2E 全ルール PASS 正常系                                                   |
| FR-4  | AC-6 | E2E 全ルール FAIL シナリオ                                                 |
| FR-5  | -    | formatReport 全8件, E2E レポート検証                                       |
| FR-6  | -    | 全パーサーテスト (34件), resolveMainChannelRefs, camelCase パイプライン    |
| NFR-1 | -    | (Phase 11 手動テストで確認: 実行時間 30秒以内)                             |
| NFR-2 | -    | スクリプトが `fs`, `path` のみ使用 (コードレビューで確認済み)              |
| AC-1  | -    | (Phase 11 手動テストで確認: `node scripts/verify-ipc-4layer.cjs` 実行可能) |
| AC-7  | -    | `.github/workflows/ci.yml` に verify-ipc-4layer ジョブが追加済み           |
| AC-8  | -    | (Phase 11 手動テストで確認: 既存 CI ジョブへの影響なし)                    |
