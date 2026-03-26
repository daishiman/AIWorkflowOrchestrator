# [#1460] "[UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001] UT"

## メタ情報

```yaml
task_id: UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001
task_name: UT
category: -
target_feature: -
priority: medium
scale: -
status: blocked（Task06 Transcript Provenance 完了待ち）
source_phase: -
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001.md
```

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| 優先度     | medium                                           |
| 規模       | -                                                |
| ステータス | blocked（Task06 Transcript Provenance 完了待ち） |

---

## 目的

Terminal Dock を閉じ再度開いた際に transcript が保持される session persistence 機構を実装する。

## 背景

Phase 2 設計で Terminal Dock の `transcript` 保持が要件に含まれていたが、Task06 Transcript Provenance との依存関係から実装を後続タスクに分離した。Dock を開閉するたびにターミナルの実行履歴が消えると、ユーザーが再度コマンドを実行するための文脈を失い、handoff の価値が著しく低下する。

## ブロッカー

Task06 Transcript Provenance が完了し、session ID / transcript 保存形式が確定するまで着手不可。

## 実行タスク（Task06 完了後）

1. Task06 の transcript 保存 API を確認する
2. Terminal Dock の session ID 割り当て方式を定義する（セッション開始タイミング・終了タイミング）
3. transcript を Zustand Store または IPC 経由で永続化する仕組みを実装する
4. Dock 再オープン時に transcript を復元する処理を実装する
5. transcript の最大保持件数・保持期間を定義し実装する

## 参照資料

| 参照資料                      | パス                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| design-summary.md             | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md |
| ui-ux-agent-execution-core.md | .claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md                              |

## 受入基準

- [ ] Terminal Dock を閉じて再オープンした際に直前の transcript が表示される
- [ ] transcript の最大保持件数・期間が実装されている
- [ ] session ID が一意に割り当てられており、複数 session が混在しない
- [ ] unit test でセッション復元の動作が検証されている

## 注意事項

- P5 対策: IPC リスナー登録は一度だけ実行され、二重登録しないようガードする
- P31 対策: transcript の個別セレクタで取得し、合成 Hook の無限ループを避ける
- Manual Boundary との整合: transcript 保持により auto-send が発生してはいけない
