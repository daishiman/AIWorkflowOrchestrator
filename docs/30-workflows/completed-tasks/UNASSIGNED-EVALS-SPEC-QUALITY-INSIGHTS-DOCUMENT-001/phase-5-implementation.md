# Phase 5: 実装（docs-only読み替え: 正本仕様の update/no-op 実施）

> **docs-only 読み替え**: このタスクはコード変更なし・ドキュメント追記のみのタスクです。
> Phase 5「実装」= aiworkflow-requirements 正本仕様に対する update/no-op 実施と読み替えます。
> ソースコードの変更・新規作成は行いません。

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| Phase        | 5                                                                                   |
| タスクID     | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001                                 |
| タイトル     | qualityInsights 現行定義を2 skillへ整合反映                                         |
| ステータス   | completed                                                                           |
| 作成日       | 2026-04-21                                                                          |
| GitHub Issue | #2327 (CLOSED)                                                                      |
| タスク種別   | docs-only（コード変更なし）                                                         |
| 入力         | `outputs/phase-4/field-list.md`、`manual-check-list.md`、`verification-commands.md` |
| 前Phase      | Phase 4: テスト作成（整合確認スクリプト・チェックリスト作成）                       |
| 次Phase      | Phase 6: テスト拡充（内容整合確認・cross-reference チェック）                       |

---

## 目的

> **2026-04-21 current facts 補正**: Phase 5 の正本更新対象は、旧 flat 構造 7 フィールドの追加ではなく、`taskMetrics.{TASK_ID}` 辞書構造への是正である。実装完了判定は 10 実フィールドと 11 検証ポイントで扱い、詳細は `outputs/phase-5/verification-result.md` を正本とする。

`qualityInsights` 現行11項目について、`task-specification-creator/EVALS.json` と `aiworkflow-requirements/references/evals-schema-spec.md` を突合し、必要なら update、差分がなければ no-op とする。検証の主対象は `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: update/no-op 対象ファイルの確定

**目的**: `qualityInsights` 正本定義の canonical file を確定する

**実行手順**:

1. aiworkflow-requirements の references ディレクトリを調査する

```bash
ls .claude/skills/aiworkflow-requirements/references/
```

2. 評価（eval）関連ファイルを絞り込む

```bash
grep -rln "qualityInsights\|quality_insights\|eval\|評価" \
  .claude/skills/aiworkflow-requirements/references/
```

3. resource-map を確認し、正本ファイルの位置づけを確認する

```bash
grep -A 5 "qualityInsights\|quality" \
  .claude/skills/aiworkflow-requirements/references/resource-map.md
```

4. 候補ファイルを読み込み、追記位置（セクション）を決定する
5. canonical file と update/no-op 判定を `outputs/phase-5/target-file.md` に記録する

**追記先候補（調査後に確定）**:

| 候補ファイル                      | 調査ステータス | 選定理由・除外理由         |
| --------------------------------- | -------------- | -------------------------- |
| `references/evals-schema-spec.md` | 優先確認       | `qualityInsights` 正本候補 |
| `indexes/topic-map.md`            | 補助確認       | 索引導線の確認先           |
| `indexes/quick-reference.md`      | 補助確認       | 発見経路の確認先           |

**完了条件**:

- [ ] canonical file が1つに確定している
- [ ] update/no-op 判定と根拠が記録されている
- [ ] `outputs/phase-5/target-file.md` が作成されている

---

### タスク2: qualityInsights 現行11項目の正本 update/no-op

**目的**: canonical file に対し必要な update のみを適用する

**実行手順**:

1. 追記先ファイルを Read ツールで読み込み、既存のフォーマットを確認する
2. 以下のフィールド定義フォーマットに従って追記セクションを作成する

#### update フォーマット（現行正本に追記が必要な場合のみ）

```markdown
## qualityInsights（拡張メトリクス / writer=手動メンテ）

`qualityInsights.*` は自動計装ではなく手動メンテ対象の品質 KPI 群である。

### フィールド定義

| フィールド                                    | 型       | 意味                          |
| --------------------------------------------- | -------- | ----------------------------- |
| `qualityInsights.patternAdoptionRate`         | number   | parent-skill pattern の採用率 |
| `qualityInsights.coverageTargetHitRate`       | number   | coverage target 達成率        |
| `qualityInsights.unassignedTaskDetectionRate` | number   | 未タスク検出率                |
| `qualityInsights.notes`                       | string   | 運用者メモ                    |
| `qualityInsights.taskMetrics.createdCount`    | number   | 起票タスク数                  |
| `qualityInsights.taskMetrics.completedCount`  | number   | 完了タスク数                  |
| `qualityInsights.taskMetrics.failedCount`     | number   | 失敗タスク数                  |
| `qualityInsights.taskMetrics.retriedCount`    | number   | retry 回数                    |
| `qualityInsights.taskMetrics.cancelRate`      | number   | cancel 率                     |
| `qualityInsights.taskMetrics.blockedCount`    | number   | blocked 件数                  |
| `qualityInsights.taskMetrics.lastUpdated`     | ISO-8601 | 最終更新                      |
```

3. 既存フォーマットとの整合性を確認してから Edit ツールで追記する
4. 追記後に Read ツールで確認し、フォーマット崩れがないことを検証する

**完了条件**:

- [ ] 現行11項目が正本と一致している
- [ ] writer=手動メンテの説明が維持または補強されている
- [ ] 運用ルール節が current facts に整合している
- [ ] 差分がなければ no-op 根拠が記録されている

---

### タスク3: 索引ファイルの update/no-op

**目的**: topic-map と quick-reference の参照導線が current facts に一致しているか確認する

**実行手順**:

1. topic-map を読み込み、評価関連のトピックセクションを特定する

```bash
grep -n "eval\|qualit\|品質\|評価" \
  .claude/skills/aiworkflow-requirements/references/topic-map.md
