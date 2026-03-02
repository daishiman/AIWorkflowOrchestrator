# 実装ガイド: SkillAnalysisView

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-10A-B                            |
| 機能名   | SkillAnalysisView（スキル分析ビュー） |
| 作成日   | 2026-03-02                            |
| 更新日   | 2026-03-02                            |
| 状態     | implemented（実装完了）               |

---

## Part 1: やさしい概念説明

### スキル分析ビューってなに？

テストの答案返却を想像してみてください。

テストを受けた後（＝スキルの分析を実行した後）、先生から答案が返ってきます。そこには：

1. **採点結果（スコア）**: 100点満点で何点だったか、科目ごとの点数も分かる
2. **先生からのアドバイス（改善提案）**: 「ここを直すともっと良くなるよ」という具体的な提案
3. **注意点（リスク情報）**: 「この部分は間違えやすいから気をつけて」という警告

スキル分析ビューは、AIのスキル（お手伝いの方法を書いた指示書）を「採点」して、「アドバイス」を出してくれる画面です。

### 3つの表示パーツ

| パーツ名       | 例えると         | 何を表示するか                                 |
| -------------- | ---------------- | ---------------------------------------------- |
| ScoreDisplay   | 成績表           | 総合スコア（大きな数字）とカテゴリ別の棒グラフ |
| SuggestionList | 先生のアドバイス | 改善提案のリスト（チェックを入れて選べる）     |
| RiskPanel      | 注意書き         | 気をつけるべきポイント（危険度別に色分け）     |

### 改善の流れ

```
分析を実行 → 結果を確認 → アドバイスを選ぶ → 改善を適用 → もう一度分析
```

1回目のテスト（分析）で60点だったスキルも、アドバイスに従って改善すれば、2回目のテスト（再分析）では80点に上がるかもしれません。全部のアドバイスを一気に適用する「全自動改善」ボタンもあります。

### なぜ分析が必要か

スキルは人間が書いた「指示書」です。分かりにくい表現や、足りない情報があるかもしれません。分析を使うと、AIが自動的にチェックして、改善点を教えてくれます。

### 色の意味

テストの成績と同じように、点数によって色が変わります：

- **緑（80点以上）**: 優秀。この調子をキープしよう
- **橙（60〜79点）**: まあまあ。改善すればもっと良くなる
- **赤（59点以下）**: 要注意。アドバイスに従って改善しよう

---

## Part 2: 技術者向け実装詳細

### コンポーネント構成

```
SkillAnalysisView (organisms)
├── useSkillAnalysis (custom hook) — 状態管理・API呼び出し
├── ScoreDisplay (molecules)
│   ├── OverallScore (内部) — 総合スコア数値表示
│   └── CategoryBar (内部) — カテゴリ別プログレスバー
├── SuggestionList (molecules)
│   └── SuggestionItem (内部 memo) — 個別提案チェックボックス
└── RiskPanel (molecules)
    └── RiskCard (内部 memo) — 個別リスクカード
```

### ファイル配置

| ファイル              | パス                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| SkillAnalysisView.tsx | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`     |
| ScoreDisplay.tsx      | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`          |
| SuggestionList.tsx    | `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`        |
| RiskPanel.tsx         | `apps/desktop/src/renderer/components/skill/RiskPanel.tsx`             |
| useSkillAnalysis.ts   | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` |
| 共有型定義            | `packages/shared/src/types/skill-improver.ts`                          |

### TypeScript インターフェース（実装済み）

型定義は `@repo/shared/types/skill-improver` から import される。

```typescript
interface SkillAnalysis {
  skillName: string;
  overallScore: number; // 0-100
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
  analyzedAt?: Date;
}

interface AnalysisCategory {
  name: string;
  score: number; // 0-100
  details: string;
  issues: string[];
}

interface Suggestion {
  type: "prompt" | "structure" | "documentation" | "security" | "performance";
  priority: "high" | "medium" | "low";
  description: string;
  autoFixable: boolean;
  targetPath?: string;
  suggestedFix?: string;
}

interface Risk {
  category: "security" | "compatibility" | "performance" | "maintenance";
  level: "critical" | "high" | "medium" | "low";
  description: string;
  impact: string;
  mitigation?: string;
}

interface ImprovementResult {
  skillName: string;
  applied: AppliedImprovement[];
  skipped: Suggestion[];
  errors: Array<{ suggestion: Suggestion; error: string }>;
  backupPath?: string;
  executedAt: Date;
}
```

### Props API（実装済み）

```typescript
// SkillAnalysisView（organism）
interface SkillAnalysisViewProps {
  skillName: string; // 分析対象のスキル名
  onClose: () => void; // ビューを閉じるコールバック
}

// ScoreDisplay（molecule）
interface ScoreDisplayProps {
  analysis: SkillAnalysis; // スキル分析結果
}

// SuggestionList（molecule）
interface SuggestionListProps {
  suggestions: Suggestion[]; // 改善提案の配列
  selected: Set<number>; // 選択済みインデックスのSet
  onToggle: (index: number) => void; // 選択トグルコールバック
}

