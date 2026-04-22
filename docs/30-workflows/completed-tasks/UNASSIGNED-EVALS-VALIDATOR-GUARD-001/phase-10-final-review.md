# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 10                                               |
| 機能名       | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名     | skill-fixture-runner EVALS.json スキーマ検証追加 |
| 前提Phase    | Phase 9 完了（品質保証）                         |
| 後続Phase    | Phase 11（PASS の場合）                          |
| 作成日       | 2026-04-21                                       |
| ステータス   | pending                                          |
| GitHub Issue | #2325（CLOSED）                                  |

---

## 目的

Phase 4〜9 の結果を総合し、本タスクの **acceptance criteria（AC-001〜AC-007）** と **blocker** を最終ゲートで判定する。判定区分は **PASS / MAJOR / MINOR / INFO** の 4 段階で、PASS のみ Phase 11（手動テスト）に進行可能とする。MAJOR は Phase 9 戻し、MINOR は是正計画を Phase 11 開始までに完了させる条件付き PASS、INFO は記録のみ。

---

## 実行タスク

1. AC-001〜AC-007 を Phase 4 / Phase 6 / Phase 7 / Phase 9 の結果に照合し全 PASS を確認
2. Phase 7 のカバレッジ基準（line 80%+ / branch 60%+ / function 80%+）達成を確認
3. `validate-evals.js` の L1/L2/L3 検証ロジック実装状況を確認
4. fixture EVALS.json 除外 allowlist の実装と SKILL.md への記載を確認
5. `run-all-validations.js` からの統合起動が正常動作することを確認
6. `.claude/` と `.agents/` の dual root 同期状態を `diff -u` で確認
7. blocker 判定: MAJOR / MINOR / INFO を判定基準表に従って分類
8. 出荷準備チェック（Phase 11 手動テスト進行可否）を判定
9. 成果物として `outputs/phase-10/final-review-result.md` を出力

---

## 受け入れ基準（AC）最終確認

| AC     | 確認内容                                                                          | 根拠 (Phase / 成果物)                                               | 判定 |
| ------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---- |
| AC-001 | `validate-evals.js` が L1 JSON パース検証を実行できる                             | Phase 4 TC, Phase 6 TC, Phase 7 traceability                        | [ ]  |
| AC-002 | `validate-evals.js` が L2 必須キー検証（方言許容モード）を実行できる              | Phase 4 TC, Phase 6 TC, Phase 9 統合テスト結果                      | [ ]  |
| AC-003 | `validate-evals.js` が L3 dual root 一致検証を 6 スキル全件で実行できる           | Phase 4 TC, Phase 6 TC, Phase 7 traceability                        | [ ]  |
| AC-004 | 破損 JSON / 欠落必須キー / 方言不整合 / dual root ドリフトの 4 種を検出できる     | Phase 4 TC, Phase 6 TC（エラー系テスト）, Phase 9 全テスト結果      | [ ]  |
| AC-005 | fixture EVALS.json の除外 or 特別扱い方針が実装と SKILL.md の双方に明示されている | Phase 5 実装サマリー, Phase 6 TC（fixture 除外テスト）              | [ ]  |
| AC-006 | `run-all-validations.js` から 1 コマンドで新 validator が起動する                 | Phase 4 TC, Phase 6 TC, Phase 9 統合実行ログ                        | [ ]  |
| AC-007 | `.claude/` と `.agents/` の同一 commit 更新後に `diff -u` で差分ゼロ              | Phase 6 TC（dual root 同期テスト）, Phase 8 / Phase 9 mirror parity | [ ]  |

---

## MINOR 指摘リスト

| 指摘 ID                | 区分 | 指摘内容 | 対象ファイル | 是正方針 | 期限        |
| ---------------------- | ---- | -------- | ------------ | -------- | ----------- |
| （MINOR 発生時に記録） | -    | -        | -            | -        | Phase 11 前 |

---

## 判定基準

| 判定  | 条件                                                                                        | 後続アクション                                     |
| ----- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| PASS  | AC-001〜AC-007 全達成 / 完了条件チェック全クリア / blocker 無し                             | Phase 11（手動テスト）へ進行                       |
| MAJOR | AC 未達成 / 完了条件未達 / 責務境界違反 / mirror parity 差分あり / validator exit code 不正 | Phase 9（品質保証）へ戻り是正                      |
| MINOR | 軽微な改善余地（ログ表現の統一、エラーメッセージの可読性向上等。AC・動作には影響なし）      | 条件付き PASS。Phase 11 開始前までに是正計画を完了 |
| INFO  | 教訓・Nice-to-have（次タスクで扱う改善案、設計上の検討メモ等）                              | 記録のみ。lessons-learned へ転記                   |

---

## 総合判定

