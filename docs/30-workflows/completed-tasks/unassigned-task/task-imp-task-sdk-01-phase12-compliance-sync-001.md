# UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001: TASK-SDK-01 の Phase 12 成果物・ステータス・台帳同期を是正する

## メタ情報

```yaml
issue_number: 1643
task_id: UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001
task_name: TASK-SDK-01 の Phase 12 成果物・ステータス・台帳同期を是正する
category: 改善
target_feature: workflow manifest foundation の Phase 12 ドキュメント運用
priority: 高
scale: 中規模
status: 完了
source_phase: Phase 10/11/12 再監査 + 実装レビュー
created_date: 2026-03-26
dependencies:
  - TASK-SDK-01
parent_workflow: docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md
```

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001                  |
| タスク名     | TASK-SDK-01 の Phase 12 成果物・ステータス・台帳同期を是正する  |
| 分類         | 改善                                                            |
| 対象機能     | workflow manifest foundation の Phase 12 ドキュメント運用       |
| 優先度       | 高                                                              |
| 見積もり規模 | 中規模                                                          |
| ステータス   | 完了（2026-03-26）                                              |
| 発見元       | Phase 10/11/12 再監査 + 実装レビュー（2026-03-26, Issue #1643） |
| 発見日       | 2026-03-26                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/` は `workflow-manifest.json` と `ManifestLoader` の foundation task だが、Phase 12 close-out 時点で「自己申告された完了状態」と「実際の成果物内容・台帳同期」の間にずれが残っていた。特に `implementation-guide.md`、`system-spec-update-summary.md`、`documentation-changelog.md`、`phase12-task-spec-compliance-check.md` は存在していても、task-specification-creator が要求する監査証跡密度を満たしていない。

### 1.2 問題点・課題

- Phase 12 の 4 点同期対象である `index.md` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` と、成果物本文の整合説明が分離されている
- `implementation-guide.md` が Part 1 / Part 2 必須要件を満たしているかを validator 観点で説明し切れていない
- `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` が Step 1-A〜1-C / 条件付き Step 2 の監査証跡として不足している
- `task-workflow-completed.md` 側には follow-up として記載済みだが、対応する `docs/30-workflows/unassigned-task/` の実体が未作成で、台帳と実ファイルが不整合になっている

### 1.3 放置した場合の影響

- validator や人手レビューが false positive を出し、未完了の Phase 12 を完了扱いしてしまう
- Task02 以降が foundation task を正本として参照した際に、誤った Phase 12 close-out 状態を前提に進んでしまう
- `task-workflow-completed.md` と unassigned-task 実体のリンク欠落が残り、再監査の追跡可能性が落ちる

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-SDK-01 の Phase 12 を task-specification-creator の必須要件へ再整列し、workflow 本体・成果物・台帳・system spec の状態を 1 つの事実へ揃える。

### 2.2 最終ゴール

1. `index.md` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` の status と、Phase 12 成果物本文の説明が矛盾なく同期している
2. `implementation-guide.md` が Part 1 / Part 2 要件を満たし、validator 観点で説明可能になっている
3. `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `phase12-task-spec-compliance-check.md` が実測値ベースで監査可能になっている
4. `task-workflow-backlog.md` と関連 lessons / completed ledger の導線が、この未タスク指示書まで含めて閉じている

### 2.3 スコープ

#### 含むもの

- `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/` 配下の Phase 12 成果物是正
- workflow 本体の status と監査証跡の同期
- `aiworkflow-requirements` の `task-workflow*` / `lessons-learned*` / `topic-map` / 必要な architecture/interfaces 反映
- `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` と `task-workflow-backlog.md` の canonical 登録

#### 含まないもの

- `ManifestLoader` 自体のコード仕様変更
- Task02 以降の runtime orchestration 実装
- コミット、PR 作成、push

### 2.4 成果物

- 是正済み workflow 文書一式
- 更新済み `outputs/phase-12/implementation-guide.md`
- 更新済み `outputs/phase-12/system-spec-update-summary.md`
- 更新済み `outputs/phase-12/documentation-changelog.md`
- 更新済み `outputs/phase-12/unassigned-task-detection.md`
- 更新済み `outputs/phase-12/phase12-task-spec-compliance-check.md`
- 登録済み `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md`
- 更新済み `task-workflow-backlog.md` と再生成済み aiworkflow-requirements index

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase 11/12 ガイドを参照できる
- `aiworkflow-requirements` の `task-workflow-completed.md` / `task-workflow-backlog.md` / `lessons-learned-phase12-workflow-lifecycle.md` / `arch-electron-services-details-part2.md` / `architecture-overview-core.md` / `interfaces-agent-sdk-skill-reference.md` を参照できる
- 現時点で Task01 は `completed-tasks` 配下に存在していても、Issue #1643 の是正未着手として follow-up を継続実行する前提を共有する

