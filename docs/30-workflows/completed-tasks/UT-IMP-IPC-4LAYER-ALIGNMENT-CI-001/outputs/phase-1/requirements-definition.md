# Phase 1 成果物: 要件定義書

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| タスク | タスク2: 要件抽出                  |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 概要

IPC 4層（shared / preload / main / renderer）の整合性を自動検証する CI スクリプト `scripts/verify-ipc-4layer.js` の要件を定義する。

### 解決する問題

- FB-SC-13-1: `ALLOWED_INVOKE_CHANNELS` への追記漏れが本番障害を引き起こした
- 4層間のチャネル同期は手動で行っており、漏れの検出手段がない
- 既存の `check-ipc-contracts.ts` は main<->preload 間のみ検証し、shared/renderer 層は対象外

### ゴール

GitHub Actions CI で 4 層間のチャネル定義不整合を自動検出し、不整合がある場合はCIを失敗させる。

---

## 2. 機能要件（FR）

### FR-1: shared -> preload 整合性検証

| 項目 | 内容                                                                                       |
| ---- | ------------------------------------------------------------------------------------------ |
| ID   | FR-1                                                                                       |
| 概要 | shared channels.ts で定義されたチャネルが preload whitelist に登録されていることを検証する |
| 入力 | `packages/shared/src/ipc/channels.ts`                                                      |
| 出力 | preload whitelist に未登録のチャネル一覧                                                   |
| 判定 | 未登録チャネルが 1 件以上存在すれば ERROR                                                  |

**詳細**:

- shared の `IPC_CHANNELS` に集約されたすべてのチャネル値を抽出する
- 個別 export（`SKILL_CREATOR_OUTPUT_READY` 等）も対象に含める
- preload の `ALLOWED_INVOKE_CHANNELS` または `ALLOWED_ON_CHANNELS` のいずれかに含まれることを検証する

### FR-2: preload -> main 整合性検証

| 項目 | 内容                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| ID   | FR-2                                                                                 |
| 概要 | preload の invoke whitelist のチャネルが main handler で実装されていることを検証する |
| 入力 | `apps/desktop/src/preload/channels.ts`, `apps/desktop/src/main/ipc/*.ts`             |
| 出力 | main handler に未実装のチャネル一覧                                                  |
| 判定 | 未実装チャネルが 1 件以上存在すれば ERROR                                            |

**詳細**:

- `ALLOWED_INVOKE_CHANNELS` に登録されたチャネルを対象とする（invoke = request-response パターン = `ipcMain.handle` 対応）
- `ALLOWED_ON_CHANNELS` は main -> renderer のプッシュ通知チャネルのため、`ipcMain.handle` ではなく `webContents.send` で送信される。main 側でのハンドラ登録は不要な場合があるため、**invoke のみ**を検証対象とする
- `apps/desktop/src/main/ipc/` 配下の `*Handlers.ts` / `*Handler.ts` / `*-handler.ts` / `*-handlers.ts` パターンのファイルを再帰スキャンする
- `ipcMain.handle('channel', ...)` パターンを正規表現で抽出する

### FR-3: renderer -> shared 整合性検証

| 項目 | 内容                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| ID   | FR-3                                                                              |
| 概要 | renderer で使用されるチャネルが shared channels.ts に定義されていることを検証する |
| 入力 | `apps/desktop/src/renderer/**/*.{ts,tsx}`, `packages/shared/src/ipc/channels.ts`  |
| 出力 | shared に未定義のチャネル一覧                                                     |
| 判定 | 未定義チャネルが 1 件以上存在すれば ERROR                                         |

**詳細**:

- renderer は直接チャネル名を使用しない。preload の `index.ts` が `safeInvoke(IPC_CHANNELS.XXX)` / `safeOn(IPC_CHANNELS.XXX)` で呼び出す
- preload `index.ts` および preload 配下の API ファイル（`skill-api.ts`, `skill-creator-api.ts` 等）の `safeInvoke`/`safeOn` 呼び出しを抽出する
- 抽出されたチャネルが shared の `IPC_CHANNELS` に定義されているか検証する
- **設計変更**: タスク仕様書では `apps/desktop/src/renderer/` を再帰スキャンする方針だったが、実態として renderer は `window.electronAPI` 経由で preload API を呼ぶため、直接チャネル名は renderer コードに現れない。代わりに preload が公開する全チャネルの上位集合として `ALLOWED_INVOKE_CHANNELS` + `ALLOWED_ON_CHANNELS` を「renderer が使用しうるチャネル」とみなし、これが shared に定義されているかを検証する

### FR-4: 不整合検出時のCI失敗

| 項目 | 内容                                                    |
| ---- | ------------------------------------------------------- |
| ID   | FR-4                                                    |
| 概要 | 未登録チャネル検出時に CI を失敗させる（exit code 1）   |
| 判定 | Rule-1, Rule-2, Rule-3 いずれかで ERROR があれば exit 1 |

### FR-5: 人間可読な検証結果出力

