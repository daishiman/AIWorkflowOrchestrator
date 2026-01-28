# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | TASK-3-2-D-skill-stream-copy-history |
| 作成日 | 2026-01-28                           |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- CopyHistoryContext テスト: Context の状態管理テスト作成
- useCopyHistory Hook テスト: Hook のテスト作成
- CopyHistoryPanel テスト: UIコンポーネントのテスト作成

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/component-design.md`        | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                    | 内容       |
| ---------- | ----------------------------------------------------------------------- | ---------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md` | テスト方針 |

## 実行手順

### ステップ1: テストシナリオ設計

受け入れ基準からテストシナリオを導出する。

#### CopyHistoryContext テストシナリオ

| TC-ID  | テスト内容                               | 期待結果                   |
| ------ | ---------------------------------------- | -------------------------- |
| TC-401 | コピー時に履歴に追加される               | 履歴配列の先頭に項目が追加 |
| TC-402 | 51件目のコピーで最古の履歴が削除される   | 履歴が50件を超えない       |
| TC-403 | removeFromHistory で指定項目が削除される | 指定IDの項目が履歴から削除 |
| TC-404 | clearHistory で全履歴が削除される        | 履歴配列が空になる         |
| TC-405 | toggleSelection で選択状態がトグル       | 選択状態が反転             |
| TC-406 | clearSelection で全選択解除              | selectedIds が空になる     |

#### useCopyHistory Hook テストシナリオ

| TC-ID  | テスト内容                 | 期待結果                  |
| ------ | -------------------------- | ------------------------- |
| TC-411 | Context 外で使用時にエラー | エラーがスローされる      |
| TC-412 | history が正しく取得できる | Context の history が返る |
| TC-413 | addToHistory が正しく動作  | 履歴に追加される          |

#### CopyHistoryPanel テストシナリオ

| TC-ID  | テスト内容                         | 期待結果                     |
| ------ | ---------------------------------- | ---------------------------- |
| TC-421 | 履歴パネルが表示される             | パネルがDOMに存在            |
| TC-422 | 履歴項目が一覧表示される           | 各項目がリスト表示           |
| TC-423 | 履歴項目クリックで再コピーできる   | クリップボードに内容がコピー |
| TC-424 | チェックボックスで複数選択できる   | 選択状態が反映               |
| TC-425 | 「選択をコピー」で一括コピーできる | 選択項目が結合されてコピー   |
| TC-426 | 「クリア」で全履歴が削除される     | 履歴一覧が空になる           |
| TC-427 | 閉じるボタンで onClose が呼ばれる  | コールバックが実行           |
| TC-428 | 100文字超のコンテンツが省略表示    | 「...」で省略                |

#### キーボード操作テストシナリオ

| TC-ID  | テスト内容                        | 期待結果             |
| ------ | --------------------------------- | -------------------- |
| TC-431 | Tabキーでフォーカス移動           | 次の要素にフォーカス |
| TC-432 | Enterキーで項目選択/コピー        | 選択またはコピー実行 |
| TC-433 | Escapeキーでパネルを閉じる        | onClose が呼ばれる   |
| TC-434 | Spaceキーでチェックボックストグル | 選択状態が反転       |

### ステップ2: テストファイル作成

#### CopyHistoryContext.test.tsx

テストファイルを以下に作成:

- `apps/desktop/src/renderer/contexts/__tests__/CopyHistoryContext.test.tsx`

```typescript
// テスト構造
describe("CopyHistoryContext", () => {
  describe("CopyHistoryProvider", () => {
    it("TC-401: コピー時に履歴に追加される");
    it("TC-402: 51件目のコピーで最古の履歴が削除される");
    it("TC-403: removeFromHistory で指定項目が削除される");
    it("TC-404: clearHistory で全履歴が削除される");
    it("TC-405: toggleSelection で選択状態がトグル");
    it("TC-406: clearSelection で全選択解除");
  });
});
```

