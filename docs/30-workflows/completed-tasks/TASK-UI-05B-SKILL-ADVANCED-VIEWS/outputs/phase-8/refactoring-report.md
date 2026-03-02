# Phase 8 リファクタリングレポート

## 概要

TASK-UI-05B（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）の4ビューに対して、以下のリファクタリングを実施した。

- 共通カスタムHookの抽出（useIPCQuery / useIPCMutation）
- 共通コンポーネントパターンの統一（ErrorDisplay拡張）
- CSS変数へのアニメーション値統一

---

## Task 1: 共通カスタムHookの抽出

### 問題

4ビューのHookで以下のIPCデータ取得パターンが繰り返されていた:

```typescript
const [data, setData] = useState<T | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetch = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await window.electronAPI.xxx();
    setData(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : "...");
  } finally {
    setIsLoading(false);
  }
}, []);

useEffect(() => {
  fetch();
}, [fetch]);
```

**発見箇所**: useChainList, useScheduleManager, useDebugSession, useAnalyticsSummary, useAnalyticsTrend, useSkillStats（計6 Hook）

### 解決

以下の2つの共通Hookを作成した:

#### useIPCQuery

- パス: `apps/desktop/src/renderer/hooks/useIPCQuery.ts`
- 目的: IPC経由のデータ取得パターンを共通化
- インターフェース:

```typescript
export function useIPCQuery<T>(
  fetcher: () => Promise<T>,
  options?: { immediate?: boolean },
): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};
```

#### useIPCMutation

- パス: `apps/desktop/src/renderer/hooks/useIPCMutation.ts`
- 目的: IPC経由の更新操作パターンを共通化
- インターフェース:

```typescript
export function useIPCMutation<TInput, TOutput>(
  mutator: (input: TInput) => Promise<TOutput>,
): {
  mutate: (input: TInput) => Promise<TOutput | null>;
  isLoading: boolean;
  error: string | null;
};
```

### テスト

- `apps/desktop/src/renderer/hooks/__tests__/useIPCQuery.test.ts`: 7テスト PASS
- `apps/desktop/src/renderer/hooks/__tests__/useIPCMutation.test.ts`: 4テスト PASS

### 既存Hookへの適用判断

既存の6 Hookは各ビュー固有のビジネスロジック（楽観的更新、ソート、フィルタ等）を含むため、**共通Hookへの直接リファクタリングは行わなかった**。共通Hookは今後の新規ビュー開発時のベースラインとして活用する設計とした。

---

## Task 2: 共通コンポーネントパターンの統一

### 分析結果

| ビュー             | EmptyState (atoms)       | Spinner (atoms)  | ErrorDisplay (atoms)          |
| ------------------ | ------------------------ | ---------------- | ----------------------------- |
| SkillChainBuilder  | 使用                     | 使用             | **独自実装** -> **統一済**    |
| ScheduleManager    | 使用                     | 使用             | 使用                          |
| DebugPanel         | 不使用（特殊UI）         | 不使用（特殊UI） | 使用                          |
| AnalyticsDashboard | 不使用（データあり前提） | 使用             | **独自実装**（RefreshCw付き） |

### 実施した統一

#### ErrorDisplay コンポーネントの拡張

SkillChainBuilderが独自のエラー表示を持っていたため、ErrorDisplay atomに`onRetry`プロパティを追加した。

- パス: `apps/desktop/src/renderer/components/atoms/ErrorDisplay/index.tsx`
- 追加プロパティ:
  - `onRetry?: () => void` - リトライボタンのクリックハンドラ
  - `retryLabel?: string` - リトライボタンのラベル（デフォルト: "再試行"）

#### SkillChainBuilderのエラー表示統一

- 独自の `<Icon name="alert-circle">` + `<Button>` パターンを `<ErrorDisplay onRetry={refetch}>` に置換
- `viewStyles.errorContainer` を削除（不要になったため）

#### 統一しなかった箇所と理由

- **DebugPanel**: デバッグパネルのUIは特殊（セッション未開始時のダイアログ表示等）であり、EmptyState/Spinnerの適用は不適切
- **AnalyticsDashboard**: エラー表示に更新ボタン（RefreshCw）付きの独自UIがあるが、これは複数データソースの一括再取得という特殊要件のため、ErrorDisplayのonRetryとは異なるUX

### テスト

- ErrorDisplay: 8テスト PASS（onRetry関連4テスト追加）

---

## Task 3: CSS変数への統一

### 問題

4ビューのコンポーネントでTailwind CSSのハードコードされたduration値が使用されていた:

- `duration-150`: 13箇所
- `duration-200`: 13箇所

tokens.cssには既にアニメーション用CSS変数が定義されていた:

- `--duration-fast: 100ms`
- `--duration-default: 200ms`
- `--duration-normal: 300ms`

しかし、150msに対応する変数が存在しなかった。

### 解決

#### 1. CSS変数の追加

`apps/desktop/src/renderer/styles/tokens.css` に `--duration-quick: 150ms` を追加:

```css
--duration-fast: 100ms;
--duration-quick: 150ms; /* 新規追加 */
--duration-default: 200ms;
--duration-normal: 300ms;
```

#### 2. ハードコード値の置換

