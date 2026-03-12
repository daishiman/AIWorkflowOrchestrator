# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 11                                                       |
| Phase名    | 手動テスト                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 機能名     | chat-platform-unification                                |
| 前提Phase  | [phase-10-final-review.md](./phase-10-final-review.md)   |
| 後続Phase  | [phase-12-documentation.md](./phase-12-documentation.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

3 mode の会話体験を実機で確認し、mode 差分だけが見え、基盤差分がユーザー体験に漏れていないことを確認する。

## 実行タスク

- Task 11-1: current build を確認する
- Task 11-2: TC-11-01..05 を実施する
- Task 11-3: screenshot coverage を作成する
- Task 11-4: discovered issues を整理する

## テストケース

| テストケース | 内容                                               |
| ------------ | -------------------------------------------------- |
| TC-11-01     | 通常会話を開始する                                 |
| TC-11-02     | Workspace 文脈付き会話を開始する                   |
| TC-11-03     | `skill-lifecycle` mode で作成 / 改善会話を開始する |
| TC-11-04     | ストリーミング中断と再開を確認する                 |
| TC-11-05     | 履歴再開と mode 切替後の整合を確認する             |

## 画面カバレッジマトリクス

| テストケース | 画面 / 状態                   | 必須確認例                      | 証跡                                                                                                                                          |
| ------------ | ----------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-11-01     | general mode 初回会話         | ChatView idle / streaming       | `outputs/phase-11/screenshots/TC-02-01-chat-general-foundation.png`                                                                           |
| TC-11-02     | workspace mode 文脈付き会話   | Workspace entry / context on    | `outputs/phase-11/screenshots/TC-02-03-workspace-surface.png`, `outputs/phase-11/screenshots/TC-02-04-workspace-handoff-chat.png`             |
| TC-11-03     | skill-lifecycle mode 会話開始 | Skill Center or handoff surface | `outputs/phase-11/screenshots/TC-02-05-skill-center-journey.png`, `outputs/phase-11/screenshots/TC-02-06-skill-lifecycle-handoff-chat.png`    |
| TC-11-04     | abort / retry                 | stream interrupted / resumed    | `outputs/phase-11/screenshots/TC-02-02-chat-retry-error-state.png`                                                                            |
| TC-11-05     | history resume / mode switch  | restored session                | `outputs/phase-11/screenshots/TC-02-01-chat-general-foundation.png`, `outputs/phase-11/screenshots/TC-02-06-skill-lifecycle-handoff-chat.png` |

## 参照資料

| 参照資料                     | パス                                            | 内容                 |
| ---------------------------- | ----------------------------------------------- | -------------------- |
| Phase 11 screenshot 事前計画 | `outputs/phase-4/phase11-screenshot-preplan.md` | 事前シナリオ         |
| 最終レビュー判定             | `outputs/phase-10/final-review-result.md`       | 実施可否             |
| 変更ファイルマトリクス       | `outputs/phase-5/change-file-matrix.md`         | 実機確認対象         |
| mode 遷移設計                | `outputs/phase-2/mode-state-transition.md`      | 3 mode 導線          |
| 回帰ケース一覧               | `outputs/phase-6/regression-case-matrix.md`     | 再開 / retry / abort |
| 要件トレーサビリティ         | `outputs/phase-7/requirement-traceability.md`   | TC と AC 対応        |
| リファクタリングログ         | `outputs/phase-8/refactoring-log.md`            | 画面責務の最終形     |
| 品質レポート                 | `outputs/phase-9/quality-report.md`             | 監査観点             |

## 実行手順

1. 3 mode の代表シナリオを current build で実行する。
2. `TC-11-01` から `TC-11-05` まで screenshot を取得し、各 TC に 1 枚以上ひも付ける。
3. abort / retry / history resume / context leak の有無を確認する。
4. 発見課題があれば `discovered-issues.md` と Phase 12 未タスク候補へ引き継ぐ。

## 統合テスト連携

| 観点          | 連携内容                                                                           |
| ------------- | ---------------------------------------------------------------------------------- |
| UI evidence   | `TC-11-01..05` を `manual-test-result.md` と `screenshot-coverage.md` に対応付ける |
| regression    | phase 6/7 の targeted tests と同じ failure 軸で visual check する                  |
| documentation | discovered issues を Phase 12 の spec update / unassigned 判定へ渡す               |

## 成果物

| 成果物                | パス                                      | 説明          |
| --------------------- | ----------------------------------------- | ------------- |
| 手動テスト結果        | `outputs/phase-11/manual-test-result.md`  | TC ごとの結果 |
| screenshot カバレッジ | `outputs/phase-11/screenshot-coverage.md` | 証跡対応表    |
| screenshot plan       | `outputs/phase-11/screenshot-plan.json`   | 撮影計画      |
| 発見課題              | `outputs/phase-11/discovered-issues.md`   | 未タスク候補  |

## 完了条件

- [x] 3 mode の体験差分が意図通り
- [x] 会話状態の破綻がない
- [x] 各 TC に screenshot 証跡がひも付く
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-10-final-review.md](./phase-10-final-review.md)
- 後続: [phase-12-documentation.md](./phase-12-documentation.md)

## サブタスク管理

- [x] current build 確認
- [x] TC-11-01..05 実施
- [x] screenshot coverage 作成
- [x] discovered issues 整理

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各 TC に証跡がひも付いている
- [x] 発見課題が Phase 12 へ引き継げる状態である

## 次のPhase

Phase 12: [phase-12-documentation.md](./phase-12-documentation.md)
