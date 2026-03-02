# コンポーネント設計: SkillAnalysisView

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-B |
| 作成日   | 2026-03-02 |
| Phase    | 2          |

---

## 1. SkillAnalysisView（organism）

### Props

```typescript
interface SkillAnalysisViewProps {
  skill: ImportedSkill;
  onClose: () => void;
}
```

### 責務

- `useSkillAnalysis(skill.name)` フックの呼び出し
- マウント時に自動で `runAnalysis()` を実行
- 子コンポーネントへのprops受け渡し
- ローディング/エラー/結果表示の条件分岐レンダリング

### レンダリング条件

| 状態        | 表示内容                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| 初期/分析中 | AnalysisHeader + スケルトンローダー                                          |
| エラー      | AnalysisHeader + AnalysisError（エラーメッセージ＋再試行）                   |
| 分析完了    | AnalysisHeader + ScoreDisplay + SuggestionList + RiskPanel + AnalysisActions |
| 改善適用中  | 分析完了と同じ表示 + AnalysisActionsのボタンがdisabled＋ローディング         |

---

## 2. ScoreDisplay（molecule）

### Props

```typescript
interface ScoreDisplayProps {
  analysis: SkillAnalysis;
}
```

内部で `analysis.overallScore` と `analysis.categories` を参照する。

### 視覚仕様

- 総合スコア: 数値（大フォント、48px）+ カラーインジケータ（円形背景）
- カテゴリ別: 横並び水平バーチャート（バー高さ 8px、角丸 4px）
- 各カテゴリ: カテゴリ名、スコア値（0-100）、詳細テキスト、課題リスト
- スコア色はスコア値に応じて動的に切り替え

### scoreVariantStyles Record定数（P47準拠）

```typescript
export type ScoreVariant = "success" | "warning" | "error";

export const scoreVariantStyles: Record<ScoreVariant, string> = {
  success: "text-[var(--status-success)]",
  warning: "text-[var(--status-warning)]",
  error: "text-[var(--status-error)]",
};

export const scoreBackgroundStyles: Record<ScoreVariant, string> = {
  success: "bg-[var(--status-success)]",
  warning: "bg-[var(--status-warning)]",
  error: "bg-[var(--status-error)]",
};
```

### getScoreVariant 関数

```typescript
export function getScoreVariant(score: number): ScoreVariant {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
}
```

### ARIA属性

```html
<div
  role="progressbar"
  aria-valuenow="{overallScore}"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="{`総合スコア"
  ${overallScore}点（100点中）`}
>
  {overallScore}
</div>
```

---

## 3. SuggestionList（molecule）

### Props

```typescript
interface SuggestionListProps {
  suggestions: Suggestion[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onSelectAutoFixable: () => void;
}
```

### 視覚仕様

- 優先度グループヘッダー: セパレーター + グループ名（「高優先度 (N件)」「中優先度 (N件)」「低優先度 (N件)」）
- グループ化順序: high → medium → low
- 各提案行（SuggestionItem）:
  - チェックボックス（左端）
  - タイプアイコン（5種: prompt/structure/documentation/security/performance）
  - 優先度バッジ（priorityStylesで色分け）
  - 説明テキスト
  - 自動修正可能マーク（autoFixable=trueの場合のみ表示）
- 「自動修正可能のみ選択」ボタン: リストヘッダー右側に配置

### priorityStyles Record定数（P47準拠）

```typescript
export type SuggestionPriority = "high" | "medium" | "low";

export const priorityStyles: Record<SuggestionPriority, string> = {
  high: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  medium: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  low: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
};
```

### suggestionTypeIcons Record定数

```typescript
export type SuggestionType =
  | "prompt"
  | "structure"
  | "documentation"
  | "security"
  | "performance";

export const suggestionTypeIcons: Record<SuggestionType, string> = {
  prompt: "pencil",
  structure: "folder",
  documentation: "document",
  security: "shield",
  performance: "bolt",
};
```

### SuggestionItem（内部コンポーネント）

```typescript
interface SuggestionItemProps {
  suggestion: Suggestion;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}
```

ARIA属性:

```html
<label>
  <input
    type="checkbox"
    checked="{isSelected}"
    onChange="{onToggle}"
    aria-label="{`${suggestion.description}を選択`}"
  />
  <span>{suggestion.description}</span>
</label>
```

---

## 4. RiskPanel（molecule）

### Props

```typescript
interface RiskPanelProps {
  risks: Risk[];
}
```

### 視覚仕様

- リスク行: 左ボーダー色分け + カテゴリ表示 + レベルバッジ + 説明 + 影響 + 緩和策
- リスクが0件の場合: 「リスクは検出されませんでした」メッセージを表示
- レベル別に critical → high → medium → low の順序でソート表示

### riskLevelStyles Record定数（P47準拠）

