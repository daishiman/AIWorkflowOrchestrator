# Phase 1 要件定義書

## 1. 背景

Settings で保存した API キーと、チャット実行時に参照される API キーの保存先が分離され、実行時に「キー未設定」判定が発生する状態だった。

## 2. 機能要件

| 要件ID | 要件                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| RQ-A1  | `apiKey:save/delete/list` と `llm.send-chat` / `llm.stream-chat` が単一のキーソースを参照する |
| RQ-A2  | APIキー更新時に `LLMAdapterFactory` キャッシュを無効化する                                    |
| RQ-B1  | `ai.chat` と `llm.*` が同一 provider/model 選択を使う                                         |
| RQ-B2  | Renderer の選択状態を Main の実行設定へ同期する                                               |
| RQ-C1  | AuthKey 表示が `saved` / `env-fallback` / `not-set` を区別して一致する                        |
| RQ-C2  | APIキー保存先がローカル保存であることを仕様・UIで一貫化する                                   |

## 3. 非機能要件

| NFR-ID     | 要件                                       |
| ---------- | ------------------------------------------ |
| NFR-SEC-1  | 秘密情報をログ・エラーメッセージへ出さない |
| NFR-QUAL-1 | 変更範囲の型検査・テストを PASS させる     |
| NFR-SPEC-1 | aiworkflow-requirements 正本へ同期する     |

## 4. スコープ内/外

- スコープ内: APIキー連動、LLM選択同期、AuthKey表示契約、IPC/Preload型整合
- スコープ外: 新規プロバイダー追加、課金/利用量機能、RAG機能変更
