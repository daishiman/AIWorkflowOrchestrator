# 実装ガイド（TASK-UI-05B-SKILL-ADVANCED-VIEWS）

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | TASK-UI-05B-SKILL-ADVANCED-VIEWS          |
| Phase    | 12 - ドキュメント                         |
| 作成日   | 2026-03-02                                |
| 実装規模 | コンポーネント34個、Hook 8個、テスト143件 |

---

## Part 1: 中学生向けの説明（日常のたとえ）

### この機能は何をする？

AIWorkflowOrchestrator のデスクトップアプリに「スキル（AI の道具）」をより便利に使うための **4つの専用画面** を追加しました。

---

### 1. SkillChainBuilder（スキルチェーンビルダー）= 「料理のレシピ手順書」

料理では「野菜を切る → 炒める → 味つけする」という順番の手順書があります。
SkillChainBuilder はこれと同じで、**AI の道具（スキル）を順番につないで自動実行する「手順書」を作る画面** です。

- **手順書（チェーン）の一覧**: 作成済みのレシピを一覧で確認できます。検索で素早く探せます。
- **手順書の編集（ChainEditor）**: どのスキルをどの順番で実行するかを追加・削除・並べ替えできます。
- **材料（変数）の設定**: 手順書全体で使い回す材料（変数）を設定できます。
- **試し調理（実行）**: 手順書通りに実際に動かして、結果を確認できます。

「料理の手順書」を作れば、毎回同じ手順を繰り返す必要がなくなるのと同じように、チェーンを一度作れば繰り返し実行できます。

---

### 2. ScheduleManager（スケジュールマネージャー）= 「目覚まし時計」

目覚まし時計は「毎朝7時に鳴らす」と設定すれば、自分が何もしなくても自動で鳴ります。
ScheduleManager はこれと同じで、**「毎日9時にこのスキルを動かす」という設定を管理する画面** です。

- **スケジュール一覧**: 設定した「自動実行の約束」を一覧で確認できます。
- **新規作成**: いつ（Cron形式で設定）、どのスキルを動かすか設定します。
- **有効/無効**: 一時的に止めたい目覚ましのように、スイッチ一つでオン/オフできます。
- **実行履歴**: 「昨日ちゃんと鳴ったか？」を確認できます。

Cron形式は「毎分・毎時・毎日・毎週・毎月」などの細かい時間指定ができる専門的な記述方法です。

---

### 3. DebugPanel（デバッグパネル）= 「探偵の捜査ノート」

探偵が事件を調べるとき、「まず証拠A、次に証拠B、そしてC…」と一歩ずつ確認しながら進みます。
DebugPanel はこれと同じで、**スキルが何をしているか1ステップずつ止めながら確認できる画面** です。

- **ツールバー（捜査指示）**: 「続行」「一時停止」「1ステップ進む」「停止」のコマンドボタンがあります。
- **コードビュー（現在の証拠）**: 今どこを実行しているか確認できます。
- **変数インスペクタ（手帳）**: 今どんな値（情報）が入っているかをリアルタイムで確認できます。
- **コールスタック（行動経路）**: どの順番でどこから呼ばれたかを確認できます。
- **式評価コンソール（質問コーナー）**: 「今この変数の値は？」と自由に質問できます。
- **実行履歴（捜査記録）**: これまでに通過したステップの一覧を確認できます。

探偵が「なぜこの事件が起きたのか」を一歩ずつ追跡するように、スキルがなぜ期待通りに動かないかを追跡できます。

---

### 4. AnalyticsDashboard（分析ダッシュボード）= 「学期末の成績表」

学校の成績表は「この教科は何点、出席は何回、クラス内順位は何位」のように、学習結果を数字でまとめて見せてくれます。
AnalyticsDashboard はこれと同じで、**スキルの「使用状況と成績」を数字とグラフで確認できる画面** です。

- **サマリーカード（通知表）**: 総実行回数・利用スキル数・成功率・失敗率を一目で確認できます。
- **使用量チャート（折れ線グラフ）**: 過去7日・30日・90日・1年の使用推移をグラフで確認できます。
- **スキル別統計テーブル（教科別成績）**: 各スキルの実行回数・成功率・平均実行時間・消費トークンを比較できます。
- **エクスポート（成績表のコピー）**: 分析データをJSONまたはCSVでダウンロードできます。

