# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 4                     |
| 機能名 | 検索・置換機能 UI実装 |
| 作成日 | 2026-01-05            |

## 目的

UIコンポーネントとE2Eの失敗するテストを作成する（Red状態）。

## 背景

Phase 0で除外解除されたテストファイル（SearchPanel.test.tsx、WorkspaceSearchPanel.test.tsx）は**既に作成済み**。
本Phaseでは:

1. 既存テストが正しくRed状態であることを確認
2. 不足しているE2Eテストを追加作成

## 使用スキル

| スキル             | パス                                         | 選定理由                                 |
| ------------------ | -------------------------------------------- | ---------------------------------------- |
| frontend-testing   | `.claude/skills/frontend-testing/SKILL.md`   | Vitest + RTLでのコンポーネントテスト設計 |
| playwright-testing | `.claude/skills/playwright-testing/SKILL.md` | E2Eテストのセレクタ戦略・待機戦略        |

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料        | パス                                                                | 内容               |
| --------------- | ------------------------------------------------------------------- | ------------------ |
| UI/UXパネル設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md` | 検索パネルのUI仕様 |
| 内部API仕様     | `.claude/skills/aiworkflow-requirements/references/api-internal.md` | SearchService API  |

## 参照資料

| 資料名                 | パス                                                                       | 説明                     |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------ |
| Phase 0成果物          | `outputs/phase-0/` (設定ファイル更新)                                      | 除外解除完了             |
| 既存テスト設計         | `docs/30-workflows/search-replace-functionality/phase-4-testing.md`        | バックエンド側テスト設計 |
| SearchPanel テスト     | `apps/desktop/src/features/search/__tests__/SearchPanel.test.tsx`          | 作成済みテスト           |
| WorkspaceSearch テスト | `apps/desktop/src/features/search/__tests__/WorkspaceSearchPanel.test.tsx` | 作成済みテスト           |

## 実行手順

### ステップ1: 既存テストのRed状態確認

```bash
# ユニットテスト実行（失敗することを確認）
pnpm --filter @repo/desktop test:run src/features/search/__tests__/SearchPanel.test.tsx
pnpm --filter @repo/desktop test:run src/features/search/__tests__/WorkspaceSearchPanel.test.tsx
```

**期待結果**: importエラーまたはコンポーネント未定義エラーで失敗

### ステップ2: 既存テストケースのレビュー

frontend-testingスキルを参照し、既存テストケースが以下をカバーしていることを確認:

**SearchPanel.test.tsx（約30件）**

- [ ] 検索入力とリアルタイム検索
- [ ] オプション切替（大文字小文字/単語単位/正規表現）
- [ ] 置換操作（単一/全置換）
- [ ] キーボードナビゲーション（Escape, Enter, Tab）
- [ ] アクセシビリティ（aria-label, role）

**WorkspaceSearchPanel.test.tsx（約25件）**

- [ ] ワークスペース検索実行
- [ ] ファイルフィルタ適用
- [ ] 結果一覧表示
- [ ] ファイルジャンプ機能
- [ ] ローディング/エラー状態

### ステップ3: E2Eテスト作成

playwright-testingスキルを参照し、E2Eテストを作成:

```typescript
// apps/desktop/tests/e2e/search.spec.ts

import { test, expect } from "@playwright/test";

test.describe("検索・置換機能", () => {
  test("Cmd+Fで検索パネルが開く", async ({ page }) => {
    // キーボードショートカットテスト
  });

  test("検索入力でリアルタイム検索が動作する", async ({ page }) => {
    // 検索機能テスト
  });

  test("置換操作が正常に動作する", async ({ page }) => {
    // 置換機能テスト
  });

  test("Cmd+Shift+Fでワークスペース検索パネルが開く", async ({ page }) => {
    // ワークスペース検索テスト
  });
});
```

### ステップ4: テストカバレッジ目標設定

| 指標               | 目標値 |
| ------------------ | ------ |
| ユニットテスト件数 | 55件+  |
| E2Eテスト件数      | 10件+  |
| カバレッジ         | 80%+   |

## 成果物

| 成果物             | パス                                                    | 説明                 |
| ------------------ | ------------------------------------------------------- | -------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                 | テスト設計           |
| テストケース一覧   | `outputs/phase-4/test-cases.md`                         | ケース一覧           |
| E2Eテストファイル  | `apps/desktop/tests/e2e/search.spec.ts`                 | 新規作成             |
| 既存ユニットテスト | `apps/desktop/src/features/search/__tests__/*.test.tsx` | 作成済み（確認のみ） |

## 完了条件

- [ ] 既存のSearchPanel.test.tsxがRed状態（約30テストケース失敗）
- [ ] 既存のWorkspaceSearchPanel.test.tsxがRed状態（約25テストケース失敗）
- [ ] E2Eテスト（search.spec.ts）が作成されている
- [ ] E2Eテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] テスト仕様書が出力されている

## スキルフィードバック記録

| スキル             | 結果 | 備考              |
| ------------------ | ---- | ----------------- |
| frontend-testing   | -    | Phase完了後に記録 |
| playwright-testing | -    | Phase完了後に記録 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 既存テストのRed状態確認
2. SearchPanel.test.tsx テストケースレビュー
3. WorkspaceSearchPanel.test.tsx テストケースレビュー
4. E2Eテスト作成
5. テスト仕様書出力
6. スキルフィードバック記録

## 次のPhase

Phase 5: 実装（TDD: Green）
