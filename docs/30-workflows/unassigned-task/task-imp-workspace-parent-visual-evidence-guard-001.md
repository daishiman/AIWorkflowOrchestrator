# UT-IMP-WORKSPACE-PARENT-VISUAL-EVIDENCE-GUARD-001: Workspace parent visual evidence ガード

## メタ情報

```yaml
issue_number: 1174
task_id: UT-IMP-WORKSPACE-PARENT-VISUAL-EVIDENCE-GUARD-001
task_name: Workspace parent visual evidence ガード
category: 改善
target_feature: docs-only parent workflow / evidence inheritance / representative screenshot / visual re-audit
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-04-WORKSPACE-VIEW Phase 12 follow-up
created_date: 2026-03-12
dependencies:
  - TASK-UI-04-WORKSPACE-VIEW
  - UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001
```

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-WORKSPACE-PARENT-VISUAL-EVIDENCE-GUARD-001                   |
| タスク名     | Workspace parent visual evidence ガード                             |
| 分類         | 改善                                                                |
| 対象機能     | docs-only parent workflow の Phase 11 evidence inheritance / 再監査 |
| 優先度       | 中                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | TASK-UI-04-WORKSPACE-VIEW Phase 12 follow-up                        |
| 発見日       | 2026-03-12                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-04-WORKSPACE-VIEW は docs-only 親 workflow なので、Phase 11 の既定は child evidence inheritance だった。一方で、今回の再監査では user から visual confirmation が求められ、parent current workflow に representative screenshot 3件を保存し直した。これにより「新規 UI 実装がない task」でも visual re-audit が必要になるケースがあることが明確になった。

### 1.2 問題点・課題

- docs-only parent を `N/A` で閉じるだけでは、user 要求時の視覚証跡が current workflow に残らない
- representative screenshot を route 全景だけで済ませると、責務境界や state が読めず再利用価値が低い
- evidence inheritance の既定ルールと「いつ 3件を current workflow に昇格するか」の条件が、manual-test doc と system spec で分散しやすい
- current build source pinning と visual evidence policy が混同されると、別タスクの guard と責務が重複する

### 1.3 放置した場合の影響

- docs-only parent workflow の再監査で、毎回「screenshot が必要か」を議論し直すことになる
- representative screenshot が証跡として弱く、Apple UI/UX 所見や state boundary の比較に使えない
- Phase 11 coverage validator は PASS でも、user が求める visual confidence を満たせないまま close してしまう

---

## 2. 何を達成するか（What）

### 2.1 目的

docs-only parent workflow における evidence inheritance と representative screenshot 昇格条件を標準化し、visual re-audit の必要有無と保存方法を再利用可能なルールへ固定する。

### 2.2 最終ゴール

1. docs-only parent workflow の Phase 11 profile が「既定は child evidence inheritance」「user 要求または統合再監査時は representative screenshot 3件を current workflow へ保存」として定義される
2. representative screenshot は shell 全景ではなく、state / 責務境界が読める selector-based capture を優先する
3. `ui-ux-navigation.md` / `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` / task-060 outputs が同じ evidence policy を共有する
4. current build source pinning と visual evidence policy の責務分離が明文化される

### 2.3 スコープ

#### 含むもの

- docs-only parent workflow 向け Phase 11 evidence profile の標準化
- representative screenshot 3件の昇格条件、選定基準、記録先の明確化
- selector-based capture 優先ルールの導入
- `ui-ux-navigation.md` / `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` / task-060 Phase 12 outputs への関連未タスク導線追加

#### 含まないもの

- current build source pinning や preview 起動手順の再定義
- child 04A / 04B / 04C の追加 screenshot 撮影
- Playwright capture script の遷移待機戦略改善
- Apple UI/UX 所見そのもののデザイン修正

### 2.4 成果物