「どのスキルを最もよく使っているか」「成功率が低いスキルはどれか」を確認して、改善に役立てることができます。

---

## Part 2: 開発者向け実装詳細

### 2.1 全体アーキテクチャ

4ビューはいずれも同じ設計パターンを採用しています。

```
Renderer (View) → Custom Hook → window.electronAPI.skill.* → Preload Bridge → Main Process
```

- Renderer: React コンポーネント（Atomic Design準拠）
- Custom Hook: useState + IPC呼び出しをカプセル化
- IPC Bridge: Preload の contextBridge 経由で安全に通信
- Main Process: 実際のビジネスロジック（TASK-9D/9G/9H/9Jで実装済み）

### 2.2 ビュー別実装詳細

#### SkillChainBuilder

| 要素              | ファイルパス                                                                         | 役割                         |
| ----------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| メインビュー      | `apps/desktop/src/renderer/views/SkillChainBuilder/index.tsx`                        | 一覧/編集モード切替の統合    |
| ChainCardGrid     | `apps/desktop/src/renderer/views/SkillChainBuilder/components/ChainCardGrid.tsx`     | チェーンカードのグリッド表示 |
| ChainCard         | `apps/desktop/src/renderer/views/SkillChainBuilder/components/ChainCard.tsx`         | 個別チェーンカード           |
| ChainEditor       | `apps/desktop/src/renderer/views/SkillChainBuilder/components/ChainEditor.tsx`       | チェーン詳細編集             |
| StepList          | `apps/desktop/src/renderer/views/SkillChainBuilder/components/StepList.tsx`          | ステップ一覧（リスト表示）   |
| StepCard          | `apps/desktop/src/renderer/views/SkillChainBuilder/components/StepCard.tsx`          | 個別ステップカード           |
| AddStepDialog     | `apps/desktop/src/renderer/views/SkillChainBuilder/components/AddStepDialog.tsx`     | ステップ追加ダイアログ       |
| CreateChainDialog | `apps/desktop/src/renderer/views/SkillChainBuilder/components/CreateChainDialog.tsx` | チェーン新規作成ダイアログ   |
| VariableEditor    | `apps/desktop/src/renderer/views/SkillChainBuilder/components/VariableEditor.tsx`    | 変数エディタ                 |
| useChainList      | `apps/desktop/src/renderer/views/SkillChainBuilder/hooks/useChainList.ts`            | チェーン一覧取得・削除管理   |
| useChainEditor    | `apps/desktop/src/renderer/views/SkillChainBuilder/hooks/useChainEditor.ts`          | チェーン編集状態管理         |

**モード切替ロジック**:

```typescript
// SkillChainBuilder/index.tsx
type ViewMode = "list" | "edit";
const [viewMode, setViewMode] = useState<ViewMode>("list");

// チェーン選択時に編集モードへ
const handleSelectChain = async (chainId: string) => {
  await editor.loadChain(chainId);
  setViewMode("edit");
};

// 新規作成時に編集モードへ
const handleCreateChain = (name: string, description: string) => {
  editor.initNewChain(name, description);
  setViewMode("edit");
};
```

**IPC通信パターン（useChainList）**:

```typescript
const fetchChains = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await window.electronAPI.skill.chainList();
    setChains(data);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "チェーンの取得に失敗しました",
    );
  } finally {
    setIsLoading(false);
  }
}, []);
```

#### ScheduleManager

| 要素                 | ファイルパス                                                                          | 役割                         |
| -------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| メインビュー         | `apps/desktop/src/renderer/views/ScheduleManager/index.tsx`                           | 状態管理の統合               |
| ScheduleTable        | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleTable.tsx`        | スケジュールテーブル         |
| ScheduleRow          | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleRow.tsx`          | 個別スケジュール行           |
| ScheduleDialog       | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx`       | 新規作成/編集ダイアログ      |
| ScheduleHistoryPanel | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleHistoryPanel.tsx` | 実行履歴パネル               |
| CronInput            | `apps/desktop/src/renderer/views/ScheduleManager/components/CronInput.tsx`            | Cron式入力補助コンポーネント |
| useScheduleManager   | `apps/desktop/src/renderer/views/ScheduleManager/hooks/useScheduleManager.ts`         | スケジュールCRUD管理         |

**楽観的更新パターン（useScheduleManager）**:

