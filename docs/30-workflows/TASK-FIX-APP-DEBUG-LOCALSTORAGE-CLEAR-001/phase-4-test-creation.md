# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| カテゴリ   | fix                                       |
| ステータス | pending                                   |
| 前提Phase  | Phase 3                                   |
| 後続Phase  | Phase 5                                   |

## 目的

デバッグコード削除後の正常動作を検証するテストケースを設計・実装する。テストファースト（TDD Red フェーズ）で、実装前にテストを作成する。

## 実行タスク

### タスク1: テストケース設計

**目的**: 受入基準（AC-1〜AC-6）に対応するテストケースを設計する

**テストケース一覧**:

| ID   | テスト内容                                                                            | 対応AC | テスト種別 |
| ---- | ------------------------------------------------------------------------------------- | ------ | ---------- |
| TC-1 | App コンポーネントが `localStorage.clear()` を呼び出さないこと                        | AC-2   | Unit       |
| TC-2 | App コンポーネントが `window.location.reload()` を呼び出さないこと                    | AC-4   | Unit       |
| TC-3 | App コンポーネントが `sessionStorage.getItem("debug-clear-storage")` を参照しないこと | AC-1   | Unit       |
| TC-4 | App コンポーネントが正常にレンダリングされること                                      | AC-6   | Unit       |
| TC-5 | 既存の auth 初期化 useEffect が正常に動作すること                                     | AC-6   | Unit       |

### タスク2: テストコード実装

**目的**: 設計したテストケースを実装する

**手順**:

1. 既存の App.tsx テストファイルの有無を確認
2. テストファイルが存在しない場合は新規作成: `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx`
3. 以下のテストを実装:

```typescript
// テスト概要（実装時に詳細化）
describe("App - デバッグコード削除検証", () => {
  it("TC-1: localStorage.clear() がアプリ起動時に呼ばれないこと", () => {
    const clearSpy = vi.spyOn(Storage.prototype, "clear");
    // App をレンダリング
    // clearSpy が呼ばれていないことを確認
    expect(clearSpy).not.toHaveBeenCalled();
  });

  it("TC-2: window.location.reload() が呼ばれないこと", () => {
    // reload のモック
    // App をレンダリング
    // reload が呼ばれていないことを確認
  });

  it("TC-3: sessionStorage の debug-clear-storage が参照されないこと", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    // App をレンダリング
    // "debug-clear-storage" で getItem が呼ばれていないことを確認
    expect(getItemSpy).not.toHaveBeenCalledWith("debug-clear-storage");
  });

  it("TC-4: App が正常にレンダリングされること", () => {
    // App をレンダリング
    // エラーなくレンダリングされることを確認
  });

  it("TC-5: auth 初期化が正常に実行されること", () => {
    // initializeAuth が呼ばれることを確認
  });
});
```

**注意事項**:

- P39 準拠: happy-dom 環境では `userEvent` ではなく `fireEvent` を使用
- P40 準拠: テストは `apps/desktop` ディレクトリから実行
- P9 準拠: テスト間で状態を共有しない（`beforeEach` でリセット）

**期待される成果物**:

- テストファイル: `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx`

### タスク3: テスト実行（Red フェーズ確認）

**目的**: 作成したテストがデバッグコード存在下で期待どおり失敗することを確認する

**手順**:

1. `cd apps/desktop && pnpm vitest run src/renderer/__tests__/App.debug-removal.test.tsx`
2. TC-1, TC-2, TC-3 が FAIL することを確認（デバッグコードがまだ存在するため）
3. TC-4, TC-5 が PASS することを確認

**期待結果**: TC-1〜TC-3 は FAIL、TC-4〜TC-5 は PASS

## 参照資料

| 参照資料       | パス                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| Phase 2 成果物 | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md` |
| App.tsx        | `apps/desktop/src/renderer/App.tsx`                                             |
| P39            | `.claude/rules/06-known-pitfalls.md` (happy-dom環境でのuserEvent非互換)         |
| P40            | `.claude/rules/06-known-pitfalls.md` (テスト実行ディレクトリ依存)               |

## 統合テスト連携

- Phase 5 実装後に TC-1〜TC-3 が PASS に転じることを検証
- Phase 6 でカバレッジ不足があればテスト追加

## 成果物

| 成果物         | パス                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| テストファイル | `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx`                       |
| テスト仕様書   | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-4-test-creation.md` |

## 完了条件

- [ ] テストケース（TC-1〜TC-5）が設計されていること
- [ ] テストコードが実装されていること
- [ ] Red フェーズの確認（TC-1〜TC-3 が FAIL）ができていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 5: 実装へ進む。
