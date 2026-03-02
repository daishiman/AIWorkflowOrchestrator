# Phase 4 テスト設計レポート

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-UI-05B-SKILL-ADVANCED-VIEWS            |
| Phase      | 4 - テスト作成                              |
| 作成日     | 2026-03-02                                  |
| テスト総数 | 143 テストケース / 15 テストファイル        |
| テスト方針 | TDD Red→Green→Refactor                      |
| テスト環境 | Vitest + happy-dom + @testing-library/react |

## テスト設計方針

### TDD Red→Green アプローチ

1. **Red Phase**: 実装前に全143テストケースを設計・記述し、全テストが失敗することを確認
2. **Green Phase**: 実装完了後に全テストがPASSすることを確認
3. **Refactor Phase**: テストが全PASSの状態でリファクタリングを実施

### テスト環境の選択

- **happy-dom**: Vitest のテスト環境として使用（jsdom より高速）
- **fireEvent**: happy-dom 環境では `userEvent` が Symbol エラーを起こすため `fireEvent` を使用（P39対策）
- **act()**: 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
- **recharts モック**: happy-dom 環境では SVG 描画不可のため recharts をモック化

### IPCモックパターン

全ビューのテストで以下の統一パターンを使用:

```typescript
// window.electronAPI.skill のモックセットアップ
beforeEach(() => {
  vi.clearAllMocks();
  (
    window as unknown as {
      electronAPI: { skill: typeof mockSkillAPI };
    }
  ).electronAPI = {
    skill: mockSkillAPI,
  } as unknown as typeof window.electronAPI;
});
```

## ビュー別テストケース一覧

### 1. SkillChainBuilder（47件）

| ファイル                   | テスト数 | テスト対象                                                     |
| -------------------------- | -------- | -------------------------------------------------------------- |
| SkillChainBuilder.test.tsx | 14       | メインビュー：一覧表示、ローディング、エラー、検索、モード遷移 |
| ChainEditor.test.tsx       | 15       | 編集画面：ステップ一覧、保存、実行、エラー表示、ダイアログ     |
| StepCard.test.tsx          | 12       | ステップカード：情報表示、削除、移動、条件バッジ、memo         |
| useChainList.test.ts       | 6        | Hook：データ取得、エラー処理、再取得、削除                     |

**テストカテゴリ内訳**:

- 表示系: 18件（DOM要素の存在確認、テキスト表示）
- 操作系: 16件（クリック、入力変更、モード遷移）
- 状態系: 8件（ローディング、エラー、空状態）
- Hook: 5件（データフェッチ、エラーハンドリング）

### 2. ScheduleManager（20件）

| ファイル                   | テスト数 | テスト対象                                                       |
| -------------------------- | -------- | ---------------------------------------------------------------- |
| ScheduleManager.test.tsx   | 7        | メインビュー：一覧表示、ローディング、エラー、空状態、ダイアログ |
| ScheduleTable.test.tsx     | 7        | テーブル：行表示、ヘッダー、トグル、削除、編集、履歴展開         |
| useScheduleManager.test.ts | 6        | Hook：一覧取得、追加、削除、トグル、更新                         |

**テストカテゴリ内訳**:

- 表示系: 8件
- 操作系: 7件
- 状態系: 3件
- Hook: 2件

### 3. DebugPanel（42件）

| ファイル                   | テスト数 | テスト対象                                                |
| -------------------------- | -------- | --------------------------------------------------------- |
| DebugPanel.test.tsx        | 9        | メインビュー：初期状態、セッション開始、エラー、停止確認  |
| DebugToolbar.test.tsx      | 14       | ツールバー：ボタン表示、状態別無効化、コマンド送信、a11y  |
| VariableInspector.test.tsx | 10       | 変数インスペクタ：一覧表示、展開/折りたたみ、検索、空状態 |
| useDebugSession.test.ts    | 9        | Hook：セッション開始、コマンド実行、エラー、リセット      |

**テストカテゴリ内訳**:

- 表示系: 14件
- 操作系: 13件
- 状態系: 8件
- Hook: 7件

### 4. AnalyticsDashboard（34件）

| ファイル                    | テスト数 | テスト対象                                                       |
| --------------------------- | -------- | ---------------------------------------------------------------- |
| AnalyticsDashboard.test.tsx | 11       | メインビュー：サマリー表示、ローディング、エラー、期間切替、更新 |
| SkillStatsTable.test.tsx    | 12       | 統計テーブル：データ表示、ソート、フィルタ、空状態、ローディング |
| UsageChart.test.tsx         | 6        | チャート：描画、空データ、ローディング、エラー                   |
| useAnalyticsSummary.test.ts | 5        | Hook：データ取得、エラー、再取得、ローディング                   |

**テストカテゴリ内訳**:

- 表示系: 14件
- 操作系: 9件
- 状態系: 7件
- Hook: 4件

## テスト合格基準

| 条件                     | 基準                                       |
| ------------------------ | ------------------------------------------ |
| Red Phase                | 全143テストが FAIL（テストファースト確認） |
| Green Phase              | 全143テストが PASS                         |
| テスト間独立性           | `beforeEach` で全モックをリセット          |
| テスト実行ディレクトリ   | `cd apps/desktop` から実行（P40対策）      |
| 非同期操作               | `act()` で包む（happy-dom対策）            |
| 外部コンポーネントモック | recharts、子コンポーネントをモック化       |

## テストカバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |
