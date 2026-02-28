# Phase 2 タスク6: テスト設計

## メタ情報

| 項目   | 内容                       |
| ------ | -------------------------- |
| タスク | タスク6: テスト設計        |
| 前提   | タスク1〜5（全設計タスク） |
| 作成日 | 2026-02-28                 |

## 目的

Phase 4 のテスト実装へ直接引き継げる粒度でテスト観点を固定する。テストファイル構成、テスト件数の目安、テスト観点を定義する。

---

## テストファイル構成

| #   | テストファイル                                                          | 対象                                           | 目安件数 |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------- | -------- |
| 1   | `packages/shared/src/types/__tests__/skill-analytics.test.ts`           | 型定義                                         | 8        |
| 2   | `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts` | 永続化・期間フィルタ・削除                     | 15       |
| 3   | `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts` | 統計・サマリー・トレンド・エクスポート・クリア | 29       |
| 4   | `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`    | IPC正常系/異常系/セキュリティ                  | 27       |
|     | **合計**                                                                |                                                | **79**   |

---

## テストファイル1: skill-analytics.test.ts（型定義、8テスト）

### ファイルパス

`packages/shared/src/types/__tests__/skill-analytics.test.ts`

### テスト環境

- Vitest（node 環境）
- DOM 不要

### テスト一覧

| #   | テストケース                                                                                                | 観点     |
| --- | ----------------------------------------------------------------------------------------------------------- | -------- |
| 1   | SkillUsageEvent が必須フィールドを持つオブジェクトとして型チェックを通過する                                | 型互換性 |
| 2   | SkillUsageEvent のオプショナルフィールド（duration, errorMessage, tokenCount）を省略できる                  | 型互換性 |
| 3   | ToolUsageStat が toolName, count, percentage を持つ                                                         | 型互換性 |
| 4   | SkillStatistics が全必須フィールドを持ち、lastUsed が string \| null を許容する                             | 型互換性 |
| 5   | AnalyticsPeriod の granularity が "hour" \| "day" \| "week" \| "month" のいずれかを受け付ける               | 列挙値   |
| 6   | TrendDataPoint が timestamp, executions, errors, avgDuration を持つ                                         | 型互換性 |
| 7   | UsageTrend が period と dataPoints を持つ                                                                   | 型互換性 |
| 8   | AnalyticsSummary が totalSkills, totalExecutions, overallSuccessRate, mostUsedSkills, recentActivity を持つ | 型互換性 |

### テスト方針

- 型の互換性は、テスト内でオブジェクトリテラルを代入して TypeScript コンパイルが通ることを確認する
- `satisfies` 演算子または型アサーションなしの代入で検証する
- 実行時にはオブジェクトのキーの存在を `expect(Object.keys(obj)).toContain("fieldName")` で確認する

---

## テストファイル2: AnalyticsStore.test.ts（永続化、15テスト）

### ファイルパス

`apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts`

### テスト環境

- Vitest（node 環境）
- `electron-store` をモック注入（DI 対応コンストラクタ）

### テスト一覧

#### 初期化（3テスト）

| #   | テストケース                                                                                | 観点           |
| --- | ------------------------------------------------------------------------------------------- | -------------- |
| 1   | 空のストアから初期化すると getAllEvents() が空配列を返す                                    | 初期状態       |
| 2   | 既存データを持つストアから初期化すると正しくイベントが復元される                            | データ復元     |
| 3   | 破損データ（非配列、不正な要素）を含むストアから初期化すると不正要素が除外される（P19対策） | データ破損耐性 |

#### addEvent（3テスト）

| #   | テストケース                                             | 観点      |
| --- | -------------------------------------------------------- | --------- |
| 4   | addEvent で UUID 付きのイベントが追加される              | UUID 生成 |
| 5   | addEvent 後に persist() が呼ばれストアに保存される       | 永続化    |
| 6   | 複数イベントを追加すると getAllEvents() で全件取得できる | 複数件    |

#### getEventsBySkill（2テスト）

