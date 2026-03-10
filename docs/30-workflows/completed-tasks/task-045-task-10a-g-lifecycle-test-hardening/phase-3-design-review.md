# Phase 3: 設計レビューゲート

## メタ情報

| 項目    | 値                                  |
| ------- | ----------------------------------- |
| Phase   | 3                                   |
| 機能名  | task-10a-g-lifecycle-test-hardening |
| 作成日  | 2026-03-10                          |
| 前Phase | 2                                   |
| 次Phase | 4                                   |

## 目的

Phase 1 と Phase 2 の妥当性をレビューし、TASK-10A-G が「新規機能実装」ではなく「既実装の `skill:create` / Store 駆動ライフサイクルに対するテスト仕様の補強」であることを前提に、PASS/MINOR/MAJOR を判定する。`skill:create` の実装契約、Store の状態遷移、ChatPanel の責務境界、coverage の測定粒度が相互に矛盾しないことを確認する。

## 実行タスク

- Task 1: 要件と設計の整合を確認する
- Task 2: G1/G2/G3 の責務分離が実装実体と一致するかを確認する
- Task 3: 既知の落とし穴対策が phase 設計へ反映されているかを確認する
- Task 4: セキュリティ境界とエラー契約が正本仕様と一致するかを確認する
- Task 5: PASS/MINOR/MAJOR 判定を記録する

## 参照資料

