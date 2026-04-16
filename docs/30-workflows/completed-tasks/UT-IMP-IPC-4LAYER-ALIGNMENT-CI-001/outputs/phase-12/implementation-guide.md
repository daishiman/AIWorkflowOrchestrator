# Phase 12 成果物: 実装ガイド

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 12                                 |
| タスク | Task 12-1: 実装ガイド作成          |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

## Part 1: 概念的説明

### なぜ IPC 4層検証が必要か

IPC は、アプリの「表側」と「裏側」が決まった番号で会話するための仕組みである。番号が1つでも食い違うと、電話は鳴っても相手が出られない。見た目では問題がなくても、裏側では機能が止まる。

AIWorkflowOrchestrator では、この番号の流れが4段に分かれている。

1. **shared**: 公式の電話帳
2. **preload**: 電話交換台
3. **main**: 実際に対応する担当者
4. **renderer**: 電話をかける人

たとえば、ユーザーが「保存」を押したとする。renderer が番号を使って呼び出し、preload が許可された番号だけを通し、main が処理する。電話帳に書いてあるのに交換台に載っていない、あるいは交換台には載っているのに担当者がいない、というズレを CI が先に見つけるためにこの検証が必要になる。

### 何をするか

`verify-ipc-4layer.cjs` は、4つの層の番号が揃っているかを自動で確認する。どこで欠けているかを具体的に示し、CI を失敗させることで、更新漏れを人手ではなく機械で止める。

## Part 2: 技術詳細

### スクリプト API

| 項目             | 内容                                                  |
| ---------------- | ----------------------------------------------------- |
| エントリポイント | `node scripts/verify-ipc-4layer.cjs`                  |
| 引数             | なし                                                  |
| 依存             | Node.js 標準ライブラリのみ                            |
| 正常終了         | `exit code 0`                                         |
| 不整合検出       | `exit code 1`                                         |
| 出力             | stdout にルール判定、stderr に `::error::` 形式の詳細 |

### 公開 API

CommonJS の公開メンバーは 20 個である。

| 種別            | 名前                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| パーサー / 補助 | `stripComments`, `flattenSharedGroupMap`, `parseSharedChannels`, `parseSharedGroupMap`, `parsePreloadWhitelist`, `parseMainHandlers`, `parseMainHandlersFromContent`, `parseRendererUsage`, `parseRendererUsageFromContent`, `buildPreloadChannelMap`, `resolveMainChannelRefs` |
| バリデーター    | `validateSharedToPreload`, `validatePreloadToMain`, `validateRendererToShared`                                                                                                                                                                                                  |
| レポーター      | `formatReport`                                                                                                                                                                                                                                                                  |
| 定数 / エントリ | `PATHS`, `REF_IPC_CHANNELS`, `REF_CHANNELS`, `REF_PRELOAD`, `REF_STANDALONE`                                                                                                                                                                                                    |

### 解析パターン

| 対象            | 主なパターン                                                                              | 意図                               |
| --------------- | ----------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------- | ---------------------------- | -------------------------- |
| shared          | `["']([a-zA-Z][a-zA-Z0-9-]*:[a-zA-Z][a-zA-Z0-9:_-]*)["']`                                 | チャネル文字列を抽出する           |
| main 直呼び出し | `(?:ipcMain                                                                               | main                               | alias)\.(?:handle                      | on)\s*\(\s*([^,\n)]+)`       | `ipcMain` の直接登録を拾う |
| main ラッパー   | `(?:register\w\*(?:Handler                                                                | Handlers)                          | createIpcHandler)[^(]_\(\s_([^,\n)]+)` | 共通ラッパー経由の登録を拾う |
| main 配列       | `\[\s*([^,\]]+?)\s*,`                                                                     | フォールバック配列の先頭要素を拾う |
| renderer        | `safeInvokeUnwrap`, `safeInvoke`, `safeOn`, `invokeIpc`, `(?:window\.)?electronAPI(?:\?\. | \.)invoke`                         | renderer 側の利用を拾う                |

### 解析支援

| 関数                      | 役割                                                      |
| ------------------------- | --------------------------------------------------------- |
| `buildConstValueMap`      | ファイル内の `const` を名前から値へ解決する               |
| `collectIpcMainAliases`   | `ipcMain` のローカル alias を拾う                         |
| `resolveChannelReference` | 文字列、`IPC_CHANNELS.KEY`、外部マップ参照を1つの値に直す |
| `walkSourceFiles`         | `src` 配下を再帰走査して `.ts` / `.tsx` を読む            |

### CI 統合

`.github/workflows/ci.yml` では `verify-ipc-4layer` ジョブを独立実行する。現行定義は `actions/setup-node@v6` と Node.js 22 を使い、`node scripts/verify-ipc-4layer.cjs` を実行する。

```yaml
verify-ipc-4layer:
  name: IPC 4-Layer Alignment
  runs-on: ubuntu-latest
  timeout-minutes: 5
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v6
      with:
        node-version: "22"
    - run: node scripts/verify-ipc-4layer.cjs
```

`build` ジョブの `needs` にも含めているので、この検証が通らない限り後続のビルドへ進まない。

### エラー形式

出力は次の形になる。

```text
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: FAIL (8 missing)
  ::error::Rule-2: Channel "auth:start-oauth-flow" - preload invoke ホワイトリストのチャネルが main ハンドラに未実装
```

`::error::` は GitHub Actions の注釈としても読めるため、失敗箇所を UI 上で追いやすい。

### 現在の検証スナップショット

| コマンド                                              | 結果                                                |
| ----------------------------------------------------- | --------------------------------------------------- |
| `node scripts/verify-ipc-4layer.cjs`                  | Rule-1: 12 missing, Rule-2: 8 missing, Rule-3: PASS |
| `pnpm vitest run scripts/__tests__/verify-ipc-4layer` | 4 files / 113 tests / all pass                      |
| `python3 -c "import yaml; ..."`                       | `VALID`                                             |

Rule-1 と Rule-2 の残りは、`unassigned-task-detection.md` で既存 task family との対応関係として整理している。

### 既存スクリプトとの共存

| 観点 | `check-ipc-contracts.ts`             | `verify-ipc-4layer.cjs`                       |
| ---- | ------------------------------------ | --------------------------------------------- |
| 目的 | main と preload の契約詳細を検査する | 4 層の存在整合を広く確認する                  |
| 対象 | 既存ハンドラの引数・命名・契約       | shared / preload / main / renderer の存在関係 |
| 言語 | TypeScript                           | CommonJS JavaScript                           |
| 依存 | 既存の型・契約ユーティリティ         | Node.js 標準のみ                              |

役割は重なるが、判定する粒度が違う。前者は「呼び出し方」、後者は「番号が4層に揃っているか」を見る。
