# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 12                                                         |
| Phase名    | ドキュメント更新                                           |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 11（手動テスト）                                     |
| 後続Phase  | Phase 13（PR作成）                                         |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

| Task      | 内容                                                   | 主成果物                                        |
| --------- | ------------------------------------------------------ | ----------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`      |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/spec-update-summary.md`       |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`   |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`     |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

## 参照資料

| 参照資料                      | パス                                                                                            | 内容                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 2 設計サマリー          | `outputs/phase-2/design-summary.md`                                                             | 最終仕様同期時の設計意図        |
| Phase 5 実装サマリー          | `outputs/phase-5/implementation-summary.md`                                                     | 実装差分の確定版                |
| Phase 6 テスト拡充サマリー    | `outputs/phase-6/test-expansion-summary.md`                                                     | 異常系・境界値の補強結果        |
| Phase 7 カバレッジ結果        | `outputs/phase-7/coverage-report.md`                                                            | カバレッジ達成の証跡            |
| Phase 8 リファクタリング結果  | `outputs/phase-8/refactoring-summary.md`                                                        | 品質改善の最終状態              |
| Phase 9 品質検証結果          | `outputs/phase-9/quality-report.md`                                                             | 最終品質ゲート結果              |
| Phase 10 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                                       | 指摘の最終確定                  |
| Phase 11 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                                        | 手動テストの結果                |
| Phase 11 発見した問題         | `outputs/phase-11/discovered-issues.md`                                                         | 発見した問題と対応方針          |
| resource-map                  | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | 仕様抽出の起点                  |
| quick-reference               | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | runtime/authmode 抽出順序       |
| workflow-ai-runtime-authmode  | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | 親 workflow と canonical set    |
| legacy-family-register        | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧ファイル名との互換導線        |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`            | execute 契約正本                |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`               | skill lifecycle 契約            |
| interfaces-agent-sdk-ui       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  | UI / Hook 正本                  |
| interfaces-llm                | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | RuntimeResolution / Guidance 型 |
| interfaces-auth               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | authMode / auth key 契約        |
| api-ipc-agent-core            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | chat-edit runtime IPC 契約      |
| api-ipc-agent                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                            | Skill / Agent IPC 契約          |
| api-ipc-system                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | system IPC / authMode 契約      |
| security-electron-ipc-core    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | workspacePath 境界検証          |
| security-electron-ipc         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC sender 検証と境界防御       |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                 | permission 正本                 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                   | DI 正本                         |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                    | Store 正本                      |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | UI 契約                         |
| ui-ux-feature-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | runtime 関連 UI の横断仕様      |
| ui-ux-settings                | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | 設定導線と authMode UI          |
| llm-workspace-chat-edit       | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver 移設元契約      |
| ipc-contract-checklist        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                   | IPC 契約監査チェック項目        |
| task-workflow                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳の同期先                |
| lessons-learned-current       | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                  | Runtime/AuthMode の再利用知見   |
| follow-up unassigned          | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`         | 関連未タスクの境界条件          |

## 実行手順

### 事前チェック（必須）

`.claude/rules/06-known-pitfalls.md` の以下の Pitfall を確認してから作業を開始する:

- [x] P1: LOGS.md 2ファイル更新漏れ
- [x] P2: topic-map.md 再生成忘れ
- [x] P3: 未タスク管理の3ステップ不完全
- [x] P4: documentation-changelog への早期「完了」記載
- [x] P25: Phase 12 LOGS.md 2ファイル更新漏れ（再発防止）
- [x] P26: システム仕様書更新遅延
- [x] P27: topic-map.md 再生成トリガーの判断ミス
- [x] P28: スキルフィードバックレポート未作成
- [x] P43: Phase 12 サブエージェントの rate limit 中断（1エージェントあたり3ファイル以下に分割）
- [x] P51: サブエージェントの documentation-changelog 早期完了記載

### Task 12-1: 技術ドキュメント作成

#### Part 1: 初学者・非技術者向け概念説明

中学生でもわかるレベルで以下を説明する（日常の例え「たとえば」を必ず含める）:

1. runtime routing とは何か（たとえばレジの振り分けのような例え）
2. authMode（subscription / api-key）の違いが実行パスに与える影響
3. TerminalHandoffCard が表示される理由と役割
4. integrated 実行と terminal handoff の違い

#### Part 2: 開発者向け技術詳細

以下を詳細に記述する:

1. RuntimeResolver の共通化設計（SkillExecutor / AgentExecutor / SkillCreatorService への適用方法）
2. authMode 分岐の実装パターン（Renderer Hook での分岐追加箇所と方法）
3. TerminalHandoffCard の実装詳細（コンポーネント構造、Store 接続、IPC データフロー）
4. 既存の preflight / permission / streaming 契約が維持されていることの説明
5. P31 / P48 / P5 の Pitfall 対策が実装にどのように反映されているか

### Task 12-2: システムドキュメント更新

P26 対策: PRマージを待たず、Phase 12 完了時点で全システム仕様書を更新する。

#### Step 1-A: タスク完了記録

以下の全ファイルを更新する（P1 / P25 対策: 2ファイル両方を必ず更新する）:

- [x] `.claude/skills/aiworkflow-requirements/LOGS.md` に完了タスクを追加する（1ファイル目）
- [x] `.claude/skills/task-specification-creator/LOGS.md` に完了タスクを追加する（2ファイル目）
- [x] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新する（P29 対策）
- [x] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴テーブルを更新する（P29 対策）

#### Step 1-B: 実装状況テーブル更新

- [x] 該当する実装状況テーブルを更新する（SkillExecutor / AgentExecutor の runtime routing 状態を「未対応」から「対応済み」に変更する）

#### Step 1-C: 関連タスクテーブル更新

- [x] `grep -rn "UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001" .claude/skills/aiworkflow-requirements/references/` を実行して関連仕様書を検索する
- [x] 検出された仕様書の関連タスクテーブルにタスク完了を記録する

#### Step 1-D: topic-map.md 再生成（P2 / P27 対策）

仕様書に追加・削除・更新のいずれかの変更があった場合は必ず再生成する（「新規追加なし」でも変更があれば再生成対象）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [x] コマンドを実行し、実行ログで再生成を確認する
- [x] `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

