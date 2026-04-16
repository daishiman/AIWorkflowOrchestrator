# Phase 1 成果物: トレーサビリティ行列

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| タスク | タスク4: トレーサビリティ固定      |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 要件 -> 受け入れ基準 -> 仕様 -> コードアンカー 対応表

| 要件ID | 要件名                    | AC         | 仕様ID                       | コードアンカー                         | 検証方法           |
| ------ | ------------------------- | ---------- | ---------------------------- | -------------------------------------- | ------------------ |
| FR-1   | shared -> preload 整合性  | AC-2       | SPEC-I01, I02, I03, S01, S02 | CCA-01, CCA-02                         | ユニットテスト     |
| FR-2   | preload -> main 整合性    | AC-3       | SPEC-I04, I06, S01           | CCA-02, CCA-05                         | ユニットテスト     |
| FR-3   | renderer -> shared 整合性 | AC-4       | SPEC-I05, A04                | CCA-03, CCA-04, CCA-08, CCA-09, CCA-10 | ユニットテスト     |
| FR-4   | CI失敗制御                | AC-5, AC-6 | -                            | -                                      | ユニットテスト     |
| FR-5   | 人間可読出力              | AC-5, AC-6 | -                            | -                                      | 出力内容の目視確認 |
| FR-6   | 正規表現ベース解析        | AC-1       | SPEC-A02                     | CCA-06 (参考)                          | スクリプト実行確認 |
| NFR-1  | CI実行時間 30秒以内       | AC-7       | SPEC-W01, W02                | CCA-07                                 | CI実行時間計測     |
| NFR-2  | 外部依存なし              | AC-1       | -                            | -                                      | package.json 確認  |
| NFR-3  | 既存スクリプト共存        | -          | SPEC-W03                     | CCA-06                                 | 共存テスト         |
| NFR-4  | 自動検出                  | AC-2〜4    | SPEC-I01〜I06                | CCA-01〜CCA-05                         | ユニットテスト     |

---

## 2. 要件 -> テスト対応表

| 要件ID | テストカテゴリ | テスト概要                                       | Phase |
| ------ | -------------- | ------------------------------------------------ | ----- |
| FR-1   | Unit           | parseSharedChannels() が全チャネルを抽出すること | 4     |
| FR-1   | Unit           | validateSharedToPreload() が未登録を検出すること | 4     |
| FR-2   | Unit           | parsePreloadWhitelist() が invoke/on を分離抽出  | 4     |
| FR-2   | Unit           | parseMainHandlers() が handle パターンを抽出     | 4     |
| FR-2   | Unit           | validatePreloadToMain() が未実装を検出           | 4     |
| FR-3   | Unit           | parseRendererUsage() がチャネル使用を抽出        | 4     |
| FR-3   | Unit           | validateRendererToShared() が未定義を検出        | 4     |
| FR-4   | Unit           | main() が ERROR 時に exit code 1 を設定          | 4     |
| FR-4   | Unit           | main() が全整合時に exit code 0 で終了           | 4     |
| FR-5   | Unit           | formatReport() が人間可読形式を出力              | 4     |
| FR-5   | Unit           | formatReport() が ::error アノテーションを出力   | 4     |
| FR-6   | Unit           | 正規表現パーサーがコメント行をスキップ           | 4     |
| NFR-1  | Integration    | スクリプト全体実行が 30 秒以内に完了             | 11    |
| NFR-2  | Static         | スクリプトに require/import がないこと           | 9     |
| NFR-3  | Integration    | check-ipc-contracts.ts と同時実行可能            | 11    |
| NFR-4  | Unit           | 新規チャネル追加テストフィクスチャで自動検出     | 6     |

---

## 3. 検証ルール -> 要件 -> AC 対応表

| ルール | 検証内容                       | 要件 | AC   | 重要度 |
| ------ | ------------------------------ | ---- | ---- | ------ |
| Rule-1 | shared ⊆ preload               | FR-1 | AC-2 | ERROR  |
| Rule-2 | preload(invoke) ⊆ main(handle) | FR-2 | AC-3 | ERROR  |
| Rule-3 | renderer ⊆ shared              | FR-3 | AC-4 | ERROR  |

---

## 4. 成果物 -> Phase 対応表

| 成果物                                        | Phase | 対応要件             |
| --------------------------------------------- | ----- | -------------------- |
| `scripts/verify-ipc-4layer.js`                | 5     | FR-1〜6, NFR-1〜4    |
| `scripts/__tests__/verify-ipc-4layer.test.ts` | 4     | AC-8                 |
| `.github/workflows/ci.yml` 変更               | 5     | AC-7                 |
| Phase 1-3 ドキュメント                        | 1-3   | 要件・設計・レビュー |
| Phase 4 テスト仕様                            | 4     | AC-2〜6, AC-8        |
| Phase 5 実装サマリー                          | 5     | FR-1〜6              |

---

## 5. リスクと軽減策

| リスクID | リスク                                           | 影響   | 軽減策                                                 |
| -------- | ------------------------------------------------ | ------ | ------------------------------------------------------ |
| RISK-01  | 正規表現がチャネル定義パターン変更で破損         | HIGH   | テストフィクスチャで現行パターンを固定し、変更時に検出 |
| RISK-02  | preload 独自チャネルが shared にないことの誤検出 | MEDIUM | Rule-1 の方向を正確に定義（shared -> preload のみ）    |
| RISK-03  | コメントアウトされたチャネルの誤検出             | LOW    | ブロックコメント/行コメント除外ロジックを実装          |
| RISK-04  | 間接参照（定数経由）の解決失敗                   | MEDIUM | resolveChannelMap() 相当のチャネルマップ構築           |
| RISK-05  | CI実行時間超過                                   | LOW    | ファイル数・行数が限定的のため低リスク                 |

---

## 6. 完全性チェック

### 要件カバレッジ

- [x] FR-1〜FR-6: 全て AC に対応づけ済み
- [x] NFR-1〜NFR-4: 全て検証方法を定義済み
- [x] AC-1〜AC-8: 全て要件に逆引き可能

### 仕様カバレッジ

- [x] IPC アーキテクチャ仕様: SPEC-A01〜A04
- [x] IPC インターフェース仕様: SPEC-I01〜I06
- [x] セキュリティ仕様: SPEC-S01〜S03
- [x] CI/ワークフロー仕様: SPEC-W01〜W03

### コードアンカーカバレッジ

- [x] CCA-01〜CCA-10: 全て仕様に対応づけ済み
- [x] 全アンカーのファイルパスが実在することを確認済み