```

2. topic-map に `qualityInsights` のエントリが不足している場合のみ追記する

追記フォーマット例:

```markdown
- qualityInsights（品質インサイト）: `<正本ファイル名>#qualityInsights-フィールド仕様`
  - 11項目: patternAdoptionRate / coverageTargetHitRate / unassignedTaskDetectionRate /
    notes / taskMetrics.createdCount / completedCount / failedCount / retriedCount /
    cancelRate / blockedCount / lastUpdated
```

3. quick-reference を読み込み、適切な位置に `qualityInsights` エントリを追記する

追記フォーマット例:

```markdown
| qualityInsights | 品質インサイト（11フィールド）| `<正本ファイル名>` |
```

4. 各ファイルの更新後に Read ツールで確認する

**完了条件**:

- [ ] topic-map に `qualityInsights` エントリが存在する
- [ ] quick-reference に `qualityInsights` エントリが存在する
- [ ] 両ファイルのリンク先（正本ファイルへの参照）が正確である

---

### タスク4: validator 導入の検討と記録

**目的**: 将来的なフィールド仕様の整合性を自動検証する validator の必要性を評価し、判断を記録する

**実行手順**:

1. 以下の観点で validator 導入の必要性を評価する

| 評価観点                     | 内容                                                     |
| ---------------------------- | -------------------------------------------------------- |
| フィールド数の規模           | 11フィールドは手動管理可能な範囲か                       |
| 将来の変更頻度               | qualityInsights の仕様変更が頻繁に発生するか             |
| 既存の validator 資産        | 類似フィールドに validator が存在するか                  |
| docs-only タスクとのスコープ | validator 実装はコード変更を伴うため、別タスクとすべきか |

2. 評価結果を以下のいずれかに分類する
   - **導入推奨**: 別タスクとして Issue を作成し、本タスクとリンクする
   - **導入不要**: 手動チェックリストで十分と判断、理由を記録する
   - **保留**: 今後のフィールド変更頻度を観察してから判断する

3. 評価結果と判断根拠を `outputs/phase-5/validator-consideration.md` に記録する

**完了条件**:

- [ ] validator 導入の評価が完了している
- [ ] 判断結果（推奨/不要/保留）と根拠が記録されている
- [ ] 「導入推奨」の場合、別タスクの Issue 番号または作成予定が記録されている

---

### タスク5: 追記内容の完全性検証

**目的**: Phase 4 で定義した手動チェックリストと grep コマンドを使い、追記の完全性を確認する

**実行手順**:

1. `outputs/phase-4/verification-commands.md` のコマンドを実行する
2. 11フィールド全ての grep ヒットを確認する
3. `outputs/phase-4/manual-check-list.md` の全チェック項目を確認する
4. 確認結果を `outputs/phase-5/verification-result.md` に記録する

**期待する grep 結果**:

```
OK: qualityInsights.patternAdoptionRate
OK: qualityInsights.coverageTargetHitRate
OK: qualityInsights.unassignedTaskDetectionRate
OK: qualityInsights.notes
OK: qualityInsights.taskMetrics.createdCount
OK: qualityInsights.taskMetrics.completedCount
OK: qualityInsights.taskMetrics.failedCount
OK: qualityInsights.taskMetrics.retriedCount
OK: qualityInsights.taskMetrics.cancelRate
OK: qualityInsights.taskMetrics.blockedCount
OK: qualityInsights.taskMetrics.lastUpdated
```

MISSING が1件でも出た場合は追記を修正してから次へ進む。

**完了条件**:

- [ ] 11項目全てで "OK" が確認されている（MISSING がない）
- [ ] 手動チェックリストの全項目が完了している
- [ ] `outputs/phase-5/verification-result.md` に検証結果が記録されている

---

## 参照資料

| 参照資料                        | パス                                                                   | 内容                               |
| ------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| フィールド一覧（Phase 4成果物） | `outputs/phase-4/field-list.md`                                        | 11フィールドの確定リスト           |
| 手動検証チェックリスト          | `outputs/phase-4/manual-check-list.md`                                 | 追記完了後の手動確認基準           |
| 検証コマンド集                  | `outputs/phase-4/verification-commands.md`                             | grep/diff による機械的検証コマンド |
| 統合テストシナリオ              | `outputs/phase-4/integration-test-scenarios.md`                        | 全カテゴリの統合テストシナリオ     |
| resource-map                    | `.claude/skills/aiworkflow-requirements/references/resource-map.md`    | リソース全体マップ                 |
| topic-map                       | `.claude/skills/aiworkflow-requirements/references/topic-map.md`       | 仕様トピック索引                   |
| quick-reference                 | `.claude/skills/aiworkflow-requirements/references/quick-reference.md` | クイック参照インデックス           |

---

## 実行手順（Phase 5 全体）

1. タスク1を実行し、追記先ファイルと追記位置を確定する
2. タスク2を実行し、11フィールドを正本に追記する
3. タスク3を実行し、topic-map と quick-reference を更新する
4. タスク4を実行し、validator 導入の検討・記録を完了する
5. タスク5を実行し、追記内容の完全性を検証する
6. 全成果物が `outputs/phase-5/` に揃っていることを確認する

---

## 統合テスト連携

docs-only タスクにおける Phase 5 の統合テスト連携アクション:

- 正本への追記と索引更新を完了させ、Phase 4 で定義した統合テストシナリオ（IT-A-01〜IT-A-04）の実行準備を整える
- grep コマンドによる検証（タスク5）は、統合テストシナリオ カテゴリA の実行に相当する
- topic-map・quick-reference の更新は、統合テストシナリオ カテゴリB（IT-B-01・IT-B-02）の前提条件を満たす
- validator 導入検討（タスク4）の結果は、将来の自動化統合テストの計画として記録される

---

## 多角的チェック観点

| 観点                  | チェック内容                                                                        |
| --------------------- | ----------------------------------------------------------------------------------- |
| 追記の完全性          | 11フィールド全てが正本に存在し、MISSING が発生していないか                          |
| writer/owner の正確性 | 実際のコードベースと整合した writer・owner が記載されているか                       |
| 索引の有効性          | topic-map・quick-reference のリンク先が正本ファイルの実際のセクションを指しているか |
| フォーマット統一      | 追記部分が既存正本のテーブル構造・列名・順序と完全に一致しているか                  |
| docs-only 制約の遵守  | ソースコード・テストコードへの変更が一切発生していないか                            |
| 値域記載の正確性      | 数値スコア8件の値域（0–100）が正確に記載されているか                                |

---

## サブタスク管理

| サブタスクID | 内容                     | ステータス |
| ------------ | ------------------------ | ---------- |
| ST-5-01      | 追記先ファイルの特定     | 未実施     |
| ST-5-02      | 11フィールドの正本追記   | 未実施     |
| ST-5-03      | topic-map 更新           | 未実施     |
| ST-5-04      | quick-reference 更新     | 未実施     |
| ST-5-05      | validator 導入検討・記録 | 未実施     |
| ST-5-06      | 追記内容の完全性検証     | 未実施     |

---

## 成果物

| 成果物                   | パス                                                                   | 内容                                   |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------- |
| 追記先ファイル記録       | `outputs/phase-5/target-file.md`                                       | 追記先ファイルパス・セクション・行番号 |
| 更新済み正本ファイル     | （調査で確定した正本ファイルパス）                                     | qualityInsights 11フィールド追記済み   |
| 更新済み topic-map       | `.claude/skills/aiworkflow-requirements/references/topic-map.md`       | qualityInsights エントリ追記済み       |
| 更新済み quick-reference | `.claude/skills/aiworkflow-requirements/references/quick-reference.md` | qualityInsights エントリ追記済み       |
| validator 導入検討記録   | `outputs/phase-5/validator-consideration.md`                           | 評価結果と判断根拠                     |
| 完全性検証結果           | `outputs/phase-5/verification-result.md`                               | grep 実行結果・手動チェック完了記録    |

---

## 完了条件

- [ ] 追記先ファイルが確定し `outputs/phase-5/target-file.md` に記録されている
- [ ] 11フィールド全てが正本に追記されている（grep 全件 OK 確認済み）
- [ ] 各フィールドに writer・owner（運用責任）・更新タイミングが明記されている
- [ ] topic-map に `qualityInsights` エントリが追記されている
- [ ] quick-reference に `qualityInsights` エントリが追記されている
- [ ] `outputs/phase-5/validator-consideration.md` が作成されている
- [ ] `outputs/phase-5/verification-result.md` が作成されている（MISSING なし確認）
- [ ] ソースコード・テストコードへの変更が一切発生していない（git diff で確認）

---

## タスク100%実行確認【必須】

- [ ] タスク1〜5 が全て完了している
- [ ] 11フィールド全てで grep OK が確認されている
- [ ] topic-map・quick-reference の更新が完了している
- [ ] validator 導入の判断が記録されている
- [ ] `git diff` で docs ファイル以外への変更がないことを確認した
- [ ] 成果物が `outputs/phase-5/` に全て格納されていることを確認した

---

## 次Phase

Phase 6（テスト拡充: docs-only 読み替え = 内容整合確認・cross-reference チェック）へ進む。
`outputs/phase-5/` の成果物と更新済み正本ファイルを入力として使用する。

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-6-test-expansion.md`
