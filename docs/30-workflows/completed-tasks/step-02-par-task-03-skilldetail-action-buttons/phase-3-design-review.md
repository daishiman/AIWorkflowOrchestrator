# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 3                                       |
| Phase名    | 設計レビュー                            |
| タスクID   | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）    |
| 後続Phase  | Phase 4（テスト作成）                   |
| ステータス | not_started                             |
| 作成日     | 2026-03-17                              |
| 機能名     | skilldetail-action-buttons              |

## 目的

Phase 2 で確定した設計の妥当性を多角的に検証し、PASS / MINOR / MAJOR を判定する。特に遷移フロー・Props 設計・AC 充足度・既存 routing foundation / CTA routing との整合性を重点的にレビューする。

## 実行タスク

- レビュー実施: 下記レビュー観点テーブルに沿って各観点を確認し、判定根拠を記録する
- MINOR 追跡計画: MINOR 判定が発生した場合は MINOR 追跡テーブルに登録する
- ゲート判定: PASS / MINOR / MAJOR を決定し、次のアクションを記録する

## レビュー観点テーブル

| 観点ID | カテゴリ         | レビュー観点                                                                                                              | 確認基準                                                                                                                                          | 結果   |
| ------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| R-01   | Props 設計       | `onEdit` / `onAnalyze` が optional prop として定義されているか                                                            | 型シグネチャが `(skillName: string) => void` になっており、既存 props と競合しないこと                                                            | 未確認 |
| R-02   | AC 充足度        | AC-1〜AC-5: isImported フラグによる表示制御が設計で明示されているか                                                       | `isImported === true` の場合のみボタンが表示される条件が明確なこと                                                                                | 未確認 |
| R-03   | AC 充足度        | AC-6: モバイル（ボトムシート）での表示が PanelContent 共有により自動的に対応されているか                                  | PanelContent を両レイアウト（desktop / mobile）で共有する設計になっていること                                                                     | 未確認 |
| R-04   | AC 充足度        | AC-7: Apple HIG 準拠（8px Grid、ボタンスタイル）の根拠が明示されているか                                                  | `gap-3`（12px）の使用理由が 8px Grid 準拠であることが設計に記載されていること                                                                     | 未確認 |
| R-05   | AC 充足度        | AC-8: Escape キー動作が既存の useEffect（keydown ハンドラ）を変更しないことが確認されているか                             | SkillDetailPanel.tsx の Escape キー処理は既存のまま維持されること                                                                                 | 未確認 |
| R-06   | 遷移フロー       | `handleEditSkill` の呼び出し順序（setCurrentSkillName → setCurrentView → handleCloseDetail）は正しいか                    | Zustand の同期 set の特性上、順序依存はないが、handleCloseDetail は最後が望ましいこと                                                             | 未確認 |
| R-07   | 遷移フロー       | `handleAnalyzeSkill` が既存 `skillAnalysis` route contract を再利用し、`currentSkillName` handoff だけを追加しているか    | `store/types.ts` / `App.tsx` に既存 contract が存在し、新ハンドラがそれを壊さず DetailPanel 文脈を補完していること                                | 未確認 |
| R-08   | 責務分離         | 既存 `navigateToSkillAnalysis` / `navigateToSkillCreate` の top-level CTA と DetailPanel 用ハンドラが責務競合していないか | generic CTA はそのまま維持され、DetailPanel 側は `currentSkillName` handoff を伴う専用ハンドラとして分離されていること                            | 未確認 |
| R-09   | 既存コード影響   | SkillDetailPanel の既存テスト（SkillDetailPanel.test.tsx）が新 props 追加によって壊れる可能性があるか                     | onEdit / onAnalyze を optional にすることで既存テストが prop なしで動作継続できること                                                             | 未確認 |
| R-10   | セキュリティ     | skillName を onEdit / onAnalyze に渡す際に null チェックが設計で考慮されているか                                          | `skillName && onEdit(skillName)` パターンで null を防いでいること                                                                                 | 未確認 |
| R-11   | アクセシビリティ | アクションボタンに `data-testid` が設定されており、テスト・スクリーンリーダー対応が考慮されているか                       | `data-testid="edit-skill-button"` / `data-testid="analyze-skill-button"` が設計に含まれること                                                     | 未確認 |
| R-12   | コードスメル     | `PanelContentProps` への `onEdit` / `onAnalyze` の追加が必要か（現行は SkillDetailPanelProps から渡す）                   | PanelContent に直接渡す props の経路が明確であること                                                                                              | 未確認 |
| R-13   | Zustand パターン | P48（useShallow）対策: 新規追加するセレクタに `.filter()` / `.map()` で新しい配列参照を返すものがないか                   | 本タスクでは該当セレクタなし（handleEditSkill / handleAnalyzeSkill はアクション関数のため不要）。派生セレクタを追加する場合は `useShallow` が必要 | 未確認 |
| R-14   | 遷移フロー       | `App.tsx` の `renderView()` に `skill-editor` および `skillAnalysis` の case 分岐が存在するか                             | 両 ViewType への遷移先コンポーネントが renderView で定義されていること                                                                            | 未確認 |

## レビューゲート

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                                   | 次のアクション                                    |
| ----- | -------------------------------------- | ------------------------------------------------- |
| PASS  | 全観点（R-01〜R-14）で重大な問題がない | Phase 4 に進む                                    |
| MINOR | 軽微な指摘あり（実装で解決可能）       | 指摘を MINOR 追跡テーブルに登録後、Phase 4 に進む |
| MAJOR | 設計または要件に戻りが必要な問題がある | 下表の戻り先へ戻す                                |

