# Phase 12: ドキュメント

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 12                                                   |
| Phase名    | ドキュメント                                         |
| タスクID   | TASK-SKILL-LIFECYCLE-01                              |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤           |
| 前提Phase  | [phase-11-manual-test.md](./phase-11-manual-test.md) |
| 後続Phase  | [phase-13-pr-creation.md](./phase-13-pr-creation.md) |
| ステータス | completed                                            |
| 作成日     | 2026-03-11                                           |

## 目的

Task01 の導線・責務設計を再利用可能な形で文書化し、workflow 本文と `.claude` 正本仕様を同一ターンで同期する。

## 実行タスク

- Task 1: Part 1 / Part 2 の実装ガイドを作成する
- Task 2: Step 1-A〜1-E と Step 2 を実施する
- Task 3: `documentation-changelog.md` を更新する
- Task 4: `unassigned-task-detection.md` を 0件時も含めて作成する
- Task 5: `skill-feedback-report.md` を作成する

## 必須タスク

1. 実装ガイド作成
2. system spec 更新実施
3. documentation changelog 作成
4. 未タスク検出
5. スキルフィードバック記録

## Task 1: 実装ガイド

| パート | 対象読者             | 必須内容                                       |
| ------ | -------------------- | ---------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 日常の例え話、理由先行、専門用語の即時説明     |
| Part 2 | 開発者・技術者       | 型、APIシグネチャ、依存関係、edge case、設定値 |

## Task 2: システム仕様更新

| Step     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| Step 1-A | 完了タスク記録、関連リンク、LOGS/SKILL 更新要否確認                                         |
| Step 1-B | 実装状況テーブル更新、workflow 本文と artifacts 整合                                        |
| Step 1-C | 関連タスク/未タスクテーブル更新                                                             |
| Step 1-D | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` と workflow index 再生成 |
| Step 1-E | 未タスク作成、台帳登録、関連仕様反映                                                        |
| Step 2   | 新規仕様更新の要否判定                                                                      |

## system spec 更新候補

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

## 参照資料

| 参照資料              | パス                                                                           | 内容              |
| --------------------- | ------------------------------------------------------------------------------ | ----------------- |
| phase 11/12 guide     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 12 必須要件 |
| spec update workflow  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜Step 2  |
| manual test result    | `outputs/phase-11/manual-test-result.md`                                       | 証跡              |
| discovered issues     | `outputs/phase-11/discovered-issues.md`                                        | 未タスク候補      |
| requirements          | `outputs/phase-1/requirements-definition.md`                                   | 理由とゴール      |
| design outputs        | `outputs/phase-2/primary-journey-sequence.md`                                  | 設計正本          |
| implementation log    | `outputs/phase-5/implementation-log.md`                                        | 実装差分          |
| test expansion result | `outputs/phase-6/test-expansion-result.md`                                     | 追加テスト結果    |
| coverage report       | `outputs/phase-7/coverage-report.md`                                           | coverage 抜け     |
| refactoring log       | `outputs/phase-8/refactoring-log.md`                                           | 最終構造          |
| quality report        | `outputs/phase-9/quality-report.md`                                            | 品質監査          |
| final review          | `outputs/phase-10/final-review-result.md`                                      | 最終判定          |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                            | 内容                                      |
| ---------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| resource map           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                | 逆引き起点                                |
| quick reference        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`             | 検索語と読む順番                          |
| task workflow          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 完了/残課題台帳                           |
| lessons learned        | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再利用知見                                |
| UI navigation          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | 導線正本                                  |
| feature components     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 画面責務正本                              |
| settings UI            | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`           | `settings` 公開 shell                     |
| state management       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state ownership                           |
| architecture overview  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`    | renderer 全体像                           |
| app shell              | `apps/desktop/src/renderer/App.tsx`                                             | `/advanced/*` 実体と bypass 実装アンカー  |
| nav contract           | `apps/desktop/src/renderer/navigation/navContract.ts`                           | nav 正本の現行実装アンカー                |
| skill management panel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`           | create/improve handoff の現行実装アンカー |

## 実行手順

1. Task 1-5 を SubAgent ごとに分担し並列で下書きする。
2. Step 1-A〜1-E を順に実施し、workflow 本文と `.claude` 正本を同期する。
3. resource-map / quick-reference に「一次導線」「Skill Center / Workspace / Agent / Skill Creator」「advanced route」「SkillManagementPanel」「settings bypass」「VITE_USE_GLOBAL_NAV_STRIP」の逆引き導線を追加する。
4. Step 2 で新規仕様更新の必要性を判断し、不要なら理由を `documentation-changelog.md` に明記する。
5. 0 件でも未タスク検出結果とスキル改善結果を残す。

## 成果物

| 成果物             | パス                                            | 説明                        |
| ------------------ | ----------------------------------------------- | --------------------------- |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Part 1 / Part 2             |
| 仕様更新サマリー   | `outputs/phase-12/spec-update-summary.md`       | Step 1-A〜Step 2 実施記録   |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | 更新ログ                    |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | 0件含む結果                 |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | task-spec / aiworkflow 改善 |

## 完了条件

- [x] Task 1 の Part 1 / Part 2 が必須要件を満たしている
- [x] Task 2 の Step 1-A〜1-E と Step 2 判定が記録されている
- [x] `resource-map.md` と `quick-reference.md` の逆引き導線が改善されている
- [x] 未タスク検出結果が 0件でも記録されている
- [x] スキル改善レポートが作成されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-11-manual-test.md](./phase-11-manual-test.md)
- 後続: [phase-13-pr-creation.md](./phase-13-pr-creation.md)

## サブタスク管理

- [x] Task 1 実装ガイド
- [x] Task 2 system spec 更新
- [x] Task 3 changelog
- [x] Task 4 未タスク検出
- [x] Task 5 スキル改善
- [x] 完了条件検証

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] workflow 本文と `.claude` 正本が整合している
- [x] 逆引き改善が search-spec / resource-map から確認できる

## 次のPhase

Phase 13: [phase-13-pr-creation.md](./phase-13-pr-creation.md)
