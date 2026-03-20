# Phase 10: 最終レビュー

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001           |
| フェーズ | Phase 10                                       |
| 機能名   | agentview-improve-route                        |
| 作成日   | 2026-03-17                                     |
| 依存     | Phase 9 成果物（outputs/phase-9/、全PASS済み） |

## 目的

多角的な観点から品質・整合性を検証し、Phase 1 で定義した受入基準との照合を行う。レビューゲートを通過した場合のみ Phase 11 へ進む。

## 実行タスク

### Task 1: 受入基準照合

- [ ] AgentView に改善 CTA バナーが表示されること
  - 表示条件: `selectedSkillName` が非空で、既存実行状態から「分析へ進める」と判定できること
  - 非表示条件: スキル未選択 / 空白のみ / 実行中 / 実行結果未成立
- [ ] CTA バナーのクリックで `setCurrentSkillName(trimmedName)` -> `setCurrentView("skillAnalysis")` が実行されること
- [ ] SkillAnalysisView に `onNavigateBack` コールバックが実装されていること
- [ ] SkillAnalysisView に `onNavigateToAgent` コールバックが実装されていること
- [ ] 既存 `onClose -> skillCenter` 契約が壊れていないこと
- [ ] P31 対策として個別セレクタのみを使用していること

### Task 2: セキュリティレビュー

- [ ] `selectedSkillName` / `currentSkillName` をそのまま `innerHTML` / `dangerouslySetInnerHTML` に渡していないか
- [ ] `contextIsolation: true`、`nodeIntegration: false` の設定が変更されていないか

### Task 3: アクセシビリティレビュー

- [ ] CTA バナー、戻るリンク、再実行ボタンに ARIA ラベルが付与されているか
- [ ] キーボード操作で到達できるか

### Task 4: パフォーマンスレビュー

- [ ] 不要な再レンダーが発生していないか
- [ ] 不要な新規 persistent state を追加していないか

### Task 5: コード品質レビュー

- [ ] `any` 型・`@ts-ignore` がゼロか
- [ ] 未使用 `import` がゼロか
- [ ] boolean 変数名が `is` / `has` / `can` / `should` プレフィックスか

### Task 6: テスト品質レビュー

- [ ] テスト間で状態が共有されていないか
- [ ] happy-dom 環境で `userEvent` を使用していないか

### Task 7: ドキュメント整合性確認

- [ ] Phase 2 設計と props / handoff / close 契約が一致しているか
- [ ] aiworkflow-requirements 正本（`ui-ux-navigation.md`, `workflow-skill-lifecycle-created-skill-usage-journey.md`, `workflow-skill-lifecycle-routing-render-view-foundation.md`）と一致しているか

### Task 8: レビュー判定

- [ ] `outputs/phase-10/review-result.md` に結果を記録する
- [ ] PASS / MINOR / MAJOR / CRITICAL を判定して記録する
- [ ] MINOR 指摘は全て未タスク仕様書候補としてリストアップする

## 参照資料

| 参照資料             | パス                                                                           | 内容                                                                |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Phase 1（要件定義）  | `phase-1-requirements.md`                                                      | AC-1〜AC-7 の原本を確認する                                         |
| Phase 2（設計）      | `phase-2-design.md`                                                            | `viewHistory` ベースの戻り導線設計を確認する                        |
| Phase 5（実装）      | `phase-5-implementation.md`                                                    | 実装対象と禁止事項を確認する                                        |
| Phase 9 品質結果     | `outputs/phase-9/qa-summary.md`                                                | lint / typecheck / test の結果を確認する                            |
| App.tsx              | `apps/desktop/src/renderer/App.tsx`                                            | `currentSkillName ?? "demo-skill"` と `onClose` baseline を確認する |
| navigationSlice      | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                    | `viewHistory` / `goBack()` 契約を確認する                           |
| review-gate-criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS / MINOR / MAJOR / CRITICAL の判定基準を確認する                |

## 統合テスト連携

- Phase 1 の AC と Phase 5 実装結果を 1:1 で照合する
- `selectedSkillName -> currentSkillName -> skillAnalysis` handoff と `viewHistory` ベースの戻り導線を統合観点で再確認する
- `onClose -> skillCenter` baseline が回帰していないことを確認する

## 成果物

```
outputs/phase-10/
  review-result.md
  minor-task-candidates.md
```

## 完了条件

- [ ] 全チェック項目を実施済み
- [ ] 判定が PASS または MINOR
- [ ] MINOR 指摘が全て未タスク仕様書候補に変換されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次 Phase

PASS / MINOR -> Phase 11: 手動テスト
MAJOR -> 該当 Phase へ戻る
CRITICAL -> Phase 1: 要件定義 へ戻る
