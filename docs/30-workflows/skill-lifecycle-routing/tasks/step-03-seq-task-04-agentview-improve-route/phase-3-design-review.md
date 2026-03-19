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

Phase 2 の設計が受入基準・依存タスクとの整合性・Zustand パターン遵守・Apple HIG 準拠の観点で問題ないかを多角的にレビューし、PASS / MINOR / MAJOR を判定する。

## 実行タスク

- レビュー実施: 下記レビュー観点テーブルに沿って各観点を確認し、PASS / MINOR / MAJOR の判定根拠を整理する
- 判定記録: 設計レビュー報告書に判定結果と指摘事項を記録する

## レビュー観点テーブル

| #    | 観点                            | 確認内容                                                                                                         | 重要度 |
| ---- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| R-01 | 受入基準との整合                | AC-1〜AC-7 が Phase 2 設計で全て充足できるか確認する                                                             | 必須   |
| R-02 | AC-6 非表示条件の設計           | スキル未実行時（`isExecutionComplete === false` または `selectedSkillName === null`）に CTA が非表示になる設計か | 必須   |
| R-03 | 依存タスク整合性                | Task01 が追加した ViewType "skillAnalysis" を前提とした設計になっているか（値の重複・衝突がないか）              | 必須   |
| R-04 | Task02/03 との責務境界          | Task02（SkillCenter CTA）・Task03（DetailPanel ボタン）と同じ onAnalyze アクションを重複実装していないか         | 必須   |
| R-05 | SkillAnalysisView 後方互換性    | `onNavigateBack` / `onNavigateToAgent` がオプション prop で、既存の呼び出し元（SkillCenter 等）が壊れないか      | 必須   |
| R-06 | Zustand P31 対策                | setCurrentView 等のアクション関数を個別セレクタで取得しており、合成 Hook の戻り値を useEffect に渡していないか   | 必須   |
| R-07 | Zustand P48 対策                | 派生セレクタ（filter/map）が使われる場合に useShallow が適用されているか                                         | 必須   |
| R-08 | 状態管理変更スコープ            | navigationSlice の変更が Task04 の責務範囲内に収まっているか（Task01 の ViewType と衝突しないか）                | 必須   |
| R-09 | Apple HIG 準拠（AC-7）          | カラーパレットが Apple HIG System Colors 準拠か、スペーシングが 8px グリッドか、アニメーションが 200-300ms か    | 必須   |
| R-10 | アクセシビリティ（WCAG 2.1 AA） | 改善 CTA と戻るリンクにキーボード操作・ARIA ラベルが設計されているか。コントラスト比 4.5:1 以上か                | 必須   |
| R-11 | P13 タイマーテスト対策          | 実行完了後 200ms フェードインのアニメーションをテストする場合、`advanceTimersByTime` を使う方針か                | 推奨   |
| R-12 | P39 happy-dom 環境対策          | SkillAnalysisView の CTA クリックテストで `userEvent` ではなく `fireEvent` を使う設計になっているか              | 推奨   |
| R-13 | TypeScript 型安全               | `onNavigateBack?: () => void` 等のオプション prop が `as` キャスト不使用・`any` 型不使用で設計されているか       | 必須   |
| R-14 | 単一責務原則                    | AgentView が「スキル実行」の責務を超えて分析ロジックを持ち込んでいないか（CTA 表示のみに留まっているか）         | 必須   |

## レビューゲート判定基準

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                                                 | 次のアクション                          |
| ----- | ---------------------------------------------------- | --------------------------------------- |
| PASS  | 必須観点（R-01〜R-10, R-13, R-14）で重大な問題がない | Phase 4 に進む                          |
| MINOR | 軽微な指摘がある（改善しても機能に影響しない）       | 指摘を未タスク仕様書に変換後 Phase 4 へ |
| MAJOR | 必須観点で重大な問題がある                           | 下表の戻り先へ戻す                      |

| 問題の種類                                    | 戻り先              |
| --------------------------------------------- | ------------------- |
| 受入基準の充足不可                            | Phase 1（要件定義） |
| 設計の問題（prop 設計・遷移フロー・状態管理） | Phase 2（設計）     |

**MINOR 判定時の必須対応（05-task-execution.md 準拠）**:

- MINOR 指摘は「機能影響なし」でも全て未タスク仕様書に変換する（省略不可）
- `docs/30-workflows/unassigned-task/` に未タスク指示書を作成し、`task-workflow.md` 残課題テーブルへ登録する

## 参照資料

| 参照資料            | パス                                                               | 内容                                        |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                          | 要件・受入基準の確認                        |
| Phase 2（設計）     | `phase-2-design.md`                                                | レビュー対象の設計内容                      |
| AgentView           | `apps/desktop/src/renderer/views/AgentView/index.tsx`              | 実装予定箇所の現状コードを確認する          |
| SkillAnalysisView   | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | prop 拡張設計との整合を確認する             |
| App.tsx             | `apps/desktop/src/renderer/App.tsx`                                | renderView の skillAnalysis case を確認する |
| navigationSlice     | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`        | 状態管理設計との整合を確認する              |

### システム仕様（aiworkflow-requirements）

> 以下の正本仕様を確認し、設計がプロジェクト全体の方針から逸脱していないか確認する。

| 参照資料                   | パス                                                                                        | 内容                                                |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| ナビゲーション正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ViewType 仕様・GlobalNavStrip 契約                  |
| 機能別コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | AgentView / SkillAnalysisView の UI 仕様            |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタパターン・P31/P48 対策          |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P13・P31・P39・P48 の対策を設計に反映しているか確認 |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                          | Apple HIG 準拠・カラーパレット・ビジュアルスタイル  |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1・Phase 2 の成果物、対象コードファイル、正本仕様を読み込み、レビューの前提を固める。

### ステップ2: レビュー観点テーブルを逐次確認する

R-01 から R-14 の観点を順に確認する。各観点で「問題あり」「問題なし」「N/A（非該当）」を判定し、問題がある場合は具体的な指摘内容を記録する。順序を崩さずに全観点を確認する。

### ステップ3: レビューゲートを判定する

必須観点（R-01〜R-10, R-13, R-14）の確認結果を統合し、PASS / MINOR / MAJOR を判定する。MAJOR の場合は戻り先 Phase を明記する。MINOR の場合は指摘内容を未タスク仕様書に変換する。

### ステップ4: 成果物と完了条件を確認する

設計レビュー報告書に判定結果・全観点の確認記録・MINOR 未タスクの一覧を記録する。

## 統合テスト連携

AgentView の実行完了状態検出・CTA 表示・遷移アクション、SkillAnalysisView の prop 注入・戻り導線の設計が Phase 1 の要件および Phase 2 の設計と整合するかを統合テスト観点でレビューする。

## 成果物

| 成果物           | パス                                      | 内容                                                        |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS / MINOR / MAJOR の判定根拠・全観点の確認記録を記録する |

## 完了条件

- [ ] R-01〜R-14 の全観点を確認済み（「問題あり」「問題なし」「N/A」を記録している）
- [ ] PASS / MINOR / MAJOR の判定結果が記録されている
- [ ] MAJOR 判定の場合: 戻り先 Phase と修正方針が明記されている
- [ ] MINOR 判定の場合: 全ての MINOR 指摘が未タスク仕様書に変換されている（省略不可）
- [ ] PASS / MINOR の場合: Phase 4（テスト作成）への handoff 情報が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む（PASS または MINOR の場合）
- Phase 1 または Phase 2 に戻る（MAJOR の場合）
