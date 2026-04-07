# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 10                                                           |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 9                                                      |
| 後続Phase  | Phase 11                                                     |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

実装完了後、全体的な品質・整合性・受け入れ基準の充足を最終確認する。

## 参照資料

| 資料名             | パス                                        | 説明           |
| ------------------ | ------------------------------------------- | -------------- |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`        | Phase 7 成果物 |
| 品質レポート       | `outputs/phase-9/quality-report.md`         | Phase 9 成果物 |

## 判定基準

| 判定     | 条件             | 対応                                 |
| -------- | ---------------- | ------------------------------------ |
| PASS     | 全観点で問題なし | Phase 11 へ進行                      |
| MINOR    | 軽微な指摘あり   | 未タスクとして記録後 Phase 11 へ進行 |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定         |
| CRITICAL | 致命的な問題あり | Phase 1 へ戻りユーザーと要件を再確認 |

## 実行タスク

- 受け入れ基準照合: AC-1〜AC-4 が全て満たされているか確認する
- 全体整合確認: Phase 1〜9 の成果物の整合性を確認する
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL を判定する

## サブタスク管理

- Lane A: AC-1〜AC-4 の充足を確認する
- Lane B: Phase 1〜9 の成果物の整合性を確認する
- Lane C: A/B の結果を統合して gate 判定を確定する
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| #   | チェック項目                                                                | 判定                 |
| --- | --------------------------------------------------------------------------- | -------------------- |
| 1   | AC-1: `createVerificationReviewRequest()` が `kind: "single_select"` を返す | -                    |
| 2   | AC-2: options に approve / improve / reject が含まれる                      | -                    |
| 3   | AC-3: `validateUserInputSubmission` が不正 selectedOptionId を拒否する      | -                    |
| 4   | AC-4: 既存テスト全件 PASS（回帰なし）                                       | -                    |
| 5   | TypeScript typecheck PASS                                                   | -                    |
| 6   | ESLint PASS                                                                 | -                    |
| 7   | IPC 契約変更なし                                                            | -                    |
| 8   | Renderer への影響なし（新規 IPC チャンネル追加なし）                        | -                    |
| 9   | Phase 11 へ渡す前提資料が揃っているか                                       | manual-test 準備済み |

## 統合テスト連携

| レビュー項目 | 確認内容           |
| ------------ | ------------------ |
| テスト結果   | 全テスト PASS      |
| カバレッジ   | 変更関数 100% 達成 |
| 型チェック   | typecheck PASS     |

## 成果物

| 成果物           | パス                                      | 説明               |
| ---------------- | ----------------------------------------- | ------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー結果一覧   |
| ゲート判定       | `outputs/phase-10/gate-decision.md`       | PASS/MINOR等の判定 |

## 完了条件

- [ ] 全チェック項目を確認した
- [ ] ゲート判定が記録されている
- [ ] MINOR の場合、未タスク候補が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証
