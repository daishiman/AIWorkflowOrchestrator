# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 8                   |
| Phase名    | リファクタリング    |
| 前提Phase  | Phase 7             |
| 後続Phase  | Phase 9             |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

TDDサイクルのRefactorフェーズとして、テストが全てパスする状態を維持しながらコードの品質を向上させる。

## 背景

Phase 5（Green）で「動作するコード」が完成し、Phase 6-7でテストカバレッジが確保された状態。この段階でリファクタリングを行い、可読性・保守性・パフォーマンスを向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード重複の除去

**目的**: DRY原則に従い、重複コードを共通化する

**実行手順**:

1. 重複パターンを特定:

```typescript
// 共通化候補1: スキルカード内のバッジレンダリング
// Before: 各コンポーネントで同様のバッジ表示ロジック
const renderBadge = (text: string, color: string) => (
  <span className={`badge ${color}`}>{text}</span>
);

// After: 共通コンポーネント化
// src/renderer/components/common/Badge.tsx
interface BadgeProps {
  text: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ text, variant }) => (
  <span className={`badge badge-${variant}`}>{text}</span>
);
```

2. 共通ユーティリティの抽出:

```typescript
// 共通化候補2: スキルフィルタリングロジック
// src/renderer/utils/skillFilters.ts
export const filterSkillsByCategory = (
  skills: Skill[],
  category: SkillCategory | "all",
): Skill[] => {
  if (category === "all") return skills;
  return skills.filter((s) => s.category === category);
};

export const filterSkillsBySearch = (
  skills: Skill[],
  query: string,
): Skill[] => {
  if (!query.trim()) return skills;
  const lowerQuery = query.toLowerCase();
  return skills.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.triggers.some((t) => t.toLowerCase().includes(lowerQuery)),
  );
};
```

3. テストを実行して動作確認:

```bash
pnpm --filter @repo/desktop test
```

**期待される成果物**:

- リファクタリング記録（`outputs/phase-8/deduplication.md`）

---

### タスク2: コンポーネント分割・責務分離

**目的**: 単一責任原則に従い、コンポーネントを適切に分割する

**実行手順**:

1. 大きすぎるコンポーネントを特定（目安: 100行以上）

2. SkillDetailPanelの分割例:

```typescript
// Before: 1つの大きなコンポーネント
// src/renderer/components/skills/SkillDetailPanel.tsx

// After: 責務ごとに分割
// src/renderer/components/skills/SkillDetailPanel/
├── index.tsx              // メインコンポーネント
├── SkillHeader.tsx        // ヘッダー部（名前、カテゴリ）
├── SkillDescription.tsx   // 説明部
├── SkillTriggers.tsx      // トリガー一覧
├── SkillAnchors.tsx       // アンカー一覧
└── SkillActions.tsx       // アクションボタン群
```

3. 分割後のテスト確認:

```bash
pnpm --filter @repo/desktop test
```

**期待される成果物**:

- コンポーネント分割記録（`outputs/phase-8/component-split.md`）

---

### タスク3: カスタムフックの抽出

**目的**: ロジックをカスタムフックに抽出し、コンポーネントをプレゼンテーションに集中させる

**実行手順**:

1. スキル管理用カスタムフックの作成:

```typescript
// src/renderer/hooks/useSkillManagement.ts
import { useAgentStore } from "@/renderer/store/agentStore";
import { useCallback, useMemo } from "react";

export const useSkillManagement = () => {
  const {
    availableSkills,
    importedSkills,
    skillFilter,
    skillCategory,
    selectedSkill,
    setSkillFilter,
    setSkillCategory,
    selectSkill,
    importSkill,
    removeSkill,
  } = useAgentStore();

  // フィルタリング済みスキル一覧
  const filteredSkills = useMemo(() => {
    let result = availableSkills;

    // カテゴリフィルタ
    if (skillCategory !== "all") {
      result = result.filter((s) => s.category === skillCategory);
    }

    // 検索フィルタ
    if (skillFilter.trim()) {
      const query = skillFilter.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query),
      );
    }

    return result;
  }, [availableSkills, skillCategory, skillFilter]);

  // インポート済み判定
  const isImported = useCallback(
    (skillId: string) => importedSkills.some((s) => s.id === skillId),
    [importedSkills],
  );

  return {
    filteredSkills,
    selectedSkill,
    skillFilter,
    skillCategory,
    isImported,
    setSkillFilter,
    setSkillCategory,
    selectSkill,
    importSkill,
    removeSkill,
  };
};
```

