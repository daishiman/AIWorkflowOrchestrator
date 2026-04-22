# Phase 6: テスト拡充（docs-only読み替え: 内容整合確認・cross-referenceチェック）

> **docs-only 読み替え**: このタスクはコード変更なし・ドキュメント追記のみのタスクです。
> Phase 6「テスト拡充」= 追記内容の内容整合確認・関連仕様書との cross-reference チェック と読み替えます。
> テストコードの追加・拡充は行いません。

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| Phase        | 6                                                   |
| タスクID     | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| タイトル     | qualityInsights 現行定義を2 skillへ整合反映         |
| ステータス   | completed                                           |
| 作成日       | 2026-04-21                                          |
| GitHub Issue | #2327 (CLOSED)                                      |
| タスク種別   | docs-only（コード変更なし）                         |
| 入力         | `outputs/phase-5/` 成果物一式、更新済み正本ファイル |
| 前Phase      | Phase 5: 実装（正本への追記と索引更新）             |
| 次Phase      | Phase 7: カバレッジ確認（インデックス網羅確認）     |

---

## 目的

> **2026-04-21 current facts 補正**: cross-reference の確認対象は 10 実フィールド定義と、検索導線上の 11 検証ポイントである。`quick-reference` / `topic-map` / `completed ledger` の同期結果を優先して参照する。

Phase 5 で正本に追記した `qualityInsights.*` 11フィールドの記述が、関連仕様書群と整合していることを確認する。
具体的には以下を達成する。

1. 追記内容と関連仕様書（eval 系・インターフェース定義）との cross-reference 整合性を確認する
2. `int-test-skill` および `github-issue-manager` への波及影響を確認する
3. topic-map・quick-reference の更新が正確であることを確認する
4. 統合テストシナリオ カテゴリB の全件を実行し、結果を記録する

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 追記内容の cross-reference 確認（関連仕様書との整合性）

**目的**: 正本に追記した `qualityInsights` 11フィールドの定義が、関連する仕様書・インターフェース定義と矛盾していないことを確認する

**実行手順**:

1. 関連仕様書を調査してリストアップする

```bash
# eval / quality 関連ファイルを検索
grep -rln "qualityInsights\|quality_insights\|eval\|EvalEngine" \
  .claude/skills/aiworkflow-requirements/references/
```

2. 各関連ファイルについて以下の観点で整合性を確認する

| 確認観点                     | 確認方法                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| フィールド名の一致           | 関連ファイル内の表記と正本の表記が完全一致するか grep で確認 |
| 型定義の一致                 | number / string / string[] の定義が一貫しているか確認        |
| writer / owner の整合        | 他ファイルで言及されるコンポーネント名と一致するか確認       |
| 値域の整合                   | 0–100 スケールの定義が他ファイルと矛盾しないか確認           |
| timestamp フォーマットの整合 | ISO 8601 の規定が他ファイルと一致するか確認                  |

3. 矛盾が発見された場合は以下を実施する
   - 矛盾点を `outputs/phase-6/cross-reference-issues.md` に記録する
   - 正本・関連ファイルのどちらを修正すべきか判断し、修正を実施する
   - 修正後に再確認を行う

4. 整合性確認結果を `outputs/phase-6/cross-reference-result.md` に記録する

**完了条件**:

- [ ] 関連仕様書の調査が完了し、対象ファイル一覧が記録されている
- [ ] 全確認観点で整合性チェックが完了している
- [ ] 矛盾がある場合は修正済みであること、なければ「矛盾なし」が記録されている
- [ ] `outputs/phase-6/cross-reference-result.md` が作成されている

---

### タスク2: int-test-skill への波及確認

**目的**: `qualityInsights` 11フィールドの正本追記が `int-test-skill` のテストシナリオ・契約定義に影響するかを確認する

**実行手順**:

1. int-test-skill の定義ファイルを調査する

```bash
# int-test-skill 関連ファイルを検索
find .claude/skills/int-test-skill -type f -name "*.md" | head -20
grep -rln "qualityInsights\|quality" .claude/skills/int-test-skill/ 2>/dev/null
```

2. 以下の観点で波及影響を判定する

