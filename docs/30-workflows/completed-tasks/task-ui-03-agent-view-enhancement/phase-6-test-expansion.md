# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 6                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-07             |

## 目的

Phase 5 の実装に対してテストを拡充し、カバレッジ目標を達成する。Phase 4 で作成したテストで不足するカバレッジ領域（境界値、エラーケース、組み合わせ、コンポーネント間連携）を特定し、追加テストを作成する。

## 実行タスク

- カバレッジ分析: Phase 4/5 のテスト実行結果からカバレッジ不足領域を特定
- 境界値テスト追加: 各コンポーネントのエッジケーステスト
- エラーケーステスト追加: 異常系の動作検証テスト
- 組み合わせテスト追加: 状態の組み合わせによる動作検証
- コンポーネント間連携テスト: SkillChip -> ExecuteButton -> FloatingExecutionBar の連携

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 参照資料

| 資料名                 | パス                                                                                                                                  | 説明                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 4 テスト作成     | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-4-test-creation.md`                                        | 既存テストケース定義     |
| Phase 5 実装           | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-5-implementation.md`                                       | 実装コード・Props定義    |
| 元タスク仕様書         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058a-ui-03-agent-view-enhancement.md` | テスト計画・完了条件     |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                               | UIコンポーネント設計仕様 |
| 機能コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                       | 機能コンポーネント仕様   |
| UIアーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                             | UIアーキテクチャ設計     |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                          | Zustand状態管理設計      |

## 実行手順

### ステップ1: カバレッジ測定

Phase 5 完了後のカバレッジを測定し、不足領域を特定する。

```bash
# カバレッジ測定（P40対策: 対象パッケージのディレクトリから実行）
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/organisms/AgentView/
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/AgentView/
cd apps/desktop && pnpm vitest run --coverage src/renderer/store/slices/agentSlice.ts
```

### ステップ2: ギャップ分析

カバレッジレポートから未到達の行/分岐/関数を特定し、以下のカテゴリで整理する:

- 未到達の条件分岐（Branch Coverage 不足）
- 未テストの関数（Function Coverage 不足）
- 未到達のコード行（Line Coverage 不足）

### ステップ3: SkillChip 追加テスト

| テストケース                           | カテゴリ         | 検証内容                                                              |
| -------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| displayName が長文の場合のトランケート | 境界値           | 20文字以上の displayName が末尾「...」付きで省略表示される            |
| skillName が空文字列                   | 境界値           | 空文字列の skillName でもクラッシュしない                             |
| 複数チップの同時選択防止               | 組み合わせ       | radiogroup 内で1つだけ選択されること                                  |
| isDisabled + isSelected の組み合わせ   | 組み合わせ       | 無効かつ選択済みの場合のスタイル表示                                  |
| キーボード操作（Enter/Space）          | アクセシビリティ | `fireEvent.keyDown(Enter)` / `fireEvent.keyDown(Space)` -> `onSelect` |

### ステップ4: ExecuteButton 追加テスト

| テストケース                    | カテゴリ   | 検証内容                                            |
| ------------------------------- | ---------- | --------------------------------------------------- |
| isExecuting=true でボタン非表示 | 組み合わせ | 実行中はボタンが DOM に存在しない / hidden          |
| selectedSkillName が空文字列    | 境界値     | 空文字列は null と同じ扱い（disabled）              |
| 連続クリックの防止              | エラー     | 短時間の連続クリックで onExecute が複数回呼ばれない |

### ステップ5: FloatingExecutionBar 追加テスト

| テストケース                  | カテゴリ | 検証内容                                                   |
| ----------------------------- | -------- | ---------------------------------------------------------- |
| idle 状態で非表示             | 境界値   | `status="idle"` -> コンポーネントが DOM に不在             |
| failed 状態の表示             | エラー   | `status="failed"` -> 「失敗」テキスト + 赤色表示           |
| progress=0 の表示             | 境界値   | `progress=0` -> プログレスバーが 0% 表示                   |
| progress=100 の表示           | 境界値   | `progress=100` -> プログレスバーが 100% 表示               |
| progress 未指定時             | 境界値   | `progress` prop なし -> プログレスバー非表示 or 不確定表示 |
| startedAt=null の経過時間表示 | 境界値   | `startedAt=null` -> 経過時間表示なし / "0:00"              |

### ステップ6: AdvancedSettingsPanel 追加テスト

| テストケース                           | カテゴリ         | 検証内容                                             |
| -------------------------------------- | ---------------- | ---------------------------------------------------- |
| models が空配列の場合                  | 境界値           | モデルリストが空でもパネルがクラッシュしない         |
| selectedProviderId/ModelId が null     | 境界値           | 未選択状態の表示                                     |
| 背景オーバーレイクリックで閉じる       | 組み合わせ       | オーバーレイクリック -> `onClose` 呼び出し           |
| ヘルスステータスバッジの色表示         | 組み合わせ       | healthy=緑, degraded=黄, unavailable=赤, unknown=灰  |
| rememberedCount=0 でリセットボタン無効 | 境界値           | 記憶件数0件の場合、リセットボタンが disabled         |
| アクセシビリティ: radiogroup のラベル  | アクセシビリティ | `role="radiogroup"` + `aria-label="AIの種類"` の確認 |

### ステップ7: RecentExecutionList 追加テスト

| テストケース                   | カテゴリ   | 検証内容                          |
| ------------------------------ | ---------- | --------------------------------- |
| maxItems=1 で1件のみ表示       | 境界値     | カスタム maxItems が反映される    |
| cancelled ステータスの表示     | 組み合わせ | cancelled -> 適切なアイコン表示   |
| startedAt が現在時刻に近い場合 | 境界値     | 「たった今」または「1分前」の表示 |
| startedAt が24時間以上前       | 境界値     | 「1日前」の表示                   |
| duration が null の場合        | 境界値     | 経過時間表示なし                  |

### ステップ8: AgentView 連携テスト追加

| テストケース                                        | カテゴリ           | 検証内容                                               |
| --------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| SkillChip 選択 -> ExecuteButton 有効化              | コンポーネント連携 | SkillChip クリック後に ExecuteButton が enabled になる |
| ExecuteButton クリック -> FloatingExecutionBar 表示 | コンポーネント連携 | 実行開始後に FloatingExecutionBar が表示される         |
| FloatingExecutionBar 停止 -> 実行停止               | コンポーネント連携 | 停止ボタンクリック後に実行が停止される                 |
| 歯車アイコン -> AdvancedSettingsPanel -> 閉じる     | コンポーネント連携 | パネルの開閉フロー全体                                 |
| SkillChip フィルタリング（11個以上）                | コンポーネント連携 | 検索バーに入力 -> SkillChip がフィルタリングされる     |

### ステップ9: agentSlice 追加テスト

| テストケース                                       | カテゴリ | 検証内容                                           |
| -------------------------------------------------- | -------- | -------------------------------------------------- |
| addExecutionToHistory: 同一 executionId の重複防止 | エラー   | 同じ ID の履歴が重複追加されない                   |
| recentExecutions の初期値が空配列                  | 境界値   | Store 初期化時に recentExecutions が `[]`          |
| isAdvancedSettingsOpen の初期値が false            | 境界値   | Store 初期化時に isAdvancedSettingsOpen が `false` |

### ステップ10: テスト実行・カバレッジ再測定

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/

# カバレッジ再測定
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/organisms/AgentView/
```

