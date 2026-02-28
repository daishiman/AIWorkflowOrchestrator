# Phase 6: テスト拡充 — TASK-9J スキル使用統計・分析機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| Phase名    | テスト拡充                                       |
| タスクID   | TASK-9J                                          |
| 機能名     | TASK-9J-skill-analytics                          |
| 作成日     | 2026-02-28                                       |
| 前提Phase  | Phase 5（実装・Green状態確認）                   |
| 後続Phase  | Phase 7（カバレッジ確認）                        |
| ステータス | 未着手                                           |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

---

## 目的

Phase 5 の実装に対して、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすために**不足しているテストを追加**する。境界値・エッジケース・エラーケース・統合テスト・パフォーマンステストにより、実装の堅牢性を検証する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                             |
| ----------------- | -------- | -------- | -------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `apps/desktop/src/main/services/skill/SkillAnalytics.ts` |
| Branch Coverage   | 60%      | 70%      | `apps/desktop/src/main/services/skill/AnalyticsStore.ts` |
| Function Coverage | 80%      | 90%      | `apps/desktop/src/main/ipc/skillHandlers.ts`             |

## 実行タスク

- Task 1: AnalyticsStore の境界値テストを追加する
- Task 2: SkillAnalytics の境界値・エッジケーステストを追加する
- Task 3: IPCハンドラーの境界値テストを追加する
- Task 4: セキュリティテストを追加する
- Task 5: パフォーマンステストを追加する

### Task 1: AnalyticsStore 境界値テスト追加

**対象ファイル**: `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts`（既存ファイルに追加）

#### 1.1 テストケース一覧

| No    | テスト項目                                                               | 期待結果                                             |
| ----- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| AB-01 | 複数スキルの10,000件イベントから特定スキルのみフィルタ取得できる         | `getEventsBySkill` が指定スキルのイベントのみを返す  |
| AB-02 | clearBefore で境界値の日時（ちょうど一致するタイムスタンプ）を正しく処理 | 指定日時と同一のタイムスタンプのイベントが削除される |
| AB-03 | clearBefore で未来日時を指定すると全イベントが削除される                 | `getAllEvents()` が `[]` を返す                      |
| AB-04 | clearBefore で過去の日時（全イベントより前）を指定するとイベントが残る   | `getAllEvents()` が元の全件を返す                    |
| AB-05 | addEvent 直後に getEventsBySkill で取得できる                            | 追加したイベントが即座にフィルタ結果に含まれる       |
| AB-06 | 保存データにnull要素が含まれる場合にフィルタされる                       | null 要素が除外され正常要素のみ復元される            |

### Task 2: SkillAnalytics 境界値・エッジケーステスト追加

**対象ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts`（既存ファイルに追加）

#### 2.1 テストケース一覧（calculateStatistics 境界値）

| No    | テスト項目                                                           | 期待結果              |
| ----- | -------------------------------------------------------------------- | --------------------- |
| SB-01 | 全イベントの success が true の場合 successRate が 1.0 を返す        | successRate === 1.0   |
| SB-02 | 全イベントの success が false の場合 successRate が 0.0 を返す       | successRate === 0.0   |
| SB-03 | duration が全て undefined のイベント群で averageDuration が 0 を返す | averageDuration === 0 |
| SB-04 | toolsUsed が空配列のイベントのみの場合 mostUsedTools が空配列を返す  | mostUsedTools === []  |
| SB-05 | tokenCount が全て undefined のイベント群で totalTokens が 0 を返す   | totalTokens === 0     |

#### 2.2 テストケース一覧（aggregateByPeriod エッジケース）

| No    | テスト項目                                                             | 期待結果                                                 |
| ----- | ---------------------------------------------------------------------- | -------------------------------------------------------- |
| SB-06 | granularity: "hour" で24時間分のイベントが正しく24ポイントに集計される | dataPoints.length === 24                                 |
| SB-07 | granularity: "week" で月をまたぐ期間が正しく集計される                 | 週の境界をまたぐイベントが正しいデータポイントに含まれる |
| SB-08 | granularity: "month" で年をまたぐ期間が正しく集計される                | 月の境界をまたぐイベントが正しいデータポイントに含まれる |
| SB-09 | 同一タイムスタンプの複数イベントが同じデータポイントに集計される       | 同一時刻の2イベントが1つのデータポイントに合算される     |

#### 2.3 テストケース一覧（exportData エッジケース）

| No    | テスト項目                                                               | 期待結果                                                   |
| ----- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| SB-10 | exportData で JSON エクスポートがイベント0件の場合に `"[]"` を返す       | `JSON.parse(result)` が空配列を返す                        |
| SB-11 | exportData で CSV エクスポートがイベント0件の場合にヘッダー行のみを返す  | 結果にヘッダー行のみ含まれデータ行がない                   |
| SB-12 | exportData で CSV の toolsUsed 配列がカンマ区切り文字列に変換される      | `["tool1","tool2"]` が `"tool1;tool2"` として出力される    |
| SB-13 | exportData で errorMessage に改行・カンマを含む場合にCSVエスケープされる | ダブルクォートで囲まれてエスケープされた文字列が出力される |

### Task 3: IPCハンドラー境界値テスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`（既存ファイルに追加）