#### Step 1-E: Phase 12 同期検証コマンドを実行する

```bash
# 未タスクリンクの参照整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# current/baseline 分離で未タスク監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD

# workflow index を artifacts.json と同期
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/runtime-routing-integration-closure --regenerate
```

- [x] `verify-unassigned-links` が `ALL_LINKS_EXIST` を返している
- [x] `audit-unassigned-tasks --json --diff-from HEAD` の `currentViolations.total` を記録している
- [x] `index.md` の Phase 状態と `artifacts.json` の状態が一致している

#### Step 2: システム仕様更新

本タスクは新規インターフェース追加・アーキテクチャ変更を含むため、以下のシステム仕様書を更新する（P26 対策）:

- [x] `interfaces-agent-sdk-executor.md`: RuntimeResolver 共通化の反映（SkillExecutor / AgentExecutor へのインターフェース追加）
- [x] `arch-electron-services.md`: composition root の DI 拡張（RuntimeResolver の DI 登録追加）
- [x] `ui-ux-agent-execution.md`: TerminalHandoffCard 仕様追加（コンポーネント仕様・表示条件・インタラクション）
- [x] `arch-state-management.md`: handoffGuidance 状態管理追加（Slice 定義・セレクタ一覧）

**注意**: サブエージェントに委譲する場合は1エージェントあたり3ファイル以下に分割する（P43 対策）。

#### Step 3: IPC 契約検証（IPC 修正タスクのため必須）

- [x] IPC ハンドラ引数形式と Preload 側の呼び出し形式が一致していることを確認する
- [x] 引数名のセマンティクスが実際の値と一致していることを確認する（P45 対策）
- [x] P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装されていることを確認する

### Task 12-3: ドキュメント更新履歴作成

**P4 対策**: 全 Step の実行が完了した後に初めて「完了」と記載する。各 Step の完了結果を詳細に記録し、未確認の Step がある間は「実行中」と記載する。

`outputs/phase-12/documentation-changelog.md` に以下を記録する:

- 更新した全仕様書のファイルパス・変更内容・変更理由
- 各 Step（1-A / 1-B / 1-C / 1-D / Step 2）の完了結果（ファイル名・変更行数・変更内容の要約）
- 未完了の Step がある場合はその理由

