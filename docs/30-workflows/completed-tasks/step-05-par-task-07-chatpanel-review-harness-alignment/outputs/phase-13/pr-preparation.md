# Phase 13 PR作成: PR準備書

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 13 - 完了・PR 準備

---

## 重要: PR Blocked 条件

**本タスクは設計タスクであり、プロダクションコードへの変更は含まれない。**

PR の作成は**ユーザーからの明示的な指示があるまで禁止**とする。
AI（Claude）が自律的に PR を作成してはならない。

### Blocked 条件の根拠

1. 本タスクは設計成果物（docs/30-workflows/ 配下のファイル群）のみを生成した
2. プロダクションコード（`apps/`、`packages/`）への変更はゼロである
3. 設計成果物のみの PR は、設計書の構造と命名規則に関するチームの合意が必要である
4. MINOR-A（openTerminal IPC channel 確認）が未解消のまま PR を出すと、
   後続実装タスクの担当者が誤って本タスクを「完了実装」と誤解するリスクがある

### PR 作成前の必須確認事項

- [ ] ユーザーから「PR を作成してください」の明示的な指示があること
- [ ] UNASSIGNED-01 / UNASSIGNED-02 の `unassigned-task/` 指示書が作成されていること
- [ ] task-workflow.md の残課題テーブルが更新されていること
- [ ] 関連仕様書（ui-ux-panels.md 等）が実際に更新されていること
- [ ] topic-map.md が再生成されていること
- [ ] ブランチが `docs/` または `design/` プレフィックスを持つこと

---

## PR 本文テンプレート

PR 作成時は以下のテンプレートを使用する。

```markdown
## Summary

- ChatPanel を review harness として正式に設計定義した
  （mainline との契約パリティ検証、GAP-01〜04 の no-op 解消計画策定）
- 8 state union（idle/loading/streaming/blocked/handoff/error/empty/cancelled）
  と 3 Lane（Mainline/Review Harness/Legacy）の設計書を生成した
- 後続実装タスク向けに before/after コード例・リスク登録簿・手動テスト計画を整備した

## Test Plan

- [ ] PR レビュアーが `docs/30-workflows/step-05-par-task-07-chatpanel-review-harness-alignment/outputs/` 配下のファイルを確認する
- [ ] `final-gate-decision.md` で Phase 10 判定が PASS であることを確認する
- [ ] `unassigned-task-detection.md` で MINOR-A/B が未タスク化されていることを確認する
- [ ] `risk-register.md` で RISK-1（openTerminal IPC 未確認）が HIGH スコアとして登録されていることを確認する
- [ ] プロダクションコードへの変更がゼロであることを確認する（`git diff --stat HEAD~1 -- apps/` が空であること）

## 変更ファイル数

設計成果物: 20 ファイル（docs/30-workflows/ 配下のみ）
プロダクションコード変更: 0 ファイル

## 関連タスク

- UNASSIGNED-01: openTerminal IPC handler 確認・実装（HIGH）
- UNASSIGNED-02: ChatPanelProps role 型追加検討（LOW）
```

---

## Reviewer が見るべき成果物

### 必須確認ファイル

| ファイル                                | 確認ポイント                                               |
| --------------------------------------- | ---------------------------------------------------------- |
| `phase-10/final-gate-decision.md`       | Phase 10 判定が PASS であること                            |
| `phase-12/unassigned-task-detection.md` | MINOR-A/B が未タスク化されていること、件数が正確であること |
| `phase-9/risk-register.md`              | RISK-1〜3 の mitigation が明確であること                   |
| `phase-8/refactor-boundaries.md`        | 3 Contract（State/Action/Ownership）が明確であること       |
| `phase-12/implementation-guide.md`      | Part 1（アナロジー）と Part 2（実装詳細）が揃っていること  |

### 設計決定の根拠確認

| 設計決定               | 確認ファイル                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| 8 state union の妥当性 | `phase-2/state-machine.md`（参照）、`phase-8/refactor-boundaries.md` Contract A                 |
| no-op 排除の方針       | `phase-8/refactor-boundaries.md` Contract B、`phase-12/implementation-guide.md` Part 2          |
| MINOR-A の先送り判断   | `phase-9/risk-register.md` RISK-1、`phase-12/unassigned-task-detection.md` UNASSIGNED-01        |
| MINOR-B の先送り判断   | `phase-11/discovered-issues.md` ISSUE-03、`phase-12/unassigned-task-detection.md` UNASSIGNED-02 |

---

## CI/CD Evidence Bundle

| 種別                    | 内容                                                 | 状態 |
| ----------------------- | ---------------------------------------------------- | ---- |
| TypeScript 型チェック   | プロダクションコード変更なしのため N/A               | N/A  |
| ESLint                  | プロダクションコード変更なしのため N/A               | N/A  |
| Vitest                  | プロダクションコード変更なしのため N/A               | N/A  |
| Phase 10 最終ゲート判定 | PASS（`phase-10/final-gate-decision.md`）            | PASS |
| 設計成果物完全性        | 20 ファイル生成（`documentation-changelog.md`）      | PASS |
| 未タスク管理            | 2 件検出・記録済み（`unassigned-task-detection.md`） | PASS |

---

## PR タイトル案

```
design(chatpanel): ChatPanel review harness を mainline 契約に整合させる設計定義
```

文字数: 44 文字（70 文字制限内）

---

## ブランチ命名規則

```
docs/task-07-chatpanel-review-harness-alignment
```

または

```
design/TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
```

---

## 後続タスクへの接続

本 PR がマージされた後、以下の後続タスクを着手可能とする。

| タスク ID      | 内容                                  | 依存                 |
| -------------- | ------------------------------------- | -------------------- |
| UNASSIGNED-01  | openTerminal IPC handler 確認・実装   | 本 PR マージ後       |
| UNASSIGNED-02  | ChatPanelProps role 型追加検討        | UNASSIGNED-01 完了後 |
| 後続実装タスク | GAP-01〜04 の Store action / IPC 配線 | UNASSIGNED-01 完了後 |
