# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 3                                          |
| Phase 名   | 設計レビュー                               |
| タスクID   | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 |
| 前提 Phase | Phase 1（要件定義）、Phase 2（設計）       |
| 後続 Phase | Phase 4（テスト作成）                      |
| ステータス | not_started                                |
| 作成日     | 2026-03-17                                 |
| 機能名     | lifecycle-reuse-improve-cycle              |

## 目的

Phase 2 の設計が ui-ux-diagrams.md の状態遷移図・ui-ux-realization.md の一次導線テーブル・既存 SkillExecutionStatus 型との後方互換性・agentSlice 既存アクションとの一貫性・navigationSlice との整合性・UX 禁止事項の観点で問題ないかを多角的にレビューし、PASS / MINOR / MAJOR を判定する。

## 実行タスク

- レビュー実施: 下記レビュー観点テーブルに沿って各観点を確認し、PASS / MINOR / MAJOR の判定根拠を整理する
- 判定記録: 設計レビュー報告書に判定結果と指摘事項を記録する

## レビュー観点テーブル

| #    | 観点                                        | 確認内容                                                                                                                                                                                                                                                                                                          | 重要度 |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| R-01 | 状態遷移図との完全一致                      | ui-ux-diagrams.md L40-54（Core Journey）および Skill Lifecycle Panel 状態遷移図の両方に対して `Review --> ReuseReady: accepted` と `ImproveReady --> Running: improve` および `ImproveReady --> Review`（逆遷移）が Phase 2 設計で漏れなく実装されているか。2図で定義が異なる場合はどちらを正本とするかを明記する | 必須   |
| R-02 | 一次導線テーブルの Reuse フェーズ充足       | ui-ux-realization.md L18 の Reuse フェーズ要件（「後でもう一度使いたい」→ CTA「もう一度使う」）が Phase 2 設計で全てカバーされているか                                                                                                                                                                            | 必須   |
| R-03 | SkillExecutionStatus 後方互換性             | 新規3値（`"review"` / `"improve_ready"` / `"reuse_ready"`）追加後、既存の switch 文・条件分岐・テスト契約が破壊されない設計になっているか（exhaustive check が必要な箇所に各新規 case が追加されているか）。型定義変更が P32 準拠で `packages/shared/src/types/skill.ts`（正本）に対して行われているか            | 必須   |
| R-04 | agentSlice 既存アクションとの一貫性         | `acceptSkillResult()` の設計が `executeSkill` / `applySkillImprovements` 等の既存アクションの命名規則・副作用パターン・非同期方式と一貫しているか                                                                                                                                                                 | 必須   |
| R-05 | SkillManagementPanel / AgentView 遷移整合性 | ReuseReady → navigateTo の遷移先（SkillManagementPanel または AgentView）の設計が navigationSlice の既存インターフェースと整合しているか                                                                                                                                                                          | 必須   |
| R-06 | UX 禁止事項遵守（分断禁止）                 | ui-ux-realization.md L67 の「create / execute / improve を別アプリのように分断しない」を ReuseReady / ImproveReady のUX設計が遵守しているか                                                                                                                                                                       | 必須   |
| R-07 | Zustand P31 対策                            | `acceptSkillResult` / `reExecuteAfterImprovement` 等のアクション関数を個別セレクタで取得しており、合成 Hook の戻り値を useEffect に渡していないか                                                                                                                                                                 | 必須   |
| R-08 | Zustand P48 対策                            | 派生セレクタ（filter/map）が使われる場合に useShallow が適用されているか                                                                                                                                                                                                                                          | 必須   |
| R-09 | Review 状態の CTA 非表示条件（AC-7）        | skillExecutionStatus が Review 状態以外（completed / error / running 等）の場合に「受理して再利用」CTA が非表示になる設計になっているか                                                                                                                                                                           | 必須   |
| R-10 | ImproveReady 状態の CTA 非表示条件（AC-8）  | skillExecutionStatus が ImproveReady 状態以外の場合に「改善を適用して再実行」CTA が非表示になる設計になっているか                                                                                                                                                                                                 | 必須   |
| R-11 | Apple HIG 準拠（AC-9）                      | カラーパレットが Apple HIG System Colors 準拠か（systemBlue: #007AFF / secondarySystemBackground 等）、スペーシングが 8px グリッドか、アニメーションが 200-300ms か                                                                                                                                               | 必須   |
| R-12 | アクセシビリティ（WCAG 2.1 AA）             | 「受理して再利用」CTA・「改善を適用して再実行」CTA・「もう一度使う」ボタンにキーボード操作・ARIA ラベルが設計されているか。コントラスト比 4.5:1 以上か                                                                                                                                                            | 必須   |
| R-13 | TypeScript 型安全                           | 新規3値（`"review"` / `"improve_ready"` / `"reuse_ready"`）追加後の SkillExecutionStatus を `as` キャスト不使用・`any` 型不使用で扱う設計になっているか                                                                                                                                                           | 必須   |
| R-14 | AC-10 既存 6 状態の動作不変                 | 新規3値追加が idle / running / permission_pending / completed / cancelled / error の既存動作に影響しない設計であることが確認されているか                                                                                                                                                                          | 必須   |
| R-15 | P39 happy-dom 環境対策                      | SkillLifecyclePanel の CTA クリックテストで `userEvent` ではなく `fireEvent` を使う設計になっているか                                                                                                                                                                                                             | 推奨   |
| R-16 | P13 タイマーテスト対策                      | 状態遷移後 200ms フェードインのアニメーションをテストする場合、`advanceTimersByTime` を使う方針か                                                                                                                                                                                                                 | 推奨   |

