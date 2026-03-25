# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 7                                              |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

変更対象ファイルのカバレッジが基準を満たしているか確認する。

## 実行タスク

1. カバレッジ計測 — navContract.ts / Icon/index.tsx / types.test.ts を含む対象ファイルのカバレッジを計測
2. 基準達成判定 — Line 80%+ / Branch 60%+ / Function 80%+ の基準を全ファイルで達成しているか判定
3. 統合テスト結果確認 — 関連する統合テスト観点のカバレッジ状況を確認

## 参照資料

| 資料名         | パス                                                        |
| -------------- | ----------------------------------------------------------- |
| Phase 5 実装   | `phase-5-implementation.md`                                 |
| Phase 6 テスト | `phase-6-test-enhancement.md`                               |
| navContract    | `apps/desktop/src/renderer/navigation/navContract.ts`       |
| Icon           | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx` |

## カバレッジ対象ファイル

| ファイル                          | 基準 Line | 基準 Branch | 基準 Function |
| --------------------------------- | --------- | ----------- | ------------- |
| `navigation/navContract.ts`       | 80%       | 60%         | 80%           |
| `components/atoms/Icon/index.tsx` | 80%       | 60%         | 80%           |

## 実行手順

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/navigation/navContract.test.ts src/renderer/components/atoms/Icon/Icon.test.tsx src/renderer/store/types.test.ts
```

## 判定基準

- Line Coverage >= 80%: PASS
- Branch Coverage >= 60%: PASS
- Function Coverage >= 80%: PASS
- 未達の場合: Phase 6 に戻り追加テスト作成

## 統合テスト連携

| 判定項目                | 基準 | 結果         |
| ----------------------- | ---- | ------------ |
| ユニットテスト Line     | 80%+ | (実行時記入) |
| ユニットテスト Branch   | 60%+ | (実行時記入) |
| ユニットテスト Function | 80%+ | (実行時記入) |

- 全基準を満たす場合: Phase 8 へ進行
- 未達の場合: Phase 6 に戻り追加テスト作成

## 多角的チェック観点

| 観点             | 確認事項                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| P41 準拠         | v8 カバレッジプロバイダのインライン関数カウントに注意する                |
| P40 準拠         | カバレッジ計測は `apps/desktop/` ディレクトリから実行する                |
| 対象ファイル網羅 | navContract.ts / Icon/index.tsx / types.test.ts の全対象が計測されている |
| 回帰確認         | Phase 5 / Phase 6 で追加したテストが全て PASS している                   |

## 成果物

| 成果物             | パス                                 | 備考                     |
| ------------------ | ------------------------------------ | ------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ計測結果を記録 |

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] 全対象ファイルが基準を満たしている

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 8: リファクタリング