### 3.2 依存タスク

- TASK-SDK-01 の現行差分
- `task-workflow-completed.md` に記録済みの Phase 12 follow-up 一覧

### 3.3 必要な知識

- Phase 12 必須 5 タスクと Step 1-A〜1-C / 条件付き Step 2
- workflow status 同期と artifacts 同期ルール
- same-wave sync の ledger / contract / discovery 3 層
- unassigned-task formalize と backlog canonical path の運用

### 3.4 推奨アプローチ

1. 先に現物差分を列挙し、「事実」と「自己申告」のずれを表にする
2. `implementation-guide.md` を validator literal ベースで再構成する
3. `system-spec-update-summary.md` には更新先ファイル、未更新理由、実コマンド結果を明記する
4. その後で workflow status と `phase12-task-spec-compliance-check.md` を同期する
5. 最後に unassigned-task / backlog / index を同一ターンで閉じる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                            | 発見経緯                                                                         | 解決策                                                                                                   | 教訓                                              |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 12 成果物が存在していても内容要件不足で完了扱いされていた | `phase12-task-spec-compliance-check.md` が完了、本文は未監査という逆転が発生した | 「存在確認」と「内容確認」を別表に分け、compliance-check は最後にだけ更新する                            | Phase 12 はファイル数ではなく証跡密度で閉じる     |
| `system-spec-update-summary.md` が抽象的すぎて監査できない      | summary に「更新済み」の総論だけが残り、更新先が追えなかった                     | Step 1-A / 1-B / 1-C / Step 2 ごとに対象ファイル、判断根拠、未更新理由を固定欄で残す                     | same-wave sync は更新有無だけでなく判断根拠を残す |
| docs-only task で `task-workflow-backlog.md` 連携を忘れやすい   | completed ledger 側に未タスク名だけ残り、unassigned-task 実体が欠落した          | unassigned spec 作成後に backlog / completed ledger / workflow outputs の 3 点リンクを同ターンで確認する | 未タスクは名称記録だけでは閉じない                |

---

## 4. 実行手順

### Phase構成

- Phase A: 現状差分の棚卸し
- Phase B: Phase 12 成果物の内容是正
- Phase C: system spec / backlog / lessons 同期
- Phase D: validator と status の最終同期

### Phase A: 現状差分の棚卸し

#### 目的

workflow 本体、成果物、台帳の食い違いを一覧化する。

#### 手順

1. `index.md`、`phase-12-documentation.md`、`artifacts.json`、`outputs/artifacts.json` の status を比較する
2. `outputs/phase-12/*.md` の planned wording と要件不足を抽出する
3. `task-workflow-completed.md` / `task-workflow-backlog.md` / `lessons-learned-phase12-workflow-lifecycle.md` の更新要否を判定する

#### 成果物

- 差分表
- 同期対象一覧

#### 完了条件

- どのファイルを更新し、どれを未更新理由付きで残すか説明できる

### Phase B: Phase 12 成果物の内容是正

#### 目的

Phase 12 主要成果物を task-specification-creator 準拠へ戻す。

#### 手順

1. `implementation-guide.md` を Part 1 / Part 2 必須要件で再構成する
2. `system-spec-update-summary.md` に Step 1-A〜1-C / Step 2 の監査証跡を追加する
3. `documentation-changelog.md` に実更新ファイル、validator 結果、4 点同期結果を追加する
4. `unassigned-task-detection.md` と `phase12-task-spec-compliance-check.md` を実測値へ同期する

#### 成果物

- 是正済み Phase 12 成果物

#### 完了条件

- 各成果物が「何を直したか」「何が未更新か」を個別に説明できる

### Phase C: system spec / backlog / lessons 同期

#### 目的

未タスク導線と same-wave sync を閉じる。

#### 手順

