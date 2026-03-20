# Phase 11: 手動テスト

## メタ情報

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001                    |
| フェーズ | Phase 11                                                |
| 機能名   | agentview-improve-route                                 |
| 作成日   | 2026-03-17                                              |
| 依存     | Phase 10 成果物（outputs/phase-10/、PASS or MINOR済み） |

## 目的

Electron Desktop Renderer の実画面で、AgentView 実行完了後の CTA 表示、`currentSkillName` handoff、SkillAnalysisView の Agent 起点戻り導線、ダークテーマ表示を目視確認する。

## 実行タスク

- Task 11-1 CTA 表示確認: completed 状態の AgentView で改善 CTA が表示されることを確認する
- Task 11-2 CTA 非表示確認: 未選択状態で CTA が表示されないことを確認する
- Task 11-3 CTA handoff 確認: CTA クリックで SkillAnalysisView に遷移し、対象スキル名が引き継がれることを確認する
- Task 11-4 戻る導線確認: SkillAnalysisView の「戻る」で AgentView に戻り、選択スキルが維持されることを確認する
- Task 11-5 再実行導線確認: SkillAnalysisView の「エージェントで再実行」で AgentView に戻り、再実行可能状態を維持することを確認する
- Task 11-6 ダークテーマ確認: ダークテーマでも CTA と実行履歴が崩れないことを確認する

## テストケース

| TC-ID    | シナリオ      | 目的                                             | 前提条件                                                                                   | 操作手順                                                          | 期待結果                                                                   |
| -------- | ------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| TC-11-01 | CTA visible   | 実行完了後の CTA 露出を確認する                  | `selectedSkillName="skill-alpha"`, `skillExecutionStatus="completed"`, `isExecuting=false` | 1. AgentView を表示 2. CTA バナーを確認                           | `aria-label="スキル改善提案"` の CTA と「分析する」ボタンが表示される      |
| TC-11-02 | CTA hidden    | 未選択時の非表示条件を確認する                   | `selectedSkillName=null`, `skillExecutionStatus=null`                                      | 1. AgentView を表示 2. CTA の有無を確認                           | CTA バナーが表示されず、実行ボタンは「ツールを選んでください」と表示される |
| TC-11-03 | CTA handoff   | Agent から SkillAnalysis への handoff を確認する | TC-11-01 と同じ                                                                            | 1. 「分析する」をクリック 2. SkillAnalysisView を確認             | `skill-analysis-view` が表示され、見出しが `skill-alpha` になる            |
| TC-11-04 | navigate back | 戻る導線で Agent に復帰できるか確認する          | `viewHistory=["dashboard","agent","skillAnalysis"]`                                        | 1. SkillAnalysisView を表示 2. 「戻る」をクリック                 | AgentView に戻り、`skill-alpha` が選択されたまま CTA も表示される          |
| TC-11-05 | rerun handoff | 再実行導線で Agent に復帰できるか確認する        | TC-11-04 と同じ                                                                            | 1. SkillAnalysisView を表示 2. 「エージェントで再実行」をクリック | AgentView に戻り、`skill-alpha` が選択されたまま再実行ボタンが有効である   |
| TC-11-06 | dark theme    | ダークテーマの崩れを確認する                     | TC-11-01 と同じ + `theme=dark`                                                             | 1. ダークテーマで AgentView を表示                                | CTA と実行履歴が dark token で描画され、可読性が維持される                 |

## 画面カバレッジマトリクス

