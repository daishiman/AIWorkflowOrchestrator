# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| Phase名    | 設計レビュー                              |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 2                                   |
| 後続Phase  | Phase 4（テスト作成）                     |
| ステータス | not_started                               |
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

- 依存Phase: Phase 1, Phase 2
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- root pack: `../../phase-3-design-review.md`
- upstream task: `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`

## 実行手順

### ステップ1: state 漏れをレビューする

aborted / unavailable / reopen 復帰の扱いが欠けていないかを確認する。

### ステップ2: manual boundary をレビューする

share が手動操作に限定されているかを確認する。

### ステップ3: artifact priority をレビューする

raw log が primary surface に戻っていないかを確認する。

## 統合テスト連携

Phase 4 では restore、manual share、artifact priority の negative case を含める。

## 成果物

| 成果物           | パス                                      | 説明       |
| ---------------- | ----------------------------------------- | ---------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 判定と指摘 |
| gate 決定        | `outputs/phase-3/gate-decision.md`        | 着手条件   |

## 完了条件

- [ ] session 消失リスクがレビュー対象になっている
- [ ] manual share のみ許可と明記している
- [ ] artifact-first の review 結果がある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md)
