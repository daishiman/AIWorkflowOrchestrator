# Phase 9: 品質保証（docs-only読み替え: mirror sync確認・diff -q ゼロ確認）

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| Phase        | 9                                                   |
| 機能名       | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| タスク名     | qualityInsights 現行定義を2 skillへ整合反映         |
| タスク種別   | docs-only（コード変更なし）                         |
| 前提Phase    | Phase 8 完了（リファクタリング）                    |
| 後続Phase    | Phase 10                                            |
| 作成日       | 2026-04-21                                          |
| ステータス   | completed                                           |
| GitHub Issue | #2327（CLOSED）                                     |

---

## 目的

> **2026-04-21 current facts 補正**: 品質保証の対象は 10 実フィールド定義・11 検証ポイント・close-out 同期である。旧 flat 構造の列挙例は historical note とみなし、`outputs/phase-9/quality-assurance-report.md` の記録を優先する。

docs-only タスクにおける Phase 9「品質保証」は、以下に読み替えて実施する:

- **mirror sync 確認**: `.claude/` と `.agents/` 間の mirror sync が正常であることを確認する
- **diff -q ゼロ確認**: 追記対象仕様書に対して期待外の差分がないことを確認する
- **全 11 フィールドの記述完全性チェック**: qualityInsights の 11 フィールド全てについて、役割・writer・運用責任が正本仕様へ漏れなく追記されていることを確認する

コード lint / typecheck は docs-only のため不要。ただし仕様書の Markdown 整合・リンク切れ・用語一貫性は検査する。

---

## 実行タスク

1. mirror sync 確認: `.claude/skills/` と `.agents/skills/` の `diff -qr` が 0 件であることを確認する
2. 追記対象仕様書の diff 確認: 意図しない変更が混入していないことを `git diff` で確認する
3. 全 11 フィールドの記述完全性チェック: 各フィールドに役割・writer・運用責任が揃っているか grep で確認する
4. Markdown リンク検査: 仕様書内の相対リンクが全て有効であることを確認する
5. 用語一貫性確認: `writer` / `operator` / `responsibility` 等の用語が全 11 フィールドで統一されているか確認する
6. Phase 8 のリファクタリング結果と整合していることを確認する
7. 成果物として `outputs/phase-9/quality-assurance-report.md` を出力する

---

## 参照資料

### 仕様書・ドキュメント

| 種別               | パス                                                                                              | 役割                                   |
| ------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 追記対象（正本）   | `references/` 配下の qualityInsights 関連仕様書                                                   | Phase 5 で追記した 11 フィールドの正本 |
| リファクタ計画     | `outputs/phase-8/refactoring-plan.md`                                                             | Phase 8 成果物                         |
| リファクタ結果     | `outputs/phase-8/refactoring-results.md`                                                          | Phase 8 成果物                         |
| タスク仕様         | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-2-design.md`         | 追記設計方針（11フィールド一覧の正本） |
| タスク仕様         | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-5-implementation.md` | 追記実施内容                           |
| カバレッジ確認結果 | `outputs/phase-7/coverage-report.md`                                                              | Phase 7 成果物                         |

### システム仕様（aiworkflow-requirements）

| 種別            | 参照キー                                   | 役割                       |
| --------------- | ------------------------------------------ | -------------------------- |
| topic-map       | `qualityInsights / evals / spec`           | 正本位置と記述範囲の確認   |
| keywords        | `writer / operator / field-responsibility` | 用語統一の基準             |
| resource-map    | `mirror-parity / .claude vs .agents`       | ミラー差分判定の手順       |
| quick-reference | `diff -q / grep / markdown-link-check`     | 品質チェックコマンドの参照 |

---

## 品質チェックコマンド

```bash
# 1. mirror sync 確認（diff -qr ゼロ確認）
diff -qr .claude/skills/ .agents/skills/
# 期待: 出力 0 行（差分なし）

# 2. 意図しない変更の確認（git diff）
git diff -- references/
# 期待: qualityInsights 11フィールドの追記のみが差分として存在

# 3. 全11フィールドの記述完全性チェック
# qualityInsights の各フィールド名が仕様書に存在するか確認
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
for field in "${FIELDS[@]}"; do
  count=$(grep -c "$field" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md)
  echo "$field: $count件"
done

# 4. 各フィールドの役割・writer・運用責任の記述確認
grep -n "役割\\|writer\\|運用責任\\|responsibility" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
# 期待: 11フィールド分の記述が存在

# 5. Markdown リンク検査（broken link 確認）
# 仕様書内の相対リンクが実在するパスを指していることを確認
grep -n "\[.*\](" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 6. 行数確認（Phase 8 の行数制約を維持）
wc -l .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
# 期待: 500行以内
```

---

## 品質ゲート

