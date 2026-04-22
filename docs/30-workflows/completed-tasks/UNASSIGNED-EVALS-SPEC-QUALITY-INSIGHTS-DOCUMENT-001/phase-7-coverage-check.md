# Phase 7: カバレッジ確認（docs-only読み替え: インデックス網羅確認）

> **docs-only 読み替え**: このタスクはコード変更なし・ドキュメント追記のみのタスクです。
> Phase 7「カバレッジ確認」= topic-map / quick-reference のインデックス網羅確認 と読み替えます。
> コードカバレッジ計測は行いません。

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| Phase        | 7                                                                 |
| タスクID     | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001               |
| タイトル     | qualityInsights 現行定義を2 skillへ整合反映                       |
| ステータス   | completed                                                         |
| 作成日       | 2026-04-21                                                        |
| GitHub Issue | #2327 (CLOSED)                                                    |
| タスク種別   | docs-only（コード変更なし）                                       |
| 入力         | `outputs/phase-6/` 成果物一式、更新済み正本ファイル・索引ファイル |
| 前Phase      | Phase 6: テスト拡充（内容整合確認・cross-reference チェック）     |
| 次Phase      | Phase 8: リファクタリング                                         |

---

## 目的

> **2026-04-21 current facts 補正**: Phase 7 の網羅確認は、10 実フィールドが正本に記載されていることと、`TASK_ID` を含む 11 検証ポイントが grep/索引で到達可能であることを確認する。旧 flat 構造フィールドを探す手順は obsolete であり、`outputs/phase-7/*.md` を正本とする。

`qualityInsights.*` 11フィールドの正本追記・索引更新が完全に網羅されていることを最終確認する。
具体的には以下を達成する。

1. topic-map・quick-reference が 11フィールドを余すことなく参照しているかを確認する
2. qualityInsights 全 11フィールドが正本に追記されているか最終確認する
3. resource-map が正本ファイルの追記内容を反映しているか確認し、不足がある場合のみ更新する
4. 統合テストシナリオ カテゴリA・C の再実行とゲート判定を行い、本タスクの完了基準を満たしていることを証明する

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: topic-map の網羅性確認

**目的**: topic-map が `qualityInsights` 11フィールドを余すことなく参照しているかを確認する

**実行手順**:

1. topic-map を読み込み、`qualityInsights` セクションを特定する

```bash
grep -n "qualityInsights" \
  .claude/skills/aiworkflow-requirements/references/topic-map.md
```

2. 以下の網羅確認チェックリストを実行する

| 確認項目                                                       | 確認方法            | 結果   |
| -------------------------------------------------------------- | ------------------- | ------ |
| `qualityInsights.patternAdoptionRate` が言及されている         | grep または目視確認 | 未確認 |
| `qualityInsights.coverageTargetHitRate` が言及されている       | grep または目視確認 | 未確認 |
| `qualityInsights.unassignedTaskDetectionRate` が言及されている | grep または目視確認 | 未確認 |
| `qualityInsights.notes` が言及されている                       | grep または目視確認 | 未確認 |
| `qualityInsights.taskMetrics.createdCount` が言及されている    | grep または目視確認 | 未確認 |
| `qualityInsights.taskMetrics.completedCount` が言及されている  | grep または目視確認 | 未確認 |
| `qualityInsights.taskMetrics.failedCount` が言及されている     | grep または目視確認 | 未確認 |
| `qualityInsights.taskMetrics.retriedCount` が言及されている    | grep または目視確認 | 未確認 |
| `qualityInsights.taskMetrics.cancelRate` が言及されている      | grep または目視確認 | 未確認 |
| `qualityInsights.taskMetrics.blockedCount` が言及されている    | grep または目視確認 | 未確認 |
| `qualityInsights.taskMetrics.lastUpdated` が言及されている     | grep または目視確認 | 未確認 |

