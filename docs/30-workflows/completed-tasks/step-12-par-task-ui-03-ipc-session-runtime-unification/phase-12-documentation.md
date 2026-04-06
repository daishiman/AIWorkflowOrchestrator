# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 12                              |
| Phase名    | ドキュメント更新                |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 11: 手動テスト            |
| 次Phase    | Phase 13: PR作成                |
| ステータス | completed                       |
| 作成日     | 2026-04-06                      |

## 目的

task-specification-creator の Phase 12 必須 6 成果物を canonical filename で揃え、IPC 二重経路統合の実装ガイドを中学生レベル概念説明 + 技術詳細の 2 部構成で作成する。参照正本の update / no-op 判定は `system-spec-update-summary.md` に集約する。

## 実行タスク

### Task 12-1: 実装ガイド

- `implementation-guide.md` に Part 1 / Part 2 を作成する
- **Part 1: 中学生レベルの概念説明**
  - 「二つの通信路を一つにまとめる」ことを日常的な比喩で説明する
  - たとえば、学校で連絡帳（手書きでやりとり）と LINE（デジタルでやりとり）の 2 つの方法があると、「今日の連絡はどっちで送ったんだっけ?」と混乱する。そこで「連絡は全部この方法で!」とルールを決めるか、「紙の連絡は連絡帳、デジタルの連絡は LINE」と使い分けルールを明確にするのと同じ
  - なぜこの統合が大切なのかを平易な言葉で説明する
  - `たとえば` を最低 1 回含めること（validator 安定化ルール準拠）
- **Part 2: 技術詳細**
  - IPC 統合方針（選択した方針の詳細）
  - preload API surface の変更内容
  - channels.ts の命名規則と変更内容
  - creatorHandlers.ts のハンドラー構成変更
  - 型定義の変更内容
  - 新機能開発者向けの IPC 経路選択ガイドライン

### Task 12-2: 仕様更新サマリ

- `system-spec-update-summary.md` に参照した正本仕様と no-op / update 判定を書く
- **参照対象として以下を明記すること**:
  - `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` — IPC チャネル定義の update / no-op 判定対象
  - `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` — IPC 契約チェックリストの update / no-op 判定対象

### Task 12-3: 変更履歴

- `documentation-changelog.md` に今回整えたファイルを列挙する

### Task 12-4: 未タスク検出

- `outputs/phase-12/unassigned-task-detection.md` に IPC 二重経路統合から派生した未割当タスクの有無を記録する

### Task 12-5: スキルフィードバック

- `skill-feedback-report.md` に task-specification-creator スキルへの改善案を記録する

### Task 12-6: 準拠チェック

- `outputs/phase-12/phase12-task-spec-compliance-check.md` で 6 成果物の存在と validator 結果を束ねる

## 参照資料

| 資料名                   | パス                                          | 説明            |
| ------------------------ | --------------------------------------------- | --------------- |
| 設計成果物               | `outputs/phase-2/design-document.md`          | 統合方針        |
| 統合戦略書               | `outputs/phase-2/ipc-unification-strategy.md` | 方針選択根拠    |
| 実装記録                 | `outputs/phase-5/implementation-record.md`    | 変更内容        |
| テスト拡充記録           | `outputs/phase-6/test-expansion.md`           | 境界ケース      |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`          | AC 対応表       |
| リファクタリングログ     | `outputs/phase-8/refactoring-log.md`          | 最小複雑性判断  |
| QA レポート              | `outputs/phase-9/qa-report.md`                | 準拠根拠        |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`     | 総合判定        |
| IPCチャネルインベントリ  | `outputs/phase-1/ipc-channel-inventory.md`    | Phase 1 成果物  |
| 仕様抽出マップ           | `outputs/phase-1/spec-extraction-map.md`      | Phase 1 成果物  |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`   | Phase 11 成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |

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

- [ ] 必須 6 成果物が揃っている
- [ ] Part 1（中学生レベル）と Part 2（技術詳細）が分離されている
- [ ] `system-spec-update-summary.md` に update / no-op 判定が記録されている
- [ ] `manual-test-checklist.md` / `screenshot-plan.json` / `screenshots/non-visual-placeholder.png` が揃っている
- [ ] 計画系文言が除去されている
- [ ] skill 準拠結果が記録されている
- [ ] documentation-changelog.md に変更一覧が記録されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` に派生タスク有無が記録されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` に総合確認が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
