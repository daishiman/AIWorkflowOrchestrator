# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 7                                                                |
| 機能名     | 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001              |
| タスク名   | settings 遷移に関わる persist / navigation iterable ハードニング |
| 作成日     | 2026-03-06                                                       |
| ステータス | 未実施                                                           |

## 目的

破損 persist state を安全に正規化し、settings 遷移と store hydrate が例外なく継続する構成を設計し、実装できる仕様へ落とす。

## 背景

症状は Electron sandbox 上の iterable error として観測され、候補箇所は `navigationSlice.ts` の spread と `store/index.ts` の `new Set(parsed.state.expandedFolders)` に集約された。破損した persist state を前提にした防御が不足している。

## Atent Team編成

| SubAgent                  | 関心ごと                       | 実行モード | Phase 7 の責務                                 |
| ------------------------- | ------------------------------ | ---------- | ---------------------------------------------- |
| SubAgent-Store-Hydrate    | persist / hydration            | 並列       | expandedFolders 正規化と復旧戦略を設計する     |
| SubAgent-Navigation-Slice | navigation state update        | 並列       | viewHistory 更新と fallback を設計する         |
| SubAgent-Regression-Tests | integration / corruption tests | 並列       | 破損 state 再現手順を設計する                  |
| SubAgent-Lead-Sync        | 仕様統合 / aiworkflow 同期     | 直列統合   | state management 正本と manual flow を統合する |

## 実行タスク

- coverage 観点整理: 変更ファイル、境界条件、異常系の観点を表で管理する
- gap 分析: 未計測ケースと未固定ケースを分けて記録する
- 回帰優先順位付け: release 前に残せないギャップを識別する

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

### 前提Phase成果物

| 資料名         | パス               | 用途                               |
| -------------- | ------------------ | ---------------------------------- |
| Phase 5 成果物 | `outputs/phase-5/` | Phase 5 の出力を入力として参照する |
| Phase 6 成果物 | `outputs/phase-6/` | Phase 6 の出力を入力として参照する |

## 実行手順

1. 変更ファイル、AC、manual flow を coverage 観点へ変換する。
2. 未計測ケースを gap-log に書き、埋める順序を固定する。
3. Phase 8 へ持ち込む refactor 対象と coverage 対象を分ける。

## 統合テスト連携

- persist snapshot 復元、store hydrate、settings 遷移を同じシナリオで確認する
- `navigationSlice.ts` の `setCurrentView` と `store/index.ts` の persist restore を同じ fixture 名で検証する
- P31 系の store 初期化回帰と衝突しないことを確認する

## 多角的チェック観点

| 観点         | 確認内容                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| 復旧方針     | 破損データを空状態へ戻す基準と保持する基準が明文化されているか               |
| 責務分離     | hydrate 正規化と navigation update 正規化が別 helper で管理されているか      |
| テスト再現性 | 破損 snapshot を固定した fixture があるか                                    |
| UX           | ユーザーが settings へ遷移した時にクラッシュではなく復旧後の画面へ到達するか |

## 成果物

| 成果物        | パス                                  | 説明                   |
| ------------- | ------------------------------------- | ---------------------- |
| coverage 目標 | `outputs/phase-7/coverage-targets.md` | 監視する coverage 観点 |
| gap log       | `outputs/phase-7/gap-log.md`          | 不足箇所と補完方針     |

## 完了条件

- [ ] 前Phaseの成果物を参照した追加作業が定義されている
- [ ] gap または risk が文書化されている
- [ ] 次Phaseへ渡す判断材料が成果物に残っている
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

Phase 8: リファクタリング