```
判定結果: [ PASS / MAJOR / MINOR / INFO ]
判定日:   YYYY-MM-DD
判定者:   （実行エージェント）
判定理由: （AC・完了条件・blocker の根拠を詳細記述）
```

---

## 是正計画（MAJOR / MINOR の場合のみ）

| 指摘 ID                | 区分        | 指摘内容 | 是正対象 Phase | 是正内容 | 期限                           |
| ---------------------- | ----------- | -------- | -------------- | -------- | ------------------------------ |
| （MAJOR/MINOR 発生時） | MAJOR/MINOR |          |                |          | MAJOR=即時 / MINOR=Phase 11 前 |

---

## 統合テスト連携

本 Phase はゲート判定であり、単体テストを新規実行しないが、次の統合確認を行う。

| 統合確認項目                                          | 参照元 Phase    | 判定根拠                      |
| ----------------------------------------------------- | --------------- | ----------------------------- |
| AC-001〜AC-007 の根拠テスト結果                       | Phase 4 / 6 / 7 | `traceability-matrix.md`      |
| 品質ゲート全 PASS                                     | Phase 9         | `quality-assurance-report.md` |
| mirror parity（`.claude/` ↔ `.agents/`）確認          | Phase 8 / 9     | `diff -u` の差分ゼロ出力      |
| fixture 除外 allowlist の実装 + SKILL.md 双方明示確認 | Phase 5 / 6     | 実装ファイル + SKILL.md 照合  |
| `run-all-validations.js` 統合起動確認                 | Phase 6 / 9     | 統合テストログ                |

Phase 11 へ進める判定は本表が全 PASS であることが必須。MAJOR 指摘があれば Phase 9 に戻し、MINOR 指摘は Phase 11 開始前までに是正させる。

---

## 参照資料

- `outputs/phase-7/coverage-report.md`
- `outputs/phase-8/refactoring-log.md`
- `outputs/phase-9/quality-check-result.md`
- `outputs/phase-3/elegance-thinking-audit.md`

## 成果物

- `outputs/phase-10/final-review-result.md`
  - AC-001〜AC-007 の判定結果と根拠リンク
  - 完了条件チェックリストの判定
  - 総合判定（PASS / MAJOR / MINOR / INFO）と判定理由
  - 是正計画（該当時）

---

## UNASSIGNED-EVALS-VALIDATOR-GUARD-001 完了条件チェックリスト

### 機能要件

- [ ] `validate-evals.js` が新規追加され、L1/L2/L3 の 3 層検証を実行できる
- [ ] L1: JSON パース検証（破損 JSON を exit 1 で拒否）
- [ ] L2: 必須キー検証（方言許容モードと strict モードの切り替えあり）
- [ ] L3: dual root 一致検証（`.claude/` と `.agents/` の 6 スキル全件）
- [ ] fixture EVALS.json の除外 allowlist が実装と SKILL.md に明示されている
- [ ] `run-all-validations.js` から 1 コマンドで validator 起動可能

### 品質要件

- [ ] line 80%+ / branch 60%+ / function 80%+ を満たす
- [ ] lint / typecheck PASS
- [ ] mirror parity（`diff -u .claude/ .agents/`）が差分ゼロ
- [ ] 4 種のエラーパターン（破損 JSON / 必須キー欠落 / 方言不整合 / dual root ドリフト）が検出可能

### ドキュメント要件

- [ ] SKILL.md に fixture 除外 allowlist の方針が記載されている
- [ ] Phase 12 ドキュメント更新計画が Phase 12 に記録されている
- [ ] Issue #2325（CLOSED）が PR 本文で `Refs:` 参照されることが計画されている

---

## 完了条件

- [ ] AC-001〜AC-007 が全て達成されている
- [ ] 完了条件チェックリストが全クリア
- [ ] PASS / MAJOR / MINOR / INFO のいずれかが判定記録されている
- [ ] 出荷準備チェックが完了している

---

## タスク100%実行確認【必須】

- [ ] AC-001〜AC-007 全確認完了
- [ ] 完了条件チェックリスト確認完了
- [ ] 責務境界（validator 検証専用 / 書込なし）確認完了
- [ ] Mirror parity 確認完了（`diff -u` 差分ゼロ）
- [ ] fixture 除外 allowlist 実装 + SKILL.md 記載確認完了
- [ ] `run-all-validations.js` 統合起動確認完了
- [ ] 総合判定記録完了
- [ ] 是正計画作成完了（該当時）
- [ ] 成果物 1 ファイル出力完了（`outputs/phase-10/final-review-result.md`）

---

## 次Phase

- PASS → Phase 11（手動テスト）へ進む
- MAJOR → Phase 9（品質保証）へ戻り是正後、本 Phase 10 を再実行
- MINOR → Phase 11 開始前までに是正計画を完了させたうえで Phase 11 へ進む
- INFO → 記録のみ実施し Phase 11 へ進む
