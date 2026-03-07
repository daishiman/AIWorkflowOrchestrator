# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 12                                                               |
| 機能名     | 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001              |
| タスク名   | settings 遷移に関わる persist / navigation iterable ハードニング |
| 作成日     | 2026-03-06                                                       |
| ステータス | 完了                                                             |

## 目的

破損 persist state を安全に正規化し、settings 遷移と store hydrate が例外なく継続する構成を設計し、実装できる仕様へ落とす。

## 背景

症状は Electron sandbox 上の iterable error として観測され、候補箇所は `navigationSlice.ts` の spread と `store/index.ts` の `new Set(parsed.state.expandedFolders)` に集約された。破損した persist state を前提にした防御が不足している。

## Atent Team編成

| SubAgent                  | 関心ごと                       | 実行モード | Phase 12 の責務                                |
| ------------------------- | ------------------------------ | ---------- | ---------------------------------------------- |
| SubAgent-Store-Hydrate    | persist / hydration            | 並列       | expandedFolders 正規化と復旧戦略を設計する     |
| SubAgent-Navigation-Slice | navigation state update        | 並列       | viewHistory 更新と fallback を設計する         |
| SubAgent-Regression-Tests | integration / corruption tests | 並列       | 破損 state 再現手順を設計する                  |
| SubAgent-Lead-Sync        | 仕様統合 / aiworkflow 同期     | 直列統合   | state management 正本と manual flow を統合する |

## 実行タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 パート構成で記述する
- 仕様同期: persist 正規化と migration の方針を `arch-state-management.md` へ同期する / 既知の iterable crash 条件を `lessons-learned.md` へ記録する / 追加の persist migration 候補を未タスク検出へ残す
- 未タスク検出: scope 外、review 指摘、manual 発見事項を洗い出す
- スキル改善: task-specification-creator と aiworkflow 正本への改善提案を残す

## 参照資料

### 実装・証跡

| 資料名                       | パス                                                                                                                               | 用途                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Renderer Store               | `apps/desktop/src/renderer/store/index.ts`                                                                                         | hydrate と persist 正規化の主対象                |
| Renderer Slice               | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                                                        | viewHistory 更新の主対象                         |
| Renderer Test                | `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts`                                                                   | slice 単位の異常系固定先                         |
| Integration Test             | `apps/desktop/src/renderer/__tests__/integration/navigation.integration.test.ts`                                                   | settings 遷移の結合確認先                        |
| Settings View                | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                                                           | 再現導線の入口として確認する                     |
| Regression Test              | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`                                                            | store 初期化周辺の既存回帰と競合しないか確認する |
| iterable investigation index | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/index.md`                               | 候補箇所の整理を確認する                         |
| iterable task manual         | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/manual-test-result.md` | settings shell 未確認の状態を確認する            |
| auth-mode contract phase1    | `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/phase-1-requirements.md`                           | P31 と store dependency の扱いを確認する         |

### システム仕様（aiworkflow-requirements / task-specification-creator）

| 資料名                               | パス                                                                                        | 用途                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| task-spec workflow                   | `.claude/skills/task-specification-creator/references/create-workflow.md`                   | create モードの直列/並列ルールを確認する          |
| phase templates                      | `.claude/skills/task-specification-creator/references/phase-templates.md`                   | Phase 文書の構造を揃える                          |
| unassigned task guidelines           | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | Phase 12 の残課題検出ルールを揃える               |
| resource-map                         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 読むべきシステム正本を固定する                    |
| quick-reference                      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | IPC / Store / Electron の既存パターンを再確認する |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 12 の完了記録先を確認する                   |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TDD と coverage 条件を揃える                      |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 既知の再発パターンを再確認する                    |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand persist と selector 責務を確認する        |
| arch-ipc-persistence                 | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | persist 復元と永続化境界の責務を確認する          |
| architecture-patterns                | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`                | store 分割と helper 配置の規則を確認する          |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | state migration と test pattern を確認する        |
| patterns                             | `.claude/skills/aiworkflow-requirements/references/patterns.md`                             | P31 系の成功パターンを確認する                    |
| development-guidelines               | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 正規化 helper の配置と naming を確認する          |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | persist破損時の復旧方針を確認する                 |
| security-input-validation            | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | 永続データ復元時の入力検証境界を確認する          |
| ipc-type-resolution-guide            | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | iterable崩れの診断手順を確認する                  |
| known-pitfalls                       | `.claude/rules/06-known-pitfalls.md`                                                        | iterable再発防止の失敗パターンを確認する          |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | navigation の期待導線を確認する                   |
| ui-ux-settings                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                       | settings遷移時の表示責務を確認する                |
| testing-accessibility                | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | settings遷移時のa11y回帰観点を確認する            |
| testing-component-patterns           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | store と view の統合試験構成を確認する            |
| task-workflow-rules                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | Phase 12 の完了条件と品質ゲートを再確認する       |

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |

## 実行手順

1. Task 12-1 として Part 1（中学生レベル）/ Part 2（技術者向け）の 2 パート実装ガイドを作成する。
2. Task 12-2 Step 1-A として完了記録を `task-workflow.md` に追記し、`aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md`、`indexes/topic-map.md` の更新要否を確認して記録する。
3. Task 12-2 Step 1-B/1-C として実装状況テーブルと関連タスクテーブルを更新し、`spec_created` と `完了` を混同しない。
4. Task 12-2 Step 2 として persist 正規化と migration の方針を `arch-state-management.md` へ同期し、既知の iterable crash 条件を `lessons-learned.md` へ反映する。
5. Task 12-4/12-5 として未タスク検出結果とスキル改善提案を出力し、追加の persist migration 候補を `unassigned-task-detection.md` へ残す。

## 統合テスト連携

- persist 正規化と migration の方針を `arch-state-management.md` へ同期する
- 既知の iterable crash 条件を `lessons-learned.md` へ記録する
- 追加の persist migration 候補を未タスク検出へ残す

## 多角的チェック観点

| 観点         | 確認内容                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| 復旧方針     | 破損データを空状態へ戻す基準と保持する基準が明文化されているか               |
| 責務分離     | hydrate 正規化と navigation update 正規化が別 helper で管理されているか      |
| テスト再現性 | 破損 snapshot を固定した fixture があるか                                    |
| UX           | ユーザーが settings へ遷移した時にクラッシュではなく復旧後の画面へ到達するか |

## 成果物

| 成果物             | パス                                            | 説明                         |
| ------------------ | ----------------------------------------------- | ---------------------------- |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Part 1 / Part 2 のガイド     |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | 変更履歴                     |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | 残課題の抽出結果             |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | task-spec skill への改善提案 |

## 完了条件

- [ ] implementation-guide が Part 1 / Part 2 の 2 構成で定義されている
- [ ] documentation-changelog と unassigned-task-detection が作成対象に入っている
- [ ] Step 1-A で `LOGS.md` 2ファイルと `indexes/topic-map.md` の更新判定が記録されている
- [ ] aiworkflow 正本へ反映する更新先が具体名で記述されている
- [ ] task-specification-creator と aiworkflow-requirements の改善点が skill-feedback-report に残る
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 13: PR作成
