---
id: TASK-7B
tier: 1
title: SkillImportDialog コンポーネント
phase: 7
depends_on: [TASK-6-1]
parallel_with: [TASK-7A, TASK-7C]
blocks: [TASK-7D]
status: pending
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, component, dialog]
---

# SkillImportDialog コンポーネント

## 概要

スキルの詳細情報を表示し、インポートを確認するダイアログコンポーネントを実装する。

## 入力

- TASK-6-1 で実装した SkillSlice
- UI/UX仕様（specification.md 4.3）

## 出力

- `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`
- コンポーネントテストファイル

## 実装詳細

### コンポーネント構造

```typescript
// apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx

import React from "react";
import type { SkillMetadata } from "@repo/shared";
import { useAppStore } from "../../store";

interface SkillImportDialogProps {
  skill: SkillMetadata;
  isOpen: boolean;
  onClose: () => void;
}

export const SkillImportDialog: React.FC<SkillImportDialogProps> = ({
  skill,
  isOpen,
  onClose,
}) => {
  const { importSkill, isImporting, importingSkillName } = useAppStore();

  const handleImport = async () => {
    await importSkill(skill.name);
    onClose();
  };

  if (!isOpen) return null;

  const isCurrentlyImporting = isImporting && importingSkillName === skill.name;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">スキルをインポート</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {/* スキル名 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xl font-medium">
              <span>📦</span>
              <span>{skill.name}</span>
            </div>
          </div>

          {/* 説明 */}
          <Section title="説明">
            <p className="text-sm text-gray-700">{skill.description}</p>
          </Section>

          {/* 許可ツール */}
          {skill.allowedTools && skill.allowedTools.length > 0 && (
            <Section title="許可ツール">
              <div className="flex flex-wrap gap-2">
                {skill.allowedTools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-1 text-xs bg-gray-100 rounded"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* サブエージェント */}
          {skill.agents.length > 0 && (
            <Section title={`サブエージェント (agents/) - ${skill.agents.length}件`}>
              <ResourceList resources={skill.agents} />
            </Section>
          )}

          {/* 参照資料 */}
          {skill.references.length > 0 && (
            <Section title={`参照資料 (references/) - ${skill.references.length}件`}>
              <ResourceList resources={skill.references} />
            </Section>
          )}

          {/* スクリプト */}
          {skill.scripts.length > 0 && (
            <Section title={`スクリプト (scripts/) - ${skill.scripts.length}件`}>
              <ResourceList resources={skill.scripts} />
            </Section>
          )}

          {/* アセット */}
          {skill.assets.length > 0 && (
            <Section title={`アセット (assets/) - ${skill.assets.length}件`}>
              <ResourceList resources={skill.assets} />
            </Section>
          )}

          {/* スキーマ */}
          {skill.schemas.length > 0 && (
            <Section title={`スキーマ (schemas/) - ${skill.schemas.length}件`}>
              <ResourceList resources={skill.schemas} />
            </Section>
          )}

          {/* インデックス */}
          {skill.indexes.length > 0 && (
            <Section title={`インデックス (indexes/) - ${skill.indexes.length}件`}>
              <ResourceList resources={skill.indexes} />
            </Section>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isCurrentlyImporting}
            className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isCurrentlyImporting}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCurrentlyImporting ? "インポート中..." : "インポート"}
          </button>
        </div>
      </div>
    </div>
  );
};

// セクションコンポーネント
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-4">
    <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
    <div className="pl-2 border-l-2 border-gray-200">{children}</div>
  </div>
);

// リソース一覧コンポーネント
import type { SkillSubResource } from "@repo/shared";

const ResourceList: React.FC<{ resources: SkillSubResource[] }> = ({
  resources,
}) => (
  <ul className="space-y-1">
    {resources.map((resource) => (
      <li key={resource.relativePath} className="flex items-start gap-2 text-sm">
        <span className="text-gray-400">•</span>
        <div>
          <span className="font-mono text-gray-700">{resource.filename}</span>
          {resource.description && (
            <span className="text-gray-500"> - {resource.description}</span>
          )}
        </div>
      </li>
    ))}
  </ul>
);
```

## ファイル

| 操作 | パス                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`                |
| 修正 | `apps/desktop/src/renderer/components/skill/index.ts`                             |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` |

## 依存パッケージ

なし（既存パッケージのみ使用）

## 完了条件

- [ ] ダイアログが開閉する
- [ ] スキル基本情報（名前、説明）が表示される
- [ ] 許可ツール一覧が表示される
- [ ] agents/ 一覧が表示される
- [ ] references/ 一覧が表示される
- [ ] scripts/ 一覧が表示される
- [ ] assets/ 一覧が表示される
- [ ] schemas/ 一覧が表示される
- [ ] indexes/ 一覧が表示される
- [ ] インポートボタンが機能する
- [ ] ローディング状態が表示される
- [ ] キャンセルボタンが機能する
- [ ] ESCキーでダイアログが閉じる
- [ ] コンポーネントテストが全て通過する

## テスト要件

### コンポーネントテスト

```typescript
describe("SkillImportDialog", () => {
  it("should not render when isOpen is false");
  it("should render skill name and description");
  it("should render allowed tools");
  it("should render agents list");
  it("should render references list");
  it("should call importSkill when import button clicked");
  it("should show loading state during import");
  it("should close dialog on cancel");
  it("should close dialog on close button");
});
```

## 参考資料

- [specification.md - 4.3 スキルインポートダイアログ](../specification.md)
