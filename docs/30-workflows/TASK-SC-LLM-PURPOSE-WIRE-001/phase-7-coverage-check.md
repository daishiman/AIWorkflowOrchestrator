# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 7                            |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 機能名     | llm-purpose-wire             |
| 前提Phase  | Phase 6                      |
| 後続Phase  | Phase 8                      |
| 作成日     | 2026-04-16                   |
| ステータス | pending                      |

## 目的

`SkillCreatorService.ts` の変更ブロック（`runCreateWorkflow` の LLM 呼び出し部分・
コンストラクタの `llmClient` フィールド）のカバレッジを計測し、
目標値（Line 80%+、Branch 60%+、Function 80%+）を達成していることを確認する。
未到達コードがある場合は原因を分析し、追加テストの要否を判断する。

## 実行タスク

- カバレッジ計測: 変更ブロック（`SkillCreatorService.ts`）を対象に計測
- 未到達コード分析: Line / Branch / Function カバレッジの確認
- カバレッジ目標との照合: 基準値充足確認
- カバレッジレポート作成

## 参照資料

| 資料名         | パス                                                                         | 用途               |
| -------------- | ---------------------------------------------------------------------------- | ------------------ |
| 実装ファイル   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | カバレッジ対象確認 |
| テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | テスト件数確認     |
| Phase 6 成果物 | `outputs/phase-6/`                                                           | 追加テスト確認     |

## 実行手順

### 1. カバレッジ計測コマンド（変更ブロック指定）

```bash
# 変更ファイル指定でカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

### 2. カバレッジ目標

> カバレッジ対象は変更した関数・ブロックのみ
> （コンストラクタの `llmClient` フィールド設定・`runCreateWorkflow` の LLM 呼び出し部分）。

| 計測対象                                       | Line | Branch | Function |
| ---------------------------------------------- | ---- | ------ | -------- |
| `runCreateWorkflow()` 関数（LLM 呼び出し部分） | 80%+ | 60%+   | 100%     |
| `SkillCreatorService` コンストラクタ           | 80%+ | 60%+   | 100%     |
| `SkillCreatorService.ts` 全体                  | 80%+ | 60%+   | 80%+     |

### 3. 計測結果記録（実行時に記入）

| 計測対象                             | Line | Branch | Function | 判定    |
| ------------------------------------ | ---- | ------ | -------- | ------- |
| `runCreateWorkflow()` 関数           | -    | -      | -        | pending |
| `SkillCreatorService` コンストラクタ | -    | -      | -        | pending |
| `SkillCreatorService.ts` 全体        | -    | -      | -        | pending |

### 4. Branch カバレッジ確認観点

以下のブランチが全てテストされていることを確認する。

| ブランチ                                                                     | 対応 TC       |
| ---------------------------------------------------------------------------- | ------------- |
| `loadAgent` 失敗 → `null` 返却                                               | TC-06, TC-12  |
| default client で `llmClient.complete()` を実行                              | TC-01〜TC-05  |
| `default client` → selected config が未選択ならフォールバック（description） | TC-07         |
| `result.success === true` → `purpose = result.data`                          | TC-01, TC-03  |
| `result.success === false` → フォールバック（description）                   | TC-04         |
| LLM 例外 → フォールバック（description）                                     | TC-05         |
| LLM が空文字列 / 空白を返す → purpose は description を維持                  | TC-09, TC-09b |

### 5. 未到達コード分析

```bash
# カバレッジレポートから未到達行を確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  2>&1 | grep -A 20 "SkillCreatorService.ts"
```

**未到達コードが存在する場合の対応方針**:

| 未到達コードの種類                     | 対応                                         |
| -------------------------------------- | -------------------------------------------- |
| `runCreateWorkflow` 以外の既存メソッド | 本タスクのスコープ外のため対応不要           |
| `runCreateWorkflow` 内の新規追加行     | Phase 6 に追加テストを追記して対処           |
| Branch カバレッジが 60% 未満の場合     | 不足しているブランチを特定し、対応 TC を追加 |

### 6. カバレッジレポート出力先確認

```bash
# HTML レポートを生成して視覚的に確認（任意）
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=html \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts

# レポートディレクトリ確認
ls apps/desktop/coverage/
```

### 7. 目標未達の場合の対処手順

Branch カバレッジが 60% 未満の場合、以下の追加テストを Phase 6 に追記する:

```bash
# 現在の Branch カバレッジ確認（詳細）
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=json \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts

# coverage/coverage-final.json から runCreateWorkflow の branch 詳細を確認
node -e "
  const cov = require('./apps/desktop/coverage/coverage-final.json');
  const key = Object.keys(cov).find(k => k.includes('SkillCreatorService.ts'));
  if (key) console.log(JSON.stringify(cov[key].branchMap, null, 2));
"
```

## 統合テスト連携【必須】

| 判定項目                                | 基準 | 結果    |
| --------------------------------------- | ---- | ------- |
| `runCreateWorkflow` Line カバレッジ     | 80%+ | pending |
| `runCreateWorkflow` Branch カバレッジ   | 60%+ | pending |
| `runCreateWorkflow` Function カバレッジ | 100% | pending |
| `SkillCreatorService.ts` 全体 Line      | 80%+ | pending |
| `SkillCreatorService.ts` 全体 Branch    | 60%+ | pending |
| `SkillCreatorService.ts` 全体 Function  | 80%+ | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| 矛盾     | カバレッジ目標とテストケース数（TC-01〜TC-13）が矛盾していないか                                                    |
| 漏れ     | `result.success === true/false`・`selected config あり/なし`・例外・`normalizePurpose` の全パスがカバーされているか |
| 整合性   | Phase 6 で追加したテスト（TC-09〜TC-13 + TC-09b）がカバレッジに寄与しているか                                       |
| 依存関係 | Phase 5 実装変更後のブランチ数と Phase 4+6 テスト件数が整合しているか                                               |

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・未到達コード分析・判定 |

## 完了条件

- [ ] 変更ブロック（`runCreateWorkflow` の LLM 呼び出し部分）のカバレッジ計測済み
- [ ] `runCreateWorkflow` が Line 80%+ / Branch 60%+ / Function 100% 達成
- [ ] `SkillCreatorService.ts` 全体が Line 80%+ / Branch 60%+ / Function 80%+ 達成
- [ ] Branch カバレッジ観点（7分岐）が全て対応 TC でカバーされている
- [ ] 未到達コードがない（または未到達がある場合は理由を記録）
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. カバレッジ計測コマンド実行
2. 計測結果の記録
3. Branch カバレッジ観点（7分岐）の確認
4. 未到達コード分析
5. カバレッジ目標との照合
6. 目標未達の場合の追加テスト対処
7. カバレッジレポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 8: リファクタリング