#### 3.1 テストケース一覧

| No    | チャンネル               | テスト項目                              | 期待結果                                                                  |
| ----- | ------------------------ | --------------------------------------- | ------------------------------------------------------------------------- |
| HB-01 | `skill:analytics:record` | duration が負の数値                     | 正常に記録される（duration の範囲チェックはサービス層の責務）             |
| HB-02 | `skill:analytics:record` | toolsUsed が空配列 `[]`                 | 正常に記録される                                                          |
| HB-03 | `skill:analytics:record` | toolsUsed の要素に文字列以外が含まれる  | `{ success: false, error: "toolsUsed must be an array of strings" }`      |
| HB-04 | `skill:analytics:record` | tokenCount が 0                         | 正常に記録される                                                          |
| HB-05 | `skill:analytics:trend`  | period.start が period.end より後の日時 | `{ success: false, error: "start must be before end" }`                   |
| HB-06 | `skill:analytics:trend`  | period.start と period.end が同一日時   | 正常に取得される（空のデータポイントが返る）                              |
| HB-07 | `skill:analytics:export` | period が空オブジェクト `{}`            | `{ success: false, error: "start must be a valid ISO 8601 date string" }` |
| HB-08 | `skill:analytics:export` | format が空文字列                       | `{ success: false, error: "format must be one of: json, csv" }`           |

### Task 4: セキュリティテスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`（既存ファイルに追加）

#### 4.1 テストケース一覧

| No    | テスト項目                                           | 期待結果                                                         |
| ----- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| HS-01 | 全5ハンドラーで mainWindow が destroyed 後に呼び出し | validateIpcSender が `{ valid: false }` を返し、例外が送出される |
| HS-02 | 予期しない Error のスタックトレースが漏洩しない      | レスポンスの `error` にスタックトレースが含まれない              |
| HS-03 | 予期しない Error のファイルパス情報が漏洩しない      | レスポンスの `error` に絶対パスが含まれない                      |

### Task 5: パフォーマンステスト追加

**対象ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts`（既存ファイルに追加）

#### 5.1 テストケース一覧

| No    | テスト項目                                                    | 期待結果             |
| ----- | ------------------------------------------------------------- | -------------------- |
| SP-01 | 10,000件のイベントから getStatistics が1秒以内に完了する      | 処理時間が1000ms未満 |
| SP-02 | 10,000件のイベントから getSummary が1秒以内に完了する         | 処理時間が1000ms未満 |
| SP-03 | 10,000件のイベントから exportData("json") が2秒以内に完了する | 処理時間が2000ms未満 |
| SP-04 | 10,000件のイベントから exportData("csv") が2秒以内に完了する  | 処理時間が2000ms未満 |

---

## 実行手順

### Step 1: 現在のカバレッジ計測

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics src/main/services/skill/__tests__/AnalyticsStore src/main/ipc/__tests__/skillAnalyticsHandlers --coverage
```