- 本未タスク指示書
- docs-only parent Phase 11 evidence profile
- representative screenshot 選定ルール / validator 案
- 更新済み system spec / workflow outputs

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-060 current workflow の representative screenshot 3件が参照可能であること
- 04A / 04B / 04C の child evidence 数とスクリーンショット実体が確認できること
- `ui-ux-navigation.md` が parent `workspace` ViewType の evidence policy を保持していること

### 3.2 依存タスク

- `TASK-UI-04-WORKSPACE-VIEW`
- `UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001`

### 3.3 必要な知識

- Phase 11 evidence inheritance 運用
- representative screenshot と coverage validator の関係
- `ui-ux-navigation.md` の domain UI spec 役割
- Apple UI/UX 所見と state boundary 証跡の記録方法

### 3.4 推奨アプローチ

1. 「evidence source を current build に固定する責務」と「どの証跡を parent へ昇格するか」を明確に分離する
2. docs-only parent の Phase 11 を `N/A` / `inherit-only` / `representative capture` の 3 モードで定義する
3. representative screenshot の selection rule を route 全景ではなく selector / state / ownership ベースで記述する
4. Phase 12 outputs と system spec の双方に、visual re-audit が発動した条件を残す

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                             | 発見経緯                                                                          | 解決策                                                                                                               | 教訓                                                                        |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| docs-only parent を Phase 11 N/A で閉じると user 要求の visual re-audit が漏れた | task-060 は新規 UI 実装を持たないため、最初は inheritance だけで閉じやすかった    | child evidence inheritance を既定にしつつ、user 要求時は representative screenshot 3件を current workflow に保存した | docs-only parent でも user が視覚検証を求めたら代表証跡を残す               |
| route 全景だけの screenshot は責務境界が読み取りにくかった                       | parent で 04A / 04B / 04C の役割を比較する際、全景だけでは state が見えにくかった | 3-pane、file chip、quick search dialog など責務境界が読める場面を代表証跡として採用した                              | representative evidence は surface / state が読める要素を優先する           |
| build source pinning と representative evidence policy が混線しやすかった        | screenshot を撮る話題と policy 話題を同じ苦戦箇所として扱いがちだった             | source pinning は既存 UT に委譲し、本タスクは昇格条件と記録形式に責務を限定する                                      | visual evidence task は「何を撮るか」に集中し、「どう起動するか」と分離する |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                         | 主担当成果物                                   |
| ---------- | -------------------------------- | ---------------------------------------------- |
| SubAgent-A | evidence profile 定義            | docs-only parent Phase 11 モード定義           |
| SubAgent-B | representative screenshot policy | selector-based capture rule、3件選定基準       |
| SubAgent-C | system spec sync                 | navigation / feature / workflow / lessons 更新 |
| SubAgent-D | task-060 outputs / validator     | Phase 12 outputs 再同期、coverage / count 確認 |

---

## 4. 実行手順

### Phase構成

- Phase A: docs-only parent Phase 11 profile の定義
- Phase B: representative screenshot selection rule の固定
- Phase C: system spec と workflow outputs の同期
- Phase D: visual evidence 監査の検証

### Phase A: docs-only parent Phase 11 profile の定義

#### 目的

inherit-only と representative capture の境界条件を明確にする。

#### 手順

1. docs-only parent workflow の Phase 11 を `N/A`、`inherit-only`、`representative capture` の3モードで整理する。
2. user 要求、統合再監査、Apple UI/UX 所見確認など代表証跡が必要になるトリガーを列挙する。
3. current workflow に保存する場合の件数と記録先を定義する。

#### 成果物

- Phase 11 profile 定義
- trigger 条件一覧

#### 完了条件

- parent workflow で screenshot が必要になる条件を一意に説明できる

### Phase B: representative screenshot selection rule の固定

#### 目的

代表証跡の選び方を再利用可能なルールにする。

#### 手順

1. shell 全景より state / 責務境界が読める selector-based capture を優先する方針を定義する。
2. 3件の代表証跡に求める coverage を 04A / 04B / 04C の責務観点で整理する。
3. Apple UI/UX 所見と screenshot の対応づけを manual-test result に残す。