| 確認観点                                           | 判定基準                               |
| -------------------------------------------------- | -------------------------------------- |
| int-test-skill が qualityInsights を参照しているか | grep でヒットするか                    |
| 参照している場合、追記内容と一致しているか         | フィールド名・型・値域が一致するか     |
| int-test-skill のシナリオ更新が必要か              | 追記内容を反映したシナリオ追加が必要か |

3. 波及影響の判定結果を以下に分類する
   - **影響なし**: int-test-skill は qualityInsights を参照していない
   - **要確認**: 参照はあるが整合している（追記不要）
   - **要更新**: int-test-skill のシナリオ・定義更新が必要

4. 「要更新」の場合は更新を実施する（docs ファイルの更新のみ。コード変更は行わない）

5. 判定結果を `outputs/phase-6/int-test-skill-impact.md` に記録する

**完了条件**:

- [ ] int-test-skill の調査が完了している
- [ ] 波及影響の判定（影響なし/要確認/要更新）が記録されている
- [ ] 「要更新」の場合は更新が完了している
- [ ] `outputs/phase-6/int-test-skill-impact.md` が作成されている

---

### タスク3: github-issue-manager への波及確認

**目的**: `qualityInsights` 11フィールドの正本追記が `github-issue-manager` スキルのテンプレート・フィールドマッピングに影響するかを確認する

**実行手順**:

1. github-issue-manager の定義ファイルを調査する

```bash
# github-issue-manager 関連ファイルを検索
find .claude/skills/github-issue-manager -type f -name "*.md" | head -20
grep -rln "qualityInsights\|quality" .claude/skills/github-issue-manager/ 2>/dev/null
```

2. 以下の観点で波及影響を判定する

| 確認観点                                                 | 判定基準                               |
| -------------------------------------------------------- | -------------------------------------- |
| github-issue-manager が qualityInsights を参照しているか | grep でヒットするか                    |
| Issue テンプレートに qualityInsights 関連項目があるか    | テンプレートファイルを確認             |
| フィールドマッピング定義の更新が必要か                   | 追記内容と既存マッピングに齟齬があるか |

3. 判定結果を以下に分類する
   - **影響なし**: github-issue-manager は qualityInsights を参照していない
   - **要確認**: 参照はあるが整合している（追記不要）
   - **要更新**: Issue テンプレート・マッピング定義の更新が必要

4. 「要更新」の場合は更新を実施する（docs ファイルの更新のみ）

5. 判定結果を `outputs/phase-6/github-issue-manager-impact.md` に記録する

**完了条件**:

- [ ] github-issue-manager の調査が完了している
- [ ] 波及影響の判定（影響なし/要確認/要更新）が記録されている
- [ ] 「要更新」の場合は更新が完了している
- [ ] `outputs/phase-6/github-issue-manager-impact.md` が作成されている

---

### タスク4: topic-map 更新の確認

**目的**: Phase 5 で行った topic-map 更新が正確で、かつ既存エントリとの整合性を保っているか確認する

**実行手順**:

1. topic-map を読み込み、Phase 5 で追加した `qualityInsights` エントリを確認する

```bash
grep -n "qualityInsights" \
  .claude/skills/aiworkflow-requirements/references/topic-map.md
```

2. 以下の観点で topic-map の更新内容を検証する

| 確認観点                         | 期待する状態                                 |
| -------------------------------- | -------------------------------------------- |
| エントリが存在する               | grep で `qualityInsights` がヒットする       |
| リンク先が正確                   | 正本ファイルの実在するセクションを指している |
| 11フィールドが全て言及されている | エントリに11フィールド名が記載されているか   |
| 既存エントリとのフォーマット統一 | 他エントリと同じ書き方になっているか         |

3. 不備がある場合は修正する

4. 確認結果を `outputs/phase-6/topic-map-check.md` に記録する

**完了条件**:

- [ ] topic-map に `qualityInsights` エントリが存在することを確認した
- [ ] リンク先が正確であることを確認した
- [ ] 既存エントリとのフォーマット統一が確認できた
- [ ] `outputs/phase-6/topic-map-check.md` が作成されている

---

### タスク5: quick-reference 更新の確認

**目的**: Phase 5 で行った quick-reference 更新が正確で、かつ既存エントリとの整合性を保っているか確認する

**実行手順**:

1. quick-reference を読み込み、Phase 5 で追加した `qualityInsights` エントリを確認する