1. `task-workflow-backlog.md` に本 task を登録する
2. `task-workflow-completed.md` と `lessons-learned-phase12-workflow-lifecycle.md` の参照整合を確認する
3. 必要に応じて `arch-electron-services-details-part2.md`、`architecture-overview-core.md`、`interfaces-agent-sdk-skill-reference.md` を current facts に同期する
4. `generate-index.js` で `topic-map` / `keywords` / `resource-map` を再生成する

#### 成果物

- 更新済み台帳・lessons・index

#### 完了条件

- 未タスク spec と backlog / completed ledger / workflow outputs の相互リンクが成立している

### Phase D: validator と status の最終同期

#### 目的

最終状態を 1 つの事実へ揃える。

#### 手順

1. Phase 12 validator 群を実行する
2. `index.md` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` の status を同期する
3. `audit-unassigned-tasks.js --target-file ...` で本指示書を監査し、Phase 13 は `blocked` を維持して final check を行う

#### 成果物

- validator 実行結果
- 同期済み status
- unassigned-task 監査結果

#### 完了条件

- status drift が 0 件で、Phase 12 完了可否を 1 文で説明できる
- `currentViolations = 0` で未タスク指示書の品質が確認できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `implementation-guide.md` が Part 1 / Part 2 の必須要件を満たしている
- [ ] `system-spec-update-summary.md` が Step 1-A〜1-C / Step 2 の監査証跡を持つ
- [ ] `documentation-changelog.md` が実更新ファイルと validator 結果を保持している
- [ ] `unassigned-task-detection.md` が follow-up と既存 tracker の区別を保持している
- [ ] `phase12-task-spec-compliance-check.md` が実測値ベースで更新されている

### 品質要件

- [ ] `index.md` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` の status が一致する
- [ ] planned wording が `outputs/phase-12/*.md` から除去されている
- [ ] `task-workflow-backlog.md` と completed ledger / lessons への導線が閉じている
- [x] `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` が canonical path と一致している

### ドキュメント要件

- [ ] `task-workflow*` / `lessons-learned*` / `topic-map` 更新結果が記録されている
- [ ] completed-tasks 配下に存在していても follow-up を継続する理由が明記されている
- [ ] 本指示書が `audit-unassigned-tasks.js` を通過している

---

## 6. 検証方法

### テストケース

- TC-1: 4 点同期対象の status が全て一致する
- TC-2: `implementation-guide.md` が Part 1 / Part 2 validator 観点を満たす
- TC-3: `system-spec-update-summary.md` から Step 1-A〜1-C / Step 2 の判断根拠を追跡できる
- TC-4: `task-workflow-backlog.md` / completed ledger / lessons / unassigned spec のリンクが相互に成立する
- TC-5: `audit-unassigned-tasks.js` で本指示書の `currentViolations` が 0 件になる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation
rg -n "計画|予定|TODO|will be|保留" docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-12/*.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md
```

---

## 7. リスクと対策

| リスク                                                                          | 影響度 | 発生確率 | 対策                                                                               |
| ------------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| Phase 12 是正中に status だけ先に更新して再度 drift を作る                      | 高     | 中       | 内容是正完了までは compliance-check と status を更新しない                         |
| `task-workflow-completed.md` 側だけ更新して `task-workflow-backlog.md` を漏らす | 高     | 中       | backlog / completed ledger / unassigned spec の 3 点を同一ターンで確認する         |
| docs-only task と誤認して `topic-map` 再生成を後回しにする                      | 中     | 中       | Step 1-A で更新対象を確定し、reference 更新後に `generate-index.js` を必ず実行する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md`
- `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/phase-12-documentation.md`
- `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/outputs/phase-12/unassigned-task-detection.md`

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`

### 関連 skill / guide

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/phase-template-phase12.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-quality-standards.md`

---

## 9. 備考

### レビュー指摘の原文

```text
Phase 完了状態の4点同期が壊れており、監査結果が相互矛盾しています。
implementation-guide.md が Task 12-1 の必須要件を満たしていません。
system-spec-update-summary.md と documentation-changelog.md が Step 1-A/1-B/1-C/Step 2 の監査証跡になっていません。
```

### 補足事項

- 本 task は `completed-tasks` 配下に置かれた親 workflow に対する follow-up 是正 task であり、親 workflow が close 状態でも継続実行対象とする
- `esbuild` mismatch は別既存未タスクで追跡し、本 task では Phase 12 / 台帳同期に集中する
