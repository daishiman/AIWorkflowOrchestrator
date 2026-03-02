# Phase 1 成果物: 要件定義書

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスク ID    | TASK-UI-05B-SKILL-ADVANCED-VIEWS   |
| Phase        | 1（要件定義）                      |
| 作成日       | 2026-03-02                         |
| ステータス   | 完了                               |
| 依存タスク   | TASK-UI-00, TASK-UI-01, TASK-UI-05 |
| バックエンド | TASK-9D, TASK-9G, TASK-9H, TASK-9J |

## 1. 機能要件一覧

### 1.1 3A: SkillChainBuilder（パイプラインビルダー）機能要件（12件）

| ID       | 機能要件                                                                                           | IPC チャネル          | 優先度 |
| -------- | -------------------------------------------------------------------------------------------------- | --------------------- | ------ |
| FR-3A-01 | チェーン一覧をカード形式（ChainCardGrid）で表示する                                                | `skill:chain:list`    | 必須   |
| FR-3A-02 | 新規チェーンを作成ダイアログ（CreateChainDialog）で作成する                                        | -                     | 必須   |
| FR-3A-03 | チェーン内のステップカード（StepCard）を追加・削除・並び替えする                                   | -                     | 必須   |
| FR-3A-04 | ステップの入力マッピングを4種類（literal/variable/template/previousOutput）設定する                | -                     | 必須   |
| FR-3A-05 | ステップの条件設定を4種類（always/ifVariable/ifPreviousSuccess/expression）設定する                | -                     | 必須   |
| FR-3A-06 | ステップのタイムアウト・リトライ回数を設定する                                                     | -                     | 必須   |
| FR-3A-07 | チェーン定義を保存する                                                                             | `skill:chain:save`    | 必須   |
| FR-3A-08 | チェーン定義を読み込む                                                                             | `skill:chain:get`     | 必須   |
| FR-3A-09 | チェーンを実行する                                                                                 | `skill:chain:execute` | 必須   |
| FR-3A-10 | チェーン実行時にステップ進行状態をビジュアル表示する（ボーダーパルス、チェックマーク、エラー表示） | -                     | 必須   |
| FR-3A-11 | チェーンを削除する                                                                                 | `skill:chain:delete`  | 必須   |
| FR-3A-12 | エラーハンドリング設定（stop/skip/retry）を選択する                                                | -                     | 必須   |

#### FR-3A 詳細仕様

**FR-3A-01: チェーン一覧表示**

- ChainCardGrid コンポーネントでカード形式で一覧表示
- 各カードにはチェーン名、ステップ数、最終実行時刻、[実行]/[編集]ボタンを表示
- `skill:chain:list` IPC チャネルで一覧を取得（safeInvoke パターン）
- データ未取得時は EmptyState（mood: "creative", メッセージ: 「ツールを組み合わせてみよう」, アクション: 「チェーンを作成」）を表示

**FR-3A-02: チェーン新規作成**

- CreateChainDialog コンポーネントでチェーン名・説明を入力
- バリデーション: チェーン名は必須、空文字列・トリム空文字列を拒否

**FR-3A-03: ステップ操作**

- StepCard コンポーネントで各ステップを表示（160px x 100px）
- 追加: [+ ステップ追加] ボタンで新規ステップを末尾に追加
- 削除: ステップカードの削除ボタンで削除
- 並び替え: ドラッグ＆ドロップでステップ順序を変更
- ステップ間は SVG パス（水平矢印 + 変数名ラベル）で接続表示

**FR-3A-04: 入力マッピング設定**

- StepEditor コンポーネントで設定
- 4種類のマッピングタイプ:
  - `literal`: 固定値を直接入力
  - `variable`: 変数名を指定
  - `template`: テンプレート文字列（`${variableName}` 形式）
  - `previousOutput`: 前ステップの出力を参照

**FR-3A-05: 条件設定**

- 4種類の条件タイプ:
  - `always`: 常に実行
  - `ifVariable`: 変数の値が条件を満たす場合に実行
  - `ifPreviousSuccess`: 前ステップが成功した場合に実行
  - `expression`: カスタム式で評価

