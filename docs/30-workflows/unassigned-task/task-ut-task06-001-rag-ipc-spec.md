# UT-TASK06-001 RAG state IPC チャンネル設計と仕様書整備

## メタ情報

```yaml
issue_number: 1351
```

## メタ情報

| 項目           | 内容                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| タスクID       | UT-TASK06-001                                                                   |
| タイトル       | RAG state IPC チャンネル設計と仕様書整備                                        |
| ステータス     | 未実施                                                                          |
| 優先度         | 中                                                                              |
| 発見元         | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 10 MINOR-01 / Phase 11 DI-0002 |
| 発見日         | 2026-03-17                                                                      |
| 関連タスク     | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                      |
| 関連仕様リンク | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`    |
| 担当想定       | Main / IPC / Spec                                                               |

## 1. なぜこのタスクが必要か（Why）

RAG state の扱いが Renderer と Main の間で暗黙化すると、状態管理の責務がぶれ、後続機能で IPC 契約ドリフトを起こしやすい。明示的なチャンネル設計と仕様書整備が必要である。

## 2. 何を達成するか（What）

RAG state に関する IPC チャンネル、payload、戻り値、責務境界を定義し、実装がその契約に従える状態を作る。

## 3. どのように実行するか（How）

- 現行の RAG state 更新点と参照点を洗い出す
- IPC channel 名、request/response 形式、error code を定義する
- aiworkflow-requirements に正本仕様を反映する

## 4. 実行手順

1. 現行の RAG state 利用箇所を列挙する。
2. Main / Renderer の責務境界を決める。
3. IPC 契約と TypeScript 型を定義する。
4. 仕様書へ反映し、必要なら未実装部分を追タスク化する。

## 5. 完了条件チェックリスト

- RAG state IPC 契約が 1 つの正本に整理されている
- request / response / error が定義されている
- 実装側が参照できる仕様導線がある

## 6. 検証方法

- 仕様書と既存実装の channel 名が一致することを確認する
- 型定義と IPC 実装の差分をレビューする

## 7. リスクと対策

- 暗黙状態が残る: 現行利用箇所の棚卸しを先に行う
- 型だけ整って実装責務が曖昧になる: Main / Renderer の責務境界を先に固定する

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `docs/30-workflows/unassigned-task/task-ut-task06-007-ipc-contract-drift-auto-detect.md`

## 9. 備考

実装より前に契約の正本を固めるタスクである。
