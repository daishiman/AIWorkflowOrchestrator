# 未タスク指示書: UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001

## メタ情報

```yaml
issue_number: 1459
```

## メタ情報

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001                              |
| 由来       | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 Phase 3 MINOR MN-3 |
| ステータス | unassigned                                                           |
| 優先度     | medium                                                               |
| 作成日     | 2026-03-22                                                           |
| 関連仕様書 | ui-ux-agent-execution-core.md                                        |

## 目的

`handoffGuidance` あり → `TerminalHandoffCard`、guidance-only → `GuidanceBlock` の使い分けルールをコード・ドキュメントに明記し、実装・テストで強制する。

## 背景

Phase 3 MINOR MN-3 として、`GuidanceBlock` と `TerminalHandoffCard` の使い分け基準が曖昧なまま残った。後続実装で誤った component が使われると、Manual Boundary が崩壊する（GuidanceBlock が TerminalHandoffCard の代わりに使われ、copy ボタンなど必須 CTA が欠如する）。

## 実行タスク

1. 使い分けルールを正式定義する:
   - `HandoffGuidance != null` の場合: 必ず `TerminalHandoffCard` を使う
   - guidance-only（`terminalCommand` なし）の場合: `GuidanceBlock` を使う
2. `ui-ux-agent-execution-core.md` にルールを追記する
3. `GuidanceBlock` の Props 定義に「`terminalCommand` を含む場合は `TerminalHandoffCard` を使うこと」の JSDoc コメントを追加する
4. Lint ルール（または ESLint カスタムルール）でルール違反を検出できるか検討し、可能であれば実装する
5. Consumer 5 件（Chat Edit / Runtime Agent / Runtime Skill / Skill Docs / GuidanceBlock）の現行実装がルールに準拠していることを確認する

## 参照資料

| 参照資料                      | パス                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| design-summary.md             | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md  |
| contract-matrix.md            | docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/contract-matrix.md |
| ui-ux-agent-execution-core.md | .claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md                               |

## 受入基準

- [ ] 使い分けルールが `ui-ux-agent-execution-core.md` に明記されている
- [ ] `GuidanceBlock` の Props に使い分けルールの JSDoc コメントが追加されている
- [ ] 5 consumer すべてがルールに準拠していることが確認されている（レビューまたはテスト）
- [ ] ルール違反を防ぐ仕組みが少なくとも 1 つ実装されている（Lint / test / JSDoc のいずれか）

## 注意事項

- P47 対策: CSS 変数ベースのスタイルテストで `TerminalHandoffCard` と `GuidanceBlock` の区別が視覚的にテスト可能であることを確認する
- P46 対策: `GuidanceBlock` の Props 型が HTML 標準属性と衝突していないことを確認する
