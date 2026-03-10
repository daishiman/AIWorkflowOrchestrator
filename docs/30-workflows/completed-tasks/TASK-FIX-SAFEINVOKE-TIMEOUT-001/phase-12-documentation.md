# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 12                              |
| Phase名    | ドキュメント                    |
| カテゴリ   | fix                             |
| ステータス | completed                       |
| 前提Phase  | Phase 11                        |
| 後続Phase  | Phase 13                        |

## 目的

実装ガイド・システム仕様書更新・未タスク検出を行う。中学生レベルの概念説明（Part 1）を含む。

## 事前チェック

- `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目（P1, P2, P3, P4, P25, P27, P28, P43）を確認する
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` の要件を先に確認する
- SubAgent 分割は 1エージェント 3ファイル以下を上限とし、LOGS / SKILL 更新は最終ステップに集約する
- `index.md` の「実装関心ごとマップ」と「必要仕様抽出マトリクス」を基点に、更新対象仕様と証跡を漏れなく洗い出す

## 実行タスク

| Task      | 内容                               | 主成果物                                        |
| --------- | ---------------------------------- | ----------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド） | `outputs/phase-12/implementation-guide.md`      |
| Task 12-2 | システムドキュメント更新           | `outputs/phase-12/spec-update-summary.md`       |
| Task 12-3 | ドキュメント更新履歴作成           | `outputs/phase-12/documentation-changelog.md`   |
| Task 12-4 | 未タスク検出                       | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成   | `outputs/phase-12/skill-feedback-report.md`     |

- Task 12-1: 技術ドキュメント作成（実装ガイド）
- Task 12-2: システムドキュメント更新
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出
- Task 12-5: スキルフィードバックレポート作成

### Task 1: 実装ガイド作成【必須】

#### 1-1: implementation-guide.md Part 1（中学生レベル概念説明）

**目的**: 技術的でない読者にも理解できる概念説明を作成する

**内容**:

```markdown
# safeInvoke タイムアウト - やさしい解説

## どんな問題？

友だちに電話をかけたとき、相手がいつまでも出ないことがあります。
普通なら「30秒待っても出ないなら切ろう」と判断しますよね。

でも、これまでの `safeInvoke` は「相手が出るまで永遠に待ち続ける電話」
のようなものでした。相手が出ない限り、ずっと電話を持ったまま何もできません。

## どう直した？

「5秒待っても返事がなかったら、電話を切る」仕組みを追加しました。

イメージ：

1. 電話をかける（IPC呼び出し）
2. 同時に5秒のタイマーを開始
3. 相手が出たら → そのまま会話（正常応答）
4. 5秒経っても出なかったら → 電話を切って「出ませんでした」と報告（タイムアウトエラー）

## 技術的には何をした？

`Promise.race` という「競争」の仕組みを使いました。
IPC呼び出しとタイムアウトタイマーを同時にスタートさせて、
先にゴールした方の結果を採用します。
```

#### 1-2: implementation-guide.md Part 2（開発者向け実装詳細）

**目的**: 開発者が実装を理解・保守できる詳細ガイドを作成する

**内容**:

- 変更ファイルとdiff
- `Promise.race` パターンの解説
- `IPC_TIMEOUT_MS` 定数の説明
- エラーメッセージ形式
- テストの実行方法
- メモリリーク対策の判断根拠
- 関連する既知の落とし穴（P13, P42, P44）

#### 1-3: ipc-documentation.md

**目的**: IPC 契約を更新した場合のみ、IPC レイヤーのドキュメントを更新する

**更新内容**:

- `safeInvoke` のタイムアウト仕様を追加
- エラーパターン一覧にタイムアウトエラーを追加
- 呼び出し元でのエラーハンドリング推奨パターン

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書に `## 完了タスク` セクションを追加
- [ ] 関連ドキュメントに `outputs/phase-12/implementation-guide.md` へのリンクを追加
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` を更新
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新（**2ファイル両方必須**）
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新

#### Step 1-B: 実装状況テーブル

- [ ] `api-endpoints.md` 等の実装ステータス更新（該当する場合）

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-SAFEINVOKE-TIMEOUT-001" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新
- [ ] 未タスクを検出した場合、`docs/30-workflows/unassigned-task/` と `docs/30-workflows/completed-tasks/unassigned-task/` の配置先判定を記録する

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して `indexes/topic-map.md` と `indexes/keywords.json` を再生成
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001 --regenerate` を実行して workflow `index.md` を同期

#### Step 2: システム仕様更新

