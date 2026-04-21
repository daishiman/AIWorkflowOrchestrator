# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 10                                               |
| タスクID     | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク名     | snake_case v1 系 EVALS スキーマを正本へ追記      |
| タスク種別   | docs-only / NON_VISUAL                           |
| ステータス   | completed                                        |
| 作成日       | 2026-04-21                                       |
| GitHub Issue | #2326 (CLOSED)                                   |
| 前Phase      | 9: 品質保証                                      |
| 次Phase      | 11: 手動テスト                                   |

---

## 目的

`index.md` に定義された受入基準（AC-1〜AC-5）との照合を実施し、
各基準を PASS / MINOR / MAJOR のいずれかで判定する。
MINOR 判定がある場合は追跡テーブルを作成し、修正完了後に Phase 11 へ進む。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受入基準 AC-1〜AC-5 の最終判定

**目的**: index.md に定義された全受入基準を証跡付きで判定する

**実行手順**:

1. `docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/index.md` の受入基準セクションを開く
2. 以下の照合マトリクスを記入する（証跡は各 Phase の outputs を参照）

**照合マトリクス**:

| ID   | 受入基準                                                                                      | 判定   | 証跡                                     |
| ---- | --------------------------------------------------------------------------------------------- | ------ | ---------------------------------------- |
| AC-1 | `levels.{N}` のツリー構造が型・意味・writer/reader を含む完全な定義として §3 に追記されている | 未判定 | `outputs/phase-9/quality-gate-report.md` |
| AC-2 | `average_satisfaction` が独立セクションで型・意味・v1 固有フラグとともに定義されている        | 未判定 | `outputs/phase-9/quality-gate-report.md` |
| AC-3 | v2 対照テーブルに v1 固有フィールド（`levels.{N}`, `average_satisfaction`）が追加されている   | 未判定 | `outputs/phase-9/quality-gate-report.md` |
| AC-4 | camelCase v2 との関係が断定なし・両立スタイルで記述されている                                 | 未判定 | `outputs/phase-9/quality-gate-report.md` |
| AC-5 | `.claude/skills` と `.agents/skills` の dual root parity が `diff -qr` で確認されている       | 未判定 | `outputs/phase-9/quality-gate-report.md` |

3. 各 AC について以下の基準で判定する

**判定基準**:

| 判定  | 条件                                                         |
| ----- | ------------------------------------------------------------ |
| PASS  | 受入基準を完全に満たしており、証跡が確認できる               |
| MINOR | 軽微な不足があるが、追記・修正で対応可能かつ設計の破綻がない |
| MAJOR | 受入基準を満たしておらず、前 Phase への戻りが必要            |

4. 判定結果を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の AC 照合セクション

---

### タスク2: MINOR 追跡テーブルの作成（MINOR 判定がある場合）

**目的**: MINOR 判定となった受入基準について修正内容と追跡状態を管理する

**実行手順**:

1. タスク1 で MINOR 判定となった AC があるか確認する
2. MINOR 判定がある場合のみ以下のテーブルを作成し `final-review-result.md` に記録する

**MINOR 追跡テーブル（MINOR がある場合のみ作成）**:

| AC-ID | 不足内容 | 修正方針 | 修正担当 Phase | 修正状態 |
| ----- | -------- | -------- | -------------- | -------- |
|       |          |          |                | 未修正   |

3. MINOR 判定が 0 件の場合は「MINOR 判定なし」と記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の MINOR 追跡テーブルセクション

---

### タスク3: 出荷判定

**目的**: AC-1〜AC-5 の照合結果を集約し、Phase 11 への進行可否を判定する

**実行手順**:

1. タスク1〜2 の結果を集約する
2. 以下の出荷判定基準に照らして判定する

**出荷判定基準**:

| 判定     | 条件                                                    | 次アクション                   |
| -------- | ------------------------------------------------------- | ------------------------------ |
| 出荷可   | AC-1〜AC-5 が全て PASS、または MINOR のみで修正完了済み | Phase 11 へ進行                |
| 条件付き | MINOR があり修正未完了                                  | MINOR 修正後に Phase 11 へ進行 |
| 出荷不可 | MAJOR が 1 件以上                                       | 原因 Phase（5〜9）へ戻り再実施 |

