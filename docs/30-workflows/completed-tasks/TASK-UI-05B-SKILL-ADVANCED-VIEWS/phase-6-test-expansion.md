# Phase 6: テスト拡充 — TASK-UI-05B

## メタ情報

| 項目           | 値                                                                                |
| -------------- | --------------------------------------------------------------------------------- |
| タスク ID      | TASK-UI-05B                                                                       |
| Phase          | 6 — テスト拡充                                                                    |
| 前提 Phase     | Phase 5（実装）完了 — 全 89 テストが Green 状態                                   |
| 作成日         | 2026-03-01                                                                        |
| 対象ビュー     | 3A SkillChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard |
| カバレッジ目標 | Line 80%+ / Branch 60%+ / Function 80%+                                           |

## 目的

Phase 5 で実装したコードに対してカバレッジ不足箇所を特定し、境界値・異常系・アクセシビリティ・レスポンシブのテストを追加する。Phase 7 でのカバレッジ基準達成に向けた土台を作る。

## 実行タスク

- カバレッジ診断: 現状カバレッジの不足箇所を可視化する
- 境界値強化: 空値/上限値/異常入力のテストを追加する
- 異常系強化: IPC エラー/タイムアウト/連続操作のテストを追加する
- a11y強化: ARIA/キーボード操作のテストを追加する
- レスポンシブ強化: sm/md/lg 切替のテストを追加する
- 回帰防止確認: 追加テストを含む全テストの Green を確認する

### Task 1: 現状カバレッジ測定

