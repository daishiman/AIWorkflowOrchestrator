# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合の最終レビューゲート    |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

要件、設計、実装、回帰、品質監査が一貫しているかを最終確認し、Phase 11 の手動検証へ進めるか判定する。

## 背景

この Phase を抜ける時点で `auth-mode` の public contract は固まっている必要がある。ここで曖昧さを残すと Phase 12 の system spec 更新が分裂する。

## SubAgentチーム編成

| SubAgent                | 担当関心              | 実行形態 | Phase 10 の責務                         |
| ----------------------- | --------------------- | -------- | --------------------------------------- |
| SubAgent-Contract-Main  | contract 完結性監査   | 並列     | Main adapter と service 境界の最終監査  |
| SubAgent-Bridge-Preload | public API 完結性監査 | 並列     | Preload public surface の最終監査       |
| SubAgent-Renderer-State | UI / state 完結性監査 | 並列     | Renderer 受信契約と表示契約の最終監査   |
| SubAgent-Spec-Sync      | gate 判定             | 直列統合 | PASS / MINOR / MAJOR と戻り先を記録する |

## 実行タスク

- 全体レビュー: Phase 1, 2, 5, 9 の成果物が矛盾していないか確認する。
- Gate 判定: PASS / MINOR / MAJOR と戻り先を決める。
- release risk 確認: 永続化、UI 表示、manual test 前提、system spec 同期準備を確認する。

## 参照資料

### 実装・コード

| 資料名                         | パス                                             | 用途                                 |
| ------------------------------ | ------------------------------------------------ | ------------------------------------ |
| Phase 1 仕様                   | `phase-1-requirements.md`                        | 要件を確認する                       |
| Phase 2 仕様                   | `phase-2-design.md`                              | 設計を確認する                       |
| Phase 5 仕様                   | `phase-5-implementation.md`                      | 実装計画を確認する                   |
| Phase 9 仕様                   | `phase-9-quality-assurance.md`                   | 品質監査結果を確認する               |
| Phase 1 成果物                 | `outputs/phase-1/`                               | AC を確認する                        |
| Phase 2 成果物                 | `outputs/phase-2/`                               | canonical contract を確認する        |
| Phase 5 成果物                 | `outputs/phase-5/`                               | changed files と rollback を確認する |
| Phase 9 成果物                 | `outputs/phase-9/`                               | blocker と risk を確認する           |
| 要件定義書                     | `outputs/phase-1/requirements-definition.md`     | Phase 1 成果物                       |
| 受け入れ基準                   | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物                       |
| 契約ドリフト台帳               | `outputs/phase-1/drift-inventory.md`             | Phase 1 成果物                       |
| 公開型正本マップ               | `outputs/phase-1/source-of-truth-map.md`         | Phase 1 成果物                       |
| スコープ境界                   | `outputs/phase-1/scope-boundary.md`              | Phase 1 成果物                       |
| canonical contract設計         | `outputs/phase-2/canonical-contract-design.md`   | Phase 2 成果物                       |
| 層責務マトリクス               | `outputs/phase-2/layer-responsibility-matrix.md` | Phase 2 成果物                       |
| error envelope設計             | `outputs/phase-2/error-envelope-design.md`       | Phase 2 成果物                       |
| shared型移行計画               | `outputs/phase-2/shared-type-migration-plan.md`  | Phase 2 成果物                       |
| テスト戦略                     | `outputs/phase-2/test-strategy.md`               | Phase 2 成果物                       |
| 実装計画                       | `outputs/phase-5/implementation-plan.md`         | Phase 5 成果物                       |
| 変更ファイル計画               | `outputs/phase-5/changed-files-plan.md`          | Phase 5 成果物                       |
| 移行順序                       | `outputs/phase-5/migration-order.md`             | Phase 5 成果物                       |
| ロールバック計画               | `outputs/phase-5/rollback-plan.md`               | Phase 5 成果物                       |
| coverage目標                   | `outputs/phase-7/coverage-targets.md`            | Phase 7 成果物                       |
| contract coverage matrix       | `outputs/phase-7/contract-coverage-matrix.md`    | Phase 7 成果物                       |
| gap log                        | `outputs/phase-7/gap-log.md`                     | Phase 7 成果物                       |
| リファクタリング計画           | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物                       |
| 型正本集約                     | `outputs/phase-8/type-source-consolidation.md`   | Phase 8 成果物                       |
| adapter review                 | `outputs/phase-8/adapter-review.md`              | Phase 8 成果物                       |
| post-refactor checklist        | `outputs/phase-8/post-refactor-checklist.md`     | Phase 8 成果物                       |
| 品質レポート                   | `outputs/phase-9/quality-report.md`              | Phase 9 成果物                       |
| セキュリティ監査チェックリスト | `outputs/phase-9/security-audit-checklist.md`    | Phase 9 成果物                       |
| リスク登録簿                   | `outputs/phase-9/risk-register.md`               | Phase 9 成果物                       |
| error code整合監査             | `outputs/phase-9/error-code-alignment-audit.md`  | Phase 9 成果物                       |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                           | 用途                                 |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------------------ |
| レビュー基準       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS / MINOR / MAJOR の基準確認      |
| 認証仕様           | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`         | final public contract を照合する     |
| システム IPC       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`          | channel 仕様更新対象を確認する       |
| IPC セキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | sender と error transport を照合する |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | final error envelope を照合する      |