| MAJOR 問題の種類                                 | 戻り先              |
| ------------------------------------------------ | ------------------- |
| 受入基準（AC）の矛盾・不完全                     | Phase 1（要件定義） |
| Props 設計・遷移フロー・コンポーネント構造の問題 | Phase 2（設計）     |

## MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘はこのテーブルで追跡する。

| MINOR ID         | 指摘内容 | 解決予定 Phase | 解決確認 Phase | 備考 |
| ---------------- | -------- | -------------- | -------------- | ---- |
| （判定後に記入） | -        | -              | -              | -    |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                        | 仕様参照先                                                                                                 |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| UI/UX            | フロントエンド実装のため適用    | `aiworkflow-requirements: ui-ux-feature-components-reference.md`                                           |
| アーキテクチャ   | renderView / state handoff 確認 | `aiworkflow-requirements: workflow-skill-lifecycle-routing-render-view-foundation.md`                      |
| アクセシビリティ | UI 実装のため適用               | `aiworkflow-requirements: ui-ux-components.md`, `ui-ux-design-system.md`                                   |
| セキュリティ     | null チェックが関係するため確認 | `.claude/rules/06-known-pitfalls.md#P48`                                                                   |
| パフォーマンス   | selector 追加時の drift 防止    | `aiworkflow-requirements: architecture-implementation-patterns-reference-agent-view-selector-migration.md` |

**Electron デスクトップアプリ観点**:

| 層                         | 適用判断                           | 仕様参照先                            |
| -------------------------- | ---------------------------------- | ------------------------------------- |
| フロントエンド（Renderer） | React コンポーネント変更のため適用 | `aiworkflow-requirements: ui-ux-*.md` |
| IPC 通信                   | 本タスクは IPC 変更なし            | 適用なし                              |

## 参照資料

| 参照資料                | パス                                                                                               | 内容                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`                                                                          | 前提成果物（受入基準）を確認する       |
| Phase 2（設計）         | `phase-2-design.md`                                                                                | レビュー対象の設計内容を確認する       |
| SkillDetailPanel        | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | 現行実装との整合性を確認する           |
| useSkillCenter          | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                          | 遷移ロジック追加先の構造を確認する     |
| SkillCenterView         | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                        | Props バインディングパターンを確認する |
| SkillDetailPanel テスト | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`              | 既存テストが破壊されないことを確認する |

### システム仕様（aiworkflow-requirements）

> review 時も parent index 止まりにせず、今回変更の直接根拠になる正本を確認する。

| 参照資料                                                                     | パス                                                                                                                                | 内容                                                               |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| workflow-skill-lifecycle-routing-render-view-foundation                      | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`                      | 既存 foundation、`skillAnalysis`、close 導線、follow-up backlog    |
| ui-ux-navigation                                                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                             | ViewType / `setCurrentView` 契約                                   |
| ui-ux-feature-components-reference                                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                                           | `SkillDetailPanel` / `useSkillCenter` / SkillCenter の既存 UI 契約 |
| ui-ux-feature-components-advanced                                            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-advanced.md`                                            | `skill-editor` 側の既存 UI 契約                                    |
| arch-state-management-core                                                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                                   | state handoff と new slice 不要の判断根拠                          |
| arch-state-management-reference-permissions-import-lifecycle                 | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md`                 | SkillCenter hook/selector の既存運用                               |
| architecture-implementation-patterns-reference-agent-view-selector-migration | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-agent-view-selector-migration.md` | P31/P48 を含む selector migration パターン                         |
| review-gate-criteria                                                         | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                                                      | PASS / MINOR / MAJOR の判定基準の正本                              |

## 実行手順

### ステップ 1: 参照資料を確認する

Phase 1 の受入基準と Phase 2 の設計内容、および実際の対象ファイル（SkillDetailPanel.tsx・useSkillCenter.ts）を確認し、レビューの前提を固める。

### ステップ 2: レビュー観点テーブルを上から順に確認する

R-01〜R-14 の各観点を順に確認し、「未確認」を「OK」「MINOR」「MAJOR」に更新して判定根拠を記録する。

### ステップ 3: ゲート判定を決定する

全観点の確認後、PASS / MINOR / MAJOR を決定し、次のアクション（Phase 4 進行 or 戻り先）を記録する。MINOR が発生した場合は追跡テーブルに登録する。

### ステップ 4: 成果物と完了条件を確認する

設計レビュー報告書を確認し、Phase 4 への handoff 情報を整える。

## 統合テスト連携

設計レビューで確認した遷移フロー（onEdit/onAnalyze → setCurrentView/setCurrentSkillName）の正確性が Phase 4 のテスト作成の基礎になることを確認する。

## 成果物

| 成果物           | パス                                      | 内容                                                                  |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | R-01〜R-14 の観点ごとの確認結果と PASS/MINOR/MAJOR 判定根拠を記録する |

## 完了条件

- [ ] R-01〜R-14 の全観点が確認済みになっている（「未確認」が残っていない）
- [ ] PASS / MINOR / MAJOR のいずれかに判定が確定している
- [ ] MAJOR 判定の場合は戻り先が明記されている
- [ ] MINOR 判定の場合は全件が MINOR 追跡テーブルに登録されている
- [ ] PASS または MINOR の場合は Phase 4 への進行が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- PASS / MINOR 判定: [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
- MAJOR 判定（要件問題）: [Phase 1（要件定義）](./phase-1-requirements.md) に戻る
- MAJOR 判定（設計問題）: [Phase 2（設計）](./phase-2-design.md) に戻る