```typescript
// 追加：ローカル状態に即座に追加
const addSchedule = async (
  input: Omit<ScheduledSkill, "id" | "runHistory">,
) => {
  const result = await window.electronAPI.skill.scheduleAdd(input);
  setSchedules((prev) => [...prev, result]); // 楽観的に追加
};

// トグル：サーバー応答で更新
const toggleSchedule = async (id: string) => {
  const result = await window.electronAPI.skill.scheduleToggle(id);
  if (result) {
    setSchedules((prev) => prev.map((s) => (s.id === id ? result : s)));
  }
};
```

#### DebugPanel

| 要素              | ファイルパス                                                                  | 役割                            |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------- |
| メインビュー      | `apps/desktop/src/renderer/views/DebugPanel/index.tsx`                        | 2カラムレイアウト統合           |
| DebugToolbar      | `apps/desktop/src/renderer/views/DebugPanel/components/DebugToolbar.tsx`      | コマンドボタン群                |
| CodeView          | `apps/desktop/src/renderer/views/DebugPanel/components/CodeView.tsx`          | ステップ詳細表示                |
| StepHistoryList   | `apps/desktop/src/renderer/views/DebugPanel/components/StepHistoryList.tsx`   | 実行履歴リスト                  |
| StepHistoryItem   | `apps/desktop/src/renderer/views/DebugPanel/components/StepHistoryItem.tsx`   | 個別履歴アイテム                |
| VariableInspector | `apps/desktop/src/renderer/views/DebugPanel/components/VariableInspector.tsx` | 変数インスペクタ                |
| VariableItem      | `apps/desktop/src/renderer/views/DebugPanel/components/VariableItem.tsx`      | 個別変数アイテム                |
| CallStackView     | `apps/desktop/src/renderer/views/DebugPanel/components/CallStackView.tsx`     | コールスタック表示              |
| CallStackEntry    | `apps/desktop/src/renderer/views/DebugPanel/components/CallStackEntry.tsx`    | 個別コールスタックエントリ      |
| EvaluateConsole   | `apps/desktop/src/renderer/views/DebugPanel/components/EvaluateConsole.tsx`   | 式評価コンソール                |
| StartDebugDialog  | `apps/desktop/src/renderer/views/DebugPanel/components/StartDebugDialog.tsx`  | セッション開始ダイアログ        |
| useDebugSession   | `apps/desktop/src/renderer/views/DebugPanel/hooks/useDebugSession.ts`         | セッション状態管理              |
| useDebugEvents    | `apps/desktop/src/renderer/views/DebugPanel/hooks/useDebugEvents.ts`          | デバッグイベントリスナー（IPC） |

**イベント駆動の状態更新（useDebugEvents）**:

```typescript
// P5対策：useEffect のクリーンアップで二重登録を防止
export function useDebugEvents(
  sessionId: string | null,
  onEvent: (event: DebugEvent) => void,
): void {
  useEffect(() => {
    if (!sessionId) return;
    const cleanup = window.electronAPI.skill.debug.onDebugEvent(
      (event: DebugEvent) => {
        if (event.sessionId === sessionId) {
          onEvent(event); // セッションIDでフィルタリング
        }
      },
    );
    return cleanup; // アンマウント時にリスナー解除
  }, [sessionId, onEvent]);
}
```

**デバッグイベント型別処理（DebugPanel/index.tsx）**:

```typescript
const handleDebugEvent = useCallback(
  (event: DebugEvent) => {
    switch (event.type) {
      case "step": // ステップ実行時：steps配列に追加
      case "breakpoint-hit": // ブレークポイント到達時：ステータスをpausedに
      case "variable-changed": // 変数変化時：variablesオブジェクトを更新
      case "session-ended": // セッション終了時：ステータスをcompletedまたはerrorに
    }
  },
  [setSession],
);
```

#### AnalyticsDashboard

