# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 3                                    |
| Phase 名   | 設計レビュー                         |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | Phase 1（要件定義）、Phase 2（設計） |
| 後続 Phase | Phase 4（テスト作成）                |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

Phase 2 の設計が受入基準、依存タスク、current code anchor、aiworkflow-requirements 正本と整合するかをレビューし、PASS / MINOR / MAJOR を判定する。

## 実行タスク

- レビュー実施: 下記レビュー観点テーブルに沿って各観点を確認し、PASS / MINOR / MAJOR の判定根拠を整理する
- 判定記録: 設計レビュー報告書に判定結果と指摘事項を記録する

## レビュー観点テーブル

| #    | 観点                            | 確認内容                                                                                                                                                        | 重要度 |
| ---- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| R-01 | 受入基準との整合                | AC-1〜AC-7 が Phase 2 設計で全て充足できるか確認する                                                                                                            | 必須   |
| R-02 | AC-6 非表示条件の設計           | スキル未選択、空文字 / 空白のみ、実行中、または実行結果未成立で CTA が非表示になる設計か                                                                        | 必須   |
| R-03 | 依存タスク整合性                | Task01/02/03 と ViewType / analyze handoff / `currentSkillName` 契約が衝突しないか                                                                              | 必須   |
| R-04 | Task02/03 との責務境界          | SkillCenter / DetailPanel の既存 analyze handoff を重複実装していないか                                                                                         | 必須   |
| R-05 | SkillAnalysisView 後方互換性    | `onNavigateBack` / `onNavigateToAgent` 追加後も既存 `onClose -> skillCenter` 契約と既存呼び出し元が壊れないか                                                   | 必須   |
| R-06 | Zustand P31 対策                | state / action を個別セレクタで取得しており、合成 Hook 前提に戻っていないか                                                                                     | 必須   |
| R-07 | current code anchor 整合        | `selectedSkillName` は agentSlice、`currentSkillName` は navigationSlice という現行責務境界に一致しているか                                                     | 必須   |
| R-08 | 状態管理変更スコープ            | 新規 state を追加する場合、`currentView` / `viewHistory` / `currentSkillName` と衝突しないか                                                                    | 必須   |
| R-09 | Apple HIG 準拠（AC-7）          | スペーシング、色トークン、軽いアニメーション方針が適切か                                                                                                        | 必須   |
| R-10 | アクセシビリティ（WCAG 2.1 AA） | CTA と戻るリンクにキーボード操作 / ARIA ラベルが設計されているか                                                                                                | 必須   |
| R-11 | aiworkflow-requirements 整合    | `ui-ux-navigation.md` / `workflow-skill-lifecycle-created-skill-usage-journey.md` / `workflow-skill-lifecycle-routing-render-view-foundation.md` と矛盾しないか | 必須   |
| R-12 | happy-dom 環境対策              | 追加 UI テストで `fireEvent` 前提になっているか                                                                                                                 | 推奨   |
| R-13 | TypeScript 型安全               | optional props や handler が `as` / `any` に依存していないか                                                                                                    | 必須   |
| R-14 | 単一責務原則                    | AgentView が分析処理本体を持ち込まず、CTA 表示と handoff のみに留まっているか                                                                                   | 必須   |

## レビューゲート判定基準

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                                                 | 次のアクション                          |
| ----- | ---------------------------------------------------- | --------------------------------------- |
| PASS  | 必須観点（R-01〜R-11, R-13, R-14）で重大な問題がない | Phase 4 に進む                          |
| MINOR | 軽微な指摘がある                                     | 指摘を未タスク仕様書に変換後 Phase 4 へ |
| MAJOR | 必須観点で重大な問題がある                           | 下表の戻り先へ戻す                      |

| 問題の種類                                  | 戻り先              |
| ------------------------------------------- | ------------------- |
| 受入基準の充足不可                          | Phase 1（要件定義） |
| 設計の問題（props 設計・handoff・状態管理） | Phase 2（設計）     |

## 参照資料

| 参照資料              | パス                                                                      | 内容                                          |
| --------------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| Phase 1（要件定義）   | `phase-1-requirements.md`                                                 | 要件・受入基準の確認                          |
| Phase 2（設計）       | `phase-2-design.md`                                                       | レビュー対象の設計内容                        |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | 実装予定箇所の現状コードを確認する            |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`        | props 拡張設計との整合を確認する              |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                       | renderView の `skillAnalysis` case を確認する |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`               | 状態管理設計との整合を確認する                |
| SkillCenter handoff   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | 既存 analyze handoff を確認する               |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | Agent responsibility を確認する               |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                                                | 内容                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 利用導線正本         | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`         | Agent 実行後の改善導線正本               |
| routing 基盤正本     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | `currentSkillName` / renderView 契約     |
| Agent 実行面仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                        | Agent UI 責務                            |
| ナビゲーション正本   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                             | ViewType / `skillAnalysis` close 契約    |
| 機能別コンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                     | AgentView / SkillAnalysisView の UI 仕様 |
| 状態管理正本         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                   | navigation ownership                     |
| handoff 参照         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | SkillCenter analyze handoff              |

## 実行手順

1. Phase 1 / Phase 2 の成果物、対象コードファイル、正本仕様を読み込む
2. R-01 から R-14 を順に確認し、問題があれば current code anchor と system spec のどちらとずれているかを明記する
3. PASS / MINOR / MAJOR を判定し、MINOR または MAJOR の場合は戻り先 Phase を記録する
4. 設計レビュー報告書に判定結果、指摘内容、handoff 情報を記録する

## 統合テスト連携

AgentView の CTA 表示条件、`selectedSkillName -> currentSkillName` handoff、SkillAnalysisView の props 拡張と既存 `onClose` 契約が Phase 1 / Phase 2 と整合するかをレビューする。

## 成果物

| 成果物           | パス                                      | 内容                                              |
| ---------------- | ----------------------------------------- | ------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS / MINOR / MAJOR の判定根拠・全観点の確認記録 |

## 完了条件

- [ ] R-01〜R-14 の全観点を確認済み（「問題あり」「問題なし」「N/A」を記録している）
- [ ] current code anchor と aiworkflow-requirements 正本の不整合有無が明記されている
- [ ] PASS / MINOR / MAJOR の判定結果が記録されている
- [ ] MAJOR 判定の場合、戻り先 Phase と修正方針が明記されている
- [ ] MINOR 判定の場合、全ての MINOR 指摘が未タスク仕様書に変換されている
- [ ] PASS / MINOR の場合、Phase 4 への handoff 情報が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む（PASS または MINOR の場合）
- Phase 1 または Phase 2 に戻る（MAJOR の場合）
