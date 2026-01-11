# Phase 8: カスタムフック抽出記録

## 実行日時

2026-01-11 12:27

## 現状分析

### 既存のロジック分離状況

| コンポーネント      | ロジック           | 分離状況       |
| ------------------- | ------------------ | -------------- |
| SkillSearchBar      | デバウンス検索     | 内部実装       |
| SkillList           | フィルタリング     | useMemoで実装  |
| SkillImportDialog   | 選択状態管理       | useStateで実装 |
| SkillDetailPanel    | なし（表示のみ）   | -              |
| SkillCard           | なし（表示のみ）   | -              |
| SkillCategoryFilter | なし（単純な選択） | -              |

### カスタムフック候補

#### 1. useSkillFilter

**目的**: スキルフィルタリングロジックの共通化

**現状**:

```typescript
// SkillList内
const filteredSkills = useMemo(() => {
  return skills.filter((skill) => {
    if (category && skill.category !== category) return false;
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      return (
        skill.name.toLowerCase().includes(lowerFilter) ||
        skill.description.toLowerCase().includes(lowerFilter) ||
        skill.triggers.some((t) => t.toLowerCase().includes(lowerFilter))
      );
    }
    return true;
  });
}, [skills, filter, category]);
```

**抽出後**:

```typescript
// hooks/useSkillFilter.ts
export const useSkillFilter = (
  skills: Skill[],
  filter: string,
  category: SkillCategory | null,
) => {
  return useMemo(() => {
    return skills.filter((skill) => {
      if (category && skill.category !== category) return false;
      if (filter) {
        const lowerFilter = filter.toLowerCase();
        return (
          skill.name.toLowerCase().includes(lowerFilter) ||
          skill.description.toLowerCase().includes(lowerFilter) ||
          skill.triggers.some((t) => t.toLowerCase().includes(lowerFilter))
        );
      }
      return true;
    });
  }, [skills, filter, category]);
};
```

**判定**: 抽出可能だが、現状では1箇所でのみ使用。再利用性が確認されるまで現状維持。

#### 2. useDebounceSearch

**目的**: 検索デバウンスロジックの抽出

**現状**:

```typescript
// SkillSearchBar内
const [inputValue, setInputValue] = useState(value);

useEffect(() => {
  const timer = setTimeout(() => {
    onChange(inputValue);
  }, 300);
  return () => clearTimeout(timer);
}, [inputValue, onChange]);
```

**抽出後**:

```typescript
// hooks/useDebounceSearch.ts
export const useDebounceSearch = (
  initialValue: string,
  onChange: (value: string) => void,
  delay = 300,
) => {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue);
    }, delay);
    return () => clearTimeout(timer);
  }, [inputValue, onChange, delay]);

  return { inputValue, setInputValue };
};
```

**判定**: 抽出可能。ただし、コンポーネント内での実装が簡潔で、可読性が高いため現状維持。

## 抽出見送り理由

| フック候補        | 見送り理由                               |
| ----------------- | ---------------------------------------- |
| useSkillFilter    | 現在1箇所でのみ使用、再利用性未確認      |
| useDebounceSearch | コンポーネント内実装が簡潔で可読性が高い |
| useSkillSelection | 状態管理はZustandで一元管理されている    |

## 結論

現在のコードは以下の理由でカスタムフック抽出を見送ります:

1. **再利用性**: 各ロジックは現在1箇所でのみ使用
2. **可読性**: コンポーネント内実装の方が文脈が明確
3. **状態管理**: Zustandで一元管理されており、フック抽出の必要性が低い

**判定**: カスタムフック抽出不要（将来的な再利用時に検討）
