# 未タスク検出レポート: TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| タスクID | TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 |
| Phase    | 12（ドキュメント更新）                               |
| 作成日   | 2026-03-07                                           |
| 検出件数 | 2件                                                  |

## 検出方法

1. Phase 2 設計方針書の「リスク評価」セクションから scope 外項目を抽出
2. Phase 10 最終レビューの多角的チェック観点から残存課題を抽出
3. 実装時に発見した同パターンの未防御箇所を `grep` で横断検索

## 検出された未タスク

### UT-09-001: 他の Renderer コンポーネントにおける同パターンの iterable ガード不足

| 項目     | 値                                                                                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 検出元   | Phase 2 設計方針書の「task-04 との責務分離」テーブル                                                                                                                                          |
| 概要     | 本タスクでは ApiKeysSection のみを防御したが、他の Renderer コンポーネント（AgentView, EditorView 等）でも IPC 戻り値を配列前提で処理している箇所が存在する可能性がある                       |
| 優先度   | Medium                                                                                                                                                                                        |
| 想定対応 | `grep -rn "\.map\|\.find\|\.filter\|\.forEach\|for.*of" apps/desktop/src/renderer/` で iterable 前提の処理を横断検索し、IPC 戻り値を直接操作している箇所に `Array.isArray()` ガードを追加する |
| 影響範囲 | Renderer 層全体                                                                                                                                                                               |

### UT-09-002: Preload payload shape の型レベル検証強化

| 項目     | 値                                                                                                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 検出元   | Phase 12 仕様書の「実行タスク」（preload payload 単位の validation 強化候補）                                                                                                                                                            |
| 概要     | 現在の防御は Renderer 側の実行時チェック（`Array.isArray` 等）に依存しているが、Preload 層で `contextBridge.exposeInMainWorld` に渡す API オブジェクトの戻り値を共通の型ガード関数で検証するパターンを導入すると、防御の一貫性が向上する |
| 優先度   | Low                                                                                                                                                                                                                                      |
| 想定対応 | Preload 層に `validateResponseShape<T>(response: unknown): Result<T>` のような共通バリデーション関数を導入し、各 API メソッドの戻り値を正規化する                                                                                        |
| 影響範囲 | `apps/desktop/src/preload/index.ts` および関連する型定義                                                                                                                                                                                 |

## 未タスク管理チェックリスト

### UT-09-001

- [x] 本レポートに記載
- [x] `docs/30-workflows/unassigned-task/task-imp-settings-renderer-iterable-guard-rollout-001.md` に指示書作成
- [x] `task-workflow.md` 残課題テーブルに登録
- [x] `lessons-learned.md` に参照リンク追加

### UT-09-002

- [x] 本レポートに記載
- [x] `docs/30-workflows/unassigned-task/task-imp-preload-response-shape-validator-001.md` に指示書作成
- [x] `task-workflow.md` 残課題テーブルに登録
- [x] `lessons-learned.md` に参照リンク追加

## 備考

- 本タスクのスコープは ApiKeysSection に限定されており、上記の未タスクはスコープ外として意図的に除外した
- UT-09-001 は類似パターンの横展開であり、本タスクの防御パターン（optional chaining + 存在チェック + Array.isArray + null-safe）を他コンポーネントにも適用する内容
- UT-09-002 は Preload 層への共通バリデーション導入であり、task-04 の拡張として位置づけられる
