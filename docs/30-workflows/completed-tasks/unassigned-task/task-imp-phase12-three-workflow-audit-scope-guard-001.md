# UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001: Phase 12 3workflow再監査スコープ判定ガード

## メタ情報

```yaml
issue_number: 962
task_id: UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001
task_name: Phase 12 3workflow再監査スコープ判定ガード
category: 改善
target_feature: 3workflow同時再監査時の証跡同期と未タスク監査判定（scope/current/baseline）の標準化
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-SKILL-IMPORT 3連続是正 実装追補（苦戦箇所・2026-03-04）
created_date: 2026-03-04
dependencies:
  [
    UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001,
    UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001,
  ]
```

| 項目         | 値                                                                        |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001                       |
| タスク名     | Phase 12 3workflow再監査スコープ判定ガード                                |
| 分類         | 改善                                                                      |
| 対象機能     | 3workflow同時再監査時の証跡集約と `audit-unassigned-tasks` 判定軸の標準化 |
| 優先度       | 中                                                                        |
| 見積もり規模 | 中規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | TASK-FIX-SKILL-IMPORT 3連続是正 実装追補（苦戦箇所・2026-03-04）          |
| 発見日       | 2026-03-04                                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`01/02/03-TASK-FIX-SKILL-IMPORT-*` の3workflowを同時に再監査した際、検証自体はPASSでも、証跡転記先と監査判定軸の記録方式がタスク間で揺れやすいことが判明した。

### 1.2 問題点・課題

- `verify-all-specs` / `validate-phase-output` の結果をworkflowごとに個別転記すると、件数や判定値の同期ドリフトが発生しやすい。
- `audit-unassigned-tasks --target-file` は baseline情報を同時に表示するため、`currentViolations=0` の対象PASSを誤って失敗扱いしやすい。
- `aiworkflow-requirements` の `resource-map` 起点で抽出せずに更新を始めると、`task-workflow.md` / `lessons-learned.md` の片側更新が再発する。

### 1.3 放置した場合の影響

- Phase 12再監査の再現性が下がり、同じ検証を繰り返す手戻りが増える。
- 未タスク監査結果の誤読で誤判定が発生し、差戻しが増える。
- 実装内容と教訓が台帳に一体反映されず、同種課題の解決速度が改善しない。

---

## 2. 何を達成するか（What）

### 2.1 目的

3workflow同時再監査を「証跡集約」「判定軸固定」「システム仕様同期」の3点で標準化し、誰が実行しても同じ合否判定と台帳反映になる運用を確立する。

### 2.2 最終ゴール

1. 3workflow再監査の証跡が1つの集約表で管理され、値ドリフトが発生しない。
2. 未タスク監査は `scope.currentFiles` / `currentViolations` / `baselineViolations` の3点で誤読なく記録される。
3. 未タスク指示書作成と同一ターンで `task-workflow.md` / `lessons-learned.md` が同期される。

### 2.3 スコープ

#### 含むもの

- 3workflow再監査（`01/02/03`）の証跡集約手順
- `audit-unassigned-tasks` の target/diff 判定軸固定
- 未タスク仕様書（9セクション+3.5）とシステム仕様台帳の同時同期

#### 含まないもの

- `apps/` / `packages/` の本番機能追加
- baseline違反（既存負債）の全件修正
- 既存全未タスクの一括再整形

### 2.4 成果物

