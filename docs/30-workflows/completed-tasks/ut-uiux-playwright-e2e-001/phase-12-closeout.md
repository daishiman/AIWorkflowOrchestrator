# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 12                                      |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

`task-specification-creator` と `aiworkflow-requirements` の同期、未タスク化、スキルフィードバックを閉じる。

## 実行タスク

- `implementation-guide.md` を 2 パート構成で作成する
  - Part 1 は中学生レベルの概念説明と日常例えを含める
  - Part 2 は型定義・APIシグネチャ・使用例・エラー・エッジケース・設定を含める
  - validator 要件と確認コマンドを残す
- `system-spec-update-summary.md` を作成する
  - Step 1-A〜1-C の結果
  - `LOGS.md` 2ファイルと `SKILL.md` 2ファイルの更新結果
  - Step 2 の要否と判定結果
  - canonical root / mirror parity
  - `topic-map.md` / `keywords.json` の再生成が必要ならその結果
  - `artifacts.json` と `outputs/artifacts.json` の同期結果
- `documentation-changelog.md` を作成する
  - 変更ファイル一覧
  - validator 実行結果
  - current / baseline の区別
  - `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4点同期
  - future wording を残さないこと
- `unassigned-task-detection.md` を作成する
  - 0件でも summary を残す
  - 1件以上は formalize path を記録する
- `skill-feedback-report.md` を作成する
  - 改善点があれば next action を書く
  - 改善点がなければ理由付きで「なし」と明記する
- `phase12-task-spec-compliance-check.md` で全完了を確認する
  - Task 1〜5 の全完了
  - planned wording が残っていないこと
  - Phase 13 を blocked に維持する根拠

## 参照資料

| 資料名                      | パス                                                                                   | 説明               |
| --------------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Phase 11/12 ガイド          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | closeout の基準    |
| Phase 12 ドキュメントガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 6 成果物の基準     |
| aiworkflow-requirements     | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | system spec の正本 |

## 実行手順

1. 6 つの成果物を `outputs/phase-12/` に揃える。
2. `.claude` 正本と `.agents` mirror の同期を確認する（`diff -qr` で差分を確認する）。
3. `artifacts.json` と phase 本文の整合を確認する。
4. planned wording を残さず current facts で閉じる。

## 統合テスト連携

- Phase 11（手動テスト）の `manual-test-result.md` と `discovered-issues.md` を取り込む
- Phase 11 で formalize された `unassigned-task/` エントリを未タスク検出レポートに反映する
- Phase 13 の PR blocked 判定の根拠を整理する

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                           |
| ---------- | -------------------------------------------------- |
| システム   | canonical root と mirror root の差分が閉じているか |
| 問題解決   | 未タスク化すべき項目を漏らしていないか             |
| 戦略・価値 | 後続実装者が迷わない形に収束しているか             |

## サブタスク管理

1. implementation guide
2. system spec update summary
3. documentation changelog
4. unassigned detection
5. skill feedback
6. compliance check

## 成果物

| 成果物           | パス                                                     | 説明                          |
| ---------------- | -------------------------------------------------------- | ----------------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | 2 パート構成 + validator 要件 |
| システム仕様更新 | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 の同期結果           |
| 変更履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新内容                      |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力                   |
| スキルFB         | `outputs/phase-12/skill-feedback-report.md`              | 改善点の有無                  |
| 適合確認         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 全完了確認                    |

## 完了条件

- [ ] 6 成果物が揃っている
- [ ] `.claude` と `.agents` の mirror parity が確認できている
- [ ] planned wording が残っていない
- [ ] Phase 13 を blocked にできる根拠が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 仕様更新の current facts が揃っている
- [ ] 未タスクの扱いが明示されている
- [ ] 6 成果物が `outputs/phase-12/` に配置されている

## 次のPhase

Phase 13: PR作成