## レビューゲート判定基準

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                                           | 次のアクション                          |
| ----- | ---------------------------------------------- | --------------------------------------- |
| PASS  | 必須観点（R-01〜R-14）で重大な問題がない       | Phase 4 に進む                          |
| MINOR | 軽微な指摘がある（改善しても機能に影響しない） | 指摘を未タスク仕様書に変換後 Phase 4 へ |
| MAJOR | 必須観点で重大な問題がある                     | 下表の戻り先へ戻す                      |

| 問題の種類                                                  | 戻り先              |
| ----------------------------------------------------------- | ------------------- |
| 状態遷移図・一次導線との不整合                              | Phase 1（要件定義） |
| 型拡張・アクション設計・UI 設計・navigationSlice 連携の問題 | Phase 2（設計）     |

**MINOR 判定時の必須対応（05-task-execution.md 準拠）**:

- MINOR 指摘は「機能影響なし」でも全て未タスク仕様書に変換する（省略不可）
- `docs/30-workflows/unassigned-task/` に未タスク指示書を作成し、`task-workflow.md` 残課題テーブルへ登録する

## 参照資料

| 参照資料            | パス                                                                 | 内容                                          |
| ------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                            | 要件・受入基準・実装方式の決定の確認          |
| Phase 2（設計）     | `phase-2-design.md`                                                  | レビュー対象の設計内容                        |
| UI/UX 状態遷移図    | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`    | L40-54: 状態遷移図（設計の根拠となる正本）    |
| UI/UX 一次導線      | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` | L11-18: Reuse フェーズ要件（R-02 の照合先）   |
| agentSlice          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | 既存アクション・型との整合確認（R-03 / R-04） |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | CTA 追加設計との整合確認                      |
| navigationSlice     | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`          | 遷移先設計との整合確認（R-05）                |

### システム仕様（aiworkflow-requirements）

> 以下の正本仕様を確認し、設計がプロジェクト全体の方針から逸脱していないかを確認する。

| 参照資料                   | パス                                                                                        | 内容                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| ナビゲーション正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ViewType 仕様・GlobalNavStrip 契約                    |
| 機能別コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillLifecyclePanel / SkillManagementPanel の UI 仕様 |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタパターン・P31/P48 対策            |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P13・P31・P39・P48 の対策が設計に反映されているか確認 |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                          | Apple HIG 準拠・カラーパレット・ビジュアルスタイル    |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1・Phase 2 の成果物、ui-ux-diagrams.md（L40-54）・ui-ux-realization.md（L11-18）、agentSlice.ts / SkillLifecyclePanel の現状コード、正本仕様を読み込み、レビューの前提を固める。

### ステップ2: レビュー観点テーブルを逐次確認する

R-01 から R-16 の観点を順に確認する。各観点で「問題あり」「問題なし」「N/A（非該当）」を判定し、問題がある場合は具体的な指摘内容を記録する。順序を崩さずに全観点を確認する。

### ステップ3: レビューゲートを判定する

必須観点（R-01〜R-14）の確認結果を統合し、PASS / MINOR / MAJOR を判定する。MAJOR の場合は戻り先 Phase を明記する。MINOR の場合は指摘内容を未タスク仕様書に変換する（05-task-execution.md P3 対策）。

### ステップ4: 成果物と完了条件を確認する

設計レビュー報告書に判定結果・全観点の確認記録・MINOR 未タスクの一覧を記録する。

## 統合テスト連携

agentSlice の `reuse_ready` 遷移・`acceptSkillResult()` の設計、SkillLifecyclePanel の CTA 表示条件設計、navigationSlice との連携設計が Phase 1 の要件・Phase 2 の設計と統合テスト観点で整合するかを確認する。

## 成果物

| 成果物           | パス                                      | 内容                                                        |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS / MINOR / MAJOR の判定根拠・全観点の確認記録を記録する |

## 完了条件

- [ ] R-01〜R-16 の全観点を確認済み（「問題あり」「問題なし」「N/A」を記録している）
- [ ] PASS / MINOR / MAJOR の判定結果が記録されている
- [ ] MAJOR 判定の場合: 戻り先 Phase と修正方針が明記されている
- [ ] MINOR 判定の場合: 全ての MINOR 指摘が `docs/30-workflows/unassigned-task/` の未タスク仕様書に変換されている（省略不可）
- [ ] PASS / MINOR の場合: Phase 4（テスト作成）への handoff 情報が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む（PASS または MINOR の場合）
- Phase 1 または Phase 2 に戻る（MAJOR の場合）