```bash
grep -n "qualityInsights" \
  .claude/skills/aiworkflow-requirements/references/quick-reference.md
```

2. 以下の観点で quick-reference の更新内容を検証する

| 確認観点                         | 期待する状態                                     |
| -------------------------------- | ------------------------------------------------ |
| エントリが存在する               | grep で `qualityInsights` がヒットする           |
| 説明テキストが簡潔で正確         | 「品質インサイト（11フィールド）」等の説明がある |
| 参照先ファイルが正確             | 正本ファイルへの参照が含まれている               |
| 既存エントリとのフォーマット統一 | テーブル形式・列数が既存と一致している           |

3. 不備がある場合は修正する

4. 確認結果を `outputs/phase-6/quick-reference-check.md` に記録する

**完了条件**:

- [ ] quick-reference に `qualityInsights` エントリが存在することを確認した
- [ ] 説明テキスト・参照先が正確であることを確認した
- [ ] 既存エントリとのフォーマット統一が確認できた
- [ ] `outputs/phase-6/quick-reference-check.md` が作成されている

---

### タスク6: 統合テスト拡充（カテゴリBの全件実行）

**目的**: Phase 4 で作成した統合テストシナリオ カテゴリB（cross-reference 整合シナリオ）を全件実行し、結果を記録する

**実行手順**:

1. `outputs/phase-4/integration-test-scenarios.md` のカテゴリB シナリオを全件確認する

| シナリオID | 確認内容                                              | 実行手順                             | 結果   |
| ---------- | ----------------------------------------------------- | ------------------------------------ | ------ |
| IT-B-01    | topic-map に qualityInsights エントリが存在する       | grep で確認                          | 未実施 |
| IT-B-02    | quick-reference に qualityInsights エントリが存在する | grep で確認                          | 未実施 |
| IT-B-03    | 関連仕様書（eval系）との記述に矛盾がない              | タスク1の cross-reference 結果を参照 | 未実施 |
| IT-B-04    | int-test-skill への波及確認が完了している             | タスク2の結果を参照                  | 未実施 |

2. 全シナリオの実行結果を `outputs/phase-6/integration-test-result-category-b.md` に記録する

3. FAIL のシナリオがある場合は原因を特定し修正する

**完了条件**:

- [ ] カテゴリB の全4シナリオ（IT-B-01〜IT-B-04）が実行されている
- [ ] 全シナリオ PASS（または修正後に PASS）となっている
- [ ] `outputs/phase-6/integration-test-result-category-b.md` が作成されている

---

## 参照資料

| 参照資料                 | パス                                                                   | 内容                                 |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------ |
| Phase 5 成果物一式       | `outputs/phase-5/`                                                     | 正本追記・索引更新の実施記録         |
| 正本ファイル（追記済み） | （Phase 5 タスク1で確定したファイルパス）                              | qualityInsights 11フィールド追記済み |
| 統合テストシナリオ       | `outputs/phase-4/integration-test-scenarios.md`                        | カテゴリB シナリオ定義               |
| topic-map                | `.claude/skills/aiworkflow-requirements/references/topic-map.md`       | 仕様トピック索引                     |
| quick-reference          | `.claude/skills/aiworkflow-requirements/references/quick-reference.md` | クイック参照インデックス             |
| int-test-skill           | `.claude/skills/int-test-skill/`                                       | 統合テストスキル定義                 |
| github-issue-manager     | `.claude/skills/github-issue-manager/`                                 | GitHub Issue 管理スキル定義          |

---

## 実行手順（Phase 6 全体）

1. タスク1を実行し、関連仕様書との cross-reference 確認を完了する
2. タスク2を実行し、int-test-skill への波及を確認する
3. タスク3を実行し、github-issue-manager への波及を確認する
4. タスク4を実行し、topic-map 更新の正確性を確認する
5. タスク5を実行し、quick-reference 更新の正確性を確認する
6. タスク6を実行し、統合テストシナリオ カテゴリB を全件実行・記録する
7. 全成果物が `outputs/phase-6/` に揃っていることを確認する

---

## 統合テスト連携

docs-only タスクにおける Phase 6 の統合テスト連携アクション:

