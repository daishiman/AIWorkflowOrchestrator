# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 12                                                             |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

実装した変更をドキュメントに反映し、今後の保守性を確保する。実装ガイドの作成、システム仕様書の更新、未タスク検出を行う。

## 実行タスク

- Task 12-1: 実装ガイド作成（中学生レベル + 技術者レベル）
- Task 12-2: システム仕様更新サマリー作成
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出レポート作成
- Task 12-5: スキルフィードバックレポート作成
- Task 12-6: Phase 12 仕様準拠チェック作成

## 参照資料

| 資料名                  | パス                                                                           | 説明                    |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| Phase 5 実装            | [phase-5-implementation.md](phase-5-implementation.md)                         | 実装内容の参照          |
| Phase 10 MINOR指摘      | [phase-10-final-review.md](phase-10-final-review.md)                           | TECH-M-01〜02の移管確認 |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | current facts の親仕様  |
| task-workflow-backlog   | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   | 残課題の現在地          |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了記録                |

## 実行手順

### Step 1: Task 12-1 実装ガイド作成

**成果物**: `outputs/phase-12/implementation-guide.md`

実装ガイドは成果物側（`outputs/phase-12/implementation-guide.md`）に集約し、本文は self-contained とする。

実装ガイドの必須要件:

- Part 1（中学生レベル）: 「なぜ必要か」→「できること」の順に書き、日常の例え話を含める（`たとえば` を明示）
- Part 2（技術者レベル）:
  - current contract / target delta を分けて書く
  - TypeScript の型定義、APIシグネチャ、使用例を含める
  - エラーハンドリング、エッジケース、設定/定数一覧を省略しない

検証コマンド:

- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow <workflow-dir>`

### Step 2: Task 12-2 システム仕様更新サマリー作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: タスク完了記録

- `task-workflow` 台帳の同波更新
  - `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`（完了記録）
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（completed summary の current facts 同期）
  - `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`（backlog からの移管または status 更新）
- LOGS.md 同波更新（2ファイル）
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
- SKILL.md 変更履歴同波更新（2ファイル）
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`
- indexes 再生成
  - `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`（topic-map/keywords 等）
- mirror parity
  - `.agents/skills/**` へ同内容を反映し drift を残さない

#### Step 1-B: 実装状況テーブル更新

system spec 側の実装状況テーブル（完了/未完了）を current facts に更新し、`TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` を別タスクとして維持する。

#### Step 1-C: 関連タスクテーブル更新

関連タスク（前提タスク/依存タスク）の status と導線を current facts に更新し、親タスク `TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001` と follow-up `TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` の役割を分離する。

#### Step 2: 新規インターフェース追加判定

変更は `RuntimeSkillCreatorFacade.ts` 内部実装のみ。インターフェース・型定義の変更なし。**Step 2 は N/A**。
Step 2 を実施しない場合でも、`system-spec-update-summary.md` には N/A 判定の根拠と `artifacts.json` / `outputs/artifacts.json` の同期結果を記録する。

### Step 3: Task 12-3 ドキュメント更新履歴

**成果物**: `outputs/phase-12/documentation-changelog.md`

| 日付       | 変更内容                                                    |
| ---------- | ----------------------------------------------------------- |
| 2026-04-06 | Phase 12 ドキュメント更新完了（実装ガイド・システム仕様書） |

### Step 4: Task 12-4 未タスク検出レポート

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

検出ルール:

- current 差分起因で新規未タスクが 1 件以上ある場合は、unassigned-task 指示書へ昇格し、path と根拠を記録する
- 0 件の場合も必ず出力し、検査範囲と判定根拠を残す

### Step 5: Task 12-5 スキルフィードバックレポート

**成果物**: `outputs/phase-12/skill-feedback-report.md`

| 観点         | フィードバック                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| テンプレート | 通知パターン（`try { notify() } catch {}`）を Phase 5 実装テンプレートに標準パターンとして記載することを提案 |
| ワークフロー | adapter ガードを追加した際、同じメソッドを呼び出す上位ループも同波で通知統一チェックを行うルールを追加推奨   |
| ドキュメント | 改善点なしでも理由を記録                                                                                     |

### Step 6: Task 12-6 Phase 12 仕様準拠チェック

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

| 確認項目  | 内容                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Task 12-1 | 実装ガイドが Part 1 / Part 2 の 2 パートで作成されていること                                         |
| Task 12-2 | `system-spec-update-summary.md` に Step 1-A/B/C、Step 2 N/A、parity、same-wave sync があること       |
| Task 12-3 | `documentation-changelog.md` に current workflow / baseline / skill sync と validator 結果があること |
| Task 12-4 | `unassigned-task-detection.md` が 0件でも出力され、残件の切り分けがあること                          |
| Task 12-5 | `skill-feedback-report.md` が改善点なしでも理由を添えて出力されていること                            |
| Task 12-6 | 仕様準拠チェックが自己申告ではなく、実測値と不足を根拠付きで結び付けていること                       |

## 統合テスト連携【必須】

N/A（Phase 12 はドキュメント更新フェーズ）

## 成果物

| 成果物                       | 配置先                                                   |
| ---------------------------- | -------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              |
| Phase 12 仕様準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] 実装ガイド（中学生レベル + 技術者レベル）が作成されている
- [ ] システム仕様更新サマリーが作成されている
- [ ] 未タスク検出レポートが作成されている
- [ ] スキルフィードバックレポートが作成されている
- [ ] Phase 12 仕様準拠チェックが作成されている

## タスク100%実行確認【必須】

Phase 12 完了時に以下を確認すること:

- [ ] Task 12-1（実装ガイド作成）を完全に実行した
- [ ] Task 12-2（システム仕様書更新）を完全に実行した
- [ ] Task 12-3（ドキュメント更新履歴作成）を完全に実行した
- [ ] Task 12-4（未タスク検出レポート作成）を完全に実行した
- [ ] Task 12-5（スキルフィードバックレポート作成）を完全に実行した
- [ ] Task 12-6（Phase 12 仕様準拠チェック作成）を完全に実行した

## 次Phase

→ [Phase 13: PR作成](phase-13-pr-creation.md)

**Phase 12→13 の遷移条件**: 全ドキュメント更新が完了していること