**目的**: Phase 5 完了時点のカバレッジを測定し、不足箇所を特定する。

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/SkillChainBuilder/
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/ScheduleManager/
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/DebugPanel/
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/views/AnalyticsDashboard/
```

**記録項目**:

| ビュー             | Line | Branch | Function | 不足箇所（上位 3 件） |
| ------------------ | ---- | ------ | -------- | --------------------- |
| SkillChainBuilder  | —%   | —%     | —%       | 測定後記載            |
| ScheduleManager    | —%   | —%     | —%       | 測定後記載            |
| DebugPanel         | —%   | —%     | —%       | 測定後記載            |
| AnalyticsDashboard | —%   | —%     | —%       | 測定後記載            |

### Task 2: 境界値テスト追加

**目的**: 空データ・大量データ・無効入力のエッジケースをカバーする。

#### 2-1: 3A SkillChainBuilder 境界値テスト

| テストケース                                             | 対象ファイル                 | 検証内容                        |
| -------------------------------------------------------- | ---------------------------- | ------------------------------- |
| ステップ数が 0 のチェーンを表示する                      | `SkillChainBuilder.test.tsx` | "ステップなし" メッセージの表示 |
| ステップ数が上限（20 件）のチェーンを表示する            | `SkillChainBuilder.test.tsx` | スクロール可能なステップ一覧    |
| チェーン名が空文字でフォーム送信を拒否する               | `StepEditor.test.tsx`        | バリデーションエラー表示        |
| ステップのスキル名が最大長（100 文字）で切り詰め表示する | `StepCard.test.tsx`          | text-overflow: ellipsis の動作  |
| 入力マッピングのキーが重複した場合にエラーを表示する     | `StepEditor.test.tsx`        | 重複エラーメッセージ            |

#### 2-2: 3B ScheduleManager 境界値テスト

| テストケース                                      | 対象ファイル               | 検証内容                                 |
| ------------------------------------------------- | -------------------------- | ---------------------------------------- |
| スケジュール 0 件で EmptyState を表示する         | `ScheduleManager.test.tsx` | EmptyState メッセージ                    |
| スケジュール 100 件でパフォーマンス劣化しない     | `ScheduleManager.test.tsx` | レンダリング完了の検証                   |
| Cron 式に不正文字列を入力した場合のバリデーション | `CronEditor.test.tsx`      | エラーメッセージ "不正な Cron 式" の表示 |
| Cron 式が空文字の場合にプレビューを非表示にする   | `CronEditor.test.tsx`      | プレビュー要素の不在                     |

#### 2-3: 3C DebugPanel 境界値テスト

| テストケース                                             | 対象ファイル                | 検証内容                        |
| -------------------------------------------------------- | --------------------------- | ------------------------------- |
| コールスタックが空の場合にプレースホルダーを表示する     | `DebugPanel.test.tsx`       | "コールスタックなし" メッセージ |
| ブレークポイント 0 件で "未設定" メッセージを表示する    | `BreakpointEditor.test.tsx` | プレースホルダーメッセージ      |
| 変数値が深くネストした場合（5 階層）に折りたたみ表示する | `DebugPanel.test.tsx`       | 展開/折りたたみの切替動作       |
| コンソール出力が 1000 行を超えた場合に自動スクロールする | `DebugPanel.test.tsx`       | スクロール位置の検証            |

#### 2-4: 3D AnalyticsDashboard 境界値テスト

| テストケース                                           | 対象ファイル                  | 検証内容                          |
| ------------------------------------------------------ | ----------------------------- | --------------------------------- |
| サマリー値が 0 の場合に "0" を表示する                 | `SummaryCard.test.tsx`        | "0" テキストの表示                |
| サマリー値が 999,999 以上の場合にフォーマット表示する  | `SummaryCard.test.tsx`        | カンマ区切り表示                  |
| トレンドデータが空配列の場合にチャートプレースホルダー | `UsageChart.test.tsx`         | "データなし" メッセージの表示     |
| 期間選択で全期間オプションを切替える                   | `AnalyticsDashboard.test.tsx` | 各期間（7d/30d/90d/1y）での再取得 |

### Task 3: 異常系テスト追加

**目的**: IPC エラー・タイムアウト・ネットワークエラーのハンドリングを検証する。

#### 3-1: IPC エラーテスト（全ビュー共通パターン）

| テストケース                                 | 対象 hooks                    | 検証内容                                 |
| -------------------------------------------- | ----------------------------- | ---------------------------------------- |
| `skill:chain:list` がエラーを返す場合        | `useChainEditor.test.ts`      | error state 設定、エラーバナー表示       |
| `skill:chain:save` がエラーを返す場合        | `useChainEditor.test.ts`      | error state 設定、保存失敗メッセージ     |
| `skill:chain:execute` がタイムアウトする場合 | `useChainEditor.test.ts`      | タイムアウトエラーメッセージ             |
| `skill:schedule:list` がエラーを返す場合     | `useScheduleList.test.ts`     | error state 設定、エラーバナー表示       |
| `skill:schedule:toggle` がエラーを返す場合   | `useScheduleList.test.ts`     | error state 設定、トグル状態ロールバック |
| `skill:debug:start` がエラーを返す場合       | `useDebugSession.test.ts`     | error state 設定、セッション未開始       |
| `skill:debug:event` の接続が切れる場合       | `useDebugSession.test.ts`     | 接続エラーメッセージ、リスナー解除確認   |
| `skill:analytics:summary` がエラーを返す場合 | `useAnalyticsSummary.test.ts` | error state 設定、フォールバック表示     |
| `skill:analytics:export` がエラーを返す場合  | `AnalyticsDashboard.test.tsx` | エクスポートエラーメッセージ             |

#### 3-2: 連続操作テスト

| テストケース                                     | 対象ファイル              | 検証内容                       |
| ------------------------------------------------ | ------------------------- | ------------------------------ |
| チェーン保存を連続で 2 回実行した場合            | `useChainEditor.test.ts`  | 2 回目の保存が正常に完了する   |
| スケジュールトグルを高速で連続切替した場合       | `useScheduleList.test.ts` | 最終状態の整合性               |
| デバッグセッション実行中に再度開始を試行した場合 | `useDebugSession.test.ts` | エラーメッセージまたは操作無視 |

### Task 4: アクセシビリティテスト追加

**目的**: WCAG 2.1 AA 準拠のアクセシビリティを検証する。

| テストケース                                           | 対象ファイル                  | 検証内容                                      |
| ------------------------------------------------------ | ----------------------------- | --------------------------------------------- |
| SkillChainBuilder に適切な ARIA ラベルが設定されている | `SkillChainBuilder.test.tsx`  | `role`, `aria-label` 属性の存在               |
| StepCard にフォーカスリングが表示される                | `StepCard.test.tsx`           | focus 時の `ring` クラス適用                  |
| Tab キーでステップ間を移動できる                       | `SkillChainBuilder.test.tsx`  | `tabIndex` の存在、フォーカス順序             |
| ScheduleTable のヘッダーに scope 属性がある            | `ScheduleManager.test.tsx`    | `<th scope="col">` の存在                     |
| ScheduleRow のトグルに aria-checked がある             | `ScheduleManager.test.tsx`    | `aria-checked` 属性の値                       |
| DebugControls のボタンに aria-label がある             | `DebugControls.test.tsx`      | 各ボタンの `aria-label` 値                    |
| BreakpointEditor のリストに role="list" がある         | `BreakpointEditor.test.tsx`   | `role="list"` と `role="listitem"` の存在     |
| PeriodSelector にラベルが関連付けられている            | `AnalyticsDashboard.test.tsx` | `aria-labelledby` または `<label>` の関連付け |
| SummaryCard に aria-live="polite" がある               | `SummaryCard.test.tsx`        | カウントアップ値の読み上げ対応                |

### Task 5: レスポンシブテスト追加

**目的**: 各ブレークポイントでのレイアウト変更を検証する。

| テストケース                                        | 対象ファイル                  | 検証内容                      |
| --------------------------------------------------- | ----------------------------- | ----------------------------- |
| ChainBuilder が sm 幅でカード 1 列表示になる        | `SkillChainBuilder.test.tsx`  | グリッドクラスの検証          |
| ChainBuilder が lg 幅で 3 列 + 右ペイン表示になる   | `SkillChainBuilder.test.tsx`  | グリッドクラスの検証          |
| ScheduleManager が sm 幅でカード形式表示になる      | `ScheduleManager.test.tsx`    | テーブル非表示、カード表示    |
| DebugPanel が sm 幅でタブ切替式になる               | `DebugPanel.test.tsx`         | タブ UI の存在                |
| DebugPanel が lg 幅で左右 2 ペインになる            | `DebugPanel.test.tsx`         | 左右ペインの DOM 構造         |
| AnalyticsDashboard が sm 幅で縦積みレイアウトになる | `AnalyticsDashboard.test.tsx` | flex-direction: column の検証 |

### Task 6: 追加テスト実装の品質確認

**目的**: 追加テスト全体の品質を確認する。

**確認項目**:

1. 全追加テストが Green であることを確認する
2. `userEvent` が追加テストで使用されていないことを確認する（P39 対策）
3. `runAllTimers` が追加テストで使用されていないことを確認する（P13 対策）
4. テスト間の状態共有がないことを確認する（`beforeEach` でリセット、P9 対策）

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillChainBuilder/ src/renderer/views/ScheduleManager/ src/renderer/views/DebugPanel/ src/renderer/views/AnalyticsDashboard/
```

