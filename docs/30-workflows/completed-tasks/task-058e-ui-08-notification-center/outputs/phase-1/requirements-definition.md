# Phase 1 要件定義書

## 概要

`task-058e` 原本、`task-056c` 既存通知ドメイン、現行 `NotificationCenter` 実装を突合した。現行は Bell 導線、未読バッジ、履歴同期、既読化の基盤はあるが、058e が要求する「お知らせ」文言、個別削除、相対時刻、Portal/a11y、Atomic Design 分割が未達である。

## 現行実体の棚卸し

| 観点                         | 現状                                                          | 判定                         |
| ---------------------------- | ------------------------------------------------------------- | ---------------------------- |
| Bell 導線                    | `AppLayout` ヘッダー右端に配置済み                            | 再利用                       |
| 履歴初期同期                 | `notification.getHistory({ limit: 100, offset: 0 })` 実装済み | 再利用                       |
| push 購読                    | `notification.onNew()` 実装済み                               | 再利用                       |
| 未読バッジ                   | Bell 上に数値バッジ実装済み                                   | 再利用                       |
| タイトル文言                 | `通知履歴`                                                    | 要是正                       |
| 一括操作                     | `すべて既読` と `すべて削除` の 2 操作                        | `すべて削除` を撤去          |
| 詳細表示                     | 1件のみ展開可能                                               | 再利用しつつ押下時既読へ変更 |
| 既読化起点                   | 個別の `既読にする` ボタン                                    | 項目押下時既読へ変更         |
| 時刻表示                     | `toLocaleString()` による固定日時                             | 相対時刻へ変更               |
| 個別削除                     | store action のみ存在、IPC/UI は未実装                        | 要補完                       |
| Portal / focus trap / Escape | 未実装                                                        | 要補完                       |
| theme 対応                   | CSS 変数依存で概ね追従                                        | 3 theme 実機確認が必要       |

## 機能要件

| ID    | 要件                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Bell アイコン押下でお知らせポップオーバーが開閉する                                                                              |
| FR-02 | ヘッダータイトルは常に `お知らせ` とする                                                                                         |
| FR-03 | ヘッダー操作は `すべて既読` と `閉じる` のみを提供する                                                                           |
| FR-04 | 通知一覧は時系列降順で表示し、filter/grouping UI は設けない                                                                      |
| FR-05 | 未読項目は 8px ドットと通常コントラスト、既読項目は減衰表示にする                                                                |
| FR-06 | 項目押下で 1 件のみインライン展開し、同時に既読化する                                                                            |
| FR-07 | 個別削除は左スワイプまたは代替ポインター操作で実行できる                                                                         |
| FR-08 | 0 件時は `EmptyState mood=\"celebrating\"` で `お知らせはありません` を表示する                                                  |
| FR-09 | `notification:get-history` / `notification:new` / `notification:mark-read` / `notification:mark-all-read` は既存契約を再利用する |
| FR-10 | 個別削除のため `notification:delete` を Renderer/Preload/Main に追加する                                                         |

## 非機能要件

| ID     | 要件                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------- |
| NFR-01 | `desktop` / `tablet` / `mobile` の 3 幅で表示破綻しない                                                   |
| NFR-02 | Bell と icon-only 操作は `aria-label` を持つ                                                              |
| NFR-03 | ポップオーバーは `role=\"dialog\"`、`aria-labelledby`、`aria-expanded`、`aria-haspopup=\"dialog\"` を持つ |
| NFR-04 | open 時にポップオーバー内へ focus を移し、close 時に Bell へ戻す                                          |
| NFR-05 | Escape / outside click / Tab wrap に対応する                                                              |
| NFR-06 | unread 数変化は `role=\"status\" aria-live=\"polite\"` で通知する                                         |
| NFR-07 | Store 参照は個別 selector のみを使い、P31 を回避する                                                      |
| NFR-08 | Renderer テストは `fireEvent` を優先し、`apps/desktop` 起点で実行する                                     |
| NFR-09 | delete channel は allowlist と sender 検証を通す                                                          |
| NFR-10 | 3 theme（light / dark / kanagawa-dragon）で unread dot と badge のコントラストを維持する                  |

## 差分収束方針

| 旧仕様/現行        | 058e 収束方針                                     |
| ------------------ | ------------------------------------------------- |
| `通知履歴`         | `お知らせ` に統一                                 |
| `すべて削除`       | UI から撤去し互換 channel は未使用化              |
| 固定日時表示       | 相対時刻 helper に置換                            |
| 単一コンポーネント | Popover/List/Header/Item/Badge 補助へ分割         |
| 個別既読ボタン     | 項目押下既読へ寄せる                              |
| 個別削除 UI なし   | swipe/代替削除 UI と `notification:delete` を追加 |

## Phase 5 への引き渡し条件

- `notification:clear` は後方互換として残すが UI では呼ばない
- `expandedNotificationId` は単一展開の正本 state とする
- delete は store 既存 action を活かし、IPC 成功後に state を同期する
- relative time と focus trap は NotificationCenter 内の helper/hook に分離する
