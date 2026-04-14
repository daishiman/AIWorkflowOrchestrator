# Phase 7 成果物: カバレッジレポート

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 7                                  |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## カバレッジ計測コマンド

```bash
pnpm vitest run scripts/__tests__/verify-ipc-4layer/ \
  --coverage \
  --coverage.include='scripts/verify-ipc-4layer.cjs'
```

## カバレッジ計測結果

| 指標              | 計測値 | 最低基準 | 推奨基準 | 判定 |
| ----------------- | ------ | -------- | -------- | ---- |
| Statement (Stmts) | 89.88% | 80%      | 90%      | PASS |
| Branch            | 90.97% | 60%      | 70%      | PASS |
| Function (Funcs)  | 94.11% | 80%      | 90%      | PASS |
| Line              | 89.88% | 80%      | 90%      | PASS |

全指標が最低基準を大幅に超過し、推奨基準もほぼ達成している。

## モジュール別カバレッジ内訳

対象ファイルは単一ファイル `scripts/verify-ipc-4layer.cjs` (約830行) であり、モジュール分割されていないため、関数単位での内訳を記載する。

| 関数名                        | テスト有無 | カバー状況                  |
| ----------------------------- | ---------- | --------------------------- |
| stripComments                 | あり       | カバー済み                  |
| flattenSharedGroupMap         | あり       | カバー済み                  |
| parseSharedChannels           | あり       | カバー済み                  |
| parseSharedGroupMap           | あり       | カバー済み                  |
| parsePreloadWhitelist         | あり       | カバー済み                  |
| parseMainHandlersFromContent  | あり       | カバー済み                  |
| parseMainHandlers             | あり       | カバー済み                  |
| parseRendererUsageFromContent | あり       | カバー済み                  |
| parseRendererUsage            | あり       | カバー済み                  |
| buildPreloadChannelMap        | あり       | カバー済み                  |
| resolveMainChannelRefs        | あり       | カバー済み                  |
| validateSharedToPreload       | あり       | カバー済み                  |
| validatePreloadToMain         | あり       | カバー済み                  |
| validateRendererToShared      | あり       | カバー済み                  |
| formatReport                  | あり       | カバー済み                  |
| main                          | なし       | 未カバー (エントリポイント) |

## 未到達コードパス分析

| 未到達範囲   | 行番号  | 分類       | 理由                                                                                                                        |
| ------------ | ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| main()       | 726-787 | ACCEPTABLE | エントリポイント関数。ファイルI/Oを伴うため、単体テストではなく実行確認で検証。E2Eテストで各パーサー/バリデーターは網羅済み |
| require.main | 791-792 | ACCEPTABLE | Node.jsランタイム分岐。テスト環境では require.main !== module のため到達不可                                                |

### 分類基準

| 分類       | 説明                                               | 対応方針           |
| ---------- | -------------------------------------------------- | ------------------ |
| MUST_COVER | 検証ロジックの正常系・異常系パス                   | Phase 6 に戻り追加 |
| SHOULD     | エッジケース（空ファイル、不正エンコーディング等） | Phase 6 に戻り追加 |
| ACCEPTABLE | 防御的コード（到達困難なガード節等）               | 理由を記録し許容   |

- MUST_COVER 未到達: **0件**
- SHOULD 未到達: **0件**
- ACCEPTABLE 未到達: **2箇所** (main関数 + require.main分岐)

## ゲート判定

| 状態                  | 判定 |
| --------------------- | ---- |
| 全指標が最低基準以上  | PASS |
| MUST_COVER 未到達なし | PASS |
| SHOULD 未到達なし     | PASS |

**ゲート判定結果: PASS -- Phase 8 へ進行可能**

## Phase 7 実行記録

### 実行タスク

- タスク1 カバレッジ計測計画の策定: 完了
- タスク2 カバレッジ計測の実行: 完了
- タスク3 未到達コードパス分析: 完了
- タスク4 カバレッジゲート判定: 完了 (PASS)

### カバレッジ計測結果サマリ

| 指標     | 結果   | 基準 | 判定 |
| -------- | ------ | ---- | ---- |
| Line     | 89.88% | 80%+ | PASS |
| Branch   | 90.97% | 60%+ | PASS |
| Function | 94.11% | 80%+ | PASS |

### ゲート判定結果

- 判定: PASS
- 未到達コードパス (MUST_COVER): 0件
- 反復回数: 1回目

### 発見事項

- 良かった点: Phase 6 のテスト拡充により、全指標で推奨基準をほぼ達成
- 問題点: なし
- 改善提案: main() 関数の統合テストは Phase 11 (手動テスト) で補完する

### 次Phase への引き継ぎ事項

- カバレッジ基準は全指標で達成済み
- 未到達コードはエントリポイント (main関数) のみで、ACCEPTABLE と判定
