# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 3                                     |
| Phase名    | 設計レビュー                          |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）  |
| 後続Phase  | Phase 4（テスト作成）                 |
| ステータス | not_started                           |
| 作成日     | 2026-03-17                            |
| 機能名     | skillcenter-create-route              |

## 目的

Phase 2 の設計が受入基準 AC-1〜AC-8・責務境界・Apple HIG・Zustand 設計原則に整合するかを多角的に検証し、PASS / MINOR / MAJOR を判定する。PASS または MINOR で Phase 4 に進む。

## 実行タスク

- レビュー実施: 以下のレビュー観点テーブルに沿って各項目を確認し、PASS / MINOR / MAJOR の判定根拠を整理する
- 判定記録: 全観点の判定結果を `outputs/phase-3/design-review-report.md` に記録する

## レビュー観点テーブル

| #   | 観点                        | 確認内容                                                                                                                                                    | 重大度 |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | AC 整合性（AC-1/AC-2）      | ヘッダーCTAが `setCurrentView("skillCreate")` と正しく接続されているか                                                                                      | MAJOR  |
| 2   | AC 整合性（AC-3/AC-4/AC-5） | JourneyPanel の各カードCTAが対応する ViewType 遷移（skillCreate / workspace / skillAnalysis）と接続しているか                                               | MAJOR  |
| 3   | 責務境界（AC-6）            | handoff CTA が実行本体ロジックを持っていないか。`skillLifecycleJourney.ts` の forbiddenResponsibility に違反していないか                                    | MAJOR  |
| 4   | Task01 依存整合             | `skillCreate` / `skillAnalysis` ViewType が Task01 の成果物から正しく参照されているか。ViewType 名称が一致しているか                                        | MAJOR  |
| 5   | Zustand 設計（P31対策）     | `useSkillCenter` の新規アクションが個別セレクタ形式で定義されており、合成Hook無限ループ（P31）を回避しているか                                              | MAJOR  |
| 6   | モバイル対応（AC-7）        | 768px未満でCTAボタンがアクセス可能な設計になっているか。タッチターゲットが44x44px以上に設計されているか                                                     | MINOR  |
| 7   | Apple HIG 準拠（AC-8）      | 8pxグリッド・角丸8-12px・繊細な影・systemBlueカラーが設計に組み込まれているか                                                                               | MINOR  |
| 8   | アクセシビリティ            | `aria-label`・キーボードフォーカス（`focus:ring-2`）・アイコンの `aria-hidden` が設計されているか                                                           | MINOR  |
| 9   | Props 設計の純粋性          | `SkillLifecycleJourneyPanel` の Props が最小限であり、`onAction` が親から注入される設計になっているか                                                       | MINOR  |
| 10  | 既存契約との非衝突          | 変更する4ファイル（SkillCenterView / useSkillCenter / skillLifecycleJourney / JourneyPanel）が既存の他タスク（Task03 / Task04）の変更対象と衝突していないか | MAJOR  |

## レビューゲート

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                                 | 次のアクション                                    |
| ----- | ------------------------------------ | ------------------------------------------------- |
| PASS  | MAJOR 判定が0件、全観点で問題なし    | Phase 4 に進む                                    |
| MINOR | MAJOR 判定が0件、MINOR 指摘が1件以上 | 指摘を全て未タスク候補として記録後 Phase 4 に進む |
| MAJOR | MAJOR 判定が1件以上                  | 下表の戻り先へ戻す                                |

| 問題の種類                      | 戻り先              |
| ------------------------------- | ------------------- |
| 要件の問題（AC に誤り・漏れ）   | Phase 1（要件定義） |
| 設計の問題（責務境界・Zustand） | Phase 2（設計）     |

### MINOR 指摘の処理（省略不可）

MINOR 判定の指摘は「機能影響なし」であっても全て未タスク仕様書に変換する（[05-task-execution.md#Phase10](../../../../.claude/rules/05-task-execution.md) 準拠）。

## 多角的チェック観点

| 観点             | 適用判断                                  | 仕様参照先                                                                                  |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| UI/UX            | フロントエンド実装のため必須              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ   | ViewType 追加・Zustand 設計変更のため必須 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                |
| アクセシビリティ | UI実装のため必須（WCAG 2.1 AA）           | `.claude/rules/01-architecture.md#アクセシビリティ`                                         |
| 状態管理         | Zustand アクション追加のため必須          | `.claude/rules/03-state-management.md`                                                      |
| パフォーマンス   | 不要な再レンダーが発生しないか            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断                                      | 仕様参照先                                                              |
| -------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| フロントエンド（Renderer） | React コンポーネント追加のため必須            | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` |
| IPC通信                    | ViewType 遷移は Renderer 内で完結するため不要 | 対象外                                                                  |

## 参照資料

| 参照資料              | パス                                                                      | 内容                                       |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1（要件定義）   | `phase-1-requirements.md`                                                 | 依存する前提成果物を確認する               |
| Phase 2（設計）       | `phase-2-design.md`                                                       | 依存する前提成果物を確認する               |
| SkillCenterView       | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | 現状コードと設計の差分を確認する           |
| useSkillCenter        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | Zustand 接続パターンの現状を確認する       |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | forbiddenResponsibility の定義を確認する   |
| パック親 index        | `docs/30-workflows/skill-lifecycle-routing/index.md`                      | 補助 Codepath 所有表と依存グラフを確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                             | パス                                                                                        | 内容                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様の正本           |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / JourneyPanel 仕様の正本          |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタ・P31/P48 対策パターン     |
| ui-ux-design-principles              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG / WCAG 2.1 AA の一次正本             |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store 設計・個別セレクタ命名規約の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1・Phase 2 の成果物と、現状コードを確認し、レビュー対象の設計内容を把握する。

### ステップ2: レビュー観点テーブルを上から順に確認する

10 観点を全て確認し、各観点に PASS / MINOR / MAJOR のいずれかを判定する。判定根拠を1-2文で記録する。

### ステップ3: 総合判定を決定する

- MAJOR 判定が 1 件以上: 総合判定 MAJOR → 戻り先 Phase に戻る
- MAJOR 判定が 0 件かつ MINOR 指摘あり: 総合判定 MINOR → 指摘を記録して Phase 4 に進む
- 全観点 PASS: 総合判定 PASS → Phase 4 に進む

### ステップ4: MINOR 指摘を未タスク候補として記録する

MINOR 指摘は全件、未タスク候補として `outputs/phase-3/design-review-report.md` に記録する。

### ステップ5: 成果物と完了条件を確認する

成果物パス・完了条件・次の Phase への handoff を確認して記録する。

## 統合テスト連携

ViewType 遷移・JourneyPanel CTA・useSkillCenter アクション・モバイル対応・責務境界が Phase 1 / Phase 2 に整合するかをレビューする。P31（合成Hook無限ループ）・P48（派生セレクタ無限ループ）対策の設計組み込みを確認する。

## 成果物

| 成果物           | パス                                      | 内容                                               |
| ---------------- | ----------------------------------------- | -------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 全10観点の PASS / MINOR / MAJOR 判定根拠と総合判定 |

## 完了条件

- [ ] 全10レビュー観点について判定根拠が記録されている
- [ ] MAJOR 判定が 0 件（または戻り先 Phase に戻って再設計済み）
- [ ] MINOR 指摘が全件、未タスク候補として記録されている
- [ ] Task01（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）との ViewType 名称が一致している
- [ ] 他タスク（Task03 / Task04）の Codepath 所有表と衝突がないことを確認済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