- 本未タスク仕様書
- `task-workflow.md` 残課題テーブル登録行
- `lessons-learned.md` の関連未タスク導線
- links / audit 検証ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` を参照可能
- `.claude/skills/aiworkflow-requirements/SKILL.md` と `indexes/resource-map.md` を参照可能
- `docs/30-workflows/unassigned-task/` と `references/` へ書き込み可能

### 3.2 依存タスク

- `UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001`（完了）
- `UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001`（未実施、関連）

### 3.3 必要な知識

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 3.4 推奨アプローチ

1. `resource-map` で対象仕様を先に固定し、更新漏れを防ぐ。
2. 3workflow再監査は集約表を先に作り、値を一元転記する。
3. `audit` は `scope.currentFiles` と `currentViolations` を合否軸に固定する。
4. 未タスク作成と同時に `task-workflow` / `lessons` を更新し、片側更新を禁止する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                          | 発見経緯                                             | 解決策                                                                | 教訓                                                     |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| 3workflow再監査証跡のドリフト | `verify/validate` を個別転記した際に件数表記が揺れた | `01/02/03` の結果を集約表へ先に固定してから台帳へ転記                 | 複数workflowは「集約してから同期」しないと再現性が落ちる |
| `--target-file` 判定誤読      | baseline表示を見て対象failと誤認した                 | `scope.currentFiles` 一致確認後、`currentViolations=0` のみで合否判定 | `current`（合否）と `baseline`（監視）を必ず分離記録する |
| 仕様抽出の片寄り              | `task-workflow` 更新先行で `lessons` 反映が遅延      | `resource-map -> topic-map -> reference` の順で反映先を先に列挙       | 反映先確定前の編集開始は漏れを誘発する                   |
| 参照整合の後追い              | 本文更新後にリンク検証を忘れやすい                   | `verify-unassigned-links` を完了条件に固定                            | 文書更新はリンク検証込みで完了判定する                   |

---

## 4. 実行手順

### Phase構成

- Phase A: 必須仕様抽出（aiworkflow-requirements）
- Phase B: 未タスク仕様書作成
- Phase C: システム仕様台帳同期
- Phase D: 監査・検証固定

### Phase A: 必須仕様抽出

#### 目的

`aiworkflow-requirements` から今回反映すべき仕様と更新先を先に確定する。

#### 手順

1. `resource-map.md` で対象カテゴリ（task-workflow / lessons）を確定する。
2. `topic-map.md` で更新セクションの位置を特定する。
3. `search-spec.js` で「Phase 12 未タスク 監査 判定軸」を検索して不足参照を補完する。

#### 成果物

- 参照抽出マトリクス

#### 完了条件

- 反映先仕様書と更新理由が列挙されている。

### Phase B: 未タスク仕様書作成

#### 目的

9セクション + 3.5 苦戦箇所を満たした指示書を作成する。

#### 手順

1. 新規未タスクファイルを `docs/30-workflows/unassigned-task/` に作成する。
2. Why/What/How と Phase手順を具体化する。
3. 3.5に親タスクの苦戦箇所を「課題/発見経緯/解決策/教訓」で記録する。

#### 成果物

- 新規未タスク仕様書

#### 完了条件

- `audit-unassigned-tasks --target-file` で current違反0。

### Phase C: システム仕様台帳同期

#### 目的

未タスクをシステム仕様上で追跡可能にする。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本タスクを追加する。
2. `task-workflow.md` 変更履歴へ登録記録を追加する。
3. `lessons-learned.md` に関連未タスク導線を追加する。

#### 成果物

- 更新済み `task-workflow.md` / `lessons-learned.md`

#### 完了条件

- 未タスクIDが台帳と教訓の双方から辿れる。

### Phase D: 監査・検証固定

#### 目的

配置、参照、判定軸の整合を機械的に確定する。

#### 手順

1. `verify-unassigned-links.js` を実行し missing=0 を確認する。
2. `audit-unassigned-tasks.js --json --target-file <本ファイル>` を実行する。
3. `audit-unassigned-tasks.js --json --diff-from HEAD` を実行し current/baseline を分離記録する。

#### 成果物

- links / audit 検証ログ

#### 完了条件

- `missing=0` かつ `currentViolations.total=0`。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 3workflow同時再監査の証跡集約手順が定義されている
- [ ] 未タスク仕様書が9セクション + 3.5構成で作成されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み

### 品質要件

- [ ] `scope.currentFiles` / `currentViolations` / `baselineViolations` の判定軸が明記されている
- [ ] 苦戦箇所が課題/発見経緯/解決策/教訓で記録されている
- [ ] `verify-unassigned-links` で missing=0 を確認している

### ドキュメント要件

- [ ] 本ファイルが `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の変更履歴へ登録されている
- [ ] `lessons-learned.md` に関連未タスク導線が追加されている

---

## 6. 検証方法

### テストケース

- Case 1: 本指示書が必須見出し（メタ情報 + 1〜9）を満たす
- Case 2: `task-workflow` 残課題テーブルから本指示書への参照が解決する
- Case 3: `audit --target-file` で current違反0件

### 検証手順

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Phase 12 3workflow 監査 判定軸" -C 3
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-three-workflow-audit-scope-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                                                                  |
| ------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| 3workflow証跡の値ドリフト | 中     | 中       | workflow単位の個別転記を禁止し、集約表を単一正本にする                |
| 監査結果の誤読            | 高     | 中       | `scope.currentFiles` 一致確認と `currentViolations=0` 固定で合否判定  |
| 仕様書片側更新            | 中     | 中       | `task-workflow` と `lessons` を同一ターンで更新し、レビューで突合する |
| 参照切れ残存              | 中     | 低       | `verify-unassigned-links` を完了条件に組み込み、missing>0 なら差戻し  |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/completed-tasks/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-system-spec-extraction-guard-001.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
タスク仕様書作成skillに従って未タスクを作成し、今回実装に苦戦した箇所を記述すること。
あわせてシステム仕様書スキルの内容を反映し、並列実行可能な工程は分離して実行すること。
```

### 補足事項

- 本タスクは「監査運用の標準化」が主目的であり、機能開発本体は対象外。
- SubAgent分離は仕様書単位（未タスク作成 / 台帳同期 / 教訓同期 / 監査実行）で実施する。
