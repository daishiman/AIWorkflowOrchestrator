# Phase 1 成果物: スコープ定義

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| タスク ID  | TASK-UI-05B-SKILL-ADVANCED-VIEWS |
| Phase      | 1（要件定義）                    |
| 作成日     | 2026-03-02                       |
| ステータス | 完了                             |

## 1. スコープ内

本タスクで実装する範囲を以下に定義する。

### 1.1 対象ビュー（4ビュー）

| ビュー ID | ビュー名           | コンポーネント数 | 機能要件数 |
| --------- | ------------------ | ---------------- | ---------- |
| 3A        | SkillChainBuilder  | 8                | 12         |
| 3B        | ScheduleManager    | 8                | 11         |
| 3C        | DebugPanel         | 10               | 12         |
| 3D        | AnalyticsDashboard | 7                | 10         |
| 合計      | -                  | 33               | 45         |

### 1.2 実装対象コンポーネント

#### 3A: SkillChainBuilder コンポーネント（8件）

| コンポーネント名  | Atomic Design 層 | 責務                         |
| ----------------- | ---------------- | ---------------------------- |
| SkillChainBuilder | organisms        | メインレイアウト             |
| ChainCardGrid     | molecules        | チェーン一覧カード           |
| ChainEditor       | organisms        | パイプラインエディター       |
| StepCard          | molecules        | ステップカード               |
| StepConnector     | atoms            | ステップ間矢印               |
| StepEditor        | molecules        | ステップ詳細設定パネル       |
| CreateChainDialog | organisms        | 新規チェーン作成ダイアログ   |
| hooks（2件）      | -                | useChainList, useChainEditor |

#### 3B: ScheduleManager コンポーネント（8件）

| コンポーネント名    | Atomic Design 層 | 責務                               |
| ------------------- | ---------------- | ---------------------------------- |
| ScheduleManager     | organisms        | メインレイアウト                   |
| ScheduleTable       | molecules        | スケジュール一覧テーブル           |
| ScheduleRow         | molecules        | テーブル行                         |
| ScheduleDetailPanel | molecules        | 詳細展開パネル                     |
| ScheduleDialog      | organisms        | 新規/編集ダイアログ                |
| CronEditor          | molecules        | Cron 式エディター                  |
| CronPresetList      | atoms            | プリセット一覧                     |
| RunHistoryList      | molecules        | 実行履歴リスト                     |
| hooks（2件）        | -                | useScheduleList, useScheduleEditor |

#### 3C: DebugPanel コンポーネント（10件）

| コンポーネント名 | Atomic Design 層 | 責務                            |
| ---------------- | ---------------- | ------------------------------- |
| DebugPanel       | organisms        | メインレイアウト                |
| DebugControls    | molecules        | 実行コントロールバー            |
| CallStackView    | molecules        | コールスタックツリー            |
| StepHistoryList  | molecules        | ステップ履歴リスト              |
| OutputConsole    | molecules        | 出力コンソール                  |
| VariableWatch    | molecules        | 変数ウォッチパネル              |
| VariableNode     | atoms            | 変数ツリーノード                |
| BreakpointEditor | molecules        | ブレークポイント管理            |
| BreakpointRow    | atoms            | ブレークポイント行              |
| StartDebugDialog | organisms        | デバッグ開始ダイアログ          |
| hooks（2件）     | -                | useDebugSession, useBreakpoints |

#### 3D: AnalyticsDashboard コンポーネント（7件）

| コンポーネント名   | Atomic Design 層 | 責務                               |
| ------------------ | ---------------- | ---------------------------------- |
| AnalyticsDashboard | organisms        | メインレイアウト                   |
| SummaryCards       | molecules        | サマリーカード群                   |
| SummaryCard        | atoms            | 個別サマリーカード                 |
| UsageChart         | molecules        | トレンドチャート                   |
| ChartTooltip       | atoms            | ツールチップ                       |
| SkillRanking       | molecules        | ツール使用ランキング               |
| PeriodSelector     | atoms            | 期間セレクター                     |
| ExportButton       | atoms            | エクスポートボタン                 |
| hooks（2件）       | -                | useAnalyticsSummary, useUsageTrend |