| #   | テストケース                                   | 観点           |
| --- | ---------------------------------------------- | -------------- |
| 7   | 指定スキル名のイベントのみが返される           | フィルタリング |
| 8   | 存在しないスキル名を指定すると空配列が返される | 0件            |

#### getEventsByPeriod（3テスト）

| #   | テストケース                                     | 観点         |
| --- | ------------------------------------------------ | ------------ |
| 9   | 期間内のイベントのみが返される（start/end 含む） | 期間フィルタ |
| 10  | 期間外のイベントは返されない                     | 期間境界     |
| 11  | 期間内にイベントが0件の場合は空配列が返される    | 0件          |

#### clearBefore（2テスト）

| #   | テストケース                          | 観点     |
| --- | ------------------------------------- | -------- |
| 12  | 指定日時以前のイベントが削除される    | 日時削除 |
| 13  | clearBefore 後に persist() が呼ばれる | 永続化   |

#### clearAll（2テスト）

| #   | テストケース                       | 観点   |
| --- | ---------------------------------- | ------ |
| 14  | clearAll で全イベントが削除される  | 全削除 |
| 15  | clearAll 後に persist() が呼ばれる | 永続化 |

---

## テストファイル3: SkillAnalytics.test.ts（統計、29テスト）

### ファイルパス

`apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts`

### テスト環境

- Vitest（node 環境）
- `AnalyticsStore` をモック（vi.fn() で各メソッドをモック化）

### テスト一覧

#### recordEvent（4テスト）

| #   | テストケース                                                                 | 観点         |
| --- | ---------------------------------------------------------------------------- | ------------ |
| 1   | timestamp 付きのイベントがそのまま記録される                                 | 正常系       |
| 2   | timestamp 未指定時に自動補完される                                           | 自動補完     |
| 3   | オプショナルフィールド（duration, errorMessage, tokenCount）が正しく渡される | オプショナル |
| 4   | AnalyticsStore.addEvent が呼ばれることを確認する                             | 委譲確認     |

#### getStatistics（8テスト）

| #   | テストケース                                                                                | 観点           |
| --- | ------------------------------------------------------------------------------------------- | -------------- |
| 5   | 0件のスキルに対して successRate=0, averageDuration=0, errorRate=0, totalTokens=0 が返される | 0件境界        |
| 6   | 1件の成功イベントに対して successRate=1, errorRate=0 が返される                             | 1件            |
| 7   | 混合イベント（成功2件、エラー1件）に対して正しい successRate と errorRate が計算される      | 混合           |
| 8   | duration 定義イベントのみの平均値が averageDuration に設定される                            | duration平均   |
| 9   | duration 未定義のイベントのみの場合 averageDuration=0 が返される                            | duration 0件   |
| 10  | tokenCount の合計が totalTokens に設定される（undefined は 0 として扱う）                   | tokenCount集計 |
| 11  | lastUsed が最新イベントの timestamp に設定される                                            | lastUsed       |
| 12  | mostUsedTools がツール使用回数降順で返され、percentage が正しく計算される                   | ツール統計     |

#### getSummary（6テスト）

| #   | テストケース                                                                | 観点         |
| --- | --------------------------------------------------------------------------- | ------------ |
| 13  | 0件の場合 totalSkills=0, totalExecutions=0, overallSuccessRate=0 が返される | 0件境界      |
| 14  | 複数スキルのイベントがある場合 totalSkills が正しいスキル数を返す           | スキル数     |
| 15  | overallSuccessRate が全イベントの成功率として計算される                     | 全体成功率   |
| 16  | mostUsedSkills が実行回数降順でソートされている                             | ソート       |
| 17  | recentActivity が最新イベントから MAX_RECENT_ACTIVITY 件返される            | 最新イベント |
| 18  | mostUsedSkills の各要素に lastUsed が設定されている                         | lastUsed     |

#### getUsageTrend（6テスト）

