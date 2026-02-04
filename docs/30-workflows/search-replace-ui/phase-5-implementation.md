# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 5                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

E2Eテストを通すための実装を行う。既存実装を活用しつつ、不足部分を補完する。

## 既存実装の活用

### 完全に活用可能

| コンポーネント/モジュール     | 状態 | 備考                     |
| ----------------------------- | ---- | ------------------------ |
| SearchPanel.tsx               | 完成 | 変更不要                 |
| WorkspaceSearchPanel.tsx      | 完成 | IPCプロバイダ注入のみ    |
| SearchOptionButtons.tsx       | 完成 | 変更不要                 |
| useSearchStore.ts             | 完成 | 変更不要                 |
| useSearchKeyboardShortcuts.ts | 完成 | グローバル登録の確認必要 |
| executeSearch.ts              | 完成 | 変更不要                 |
| highlightUtils.tsx            | 完成 | 変更不要                 |

### 補完が必要

| 項目                     | 現状              | 必要な作業               |
| ------------------------ | ----------------- | ------------------------ |
| ワークスペース検索IPC    | プレースホルダー  | IPCプロバイダ実装        |
| グローバルショートカット | SearchPanel内のみ | AppLayout/EditorView統合 |
| Electron統合             | 部分的            | E2Eで動作確認            |

## 実行タスク

### Task 5-1: グローバルキーボードショートカット統合

EditorViewまたはAppLayoutでグローバルショートカットを登録する。

```typescript
// EditorView.tsxでの統合例
import { useSearchKeyboardShortcuts } from "@/features/search/hooks/useSearchKeyboardShortcuts";

function EditorView() {
  const { openFileSearch, openWorkspaceSearch } = useSearchKeyboardShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        openFileSearch();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        openWorkspaceSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openFileSearch, openWorkspaceSearch]);
}
```

### Task 5-2: ワークスペース検索IPCプロバイダ実装

WorkspaceSearchPanelにIPCプロバイダを注入する。

```typescript
// hooks/useWorkspaceSearchProvider.ts
export function useWorkspaceSearchProvider() {
  return async function* workspaceSearchProvider(
    workspacePath: string,
    query: string,
    options: SearchProviderOptions,
  ): AsyncGenerator<FileSearchResult> {
    // IPC呼び出し
    const results = await window.api.search.workspace(
      workspacePath,
      query,
      options,
    );
    for (const result of results) {
      yield result;
    }
  };
}
```

### Task 5-3: 検索パネルのEditorView統合確認

既存の統合が正しく動作することを確認する。

### Task 5-4: E2Eテストを通す

E2Eテストが全てPASSすることを確認する。

## 統合テスト連携【必須】

フロント/バック接続の実装確認:

| 実装項目       | 内容                               |
| -------------- | ---------------------------------- |
| キーボード統合 | グローバルショートカットの登録     |
| IPC接続        | ワークスペース検索プロバイダ       |
| エディタ連携   | EditorInstance経由のハイライト制御 |

## アーキテクチャ層別実装

| 層                         | 実装観点                     | 実装ファイル                          |
| -------------------------- | ---------------------------- | ------------------------------------- |
| フロントエンド（Renderer） | グローバルショートカット統合 | `EditorView.tsx` or `AppLayout.tsx`   |
| IPC通信                    | ワークスペース検索プロバイダ | `hooks/useWorkspaceSearchProvider.ts` |
| 統合                       | 検索パネル統合               | 既存コンポーネント活用                |

## 成果物

| 成果物                       | パス                                      | 説明               |
| ---------------------------- | ----------------------------------------- | ------------------ |
| グローバルショートカット統合 | `apps/desktop/src/renderer/...`           | ショートカット登録 |
| IPCプロバイダ                | `apps/desktop/src/features/search/hooks/` | IPC連携            |

## 完了条件

- [ ] グローバルキーボードショートカットが動作する
- [ ] ワークスペース検索IPCが動作する
- [ ] 全E2Eテストが成功状態（Green）
- [ ] 既存ユニット/統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 5-1: グローバルキーボードショートカット統合
2. Task 5-2: ワークスペース検索IPCプロバイダ実装
3. Task 5-3: 検索パネルのEditorView統合確認
4. Task 5-4: E2Eテストを通す（Green状態確認）
5. ユニットテスト継続成功確認

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 5-1〜5-4）を100%実行完了
- [ ] TDD Green状態が確認されている
- [ ] 既存テストも継続成功
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 5
```

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop test:e2e

# 確認項目
# - [ ] ユニットテストが成功
# - [ ] 統合テストが成功
# - [ ] E2Eテストが成功（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