カバレッジレポートを確認し、不足箇所を特定する。

### Step 2: テスト追加

Task 1-5 のテストケースのうち、カバレッジ向上に寄与するものから優先的に追加する。

### Step 3: カバレッジ再計測

テスト追加後に再度カバレッジを計測し、基準を満たしているか確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics src/main/services/skill/__tests__/AnalyticsStore src/main/ipc/__tests__/skillAnalyticsHandlers --coverage
```

計測結果サマリー（Line/Branch/Function と不足箇所）を `outputs/phase-6/coverage-report.md` に記録する。

### Step 4: 基準未達の場合

カバレッジ基準を満たさない場合は、レポートの未カバー行・分岐を確認し、追加テストを作成する。

---

## 参照資料

| 資料                                                                        | 用途                         |
| --------------------------------------------------------------------------- | ---------------------------- |
| Phase 4 成果物（phase-4-test-creation.md）                                  | 既存テスト仕様               |
| Phase 5 成果物（phase-5-implementation.md）                                 | 実装コード                   |
| `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`         | エッジケーステストパターン   |
| `.claude/rules/02-code-quality.md`                                          | カバレッジ基準定義           |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質要件の正本               |
| `.claude/rules/06-known-pitfalls.md#P41`                                    | v8カバレッジのインライン関数 |
| `.claude/rules/06-known-pitfalls.md#P42`                                    | .trim() 3段バリデーション    |

## 統合テスト連携

| 連携先                    | 内容                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| Phase 5（実装）           | 実装済みサービスに対する境界値・エッジケース・パフォーマンステストを追加する |
| Phase 7（カバレッジ確認） | 拡充後テストを用いて coverage gate 判定を実施する                            |

## 成果物

| 成果物                                                                  | 説明                                         |
| ----------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore.test.ts` | 境界値テスト追加（6テスト）                  |
| `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts` | 境界値・パフォーマンステスト追加（17テスト） |
| `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.test.ts`    | 境界値・セキュリティテスト追加（11テスト）   |
| `outputs/phase-6/coverage-report.md`                                    | カバレッジ再計測結果サマリー                 |

## 完了条件

- [ ] Task 1-5 の全テストケース（34テスト）が追加されている
- [ ] 追加した全テストが Green 状態（成功）である
- [ ] カバレッジ計測コマンドが実行可能である
- [ ] 既存テスト（Phase 4 の79テスト）が引き続き全てPASSしている
- [ ] パフォーマンステストの時間制約が満たされている

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容                  |
| ------------------ | ----------------------------------------------------------------------------- | --------------------- |
| テスト方針         | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | TDD・テスト設計ガイド |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPCチャンネル仕様     |
| セキュリティIPC    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | sender検証仕様        |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ        |

## 多角的チェック観点

| 観点                 | チェック内容                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------- |
| カバレッジ不足       | Phase 5 時点でカバーされていない分岐（if/else, switch case, 早期return）を特定し追加する |
| 境界値テスト         | 0件, 1件, 大量件数（10,000+）、空配列、空文字列、undefined/null のエッジケースを網羅する |
| 組合せテスト         | 複数のオプショナル引数の組合せ（全undefined, 一部指定, 全指定）を検証する                |
| エラーパスカバレッジ | try/catch の catch ブロック、バリデーションエラーの全パスをテストで通過する              |
| CSVエスケープ        | RFC 4180 準拠のエスケープ処理（カンマ, ダブルクォート, 改行）を検証する                  |
| P41対策              | v8カバレッジのインライン関数カウントを考慮し、コールバック関数の実行を明示的に検証する   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（テスト3ファイル拡充 + カバレッジレポート）が全て生成されていることを確認
- [ ] テストが継続して Green 状態であることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること（全79テストがGreen状態）
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-7-coverage-check.md`