**FR-3A-06: タイムアウト・リトライ設定**

- タイムアウト: 数値入力（秒単位）
- リトライ回数: 数値入力（0以上の整数）

**FR-3A-07: チェーン保存**

- `skill:chain:save` IPC チャネルで SkillChainDefinition を送信
- 保存成功時: 成功フィードバック表示
- 保存失敗時: エラーメッセージ表示

**FR-3A-08: チェーン読み込み**

- `skill:chain:get` IPC チャネルでチェーンIDを指定して取得
- 取得した SkillChainDefinition をエディターに展開

**FR-3A-09: チェーン実行**

- `skill:chain:execute` IPC チャネルで実行
- 実行結果は SkillChainResult として受信

**FR-3A-10: 実行状態ビジュアル表示**

- 実行中ステップ: ボーダー `var(--color-accent)` + パルスアニメーション（opacity 0.5→1→0.5、1.5s 周期）
- 完了ステップ: チェックマーク + 緑ボーダー
- エラーステップ: 赤ボーダー + エラーアイコン
- 接続線: 実行進行中はストロークダッシュアニメーション

**FR-3A-11: チェーン削除**

- `skill:chain:delete` IPC チャネルでチェーンIDを指定して削除
- 破壊的操作のため確認ダイアログで保護

**FR-3A-12: エラーハンドリング設定**

- 3種類のエラーハンドリング方針:
  - `stop`: エラー発生時にチェーン実行を停止
  - `skip`: エラーが発生したステップをスキップして続行
  - `retry`: エラー発生時にリトライ（リトライ回数は FR-3A-06 で設定）

---

### 1.2 3B: ScheduleManager（スケジュール管理）機能要件（11件）

| ID       | 機能要件                                                                  | IPC チャネル            | 優先度 |
| -------- | ------------------------------------------------------------------------- | ----------------------- | ------ |
| FR-3B-01 | スケジュール一覧をテーブル形式（ScheduleTable）で表示する                 | `skill:schedule:list`   | 必須   |
| FR-3B-02 | 新規スケジュールをダイアログ（ScheduleDialog）で作成する                  | `skill:schedule:add`    | 必須   |
| FR-3B-03 | CronEditor で Cron 式を GUI で設定する                                    | -                       | 必須   |
| FR-3B-04 | Cron プリセット（毎日9:00/平日9:00/毎時/毎週月曜9:00）を選択する          | -                       | 必須   |
| FR-3B-05 | カスタム Cron 式を分/時/日/月/曜日のセレクトボックスで入力する            | -                       | 必須   |
| FR-3B-06 | ON/OFF トグルでスケジュールの有効/無効を切り替える                        | `skill:schedule:toggle` | 必須   |
| FR-3B-07 | 次回実行時刻を計算して表示する                                            | -                       | 必須   |
| FR-3B-08 | スケジュールの実行履歴をリスト（RunHistoryList）で表示する                | -                       | 必須   |
| FR-3B-09 | スケジュールを編集する                                                    | `skill:schedule:update` | 必須   |
| FR-3B-10 | スケジュールを削除する                                                    | `skill:schedule:delete` | 必須   |
| FR-3B-11 | テーブル行選択時にスケジュール詳細パネル（ScheduleDetailPanel）を展開する | -                       | 必須   |

#### FR-3B 詳細仕様

**FR-3B-01: スケジュール一覧表示**

- ScheduleTable コンポーネントでテーブル形式表示
- カラム: ツール名 / スケジュール / 次回実行 / 状態（ON/OFF トグル）
- `skill:schedule:list` IPC チャネルで一覧取得
- データ未取得時は EmptyState（mood: "organized", メッセージ: 「ツールを自動で実行しよう」, アクション: 「スケジュール作成」）を表示

**FR-3B-02: スケジュール新規作成**

- ScheduleDialog コンポーネントでスキル名・Cron 式・プロンプトを入力
- `skill:schedule:add` IPC チャネルで作成

**FR-3B-03: CronEditor**