- 統合テストシナリオ カテゴリB（IT-B-01〜IT-B-04）を全件実行し、cross-reference 整合の自動検証を実現する
- int-test-skill・github-issue-manager への波及確認により、スキル連携を含めた統合的な整合性を保証する
- Phase 4 で定義したカテゴリB シナリオが全件 PASS することをもって、Phase 6 の統合テスト拡充完了とする
- FAIL シナリオが発生した場合は本 Phase 内で修正し、再実行で PASS を確認してから Phase 7 へ進む

---

## 多角的チェック観点

| 観点                     | チェック内容                                                         |
| ------------------------ | -------------------------------------------------------------------- |
| cross-reference の網羅性 | 全関連仕様書を調査したか（grep で漏れなく検索したか）                |
| 波及確認の範囲           | int-test-skill と github-issue-manager 以外に影響するスキルがないか  |
| topic-map リンクの有効性 | リンク先セクションが正本ファイルに実際に存在するか（読み込みで確認） |
| quick-reference の検索性 | キーワード検索で `qualityInsights` エントリが直感的に見つかるか      |
| シナリオ実行の客観性     | シナリオ結果を主観ではなくコマンド出力・目視確認で判定しているか     |
| docs-only 制約の遵守     | タスク1〜6 を通じてコード変更が一切発生していないか                  |

---

## サブタスク管理

| サブタスクID | 内容                                  | ステータス |
| ------------ | ------------------------------------- | ---------- |
| ST-6-01      | 関連仕様書との cross-reference 確認   | 未実施     |
| ST-6-02      | int-test-skill への波及確認           | 未実施     |
| ST-6-03      | github-issue-manager への波及確認     | 未実施     |
| ST-6-04      | topic-map 更新の正確性確認            | 未実施     |
| ST-6-05      | quick-reference 更新の正確性確認      | 未実施     |
| ST-6-06      | 統合テストシナリオ カテゴリB 全件実行 | 未実施     |

---

## 成果物

| 成果物                                   | パス                                                    | 内容                                 |
| ---------------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| cross-reference 確認結果                 | `outputs/phase-6/cross-reference-result.md`             | 関連仕様書との整合性確認結果         |
| cross-reference 課題記録（存在する場合） | `outputs/phase-6/cross-reference-issues.md`             | 矛盾点と修正記録                     |
| int-test-skill 波及確認記録              | `outputs/phase-6/int-test-skill-impact.md`              | 波及判定結果と対応記録               |
| github-issue-manager 波及確認記録        | `outputs/phase-6/github-issue-manager-impact.md`        | 波及判定結果と対応記録               |
| topic-map 確認記録                       | `outputs/phase-6/topic-map-check.md`                    | topic-map 更新の正確性確認結果       |
| quick-reference 確認記録                 | `outputs/phase-6/quick-reference-check.md`              | quick-reference 更新の正確性確認結果 |
| 統合テスト結果（カテゴリB）              | `outputs/phase-6/integration-test-result-category-b.md` | IT-B-01〜IT-B-04 の実行結果          |

---

## 完了条件

- [ ] 関連仕様書との cross-reference 確認が完了し、矛盾がない（または修正済み）
- [ ] int-test-skill への波及確認が完了し、必要な更新が実施されている
- [ ] github-issue-manager への波及確認が完了し、必要な更新が実施されている
- [ ] topic-map の `qualityInsights` エントリが正確であることを確認した
- [ ] quick-reference の `qualityInsights` エントリが正確であることを確認した
- [ ] 統合テストシナリオ カテゴリB（IT-B-01〜IT-B-04）が全件 PASS している
- [ ] 全成果物が `outputs/phase-6/` に格納されている
- [ ] コード変更が一切発生していないことを確認した

---

## タスク100%実行確認【必須】

- [ ] タスク1〜6 が全て完了している
- [ ] cross-reference の矛盾が解消されている（または「矛盾なし」が確認されている）
- [ ] int-test-skill・github-issue-manager の波及確認が完了している
- [ ] 統合テストシナリオ カテゴリB が全件 PASS している
- [ ] 成果物が `outputs/phase-6/` に全て格納されていることを確認した
- [ ] コード変更を一切行っていないことを確認した

---

## 次Phase

Phase 7（カバレッジ確認: docs-only 読み替え = インデックス網羅確認）へ進む。
`outputs/phase-6/` の成果物を入力として使用する。

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-7-coverage-check.md`
