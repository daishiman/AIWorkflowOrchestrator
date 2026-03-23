# UT-HANDOFF-SKILL-DOCS-CONSUMER-001

## メタ情報

| 項目      | 値                                                     |
| --------- | ------------------------------------------------------ |
| タスクID  | UT-HANDOFF-SKILL-DOCS-CONSUMER-001                     |
| タスク名  | Skill Docs Consumer (C4) の HandoffSource 追加         |
| 優先度    | low                                                    |
| 発生元    | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 Phase 3 MN-1 |
| 関連Issue | #1457                                                  |

## 目的

Skill Docs 画面からの handoff 起点が実装された時点で、`SkillDocsHandoffSource` を `HandoffSource` union に追加し、対応する `buildFromSkillDocs` 関数を実装する。

## 対象ファイル

- `apps/desktop/src/main/adapters/handoff/types.ts` - SkillDocsHandoffSource interface 追加、HandoffSource union 更新
- `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts` - buildFromSkillDocs 関数追加、switch case 追加
- `apps/desktop/src/main/adapters/handoff/index.ts` - re-export 追加
- `apps/desktop/src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts` - テストケース追加

## 備考

`toHandoffGuidance.ts` の TODO コメント（MN-1）を参照。exhaustive check により、union 更新後にコンパイルエラーで switch case の追加漏れが検出される。
