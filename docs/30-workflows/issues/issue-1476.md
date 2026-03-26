# [#1476] [UT-HANDOFF-SKILL-DOCS-CONSUMER-001] Skill Docs Consumer (C4) の HandoffSource 追加

## メタ情報

| 項目      | 値                                                     |
| --------- | ------------------------------------------------------ |
| タスクID  | UT-HANDOFF-SKILL-DOCS-CONSUMER-001                     |
| 優先度    | low                                                    |
| 発生元    | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 Phase 3 MN-1 |
| 関連Issue | #1457                                                  |

## 目的

Skill Docs 画面からの handoff 起点が実装された時点で、`SkillDocsHandoffSource` を `HandoffSource` union に追加し、`buildFromSkillDocs` 関数を実装する。

## 対象ファイル

- `apps/desktop/src/main/adapters/handoff/types.ts`
- `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`
- `apps/desktop/src/main/adapters/handoff/index.ts`
- `apps/desktop/src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts`

## 仕様書

`docs/30-workflows/unassigned-task/UT-HANDOFF-SKILL-DOCS-CONSUMER-001.md`
