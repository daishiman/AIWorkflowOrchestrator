# Phase 4: テスト作成（TDD Red）— TASK-UI-05B

## メタ情報

| 項目             | 値                                                                                |
| ---------------- | --------------------------------------------------------------------------------- |
| タスク ID        | TASK-UI-05B                                                                       |
| Phase            | 4 — テスト作成                                                                    |
| 前提 Phase       | Phase 3（設計レビュー）PASS                                                       |
| 作成日           | 2026-03-01                                                                        |
| 対象ビュー       | 3A SkillChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard |
| テスト環境       | Vitest + @testing-library/react + happy-dom                                       |
| テストファイル数 | 16 ファイル                                                                       |

## 目的

4つの高度管理ビュー（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）のテストコードをテストファーストで作成する。全テストが Red（失敗）状態であることを確認し、Phase 5 での実装基盤を整える。

## 実行タスク

- テスト戦略定義: 4ビュー共通のテスト方針を定義する
- モック基盤構築: IPC/Store/データファクトリの共通ユーティリティを整備する
- ビュー別テスト設計: 3A〜3D の Red テストケースを設計する
- セキュリティ観点追加: P42/P5/P31/P39/P47 の検証ケースを追加する
- 契約テスト接続: Phase 1/2/3 の要件・設計・レビュー結果をテストへ接続する
- Red確認: 全テストが Red で失敗理由が妥当であることを確認する

### Task 1: テスト設計方針の策定

**目的**: 4ビュー共通のテスト設計方針を定め、テストの一貫性を確保する。

**方針定義項目**:

- テスト環境: happy-dom（jsdom 不使用）
- イベントシミュレーション: `fireEvent` のみ使用（`userEvent` 禁止 — P39 対策）
- タイマーテスト: `vi.advanceTimersByTime()` のみ使用（`vi.runAllTimers()` 禁止 — P13 対策）
- Store モック: agentSlice の個別セレクタを使用（合成 Hook 禁止 — P31 対策）
- IPC モック: `window.electronAPI.skill.*` の全チャネルをモック化
- CSS 変数テスト: `variantStyles` Record 定数を import して期待値生成（P47 対策）

**成果物**: `outputs/phase-4/test-specification.md`

### Task 2: 共通テストユーティリティ作成

**目的**: 4ビュー共通で使用するモック定義とテストヘルパーを作成する。

**作成ファイル**: `apps/desktop/src/renderer/views/__test-utils__/skill-advanced-views-helpers.ts`

**定義内容**:

#### 2-1: IPC モック定義

| IPC チャネルグループ | モック対象メソッド                                                               |
| -------------------- | -------------------------------------------------------------------------------- |
| `skill:chain:*`      | `list`, `get`, `save`, `delete`, `execute`                                       |
| `skill:schedule:*`   | `list`, `add`, `update`, `delete`, `toggle`                                      |
| `skill:debug:*`      | `start`, `command`, `breakpoint:add`, `breakpoint:remove`, `inspect`, `evaluate` |
| `skill:debug:event`  | `on` リスナー（safeOn モック）                                                   |
| `skill:analytics:*`  | `record`, `statistics`, `summary`, `trend`, `export`                             |

#### 2-2: テストデータファクトリ

| ファクトリ関数                 | 戻り値型               | 説明                                 |
| ------------------------------ | ---------------------- | ------------------------------------ |
| `createMockChainDefinition()`  | `SkillChainDefinition` | チェーン定義のテストデータ生成       |
| `createMockChainStep()`        | `SkillChainStep`       | ステップのテストデータ生成           |
| `createMockScheduledSkill()`   | `ScheduledSkill`       | スケジュールのテストデータ生成       |
| `createMockDebugSession()`     | `DebugSession`         | デバッグセッションのテストデータ生成 |
| `createMockBreakpoint()`       | `Breakpoint`           | ブレークポイントのテストデータ生成   |
| `createMockAnalyticsSummary()` | `AnalyticsSummary`     | 分析サマリーのテストデータ生成       |
| `createMockTrendDataPoint()`   | `TrendDataPoint`       | トレンドデータのテストデータ生成     |
| `createMockSkillStatistics()`  | `SkillStatistics`      | スキル統計のテストデータ生成         |

