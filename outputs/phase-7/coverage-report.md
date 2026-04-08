# Phase 7: カバレッジ確認レポート — UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## 実施日時

2026-04-07

---

## カバレッジ実測結果

| カバレッジ種別 | Phase 7 目標値 | 実測値 | 判定 |
| -------------- | -------------- | ------ | ---- |
| line           | 80% 以上       | 83.15% | PASS |
| branch         | 60% 以上       | 80%    | PASS |
| statements     | （参考）       | 83.15% | -    |
| functions      | （参考）       | 66.66% | -    |

**総合判定: PASS → Phase 8 へ進む**

---

## 実行コマンド

```bash
node_modules/.bin/vitest run \
  src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts \
  --coverage \
  --coverage.include="src/renderer/hooks/useMainlineExecutionAccess.ts" \
  --coverage.reporter=text
```

---

## Vitest カバレッジ出力（抜粋）

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   83.15 |       80 |   66.66 |   83.15 |
 ...utionAccess.ts |   83.15 |       80 |   66.66 |   83.15 | ...,76-85,108-113
-------------------|---------|----------|---------|---------|-------------------
```

---

## 未カバー行の分析

| 行範囲    | 内容                                                                                 | 未カバーの理由                                 | 対応方針                                                                   |
| --------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------- |
| L76-L85   | `validateAllModes` 関数本体（useEffect 内の非同期処理・catch ブランチ）              | catch ブランチ（エラー時の状態更新）が未テスト | 対応不要（エラーパスは既存テストの対象外。将来タスクで追加可能）           |
| L108-L113 | `refreshHealth` 関数本体（selectedProviderId が存在する場合の checkHealth 呼び出し） | refreshHealth の直接呼び出しテストが未実施     | 対応不要（本タスクのスコープ外。refreshHealth の動作確認は別タスクで対応） |

---

## function カバレッジについて

function カバレッジ 66.66% はプロジェクトのグローバル閾値（80%）を下回るが、Phase 7 の判定基準は「line ≥ 80% かつ branch ≥ 60%」であるため PASS とする。

未カバーの関数:

1. `validateAllModes` — 非同期関数、エラーパスのみ未カバー
2. `refreshHealth` — 返り値として公開されるが直接呼び出しテストなし

これらは本タスクのスコープ（`resolveHealthPolicy` 統合）とは独立した関心事であるため、本タスクでの追加テストは行わない。

---

## 次フェーズへの引き継ぎ事項

- Phase 7 目標値（line ≥ 80%, branch ≥ 60%）を達成
- Phase 8（リファクタリング確認）へ進む