- CronEditor コンポーネントで Cron 式を GUI で設定
- プリセット選択とカスタム入力の2モード

**FR-3B-04: Cron プリセット**

- CronPresetList コンポーネントで以下のプリセットを提供:
  - 毎日 9:00: `0 9 * * *`
  - 平日 9:00: `0 9 * * 1-5`
  - 毎時: `0 * * * *`
  - 毎週月曜 9:00: `0 9 * * 1`

**FR-3B-05: カスタム Cron 入力**

- 分 / 時 / 日 / 月 / 曜日の5つのセレクトボックス
- Cron 式プレビュー表示

**FR-3B-06: ON/OFF トグル**

- `skill:schedule:toggle` IPC チャネルでスケジュールの有効/無効を切り替え
- トグルアニメーション: スライド + 色変化（accent <-> gray）、200ms ease-out

**FR-3B-07: 次回実行時刻表示**

- Cron 式からの次回実行時刻を計算してテーブルに表示
- フォーマット: 「明日 9:00」「来週月曜」のような相対表現

**FR-3B-08: 実行履歴表示**

- RunHistoryList コンポーネントで過去の実行結果を表示
- 各行: 日時 / ステータス（成功/エラー） / 実行時間 / エラー詳細

**FR-3B-09: スケジュール編集**

- ScheduleDialog を編集モードで表示
- `skill:schedule:update` IPC チャネルで更新

**FR-3B-10: スケジュール削除**

- `skill:schedule:delete` IPC チャネルで削除
- 破壊的操作のため確認ダイアログで保護

**FR-3B-11: 詳細パネル展開**

- ScheduleDetailPanel コンポーネントでスケジュール詳細を表示
- テーブル行クリック時に max-height トランジション（300ms ease-out）で展開
- プロンプト内容、実行履歴（RunHistoryList）を表示

---

### 1.3 3C: DebugPanel（デバッグパネル）機能要件（12件）

| ID       | 機能要件                                                                        | IPC チャネル                        | 優先度 |
| -------- | ------------------------------------------------------------------------------- | ----------------------------------- | ------ |
| FR-3C-01 | デバッグセッションを開始する（StartDebugDialog）                                | `skill:debug:start`                 | 必須   |
| FR-3C-02 | デバッグセッションを停止する                                                    | `skill:debug:command`               | 必須   |
| FR-3C-03 | コールスタックをツリー形式（CallStackView）で表示する                           | -                                   | 必須   |
| FR-3C-04 | 変数ウォッチ（VariableWatch）で値をリアルタイム更新する                         | -                                   | 必須   |
| FR-3C-05 | ブレークポイントを追加・削除・有効/無効トグルする（BreakpointEditor）           | `skill:debug:breakpoint:add/remove` | 必須   |
| FR-3C-06 | ステップ実行コマンド（continue/stepOver/stepInto/stepOut/pause/stop）を実行する | `skill:debug:command`               | 必須   |
| FR-3C-07 | 出力コンソール（OutputConsole）にログを表示する                                 | -                                   | 必須   |
| FR-3C-08 | ステップ履歴（StepHistoryList）を表示する                                       | -                                   | 必須   |
| FR-3C-09 | `skill:debug:event` をリアルタイムで購読し、UI を更新する（safeOn パターン）    | `skill:debug:event`                 | 必須   |
| FR-3C-10 | キーボードショートカットでデバッグ操作する（F5/F6/F10/F11/Shift+F5/Shift+F11）  | -                                   | 必須   |
| FR-3C-11 | 式を評価する                                                                    | `skill:debug:evaluate`              | 必須   |
| FR-3C-12 | 変数を検査する                                                                  | `skill:debug:inspect`               | 必須   |

#### FR-3C 詳細仕様

**FR-3C-01: デバッグセッション開始**

- StartDebugDialog コンポーネントでスキル名を選択して開始
- `skill:debug:start` IPC チャネルでセッションを作成
- 戻り値: DebugSession オブジェクト
- データ未取得時は EmptyState（mood: "focused", メッセージ: 「ツール実行を詳しく調べよう」, アクション: 「デバッグ開始」）を表示