```typescript
export type RiskLevel = "critical" | "high" | "medium" | "low";

export const riskLevelStyles: Record<RiskLevel, string> = {
  critical:
    "border-l-4 border-l-[var(--status-error)] bg-[var(--bg-secondary)]",
  high: "border-l-4 border-l-[var(--status-warning)] bg-[var(--bg-secondary)]",
  medium: "border-l-4 border-l-[var(--status-info)] bg-[var(--bg-secondary)]",
  low: "border-l-4 border-l-[var(--border-primary)] bg-[var(--bg-secondary)]",
};

export const riskLevelBadgeStyles: Record<RiskLevel, string> = {
  critical: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  high: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  medium: "bg-[var(--status-info)] text-[var(--text-inverse)]",
  low: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
};
```

### RiskItem（内部コンポーネント）

```typescript
interface RiskItemProps {
  risk: Risk;
}
```

表示項目: カテゴリ名、レベルバッジ、説明テキスト、影響範囲、緩和策（存在する場合）

---

## 5. AnalysisActions（molecule）

### Props

```typescript
interface AnalysisActionsProps {
  hasSelection: boolean;
  isImproving: boolean;
  selectedCount: number;
  onApply: () => void;
  onAutoImprove: () => void;
}
```

### ボタン仕様

| ボタン             | 表示条件                       | disabled条件           | ラベル                     |
| ------------------ | ------------------------------ | ---------------------- | -------------------------- |
| 選択した提案を適用 | `hasSelection === true` で表示 | `isImproving === true` | `選択した提案を適用 (N件)` |
| 全自動改善         | 常に表示                       | `isImproving === true` | `全自動改善`               |

- 「全自動改善」ボタンクリック時は確認ダイアログを表示（破壊的操作の保護、01-architecture.md インタラクション準拠）
- isImproving=true の間はボタン内にローディングスピナーを表示

### ARIA属性

```html
<button
  aria-label="{`選択した${selectedCount}件の提案を適用`}"
  disabled="{isImproving"
  ||
  !hasSelection}
>
  {isImproving ? <Spinner /> : `選択した提案を適用 (${selectedCount})`}
</button>

<button aria-label="全自動改善を実行" disabled="{isImproving}">
  {isImproving ? <Spinner /> : "全自動改善"}
</button>
```

---

## 6. AnalysisHeader（molecule）

### Props

```typescript
interface AnalysisHeaderProps {
  skillName: string;
  onClose: () => void;
}
```

### 表示内容

- 左端: 戻るボタン（onClose呼び出し）
- 中央: タイトル「スキル分析: {skillName}」

---

## 7. AnalysisError（molecule）

### Props

```typescript
interface AnalysisErrorProps {
  message: string;
  onRetry: () => void;
}
```

### ARIA属性

```html
<div role="alert" aria-live="assertive">
  <p>{message}</p>
  <button aria-label="分析を再試行" onClick="{onRetry}">再試行</button>
</div>
```

- `role="alert"` でスクリーンリーダーにエラー発生を即座に通知
- `aria-live="assertive"` で画面更新を即座にアナウンス

---

## 8. useSkillAnalysis カスタムフック

### インターフェース

```typescript
function useSkillAnalysis(skillName: string): UseSkillAnalysisReturn;

interface UseSkillAnalysisReturn {
  // 状態（5つのuseState）
  analysis: SkillAnalysis | null;
  isAnalyzing: boolean;
  isImproving: boolean;
  selectedSuggestions: Set<number>;
  error: string | null;

  // アクション
  runAnalysis: () => Promise<void>;
  toggleSuggestion: (index: number) => void;
  selectAutoFixable: () => void;
  applySelected: () => Promise<void>;
  autoImprove: () => Promise<void>;
  clearError: () => void;
}
```

### 各アクションの責務

| アクション          | 責務                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `runAnalysis`       | isAnalyzing=true設定、error=null、analyze API呼び出し、結果設定、selectedSuggestionsリセット |
| `toggleSuggestion`  | 指定indexのチェック状態を反転（Set操作）                                                     |
| `selectAutoFixable` | analysis.suggestionsのうちautoFixable=trueのindexのみをselectedSuggestionsに設定             |
| `applySelected`     | isImproving=true設定、選択された提案をapplyImprovements API呼び出し、完了後にrunAnalysis     |
| `autoImprove`       | isImproving=true設定、autoImprove API呼び出し、完了後にrunAnalysis                           |
| `clearError`        | error=nullに設定                                                                             |

### 内部実装（設計レベル擬似コード）

