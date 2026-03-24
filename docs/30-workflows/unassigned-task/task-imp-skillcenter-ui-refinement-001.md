# SkillCenterView UI 改善（8pxグリッド準拠・viewStyles分離） - タスク指示書

## メタ情報

```yaml
issue_number: 1566
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-IMP-SKILLCENTER-UI-REFINEMENT-001                     |
| タスク名     | SkillCenterView UI 改善（8pxグリッド準拠・viewStyles分離） |
| 分類         | UI改善・リファクタリング                                   |
| 対象機能     | SkillCenterView                                            |
| 優先度       | LOW                                                        |
| 見積もり規模 | S（スタイル修正 + ファイル分離）                           |
| ステータス   | unassigned                                                 |
| 発見元       | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 二次検証             |
| 作成日       | 2026-03-18                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-02 で SkillCenterView にヘッダー CTA ボタン（「新規作成」）を追加した際、ボタンの水平パディングに `px-3.5`（14px）が指定された。この値は Apple HIG が推奨する 8px グリッドの倍数（8, 16, 24, ...）から外れており、Phase 12 の二次検証で検出された。

また、同タスクで JourneyPanel や SurfaceOwnershipPanel のスタイル定義が追加された結果、`viewStyles` オブジェクトが約86行に膨れ上がった。`index.tsx` はコンポーネントロジック（約420行）とスタイル定義（約86行）が混在しており、単一責務原則（SRP）に違反する状態となっている。

### 1.2 問題点・課題

1. **8px グリッド不準拠**: ヘッダー CTA の `px-3.5`（14px）は 8px グリッドの倍数ではない。Apple HIG では UI 要素のスペーシングを 8px 単位で統一することを推奨しており、14px は 8（不足）と 16（超過）の中間に位置する半端な値である
2. **viewStyles の肥大化**: `viewStyles` オブジェクトが86行に達し、コンポーネントのレンダリングロジックと同一ファイルに存在している。スタイル定義の変更とコンポーネントロジックの変更が同一ファイルに集中するため、差分レビューの効率が低下し、マージコンフリクトのリスクも高まる

### 1.3 放置した場合の影響

- **デザインレビューでの指摘**: Apple HIG 準拠を掲げるプロジェクトにおいて、8px グリッドからの逸脱はデザインレビューで繰り返し指摘される原因になる
- **index.tsx の保守性低下**: 今後のスタイル追加（新しいセクションやコンポーネント）により `viewStyles` がさらに膨張し、`index.tsx` が500行を超える可能性がある。500行超過はファイル分割の警告対象（validate-structure.js）である
- **テスト時のスタイル参照困難**: `viewStyles` が `index.tsx` に埋め込まれているため、テストファイルからスタイル定数を import して期待値を生成する P47 パターンの適用が難しい

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCenterView の UI 品質と保守性を向上させるため、8px グリッドへの完全準拠とスタイル定義の外部ファイル分離を実施する。

### 2.2 最終ゴール

- ヘッダー CTA ボタンの水平パディングが 8px グリッドの倍数（16px）に統一されている
- `viewStyles` オブジェクトが `SkillCenterView.styles.ts` に分離され、`index.tsx` はコンポーネントロジックのみを担当している
- 既存のテストが全て PASS し、UI の見た目に視覚的リグレッションが発生していない

### 2.3 スコープ

**スコープ内:**

- ヘッダー CTA の `px-3.5` を `px-4` に変更
- `viewStyles` オブジェクトを `SkillCenterView.styles.ts` に抽出
- `index.tsx` から `viewStyles` を import に切り替え
- 既存テストの PASS 確認

**スコープ外:**

- 他のコンポーネント（FeaturedSection, CategoryTabs 等）のスタイル分離
- 新規テストの追加（既存テストの PASS 確認のみ）
- 削除確認ダイアログ内のインラインスタイルの外部化

---

## 3. どう実装するか（How）

### 3.1 対応方針

2ステップで対応する。

1. **Step 1: 8px グリッド修正** - ヘッダー CTA の `px-3.5` を `px-4` に変更する。変更後に既存テストが PASS することを確認する
2. **Step 2: viewStyles 分離** - `viewStyles` オブジェクト全体を `SkillCenterView.styles.ts` に移動し、`index.tsx` からは import で参照する。`viewStyles` の型（`as const`）と export はそのまま維持する

### 3.2 修正箇所

| #   | ファイル                                                                                | 内容                                                                          |
| --- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                             | `headerCta` 内の `px-3.5` を `px-4` に変更                                    |
| 2   | `apps/desktop/src/renderer/views/SkillCenterView/SkillCenterView.styles.ts`（新規作成） | `viewStyles` オブジェクト（86行）と `clsx` import を配置                      |
| 3   | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                             | `viewStyles` の定義を削除し、`SkillCenterView.styles.ts` からの import に置換 |

### 3.3 修正案（コード例）

**Step 1: 8px グリッド修正（index.tsx L97）**

```typescript
// Before: px-3.5 = 14px（8pxグリッド非準拠）
headerCta: clsx(
  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl",
  // ...
),

