---
phase: 6
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
status: pending
created_date: 2026-04-20
---

# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 6                                                      |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001                           |
| タスク種別 | NON_VISUAL（ドキュメント追記タスク）                   |
| 前Phase    | [phase-5-implementation.md](phase-5-implementation.md) |
| 次Phase    | phase-7-coverage.md                                    |
| 作成日     | 2026-04-20                                             |

---

## 目的

Phase 5 で追記された 5 ファイルに対して、Phase 4 で定義した TC-01〜TC-05 の **存在検証** に加え、
**形式整合・Markdown 構文・日付・lane 順序** といった回帰観点を補強する追加検証を仕様化する。
Phase 7 のカバレッジ確認、Phase 9 の品質ゲートに渡す前の最後の「形式テスト」フェーズである。

---

## 前提

- Phase 5 が完了し、TC-01〜TC-05 すべての first validation が PASS
- `outputs/phase-5/sync-execution-log.md` に Lane A/B/C の実行記録が揃っている
- `outputs/phase-4/format-fixture-snapshots.md` が fixture として参照可能

---

## 拡充観点

| 観点               | 内容                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| 形式整合（回帰）   | Phase 5 で追記したエントリが fixture と同一構造か（節数 / 表列数 / 見出し階層）         |
| Markdown 構文      | テーブル列数の一致、コードブロック開閉、見出しレベルの跳躍がないこと                    |
| 日付正確性         | 追記された全エントリに `2026-04-20` が含まれ、誤った年月日（2025 / 04-21 等）がないこと |
| lane 順序          | 親 `index.md` の Phase 12 完了宣言が両 LOGS 追記より後に行われたこと（diff の前後関係） |
| lessons-learned 系 | 3 知見が **独立した h3 エントリ** として追加されているか（1 エントリ集約禁止）          |
| 重複検知           | 同一タスクIDの重複エントリ・改行余り・空エントリがないか                                |
| 親 index.md 整合   | フロントマター `status` と Phase 一覧テーブルの Phase 12 ステータスが矛盾なく一致       |

---

## 実行タスク

### タスク1: 形式整合の回帰確認

**目的**: Phase 5 追記内容が Phase 4 fixture と構造的に同一であることを保証する。

**実行手順**:

1. `format-fixture-snapshots.md` の File 1〜5 と、Phase 5 で実際に追記された箇所を Read で並列比較
2. 各ファイルについて以下を確認:
   - File 1（task-spec-creator LOGS）: 「コンテキスト・成果・結果」3節がすべて存在
   - File 2（aiworkflow-req LOGS）: 表の列数が既存と一致（5 列）
   - File 3（task-workflow\*.md）: active / completed のセクション構造が壊れていない
   - File 4（lessons-learned）: 3 知見それぞれが独立した h3 エントリで「背景 / 学び / 適用箇所」を持つ
   - File 5（親 index.md）: フロントマター + Phase 一覧テーブルの両方が更新済
3. 形式逸脱が 1 件でも検出された場合、該当 Lane に差し戻し再追記

**期待される成果物**:

- `outputs/phase-6/format-regression-check.md` に「File 1〜5 × 形式整合判定（PASS / FAIL）」を記録

---

### タスク2: Markdown 構文・日付・重複の補助検証

**目的**: 既存 grep ベース TC では検出されない構文・日付・重複の不整合を捕捉する。

**実行手順**:

1. **Markdown 構文**: 追記対象 5 ファイルに対して以下を実行
   ```bash
   # テーブル列数の不揃い検出（| の数が前後行で異なる箇所）
   awk -F'|' '/^\|/ { print NF, FILENAME, NR }' \
     .claude/skills/aiworkflow-requirements/LOGS.md \
     docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
   ```
2. **日付正確性**: 誤った日付の混入有無を確認
   ```bash
   # 2026-04-20 以外の本タスク関連日付混入を検出
   grep -rn "2026-04-1[0-9]\|2026-04-2[1-9]\|2025-" \
     .claude/skills/task-specification-creator/LOGS.md \
     .claude/skills/aiworkflow-requirements/LOGS.md \
     .claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md
   ```
   ※既存エントリの過去日付はヒットして良い。**Phase 5 で追記した行**にのみ着目して判定
3. **重複検知**: 同一タスクIDが意図せず複数エントリ追加されていないかを確認
   ```bash
   grep -c "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
     .claude/skills/task-specification-creator/LOGS.md \
     .claude/skills/aiworkflow-requirements/LOGS.md
   ```
   期待: 各ファイル 1 件（既存欠落から 1 件追記）。2 件以上は重複疑いとして要確認
4. 検出結果を `format-regression-check.md` に記録

**期待される成果物**:

