# Phase 12 Task 1 補足: コンポーネントドキュメント

## SkillCenterView CTA コンポーネント構造

### コンポーネント階層

```
SkillCenterView (memo)
  |-- SkillLifecycleJourneyPanel
  |     |-- JourneyCard (map) x3
  |           |-- CTA Button (条件付き)
  |-- Header CTA Button
  |-- (既存コンポーネント群...)
```

### SkillLifecycleJourneyPanel

| Props         | 型                                               | 説明                                |
| ------------- | ------------------------------------------------ | ----------------------------------- |
| `onJobAction` | `Partial<Record<SkillLifecycleJob, () => void>>` | ジョブID→アクション関数のマッピング |

- `onJobAction` が未提供の場合、全 CTA ボタンは非表示（条件付きレンダリング）
- `onJobAction` の一部のキーのみ提供した場合、該当するジョブの CTA のみ表示

### viewStyles 拡張

| スタイルキー     | 用途                       | バリアント     |
| ---------------- | -------------------------- | -------------- |
| `headerRow`      | ヘッダーの flex レイアウト | -              |
| `headerCta`      | ヘッダー CTA ボタン        | Filled primary |
| `journeyCardCta` | JourneyPanel カード内 CTA  | Text secondary |

### UseSkillCenterReturn 型拡張

```typescript
// 追加されたナビゲーション関数
navigateToSkillCreate: () => void;   // → skillCreate ビュー
navigateToWorkspace: () => void;      // → workspace ビュー
navigateToSkillAnalysis: () => void;  // → skillAnalysis ビュー
```

### SkillLifecycleJobGuide 型拡張

```typescript
// 追加フィールド
ctaLabel?: string;  // CTA ボタンのラベルテキスト（省略可能）
```

### data-testid 一覧

| data-testid                   | 要素                               |
| ----------------------------- | ---------------------------------- |
| `header-create-cta`           | ヘッダーの「+ 新規作成」ボタン     |
| `skill-lifecycle-cta-create`  | JourneyPanel「作成を始める」ボタン |
| `skill-lifecycle-cta-use`     | JourneyPanel「使ってみる」ボタン   |
| `skill-lifecycle-cta-improve` | JourneyPanel「改善する」ボタン     |
| `skill-lifecycle-journey`     | JourneyPanel セクション全体        |