// RiskPanel（molecule）
interface RiskPanelProps {
  risks: Risk[]; // リスク情報の配列
}
```

### useSkillAnalysis カスタムフック

SkillAnalysisView のビジネスロジックを分離したカスタムフック。

```typescript
interface UseSkillAnalysisReturn {
  analysis: SkillAnalysis | null; // 分析結果（未取得時はnull）
  isAnalyzing: boolean; // 分析中フラグ
  isImproving: boolean; // 改善適用中フラグ
  selectedSuggestions: Set<number>; // 選択された提案のインデックスSet
  error: string | null; // エラーメッセージ（エラーなし時はnull）
  handleAnalyze: () => Promise<void>; // 分析を手動実行
  handleToggleSuggestion: (index: number) => void; // 提案の選択トグル
  handleApplySelected: () => Promise<void>; // 選択した提案を適用
  handleAutoImprove: () => Promise<void>; // 全自動改善を実行
}
```

**動作フロー:**

1. マウント時に `handleAnalyze()` を自動実行（`useEffect`）
2. 分析結果を `analysis` state に保存
3. ユーザーが提案をチェックボックスで選択
4. 「選択を適用」ボタンで `handleApplySelected()` → 適用後に自動再分析
5. 「全自動改善」ボタンで `handleAutoImprove()` → `window.confirm` 確認後に実行 → 自動再分析

### IPC API シグネチャ（実装済み）

```typescript
// 分析実行
window.electronAPI.skill.analyze(skillName: string): Promise<SkillAnalysis>

// 選択改善適用
window.electronAPI.skill.applyImprovements(
  skillName: string,
  suggestions: Suggestion[],
): Promise<ImprovementResult>

// 全自動改善
window.electronAPI.skill.autoImprove(skillName: string): Promise<ImprovementResult>
```

#### 使用例

```typescript
// useSkillAnalysis.ts 内の実装パターン
const handleAnalyze = useCallback(async () => {
  setIsAnalyzing(true);
  setError(null);
  try {
    const result = await window.electronAPI.skill.analyze(skillName);
    setAnalysis(result);
    setSelectedSuggestions(new Set());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "分析中にエラーが発生しました";
    setError(message);
    setAnalysis(null);
  } finally {
    setIsAnalyzing(false);
  }
}, [skillName]);
```

### エラーハンドリング

| エラーケース      | 対処                                                       |
| ----------------- | ---------------------------------------------------------- |
| 分析API例外       | `role="alert"` でエラーメッセージ表示、再試行ボタン提供    |
| Error以外の例外   | デフォルトメッセージ「分析中にエラーが発生しました」を表示 |
| 空データ          | SuggestionList: 「改善提案はありません」表示               |
|                   | RiskPanel: 「リスクは検出されていません」表示              |
|                   | ScoreDisplay: カテゴリなし時にカテゴリセクション非表示     |
| 改善適用API例外   | エラー後にボタンを再度有効化（isImproving=false）          |
| 全自動改善API例外 | エラー後にボタンを再度有効化（isImproving=false）          |
| confirmキャンセル | `window.confirm` で false 返却時は API を呼ばない          |

### variantStyles Record定数（P47準拠）

テストからも import して検証できるよう、モジュールスコープで export している。

```typescript
// ScoreDisplay.tsx
export const scoreVariantStyles: Record<ScoreVariant, string> = {
  success: "text-[var(--status-success)]",
  warning: "text-[var(--status-warning)]",
  error: "text-[var(--status-error)]",
};

export const scoreBarStyles: Record<ScoreVariant, string> = {
  success: "bg-[var(--status-success)]",
  warning: "bg-[var(--status-warning)]",
  error: "bg-[var(--status-error)]",
};

// SuggestionList.tsx
export const priorityStyles: Record<PriorityVariant, string> = {
  high: "text-[var(--status-error)] bg-[var(--status-error)]/10",
  medium: "text-[var(--status-warning)] bg-[var(--status-warning)]/10",
  low: "text-[var(--status-info)] bg-[var(--status-info)]/10",
};

// RiskPanel.tsx
export const riskLevelStyles: Record<RiskLevelVariant, string> = {
  critical:
    "border-l-4 border-l-[var(--status-error)] bg-[var(--status-error)]/5",
  high: "border-l-4 border-l-[var(--status-warning)] bg-[var(--status-warning)]/5",
  medium: "border-l-4 border-l-[var(--status-info)] bg-[var(--status-info)]/5",
  low: "border-l-4 border-l-[var(--border-primary)] bg-[var(--bg-secondary)]",
};
```

### 設定可能なパラメータ

| パラメータ             | デフォルト値 | 説明                 |
| ---------------------- | ------------ | -------------------- |
| SCORE_HIGH_THRESHOLD   | 80           | 成功色を適用する閾値 |
| SCORE_MEDIUM_THRESHOLD | 60           | 警告色を適用する閾値 |

### テスト情報

| テストファイル             | テスト数 | カバレッジ（Line / Branch / Function）        |
| -------------------------- | -------- | --------------------------------------------- |
| SkillAnalysisView.test.tsx | 31       | 100% / 95.83% / 100%                          |
| ScoreDisplay.test.tsx      | 17       | 100% / 100% / 100%                            |
| SuggestionList.test.tsx    | 14       | 100% / 100% / 100%                            |
| RiskPanel.test.tsx         | 10       | 100% / 100% / 100%                            |
| **合計**                   | **72**   | **Line 100% / Branch 95.83% / Function 100%** |
