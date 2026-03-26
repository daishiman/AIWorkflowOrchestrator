# [#1616] "[TASK-IMP-SKILLCENTER-CTA-ACCESSIBILITY-001] SkillCenterView CTA 型安全性・アクセシビリティ改善"

## メタ情報

```yaml
task_id: TASK-IMP-SKILLCENTER-CTA-ACCESSIBILITY-001
task_name: SkillCenterView CTA 型安全性・アクセシビリティ改善
category: 型安全性・アクセシビリティ
target_feature: SkillCenterView CTA ボタン群
priority: LOW
scale: S（3箇所の修正）
status: unassigned
source_phase: TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 二次検証
created_date: 2026-03-18
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-skillcenter-cta-accessibility-001.md
```

| 項目       | 内容             |
| ---------- | ---------------- |
| 優先度     | LOW              |
| 規模       | S（3箇所の修正） |
| ステータス | unassigned       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-02（SkillCenterView にスキル作成ルートを追加するタスク）の実装時に、`useSkillCenter.ts` フック内で `CategoryId` と `SkillCategory` の型の不一致を回避するために `as` 型キャストが導入された。具体的には、`useSkillCategory()` の戻り値を `as string | null` でキャスト（L179）し、`setSkillCategory` を `as (v: string | null) => void` でキャスト（L325）している。これらは Phase 12（ドキュメント）の二次検証で検出された。

また、同タスクで追加された SkillLifecycleJourneyPanel の CTA ボタンおよびヘッダーの「新規作成」CTA ボタンに `aria-label` が未設定であり、装飾目的の chevron-right アイコンにも `aria-hidden` が付与されていないことが確認された。

### 1.2 問題点・課題

1. **型安全性の欠如（P19/P49 違反）**: `useSkillCenter.ts` の L179 で `useSkillCategory() as string | null`、L325 で `setSkillCategory as (v: string | null) => void` という `as` 型キャストが使用されている。`as` キャストは TypeScript のコンパイル時チェックを通過させるだけであり、実行時の型安全性を保証しない。`CategoryId`（`"all" | "dev" | "writing" | "analysis" | "automation" | "other"`）と `SkillCategory`（`"testing" | "design" | "development" | "documentation" | "security" | "performance" | "other"`）は共通値が `"other"` のみであり、型の不一致が暗黙的に握りつぶされている
2. **スクリーンリーダー対応不足（WCAG 2.1 AA 違反）**: ヘッダーの「新規作成」CTA ボタンおよび JourneyPanel の各 CTA ボタン（「作成を始める」「使ってみる」「改善する」）に `aria-label` が設定されていない。アイコン付きボタンの場合、スクリーンリーダーがボタンの目的を正確に読み上げられない可能性がある
3. **装飾アイコンの不適切な読み上げ**: JourneyPanel CTA ボタン内の chevron-right アイコンは視覚的な装飾目的であるが、`aria-hidden="true"` が付与されていないため、スクリーンリーダーがアイコンを読み上げてしまう

### 1.3 放置した場合の影響

- **型安全性**: `SkillCategory` 型に新しいカテゴリが追加された場合や、`CategoryId` の定義が変更された場合に、コンパイル時にエラーが検出されず、実行時に予期しない動作が発生する。TypeScript `strict: true` 環境での潜在的バグの温床となる
- **アクセシビリティ**: WCAG 2.1 AA 準拠のアクセシビリティ監査で指摘される。スクリーンリーダーを使用するユーザーが CTA ボタンの目的を理解できず、操作性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`useSkillCenter.ts` 内の `as` 型キャストを排除し、実行時の型安全性を確保する。同時に、CTA ボタン群にアクセシビリティ属性を追加し、WCAG 2.1 AA 準拠を達成する。

### 2.2 最終ゴール

- `useSkillCenter.ts` 内の `as` 型キャストが 0 件であること
- 全 CTA ボタンに適切な `aria-label` が設定されていること
- 装飾目的のアイコンに `aria-hidden="true"` が設定されていること
- 既存テストが全て PASS し、型チェック（`pnpm typecheck`）もエラーなしであること