| 要素                | ファイルパス                                                                        | 役割                           |
| ------------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| メインビュー        | `apps/desktop/src/renderer/views/AnalyticsDashboard/index.tsx`                      | 3Hook統合・エクスポート処理    |
| SummaryCardGrid     | `apps/desktop/src/renderer/views/AnalyticsDashboard/components/SummaryCardGrid.tsx` | サマリーカードグリッド（4枚）  |
| SummaryCard         | `apps/desktop/src/renderer/views/AnalyticsDashboard/components/SummaryCard.tsx`     | 個別サマリーカード             |
| UsageChart          | `apps/desktop/src/renderer/views/AnalyticsDashboard/components/UsageChart.tsx`      | 使用状況チャート（recharts）   |
| SkillStatsTable     | `apps/desktop/src/renderer/views/AnalyticsDashboard/components/SkillStatsTable.tsx` | スキル別統計テーブル           |
| SkillStatsRow       | `apps/desktop/src/renderer/views/AnalyticsDashboard/components/SkillStatsRow.tsx`   | 個別統計行                     |
| PeriodSelector      | `apps/desktop/src/renderer/views/AnalyticsDashboard/components/PeriodSelector.tsx`  | 期間選択（7d/30d/90d/1y/all）  |
| ExportButton        | `apps/desktop/src/renderer/views/AnalyticsDashboard/components/ExportButton.tsx`    | JSON/CSVエクスポートボタン     |
| useAnalyticsSummary | `apps/desktop/src/renderer/views/AnalyticsDashboard/hooks/useAnalyticsSummary.ts`   | サマリーデータ管理             |
| useAnalyticsTrend   | `apps/desktop/src/renderer/views/AnalyticsDashboard/hooks/useAnalyticsTrend.ts`     | トレンドデータ管理             |
| useSkillStats       | `apps/desktop/src/renderer/views/AnalyticsDashboard/hooks/useSkillStats.ts`         | スキル別統計・ソート・フィルタ |

**PeriodPresetからAnalyticsPeriodへの変換（useAnalyticsTrend）**:

```typescript
export type PeriodPreset = "7d" | "30d" | "90d" | "1y" | "all";

function toPeriod(preset: PeriodPreset): AnalyticsPeriod {
  // granularity: "7d"/"30d"→"day", "90d"→"week", "1y"/"all"→"month"
}
```

**ソート・フィルタ管理（useSkillStats）**:

```typescript
// 同じキーをクリックした場合は方向切替
const setSortKey = useCallback(
  (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKeyState(key);
      setSortDirection("desc"); // 新規キーはdescから開始
    }
  },
  [sortKey],
);
```

### 2.3 使用技術一覧

| 技術         | バージョン | 用途                                                     |
| ------------ | ---------- | -------------------------------------------------------- |
| React        | 18.x       | UIコンポーネント構築・memo最適化                         |
| TypeScript   | 5.x        | strict: true で厳密な型チェック                          |
| Tailwind CSS | 3.x        | CSS変数ベースのデザイントークンで Apple HIG 準拠スタイル |
| lucide-react | 最新       | アイコン表示（SkillChainBuilder/AnalyticsDashboard）     |
| recharts     | 最新       | UsageChart のライン/バーチャート描画                     |
| clsx         | 最新       | 条件付きクラス名の結合                                   |

### 2.4 設計上の注意事項

#### P5対策: IPC イベントリスナーの二重登録防止

`useDebugEvents` では `window.electronAPI.skill.debug.onDebugEvent()` の戻り値（cleanup関数）を `useEffect` のクリーンアップ関数として返しています。React StrictMode での二重実行にも対応しています。

#### デザイントークン使用方針

スタイルは `--bg-primary`, `--text-primary`, `--status-primary` などの CSS変数で定義されたデザイントークンを使用します。`bg-[var(--bg-primary)]` のように Tailwind arbitrary values で指定します。Slate系の Tailwind カラーは使用しません（Apple HIG System Colors準拠）。

#### 楽観的更新とエラー状態

各Hook は `isLoading`, `error` 状態を管理し、IPC失敗時にはエラーメッセージを文字列で格納します。Renderer ではエラーメッセージを `<ErrorDisplay>` コンポーネントで表示します。

### 2.5 テスト構成

| ビュー             | テストファイル数 | テスト件数 |
| ------------------ | ---------------- | ---------- |
| SkillChainBuilder  | 5                | 約40件     |
| ScheduleManager    | 4                | 約35件     |
| DebugPanel         | 5                | 約38件     |
| AnalyticsDashboard | 5                | 約30件     |
| **合計**           | **19**           | **143件**  |

各ビューに `*.test.tsx`（正常系）と `*.boundary.test.tsx`（境界値・異常系）の2種類のテストファイルが存在します。
