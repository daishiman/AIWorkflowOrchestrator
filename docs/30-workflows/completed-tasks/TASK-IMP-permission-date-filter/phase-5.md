# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 5                               |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。

## 実行タスク

- 型拡張実装: permissionHistory.tsにDateRangeFilter/DatePreset型を追加
- フィルタロジック実装: 日付フィルタリングヘルパー関数の実装
- UI実装: PermissionHistoryFilter.tsxに期間選択UIを追加
- パネルロジック実装: PermissionHistoryPanel.tsxのフィルタ処理にdateRange対応を追加

## 参照資料

| 資料名         | パス                                                                                           | 説明                 |
| -------------- | ---------------------------------------------------------------------------------------------- | -------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`                                                   | Phase 1成果物        |
| 設計書         | `outputs/phase-2/architecture-design.md`                                                       | Phase 2成果物        |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                                        | Phase 4成果物        |
| 既存型定義     | `packages/shared/src/types/permissionHistory.ts`                                               | 既存型ファイル       |
| 既存フィルタUI | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx` | 既存UIコンポーネント |
| 既存パネル     | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`  | 既存パネル           |

## 実行手順

### 1. 型拡張実装

**対象ファイル**: `packages/shared/src/types/permissionHistory.ts`

以下の型を追加:

| 追加内容                                       | 説明                                                |
| ---------------------------------------------- | --------------------------------------------------- |
| `DatePreset` 型（union type）                  | `"all" \| "today" \| "week" \| "month" \| "custom"` |
| `DateRangeFilter` インターフェース             | preset: DatePreset, start?: string, end?: string    |
| `PermissionHistoryFilter.dateRange` フィールド | `dateRange?: DateRangeFilter`（既存型に追加）       |

### 2. フィルタロジック実装

**新規ヘルパー関数の作成場所**: `apps/desktop/src/renderer/components/settings/PermissionSettings/dateFilterUtils.ts`

| 関数名                  | 引数                                                            | 戻り値                     | 説明                                        |
| ----------------------- | --------------------------------------------------------------- | -------------------------- | ------------------------------------------- |
| `getDateRangeStartDate` | `preset: DatePreset`                                            | `Date \| null`             | プリセットから開始日を算出（allはnull返却） |
| `filterByDateRange`     | `entries: PermissionHistoryEntry[], dateRange: DateRangeFilter` | `PermissionHistoryEntry[]` | 日付範囲でフィルタリング                    |

**getDateRangeStartDate の実装ロジック:**

| preset   | 処理                                                    |
| -------- | ------------------------------------------------------- |
| `all`    | `null`を返す（フィルタなし）                            |
| `today`  | `new Date()`で今日を取得し`setHours(0,0,0,0)`で日の開始 |
| `week`   | 今日から7日前の日の開始                                 |
| `month`  | 今日から30日前の日の開始                                |
| `custom` | `null`を返す（start/endで個別判定）                     |

**filterByDateRange の実装ロジック:**

1. `dateRange.preset === "all"` の場合: 全件返却
2. プリセット（today/week/month）の場合: `getDateRangeStartDate`で開始日を取得し、`entry.timestamp >= startDate`でフィルタ
3. custom の場合: `dateRange.start`があれば`>= start`、`dateRange.end`があれば`<= end + 1日`でフィルタ

### 3. UI実装

**対象ファイル**: `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx`

以下のUI要素を追加:

| 要素                 | 配置場所                       | 仕様                                           |
| -------------------- | ------------------------------ | ---------------------------------------------- |
| 期間セレクトボックス | 既存フィルタ行の右端に追加     | 5つのプリセット選択肢                          |
| 開始日入力           | フィルタ行の下（条件付き表示） | `<input type="date" />`, preset="custom"時のみ |
| 終了日入力           | 開始日入力の右                 | `<input type="date" />`, preset="custom"時のみ |

**既存UIとの一貫性:**

| 項目             | 既存フィルタ準拠仕様                          |
| ---------------- | --------------------------------------------- |
| セレクトスタイル | 既存のツール名/判断結果セレクトと同一スタイル |
| ラベル表示       | 「期間」ラベルをセレクト上部に配置            |
| aria属性         | `aria-label="期間フィルタ"`を付与             |

### 4. パネルロジック実装

**対象ファイル**: `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`

既存のフィルタチェーンに`filterByDateRange`を追加:

| 手順 | 処理                                                               |
| ---- | ------------------------------------------------------------------ |
| 1    | 既存のtoolNameフィルタ適用                                         |
| 2    | 既存のdecisionフィルタ適用                                         |
| 3    | `historyFilter.dateRange`が存在する場合、`filterByDateRange`を適用 |

## 統合テスト連携【必須】

| 実装項目           | 内容                                                             |
| ------------------ | ---------------------------------------------------------------- |
| 状態同期           | setHistoryFilter経由でdateRangeが正しくZustand storeに反映される |
| エラーハンドリング | 無効な日付文字列はフィルタに影響しない（undefinedとして扱う）    |

## アーキテクチャ層別実装（AIが判断）

| 層               | 実装観点                           | 実装ファイル配置                                                    | 仕様参照先                                             |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| Renderer Process | UIコンポーネント、フィルタロジック | `apps/desktop/src/renderer/components/settings/PermissionSettings/` | `aiworkflow-requirements: ui-ux-settings.md` L286-L291 |
| Shared           | DateRangeFilter/DatePreset型定義   | `packages/shared/src/types/permissionHistory.ts`                    | `aiworkflow-requirements: arch-state-management.md`    |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                   |
| ------------------ | -------- | -------------------------------------------- |
| UI/UX              | 適用     | `aiworkflow-requirements: ui-ux-settings.md` |
| アクセシビリティ   | 適用     | select/input要素のaria属性・label            |
| パフォーマンス     | 適用     | filterByDateRangeのO(n)計算量                |
| エラーハンドリング | 適用     | 無効日付入力の安全な処理                     |

## 成果物

| 成果物                 | パス                                                                                           | 説明                 |
| ---------------------- | ---------------------------------------------------------------------------------------------- | -------------------- |
| 型定義                 | `packages/shared/src/types/permissionHistory.ts`                                               | DateRangeFilter追加  |
| フィルタユーティリティ | `apps/desktop/src/renderer/components/settings/PermissionSettings/dateFilterUtils.ts`          | 日付フィルタヘルパー |
| フィルタUI             | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx` | 期間セレクト追加     |
| パネルロジック         | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`  | フィルタチェーン拡張 |

## 完了条件

- [ ] DateRangeFilter/DatePreset型が追加されている
- [ ] getDateRangeStartDate/filterByDateRange関数が実装されている
- [ ] PermissionHistoryFilter.tsxに期間セレクトUIが追加されている
- [ ] カスタム範囲選択時に日付入力が表示される
- [ ] PermissionHistoryPanel.tsxのフィルタロジックにdateRange対応が追加されている
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 1-4成果物、既存コード）
2. 型拡張実装（permissionHistory.ts）
3. フィルタロジック実装（dateFilterUtils.ts）
4. UI実装（PermissionHistoryFilter.tsx）
5. パネルロジック実装（PermissionHistoryPanel.tsx）
6. 統合テスト連携の実施
7. TDD検証（Green状態確認）
8. 完了条件の検証

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop exec vitest run src/renderer/components/settings/PermissionSettings/

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-date-filter --phase 5
```

## 次のPhase

Phase 6: テスト拡充
