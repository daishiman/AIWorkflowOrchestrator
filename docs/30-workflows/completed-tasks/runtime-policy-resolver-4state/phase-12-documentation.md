# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 12                                            |
| Phase 名   | ドキュメント更新                              |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 11（手動テスト）                        |
| 後続 Phase | Phase 13（PR作成）                            |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

実装ガイド、manual evidence、system spec、skill、未タスク台帳を current code に同期し、direct caller lane の完了と follow-up 2件を同時に固定する。

## 実行タスク

- Task 1: 実装ガイドを2パート構成で作成する
- Task 2: system-spec-update-summary.md を作成する
- Task 3: documentation-changelog.md を作成する
- Task 4: unassigned-task-detection.md を作成する
- Task 5: skill-feedback-report.md を作成する
- Task 6: phase12-task-spec-compliance-check.md を作成する

## 参照資料

| 参照資料                | パス                                                                                                          | 内容                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 2 設計            | docs/30-workflows/runtime-policy-resolver-4state/phase-2-design.md                                            | capability bridge 設計    |
| Phase 5 実装            | docs/30-workflows/runtime-policy-resolver-4state/phase-5-implementation.md                                    | direct caller 実装        |
| Phase 6 拡充            | docs/30-workflows/runtime-policy-resolver-4state/phase-6-test-expansion.md                                    | degraded / silent path    |
| Phase 7 計測            | docs/30-workflows/runtime-policy-resolver-4state/phase-7-coverage-check.md                                    | coverage 根拠             |
| Phase 8 整理            | docs/30-workflows/runtime-policy-resolver-4state/phase-8-refactoring.md                                       | 語彙整理結果              |
| Phase 9 品質            | docs/30-workflows/runtime-policy-resolver-4state/phase-9-quality-assurance.md                                 | lint / typecheck / test   |
| Phase 10 最終レビュー   | docs/30-workflows/runtime-policy-resolver-4state/phase-10-final-review.md                                     | AC 検証結果               |
| Phase 11 手動テスト     | docs/30-workflows/runtime-policy-resolver-4state/phase-11-manual-test.md                                      | manual evidence           |
| Phase 12 ガイド         | .claude/skills/task-specification-creator/references/phase-12-documentation-guide.md                          | current Phase 12 契約     |
| spec-update-workflow    | .claude/skills/task-specification-creator/references/spec-update-workflow.md                                  | system spec 更新手順      |
| parent closure task     | docs/30-workflows/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md        | broader lane との境界確認 |
| canonical workflow spec | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | same-wave sync 対象       |

## 実行手順

### Task 1: 実装ガイド作成

- Part 1 に `たとえば` を含む日常アナロジーを補完した
- Part 2 にエッジケースと設定項目を追加した

### Task 2: system spec update summary 作成

#### Step 1-A: タスク完了記録

- backlog から focused lane を外し、completed record へ移した
- public IPC wiring / subscription service integration の follow-up 2件を backlog へ登録した
- workflow / lessons / skill logs を same-wave sync した

#### Step 1-B: 実装状況テーブル更新

- implementation task として completed ledger に記録した
- broader closure task は active のままであることを維持した

#### Step 1-C: 関連タスクテーブル更新

```bash
rg -n "TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001|task-exec-runtime-policy-resolver-4state-001" \
  .claude/skills/aiworkflow-requirements/references/
```

#### Step 1-D: index / topic-map 再生成

```bash
node ./.claude/skills/aiworkflow-requirements/scripts/generate-index.js
node ./.claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/runtime-policy-resolver-4state --regenerate
```

#### Step 1-E: validator 実行

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/runtime-policy-resolver-4state
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/runtime-policy-resolver-4state --strict
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/runtime-policy-resolver-4state
```

#### Step 2: システム仕様更新（該当する場合のみ）

shared/public contract を変更する場合に限り interfaces 系を更新する。direct caller lane のみで閉じる場合は、変更なし理由を `system-spec-update-summary.md` に明記する。

### Task 3: documentation-changelog.md 作成

変更ファイル、validator 実測値、current / baseline の区別を記録する。

### Task 4: 未タスク検出

- `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001`
- `UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001`

### Task 5: スキルフィードバックレポート

workflow skeleton と same-wave sync の改善点を記録する。

### Task 6: phase12-task-spec-compliance-check.md 作成

Task 1〜5 と validator 実行結果を 1 ファイルに統合し、skill 準拠の最終確認結果を記録する。

### Mirror Sync

```bash
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/
diff -qr ./.claude/skills/ ./.agents/skills/
```

## 成果物

| 成果物                             | 配置先                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| 実装ガイド                         | outputs/phase-12/implementation-guide.md                    |
| system spec update summary         | outputs/phase-12/system-spec-update-summary.md              |
| documentation-changelog            | outputs/phase-12/documentation-changelog.md                 |
| unassigned-task-detection          | outputs/phase-12/unassigned-task-detection.md               |
| skill-feedback-report              | outputs/phase-12/skill-feedback-report.md                   |
| phase12-task-spec-compliance-check | outputs/phase-12/phase12-task-spec-compliance-check.md      |
| 再生成済み topic-map.md            | .claude/skills/aiworkflow-requirements/indexes/topic-map.md |

## 完了条件

- [x] Task 1: 実装ガイド（Part 1 + Part 2）が作成されている
- [x] Task 2: system-spec-update-summary.md が作成されている
- [x] Task 3: documentation-changelog.md が作成されている
- [x] Task 4: unassigned-task-detection.md が作成されている（2件 formalize）
- [x] Task 5: skill-feedback-report.md が作成されている
- [x] Task 6: phase12-task-spec-compliance-check.md が作成されている
- [x] Step 1-E: validator 実行結果を Phase 12 成果物へ反映する
- [x] Mirror Sync: `.claude/skills/` と `.agents/skills/` が同期されている（diff 0件）

## 多角的チェック観点

- 論理分析: 批判的思考・演繹思考・帰納的思考・アブダクション・垂直思考で same-wave sync の不足を洗い出す
- 構造分解: 要素分解・MECE・2軸思考・プロセス思考で Phase 12 の 6 成果物を漏れなく配置する
- メタ抽象: メタ思考・抽象化思考・ダブルループ思考で focused lane と canonical skill 更新の関係を見直す
- 発想拡張: ブレインストーミング・水平思考・逆説思考・類推思考・if思考・素人思考で simpler output topology を選ぶ
- システム: システム思考・因果関係分析・因果ループで backlog / workflow / archive / mirror 連鎖を確認する
- 戦略価値: トレードオン思考・プラスサム思考・価値提案思考・戦略的思考で focused lane と parent closure lane の双方を前進させる
- 問題解決: why思考・改善思考・仮説思考・論点思考・KJ法で artifact drift の再発防止策を固定する

## サブタスク管理

1. 参照資料確認
2. Phase 12 の 6 成果物更新
3. validator / index 再生成
4. mirror parity 確認
5. 完了条件検証

## タスク100%実行確認【必須】

- [x] Phase 12 の全タスクを 100% 実行完了
- [x] 6 成果物と validator 結果が揃っている
- [x] artifacts.json と outputs/artifacts.json が同期している
- [x] parent closure lane との same-wave sync が記録されている

## 次 Phase

Phase 13（PR作成）へ進む。