## 実行手順

1. Phase 1, 2, 5, 9 の成果物を読み、 contract、test、quality の 3 軸で突合する。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で final review コメントを作る。
3. SubAgent-Spec-Sync が `final-review-result.md` と `gate-decision.md` を作成する。
4. `release-risk-checklist.md` に manual test と Phase 12 の前提条件を記録する。

## 統合テスト連携

- AC ごとに対応する unit / integration / manual case を 1 つ以上確認する。
- `changed` event と `status` DTO の一貫性を final review 観点へ含める。
- sender failure と invalid mode が別テストで確認済みかを見る。
- Phase 11 の手動テストケースが AC を再確認できる内容になっているかを見る。

## 多角的チェック観点

| 観点         | 確認内容                                                              |
| ------------ | --------------------------------------------------------------------- |
| 要件完全性   | Phase 1 の AC に未回収項目がないか                                    |
| 契約完全性   | `get`, `set`, `status`, `validate`, `changed` の 5 契約が揃っているか |
| 品質完全性   | blocker が 0 件か、または戻り先が明記されているか                     |
| 手動検証準備 | Phase 11 の TC と証跡計画が書ける状態か                               |
| 文書更新準備 | Phase 12 の更新対象 references が確定しているか                       |

## 成果物

| 成果物                   | パス                                         | 説明                                      |
| ------------------------ | -------------------------------------------- | ----------------------------------------- |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`    | 最終レビューの指摘一覧                    |
| リリースリスク checklist | `outputs/phase-10/release-risk-checklist.md` | manual test と system spec 同期の前提確認 |
| Gate 判定                | `outputs/phase-10/gate-decision.md`          | PASS / MINOR / MAJOR と戻り先             |

## 完了条件

- [x] `final-review-result.md` に要件、契約、品質、手動検証、文書更新の 5 区分がある
- [x] `gate-decision.md` に PASS / MINOR / MAJOR のいずれか 1 つがある
- [x] MAJOR の場合は戻り先 Phase を 1 つだけ書く
- [x] `release-risk-checklist.md` に Phase 11 と Phase 12 の前提条件を書く
- [x] blocker 件数を書く
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. final review 突合
2. gate 判定
3. release risk 整理
4. manual test 前提確認
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 要件から品質まで通しで突合した
- [x] gate 判定を固定した
- [x] manual test と Phase 12 の前提を明記した
- [x] blocker 件数を明記した

## 次のPhase

Phase 11: 手動テスト検証
