# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目      | 値                                                       |
| --------- | -------------------------------------------------------- |
| Phase     | 11                                                       |
| 機能名    | imp-layer12-check-id-script-006                          |
| 作成日    | 2026-04-04                                               |
| 前提Phase | Phase 10（最終レビュー）完了                             |
| 後続Phase | Phase 12（ドキュメント更新）                             |
| 判定      | **NON_VISUAL**（スクリプト追加タスクのため視覚証跡不要） |

## 目的

check ID 突き合わせスクリプトについて、実際のファイルを使ったエンド・ツー・エンドの動作確認を実施する。本タスクは CLI スクリプトのため NON_VISUAL 判定とし、コマンド出力と終了コードを証跡とする。

## 実行タスク

### Task 1: 正常系の動作確認

**目的**: 実際の実装ファイルと仕様書を使って PASS が返ることを確認する

**手順**:

1. スクリプトをデフォルトパスで実行する

   ```bash
   node scripts/verify-check-id-parity.js
   echo "Exit code: $?"
   ```

2. 以下を確認する:
   - 出力に `PASSED` が含まれる
   - `Implementation: 19 IDs` と `Specification: 19 IDs` が表示される
   - `Diff: 0` が表示される
   - 終了コードが `0` である
   - `L2-008` が「In spec but not in impl」に表示されない

**証跡の主ソース**: コマンド出力（stdout）と終了コード

**可視証跡を使わない理由**: CLI スクリプトのため可視的な UI 変化がない（NON_VISUAL 判定）

**成果物**: `outputs/phase-11/manual-test-result.md` に出力結果を記録する

### Task 2: 異常系の動作確認

**目的**: FAIL ケースで適切なエラー出力と終了コードが返ることを確認する

**手順**:

1. 存在しないファイルパスを指定した場合の動作を確認する

   ```bash
   node scripts/verify-check-id-parity.js --impl nonexistent.ts
   echo "Exit code: $?"
   # 期待: 終了コード 2
   ```

2. `--help` オプションの動作を確認する

   ```bash
   node scripts/verify-check-id-parity.js --help
   # 期待: 使用方法が表示される
   ```

**成果物**: Task 1 の `manual-test-result.md` に結果を統合記録する

### Task 3: 発見課題の記録

**目的**: テスト実行中に発見された課題を記録する（0 件でも出力必須）

**手順**:

1. Task 1・Task 2 の実行結果を確認し、不一致や問題点を洗い出す
2. `outputs/phase-11/discovered-issues.md` を作成する（0 件の場合も「発見課題なし」と明記）

**成果物**: `outputs/phase-11/discovered-issues.md`

## テストケース

| No  | カテゴリ | テスト項目                       | 期待結果                  |
| --- | -------- | -------------------------------- | ------------------------- |
| 1   | 正常系   | デフォルトパスで PASS が返る     | 終了コード 0、PASSED 出力 |
| 2   | 正常系   | 19 IDs が突き合わせされる        | `19 IDs` が両方に表示     |
| 3   | 正常系   | 例示値 L2-008 が誤検知されない   | 差分リストに L2-008 なし  |
| 4   | 異常系   | 存在しないファイルで終了コード 2 | 終了コード 2              |
| 5   | 補助     | --help オプションが動作する      | 使用方法が表示される      |

## 参照資料

| 資料名            | パス                                               |
| ----------------- | -------------------------------------------------- |
| スクリプト本体    | `scripts/verify-check-id-parity.js`                |
| テストファイル    | `scripts/__tests__/verify-check-id-parity.test.js` |
| Phase 10 レビュー | `outputs/phase-10/final-review-result.md`          |

## 成果物

| 成果物                   | パス                                                      | 必須 | 説明                                   |
| ------------------------ | --------------------------------------------------------- | ---- | -------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`               | ✅   | 実施前後の最小チェック項目             |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                  | ✅   | コマンド出力・NON_VISUAL メタ情報含む  |
| 撮影計画                 | `outputs/phase-11/screenshot-plan.json`                   | ✅   | NON_VISUAL 補助証跡                    |
| プレースホルダー画像     | `outputs/phase-11/screenshots/non-visual-placeholder.png` | ✅   | 可視証跡ではないプレースホルダー       |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`                   | ✅   | 0 件でも出力（「発見課題なし」と明記） |

### manual-test-result.md 必須メタ情報

```markdown
## NON_VISUAL 判定

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| 判定     | NON_VISUAL                                   |
| 理由     | CLI スクリプト追加タスク（UI 変化なし）      |
| 代替証跡 | コマンド出力（stdout）と終了コードによる確認 |
| 視覚証跡 | 不要                                         |
```

## 完了条件

- [ ] Task 1: `node scripts/verify-check-id-parity.js` が終了コード 0 で PASS する
- [ ] Task 1: 出力に `19 IDs` が両方表示される
- [ ] Task 1: 例示値 `L2-008` が差分リストに現れないことを確認した
- [ ] Task 2: 存在しないファイルパスで終了コード 2 が返ることを確認した
- [ ] Task 2: `--help` オプションが動作することを確認した
- [ ] Task 3: `outputs/phase-11/discovered-issues.md` を作成した（0 件でも出力）
- [ ] NON_VISUAL メタ情報を `manual-test-result.md` に記載した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
