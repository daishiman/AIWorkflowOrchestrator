# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 12                                      |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 11                                |
| 後続Phase  | Phase 13                                |
| 作成日     | 2026-04-21                              |
| ステータス | completed                               |

## 目的

dead code 削除の変更内容を実績ベースで記録し、workflow 本文・artifacts・外部同期先・未タスク判定を same-wave で閉じる。

## 実行タスク

- タスク1: Task 12-1〜12-6 の canonical 成果物を定義する
- タスク2: workflow 本文 / root artifacts / outputs artifacts の parity を確認する
- タスク3: planned wording と未タスク有無を最終確認する

## Task 12-1: 実装ガイド

### Part 1: 中学生レベルの説明

dead code は、もう使っていないのに教室の机の中へ残した古いプリントに近い。たとえば、今は使わない提出用紙が混ざっていると、次に机を開けた人は「これはまだ必要なのか」を毎回確かめることになる。

今回やることは、その古いプリントを捨てて、今の授業で必要なものだけにそろえる作業である。こうすると後続タスクが `SkillLifecyclePanel.tsx` を読むときに迷いが減り、誤って古い流れを前提に設計しにくくなる。

### Part 2: 技術者向け要点

- 対象: `SkillLifecyclePanel.tsx` 内の `_handleSubmitWorkflowInput`、旧入力 state 4種、companion `useEffect`
- current contract: 現行の入力送信は `ConversationalInterview` 側のフローが主であり、旧 state 群は current consumer から見て不要
- target delta: dead code と companion state 管理を除去し、依存境界を `workflowSnapshot` と現行 interview flow に収束させる
- エッジケース: 外部参照が残っていないこと、setter のみ保持する `useEffect` を単独残置しないこと、Lint/typecheck/test をまとめて再確認すること
- 視覚証跡: `UI/UX変更なしのため Phase 11 スクリーンショット不要`

## Task 12-2: system spec update summary

### Step 1-A: 外部同期先一覧

| 同期先                                  | 内容                                              | 判定                      |
| --------------------------------------- | ------------------------------------------------- | ------------------------- |
| workflow root `index.md` / `phase-*.md` | 実績と canonical output 名を current facts に更新 | 必須                      |
| workflow root `artifacts.json`          | Phase進捗と artifact 名整合                       | 必須                      |
| `outputs/artifacts.json`                | root artifacts との parity 維持                   | 必須                      |
| `task-workflow.md` / completed ledger   | 実タスク完了時に same-wave で追記対象             | 今 task spec では参照のみ |
| `.claude` / `.agents` skill docs        | 実装 close-out 時に更新対象                       | 今 task spec では参照のみ |

### Step 1-B: 実装状況

- workflow 自体は `in-progress`（Phase 13 が `blocked` のため root status は維持）
- 仕様書作成状況は Phase 1〜12 `completed`
- Phase 13 は user approval 未取得のため `blocked` 扱い

### Step 1-C: 関連タスク整合

- Wave 0 並列: `RALLY-002`, `RALLY-004`
- Wave 1 依存: `RALLY-005` は本 task の dead code 除去を前提とする
- Gate を跨ぐ並列化は禁止し、Phase 4〜10 は直列実行とする

### Step 2: system spec update 判定

- 判定: `N/A`
- 根拠: 今回は task specification の改善であり、AIWorkflow の公開インターフェースや system spec 正本そのものは変更しない
- Phase 11 参照欄固定文言: `UI/UX変更なしのため Phase 11 スクリーンショット不要`

## Task 12-3: documentation changelog に含めるべき事項

- 変更した spec file 一覧
- root `artifacts.json` と `outputs/artifacts.json` の parity 結果
- planned wording 0件確認
- NON_VISUAL 判定と Phase 11 primary evidence の参照先

## Task 12-4: unassigned detection

- 0件でも `outputs/phase-12/unassigned-task-detection.md` を必ず生成する
- 今回の spec 改善で新規 gap がなければ `0件 / 理由` を記録する

## Task 12-5: skill feedback

- task-specification-creator に対しては「Phase 12 canonical output 名と blocked Phase 13 のテンプレ強制が有効」と記録する
- 改善点なしでも `なし` と理由を残す

## Task 12-6: phase12-task-spec-compliance-check

- `implementation-guide.md`
- `system-spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

上記6ファイルの existence と、workflow 本文 / root artifacts / outputs artifacts の整合を確認してから Phase 12 を閉じる。

## 実行手順

1. canonical 6成果物名を workflow 本文に固定する
2. `artifacts.json` と `outputs/artifacts.json` の差分を解消する
3. planned wording / unassigned / feedback / compliance check を同一ターンで締める

## 参照資料

| 資料名         | パス                                        | 用途            |
| -------------- | ------------------------------------------- | --------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`    | Phase 11 成果物 |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物  |

## 成果物

| 成果物                     | パス                                                     | 説明      |
| -------------------------- | -------------------------------------------------------- | --------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | Task 12-1 |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Task 12-2 |
| 更新履歴                   | `outputs/phase-12/documentation-changelog.md`            | Task 12-3 |
| 未タスク検出               | `outputs/phase-12/unassigned-task-detection.md`          | Task 12-4 |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | Task 12-5 |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-6 |

## 完了条件

- [x] 実績ベースで Task 12-1〜12-6 を全て記録した
- [x] root `artifacts.json` と `outputs/artifacts.json` の parity を確認した
- [x] planned wording が 0 件であることを確認した
- [x] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 受け入れ基準 AC-1〜AC-5 全 PASS 確認
- [x] AC-2b PASS 確認
- [x] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 13: PR作成準備（user approval 待ち）