| チェック項目                                     | 合格基準                                     | 結果 |
| ------------------------------------------------ | -------------------------------------------- | ---- |
| mirror sync（`diff -qr .claude/ .agents/`）      | 出力 0 行（差分なし）                        | [ ]  |
| git diff による意図しない変更の確認              | qualityInsights 追記のみ（コード変更なし）   | [ ]  |
| 全 11 フィールドの存在確認                       | 11 フィールド全て記述あり                    | [ ]  |
| 各フィールドの役割記述                           | 11 フィールド全てに役割の説明が存在          | [ ]  |
| 各フィールドの writer 記述                       | 11 フィールド全てに writer が明記            | [ ]  |
| 各フィールドの運用責任記述                       | 11 フィールド全てに運用責任が明記            | [ ]  |
| Markdown リンク検査                              | 切れリンク 0 件                              | [ ]  |
| 行数制約（Phase 8 条件）                         | 500 行以内                                   | [ ]  |
| 用語一貫性（writer / operator / responsibility） | 全 11 フィールドで用語が統一                 | [ ]  |
| docs-only 制約の遵守                             | コードファイル（.ts/.js/.json）への変更 0 件 | [ ]  |

---

## 多角的チェック観点

| 観点          | チェック内容                                                   |
| ------------- | -------------------------------------------------------------- |
| 完全性        | 11 フィールド全てに役割・writer・運用責任の 3 点が揃っているか |
| 正確性        | 追記内容が GitHub Issue #2327 の要件定義と整合しているか       |
| 一貫性        | 用語・表現・フォーマットが 11 フィールド間で統一されているか   |
| mirror parity | `.claude/` と `.agents/` の diff が 0 件であるか               |
| docs-only     | コード変更が一切含まれていないか（git diff で確認）            |
| リンク整合    | 仕様書内の参照リンクが実在するパスを指しているか               |

---

## 統合テスト連携

docs-only タスクにおける統合テスト連携は以下の読み替えで実施する:

| 連携元 Phase | 引き取り項目                                 | 判定ゲート                         |
| ------------ | -------------------------------------------- | ---------------------------------- |
| Phase 5      | 追記した 11 フィールドの記述（正本）         | grep で 11 フィールド全確認        |
| Phase 6      | 拡張確認項目（フィールド間の整合・依存関係） | 全確認項目が合格基準を満たす       |
| Phase 7      | カバレッジ確認（11 フィールドの記述範囲）    | 記述漏れ 0 件                      |
| Phase 8      | リファクタリング後の内容整合                 | diff -q ゼロ + 11 フィールド全確認 |
| 本 Phase     | mirror sync 確認（`.claude/` ↔ `.agents/`）  | diff -qr 0 行                      |

Phase 9 は Phase 5〜8 の成果物を束ねて最終品質判定を行い、全品質ゲートの PASS 後に Phase 10 へ進む。

---

## サブタスク管理

1. 参照資料の確認（Phase 8 成果物の内容確認）
2. mirror sync 確認（`diff -qr` 実行・結果記録）
3. diff -q ゼロ確認（git diff による意図しない変更の検出）
4. 11 フィールド完全性チェック（grep による全フィールド確認）
5. Markdown リンク検査（切れリンク確認）
6. 用語一貫性確認
7. 品質保証レポートの作成・配置

---

## 成果物

| 成果物           | パス                                          | 説明                                         |
| ---------------- | --------------------------------------------- | -------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | 全品質ゲートの確認結果・mirror sync 結果記録 |

品質保証レポートに含める内容:

- 全品質ゲート項目の結果（合格/不合格）
- mirror sync 確認結果（`diff -qr` の出力）
- 11 フィールド完全性チェック結果（フィールドごとの確認結果）
- 用語一貫性確認結果
- docs-only 制約の遵守確認結果

---

## 完了条件

- [ ] 全品質ゲート項目が PASS
- [ ] mirror sync 差分 0 件（`diff -qr` 0 行）
- [ ] 11 フィールド全ての役割・writer・運用責任が記述済み
- [ ] Markdown リンク切れ 0 件
- [ ] コード変更が含まれていない
- [ ] 品質保証レポートが出力されている

---

## タスク100%実行確認【必須】

- [ ] mirror sync 確認完了（`diff -qr` 結果を記録）
- [ ] git diff 確認完了（意図しない変更なしを記録）
- [ ] 11 フィールド全確認完了（grep 結果を記録）
- [ ] 各フィールドの役割確認完了
- [ ] 各フィールドの writer 確認完了
- [ ] 各フィールドの運用責任確認完了
- [ ] Markdown リンク検査完了
- [ ] 行数制約確認完了（500 行以内を記録）
- [ ] 用語一貫性確認完了
- [ ] 品質保証レポート出力完了
- [ ] Phase 9 ステータスを `completed` に更新

---

## 次Phase

Phase 10（最終レビューゲート）へ進む。
