# task-ui-05a-phase12-sync-bundle-guard

## メタ情報

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-UI-05A-PHASE12-SYNC-BUNDLE-GUARD-001                            |
| 親タスク     | UT-UI-05A-IMPLEMENTATION-CLOSURE-001                               |
| タスク名     | Phase 12 同一ターン同期ガード（台帳/教訓/検証証跡）                |
| 優先度       | 中                                                                 |
| 見積もり規模 | 小規模（1.0h）                                                     |
| ステータス   | 未着手                                                             |
| 発見元       | UT-UI-05A-IMPLEMENTATION-CLOSURE-001 Phase 12 再確認（2026-03-03） |
| 作成日       | 2026-03-03                                                         |

## 1. なぜこのタスクが必要か（Why）

Phase 11 の画面再取得後、`task-workflow.md`、`lessons-learned.md`、Phase 12 成果物の更新が分散すると、再確認時に「どこまで同期済みか」の判定が揺れる。  
今回の実装でも、同一ターン同期を明示しないと再監査コストが増えることが確認された。

## 2. 何を達成するか（What）

- UIタスク再確認時の更新対象を 1 セット（台帳 + 教訓 + 検証証跡）として固定する
- 同一ターン同期のチェック手順を未タスク指示書として再利用可能化する
- 再確認後の未タスク検出レポートに同期状態を明記できる状態にする

## 3. どのように実行するか（How）

- `capture -> coverage -> spec sync` の順序を固定し、順序違反を完了条件で禁止する
- `task-workflow.md` と `lessons-learned.md` の双方に同一内容の苦戦箇所/再発条件を記録する
- `unassigned-task-detection.md` に新規未タスクとして登録し、3ステップ完了を記録する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                   | 発見経緯                                                       | 解決策                                                                         | 教訓                                                                    |
| ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `manual-test-result.md` の先頭列ヘッダ運用が揺れやすい | `テストケース` と `TC-ID` の混在で監査条件が読み取りづらかった | `phase-11-12-guide.md` / `phase-templates.md` に許容ヘッダと推奨値を明文化した | 検証スクリプト契約を更新/確認したターンで、テンプレート例も同時更新する |
| 証跡ファイル名と画面状態の意味不一致が起きる           | TC-06 証跡名が実体状態（未保存離脱ダイアログ）とずれていた     | 命名ルールに意味一致（状態名必須）を追加し、是正を未タスクで追跡した           | 証跡名は「一意性」だけでなく「状態意味一致」を完了条件に含める          |
| 画面再取得後の仕様同期が分散しやすい                   | 画面再取得後に台帳/教訓/履歴の更新が別ターン化した             | 同一ターンで `task-workflow` + `lessons` + 成果物台帳を更新する運用へ固定した  | UI再確認は「再撮影 -> 検証4点 -> 仕様同期」を1セットで完了判定する      |

## 4. 実行手順

1. `node apps/desktop/scripts/capture-skill-editor-view-screenshots.mjs` を実行し、画面証跡を再取得する。
2. `validate-phase11-screenshot-coverage` で `expected TC = covered TC` を確認する。
3. `manual-test-result.md` の先頭列ヘッダ（推奨: `テストケース`）と証跡列の整合を確認する。
4. `task-workflow.md` / `lessons-learned.md` / `outputs/phase-12/unassigned-task-detection.md` を同一ターンで更新する。
5. `verify-unassigned-links` と `audit --diff-from HEAD` で差分違反がないことを確認する。

## 5. 完了条件チェックリスト

- [ ] 画面証跡再取得と TC カバレッジ確認が完了している
- [ ] `task-workflow.md` と `lessons-learned.md` に同一ターンで苦戦箇所が同期されている
- [ ] `unassigned-task-detection.md` に本未タスクが登録され、3ステップ完了が記録されている
- [ ] `verify-unassigned-links` が PASS（missing=0）
- [ ] `audit-unassigned-tasks --json --diff-from HEAD` の `currentViolations=0`

## 6. 検証方法

```bash
node apps/desktop/scripts/capture-skill-editor-view-screenshots.mjs
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-editor-view-closure
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

## 7. リスクと対策

| リスク                                        | 対策                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 画面証跡だけ更新して仕様同期を後回しにする    | 完了条件に「台帳+教訓+成果物台帳の同時更新」を必須化する                                                |
| `baselineViolations` を今回差分違反と誤読する | 合否判定は `currentViolations=0` 固定で記録する                                                         |
| 命名改善タスクとの責務重複                    | 本タスクは「同期手順ガード」、命名是正は `UT-UI-05A-PHASE11-SCREENSHOT-NAME-CONSISTENCY-001` と分離する |

## 8. 参照情報

- `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-12/spec-update-summary.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

## 9. 備考

本タスクは運用ガードの追加であり、機能仕様を直接変更しない。  
対象は Phase 12 の同期手順で、UIタスク再確認時の再発防止を目的とする。