| #   | テストケース                                                                                     | 観点       |
| --- | ------------------------------------------------------------------------------------------------ | ---------- |
| 19  | hour 粒度で正しいデータポイントが生成される                                                      | hour 粒度  |
| 20  | day 粒度で正しいデータポイントが生成される                                                       | day 粒度   |
| 21  | week 粒度で正しいデータポイントが生成される                                                      | week 粒度  |
| 22  | month 粒度で正しいデータポイントが生成される                                                     | month 粒度 |
| 23  | 期間内にイベントが0件の区間は executions=0, errors=0, avgDuration=0 のデータポイントが生成される | 0件区間    |
| 24  | 各データポイントの timestamp が区間の開始時刻を示す                                              | timestamp  |

#### exportData（3テスト）

| #   | テストケース                                                     | 観点         |
| --- | ---------------------------------------------------------------- | ------------ |
| 25  | JSON フォーマットでインデント2スペースの整形済み文字列が返される | JSON         |
| 26  | CSV フォーマットでヘッダー付きのカンマ区切り文字列が返される     | CSV          |
| 27  | period 指定時に期間内のイベントのみがエクスポートされる          | 期間フィルタ |

#### clearData（2テスト）

| #   | テストケース                                          | 観点     |
| --- | ----------------------------------------------------- | -------- |
| 28  | before 指定時に AnalyticsStore.clearBefore が呼ばれる | 部分削除 |
| 29  | before 未指定時に AnalyticsStore.clearAll が呼ばれる  | 全削除   |

---

## テストファイル4: skillAnalyticsHandlers.test.ts（IPC、27テスト）

### ファイルパス

`apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`

### テスト環境

- Vitest（node 環境）
- `ipcMain.handle` / `BrowserWindow` / `validateIpcSender` をモック
- `SkillAnalytics` をモック

### テスト一覧

#### skill:analytics:record（8テスト）

| #   | テストケース                                   | 観点     |
| --- | ---------------------------------------------- | -------- |
| 1   | 正常な引数で { success: true } が返される      | 正常系   |
| 2   | skillName が空文字列の場合エラーが返される     | P42      |
| 3   | skillName がスペースのみの場合エラーが返される | P42 trim |
| 4   | eventType が不正な値の場合エラーが返される     | 列挙値   |
| 5   | success が boolean でない場合エラーが返される  | 型検証   |
| 6   | toolsUsed が配列でない場合エラーが返される     | 配列検証 |
| 7   | duration が負数の場合エラーが返される          | 非負検証 |
| 8   | tokenCount が負数の場合エラーが返される        | 非負検証 |

#### skill:analytics:statistics（3テスト）

| #   | テストケース                                                            | 観点     |
| --- | ----------------------------------------------------------------------- | -------- |
| 9   | 正常な skillName で { success: true, data: SkillStatistics } が返される | 正常系   |
| 10  | skillName が空文字列の場合エラーが返される                              | P42      |
| 11  | skillName がスペースのみの場合エラーが返される                          | P42 trim |

#### skill:analytics:summary（2テスト）

| #   | テストケース                                                    | 観点     |
| --- | --------------------------------------------------------------- | -------- |
| 12  | 引数なしで { success: true, data: AnalyticsSummary } が返される | 正常系   |
| 13  | SkillAnalytics.getSummary が呼ばれることを確認する              | 委譲確認 |

#### skill:analytics:trend（7テスト）

| #   | テストケース                                                | 観点             |
| --- | ----------------------------------------------------------- | ---------------- |
| 14  | 正常な引数で { success: true, data: UsageTrend } が返される | 正常系           |
| 15  | skillName が空文字列の場合エラーが返される                  | P42              |
| 16  | period がオブジェクトでない場合エラーが返される             | オブジェクト検証 |
| 17  | period.start が不正な日付の場合エラーが返される             | ISO 8601         |
| 18  | period.end が不正な日付の場合エラーが返される               | ISO 8601         |
| 19  | start > end の場合エラーが返される                          | 範囲検証         |
| 20  | granularity が不正な値の場合エラーが返される                | 列挙値           |

