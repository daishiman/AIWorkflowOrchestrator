# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard 仕様策定  |
| 前提Phase  | Phase 9 完了（品質保証）                  |
| 後続Phase  | Phase 11（PASS の場合）                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

---

## 目的

Phase 4〜9 の結果を総合し、本タスクの **acceptance criteria（AC-1〜AC-7）** と **blocker** を最終ゲートで判定する。判定区分は **PASS / MAJOR / MINOR / INFO** の 4 段階で、PASS のみ Phase 11（手動テスト）に進行可能とする。MAJOR は Phase 9 戻し、MINOR は是正計画を Phase 11 開始までに完了させる条件付き PASS、INFO は記録のみ。

---

## 実行タスク

1. AC-1〜AC-7 を Phase 4 / Phase 6 / Phase 7 / Phase 9 の結果に照合し全 PASS を確認
2. Phase 7 のカバレッジ基準（line 80%+ / branch 60%+ / function 80%+）達成を確認
3. Phase 8 の責務境界（validator = read-only / writer = `complete-phase.js` 単独）保守を確認
4. Phase 9 の品質ゲート全 PASS を確認
5. Dogfooding の成立（本ワークフロー自身が parity validator で exit 0）を確認
6. blocker 判定: MAJOR / MINOR / INFO を判定基準表に従って分類
7. 出荷準備チェック（Phase 11 手動テスト進行可否）を判定
8. 成果物として `outputs/phase-10/final-review-result.md` と `outputs/phase-10/shipping-checklist.md` を出力

---

## 参照資料

### 実装・コード