## 統合テスト連携

統合テストの拡充（コンポーネント間連携カバレッジ向上）:

| テストカテゴリ       | 検証項目                                                  | 目標 |
| -------------------- | --------------------------------------------------------- | ---- |
| コンポーネント間連携 | SkillChip -> ExecuteButton -> FloatingExecutionBar の連携 | 100% |
| 状態管理連携         | agentSlice アクション -> コンポーネント表示更新           | 100% |
| IPC 連携（モック）   | skill:execute / skill:abort の呼び出し確認                | 100% |
| エラーハンドリング   | IPC 障害時のフロントエンド表示                            | 80%+ |

## 多角的チェック観点

| 観点               | 適用判断                       | チェック内容                                  |
| ------------------ | ------------------------------ | --------------------------------------------- |
| UI/UX              | フロントエンドテストのため適用 | マイクロインタラクションの一貫性テスト        |
| アクセシビリティ   | UIテストのため適用             | キーボード操作テスト（Tab/Enter/Space）の追加 |
| 状態管理           | Zustand テスト拡充のため適用   | 境界値・初期値テストの追加                    |
| エラーハンドリング | 異常系テストのため適用         | IPC 障害時の表示、不正 Props の処理           |

### Electron デスクトップアプリ観点

| 層                         | チェック内容                         |
| -------------------------- | ------------------------------------ |
| フロントエンド（Renderer） | コンポーネント間の状態伝播テスト     |
| IPC通信（モック）          | IPC 障害時のフォールバック表示テスト |

## 成果物

| 成果物                     | パス                                                                                                     | 説明                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| カバレッジレポート         | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-6/coverage-report.md` | カバレッジ分析結果           |
| SkillChip 追加テスト       | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/SkillChip.test.tsx`                  | 境界値・組み合わせテスト追加 |
| ExecuteButton 追加テスト   | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx`              | 境界値・エラーテスト追加     |
| FloatingExecutionBar 追加  | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar.test.tsx`       | 境界値テスト追加             |
| AdvancedSettingsPanel 追加 | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx`      | 境界値・組み合わせテスト追加 |
| RecentExecutionList 追加   | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/RecentExecutionList.test.tsx`        | 境界値テスト追加             |
| AgentView 連携テスト       | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx`                          | コンポーネント間連携テスト   |
| agentSlice 追加テスト      | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.extension.test.ts`                          | 境界値・エラーテスト追加     |

## 完了条件

- [ ] カバレッジ測定が完了し、不足領域が特定されている
- [ ] SkillChip 追加テスト: 5ケース追加（長文トランケート/空文字列/同時選択防止/disabled+selected/キーボード）
- [ ] ExecuteButton 追加テスト: 3ケース追加（isExecuting非表示/空文字列/連続クリック防止）
- [ ] FloatingExecutionBar 追加テスト: 6ケース追加（idle非表示/failed表示/progress 0/100/未指定/startedAt null）
- [ ] AdvancedSettingsPanel 追加テスト: 6ケース追加（空models/null選択/オーバーレイ閉じ/ヘルスバッジ/count0/radiogroup）
- [ ] RecentExecutionList 追加テスト: 5ケース追加（maxItems=1/cancelled/現在時刻近接/24時間以上前/duration null）
- [ ] AgentView 連携テスト: 5ケース追加（選択->有効化/実行->バー表示/停止/パネル開閉/フィルタリング）
- [ ] agentSlice 追加テスト: 3ケース追加（重複防止/初期値空配列/初期値false）
- [ ] 全テストが PASS
- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. カバレッジ測定・ギャップ分析
2. SkillChip 追加テスト（5ケース）
3. ExecuteButton 追加テスト（3ケース）
4. FloatingExecutionBar 追加テスト（6ケース）
5. AdvancedSettingsPanel 追加テスト（6ケース）
6. RecentExecutionList 追加テスト（5ケース）
7. AgentView 連携テスト（5ケース）
8. agentSlice 追加テスト（3ケース）
9. カバレッジ再測定・レポート作成
10. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