**FR-3C-02: デバッグセッション停止**

- `skill:debug:command` IPC チャネルで command: "stop" を送信
- セッション状態を "completed" に更新

**FR-3C-03: コールスタック表示**

- CallStackView コンポーネントでツリー形式表示
- CallStackEntry 型: id, name, type, status, children（再帰構造）
- ブレークポイントヒット時に該当行を背景ハイライト（var(--status-warning-subtle)、300ms）

**FR-3C-04: 変数ウォッチ**

- VariableWatch コンポーネントで変数値を表示
- VariableNode コンポーネントでツリーノード表示
- `skill:debug:event` の "variable-changed" イベントでリアルタイム更新
- 値変更時にテキストが var(--color-accent) で点滅（500ms）

**FR-3C-05: ブレークポイント管理**

- BreakpointEditor コンポーネントでブレークポイント一覧表示
- BreakpointRow コンポーネントで各ブレークポイント行表示
- 追加: `skill:debug:breakpoint:add` IPC チャネル
- 削除: `skill:debug:breakpoint:remove` IPC チャネル
- 有効/無効トグル: BreakpointRow のチェックボックス

**FR-3C-06: ステップ実行コマンド**

- DebugControls コンポーネントで6種類のコマンドを提供
- `skill:debug:command` IPC チャネルで DebugCommand 型を送信
- コマンド一覧:
  - continue: 続行（F5、paused 状態のみ）
  - stepOver: ステップオーバー（F10、paused 状態のみ）
  - stepInto: ステップイン（F11、paused 状態のみ）
  - stepOut: ステップアウト（Shift+F11、paused 状態のみ）
  - pause: 一時停止（F6、running 状態のみ）
  - stop: 停止（Shift+F5、running または paused 状態）

**FR-3C-07: 出力コンソール**

- OutputConsole コンポーネントでログを表示
- テキスト一行ずつ append（即時）
- 自動スクロール対応

**FR-3C-08: ステップ履歴**

- StepHistoryList コンポーネントで実行済みステップ一覧を表示
- 各行: ステップ番号 / イベント種別（PreToolUse/PostToolUse） / ツール名 / ステータス / 所要時間
- 新規行追加時にアニメーション（opacity 0→1 + translateY(-4px→0)、200ms）

**FR-3C-09: イベント購読（safeOn パターン）**

- `skill:debug:event` チャネルを safeOn で購読
- React StrictMode 対応: useEffect のクリーンアップ関数でリスナー解除（P5 対策）
- DebugEvent 型のイベント種別:
  - `step`: ステップ実行イベント → currentStep を更新
  - `breakpoint-hit`: ブレークポイントヒット → sessionStatus を "paused" に更新
  - `variable-changed`: 変数変更 → variables を更新
  - `session-ended`: セッション終了 → sessionStatus を "completed" または "error" に更新
- 依存配列は空（リスナーはマウント時に一度だけ登録）

**FR-3C-10: キーボードショートカット**

- DebugControls の各ボタンに対応するキーボードショートカット:
  - F5: 続行（continue）
  - F6: 一時停止（pause）
  - F10: ステップオーバー（stepOver）
  - F11: ステップイン（stepInto）
  - Shift+F11: ステップアウト（stepOut）
  - Shift+F5: 停止（stop）
- ショートカットキーは Tooltip で表示（NFR-A05）

**FR-3C-11: 式の評価**

- `skill:debug:evaluate` IPC チャネルで式文字列を送信
- 戻り値: `{ result: unknown }`

**FR-3C-12: 変数の検査**

- `skill:debug:inspect` IPC チャネルで変数パスを送信
- 戻り値: `Record<string, unknown>`

---

### 1.4 3D: AnalyticsDashboard（使用分析ダッシュボード）機能要件（10件）

