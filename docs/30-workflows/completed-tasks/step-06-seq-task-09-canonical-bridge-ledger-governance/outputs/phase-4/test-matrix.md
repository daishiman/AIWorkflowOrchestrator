# Phase 4 成果物: テストマトリクス

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 4 - テスト作成

## 1. テスト種別と責務分離

| テスト種別  | 検証対象                              | 実施タイミング | 自動化可否 | 担当 Phase |
| ----------- | ------------------------------------- | -------------- | ---------- | ---------- |
| unit        | 個別 FR / State 遷移条件の網羅性      | Phase 7 gate   | 可         | Phase 4-6  |
| integration | Step A→E の順序依存と整合性           | Phase 7 gate   | 可（bash） | Phase 4-6  |
| contract    | 成果物の構造・列・コマンド存在確認    | Phase 10 gate  | 可（grep） | Phase 4    |
| manual      | Phase 12 walkthrough シミュレーション | Phase 11       | 不可       | Phase 11   |

## 2. Unit テストケース一覧

### 2.1 L-1: Governance State Machine

| TC ID | 対象 FR | 検証内容                                                    | PASS 条件                                                      |
| ----- | ------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| U-1-1 | FR-3.1  | spec_created 進入条件が成果物ベースで記載されている         | outputs/phase-1〜3/ の全成果物パスが contract-matrix.md に列挙 |
| U-1-2 | FR-3.2  | type:design と type:implementation の条件テーブルが存在する | contract-matrix.md に Type 別条件テーブルが2行以上             |
| U-1-3 | FR-3.3  | Phase 10 MINOR 後の遷移パスが記載されている                 | design-summary.md に MINOR → 未タスク化 → Phase 11 の記述あり  |
| U-1-4 | FR-3.4  | rollback の3段条件が全て定義されている                      | contract-matrix.md の逆遷移テーブルが3行存在する               |
| U-1-5 | FR-3.2  | type:design の coverage gate 除外が明記されている           | 「不要」の記載が Type 別条件テーブルに存在する                 |

### 2.2 L-2: Canonical Source & Bridge

| TC ID | 対象 FR | 検証内容                                              | PASS 条件                                                       |
| ----- | ------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| U-2-1 | FR-1.1  | 5カテゴリの source table が存在する                   | design-summary.md にカテゴリ行が5行以上                         |
| U-2-2 | FR-1.2  | 各カテゴリに canonical path が記載されている          | `.claude/skills/` で始まるパス文字列が source table 内に存在    |
| U-2-3 | FR-1.3  | 責務・権限者・タイミングの3列が全行に値を持つ         | source table の全行において空セルがない                         |
| U-2-4 | FR-2.1  | legacy register との cross-reference リンクが存在する | design-summary.md に legacy-ordinal-family-register.md への参照 |
| U-2-5 | FR-2.2  | bridge rule 文書が存在する                            | contract-matrix.md に Bridge Rule テーブルが存在                |
| U-2-6 | FR-2.3  | deprecation timeline が定義されている                 | 「無期限保持」または具体的な期限値が bridge rule 内に存在       |

### 2.3 L-3: Same-Wave Sync Protocol

| TC ID | 対象 FR | 検証内容                                          | PASS 条件                                                       |
| ----- | ------- | ------------------------------------------------- | --------------------------------------------------------------- |
| U-3-1 | FR-4.1  | Phase 12 同期チェックリストが存在する             | design-summary.md に Step A〜E が全て記載されている             |
| U-3-2 | FR-4.2  | 同期対象ファイルが5カテゴリ以上で列挙されている   | Step A〜E 内のファイル種別行数が5以上                           |
| U-3-3 | FR-4.3  | 3ファイル/エージェント制約が明記されている        | 「3ファイル」または「3 files」の記述が design-summary.md に存在 |
| U-3-4 | FR-4.4  | rsync コマンドが記載されている                    | `rsync -avz --checksum` の文字列が contract-matrix.md に存在    |
| U-3-5 | FR-5.1  | 3ステップ手順が記載されている                     | Step 1/2/3 の記述が design-summary.md に存在                    |
| U-3-6 | FR-5.2  | 設計タスクの3ステップ例外なし条件が記載されている | 「P58」または「省略不可」の文字列が design-summary.md に存在    |
| U-3-7 | FR-5.3  | current→baseline 移管条件が記載されている         | 「wave 完了」の記述が design-summary.md に存在                  |
| U-3-8 | FR-5.4  | gh issue close 手順が記載されている               | `gh issue close` の文字列が design-summary.md に存在            |

## 3. Integration テストケース一覧

