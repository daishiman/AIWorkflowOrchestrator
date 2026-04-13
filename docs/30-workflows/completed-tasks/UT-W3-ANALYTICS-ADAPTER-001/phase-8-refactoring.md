# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 8                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 7                                                      |
| 後続Phase  | Phase 9                                                      |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

`analyticsAdapter.ts`・`analyticsHandler.ts`・`trackEvent.ts`のコード品質を改善する。
重複除去・命名揺れ修正・フォールバック処理の統一を行い、リファクタリング後もテストが通ることを確認する。

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング後テスト確認
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/analyticsAdapter.test.ts
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

## 実行タスク

### タスク1: 重複コード除去

**目的**: `analyticsAdapter.ts`・`analyticsHandler.ts`の重複ロジックを除去する

**実行手順**:

1. 重複しているエラーハンドリングパターンを特定する
2. フォールバック処理を統一された関数にまとめる
3. キュー操作のユーティリティ関数を整理する
4. リファクタリング後のテストが全件PASSすることを確認する

**期待される成果物**:

- `outputs/phase-8/refactoring-plan.md`（対象/Before/After/理由テーブル）

### タスク2: 命名揺れ修正

**目的**: 既存プロジェクトの命名規則と一致させる

**実行手順**:

1. `analyticsAdapter.ts`の関数名・変数名をPhase 1で確認した命名規則と照合する
2. `analyticsHandler.ts`のIPCチャネル名・ハンドラー名の一貫性を確認する
3. 命名揺れを修正する
4. リファクタリング後のテストが全件PASSすることを確認する

**期待される成果物**:

- `outputs/phase-8/refactoring-plan.md`（命名修正セクション）

### タスク3: リファクタリング後テスト確認

**目的**: リファクタリングによる回帰がないことを確認する

**実行手順**:

1. 全テストスイートを実行する
2. テスト結果を記録する
3. カバレッジが目標値を維持していることを確認する
4. 失敗したテストがあれば修正する

**期待される成果物**:

- `outputs/phase-8/post-refactor-test-plan.md`

### タスク4: 責務境界マップ更新

**目的**: リファクタリング後の責務境界が適切であることを確認する

**実行手順**:

1. Renderer/Preload/Main/IPCの責務境界が設計通りであることを確認する
2. `analyticsAdapter.ts`（Renderer側）と`analyticsHandler.ts`（Main側）の境界を明記する
3. 状態所有権（キュー・オプトアウト設定・初期化状態）が適切に分配されていることを確認する

**期待される成果物**:

- `outputs/phase-8/responsibility-boundary-map.md`

## リファクタリング記録形式（[Feedback RT-03]）

変更内容は `対象/Before/After/理由` テーブル形式で記録する:

| 対象               | Before                | After                          | 理由                         |
| ------------------ | --------------------- | ------------------------------ | ---------------------------- |
| エラーハンドリング | 各関数で個別try-catch | `withFallback()`ユーティリティ | 重複除去・一貫性向上         |
| キュー操作         | インライン配列操作    | `AnalyticsQueue`クラス         | 責務分離・テスタビリティ向上 |

## 参照資料

| 参照資料                   | パス                                                 |
| -------------------------- | ---------------------------------------------------- |
| Phase 7 カバレッジレポート | `outputs/phase-7/traceability-coverage-report.md`    |
| FB-RT-03: 変更記録形式     | `.claude/skills/task-specification-creator/SKILL.md` |

## 成果物

| 成果物                   | パス                                             | 内容                           |
| ------------------------ | ------------------------------------------------ | ------------------------------ |
| リファクタリング計画     | `outputs/phase-8/refactoring-plan.md`            | 対象/Before/After/理由テーブル |
| リファクタリング後テスト | `outputs/phase-8/post-refactor-test-plan.md`     | テスト結果確認                 |
| 責務境界マップ           | `outputs/phase-8/responsibility-boundary-map.md` | Renderer/Main責務境界          |

## 完了条件

- [ ] 重複コード除去完了（リファクタリング計画に記録済み）
- [ ] 命名揺れ修正完了
- [ ] フォールバック処理統一完了
- [ ] リファクタリング後の全テストがPASS
- [ ] カバレッジが目標値を維持
- [ ] 責務境界マップが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 9: 品質保証
