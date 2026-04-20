---
task_id: UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001
task_name: auth regression coverage realignment
category: 改善
target_feature: SkillLifecyclePanel の auth 回帰テスト責務
priority: 高
scale: 中規模
status: pending
implementation_mode: new
issue_number: 2294
created_date: 2026-04-19
dependencies:
  - UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
---

# UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001: auth regression coverage realignment

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001             |
| タスク名     | auth regression coverage realignment                                |
| 分類         | 改善                                                                |
| 対象機能     | SkillLifecyclePanel の auth 回帰テスト責務                          |
| 優先度       | 高                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | pending                                                             |
| 実装モード   | new                                                                 |
| GitHub Issue | #2294（CLOSED）                                                     |
| 依存タスク   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001                 |
| タスク種別   | NON_VISUAL（UIテスト変更のみ）                                      |
| 発見元       | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 Phase 12 再監査 |
| 作成日       | 2026-04-19                                                          |

## 背景・課題

旧 prepare フロー依存の TC-06 / TC-07 を削除した結果、現行 UI における `rapid click` と `rerender` 条件での `auth:login` 非発火保証が別契約として未整理になった。

`UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001` の Phase 12 再監査において、削除されたテストケースが担保していた以下の保証点が空白になっていることが判明した。

- `rapid click` 時に `auth:login` が複数回発火しない保証
- `rerender` 時に `auth:login` が再発火しない保証

これらの保証は現行 UI のコードに対して再定義が必要であり、単体テストと統合テストの責務境界も未整理の状態にある。また、wizard 起動先を含む後続導線（`onOpenSkillWizard` / `onOpenWizard` / session resume start-new）での `auth:login` 混入リスクに対する明示的な保証点が存在しない。

## 目的・ゴール

1. `SkillLifecyclePanel` 単体が守る責務と、wizard 起動先を含む統合テストが守る責務を切り分ける
2. `onOpenSkillWizard` / `onOpenWizard` / session resume start-new の後続導線で `auth:login` が混入しない保証点を定義する
3. rapid click / rerender の再現テストを現行 UI へ合わせて再設計する

## 実行戦略

本 workflow は `task-specification-creator` の P50 チェックを前提に、以下の 3 レーンで進める。

| レーン | 役割                             | 実行形態         | 主担当 Phase    |
| ------ | -------------------------------- | ---------------- | --------------- |
| Lane A | skill 準拠検証                   | 並列             | Phase 1, 3, 12  |
| Lane B | テスト責務・保証点の設計と実装   | 並列開始後に統合 | Phase 1〜9      |
| Lane C | 30種の思考法による多角的レビュー | 並列             | Phase 3, 10, 12 |

Phase 1 では Lane A/B を並列開始し、Phase 3 で Lane C の分析結果を統合する。Phase 4 以降は Lane B を主レーンとし、Phase 10 と Phase 12 で Lane A/C を再度合流させて 4 条件を監査する。

## スコープ

### 対象

- `SkillLifecyclePanel.auth-regression.test.tsx` への新規テストケース追加
- 単体テストと統合テストの責務境界の明文化（ドキュメント）
- rapid click 再現テスト（TC-06 相当）の現行 UI 基準での再設計
- rerender 回帰テスト（TC-07 相当）の現行 UI 基準での再設計
- `onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` の非発火保証テスト
- traceability マトリクスの更新

### 対象外

- `SkillLifecyclePanel.tsx` の実装コード変更
- wizard 起動先コンポーネント（統合テスト側の責務）の実装変更
- `authModeSlice.ts` の実装変更
- UI ビジュアルの変更（NON_VISUAL タスク）

## 現行 current contract

| 導線                           | 実装位置                  | 検証方法 |
| ------------------------------ | ------------------------- | -------- |
| スキル作成ウィザードを開く     | `onOpenSkillWizard`       | TC-01a   |
| 詳細ウィザードを開く           | `onOpenWizard`            | TC-01b   |
| セッション削除後に新規開始する | `handleSessionStartNew()` | TC-01c   |
| 認証モードを切り替える         | `authModeSlice.setMode()` | TC-08    |

## 受入基準

| ID     | 基準                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| AC-001 | 単体テストと統合テストの責務境界が `responsibility-boundary.md` に明文化されている                                    |
| AC-002 | rapid click 再現テスト（TC-06 相当）が現行 UI 基準で新規定義され、テストファイルに実装されている                      |
| AC-003 | rerender 回帰テスト（TC-07 相当）が現行 UI 基準で新規定義され、テストファイルに実装されている                         |
| AC-004 | `onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` の `auth:login` 非発火保証テストが単体テストに存在する |
| AC-005 | 新規テストケースがすべて CI で PASS する                                                                              |
| AC-006 | traceability マトリクスが更新され、TC-06 相当・TC-07 相当と保証点の対応が記録されている                               |

## 実装対象ファイル

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`（テストケース追加）
- 参照実装: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- 参照実装: `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`
- 参照実装: `apps/desktop/src/renderer/store/slices/authModeSlice.ts`

## Phase 一覧

| Phase    | 名称              | 仕様書                                                 | ステータス |
| -------- | ----------------- | ------------------------------------------------------ | ---------- |
| Phase 1  | 要件定義          | [phase-1-requirements.md](phase-1-requirements.md)     | 未実施     |
| Phase 2  | 設計              | [phase-2-design.md](phase-2-design.md)                 | 未実施     |
| Phase 3  | 設計レビュー      | [phase-3-design-review.md](phase-3-design-review.md)   | 未実施     |
| Phase 4  | テスト作成（Red） | [phase-4-test-creation.md](phase-4-test-creation.md)   | 未実施     |
| Phase 5  | 実装（Green）     | [phase-5-implementation.md](phase-5-implementation.md) | 未実施     |
| Phase 6  | テスト拡充        | [phase-6-test-expansion.md](phase-6-test-expansion.md) | 未実施     |
| Phase 7  | カバレッジ確認    | [phase-7-coverage.md](phase-7-coverage.md)             | 未実施     |
| Phase 8  | リファクタリング  | [phase-8-refactoring.md](phase-8-refactoring.md)       | 未実施     |
| Phase 9  | 品質保証          | [phase-9-quality.md](phase-9-quality.md)               | 未実施     |
| Phase 10 | 最終レビュー      | [phase-10-final-review.md](phase-10-final-review.md)   | 未実施     |
| Phase 11 | 手動テスト        | [phase-11-manual-test.md](phase-11-manual-test.md)     | 未実施     |
| Phase 12 | ドキュメント更新  | [phase-12-documentation.md](phase-12-documentation.md) | 未実施     |
| Phase 13 | PR 作成           | [phase-13-pr.md](phase-13-pr.md)                       | 未実施     |