| 変更前         | 変更後                               | 箇所数 |
| -------------- | ------------------------------------ | ------ |
| `duration-150` | `duration-[var(--duration-quick)]`   | 13箇所 |
| `duration-200` | `duration-[var(--duration-default)]` | 13箇所 |

#### 変更対象ファイル一覧

**SkillChainBuilder** (5ファイル):

- `index.tsx` (1箇所)
- `components/ChainCard.tsx` (2箇所)
- `components/ChainEditor.tsx` (1箇所)
- `components/VariableEditor.tsx` (1箇所)
- `components/StepCard.tsx` (3箇所)

**ScheduleManager** (2ファイル):

- `components/ScheduleDialog.tsx` (1箇所)
- `components/ScheduleRow.tsx` (5箇所)

**DebugPanel** (3ファイル):

- `components/StepHistoryItem.tsx` (1箇所)
- `components/DebugToolbar.tsx` (7箇所)
- `components/EvaluateConsole.tsx` (1箇所)

**AnalyticsDashboard** (5ファイル):

- `index.tsx` (2箇所)
- `components/ExportButton.tsx` (3箇所)
- `components/SkillStatsTable.tsx` (1箇所)
- `components/PeriodSelector.tsx` (1箇所)
- `components/SkillStatsRow.tsx` (1箇所)
- `components/SummaryCard.tsx` (1箇所)

---

## Task 4: テスト Green 確認

### 実行コマンド

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/views/SkillChainBuilder/ \
  src/renderer/views/ScheduleManager/ \
  src/renderer/views/DebugPanel/ \
  src/renderer/views/AnalyticsDashboard/
```

### 結果

```
Test Files  19 passed (19)
     Tests  188 passed (188)
  Duration  15.96s
```

### 追加テスト

```
Test Files  3 passed (3)
     Tests  19 passed (19)
```

- `useIPCQuery.test.ts`: 7テスト PASS
- `useIPCMutation.test.ts`: 4テスト PASS
- `ErrorDisplay.test.tsx`: 8テスト PASS

### 合計

- **テストファイル: 22 passed (22)**
- **テストケース: 207 passed (207)**
- **失敗: 0**

---

## 変更ファイル一覧

### 新規作成

| ファイル                                                           | 種別     |
| ------------------------------------------------------------------ | -------- |
| `apps/desktop/src/renderer/hooks/useIPCQuery.ts`                   | 共通Hook |
| `apps/desktop/src/renderer/hooks/useIPCMutation.ts`                | 共通Hook |
| `apps/desktop/src/renderer/hooks/__tests__/useIPCQuery.test.ts`    | テスト   |
| `apps/desktop/src/renderer/hooks/__tests__/useIPCMutation.test.ts` | テスト   |

### 修正

| ファイル                                                                                 | 変更内容                            |
| ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/renderer/components/atoms/ErrorDisplay/index.tsx`                      | onRetry/retryLabel追加、CSS変数使用 |
| `apps/desktop/src/renderer/components/atoms/ErrorDisplay/ErrorDisplay.test.tsx`          | onRetryテスト追加                   |
| `apps/desktop/src/renderer/styles/tokens.css`                                            | --duration-quick追加                |
| `apps/desktop/src/renderer/views/SkillChainBuilder/index.tsx`                            | ErrorDisplay使用、CSS変数化         |
| `apps/desktop/src/renderer/views/SkillChainBuilder/__tests__/SkillChainBuilder.test.tsx` | 正規表現マッチに修正                |
| `apps/desktop/src/renderer/views/SkillChainBuilder/components/ChainCard.tsx`             | CSS変数化                           |
| `apps/desktop/src/renderer/views/SkillChainBuilder/components/ChainEditor.tsx`           | CSS変数化                           |
| `apps/desktop/src/renderer/views/SkillChainBuilder/components/VariableEditor.tsx`        | CSS変数化                           |
| `apps/desktop/src/renderer/views/SkillChainBuilder/components/StepCard.tsx`              | CSS変数化                           |
| `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx`          | CSS変数化                           |
| `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleRow.tsx`             | CSS変数化                           |
| `apps/desktop/src/renderer/views/DebugPanel/components/StepHistoryItem.tsx`              | CSS変数化                           |
| `apps/desktop/src/renderer/views/DebugPanel/components/DebugToolbar.tsx`                 | CSS変数化                           |
| `apps/desktop/src/renderer/views/DebugPanel/components/EvaluateConsole.tsx`              | CSS変数化                           |
| `apps/desktop/src/renderer/views/AnalyticsDashboard/index.tsx`                           | CSS変数化                           |
| `apps/desktop/src/renderer/views/AnalyticsDashboard/components/ExportButton.tsx`         | CSS変数化                           |
| `apps/desktop/src/renderer/views/AnalyticsDashboard/components/SkillStatsTable.tsx`      | CSS変数化                           |
| `apps/desktop/src/renderer/views/AnalyticsDashboard/components/PeriodSelector.tsx`       | CSS変数化                           |
| `apps/desktop/src/renderer/views/AnalyticsDashboard/components/SkillStatsRow.tsx`        | CSS変数化                           |
| `apps/desktop/src/renderer/views/AnalyticsDashboard/components/SummaryCard.tsx`          | CSS変数化                           |
