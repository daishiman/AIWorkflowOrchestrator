# Phase 5 実装サマリー

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| Phase    | 5                                  |
| 実施日   | 2026-04-14                         |

---

## 実装概要

### メインスクリプト

- **ファイル**: `scripts/verify-ipc-4layer.cjs`
- **行数**: 約811行（CommonJS 単一ファイル）
- **外部依存**: なし（`fs`, `path` のみ使用、NFR-2 準拠）
- **実行方法**: `node scripts/verify-ipc-4layer.cjs`

---

## モジュール構成

スクリプトは以下の4つの機能ブロックで構成される:

### 1. パーサー（4パーサー + チャネルマップ構築）

| 関数名                          | 行数  | 責務                                                                        |
| ------------------------------- | ----- | --------------------------------------------------------------------------- |
| `stripComments`                 | ~35行 | 文字列リテラル保護付きコメント除去（ステートマシン方式）                    |
| `parseSharedChannels`           | ~12行 | shared/channels.ts から `domain:operation` チャネル名を抽出                 |
| `parseSharedGroupMap`           | ~40行 | shared のグループ定数マップ構築（`CHAT_CHANNELS` -> `{KEY: "value"}` 形式） |
| `parsePreloadWhitelist`         | ~80行 | preload/channels.ts から invoke/on/defined チャネルを解決                   |
| `parseMainHandlersFromContent`  | ~60行 | ipcMain.handle/on パターンからチャネル名を抽出（6パターン対応）             |
| `parseMainHandlers`             | ~40行 | ディレクトリ走査版 main ハンドラパーサー                                    |
| `parseRendererUsageFromContent` | ~25行 | safeInvoke/safeOn パターンからチャネル名を抽出                              |
| `parseRendererUsage`            | ~35行 | ディレクトリ走査版 renderer パーサー                                        |
| `buildPreloadChannelMap`        | ~50行 | preload IPC_CHANNELS キー -> 値マップ構築                                   |

### 2. 参照解決

| 関数名                   | 行数  | 責務                                                                           |
| ------------------------ | ----- | ------------------------------------------------------------------------------ |
| `resolveMainChannelRefs` | ~50行 | `__IPC_CHANNELS_REF__:KEY` / `__CHANNELS_REF__:GROUP.KEY` を実チャネル名に解決 |

### 3. バリデーター（3バリデーター）

| 関数名                     | 行数  | 責務                                                      | ルール |
| -------------------------- | ----- | --------------------------------------------------------- | ------ |
| `validateSharedToPreload`  | ~10行 | shared チャネルが preload ホワイトリストに存在するか      | Rule-1 |
| `validatePreloadToMain`    | ~10行 | preload invoke チャネルが main ハンドラに実装されているか | Rule-2 |
| `validateRendererToShared` | ~10行 | renderer 使用チャネルが shared/preload に定義されているか | Rule-3 |

### 4. レポーター + エントリポイント

| 関数名         | 行数  | 責務                                                                             |
| -------------- | ----- | -------------------------------------------------------------------------------- |
| `formatReport` | ~25行 | バリデーション結果を人間可読テキスト + GitHub Actions annotations にフォーマット |
| `main`         | ~60行 | パーサー -> バリデーター -> レポーターのパイプライン実行                         |

---

## 主な実装ポイント

### stripComments: ステートマシン方式

正規表現ではなくステートマシン（文字ごとの走査）でコメントを除去する。文字列リテラル（ダブルクォート/シングルクォート/テンプレートリテラル）内のコメントパターン（`//`, `/*`）を保護する。エスケープシーケンス（`\"`, `\'`）も正しく処理する。

### spread 参照解決

`preload/channels.ts` 内の `...APPROVAL_CHANNELS` のような spread 構文を検出し、shared のグループマップ（`parseSharedGroupMap` の結果）から展開する。これにより、preload が shared の定数グループを spread インポートしている場合にもチャネル名を正しく解決する。

### 6種のハンドラ登録パターン検出

`parseMainHandlersFromContent` は以下の6パターンを検出する:

1. **直接文字列**: `ipcMain.handle("channel", ...)`
2. **定数参照**: `ipcMain.handle(IPC_CHANNELS.KEY, ...)`
3. **DI パターン**: `main.handle(CHANNELS.KEY, ...)`
4. **ラッパーパターン**: `registerXxxHandler(IPC_CHANNELS.KEY, ...)`
5. **ファクトリパターン**: `createIpcHandler<T>(IPC_CHANNELS.KEY, ...)`
6. **ローカル定数**: ファイル内の `const XXX = { KEY: "value" }` を構築し、参照を解決

### ローカル定数マップ

`parseMainHandlersFromContent` はファイル内の `const` ブロック定義を走査し、`localConstMap`（`Map<"CONST.KEY", "channel:name">`）を構築する。`ipcMain.handle(CONST.KEY)` 形式のハンドラ登録を検出した際に、このマップを使ってファイル内で参照解決を試みる。解決できない場合は `__IPC_CHANNELS_REF__:KEY` または `__CHANNELS_REF__:GROUP.KEY` マーカーを返し、後段の `resolveMainChannelRefs` で preload/shared のマップを使って解決する。

---

## CI 統合

### ワークフロー定義

`.github/workflows/ci.yml` に `verify-ipc-4layer` ジョブを追加:

```yaml
verify-ipc-4layer:
  name: IPC 4-Layer Alignment
  runs-on: ubuntu-latest
  timeout-minutes: 5
  env:
    ELECTRON_SKIP_BINARY_DOWNLOAD: 1
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"
    - name: Verify IPC 4-layer alignment
      run: node scripts/verify-ipc-4layer.cjs
```

### CI 統合ポイント

- `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` により Electron バイナリのダウンロードをスキップし、実行時間を短縮
- `pnpm install` 不要（外部依存なし、Node.js 組み込みモジュールのみ使用）
- `build-app` ジョブの `needs` に `verify-ipc-4layer` を追加し、4層整合チェックを必須化

---

## TDD Green 確認結果

```
✓ scripts/__tests__/verify-ipc-4layer/parsers.test.ts (34 tests)
✓ scripts/__tests__/verify-ipc-4layer/validators.test.ts (20 tests)
✓ scripts/__tests__/verify-ipc-4layer/reporter.test.ts (8 tests)
✓ scripts/__tests__/verify-ipc-4layer/e2e.test.ts (7 tests)

Test Files  4 passed (4)
Tests       78 passed (78)
```

- テストケース総数: 78件
- PASS: 78件
- FAIL: 0件
- 全テストが GREEN であることを確認
