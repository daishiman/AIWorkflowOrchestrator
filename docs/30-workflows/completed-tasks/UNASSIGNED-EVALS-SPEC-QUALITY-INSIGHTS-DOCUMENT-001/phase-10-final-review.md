# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| Phase        | 10                                                  |
| 機能名       | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| タスク名     | qualityInsights 現行定義を2 skillへ整合反映         |
| タスク種別   | docs-only（コード変更なし）                         |
| 前提Phase    | Phase 9 完了（品質保証）                            |
| 後続Phase    | Phase 11（PASS の場合）                             |
| 作成日       | 2026-04-21                                          |
| ステータス   | completed                                           |
| GitHub Issue | #2327（CLOSED）                                     |

---

## 目的

> **2026-04-21 current facts 補正**: 最終レビューでは 10 実フィールドの仕様同期と、`TASK_ID` を含む 11 検証ポイントの PASS 記録を確認する。`outputs/phase-10/final-review-result.md` が close-out 後の正本である。

Phase 4〜9 の結果を総合し、本タスクの **受け入れ基準（AC）** と **blocker** を最終ゲートで判定する。判定区分は **PASS / MAJOR / MINOR / INFO** の 4 段階で、PASS のみ Phase 11（手動テスト）に進行可能とする。MAJOR は Phase 9 戻し、MINOR は是正計画を Phase 11 開始までに完了させる条件付き PASS、INFO は記録のみ。

docs-only タスクとして、コード品質ゲートは不要。代わりに以下を最終確認する:

- qualityInsights 11 フィールドの追記完全性
- 正本仕様書への追記内容の正確性（役割・writer・運用責任の記述）
- mirror sync 差分ゼロの継続確認
- 全フェーズの成果物確認

---

## 実行タスク

1. 受け入れ基準（AC）を Phase 4〜9 の結果に照合し全 PASS を確認する
2. qualityInsights 11 フィールド追記完全性の最終確認（役割・writer・運用責任の全フィールド網羅）
3. Phase 8 のリファクタリング結果（500行制約・semantic filename）が維持されていることを確認する
4. Phase 9 の全品質ゲート PASS を最終確認する
5. mirror sync 差分ゼロを最終確認する（`diff -qr`）
6. blocker 判定: MAJOR / MINOR / INFO を判定基準表に従って分類する
7. 出荷準備チェック（Phase 11 手動テスト進行可否）を判定する
8. 成果物として `outputs/phase-10/final-review-result.md` と `outputs/phase-10/shipping-checklist.md` を出力する

---

## 参照資料

### 仕様書・ドキュメント

| 種別               | パス                                                                                            | 役割                             |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| 追記対象（正本）   | `references/` 配下の qualityInsights 関連仕様書                                                 | 最終確認対象の正本               |
| タスク仕様（要件） | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-1-requirements.md` | 受け入れ基準（AC）の正本         |
| タスク仕様（設計） | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001/phase-2-design.md`       | 11フィールド一覧・追記設計方針   |
| 品質保証結果       | `outputs/phase-9/quality-assurance-report.md`                                                   | Phase 9 成果物（出荷判定の前提） |
| リファクタ結果     | `outputs/phase-8/refactoring-results.md`                                                        | Phase 8 成果物                   |
| カバレッジ結果     | `outputs/phase-7/coverage-report.md`                                                            | Phase 7 成果物                   |

### システム仕様（aiworkflow-requirements）

| 種別            | 参照キー                                    | 役割                                |
| --------------- | ------------------------------------------- | ----------------------------------- |
| topic-map       | `qualityInsights / evals / final-gate`      | 最終ゲート判定基準の正本            |
| keywords        | `PASS / MAJOR / MINOR / INFO / blocker`     | 判定用語統一                        |
| resource-map    | `lessons-learned / qualityInsights / docs`  | 教訓還流の格納先                    |
| quick-reference | `qualityInsights / evals schema / phase-12` | Phase 12 への引継チェックリスト位置 |

---

## 受け入れ基準（AC）最終確認

