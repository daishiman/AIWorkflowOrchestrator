# Phase 2: コンポーネント設計

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## 1. SkillAnalysisView Props 拡張

### 現行 Props

```typescript
export interface SkillAnalysisViewProps {
  skillName: string;
  onClose: () => void;
}
```

### 拡張後 Props

```typescript
export interface SkillAnalysisViewProps {
  skillName: string;
  onClose: () => void;
  onNavigateBack?: () => void;
  onNavigateToAgent?: () => void;
}
```

### 後方互換性

- `onNavigateBack` / `onNavigateToAgent` はオプション props
- 未注入時は対応 UI を表示しない
- 既存の SkillCenter / DetailPanel 呼び出し元は変更不要

### ヘッダー変更（戻りリンク追加）

```tsx
// 現行ヘッダー
<div className="flex items-center justify-between ...">
  <h1>{skillName}</h1>
  <button onClick={onClose} aria-label="閉じる"><X /></button>
</div>

// 変更後ヘッダー
<div className="flex items-center justify-between ...">
  <div className="flex items-center gap-2">
    {onNavigateBack && (
      <button
        onClick={onNavigateBack}
        aria-label="エージェントに戻る"
        className="... text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">戻る</span>
      </button>
    )}
    <h1>{skillName}</h1>
  </div>
  <button onClick={onClose} aria-label="閉じる"><X /></button>
</div>
```

### フッター変更（再実行ボタン追加）

```tsx
// 現行フッター
<div className="flex gap-3 ...">
  <button>選択を適用</button>
  <button>全自動改善</button>
</div>

// 変更後フッター
<div className="flex gap-3 ...">
  <button>選択を適用</button>
  <button>全自動改善</button>
  {onNavigateToAgent && (
    <button
      onClick={onNavigateToAgent}
      aria-label="エージェントで再実行"
      className="... border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-200"
    >
      エージェントで再実行
    </button>
  )}
</div>
```

## 2. AgentView CTA バナー

### 表示条件

```typescript
const canOfferAnalysis = useMemo(() => {
  if (!selectedSkillName || selectedSkillName.trim().length === 0) return false;
  if (skillExecutionStatus !== "completed") return false;
  if (isExecuting) return false;
  return true;
}, [selectedSkillName, skillExecutionStatus, isExecuting]);
```

### CTA バナー JSX

```tsx
{
  canOfferAnalysis && (
    <div
      className="mx-4 mt-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
               flex items-center justify-between
               animate-fade-in"
      role="region"
      aria-label="スキル改善提案"
    >
      <div className="flex items-center gap-3">
        <Sparkles size={18} className="text-[var(--accent)]" />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            スキルを分析・改善する
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            実行結果を基にスキルの改善提案を確認できます
          </p>
        </div>
      </div>
      <button
        onClick={handleNavigateToAnalysis}
        aria-label="スキルを分析・改善する"
        className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium
                 hover:bg-[var(--accent-hover)] transition-colors duration-200"
      >
        分析する
      </button>
    </div>
  );
}
```

### handoff ハンドラ

```typescript
const setCurrentView = useAppStore((state) => state.setCurrentView);
const setCurrentSkillName = useAppStore((state) => state.setCurrentSkillName);

const handleNavigateToAnalysis = useCallback(() => {
  if (!selectedSkillName) return;
  const trimmedName = selectedSkillName.trim();
  if (trimmedName.length === 0) return;
  setCurrentSkillName(trimmedName);
  setCurrentView("skillAnalysis");
}, [selectedSkillName, setCurrentView, setCurrentSkillName]);
```

### 配置場所

`RecentExecutionList` の上、`FloatingExecutionBar` の下に配置。既存レイアウトを壊さない。

## 3. App.tsx skillAnalysis case 更新

### 現行

```tsx
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={currentSkillName ?? "demo-skill"}
      onClose={() => {
        setCurrentView("skillCenter");
        setCurrentSkillName(null);
      }}
    />
  );
```

### 変更後

```tsx
case "skillAnalysis": {
  const previousView = Array.isArray(viewHistory)
    ? viewHistory[viewHistory.length - 2]
    : undefined;
  const isFromAgent = previousView === "agent";
  return (
    <SkillAnalysisView
      skillName={currentSkillName ?? "demo-skill"}
      onClose={() => {
        setCurrentView("skillCenter");
        setCurrentSkillName(null);
      }}
      onNavigateBack={isFromAgent ? () => goBack() : undefined}
      onNavigateToAgent={isFromAgent ? () => setCurrentView("agent") : undefined}
    />
  );
}
```