### 2.3 スコープ

| 対象                                             | 含む/含まない              |
| ------------------------------------------------ | -------------------------- |
| `useSkillCenter.ts` の `as` 型キャスト排除       | 含む                       |
| ヘッダー CTA の `aria-label` 追加                | 含む                       |
| JourneyPanel CTA の `aria-label` 追加            | 含む                       |
| JourneyPanel chevron-right の `aria-hidden` 追加 | 含む                       |
| `CategoryId` と `SkillCategory` の型統合         | 含まない（別タスクで検討） |
| 他コンポーネントのアクセシビリティ改善           | 含まない                   |

---

## 3. どう実装するか（How）

### 3.1 対応方針

**改善項目 1: `as` 型キャスト排除**

`CategoryId` と `SkillCategory` は異なる型体系のため、直接の型変換はできない。`useSkillCenter.ts` では Store の `SkillCategory | null` を UI の `CategoryId` に変換するアダプタ関数を導入し、実行時型検証を行う。逆方向（`CategoryId` → `SkillCategory | null`）の変換にも同様のアダプタ関数を用意する。これにより `as` キャストを排除しつつ、未知の値が渡された場合にもフォールバック動作を保証する。

**改善項目 2: CTA `aria-label` 追加**

ヘッダー CTA には `aria-label="新しいスキルを作成"` を追加する。JourneyPanel CTA には各ジョブの `ctaLabel`（「作成を始める」「使ってみる」「改善する」）がテキストとして既に表示されているため、アイコンを含むボタン全体の目的を明確にする `aria-label` を追加する。

**改善項目 3: chevron-right `aria-hidden` 追加**

JourneyPanel CTA ボタン内の `<Icon name="chevron-right" />` に `aria-hidden="true"` を追加し、スクリーンリーダーが装飾アイコンを読み上げないようにする。

### 3.2 修正箇所

| #   | ファイル                                                                  | 行                                                     | 内容                                                                   |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | L179                                                   | `useSkillCategory() as string \| null` の `as` キャスト排除            |
| 2   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | L325                                                   | `setSkillCategory as (v: string \| null) => void` の `as` キャスト排除 |
| 3   | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | L387-395（ヘッダー CTA）、L170-178（JourneyPanel CTA） | `aria-label` 追加、chevron-right に `aria-hidden="true"` 追加          |

### 3.3 修正案（コード例）

**改善項目 1: アダプタ関数の導入（useSkillCenter.ts）**

```typescript
// Before (L179):
const category = useSkillCategory() as string | null;

// After:
const category: string | null = useSkillCategory() ?? null;
```

```typescript
// Before (L325):
(setSkillCategory as (v: string | null) => void)(categoryId);

// After: アダプタ関数でCategoryIdをSkillCategory | nullに安全に変換
import type { SkillCategory } from "@repo/shared/types/skill";

const CATEGORY_ID_TO_SKILL_CATEGORY: Record<string, SkillCategory | null> = {
  all: null,
  dev: "development",
  writing: "documentation",
  analysis: "design",
  automation: "performance",
  other: "other",
};

function toSkillCategory(categoryId: CategoryId): SkillCategory | null {
  return CATEGORY_ID_TO_SKILL_CATEGORY[categoryId] ?? null;
}

// handleSetCategory 内:
const handleSetCategory = useCallback(
  (categoryId: CategoryId) => {
    setSkillCategory(toSkillCategory(categoryId));
  },
  [setSkillCategory],
);
```

> 注意: `CATEGORY_ID_TO_SKILL_CATEGORY` のマッピング値は実装時に正確なドメインの対応関係を確認すること。上記は例示であり、`matchesCategory()` のキーワードマッチロジックとの整合性を検証する必要がある。現在の実装では `matchesCategory()` が文字列ベースでキーワードマッチしているため、`CategoryId` の値をそのまま Store に格納しても `matchesCategory()` は正しく動作する。その場合は `CATEGORY_KEYWORDS` の Record 型を `Record<CategoryId | SkillCategory, string[]>` に拡張するアプローチも検討できる。

