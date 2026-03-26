# [#1458] "[UT-TERMINAL-DOCK-ABORTED-STATE-001] UT"

## メタ情報

```yaml
task_id: UT-TERMINAL-DOCK-ABORTED-STATE-001
task_name: UT
category: -
target_feature: -
priority: medium
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-ABORTED-STATE-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | medium     |
| 規模       | -          |
| ステータス | unassigned |

---

## 目的

Terminal Dock の状態遷移で `aborted` state の遷移条件・表示内容・CTA を定義し実装する。

## 背景

Phase 2 設計では Terminal Dock の state として `idle / handoff-pending / running / done` を定義した。しかし Phase 3 MINOR MN-2 として `aborted` state（ユーザーが実行を中止した場合）が未定義のまま残った。aborted 時の表示・CTA 不在は UX 上の断絶を招くため、後続実装タスクで解消が必要。

## 実行タスク

1. `aborted` state の遷移条件を定義する（どのトリガーで aborted に遷移するか）
2. `aborted` 時の UI 表示（メッセージ・アイコン・カラー）を定義する
3. `aborted` 時の CTA を定義する（「再試行」「ガイダンスに戻る」など）
4. `ui-ux-agent-execution-core.md` の状態遷移図に `aborted` state を追加する
5. Zustand Store の `terminalDockStatus` 型に `"aborted"` を追加する
6. TerminalDock コンポーネントに `aborted` state 表示を実装する

## 参照資料

| 参照資料                      | パス                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| contract-matrix.md            | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/contract-matrix.md   |
| validation-matrix.md          | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/validation-matrix.md |
| ui-ux-agent-execution-core.md | .claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md                                 |

## 受入基準

- [ ] `aborted` state の遷移条件が文書化されている
- [ ] `aborted` state の UI が実装されており、idle / done と視覚的に区別できる
- [ ] CTA が少なくとも 1 つ（「ガイダンスに戻る」等）実装されている
- [ ] `ui-ux-agent-execution-core.md` の状態遷移表が更新されている
- [ ] 既存の状態（idle / handoff-pending / running / done）の動作が壊れていない

## 注意事項

- Manual Boundary（MB-1〜MB-4）は aborted 状態でも有効: aborted 後に自動再試行してはいけない
- P31 対策: Zustand で `terminalDockStatus` は個別セレクタで取得する
