# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 9                               |
| 機能名    | imp-layer12-check-id-script-006 |
| 作成日    | 2026-04-04                      |
| 前提Phase | Phase 8                         |
| 後続Phase | Phase 10                        |

## 目的

スクリプトファイルの lint / type-check（JSDoc 型アノテーション）/ 実行確認を一括検証し、CI 環境で動作することを保証する。

## 実行タスク

### タスク1: lint チェック

**手順**:

```bash
pnpm lint scripts/verify-check-id-parity.js
pnpm lint scripts/__tests__/verify-check-id-parity.test.js
```

- lint エラーがある場合はスクリプトを修正する
- lint 警告が残る場合は理由を記録する

### タスク2: 全テストの最終実行

**手順**:

```bash
pnpm vitest run scripts/__tests__/verify-check-id-parity.test.js
```

- 全テストが PASS していることを確認する
- テスト件数・所要時間を記録する

### タスク3: 実際のファイルでの動作確認

**手順**:

1. デフォルトパスで実行し、PASS することを確認する:

```bash
node scripts/verify-check-id-parity.js
echo "Exit code: $?"
# 期待: Exit code: 0
```

2. `--help` オプションの動作確認:

```bash
node scripts/verify-check-id-parity.js --help
```

3. 意図的に差分を作った場合の FAIL 確認（オプション）:
   - `--spec` で存在しない ID を含む一時ファイルを渡し、終了コード 1 が返ることを確認する

### タスク4: CI 組み込み可能性の確認

**確認観点**:

| 観点       | 基準                                                   |
| ---------- | ------------------------------------------------------ |
| 終了コード | 0（PASS）/ 1（FAIL）/ 2（エラー）が正しく返る          |
| 標準出力   | CI ログで視認しやすい出力になっている                  |
| 依存関係   | Node.js 標準モジュールのみ使用（追加インストール不要） |
| 実行時間   | 1 秒以内で完了する                                     |

## 参照資料

| 資料名         | パス                                               |
| -------------- | -------------------------------------------------- |
| スクリプト本体 | `scripts/verify-check-id-parity.js`                |
| テストファイル | `scripts/__tests__/verify-check-id-parity.test.js` |

## 成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] lint チェックが PASS している（または警告の理由が記録されている）
- [ ] 全テストが PASS している
- [ ] `node scripts/verify-check-id-parity.js` が終了コード 0 で PASS する
- [ ] `--help` オプションが動作する
- [ ] CI 組み込み可能性（終了コード・依存関係・実行時間）が確認されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビュー
