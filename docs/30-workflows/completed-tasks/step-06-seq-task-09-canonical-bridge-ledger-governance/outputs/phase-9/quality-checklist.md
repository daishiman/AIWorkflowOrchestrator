# Phase 9 成果物: 品質検証チェックリスト

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 9 - 品質検証

## 1. 概要

本ファイルは Phase 9（品質検証）における最終確認項目を4軸（契約・UX・security・performance）で定義する。
設計タスクのため「Lint」「テスト実行」は設計文書の構造検証で代替する。

---

## 2. 契約品質チェック

### 2.1 AC 充足確認

| チェック項目                                     | 検証コマンド / 手順                                                                         | PASS 条件     | 結果 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------- | ---- |
| AC-1: canonical source table が存在する          | `grep -c "カテゴリ" outputs/phase-2/design-summary.md`                                      | 5行以上ヒット | PASS |
| AC-1: bridge rule が定義されている               | `grep -c "Bridge Rule" outputs/phase-2/design-summary.md`                                   | 1行以上ヒット | PASS |
| AC-2: State 遷移が定義されている                 | `grep -c "spec_created\|implementation_ready\|completed" outputs/phase-2/design-summary.md` | 3行以上ヒット | PASS |
| AC-2: type 別条件テーブルが存在する              | `grep -c "type: design\|type: implementation" outputs/phase-2/contract-matrix.md`           | 2行以上ヒット | PASS |
| AC-3: Phase 12 同期チェックリストが存在する      | `grep -c "Step A\|Step B\|Step C\|Step D\|Step E" outputs/phase-2/design-summary.md`        | 5行以上ヒット | PASS |
| AC-3: 3ファイル/エージェント制約が明記されている | `grep -c "最大3ファイル/エージェント\|P43" outputs/phase-2/design-summary.md`               | 2行以上ヒット | PASS |
| AC-4: Follow-up 3ステップが定義されている        | `grep -c "Step 1\|Step 2\|Step 3" outputs/phase-2/design-summary.md`                        | 3行以上ヒット | PASS |
| AC-4: current/baseline 移管条件が記載されている  | `grep -c "wave 完了\|Current\|Baseline" outputs/phase-2/design-summary.md`                  | 3行以上ヒット | PASS |

### 2.2 FR 充足確認

| FR ID  | 充足確認方法                                 | PASS 条件                                                           | 結果 |
| ------ | -------------------------------------------- | ------------------------------------------------------------------- | ---- |
| FR-1.1 | canonical source table の table 存在確認     | design-summary.md に table が存在する                               | PASS |
| FR-1.2 | canonical path の記載確認                    | `.claude/skills/` パスが明記されている                              | PASS |
| FR-1.3 | 責務・権限者・タイミング列の値確認           | contract-matrix.md の Ownership 表に3列存在                         | PASS |
| FR-2.1 | legacy register と source table の cross-ref | design-summary.md に legacy-ordinal-family-register.md への言及あり | PASS |
| FR-2.2 | bridge rule 文書の存在確認                   | design-summary.md 3.2節に bridge rule table あり                    | PASS |
| FR-2.3 | deprecation timeline の記載確認              | 「無期限保持」が設計判断として明記されている                        | PASS |
| FR-3.1 | 成果物ベース条件の記載確認                   | contract-matrix.md に outputs/ パスが条件として記載                 | PASS |
| FR-3.2 | type 別条件テーブルの存在確認                | contract-matrix.md 1.2節に type 別テーブルあり                      | PASS |
| FR-3.3 | MINOR 遷移パスの記載確認                     | design-summary.md 2.3節に MINOR パス記載あり                        | PASS |
| FR-3.4 | rollback 手順の記載確認                      | design-summary.md 2.4節に rollback 3段階あり                        | PASS |
| FR-4.1 | Phase 12 同期チェックリストの存在確認        | design-summary.md 4.1節に Step A〜E あり                            | PASS |
| FR-4.2 | 同期対象ファイルリスト確認（5カテゴリ以上）  | design-summary.md 3.1節に5カテゴリの table あり                     | PASS |
| FR-4.3 | 3ファイル/エージェント制約の記載確認         | 複数箇所に「最大3ファイル/エージェント（P43）」あり                 | PASS |
| FR-4.4 | rsync + diff コマンドの記載確認              | design-summary.md 3.2節に command example あり                      | PASS |
| FR-5.1 | 3ステップ手順の記載確認                      | design-summary.md 4.3節に Step 1〜3 あり                            | PASS |
| FR-5.2 | 設計タスク例外なし条件の記載確認             | 「設計タスクでも省略不可（P58）」と明記                             | PASS |
| FR-5.3 | current → baseline 移管条件の記載確認        | design-summary.md 4.4節に wave 完了条件あり                         | PASS |
| FR-5.4 | gh issue close 手順の記載確認                | design-summary.md 4.3節に Issue Sync 行あり                         | PASS |

### 2.3 禁止アクション網羅確認

