# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 9                                                |
| タスクID     | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク名     | snake_case v1 系 EVALS スキーマを正本へ追記      |
| タスク種別   | docs-only / NON_VISUAL                           |
| ステータス   | completed                                        |
| 作成日       | 2026-04-21                                       |
| GitHub Issue | #2326 (CLOSED)                                   |
| 前Phase      | 8: リファクタリング                              |
| 次Phase      | 10: 最終レビュー                                 |

---

## 目的

docs-only タスクの品質ゲートとして、`evals-schema-spec.md` の追記内容が
**整合性・完全性・明瞭性**の 3 軸を満たしていることを確認する。

5 つの品質ゲート（QG-1〜QG-5）を順番に検証し、全て PASS した場合のみ Phase 10 へ進む。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: QG-1 — `levels.{N}` 構造の完全性確認

**目的**: `levels.{N}` ツリー構造の定義が型・意味・writer・reader を含む完全な状態であることを検証する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` の §3 を開く
2. `levels` の定義において以下の要素が揃っているか確認する

**完全性チェックリスト（QG-1）**:

- [ ] レベル番号文字列キーまたは一般化表現が明記されている
- [ ] `levels` が静的オブジェクトとして説明されている
- [ ] 子フィールドの型定義が全て揃っている
- [ ] 未保持スキルの扱いが記載されている
- [ ] `writer`（書き込み側）が明示されている
- [ ] `reader`（読み取り側）が明示されている
- [ ] `required` / `optional` の区別が記載されている

3. 不足項目がある場合は `quality-gate-report.md` に記録し、該当箇所へ戻って修正する

**検証コマンド**:

```bash
rg -n "levels" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

**合格基準**: 全チェック項目が満たされていること

**期待される成果物**:

- `outputs/phase-9/quality-gate-report.md` の QG-1 セクション

---

### タスク2: QG-2 — `average_satisfaction` 独立セクション確認

**目的**: `average_satisfaction` フィールドが独立したセクションで定義されていることを検証する

**実行手順**:

1. `evals-schema-spec.md` を開き、`average_satisfaction` の定義箇所を確認する
2. 以下の要素が揃っているか確認する

**完全性チェックリスト（QG-2）**:

- [ ] `average_satisfaction` が独立したセクション（小見出し）として定義されている
- [ ] フィールドの型（number / float）が明記されている
- [ ] 算出方法または意味（例: ユーザー満足度スコアの平均値）が説明されている
- [ ] v1 固有フィールドである旨が明記されている
- [ ] v2 への対応状況（対応なし、または別 task で追跡中）が記載されている

3. 不足項目がある場合は `quality-gate-report.md` に記録し、修正する

**検証コマンド**:

```bash
rg -n "average_satisfaction" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

**合格基準**: `average_satisfaction` が独立セクションに存在し、全チェック項目が満たされていること

**期待される成果物**:

- `outputs/phase-9/quality-gate-report.md` の QG-2 セクション

---

### タスク3: QG-3 — v2 対照テーブルの更新確認

**目的**: camelCase v2 との対照テーブルに v1 固有フィールドが追加されていることを検証する

**実行手順**:

1. `evals-schema-spec.md` の v2 対照テーブルを確認する
2. 以下を確認する

**完全性チェックリスト（QG-3）**:

- [ ] 対照テーブルに `levels.{N}` が追加されている
- [ ] 対照テーブルに `average_satisfaction` が追加されている
- [ ] 各フィールドに「v2 では対応なし」または「v2 では `{camelCaseName}` に相当」の注記がある
- [ ] 対照テーブルが断定的ではなく「両立スタイル」の記述になっている

3. 不足項目がある場合は `quality-gate-report.md` に記録し、修正する

**検証コマンド**:

```bash
rg -n "levels\|average_satisfaction" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

**合格基準**: 対照テーブルに両フィールドが追加され、v2 との関係が記述されていること

**期待される成果物**:

- `outputs/phase-9/quality-gate-report.md` の QG-3 セクション

---

### タスク4: QG-4 — dual root parity 確認

**目的**: `.claude/skills` と `.agents/skills` の `evals-schema-spec.md` が bit-for-bit で一致していることを検証する

**実行手順**:

1. 以下のコマンドを実行する

```bash
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

2. 差分が検出された場合は内容を確認する
3. `evals-schema-spec.md` に差分がある場合は `.agents/skills` 側を更新して再確認する
4. 差分なしを確認したら結果を `quality-gate-report.md` に記録する

**合格基準**: `diff -qr` の出力が空（差分なし）であること

**期待される成果物**:

- `outputs/phase-9/quality-gate-report.md` の QG-4 セクション（コマンド出力を貼り付け）

---

### タスク5: QG-5 — 既存 §2 の破壊確認

**目的**: camelCase v2 の既存記述（§2）が Phase 5〜8 の作業によって意図せず変更されていないことを検証する

**実行手順**:

1. `git diff` を用いて `evals-schema-spec.md` の変更差分を確認する

```bash
git diff HEAD -- .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

2. 差分を精査し、§2（camelCase v2 の定義セクション）への変更がないことを確認する
3. §2 への変更がある場合は意図した変更かどうかを判断し、意図しない変更は差し戻す
4. 確認結果を `quality-gate-report.md` に記録する

**合格基準**: §2 の既存記述に意図しない変更がないこと