| 項目   | 内容                                                                   |
| ------ | ---------------------------------------------------------------------- |
| ID     | FR-5                                                                   |
| 概要   | 検証結果を人間が読みやすい形式で出力する                               |
| 出力先 | stdout（正常系）、stderr（エラー系）                                   |
| 形式   | テキストサマリー + GitHub Actions annotations（`::error`/`::warning`） |

### FR-6: 正規表現ベースの静的解析

| 項目 | 内容                                                          |
| ---- | ------------------------------------------------------------- |
| ID   | FR-6                                                          |
| 概要 | 正規表現ベースの静的解析で検証する（AST解析は初期スコープ外） |
| 理由 | Node.js 標準ライブラリのみで実行可能にするため                |

---

## 3. 非機能要件（NFR）

### NFR-1: CI実行時間

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| ID       | NFR-1                                                              |
| 要件     | CI実行時間 30秒以内                                                |
| 計測方法 | GitHub Actions のステップ実行時間                                  |
| 根拠     | 4層ファイルの合計行数は約 1,500 行程度。正規表現スキャンで十分高速 |

### NFR-2: 外部依存なし

| 項目 | 内容                                         |
| ---- | -------------------------------------------- |
| ID   | NFR-2                                        |
| 要件 | Node.js 単体で実行可能（外部パッケージ不要） |
| 制約 | `fs`, `path` のみ使用                        |
| 形式 | `.js` ファイル（TypeScript コンパイル不要）  |

### NFR-3: 既存スクリプト共存

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| ID     | NFR-3                                      |
| 要件   | 既存の `check-ipc-contracts.ts` と共存可能 |
| 関係   | 補完関係（機能重複は最小限）               |
| 独立性 | 相互参照・共有関数なし                     |

### NFR-4: 自動検出

| 項目 | 内容                                                   |
| ---- | ------------------------------------------------------ |
| ID   | NFR-4                                                  |
| 要件 | 新規チャネル追加時に手動メンテナンス不要               |
| 方法 | ファイルを動的にスキャンし正規表現でチャネルを自動抽出 |

---

## 4. 検証ルール定義

| ルール | 名称               | 式                                           | 判定  |
| ------ | ------------------ | -------------------------------------------- | ----- |
| Rule-1 | shared -> preload  | `shared_channels` ⊆ `preload_whitelist`      | ERROR |
| Rule-2 | preload -> main    | `preload_invoke_whitelist` ⊆ `main_handlers` | ERROR |
| Rule-3 | renderer -> shared | `preload_all_whitelist` ⊆ `shared_channels`  | ERROR |

### Rule-3 の設計根拠

renderer は preload API を通じてのみ IPC 通信を行うため、preload が公開するチャネル（`ALLOWED_INVOKE_CHANNELS` + `ALLOWED_ON_CHANNELS`）が「renderer から到達可能なチャネル」の完全集合である。これが shared 正本に定義されていることを検証することで、renderer -> shared の整合性を間接的に保証する。

ただし、preload には shared にない独自チャネルが多数存在する（例: `analytics:send`, `file:get-tree` 等）。これらは preload で独自に定義されたチャネルであり、shared に定義を要求するのは適切ではない。

**したがって Rule-3 は「renderer で使われるチャネルのうち、shared に定義があるべきチャネル」を特定する必要がある。** 現実的には:

- shared に定義されているチャネルは preload にも存在すべき（Rule-1）
- preload の invoke チャネルは main で handle されるべき（Rule-2）
- **Rule-3 は「preload whitelist に登録されているが shared にも preload IPC_CHANNELS にも定義がないチャネル」の検出**として実装する

実装上は Rule-3 を以下のように再定義する:

> preload の `safeInvoke`/`safeOn` で使用されるチャネルのうち、preload の `IPC_CHANNELS` に定義されていないものを検出する（ホワイトリストと IPC_CHANNELS 定義の整合性チェック）

---

## 5. 既存スクリプトとの機能分担

| 観点             | check-ipc-contracts.ts    | verify-ipc-4layer.js                                           |
| ---------------- | ------------------------- | -------------------------------------------------------------- |
| 目的             | main<->preload の品質検証 | 4層間のチャネル存在性検証                                      |
| 検証方向         | 双方向（main<->preload）  | 一方向 x 3（shared->preload, preload->main, renderer->shared） |
| 引数パターン検証 | YES                       | NO                                                             |
| 命名規則検証     | YES                       | NO                                                             |
| shared層検証     | NO                        | YES                                                            |
| renderer層検証   | NO                        | YES                                                            |
| 言語             | TypeScript                | JavaScript（Node.js標準のみ）                                  |
| CI統合           | なし                      | GitHub Actions job                                             |

---

## 6. 制約事項

1. **対象ファイル固定**: 4層のファイルパスは規約として固定する（動的ディスカバリは行わない）
2. **正規表現の限界**: コメントアウトされたチャネル定義は除外する必要がある（ブロックコメント対応）
3. **間接参照**: shared からインポートされたチャネル定数の間接参照を解決する必要がある
4. **preload 独自チャネル**: preload には shared にない独自チャネルが多数存在し、これは正当な状態である
