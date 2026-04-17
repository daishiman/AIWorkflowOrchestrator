# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 7                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 6                                           |
| 後続Phase  | Phase 8                                           |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

`resolveLabelEntry()` 関数および `SEMANTIC_LABEL_MAP` の変更ブロックのカバレッジを計測し、
未到達コードがないことを確認する。カバレッジ対象は変更したファイル・ブロックのみに限定する。

## 実行タスク

- カバレッジ計測: 変更ブロック（`skill-wizard-label-map.ts`）を対象に計測
- 未到達コード分析: Line / Branch / Function カバレッジの確認
- カバレッジ目標との照合: 基準値充足確認
- カバレッジレポート作成

## 参照資料

| 資料名         | パス                                                                 | 用途               |
| -------------- | -------------------------------------------------------------------- | ------------------ |
| 実装ファイル   | `packages/shared/src/types/skill-wizard-label-map.ts`                | カバレッジ対象確認 |
| テストファイル | `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts` | テスト件数確認     |
| Phase 6 成果物 | `outputs/phase-6/`                                                   | 追加テスト確認     |

## 実行手順

### 1. カバレッジ計測コマンド（変更ブロック指定）

```bash
# 変更ファイル指定でカバレッジ計測
pnpm --filter @repo/shared exec vitest run \
  --coverage \
  --coverage.include="src/types/skill-wizard-label-map.ts" \
  src/types/__tests__/skill-wizard-label-map.test.ts
```

### 2. カバレッジ目標

> カバレッジ対象は変更した関数・ブロックのみ
> （`SemanticLabelEntry` 型・`resolveLabelEntry()` 関数・`SEMANTIC_LABEL_MAP` 更新部分）。

| 計測対象                         | Line | Branch | Function |
| -------------------------------- | ---- | ------ | -------- |
| `resolveLabelEntry()` 関数       | 100% | 100%   | 100%     |
| `resolveSemanticLabel()` 関数    | 100% | 100%   | 100%     |
| `skill-wizard-label-map.ts` 全体 | 80%+ | 60%+   | 80%+     |

### 3. 計測結果記録（実行時に記入）

| 計測対象                         | Line | Branch | Function | 判定      |
| -------------------------------- | ---- | ------ | -------- | --------- |
| `resolveLabelEntry()` 関数       | -    | -      | -        | completed |
| `resolveSemanticLabel()` 関数    | -    | -      | -        | completed |
| `skill-wizard-label-map.ts` 全体 | -    | -      | -        | completed |

### 4. 未到達コード分析

```bash
# カバレッジレポートから未到達行を確認
pnpm --filter @repo/shared exec vitest run \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/types/skill-wizard-label-map.ts" \
  src/types/__tests__/skill-wizard-label-map.test.ts 2>&1 | grep -A 10 "skill-wizard-label-map.ts"
```

期待: `resolveLabelEntry` および `resolveSemanticLabel` の全行が covered であること。

### 5. Branch カバレッジ確認観点

以下のブランチがすべてテストされていることを確認する。

| ブランチ                                           | 対応 TC     |
| -------------------------------------------------- | ----------- |
| `value === undefined` → return undefined           | TC-14       |
| `questionMap` が存在しない → value をそのまま返す  | TC-06       |
| `questionMap[value]` が存在する（string）          | TC-02/TC-03 |
| `questionMap[value]` が存在する（object）          | TC-01       |
| `questionMap[value]` が存在しない → フォールバック | TC-04       |

### 6. カバレッジレポート出力先確認

```bash
# HTML レポートを生成して視覚的に確認（任意）
pnpm --filter @repo/shared exec vitest run \
  --coverage \
  --coverage.reporter=html \
  --coverage.include="src/types/skill-wizard-label-map.ts" \
  src/types/__tests__/skill-wizard-label-map.test.ts

# レポートディレクトリ確認
ls packages/shared/coverage/
```

## 統合テスト連携【必須】

| 判定項目                                  | 基準 | 結果      |
| ----------------------------------------- | ---- | --------- |
| `resolveLabelEntry` Line カバレッジ       | 100% | completed |
| `resolveLabelEntry` Branch カバレッジ     | 100% | completed |
| `resolveLabelEntry` Function カバレッジ   | 100% | completed |
| `resolveSemanticLabel` Line カバレッジ    | 100% | completed |
| `skill-wizard-label-map.ts` 全体 Line     | 80%+ | completed |
| `skill-wizard-label-map.ts` 全体 Branch   | 60%+ | completed |
| `skill-wizard-label-map.ts` 全体 Function | 80%+ | completed |

## 多角的チェック観点

| 観点     | 確認内容                                                                 |
| -------- | ------------------------------------------------------------------------ |
| 矛盾     | カバレッジ目標とテストケース数が矛盾していないか                         |
| 漏れ     | object エントリ・string エントリ・undefined の全パスがカバーされているか |
| 整合性   | Phase 6 で追加したテスト（TC-10〜TC-18）がカバレッジに寄与しているか     |
| 依存関係 | Phase 5 実装変更後のブランチ数と Phase 6 テスト件数が整合しているか      |

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・未到達コード分析・判定 |

## 完了条件

- [ ] 変更ブロック（`resolveLabelEntry` + `SEMANTIC_LABEL_MAP`）のカバレッジ計測済み
- [ ] `resolveLabelEntry()` が Line / Branch / Function 100% 達成
- [ ] `resolveSemanticLabel()` が Line / Branch / Function 100% 達成
- [ ] `skill-wizard-label-map.ts` 全体が Line 80%+ / Branch 60%+ / Function 80%+ 達成
- [ ] 未到達コードがない（または未到達がある場合は理由を記録）
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. カバレッジ計測コマンド実行
2. 計測結果の記録
3. Branch カバレッジ観点の確認
4. 未到達コード分析
5. カバレッジ目標との照合
6. カバレッジレポート作成

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
