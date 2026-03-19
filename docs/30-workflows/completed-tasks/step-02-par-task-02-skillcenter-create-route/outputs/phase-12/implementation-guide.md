# Phase 12 Task 1: 実装ガイド

## Part 1: 概念説明（中学生レベル）

### CTA ボタンって何？

「CTA」は「Call To Action」の略で、日本語にすると「次の行動を促すボタン」です。

ネットショッピングのサイトを思い浮かべてください。商品一覧ページに「カートに入れる」ボタンがありますよね？あのボタンが CTA です。「次にこれをしてね」とユーザーに案内するためのボタンです。

### 今回やったこと

「ツールを探す」画面（Skill Center）に、ユーザーが次のアクションに進むためのボタンを追加しました。

| ボタン           | 場所                           | 押すとどうなる？             |
| ---------------- | ------------------------------ | ---------------------------- |
| 「+ 新規作成」   | 画面の上の方（ヘッダー）       | ツール作成画面に移動する     |
| 「作成を始める」 | 「スキルを作る」カードの中     | ツール作成画面に移動する     |
| 「使ってみる」   | 「スキルを使う」カードの中     | ワークスペース画面に移動する |
| 「改善する」     | 「スキルを改善する」カードの中 | 分析画面に移動する           |

### 日常の例え

学校の図書室を想像してください。

- **入口の案内板（ヘッダー CTA）**: 「新しい本のリクエストはこちら→」と書かれた看板。押すとリクエストフォームのある部屋に案内される。
- **カード内の CTA**: 本棚の横にある「この棚の本を借りる→」「感想を書く→」というガイド板。それぞれ別の場所に案内してくれる。

大事なのは、**案内板は道を教えるだけ**で、本を貸し出す仕事は別の場所がやるということです。これがソフトウェアでいう「責務の分離」です。

---

## Part 2: 開発者向け実装詳細

### 変更ファイル概要

| ファイル                    | 変更種別     | 概要                                                 |
| --------------------------- | ------------ | ---------------------------------------------------- |
| `skillLifecycleJourney.ts`  | 型拡張       | `SkillLifecycleJobGuide` に `ctaLabel?: string` 追加 |
| `useSkillCenter.ts`         | ロジック追加 | 3つのナビゲーション関数を追加                        |
| `SkillCenterView/index.tsx` | UI 追加      | ヘッダー CTA + JourneyPanel CTA 描画                 |

### 1. データ層: ctaLabel の追加

`skillLifecycleJourney.ts` の `SkillLifecycleJobGuide` インターフェースに `ctaLabel?: string` を追加。

```typescript
export interface SkillLifecycleJobGuide {
  id: SkillLifecycleJob;
  title: string;
  // ... 既存フィールド
  ctaLabel?: string; // 追加
}
```

各ガイド定数にラベル値を設定:

- create: `"作成を始める"`
- use: `"使ってみる"`
- improve: `"改善する"`

### 2. ロジック層: ナビゲーションアクション

`useSkillCenter.ts` に3つのナビゲーション関数を追加:

```typescript
const setCurrentView = useAppStore((state) => state.setCurrentView); // P31 対策

const navigateToSkillCreate = useCallback(
  () => setCurrentView("skillCreate"),
  [setCurrentView],
);
const navigateToWorkspace = useCallback(
  () => setCurrentView("workspace"),
  [setCurrentView],
);
const navigateToSkillAnalysis = useCallback(
  () => setCurrentView("skillAnalysis"),
  [setCurrentView],
);
```

**重要**: AC-6 により、各関数は `setCurrentView` の薄いラッパーとしてのみ機能する。ビジネスロジックを含めてはならない。

### 3. UI 層: CTA ボタン描画

#### ヘッダー CTA

`viewStyles.headerCta`: Filled primary スタイル。`--status-primary` (systemBlue) 背景、白テキスト。

#### JourneyPanel CTA

`viewStyles.journeyCardCta`: Text secondary スタイル。`--status-primary` テキスト、10% 透明度背景。

#### 条件付きレンダリング

```tsx
{
  job.ctaLabel && action && (
    <button
      type="button"
      className={viewStyles.journeyCardCta}
      onClick={action}
      data-testid={`skill-lifecycle-cta-${job.id}`}
    >
      {job.ctaLabel}
      <Icon name="chevron-right" size={14} />
    </button>
  );
}
```

`ctaLabel` と `action` の両方が存在する場合のみ CTA を描画。将来的に `ctaLabel` を持たないジョブガイドを追加しても安全。

### 4. Prop 注入パターン

```tsx
const journeyActions = useMemo(
  () => ({
    create: navigateToSkillCreate,
    use: navigateToWorkspace,
    improve: navigateToSkillAnalysis,
  }),
  [navigateToSkillCreate, navigateToWorkspace, navigateToSkillAnalysis],
);

<SkillLifecycleJourneyPanel onJobAction={journeyActions} />;
```

`SKILL_LIFECYCLE_JOB_GUIDES` は `as const` の静的定数のためランタイム関数を保持できない。`onJobAction` props で外部からアクションを注入する設計を採用。

### テスト戦略

- **ユニットテスト**: `useSkillCenter.navigation.test.ts` (4テスト) — ナビゲーション関数の動作検証
- **コンポーネントテスト**: `SkillCenterView.cta.test.tsx` (26テスト) — CTA の描画・インタラクション・アクセシビリティ
- **データテスト**: `skillLifecycleJourney.test.ts` に4テスト追加 — ctaLabel の存在・値検証
- **テスト環境**: happy-dom + `fireEvent`（P39 準拠）
