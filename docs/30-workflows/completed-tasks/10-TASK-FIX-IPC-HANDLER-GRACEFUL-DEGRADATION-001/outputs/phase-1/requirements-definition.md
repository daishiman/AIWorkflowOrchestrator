# 要件定義書: IPC Handler Graceful Degradation

## メタ情報

| 項目         | 値                                               |
| ------------ | ------------------------------------------------ |
| タスクID     | 10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| Phase        | 1 - 要件定義                                     |
| 対象ファイル | `apps/desktop/src/main/ipc/index.ts`             |
| 作成日       | 2026-03-08                                       |
| エラーコード | 4001 (Infrastructure Error)                      |

## 1. 背景・問題

`registerAllIpcHandlers()` は複数の `registerXxxHandlers()` を順番に呼び出して IPC ハンドラを登録する。従来は 1 件でも例外が発生すると後続の登録が中断され、Renderer から見ると無関係な機能までまとめて利用不能になっていた。

## 2. 機能要件

### FR-01: 個別失敗が後続登録を阻害しない

- 各 `registerXxxHandlers()` の失敗は他の `registerXxxHandlers()` の実行を止めないこと
- 1 つのドメイン障害が、依存関係のない後続ドメインへ波及しないこと

### FR-02: 失敗ハンドラ名とエラー詳細を記録する

- 失敗した `registerXxxHandlers()` の識別子をログへ残すこと
- エラー詳細は記録するが、内部ファイルパスや環境値の露出は避けること

### FR-03: 登録結果を構造化して返却する

- `registerAllIpcHandlers()` は成功数・失敗数・失敗一覧を返却できること
- 戻り値追加により既存呼び出し元を壊さないこと

### FR-04: `unregisterAllIpcHandlers()` が部分失敗後も安全に動作する

- 一部ハンドラが未登録でも全解除フローが安全に完了すること
- `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` の再登録フローが成立すること

## 3. 非機能要件

### NFR-01: 正常系の性能退行を最小限に抑える

- try-catch 導入による起動時オーバーヘッドが実用上無視できること

### NFR-02: ログ最小化と情報秘匿

- スタックトレースをログへ出力しないこと
- ユーザーホーム配下の絶対パスや環境値をそのまま残さないこと

### NFR-03: Infrastructure Error として分類する

- 失敗記録のエラーコードは 4001 を用いること

## 4. 障害シナリオ

| シナリオ | 発生条件                              | 期待動作                                                           |
| -------- | ------------------------------------- | ------------------------------------------------------------------ |
| DS-01    | 依存なしハンドラが例外を投げる        | 失敗を記録し、後続ハンドラは継続登録される                         |
| DS-02    | Supabase 依存ハンドラで例外が発生する | Auth/Profile/Avatar の失敗を記録し、後続登録は継続される           |
| DS-03    | SkillService 系初期化が失敗する       | Skill 系の失敗を記録し、AuthKey/AuthMode/ChatEdit は継続登録される |
| DS-04    | `setupThemeWatcher()` が失敗する      | watcher 失敗を記録し、他ハンドラは継続登録される                   |
| DS-05    | 部分失敗後に再登録フローを実行する    | unregister/register がどちらも安全に完了する                       |

## 5. 制約事項

- 既存 IPC チャンネル契約（チャンネル名・引数・戻り値）を変更しない
- Main Process 内部の戻り値追加は許容するが、Renderer 公開契約は増やさない
- `themeWatcherUnsubscribe` のような非 IPC リスナーも解除対称性の対象に含める
