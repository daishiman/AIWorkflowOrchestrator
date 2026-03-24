# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| Phase名    | 設計レビュー                              |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 2                                   |
| 後続Phase  | Phase 4（テスト作成）                     |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

state 漏れ、session 消失、share 誤自動化、artifact 後退をレビューする。

## 実行タスク

- state review
- persistence review
- share review
- gate decision

## 参照資料

| 参照資料               | パス                                                                | 内容                       |
| ---------------------- | ------------------------------------------------------------------- | -------------------------- |
| Phase 1 成果物         | `phase-1-requirements.md`                                           | task 要件（依存Phase）     |
| Phase 2 成果物         | `phase-2-design.md`                                                 | task 設計（依存Phase）     |
| root pack 設計レビュー | `../../phase-3-design-review.md`                                    | 親パックの設計レビュー仕様 |
| upstream task          | `../step-01-seq-task-01-guided-execution-shell-foundation/index.md` | 先行タスクの前提           |

## 実行手順

### ステップ1: state 漏れをレビューする

aborted / unavailable / reopen 復帰の扱いが欠けていないかを確認する。

### ステップ2: manual boundary をレビューする

share が手動操作に限定されているかを確認する。

### ステップ3: artifact priority をレビューする

raw log が primary surface に戻っていないかを確認する。

### MINOR 追跡テーブル（gate-decision.md 用）

| MINOR ID                 | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ------------------------ | -------- | ------------- | ------------- | ---- |
| （Phase 3 実行時に記録） |          |               |               |      |

## 統合テスト連携

Phase 4 では restore、manual share、artifact priority の negative case を含める。

## 成果物

| 成果物           | パス                                      | 説明       |
| ---------------- | ----------------------------------------- | ---------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 判定と指摘 |
| gate 決定        | `outputs/phase-3/gate-decision.md`        | 着手条件   |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                | 仕様参照先                                   |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| UI/UX              | dock / artifact / share の surface 設計 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | session state / store 設計              | `aiworkflow-requirements: architecture-*.md` |
| セキュリティ       | transcript share / provenance           | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | aborted state / restore failure         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 完了条件

- [ ] session 消失リスクがレビュー対象になっている
- [ ] manual share のみ許可と明記している
- [ ] artifact-first の review 結果がある
- [ ] gate 判定値（PASS / MINOR / MAJOR）が outputs/phase-3/gate-decision.md に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- PASS / MINOR → [Phase 4（テスト作成）](./phase-4-test-creation.md)
  - MINOR の場合: 指摘対応後 Phase 4 へ
- MAJOR（要件問題）→ [Phase 1（要件定義）](./phase-1-requirements.md) へ戻る
- MAJOR（設計問題）→ [Phase 2（設計）](./phase-2-design.md) へ戻る
