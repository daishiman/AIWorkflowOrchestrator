# Phase 8: リファクタリング（docs-only読み替え: 責務分離・semantic filename確認）

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| Phase        | 8                                                   |
| 機能名       | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| タスク名     | qualityInsights 現行定義を2 skillへ整合反映         |
| タスク種別   | docs-only（コード変更なし）                         |
| 前提Phase    | Phase 7 完了（カバレッジ確認）                      |
| 後続Phase    | Phase 9                                             |
| 作成日       | 2026-04-21                                          |
| ステータス   | completed                                           |
| GitHub Issue | #2327（CLOSED）                                     |

---

## 目的

> **2026-04-21 current facts 補正**: Phase 8 の整合確認は 10 実フィールド定義と close-out 文書の一貫性を対象とする。grep の `PASS=11` は検証ポイント数を指す。

docs-only タスクにおける Phase 8「リファクタリング」は、以下に読み替えて実施する:

- **500行超過確認・責務分離**: 追記した仕様書ファイルが 500 行を超えていないかを確認し、超過する場合は責務ごとにファイルを分割する
- **semantic filename 確認**: ファイル名が内容を正確に表しているか（`qualityInsights` の役割・writer・運用責任を記述するファイル名として適切か）を検証する
- **冗長記述の整理**: qualityInsights 11 フィールドの説明において重複・冗長な記述を排除し、読みやすさと保守性を向上させる

コード変更は一切行わない。

---

## 実行タスク

1. 追記対象仕様書ファイルの行数を確認し、500 行超過の有無を判定する
2. 超過している場合はフィールド群・役割・運用責任の観点で責務分離し、適切なファイル名（semantic filename）で分割する
3. semantic filename チェック: 各ファイル名が記述内容を一意に特定できるか確認する
4. 11 フィールドの記述間で用語・表現・フォーマットの不一致を排除する
5. 冗長な記述（重複説明・不要な注釈）を整理する
6. リファクタ後に内容整合確認を実施し、結果を `outputs/phase-8/refactoring-results.md` に記録する
7. 成果物として `outputs/phase-8/refactoring-plan.md` と `outputs/phase-8/refactoring-results.md` を出力する

---

## 参照資料

### 仕様書・ドキュメント

| 種別               | パス                                                                                              | 役割                                   |
| ------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 追記対象（正本）   | `references/` 配下の qualityInsights 関連仕様書                                                   | Phase 5 で追記した 11 フィールドの正本 |
| タスク仕様         | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-2-design.md`         | フィールド追記の設計方針               |
| タスク仕様         | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-5-implementation.md` | 追記実施内容の正本                     |
| カバレッジ確認結果 | `outputs/phase-7/coverage-report.md`                                                              | Phase 7 成果物（refactor 候補の根拠）  |

### システム仕様（aiworkflow-requirements）

| 種別            | 参照キー                                         | 役割                                     |
| --------------- | ------------------------------------------------ | ---------------------------------------- |
| topic-map       | `qualityInsights / evals / spec`                 | qualityInsights フィールドの正本位置確認 |
| keywords        | `writer / operator / field-responsibility`       | 責務境界の用語統一                       |
| resource-map    | `spec / quality-insights / field-definition`     | 11 フィールド定義の格納先                |
| quick-reference | `semantic-filename / line-budget / docs-quality` | docs 品質チェックの手順                  |

---

## 実行手順

```bash
# 1. 追記対象ファイルの行数確認（500行超過チェック）
wc -l .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 2. semantic filename 確認（ファイル名とコンテンツの整合）
ls -la references/ | grep -i "quality\|insight\|evals"

# 3. 冗長記述の検出（同一フィールド説明の重複）
grep -n "qualityInsights\\." .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 4. 内容整合確認（11フィールド全記述の存在確認）
grep -c "qualityInsights\\." .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
# 期待: 11以上のマッチ

# 5. mirror sync 確認（該当する場合）
diff -qr .claude/skills/ .agents/skills/ 2>/dev/null || echo "mirror確認: 差分なし or 非対象"
```

---

## リファクタリング対象チェック