#### 2-3: レンダリングヘルパー

```typescript
// 共通のレンダリングラッパー（IPC モック付き）
renderWithMocks(component: React.ReactElement, options?: {
  chainMocks?: Partial<ChainIPCMocks>;
  scheduleMocks?: Partial<ScheduleIPCMocks>;
  debugMocks?: Partial<DebugIPCMocks>;
  analyticsMocks?: Partial<AnalyticsIPCMocks>;
}): RenderResult
```

**成果物**: `outputs/phase-4/test-utilities-design.md`

### Task 3: 3A SkillChainBuilder テストケース作成

**テストファイル 4 件**:

#### 3-1: `SkillChainBuilder.test.tsx`

| テストケース                                 | 検証内容                                        |
| -------------------------------------------- | ----------------------------------------------- |
| チェーン一覧が空の場合 EmptyState を表示する | EmptyState コンポーネントの表示、メッセージ文言 |
| ローディング中はスケルトンを表示する         | Skeleton コンポーネントの表示                   |
| チェーン一覧を ChainCardGrid で表示する      | カード数、各カードの名前・ステップ数            |
| カードクリックで ChainEditor を展開する      | エディター領域の表示、選択チェーン名の一致      |
| 新規作成ボタンで CreateChainDialog を開く    | ダイアログの表示、フォーム要素の存在            |
| IPC エラー時にエラーメッセージを表示する     | エラーバナーの表示、エラー内容                  |

#### 3-2: `StepCard.test.tsx`

| テストケース                                          | 検証内容                     |
| ----------------------------------------------------- | ---------------------------- |
| スキル名とステップ番号を表示する                      | テキスト内容の一致           |
| ステータス `idle` で既定スタイルを適用する            | CSS クラスの検証             |
| ステータス `running` でパルスアニメーションを表示する | `animate-pulse` クラスの存在 |
| ステータス `completed` で成功スタイルを適用する       | 成功色の CSS クラス検証      |
| ステータス `error` でエラースタイルを適用する         | エラー色の CSS クラス検証    |
| hover 時に `scale(1.02)` と `shadow-md` を適用する    | hover 関連の CSS クラス検証  |
| クリックで onSelect コールバックを呼び出す            | コールバック引数の検証       |
| サイズが 160px×100px である                           | スタイル属性の検証           |

#### 3-3: `StepEditor.test.tsx`

| テストケース                                      | 検証内容                            |
| ------------------------------------------------- | ----------------------------------- |
| スキル選択ドロップダウンを表示する                | select 要素の存在、オプション数     |
| スキル変更で onSkillChange を呼び出す             | コールバック呼び出しと引数          |
| 入力マッピングの切替ボタンを表示する              | `previous_output` / `manual` の切替 |
| マッピングモード切替で onMappingChange を呼び出す | InputMapping 型の引数検証           |
| 条件設定セクションを表示する                      | 条件入力フィールドの存在            |
| 条件変更で onConditionChange を呼び出す           | 条件オブジェクトの引数検証          |

#### 3-4: `useChainEditor.test.ts`

| テストケース                              | 検証内容                                       |
| ----------------------------------------- | ---------------------------------------------- |
| 指定 ID のチェーンを IPC 経由で読み込む   | `skill:chain:get` の呼び出し引数、state 更新   |
| ステップを末尾に追加する                  | steps 配列の長さ増加、新ステップの内容         |
| 指定インデックスのステップを削除する      | steps 配列の長さ減少、残存ステップの検証       |
| ステップの並び替えを行う                  | 移動後のインデックス検証                       |
| チェーンを IPC 経由で保存する             | `skill:chain:save` の呼び出し引数              |
| チェーンを IPC 経由で実行する             | `skill:chain:execute` の呼び出し、結果の state |
| 読み込みエラー時に error state を設定する | error メッセージの内容                         |

