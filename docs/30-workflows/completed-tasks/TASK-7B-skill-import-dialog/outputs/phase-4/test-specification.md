# テスト仕様書: SkillImportDialog コンポーネント

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| Phase      | 4                           |
| 機能名     | TASK-7B-skill-import-dialog |
| 成果物種別 | テスト仕様書                |
| 作成日     | 2026-01-30                  |
| ステータス | 完了                        |

---

## 1. テスト方針

### 1.1 TDDアプローチ

本テストはTDD（テスト駆動開発）の原則に基づき、以下のサイクルで実施する。

| フェーズ | 内容                               | 対応Phase |
| -------- | ---------------------------------- | --------- |
| Red      | 失敗するテストを先に作成する       | Phase 4   |
| Green    | テストを通過する最小限の実装を行う | Phase 5   |
| Refactor | テストを維持しつつコードを改善する | Phase 8   |

### 1.2 テスティングフレームワーク

| ツール                      | 用途                         | バージョン |
| --------------------------- | ---------------------------- | ---------- |
| Vitest                      | テストランナー・アサーション | -          |
| @testing-library/react      | Reactコンポーネントテスト    | -          |
| @testing-library/user-event | ユーザーインタラクション     | -          |

### 1.3 テストファイル配置

```
apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx
```

---

## 2. モック戦略

### 2.1 useAppStoreモックパターン

`useAppStore` はZustandストアであり、セレクタベースの `mockImplementation` でモックする。

```typescript
import { useAppStore } from "../../../store";

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
}));

const mockImportSkill = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAppStore).mockImplementation((selector: unknown) => {
    const state = {
      importSkill: mockImportSkill,
      isImporting: false,
      importingSkillName: null,
    };
    if (typeof selector === "function") {
      return (selector as (s: typeof state) => unknown)(state);
    }
    return state;
  });
});
```

**モックポイント**:

- `importSkill`: `vi.fn().mockResolvedValue(undefined)` で非同期成功をデフォルト
- `isImporting`: `false` をデフォルトとし、テストケースごとに変更
- `importingSkillName`: `null` をデフォルトとし、テストケースごとに変更
- セレクタ関数が渡された場合は `selector(state)` で評価する

### 2.2 テストデータ

```typescript
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
```

---

## 3. テストカテゴリ構成

### 3.1 カテゴリ一覧

| #   | カテゴリ           | テスト件数 | TC-ID範囲     | 検証対象                            |
| --- | ------------------ | ---------- | ------------- | ----------------------------------- |
| 1   | 表示制御           | 2          | TC-401~TC-402 | isOpen による表示/非表示            |
| 2   | スキル情報表示     | 4          | TC-403~TC-406 | メタデータの各フィールド表示        |
| 3   | インポート操作     | 3          | TC-408~TC-410 | インポートボタン・ローディング      |
| 4   | ダイアログ操作     | 3          | TC-411~TC-413 | キャンセル・閉じる・ESC             |
| 5   | アクセシビリティ   | 4          | TC-421~TC-424 | ARIA属性・キーボード操作            |
| 6   | 境界値テスト       | 6          | TC-601~TC-606 | 空配列・全リソース・description有無 |
| 7   | エラーハンドリング | 2          | TC-611~TC-612 | importSkill失敗・インポート中close  |
| 8   | インタラクション   | 2          | TC-621~TC-622 | 成功後自動クローズ・複数回操作      |
| 9   | フォーカストラップ | 3          | TC-631~TC-633 | Tab循環・Shift+Tab・初期フォーカス  |
|     | **合計**           | **31**     |               |                                     |

### 3.2 Phase別テスト追加内訳

| Phase   | 追加テスト件数 | カテゴリ                                                                                                                            |
| ------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 | 18             | 表示制御(2), スキル情報表示(4), インポート操作(3), ダイアログ操作(3), アクセシビリティ(4), 境界値(1: TC-413→TC-606へ再分類), その他 |
| Phase 6 | 13             | 境界値テスト(6), エラーハンドリング(2), インタラクション(2), フォーカストラップ(3)                                                  |

---

## 4. カバレッジ目標

### 4.1 カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 達成結果 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | 100%     |
| Branch Coverage   | 60%      | 70%      | 100%     |
| Function Coverage | 80%      | 90%      | 100%     |

### 4.2 カバレッジ測定コマンド

```bash
pnpm --filter @repo/desktop test:coverage -- --testPathPattern="SkillImportDialog"
```

---

## 5. テスト構造

### 5.1 describeブロック構成

