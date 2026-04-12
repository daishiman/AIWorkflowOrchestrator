# Phase 5: 実装

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 5                                    |
| 名称       | 実装                                 |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- TDD Green フェーズ: Phase 4 で作成したテストを全て PASS させる実装を行う
- `CATEGORY_OPTIONS` に `icon`・`description` フィールドを追加する
- ボタン UI にアイコン表示・`title` ツールチップ・`aria-label`（表示ラベルと一致）を実装する

---

## 実行タスク

### Task 1: 実装ファイル一覧（[Feedback RT-03] 対応）

| ファイル                                                              | 操作 | 内容                                  |
| --------------------------------------------------------------------- | ---- | ------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | 修正 | CATEGORY_OPTIONS 拡張・ボタン UI 変更 |

**新規作成ファイルなし**

### Task 2: 実装内容

#### 2-1. `CategoryOption` インターフェース追加

`CATEGORY_OPTIONS` 定数の直前に追加する：

```typescript
interface CategoryOption {
  value: SkillCategory;
  label: string;
  icon: string;
  description: string;
}
```

#### 2-2. `CATEGORY_OPTIONS` 配列の拡張

```typescript
const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "automation",
    label: "自動化",
    icon: "⚡",
    description: "繰り返し作業の自動化・スケジュール実行などのスキル",
  },
  {
    value: "external-integration",
    label: "外部連携",
    icon: "🔗",
    description: "外部API・Webhookなど外部サービスと連携するスキル",
  },
  {
    value: "data-analysis",
    label: "データ分析",
    icon: "📊",
    description: "データの集計・分析・可視化を行うスキル",
  },
  {
    value: "code-support",
    label: "コードサポート",
    icon: "💻",
    description: "コードレビュー・生成・リファクタリングを支援するスキル",
  },
  {
    value: "other",
    label: "その他",
    icon: "📦",
    description: "上記カテゴリに当てはまらないスキル",
  },
];
```

#### 2-3. ボタン UI の変更

`CATEGORY_OPTIONS.map` の分割代入を `{ value, label, icon, description }` に変更し、ボタン内容を更新する：

```tsx
{
  CATEGORY_OPTIONS.map(({ value, label, icon, description }) => {
    const isSelected = formData.category === value;
    return (
      <button
        key={value}
        type="button"
        aria-pressed={isSelected}
        aria-label={label}
        title={description}
        onClick={() => handleCategoryClick(value)}
        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
          isSelected
            ? "border-blue-500 bg-blue-100 text-blue-700"
            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
        }`}
      >
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </button>
    );
  });
}
```

### Task 3: TDD Green 確認

実装後に全テストが PASS することを確認する：

```bash
# targeted run（対象ファイル指定）
pnpm vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

期待結果:

- TC-IC-01〜TC-IC-04: PASS
- TC-TT-01〜TC-TT-03: PASS
- TC-A1-01〜TC-A1-03: PASS
- TC-RG-01〜TC-RG-03: PASS（回帰なし）

### Task 4: 型チェック確認

```bash
pnpm typecheck
# または
pnpm --filter @repo/desktop typecheck
```

### Task 5: Lint 確認

```bash
pnpm lint
# または
pnpm --filter @repo/desktop lint
```

---

## 参照資料

- `phase-2-design.md` - 実装設計（CategoryOption 型・ボタン UI 設計）
- `phase-4-test-creation.md` - テストケース一覧
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` - 変更対象

---

## 統合テスト連携

- `pnpm typecheck` で型安全を確認（`CategoryOption` インターフェースと `CATEGORY_OPTIONS` の整合）
- Phase 4 で作成した全テストケース（TC-IC/TT/A1/RG）が PASS することを確認

---

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                                       |
| ------------ | -------------------------------------------------------------- |
| 型安全       | `CategoryOption` 型が `CATEGORY_OPTIONS` と整合している        |
| レンダリング | 全5カテゴリのアイコン・ラベルが正しく表示される                |
| A11y         | `aria-hidden="true"` / `aria-label` / `title` が全ボタンに付く |
| 既存動作     | `handleCategoryClick` / `aria-pressed` の動作が変わらない      |
| スタイル整合 | ボタンの CSS クラスが変更前と同等（アイコン追加分のみ変更）    |

---

## 成果物

| 成果物                       | 配置先                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Phase 5 実装書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-5-implementation.md` |
| 変更済みコンポーネント       | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`          |

---

## 完了条件

- [ ] `CategoryOption` インターフェース追加
- [ ] `CATEGORY_OPTIONS` に全5カテゴリの `icon`・`description` 追加
- [ ] ボタン UI に `aria-label`・`title`・`<span aria-hidden>` 追加
- [ ] 全テストケース（TC-IC/TT/A1/RG）が PASS
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: 実装ファイル一覧確認
- [ ] Task 2 完了: 全実装内容の適用
- [ ] Task 3 完了: TDD Green 確認
- [ ] Task 4 完了: 型チェック PASS
- [ ] Task 5 完了: Lint PASS

---

## 次Phase

Phase 5 完了後 → **Phase 6: テスト拡充** へ進む
