# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 12                                |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

implementation guide（Part 1 中学生レベル概念説明 + Part 2 技術詳細）、system spec update summary、その他必須成果物を作成する。

## 実行タスク

| Task | 名称                       | 内容                                                                                             |
| ---- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| 12-1 | implementation guide       | Part 1/Part 2 を分離し、なぜ必要か→何をするかの順で記述する                                      |
| 12-2 | system spec update summary | Step 1/2 の実施結果、Step 2 no-op 理由、更新範囲、mirror policy を exact path 付きで記録する     |
| 12-3 | documentation changelog    | current / baseline を分離し、validator 実測値と artifacts 同期結果を記録する                     |
| 12-4 | unassigned detection       | follow-up 候補の有無を 0 件でも記録し、1 件以上なら formalize を指示する                         |
| 12-5 | skill feedback report      | 2 skill への改善提案（なしでも理由付き）を記録する                                               |
| 12-6 | phase12 compliance check   | Task 12-1〜12-5 完了、planned wording 0 件、artifacts 同期、validator 実測値を根拠に自己監査する |

- Task 12-1: `outputs/phase-12/implementation-guide.md` を作成する
- Task 12-2: `outputs/phase-12/system-spec-update-summary.md` を作成する
- Task 12-3: `outputs/phase-12/documentation-changelog.md` を作成する
- Task 12-4: `outputs/phase-12/unassigned-task-detection.md` を作成する
- Task 12-5: `outputs/phase-12/skill-feedback-report.md` を作成する
- Task 12-6: `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する

## 参照資料

| 資料名                        | パス                                                                                    | 説明                             |
| ----------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件                  | `phase-1-requirements.md`                                                               | Layer3/4 チェック項目            |
| Phase 4 テスト定義            | `phase-4-test-creation.md`                                                              | テストケース一覧                 |
| Phase 5 実装                  | `phase-5-implementation.md`                                                             | 実装内容                         |
| Phase 9 QA                    | `phase-9-quality-assurance.md`                                                          | AC 充足状況                      |
| Phase 11 手動テスト           | `phase-11-manual-test.md`                                                               | 手動テスト結果                   |
| Task Workflow Completed       | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`          | close-out / current facts の正本 |
| Task Workflow Backlog         | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`            | follow-up / deferred の正本      |
| Phase 12 Documentation Guide  | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Task 12-1〜12-6 の正本           |
| Spec Update Workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1/2/validation の判断基準   |
| Step 1 Completion             | `.claude/skills/task-specification-creator/references/spec-update-step1-completion.md`  | Step 1-A〜1-G の要点             |
| Validation Matrix             | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator と pass 基準           |
| Phase 12 Completion Checklist | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | Phase 12 閉じ方の最終確認        |

## Phase 10 MINOR 追跡

| MINOR ID                  | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| ------------------------- | -------- | ------------- | ------------- | -------- | ---------- |
| （Phase 10 完了後に記入） |          |               |               |          |            |

## 実行手順

### ステップ1: Task 12-1 implementation guide を作成する

**Part 1: 中学生レベル概念説明**

- 「スキルを作った後に、より詳しくチェックする仕組み」として説明する
- Layer3 = 「ファイルの中身がルールに沿っているか」のチェック（例: レシピの分量が具体的な数値で書かれているか）
- Layer4 = 「スキル全体の意味がバラバラになっていないか」のチェック（例: レシピで言及した食材が実際にリストに存在するか）
- verify→improve→reverify = 「採点して修正して再採点するループ」として説明する

**Part 2: 技術詳細**

- Layer3 チェック ID 体系（L3-001〜L3-004）の詳細
- Layer4 チェック ID 体系（L4-001〜L4-003）の詳細
- `validateLayer3` / `validateLayer4` の実装パターン
- `createSkillFixture` の `referenceFiles` 拡張
- verify→improve→reverify 結合テストのパターン

### ステップ2: Task 12-2〜12-3 を作成する

- 変更したファイルの exact path を記録する（下表）。

| 種別        | パス                                                                                      | 補足                                                        |
| ----------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| tests       | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | Layer 3/4 unit + loop integration                           |
| runtime     | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | Layer 3/4 validate 実装                                     |
| shared type | `packages/shared/src/types/skillCreator.ts`                                               | `RuntimeSkillCreatorVerifyCheck.layer` 型拡張がある場合のみ |

- current facts と実装待ち境界を分離して記録する

### ステップ3: Task 12-4〜12-5 を作成する

- follow-up 候補の有無を 0 件でも記録する（検討した場合は下表）。

| 候補                       | 方向性                   | 扱い                         |
| -------------------------- | ------------------------ | ---------------------------- |
| `$schema` URL の有効性検証 | URL fetch による厳密検証 | 重いため deferred            |
| references 参照の循環検出  | dependency graph 解析    | deferred                     |
| Layer 3/4 結果の UI 表示   | renderer 表示の拡張      | sibling owner を確認してから |

- `task-specification-creator` スキルと `aiworkflow-requirements` スキルへの改善提案を記録する
- Task 12-2 と Task 12-3 は current facts と実測値の責務が別なので same-wave で並列作成してよい。
- Task 12-4 と Task 12-5 も独立しているため並列作成してよい。
- Task 12-6 は Task 12-1〜12-5 と `artifacts.json` / `outputs/artifacts.json` の同期後に直列で閉じる。

### ステップ4: Task 12-6 compliance check を作成する

- Task 12-1〜12-5 が完了し、成果物実体が揃ってから着手する（早期 PASS 記載禁止）。
- planned wording が 0 件であることを確認する（`outputs/phase-12/*.md` を対象にする）。
- `documentation-changelog.md` は current / baseline を分離していることを確認する（混在禁止）。
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` / `task-workflow-completed.md` / `task-workflow-backlog.md` の整合を根拠付きで閉じる（ファイル実体、validator 実測値、差分の説明を紐付ける）。
- PASS / PENDING を実績に合わせて使い分け、PENDING の場合は未完了理由と次アクションを記録する。

## 検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop vitest run

node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr artifacts.json outputs/artifacts.json

rg -n "計画|予定|TODO|will be|を予定|更新予定|後でやる|後続判断待ち|仕様策定のみ|実行予定|保留として記録" outputs/phase-12/*.md
```

## 成果物

| 成果物                     | パス                                                     | 説明                                                                |
| -------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Phase 12 手順書            | `phase-12-documentation.md`                              | Task 12-1〜12-6 の作業手順と検証コマンド                            |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2（概念説明 + 技術詳細）                              |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 の実施結果、更新範囲、mirror policy                        |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | current / baseline 分離 + validator 実測値                          |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 有無（0 件でも出力）                                      |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | 2 skill への改善提案（なしでも理由）                                |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 完了 + planned wording 0 + artifacts/validator 根拠 |

> Note: このタスクはテスト実装タスクのため、outputs/ ディレクトリへの成果物は Phase 12 完了時に個別ファイルとして作成する。

## サブタスク管理

1. Phase 11 手動テスト結果の反映
2. Task 12-1 の作成（Part 1 + Part 2）
3. Task 12-2〜12-3 の作成（same-wave）
4. Task 12-4〜12-5 の作成（same-wave）
5. Task 12-6 の作成（直列）
6. 検証コマンドの実行と実測値の転記

## 完了条件

- [ ] Task 12-1〜12-6 の成果物が揃っている
- [ ] planned wording が `outputs/phase-12/*.md` に残っていない（0 件）
- [ ] documentation changelog が current / baseline を分離している
- [ ] validator / lint / typecheck / tests の実測値が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