**期待される成果物**:

- `outputs/phase-9/quality-gate-report.md` の QG-5 セクション

---

### タスク6: 品質ゲート最終判定

**目的**: QG-1〜QG-5 の結果を集約し、Phase 10 への進行可否を判定する

**実行手順**:

1. 以下の品質ゲート集計テーブルを記入する

**品質ゲート集計テーブル**:

| ゲートID | 確認内容                                            | 判定   | 備考 |
| -------- | --------------------------------------------------- | ------ | ---- |
| QG-1     | `levels.{N}` の型・意味・writer/reader が完全か     | 未判定 |      |
| QG-2     | `average_satisfaction` が独立セクションで定義済みか | 未判定 |      |
| QG-3     | v2 対照テーブルに v1 固有フィールドが追加済みか     | 未判定 |      |
| QG-4     | dual root parity が確認済みか                       | 未判定 |      |
| QG-5     | 既存 §2 の camelCase v2 記述が破壊されていないか    | 未判定 |      |

2. 全ゲートが PASS の場合のみ Phase 10 へ進む
3. FAIL ゲートがある場合は原因を特定し、該当箇所（Phase 5〜8）へ戻って修正する

**期待される成果物**:

- `outputs/phase-9/quality-gate-report.md` の最終判定セクション

---

## 参照資料

| 参照資料           | パス                                                                        | 内容                 |
| ------------------ | --------------------------------------------------------------------------- | -------------------- |
| EVALS スキーマ正本 | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`    | 品質検証対象         |
| mirror 先          | `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`    | parity 確認先        |
| Phase 8 成果物     | `outputs/phase-8/refactor-decision-log.md`                                  | リファクタリング結果 |
| 品質基準           | `.claude/skills/task-specification-creator/references/quality-standards.md` | 品質ゲート基準       |

### システム仕様（aiworkflow-requirements）

> 品質保証時に必ず以下のシステム仕様を確認し、仕様に準拠した状態であることを最終確認してください。

| 参照資料           | パス                                                                     | 内容                   |
| ------------------ | ------------------------------------------------------------------------ | ---------------------- |
| EVALS スキーマ正本 | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` | v1/v2 対照テーブル確認 |

---

## 実行手順

1. QG-1〜QG-5 を順番に実行する
2. 各 QG の結果を `quality-gate-report.md` に記録する
3. 全 QG が PASS したことを確認してタスク6（最終判定）を実施する
4. FAIL がある場合は該当 Phase へ戻る

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 9 の統合テスト連携アクション**:

- QG-1〜QG-5 の全検証コマンド（`rg`, `diff -qr`, `git diff`）を実際に実行し、出力結果を `quality-gate-report.md` に貼り付ける
- 全 QG が PASS した場合のみ Phase 10 への進行を承認する
- FAIL ゲートがある場合は、原因 Phase（5〜8）へ戻り修正後に再検証する

---

## 多角的チェック観点（AIが判断）

| 観点                   | チェック内容                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------- |
| QG の網羅性            | QG-1〜QG-5 が全て実行されており、漏れがないか                                         |
| 検証コマンドの実行有無 | `rg`, `diff -qr`, `git diff` が実際に実行され、出力が記録されているか                 |
| 判定の明示性           | 各 QG が PASS / FAIL のどちらかで明示されており、「確認中」のような曖昧な状態でないか |
| dual root の完全性     | `.claude` と `.agents` の両 `evals-schema-spec.md` が対象になっているか               |
| §2 の保護              | QG-5 で §2 の変更有無が具体的な diff 出力とともに確認されているか                     |
| v1/v2 両立表現の適切性 | v2 対照テーブルが断定的ではなく「両立スタイル」の記述になっているか                   |

---

## サブタスク管理

| サブタスクID | 内容                              | ステータス |
| ------------ | --------------------------------- | ---------- |
| ST-9-01      | QG-1: `levels.{N}` 完全性確認     | 未実施     |
| ST-9-02      | QG-2: `average_satisfaction` 確認 | 未実施     |
| ST-9-03      | QG-3: v2 対照テーブル更新確認     | 未実施     |
| ST-9-04      | QG-4: dual root parity 確認       | 未実施     |
| ST-9-05      | QG-5: 既存 §2 破壊確認            | 未実施     |
| ST-9-06      | 品質ゲート最終判定                | 未実施     |

---

## 成果物

| 成果物             | パス                                     | 内容                            |
| ------------------ | ---------------------------------------- | ------------------------------- |
| 品質ゲートレポート | `outputs/phase-9/quality-gate-report.md` | QG-1〜QG-5 の判定結果・最終判定 |

---

## 完了条件

- [ ] QG-1: `levels.{N}` の型・意味・writer/reader が完全に定義されていることを確認した
- [ ] QG-2: `average_satisfaction` が独立セクションで定義されていることを確認した
- [ ] QG-3: v2 対照テーブルに v1 固有フィールドが追加されていることを確認した
- [ ] QG-4: `diff -qr` で dual root parity を確認した（出力空）
- [ ] QG-5: `git diff` で既存 §2 の破壊がないことを確認した
- [ ] `outputs/phase-9/quality-gate-report.md` が生成されている
- [ ] 全 QG が PASS であり、Phase 10 への進行が承認されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001/phase-10-final-review.md`
