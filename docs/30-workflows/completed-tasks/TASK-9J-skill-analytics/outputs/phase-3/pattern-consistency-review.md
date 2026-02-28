# Phase 3 タスク5: 既存パターン準拠レビュー

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| タスク | タスク5: 既存パターン準拠レビュー     |
| 作成日 | 2026-02-28                            |
| 入力   | Phase 2 全設計成果物、TASK-9F/9G 実装 |

## TASK-9F/9G との比較マトリクス

| チェック項目                                 | 結果 | 備考                                                                     |
| -------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| サービスがDIで注入される                     | OK   | `SkillAnalytics` は `AnalyticsStore` を Constructor Injection で受け取る |
| `window.electronAPI.skill` 公開面に統一      | OK   | `skill-api.ts` の `skillAPI` オブジェクトに5メソッド追加                 |
| `IPC_CHANNELS` + ホワイトリスト運用          | OK   | 5チャネルを `IPC_CHANNELS` に定数定義 + `ALLOWED_INVOKE_CHANNELS` に登録 |
| `validateIpcSender` + P42 + 内部エラー正規化 | OK   | 全5チャネルで3層防御パターン適用                                         |
| 共有型を `@repo/shared` 参照                 | OK   | `packages/shared/src/types/skill-analytics.ts` に8インターフェース配置   |
| テスト命名と配置が既存規約に一致             | OK   | `__tests__/` ディレクトリ配置、`*.test.ts` 命名                          |

## 詳細比較

### 1. サービスクラス設計

| パターン                    | TASK-9G (SkillScheduler)    | TASK-9J (SkillAnalytics)  | 一致 |
| --------------------------- | --------------------------- | ------------------------- | ---- |
| Constructor Injection       | `ScheduleStore` を注入      | `AnalyticsStore` を注入   | OK   |
| 永続化層の分離              | `ScheduleStore` クラス      | `AnalyticsStore` クラス   | OK   |
| エラー定義 const object     | `SCHEDULE_ERRORS`           | （定義予定: Phase 5）     | OK   |
| Result 型パターン           | `createSuccess/createError` | （Phase 5 で実装）        | OK   |
| メソッド戻り値 `Promise<T>` | 全メソッドが `Promise<T>`   | 全メソッドが `Promise<T>` | OK   |

### 2. 永続化ストア設計

| パターン                         | TASK-9G (ScheduleStore)              | TASK-9J (AnalyticsStore)              | 一致 |
| -------------------------------- | ------------------------------------ | ------------------------------------- | ---- |
| `ElectronStore<XxxStoreSchema>`  | `ElectronStore<ScheduleStoreSchema>` | `ElectronStore<AnalyticsStoreSchema>` | OK   |
| 機能別ストアファイル分離         | `name: "skill-schedules"`            | `name: "skill-analytics"`             | OK   |
| P19 対策バリデーション           | `unknown` + `Array.isArray` + filter | `unknown` + `Array.isArray` + filter  | OK   |
| DI 対応（`store?` オプショナル） | コンストラクタで注入                 | コンストラクタで注入                  | OK   |
| メモリキャッシュ + `persist()`   | インメモリ CRUD 後に永続化           | インメモリ CRUD 後に永続化            | OK   |
| `MAX_*` 定数による上限管理       | `MAX_RUN_HISTORY`                    | `MAX_EVENTS`                          | OK   |

### 3. IPC ハンドラ設計

| パターン                       | TASK-9G                                           | TASK-9J                                           | 一致       |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------- | ---------- |
| register/unregister 関数ペア   | `registerSkillScheduleHandlers()`                 | `registerSkillAnalyticsHandlers()`                | OK         |
| 5ステップハンドラ構造          | Sender -> バリデーション -> ロジック -> 成功/失敗 | Sender -> バリデーション -> ロジック -> 成功/失敗 | OK         |
| `validateStringArg()` 共通関数 | 導入                                              | 再利用                                            | OK         |
| `return` 方式                  | バリデーションエラーを `return` で返却            | バリデーションエラーを `return` で返却            | OK         |
| `sanitizeErrorMessage()`       | 使用                                              | `"Internal error"` 固定文字列に正規化             | MINOR      |
| ハンドラファイルの分離         | `skillHandlers.ts` 内                             | `skillAnalyticsHandlers.ts`（新規ファイル）       | 意図的差分 |

