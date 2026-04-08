# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 12                                 |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

実装完了後の成果を、`task-specification-creator` と `aiworkflow-requirements` の正本へ同期する。
この Phase では実装コードは触らず、仕様・台帳・履歴・未タスク・フィードバックを分離して記録する。

---

## 中学生レベル概念説明

このフェーズでやることは、ひとことで言うと「直したあとに説明書もそろえる」ことです。

たとえば、家のスイッチを直したのに説明書が古いままだと、あとで誰かが見たときに「これ、本当に今の動き？」と迷います。
そこで Phase 12 では、次の5つをまとめて整えます。

1. わかりやすい実装ガイドを書く
2. どの仕様書をどう直したかを記録する
3. 変更の履歴を残す
4. まだ残っている課題を見つけて記録する
5. このスキルと仕様書がちゃんと合っているかを確認する

これで、実装と説明書のズレを最小にできます。

---

## 事前チェック【必須】

Phase 12 を始める前に、次を先に確認する。

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する
2. `LOGS.md` は `aiworkflow-requirements` と `task-specification-creator` の両方を更新対象に含める
3. `SKILL.md` の変更履歴テーブルを両方更新対象に含める
4. `topic-map.md` / `keywords.json` の再生成が必要かを確認する
5. `planned wording`（「仕様策定のみ」「実行予定」「保留として記録」など）を残さない
6. Phase 13 は user approval がない限り blocked のままにする

---

## 実行タスク

| Task      | 内容                                                 | 主成果物                                                 |
| --------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 2パート構成の実装ガイド作成                          | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec update summary 作成                      | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | documentation changelog と artifacts.json / 履歴同期 | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | unassigned task detection 作成                       | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | skill feedback report 作成                           | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check 作成              | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成
- Task 12-2: system spec update summary 作成
- Task 12-3: documentation changelog / artifacts.json / LOGS / SKILL / topic-map の同期
- Task 12-4: 未タスク検出
- Task 12-5: skill feedback report 作成
- Task 12-6: phase12-task-spec-compliance-check 作成

---

## 参照資料

| 資料名                    | パス                                                                                                                  | 説明                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                                                              | non-visual smoke test の結果         |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                                             | AC-1〜AC-7 の最終照合結果            |
| Phase 3 設計レビュー結果  | `outputs/phase-3/design-review-result.md`                                                                             | MINOR / MAJOR の確認元               |
| Phase 1 受入基準          | `outputs/phase-1/acceptance-criteria.md`                                                                              | Phase 12 で回収する前提の確認元      |
| GitHub Issue #1606        | daishiman/AIWorkflowOrchestrator#1606                                                                                 | 進捗コメント更新対象                 |
| HealthPolicy 正本         | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`                             | `RuntimePolicyResolver` との関係記録 |
| 台帳正本                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `task-workflow-completed.md`           | 未タスク移管と完了記録               |
| Phase 12 テンプレート     | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` / `phase-template-phase12-detail.md` | 出力名・必須タスクの根拠             |

---

## 実行手順

### Task 12-1: 実装ガイド作成

`implementation-guide.md` は 2パート構成とする。

#### Part 1: 中学生レベルの説明

- なぜ必要かを先に書く
- 日常のたとえ話を最低1つ入れる
- 専門用語を使う場合は、その場で簡単に説明する
- 「healthPolicy を渡す」「なぜそれが必要か」を、順番を崩さずに説明する

#### Part 2: 技術者向け詳細

- `RuntimeSkillCreatorFacadeDeps` の型変化を TypeScript で説明する
- `RuntimeSkillCreatorFacade` と `RuntimePolicyResolver` の呼び出し関係を示す
- `resolveHealthPolicy()` の使い方と初期値を記載する
- エラーケースと後方互換性を列挙する
- 設定値・定数・引数の一覧を表にする

### Task 12-2: system spec update summary 作成

`system-spec-update-summary.md` には、実際に更新すべき正本を1か所にまとめる。

```bash
# 変更対象の仕様書を再生成・確認する
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# 必要に応じて構造検証
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js
```

#### Step 1-A: 完了タスク記録

- `task-workflow-backlog.md` から `UT-HEALTH-POLICY-RUNTIME-INJECTION-001` を完了扱いへ移す
- `task-workflow-completed.md` に完了記録を追加する
- `arch-execution-capability-contract.md` の HealthPolicy 関連 row を completed に更新する
- 必要に応じて `api-ipc-system-core.md` の runtime bridge 記述へ追記する
- `LOGS.md` を `aiworkflow-requirements` と `task-specification-creator` の両方で更新する
- GitHub Issue #1606 に進捗コメントを追加する（close は Phase 13 blocked 解除後）

#### Step 1-B: 実装状況テーブル更新

- `RuntimeSkillCreatorFacadeDeps` の `healthPolicy?: HealthPolicy` 追加を反映する
- `RuntimeSkillCreatorFacade` の constructor DI 追加を反映する
- `index.ts` の healthPolicy 注入を反映する

#### Step 1-C: 関連タスクテーブル更新

- 未タスクとして残すものは明示して分類する
- `UT-HEALTH-POLICY-MAINLINE-MIGRATION-001` などの関連タスクは current facts に合わせて更新する