**改善項目 2: ヘッダー CTA に `aria-label` 追加（index.tsx）**

```tsx
// Before:
<button
  type="button"
  className={viewStyles.headerCta}
  onClick={navigateToSkillCreate}
  data-testid="header-create-cta"
>
  <Icon name="plus" size={16} />
  <span>新規作成</span>
</button>

// After:
<button
  type="button"
  className={viewStyles.headerCta}
  onClick={navigateToSkillCreate}
  data-testid="header-create-cta"
  aria-label="新しいスキルを作成"
>
  <Icon name="plus" size={16} aria-hidden="true" />
  <span>新規作成</span>
</button>
```

**改善項目 3: JourneyPanel CTA に `aria-label` + chevron-right `aria-hidden` 追加（index.tsx）**

```tsx
// Before:
<button
  type="button"
  className={viewStyles.journeyCardCta}
  onClick={action}
  data-testid={`skill-lifecycle-cta-${job.id}`}
>
  {job.ctaLabel}
  <Icon name="chevron-right" size={14} />
</button>

// After:
<button
  type="button"
  className={viewStyles.journeyCardCta}
  onClick={action}
  data-testid={`skill-lifecycle-cta-${job.id}`}
  aria-label={job.ctaLabel}
>
  {job.ctaLabel}
  <Icon name="chevron-right" size={14} aria-hidden="true" />
</button>
```

---

## 4. 関連する苦戦箇所・Pitfall

- **P31 Zustand 個別セレクタパターン**: `setCurrentView` や `setSkillCategory` を合成 Hook から取得すると無限ループのリスクがある。現在の実装では `useAppStore((state) => state.setCurrentView)` で個別セレクタを使用しており、この方針を維持すること。型キャスト排除時にセレクタの取得方法を変更する場合は、P31 を再発させないよう注意が必要
- **P19/P49 型キャストバイパス**: `as string | null` や `as (v: string | null) => void` は TypeScript のコンパイル時チェックを通過させるが、実行時の安全性を保証しない。アダプタ関数を導入して実行時型検証を行うことで、未知の値が渡された場合にも安全にフォールバックさせる
- **P39 happy-dom 環境でのテスト**: テスト追加時は `fireEvent` を使用すること（`userEvent` は happy-dom 環境で非互換）。`aria-label` の検証テストを追加する際は `screen.getByRole("button", { name: "新しいスキルを作成" })` のようなロールベースのクエリが利用可能
- **解決策のまとめ**: 型キャストは `CategoryId` から `SkillCategory` へのアダプタ関数を導入し、実行時型検証を行う。aria 属性はネイティブ HTML 属性として静的に付与するため、ランタイムコストは発生しない

---

## 5. 受入基準

- [ ] `useSkillCenter.ts` 内の `as` 型キャストが 0 件であること（`grep -n ' as ' useSkillCenter.ts` で確認）
- [ ] `CategoryId` から `SkillCategory | null` への変換がアダプタ関数を通じて行われていること
- [ ] ヘッダー CTA（`data-testid="header-create-cta"`）に `aria-label` が設定されていること
- [ ] JourneyPanel CTA（`data-testid="skill-lifecycle-cta-*"`）に `aria-label` が設定されていること
- [ ] JourneyPanel CTA 内の chevron-right アイコンに `aria-hidden="true"` が設定されていること
- [ ] ヘッダー CTA 内の plus アイコンに `aria-hidden="true"` が設定されていること
- [ ] `pnpm typecheck` がエラーなしで通ること
- [ ] 既存テストが全て PASS すること
- [ ] `aria-label` を検証するテストが追加されていること（ロールベースクエリで確認）

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` (v1.7.7)
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` (S20)
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md` (P31対策)
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md`

### 6.2 ルール・規約

- `.claude/rules/02-code-quality.md` - TypeScript 型安全
- `.claude/rules/01-architecture.md` - アクセシビリティ（WCAG 2.1 AA）
- `.claude/rules/06-known-pitfalls.md` - P19, P31, P39, P49

### 6.3 タスク成果物

- `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/outputs/phase-12/unassigned-task-detection.md`
