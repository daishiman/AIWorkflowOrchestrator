# Phase 4: テスト計画書

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## テストファイル一覧

| #   | ファイル                                  | テスト数 | 対象                        |
| --- | ----------------------------------------- | -------- | --------------------------- |
| 1   | `AgentView.cta.test.tsx`                  | 10       | CTA バナー表示条件・handoff |
| 2   | `SkillAnalysisView.navigation.test.tsx`   | 9        | Props 拡張・戻り/再実行導線 |
| 3   | `App.renderView.viewtype.test.tsx` (追記) | 7 (新規) | App.tsx handoff 注入・回帰  |

## テストケース一覧

### Task 4-1: AgentView CTA バナー (10ケース)

| #   | ケース                                      | AC   |
| --- | ------------------------------------------- | ---- |
| 1   | 非空 + completed + !isExecuting -> CTA 表示 | AC-1 |
| 2   | isExecuting=true -> CTA 非表示              | AC-6 |
| 3   | status=running -> CTA 非表示                | AC-6 |
| 4   | status=error -> CTA 非表示                  | AC-6 |
| 5   | status=null -> CTA 非表示                   | AC-6 |
| 6   | selectedSkillName=null -> CTA 非表示        | AC-6 |
| 7   | selectedSkillName="" -> CTA 非表示          | AC-6 |
| 8   | selectedSkillName=" " -> CTA 非表示         | AC-6 |
| 9   | CTA クリックで trim + handoff 順序          | AC-2 |
| 10  | CTA の aria-label 確認                      | AC-7 |

### Task 4-2: SkillAnalysisView navigation (9ケース)

| #   | ケース                                       | AC   |
| --- | -------------------------------------------- | ---- |
| 1   | onClose のみで描画（後方互換）               | AC-3 |
| 2   | onNavigateBack あり -> 戻りリンク表示        | AC-3 |
| 3   | onNavigateBack なし -> 戻りリンク非表示      | AC-3 |
| 4   | onNavigateToAgent あり -> 再実行ボタン表示   | AC-4 |
| 5   | onNavigateToAgent なし -> 再実行ボタン非表示 | AC-4 |
| 6   | 戻りリンクのクリックでコールバック           | AC-3 |
| 7   | 再実行ボタンのクリックでコールバック         | AC-4 |
| 8   | 両 prop 追加後も onClose 機能                | AC-3 |
| 9   | Tab 到達可能                                 | AC-7 |

### Task 4-3/4-4: App.tsx handoff 注入 + 統合 (7ケース)

| #        | ケース                                            | AC         |
| -------- | ------------------------------------------------- | ---------- |
| TC-SA-01 | agent 前遷移時 -> props 注入                      | AC-3, AC-4 |
| TC-SA-02 | skillCenter 前遷移時 -> props undefined           | AC-3       |
| TC-SA-03 | viewHistory 1要素 -> props undefined              | AC-3       |
| TC-SA-04 | onClose 回帰テスト                                | 回帰       |
| TC-SA-05 | demo-skill フォールバック回帰テスト               | 回帰       |
| TC-SA-06 | onNavigateBack -> goBack() 実行                   | AC-3       |
| TC-SA-07 | onNavigateToAgent -> setCurrentView("agent") 実行 | AC-4       |

## モック設計

- store: `vi.mock("../../../store")` パターン踏襲
- 個別セレクタは `vi.fn(() => defaultValue)` でモック
- P39: `fireEvent` のみ使用（`userEvent` 禁止）
- P31: 合成 Hook 未使用を確認

## カバレッジ目標

| 指標     | 目標 |
| -------- | ---- |
| Line     | 80%+ |
| Branch   | 60%+ |
| Function | 80%+ |