3. 言及が不足しているフィールドがある場合は topic-map を補完する
4. 確認結果を `outputs/phase-7/topic-map-coverage.md` に記録する

**網羅率の算出**:

```
topic-map 網羅率 = 言及済みフィールド数 / 11 × 100
目標: 100%（11 / 11）
```

**完了条件**:

- [ ] 11フィールド全てが topic-map で言及されていることを確認した
- [ ] 網羅率が 100% である（または補完後に 100% になった）
- [ ] `outputs/phase-7/topic-map-coverage.md` が作成されている

---

### タスク2: quick-reference の網羅性確認

**目的**: quick-reference が `qualityInsights` の参照として機能しているか、かつ網羅的かを確認する

**実行手順**:

1. quick-reference を読み込み、`qualityInsights` エントリを特定する

```bash
grep -n "qualityInsights" \
  .claude/skills/aiworkflow-requirements/references/quick-reference.md
```

2. 以下の観点で網羅性を確認する

| 確認観点                             | 期待する状態                                           |
| ------------------------------------ | ------------------------------------------------------ |
| `qualityInsights` エントリが存在する | 1件以上 grep でヒットする                              |
| 正本ファイルへの参照が含まれている   | リンクまたはファイル名が記載されている                 |
| 11フィールドへのアクセス導線がある   | エントリから正本のフィールド定義セクションへ到達できる |
| 検索キーワードとして十分な情報がある | 「品質インサイト」「qualityInsights」両方で検索できる  |

3. 不足している場合は quick-reference を補完する
4. 確認結果を `outputs/phase-7/quick-reference-coverage.md` に記録する

**完了条件**:

- [ ] quick-reference に `qualityInsights` エントリが存在することを確認した
- [ ] 正本ファイルへの参照が正確であることを確認した
- [ ] 11フィールドへのアクセス導線が確保されていることを確認した
- [ ] `outputs/phase-7/quick-reference-coverage.md` が作成されている

---

### タスク3: qualityInsights 全 11フィールドの正本追記最終確認

**目的**: 正本ファイルに 11フィールド全てが追記されているかを最終確認し、本タスクの主目標達成を証明する

**実行手順**:

1. Phase 5 で確定した正本ファイルを読み込む
2. 以下の最終確認スクリプトを実行する

```bash
TARGET_FILE="<Phase 5 で確定した正本ファイルパス>"

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

PASS=0
FAIL=0

for field in "${FIELDS[@]}"; do
  if grep -q "$field" "$TARGET_FILE"; then
    echo "PASS: $field"
    ((PASS++))
  else
    echo "FAIL: $field"
    ((FAIL++))
  fi
done

echo ""
echo "結果: PASS=$PASS / FAIL=$FAIL / 合計=11"
echo "網羅率: $((PASS * 100 / 11))%"
```

3. 期待する実行結果

```
PASS: qualityInsights.patternAdoptionRate
PASS: qualityInsights.coverageTargetHitRate
PASS: qualityInsights.unassignedTaskDetectionRate
PASS: qualityInsights.notes
PASS: qualityInsights.taskMetrics.createdCount
PASS: qualityInsights.taskMetrics.completedCount
PASS: qualityInsights.taskMetrics.failedCount
PASS: qualityInsights.taskMetrics.retriedCount
PASS: qualityInsights.taskMetrics.cancelRate
PASS: qualityInsights.taskMetrics.blockedCount
PASS: qualityInsights.taskMetrics.lastUpdated

結果: PASS=11 / FAIL=0 / 合計=11
網羅率: 100%
```

4. FAIL が 1件でもある場合は正本への追記を修正し、再実行で 100% を達成してから先へ進む
5. 実行結果を `outputs/phase-7/final-field-verification.md` に記録する

**完了条件**:

- [ ] スクリプトを実行し、PASS=11 / FAIL=0 / 網羅率=100% を確認した
- [ ] `outputs/phase-7/final-field-verification.md` に実行結果が記録されている

---

### タスク4: resource-map の更新確認