2. スキル検索用カスタムフックの作成:

```typescript
// src/renderer/hooks/useSkillSearch.ts
import { useState, useCallback, useMemo } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export const useSkillSearch = (skills: Skill[], debounceMs = 300) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, debounceMs);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return skills;

    const lowerQuery = debouncedQuery.toLowerCase();
    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.triggers.some((t) => t.toLowerCase().includes(lowerQuery)),
    );
  }, [skills, debouncedQuery]);

  const clearSearch = useCallback(() => setQuery(""), []);

  return {
    query,
    setQuery,
    results,
    clearSearch,
    isSearching: query !== debouncedQuery,
  };
};
```

3. テストを実行:

```bash
pnpm --filter @repo/desktop test
```

**期待される成果物**:

- カスタムフック抽出記録（`outputs/phase-8/custom-hooks.md`）

---

### タスク4: 型定義の最適化

**目的**: TypeScript型定義を最適化し、型安全性を向上させる

**実行手順**:

1. 型定義の見直し:

```typescript
// src/shared/types/skill.ts

// Branded型の導入（型の誤使用防止）
type SkillId = string & { readonly _brand: "SkillId" };
type SkillSlug = string & { readonly _brand: "SkillSlug" };

// ファクトリ関数
export const createSkillId = (id: string): SkillId => id as SkillId;
export const createSkillSlug = (slug: string): SkillSlug => slug as SkillSlug;

// 厳密な型定義
export interface Skill {
  readonly id: SkillId;
  readonly slug: SkillSlug;
  readonly name: string;
  readonly description: string;
  readonly path: string;
  readonly triggers: readonly string[];
  readonly anchors: readonly Anchor[];
  readonly category?: SkillCategory;
  readonly lastUpdated?: string;
}

// Immutable配列の使用
export type SkillList = readonly Skill[];
```

2. ユーティリティ型の活用:

```typescript
// コンポーネントProps用のユーティリティ型
export type SkillCardProps = Pick<
  Skill,
  "name" | "description" | "category" | "triggers"
> & {
  isSelected: boolean;
  onClick: () => void;
};

// 状態管理用の型
export type SkillFilterState = {
  query: string;
  category: SkillCategory | "all";
};
```

3. 型チェックを実行:

```bash
pnpm --filter @repo/desktop typecheck
```

**期待される成果物**:

- 型定義最適化記録（`outputs/phase-8/type-optimization.md`）

---

### タスク5: パフォーマンス最適化

**目的**: 不要な再レンダリングを防ぎ、パフォーマンスを向上させる

**実行手順**:

1. メモ化の適用:

```typescript
// SkillCard: React.memoの適用
export const SkillCard = React.memo<SkillCardProps>(({
  skill,
  isSelected,
  onClick,
}) => {
  // ... 実装
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return (
    prevProps.skill.id === nextProps.skill.id &&
    prevProps.isSelected === nextProps.isSelected
  );
});

// SkillList: useMemoでのリスト最適化
const memoizedSkillCards = useMemo(
  () => filteredSkills.map(skill => (
    <SkillCard
      key={skill.id}
      skill={skill}
      isSelected={selectedSkill?.id === skill.id}
      onClick={() => selectSkill(skill.id)}
    />
  )),
  [filteredSkills, selectedSkill?.id, selectSkill]
);
```

2. コールバックの最適化:

```typescript
// useCallbackの適用
const handleSkillClick = useCallback(
  (skillId: string) => {
    selectSkill(skillId);
  },
  [selectSkill],
);

const handleSearchChange = useCallback(
  (event: React.ChangeEvent<HTMLInputElement>) => {
    setSkillFilter(event.target.value);
  },
  [setSkillFilter],
);
```

3. 仮想スクロールの検討（大量データ時）:

```typescript
// 100件以上のスキルがある場合は仮想スクロールを検討
// react-virtualを使用した実装例
import { useVirtualizer } from "@tanstack/react-virtual";

const SkillListVirtual: React.FC<SkillListVirtualProps> = ({ skills }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: skills.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // 1アイテムの推定高さ
  });

  // ... 仮想スクロール実装
};
```

4. パフォーマンステストの実行:

```bash
pnpm --filter @repo/desktop test:perf
```

**期待される成果物**:

- パフォーマンス最適化記録（`outputs/phase-8/performance-optimization.md`）

---

### タスク6: リファクタリング完了確認

**目的**: 全てのリファクタリングが完了し、テストがパスすることを確認する

**実行手順**:

1. 全テストを実行:

```bash
pnpm --filter @repo/desktop test
```

2. カバレッジが維持されていることを確認:

```bash
pnpm --filter @repo/desktop test:coverage
```

3. リファクタリングチェックリスト:

| #   | チェック項目                   | 確認結果 |
| --- | ------------------------------ | -------- |
| 1   | 全テストがパスしている         | [ ]      |
| 2   | カバレッジが維持されている     | [ ]      |
| 3   | 重複コードが除去されている     | [ ]      |
| 4   | コンポーネントが適切に分割     | [ ]      |
| 5   | カスタムフックが抽出されている | [ ]      |
| 6   | 型定義が最適化されている       | [ ]      |
| 7   | パフォーマンス最適化が完了     | [ ]      |

4. リファクタリング結果を文書化

**期待される成果物**:

- リファクタリング完了報告（`outputs/phase-8/refactoring-complete.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容               |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------ |
| アーキテクチャパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | コード構造パターン |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計 |
| Phase 7成果物           | `outputs/phase-7/`                                                           | カバレッジ結果     |

---

## 成果物

| 成果物                   | パス                                          | 内容             |
| ------------------------ | --------------------------------------------- | ---------------- |
| 重複除去記録             | `outputs/phase-8/deduplication.md`            | DRY原則適用結果  |
| コンポーネント分割記録   | `outputs/phase-8/component-split.md`          | SRP適用結果      |
| カスタムフック抽出記録   | `outputs/phase-8/custom-hooks.md`             | ロジック分離結果 |
| 型定義最適化記録         | `outputs/phase-8/type-optimization.md`        | 型安全性向上結果 |
| パフォーマンス最適化記録 | `outputs/phase-8/performance-optimization.md` | 最適化結果       |
| リファクタリング完了報告 | `outputs/phase-8/refactoring-complete.md`     | 総合報告         |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 8での統合テスト連携アクション

- リファクタリング後の結合テスト実行
- カスタムフック抽出後のテスト更新
- パフォーマンス最適化後の動作確認

---

## 完了条件

- [ ] 重複コードが除去されている
- [ ] コンポーネントが適切に分割されている
- [ ] カスタムフックが抽出されている
- [ ] 型定義が最適化されている
- [ ] パフォーマンス最適化が完了している
- [ ] 全テストがパスしている
- [ ] カバレッジが維持されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート判定

### 判定基準

| 判定  | 条件                               | 次のアクション |
| ----- | ---------------------------------- | -------------- |
| PASS  | 全リファクタリング完了、テストパス | Phase 9へ進行  |
| MINOR | 軽微な残課題あり                   | 対応後Phase 9  |
| MAJOR | テスト失敗またはカバレッジ低下     | 問題解決が必要 |

---

## 依存関係

- **前提**: Phase 7（カバレッジ検証ゲート）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-management-ui/phase-9-quality.md`
