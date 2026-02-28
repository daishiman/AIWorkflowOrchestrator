# Phase 1: 要件定義 — TASK-9J スキル使用統計・分析機能

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 1                           |
| Phase名    | 要件定義                    |
| 前提Phase  | なし                        |
| 後続Phase  | Phase 2（設計）             |
| ステータス | 未実施                      |
| 作成日     | 2026-02-28                  |
| 機能名     | TASK-9J-skill-analytics     |
| 依存タスク | TASK-9B（skill-creator）    |
| 並列タスク | TASK-9D, 9E, 9F, 9G, 9H, 9I |

## 目的

スキル使用統計・分析機能（TASK-9J）の要件を定義する。本機能は、Electronデスクトップアプリ内でスキル実行時の使用イベントを記録・集計し、スキル別統計情報・使用トレンド・サマリーを提供する。UIはスコープ外（task-031bに移管済み）であり、本タスクはバックエンドサービス + IPC契約 + 共有型定義に限定する。

## 背景

現在、スキルの使用状況を定量的に把握する手段がない。どのスキルがどの頻度で使用され、成功率がどの程度か、平均所要時間やトークン消費量がどう推移しているかを可視化することで、スキルの品質改善・最適化の判断材料を提供する。

## 実行タスク

### タスク1: 既存パターンの分析

**目的**: TASK-9F（skill-share）・TASK-9G（skill-schedule）の実装パターンを調査し、TASK-9Jで踏襲すべきパターンを特定する。

**実行手順**:

1. `apps/desktop/src/main/services/skill/` 配下の既存サービスクラス（SkillShareService, SkillScheduleService）の構造を確認する
2. `apps/desktop/src/main/ipc/skillHandlers.ts` の既存IPCハンドラ登録パターンを確認する
3. `apps/desktop/src/preload/channels.ts` の既存チャネル定義パターン（階層的命名 `skill:schedule:*`）を確認する
4. `apps/desktop/src/preload/skill-api.ts` の既存Preload API公開パターンを確認する
5. 以下のパターンをリストアップする:
   - `validateIpcSender()` によるSender検証パターン
   - `sanitizeErrorMessage()` によるエラーサニタイズパターン
   - `electron-store` による永続化パターン
   - P42準拠3段バリデーション（型チェック → 空文字列 → trim空文字列）パターン

**期待される成果物**:

- `outputs/phase-1/existing-pattern-analysis.md`

### タスク2: 仕様書との整合性確認

**目的**: aiworkflow-requirements仕様書の関連セクションとTASK-9Jの要件が整合しているか確認する。

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/` 配下の以下の仕様書を確認する:
   - `architecture-overview.md` — レイヤー依存方向の遵守
   - `arch-electron-services.md` — Main Process サービス層の責務境界
   - `api-ipc-agent.md` — IPCチャネル命名・契約の整合
   - `security-electron-ipc.md` — IPCセキュリティ原則
   - `security-skill-ipc.md` — skill系IPCの入力検証・safeInvoke運用
   - `interfaces-agent-sdk-skill.md` — skill関連インターフェースと契約
   - `ipc-contract-checklist.md` — IPC契約検証手順
   - `error-handling.md` — エラーカテゴリとコード範囲
   - `quality-requirements.md` — テストカバレッジ・品質ゲート
   - `development-guidelines.md` — テスト実装・運用ルール
2. 仕様書ごとにSubAgentを分離し、関心ごと単位で並列レビューする:

| SubAgent | 担当仕様書                                                                      | 関心ごと（責務）                        |
| -------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| A        | `api-ipc-agent.md`, `ipc-contract-checklist.md`                                 | IPCチャネル契約・命名・引数整合         |
| B        | `security-electron-ipc.md`, `security-skill-ipc.md`                             | sender検証・P42入力検証・エラー露出防止 |
| C        | `architecture-overview.md`, `arch-electron-services.md`                         | 層分離・依存方向・サービス責務          |
| D        | `interfaces-agent-sdk-skill.md`, `error-handling.md`, `quality-requirements.md` | 型契約・エラー分類・品質基準            |
| E        | `development-guidelines.md`                                                     | テスト方針・実装運用ルール              |

3. TASK-9Jの各機能要件が上記仕様書に抵触しないことを確認する
4. 確認結果をテーブル形式で記録する

**期待される成果物**:

- `outputs/phase-1/specification-alignment.md`

### タスク3: 共通型定義との整合性確認

**目的**: `packages/shared/src/types/` の既存型定義との整合性を確認し、新規型定義の設計方針を決定する。

**実行手順**:

1. `packages/shared/src/types/skill.ts` の既存型（SkillId, SkillName, Skill）を確認する
2. `packages/shared/src/types/index.ts` の既存エクスポート構成を確認する
3. 新規追加する `skill-analytics.ts` に定義すべき型のリストを作成する:
   - `SkillUsageEvent`: 使用イベント記録
   - `SkillStatistics`: スキル別統計情報
   - `ToolUsageStat`: ツール別使用統計
   - `AnalyticsPeriod`: 集計期間（`"hour"` | `"day"` | `"week"` | `"month"`）
   - `UsageTrend`: 使用トレンドデータ
   - `TrendDataPoint`: トレンドデータポイント
   - `AnalyticsSummary`: 全体サマリー
   - `SkillUsageSummary`: スキル別サマリー
4. 既存の `SkillId` / `SkillName` Branded Type との連携方針を記録する

**期待される成果物**:

- `outputs/phase-1/type-alignment.md`

### タスク4: IPC連携要件の定義

**目的**: 5つのIPCチャネルの要件を定義し、既存チャネルとの命名規則整合性を確認する。

**実行手順**:

1. 既存の `skill:schedule:*` チャネル命名パターンを確認する
2. 以下の5チャネルの要件を定義する:

| チャネル名                   | 方向            | 用途               |
| ---------------------------- | --------------- | ------------------ |
| `skill:analytics:record`     | Renderer → Main | イベント記録       |
| `skill:analytics:statistics` | Renderer → Main | スキル別統計取得   |
| `skill:analytics:summary`    | Renderer → Main | 全体サマリー取得   |
| `skill:analytics:trend`      | Renderer → Main | トレンドデータ取得 |
| `skill:analytics:export`     | Renderer → Main | データエクスポート |

3. 各チャネルについて以下を定義する:
   - 引数の型と必須/任意の区分
   - 戻り値の型
   - Date型のシリアライズ方針（ISO 8601文字列）
   - バリデーション要件（P42準拠3段バリデーション）
   - セキュリティ要件（Sender検証）

**期待される成果物**:

- `outputs/phase-1/ipc-integration-requirements.md`

### タスク5: 要件仕様書の作成

**目的**: タスク1-4の結果を統合し、TASK-9Jの要件仕様書を作成する。

**実行手順**:

1. 機能要件（FR）を以下の粒度で記述する:

#### FR-1: スキル実行時の使用イベント自動記録

- スキル実行開始時に `SkillUsageEvent` を生成し、`AnalyticsStore` に記録する
- 記録するイベント種別: `"execution"` | `"error"` | `"cancellation"`
- 記録するフィールド: スキル名、イベント種別、タイムスタンプ、所要時間（ミリ秒）、トークン消費量（入力/出力）、エラーメッセージ（エラー時のみ）、使用ツール名リスト
- IPC経由で Renderer から記録を要求可能（`skill:analytics:record`）
- Main Processからも直接記録可能（SkillAnalytics.recordEvent()）

#### FR-2: スキル別統計情報の取得

- 指定されたスキル名の `SkillStatistics` を返す
- 統計フィールド: 総実行回数、成功率、平均所要時間、エラー率、総トークン消費量、最終実行日時、使用ツール別統計

#### FR-3: 全スキル横断サマリーの取得

- `AnalyticsSummary` を返す
- サマリーフィールド: 総スキル数、総実行回数、全体成功率、スキル別使用頻度、直近アクティビティ

#### FR-4: 使用トレンド分析

- 指定された期間オブジェクト（`start`, `end`, `granularity`）で `UsageTrend` を返す
- トレンドデータポイント: 期間ラベル、実行回数、成功回数、エラー回数、平均所要時間、トークン消費量
- スキル名を指定して対象スキルの時系列トレンドを取得する

#### FR-5: CSV/JSONフォーマットでのデータエクスポート

- 指定フォーマット（`"csv"` | `"json"`）でイベントデータを文字列として返す
- 期間フィルタ可能: `AnalyticsPeriod`（start/end/granularity）を指定（任意。省略時は全期間）
- CSV出力はヘッダ行を含む
- JSON出力はインデント2スペースの整形済み文字列

#### FR-6: 指定日時以前のデータクリア

- 指定されたISO 8601タイムスタンプ以前の全イベントデータを削除する
- 日時指定がない場合は全イベントを削除する
- クリア処理は Main Process 内部API（`SkillAnalytics.clearData(before?: Date)`）として提供し、TASK-9J の IPC スコープ（5チャネル）には含めない

2. 非機能要件（NFR）を記述する:

#### NFR-1: electron-storeによるローカル永続化

- `electron-store` を使用し、アプリローカルにイベントデータを永続化する
- 外部データベース（SQLite, PostgreSQL）は使用しない
- ストアキーは `skill-analytics-events` とする

#### NFR-2: IPC境界でのISO 8601文字列シリアライズ

- Renderer ↔ Main 間のIPC通信では、全ての `Date` 型フィールドをISO 8601文字列（`string`）として送受信する
- `AnalyticsPeriod.start` / `AnalyticsPeriod.end` およびイベント `timestamp` は ISO 8601 文字列で統一する
- 変換方向: Renderer→Main は `new Date(isoString)` でパース、Main→Renderer は `.toISOString()` でシリアライズ

#### NFR-3: P42準拠3段バリデーション

- 全IPCハンドラの文字列引数に対して以下の3段バリデーションを実施する:
  1. `typeof arg !== "string"` → 型チェック
  2. `arg === ""` → 空文字列チェック
  3. `arg.trim() === ""` → トリム後空文字列チェック
- バリデーション失敗時は `{ code: "VALIDATION_ERROR", message: "(具体的なメッセージ)" }` をthrowする

#### NFR-4: 大量データでの集計パフォーマンス

- 10,000件以上のイベントデータが蓄積された状態で、統計・サマリー・トレンドの各集計処理が1秒以内（1000ms以内）に完了する
- パフォーマンス劣化が想定される場合は、インメモリキャッシュまたは事前集計を検討する

3. 受け入れ基準をチェックリスト形式で記述する
4. スコープ定義（スコープ内/スコープ外）を明記する

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

## 参照資料

| 資料名                     | パス                                                                              | 用途                   |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | レイヤー依存方向の確認 |
| Electronサービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`     | サービス責務の確認     |
| IPC Agent仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC契約・命名の確認    |
| IPC セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | セキュリティ要件の確認 |
| Skill IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill系IPC境界の確認   |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型契約の確認           |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC契約検証手順の参照  |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | エラーカテゴリの参照   |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準の確認   |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | テスト運用基準の確認   |
| 既存チャネル定義           | `apps/desktop/src/preload/channels.ts`                                            | チャネル命名パターン   |
| 既存スキルサービス         | `apps/desktop/src/main/services/skill/`                                           | サービス実装パターン   |
| TASK-9F ワークフロー       | `docs/30-workflows/completed-tasks/skill-share/`                                  | 既存パターン参照       |
| TASK-9G ワークフロー       | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/`                       | 既存パターン参照       |
| 共有型定義                 | `packages/shared/src/types/skill.ts`                                              | 既存型との整合性確認   |

## 成果物

| 成果物           | パス                                              | 形式     |
| ---------------- | ------------------------------------------------- | -------- |
| 既存パターン分析 | `outputs/phase-1/existing-pattern-analysis.md`    | Markdown |
| 仕様書整合性確認 | `outputs/phase-1/specification-alignment.md`      | Markdown |
| 型定義整合性確認 | `outputs/phase-1/type-alignment.md`               | Markdown |
| IPC連携要件定義  | `outputs/phase-1/ipc-integration-requirements.md` | Markdown |
| 要件仕様書       | `outputs/phase-1/requirements-definition.md`      | Markdown |

## 統合テスト連携

### テスト観点（Phase 4 以降で実装）

| 観点                       | 対応する機能要件 | テスト種別     |
| -------------------------- | ---------------- | -------------- |
| イベント記録の正常系       | FR-1             | 単体テスト     |
| イベント記録の異常系       | FR-1, NFR-3      | 単体テスト     |
| 統計計算の正確性           | FR-2             | 単体テスト     |
| サマリー集計の正確性       | FR-3             | 単体テスト     |
| トレンド集計の粒度別正確性 | FR-4             | 単体テスト     |
| CSV/JSONエクスポートの形式 | FR-5             | 単体テスト     |
| データクリアの正常系       | FR-6             | 単体テスト     |
| IPC Sender検証             | NFR-3            | 単体テスト     |
| P42バリデーション          | NFR-3            | 単体テスト     |
| 大量データパフォーマンス   | NFR-4            | パフォーマンス |
| ISO 8601シリアライズ往復   | NFR-2            | 統合テスト     |

## 多角的チェック観点

| 観点           | チェック内容                                                |
| -------------- | ----------------------------------------------------------- |
| セキュリティ   | Sender検証、エラーサニタイズ、PII非含有                     |
| パフォーマンス | 10,000件以上での1秒以内集計                                 |
| 整合性         | 既存IPCチャネル命名パターン（`skill:schedule:*`）との一貫性 |
| 型安全         | Branded Type（SkillName）との連携、any型不使用              |
| 拡張性         | 将来のイベント種別追加・集計指標追加への対応容易性          |
| 境界値         | 0件データでの統計（成功率0%、平均0ms）、1件データ、日付境界 |

## 完了条件

- [ ] タスク1: 既存パターン分析が完了し、踏襲パターンが特定されている
- [ ] タスク2: 仕様書との整合性が確認され、抵触箇所がない
- [ ] タスク3: 共通型定義との整合性が確認され、新規型のリストが確定している
- [ ] タスク4: 5つのIPCチャネルの要件が定義され、命名規則が既存パターンと一貫している
- [ ] タスク5: 要件仕様書が作成され、FR-1〜FR-6、NFR-1〜NFR-4が記述されている
- [ ] 全成果物が `outputs/phase-1/` に配置されている
- [ ] 曖昧な抽象語を使わず、判定条件が具体的に記述されている

## Phase末端アクション【必須】

1. 全成果物の存在を確認する
2. 完了条件チェックリストを全項目チェックする
3. Phase 2 に進む

## 依存関係

- **前提**: TASK-9B（skill-creator）が完了していること
- **並列実行可能**: TASK-9D, 9E, 9F, 9G, 9H, 9I

## 次のPhase

→ `phase-2-design.md`