| AC   | 確認内容                                                         | 根拠（Phase / 成果物）                       | 判定 |
| ---- | ---------------------------------------------------------------- | -------------------------------------------- | ---- |
| AC-1 | qualityInsights の 11 フィールド全てが正本仕様書に追記されている | Phase 5 実装・Phase 7 カバレッジ・Phase 9 QA | [ ]  |
| AC-2 | 各フィールドに役割（description）が明記されている                | Phase 4 テスト・Phase 9 QA レポート          | [ ]  |
| AC-3 | 各フィールドに writer（書き込み主体）が明記されている            | Phase 4 テスト・Phase 9 QA レポート          | [ ]  |
| AC-4 | 各フィールドに運用責任（operational ownership）が明記されている  | Phase 4 テスト・Phase 9 QA レポート          | [ ]  |
| AC-5 | コード変更が一切含まれていない（docs-only 制約の遵守）           | Phase 9 git diff 確認・Phase 5 実装          | [ ]  |
| AC-6 | mirror sync 差分が 0 件（`diff -qr .claude/ .agents/`）          | Phase 8 / Phase 9 mirror 確認                | [ ]  |
| AC-7 | 既存仕様書の他セクションへの意図しない変更がない                 | Phase 9 git diff・Phase 8 リファクタ結果     | [ ]  |

---

## qualityInsights 11フィールド追記完全性の最終確認

```bash
# 全11フィールドの追記確認（最終チェック）
grep -n "qualityInsights\\." .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md | wc -l
# 期待: 11以上のマッチ

# 役割・writer・運用責任の記述確認
grep -c "役割\\|writer\\|運用責任\\|responsibility" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
# 期待: 33以上（11フィールド × 3項目）

# mirror sync 最終確認
diff -qr .claude/skills/ .agents/skills/
# 期待: 出力 0 行
```

---

## 判定基準

| 判定  | 条件                                                                               | 後続アクション                                     |
| ----- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| PASS  | AC-1〜AC-7 全達成 / 完了条件チェック全クリア / mirror sync 差分ゼロ / blocker なし | Phase 11（手動テスト）へ進行                       |
| MAJOR | AC 未達成 / 完了条件未達 / mirror sync 差分あり / コード変更混入                   | Phase 9（品質保証）へ戻り是正                      |
| MINOR | 軽微な改善余地（表現の揺れ、フォーマット不統一 等。AC・mirror sync には影響なし）  | 条件付き PASS。Phase 11 開始前までに是正計画を完了 |
| INFO  | 教訓・Nice-to-have（次タスクで扱う改善案、仕様上の検討メモ等）                     | 記録のみ。lessons-learned へ転記                   |

---

## 総合判定

```
判定結果: [ PASS / MAJOR / MINOR / INFO ]
判定日:   YYYY-MM-DD
判定者:   （実行エージェント）
判定理由: （AC・完了条件・mirror sync・blocker の根拠を詳細記述）
```

---

## 是正計画（MAJOR / MINOR の場合のみ）

| 指摘 ID                | 区分        | 指摘内容 | 是正対象 Phase | 是正内容 | 期限                           |
| ---------------------- | ----------- | -------- | -------------- | -------- | ------------------------------ |
| （MAJOR/MINOR 発生時） | MAJOR/MINOR |          |                |          | MAJOR=即時 / MINOR=Phase 11 前 |

---

## 完了条件チェックリスト

### 機能要件（docs-only）

- [ ] qualityInsights の 11 フィールド全てが正本仕様書に追記されている
- [ ] 各フィールドの役割・writer・運用責任が漏れなく記述されている
- [ ] 既存仕様書の他セクションへの意図しない変更がない

### 品質要件

- [ ] mirror sync 差分 0 件（`diff -qr .claude/ .agents/`）
- [ ] Markdown リンク切れ 0 件
- [ ] 行数制約（500 行以内）を維持
- [ ] 用語一貫性（writer / operator / responsibility）が全フィールドで統一

### docs-only 制約

- [ ] コードファイル（.ts / .js / .json）への変更が含まれていない
- [ ] Phase 9 品質ゲート全項目が PASS

---

## 出荷準備チェック（Phase 11 手動テスト進行可否）