```typescript
function useSkillAnalysis(skillName: string): UseSkillAnalysisReturn {
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await window.electronAPI.skill.analyze(skillName);
      setAnalysis(result);
      setSelectedSuggestions(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  }, [skillName]);

  const toggleSuggestion = useCallback((index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const selectAutoFixable = useCallback(() => {
    if (!analysis) return;
    const indices = new Set<number>();
    analysis.suggestions.forEach((s, i) => {
      if (s.autoFixable) indices.add(i);
    });
    setSelectedSuggestions(indices);
  }, [analysis]);

  const applySelected = useCallback(async () => {
    if (!analysis) return;
    setIsImproving(true);
    try {
      const selected = Array.from(selectedSuggestions).map(
        (i) => analysis.suggestions[i],
      );
      await window.electronAPI.skill.applyImprovements(skillName, selected);
      await runAnalysis(); // 再分析で最新状態を反映
    } catch (e) {
      setError(e instanceof Error ? e.message : "改善の適用に失敗しました");
    } finally {
      setIsImproving(false);
    }
  }, [analysis, selectedSuggestions, skillName, runAnalysis]);

  const autoImprove = useCallback(async () => {
    setIsImproving(true);
    try {
      await window.electronAPI.skill.autoImprove(skillName);
      await runAnalysis(); // 再分析で最新状態を反映
    } catch (e) {
      setError(e instanceof Error ? e.message : "自動改善に失敗しました");
    } finally {
      setIsImproving(false);
    }
  }, [skillName, runAnalysis]);

  const clearError = useCallback(() => setError(null), []);

  return {
    analysis,
    isAnalyzing,
    isImproving,
    selectedSuggestions,
    error,
    runAnalysis,
    toggleSuggestion,
    selectAutoFixable,
    applySelected,
    autoImprove,
    clearError,
  };
}
```

---

## 9. レイアウト設計

### 9.1 全体レイアウト

```
┌─────────────────────────────────────────────────┐
│ ← 戻る     スキル分析: {skillName}              │  ← AnalysisHeader
├─────────────────────────────────────────────────┤
│                                  24px gap        │
│  ┌───────────────────────────────────────────┐  │
│  │     総合スコア: 85 / 100                  │  │  ← ScoreDisplay
│  │     ████████████████████░░░░               │  │
│  │                                           │  │
│  │  カテゴリ別:                               │  │
│  │  プロンプト品質  ██████████░  82           │  │  ← CategoryBar x N
│  │  セキュリティ    ████████░░░  75           │  │
│  │  ドキュメント    ██████░░░░░  60           │  │
│  └───────────────────────────────────────────┘  │
│                                  24px gap        │
│  ┌───────────────────────────────────────────┐  │
│  │  改善提案 (6件)       [自動修正のみ選択]  │  │  ← SuggestionList
│  │  ─── 高優先度 (2件) ───                   │  │
│  │  ☑ [prompt] プロンプトの明確化     [auto] │  │  ← SuggestionItem
│  │  ☐ [security] 入力バリデーション追加      │  │
│  │  ─── 中優先度 (3件) ───                   │  │
│  │  ☐ [structure] ファイル構造の最適化 [auto] │  │
│  │  ☐ [docs] ドキュメント補完                │  │
│  │  ☐ [perf] レスポンス最適化                │  │
│  │  ─── 低優先度 (1件) ───                   │  │
│  │  ☐ [prompt] 表現の改善                    │  │
│  └───────────────────────────────────────────┘  │
│                                  24px gap        │
│  ┌───────────────────────────────────────────┐  │
│  │  リスク情報 (3件)                         │  │  ← RiskPanel
│  │  ┃ [critical] セキュリティ: 入力検証不足  │  │  ← RiskItem
│  │  ┃   影響: 不正入力による予期しない動作   │  │
│  │  ┃   緩和策: バリデーション追加           │  │
│  │  ┃ [medium] パフォーマンス: 応答遅延      │  │
│  │  ┃ [low] ドキュメント: 説明不足           │  │
│  └───────────────────────────────────────────┘  │
│                                  24px gap        │
│  ┌───────────────────────────────────────────┐  │
│  │  [選択した提案を適用 (2)]  [全自動改善]   │  │  ← AnalysisActions
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 9.2 スペーシング（8pxグリッド）

| 要素間                   | サイズ     | グリッド単位 |
| ------------------------ | ---------- | ------------ |
| セクション間（カード間） | 24px       | 3単位        |
| カード内パディング       | 16px       | 2単位        |
| リストアイテム間         | 8px        | 1単位        |
| ボタン間                 | 12px       | 1.5単位      |
| ヘッダーパディング       | 16px       | 2単位        |
| グループヘッダー上下     | 12px / 8px | 1.5 / 1単位  |

### 9.3 角丸

| 要素             | 角丸 |
| ---------------- | ---- |
| セクションカード | 12px |
| ボタン           | 8px  |
| バッジ           | 4px  |
| プログレスバー   | 4px  |
| チェックボックス | 4px  |

### 9.4 タイポグラフィ

| 要素                | フォントサイズ | フォントウェイト |
| ------------------- | -------------- | ---------------- |
| 総合スコア数値      | 48px           | bold (700)       |
| セクション見出し    | 18px           | semibold (600)   |
| グループ見出し      | 14px           | medium (500)     |
| 提案/リスク説明     | 14px           | regular (400)    |
| バッジテキスト      | 12px           | medium (500)     |
| 緩和策/影響テキスト | 13px           | regular (400)    |
