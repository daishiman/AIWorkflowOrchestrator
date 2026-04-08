# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 12                                       |
| Phase名    | ドキュメント更新                         |
| 前提Phase  | Phase 11                                 |
| 後続Phase  | Phase 13                                 |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

6つの必須タスク（実装ガイド・システム仕様更新・ドキュメント更新履歴・未タスク検出・スキルフィードバック・準拠チェック）を全て完了し、TASK-SC-13 の実装内容とドキュメントの整合を記録する。

---

## Phase 12 記録分離方針

- `実行タスク` は plan。`Phase実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は Task / Step / validator / artifacts.json / current-baseline の同値性を集約する root evidence として必ず作成する
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする

---

## 実行タスク

### Task 12-1: 実装ガイド作成（2パート構成）

**目的**: Part 1（中学生レベル）と Part 2（技術者レベル）の実装ガイドを作成する

#### Part 1: 中学生レベルの概念説明

- 「skill-creator:verify とは何か」を日常の例え話で説明する
- 専門用語を使わず、「なぜ必要か」を先に説明してから「何をするか」を説明する
- IPC チャネルの概念を図書館カウンター（受付窓口）の例えで説明する

#### Part 2: 技術者レベルの詳細説明

- `VerifyResult` / `VerifyCheckResult` 型定義（TypeScript）
- `verifySkill(skillName, authMode, apiKey)` APIシグネチャと使用例
- `skillName` から `skillDir` へ解決して `verificationEngine.verify(skillDir)` を呼ぶ流れ
- エラーハンドリング（`sanitizeErrorMessage`）とエッジケース
- `SKILL_CREATOR_VERIFY` 定数・`preload/channels.ts` whitelist・4層アーキテクチャ図

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### Task 12-2: システム仕様書更新（4サブステップ）

#### Step 1-A: タスク完了記録

以下を同 wave で更新する:

- `task-workflow-completed.md` に TASK-SC-13 の完了記録を追加する
- `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- `.claude/skills/task-specification-creator/LOGS.md` を更新する
- `topic-map.md` に `skill-creator:verify` チャネルのエントリを追加する

存在しない場合は `該当なし (N/A)` として記録し、無理に新規作成しない。

#### Step 1-B: 実装状況テーブル更新

- 実装完了の場合: 「未実装」→「完了」
- `task-workflow-backlog.md` の TASK-SC-13 ステータスを `completed` に更新する

#### Step 1-C: 関連タスクテーブル更新

- TASK-SC-08 の「verify チャネルを本タスクに委譲」の記録を更新する
- TASK-P0-01 との関連（VerificationEngine 利用）を記録する

#### Step 2: システム仕様更新（新規インターフェース追加のため必須）

以下を追加・更新する（新規インターフェース追加のため Step 2 必須）:

- `interfaces-agent-sdk-skill-reference.md` または相当ファイルに `VerifyResult` 型を追記する
- `api-ipc-system-core.md` または相当ファイルに `skill-creator:verify` チャネルを追記する
- `SKILL_CREATOR_VERIFY` 定数の追加を仕様書に反映する
- `preload/channels.ts` の `IPC_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` 反映を仕様書に明記する

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

---

### Task 12-3: ドキュメント更新履歴作成

以下の形式で `outputs/phase-12/documentation-changelog.md` を作成する:

| Step     | 更新内容                                       | 対象ファイル                       | 結果            |
| -------- | ---------------------------------------------- | ---------------------------------- | --------------- |
| Step 1-A | TASK-SC-13 完了記録追加                        | task-workflow-completed.md         | 完了 / 該当なし |
| Step 1-A | LOGS.md 更新                                   | aiworkflow-requirements/LOGS.md    | 完了 / 該当なし |
| Step 1-A | LOGS.md 更新                                   | task-specification-creator/LOGS.md | 完了 / 該当なし |
| Step 1-A | topic-map.md 更新                              | topic-map.md                       | 完了 / 該当なし |
| Step 1-B | 実装状況テーブル更新                           | task-workflow-backlog.md           | 完了 / 該当なし |
| Step 1-C | 関連タスクテーブル更新                         | TASK-SC-08 / TASK-P0-01 仕様書     | 完了 / 該当なし |
| Step 2   | VerifyResult 型・SKILL_CREATOR_VERIFY 定数追記 | interfaces-_.md / api-_.md         | 完了 / 該当なし |

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出レポート作成（0件でも出力必須）

以下のソースから未タスク候補を検出する:

| ソース                  | 確認項目                                             |
| ----------------------- | ---------------------------------------------------- |
| Phase 3/10 レビュー結果 | MINOR 判定の指摘事項                                 |
| Phase 11 手動テスト     | `discovered-issues.md` の内容                        |
| コードコメント          | TODO/FIXME/HACK/XXX（verify 関連ファイル）           |
| スコープ外明示事項      | Phase 1 でスコープ外とした項目（E2E シナリオ追加等） |

```bash
# 未タスク候補の検出
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/ipc/creatorHandlers.ts \
  --scan apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  --output outputs/phase-12/unassigned-candidates.json
```

**成果物**: `outputs/phase-12/unassigned-task-detection.md`（0件でも作成必須）

---

### Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

| 観点             | 記録内容                                                                       |
| ---------------- | ------------------------------------------------------------------------------ |
| テンプレート改善 | Phase 仕様書テンプレートの漏れや曖昧さ                                         |
| ワークフロー改善 | IPC ハンドラ実装タスクに特有の手順分岐の改善余地                               |
| ドキュメント改善 | `validateSender + isBlank + sanitizeErrorMessage` パターンのガイドライン化候補 |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

### Task 12-6: phase12-task-spec-compliance-check 作成

**目的**: Task 12-1〜12-5 の完了を集約する root evidence を作成する

**チェック項目**:

- [ ] `implementation-guide.md` が Part 1/2 を満たしているか
- [ ] `system-spec-update-summary.md` が Step 1-A〜1-C / Step 2 の実ファイル更新先を記録しているか
- [ ] `documentation-changelog.md` が全 Step を個別に記録しているか（「該当なし」も記録）
- [ ] `unassigned-task-detection.md` が作成されているか（0件でも）
- [ ] `skill-feedback-report.md` が作成されているか（改善点なしでも）
- [ ] `outputs/artifacts.json` と `outputs/phase-12/*.md` の整合が取れているか
- [ ] `implementation-guide.md` 内の識別子が現行コードと一致しているか（identifier drift なし）

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料              | パス                                                                                      | 内容                                |
| --------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| 依存Phase             | Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 / Phase 10 / Phase 11 | 本Phase の前提                      |
| Phase 11 手動テスト   | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-11-manual-test.md`      | NON_VISUAL 記録と未タスク候補の前提 |
| Phase 10 最終レビュー | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-10-final-review.md`     | AC 判定の最終根拠                   |
| 仕様更新ワークフロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`            | Step 1 / Step 2 の更新規約          |
| 正本仕様スキル        | `.claude/skills/aiworkflow-requirements/SKILL.md`                                         | 仕様更新対象の正本ルール            |
| 仕様作成スキル        | `.claude/skills/task-specification-creator/SKILL.md`                                      | Phase 12 の必須成果物と検証規約     |

## 成果物

| 成果物                            | パス                                                     | 内容                                      |
| --------------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| 実装ガイド                        | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生レベル）+ Part 2（技術者）  |
| システム仕様更新サマリー          | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2 の実ファイル更新先 |
| ドキュメント更新履歴              | `outputs/phase-12/documentation-changelog.md`            | 全 Step の結果（該当なしも記録）          |
| 未タスク検出レポート              | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須                           |
| スキルフィードバックレポート      | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須                    |
| Phase 12 コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 全成果物の同値性集約                      |

---

## よくある漏れ（Phase 12 完了前チェック）

- [ ] Step 1-C（関連タスクテーブル）を実行したか
- [ ] topic-map.md を更新したか
- [ ] `documentation-changelog.md` の全 Step が個別に記録されているか（「該当なし」も記録）
- [ ] LOGS.md が aiworkflow-requirements と task-specification-creator の両方更新されているか
- [ ] `artifacts.json` と `outputs/artifacts.json` が同期されているか
- [ ] `implementation-guide.md` の識別子が現行コードと一致しているか

---

## 完了条件

- [ ] `implementation-guide.md` が Part 1/2 を満たして作成されていること
- [ ] `system-spec-update-summary.md` が Step 1-A〜1-C / Step 2 の実ファイル更新先まで記録されていること
- [ ] `documentation-changelog.md` が全 Step を記録していること
- [ ] `unassigned-task-detection.md` が作成されていること（0件でも）
- [ ] `skill-feedback-report.md` が作成されていること
- [ ] `phase12-task-spec-compliance-check.md` が作成されていること
- [ ] `task-workflow-completed.md` に TASK-SC-13 の完了記録が追加されていること
- [ ] aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方が更新されていること
- [ ] `artifacts.json` の Phase 12 ステータスが `completed` に更新されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## 次Phase

**Phase 13: PR作成** — ユーザーの明示承認後のみ実施する。