| ID       | 機能要件                                                                          | IPC チャネル                 | 優先度 |
| -------- | --------------------------------------------------------------------------------- | ---------------------------- | ------ |
| FR-3D-01 | サマリーカード（SummaryCards）で総実行回数・成功率・平均実行時間を表示する        | `skill:analytics:summary`    | 必須   |
| FR-3D-02 | サマリー値のカウントアップアニメーション（0→実際値、800ms ease-out）を実行する    | -                            | 必須   |
| FR-3D-03 | 使用トレンドチャート（UsageChart）を recharts で描画する                          | `skill:analytics:trend`      | 必須   |
| FR-3D-04 | トレンドチャートの初期表示で折れ線の左→右ドローアニメーション（1000ms）を実行する | -                            | 必須   |
| FR-3D-05 | ツール使用ランキング（SkillRanking）を水平バーチャートで表示する                  | `skill:analytics:statistics` | 必須   |
| FR-3D-06 | ランキングバーの初期表示で幅0%→実際値%のアニメーション（600ms）を実行する         | -                            | 必須   |
| FR-3D-07 | 期間フィルター（PeriodSelector）で過去7日/30日/90日を切り替える                   | -                            | 必須   |
| FR-3D-08 | CSV/JSON エクスポート（ExportButton）を実行する                                   | `skill:analytics:export`     | 必須   |
| FR-3D-09 | トレンドデータの粒度（hour/day/week/month）を選択する                             | -                            | 必須   |
| FR-3D-10 | チャートツールチップ（ChartTooltip）で実行回数・エラー数・平均時間を表示する      | -                            | 必須   |

#### FR-3D 詳細仕様

**FR-3D-01: サマリーカード表示**

- SummaryCards コンポーネントで3枚のサマリーカードを表示
- 各カード: タイトル / 値 / 単位 / トレンド（方向・増減率・比較ラベル）
- カードサイズ: min-h-100px, flex-1
- `skill:analytics:summary` IPC チャネルで AnalyticsSummary を取得
- データ未取得時は EmptyState（mood: "curious", メッセージ: 「ツールの使い方を振り返ろう」, アクションボタンなし（データ蓄積待ち））を表示
- トレンド上昇: var(--status-success) + TrendingUp アイコン
- トレンド下降: var(--status-error) + TrendingDown アイコン

**FR-3D-02: カウントアップアニメーション**

- サマリーカードの値が 0 から実際の値まで 800ms ease-out でカウントアップ
- 初期表示時のみ実行

**FR-3D-03: 使用トレンドチャート**

- UsageChart コンポーネントで recharts（ResponsiveContainer + LineChart + Tooltip）を使用
- `skill:analytics:trend` IPC チャネルで UsageTrend を取得
- テーマ色: var(--color-accent) を主線に使用
- グリッド: var(--border-primary) で薄い水平線
- デフォルト高さ: 280px

**FR-3D-04: ドローアニメーション**

- トレンドチャートの折れ線が左から右へ 1000ms ease-out で描画

**FR-3D-05: ツール使用ランキング**

- SkillRanking コンポーネントで水平バーチャートを表示
- `skill:analytics:statistics` IPC チャネルで SkillStatistics を取得
- バー色: var(--color-accent) のグラデーション
- CSS `width: ${percentage}%` でバー幅を制御
- デフォルト表示件数: 10件（最大50件）

**FR-3D-06: ランキングバーアニメーション**

- バー幅が 0% から実際値% まで 600ms ease-out でアニメーション
- 初期表示時のみ実行

**FR-3D-07: 期間フィルター**

- PeriodSelector コンポーネントで3つの期間を選択
- 選択肢: 過去7日 / 過去30日 / 過去90日
- 期間変更時にチャートが crossFade（200ms）で更新

**FR-3D-08: エクスポート**

- ExportButton コンポーネントで CSV/JSON エクスポートを実行
- `skill:analytics:export` IPC チャネルで Blob / string を取得

**FR-3D-09: データ粒度選択**

- トレンドデータの粒度を4種類から選択:
  - hour: 時間単位
  - day: 日単位
  - week: 週単位
  - month: 月単位

**FR-3D-10: チャートツールチップ**

- ChartTooltip コンポーネントでデータポイント上のツールチップを表示
- 表示項目: 実行回数 / エラー数 / 平均時間

