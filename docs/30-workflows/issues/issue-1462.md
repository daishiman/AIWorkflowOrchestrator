# [#1462] "[UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001] UT"

## メタ情報

```yaml
task_id: UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001
task_name: UT
category: -
target_feature: -
priority: medium
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | medium     |
| 規模       | -          |
| ステータス | unassigned |

---

## 目的

`SkillDocsCapabilityResult` から `HandoffGuidance` への adapter を実装し、Skill Docs surface で `TerminalHandoffCard` が表示されるパスを実現する。

## 背景

Phase 2 設計で Skill Docs surface を terminal-handoff consumer の 1 つとして定義した。しかし `SkillDocsCapabilityResult` → `HandoffGuidance` の変換ロジックが未実装のため、Skill Docs では `TerminalHandoffCard` が表示されない状態にある。

## 実行タスク

1. `SkillDocsCapabilityResult` の型定義を調査する
2. `skillDocsCapabilityToGuidance(result: SkillDocsCapabilityResult): HandoffGuidance` adapter 関数を実装する
3. Skill Docs 画面の `TerminalHandoffCard` 表示パスを実装する（IPC 経由で `HandoffGuidance` を受け取り表示する）
4. unit test で adapter 変換の動作を検証する
5. `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` に adapter 仕様を追記する

## 参照資料

| 参照資料                                                   | パス                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| design-summary.md                                          | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md        |
| implementation-guide.md                                    | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/implementation-guide.md |
| interfaces-agent-sdk-skill-reference-share-debug-analytics | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md     |

## 受入基準

- [ ] `skillDocsCapabilityToGuidance()` adapter が実装されている
- [ ] Skill Docs surface で handoff 発生時に `TerminalHandoffCard` が表示される
- [ ] unit test で adapter の正常系・異常系が検証されている
- [ ] `SkillDocsCapabilityResult` の内部情報（API key 等）が `HandoffGuidance` に漏洩していないことを確認する

## 注意事項

- NFR-1a 対策: `terminalCommand` に API key が含まれないことを unit test で検証する（`/sk-[A-Za-z0-9]+/` パターン）
- P64 対策: `HandoffGuidance` 型は `packages/shared/src/types/handoff.ts` の 1 箇所から import する
- Manual Boundary: adapter が自動的に `terminalCommand` を実行してはいけない
