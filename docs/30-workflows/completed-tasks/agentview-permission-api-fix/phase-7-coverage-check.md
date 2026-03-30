# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 内容                         |
| --------- | ---------------------------- |
| Phase     | 7                            |
| 名称      | カバレッジ確認               |
| 前提Phase | Phase 6                      |
| 成果物    | カバレッジレポート・分析結果 |

## 目的

修正対象の `AgentView/index.tsx` のテストカバレッジを計測し、修正した3箇所（getPermissionApi, loadPermissions, handlePermissionModeChange + handleResetRemembered）が全てテストでカバーされていることを確認する。

## 実行タスク

- タスク 7-1: AgentView 関連テストのカバレッジを再測定する
- タスク 7-2: API パス修正周辺の分岐がテストで網羅されているか確認する
- タスク 7-3: 回帰 grep とテスト結果を同一レポートへまとめる

### タスク 7-1: カバレッジ計測を実行する

```bash
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/views/AgentView/index.tsx" \
  apps/desktop/src/renderer/views/AgentView/__tests__/
```

### タスク 7-2: カバレッジ結果を確認する

以下の関数が 100% のブランチカバレッジを持つことを確認する：

| 関数名                         | 期待カバレッジ | 確認観点                                                 |
| ------------------------------ | -------------- | -------------------------------------------------------- |
| `getPermissionApi()`           | 100%           | `window.permissionAPI` が存在する場合と undefined の場合 |
| `loadPermissions()`            | 100%           | API 取得成功・失敗・isMounted=false の3パス              |
| `handlePermissionModeChange()` | 100%           | mode 変更の単一パス                                      |
| `handleResetRemembered()`      | 100%           | API あり成功・API あり失敗・API なしの3パス              |

### タスク 7-3: カバレッジ不足の特定と対応判断

カバレッジが 100% に達しない行がある場合、以下の基準で対応を判断する：

| カバレッジ不足の内容                                                 | 対応                           |
| -------------------------------------------------------------------- | ------------------------------ |
| 修正した箇所（getPermissionApi, loadPermissions, handler）が未カバー | Phase 6 に戻ってテストを追加   |
| 修正していない箇所（スキル管理、UI レンダリング等）が未カバー        | 本タスクのスコープ外。対応不要 |

### タスク 7-4: カバレッジ結果を記録する

カバレッジ結果を以下のフォーマットで記録する：

```
AgentView/index.tsx:
  Statements: XX%
  Branches:   XX%
  Functions:  XX%
  Lines:      XX%

修正箇所のカバレッジ:
  getPermissionApi():          XX%
  loadPermissions():           XX%
  handlePermissionModeChange(): XX%
  handleResetRemembered():     XX%
```

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/agentview-permission-api-fix/phase-6-test-expansion.md` |

## 成果物

| 成果物             | 配置先                                         |
| ------------------ | ---------------------------------------------- |
| カバレッジレポート | `vitest` 実行時のコンソール出力                |
| カバレッジ分析結果 | `artifacts.json` の `phase-7` セクションに記録 |

## 完了条件

- [ ] `vitest --coverage` を実行し、カバレッジレポートを取得した
- [ ] `getPermissionApi()` のブランチカバレッジが 100% である
- [ ] `loadPermissions()` のブランチカバレッジが 100% である
- [ ] `handlePermissionModeChange()` のカバレッジが 100% である
- [ ] `handleResetRemembered()` のブランチカバレッジが 100% である
- [ ] カバレッジ不足がある場合、対応方針を記録した

## 実行手順

### ステップ1: スコープ内関数の coverage を採取する

今回修正した関数群に絞ってカバレッジを読み取る。

### ステップ2: 不足箇所の原因を判定する

不足が bugfix スコープ内か、既存画面全体の未カバーかを切り分ける。

### ステップ3: 品質ゲートへ引き継ぐ

Phase 9/10 で再利用できるよう、結果をテキストで記録する。

## 統合テスト連携

- unit coverage の数値と、Phase 9 の `test` / `typecheck` / `lint` 実行結果を紐付ける。
- manual test へ進む前に、ランタイムエラー解消の自動根拠を揃える。

## 多角的チェック観点

| 観点       | 本Phaseでの確認内容                                      |
| ---------- | -------------------------------------------------------- |
| 検証網羅性 | 修正箇所の枝が埋まっているか                             |
| 判断境界   | スコープ外の未カバーを誤って task failure にしていないか |
| 伝達性     | 後続レビューが読める形で記録できているか                 |

## サブタスク管理

1. coverage 実行
2. 結果確認
3. 不足判定
4. 結果記録
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 修正対象の coverage 根拠を記録した
- [ ] 次Phaseが参照できる結果を残した

## 次のPhase

Phase 8: リファクタリング

## 統合テスト連携

| 観点       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| カバレッジ | `getPermissionApi()`、`loadPermissions()`、`handleResetRemembered()` 周辺の分岐網羅を可視化する |
| 回帰検知   | grep ベースの旧 API パス検出とテスト PASS をセットで記録する                                    |
| 引継ぎ     | カバレッジ不足があれば Phase 8 の改善候補へ渡す                                                 |
