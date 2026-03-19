# Phase 2 設計サマリー: SkillCenter Create Route

## 1. コンポーネント変更範囲一覧

| ファイル                                                    | 変更種別 | 変更内容                                                            |
| ----------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/types/skillLifecycleJourney.ts`  | 型追加   | `SkillLifecycleJobGuide`に`ctaLabel?: string`を追加                 |
| `apps/desktop/src/renderer/hooks/useSkillCenter.ts`         | 機能追加 | 3つのナビゲーションアクションを追加、`UseSkillCenterReturn`型を拡張 |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` | UI追加   | ヘッダーCTAボタン追加、JOB_GUIDESへのonAction注入                   |

---

## 2. `SkillLifecycleJobGuide`型への`ctaLabel`追加設計

### 変更対象ファイル

`apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` L13-22

> **注記（MINOR-1対応）**: 旧記載は `types/skillLifecycleJourney.ts` だったが、実際のファイルパスは `navigation/skillLifecycleJourney.ts` である。Phase 3 MINOR-1 指摘に基づき修正済み。

### 変更後の型定義

```typescript
export interface SkillLifecycleJobGuide {
  jobTitle: string;
  jobStory: string;
  tools: string[];
  outcome: string;
  steps: SkillLifecycleStep[];
  onAction?: () => void;
  ctaLabel?: string; // 追加: JourneyPanelに表示するCTAボタンのラベル
}
```

### 設計根拠

- `ctaLabel`はオプショナル（`?`）とし、既存データとの後方互換性を維持する
- `onAction`が存在しない場合はCTAボタン自体を非表示にする（後述の条件付きレンダリングで制御）
- `ctaLabel`が存在し`onAction`が未定義の場合はボタンを表示しない（両方必要）

---

## 3. `useSkillCenter`フックの3アクション設計

### 変更対象ファイル

`apps/desktop/src/renderer/hooks/useSkillCenter.ts`

### `UseSkillCenterReturn`型への追加

```typescript
export interface UseSkillCenterReturn {
  // 既存フィールド（変更なし）
  // ...

  // 追加: ナビゲーションアクション
  navigateToSkillCreate: () => void;
  navigateToWorkspace: () => void;
  navigateToSkillAnalysis: () => void;
}
```

### アクション実装設計

```typescript
import { useCallback } from "react";
import { useAppStore } from "@/renderer/store/appStore";

export function useSkillCenter(): UseSkillCenterReturn {
  // P31対策: useAppStore から setCurrentView を直接取得（合成Hook経由を避ける）
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  // P31対策: useCallback でアクションをメモ化し、安定した関数参照を保証
  const navigateToSkillCreate = useCallback(() => {
    setCurrentView("skillCreate");
  }, [setCurrentView]);

  const navigateToWorkspace = useCallback(() => {
    setCurrentView("workspace");
  }, [setCurrentView]);

  const navigateToSkillAnalysis = useCallback(() => {
    setCurrentView("skillAnalysis");
  }, [setCurrentView]);

  return {
    // 既存の戻り値...
    navigateToSkillCreate,
    navigateToWorkspace,
    navigateToSkillAnalysis,
  };
}
```

### P31対策の詳細

- `useAppStore((state) => state.setCurrentView)` で個別セレクタとして取得する
- `useSetCurrentView`個別セレクタは未定義のため、直接セレクタ記法を使用する
- Zustandのアクション（`setCurrentView`）は安定した参照を持つため、`useCallback`の依存配列に含めても安全
- `useCallback`でラップすることで、コンポーネントの不要な再レンダーを防ぐ

---

## 4. SkillCenterView ヘッダーCTA設計

### 変更対象箇所

`apps/desktop/src/renderer/views/SkillCenterView/index.tsx` L334-340（ヘッダーセクション）

### 変更後のJSX設計

```tsx
{
  /* ヘッダーセクション: flex justify-between でCTAを右端配置 */
}
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
      スキルセンター
    </h1>
    <p className="text-sm text-[var(--text-secondary)] mt-1">
      AIエージェントの能力を管理・拡張する
    </p>
  </div>

  {/* Primary CTA: スキル作成へのhandoff */}
  <button
    type="button"
    onClick={navigateToSkillCreate}
    aria-label="新しいツールを作る"
    className={[
      "flex items-center gap-1.5",
      "bg-[var(--accent)] text-white",
      "px-3 py-1.5 rounded-lg",
      "text-sm font-medium",
      "hover:opacity-90 active:opacity-80",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
      "transition-opacity",
    ].join(" ")}
  >
    {/* アイコン: 常に表示 */}
    <span aria-hidden="true">+</span>
    {/* ラベル: md(768px)未満では非表示（モバイル対応 AC-7） */}
    <span className="hidden md:inline">新しいツールを作る</span>
  </button>
</div>;
```

### CSS変数バインディング

- `var(--accent)`: systemBlue（ライト: #007AFF、ダーク: #0A84FF）にバインド
- `var(--text-primary)`: プライマリテキストカラー
- `var(--text-secondary)`: セカンダリテキストカラー

---

## 5. JourneyPanel CTAボタン設計（条件付きレンダリング）

### 変更対象箇所

`apps/desktop/src/renderer/views/SkillCenterView/index.tsx` L106-149（JourneyPanelインライン実装）

### 条件付きレンダリングの設計

```tsx
{
  /* JourneyPanelカード内のCTAボタン（ctaLabelとonActionの両方が存在する場合のみ表示） */
}
{
  step.ctaLabel && step.onAction && (
    <button
      type="button"
      onClick={step.onAction}
      aria-label={step.ctaLabel}
      className={[
        "mt-3 self-end",
        "text-sm font-medium",
        "text-[var(--accent)]",
        "hover:opacity-80 active:opacity-60",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1",
        "transition-opacity",
        // タッチターゲット 44x44px 以上（AC-7）
        "min-h-[44px] min-w-[44px] flex items-center",
      ].join(" ")}
    >
      {step.ctaLabel}
    </button>
  );
}
```

### 設計根拠

- `step.ctaLabel && step.onAction` の両方が存在する場合のみボタンをレンダリングする
- `onAction`のみ存在してラベルがない場合もボタンを表示しない（ラベルなしボタンはアクセシビリティ違反）
- `ctaLabel`のみ存在してアクションがない場合もボタンを表示しない（動作しないボタンはUX違反）

---

## 6. JOB_GUIDESへのonAction注入パターン

### 設計概要

`JOB_GUIDES`は静的定数として定義されているため、`onAction`（動的な関数）を定数内に直接定義できない。
`SkillCenterView`内でフックから取得したナビゲーションアクションをmapで注入するパターンを採用する。

### 注入パターンの実装設計

```tsx
// SkillCenterView内での使用例
const { navigateToSkillCreate, navigateToWorkspace, navigateToSkillAnalysis } =
  useSkillCenter();

// onAction注入マッピング定義（ViewType順に対応）
const ACTION_MAP: Record<string, () => void> = {
  skillCreate: navigateToSkillCreate,
  workspace: navigateToWorkspace,
  skillAnalysis: navigateToSkillAnalysis,
};

// JOB_GUIDESにonActionを動的注入
const guidesWithActions = JOB_GUIDES.map((guide) => ({
  ...guide,
  onAction: guide.ctaViewType ? ACTION_MAP[guide.ctaViewType] : undefined,
}));
```

### `SkillLifecycleJobGuide`型への`ctaViewType`追加（ADR: 却下）

> **ADR（Architecture Decision Record）- MINOR-2対応**
>
> **決定**: `ctaViewType` フィールドを `SkillLifecycleJobGuide` 型に追加**しない**。
>
> **理由**:
>
> - 既存の `id` フィールド（`"create"` / `"use"` / `"improve"`）との1対1マッピングで遷移先ViewTypeを特定できる
> - `ctaViewType` を追加すると型定義とマッピングロジックが二重管理になり、変更漏れリスクが増大する
>
> **採用する代替案**: `id` フィールドベースのマッピング（`id: "create"` → `skillCreate`、`id: "use"` → `workspace`、`id: "improve"` → `skillAnalysis`）を `SkillCenterView` 側で管理する。
>
> **参照**: Phase 3 MINOR-2 指摘「task-imp-skillcenter-ctaviewtype-overdesign-review-001」

---

## 7. Tailwind breakpointの選定

### 選定結果: `md:`（768px）を使用

| breakpoint | px幅   | 採用理由                                             |
| ---------- | ------ | ---------------------------------------------------- |
| `sm:`      | 640px  | AC-7の768px要件に合致しない                          |
| `md:`      | 768px  | **採用**: AC-7「モバイル（<768px）」の要件に完全一致 |
| `lg:`      | 1024px | 過大なため不採用                                     |

### 適用箇所

- ヘッダーCTAのラベルテキスト: `hidden md:inline`（768px未満は非表示、768px以上は表示）
- モバイルではアイコン（`+`）のみ表示し、タッチターゲット44x44px以上を確保する

### 仕様書との整合

- AC-7: 「モバイル（<768px）: ヘッダーCTAはアイコンのみ表示、タッチターゲット44x44px以上」
- Phase 5実装時に`sm:640px`の可能性を指摘している場合でも、AC-7の768px明記を優先する

---

## 統合テスト連携

### 設計上の統合テスト観点

- `useSkillCenter` の3アクション（navigateToSkillCreate / navigateToWorkspace / navigateToSkillAnalysis）が `setCurrentView` と正しく接続することを Phase 4 のユニットテストで確認する
- ヘッダーCTA と JourneyPanel CTA のクリックがそれぞれ期待する ViewType 遷移を呼び出すことをコンポーネントテストで確認する
- P31（合成Hook無限ループ）対策として `useAppStore((state) => state.setCurrentView)` 個別セレクタ形式が採用されていることを Phase 4 テストで検証する
- Task03 と共有する `useSkillCenter.ts` / `index.tsx` の変更が独立した行・関数への追加であり、マージ後に両タスクの機能が共存することを統合テストで確認する
