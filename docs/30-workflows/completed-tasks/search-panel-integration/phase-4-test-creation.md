# Phase 4: テスト作成 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| フェーズ   | Phase 4                                         |
| 名称       | テスト作成                                      |
| 目的       | TDD Red: 統合テストを先に作成（失敗するテスト） |
| 前提Phase  | Phase 3: 設計レビューゲート                     |
| 次Phase    | Phase 5: 実装                                   |
| ステータス | 未実施                                          |

---

## 目的

TDD の Red フェーズとして、Phase 5 の実装前に統合テストを作成する。テストは実装がない状態では失敗することを確認する。

---

## 実行タスク

### Task 1: 統合テストファイル構造の作成

**目的**: 統合テストの配置先とファイル構造を準備する

**実行内容**:

1. テストディレクトリ構造を作成

```
apps/desktop/src/features/search/__tests__/integration/
├── EditorViewIntegration.test.tsx    # EditorView統合テスト
├── KeyboardShortcuts.test.tsx        # キーボードショートカットテスト
├── SearchPanelAdapter.test.tsx       # アダプターテスト
└── WorkspaceSearchIntegration.test.tsx # ワークスペース検索統合テスト
```

2. テストユーティリティの準備
   - モックEditorInstance の作成
   - テストレンダリングヘルパー

**完了条件**:

- [ ] テストディレクトリ構造が作成されている
- [ ] テストユーティリティファイルが準備されている

### Task 2: EditorView 統合テストの作成

**目的**: SearchPanel と EditorView の統合をテストするテストケースを作成する

**実行内容**:

1. SearchPanel 表示テスト

```typescript
describe('EditorView SearchPanel Integration', () => {
  it('Cmd+F で SearchPanel が表示される', async () => {
    const { container } = render(<EditorView />);

    // Cmd+F を押す
    fireEvent.keyDown(container, { key: 'f', metaKey: true });

    // SearchPanel が表示されることを確認
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('検索クエリ入力でマッチがハイライトされる', async () => {
    // テスト実装
  });

  it('Escape でパネルが閉じる', async () => {
    // テスト実装
  });
});
```

2. 検索機能テスト

```typescript
describe("Search functionality", () => {
  it("検索結果が正しくハイライトされる", async () => {
    // テスト実装
  });

  it("次へ/前へナビゲーションが機能する", async () => {
    // テスト実装
  });

  it("検索オプションが正しく動作する", async () => {
    // テスト実装
  });
});
```

**完了条件**:

- [ ] EditorView 統合テストが作成されている
- [ ] テストは現時点で失敗する（Red）

### Task 3: キーボードショートカットテストの作成

**目的**: キーボードショートカットの動作をテストする

**実行内容**:

1. ショートカットテストケース

```typescript
describe("Keyboard Shortcuts", () => {
  describe("File Search", () => {
    it("Cmd+F で file モードの SearchPanel が開く", async () => {
      // テスト実装
    });

    it("Cmd+T で置換モードの SearchPanel が開く", async () => {
      // テスト実装
    });
  });

  describe("Workspace Search", () => {
    it("Cmd+Shift+F で workspace モードの SearchPanel が開く", async () => {
      // テスト実装
    });

    it("Cmd+Shift+T で置換モードの WorkspaceSearchPanel が開く", async () => {
      // テスト実装
    });
  });

  describe("Navigation", () => {
    it("Enter で次のマッチに移動", async () => {
      // テスト実装
    });

    it("Shift+Enter で前のマッチに移動", async () => {
      // テスト実装
    });
  });
});
```

**完了条件**:

- [ ] キーボードショートカットテストが作成されている
- [ ] 全ショートカットがカバーされている

### Task 4: アダプターテストの作成

**目的**: TextAreaEditorAdapter の単体テストを作成する

**実行内容**:

1. アダプターメソッドテスト

```typescript
describe("TextAreaEditorAdapter", () => {
  describe("getContent", () => {
    it("TextArea の内容を返す", () => {
      // テスト実装
    });
  });

  describe("setHighlights", () => {
    it("ハイライト状態を設定する", () => {
      // テスト実装
    });
  });

  describe("scrollToLine", () => {
    it("指定行にスクロールする", () => {
      // テスト実装
    });
  });

  describe("replaceText", () => {
    it("指定位置のテキストを置換する", () => {
      // テスト実装
    });
  });

  describe("replaceAllText", () => {
    it("全マッチを一括置換する", () => {
      // テスト実装
    });
  });
});
```

**完了条件**:

- [ ] アダプターの全メソッドのテストが作成されている
- [ ] エッジケースがカバーされている

### Task 5: 置換機能テストの作成

**目的**: 置換機能の動作をテストする

**実行内容**:

1. 置換テストケース

```typescript
describe("Replace functionality", () => {
  it("単一マッチの置換が正しく動作する", async () => {
    // テスト実装
  });

  it("全マッチの一括置換が正しく動作する", async () => {
    // テスト実装
  });

  it("置換後にカーソル位置が正しい", async () => {
    // テスト実装
  });

  it("Undo で置換を取り消せる", async () => {
    // テスト実装
  });
});
```

**完了条件**:

- [ ] 置換機能テストが作成されている
- [ ] 正常系・異常系がカバーされている

---

## 参照資料

### Phase 2/3 成果物

| 参照資料           | パス                                          |
| ------------------ | --------------------------------------------- |
| アダプター設計書   | `outputs/phase-2/adapter-design.md`           |
| 統合テスト観点一覧 | `outputs/phase-3/integration-test-aspects.md` |

### 既存テスト

| 参照資料           | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| SearchPanel テスト | `apps/desktop/src/features/search/__tests__/SearchPanel.test.tsx`          |
| アダプターテスト   | `apps/desktop/src/features/search/__tests__/TextAreaEditorAdapter.test.ts` |

### システム仕様

| 参照資料         | パス                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| 検索パネルUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md` |

---

## 成果物

| 成果物                         | パス                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| EditorView統合テスト           | `apps/desktop/src/features/search/__tests__/integration/EditorViewIntegration.test.tsx` |
| キーボードショートカットテスト | `apps/desktop/src/features/search/__tests__/integration/KeyboardShortcuts.test.tsx`     |
| アダプターテスト               | `apps/desktop/src/features/search/__tests__/integration/SearchPanelAdapter.test.tsx`    |
| テスト作成ログ                 | `outputs/phase-4/test-creation-log.md`                                                  |

---

## 完了条件

- [ ] 全ての統合テストファイルが作成されている
- [ ] テストは現時点で失敗する（TDD Red）
- [ ] 既存テスト 94 件は引き続き合格する
- [ ] テストカバレッジ目標が明確になっている

---

## 次のPhaseへの引き継ぎ

Phase 5（実装）では、本Phaseで作成したテストを通すための実装を行う（TDD Green）:

- TextAreaEditorAdapter の実装
- EditorView への SearchPanel 統合
- キーボードショートカットの接続
