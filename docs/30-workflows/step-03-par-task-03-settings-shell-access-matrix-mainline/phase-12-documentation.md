# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 12                                                 |
| Phase 名   | ドキュメント                                       |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 |
| 前提 Phase | Phase 11                                           |
| 後続 Phase | Phase 13（PR作成）                                 |
| ステータス | not_started                                        |
| 作成日     | 2026-03-19                                         |
| 機能名     | settings-shell-access-matrix-mainline              |

## 目的

Settings / App shell mainline access matrix の system spec / workflow / backlog / lessons の更新手順を定義する。

## 実行タスク

- implementation guide: future executor 向けの実装順序と注意点を記述する
- system spec sync: workflow / backlog / lessons / canonical refs の同期先を整理する
- unassigned formalization: follow-up へ落とす項目と current/baseline 切り分けを定義する
- skill feedback: task-specification-creator / aiworkflow-requirements skill への改善フィードバックを記録する

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                 | 依存順・並列可否・設計ゲート                      |
| Task index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/index.md | 対象 task のメタ情報と受入基準                    |
| Phase 1                | phase-1-requirements.md                                                                                                                    | 要件定義の確定内容                                |
| Phase 2                | phase-2-design.md                                                                                                                          | 設計内容と validation matrix                      |
| Phase 3                | phase-3-design-review.md                                                                                                                   | review gate の判定                                |
| Phase 4                | phase-4-test-creation.md                                                                                                                   | Phase 4（テスト作成）の仕様書                     |
| Phase 5                | phase-5-implementation.md                                                                                                                  | Phase 5（実装）の仕様書                           |
| Phase 6                | phase-6-test-expansion.md                                                                                                                  | Phase 6（テスト拡充）の仕様書                     |
| Phase 7                | phase-7-coverage-check.md                                                                                                                  | Phase 7（カバレッジ確認）の仕様書                 |
| Phase 8                | phase-8-refactoring.md                                                                                                                     | Phase 8（リファクタリング）の仕様書               |
| Phase 9                | phase-9-quality-assurance.md                                                                                                               | Phase 9（品質検証）の仕様書                       |
| Phase 10               | phase-10-final-review.md                                                                                                                   | Phase 10（最終レビュー）の仕様書                  |
| Phase 11               | phase-11-manual-test.md                                                                                                                    | Phase 11（手動テスト）の仕様書                    |
| 旧canonical workflow   | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                              | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                                                     | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                                                        | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                                                   | 矛盾・依存・漏れの監査軸                          |
| workflow 正本          | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md                              | runtime 責務再配線の current canonical            |
| resource map           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                                             | 必要仕様の初動選定                                |
| quick reference        | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                                                          | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth        | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                                                       | auth/access 契約の親入口                          |
| api-ipc-system         | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                                                        | system IPC 契約の親入口                           |
| arch-state-management  | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                                                 | Renderer 責務境界の親入口                         |
| Task02 index           | docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md                                                               | 共有 policy の消費契約                            |
| ui-ux-settings         | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                                                                        | Settings 正本の親入口                             |
| ui-ux-settings-core    | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                                                                   | Settings IA / bypass / screenshot 契約            |
| ui-ux-navigation       | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                                      | settings 公開導線・nav 契約                       |
| llm-ipc-types          | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                                                         | health row の型契約                               |

## 実行手順

### ステップ1: Task 1 -- implementation-guide.md の作成

05-task-execution.md Phase 12 チェックリスト準拠で implementation-guide.md を作成する。

**Part 1: 中学生レベル概念説明（日常例え必須）**

1. Settings Access Matrix を「学校の教室にある連絡掲示板」のような日常例えで説明する
2. 4 capability 状態（active / degraded / unavailable / not-configured）を「信号機の色」のような例えで説明する
3. Persistent Launcher を「どの教室にも設置されている校内放送スピーカー」のような例えで説明する
4. 未認証時 guidance-only を「校門の案内板（中に入るには学生証が必要）」のような例えで説明する

**Part 2: 開発者向け実装詳細**

1. 3 Concern の実装順序と依存関係を明記する
   - Concern 1: Settings Access Matrix Section（CapabilityCard / HealthStatusRow / ProviderSummaryCard）
   - Concern 2: AppLayout Persistent Launcher（TerminalLauncher）
   - Concern 3: Public Shell Access Contract（未認証時 guidance-only）
2. 各 Concern の実装時に注意すべき回帰観点（RG-01〜RG-06）を対応付ける
3. 既存契約との整合ポイント（Settings bypass / Reset exclusion / Public shell / CTA 契約）を列挙する
4. component-documentation.md 相当として、CapabilityCard / HealthStatusRow / ProviderSummaryCard / TerminalLauncher の props interface と責務を記述する