## 参照資料

| 資料                  | パス / 参照先                                                                     |
| --------------------- | --------------------------------------------------------------------------------- |
| Phase 4 テスト仕様書  | `phase-4-test-creation.md`                                                        |
| Phase 5 実装サマリー  | `phase-5-implementation.md`                                                       |
| コード品質ルール      | `.claude/rules/02-code-quality.md`                                                |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`（P9, P13, P39, P41, P47）                    |
| アクセシビリティ基準  | `.claude/rules/01-architecture.md#アクセシビリティ`                               |
| aiworkflow テスト規約 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| aiworkflow a11y規約   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |
| aiworkflow IPC契約    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |

## 実行手順

### Step 1: カバレッジ測定

1. 4 ビューそれぞれのカバレッジを測定する（Task 1 のコマンド）
2. 測定結果を `outputs/phase-6/test-expansion-report.md` に記録する
3. 不足箇所（Line/Branch/Function の未カバー行）を特定する

### Step 2: 境界値テスト追加

1. Task 2 の全テストケースを既存テストファイルに追加する
2. 追加テストが Green であることを確認する

### Step 3: 異常系テスト追加

1. Task 3 の IPC エラーテストを各 hooks テストに追加する
2. 連続操作テストを追加する
3. 追加テストが Green であることを確認する

### Step 4: アクセシビリティテスト追加

1. Task 4 の ARIA テストを各コンポーネントテストに追加する
2. 追加テストが Green であることを確認する

### Step 5: レスポンシブテスト追加

1. Task 5 のレスポンシブテストを各コンポーネントテストに追加する
2. 追加テストが Green であることを確認する

### Step 6: 全体テスト確認

1. 全テストを実行し、Green であることを確認する（Task 6 のコマンド）
2. `outputs/phase-6/test-expansion-report.md` を更新する

## 統合テスト連携【必須】

| 連携観点         | 反映内容                                                                    | 次Phaseへの受け渡し        |
| ---------------- | --------------------------------------------------------------------------- | -------------------------- |
| Phase 5 実装差分 | 未カバー分岐の補完テストを追加する                                          | Phase 7 カバレッジ測定対象 |
| IPC契約          | `skill:schedule:*`, `skill:debug:*`, `skill:analytics:*` の異常系を追加する | Phase 10 最終レビュー証跡  |
| a11y契約         | ARIA/キーボードの自動テストを追加する                                       | Phase 11 手動テスト観点    |
| レスポンシブ契約 | ブレークポイント切替の自動テストを追加する                                  | Phase 11 手動テスト観点    |

## 成果物

| 成果物             | パス                                       |
| ------------------ | ------------------------------------------ |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` |
| 追加テスト         | 既存テストファイルへの追加（16 ファイル）  |

## 完了条件

- [ ] 現状カバレッジが測定・記録されている
- [ ] 境界値テストが全 4 ビューに対して追加されている（17 テスト以上）
- [ ] IPC エラーハンドリングテストが全チャネルに対して存在する（9 テスト以上）
- [ ] 連続操作テストが追加されている（3 テスト以上）
- [ ] アクセシビリティテスト（ARIA、キーボード操作）が追加されている（9 テスト以上）
- [ ] レスポンシブテスト（sm/md/lg ブレークポイント）が追加されている（6 テスト以上）
- [ ] 全テストが Green 状態である
- [ ] `userEvent` が全テストで未使用である（P39 対策）
- [ ] `runAllTimers` が全テストで未使用である（P13 対策）
- [ ] テスト間の状態リークがない（P9 対策）
- [ ] `outputs/phase-6/test-expansion-report.md` が作成されている

## 次 Phase

Phase 7（カバレッジ確認）へ進む。カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を確認する。未達の場合は本 Phase に戻り追加テストを作成する。
