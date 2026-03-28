# UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001: visible handoff / disclosure / execution host の Phase 11 screenshot 取得

## メタ情報

```yaml
task_id: UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001
task_name: visible handoff / disclosure / execution host の Phase 11 screenshot 取得
category: 品質保証
target_feature: Skill Creator governance bundle UI evidence
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-SDK-07 Phase 12 unassigned-task-detection（2026-03-28）
created_date: 2026-03-28
dependencies: [TASK-SDK-07]
```

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001                                 |
| タスク名     | visible handoff / disclosure / execution host の Phase 11 screenshot 取得 |
| 分類         | 品質保証                                                                  |
| 対象機能     | SkillLifecyclePanel の terminal_handoff + disclosure summary UI           |
| 優先度       | 中                                                                        |
| 見積もり規模 | 小規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | TASK-SDK-07 Phase 12 unassigned-task-detection                            |
| 発見日       | 2026-03-28                                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SDK-07 Phase 11 の手動テストで、visible handoff（`HandoffGuidance` 表示）、disclosure summary（`data-testid="skill-lifecycle-disclosure-summary"`）、execution host（integrated_api / terminal_handoff 分岐）の UI evidence が未取得のまま閉じた。

### 1.2 問題点・課題

- AC-6 の route state 固定が UI レベルで確認されていない
- disclosure summary の表示状態が screenshot で裏付けられていない
- `terminal_handoff` 分岐時の guidance 表示が目視確認できない

### 1.3 放置した場合の影響

- Phase 11 walkthrough の evidence chain が不完全なまま残る
- 将来の regression で UI レベルの破壊を検出しにくくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

Task07 で実装した governance bundle UI を手動操作で動作確認し、screenshot evidence を current workflow へ集約する。

### 2.2 最終ゴール

- terminal_handoff 状態の SkillLifecyclePanel screenshot
- disclosure summary 表示の screenshot
- integrated_api 成功後の screenshot（対照）

### 2.3 スコープ

#### 含むもの

- `SkillLifecyclePanel` 上の handoff guidance 表示
- `disclosure summary` セクションの表示確認
- `data-testid="skill-lifecycle-disclosure-summary"` の存在確認

#### 含まないもの

- Approval request surface（別タスク `UT-SDK-07-APPROVAL-REQUEST-SURFACE-001`）

---

## 3. 実行手順

1. desktop app を開発モードで起動し、Skill Creator を開く
2. API key なし（または degraded）状態で Plan 実行 → terminal_handoff 表示を確認・screenshot 取得
3. terminal_handoff 時に `fetchDisclosureInfo()` が呼ばれ disclosure summary が表示されることを確認
4. screenshot を `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` へ保存

---

## 4. 完了条件チェックリスト

- [ ] terminal_handoff 時の HandoffGuidance 表示 screenshot あり
- [ ] disclosure summary 表示 screenshot あり
- [ ] `screenshot-plan.json` に記録した capture ID と対応
- [ ] `outputs/phase-11/manual-test-result.md` に evidence 追記

---

## 5. 参照情報

- `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshot-plan.json`
- `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-12/implementation-guide.md`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