### 1.3 実装対象テストファイル

| テストファイル              | 対象コンポーネント       |
| --------------------------- | ------------------------ |
| SkillChainBuilder.test.tsx  | SkillChainBuilder        |
| StepCard.test.tsx           | StepCard                 |
| StepEditor.test.tsx         | StepEditor               |
| useChainEditor.test.ts      | useChainEditor hook      |
| ScheduleManager.test.tsx    | ScheduleManager          |
| CronEditor.test.tsx         | CronEditor               |
| useScheduleList.test.ts     | useScheduleList hook     |
| DebugPanel.test.tsx         | DebugPanel               |
| DebugControls.test.tsx      | DebugControls            |
| BreakpointEditor.test.tsx   | BreakpointEditor         |
| useDebugSession.test.ts     | useDebugSession hook     |
| AnalyticsDashboard.test.tsx | AnalyticsDashboard       |
| SummaryCard.test.tsx        | SummaryCard              |
| UsageChart.test.tsx         | UsageChart               |
| useAnalyticsSummary.test.ts | useAnalyticsSummary hook |

---

## 2. スコープ外

本タスクでは以下を実装対象外とする。

| 項目                                   | 理由                                                           | 関連タスク       |
| -------------------------------------- | -------------------------------------------------------------- | ---------------- |
| バックエンド IPC ハンドラの実装        | TASK-9D/9G/9H/9J で実装済みまたは実装予定                      | TASK-9D/9G/9H/9J |
| Main Process サービス層の変更          | 既存バックエンドサービスをそのまま利用                         | -                |
| Preload 層の新規チャネル定義           | 別途対応（channels.ts への追加はインフラタスクとして分離可能） | 後続タスク候補   |
| 認証・認可ロジック                     | 既存の認証基盤を利用                                           | -                |
| データベーススキーマの変更             | バックエンド側で対応済みまたは対応予定                         | TASK-9D/9G/9H/9J |
| E2E テスト（Playwright）               | Phase 11 手動テストで代替                                      | -                |
| 他ビュー（SkillCenterView 本体）の改修 | TASK-UI-05 で実装済み                                          | TASK-UI-05       |
| recharts ライブラリのカスタムビルド    | 標準の recharts パッケージを使用                               | -                |
| ダークモード固有のカスタムスタイル     | Apple HIG システムカラー（CSS変数）で自動対応                  | -                |

---

## 3. バックエンド依存関係

### 3.1 依存バックエンドタスク

| タスク ID | タスク名       | IPC チャネル数 | 型定義数 | ステータス                   |
| --------- | -------------- | -------------- | -------- | ---------------------------- |
| TASK-9D   | SkillChain     | 5              | 6        | 参照（未実装の場合はモック） |
| TASK-9G   | SkillSchedule  | 5              | 4        | 参照（未実装の場合はモック） |
| TASK-9H   | SkillDebug     | 7              | 6        | 参照（未実装の場合はモック） |
| TASK-9J   | SkillAnalytics | 5              | 6        | 参照（未実装の場合はモック） |
| 合計      | -              | 22             | 22       | -                            |

### 3.2 IPC チャネル分類

| 分類               | チャネル数 | パターン   | 詳細                                                        |
| ------------------ | ---------- | ---------- | ----------------------------------------------------------- |
| Request-Response   | 21         | safeInvoke | Renderer → Main のリクエスト/レスポンス型通信               |
| Event Subscription | 1          | safeOn     | Main → Renderer のプッシュ通知型通信（`skill:debug:event`） |

### 3.3 バックエンド未実装時の対応方針