**目的**: resource-map が追記済み正本ファイルの情報を反映しているか確認し、不足がある場合のみ更新する

**実行手順**:

1. resource-map を読み込み、正本ファイルのエントリを確認する

```bash
grep -n "qualityInsights\|<正本ファイル名>" \
  .claude/skills/aiworkflow-requirements/references/resource-map.md
```

2. 以下の観点で resource-map の状態を確認する

| 確認観点                                         | 期待する状態                                                    |
| ------------------------------------------------ | --------------------------------------------------------------- |
| 正本ファイルが resource-map に登録されている     | 正本ファイルのエントリが存在する                                |
| `qualityInsights` 関連のキーワードが含まれている | エントリに「qualityInsights」または「品質インサイト」が含まれる |
| ファイルの役割・位置づけが明記されている         | 正本・インターフェース定義などの区分が記載されている            |

3. 更新が必要な場合は resource-map を修正する

更新フォーマット例:

```markdown
| `<正本ファイル名>` | 正本 | qualityInsights 11フィールド定義を含む評価仕様 |
```

4. 確認・更新結果を `outputs/phase-7/resource-map-check.md` に記録する

**完了条件**:

- [ ] resource-map の調査が完了している
- [ ] 更新が必要な場合は更新が完了している
- [ ] `outputs/phase-7/resource-map-check.md` が作成されている

---

### タスク5: 統合テスト再実行とゲート判定

**目的**: Phase 4 で定義した統合テストシナリオの全カテゴリ（A・B・C）を再実行し、ゲート判定を行う

**実行手順**:

1. `outputs/phase-4/integration-test-scenarios.md` の全シナリオを確認する
2. カテゴリA（正本完全性）を再実行する

| シナリオID | 確認内容                                     | 確認方法                          | 結果   |
| ---------- | -------------------------------------------- | --------------------------------- | ------ |
| IT-A-01    | 正本に11フィールド全てが追記されている       | タスク3のスクリプト結果を参照     | 未実施 |
| IT-A-02    | 各フィールドに writer が明記されている       | grep で writer 行を11件確認       | 未実施 |
| IT-A-03    | 各フィールドに owner が明記されている        | grep で owner 行を11件確認        | 未実施 |
| IT-A-04    | 各フィールドに更新タイミングが明記されている | grep で更新タイミング行を11件確認 | 未実施 |

3. カテゴリB（cross-reference 整合）を再実行する（Phase 6 の結果を参照）

| シナリオID | 確認内容                                              | 確認方法                    | 結果   |
| ---------- | ----------------------------------------------------- | --------------------------- | ------ |
| IT-B-01    | topic-map に qualityInsights エントリが存在する       | タスク1の結果を参照         | 未実施 |
| IT-B-02    | quick-reference に qualityInsights エントリが存在する | タスク2の結果を参照         | 未実施 |
| IT-B-03    | 関連仕様書（eval系）との記述に矛盾がない              | Phase 6 タスク1の結果を参照 | 未実施 |
| IT-B-04    | int-test-skill への波及確認が完了している             | Phase 6 タスク2の結果を参照 | 未実施 |

4. カテゴリC（フォーマット統一）を再実行する

| シナリオID | 確認内容                                     | 確認方法                  | 結果   |
| ---------- | -------------------------------------------- | ------------------------- | ------ |
| IT-C-01    | 追記部分のセクション構造が既存正本と一致する | 正本を Read して目視確認  | 未実施 |
| IT-C-02    | テーブル列名・順序が既存正本と一致する       | 正本を Read して目視確認  | 未実施 |
| IT-C-03    | 数値スコアフィールドに値域記載がある         | grep で「0–100」を8件確認 | 未実施 |

5. ゲート判定を実施する

