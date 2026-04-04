# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 7                               |
| 機能名    | imp-layer12-check-id-script-006 |
| 作成日    | 2026-04-04                      |
| 前提Phase | Phase 6                         |
| 後続Phase | Phase 8                         |

## 目的

スクリプトの主要関数（`extractCheckIdsFromImpl` / `extractCheckIdsFromSpec` / `compareCheckIds`）のカバレッジを確認し、テーブル行スコープの正規表現ブロックが十分にカバーされていることを検証する。

## 実行タスク

### タスク1: カバレッジ計測の実行

**対象**: `scripts/verify-check-id-parity.js` の変更した関数・ブロック

**手順**:

```bash
pnpm vitest run --coverage scripts/__tests__/verify-check-id-parity.test.js
```

**カバレッジ目標**（変更ファイルのみ対象）:

| 関数                      | Line | Branch | 目標 |
| ------------------------- | ---- | ------ | ---- |
| `extractCheckIdsFromImpl` | 100% | 100%   | 必須 |
| `extractCheckIdsFromSpec` | 100% | 100%   | 必須 |
| `compareCheckIds`         | 100% | 100%   | 必須 |
| `main()`                  | 80%+ | 70%+   | 推奨 |

> Phase 7 のカバレッジ対象は変更した関数ブロックのみ。リポジトリ全体の広域指定は行わない。

### タスク2: テーブル行スコープの正規表現ブロックの検証

**目的**: `extractCheckIdsFromSpec` 内のテーブル行スコープ正規表現が、以下の分岐をカバーしていることを確認する

| 分岐                         | テストケース                                      |
| ---------------------------- | ------------------------------------------------- |
| テーブル行にマッチ（PASS）   | Phase 4 タスク1の正常系テスト                     |
| 例示値にマッチしない（分岐） | Phase 4 タスク1の `should NOT extract example...` |
| 空ファイル（早期リターン）   | Phase 6 タスク1のエッジケーステスト               |

### タスク3: カバレッジギャップの記録

**手順**:

1. カバレッジレポートを確認し、カバーされていないブロックを特定する
2. カバーされていないブロックが重要なロジックであれば Phase 6 に戻りテストを追加する
3. 意図的にカバーしないブロック（CLI 起動パス等）は理由を記録する

## 参照資料

| 資料名         | パス                                               |
| -------------- | -------------------------------------------------- |
| スクリプト本体 | `scripts/verify-check-id-parity.js`                |
| テストファイル | `scripts/__tests__/verify-check-id-parity.test.js` |

## 成果物

| 成果物             | パス                                 |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] カバレッジ計測を実行し、結果を記録した
- [ ] `extractCheckIdsFromImpl` の line/branch カバレッジが 100% である
- [ ] `extractCheckIdsFromSpec` の line/branch カバレッジが 100% である（テーブル行正規表現ブロックを含む）
- [ ] `compareCheckIds` の line/branch カバレッジが 100% である
- [ ] カバレッジギャップがある場合、理由が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 8: リファクタリング