バックエンドタスク（TASK-9D/9G/9H/9J）が未完了の場合、以下の方針で開発を進める:

1. **型定義の先行確定**: `packages/shared/src/types/` に型定義ファイルを作成し、バックエンドと共有
2. **IPC モック**: テスト用に各 IPC チャネルのモック関数を `__mocks__/` に作成
3. **Preload スタブ**: `window.electronAPI.skill.*` のスタブ実装で UI 開発を並行
4. **結合テスト延期**: バックエンド完了後に Phase 11（手動テスト）で結合検証

---

## 4. 統合ポイント（7項目）

### 4.1 状態管理: agentSlice.ts（Zustand Store）

| 項目           | 詳細                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| 統合対象       | `apps/desktop/src/renderer/stores/slices/agentSlice.ts`                     |
| 統合方法       | 個別セレクタで必要フィールドのみ取得（P31 対策）                            |
| 注意事項       | 合成 Store Hook（useXxxStore()）の戻り値関数を useEffect 依存配列に含めない |
| 追加予定の状態 | 各ビューのローディング状態・エラー状態はコンポーネント固有 useState で管理  |
| 既存利用       | スキル一覧（availableSkills）を ChainBuilder の StepEditor で参照           |

### 4.2 IPC チャネル定義: preload/channels.ts

| 項目             | 詳細                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| 統合対象         | `apps/desktop/src/preload/channels.ts`                                           |
| 統合方法         | IPC_CHANNELS 定数オブジェクトに22チャネルの新規定数を追加                        |
| 命名規則         | `SKILL_CHAIN_LIST`, `SKILL_CHAIN_GET`, `SKILL_DEBUG_START` 形式                  |
| 注意事項         | ハードコード文字列禁止（P27 対策）、全チャネルを定数で参照                       |
| 新規定数（抜粋） | `SKILL_CHAIN_LIST: "skill:chain:list"`, `SKILL_DEBUG_EVENT: "skill:debug:event"` |

### 4.3 Preload API: preload/skill-api.ts

| 項目         | 詳細                                                              |
| ------------ | ----------------------------------------------------------------- |
| 統合対象     | `apps/desktop/src/preload/skill-api.ts`                           |
| 統合方法     | 各ビュー用の safeInvoke/safeOn メソッドを追加                     |
| safeInvoke   | 21チャネル分の invoke ラッパーメソッド                            |
| safeOn       | `skill:debug:event` 用のイベント購読メソッド（戻り値: 解除関数）  |
| P42 対策     | 引数の3段バリデーション（型チェック → 空文字列 → トリム空文字列） |
| P44/P45 対策 | 引数名とセマンティクスの一致を検証                                |

### 4.4 共有型定義: packages/shared/src/types/skill-\*.ts

| 項目         | 詳細                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| 統合対象     | `packages/shared/src/types/`                                                  |
| 統合方法     | 新規型定義ファイルを追加                                                      |
| 新規ファイル | `skill-chain.ts`, `skill-schedule.ts`, `skill-debug.ts`, `skill-analytics.ts` |
| 型定義数     | 22型（TASK-9D: 6型, TASK-9G: 4型, TASK-9H: 6型, TASK-9J: 6型）                |
| P32 対策     | `packages/shared/` と `apps/desktop/src/preload/types.ts` の同時更新          |

### 4.5 ナビゲーション: SkillCenterView 連携

| 項目         | 詳細                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| 統合対象     | SkillCenterView（TASK-UI-05 で実装済み）                                           |
| 統合方法     | SkillCenterView から各高度ビューへの遷移リンクまたはタブ                           |
| 遷移先       | 3A: SkillChainBuilder, 3B: ScheduleManager, 3C: DebugPanel, 3D: AnalyticsDashboard |
| ルーティング | タブ切替またはルーティング（設計フェーズで確定）                                   |
| 注意事項     | SkillCenterView 本体の改修は最小限にとどめる                                       |