| TC-ID    | 対象画面          | 変更要素                                            | 証跡                                                        |
| -------- | ----------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| TC-11-01 | AgentView         | CTA バナー表示、selected skill chip、execute button | `screenshots/TC-11-01-agent-cta-visible-light.png`          |
| TC-11-02 | AgentView         | CTA 非表示、execute button disabled state           | `screenshots/TC-11-02-agent-cta-hidden-light.png`           |
| TC-11-03 | SkillAnalysisView | Agent 起点の戻るリンク、analysis 結果、再実行ボタン | `screenshots/TC-11-03-skill-analysis-from-agent-light.png`  |
| TC-11-04 | AgentView         | `goBack()` 後の selected skill 維持                 | `screenshots/TC-11-04-agent-return-from-analysis-light.png` |
| TC-11-05 | AgentView         | `onNavigateToAgent()` 後の selected skill 維持      | `screenshots/TC-11-05-agent-rerun-from-analysis-light.png`  |
| TC-11-06 | AgentView         | ダークテーマの CTA・実行履歴視認性                  | `screenshots/TC-11-06-agent-cta-visible-dark.png`           |

## 参照資料

| 参照資料              | パス                                                                                | 内容                                                 |
| --------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Phase 1（要件定義）   | `phase-1-requirements.md`                                                           | 手動確認する AC を再確認する                         |
| Phase 2（設計）       | `phase-2-design.md`                                                                 | `viewHistory` ベースの戻り導線設計を確認する         |
| Phase 5（実装）       | `phase-5-implementation.md`                                                         | 実装した CTA / handoff / close 契約を確認する        |
| Phase 6 成果物        | `outputs/phase-6/test-additions.md`                                                 | 追加した境界値 / 異常系テスト観点を確認する          |
| Phase 7 成果物        | `outputs/phase-7/gate-result.md`                                                    | coverage gate の到達結果を確認する                   |
| Phase 8 成果物        | `outputs/phase-8/refactoring-log.md`                                                | リファクタリング後の確認観点を引き継ぐ               |
| Phase 9 成果物        | `outputs/phase-9/qa-summary.md`                                                     | lint / typecheck / test / build の通過結果を確認する |
| Phase 10 レビュー結果 | `outputs/phase-10/review-result.md`                                                 | 手動テストへ持ち越された確認項目を確認する           |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                                 | `skillAnalysis` baseline 契約を確認する              |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                         | `viewHistory` / `goBack()` の挙動を確認する          |
| screenshot guide      | `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md` | screenshot 証跡の取り方を確認する                    |

## 実行手順

1. arm64 Node で `pnpm --filter @repo/desktop run screenshot:skill-lifecycle-routing-step03` を実行する
2. `phase11-agentview-improve-route.html` harness で TC-11-01〜06 を再現する
3. `phase11-capture-metadata.json` の selector / theme / selected skill を確認する
4. `manual-test-result.md` と `screenshot-coverage.md` に実績を転記する

## 統合テスト連携

- AC-1〜AC-7 のうち目視確認が必要な項目を screenshot と手順で追跡する
- `viewHistory` ベースの戻り導線、`onClose -> skillCenter`、`currentSkillName` handoff を実機操作で再確認する
- 発見事項は `outputs/phase-11/issues.md` に記録し、戻り先 Phase を明記する

## 成果物

```
outputs/phase-11/
  manual-test-checklist.md
  manual-test-result.md
  manual-test-report.md
  ui-sanity-visual-review.md
  screenshot-plan.json
  screenshot-coverage.md
  screenshots/
    TC-11-01-agent-cta-visible-light.png
    TC-11-02-agent-cta-hidden-light.png
    TC-11-03-skill-analysis-from-agent-light.png
    TC-11-04-agent-return-from-analysis-light.png
    TC-11-05-agent-rerun-from-analysis-light.png
    TC-11-06-agent-cta-visible-dark.png
    phase11-capture-metadata.json
  issues.md
```

## 完了条件

- [x] 全テストケース（TC-11-01〜06）が PASS
- [x] スクリーンショット 6 枚と capture metadata が保存済み
- [x] Agent 起点の戻り導線と再実行導線が目視確認済み
- [x] ライト/ダーク両モードで表示が正常
- [x] **本Phase内の全タスクを100%実行完了**

## 次 Phase

→ Phase 12: ドキュメント
