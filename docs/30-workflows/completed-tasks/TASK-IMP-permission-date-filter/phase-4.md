# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 4                               |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

期間別フィルタリング機能の期待動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- 型定義テスト: DateRangeFilter/DatePreset型のテスト作成
- フィルタロジックテスト: 日付フィルタリングロジックのユニットテスト作成
- UIコンポーネントテスト: PermissionHistoryFilter.tsxの期間UI拡張テスト作成
- 統合テスト: 既存フィルタとの複合条件テスト作成
- 境界値テスト: 日付境界値・エッジケースのテスト作成

## 参照資料

| 資料名           | パス                                                                         | 説明             |
| ---------------- | ---------------------------------------------------------------------------- | ---------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                                 | Phase 1成果物    |
| 設計書           | `outputs/phase-2/architecture-design.md`                                     | Phase 2成果物    |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                                    | Phase 3成果物    |
| 既存テスト       | `apps/desktop/src/renderer/components/settings/PermissionSettings/*.test.ts` | 既存テストコード |

## 実行手順

### 1. 型定義テスト

`permissionHistory.test.ts`に以下のテストケースを追加:

| テストケース                                        | 期待結果                          |
| --------------------------------------------------- | --------------------------------- |
| DateRangeFilterがoptionalフィールドとして定義できる | 型エラーなし                      |
| DatePresetが5つの値を持つ                           | all/today/week/month/customが存在 |
| dateRange未指定のフィルタが後方互換で動作する       | 既存フィルタと同一動作            |

### 2. フィルタロジックテスト

日付フィルタリング用ヘルパー関数のテスト:

| テストケース                           | 入力                             | 期待結果               |
| -------------------------------------- | -------------------------------- | ---------------------- |
| preset="all"でフィルタなし             | 全エントリ                       | 全件返却               |
| preset="today"で今日のエントリのみ     | 今日+昨日のエントリ              | 今日分のみ             |
| preset="week"で7日以内のエントリのみ   | 8日前+3日前+今日のエントリ       | 3日前と今日            |
| preset="month"で30日以内のエントリのみ | 31日前+15日前+今日のエントリ     | 15日前と今日           |
| preset="custom"でstart/end範囲内のみ   | start=2/1, end=2/5, エントリ複数 | 範囲内のみ             |
| preset="custom"でstartのみ指定         | start=2/1, endなし               | 2/1以降の全エントリ    |
| preset="custom"でendのみ指定           | startなし, end=2/5               | 2/5以前の全エントリ    |
| ツール名+期間の複合フィルタ            | toolName="Bash", preset="today"  | 今日のBashエントリのみ |
| 判断結果+期間の複合フィルタ            | decision="denied", preset="week" | 7日以内のdeniedのみ    |
| 3フィルタ全条件の複合                  | toolName+decision+dateRange      | 全条件合致のみ         |

### 3. UIコンポーネントテスト

`PermissionHistoryFilter.test.tsx`に以下のテストケースを追加:

| テストケース                                | 操作                   | 期待結果                         |
| ------------------------------------------- | ---------------------- | -------------------------------- |
| 期間セレクトが表示される                    | 初期レンダリング       | 期間セレクトボックスが存在       |
| デフォルト値が「全期間」                    | 初期レンダリング       | 「全期間」が選択されている       |
| プリセット選択でonFilterChange発火          | 「今日」を選択         | dateRange.preset="today"でコール |
| カスタム選択時に日付入力が表示              | 「カスタム範囲」を選択 | start/endの日付入力が表示される  |
| プリセット選択時に日付入力が非表示          | 「過去7日」を選択      | 日付入力が表示されない           |
| カスタム範囲のstart入力でonFilterChange発火 | start日付を入力        | dateRange.start更新でコール      |
| カスタム範囲のend入力でonFilterChange発火   | end日付を入力          | dateRange.end更新でコール        |

### 4. 境界値テスト

| テストケース                                       | 入力                              | 期待結果     |
| -------------------------------------------------- | --------------------------------- | ------------ |
| 今日の00:00:00ちょうどのエントリ（今日プリセット） | timestamp = 本日00:00:00.000Z     | フィルタ通過 |
| 昨日の23:59:59のエントリ（今日プリセット）         | timestamp = 昨日23:59:59.999Z     | フィルタ除外 |
| 7日前の00:00:00ちょうど（週プリセット）            | timestamp = 7日前00:00:00.000Z    | フィルタ通過 |
| 8日前の23:59:59（週プリセット）                    | timestamp = 8日前23:59:59.999Z    | フィルタ除外 |
| カスタムstart境界（ちょうど一致）                  | start=2/1, timestamp=2/1 00:00:00 | フィルタ通過 |
| カスタムend境界（ちょうど一致）                    | end=2/5, timestamp=2/5 23:59:59   | フィルタ通過 |
| 空の履歴に対するフィルタ                           | entries=[], preset="today"        | 空配列       |
| 全1000件に対するフィルタ                           | 1000件, preset="today"            | 該当件のみ   |

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                                 | テストファイル                    |
| ------------------ | -------------------------------------------------------- | --------------------------------- |
| 状態同期テスト     | setHistoryFilter→フィルタ適用→表示更新の一連フロー       | `PermissionHistoryPanel.test.tsx` |
| データフローテスト | dateRange変更→store更新→Panel再レンダリング→表示件数変化 | `PermissionHistoryPanel.test.tsx` |

## アーキテクチャ層別テスト（AIが判断）

| 層               | テスト観点                                   | テストファイル配置                                                           |
| ---------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| Renderer Process | UIコンポーネント、フィルタロジック、日付処理 | `apps/desktop/src/renderer/components/settings/PermissionSettings/*.test.ts` |
| Shared           | DateRangeFilter/DatePreset型定義             | `packages/shared/src/types/permissionHistory.test.ts`                        |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断 | 仕様参照先                         |
| ---------------- | -------- | ---------------------------------- |
| UI/UX            | 適用     | UIコンポーネントテストでUXを検証   |
| アクセシビリティ | 適用     | aria属性・label関連のテスト        |
| パフォーマンス   | 適用     | 1000件フィルタのテストケースで確認 |

## 成果物

| 成果物           | パス                                                                         | 説明         |
| ---------------- | ---------------------------------------------------------------------------- | ------------ |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                      | テスト設計   |
| テストケース一覧 | `outputs/phase-4/test-cases.md`                                              | ケース一覧   |
| テストファイル   | `apps/desktop/src/renderer/components/settings/PermissionSettings/*.test.ts` | テストコード |
| テストファイル   | `packages/shared/src/types/permissionHistory.test.ts`                        | 型テスト     |

## 完了条件

- [ ] 受け入れ基準（AC-1〜AC-8）ごとにユニットテストがある
- [ ] 境界値テストが含まれている
- [ ] 複合フィルタテスト（ツール名+期間、判断結果+期間、3条件複合）が作成されている
- [ ] UIコンポーネントテスト（表示/非表示切替、onFilterChange発火）が作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 1-3成果物、既存テストコード）
2. 型定義テストの作成
3. フィルタロジックテストの作成
4. UIコンポーネントテストの作成
5. 境界値テストの作成
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop exec vitest run src/renderer/components/settings/PermissionSettings/

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-date-filter --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