#### 成果物

- representative screenshot policy
- coverage mapping

#### 完了条件

- なぜその 3 件を選ぶのかが task 文書だけで説明できる

### Phase C: system spec と workflow outputs の同期

#### 目的

evidence policy を正本仕様と Phase 12 成果物へ同時反映する。

#### 手順

1. `ui-ux-navigation.md`、`ui-ux-feature-components.md`、`task-workflow.md`、`lessons-learned.md` に関連未タスク導線を追加する。
2. task-060 の `unassigned-task-detection.md`、`documentation-changelog.md`、`spec-update-summary.md`、`phase12-task-spec-compliance-check.md` を再同期する。
3. `generate-index.js` を実行し、必要な index を再生成する。

#### 成果物

- 更新済み system spec
- 更新済み task-060 outputs

#### 完了条件

- evidence policy と未タスク ID が workflow / spec の両方で一致する

### Phase D: visual evidence 監査の検証

#### 目的

新ルールが screenshot counts と evidence references の両方で確認可能であることを保証する。

#### 手順

1. representative screenshot 3件が current workflow に存在することを確認する。
2. `validate-phase11-screenshot-coverage.js` で parent workflow の coverage を再確認する。
3. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --target-file` を実行する。
4. 結果を `task-workflow.md` / `LOGS.md` / task-060 outputs へ記録する。

#### 成果物

- screenshot existence log
- validator 実行ログ

#### 完了条件

- representative screenshot policy と実証跡が同じ current workflow で突合できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] docs-only parent Phase 11 profile が定義されている
- [ ] representative screenshot 3件の昇格条件が定義されている
- [ ] selector-based capture 優先ルールが明文化されている

### 品質要件

- [ ] `validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view --allow-non-visual-tc TC-11-01,TC-11-02` が PASS する
- [ ] `find docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/screenshots -name 'TC-*.png' | wc -l` が representative screenshot 3件を示す
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-workspace-parent-visual-evidence-guard-001.md` で `currentViolations.total = 0`

### ドキュメント要件

- [ ] `ui-ux-navigation.md` / `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` に同一未タスク ID の導線がある
- [ ] task-060 の Phase 12 outputs が本未タスクを記録している
- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する

---

## 6. 検証方法

### テストケース

- Case 1: docs-only parent Phase 11 profile が evidence inheritance と representative capture を区別して記述できている
- Case 2: representative screenshot 3件が current workflow の責務境界を説明できる
- Case 3: workflow outputs と system spec の関連未タスク ID / 参照先が一致する
- Case 4: 本未タスク指示書が unassigned-task 監査で `currentViolations=0` になる

### 検証手順

```bash
find docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/screenshots -name 'TC-*.png' | wc -l

node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view \
  --allow-non-visual-tc TC-11-01,TC-11-02

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-workspace-parent-visual-evidence-guard-001.md

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

---

## 7. リスクと対策

| リスク                                                    | 影響度 | 発生確率 | 対策                                                              |
| --------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------- |
| representative screenshot の選定が再び属人的になる        | 中     | 中       | selector / state / responsibility の 3 観点を必須化する           |
| build source pinning の既存 UT と責務が重複する           | 中     | 中       | 本タスクは evidence policy のみを扱い、起動元は既存 UT に委譲する |
| docs-only parent 以外にも一律 3件ルールを強制してしまう   | 低     | 中       | 適用条件を parent reference workflow に限定する                   |
| system spec だけ更新して workflow outputs が stale になる | 高     | 中       | task-060 Phase 12 outputs を同一ターンで更新する                  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/evidence-inheritance-log.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`

### 参考資料

- `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/unassigned-task/task-imp-workspace-phase11-current-build-capture-guard-001.md`
- `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
docs-only parent でも user が視覚検証を求めたら、current workflow 配下へ representative screenshot を残す。
```

### 補足事項

- 本タスクは child screenshot の再取得そのものではなく、parent へ昇格する条件と証跡品質の標準化を扱う。
