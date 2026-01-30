# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 4                           |
| 機能名 | TASK-7B-skill-import-dialog |
| 作成日 | 2026-01-30                  |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- SkillImportDialog テスト: ダイアログコンポーネントのテスト作成
- Section/ResourceList テスト: 内部コンポーネントのテスト作成
- アクセシビリティテスト: ARIA属性・キーボード操作のテスト作成

## 参照資料

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | Phase 2成果物 |
| 設計レビュー       | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                    | 内容       |
| ---------- | ----------------------------------------------------------------------- | ---------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md` | テスト方針 |

## 実行手順

### ステップ1: テストシナリオ設計

受け入れ基準からテストシナリオを導出する。

#### SkillImportDialog テストシナリオ

| TC-ID  | テスト内容                                      | 期待結果                              |
| ------ | ----------------------------------------------- | ------------------------------------- |
| TC-401 | isOpen=falseのときDOMに存在しない               | nullが返される                        |
| TC-402 | isOpen=trueのときダイアログが表示される         | ダイアログがDOMに存在                 |
| TC-403 | スキル名が表示される                            | skill.nameがテキストとして存在        |
| TC-404 | スキル説明が表示される                          | skill.descriptionがテキストとして存在 |
| TC-405 | 許可ツールが表示される                          | allowedToolsの各ツールが表示          |
| TC-406 | agents一覧が表示される                          | agentsのfilenameが表示                |
| TC-407 | references一覧が表示される                      | referencesのfilenameが表示            |
| TC-408 | インポートボタンクリックでimportSkillが呼ばれる | importSkillが引数skill.nameで呼ばれる |
| TC-409 | インポート中にローディング状態が表示される      | 「インポート中...」テキストが表示     |
| TC-410 | キャンセルボタンでonCloseが呼ばれる             | onCloseコールバックが1回呼ばれる      |
| TC-411 | ×ボタンでonCloseが呼ばれる                      | onCloseコールバックが1回呼ばれる      |
| TC-412 | ESCキーでonCloseが呼ばれる                      | onCloseコールバックが1回呼ばれる      |
| TC-413 | 空配列のセクションが非表示                      | agents=[]のときセクション非表示       |
| TC-414 | インポート中はボタンがdisabled                  | キャンセル・インポートが無効化        |

#### アクセシビリティテストシナリオ

| TC-ID  | テスト内容                                    | 期待結果                              |
| ------ | --------------------------------------------- | ------------------------------------- |
| TC-421 | role="dialog"が設定されている                 | ダイアログ要素にrole属性あり          |
| TC-422 | aria-modal="true"が設定されている             | ダイアログ要素にaria-modal属性あり    |
| TC-423 | aria-labelledbyでタイトルと関連付けられている | aria-labelledby属性がタイトルIDを参照 |
| TC-424 | 閉じるボタンにaria-label="閉じる"がある       | ボタン要素にaria-label属性あり        |

### ステップ2: テストファイル作成

#### SkillImportDialog.test.tsx

テストファイルを以下に作成:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillImportDialog } from "../SkillImportDialog";
import type { SkillMetadata } from "@repo/shared";

// useAppStoreモック
vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
}));

const mockSkill: SkillMetadata = {
  name: "test-skill",
  description: "テスト用スキル",
  allowedTools: ["Bash", "Read", "Write"],
  path: "/path/to/skill",
  updatedAt: new Date(),
  agents: [
    { filename: "agent-1.md", relativePath: "agents/agent-1.md", size: 100 },
  ],
  references: [
    {
      filename: "ref-1.md",
      relativePath: "references/ref-1.md",
      description: "参照1",
      size: 200,
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
};

describe("SkillImportDialog", () => {
  describe("表示制御", () => {
    it("TC-401: isOpen=falseのときDOMに存在しない");
    it("TC-402: isOpen=trueのときダイアログが表示される");
  });

  describe("スキル情報表示", () => {
    it("TC-403: スキル名が表示される");
    it("TC-404: スキル説明が表示される");
    it("TC-405: 許可ツールが表示される");
    it("TC-406: agents一覧が表示される");
    it("TC-407: references一覧が表示される");
    it("TC-413: 空配列のセクションが非表示");
  });

  describe("インポート操作", () => {
    it("TC-408: インポートボタンクリックでimportSkillが呼ばれる");
    it("TC-409: インポート中にローディング状態が表示される");
    it("TC-414: インポート中はボタンがdisabled");
  });

  describe("ダイアログ操作", () => {
    it("TC-410: キャンセルボタンでonCloseが呼ばれる");
    it("TC-411: ×ボタンでonCloseが呼ばれる");
    it("TC-412: ESCキーでonCloseが呼ばれる");
  });

  describe("アクセシビリティ", () => {
    it("TC-421: role=dialogが設定されている");
    it("TC-422: aria-modal=trueが設定されている");
    it("TC-423: aria-labelledbyでタイトルと関連付けられている");
    it("TC-424: 閉じるボタンにaria-label=閉じるがある");
  });
});
```

### ステップ3: モック設定

#### useAppStoreモック

```typescript
import { useAppStore } from "../../../store";

const mockImportSkill = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.mocked(useAppStore).mockReturnValue({
    importSkill: mockImportSkill,
    isImporting: false,
    importingSkillName: null,
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ   | 検証内容                                        | テストファイル               |
| ------------------ | ----------------------------------------------- | ---------------------------- |
| 状態管理連携テスト | useAppStoreからのデータ取得・アクション呼び出し | `SkillImportDialog.test.tsx` |
| コンポーネント連携 | Section/ResourceListのレンダリング連携          | `SkillImportDialog.test.tsx` |
| エラーハンドリング | importSkill失敗時のUI表示                       | `SkillImportDialog.test.tsx` |

## アーキテクチャ層別テスト（Electronデスクトップアプリ観点）

| 層               | テスト観点                           | テストファイル配置                                                |
| ---------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Renderer Process | UIコンポーネント、状態管理連携、A11y | `apps/desktop/src/renderer/components/skill/__tests__/*.test.tsx` |

## 成果物

| 成果物         | パス                                                                              | 説明                 |
| -------------- | --------------------------------------------------------------------------------- | -------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                           | テスト設計           |
| テストケース   | `outputs/phase-4/test-cases.md`                                                   | ケース一覧           |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` | コンポーネントテスト |

## 完了条件

- [ ] 受け入れ基準ごとにテストがある
- [ ] SkillImportDialog テストが作成されている（14件）
- [ ] アクセシビリティテストが作成されている（4件）
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている（空配列、インポート中状態）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. テストシナリオ設計の実施
3. SkillImportDialogテスト作成
4. アクセシビリティテスト作成
5. モック設定の実装
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7B-skill-import-dialog --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