// After: px-4 = 16px（8pxグリッド準拠）
headerCta: clsx(
  "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl",
  // ...
),
```

**Step 2: viewStyles 分離**

```typescript
// SkillCenterView.styles.ts（新規作成）
import clsx from "clsx";

/** ビュー全体のスタイル定義 */
export const viewStyles = {
  container: clsx(
    "flex flex-col h-full",
    "bg-[var(--bg-primary)]",
    "overflow-hidden",
  ),
  // ... 残りのスタイル定義（86行分）
} as const;
```

```typescript
// index.tsx（変更後）
// Before: viewStyles をファイル内で定義
// After: 外部ファイルから import
import { viewStyles } from "./SkillCenterView.styles";
```

---

## 4. 関連する苦戦箇所・Pitfall

- **データ駆動CTA設計パターン（S20）と viewStyles の関係**: JourneyPanel CTA のスタイルは `viewStyles.journeyCardCta` として定義されている。`viewStyles` を外部ファイルに分離する際、CTA のスタイル定数が `SKILL_LIFECYCLE_JOB_GUIDES`（データ駆動パターン）との整合性を維持する必要がある。具体的には、`viewStyles` の分離先ファイルに `skillLifecycleJourney.ts` への依存が生じないよう、スタイル定義は純粋な CSS クラス文字列のみで構成すること

- **P47 CSS変数ベースのスタイルテストアサーション**: `viewStyles` を外部ファイルに分離すると、テスト側で `import { viewStyles } from "./SkillCenterView.styles"` として期待値生成ができるようになり、P47 対策（`variantStyles` パターン）の適用が容易になる。将来のテスト改善で活用できる

- **Apple HIG 8pxグリッドの許容範囲**: Phase 10 レビューでは `px-3.5`（14px）は「概ね準拠」と判定されたが、厳密には 8px の倍数ではない。候補としては `px-3`（12px）と `px-4`（16px）がある。タッチターゲットの最小サイズ（44px）を考慮すると、`px-4`（16px）の方がボタン全体のクリック領域を広く確保でき、操作性が向上する

- **解決策**: `px-4`（16px）を採用する。タッチターゲット確保と 8px 倍数の両方を満たす。`viewStyles` は `SkillCenterView.styles.ts` として分離し、`index.tsx` からは import で参照する。`clsx` の import は分離先ファイルに移動するが、`index.tsx` 側でも削除確認ダイアログ等のインラインスタイルで使用しているため、`index.tsx` の `clsx` import は残す

---

## 5. 受入基準

- [ ] ヘッダー CTA の水平パディングが `px-4`（16px）であること
- [ ] `viewStyles` オブジェクトが `SkillCenterView.styles.ts` に分離されていること
- [ ] `index.tsx` から `viewStyles` が import 文で参照されていること
- [ ] `index.tsx` のファイル行数が分離前（538行）より減少していること
- [ ] `SkillCenterView.styles.ts` に `as const` アサーションが維持されていること
- [ ] 既存テスト（`SkillCenterView.cta.test.tsx` 等）が全て PASS すること
- [ ] UI の見た目に変化がないこと（視覚的リグレッションなし）
- [ ] `pnpm lint` および `pnpm typecheck` が PASS すること

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` (v1.7.7)
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` (S20: データ駆動CTA設計パターン)
- `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`

### 6.2 ルール・規約

- `.claude/rules/01-architecture.md` - 8pxグリッド、Apple HIG準拠、SRP
- `.claude/rules/06-known-pitfalls.md` - P47（CSS変数ベースのスタイルテストアサーション戦略）

### 6.3 タスク成果物

- `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/outputs/phase-10/final-review-report.md`
