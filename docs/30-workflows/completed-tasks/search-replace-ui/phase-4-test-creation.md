# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 4                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

E2Eテストを作成し、失敗状態（Red）を確認する。既存のユニットテスト・統合テストは活用する。

## 既存テスト確認

### 既存ユニットテスト（活用）

| テストファイル                       | テスト数 | カバレッジ |
| ------------------------------------ | -------- | ---------- |
| `SearchPanel.test.tsx`               | 約60件   | 高         |
| `WorkspaceSearchPanel.test.tsx`      | 約50件   | 高         |
| `useSearchStore.test.ts`             | 約20件   | 高         |
| `useSearchKeyboardShortcuts.test.ts` | 約15件   | 高         |
| `TextAreaEditorAdapter.test.ts`      | 約20件   | 高         |

### 既存統合テスト（活用）

| テストファイル                        | 内容                     |
| ------------------------------------- | ------------------------ |
| `Accessibility.test.tsx`              | アクセシビリティテスト   |
| `EdgeCases.test.tsx`                  | エッジケーステスト       |
| `EditorViewIntegration.test.tsx`      | エディタ統合テスト       |
| `ErrorHandling.test.tsx`              | エラーハンドリングテスト |
| `KeyboardShortcuts.test.tsx`          | キーボードショートカット |
| `Performance.test.tsx`                | パフォーマンステスト     |
| `SearchPanelAdapter.test.tsx`         | アダプターテスト         |
| `WorkspaceSearchIntegration.test.tsx` | ワークスペース統合       |

## 新規作成テスト（E2E）

### E2Eテストファイル

```
apps/desktop/tests/e2e/search.spec.ts
```

### E2Eテストシナリオ

| シナリオID | テスト名                            | 概要                                 |
| ---------- | ----------------------------------- | ------------------------------------ |
| E2E-1      | should open search panel with Cmd+F | キーボードショートカットでパネル開く |
| E2E-2      | should search text in file          | ファイル内テキスト検索               |
| E2E-3      | should highlight search results     | 検索結果ハイライト                   |
| E2E-4      | should navigate between results     | F3/Shift+F3で結果間移動              |
| E2E-5      | should toggle search options        | 検索オプション切り替え               |
| E2E-6      | should replace text                 | 単一置換                             |
| E2E-7      | should replace all text             | 全置換                               |
| E2E-8      | should open workspace search        | Cmd+Shift+Fでワークスペース検索      |
| E2E-9      | should search across files          | ファイル横断検索                     |
| E2E-10     | should jump to file on click        | 結果クリックでファイルジャンプ       |
| E2E-11     | should close panel with Escape      | Escapeでパネル閉じる                 |
| E2E-12     | should be accessible                | アクセシビリティ検証                 |

## 実行手順

### 1. E2Eテスト作成

```typescript
// apps/desktop/tests/e2e/search.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Search Panel E2E", () => {
  test("should open search panel with Cmd+F", async ({ page }) => {
    // TODO: 実装
  });

  test("should search text in file", async ({ page }) => {
    // TODO: 実装
  });

  // ... 他のテストケース
});
```

### 2. ページオブジェクト作成

```typescript
// apps/desktop/tests/e2e/pages/SearchPanelPage.ts
export class SearchPanelPage {
  // TODO: 実装
}
```

### 3. テストが失敗することを確認

```bash
pnpm --filter @repo/desktop test:e2e
```

## 統合テスト連携【必須】

E2Eテストで以下の統合シナリオを確認:

| シナリオカテゴリ | 検証内容                      | テストID |
| ---------------- | ----------------------------- | -------- |
| キーボード操作   | Cmd+F/Ctrl+Fでパネル開閉      | E2E-1    |
| エディタ連携     | 検索結果ハイライト表示        | E2E-3    |
| 状態管理         | 検索オプション永続化          | E2E-5    |
| IPC連携          | ワークスペース検索API呼び出し | E2E-9    |

## 多角的チェック観点（AIが判断）

テスト作成時に以下の観点を確認する：

| 観点               | 適用判断 | 確認内容                           | 仕様参照先                     |
| ------------------ | -------- | ---------------------------------- | ------------------------------ |
| セキュリティ       | 適用     | ReDoS/パストラバーサルテストケース | `security-input-validation.md` |
| UI/UX              | 適用     | ショートカットテスト、a11yテスト   | `ui-ux-search-panel.md`        |
| エラーハンドリング | 適用     | エラーケーステスト                 | `error-handling.md`            |
| パフォーマンス     | 適用     | 応答時間テスト                     | `quality-requirements.md`      |

**Electronデスクトップアプリ観点**:

| 層               | テスト観点                 | テストファイル               |
| ---------------- | -------------------------- | ---------------------------- |
| Renderer Process | UIコンポーネント、状態管理 | 既存ユニットテスト（活用）   |
| Main Process     | 検索サービス               | 既存（packages/shared）      |
| IPC通信          | Main-Renderer連携          | E2Eテスト（新規作成）        |
| E2E              | エンドツーエンドフロー     | `search.spec.ts`（新規作成） |

## アーキテクチャ層別テスト

| 層               | テスト観点                 | テストファイル               |
| ---------------- | -------------------------- | ---------------------------- |
| Renderer Process | UIコンポーネント、状態管理 | 既存ユニットテスト（活用）   |
| Main Process     | 検索サービス               | 既存（packages/shared）      |
| IPC通信          | Main-Renderer連携          | E2Eテスト（新規作成）        |
| E2E              | エンドツーエンドフロー     | `search.spec.ts`（新規作成） |

## 成果物

| 成果物          | パス                                    | 説明       |
| --------------- | --------------------------------------- | ---------- |
| テスト仕様書    | `outputs/phase-4/test-specification.md` | テスト設計 |
| テストケース    | `outputs/phase-4/test-cases.md`         | ケース一覧 |
| E2Eテストコード | `apps/desktop/tests/e2e/search.spec.ts` | E2Eテスト  |

## 完了条件

- [ ] E2Eテストファイルが作成されている
- [ ] 全E2Eテストシナリオが実装されている
- [ ] E2Eテストが失敗状態（Red）であることを確認
- [ ] ページオブジェクトが作成されている
- [ ] 既存ユニット/統合テストが正常に実行されることを確認
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 既存テストの確認
2. E2Eテストファイル作成
3. ページオブジェクト作成
4. E2Eテストシナリオ実装（E2E-1〜E2E-12）
5. テスト失敗確認（Red状態）
6. 成果物の作成

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] E2Eテストコードが作成されている
- [ ] TDD Red状態が確認されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 4
```

## TDD検証

```bash
# E2Eテスト実行コマンド
pnpm --filter @repo/desktop test:e2e

# 確認項目
# - [ ] E2Eテストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
