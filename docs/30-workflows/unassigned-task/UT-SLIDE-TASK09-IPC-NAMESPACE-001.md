# UT-SLIDE-TASK09-IPC-NAMESPACE-001: slide IPC namespace 統一

## メタ情報

```yaml
issue_number: 1512
```

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | UT-SLIDE-TASK09-IPC-NAMESPACE-001               |
| 優先度   | MEDIUM                                          |
| 依存     | UT-SLIDE-IMPL-001 完了 + Task09 governance 承認 |
| 検出元   | Task08 Phase 12 unassigned-task-detection       |
| 作成日   | 2026-03-23                                      |

## 概要

slide:sync:_ legacy IPC channel を正規 namespace（`slide:_`）に統一し、dead-end channel を排除する。P65 対策として、dead-end namespace の発生を構造的に防止する。

## 主要ファイル

- apps/desktop/src/main/handlers/（slide 関連ハンドラ）
- apps/desktop/src/preload/channels.ts（allowlist）
- apps/desktop/src/preload/types.ts（Preload 型定義）

## 要件

- `slide:sync:status` → `slide:status` に統一
- `slide:sync:capability` → `slide:capability:get` に統一
- `slide:sync:fallback` → `slide:fallback:request` に統一
- 旧 channel 名の残存を grep で0件化
- Preload allowlist を更新
- Task09 governance に影響範囲の承認を得る

## 受入基準

- [ ] `slide:sync:*` namespace の channel が0件
- [ ] 全 slide IPC channel が `slide:*` 正規 namespace を使用
- [ ] Preload allowlist に正規 channel 名が登録されている
- [ ] P65 対策: dead-end channel が存在しない
- [ ] `grep -rn "slide:sync:" apps/desktop/src/` で0件

## 苦戦箇所（設計タスクで発見）

1. **P65 再発リスク（dead-end namespace）**: internal helper が独自 namespace で handler を登録すると、public surface と乖離して contract drift が発生する。namespace 追加は設計レビューで承認を必須とすること
2. **Task09 governance との調整**: この変更は Task09 の影響範囲に含まれるため、単独実施ではなく Task09 governance のスコープ内で実施する。着手前に Task09 の承認を得ること

## Gate 条件

- UT-SLIDE-IMPL-001（cleanup 順序5: agent-client Agent SDK adapter 化）が完了していること
- Task09 governance が承認していること

## 参照

| 参照資料                      | パス                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 契約マトリクス（セクション6） | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/contract-matrix.md |
| P65 詳細                      | .claude/rules/06-known-pitfalls.md#P65                                                                            |
| IPC セキュリティ原則          | .claude/rules/04-electron-security.md                                                                             |
| IPC 契約チェックリスト        | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md                                       |