| ゲート                    | 条件                       | 判定   | 次のアクション               |
| ------------------------- | -------------------------- | ------ | ---------------------------- |
| カテゴリA 全件 PASS       | IT-A-01〜IT-A-04 全て PASS | 未判定 | PASS → Phase 8 へ進む        |
| カテゴリB 全件 PASS       | IT-B-01〜IT-B-04 全て PASS | 未判定 | PASS → Phase 8 へ進む        |
| カテゴリC 全件 PASS       | IT-C-01〜IT-C-03 全て PASS | 未判定 | PASS → Phase 8 へ進む        |
| いずれかのカテゴリで FAIL | 1件でも FAIL がある        | 未判定 | FAIL → 対応する Phase へ戻る |

6. 全カテゴリ PASS の場合、`outputs/phase-7/gate-decision.md` に「進行可」を記録する
7. FAIL がある場合は対応する Phase（カテゴリA → Phase 5、カテゴリB → Phase 6、カテゴリC → Phase 5）へ戻る

**完了条件**:

- [ ] カテゴリA（IT-A-01〜IT-A-04）が全件 PASS している
- [ ] カテゴリB（IT-B-01〜IT-B-04）が全件 PASS している
- [ ] カテゴリC（IT-C-01〜IT-C-03）が全件 PASS している
- [ ] `outputs/phase-7/gate-decision.md` にゲート判定結果が記録されている

---

## 参照資料

| 参照資料                 | パス                                                                   | 内容                                 |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------ |
| Phase 6 成果物一式       | `outputs/phase-6/`                                                     | cross-reference・波及確認の実施記録  |
| 統合テストシナリオ       | `outputs/phase-4/integration-test-scenarios.md`                        | 全カテゴリ（A/B/C）のシナリオ定義    |
| フィールド最終確認結果   | `outputs/phase-5/verification-result.md`                               | Phase 5 での grep 検証結果           |
| 正本ファイル（追記済み） | （Phase 5 タスク1で確定したファイルパス）                              | qualityInsights 11フィールド追記済み |
| topic-map                | `.claude/skills/aiworkflow-requirements/references/topic-map.md`       | 仕様トピック索引                     |
| quick-reference          | `.claude/skills/aiworkflow-requirements/references/quick-reference.md` | クイック参照インデックス             |
| resource-map             | `.claude/skills/aiworkflow-requirements/references/resource-map.md`    | リソース全体マップ                   |

---

## 実行手順（Phase 7 全体）

1. タスク1を実行し、topic-map の網羅性を確認する（網羅率 100% を目標）
2. タスク2を実行し、quick-reference の網羅性を確認する
3. タスク3を実行し、正本の 11フィールド追記を最終確認する（PASS=11 / FAIL=0）
4. タスク4を実行し、resource-map の更新確認・補完を行う
5. タスク5を実行し、統合テスト全カテゴリを再実行してゲート判定を行う
6. 全成果物が `outputs/phase-7/` に揃っていることを確認する

---

## 統合テスト連携

docs-only タスクにおける Phase 7 の統合テスト連携アクション:

- 統合テストシナリオ カテゴリA・B・C を全件再実行し、ゲート判定を行うことで本タスクの完了基準を定量的に証明する
- 索引（topic-map / quick-reference / resource-map）の網羅確認により、将来の仕様参照者が `qualityInsights` フィールドに確実にアクセスできる状態を保証する
- ゲート判定が「進行可」の場合のみ Phase 8 へ進む。FAIL があった場合は対応 Phase へ戻り修正する

---

## 多角的チェック観点

| 観点                       | チェック内容                                                               |
| -------------------------- | -------------------------------------------------------------------------- |
| 索引の完全性               | topic-map・quick-reference・resource-map の3つ全てが更新されているか       |
| 11フィールドの最終網羅確認 | スクリプト実行で PASS=11 / FAIL=0 が証明されているか                       |
| ゲート判定の客観性         | 「進行可」判断がシナリオ実行結果に基づいており、主観判断になっていないか   |
| アクセス導線の有効性       | 索引から正本フィールド定義へ実際にたどり着けるか（リンクの実在確認）       |
| docs-only 制約の最終確認   | Phase 4〜7 を通じてコード変更が一切発生していないか（git diff で確認）     |
| 将来の保守性               | フィールドが追加・変更された場合に索引更新が必要な箇所が明確になっているか |

