# UT-IMP-PHASE12-ZERO-UNASSIGNED-EVIDENCE-GUARD-001: Phase 12 未タスク 0件証跡ガード

## メタ情報

```yaml
issue_number: 1192
task_id: UT-IMP-PHASE12-ZERO-UNASSIGNED-EVIDENCE-GUARD-001
task_name: Phase 12 未タスク 0件証跡ガード
category: 改善
target_feature: Phase 12 の unassigned-task detection / compliance evidence / current-baseline 分離記録
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-04 Phase 12 follow-up
created_date: 2026-03-13
related_tasks:
  - TASK-SKILL-LIFECYCLE-04
  - UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001
  - UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
```

| 項目         | 内容                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE12-ZERO-UNASSIGNED-EVIDENCE-GUARD-001                                                                                                |
| タスク名     | Phase 12 未タスク 0件証跡ガード                                                                                                                  |
| 分類         | 改善                                                                                                                                             |
| 対象機能     | `unassigned-task-detection.md` / `phase12-task-spec-compliance-check.md` / `verification-report.md` / `task-workflow.md` の未タスク 0 件証跡同期 |
| 優先度       | 中                                                                                                                                               |
| 見積もり規模 | 中規模                                                                                                                                           |
| ステータス   | 未実施                                                                                                                                           |
| 発見元       | TASK-SKILL-LIFECYCLE-04 Phase 12 follow-up                                                                                                       |
| 発見日       | 2026-03-13                                                                                                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task04 の再監査では initially 「未タスク 0 件」「`docs/30-workflows/unassigned-task/` への追加作成なし」と整理したが、その後の再確認で、苦戦箇所を formalize するなら parent workflow outputs と system spec の両方を再同期しないと 0 件証跡が stale になることが分かった。

### 1.2 問題点・課題

- `currentViolations=0` と「本当に未タスクが 0 件だったか」が同義に扱われやすい
- `verify-unassigned-links` の件数更新を parent workflow outputs と system spec に同時転記しないと数値がずれる
- `docs/30-workflows/unassigned-task/` への追加作成なしという文言が残ると、後から未タスクを formalize した時に矛盾する
- 0 件報告と legacy baseline 監視を同じ一文で済ませると、current/baseline の関心ごと分離が崩れる

### 1.3 放置した場合の影響

- parent workflow outputs が stale なまま残り、次回再監査で二重解釈が発生する
- `verify-unassigned-links` 件数の更新漏れにより link 整合の確認が難しくなる
- 「0 件だったのか、後から formalize したのか」が追えず、同種課題の再利用導線が不明瞭になる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の未タスク判定を「0 件」「formalize 後」「legacy baseline あり」の 3 状態で明確に記録できるようにし、parent workflow outputs と system spec の数値・文言を同値化する。

### 2.2 最終ゴール

1. `unassigned-task-detection.md` と `phase12-task-spec-compliance-check.md` に current/baseline/配置結果が別項目で記録されている
2. `verification-report.md` / `task-workflow.md` / `lessons-learned.md` に同じ formalize 結果が残る
3. 0 件から未タスク追加へ転じた場合でも stale な文言が残らない
4. 同種タスクで未タスク判断を 1 回の監査で説明できる

### 2.3 スコープ

#### 含むもの

- Phase 12 の未タスク 0 件証跡テンプレート改善
- current/baseline/link count/配置結果の分離記録
- parent workflow outputs と system spec の同値化
- Task04 follow-up の formalize 記録

#### 含まないもの

- legacy baseline backlog そのものの一括解消
- GitHub Issue 化の自動化
- unassigned-task validator 自体の全面改修

### 2.4 成果物

- 本未タスク仕様書
- 0 件証跡テンプレート改善案
- parent workflow outputs と system spec の同期チェック手順
- `task-workflow.md` / `lessons-learned.md` の関連未タスク導線

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- parent workflow の `unassigned-task-detection.md` と `phase12-task-spec-compliance-check.md` が存在する
- `verify-unassigned-links.js` と `audit-unassigned-tasks.js` が利用可能である
- Task04 の再監査結果と current/baseline の意味を理解している

### 3.2 依存タスク

- TASK-SKILL-LIFECYCLE-04（完了）
- UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001（関連）
- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001（関連）

### 3.3 必要な知識

- `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD` の役割差
- parent workflow outputs と system spec の同期手順
- 0 件報告と legacy baseline 監視の分離記法

### 3.4 推奨アプローチ