```typescript
describe("SkillImportDialog", () => {
  describe("表示制御", () => {
    // TC-401, TC-402
  });

  describe("スキル情報表示", () => {
    // TC-403, TC-404, TC-405, TC-406
  });

  describe("インポート操作", () => {
    // TC-408, TC-409, TC-410
  });

  describe("ダイアログ操作", () => {
    // TC-411, TC-412, TC-413
  });

  describe("アクセシビリティ", () => {
    // TC-421, TC-422, TC-423, TC-424
  });

  describe("境界値テスト", () => {
    // TC-601, TC-602, TC-603, TC-604, TC-605, TC-606
  });

  describe("エラーハンドリング", () => {
    // TC-611, TC-612
  });

  describe("インタラクション", () => {
    // TC-621, TC-622
  });

  describe("フォーカストラップ", () => {
    // TC-631, TC-632, TC-633
  });
});
```

### 5.2 主要テストパターン

#### パターン1: 表示確認テスト

```typescript
it("TC-403: スキル名が表示される", () => {
  render(<SkillImportDialog skill={mockSkill} isOpen={true} onClose={mockOnClose} />);
  expect(screen.getByText("test-skill")).toBeInTheDocument();
});
```

#### パターン2: ユーザーインタラクションテスト

```typescript
it("TC-408: インポートボタンクリックでimportSkillが呼ばれる", async () => {
  const user = userEvent.setup();
  render(<SkillImportDialog skill={mockSkill} isOpen={true} onClose={mockOnClose} />);
  await user.click(screen.getByRole("button", { name: "インポート" }));
  expect(mockImportSkill).toHaveBeenCalledWith("test-skill");
});
```

#### パターン3: モック状態変更テスト

```typescript
it("TC-409: インポート中にローディング状態が表示される", () => {
  // useAppStoreモックをローディング状態に変更
  vi.mocked(useAppStore).mockImplementation((selector: unknown) => {
    const state = {
      importSkill: mockImportSkill,
      isImporting: true,
      importingSkillName: "test-skill",
    };
    if (typeof selector === "function") {
      return (selector as (s: typeof state) => unknown)(state);
    }
    return state;
  });
  render(<SkillImportDialog skill={mockSkill} isOpen={true} onClose={mockOnClose} />);
  expect(screen.getByText("インポート中...")).toBeInTheDocument();
});
```

#### パターン4: フォーカストラップテスト

```typescript
it("TC-631: Tab キーで最後の要素から最初の要素に戻る", async () => {
  const user = userEvent.setup();
  render(<SkillImportDialog skill={mockSkill} isOpen={true} onClose={mockOnClose} />);
  // 最後のフォーカス可能要素にフォーカスを移動
  const buttons = screen.getAllByRole("button");
  const lastButton = buttons[buttons.length - 1];
  lastButton.focus();
  await user.tab();
  // 最初のフォーカス可能要素に戻ることを検証
  expect(buttons[0]).toHaveFocus();
});
```

---

## 6. 実装パターン参照

### 6.1 RESOURCE_SECTIONSパターン

コンポーネントは `RESOURCE_SECTIONS` 定数パターンを使用して、サブリソースセクションの表示を一元管理する。テストでは各セクションの条件付き表示（空配列で非表示、データありで表示）を検証する。

### 6.2 フォーカストラップ

`dialogRef` を使用し、ダイアログ内のフォーカス可能要素間でフォーカスが循環する。`Tab` キーで最後の要素から最初の要素へ、`Shift+Tab` で最初の要素から最後の要素へ移動する。

### 6.3 ESCキーハンドラ

`useEffect` 内で `keydown` イベントリスナーを登録し、`Escape` キー押下時に `onClose` を呼び出す。インポート中（`isCurrentlyImporting` が `true`）の場合はESCキーを無効化する。

---

## 7. テスト実行

### 7.1 実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillImportDialog"

# カバレッジ付き実行
pnpm --filter @repo/desktop test:coverage -- --testPathPattern="SkillImportDialog"

# ウォッチモード
pnpm --filter @repo/desktop test -- --watch --testPathPattern="SkillImportDialog"
```

### 7.2 テスト結果サマリー

| 指標         | 結果    |
| ------------ | ------- |
| 総テスト数   | 31      |
| 成功         | 31      |
| 失敗         | 0       |
| スキップ     | 0       |
| 全テスト通過 | **YES** |

---

## 参照資料

| 資料名             | パス                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                                      |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                          |
| コンポーネント設計 | `outputs/phase-2/component-design.md`                                             |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`                                         |
| テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` |