### Task 4: 3B ScheduleManager テストケース作成

**テストファイル 3 件**:

#### 4-1: `ScheduleManager.test.tsx`

| テストケース                                | 検証内容                               |
| ------------------------------------------- | -------------------------------------- |
| スケジュール一覧をテーブル形式で表示する    | テーブル行数、各行のスキル名・Cron 式  |
| 一覧が空の場合 EmptyState を表示する        | EmptyState メッセージの表示            |
| ローディング中はスケルトンを表示する        | Skeleton コンポーネントの表示          |
| 行クリックで ScheduleDetailPanel を展開する | 詳細パネルの表示、選択スケジュール情報 |
| 新規追加ボタンで ScheduleDialog を開く      | ダイアログの表示                       |
| IPC エラー時にエラーメッセージを表示する    | エラーバナーの表示                     |

#### 4-2: `CronEditor.test.tsx`

| テストケース                                     | 検証内容                                     |
| ------------------------------------------------ | -------------------------------------------- |
| プリセット一覧を CronPresetList で表示する       | プリセット項目数（毎分/毎時/毎日/毎週/毎月） |
| プリセット選択で Cron 式を入力欄に反映する       | input value の変化                           |
| カスタム Cron 式を手動入力できる                 | input への直接入力                           |
| 有効な Cron 式で次回実行日時プレビューを表示する | プレビューテキストの存在                     |
| 無効な Cron 式でバリデーションエラーを表示する   | エラーメッセージの表示                       |
| Cron 式変更で onChange コールバックを呼び出す    | コールバック引数の検証                       |

#### 4-3: `useScheduleList.test.ts`

| テストケース                          | 検証内容                                     |
| ------------------------------------- | -------------------------------------------- |
| スケジュール一覧を IPC 経由で取得する | `skill:schedule:list` の呼び出し、state 更新 |
| スケジュールの有効/無効をトグルする   | `skill:schedule:toggle` の呼び出し引数       |
| スケジュールを IPC 経由で削除する     | `skill:schedule:delete` の呼び出し、一覧更新 |
| 取得エラー時に error state を設定する | error メッセージの内容                       |

### Task 5: 3C DebugPanel テストケース作成

**テストファイル 4 件**:

#### 5-1: `DebugPanel.test.tsx`

| テストケース                                         | 検証内容                                           |
| ---------------------------------------------------- | -------------------------------------------------- |
| 左右 2 ペインレイアウトで表示する                    | 左ペイン・右ペインの DOM 構造                      |
| セッション未開始で StartDebugDialog ボタンを表示する | 開始ボタンの存在                                   |
| セッション実行中で各パネルを表示する                 | CallStackView, VariableWatch, OutputConsole の存在 |
| セッション終了で結果サマリーを表示する               | 終了メッセージ、ステップ数                         |
| IPC エラー時にエラーメッセージを表示する             | エラーバナーの表示                                 |

#### 5-2: `DebugControls.test.tsx`

| テストケース                                                | 検証内容                                 |
| ----------------------------------------------------------- | ---------------------------------------- |
| セッション未開始で全操作ボタンを無効化する                  | 全ボタンの `disabled` 属性               |
| 実行中で Continue/StepOver/StepInto/Stop ボタンを有効化する | 各ボタンの `disabled` 属性が false       |
| ブレーク中で全操作ボタンを有効化する                        | 全ボタンの `disabled` 属性が false       |
| Continue クリックで `continue` コマンドを送信する           | IPC `skill:debug:command` の呼び出し引数 |
| StepOver クリックで `step_over` コマンドを送信する          | IPC `skill:debug:command` の呼び出し引数 |
| StepInto クリックで `step_into` コマンドを送信する          | IPC `skill:debug:command` の呼び出し引数 |
| Stop クリックで `stop` コマンドを送信する                   | IPC `skill:debug:command` の呼び出し引数 |