#### Step 1-D: topic-map 再生成

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
- `topic-map.md` と `keywords.json` の更新を確認する

#### Step 2: 必要な場合のみ system spec を更新

- 新規インターフェース / 型 / 定数 / API 変更がある場合だけ更新する
- 内部リファクタリングのみなら更新不要と明記する
- 更新不要の場合でも、理由は `system-spec-update-summary.md` に書く

### Task 12-3: documentation changelog と履歴同期

`documentation-changelog.md` では、変更の前後と根拠を短く記録する。

```bash
# documentation changelog を生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-health-policy-runtime-injection

# Phase 12 完了登録と artifacts.json 同期
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-health-policy-runtime-injection \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:system spec update summary,outputs/phase-12/documentation-changelog.md:documentation changelog,outputs/phase-12/unassigned-task-detection.md:unassigned task detection,outputs/phase-12/skill-feedback-report.md:skill feedback report,outputs/phase-12/phase12-task-spec-compliance-check.md:phase12 compliance check"

# planned wording が残っていないことを確認
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/ut-health-policy-runtime-injection/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"

# .claude 正本と .agents mirror の parity を確認
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

- 変更対象ファイル
- 変更理由
- current / baseline
- validator 実行結果
- `planned wording` なしの確認

あわせて次を更新する。

- `aiworkflow-requirements/LOGS.md`
- `task-specification-creator/LOGS.md`
- `aiworkflow-requirements/SKILL.md`
- `task-specification-creator/SKILL.md`
- `.claude` を正本にし、`.agents` mirror がある場合は同一 wave で同期する

### Task 12-4: unassigned task detection

`unassigned-task-detection.md` には、0件でも必ず結果を書く。

確認元:

- Phase 3 の MINOR 指摘
- Phase 10 の MINOR / residual issue
- Phase 11 の non-visual smoke test で出た所見
- `TODO` / `FIXME` / `HACK` / `XXX`

未タスクが出た場合は `docs/30-workflows/unassigned-task/` に正式な指示書を作成する。

```bash
# Phase 12 の未タスク候補を確認する
rg -n "TODO|FIXME|HACK|XXX" \
  docs/30-workflows/ut-health-policy-runtime-injection \
  .claude/skills/aiworkflow-requirements/references/task-workflow-*.md
```

### Task 12-5: skill feedback report

`skill-feedback-report.md` には、改善点がなくても `改善点なし` と書く。

### Task 12-6: phase12-task-spec-compliance-check

`phase12-task-spec-compliance-check.md` には、次を確認する。

- Task 12-1 〜 12-6 が全て完了している
- `implementation-guide.md` が 2 パート構成である
- `system-spec-update-summary.md` が Step 1-A 〜 2 を含む
- `documentation-changelog.md` が current / baseline を含む
- `unassigned-task-detection.md` が 0件でも出力されている
- `skill-feedback-report.md` が省略されていない

```bash
# Phase 12 完了チェック
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-health-policy-runtime-injection --phase 12
```

---

## 統合テスト連携

- Phase 11 の non-visual smoke test 結果を Phase 12 の根拠に使う
- 仕様書更新後に、Phase 10 の AC 記録と矛盾しないことを確認する
- Phase 13 は user approval 取得まで blocked のまま維持する

---

## サブタスク管理

| ID     | タスク名                           | ステータス |
| ------ | ---------------------------------- | ---------- |
| T-12-1 | 実装ガイド作成                     | 未実施     |
| T-12-2 | system spec update summary 作成    | 未実施     |
| T-12-3 | documentation changelog 同期       | 未実施     |
| T-12-4 | unassigned task detection          | 未実施     |
| T-12-5 | skill feedback report 作成         | 未実施     |
| T-12-6 | phase12-task-spec-compliance-check | 未実施     |

---

## 成果物

| 成果物                     | 配置先                                                   | 形式     |
| -------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | Markdown |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| phase 12 compliance check  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件

- [ ] 実装ガイドが 2 パート構成で作成されている
- [ ] system spec update summary が Step 1-A 〜 2 を含んでいる
- [ ] documentation changelog が current / baseline / validator を含んでいる
- [ ] `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` が更新されている
- [ ] `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` が更新されている
- [ ] `.claude` 正本と `.agents` mirror の差分が揃っている
- [ ] `topic-map.md` と `keywords.json` が再生成されている
- [ ] unassigned task detection が 0件でも出力されている
- [ ] skill feedback report が省略されていない
- [ ] phase12-task-spec-compliance-check が PASS である
- [ ] planned wording が残っていない

---

## タスク100%実行確認【必須】

- [ ] T-12-1: 実装ガイド作成を完了済み
- [ ] T-12-2: system spec update summary を完了済み
- [ ] T-12-3: documentation changelog と履歴同期を完了済み
- [ ] T-12-4: unassigned task detection を完了済み
- [ ] T-12-5: skill feedback report を完了済み
- [ ] T-12-6: phase12-task-spec-compliance-check を完了済み

---

## 次Phase

**Phase 13: PR準備** — ユーザーの明示承認がある場合のみ blocked を解除する。

**Phase 13 開始条件**: user approval がない限り blocked のまま維持する。
