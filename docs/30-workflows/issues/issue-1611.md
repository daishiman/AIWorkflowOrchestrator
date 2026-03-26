# [#1611] "[UT-IMP-SAFETY-GOV-A11Y-COMPLETION-001] Approval Sheet WCAG 2.1 AA アクセシビリティ完成"

## メタ情報

```yaml
task_id: UT-IMP-SAFETY-GOV-A11Y-COMPLETION-001
task_name: Approval Sheet WCAG 2.1 AA アクセシビリティ完成
category: 改善
target_feature: ApprovalSheet
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-IMP-SAFETY-GOV-A11Y-COMPLETION-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UT-IMP-SAFETY-GOV-A11Y-COMPLETION-001           |
| 優先度   | 中                                              |
| 元タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 検出日   | 2026-03-25                                      |
| 由来     | Phase 11 DI-5 / Phase 12 UT-5                   |

---

## 概要

Approval Sheet の WCAG 2.1 AA 準拠キーボードアクセシビリティを完成させる。現在 Escape キー（拒否）と初期フォーカス（拒否ボタン）は実装済みだが、Tab トラップとフォーカス管理の完全な仕様定義・実装が未達。

## 背景・苦戦箇所

Phase 11 の発見事項 DI-5 で、WCAG 2.1 AA 準拠のキーバインド仕様が未定義であることが指摘された。現在の実装状況:

**実装済み（APR-17, APR-18）:**

- Escape キーで `onReject` 発火（安全側デフォルト）
- 初期フォーカスが拒否ボタンに設定（`autoFocus` + `useEffect`）

**未実装:**

- フォーカストラップ（Approval Sheet 表示中にフォーカスがシート外に移動しない）
- Tab 順序の明示的制御（拒否 → 承認 → 詳細 の順序保証）
- `aria-modal` / `role="dialog"` の適切な設定
- スクリーンリーダー対応（`aria-live` で承認/拒否結果を通知）

苦戦が予想される点:

- happy-dom でのフォーカストラップテスト（Tab キーイベントの挙動が実ブラウザと異なる可能性）
- React の `FocusTrap` 実装パターン選択（自前実装 vs ライブラリ）

## 対応方針

1. Approval Sheet を `role="dialog" aria-modal="true"` に変更
2. 自前のフォーカストラップ実装（`onKeyDown` で Tab/Shift+Tab を制御）
3. Tab 順序: 拒否ボタン → 承認ボタン → 詳細ボタン（安全側優先）
4. 承認/拒否後に `aria-live="assertive"` で結果を通知

## 変更対象ファイル

| ファイル                                                                          | 変更種別 |
| --------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`                | 修正     |
| `apps/desktop/src/renderer/components/execution/__tests__/ApprovalSheet.test.tsx` | 修正     |

## 完了条件

- [ ] Approval Sheet に `role="dialog" aria-modal="true"` が設定されている
- [ ] フォーカストラップが動作する（Tab/Shift+Tab でシート内を循環）
- [ ] Tab 順序が 拒否 → 承認 → 詳細 の順序
- [ ] スクリーンリーダー向けの aria-live 通知がある
- [ ] WCAG 2.1 AA 準拠のキーバインドテストが PASS する