### Task 12-4: 未タスク検出

**P3 / P38 対策**: 以下の3ステップを全て完了すること（指示書作成のみでは不完全）。

- [x] `outputs/phase-12/unassigned-task-detection.md` を作成する（検出数が0件でも必ず作成する）
- [x] 検出した未タスクに対して以下の3ステップを全て完了する:
  1. `docs/30-workflows/unassigned-task/` に指示書を作成する（`tasks/` 直下ではなく `unassigned-task/` 配下に配置する）
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
  3. 関連仕様書に参照リンクを追加する
- [x] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータスを更新する
- [x] `artifacts.json` の Phase 12 ステータスを更新する
- [x] 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close <number> --comment "再評価クローズ: <理由>"` でクローズする（P56 対策）

### Task 12-5: スキルフィードバックレポート作成

**P28 対策**: 改善点がない場合でも「改善点なし」としてレポートを作成する。

`outputs/phase-12/skill-feedback-report.md` に以下を記録する:

1. 本タスクで発生した Pitfall（既知・新規）とその対応
2. ワークフロー改善点（発見した場合）
3. 技術的教訓（苦戦した箇所と解決策）
4. 将来のタスクへの推奨事項

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                       | 仕様参照先                                                  |
| -------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| アーキテクチャ | 該当（RuntimeResolver DI 変更）                | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信        | 該当（SkillExecutor / AgentExecutor IPC 変更） | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| UI/UX          | 該当（TerminalHandoffCard 新規追加）           | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| 状態管理       | 該当（handoffGuidance Slice 追加）             | `aiworkflow-requirements: arch-state-management.md`         |

## 成果物

| 成果物                       | パス                                            | 内容                                        |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Part1（初学者向け）+ Part2（開発者向け）    |
| システム仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | 更新したシステム仕様書の一覧と変更内容      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 全 Step の完了結果と詳細な変更内容          |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 検出した未タスク一覧（0件の場合も必ず作成） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | 教訓・改善点・推奨事項                      |

## 完了条件

- [x] `implementation-guide.md` の Part 1 に「たとえば」を含む日常の例えが記載されている
- [x] `implementation-guide.md` の Part 2 に RuntimeResolver 共通化・TerminalHandoffCard・Store 接続の技術詳細が記載されている
- [x] `.claude/skills/aiworkflow-requirements/LOGS.md` が更新されている（P1 / P25 対策：1ファイル目）
- [x] `.claude/skills/task-specification-creator/LOGS.md` が更新されている（P1 / P25 対策：2ファイル目）
- [x] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴が更新されている（P29 対策）
- [x] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴が更新されている（P29 対策）
- [x] `interfaces-agent-sdk-executor.md` に RuntimeResolver 共通化が反映されている（P26 対策）
- [x] `arch-electron-services.md` に composition root の DI 拡張が反映されている（P26 対策）
- [x] `ui-ux-agent-execution.md` に TerminalHandoffCard 仕様が追加されている（P26 対策）
- [x] `arch-state-management.md` に handoffGuidance 状態管理が追加されている（P26 対策）
- [x] `outputs/phase-12/spec-update-summary.md` が作成され、Step 1/Step 2 の判断根拠が記録されている
- [x] `topic-map.md` が再生成されている（P2 / P27 対策）
- [x] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必ず作成）（P3 / P38 対策）
- [x] 検出した未タスクがある場合、3ステップ（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）が全て完了している（P3 対策）
- [x] `artifacts.json` の Phase 12 ステータスが更新されている
- [x] `verify-unassigned-links` が `ALL_LINKS_EXIST` で完了している
- [x] `audit-unassigned-tasks --json --diff-from HEAD` の `currentViolations.total` が記録されている
- [x] `index.md` と `artifacts.json` の Phase 状態が一致している
- [x] `documentation-changelog.md` に全 Step の完了結果が記録されており、「完了」の記載は全 Step 確認後に行われている（P4 / P51 対策）
- [x] `skill-feedback-report.md` が作成されている（改善点なしの場合も「改善点なし」と記録する）（P28 対策）
- [x] `git diff --stat -- .claude/skills/` で実際の変更ファイルが期待通りであることを確認している（P43 / P51 対策）
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