#### 5-3: `BreakpointEditor.test.tsx`

| テストケース                                     | 検証内容                                |
| ------------------------------------------------ | --------------------------------------- |
| ブレークポイント一覧を BreakpointRow で表示する  | 行数、各行のステップ名・条件            |
| 追加ボタンで新規ブレークポイント入力欄を表示する | 入力フィールドの出現                    |
| ステップ名入力と追加確定で onAdd を呼び出す      | Breakpoint 型の引数検証                 |
| 削除ボタンで onRemove を呼び出す                 | ブレークポイント ID の引数検証          |
| トグルで有効/無効を切替え onToggle を呼び出す    | ブレークポイント ID と enabled 値の検証 |

#### 5-4: `useDebugSession.test.ts`

| テストケース                                              | 検証内容                             |
| --------------------------------------------------------- | ------------------------------------ |
| デバッグセッションを IPC 経由で開始する                   | `skill:debug:start` の呼び出し引数   |
| `skill:debug:event` リスナーを登録する                    | safeOn モックの呼び出し確認          |
| cleanup 時にリスナーを解除する（P5 対策）                 | removeListener モックの呼び出し確認  |
| `step_reached` イベントで callStack を更新する            | callStack state の内容               |
| `breakpoint_hit` イベントで status を `paused` に更新する | status state の値                    |
| `session_end` イベントで status を `ended` に更新する     | status state の値                    |
| セッション停止コマンドを送信する                          | `skill:debug:command` の呼び出し引数 |

### Task 6: 3D AnalyticsDashboard テストケース作成

**テストファイル 4 件**:

#### 6-1: `AnalyticsDashboard.test.tsx`

| テストケース                                       | 検証内容                            |
| -------------------------------------------------- | ----------------------------------- |
| サマリーカードセクションを表示する                 | SummaryCards コンポーネントの存在   |
| UsageChart セクションを表示する                    | UsageChart コンポーネントの存在     |
| SkillRanking セクションを表示する                  | SkillRanking コンポーネントの存在   |
| PeriodSelector で期間を切替える                    | 期間変更後のデータ再取得            |
| ExportButton クリックで CSV エクスポートを実行する | `skill:analytics:export` の呼び出し |
| ローディング中はスケルトンを表示する               | Skeleton コンポーネントの表示       |
| IPC エラー時にエラーメッセージを表示する           | エラーバナーの表示                  |

#### 6-2: `SummaryCard.test.tsx`

| テストケース                                       | 検証内容                        |
| -------------------------------------------------- | ------------------------------- |
| ラベルと値を表示する                               | テキスト内容の一致              |
| min-height が 100px である                         | スタイル属性の検証              |
| トレンド方向 `up` で上向き矢印アイコンを表示する   | ArrowUp アイコンの存在          |
| トレンド方向 `down` で下向き矢印アイコンを表示する | ArrowDown アイコンの存在        |
| トレンド方向 `flat` で横矢印アイコンを表示する     | ArrowRight アイコンの存在       |
| カウントアップアニメーション用の data 属性を持つ   | `data-animate-count` 属性の存在 |

#### 6-3: `UsageChart.test.tsx`

| テストケース                                        | 検証内容                      |
| --------------------------------------------------- | ----------------------------- |
| recharts の ResponsiveContainer を 280px 高さで表示 | コンテナの height 属性        |
| データポイント数に応じた要素をレンダリングする      | SVG 要素数の検証              |
| データが空の場合にプレースホルダーを表示する        | "データなし" メッセージの存在 |
| ChartTooltip がホバー時に表示される                 | ツールチップ要素の存在確認    |

#### 6-4: `useAnalyticsSummary.test.ts`