---

## 2. 非機能要件一覧

### 2.1 パフォーマンス要件（8件）

| ID      | 要件                                       | 基準値     | 測定方法                             |
| ------- | ------------------------------------------ | ---------- | ------------------------------------ |
| NFR-P01 | 各ビューの初期レンダリング時間             | 200ms 以下 | React Profiler で測定                |
| NFR-P02 | IPC 呼び出し後の UI 更新遅延               | 100ms 以下 | IPC invoke → DOM 更新完了の差分      |
| NFR-P03 | チャート描画完了時間（AnalyticsDashboard） | 500ms 以下 | recharts レンダリング完了まで        |
| NFR-P04 | DebugPanel のイベント購読更新遅延          | 50ms 以下  | safeOn イベント受信 → DOM 更新の差分 |
| NFR-P05 | チェーン一覧のカード表示数上限             | 100件      | 100件表示時に NFR-P01 を維持         |
| NFR-P06 | スケジュール一覧のテーブル行数上限         | 200件      | 200件表示時に NFR-P01 を維持         |
| NFR-P07 | トレンドチャートのデータポイント数上限     | 365件      | 365ポイント描画時に NFR-P03 を維持   |
| NFR-P08 | SkillRanking の表示件数上限                | 50件       | 50件表示時にスクロール性能を維持     |

### 2.2 アクセシビリティ要件（WCAG 2.1 AA）（8件）

| ID      | 要件                                                               | 検証方法                                      |
| ------- | ------------------------------------------------------------------ | --------------------------------------------- |
| NFR-A01 | 通常テキストのコントラスト比 4.5:1 以上                            | aXe / Lighthouse で検証                       |
| NFR-A02 | 大テキスト・UI部品のコントラスト比 3:1 以上                        | aXe / Lighthouse で検証                       |
| NFR-A03 | 全操作がキーボードのみで実行可能                                   | Tab/Enter/Space/矢印キーで全機能にアクセス    |
| NFR-A04 | ARIA ラベルが全インタラクティブ要素に付与されている                | テストコードで aria-label の存在を検証        |
| NFR-A05 | DebugControls のショートカットキーが Tooltip で表示される          | Tooltip コンポーネントの存在を検証            |
| NFR-A06 | チャート（recharts）に `aria-label` でデータの要約が付与されている | チャートコンテナの aria-label を検証          |
| NFR-A07 | 色だけで情報を伝えない（アイコン・テキストを併用）                 | 全ステータス表示でアイコン+テキスト併用を検証 |
| NFR-A08 | フォーカス可視化（focus-visible ring）が全フォーカス可能要素に適用 | Tab 操作時のフォーカスリングを検証            |

### 2.3 レスポンシブ要件（3件）

| ID      | ブレークポイント | レイアウト                        | ビュー固有対応                                                                                                                              |
| ------- | ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-R01 | >= 1024px        | 左右分割（メイン + サイド 320px） | ChainBuilder: StepCard 水平配置 / ScheduleManager: テーブルレイアウト / DebugPanel: 左右2ペイン / Analytics: カード3列 + フルワイドチャート |
| NFR-R02 | 768px〜1023px    | 上下分割（折りたたみパネル）      | ChainBuilder: StepCard 水平配置（縮小） / ScheduleManager: テーブルレイアウト / DebugPanel: 上下分割 / Analytics: カード2列                 |
| NFR-R03 | < 768px          | 単一カラム + ボトムシート（85vh） | ChainBuilder: StepCard 垂直配置 / ScheduleManager: カードリスト形式 / DebugPanel: タブ切替 / Analytics: カード1列 + スクロール可能チャート  |

---

## 3. バックエンド IPC 依存

### 3.1 IPC チャネル対応表（22チャネル）

