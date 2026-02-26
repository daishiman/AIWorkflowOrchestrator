# Phase 13: PR作成

## メタ情報

| 項目      | 内容                                                                       |
| --------- | -------------------------------------------------------------------------- |
| タスクID  | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                 |
| Phase     | 13                                                                         |
| 名称      | PR作成                                                                     |
| 目的      | 変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成する |
| 前提Phase | Phase 12（ドキュメント更新）完了                                           |
| 次Phase   | なし（最終 Phase）                                                         |

## 目的

Phase 1-12 の全成果物が揃っていることを最終確認し、ユーザーにローカル動作確認を依頼した上で、変更サマリーを提示して PR 作成の許可を得る。ユーザーの明示的な許可後に `/ai:diff-to-pr` を実行し、CI 通過を確認してタスクを完了する。

## 実行タスク

- Task 1: 成果物の最終確認を実施する
- Task 2: ユーザーへローカル動作確認を依頼する
- Task 3: 変更サマリーを提示し PR 作成許可を確認する
- Task 4: ユーザー許可後に PR を作成する（`/ai:diff-to-pr`）
- Task 5: CI 通過を確認する
- Task 6: タスクディレクトリを `completed-tasks` へ移動する

## 参照資料

| 参照資料                      | パス                                                                                                         | 内容                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Phase 2 設計書                | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-2/design-document.md`            | 実装方針の正本           |
| Phase 5 実装成果物            | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/`                              | 実装結果                 |
| Phase 6 テスト拡充成果物      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/`                              | 回帰・拡充テスト結果     |
| Phase 7 カバレッジ成果物      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/`                              | カバレッジ判定結果       |
| Phase 8 リファクタ成果物      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-8/`                              | 品質改善結果             |
| Phase 9 品質保証成果物        | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-9/`                              | 品質ゲート結果           |
| Phase 10 レビュー結果         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/final-review-result.md`       | 最終レビュー結果         |
| Phase 11 手動テスト結果       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/manual-test-result.md`        | 手動テスト結果           |
| Phase 12 実装ガイド           | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/implementation-guide.md`      | 実装ガイド（Part 1 + 2） |
| Phase 12 更新履歴             | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/documentation-changelog.md`   | ドキュメント更新履歴     |
| Phase 12 未タスク検出         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果         |
| Phase 12 スキルフィードバック | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/skill-feedback-report.md`     | スキル改善提案           |
| task-workflow.md              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                         | 完了移管時の台帳更新先   |
| skills-process.md             | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`                            | スキル検証運用基準       |
| artifacts.json                | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/artifacts.json`                                | 成果物レジストリ         |

## 実行手順

### Task 1: 成果物の最終確認

1. `artifacts.json` の全 Phase ステータスを確認する:
   - Phase 1-12: 全て `completed` であること
   - Phase 13: `in_progress` であること

2. 各 Phase の成果物ディレクトリに必須ファイルが存在することを確認する:

   ```bash
   # Phase 11 成果物確認
   ls docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/manual-test-result.md
   ls docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/walkthrough-log.md

   # Phase 12 成果物確認（必須4件）
   ls docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/implementation-guide.md
   ls docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/documentation-changelog.md
   ls docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/unassigned-task-detection.md
   ls docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/skill-feedback-report.md
   ```

3. Phase 12 Task 2 の仕様書更新が完了していることを確認する:

   ```bash
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/aiworkflow-requirements/LOGS.md
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/task-specification-creator/LOGS.md
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/aiworkflow-requirements/SKILL.md
   grep "UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001" .claude/skills/task-specification-creator/SKILL.md
   ```

4. 確認結果を記録する

### Task 2: ユーザーへのローカル動作確認依頼【必須】

1. ユーザーに以下のローカル動作確認を依頼する:

   ````markdown
   ## ローカル動作確認のお願い

   以下の確認をお願いします:

   1. `quick_validate.js` の手動実行:
      ```bash
      node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
      node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
      node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
      ```
   ````

   2. 変更された仕様書の内容確認:
      - `spec-update-workflow.md` の検証コマンドが統一されていること
      - `phase-11-12-guide.md` の検証手順が明確であること
      - Warning 運用ルールが理解しやすいこと

   3. 上記確認後、PR 作成の許可をお願いします。

   ```

   ```

2. ユーザーからの確認結果を待つ
3. ユーザーが問題を報告した場合、該当 Phase に戻って修正する

### Task 3: 変更サマリー提示と PR 作成許可の確認

1. 全変更ファイルのリストを作成する:

   ```bash
   git diff --stat main
   ```

2. 変更サマリーをユーザーに提示する:

   ```markdown
   ## 変更サマリー

   ### 1. 検証経路統一ルール

   - `spec-update-workflow.md`: 検証コマンドを `quick_validate.js`（repo配下）に統一
   - `phase-11-12-guide.md`: 検証コマンド参照を正規経路に統一

   ### 2. Warning 運用ルール

   - Warning を3段階（許容 / 要監視 / 要対応）に分類するルールを策定
   - Error との混在を解消し、判定基準を明文化

   ### 3. Phase 12 テンプレート

   - 統一検証コマンド列を Phase 12 テンプレートに統合
   - コピー&ペーストで実行可能な具体的手順を追加

   ### 4. 仕様改善案

   - `quick_validate.js` 改善案ドキュメントを作成

   ### 5. ワークフロー仕様書

   - Phase 1-13 の全仕様書を作成
   - 実装ガイド（Part 1: 初学者向け / Part 2: 開発者向け）を作成
   ```

3. ユーザーに PR 作成の許可を明示的に確認する
4. **実行ガード**: ユーザーが「許可」を明示するまで、コミット・PR 作成は **実行しない**

### Task 4: PR 作成（ユーザー許可後）

**前提**: ユーザーの明示的な許可を取得済みであること

1. `/ai:diff-to-pr` を実行する

2. PR テンプレート:

   ```markdown
   ## Summary

   - skill-creator検証ゲートの実行経路を `.js` 基準で統一し、Phase 12 で「同じ入力なら同じ判定」が出る運用を確立
   - warning 運用ルール（許容/要監視/要対応）を策定し、Error との混在を解消
   - Phase 12 テンプレートに統一検証コマンド列を統合

   ## Test plan

   - [ ] `quick_validate.js` を各スキルに対して実行し、エラー0件を確認
   - [ ] Phase 12 テンプレートのコマンド列をそのまま実行して完走確認
   - [ ] warning 出力が運用ルールに沿って分類されることを確認

   Closes #910
   ```

3. PR URL を記録する

### Task 5: CI 通過確認

1. PR 作成後、CI の実行状況を確認する:

   ```bash
   gh pr checks <PR番号> --watch
   ```

2. CI が全て通過するまで待機する

3. CI が失敗した場合:
   - 失敗したチェックの内容を確認する
   - 修正が必要な場合、該当ファイルを修正し、追加コミットを作成する
   - 再度 CI の通過を確認する
   - **`--no-verify` は使用禁止**

4. CI 通過結果を記録する

### Task 6: タスクディレクトリの completed-tasks への移動

1. PR がマージ可能な状態（CI 全通過）になった後、タスクディレクトリを移動する:

   ```bash
   # 元の未タスク指示書を completed-tasks に移動
   test -f docs/30-workflows/unassigned-task/task-imp-skill-validation-gate-alignment-001.md \
     && mv docs/30-workflows/unassigned-task/task-imp-skill-validation-gate-alignment-001.md docs/30-workflows/completed-tasks/ \
     || true
   ```

2. `artifacts.json` の Phase 13 ステータスを `completed` に更新する
3. `artifacts.json` の全体ステータスを `completed` に更新する
4. 移動後に以下を確認する:
   - `index.md` 内のパス参照が正しいこと
   - `artifacts.json` の全 Phase が `completed` ステータスであること

## 実行ガード（禁止事項）

| 禁止事項                       | 条件                             |
| ------------------------------ | -------------------------------- |
| コミットの実行                 | ユーザーの明示的な許可がない場合 |
| PR の作成                      | ユーザーの明示的な許可がない場合 |
| main ブランチへの直接 push     | いかなる場合も禁止               |
| `--no-verify` オプションの使用 | いかなる場合も禁止               |
| `git push --force` の実行      | main/master ブランチに対して禁止 |

## 統合テスト連携

- Task 1 の成果物確認は Phase 12 の全成果物に依存する
- Task 4 の PR 作成は Phase 11 の手動テスト結果を Test Plan に含める
- Task 5 の CI 確認は `pnpm lint`、`pnpm typecheck`、`pnpm vitest run` の全通過を含む

## 成果物

| 成果物 | パス                                                                                       | 内容                       |
| ------ | ------------------------------------------------------------------------------------------ | -------------------------- |
| PR情報 | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-13/pr-info.md` | PR URL・CI結果・マージ状態 |

`pr-info.md` の記載内容:

```markdown
# Phase 13: PR 情報

## PR

- URL: (PR URL)
- ブランチ: (ブランチ名)
- ターゲット: main

## CI ステータス

- ステータス: PASS / FAIL
- 確認日時: YYYY-MM-DD HH:MM

## タスク完了

- タスクディレクトリ移動: 完了 / 未完了
- artifacts.json 最終更新: 完了 / 未完了
```

## 完了条件

- [ ] `artifacts.json` の Phase 1-12 が全て `completed` ステータスである
- [ ] Phase 12 の必須成果物4件が全て存在する
- [ ] LOGS.md x 2 と SKILL.md x 2 にタスク完了記録が存在する
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] ユーザーが PR 作成を明示的に許可している
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] PR URL が `pr-info.md` に記録されている
- [ ] CI が通過している
- [ ] 元の未タスク指示書が `completed-tasks/` に移動されている
- [ ] `artifacts.json` の Phase 13 ステータスが `completed` に更新されている
- [ ] **本 Phase 内の全作業を100%完了**

## 次のPhase

なし（最終 Phase）。ワークフロー完了。マージはユーザーが GitHub UI で手動実行する。