- [ ] PASS 判定が記録されている（MAJOR の場合は Phase 9 戻し / MINOR の場合は是正完了確認）
- [ ] mirror sync 差分ゼロが Phase 9 で確認済み
- [ ] Phase 11 で必要となる手動テスト確認項目（ファイル存在・内容整合・mirror 同期）が準備されている
- [ ] Phase 12 の完了チェックリスト反映計画が確定している

---

## 統合テスト連携

docs-only タスクにおける統合テスト連携は以下の読み替えで実施する:

| 統合確認項目                                    | 参照元 Phase    | 判定根拠                      |
| ----------------------------------------------- | --------------- | ----------------------------- |
| 11 フィールド追記の根拠確認                     | Phase 4 / 5 / 7 | `coverage-report.md`          |
| 品質ゲート全項目の PASS                         | Phase 9         | `quality-assurance-report.md` |
| mirror sync 差分ゼロ（`.claude/` ↔ `.agents/`） | Phase 8 / 9     | `diff -qr` の 0 件出力        |
| Phase 3 MINOR 指摘の全解決                      | Phase 3 / 9     | 設計レビュー残課題との突合    |
| docs-only 制約の遵守（コード変更なし）          | Phase 5 / 9     | `git diff` の確認結果         |

Phase 11 へ進める判定は本表が全 PASS であることが必須。MAJOR 指摘があれば Phase 9 に戻し、MINOR 指摘は Phase 11 開始前までに是正させる。

---

## 多角的チェック観点

| 観点          | チェック内容                                                          |
| ------------- | --------------------------------------------------------------------- |
| 完全性        | 11 フィールド全てに役割・writer・運用責任の 3 点が揃っているか        |
| 正確性        | 追記内容が Issue #2327 の要件と整合しているか                         |
| mirror parity | mirror sync 差分が 0 件であるか（Phase 9 の結果を引き継いで最終確認） |
| docs-only     | コード変更が一切含まれていないか                                      |
| blocker 判定  | MAJOR / MINOR / INFO の分類が適切に行われているか                     |

---

## サブタスク管理

1. 参照資料の確認（Phase 9 品質保証レポートの内容確認）
2. AC-1〜AC-7 の照合
3. qualityInsights 11 フィールド最終確認（grep 実行）
4. mirror sync 最終確認（`diff -qr` 実行）
5. blocker 判定と is正計画の作成（MAJOR/MINOR の場合）
6. 総合判定の記録
7. 出荷準備チェックの完成
8. 成果物の作成・配置

---

## 成果物

| 成果物           | パス                                      | 説明                                      |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC 判定結果・総合判定・是正計画（該当時） |
| 出荷準備チェック | `outputs/phase-10/shipping-checklist.md`  | Phase 11 進行可否の最終チェックリスト     |

---

## 完了条件

- [ ] AC-1〜AC-7 が全て達成されている
- [ ] 完了条件チェックリストが全クリア
- [ ] mirror sync 差分ゼロが最終確認済み
- [ ] qualityInsights 11 フィールド追記の完全性が最終確認済み
- [ ] PASS / MAJOR / MINOR / INFO のいずれかが判定記録されている
- [ ] 出荷準備チェックリストが完成している

---

## タスク100%実行確認【必須】

- [ ] AC-1〜AC-7 全確認完了
- [ ] qualityInsights 11 フィールド最終確認完了（grep 結果を記録）
- [ ] mirror sync 最終確認完了（`diff -qr` 0 行を記録）
- [ ] docs-only 制約の遵守確認完了
- [ ] 総合判定記録完了
- [ ] 是正計画作成完了（該当時）
- [ ] 出荷準備チェック完了
- [ ] 成果物 2 ファイル出力完了
- [ ] Phase 10 ステータスを `completed` に更新

---

## 次Phase

- PASS → Phase 11（手動テスト）へ進む
- MAJOR → Phase 9（品質保証）へ戻り是正後、本 Phase 10 を再実行
- MINOR → Phase 11 開始前までに是正計画を完了させたうえで Phase 11 へ進む
- INFO → 記録のみ実施し Phase 11 へ進む