| #   | ビュー          | IPC チャネル                    | メソッド   | バックエンド型定義        | バックエンドタスク |
| --- | --------------- | ------------------------------- | ---------- | ------------------------- | ------------------ |
| 1   | ChainBuilder    | `skill:chain:list`              | safeInvoke | `SkillChainDefinition[]`  | TASK-9D            |
| 2   | ChainBuilder    | `skill:chain:get`               | safeInvoke | `SkillChainDefinition`    | TASK-9D            |
| 3   | ChainBuilder    | `skill:chain:save`              | safeInvoke | `SkillChainDefinition`    | TASK-9D            |
| 4   | ChainBuilder    | `skill:chain:delete`            | safeInvoke | `{ success: boolean }`    | TASK-9D            |
| 5   | ChainBuilder    | `skill:chain:execute`           | safeInvoke | `SkillChainResult`        | TASK-9D            |
| 6   | ScheduleManager | `skill:schedule:list`           | safeInvoke | `ScheduledSkill[]`        | TASK-9G            |
| 7   | ScheduleManager | `skill:schedule:add`            | safeInvoke | `ScheduledSkill`          | TASK-9G            |
| 8   | ScheduleManager | `skill:schedule:update`         | safeInvoke | `ScheduledSkill`          | TASK-9G            |
| 9   | ScheduleManager | `skill:schedule:delete`         | safeInvoke | `{ success: boolean }`    | TASK-9G            |
| 10  | ScheduleManager | `skill:schedule:toggle`         | safeInvoke | `ScheduledSkill`          | TASK-9G            |
| 11  | DebugPanel      | `skill:debug:start`             | safeInvoke | `DebugSession`            | TASK-9H            |
| 12  | DebugPanel      | `skill:debug:command`           | safeInvoke | `DebugSession`            | TASK-9H            |
| 13  | DebugPanel      | `skill:debug:breakpoint:add`    | safeInvoke | `Breakpoint`              | TASK-9H            |
| 14  | DebugPanel      | `skill:debug:breakpoint:remove` | safeInvoke | `{ success: boolean }`    | TASK-9H            |
| 15  | DebugPanel      | `skill:debug:inspect`           | safeInvoke | `Record<string, unknown>` | TASK-9H            |
| 16  | DebugPanel      | `skill:debug:evaluate`          | safeInvoke | `{ result: unknown }`     | TASK-9H            |
| 17  | DebugPanel      | `skill:debug:event`             | safeOn     | `DebugEvent`（購読）      | TASK-9H            |
| 18  | Analytics       | `skill:analytics:record`        | safeInvoke | `SkillUsageEvent`         | TASK-9J            |
| 19  | Analytics       | `skill:analytics:statistics`    | safeInvoke | `SkillStatistics`         | TASK-9J            |
| 20  | Analytics       | `skill:analytics:summary`       | safeInvoke | `AnalyticsSummary`        | TASK-9J            |
| 21  | Analytics       | `skill:analytics:trend`         | safeInvoke | `UsageTrend`              | TASK-9J            |
| 22  | Analytics       | `skill:analytics:export`        | safeInvoke | `Blob / string`           | TASK-9J            |

### 3.2 バックエンド主要型定義（22型）

#### TASK-9D: SkillChain（6型）

| 型名                   | 主要フィールド                                                 |
| ---------------------- | -------------------------------------------------------------- |
| `SkillChainDefinition` | id, name, description, steps, errorHandling, metadata          |
| `SkillChainStep`       | id, skillName, inputs, outputs, condition, timeout, retryCount |
| `InputMapping`         | type: literal/variable/template/previousOutput, value          |
| `OutputMapping`        | name, path                                                     |
| `SkillChainCondition`  | type: always/ifVariable/ifPreviousSuccess/expression, config   |
| `SkillChainResult`     | chainId, steps, status, duration, outputs, errors              |

#### TASK-9G: SkillSchedule（4型）

| 型名                   | 主要フィールド                                                  |
| ---------------------- | --------------------------------------------------------------- |
| `ScheduledSkill`       | id, skillName, schedule, isEnabled, lastRun, nextRun, prompt    |
| `SkillSchedule`        | cron, timezone, description                                     |
| `NotificationSettings` | onSuccess, onFailure, channels                                  |
| `ScheduledRunResult`   | id, scheduledSkillId, startTime, endTime, status, output, error |