| TC ID | 統合観点                                   | 検証手順                                                                     | PASS 条件                              |
| ----- | ------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------- |
| I-1   | Step A→B→C→D→E の順序整合性                | design-summary.md の Step 順序が A < B < C < D < E の順で記載されていること  | 逆順または欠落なし                     |
| I-2   | source table と contract-matrix の整合性   | source table の5カテゴリが contract-matrix の Action 契約に全て登場すること  | 5カテゴリ × 対応 Action が存在         |
| I-3   | validation-matrix の FR 網羅性             | validation-matrix.md に FR-1.1〜5.4 の全16項目が行として存在すること         | 行数 >= 16                             |
| I-4   | Pitfall 防止ルールと Action 契約の対応     | validation-matrix.md の Pitfall テーブルが P1/P25/P43/P56/P59 を網羅すること | 必須 Pitfall 6件以上が記載             |
| I-5   | rollback 手順と state 遷移図の整合性       | contract-matrix.md の rollback テーブルが3行存在し、state 遷移と対応すること | 全ての state に rollback 先が定義済み  |
| I-6   | mirror sync コマンドと verification の対応 | rsync コマンドと `diff -qr` 確認コマンドが同一文書内に両方存在すること       | 両コマンドが contract-matrix.md に存在 |

## 4. Contract テストケース一覧

成果物構造を grep / ls で機械的に検証するコントラクトテスト:

| TC ID | 検証コマンド                                                 | 期待結果             | 対象ファイル         |
| ----- | ------------------------------------------------------------ | -------------------- | -------------------- | ---------------- |
| C-1   | `grep -c "spec_created" outputs/phase-2/contract-matrix.md`  | >= 1                 | contract-matrix.md   |
| C-2   | `grep -c "type: design" outputs/phase-2/contract-matrix.md`  | >= 1                 | contract-matrix.md   |
| C-3   | `grep -c "rsync" outputs/phase-2/contract-matrix.md`         | >= 1                 | contract-matrix.md   |
| C-4   | `grep -c "diff -qr" outputs/phase-2/contract-matrix.md`      | >= 1                 | contract-matrix.md   |
| C-5   | `grep -c "3ファイル" outputs/phase-2/design-summary.md`      | >= 1                 | design-summary.md    |
| C-6   | `grep -c "gh issue close" outputs/phase-2/design-summary.md` | >= 1                 | design-summary.md    |
| C-7   | `grep -c "LOGS.md" outputs/phase-2/contract-matrix.md`       | >= 2（2ファイル分）  | contract-matrix.md   |
| C-8   | `grep -c "FR-" outputs/phase-2/validation-matrix.md`         | >= 16（FR-1.1〜5.4） | validation-matrix.md |
| C-9   | `ls outputs/phase-1/                                         | wc -l`               | >= 3                 | outputs/phase-1/ |
| C-10  | `ls outputs/phase-2/                                         | wc -l`               | >= 3                 | outputs/phase-2/ |
| C-11  | `ls outputs/phase-3/                                         | wc -l`               | >= 2                 | outputs/phase-3/ |
| C-12  | `grep -c "P43" outputs/phase-2/validation-matrix.md`         | >= 1                 | validation-matrix.md |

## 5. Manual テストケース一覧（Phase 11 用）

| TC ID | シナリオ                                | 手順                                                                         | 期待結果                                             |
| ----- | --------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| M-1   | Phase 12 Step A 実行 walkthrough        | task-workflow.md を対象に ledger-update アクションを模擬する                 | 4ファイル更新 + documentation-changelog に記録       |
| M-2   | Phase 12 Step E mirror sync walkthrough | `rsync --checksum` を実行し `diff -qr` で差分0件を確認する                   | diff 出力が空                                        |
| M-3   | 未タスク3ステップ検証                   | unassigned-task/ への指示書作成 → backlog 登録 → 仕様書リンク追加 の順で実施 | 3ステップ全て完了 + issue close 実行済み             |
| M-4   | type:design タスクの state 遷移確認     | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 の artifacts.json を確認     | spec_created → implementation_ready の遷移条件が充足 |
| M-5   | subagent 3ファイル制約の模擬            | Step C を3ファイル/エージェント以内に分割した計画を確認する                  | 各エージェントの対象ファイル数が3以下                |

## 6. テスト優先度マップ

| 優先度 | テスト種別  | TC ID         | 根拠                           |
| ------ | ----------- | ------------- | ------------------------------ |
| 高     | contract    | C-1〜C-12     | 機械的検証可能・実行コスト低   |
| 高     | integration | I-1, I-3, I-4 | FR 網羅性と Pitfall 防止の中核 |
| 中     | unit        | U-1-1〜U-3-8  | 個別 FR の詳細確認             |
| 低     | manual      | M-1〜M-5      | Phase 11 で実施・自動化不可    |