- `format-regression-check.md` の「補助検証セクション」に Markdown 構文 / 日付 / 重複の判定結果を記録

---

### タスク3: lane 順序と親 index.md 整合の検証

**目的**: Lane A/B → Lane C の実行順序が守られ、親 index.md の更新が両 LOGS 追記より後に行われたことを保証する。

**実行手順**:

1. `outputs/phase-5/sync-execution-log.md` を Read し、Lane A/B/C のタイムスタンプ（または記録順）を確認
2. Lane C のエントリが Lane A・Lane B より後に位置していることを確認
3. 親 `index.md` のフロントマター `status` と Phase 一覧テーブルの Phase 12 行が **同じ完了状態** を示しているか確認
   - 例: フロントマター `status: completed` かつ Phase 12 行も `completed` となっていること
   - フロントマターと表の片方だけ更新されている場合は Lane C への差し戻し
4. Phase 13 行が `blocked` のまま維持されていることを確認（user 承認待ちのため `pending` への変更は誤り）
5. 整合判定を `format-regression-check.md` に記録

**期待される成果物**:

- `format-regression-check.md` の「lane 順序・親 index.md 整合セクション」

---

## 検証コマンド（拡充分）

```bash
# 1. 形式整合の補助確認: aiworkflow-req LOGS の表列数の一貫性
grep -c "^|" .claude/skills/aiworkflow-requirements/LOGS.md

# 2. lessons-learned の 3 知見が独立 h3 として追加されたか
grep -nE "^### " \
  .claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md \
  | tail -20

# 3. 親 index.md のフロントマターと Phase 12 行の整合
grep -nE "^status:|^current_phase:|Phase 12" \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md

# 4. Phase 13 行が blocked のままであること
grep -n "Phase 13.*blocked\|blocked.*Phase 13" \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
```

---

## 参照資料

| 資料                                                   | 用途                            |
| ------------------------------------------------------ | ------------------------------- |
| [phase-5-implementation.md](phase-5-implementation.md) | 追記済み対象と first validation |
| `outputs/phase-5/sync-execution-log.md`                | 実行順序と差分の把握            |
| `outputs/phase-4/format-fixture-snapshots.md`          | 形式回帰時の比較基準            |
| `outputs/phase-4/verification-commands.md`             | TC と AC の対応再確認           |

---

## 統合テスト連携

| 判定項目              | 基準                                 | 結果記録先                   |
| --------------------- | ------------------------------------ | ---------------------------- |
| 形式整合（File 1〜5） | 形式逸脱 0                           | `format-regression-check.md` |
| Markdown 構文         | テーブル列数 / 見出し / コード崩れ 0 | 同上                         |
| 日付正確性            | `2026-04-20` 統一・誤日付 0          | 同上                         |
| 重複検知              | 同一タスクIDの意図しない重複 0       | 同上                         |
| lane 順序             | A/B → C の順序が log で証明可能      | 同上                         |
| 親 index.md 整合      | frontmatter ↔ Phase 一覧テーブル一致 | 同上                         |
| Phase 13 blocked 維持 | `blocked` 表記が維持されている       | 同上                         |

> 1 件でも FAIL があれば Phase 5（実装）または該当 Lane に差し戻す。差し戻し後は Phase 6 を再実行する。

---

## 成果物

| 成果物                  | パス                                         | 内容                                                                            |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| format regression check | `outputs/phase-6/format-regression-check.md` | 形式整合 / Markdown 構文 / 日付 / 重複 / lane 順序 / 親 index.md 整合の判定結果 |

---

## 完了条件

- [ ] File 1〜5 すべての形式整合判定が PASS
- [ ] Markdown 構文（テーブル列数・コード開閉・見出し階層）に逸脱がない
- [ ] 追記行に `2026-04-20` 以外の本タスク関連日付が混入していない
- [ ] 同一タスクIDの意図しない重複エントリがない
- [ ] Lane A/B → Lane C の順序が `sync-execution-log.md` から確認できる
- [ ] 親 `index.md` のフロントマターと Phase 12 行が同じ完了状態
- [ ] Phase 13 行が `blocked` のまま維持されている
- [ ] `format-regression-check.md` にすべての判定結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 検証方法

1. `outputs/phase-6/format-regression-check.md` を Read し、各判定が PASS であることを確認
2. 上記「検証コマンド（拡充分）」の 4 コマンドを実行し、出力結果が成果物と一致することを確認
3. `format-fixture-snapshots.md` と Phase 5 追記箇所を並列で Read し、形式構造の同一性を最終目視確認

---

## 次Phase

phase-7-coverage.md — Issue #2313「未実施」6 項目すべてに対する追記対応のカバレッジ確認
