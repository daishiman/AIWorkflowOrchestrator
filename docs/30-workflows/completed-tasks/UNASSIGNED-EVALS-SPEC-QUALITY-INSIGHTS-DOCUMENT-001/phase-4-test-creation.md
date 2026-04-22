# Phase 4: テスト作成（docs-only: 整合確認スクリプト・チェックリスト作成）

> **docs-only 読み替え**: このタスクはコード変更なし・ドキュメント追記のみのタスクです。
> Phase 4「テスト作成」= 整合確認スクリプト・手動検証チェックリストの作成 と読み替えます。
> テストコードの新規作成は行いません。

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| Phase        | 4                                                        |
| タスクID     | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001      |
| タイトル     | qualityInsights 現行定義を2 skillへ整合反映              |
| ステータス   | completed                                                |
| 作成日       | 2026-04-21                                               |
| GitHub Issue | #2327 (CLOSED)                                           |
| タスク種別   | docs-only（コード変更なし）                              |
| 入力         | Phase 3 設計レビュー結果、qualityInsights フィールド一覧 |
| 前Phase      | Phase 3: 設計レビュー                                    |
| 次Phase      | Phase 5: 実装（正本への追記）                            |

---

## 目的

> **2026-04-21 current facts 補正**: 実際の `qualityInsights` は 10 実フィールド（4スカラー + `taskMetrics` + 5サブフィールド）で管理される。検証時の `PASS=11` は `TASK_ID` プレースホルダを含む 11 検証ポイントを指す。旧 flat 構造 (`createdCount` など) は削除対象であり、`outputs/phase-4/field-list.md` と `outputs/phase-4/manual-check-list.md` を正本とする。

docs-only タスクにおける「テスト」として、以下を達成する。

1. `qualityInsights` 現行11項目の update/no-op 後に整合性を確認するための検証手順を定義する
2. 手動検証チェックリストを作成し、追記漏れ・記述ミスを検出できる体制を整える
3. grep/diff コマンドによる機械的検証手順を定義し、Phase 6 での cross-reference チェックに活用する
4. 統合テストシナリオを全カテゴリで作成し、後続 Phase での確認基準を明確にする

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: qualityInsights 現行11項目の確定

**目的**: 追記対象フィールドの正確な名称・型・役割を確定する

**実行手順**:

1. `references/` 配下の評価関連ファイルを調査し、`qualityInsights.*` フィールドの定義を収集する
   - grep コマンド例: `grep -rn "qualityInsights" .claude/skills/aiworkflow-requirements/references/`
2. 以下の11項目が全て確認できることを照合する

| フィールド名                                  | 型         | 役割（暫定）                           |
| --------------------------------------------- | ---------- | -------------------------------------- |
| `qualityInsights.patternAdoptionRate`         | `number`   | parent-skill pattern の採用率          |
| `qualityInsights.coverageTargetHitRate`       | `number`   | coverage target 達成率                 |
| `qualityInsights.unassignedTaskDetectionRate` | `number`   | 未タスク検出率                         |
| `qualityInsights.notes`                       | `string`   | 運用者メモ                             |
| `qualityInsights.taskMetrics.createdCount`    | `number`   | 起票タスク数                           |
| `qualityInsights.taskMetrics.completedCount`  | `number`   | 完了タスク数                           |
| `qualityInsights.taskMetrics.failedCount`     | `number`   | 失敗タスク数                           |
| `qualityInsights.taskMetrics.retriedCount`    | `number`   | retry 回数                             |
| `qualityInsights.taskMetrics.cancelRate`      | `number`   | cancel 率                              |
| `qualityInsights.taskMetrics.blockedCount`    | `number`   | blocked 件数                           |
| `qualityInsights.taskMetrics.lastUpdated`     | `ISO-8601` | qualityInsights taskMetrics の最終更新 |

3. 確定した一覧を `outputs/phase-4/field-list.md` として記録する

**完了条件**:

- [ ] 11項目全てが確認・記録されている
- [ ] 各フィールドの型・役割が暫定ではなく確定値として記載されている

---

### タスク2: 手動検証チェックリストの作成

**目的**: Phase 5 の追記作業完了後に実施する手動確認の基準を作成する

**実行手順**:

1. 以下の検証観点に基づいてチェックリストを作成する

#### 追記内容の完全性確認

- [ ] `qualityInsights.patternAdoptionRate` の定義が正本に存在する
- [ ] `qualityInsights.coverageTargetHitRate` の定義が正本に存在する
- [ ] `qualityInsights.unassignedTaskDetectionRate` の定義が正本に存在する
- [ ] `qualityInsights.notes` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.createdCount` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.completedCount` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.failedCount` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.retriedCount` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.cancelRate` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.blockedCount` の定義が正本に存在する
- [ ] `qualityInsights.taskMetrics.lastUpdated` の定義が正本に存在する

#### フィールド定義品質の確認