#### useCopyHistory.test.ts

テストファイルを以下に作成:

- `apps/desktop/src/renderer/hooks/__tests__/useCopyHistory.test.ts`

```typescript
// テスト構造
describe("useCopyHistory", () => {
  it("TC-411: Context 外で使用時にエラー");
  it("TC-412: history が正しく取得できる");
  it("TC-413: addToHistory が正しく動作");
});
```

#### CopyHistoryPanel.test.tsx

テストファイルを以下に作成:

- `apps/desktop/src/renderer/components/AgentView/__tests__/CopyHistoryPanel.test.tsx`

```typescript
// テスト構造
describe("CopyHistoryPanel", () => {
  describe("表示", () => {
    it("TC-421: 履歴パネルが表示される");
    it("TC-422: 履歴項目が一覧表示される");
    it("TC-428: 100文字超のコンテンツが省略表示");
  });

  describe("操作", () => {
    it("TC-423: 履歴項目クリックで再コピーできる");
    it("TC-424: チェックボックスで複数選択できる");
    it("TC-425: 「選択をコピー」で一括コピーできる");
    it("TC-426: 「クリア」で全履歴が削除される");
    it("TC-427: 閉じるボタンで onClose が呼ばれる");
  });

  describe("キーボード操作", () => {
    it("TC-431: Tabキーでフォーカス移動");
    it("TC-432: Enterキーで項目選択/コピー");
    it("TC-433: Escapeキーでパネルを閉じる");
    it("TC-434: Spaceキーでチェックボックストグル");
  });
});
```

### ステップ3: モック設定

#### Clipboard API モック

```typescript
const mockWriteText = vi.fn().mockResolvedValue(undefined);

Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});
```

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ   | 検証内容                              | テストファイル                |
| ------------------ | ------------------------------------- | ----------------------------- |
| Context連携テスト  | Provider配下でのHook動作              | `CopyHistoryContext.test.tsx` |
| コンポーネント連携 | CopyButton → Context → Panel のフロー | `CopyHistoryPanel.test.tsx`   |
| 状態同期テスト     | 履歴追加/削除時のUI即時更新           | `CopyHistoryPanel.test.tsx`   |
| エラーハンドリング | Clipboard API失敗時のUI表示           | `CopyHistoryPanel.test.tsx`   |

## アーキテクチャ層別テスト（Electronデスクトップアプリ観点）

| 層               | テスト観点                       | テストファイル配置                                    |
| ---------------- | -------------------------------- | ----------------------------------------------------- |
| Renderer Process | Context、Hooks、UIコンポーネント | `apps/desktop/src/renderer/**/__tests__/*.test.ts(x)` |

## 成果物

| 成果物         | パス                                                                                 | 説明           |
| -------------- | ------------------------------------------------------------------------------------ | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                              | テスト設計     |
| テストケース   | `outputs/phase-4/test-cases.md`                                                      | ケース一覧     |
| Context テスト | `apps/desktop/src/renderer/contexts/__tests__/CopyHistoryContext.test.tsx`           | Context テスト |
| Hook テスト    | `apps/desktop/src/renderer/hooks/__tests__/useCopyHistory.test.ts`                   | Hook テスト    |
| Panel テスト   | `apps/desktop/src/renderer/components/AgentView/__tests__/CopyHistoryPanel.test.tsx` | Panel テスト   |

## 完了条件

- [ ] 受け入れ基準ごとにテストがある
- [ ] CopyHistoryContext テストが作成されている（6件）
- [ ] useCopyHistory テストが作成されている（3件）
- [ ] CopyHistoryPanel テストが作成されている（12件）
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている（50件上限）
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
3. CopyHistoryContext テスト作成
4. useCopyHistory テスト作成
5. CopyHistoryPanel テスト作成
6. モック設定の実装
7. 成果物の作成・配置
8. 完了条件の検証

## 次のPhase

Phase 5: 実装（TDD: Green）