- [ ] `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` に safeInvoke タイムアウト仕様を追記（該当する場合）
- [ ] `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` にタイムアウトパターンを追記（該当する場合）
- [ ] 更新不要の場合、`outputs/phase-12/documentation-changelog.md` に「更新なし」と理由を明記する

#### Step 3: 実行証跡整合

- [ ] `outputs/phase-12/spec-update-summary.md` に Step 1-A〜Step 3 の結果を記録する
- [ ] `artifacts.json` と `index.md` と `phase-12-documentation.md` のステータス表記を同期する
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、未タスクリンク切れ 0 件を確認する

#### Step 4: IPC 契約検証

- [ ] safeInvoke のインターフェースに変更がないことを確認
- [ ] Preload 側の呼び出し形式に変更がないことを確認

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を**事後記録**（P4/P51 対策: 実行前に「完了」と書かない）

### Task 4: 未タスク検出

- [ ] `unassigned-task-detection.md` 作成（**0件でも必須**）
- [ ] 検出した未タスクは3ステップ全完了（P3/P38 対策）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新

**想定される未タスク候補**:

| 候補                        | 説明                                                 | 優先度 |
| --------------------------- | ---------------------------------------------------- | ------ |
| safeOn タイムアウト         | safeOn にも同様のタイムアウト機構が必要か検討        | P3     |
| IPC_TIMEOUT_MS カスタマイズ | チャンネルごとに異なるタイムアウト値を設定可能にする | P4     |
| タイムアウト時のリトライ    | タイムアウト後の自動リトライ機構                     | P4     |

### Task 5: スキルフィードバックレポート

- [ ] `outputs/phase-12/skill-feedback-report.md` を作成する（改善点なしでも必須）
- [ ] テンプレート改善・検証コマンド改善・抽出導線改善の3観点で記録する
- [ ] safeInvoke timeout 系タスクで不足していた導線や validator ギャップを再利用可能な形で残す

## 参照資料

| 参照資料                  | パス                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Phase 2 設計              | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`            |
| Phase 5 実装              | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-5-implementation.md`    |
| Phase 6 テスト拡充        | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-6-test-expansion.md`    |
| Phase 7 カバレッジ確認    | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-7-coverage-check.md`    |
| Phase 8 リファクタリング  | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-8-refactoring.md`       |
| Phase 9 品質保証          | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー     | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-10-final-review.md`     |
| Phase 11 手動テスト       | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-11-manual-test.md`      |
| spec-update-workflow      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                   |
| Phase 11/12 ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                      |
| Phase 12 チェックリスト   | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`           |
| P1/P25: LOGS.md 2ファイル | `.claude/rules/06-known-pitfalls.md#P1`                                                          |
| P2/P27: topic-map 再生成  | `.claude/rules/06-known-pitfalls.md#P2`                                                          |
| P3/P38: 未タスク3ステップ | `.claude/rules/06-known-pitfalls.md#P3`                                                          |
| P4/P51: 早期完了記載      | `.claude/rules/06-known-pitfalls.md#P4`                                                          |
| P43: サブエージェント分割 | `.claude/rules/06-known-pitfalls.md#P43`                                                         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                   | 内容                             |
| ------------------ | ---------------------------------------------------------------------- | -------------------------------- |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 教訓の資産化                     |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | タスクワークフロー管理・完了記録 |

## 統合テスト連携

- Phase 12 の全タスク完了後に Phase 13 へ
- サブエージェントに委譲する場合は 3ファイル以下/エージェントに分割し、LOGS / SKILL 更新は最後に集約する

## 成果物

| 成果物                       | パス                                              |
| ---------------------------- | ------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`        |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`         |
| documentation-changelog      | `outputs/phase-12/documentation-changelog.md`     |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`       |
| IPC ドキュメント             | `outputs/phase-12/ipc-documentation.md`（該当時） |

## 完了条件

- [ ] implementation-guide.md Part 1（中学生レベル説明）作成
- [ ] implementation-guide.md Part 2（開発者向け詳細）作成
- [ ] `validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` が PASS
- [ ] spec-update-summary.md 作成
- [ ] Step 1-A: タスク完了記録（LOGS.md 2ファイル含む）
- [ ] Step 1-C: 関連タスクテーブル更新
- [ ] Step 1-D: topic-map.md 再生成
- [ ] Step 2: システム仕様更新（該当する場合）
- [ ] documentation-changelog.md 作成（事後記録）
- [ ] 未タスク検出・レポート作成
- [ ] skill-feedback-report.md 作成
- [ ] artifacts.json 更新
- [ ] index.md と phase-12-documentation.md のステータス同期
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 13: PR作成へ進む。成果物最終確認と、ユーザー明示指示がある場合のみコミット/PR 準備を行う。