3. 「出荷可」の場合：`final-review-result.md` に判定根拠を記録し Phase 11 へ進む
4. 「条件付き」の場合：MINOR 修正を完了させてから Phase 11 へ進む
5. 「出荷不可」の場合：MAJOR の原因 Phase を特定し、戻り先を `final-review-result.md` に記録する

**戻り先決定基準**:

| 問題の種類                                             | 戻り先  |
| ------------------------------------------------------ | ------- |
| AC-1 未達（`levels.{N}` 定義不完全）                   | Phase 5 |
| AC-2 未達（`average_satisfaction` 独立セクション不足） | Phase 5 |
| AC-3 未達（v2 対照テーブル未更新）                     | Phase 5 |
| AC-4 未達（断定的記述が残存）                          | Phase 8 |
| AC-5 未達（dual root parity 不一致）                   | Phase 8 |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の出荷判定セクション

---

## 参照資料

| 参照資料             | パス                                                                          | 内容                  |
| -------------------- | ----------------------------------------------------------------------------- | --------------------- |
| 受入基準（index.md） | `docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/index.md` | AC-1〜AC-5 の定義     |
| Phase 9 品質ゲート   | `outputs/phase-9/quality-gate-report.md`                                      | QG-1〜QG-5 の判定結果 |
| Phase 8 成果物       | `outputs/phase-8/refactor-decision-log.md`                                    | リファクタリング結果  |
| EVALS スキーマ正本   | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`      | 最終確認対象          |

---

## 実行手順

1. Phase 9 の `quality-gate-report.md` を参照して AC-1〜AC-5 の証跡を確認する
2. 各 AC を PASS / MINOR / MAJOR で判定し、照合マトリクスに記入する
3. MINOR がある場合は追跡テーブルを作成する
4. 出荷判定を実施し、結果を `final-review-result.md` に記録する

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 10 の統合テスト連携アクション**:

- AC-1〜AC-5 の全照合を、Phase 9 の QG 検証コマンド出力を証跡として実施する
- dual root parity（AC-5）は `diff -qr` コマンド出力を必ず引用する
- 「出荷可」判定の場合のみ Phase 11 へ進行する
- MAJOR 判定がある場合は原因 Phase へ戻り、Phase 9 から再度品質ゲートを通過させる

---

## 多角的チェック観点（AIが判断）

| 観点                 | チェック内容                                                                 |
| -------------------- | ---------------------------------------------------------------------------- |
| AC 照合の網羅性      | AC-1〜AC-5 を全て証跡付きで照合しており、漏れがないか                        |
| 判定の明示性         | 各 AC が PASS / MINOR / MAJOR のいずれかで明示されており、曖昧な状態でないか |
| MINOR 追跡の完全性   | MINOR がある場合、修正内容・担当 Phase・修正状態が全て記録されているか       |
| dual root の証跡     | AC-5 の判定に `diff -qr` の実際の出力が添付されているか                      |
| 出荷判定の論理整合性 | 全 AC が PASS なのに「条件付き」になっていないか、等の論理矛盾がないか       |
| 戻り先の適合性       | MAJOR の場合の戻り先が「戻り先決定基準」テーブルに沿って決定されているか     |

---

## サブタスク管理

| サブタスクID | 内容                               | ステータス |
| ------------ | ---------------------------------- | ---------- |
| ST-10-01     | AC-1〜AC-5 の照合マトリクス記入    | 未実施     |
| ST-10-02     | MINOR 追跡テーブルの作成（該当時） | 未実施     |
| ST-10-03     | 出荷判定                           | 未実施     |

---

## 成果物

| 成果物           | パス                                      | 内容                          |
| ---------------- | ----------------------------------------- | ----------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC 照合・MINOR 追跡・出荷判定 |

---

## 完了条件

- [ ] AC-1〜AC-5 の全受入基準が証跡付きで照合されている
- [ ] 各 AC が PASS / MINOR / MAJOR で明示されている
- [ ] MINOR がある場合は追跡テーブルが作成されている
- [ ] 出荷判定が「出荷可」または「MINOR 修正後 出荷可」になっている
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] Phase 11 への進行が承認されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/phase-11-manual-test.md`