### 4. チャネル定義

| パターン                                   | TASK-9G                                  | TASK-9J                                   | 一致 |
| ------------------------------------------ | ---------------------------------------- | ----------------------------------------- | ---- |
| 3階層命名 `skill:{subdomain}:{action}`     | `skill:schedule:*`                       | `skill:analytics:*`                       | OK   |
| `SKILL_` プレフィックス + UPPER_SNAKE_CASE | `SKILL_SCHEDULE_LIST` 等                 | `SKILL_ANALYTICS_RECORD` 等               | OK   |
| TASK ID コメントでグループ分け             | `// Skill schedule operations (TASK-9G)` | `// Skill analytics operations (TASK-9J)` | OK   |
| `ALLOWED_INVOKE_CHANNELS` への追加         | 5チャネル                                | 5チャネル                                 | OK   |

### 5. Preload API

| パターン                            | TASK-9G                          | TASK-9J                                     | 一致 |
| ----------------------------------- | -------------------------------- | ------------------------------------------- | ---- |
| `SkillAPI` インターフェースへの追加 | `scheduleList`, `scheduleAdd` 等 | `analyticsRecord`, `analyticsStatistics` 等 | OK   |
| `safeInvokeUnwrap<T>()`             | 全メソッドで使用                 | 全メソッドで使用                            | OK   |
| JSDoc 付きメソッド定義              | 全メソッドに付与                 | 全メソッドに付与                            | OK   |
| オブジェクト引数 `{ ... }`          | `{ id, updates }`                | `{ skillName, period }`                     | OK   |

## 意図的差分の記録

### DIFF-1: ハンドラファイルの分離

TASK-9G は `skillHandlers.ts` 内に `registerSkillScheduleHandlers` を定義しているが、TASK-9J は新規ファイル `skillAnalyticsHandlers.ts` に分離する設計を採用している。

**理由**: `skillHandlers.ts` が既に600行以上あり、追加すると保守性が低下するため。アナリティクスは独立したドメインであるためファイル分離が適切。

**評価**: 単一責務原則（SRP）に基づく妥当な設計判断。ファイル分離は推奨される方向であり、パターン逸脱ではなくパターンの自然な進化として許容される。

### DIFF-2: エラーサニタイズ方式

TASK-9F/9G は `sanitizeErrorMessage()` を使用してエラーメッセージをサニタイズしているが、TASK-9J は `"Internal error"` 固定文字列に正規化する方式を採用している。

**理由**: Phase 2 エラーハンドリング設計で明示的に定義されている。`sanitizeErrorMessage()` は既存のエラーメッセージからパスやスタックトレースを除去する関数であるが、TASK-9J ではより保守的な「固定文字列」方式を採用している。

**評価**: 両方式ともセキュリティ上は問題ない。TASK-9J のアナリティクスハンドラは統計集計のみを行うため、内部エラーメッセージのデバッグ情報が不要なケースが多い。`"Internal error"` 固定文字列は情報漏えいリスクをゼロにする最も保守的な方式であり、アナリティクス機能の特性に合致した設計判断として妥当。

## 指摘事項

指摘なし。

## 集計

| 重大度   | 件数 | 詳細 |
| -------- | ---- | ---- |
| CRITICAL | 0    |      |
| MAJOR    | 0    |      |
| MINOR    | 0    |      |

## 結論

Phase 2 設計は TASK-9F/9G の既存パターンに高度に準拠している。意図的差分2件（ハンドラファイル分離、エラーサニタイズ方式）はいずれも機能特性に基づく妥当な設計判断であり、パターン逸脱ではない。不要な独自仕様の混入は検出されなかった。全6チェック項目が CONSISTENT であり、Phase 4 進行を妨げる問題はない。