```bash
# 行数チェック（500行超過確認）
for f in $(grep -rl "qualityInsights" references/); do
  lines=$(wc -l < "$f")
  echo "$lines $f"
done

# semantic filename チェック（名前が内容と一致しているか）
# 命名規則: qualityInsights の役割・writer・運用責任を含む名前であること

# 冗長記述チェック（同一フィールドの重複説明）
grep -n "overview\\|description\\|summary" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

---

## 変更記録テーブル（Before / After 形式）

| 対象               | Before                     | After                        | 理由                           |
| ------------------ | -------------------------- | ---------------------------- | ------------------------------ |
| ファイル行数       | （実測値を記入）           | （修正後の実測値を記入）     | 500行超過の場合のみ分割        |
| semantic filename  | （現在のファイル名を記入） | （修正後のファイル名を記入） | 内容と名前の乖離がある場合のみ |
| 冗長記述           | （冗長箇所を記入）         | （整理後の記述を記入）       | 重複排除・可読性向上           |
| フォーマット不一致 | （不一致箇所を記入）       | （統一後の表現を記入）       | 用語・表現の一貫性確保         |
| （実装後追記）     | （具体的なBefore を記入）  | （具体的なAfter を記入）     | （理由を記入）                 |

---

## 注意事項

- コード変更は禁止（docs-only タスク）
- 500 行超過がない場合はファイル分割不要（no-op 根拠を記録すること）
- semantic filename が適切な場合はリネーム不要（no-op 根拠を記録すること）
- リファクタ後も 11 フィールド全ての記述が完全であることを必ず確認する
- Phase 7 カバレッジ確認結果と整合していること

---

## 統合テスト連携

docs-only タスクにおける統合テスト連携は以下の読み替えで実施する:

| 連携項目                 | 読み替え後の確認内容                                        | Phase 9 ゲート対象 |
| ------------------------ | ----------------------------------------------------------- | ------------------ |
| リファクタ後の統合テスト | リファクタ後の内容整合確認（grep による全11フィールド確認） | Yes                |
| 責務境界の機械検証       | ファイル名と内容の整合確認（semantic filename チェック）    | Yes                |
| mirror parity 確認       | 該当する mirror sync の差分ゼロ確認（diff -q）              | Yes                |
| 行数制約の継続保証       | リファクタ後の行数が500行以内であること                     | Yes                |

Phase 9 は本 Phase 完了後に mirror sync 差分ゼロ + 11 フィールド記述の完全性を確認する。

---

## 多角的チェック観点

| 観点      | チェック内容                                                                    |
| --------- | ------------------------------------------------------------------------------- |
| 行数制約  | 追記後の仕様書が 500 行以内に収まっているか                                     |
| semantic  | ファイル名が `qualityInsights` の役割・writer・運用責任を正確に表しているか     |
| 冗長性    | 同一フィールドの説明が複数箇所に重複していないか                                |
| 用語統一  | 11 フィールドの説明で writer / operator / responsibility の用語が一貫しているか |
| docs-only | コード変更（`.ts` / `.js` / `.json` への変更）が一切含まれていないか            |
| 内容整合  | リファクタ前後で 11 フィールドの役割・writer・運用責任が変わっていないか        |

---

## サブタスク管理

1. 参照資料の確認（追記対象ファイルの特定）
2. 行数チェック（500行超過確認・分割判定）
3. semantic filename チェック（リネーム判定）
4. 冗長記述・用語不一致の整理
5. リファクタ後の内容整合確認（grep による 11 フィールド全確認）
6. 変更記録テーブルの完成
7. 成果物の作成・配置

---

## 成果物

| 成果物                 | パス                                     | 説明                                    |
| ---------------------- | ---------------------------------------- | --------------------------------------- |
| リファクタリング計画書 | `outputs/phase-8/refactoring-plan.md`    | 分割・リネーム・整理の判定と方針        |
| リファクタリング結果書 | `outputs/phase-8/refactoring-results.md` | Before/After テーブル・内容整合確認結果 |

---

## 完了条件

- [ ] 追記対象仕様書の行数が 500 行以内（または超過時は責務分離済み）
- [ ] semantic filename が内容と一致している（またはリネーム済み）
- [ ] 冗長記述・用語不一致が排除されている
- [ ] リファクタ後も 11 フィールド全ての記述が完全である
- [ ] 変更記録テーブルが `対象 / Before / After / 理由` で完成している
- [ ] コード変更が含まれていない
- [ ] 成果物 2 ファイルが出力されている

---

## タスク100%実行確認【必須】

- [ ] 行数チェック完了（実測値を記録）
- [ ] semantic filename チェック完了（判定結果を記録）
- [ ] 冗長記述整理完了
- [ ] 用語統一確認完了
- [ ] リファクタ後の内容整合確認完了（11 フィールド全確認）
- [ ] 変更記録テーブル完成
- [ ] mirror sync 確認完了（差分ゼロを記録）
- [ ] 成果物 2 ファイル出力完了
- [ ] Phase 8 ステータスを `completed` に更新

---

## 次Phase

Phase 9（品質保証）へ進む。