### 4.6 EmptyState: 既存 EmptyState コンポーネント

| 項目         | 詳細                                                              |
| ------------ | ----------------------------------------------------------------- |
| 統合対象     | 既存の EmptyState コンポーネント                                  |
| 統合方法     | mood / メッセージ / アクションボタンのカスタマイズ                |
| カスタマイズ | 4ビューそれぞれに固有の mood, メッセージ, アクションを設定        |
| 注意事項     | EmptyState コンポーネント自体の改修は不要（Props でカスタマイズ） |

### 4.7 アイコン: lucide-react

| 項目           | 詳細                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| 統合対象       | lucide-react パッケージ                                                                      |
| 統合方法       | 全ビューで lucide-react アイコンのみ使用                                                     |
| 使用アイコン例 | Play, SkipForward, ArrowDownToLine, ArrowUpFromLine, Pause, Square, TrendingUp, TrendingDown |
| 注意事項       | 絵文字は使用禁止。ステータス表示では色だけでなくアイコンを併用（NFR-A07）                    |

---

## 5. 既存コンポーネント影響分析

| 既存ファイル                  | 変更種別 | 変更内容                                          |
| ----------------------------- | -------- | ------------------------------------------------- |
| `preload/channels.ts`         | 追加     | 22チャネルの IPC_CHANNELS 定数追加                |
| `preload/skill-api.ts`        | 追加     | 22メソッド（safeInvoke x 21 + safeOn x 1）追加    |
| `preload/types.ts`            | 追加     | 新規型のインポートと Preload API 型定義追加       |
| `packages/shared/src/types/`  | 新規     | 4ファイル（skill-chain/schedule/debug/analytics） |
| `stores/slices/agentSlice.ts` | 参照のみ | 変更なし（個別セレクタで参照）                    |
| SkillCenterView               | 軽微追加 | 高度ビューへの遷移リンク追加                      |

---

## 6. 外部ライブラリ依存

| ライブラリ   | バージョン | 用途                 | 対象ビュー         |
| ------------ | ---------- | -------------------- | ------------------ |
| recharts     | 最新安定版 | トレンドチャート描画 | AnalyticsDashboard |
| lucide-react | 既存       | アイコン表示         | 全ビュー           |

---

## 7. リスク・制約

### 7.1 バックエンド依存リスク

| リスク                                   | 影響度 | 緩和策                                            |
| ---------------------------------------- | ------ | ------------------------------------------------- |
| TASK-9D/9G/9H/9J が未完了                | 高     | IPC モック + Preload スタブで並行開発可能         |
| IPC 契約がバックエンド実装時に変更される | 中     | Phase 10 で IPC 契約を再突合                      |
| Date フィールドの ISO 8601 文字列変換    | 低     | Gap 1 方針に従い、Renderer 側で Date.parse() 変換 |

### 7.2 技術的制約

| 制約                                  | 対応方針                                  |
| ------------------------------------- | ----------------------------------------- |
| happy-dom 環境での userEvent 非互換   | fireEvent のみ使用（P39 対策）            |
| React StrictMode でのリスナー二重登録 | useEffect クリーンアップで解除（P5 対策） |
| Zustand 合成 Hook の無限ループ        | 個別セレクタ使用（P31 対策）              |
| テスト実行ディレクトリ依存            | cd apps/desktop から実行（P40 対策）      |
| タイマーテストの無限ループ            | advanceTimersByTime 使用（P13 対策）      |

### 7.3 スケジュール制約

| 制約                                     | 対応方針                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| 4ビューの並列実装可能性                  | 各ビューは独立しており、並列実装可能                 |
| TASK-UI-05（スキルセンター）完了後が理想 | ナビゲーション統合のみ依存、ビュー本体は独立実装可能 |
| TASK-UI-05A（エディター）との並列性      | 完全に独立して並列実装可能                           |
