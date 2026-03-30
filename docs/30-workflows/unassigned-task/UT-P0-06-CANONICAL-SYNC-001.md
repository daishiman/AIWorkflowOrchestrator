# UT-P0-06-CANONICAL-SYNC-001

## メタ情報

| 項目       | 値                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- |
| ステータス | 未着手                                                                              |
| 優先度     | High                                                                                |
| 起票日     | 2026-03-30                                                                          |
| 起票元     | TASK-P0-06 Phase 12 / unassigned-task-detection.md                                  |
| 関連タスク | TASK-P0-06 (conversational-interview-ui), TASK-RT-05, UT-P0-06-PHASE11-EVIDENCE-001 |
| Issue番号  | #1747                                                                               |

## 1. なぜこのタスクが必要か（Why）

TASK-P0-06 と TASK-RT-05 の実装完了後、`aiworkflow-requirements` の仕様文書群（`task-workflow-completed-*`, `lessons-learned-*`, `task-workflow-backlog.md`）への same-wave sync が未完となっている。
ローカルのタスクワークフロー文書は更新済みだが、グローバルな正本仕様（`aiworkflow-requirements`）への反映がなければ、将来の開発で同様の問題が再発するリスクがある。また、RT-05の `selectedOptionIds` / `selectedValues` フィールド名ドリフトの教訓も記録されていない状態。

## 2. 何を達成するか（What）

以下の `aiworkflow-requirements` ドキュメントを今回の開発内容に合わせて同期・更新する：

- `task-workflow-completed-*`: P0-06 / RT-05 の完了記録追加
- `lessons-learned-*`: cross-task field名ドリフト・UIタスクのEvidence取得・false green解消の教訓追加
- `task-workflow-backlog.md`: 本タスク（UT-P0-06-PHASE11-EVIDENCE-001）をバックログに登録
- 必要に応じて `architecture-implementation-patterns-*` の更新

## 3. どのように実行するか（How）

1. `aiworkflow-requirements` スキルを使って現行の正本仕様を参照する
2. TASK-P0-06 / TASK-RT-05 の実装差分と今回の教訓をリストアップする
3. 各仕様文書の更新箇所を特定し、差分を最小化して更新する
4. 更新後に `aiworkflow-requirements` の整合性チェックを実施する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                              | 原因                                                                                                        | 解決策                                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Cross-task 契約のフィールド名ドリフト | RT-05 と P0-06 で `selectedOptionIds` vs `selectedValues` の命名が並行して進行し、互換処理が必要になった    | 共有型 (`packages/shared/src/types/skillCreator.ts`) を single source of truth とし、local alias は廃止方向へ |
| same-wave sync の範囲判断の難しさ     | `aiworkflow-requirements` の更新対象ファミリ（task-workflow/lessons/backlog）の選択が毎回手作業で判断が必要 | 更新対象ファミリのチェックリストを Phase 12 テンプレートに組み込み、自動案内できるようにする                  |
| false green の検出遅延                | completion-report.md 作成時点では「実装完了」に見えるが、Phase 11 manual test や spec sync が残っていた     | artifacts.json のフェーズ別ステータスを主ゲートとし、completion-report.md は補足扱いにする                    |

## 4. 実行手順

1. 今回の変更サマリーを整理する
   - P0-06: 会話型インタビューUI実装（7コンポーネント、useInterviewState、undo/rollback）
   - RT-05: multi_select型定義追加、SkillCreatorWorkflowEngineへのバリデーション実装
   - 共通: `SkillCreatorUserInputSubmission` の `selectedOptionIds` canonical化
2. `aiworkflow-requirements` スキルで更新対象ファイルを特定する
   ```
   aiworkflow-requirements: task-workflow-completed*, lessons-learned-current*, task-workflow-backlog
   ```
3. `task-workflow-backlog.md` を更新する
   - `UT-P0-06-PHASE11-EVIDENCE-001` をバックログに追加
4. `lessons-learned-current.md` を更新する
   - cross-task フィールド名ドリフトの教訓
   - UIタスク representative screenshots 必須要件の明記
   - false green 解消パターンの記録
5. `task-workflow-completed-*` に P0-06 / RT-05 の完了記録を追加する
6. 更新後に `aiworkflow-requirements` の整合性を確認する

## 5. 完了条件チェックリスト

- [ ] `task-workflow-backlog.md` に UT-P0-06-PHASE11-EVIDENCE-001 が登録されている
- [ ] `lessons-learned-current.md` に cross-task フィールド名ドリフトの教訓が追記されている
- [ ] `lessons-learned-current.md` に UIタスクのEvidence取得必須ルールが明記されている
- [ ] TASK-P0-06 の完了記録が `task-workflow-completed-*` に追加されている
- [ ] TASK-RT-05 の進捗状況が `task-workflow-active.md` または `backlog.md` に反映されている
- [ ] 更新後に `aiworkflow-requirements` の整合性チェックがパスしている

## 6. 検証方法

```bash
# lessons-learned 更新確認
grep -r "selectedOptionIds\|false green\|representative screenshots" \
  .agents/skills/aiworkflow-requirements/references/lessons-learned-current.md

# backlog更新確認
grep "UT-P0-06-PHASE11-EVIDENCE-001" \
  .agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md
```

## 7. リスクと対策

- リスク: `aiworkflow-requirements` の更新対象ファイルが多すぎて漏れが発生する
  - 対策: `aiworkflow-requirements` スキルの `resource-map` / `topic-map` を起点に必要最小限のファイルのみ更新する
- リスク: RT-05 がまだ実装途中なのに完了記録を書いてしまう
  - 対策: `task-workflow-active.md` と `backlog.md` のどちらに記録するかを artifacts.json のステータスで判断する

## 8. 参照情報

- `docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-12/skill-feedback-report.md`
- `docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-12/documentation-changelog.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.agents/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- `packages/shared/src/types/skillCreator.ts`

## 9. 備考

本タスクは仕様同期系（High）。UT-P0-06-PHASE11-EVIDENCE-001 と並行作業可能。
`aiworkflow-requirements` スキルの `quick-reference-search-patterns.md` を活用して更新箇所を効率的に特定すること。
TASK-RT-05 の Phase 1-13 完全実行タスクとは別扱い（RT-05の実装完了を待たずに今回分の契約定義の教訓だけを先に記録する）。
