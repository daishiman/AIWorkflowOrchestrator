# Phase 2: 設計仕様書

## タスクID: TASK-SW-FIX-FEEDBACK-001

## 設計1: fetchSkills() 追加（SkillCreateWizard.tsx）

### 変更箇所

`handleExecutePlan` 関数内の成功パス末尾、`goToStep(3)` 直前

### 実装

```typescript
// 問題6/8修正: LLMモード完了後にスキル一覧をリフレッシュ
try {
  await fetchSkills();
} catch {
  // fetchSkills失敗はログのみ。スキル生成自体は成功済みのため遷移は継続
}
goToStep(3);
```

### 設計判断

- `await` で呼び出し（完了を待つ）
- 失敗時は catch で無視し遷移を継続（生成自体は成功済み）
- templateモードは変更しない（createSkill 内部で処理済み）

## 設計2: skillPath nullガード（CompleteStep.tsx）

### 変更箇所

全 hooks/state 宣言後、メイン return の直前

### 実装

```typescript
if (skillPath === null) {
  return (
    <div data-testid="complete-step" className="flex flex-col gap-6 py-6">
      <div data-testid="complete-step-error-header" role="alert" ...>
        <h2>スキルの生成に失敗しました</h2>
        <p>スキルファイルの作成中にエラーが発生しました。</p>
      </div>
      <button data-testid="complete-step-retry-button" onClick={onRetry}>
        もう一度試す
      </button>
    </div>
  );
}
```

### 設計判断

- アーリーリターン方式（hooks は全て先に呼ぶ）
- `skillPath === undefined` は通常ケースとして扱い成功UIを表示
- `skillPath === null` のみエラーUI（明示的失敗の合図）
- onRetry は既存 prop を再利用（追加 prop 不要）