| 資料名                 | パス                                                                              | 使用目的                                                    |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Phase 1                | `phase-1-requirements.md`                                                         | FR/NFR・AC の確認                                           |
| Phase 2                | `phase-2-design.md`                                                               | G1/G2/G3 設計の確認                                         |
| UI実装記録             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | `skill:create` の4層同期確認                                |
| UI機能別実装記録       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | SkillCreateWizard / SkillAnalysisView / TASK-10A-F 導線確認 |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | ChatPanel と SkillManagementPanel の責務境界確認            |
| UI統合インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | ChatPanel の公開境界確認                                    |
| Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill UI 契約確認                                           |
| 状態管理設計           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | selector / Store action 境界確認                            |
| IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender 検証と P42 バリデーション確認                        |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト責務分離確認                                          |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質ゲート確認                                              |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | `VALIDATION_ERROR` / `CREATE_ERROR` 契約確認                |
| タスク運用台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | phase 合否判断の正本                                        |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | Phase 4-5 統合運用と handler-scope coverage 教訓確認        |
| レビューゲート判定基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`    | PASS/MINOR/MAJOR 判定基準                                   |

## 実行手順

### ステップ 1: 要件-設計整合性レビュー

| 確認項目   | 検証方法                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| FR 網羅性  | FR-1〜FR-7 が Phase 2 の G1/G2/G3 設計に対応しているか確認                                           |
| NFR 網羅性 | NFR-1〜NFR-4 が coverage / selector / isolation / 実行時間へ対応しているか確認                       |
| 責務分離   | G1=Main handler、G2=Store 駆動 lifecycle、G3=ChatPanel toggle と quality gate に分離されているか確認 |
| 成果物整合 | outputs と phase 記載の対象ファイル・レポート名が一致しているか確認                                  |

### ステップ 2: テスト設計レビュー

| 確認項目     | 検証方法                                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 契約整合  | `description: unknown`, `options: unknown`, `createSkillFromWizard`, `VALIDATION_ERROR`, `CREATE_ERROR`, `toIPCValidationError` が設計に反映されているか確認           |
| G2 状態整合  | `createSkill` / `analyzeSkill` / `applySkillImprovements` と `fetchSkills`, `isAnalyzing`, `isImproving`, `currentAnalysis`, `skillError` が設計に反映されているか確認 |
| G3 境界整合  | ChatPanel は直 IPC ではなく toggle / visibility / disable / panel 結線の責務に留まっているか確認                                                                       |
| モック戦略   | SkillService と `validateIpcSender`、Store state reset、Preload mock の責務境界が明確か確認                                                                            |
| 切り分け順序 | Main → Store → ChatPanel / quality gate の順で障害切り分けできるか確認                                                                                                 |

### ステップ 3: 既知の落とし穴チェック

| Pitfall ID | 対策内容                     | 確認基準                                                            |
| ---------- | ---------------------------- | ------------------------------------------------------------------- |
| P9         | テスト間リーク防止           | `beforeEach` / `afterEach` の reset 方針が明記されている            |
| P13        | タイマーテスト無限ループ防止 | タイマー使用時のみ `advanceTimersByTime` を使う方針が明記されている |
| P31        | Zustand 無限ループ防止       | 個別 selector と hook 単位の検証方針がある                          |
| P39        | happy-dom 互換               | `fireEvent` 使用が明記されている                                    |
| P40        | 実行ディレクトリ依存         | `cd apps/desktop &&` 前提で記載されている                           |
| P42        | `.trim()` バリデーション     | `description` の 3 段バリデーション設計がある                       |
| P48        | 派生 selector 安定化         | selector stability / `useShallow` 観点がある                        |

### ステップ 4: セキュリティレビュー

| 確認項目         | 検証方法                                                                        |
| ---------------- | ------------------------------------------------------------------------------- |
| IPC sender 検証  | `validateIpcSender` と `toIPCValidationError` の検証が G1 に含まれることを確認  |
| エラーサニタイズ | `sanitizeErrorMessage` と `CREATE_ERROR` の組み合わせが G1 に含まれることを確認 |
| Renderer 境界    | G2/G3 が renderer 内責務に閉じ、不要な Main 実装依存を持たないことを確認        |

### ステップ 5: アーキテクチャ適合性レビュー

| 確認項目           | 検証方法                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| テストファイル配置 | G1/G2/G3 の対象ファイル配置が既存構成に準拠しているか確認                                                    |
| 既存テストとの整合 | `agentSlice.skill-lifecycle.test.ts` と `ChatPanel.skill-management.test.tsx` の既存責務を壊していないか確認 |
| coverage 粒度      | feature 全体 coverage と handler-scope coverage が分離記述されているか確認                                   |
| Phase 4-5 運用     | テスト専用タスクとして Red/Green 混在を許容する方針が明記されているか確認                                    |

### ステップ 6: 判定

| 判定              | 条件                                                | 対応                  |
| ----------------- | --------------------------------------------------- | --------------------- |
| PASS              | 実装実体・正本仕様・phase 記述に矛盾なし            | Phase 4 へ進行        |
| MINOR             | 文言補強や参照追加のみ必要                          | 修正後 Phase 4 へ進行 |
| MAJOR（要件問題） | FR/NFR に漏れ、または task の主題誤認がある         | Phase 1 へ戻る        |
| MAJOR（設計問題） | G1/G2/G3 の責務分離や coverage 粒度に根本ズレがある | Phase 2 へ戻る        |

## レビュー観点テーブル

| レビュー観点  | 確認項目                                               | 判定基準              |
| ------------- | ------------------------------------------------------ | --------------------- |
| 契約整合      | `skill:create` の引数・戻り値・エラー契約              | 実装と一致で PASS     |
| 状態整合      | Store action / selector / ChatPanel 導線               | 実装と一致で PASS     |
| 責務分離      | G1/G2/G3 の責務が混線していない                        | 分離できていれば PASS |
| Pitfall 対策  | P9/P13/P31/P39/P40/P42/P48 の反映                      | 全反映で PASS         |
| coverage 設計 | handler-scope と target suite が分離されている         | 明記されていれば PASS |
| 品質ゲート    | typecheck / lint / targeted regression / coverage gate | 明確なら PASS         |

## 統合テスト連携

- G1 は `skill:create` handler 契約を固定し、G2/G3 の前提を与える
- G2 は Store action / hook / preload 契約を固定し、ChatPanel の責務を侵食しない
- G3 は ChatPanel の結線境界に限定し、Main 契約や Store 内部状態の詳細は G1/G2 に委譲する
- Phase 4-5 以降の coverage / regression 判定では、この責務分離を壊していないことを継続確認する

## 成果物

| 成果物       | パス                                                                                                                     | 説明     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| レビュー結果 | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/outputs/phase-3/design-review-result.md` | 判定結果 |

## 完了条件

- [ ] FR-1〜FR-7 と Phase 2 が整合している
- [ ] `skill:create` 契約が実装と一致している
- [ ] G1/G2/G3 の責務分離が明確である
- [ ] Pitfall 対策が設計へ反映されている
- [ ] handler-scope coverage と targeted regression が明記されている
- [ ] PASS/MINOR/MAJOR 判定が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

1. 要件-設計整合性レビュー
2. 契約・状態遷移レビュー
3. Pitfall チェック
4. セキュリティレビュー
5. 品質ゲートレビュー
6. 判定記録

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 4: テスト作成
