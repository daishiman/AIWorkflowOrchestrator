# Phase 6: テスト拡充 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| フェーズ   | Phase 6                                  |
| 名称       | テスト拡充                               |
| 目的       | カバレッジ目標達成に向けた追加テスト作成 |
| 前提Phase  | Phase 5: 実装                            |
| 次Phase    | Phase 7: カバレッジ確認                  |
| ステータス | 未実施                                   |

---

## 目的

Phase 5 の実装に対してテストカバレッジを向上させ、カバレッジ目標（Line 80%+, Branch 60%+）を達成するための追加テストを作成する。

---

## 実行タスク

### Task 1: エッジケーステストの追加

**目的**: 境界値や特殊ケースをカバーするテストを追加する

**実行内容**:

1. 検索エッジケース

```typescript
describe("Search edge cases", () => {
  it("空の検索クエリでは検索しない", async () => {
    // テスト実装
  });

  it("空のエディタコンテンツでは結果が 0 件", async () => {
    // テスト実装
  });

  it("非常に長い検索クエリでも正常動作", async () => {
    // テスト実装
  });

  it("特殊文字を含む検索クエリが正しく動作", async () => {
    // テスト実装
  });

  it("Unicode 文字（日本語等）の検索が正常動作", async () => {
    // テスト実装
  });

  it("改行を含むテキストの検索が正常動作", async () => {
    // テスト実装
  });
});
```

2. 置換エッジケース

```typescript
describe("Replace edge cases", () => {
  it("空の置換文字列での置換（削除）が動作", async () => {
    // テスト実装
  });

  it("同じ文字列への置換が動作", async () => {
    // テスト実装
  });

  it("置換文字列に検索パターンを含む場合", async () => {
    // テスト実装
  });

  it("大量のマッチを一括置換", async () => {
    // テスト実装
  });
});
```

**完了条件**:

- [ ] 境界値テストが追加されている
- [ ] 特殊文字テストが追加されている
- [ ] Unicode テストが追加されている

### Task 2: 異常系テストの追加

**目的**: エラーハンドリングをカバーするテストを追加する

**実行内容**:

1. 検索エラー

```typescript
describe("Search error handling", () => {
  it("無効な正規表現でエラーメッセージを表示", async () => {
    // テスト実装
  });

  it("ワークスペース検索でのネットワークエラー", async () => {
    // テスト実装
  });

  it("検索キャンセル時の状態リセット", async () => {
    // テスト実装
  });
});
```

2. アダプターエラー

```typescript
describe("Adapter error handling", () => {
  it("TextArea 参照が null の場合の処理", async () => {
    // テスト実装
  });

  it("コンテンツ取得失敗時の処理", async () => {
    // テスト実装
  });
});
```

**完了条件**:

- [ ] 検索エラーテストが追加されている
- [ ] アダプターエラーテストが追加されている

### Task 3: アクセシビリティテストの追加

**目的**: WCAG 2.1 AA 準拠を検証するテストを追加する

**実行内容**:

1. キーボードナビゲーション

```typescript
describe("Accessibility - Keyboard navigation", () => {
  it("Tab キーでフォーカスが正しく移動", async () => {
    // テスト実装
  });

  it("Shift+Tab で逆方向にフォーカス移動", async () => {
    // テスト実装
  });

  it("フォーカストラップが正しく機能", async () => {
    // テスト実装
  });
});
```

2. ARIA 属性

```typescript
describe("Accessibility - ARIA attributes", () => {
  it("検索入力に aria-label が設定されている", async () => {
    // テスト実装
  });

  it("検索結果カウントが aria-live で通知される", async () => {
    // テスト実装
  });

  it('結果リストに role="listbox" が設定されている', async () => {
    // テスト実装
  });

  it("選択項目に aria-selected が設定されている", async () => {
    // テスト実装
  });
});
```

**完了条件**:

- [ ] キーボードナビゲーションテストが追加されている
- [ ] ARIA 属性テストが追加されている

### Task 4: パフォーマンステストの追加

**目的**: パフォーマンス要件を検証するテストを追加する

**実行内容**:

```typescript
describe("Performance", () => {
  it("検索デバウンスが 150-300ms で動作", async () => {
    // テスト実装
  });

  it("大量のマッチでも UI がブロックされない", async () => {
    // テスト実装
  });

  it("検索キャンセルが即座に反映される", async () => {
    // テスト実装
  });
});
```

