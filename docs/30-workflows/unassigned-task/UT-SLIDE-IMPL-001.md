# UT-SLIDE-IMPL-001: Slide Modifier / agent-client 実装

## メタ情報

```yaml
issue_number: 1508
```

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | UT-SLIDE-IMPL-001                                          |
| 優先度   | HIGH                                                       |
| 依存     | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 完了 |
| 検出元   | Task08 Phase 12 unassigned-task-detection                  |
| 作成日   | 2026-03-23                                                 |

## 概要

ModifierResponse 拡張（fallback_reason, suggested_action optional）と agent-client.ts の Agent SDK adapter 化を実装する。SlideCapabilityDTO の IPC channel 名を確定し、P42 準拠の3段バリデーションを実装する。

## 主要ファイル

- apps/desktop/src/main/services/slide/modifier-skill.ts
- apps/desktop/src/main/services/slide/agent-client.ts
- apps/desktop/src/main/services/skill-executor.ts
- packages/shared/src/slide/types.ts（SlideCapabilityDTO / ModifierResponse 型定義）

## 要件

- ModifierResponse に fallback_reason / suggested_action optional フィールドを追加
- agent-client.ts を Agent SDK adapter 経由に移行
- SlideCapabilityDTO の IPC channel 名を確定（MN-01 追跡: `slide:capability:get` 仮）
- IPC channel を Preload allowlist に登録
- P42 準拠の3段バリデーション実装（型 → 空文字 → trim）

## 受入基準

- [ ] ModifierResponse に fallback_reason / suggested_action が optional として定義されている
- [ ] agent-client.ts が Agent SDK adapter 経由で動作する
- [ ] SlideCapabilityDTO の IPC channel 名が確定し allowlist に登録されている
- [ ] P42 準拠の3段バリデーションが全 IPC ハンドラに実装されている
- [ ] 型チェック（pnpm typecheck）PASS
- [ ] 関連テストが全て PASS

## 苦戦箇所（設計タスクで発見）

1. **standalone root 移設後の旧パス残存（L-TCPL-002 パターン）**: Task08 の仕様書を独立ディレクトリに移設した際、15ファイルに旧パス参照が残存した。実装時もディレクトリ構造変更後は `grep -rn '<old-path>'` で0件化を確認すること
2. **backlog ファイルパスと実ファイル名の乖離**: 指示書作成とbacklog登録を別タイミングで行うと命名が不一致になる。作成時に即座にbacklogパスを合わせること
3. **SlideCapabilityDTO の IPC channel 名未確定（MN-01）**: 設計時点では `slide:capability:get` を仮定義したが、実装時に既存 namespace との衝突を確認し確定する必要がある

## Gate 条件

- Task08（TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001）が完了していること
- cleanup 順序1,2（Task08 完了）が充足されていること

## 参照

| 参照資料           | パス                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 設計サマリー       | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/design-summary.md        |
| 契約マトリクス     | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/contract-matrix.md       |
| 実装ガイド         | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-12/implementation-guide.md |
| 状態管理仕様       | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                                         |
| IPC セキュリティ   | .claude/rules/04-electron-security.md                                                                                   |
| P42 バリデーション | .claude/rules/06-known-pitfalls.md#P42                                                                                  |