- [ ] 各フィールドに writer（書き込みコンポーネント）が明記されている
- [ ] 各フィールドに運用責任者（owner）が明記されている
- [ ] 各フィールドに更新タイミングが明記されている
- [ ] 型定義が TypeScript 表記で統一されている
- [ ] 数値スコアフィールドには値域（例: 0–100）が記載されている

#### 記述スタイルの統一確認

- [ ] 既存の正本フォーマットと整合している
- [ ] セクション見出しレベルが既存と一致している
- [ ] テーブル形式が既存と一致している（列名・順序）

2. 作成したチェックリストを `outputs/phase-4/manual-check-list.md` として記録する

**完了条件**:

- [ ] 11項目分の完全性チェック項目が作成されている
- [ ] フィールド定義品質チェック項目が作成されている
- [ ] 記述スタイル統一チェック項目が作成されている

---

### タスク3: grep/diff コマンドによる検証手順の定義

**目的**: 追記後の機械的検証を可能にするコマンド群を定義する

**実行手順**:

1. 以下の grep/diff コマンド群を定義し、`outputs/phase-4/verification-commands.md` に記録する

#### フィールド存在確認コマンド

```bash
# qualityInsights 現行11項目が正本に存在するか確認
FIELDS=(
  "qualityInsights.patternAdoptionRate"
  "qualityInsights.coverageTargetHitRate"
  "qualityInsights.unassignedTaskDetectionRate"
  "qualityInsights.notes"
  "qualityInsights.taskMetrics.createdCount"
  "qualityInsights.taskMetrics.completedCount"
  "qualityInsights.taskMetrics.failedCount"
  "qualityInsights.taskMetrics.retriedCount"
  "qualityInsights.taskMetrics.cancelRate"
  "qualityInsights.taskMetrics.blockedCount"
  "qualityInsights.taskMetrics.lastUpdated"
)

TARGET_FILE=".claude/skills/aiworkflow-requirements/references/evals-schema-spec.md"

for field in "${FIELDS[@]}"; do
  if grep -q "$field" "$TARGET_FILE"; then
    echo "OK: $field"
  else
    echo "MISSING: $field"
  fi
done
```

#### writer・運用責任の記載確認コマンド

```bash
# writer および owner が記載されているか確認
grep -n "writer\|owner\|運用責任\|更新タイミング" "$TARGET_FILE"
```

#### 差分確認コマンド（追記前後の比較）

```bash
# Phase 5 実施前後の diff を記録
git diff HEAD -- "$TARGET_FILE" > outputs/phase-5/diff-result.md
```

#### 型定義整合確認コマンド

```bash
# 数値フィールドと timestamp の記載が存在するか確認
grep -A 3 "qualityInsights\\." "$TARGET_FILE" | grep -E "number|ISO-8601|手動メンテ"
```

2. 各コマンドに実行タイミング（Phase 5 完了後・Phase 6 cross-reference チェック時）を明記する

**完了条件**:

- [ ] 11項目の存在確認コマンドが定義されている
- [ ] writer/owner 記載確認コマンドが定義されている
- [ ] 差分確認コマンドが定義されている
- [ ] 型定義整合確認コマンドが定義されている

---

### タスク4: 統合テストシナリオの作成（全カテゴリ）

**目的**: docs-only タスクの統合テストシナリオを全カテゴリで作成し、Phase 6 以降の確認基準を確立する

**実行手順**:

1. 以下のカテゴリ別に統合テストシナリオを作成する

#### カテゴリA: 正本完全性シナリオ

| シナリオID | 確認内容                                | 期待結果               |
| ---------- | --------------------------------------- | ---------------------- |
| IT-A-01    | 正本に11項目全てが記載されている        | 11件全て grep でヒット |
| IT-A-02    | writer が手動メンテとして明記されている | writer 記述が存在する  |
| IT-A-03    | 運用ルールが記載されている              | 運用ルール節が存在する |
| IT-A-04    | taskMetrics 配下 7 項目が網羅されている | 7件全て grep でヒット  |

#### カテゴリB: cross-reference 整合シナリオ

| シナリオID | 確認内容                                              | 期待結果                       |
| ---------- | ----------------------------------------------------- | ------------------------------ |
| IT-B-01    | topic-map に qualityInsights エントリが存在する       | topic-map で grep ヒット       |
| IT-B-02    | quick-reference に qualityInsights エントリが存在する | quick-reference で grep ヒット |
| IT-B-03    | 関連仕様書（eval系）との記述に矛盾がない              | 手動照合で矛盾なし             |
| IT-B-04    | int-test-skill への波及確認が完了している             | 波及確認チェックリストが完了   |

#### カテゴリC: フォーマット統一シナリオ

| シナリオID | 確認内容                                     | 期待結果                 |
| ---------- | -------------------------------------------- | ------------------------ |
| IT-C-01    | 追記部分のセクション構造が既存正本と一致する | 目視確認で構造一致       |
| IT-C-02    | テーブル列名・順序が既存正本と一致する       | 目視確認で列名・順序一致 |
| IT-C-03    | 数値スコアフィールドに値域記載がある         | grep で値域記述がヒット  |

