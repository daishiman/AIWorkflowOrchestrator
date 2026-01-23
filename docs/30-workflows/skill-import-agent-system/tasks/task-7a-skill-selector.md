---
id: TASK-7A
tier: 1
title: SkillSelector コンポーネント
phase: 7
depends_on: [TASK-6-1]
parallel_with: [TASK-7B, TASK-7C]
blocks: [TASK-7D]
status: pending
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, component]
---

# SkillSelector コンポーネント

## 概要

スキルを選択するためのドロップダウンコンポーネントを実装する。
既存の `ModelSelector` パターンに準拠し、アクセシビリティ要件を満たす。

## 入力

- TASK-6-1 で実装した SkillSlice
- 既存の `ModelSelector` パターン
- UI/UX仕様（specification.md 4.2）

## 出力

- `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`
- コンポーネントテストファイル

## 実装詳細

### コンポーネント構造

```typescript
// apps/desktop/src/renderer/components/skill/SkillSelector.tsx

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../store";

interface SkillSelectorProps {
  className?: string;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({ className }) => {
  const {
    availableSkills,
    importedSkills,
    selectedSkillName,
    isLoadingSkills,
    isScanning,
    selectSkill,
    rescanSkills,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSkill = importedSkills.find((s) => s.name === selectedSkillName);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="スキルを選択"
        className="flex items-center gap-2 px-3 py-1.5 rounded border"
      >
        <span>📦</span>
        <span>{selectedSkill?.name || "なし"}</span>
        <span>{isOpen ? "▴" : "▾"}</span>
      </button>

      {/* ドロップダウン */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="スキル一覧"
          className="absolute top-full mt-1 w-64 bg-white border rounded shadow-lg z-50"
        >
          {/* なし選択 */}
          <SkillOption
            name={null}
            label="なし（スキルを使用しない）"
            isSelected={!selectedSkillName}
            onSelect={() => {
              selectSkill(null);
              setIsOpen(false);
            }}
          />

          {/* インポート済み */}
          {importedSkills.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-gray-500 border-t">
                インポート済み ({importedSkills.length})
              </div>
              {importedSkills.map((skill) => (
                <SkillOption
                  key={skill.name}
                  name={skill.name}
                  description={skill.description}
                  agentCount={skill.agents.length}
                  referenceCount={skill.references.length}
                  isSelected={selectedSkillName === skill.name}
                  onSelect={() => {
                    selectSkill(skill.name);
                    setIsOpen(false);
                  }}
                />
              ))}
            </>
          )}

          {/* 利用可能（未インポート） */}
          {availableSkills.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-gray-500 border-t">
                利用可能なスキル ({availableSkills.length})
              </div>
              {availableSkills
                .filter((s) => !importedSkills.some((i) => i.name === s.name))
                .map((skill) => (
                  <SkillOptionUnimported
                    key={skill.name}
                    skill={skill}
                    onImport={() => {
                      // インポートダイアログを開く（TASK-7Bで実装）
                    }}
                  />
                ))}
            </>
          )}

          {/* フッター */}
          <div className="flex justify-between px-3 py-2 border-t">
            <button
              type="button"
              onClick={rescanSkills}
              disabled={isScanning}
              className="text-sm text-blue-600"
            >
              🔄 {isScanning ? "スキャン中..." : "再スキャン"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 個別オプションコンポーネント
interface SkillOptionProps {
  name: string | null;
  label?: string;
  description?: string;
  agentCount?: number;
  referenceCount?: number;
  isSelected: boolean;
  onSelect: () => void;
}

const SkillOption: React.FC<SkillOptionProps> = ({
  name,
  label,
  description,
  agentCount,
  referenceCount,
  isSelected,
  onSelect,
}) => (
  <button
    type="button"
    role="option"
    aria-selected={isSelected}
    onClick={onSelect}
    className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
      isSelected ? "bg-blue-50" : ""
    }`}
  >
    <div className="flex items-center gap-2">
      <span>{isSelected ? "●" : "○"}</span>
      <span className="font-medium">{label || name}</span>
    </div>
    {description && (
      <div className="ml-5 text-xs text-gray-500 truncate">{description}</div>
    )}
    {(agentCount !== undefined || referenceCount !== undefined) && (
      <div className="ml-5 text-xs text-gray-400">
        サブエージェント: {agentCount || 0}個 | 参照資料: {referenceCount || 0}個
      </div>
    )}
  </button>
);
```

### キーボードナビゲーション

```typescript
const keyboardHandlers: Record<string, () => void> = {
  Enter: () => {
    /* 選択を確定 */
  },
  Space: () => {
    /* 選択を確定 */
  },
  Escape: () => setIsOpen(false),
  ArrowUp: () => {
    /* 前のオプションにフォーカス */
  },
  ArrowDown: () => {
    /* 次のオプションにフォーカス */
  },
  Home: () => {
    /* 最初のオプションにフォーカス */
  },
  End: () => {
    /* 最後のオプションにフォーカス */
  },
};
```

## ファイル

| 操作 | パス                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                |
| 作成 | `apps/desktop/src/renderer/components/skill/index.ts`                         |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` |

## 依存パッケージ

なし（既存パッケージのみ使用）

## 完了条件

- [ ] ドロップダウンUIが実装されている
- [ ] インポート済み / 利用可能 のセクション分けがされている
- [ ] スキル選択が機能する
- [ ] 「再スキャン」ボタンが機能する
- [ ] アクセシビリティ属性（ARIA）が設定されている
- [ ] キーボードナビゲーションが実装されている
- [ ] 外側クリックでドロップダウンが閉じる
- [ ] コンポーネントテストが全て通過する

## テスト要件

### コンポーネントテスト

```typescript
describe("SkillSelector", () => {
  it("should render with no skill selected");
  it("should open dropdown when clicked");
  it("should close dropdown when clicking outside");
  it("should select skill when option clicked");
  it("should show imported skills section");
  it("should show available skills section");
  it("should handle keyboard navigation");
  it("should call rescan when button clicked");
});
```

## 参考資料

- [specification.md - 4.2 スキルセレクター詳細](../specification.md)
- [specification.md - 4.6 アクセシビリティ要件](../specification.md)
- 既存パターン: `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`