---

## サブタスク管理

| サブタスクID | 内容                                        | ステータス |
| ------------ | ------------------------------------------- | ---------- |
| ST-7-01      | topic-map の網羅性確認（網羅率算出）        | 未実施     |
| ST-7-02      | quick-reference の網羅性確認                | 未実施     |
| ST-7-03      | 正本 11フィールド最終確認（スクリプト実行） | 未実施     |
| ST-7-04      | resource-map の更新確認・補完               | 未実施     |
| ST-7-05      | 統合テスト全カテゴリ再実行・ゲート判定      | 未実施     |

---

## ゲート判定

| 判定基準                     | 条件                     | 次のアクション               |
| ---------------------------- | ------------------------ | ---------------------------- |
| 正本の網羅率が 100%          | PASS=11 / FAIL=0         | Phase 8 へ進む               |
| 正本の網羅率が 100% 未満     | FAIL が 1件以上          | Phase 5 へ戻り追記を補完する |
| topic-map 網羅率が 100%      | 11フィールド全て言及済み | Phase 8 へ進む               |
| topic-map 網羅率が 100% 未満 | 言及が不足               | topic-map を補完し再確認する |
| 統合テスト全カテゴリ PASS    | A・B・C 全件 PASS        | Phase 8 へ進む（進行可）     |
| 統合テストにいずれかの FAIL  | 1件でも FAIL             | 対応 Phase へ戻る            |

---

## 成果物

| 成果物                       | パス                                          | 内容                                   |
| ---------------------------- | --------------------------------------------- | -------------------------------------- |
| topic-map 網羅確認記録       | `outputs/phase-7/topic-map-coverage.md`       | 11フィールドの言及状況・網羅率         |
| quick-reference 網羅確認記録 | `outputs/phase-7/quick-reference-coverage.md` | エントリの存在・参照の正確性確認結果   |
| 正本フィールド最終確認記録   | `outputs/phase-7/final-field-verification.md` | スクリプト実行結果（PASS=11 / FAIL=0） |
| resource-map 確認・更新記録  | `outputs/phase-7/resource-map-check.md`       | resource-map の調査・更新内容          |
| ゲート判定記録               | `outputs/phase-7/gate-decision.md`            | 全カテゴリ PASS・進行可の判定結果      |

---

## 完了条件

- [ ] topic-map の網羅率が 100%（11フィールド全て言及済み）
- [ ] quick-reference の `qualityInsights` エントリが正確であることを確認した
- [ ] 正本の最終確認スクリプトで PASS=11 / FAIL=0 を確認した
- [ ] resource-map の確認・必要に応じた更新が完了した
- [ ] 統合テスト全カテゴリ（A・B・C）が全件 PASS し、ゲート判定「進行可」が記録された
- [ ] 全成果物が `outputs/phase-7/` に格納されている
- [ ] コード変更が一切発生していないことを最終確認した（git diff で確認）

---

## タスク100%実行確認【必須】

- [ ] タスク1〜5 が全て完了している
- [ ] 正本の網羅率・topic-map の網羅率がともに 100% であることを確認した
- [ ] 統合テストシナリオ カテゴリA・B・C が全件 PASS している
- [ ] ゲート判定が「進行可」であり `outputs/phase-7/gate-decision.md` に記録されている
- [ ] 成果物が `outputs/phase-7/` に全て格納されていることを確認した
- [ ] Phase 4〜7 を通じてコード変更が一切発生していないことを `git diff` で確認した

---

## 次Phase

Phase 8（リファクタリング）へ進む。
ゲート判定が「進行可」（全カテゴリ PASS）であることを前提とする。

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-8-refactoring.md`
