# TASK-RALLY-002 - restoredPendingRequest合成ルール明確化

## メタ情報

| 項目                | 値                                         |
| ------------------- | ------------------------------------------ |
| タスクID            | TASK-RALLY-002                             |
| 機能名              | restored-pending-request-clarification     |
| 作成日              | 2026-04-21                                 |
| ステータス          | pending                                    |
| 総Phase数           | 13                                         |
| タスク種別          | renderer / NON_VISUAL / verify_existing    |
| 衝突ドメイン        | ConversationalInterview                    |
| 実行形態            | Wave 0 は並列、同一ファイル内 Phase は直列 |
| implementation_mode | verify_existing                            |

---

## タスク概要

`apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` に既に存在する `restoredPendingRequest` と `workflowSnapshot?.awaitingUserInput` の切替規則を、変更済みコード実態・上流設計書・2つの skill 定義に照らして再検証し、RALLY-010 以降が前提として参照できる仕様へ整える。

本タスクは「新規実装」ではなく、**本ブランチ上の既存変更を検証し、必要最小限の是正だけを行う verify_existing タスク**として扱う。

---

## 成功条件

- `task-specification-creator` の Phase 骨格に準拠している
- `aiworkflow-requirements` の Step 1 / Step 2 判断を Phase 12 に明記している
- 4条件（矛盾なし・漏れなし・整合性あり・依存関係整合）を満たす
- 30種の思考法を Phase 1 の分析観点として明示し、Phase 2 以降で消費できる
- `RALLY-002 -> RALLY-010 -> RALLY-011 -> RALLY-012 -> RALLY-013` の依存が崩れていない

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義           | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計               | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成         | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装               | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング   | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証           | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビューゲート | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト検証     | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新   | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成             | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

---

## 実行フロー

```text
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

### タスク間の直列 / 並列

```text
Wave 0 並列:
  RALLY-001
  RALLY-002
  RALLY-004

ConversationalInterview.tsx 直列:
  RALLY-002 → RALLY-010 → RALLY-011 → RALLY-012 → RALLY-013
```

### Phase 1〜3 の SubAgent 分担

```text
SubAgent-A: 現状コード観測
SubAgent-B: 上流設計書 / skill 正本照合
SubAgent-C: 30思考法による4条件監査
SubAgent-D: 統合判断と verify_existing 是正
```

---

## 依存関係

- `RALLY-002` は `RALLY-010`、`RALLY-011`、`RALLY-012`、`RALLY-013` の前提である
- `RALLY-002` は `ConversationalInterview.tsx` に限定し、`SkillLifecyclePanel.tsx` や IPC 契約変更を含めない
- Phase 12 Step 2 は state semantics に変更が出た場合のみ実施し、不要なら no-op 根拠を残す

---

## Phase完了時の必須アクション

1. 本Phaseのタスクを100%実行する
2. 成果物の命名を phase 本文と一致させる
3. `artifacts.json` と `outputs/artifacts.json` の parity を維持する
4. Phase 13 はユーザー明示承認があるまで blocked 扱いの準備記録に留める

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/wave0-par-RALLY-002 --phase {{N}}
```

---

## 成果物サマリ

| Phase | 主要成果物                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書、受け入れ基準、P50結果、思考法適用マップ                                                                                                             |
| 2     | 検証設計書、責務境界マトリクス、検証コマンドマトリクス                                                                                                          |
| 3     | レビュー結果、ゲート判定、依存リスク台帳                                                                                                                        |
| 4     | targeted test 仕様、既存テスト棚卸し                                                                                                                            |
| 5     | diff確認結果、変更要否判断、検証結果                                                                                                                            |
| 6     | 異常系ケース、追加回帰ケース                                                                                                                                    |
| 7     | カバレッジ確認、ACトレーサビリティ                                                                                                                              |
| 8     | 表現整理ログ、Before/After/理由                                                                                                                                 |
| 9     | 品質レポート、4条件再監査                                                                                                                                       |
| 10    | 最終レビュー結果、出荷準備チェック                                                                                                                              |
| 11    | manual-test-result、manual-test-checklist、discovered-issues                                                                                                    |
| 12    | implementation-guide、system-spec-update-summary、documentation-changelog、unassigned-task-detection、skill-feedback-report、phase12-task-spec-compliance-check |
| 13    | local-check-result、change-summary、pr-info、pr-creation-result                                                                                                 |
