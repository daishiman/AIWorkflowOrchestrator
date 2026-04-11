# Phase 12: 未タスク検出 - UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

## メタ情報

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 作成日   | 2026-04-11                                    |

---

## 判定結果

- 重大未タスク: 1 件
- 軽微な改善候補: 1 件

---

## 重大未タスク

| 対象        | 内容                                                                                         | 影響度 | 対応方針                                                             |
| ----------- | -------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| root ledger | repo root の `artifacts.json` と `outputs/artifacts.json` が current task に同期されていない | 高     | 次 wave で ledger sync を行い、Phase 12 の parity check を成立させる |

### 影響の整理

- Phase 12 の事前チェックにある parity 条件をそのままは満たせない
- canonical 6 成果物は current task 版に揃えたが、台帳側の正本が旧 task のまま残る
- 以降の close-out で「何が正本か」がぶれやすい

---

## 軽微な改善候補

| 対象                       | 内容                                                                    | 影響度 | 対応方針                                    |
| -------------------------- | ----------------------------------------------------------------------- | ------ | ------------------------------------------- |
| UI shared label generation | `CATEGORY_VALUES` が `SkillInfoStep` / `DescribeStep` でまだ 2 箇所ある | 低     | 将来は 1 箇所へ寄せるか、共有順序定数を切る |

---

## 確認観点

| 観点                 | 判定 | 根拠                                                                  |
| -------------------- | ---- | --------------------------------------------------------------------- |
| shared label mapping | PASS | `skillCreator.ts` の canonical helper に集約済み                      |
| Step 0 UI            | PASS | `SkillInfoStep` が canonical label を直接利用                         |
| deprecated step      | PASS | `DescribeStep` も canonical label を利用し、`コード支援` drift を解消 |
| テスト追加           | PASS | union 固定テストと option 表示テストを追加                            |
| ledger parity        | FAIL | root ledger が current task に同期されていない                        |

---

## 結論

実装を止めるべき未タスクは 1 件だけ残った。  
コードと UI の label drift は解消済みだが、台帳の同期が終わるまで Phase 12 の最終合格は保留とする。
