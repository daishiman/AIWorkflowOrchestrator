# Phase 13: PR 作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 13                                          |
| Phase名    | PR 作成                                     |
| 前提Phase  | Phase 12                                    |
| 後続Phase  | -（完了）                                   |
| ステータス | blocked                                     |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

ユーザーの明示的な承認があるまで blocked を維持し、ローカル確認結果と変更要約を記録する。commit / PR の自動作成は行わない。

## 背景

Phase 1〜12 の全作業が完了していても、ユーザー承認がない限り PR は作成しない。Phase 13 はその blocked 記録を残すためのフェーズである。

---

## 実行タスク

### タスク1: blocked 条件の確認

**目的**: ユーザー承認の有無を確認し、blocked 理由を記録する

**実行手順**:

1. ユーザーの明示的な承認があるかを確認する
2. 承認がない場合は blocked のまま維持する
3. blocked 理由と approval 状態を `outputs/phase-13/local-check-result.md` に記録する

---

### タスク2: 変更サマリーの作成

**目的**: PR 前に説明すべき変更点を `outputs/phase-13/change-summary.md` に記録する

**実行手順**:

1. Phase 1〜12 の完了根拠を要約する
2. 変更対象が runtime-only の 18 チャネルであることを記録する
3. commit / PR 未実施であることを明記する

---

### タスク3: PR 情報の作成可否を記録する

**目的**: `pr-info.md` / `pr-creation-result.md` を作成できる状態かを記録する

**実行手順**:

1. ユーザー承認がない場合は PR 情報を作成せず、blocked を維持する
2. 承認後にのみ `pr-info.md` と `pr-creation-result.md` を作成できることを記録する
3. 現時点の PR URL は未発行であることを明記する

---

## 参照資料

| 参照資料         | パス                                                     | 内容               |
| ---------------- | -------------------------------------------------------- | ------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                | 受入基準確認結果   |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | 実装内容のサマリー |
| 準拠確認         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了根拠  |

---

## 成果物

| 成果物                | パス                                     | 説明                             |
| --------------------- | ---------------------------------------- | -------------------------------- |
| ローカル確認結果      | `outputs/phase-13/local-check-result.md` | blocked 理由・承認状態・確認要約 |
| 変更サマリー          | `outputs/phase-13/change-summary.md`     | commit / PR 未実施の変更要約     |
| PR 情報（承認後）     | `outputs/phase-13/pr-info.md`            | 承認後に作成する PR 記録         |
| PR 作成結果（承認後） | `outputs/phase-13/pr-creation-result.md` | 承認後に作成する PR 実行結果     |

---

## 完了条件

- [ ] ユーザー承認がない限り blocked を維持している
- [ ] commit / PR を自動作成していない
- [ ] `outputs/phase-13/local-check-result.md` が記録されている
- [ ] `outputs/phase-13/change-summary.md` が記録されている
- [ ] `outputs/phase-13/pr-info.md` / `outputs/phase-13/pr-creation-result.md` を承認後に作成できる状態として明記している

---

## 注意事項

- ユーザー承認がない限り commit / PR を実行しない
- PR 作成前にローカル確認結果と変更サマリーを揃える
- 18 チャネル（16 public runtime + 2 auxiliary）の runtime-only スコープを維持する

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目         | 内容 |
| ------------ | ---- |
| 実行日時     | -    |
| 実行者       | -    |
| 完了判定     | -    |
| blocked 理由 | -    |
| 承認状態     | -    |
| 特記事項     | -    |