| 種別                       | パス                                                                            | 役割                                |
| -------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| 検査対象                   | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` | parity validator                    |
| 検査対象                   | `.claude/skills/task-specification-creator/scripts/complete-phase.js`           | S1〜S3 同値更新 + atomic / rollback |
| 検査対象                   | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`         | parity 検証 PASS 前 gate            |
| 仕様                       | `phase-1-requirements.md`                                                       | AC-1〜AC-7 正本                     |
| 仕様                       | `phase-3-design-review.md`                                                      | 設計レビュー残課題                  |
| 仕様                       | `phase-7-coverage-check.md`                                                     | AC × Test トレーサビリティ          |
| 仕様                       | `phase-9-quality-assurance.md`                                                  | 品質ゲート結果                      |
| 出力                       | `outputs/phase-7/traceability-matrix.md`                                        | AC 充足の根拠                       |
| 出力                       | `outputs/phase-9/quality-assurance-report.md`                                   | 出荷判定の前提                      |
| 要件定義書                 | `outputs/phase-1/requirements.md`                                               | Phase 1 成果物                      |
| 受け入れ基準 AC-1〜AC-7    | `outputs/phase-1/acceptance-criteria.md`                                        | Phase 1 成果物                      |
| drift baseline 実測        | `outputs/phase-1/drift-inventory.md`                                            | Phase 1 成果物                      |
| parity判定アルゴリズム設計 | `outputs/phase-2/parity-algorithm-design.md`                                    | Phase 2 成果物                      |
| validator CLI/JSON契約     | `outputs/phase-2/validator-placement-design.md`                                 | Phase 2 成果物                      |
| complete-phase拡張設計     | `outputs/phase-2/complete-phase-extension-design.md`                            | Phase 2 成果物                      |
| checklist gate設計         | `outputs/phase-2/checklist-gate-design.md`                                      | Phase 2 成果物                      |
| 実装サマリー               | `outputs/phase-5/implementation-summary.md`                                     | Phase 5 成果物                      |
| 変更ファイル一覧           | `outputs/phase-5/changed-files.md`                                              | Phase 5 成果物                      |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`                                            | Phase 7 成果物                      |
| リファクタリング計画       | `outputs/phase-8/refactoring-plan.md`                                           | Phase 8 成果物                      |
| リファクタリング結果       | `outputs/phase-8/refactoring-results.md`                                        | Phase 8 成果物                      |

### システム仕様（aiworkflow-requirements）

| 種別            | 参照キー                                | 役割                                |
| --------------- | --------------------------------------- | ----------------------------------- |
| topic-map       | `task-workflow / final-gate`            | 最終ゲート判定基準の正本            |
| keywords        | `PASS / MAJOR / MINOR / INFO / blocker` | 判定用語統一                        |
| resource-map    | `lessons-learned / closeout-parity`     | 教訓還流の格納先                    |
| quick-reference | `phase-12-completion-checklist.md`      | Phase 12 への引継チェックリスト位置 |

---

## 受け入れ基準（AC）最終確認

| AC   | 確認内容                                                                                            | 根拠 (Phase / 成果物)                                      | 判定 |
| ---- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| AC-1 | validator が S1〜S4 の status を比較し、全一致で exit 0、drift で exit 1                            | Phase 4 TC, Phase 6 TC, Phase 7 traceability               | [ ]  |
| AC-2 | drift レポートの構造化出力 (`--json`)                                                               | Phase 4 TC, Phase 6 TC, Phase 9 dogfooding ログ            | [ ]  |
| AC-3 | `verify-all-specs.js` への組込み（PASS 判定前に parity 検証を挿入）                                 | Phase 4 TC, Phase 6 TC, Phase 9 全テスト結果               | [ ]  |
| AC-4 | `complete-phase.js` が S1〜S3 を同値更新（atomic / rollback 含む）                                  | Phase 4 TC, Phase 6 TC（同時更新競合）, Phase 9 全テスト   | [ ]  |
| AC-5 | `phase-12-completion-checklist.md` への parity guard 反映                                           | Phase 5 / Phase 6 成果物, Phase 9 link 検査                | [ ]  |
| AC-6 | 両 skill（`task-specification-creator` / `aiworkflow-requirements`）への教訓還流                    | Phase 8 / Phase 9 mirror parity 結果, lessons-learned 反映 | [ ]  |
| AC-7 | 既存ワークフロー遡及修正なし（既存ワークフローの status / artifacts.json が本タスクで変更されない） | Phase 6 TC（既存 fixture 不変テスト）, Phase 9 全テスト    | [ ]  |

---

## UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 完了条件チェックリスト

### 機能要件

- [ ] parity validator が新規追加され、S1〜S4 の status drift を検出できる
- [ ] `complete-phase.js` が S1〜S3 を一括同値更新し atomic / rollback が成立する
- [ ] `verify-all-specs.js` の PASS 判定前に parity 検証が挟まれる
- [ ] exit code 0 / 1 / 2 / 3 が定義通りに振る舞う

### 品質要件

- [ ] line 80%+ / branch 60%+ / function 80%+ を満たす
- [ ] lint / typecheck PASS
- [ ] mirror parity (`diff -qr .claude/ .agents/`) が 0 件
- [ ] dogfooding（本ワークフロー自身に validator 適用）が exit 0

### ドキュメント要件

- [ ] `phase-12-completion-checklist.md` に parity guard が組み込まれる計画がある
- [ ] 両 skill への教訓還流が Phase 12 に計画されている
- [ ] 既存ワークフローへの遡及修正が含まれていない

---

## 最終 dogfooding チェック

- [ ] 本ワークフロー（UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001）の各 Phase が三者同値で `completed` または `pending` に揃っている
- [ ] root `artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-N-*.md` 本文 frontmatter の 4 源で status 不一致が無い
- [ ] `validate-closeout-parity.js --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001` が exit 0 (`PARITY_OK`)

---

## 判定基準

| 判定  | 条件                                                                                                             | 後続アクション                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| PASS  | AC-1〜AC-7 全達成 / 完了条件チェック全クリア / dogfooding exit 0 / blocker 無し                                  | Phase 11（手動テスト）へ進行                       |
| MAJOR | AC 未達成 / 完了条件未達 / dogfooding exit ≠ 0 / 責務境界違反（validator が書込）/ mirror parity 差分あり        | Phase 9（品質保証）へ戻り是正                      |
| MINOR | 軽微な改善余地（line budget の余白縮小、ログ表現の統一、`--json` キー命名の揺れ等。AC・dogfooding には影響なし） | 条件付き PASS。Phase 11 開始前までに是正計画を完了 |
| INFO  | 教訓・Nice-to-have（次タスクで扱う改善案、設計上の検討メモ等）                                                   | 記録のみ。lessons-learned へ転記                   |

---

## 総合判定

```
判定結果: [ PASS / MAJOR / MINOR / INFO ]
判定日:   YYYY-MM-DD
判定者:   （実行エージェント）
判定理由: （AC・完了条件・dogfooding・blocker の根拠を詳細記述）
```

---

## 是正計画（MAJOR / MINOR の場合のみ）

| 指摘 ID                | 区分        | 指摘内容 | 是正対象 Phase | 是正内容 | 期限                           |
| ---------------------- | ----------- | -------- | -------------- | -------- | ------------------------------ |
| （MAJOR/MINOR 発生時） | MAJOR/MINOR |          |                |          | MAJOR=即時 / MINOR=Phase 11 前 |

---

## 出荷準備チェック（Phase 11 手動テスト進行可否）

- [ ] PASS 判定が記録されている（MAJOR の場合は Phase 9 戻し / MINOR の場合は是正完了確認）
- [ ] 本ワークフローの三者同値が parity validator で確認済み
- [ ] Phase 11 で必要となる手動テスト fixture（drift 系の人間目視確認シナリオ）が準備されている
- [ ] Phase 12 の完了チェックリスト反映計画が確定している

---

## 統合テスト連携

本 Phase はゲート判定であり、単体テストを新規実行しないが、次の統合確認を行う。

| 統合確認項目                                             | 参照元 Phase    | 判定根拠                      |
| -------------------------------------------------------- | --------------- | ----------------------------- |
| AC-1〜AC-7 の根拠テスト結果                              | Phase 4 / 6 / 7 | `traceability-matrix.md`      |
| 品質ゲート 10 項目の PASS                                | Phase 9         | `quality-assurance-report.md` |
| dogfooding（本ワークフロー自身に parity validator 適用） | Phase 9         | exit 0 / `PARITY_OK` の実測   |
| mirror parity（`.claude/` ↔ `.agents/`）                 | Phase 8 / 9     | `diff -qr` の 0 件出力        |
| Phase 3 MINOR 指摘の全解決                               | Phase 3 / 9     | `gate-decision.md` との突合   |

Phase 11 へ進める判定は本表が全 PASS であることが必須。MAJOR 指摘があれば Phase 9 に戻し、MINOR 指摘は Phase 11 開始前までに是正させる。

## 成果物

- `outputs/phase-10/final-review-result.md`
  - AC-1〜AC-7 の判定結果と根拠リンク
  - 完了条件チェックリストの判定
  - dogfooding 結果
  - 総合判定（PASS / MAJOR / MINOR / INFO）と判定理由
  - 是正計画（該当時）
- `outputs/phase-10/shipping-checklist.md`
  - Phase 11 進行可否の最終チェックリスト
  - Phase 12 への引継事項

---

## 完了条件

- [ ] AC-1〜AC-7 が全て達成されている
- [ ] 完了条件チェックリストが全クリア
- [ ] Dogfooding が exit 0 で成立
- [ ] PASS / MAJOR / MINOR / INFO のいずれかが判定記録されている
- [ ] 出荷準備チェックリストが完成

---

## タスク100%実行確認【必須】

- [ ] AC-1〜AC-7 全確認完了
- [ ] 完了条件チェックリスト確認完了
- [ ] Dogfooding 確認完了（exit 0）
- [ ] 責務境界（validator read-only / writer 単独）確認完了
- [ ] Mirror parity 確認完了
- [ ] 総合判定記録完了
- [ ] 是正計画作成完了（該当時）
- [ ] 出荷準備チェック完了
- [ ] 成果物 2 ファイル出力完了
- [ ] Phase 10 ステータスを三者同値で `completed` に更新（自己 dogfooding）

---

## 次Phase

- PASS → Phase 11（手動テスト）へ進む
- MAJOR → Phase 9（品質保証）へ戻り是正後、本 Phase 10 を再実行
- MINOR → Phase 11 開始前までに是正計画を完了させたうえで Phase 11 へ進む
- INFO → 記録のみ実施し Phase 11 へ進む
