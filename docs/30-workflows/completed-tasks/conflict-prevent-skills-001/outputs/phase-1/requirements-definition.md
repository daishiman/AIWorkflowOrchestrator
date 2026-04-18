# Phase 1 Output: 要件定義

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-CONFLICT-PREVENT-001 |
| Phase      | 1                         |
| 作成日     | 2026-04-18                |
| ステータス | completed                 |

## 概要

`.claude/skills/` と `.agents/skills/` のコンフリクト防止仕様を再設計する。  
競合源を4分類（G1〜G4）に分解し、分類別の merge policy と regenerate 運用を定義することが本タスクの根幹要件である。

---

## 受入基準（AC-1〜AC-6）

| ID   | 受入基準                                                                                                                                              | 種別             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| AC-1 | 13 Phase すべてが `task-specification-creator` の必須セクション（メタ情報・目的・実行タスク・成果物・完了条件）を満たす                               | 骨格             |
| AC-2 | `merge=ours` を使う箇所では custom merge driver の登録が必須であることを仕様に明記し、Git 組み込みの `ours` strategy と混同しない                     | Git仕様          |
| AC-3 | `.claude/skills/` を canonical（正本）、`.agents/skills/` を mirror として責務を分離し、Phase 2/5/9/12 で一貫した wording を維持する                  | canonical/mirror |
| AC-4 | generated index（`indexes/*.md`, `indexes/*.json`）に deterministic regenerate 導線（post-merge hook または Phase 12 close-out 手順）が設計されている | regenerate       |
| AC-5 | `topic-map.md` の日付ヘッダー（`> 自動生成: YYYY-MM-DD`）を除去して non-deterministic diff を解消しつつ、行番号索引契約（discoverability）は維持する  | deterministic    |
| AC-6 | `EVALS.json` の schema はこの task で変更しない。本 wave では JSON 向け merge policy の定義のみとし、schema 変更は follow-up タスクへ分離する         | scope            |

---

## 競合防止の本質的要件

### R-1: custom merge driver bootstrap の必須化

`.gitattributes` に `merge=ours` と記述しても、`git config merge.ours.driver true` が未設定の場合は custom driver として機能しない。  
Git 組み込みの `-s ours` strategy とは別物であり、設定手順を repo bootstrap（`session-init.sh` または README セットアップ節）に含めることが必要である。

### R-2: regenerate 導線の設計

generated index は merge 後に内容が陳腐化するため、以下の2経路で regenerate 導線を設計する。

1. **post-merge hook**: `generate-index.js` を自動実行する `.git/hooks/post-merge`
2. **Phase 12 close-out 手順**: wave 完了時に手動 regenerate + artifacts parity チェックを実施する

### R-3: canonical / mirror 分離の明文化

| 役割              | パス              | 操作                                           |
| ----------------- | ----------------- | ---------------------------------------------- |
| canonical（正本） | `.claude/skills/` | 読み書き両方。変更はここで行う                 |
| mirror            | `.agents/skills/` | 読み取り専用。canonical の sync により更新する |

mirror への直接変更は禁止し、canonical を更新してから sync スクリプトで伝播させる。

---

## 本 wave と follow-up の境界

### 本 wave で扱う範囲

| 対象                 | 内容                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| G1 generated index   | `.gitattributes` の `merge=ours` 設定、custom driver bootstrap、`topic-map.md` 日付除去 |
| G2 mirror tree       | `.gitattributes` の `merge=ours` 設定、canonical/mirror policy の明文化                 |
| G3 append-only log   | `merge=union` 設定（built-in、custom driver 不要）、archive policy の記述               |
| G4 volatile metadata | `EVALS.json` の `merge=ours` 設定のみ（schema 変更なし）                                |
| 骨格整備             | 13 Phase の必須セクション補完、artifacts parity                                         |

### follow-up タスクへ分離する範囲

| 対象                                      | 理由                                          |
| ----------------------------------------- | --------------------------------------------- |
| `EVALS.json` の schema 変更               | consumer 監査なしに変更すると副作用が読めない |
| `.agents/skills/` の廃止                  | 廃止判断には全 consumer の棚卸しが必要        |
| CI enforcement（merge driver 未設定検出） | 本 wave のスコープを docs-only に限定するため |

---

## 4条件の判定結果

| 条件         | 判定 | 根拠                                                                 |
| ------------ | ---- | -------------------------------------------------------------------- |
| 矛盾なし     | OK   | AC-2 で `merge=ours` の built-in 誤認を解消                          |
| 漏れなし     | OK   | AC-1〜AC-6 が G1〜G4 の全分類と Phase 骨格を網羅                     |
| 整合性あり   | OK   | AC-3 で canonical/mirror wording を統一                              |
| 依存関係整合 | OK   | R-1 bootstrap → R-2 regenerate → R-3 mirror 分離の順序で依存が一方向 |