2. 作成したシナリオを `outputs/phase-4/integration-test-scenarios.md` として記録する

**完了条件**:

- [ ] カテゴリA（正本完全性）シナリオが全件作成されている
- [ ] カテゴリB（cross-reference 整合）シナリオが全件作成されている
- [ ] カテゴリC（フォーマット統一）シナリオが全件作成されている

---

## 参照資料

| 参照資料               | パス                                                                   | 内容                             |
| ---------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| 評価関連仕様（参照元） | `.claude/skills/aiworkflow-requirements/references/`                   | qualityInsights フィールド定義元 |
| topic-map              | `.claude/skills/aiworkflow-requirements/references/topic-map.md`       | 仕様トピック索引                 |
| quick-reference        | `.claude/skills/aiworkflow-requirements/references/quick-reference.md` | クイック参照インデックス         |
| resource-map           | `.claude/skills/aiworkflow-requirements/references/resource-map.md`    | リソース全体マップ               |

---

## 実行手順（Phase 4 全体）

1. タスク1を実行し、`field-list.md` を作成する
2. タスク2を実行し、`manual-check-list.md` を作成する
3. タスク3を実行し、`verification-commands.md` を作成する
4. タスク4を実行し、`integration-test-scenarios.md` を作成する
5. 各成果物が `outputs/phase-4/` に揃っていることを確認する
6. Phase 5 への引き継ぎ事項を整理する

---

## 統合テスト連携

docs-only タスクにおける Phase 4 の統合テスト連携アクション:

- 統合テストシナリオ（IT-A-01〜IT-C-03）を全カテゴリで作成し、Phase 6 の cross-reference チェックの判定基準として機能させる
- grep/diff コマンド群を定義し、Phase 5 完了後の機械的検証に使用できる状態にする
- 手動検証チェックリストを Phase 5 実施者へ引き継ぎ、追記作業の品質担保に活用する

---

## 多角的チェック観点

| 観点                     | チェック内容                                                      |
| ------------------------ | ----------------------------------------------------------------- |
| フィールド網羅性         | 11フィールド全てがチェックリスト・シナリオに含まれているか        |
| 検証コマンドの実行可能性 | 定義した grep コマンドが実際に動作するか（パス・構文の正確性）    |
| writer/owner の明確性    | 各フィールドの書き込み主体と運用責任者が特定できているか          |
| シナリオの独立性         | 各統合テストシナリオが他に依存せず独立して実行できるか            |
| フォーマット整合性       | チェックリスト・シナリオが既存 Phase 4 成果物の形式と揃っているか |

---

## サブタスク管理

| サブタスクID | 内容                                 | ステータス |
| ------------ | ------------------------------------ | ---------- |
| ST-4-01      | qualityInsights 11フィールド一覧確定 | 未実施     |
| ST-4-02      | 手動検証チェックリスト作成           | 未実施     |
| ST-4-03      | grep/diff 検証コマンド群定義         | 未実施     |
| ST-4-04      | 統合テストシナリオ全カテゴリ作成     | 未実施     |

---

## 成果物

| 成果物                 | パス                                            | 内容                                        |
| ---------------------- | ----------------------------------------------- | ------------------------------------------- |
| フィールド一覧         | `outputs/phase-4/field-list.md`                 | 11フィールドの名称・型・役割の確定リスト    |
| 手動検証チェックリスト | `outputs/phase-4/manual-check-list.md`          | 追記完了後の手動確認基準                    |
| 検証コマンド集         | `outputs/phase-4/verification-commands.md`      | grep/diff による機械的検証コマンド群        |
| 統合テストシナリオ     | `outputs/phase-4/integration-test-scenarios.md` | 全カテゴリ（A/B/C）の統合テストシナリオ一覧 |

---

## 完了条件

- [ ] `outputs/phase-4/field-list.md` が作成されている（11フィールド確定）
- [ ] `outputs/phase-4/manual-check-list.md` が作成されている（全チェック項目）
- [ ] `outputs/phase-4/verification-commands.md` が作成されている（全コマンド定義）
- [ ] `outputs/phase-4/integration-test-scenarios.md` が作成されている（全カテゴリ）
- [ ] 新規コードファイルを作成していない（docs-only タスクの制約遵守）

---

## タスク100%実行確認【必須】

- [ ] タスク1〜4 が全て完了している
- [ ] 11フィールド全てがチェックリストとシナリオに含まれている
- [ ] grep コマンドの構文が正確で実行可能な状態になっている
- [ ] 統合テストシナリオがカテゴリA・B・C の全件で作成されている
- [ ] 成果物が `outputs/phase-4/` に全て格納されていることを確認した
- [ ] コード変更を一切行っていないことを確認した

---

## 次Phase

Phase 5（実装: docs-only 読み替え = 正本仕様ファイルへの qualityInsights 11フィールド追記）へ進む。
`outputs/phase-4/field-list.md`・`manual-check-list.md`・`verification-commands.md` を入力として使用する。

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-5-implementation.md`
