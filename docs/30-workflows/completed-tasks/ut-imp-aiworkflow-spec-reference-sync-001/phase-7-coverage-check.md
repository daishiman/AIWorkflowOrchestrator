# Phase 7: テストカバレッジ確認（検証ゲート判定） - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| Phase名    | テストカバレッジ確認（検証ゲート判定）    |
| 機能名     | ut-imp-aiworkflow-spec-reference-sync-001 |
| タスクID   | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 |
| 前提Phase  | Phase 6                                   |
| 後続Phase  | Phase 8                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-25                                |

## 目的

Phase 6 の検証結果を総合的にゲート判定し、Phase 8（リファクタリング）に進めるかを決定する。全検証シナリオが PASS の場合のみ Phase 8 へ進行し、FAIL がある場合は Phase 6（検証対象が Phase 5 の修正を要する場合は Phase 5）に戻る。

## 背景

本タスクはコード実装を伴わない仕様書修正タスクである。通常のカバレッジ確認（Line/Branch/Function Coverage）の代わりに、仕様書同期の検証カバレッジをゲート判定する。

## ゲート判定基準

| 判定項目              | 基準                  | ソース               |
| --------------------- | --------------------- | -------------------- |
| リンク参照切れ        | 0 件                  | TC-001 結果          |
| 索引再生成            | 差分なし（生成済み）  | TC-002 結果          |
| ファイル参照実在      | MISSING 0 件          | TC-003 結果          |
| SKILL validator       | PASS                  | TC-004 結果          |
| 3点同期チェックリスト | grep コマンド正常実行 | TC-005 結果          |
| baseline/current 分離 | current 違反 0 件     | Phase 6 タスク6 結果 |

**全項目 PASS → Phase 8 へ進行**
**1項目以上 FAIL → Phase 6 に戻る（根本原因が Phase 5 にある場合は Phase 5 に戻る）**

## 実行タスク

- Phase 6 検証結果収集: TC-001〜TC-005 と baseline/current 結果を集約する
- ゲート判定実施: PASS/FAIL の分岐と戻り先を確定する
- 最終レポート作成: Phase 8 への引き継ぎ情報を確定する

### タスク1: Phase 6 検証結果の収集

**目的**: Phase 6 で記録された全検証結果を収集し、ゲート判定の入力データとして整理する

**実行手順**:

1. `outputs/phase-6/coverage-report.md` を読み込む
2. `outputs/phase-6/integration-test.md` を読み込む
3. 以下のサマリテーブルに結果を転記する:

```markdown
## Phase 6 検証結果サマリ

| TC-ID  | シナリオ | 検証手段                   | 結果      | 備考 |
| ------ | -------- | -------------------------- | --------- | ---- |
| TC-001 | VS-001   | verify-unassigned-links.js | PASS/FAIL |      |
| TC-002 | VS-002   | generate-index.js + diff   | PASS/FAIL |      |
| TC-003 | VS-003   | grep + test -f             | PASS/FAIL |      |
| TC-004 | VS-004   | SKILL validator            | PASS/FAIL |      |
| TC-005 | VS-005   | grep タスクID検索          | PASS/FAIL |      |
| -      | 追加     | baseline/current 分離      | PASS/FAIL |      |
```

**注意事項**:

- Phase 6 の成果物が存在しない場合は Phase 6 に戻る
- 各 TC-ID の結果は `outputs/phase-6/coverage-report.md` から正確に転記する

---

### タスク2: ゲート判定の実施

**目的**: 収集した検証結果を基にゲート判定を実施し、次 Phase への遷移を決定する

**実行手順**:

1. タスク1 のサマリテーブルを確認する
2. 以下の判定ロジックに従い、ゲート判定を行う:

```
全項目 PASS
  → 判定: PASS → Phase 8 へ進行

TC-001〜TC-005 のいずれかが FAIL
  → FAIL 原因を分析:
    → Phase 5 の仕様書修正が不十分 → Phase 5 に戻る
    → Phase 6 の検証手順に問題がある → Phase 6 のテストケースを修正して再実行

baseline/current 分離のみ FAIL
  → current 違反の対象ファイルを特定:
    → Phase 5 で変更したファイルが原因 → Phase 5 に戻り修正
    → Phase 5 以外のファイルが原因 → baseline 違反として記録し、PASS 扱い
```

3. 判定結果を `outputs/phase-7/coverage-report.md` に記録する

---

### タスク3: 最終検証レポート作成

**目的**: ゲート判定の結果を最終検証レポートとして整理し、Phase 8 以降のリファクタリング対象を特定する

**実行手順**:

1. `outputs/phase-7/coverage-report.md` を作成する
2. 以下の構造で記載する:

```markdown
# Phase 7: 検証ゲート判定結果

## 判定日時

<YYYY-MM-DD HH:MM>

## 判定結果

<PASS / FAIL>

## 検証結果サマリ

| 判定項目              | 基準              | 結果      | 備考 |
| --------------------- | ----------------- | --------- | ---- |
| リンク参照切れ        | 0 件              | PASS/FAIL |      |
| 索引再生成            | 差分なし          | PASS/FAIL |      |
| ファイル参照実在      | MISSING 0 件      | PASS/FAIL |      |
| SKILL validator       | PASS              | PASS/FAIL |      |
| 3点同期チェックリスト | grep 正常実行     | PASS/FAIL |      |
| baseline/current 分離 | current 違反 0 件 | PASS/FAIL |      |

## FAIL 項目の詳細（該当する場合）

（FAIL 項目ごとに原因と対応を記載）

## Phase 8 リファクタリング候補

（ゲート PASS の場合、Phase 5 で追加した仕様書の記述品質改善対象を列挙）

## 次のアクション

- [ ] PASS → Phase 8 に進行
- [ ] FAIL → Phase <5/6> に戻り修正
```

3. Phase 8 リファクタリング候補として、以下の観点で改善対象を列挙する:
   - Phase 5 で追加したセクションの記述品質（重複表現の排除、文体統一）
   - チェックリスト項目の順序最適化
   - 既存セクションとの整合性改善

## 参照資料

| 参照資料                          | パス                                       | 内容                  |
| --------------------------------- | ------------------------------------------ | --------------------- |
| 仕様更新記録（Phase 5）           | `outputs/phase-5/specification-updates.md` | 同期ルール追加内容    |
| 検証カバレッジレポート（Phase 6） | `outputs/phase-6/coverage-report.md`       | TC-001〜TC-005 結果   |
| 統合検証結果（Phase 6）           | `outputs/phase-6/integration-test.md`      | baseline/current 結果 |
| テスト仕様書（Phase 4成果物）     | `outputs/phase-4/test-specification.md`    | 検証シナリオ設計      |
| テストケース（Phase 4成果物）     | `outputs/phase-4/test-cases.md`            | テストケース詳細      |

## システム仕様（aiworkflow-requirements + task-specification-creator）参照

| 仕様書                  | 参照セクション                             | 参照理由             |
| ----------------------- | ------------------------------------------ | -------------------- |
| task-workflow.md        | 未タスク参照同期ルール（Phase 5追加分）    | ゲート判定の検証対象 |
| spec-update-workflow.md | baseline/current 分離監査（Phase 5追加分） | ゲート判定の検証対象 |
| phase-11-12-guide.md    | 3点同期チェックリスト（Phase 5追加分）     | ゲート判定の検証対象 |

## 統合テスト連携

本 Phase はゲート判定のみのため、新たなスクリプト実行は不要。Phase 6 の結果を入力として使用する。

| 統合検証項目           | 検証手段                      | 本Phase で実施 |
| ---------------------- | ----------------------------- | -------------- |
| Phase 6 結果の読み取り | outputs/phase-6/ ファイル参照 | はい           |
| ゲート判定ロジック適用 | 判定基準テーブルとの突合      | はい           |

## 多角的チェック観点

| 観点           | 確認内容                                                      | 判定基準                         |
| -------------- | ------------------------------------------------------------- | -------------------------------- |
| 結果整合性     | Phase 6 の各 TC 結果がサマリテーブルに正確に転記されている    | Phase 6 出力との完全一致         |
| 判定正確性     | ゲート判定ロジックが正しく適用されている                      | 判定基準テーブルとの一致         |
| 遷移先正確性   | PASS/FAIL に応じた遷移先が正しい                              | 判定ロジックどおりの遷移先       |
| リファクタ特定 | Phase 8 のリファクタリング候補が具体的に列挙されている        | 候補リスト1件以上                |
| レポート完全性 | `outputs/phase-7/coverage-report.md` に全項目が記載されている | テンプレート全セクション記載済み |

## 成果物

| 成果物           | パス                                 | 内容                         |
| ---------------- | ------------------------------------ | ---------------------------- |
| 最終検証レポート | `outputs/phase-7/coverage-report.md` | ゲート判定結果・次アクション |

## 完了条件

- [ ] Phase 6 の検証結果（`outputs/phase-6/coverage-report.md`）が読み込まれている
- [ ] Phase 6 の統合検証結果（`outputs/phase-6/integration-test.md`）が読み込まれている
- [ ] 6項目のゲート判定基準に対して全て判定が完了している
- [ ] ゲート判定結果が PASS または FAIL として明記されている
- [ ] FAIL の場合、戻り先 Phase（Phase 5 または Phase 6）が特定されている
- [ ] PASS の場合、Phase 8 リファクタリング候補が1件以上列挙されている
- [ ] `outputs/phase-7/coverage-report.md` にテンプレート全セクションが記載されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 7 ステータスを `completed` に更新

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/phase-8-refactoring.md`
