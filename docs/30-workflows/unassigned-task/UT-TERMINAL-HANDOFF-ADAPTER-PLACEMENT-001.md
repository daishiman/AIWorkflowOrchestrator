# 未タスク指示書: UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001

## メタ情報

```yaml
issue_number: 1457
```

## メタ情報

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001                                                  |
| 由来       | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 Phase 3 MINOR MN-1                       |
| ステータス | unassigned                                                                                 |
| 優先度     | high（後続実装タスクのブロッカー）                                                         |
| 作成日     | 2026-03-22                                                                                 |
| 関連仕様書 | interfaces-agent-sdk-skill-reference-share-debug-analytics.md / llm-workspace-chat-edit.md |

## 目的

`toHandoffGuidance()` adapter 関数の配置先（`packages/shared/` vs 各 service 内 vs `apps/desktop/src/main/`）を確定し、実装する。

## 背景

Phase 2 設計で `HandoffGuidance` 型を統一 DTO として定義した。Consumer ごとの変換ロジック（`toHandoffGuidance()`）の配置先は Phase 3 MINOR MN-1 として未確定のまま残っていた。後続実装タスクが着手する前に配置先を確定しないと、コード重複または import サイクルが発生するリスクがある。

## 実行タスク

1. 配置先の選定基準を定義する（`packages/shared/` / 各 service / `apps/desktop/src/main/adapters/`）
2. 各 consumer の変換ロジックが持つ依存関係を調査する
3. 配置先を確定し、設計文書に記録する
4. `toHandoffGuidance()` adapter 関数を確定配置先に実装する（1 関数）
5. 既存の `TerminalHandoffBundle` → `HandoffGuidance` 変換ロジックを統合する

## 参照資料

| 参照資料                                                   | パス                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 設計 design-summary.md                                     | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md        |
| implementation-guide.md                                    | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/implementation-guide.md |
| interfaces-agent-sdk-skill-reference-share-debug-analytics | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md     |
| llm-workspace-chat-edit                                    | .claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md                                        |

## 受入基準

- [ ] `toHandoffGuidance()` の配置先が決定し文書化されている
- [ ] Consumer 全 5 件（Chat Edit / Runtime Agent / Runtime Skill / Skill Docs / GuidanceBlock）の変換が統一パスで動作する
- [ ] unit test が作成されている（変換ロジックのカバレッジ 90% 以上）
- [ ] `packages/shared/` または `apps/desktop/src/main/` への配置が確定しており、import サイクルがない

## 注意事項

- P64 対策: 同名インターフェースの多重定義を避け、`HandoffGuidance` は `packages/shared/src/types/handoff.ts` の 1 箇所のみに定義する
- P44 対策: IPC ハンドラの引数形式と Preload 側の呼び出し形式が一致していることを確認する
