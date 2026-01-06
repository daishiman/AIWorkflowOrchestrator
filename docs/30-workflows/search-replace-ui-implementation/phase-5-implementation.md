# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 5                     |
| 機能名 | 検索・置換機能 UI実装 |
| 作成日 | 2026-01-05            |

## 目的

Phase 4で確認したテストを通すための最小限のUI実装を行う（Green状態）。

## 使用スキル

| スキル               | パス                                           | 選定理由                              |
| -------------------- | ---------------------------------------------- | ------------------------------------- |
| electron-ui-patterns | `.claude/skills/electron-ui-patterns/SKILL.md` | Electronアプリ向けUIパターン          |
| accessibility-wcag   | `.claude/skills/accessibility-wcag/SKILL.md`   | WCAG 2.1 AA準拠のアクセシビリティ実装 |
| state-lifting        | `.claude/skills/state-lifting/SKILL.md`        | Zustand状態管理の設計                 |

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                 | 内容                   |
| ---------------- | -------------------------------------------------------------------- | ---------------------- |
| UI/UXパネル設計  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`  | 検索パネルのUI仕様     |
| 内部API仕様      | `.claude/skills/aiworkflow-requirements/references/api-internal.md`  | SearchService API      |
| UIコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-components.md` | コンポーネント設計規約 |

## 参照資料

| 資料名           | パス                                                              | 説明               |
| ---------------- | ----------------------------------------------------------------- | ------------------ |
| Phase 4成果物    | `outputs/phase-4/test-specification.md`                           | テスト仕様         |
| 設計書           | `docs/30-workflows/search-replace-functionality/outputs/phase-2/` | アーキテクチャ設計 |
| バックエンド実装 | `packages/shared/src/search/`                                     | SearchService等    |

## 実行手順

### ステップ1: Zustand Store 実装

state-liftingスキルを参照し、検索状態管理ストアを実装:

```typescript
// apps/desktop/src/features/search/stores/useSearchStore.ts

import { create } from "zustand";

interface SearchState {
  // ファイル内検索
  isSearchPanelOpen: boolean;
  searchQuery: string;
  searchOptions: SearchOptions;
  searchResults: SearchResult[];

  // ワークスペース検索
  isWorkspaceSearchOpen: boolean;
  workspaceQuery: string;
  workspaceResults: WorkspaceSearchResult[];

  // アクション
  openSearchPanel: () => void;
  closeSearchPanel: () => void;
  setSearchQuery: (query: string) => void;
  // ...
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // 実装
}));
```

### ステップ2: SearchPanel コンポーネント実装

electron-ui-patternsスキルを参照し、ファイル内検索パネルを実装:

```typescript
// apps/desktop/src/features/search/SearchPanel.tsx

import React from 'react';
import { useSearchStore } from './stores/useSearchStore';

export const SearchPanel: React.FC = () => {
  const { isSearchPanelOpen, searchQuery, setSearchQuery } = useSearchStore();

  if (!isSearchPanelOpen) return null;

  return (
    <div
      role="search"
      aria-label="ファイル内検索"
      className="search-panel"
    >
      {/* 検索入力 */}
      {/* オプションボタン */}
      {/* 置換入力 */}
      {/* アクションボタン */}
    </div>
  );
};
```

### ステップ3: WorkspaceSearchPanel コンポーネント実装

```typescript
// apps/desktop/src/features/search/WorkspaceSearchPanel.tsx

export const WorkspaceSearchPanel: React.FC = () => {
  // ワークスペース横断検索UI
};
```

### ステップ4: キーボードショートカット実装

```typescript
// apps/desktop/src/features/search/hooks/useSearchKeyboardShortcuts.ts

import { useEffect } from "react";
import { useSearchStore } from "../stores/useSearchStore";

export const useSearchKeyboardShortcuts = () => {
  const { openSearchPanel, openWorkspaceSearch } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F / Ctrl+F: ファイル内検索
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        openSearchPanel();
      }
      // Cmd+Shift+F / Ctrl+Shift+F: ワークスペース検索
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        openWorkspaceSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
```

### ステップ5: バックエンドとの連携

Electron IPC通信でSearchServiceと連携:

```typescript
// メインプロセス側
ipcMain.handle("search:find", async (_, params) => {
  return searchService.find(params);
});

// レンダラー側
const results = await window.electronAPI.search.find(params);
```

### ステップ6: テスト実行（Green確認）

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test:run src/features/search/

# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e tests/e2e/search.spec.ts
```

## 成果物

| 成果物                   | パス                                                                   | 説明                 |
| ------------------------ | ---------------------------------------------------------------------- | -------------------- |
| SearchPanel              | `apps/desktop/src/features/search/SearchPanel.tsx`                     | ファイル内検索パネル |
| WorkspaceSearchPanel     | `apps/desktop/src/features/search/WorkspaceSearchPanel.tsx`            | ワークスペース検索   |
| Zustand Store            | `apps/desktop/src/features/search/stores/useSearchStore.ts`            | 検索状態管理         |
| キーボードショートカット | `apps/desktop/src/features/search/hooks/useSearchKeyboardShortcuts.ts` | ショートカット       |
| 型定義                   | `apps/desktop/src/features/search/types.ts`                            | 型定義               |
| バレルエクスポート       | `apps/desktop/src/features/search/index.ts`                            | エクスポート         |

## 完了条件

- [ ] SearchPanel コンポーネントが実装されている
- [ ] WorkspaceSearchPanel コンポーネントが実装されている
- [ ] useSearchStore が実装されている
- [ ] useSearchKeyboardShortcuts が実装されている
- [ ] Cmd+F / Ctrl+F で検索パネルが開く
- [ ] Cmd+Shift+F / Ctrl+Shift+F でワークスペース検索が開く
- [ ] 検索・置換機能が動作する
- [ ] 全ユニットテストがGreen状態
- [ ] 全E2Eテストがパス

## スキルフィードバック記録

| スキル               | 結果 | 備考              |
| -------------------- | ---- | ----------------- |
| electron-ui-patterns | -    | Phase完了後に記録 |
| accessibility-wcag   | -    | Phase完了後に記録 |
| state-lifting        | -    | Phase完了後に記録 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. useSearchStore 実装
2. SearchPanel 実装
3. WorkspaceSearchPanel 実装
4. useSearchKeyboardShortcuts 実装
5. IPC連携実装
6. ユニットテスト全パス確認
7. E2Eテスト全パス確認
8. スキルフィードバック記録

## 次のPhase

Phase 6: リファクタリング（TDD: Refactor）
