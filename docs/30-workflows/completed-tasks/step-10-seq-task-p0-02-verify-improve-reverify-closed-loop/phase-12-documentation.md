# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 12                                               |
| Phase名    | ドキュメント更新                                 |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 11: 手動テスト                             |
| 次Phase    | Phase 13: PR作成                                 |
| ステータス | completed                                        |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

task-specification-creator の Phase 12 必須 6 成果物を canonical filename で揃え、閉ループ修復の実装ガイドを中学生レベル概念説明 + 技術詳細の 2 部構成で作成する。

## 実行タスク

### Task 12-1: 実装ガイド

- `implementation-guide.md` に Part 1 / Part 2 を作成する
- **Part 1: 中学生レベルの概念説明**
  - 「検証 → 改善 → 再検証」のループを日常的な比喩で説明する
  - テストの答え合わせ → 間違い直し → 再テストの流れとして説明する
    - たとえば、学校のテストで答え合わせをして（verify）、間違えた問題を解き直して（improve）、もう一度テストを受ける（re-verify）という流れと同じ。最初のテストで 80 点だったら、間違えた 20 点分の問題を復習してから、もう一度テストを受けて 100 点を目指す。このプログラムでも「スキルを作る → 出来を確認する → ダメなところを直す → もう一度確認する」というサイクルを自動で回している
  - なぜこのループが大切なのかを平易な言葉で説明する
  - `たとえば` を最低 1 回含めること（validator 安定化ルール準拠）
- **Part 2: 技術詳細**
  - `recordVerifyPass()` の追加内容と使い方
  - phase 遷移テーブルの変更点
  - improve→verify 遷移の実装詳細
  - Facade/IPC handler の更新箇所
  - UI snapshot の変更点
  - `task-workflow.md` の current facts と矛盾しない言い回しを使うこと
  - TypeScript 型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定可能なパラメータと定数を必ず含める
  - `validate-phase12-implementation-guide.js --workflow <workflow>` で Part 1 / Part 2 の要件を検証できる記述にする

### Task 12-2: 仕様更新サマリ

- `system-spec-update-summary.md` に参照した正本仕様と no-op / update 判定を書く
- WorkflowEngine の phase transition spec への反映有無を記録する
- Step 1-A として、完了タスク記録・関連ドキュメントリンク・変更履歴・`aiworkflow-requirements/LOGS.md` / `task-specification-creator/LOGS.md`・topic-map を同一 wave で同期する
- Step 1-B として、実装状況テーブルを更新し、`spec_created` / `completed` の判定を current facts へ揃える
- Step 1-C として、関連タスクテーブルと未タスク候補テーブルを更新する
- Step 2 として、interface / API / state / security / UI contract に変更がある場合のみ domain spec sync を実施する
- `complete-phase.js` または同等処理で root `artifacts.json` と `outputs/artifacts.json` を同期する
- **更新対象として以下を明記すること**:
  - `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` — Skill Creator Service の verify/improve 仕様更新
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — 完了タスク / 残課題 / 相互リンクの更新
  - `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md` — フェーズ遷移テーブルの更新反映
  - `outputs/artifacts.json` — root `artifacts.json` と同内容へ同期
  - `validate-phase12-implementation-guide.js` / `validate-phase-output.js` の結果を Phase 12 判定へ持ち込む

### Task 12-3: 変更履歴

- `documentation-changelog.md` に今回整えたファイルを列挙する
- current / baseline と `artifacts.json` / `outputs/artifacts.json` の同期結果を併記する
- `task-workflow.md` の current facts と `documentation-changelog.md` の記録が一致することを確認する
- Step 1-A/B/C と Step 2 の実施結果を changelog に明示する

### Task 12-4: 未タスク検出

- `unassigned-task-detection.md` に閉ループ修復から派生した未割当タスクの有無を記録する
- 未タスクが 1 件以上ある場合は、指示書作成 → `task-workflow.md` 登録 → 関連仕様書リンク更新の 3 ステップを同一 wave で閉じる
- 0 件の場合でも検出レポートは必須で、0 件である根拠を記録する

### Task 12-5: スキルフィードバック

- `skill-feedback-report.md` に task-specification-creator スキルへの改善案を記録する
- `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴更新を同一 wave で記録する

### Task 12-6: 準拠チェック

- `phase12-task-spec-compliance-check.md` で 6 成果物の存在と validator 結果を束ねる
- 文言スキャン、`task-workflow.md`、`artifacts.json`、`outputs/artifacts.json` の parity を 1 ファイルで確認する
- `validate-phase12-implementation-guide.js`、`verify-unassigned-links.js`、`audit-unassigned-tasks.js` の結果を 1 ファイルへ集約する

## 参照資料

| 資料名               | パス                                       | 説明             |
| -------------------- | ------------------------------------------ | ---------------- |
| 設計成果物           | `outputs/phase-2/design-document.md`       | 遷移テーブル設計 |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 変更内容         |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`  | 境界ケース       |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | AC 対応表        |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`    | 最小複雑性判断   |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`        | 準拠根拠         |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`  | 総合判定         |

## 成果物

| 成果物                | パス                                                     | 説明               |
| --------------------- | -------------------------------------------------------- | ------------------ |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| 仕様更新サマリ        | `outputs/phase-12/system-spec-update-summary.md`         | 参照仕様と同期判定 |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md`            | 変更一覧           |
| 未タスク検出          | `outputs/phase-12/unassigned-task-detection.md`          | 残課題有無         |
| スキルフィードバック  | `outputs/phase-12/skill-feedback-report.md`              | skill 改善案       |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6 成果物確認       |

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                            | 対策                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず generate-index.js を実行                     |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |

## 完了条件

- [x] 必須 6 成果物が揃っている
- [x] Part 1（中学生レベル）と Part 2（技術詳細）が分離されている
- [x] 計画系文言が除去されている
- [x] skill 準拠結果が記録されている
- [x] `task-workflow.md` と `artifacts.json` / `outputs/artifacts.json` の同期が取れている
- [x] `complete-phase.js` または同等処理で `artifacts.json` / `outputs/artifacts.json` が同期されている
- [x] `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴が更新されている
- [x] `validate-phase12-implementation-guide.js` と `validate-phase-output.js` の結果が記録されている
- [x] `verify-unassigned-links.js` と `audit-unassigned-tasks.js` の結果が記録されている
- [x] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した
- [x] task-specification-creator/LOGS.md にタスク完了記録を追加した
- [x] topic-map.md を再生成した
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