#### skill:analytics:export（4テスト）

| #   | テストケース                                                             | 観点                   |
| --- | ------------------------------------------------------------------------ | ---------------------- |
| 21  | 正常な引数（format="json"）で { success: true, data: string } が返される | 正常系 JSON            |
| 22  | 正常な引数（format="csv"）で { success: true, data: string } が返される  | 正常系 CSV             |
| 23  | format が不正な値の場合エラーが返される                                  | 列挙値                 |
| 24  | period 指定時に period のバリデーションが実行される                      | 条件付きバリデーション |

#### セキュリティ（3テスト）

| #   | テストケース                                                                        | 観点         |
| --- | ----------------------------------------------------------------------------------- | ------------ |
| 25  | validateIpcSender が全チャネルで呼ばれる                                            | Sender検証   |
| 26  | Sender 検証失敗時にエラーレスポンスが返される                                       | 認可失敗     |
| 27  | 予期しない例外が発生した場合 { success: false, error: "Internal error" } が返される | エラー正規化 |

---

## テスト観点の横断的整理

### 正常系（5チャネルの成功パス）

- 全5チャネルで正常な引数を渡した場合に `{ success: true }` または `{ success: true, data: T }` が返されることを確認する
- SkillAnalytics の対応メソッドが呼ばれることを確認する

### 異常系（P42、period/format 不正、内部例外）

- P42 準拠3段バリデーション: 型違い、空文字列、トリム空文字列の全パターンをテスト
- 列挙値バリデーション: 許可リスト外の値で具体的なエラーメッセージが返されることを確認
- 数値バリデーション: 負数で具体的なエラーメッセージが返されることを確認
- 内部例外: catch 節で `"Internal error"` に正規化されることを確認

### 境界値

- 0件: イベントが0件の場合の統計計算結果（successRate=0, averageDuration=0）
- 1件: イベントが1件の場合の統計計算結果
- 期間境界: start と end に一致するイベントが含まれることを確認（inclusive）
- 大量データ: 10,000件のイベントで性能劣化がないことを確認（NFR-3 対応）

### セキュリティ

- `validateIpcSender` が全5チャネルのハンドラで先頭に呼ばれることを確認
- チャネル名が `IPC_CHANNELS` 定数で参照されていることを確認（ハードコード文字列禁止、P27対策）
- エラーレスポンスに内部情報（スタックトレース、ファイルパス）が含まれないことを確認

---

## カバレッジ基準

Phase 7（カバレッジ確認）で以下の基準を満たすことを目標とする。

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                                    |
| ----------------- | -------- | -------- | --------------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | AnalyticsStore.ts, SkillAnalytics.ts, skillAnalyticsHandlers.ts |
| Branch Coverage   | 60%      | 70%      | 同上                                                            |
| Function Coverage | 80%      | 90%      | 同上                                                            |

### P41 対策

`validateIpcSender` オプションオブジェクト内の `getAllowedWindows` コールバックが実行されないと Function Coverage が低下する。セキュリティテストで `mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` を明示的に呼び出して検証する。

---

## テスト実行方法

```bash
# 型定義テスト
cd packages/shared && pnpm vitest run src/types/__tests__/skill-analytics.test.ts

# AnalyticsStore テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/AnalyticsStore.test.ts

# SkillAnalytics テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics.test.ts

# IPCハンドラテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts

# 全テスト一括実行
cd apps/desktop && pnpm vitest run --reporter=verbose
```

P40 対策として、テスト実行は対象パッケージのディレクトリから行う。

---

## 完了条件

- [x] 4テストファイルの構成が確定している
- [x] 合計79テストケースの一覧が定義されている
- [x] 正常系・異常系・境界値・セキュリティの4観点が網羅されている
- [x] カバレッジ基準が定義されている
- [x] テスト環境（Vitest, モック方針）が定義されている
- [x] Phase 4 で直接テストコードを書ける粒度で記述されている