### ステップ2: Task 2 -- システム仕様書更新（05-task-execution.md Step 1-A〜1-D + Step 2 準拠）

**Step 1-A: タスク完了記録**

1. 該当仕様書（ui-ux-settings.md / ui-ux-settings-core.md）にタスク完了記録を追加する
2. `aiworkflow-requirements/LOGS.md` を更新する
3. `task-specification-creator/LOGS.md` を更新する（**2ファイル両方** -- P1/P25 対策）
4. `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
5. `task-specification-creator/SKILL.md` の変更履歴を更新する

**Step 1-B: 実装状況テーブル（該当する場合）**

1. Settings 関連の実装ステータステーブルがある場合は更新する

**Step 1-C: 関連タスクテーブル**

1. `grep -rn "TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001" references/` で関連仕様書を検索する
2. 検索結果の各仕様書のタスクテーブルを更新する

**Step 1-D: topic-map.md 再生成**

1. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する（P2/P27 対策）
2. 再生成後の `indexes/topic-map.md` が正しく更新されたことを確認する

**Step 2: システム仕様更新**

1. 設計タスクのため、新規インターフェース定義やアーキテクチャ変更がある場合のみ実施する
2. P57（設計タスクにおける先送りパターン）を回避し、worktree 環境で即時更新する

**P43 対策**: 仕様書更新は3ファイル以下/エージェントに分割する。LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする

### ステップ3: Task 3 -- documentation-changelog.md の作成

1. 更新した全仕様書の変更内容を `outputs/phase-12/documentation-changelog.md` に記録する
2. 各 Step（1-A / 1-B / 1-C / 1-D / Step 2）の完了結果を詳細に記録する
3. **P4/P51 対策**: 全 Step 確認前に「完了」と記載しない。各 Step の実行結果は「事後記録」とする
4. **P59 対策**: 並列エージェントを使用した場合、changelog は最後にメインエージェントが統合し、unassigned-task-detection.md の検出件数と照合してから記録する

### ステップ4: Task 4 -- 未タスク検出と unassigned-task-report.md の作成

1. Phase 1〜11 の全成果物を横断し、未解決の follow-up 項目を洗い出す
2. `outputs/phase-12/unassigned-task-detection.md` を作成する（**0件でも必須**）
3. 検出した未タスクは P3/P38 準拠の3ステップ全完了:
   - (1) `docs/30-workflows/unassigned-task/` に指示書を作成する（P58 対策: 設計タスクでも省略しない）
   - (2) `task-workflow.md` の残課題テーブルに登録する
   - (3) 関連仕様書に参照リンクを追加する
4. 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close` で同時に Close する（P56 対策）
5. `artifacts.json` の Phase 12 ステータスを更新する
6. `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成: 05-task-execution.md 準拠の全チェック項目の PASS/FAIL を記録する

### ステップ5: スキルフィードバックレポート作成（P28 対策）

task-specification-creator / aiworkflow-requirements skill に対する改善フィードバックを記録する。改善点がなくても「改善点なし」として `outputs/phase-12/skill-feedback-report.md` を作成する（P28 準拠: 改善点なしでもレポート必須）。

**Mirror Sync**: `.claude/skills/` を更新した場合、`rsync -avz --checksum ./.claude/skills/ ./.agents/skills/` で mirror を同期し、`diff -qr` で 0 差分を確認する

## 統合テスト連携（Phase 1〜11は必須）

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: Settings / AppLayout / public unauthenticated shell に capability cards / health row / terminal launcher を実装する設計を固める

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物               | パス                                                   | 内容                               |
| -------------------- | ------------------------------------------------------ | ---------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md               | 後続実装者への handoff             |
| 仕様同期サマリー     | outputs/phase-12/system-spec-update-summary.md         | system spec / workflow sync の要約 |
| 更新履歴             | outputs/phase-12/documentation-changelog.md            | 同ターン更新の記録                 |
| 未タスク検出         | outputs/phase-12/unassigned-task-detection.md          | formalize 対象の follow-up 一覧    |
| Phase12 準拠チェック | outputs/phase-12/phase12-task-spec-compliance-check.md | task-spec skill 準拠確認           |
| スキルフィードバック | outputs/phase-12/skill-feedback-report.md              | skill 改善点（0件でも必須）        |

## 完了条件

- [ ] implementation-guide / system-spec-update-summary / unassigned formalization の構成が揃っている
- [ ] same-wave sync 対象が漏れなく列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-12/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
