# TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 - タスク実行仕様書

## ユーザーからの元の指示

- task-specification-creator と aiworkflow-requirements の2スキル準拠を確認する。
- 本ブランチ差分への反映漏れを監査する。
- 並列実行可能な作業を分離し、SubAgent 単位で進める。
- 仕様書作成に集中し、コミット/PRは実施しない。

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001   |
| タスク名     | skill:chain:list ハンドラ未登録の再発防止       |
| 分類         | fix                                             |
| 対象機能     | IPC配線の登録漏れ防止                           |
| 優先度       | high                                            |
| 見積もり規模 | medium                                          |
| ステータス   | in_progress（Phase 1-12 完了、Phase 13 未実施） |
| 作成日       | 2026-03-03                                      |

## タスク概要

### 目的

スキル定義に従った Phase 1〜13 の実行仕様を確定し、実装時の判断ブレをなくす。

### 背景

本件はハンドラ登録漏れと認証キー未設定時導線の不整合を再発防止する目的で、仕様書先行で修正計画を固定する。

### 最終ゴール

- task-specification-creator テンプレート準拠の仕様書を作成する。
- aiworkflow-requirements から必要仕様を抽出して参照へ反映する。
- 本ブランチ差分を仕様へトレース可能にする。

### 成果物一覧

| 種別 | 成果物                  | 配置先                                                                                           |
| ---- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| 仕様 | index.md + phase-1..13  | docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001/                 |
| 検証 | verification-report.md  | docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001/outputs/         |
| 監査 | branch-diff-coverage.md | docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001/outputs/phase-1/ |

## 関心ごとの分離（SubAgent Team）

| SubAgent | 担当                     | 並列可否         |
| -------- | ------------------------ | ---------------- |
| A        | Main/IPC設計監査         | B と並列可       |
| B        | Preload/Renderer契約監査 | A と並列可       |
| C        | テスト/品質/仕様同期監査 | A/B 完了後に直列 |

## 本ブランチ差分反映監査

| 対象                     | 監査結果                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 本ブランチ差分（コード） | `apps/desktop/src/main/ipc/index.ts` と `ipc-double-registration.test.ts` に実装差分あり（handler登録 + 回帰テスト） |
| 本ブランチ差分（仕様書） | Phase 11/12成果物を実施済み状態へ同期し、証跡スクリーンショットを追加                                                |
| 反映漏れ                 | 1件検出（SkillChainStore/Executor のバレル公開不足）→ 未タスク化済み                                                 |

## 参照ファイル（aiworkflow-requirements抽出結果）

| 資料名                               | パス                                                                                        | 抽出目的                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| api-ipc-agent                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill:chain:list の契約定義抽出         |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | chainList の戻り値型抽出                |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証と lifecycle 抽出             |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | registerAllIpcHandlers の責務抽出       |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | registerAllIpcHandlers 登録漏れ防止抽出 |
| arch-ipc-persistence                 | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | validateIpcSender 適用位置抽出          |
| ipc-contract-checklist               | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 仕様検証観点抽出                        |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 配線漏れ再発防止パターン抽出            |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | IpcResultエラー整形抽出                 |

## タスク分解サマリー

| ID   | Phase | サブタスク     | 責務                   | 依存 |
| ---- | ----- | -------------- | ---------------------- | ---- |
| T-01 | 1     | 要件定義       | 判定条件定義           | -    |
| T-02 | 2     | 設計           | 層分離と契約固定       | T-01 |
| T-03 | 3     | 設計レビュー   | Gate判定               | T-02 |
| T-04 | 4     | テスト作成     | Redケース固定          | T-03 |
| T-05 | 5     | 実装           | Green化方針            | T-04 |
| T-06 | 6     | テスト拡張     | 回帰防止               | T-05 |
| T-07 | 7     | カバレッジ確認 | 測定と補完計画         | T-06 |
| T-08 | 8     | リファクタ     | 構造改善計画           | T-07 |
| T-09 | 9     | 品質保証       | 品質監査               | T-08 |
| T-10 | 10    | 最終レビュー   | 最終Gate判定           | T-09 |
| T-11 | 11    | 手動テスト     | 実機検証               | T-10 |
| T-12 | 12    | ドキュメント   | Part1/Part2 + 正本同期 | T-11 |
| T-13 | 13    | PR準備         | PR情報ドラフト         | T-12 |

## 実行フロー図

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
       -> Phase 8 -> Phase 9 -> Phase 10 -> Phase 11 -> Phase 12 -> Phase 13
```

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

## テストカバレッジ目標

| 指標              | 目標     |
| ----------------- | -------- |
| Line Coverage     | 90% 以上 |
| Branch Coverage   | 80% 以上 |
| Function Coverage | 90% 以上 |

## 統合テスト連携（Phase 1〜11）

| Phase | 連携内容                 |
| ----- | ------------------------ |
| 1     | 接続要件を要件定義へ記録 |
| 2     | 契約を設計へ固定         |
| 3     | レビューで承認           |
| 4     | Red ケース定義           |
| 5     | Green化で接続確認        |
| 6     | 回帰防止ケース追加       |
| 7     | カバレッジ寄与評価       |
| 8     | リファクタ後再検証       |
| 9     | 品質監査へ取り込み       |
| 10    | 最終レビュー証跡化       |
| 11    | 実機導線確認             |

## Phase完了時の必須アクション

1. 本Phaseタスクを全件完了する。
2. 成果物を outputs/phase-N/ に記録する。
3. 検証コマンドを実行する。
4. 次Phaseへ引き継ぎ事項を記録する。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
```

## aiworkflow-requirements 抽出結果

詳細は outputs/phase-1/aiworkflow-requirements-extraction.md を参照する。
