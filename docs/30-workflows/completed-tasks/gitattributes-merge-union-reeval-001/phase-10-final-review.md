# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 9: 品質保証                         |
| 後続Phase  | Phase 11: 手動テスト検証                  |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 1-9 の全成果を統合レビューし、Phase 11（手動テスト）への移行可否を **MAJOR / MINOR / PASS** の3段階で判定する。Phase 1 で固定した受け入れ基準 (AC-1〜AC-5) を全件確認し、blocker の有無を評価したうえで最終ゲートを通過させる。

## 背景

`.gitattributes` の修正は Git マージ挙動に直接影響するため、リリース後の rollback コストが極めて高い。本 Phase で blocker（特に環境依存問題・カスタムドライバ依存）を確実に拾い、手動テストでの検証スコープを明確化する必要がある。

## 実行タスク

### タスク0: 受け入れ基準（AC）の最終確認

**目的**: Phase 1 で固定した AC-1〜AC-5 を全件チェックリスト形式で確認し、各 AC に対して根拠成果物を紐付ける。

**実行手順**:

1. `outputs/phase-1/requirements-definition.md` と `outputs/phase-1/acceptance-criteria.md` から AC-1〜AC-5 を引用
2. 以下の形式で確認テーブルを作成:

   | AC ID | 受け入れ基準（要約）                                         | 根拠成果物                                                                                | 判定    |
   | ----- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------- |
   | AC-1  | `references/*.md` が append-only / 構造化 で再分類されている | `outputs/phase-1/file-classification-inventory.md`                                        | pending |
   | AC-2  | `.gitattributes` の glob が分類に沿って精緻化されている      | `outputs/phase-5/implementation-summary.md`                                               | pending |
   | AC-3  | `setup-merge-drivers.sh` 実行で `merge=ours` が機能する      | `outputs/phase-7/coverage-report.md`                                                      | pending |
   | AC-4  | `.gitattributes` の各エントリに用途コメントが付与されている  | Phase 5 / Phase 8 の成果物                                                                | pending |
   | AC-5  | 新規ファイル追加時の判断ガイドラインが文書化されている       | `outputs/phase-2/merge-strategy-design.md` と `outputs/phase-5/implementation-summary.md` | pending |

3. 各 AC を `pass` / `partial` / `fail` で判定
4. `partial` / `fail` の AC は blocker 候補としてタスク1へ送る

**期待される成果物**: `outputs/phase-10/final-review-result.md` 内のセクション「AC 最終確認」

### タスク1: blocker の有無判定

**目的**: Phase 11 移行を妨げる致命的問題（blocker）を列挙し、対応方針を決定する。

**実行手順**:

1. 以下の blocker 候補を全件チェック:

   | blocker 候補                                                     | チェック方法                        | 結果    |
   | ---------------------------------------------------------------- | ----------------------------------- | ------- |
   | `setup-merge-drivers.sh` が macOS / Linux 両方で動作するか       | Phase 7 タスク1 結果 + 手動実行ログ | pending |
   | `core.attributesfile` の個人設定が `.gitattributes` を上書きする | Phase 7 タスク2 エッジケース評価    | pending |
   | submodule 内 `.gitattributes` との衝突                           | Phase 7 タスク2 エッジケース評価    | pending |
   | mirror parity 100% 未達                                          | Phase 9 タスク2 結果                | pending |
   | Phase 4-6 テストの flaky 挙動                                    | テスト 3回連続実行で全 PASS を確認  | pending |
   | カバレッジ目標未達 (パターン別 100% / エッジケース 80%)          | Phase 7 タスク3 結果                | pending |

2. blocker と判定されたものに対して以下を記録:
   - 影響範囲
   - 暫定回避策の有無
   - 修正に必要な戻り Phase
3. 1件以上の blocker がある場合、ゲート判定は MAJOR となる

**期待される成果物**: `outputs/phase-10/final-review-result.md` 内のセクション「blocker 判定」

### タスク2: MAJOR / MINOR / PASS の最終ゲート判定

**目的**: タスク0-1 の結果を統合し、Phase 11 への進行可否を最終判定する。

**実行手順**:

1. 以下の判定基準に従いゲート判定を実施:

   | 判定  | 条件                                                              | アクション                                 |
   | ----- | ----------------------------------------------------------------- | ------------------------------------------ |
   | MAJOR | blocker 1件以上 OR AC `fail` 1件以上                              | Phase 4-9 のいずれかへ戻り、修正後再ゲート |
   | MINOR | blocker 0件 AND AC `partial` 1件以上 AND AC `fail` 0件            | Phase 11 へ進行、ただし outputs に課題記録 |
   | PASS  | blocker 0件 AND AC 全件 `pass` AND Phase 9 quality-report 全 PASS | Phase 11 へ進行、課題記録不要              |

2. 判定結果を以下のテーブル形式で記録（必須）:

   | 項目                    | 値                              |
   | ----------------------- | ------------------------------- |
   | ゲート判定              | MAJOR / MINOR / PASS            |
   | 判定根拠                | （blocker 件数 / AC fail 件数） |
   | 戻り先 Phase（MAJOR時） | Phase N                         |
   | 残課題（MINOR時）       | 課題ID 一覧                     |
   | 判定者                  | （実行者名 or システム）        |
   | 判定日                  | YYYY-MM-DD                      |

3. MAJOR の場合は本 Phase を一旦 close し、戻り Phase 完了後に Phase 10 を再実行

**期待される成果物**: `outputs/phase-10/final-review-result.md` 内のセクション「ゲート判定テーブル」

### タスク3: Phase 11 への引き継ぎ事項整理

**目的**: 手動テストで検証すべきポイント・既知の制約・watch list を Phase 11 担当者へ引き継ぐ。

**実行手順**:

1. Phase 11 で重点検証すべき項目を列挙:
   - `setup-merge-drivers.sh` の実環境（macOS / Linux）実行確認
   - 構造化ドキュメント（`task-workflow.md` 等）への並行編集マージで重複行ゼロを確認
   - append-only ファイルへの並行追記マージで両ブランチの行が保持されることを確認
   - `core.attributesfile` を一時設定した状態でのマージ挙動確認
2. 既知の制約・watch list を整理:
   - submodule 内 `.gitattributes` は本タスク範囲外
   - `EVALS.json` は凍結中
3. MINOR 判定の場合、残課題リストを Phase 11 / Phase 12 への TODO として明示

**期待される成果物**: `outputs/phase-10/final-review-result.md` 内のセクション「Phase 11 引き継ぎ」

## 参照資料

| 資料名                       | パス                                         | 用途                   |
| ---------------------------- | -------------------------------------------- | ---------------------- |
| Phase 1 要件定義             | `outputs/phase-1/requirements-definition.md` | AC 引用元              |
| Phase 1 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 の正本      |
| Phase 5 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | AC-2 根拠              |
| Phase 7 カバレッジレポート   | `outputs/phase-7/coverage-report.md`         | AC-3 / blocker 根拠    |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`         | 挙動不変確認           |
| Phase 9 品質保証レポート     | `outputs/phase-9/quality-report.md`          | mirror parity / sanity |

## 成果物

| 成果物           | パス                                      | 説明                                               |
| ---------------- | ----------------------------------------- | -------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC 確認 / blocker 判定 / ゲート判定 / 引き継ぎ事項 |

## 統合テスト連携【必須】

| 判定項目                                | 基準               | 結果    |
| --------------------------------------- | ------------------ | ------- |
| AC-1 〜 AC-5 全件                       | 全件 `pass`        | pending |
| blocker 件数                            | 0件                | pending |
| ゲート判定                              | PASS（理想）       | pending |
| Phase 4-6 テスト 3回連続実行 flaky 確認 | 全 PASS（flaky 0） | pending |

## 完了条件

- [ ] AC-1〜AC-5 の全件確認テーブルが記録されている
- [ ] blocker 候補 6件全てがチェック済み
- [ ] ゲート判定テーブルに MAJOR / MINOR / PASS の判定が明記されている
- [ ] MAJOR の場合、戻り Phase が明記され、本 Phase が再実行待ちになっている
- [ ] MINOR の場合、残課題が一覧化され Phase 11 / Phase 12 へ引き継がれている
- [ ] PASS の場合、Phase 11 への引き継ぎ事項が整理されている
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

→ [Phase 11: 手動テスト検証](./phase-11-manual-test.md)