#### TASK-9H: SkillDebug（6型）

| 型名             | 主要フィールド                                                    |
| ---------------- | ----------------------------------------------------------------- |
| `DebugSession`   | id, skillName, status, startTime, steps, callStack, breakpoints   |
| `Breakpoint`     | id, type, target, isEnabled, hitCount                             |
| `DebugStep`      | index, type, toolName, status, duration, input, output            |
| `CallStackEntry` | id, name, type, status, children                                  |
| `DebugEvent`     | type: step/breakpoint-hit/variable-changed/session-ended, payload |
| `DebugCommand`   | type: continue/stepOver/stepInto/stepOut/pause/stop               |

#### TASK-9J: SkillAnalytics（6型）

| 型名              | 主要フィールド                                                 |
| ----------------- | -------------------------------------------------------------- |
| `SkillUsageEvent` | id, skillName, timestamp, duration, status, toolsUsed          |
| `SkillStatistics` | skillName, totalRuns, successRate, avgDuration, toolUsageStats |
| `ToolUsageStat`   | toolName, count, avgDuration, successRate                      |
| `AnalyticsPeriod` | start, end, granularity: hour/day/week/month                   |
| `UsageTrend`      | period, dataPoints, summary                                    |
| `TrendDataPoint`  | timestamp, totalRuns, successCount, failureCount, avgDuration  |

---

## 4. 共通パターン要件

### 4.1 HIG 準拠レイアウト

全ビューに共通するレイアウト構成:

- ヘッダー: h-56px, border-bottom, px-24px（ビュータイトル + アクションボタン群）
- コンテンツ: p-24px, overflow-y: auto
- 最大幅: 1200px, mx-auto

### 4.2 EmptyState パターン

| ビュー          | mood          | メッセージ                     | アクションボタン       |
| --------------- | ------------- | ------------------------------ | ---------------------- |
| ChainBuilder    | `"creative"`  | 「ツールを組み合わせてみよう」 | 「チェーンを作成」     |
| ScheduleManager | `"organized"` | 「ツールを自動で実行しよう」   | 「スケジュール作成」   |
| DebugPanel      | `"focused"`   | 「ツール実行を詳しく調べよう」 | 「デバッグ開始」       |
| Analytics       | `"curious"`   | 「ツールの使い方を振り返ろう」 | なし（データ蓄積待ち） |

### 4.3 Loading パターン

- スケルトンカード: `animate-pulse` + グレー背景矩形
- カード数: コンテンツに応じて 3〜6 枚
- ローディング中はアクションボタン無効化

### 4.4 マイクロインタラクション

全ビュー共通のインタラクション方針:

- ホバー: 200ms 以内のフィードバック（scale, shadow, opacity 変化）
- アニメーション: 200-300ms の目的を持ったもののみ
- 破壊的操作: 確認ダイアログで保護

---

## 5. テスト連携トレーサビリティ

| 要件カテゴリ     | テスト連携先                               | 接続方法                                         |
| ---------------- | ------------------------------------------ | ------------------------------------------------ |
| FR-3A（12件）    | `outputs/phase-4/test-specification.md`    | FR ID をテストケース ID に1:1対応                |
| FR-3B（11件）    | `outputs/phase-4/test-specification.md`    | FR ID をテストケース ID に1:1対応                |
| FR-3C（12件）    | `outputs/phase-4/test-specification.md`    | FR ID をテストケース ID に1:1対応                |
| FR-3D（10件）    | `outputs/phase-4/test-specification.md`    | FR ID をテストケース ID に1:1対応                |
| NFR-P（8件）     | `outputs/phase-4/test-specification.md`    | 性能テスト項目として定義                         |
| NFR-A（8件）     | `outputs/phase-6/test-expansion-report.md` | a11y テスト項目として Phase 6 で拡充             |
| NFR-R（3件）     | `outputs/phase-11/manual-test-result.md`   | レスポンシブ手動テスト項目として Phase 11 で検証 |
| IPC 契約（22ch） | `outputs/phase-4/test-utilities-design.md` | IPC モック関数・契約テストとして設計             |