| テストケース                              | 検証内容                                 |
| ----------------------------------------- | ---------------------------------------- |
| サマリーデータを IPC 経由で取得する       | `skill:analytics:summary` の呼び出し引数 |
| 期間パラメータを渡して取得する            | 引数の period 値の検証                   |
| 取得成功時に summary state を更新する     | AnalyticsSummary 型の state 内容         |
| 取得エラー時に error state を設定する     | error メッセージの内容                   |
| ローディング中は isLoading が true である | isLoading state の値                     |

## 参照資料

| 資料                    | パス / 参照先                                                                     |
| ----------------------- | --------------------------------------------------------------------------------- |
| Phase 1 要件定義        | `phase-1-requirements.md`                                                         |
| Phase 2 設計書          | `phase-2-design.md`                                                               |
| Phase 3 設計レビュー    | `phase-3-design-review.md`                                                        |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`（P5, P13, P31, P39, P40, P47）               |
| コード品質ルール        | `.claude/rules/02-code-quality.md`                                                |
| IPC 型定義（Chain）     | `packages/shared/src/types/skill-chain.ts`                                        |
| IPC 型定義（Schedule）  | `packages/shared/src/types/skill-schedule.ts`                                     |
| IPC 型定義（Debug）     | `packages/shared/src/types/skill-debug.ts`                                        |
| IPC 型定義（Analytics） | `packages/shared/src/types/skill-analytics.ts`                                    |
| Preload チャネル定義    | `apps/desktop/src/preload/channels.ts`                                            |
| aiworkflow テスト規約   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| aiworkflow a11yテスト   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |
| aiworkflow IPC契約      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |

## 実行手順

### Step 1: テスト設計方針の文書化

1. `outputs/phase-4/test-specification.md` を作成する
2. テスト環境（happy-dom）、イベント方針（fireEvent）、タイマー方針（advanceTimersByTime）、Store モック方針（個別セレクタ）を記載する
3. 各ビューのテストケース一覧を記載する

### Step 2: 共通テストユーティリティの作成

1. `apps/desktop/src/renderer/views/__test-utils__/skill-advanced-views-helpers.ts` を作成する
2. IPC モック定義（4 グループ）を実装する
3. テストデータファクトリ（8 関数）を実装する
4. `renderWithMocks` ヘルパーを実装する
5. `outputs/phase-4/test-utilities-design.md` を作成する

### Step 3: 3A SkillChainBuilder テスト作成

1. `__tests__/` ディレクトリを作成する
2. `SkillChainBuilder.test.tsx`（6 テスト）を作成する
3. `StepCard.test.tsx`（8 テスト）を作成する
4. `StepEditor.test.tsx`（6 テスト）を作成する
5. `useChainEditor.test.ts`（7 テスト）を作成する
6. 全テストが Red（失敗）であることを `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillChainBuilder/` で確認する

### Step 4: 3B ScheduleManager テスト作成

1. `__tests__/` ディレクトリを作成する
2. `ScheduleManager.test.tsx`（6 テスト）を作成する
3. `CronEditor.test.tsx`（6 テスト）を作成する
4. `useScheduleList.test.ts`（4 テスト）を作成する
5. 全テストが Red（失敗）であることを `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/ScheduleManager/` で確認する

### Step 5: 3C DebugPanel テスト作成

1. `__tests__/` ディレクトリを作成する
2. `DebugPanel.test.tsx`（5 テスト）を作成する
3. `DebugControls.test.tsx`（7 テスト）を作成する
4. `BreakpointEditor.test.tsx`（5 テスト）を作成する
5. `useDebugSession.test.ts`（7 テスト）を作成する
6. 全テストが Red（失敗）であることを `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/DebugPanel/` で確認する

### Step 6: 3D AnalyticsDashboard テスト作成

1. `__tests__/` ディレクトリを作成する
2. `AnalyticsDashboard.test.tsx`（7 テスト）を作成する
3. `SummaryCard.test.tsx`（6 テスト）を作成する
4. `UsageChart.test.tsx`（4 テスト）を作成する
5. `useAnalyticsSummary.test.ts`（5 テスト）を作成する
6. 全テストが Red（失敗）であることを `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/AnalyticsDashboard/` で確認する

### Step 7: 全体確認

1. 全 16 テストファイルが存在することを `find apps/desktop/src/renderer/views/{SkillChainBuilder,ScheduleManager,DebugPanel,AnalyticsDashboard}/__tests__/ -name "*.test.*" | wc -l` で確認する（期待値: 16）
2. `userEvent` が使用されていないことを `grep -rn "userEvent" apps/desktop/src/renderer/views/{SkillChainBuilder,ScheduleManager,DebugPanel,AnalyticsDashboard}/` で確認する（期待値: 0 件）
3. `runAllTimers` が使用されていないことを `grep -rn "runAllTimers" apps/desktop/src/renderer/views/{SkillChainBuilder,ScheduleManager,DebugPanel,AnalyticsDashboard}/` で確認する（期待値: 0 件）

## 統合テスト連携【必須】

| 連携元  | 連携内容                            | 反映先                                     |
| ------- | ----------------------------------- | ------------------------------------------ |
| Phase 1 | FR/NFR と受け入れ基準のテストID対応 | `outputs/phase-4/test-specification.md`    |
| Phase 2 | Props/Hook/IPC 設計の契約テスト     | `outputs/phase-4/test-utilities-design.md` |
| Phase 3 | MINOR/MAJOR 指摘の再発防止テスト    | `outputs/phase-4/test-specification.md`    |

## 成果物

| 成果物                                  | パス                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| テスト仕様書                            | `outputs/phase-4/test-specification.md`                                          |
| テストユーティリティ設計書              | `outputs/phase-4/test-utilities-design.md`                                       |
| 共通テストヘルパー                      | `apps/desktop/src/renderer/views/__test-utils__/skill-advanced-views-helpers.ts` |
| ChainBuilder テスト（4 ファイル）       | `apps/desktop/src/renderer/views/SkillChainBuilder/__tests__/*.test.{tsx,ts}`    |
| ScheduleManager テスト（3 ファイル）    | `apps/desktop/src/renderer/views/ScheduleManager/__tests__/*.test.{tsx,ts}`      |
| DebugPanel テスト（4 ファイル）         | `apps/desktop/src/renderer/views/DebugPanel/__tests__/*.test.{tsx,ts}`           |
| AnalyticsDashboard テスト（4 ファイル） | `apps/desktop/src/renderer/views/AnalyticsDashboard/__tests__/*.test.{tsx,ts}`   |

## 完了条件

- [ ] テスト仕様書 `outputs/phase-4/test-specification.md` が作成されている
- [ ] テストユーティリティ設計書 `outputs/phase-4/test-utilities-design.md` が作成されている
- [ ] 共通テストヘルパーファイルが作成されている
- [ ] テストファイルが 16 ファイル全て作成されている
- [ ] テストケース合計: 3A=27, 3B=16, 3C=24, 3D=22 — 合計 89 テストケース
- [ ] 全テストが Red（失敗）状態である（実装未完了のため）
- [ ] `userEvent` が全テストファイルで未使用である（P39 対策）
- [ ] `runAllTimers` が全テストファイルで未使用である（P13 対策）
- [ ] agentSlice の合成 Hook が全テストファイルで未使用である（P31 対策）
- [ ] IPC モックが全チャネル（chain 5 + schedule 5 + debug 7 + analytics 5 = 22 チャネル）に定義されている
- [ ] テスト実行は `cd apps/desktop` から行っている（P40 対策）

## 次 Phase

Phase 5（実装 — TDD Green）へ進む。Phase 4 で作成した全テストを Green にすることが Phase 5 の目標となる。