1. 未タスク判定を `current` / `baseline` / `link count` / `directory placement` の 4 指標へ分解する
2. 0 件時と formalize 後で使う定型文を分離する
3. parent workflow outputs と `task-workflow.md` / `lessons-learned.md` の両方へ同一数値を転記する
4. 監査は `target-file` 個別判定と `--diff-from HEAD` 全体判定をセットで記録する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                   | 発見経緯                                                                         | 解決策                                                                                           | 教訓                                                         |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `current=0` をそのまま「未タスク 0 件」と読んでしまう                  | Task04 再監査時に current 合格と 0 件報告が同じ表現で混ざった                    | current/baseline と配置結果を別行で書くようにした                                                | 監査合格と backlog 有無は別概念である                        |
| `docs/30-workflows/unassigned-task/` への追加作成なしが stale になる   | 後追いで苦戦箇所を formalize すると、以前の 0 件文言が parent outputs に残る     | follow-up formalize 時は parent workflow outputs も同時更新対象に含める                          | 0 件報告は永久不変ではなく再確認のたびに更新される証跡である |
| `verify-unassigned-links` の件数が更新されても周辺文書に転記漏れが出る | 219/219 のような件数が workflow / system spec / verification-report でずれやすい | 件数を 1 か所だけで済ませず、親 workflow outputs と system spec の同一ターン更新を完了条件にした | 数値証跡は単独記録ではなく参照系全体で同期する               |

---

## 4. 実行手順

### Phase構成

- Phase A: 指標分解
- Phase B: parent workflow outputs 是正
- Phase C: system spec 同期
- Phase D: 監査と数値固定

### Phase A: 指標分解

#### 目的

未タスク判定の混線を防ぐ。

#### 手順

1. `current` / `baseline` / `link count` / `directory placement` を別項目へ分ける
2. 0 件時と formalize 後の文言テンプレートを定義する
3. legacy baseline の扱いを別枠で記録する

#### 成果物

- 未タスク判定テンプレート

#### 完了条件

- 4 指標が 1 表または 1 文に混在しない

### Phase B: parent workflow outputs 是正

#### 目的

stale な 0 件証跡を残さない。

#### 手順

1. `unassigned-task-detection.md` を formalize 結果へ更新する
2. `phase12-task-spec-compliance-check.md` を配置済み前提へ更新する
3. 必要に応じて `documentation-changelog.md` / `verification-report.md` を追補する

#### 成果物

- 更新済み parent workflow outputs

#### 完了条件

- 0 件のまま残る stale 文言がない

### Phase C: system spec 同期

#### 目的

system spec 側でも同じ判断を辿れるようにする。

#### 手順

1. `task-workflow.md` に関連未タスクを登録する
2. `lessons-learned.md` に関連未タスクと苦戦箇所を追補する
3. `aiworkflow-requirements` の変更履歴と実行ログへ反映する

#### 成果物

- 更新済み system spec と skill logs

#### 完了条件

- parent outputs と system spec の説明が矛盾しない

### Phase D: 監査と数値固定

#### 目的

新規未タスク追加後の数値を確定する。

#### 手順

1. 各新規未タスクに対して `audit-unassigned-tasks --target-file --diff-from HEAD` を実行する
2. `verify-unassigned-links.js` を実行する
3. `audit-unassigned-tasks --json --diff-from HEAD` を実行する
4. 得られた数値を parent outputs と system spec に転記する

#### 成果物

- 確定数値入りの検証証跡

#### 完了条件

- `currentViolations=0` が維持される
- link count が parent outputs と system spec で一致する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 0 件時と formalize 後のテンプレートが分離されている
- [ ] current/baseline/link count/配置結果が別項目で記録されている
- [ ] parent workflow outputs と system spec が同じ結果を示す

### 品質要件

- [ ] stale な 0 件文言が残っていない
- [ ] 数値証跡が一意に追える
- [ ] legacy baseline と今回差分の責務が分離されている

### ドキュメント要件

- [ ] 本未タスク仕様書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` と `lessons-learned.md` に関連未タスクが同期されている
- [ ] parent workflow の `outputs/phase-12` と `outputs/verification-report.md` に反映されている
- [ ] `aiworkflow-requirements` の変更履歴と実行ログに追記されている

---

## 6. 検証方法

### テストケース

- Case 1: 未タスク 0 件のタスクで `current=0` と配置結果が分離記録される
- Case 2: 後追いで未タスクを formalize した場合に stale な「追加作成なし」が消える
- Case 3: `verify-unassigned-links` の件数が parent outputs / system spec / verification-report で一致する

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-zero-unassigned-evidence-guard-001.md

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

rg -n "currentViolations|baselineViolations|verify-unassigned-links|追加作成なし|formalize" \
  docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12 \
  docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/verification-report.md \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md
```

---

## 7. リスクと対策

| リスク                                                      | 影響度 | 発生確率 | 対策                                                                                    |
| ----------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| 0 件テンプレートと formalize テンプレートが混在して再発する | 中     | 中       | 2 つの文言テンプレートを明示し、追補時は必ず parent outputs 更新を含める                |
| link count の更新漏れが別ファイルに残る                     | 高     | 中       | 件数更新後に `rg` で全参照箇所を一括確認する                                            |
| baseline backlog を今回差分の失敗と誤解する                 | 中     | 中       | `current` と `baseline` を別表記し、失敗判定は `currentViolations.total` のみに固定する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/verification-report.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `docs/30-workflows/unassigned-task/task-imp-phase12-spec-version-consistency-guard-001.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-spec-sync-subagent-guard-001.md`

---

## 9. 備考

### 補足事項

この未タスクは「0 件報告を禁止する」ものではない。0 件と判断した場合でも、その判断が current 合格、legacy baseline 監視、配置有無、link count と独立に説明できる状態を作るための guard である。