**完了条件**:

- [ ] デバウンステストが追加されている
- [ ] パフォーマンステストが追加されている

### Task 5: 統合テストの拡充（全カテゴリ対応）

**目的**: 統合テストシナリオカテゴリを網羅し、カバレッジを向上させる

**実行内容**:

統合テストシナリオカテゴリに基づいてテストを拡充:

| カテゴリ           | 検証内容                                   | 本タスクでの対応 |
| ------------------ | ------------------------------------------ | ---------------- |
| API接続テスト      | SearchPanel と EditorInstance の接続       | 対象             |
| データフローテスト | 検索クエリ → マッチ → ハイライト の流れ    | 対象             |
| エラーハンドリング | 検索エラー時のフロントエンド表示・リトライ | Task 2 で対応    |
| 状態同期テスト     | EditorView 状態と SearchPanel 状態の同期   | 対象             |

1. API接続テスト（SearchPanel - EditorInstance 連携）

```typescript
describe("API Connection - SearchPanel to EditorInstance", () => {
  it("SearchPanel が EditorInstance を正しく参照できる", async () => {
    // テスト実装
  });

  it("EditorInstance のメソッド呼び出しが正しく動作する", async () => {
    // テスト実装
  });

  it("EditorInstance が null の場合にエラーハンドリングされる", async () => {
    // テスト実装
  });
});
```

2. データフローテスト（検索クエリ → マッチ → ハイライト）

```typescript
describe("Data Flow - Search Query to Highlight", () => {
  it("検索クエリ入力 → マッチ検出 → ハイライト表示の流れ", async () => {
    // テスト実装
  });

  it("検索オプション変更 → 再検索 → ハイライト更新の流れ", async () => {
    // テスト実装
  });

  it("置換実行 → コンテンツ更新 → 再検索の流れ", async () => {
    // テスト実装
  });
});
```

3. 状態同期テスト

```typescript
describe("State synchronization", () => {
  it("EditorView の内容変更が SearchPanel に反映される", async () => {
    // テスト実装
  });

  it("SearchPanel の状態変更が useSearchStore に反映される", async () => {
    // テスト実装
  });

  it("パネルを閉じた後に状態がリセットされる", async () => {
    // テスト実装
  });

  it("リアルタイム更新: エディタ内容変更時にマッチ数が更新される", async () => {
    // テスト実装
  });
});
```

4. ワークスペース検索統合テスト

```typescript
describe("Workspace search integration", () => {
  it("検索結果クリックでファイルが開く", async () => {
    // テスト実装
  });

  it("検索結果クリックで該当行にジャンプ", async () => {
    // テスト実装
  });

  it("ファイル別グルーピングが正しく表示される", async () => {
    // テスト実装
  });
});
```

**完了条件**:

- [ ] API接続テストが追加されている
- [ ] データフローテストが追加されている
- [ ] 状態同期テストが追加されている
- [ ] ワークスペース検索統合テストが追加されている

---

## 参照資料

### Phase 5 成果物

| 参照資料              | パス                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| TextAreaEditorAdapter | `apps/desktop/src/features/search/adapters/TextAreaEditorAdapter.ts` |
| 統合フック            | `apps/desktop/src/renderer/views/EditorView/hooks/`                  |

### システム仕様

| 参照資料         | パス                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| 検索パネルUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md` |

---

## 成果物

| 成果物                 | パス                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- |
| エッジケーステスト     | `apps/desktop/src/features/search/__tests__/integration/EdgeCases.test.tsx`     |
| 異常系テスト           | `apps/desktop/src/features/search/__tests__/integration/ErrorHandling.test.tsx` |
| アクセシビリティテスト | `apps/desktop/src/features/search/__tests__/integration/Accessibility.test.tsx` |
| パフォーマンステスト   | `apps/desktop/src/features/search/__tests__/integration/Performance.test.tsx`   |
| テスト拡充ログ         | `outputs/phase-6/test-expansion-log.md`                                         |

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] アクセシビリティテストが追加されている
- [ ] パフォーマンステストが追加されている
- [ ] 統合テストが拡充されている
- [ ] 全テストが合格する

---

## 次のPhaseへの引き継ぎ

Phase 7（カバレッジ確認）では、本Phaseで追加したテストを含むカバレッジ目標の達成を検証:

- Line Coverage: 80%+
- Branch Coverage: 60%+
- Function Coverage: 80%+