| 禁止アクション                | contract-matrix.md に記載済みか | 代替手段が空でないか | 結果 |
| ----------------------------- | ------------------------------- | -------------------- | ---- |
| silent fallback               | YES                             | YES（明示的エラー）  | PASS |
| local 判定のみでの state 遷移 | YES                             | YES（gate executor） | PASS |
| no-op（同期スキップ）         | YES                             | YES（0件記録）       | PASS |
| .agents/ の直接編集           | YES                             | YES（mirror sync）   | PASS |
| LOGS.md 片方のみ更新          | YES                             | YES（2ファイル同時） | PASS |

---

## 3. UX（文書利用者の体験）品質チェック

設計文書の利用者（将来の Phase 12 実行者）の観点で検証する。

| チェック項目                                  | 確認方法                                               | PASS 条件                                    | 結果                        |
| --------------------------------------------- | ------------------------------------------------------ | -------------------------------------------- | --------------------------- |
| 曖昧表現ゼロ                                  | 「適切に」「必要に応じて」「など」を grep で検索       | ヒット0件                                    | PASS                        |
| table 形式の網羅                              | 各 md ファイルに table が1つ以上存在するか確認         | 全8ファイルに table あり                     | PASS                        |
| 検証コマンドが bash レベルで再現可能          | コマンドブロックに実際に実行可能なコマンドが含まれるか | validation-matrix.md の全7コマンドが実行可能 | PASS                        |
| Phase 12 実行者がこの設計書だけで作業できるか | design-summary.md + contract-matrix.md を通読して確認  | 外部参照なしで Step A〜E が実行できる        | PASS                        |
| NFR-1.1: 中学生レベルの概念説明が含まれるか   | phase-12-documentation.md の Part 1 セクションを確認   | 日常的なアナロジーが少なくとも1つある        | 未確認（Phase 12 スコープ） |
| NFR-2.1: 曖昧表現ゼロ                         | 上述の grep 検索で代替                                 | ヒット0件                                    | PASS                        |

### 3.1 可読性スコア（Phase 3 設計品質スコアとの整合）

| 評価軸       | Phase 3 スコア | Phase 9 再評価         | 変化     |
| ------------ | -------------- | ---------------------- | -------- |
| 網羅性       | 100%           | 100%                   | 変化なし |
| 決定論性     | 高             | 高                     | 変化なし |
| Pitfall 対策 | 高             | 高                     | 変化なし |
| Simpler Alt  | 十分           | Phase 8 で増強         | 向上     |
| 可読性       | 高             | Phase 8 で表記統一済み | 向上     |

---

## 4. セキュリティ品質チェック

設計タスクのため、IPC ハンドラ・CSP・認証フローの変更はない。
ただし、設計文書がセキュリティ上のリスク情報（APIキー・パス）を露出していないことを確認する。

| チェック項目                                             | 確認方法                                | PASS 条件                                | 結果 |
| -------------------------------------------------------- | --------------------------------------- | ---------------------------------------- | ---- |
| APIキー・トークンが設計文書に含まれないこと              | 全 outputs/ ファイルを grep で確認      | `grep -ri "apikey\|token\|secret"` が0件 | PASS |
| 実際のユーザーパス（/Users/username 等）が含まれないこと | `grep -ri "/Users/" outputs/` を実行    | 0件または `[username]` 形式のみ          | PASS |
| .agents/ 直接編集の防止ルールが明記されている            | contract-matrix.md の禁止アクション確認 | 禁止アクション表に記載あり               | PASS |
| Canonical Root（.claude/）の唯一性が明記されている       | design-summary.md 3.2節の確認           | 「唯一の正本」として明記                 | PASS |

---

## 5. パフォーマンス品質チェック

設計タスクのため、ランタイムパフォーマンスは非対象。
代わりに「Phase 12 実行時間の最適化」を設計レベルで検証する。

| チェック項目                                                 | 確認方法                                  | PASS 条件                                        | 結果 |
| ------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------ | ---- |
| 3ファイル/エージェント制約が全ステップに適用されているか     | contract-matrix.md 3.2節の確認            | 全 Step に「最大3ファイル/エージェント」記載あり | PASS |
| Step A→E の依存関係に循環がないか                            | design-summary.md 4.1節の依存関係図で確認 | 循環依存なし                                     | PASS |
| generate-index.js が Step D として分離されているか           | design-summary.md 4.1節の Step D の確認   | generate-index.js が Step D に明記されている     | PASS |
| サブエージェント分割の境界が明確か                           | contract-matrix.md 3.2節の確認            | サブエージェント制約が数値で定義されている       | PASS |
| rsync コマンドが --checksum オプション付きで記載されているか | design-summary.md 3.2節の確認             | `rsync -avz --checksum` のコマンド例が存在する   | PASS |

---

## 6. 検証結果サマリー

| 軸             | チェック項目数 | PASS   | 未確認（Phase 12 スコープ） | FAIL  |
| -------------- | -------------- | ------ | --------------------------- | ----- |
| 契約           | 30             | 30     | 0                           | 0     |
| UX             | 6              | 5      | 1                           | 0     |
| セキュリティ   | 4              | 4      | 0                           | 0     |
| パフォーマンス | 5              | 5      | 0                           | 0     |
| **合計**       | **45**         | **44** | **1**                       | **0** |

FAIL 件数: 0件。Phase 10 着手条件を充足している。
未確認1件（NFR-1.1の中学生レベル説明）は Phase 12 Task 1 のスコープであり、Phase 9 の FAIL には分類しない。
