# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                  |
| Phase      | 6 / 13                                                               |
| 作成日     | 2026-03-16                                                           |
| 担当       | implementer                                                          |
| 依存 Phase | Phase 5（実装）— 完了済み（TC-1〜TC-12 が Green 状態）               |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-6-test-expansion.md` |

---

## 目的

Phase 4 で作成した TC-1〜TC-12 に加え、境界値・異常系・回帰テストを追加して `apps/desktop/src/main/__tests__/menu.test.ts` のカバレッジを向上させる。Phase 7 のカバレッジ基準（Line 80% / Branch 60% / Function 80%）を達成することを目標とする。

---

## 実行タスク

| No. | タスク名                           | 目的                                                                  |
| --- | ---------------------------------- | --------------------------------------------------------------------- |
| 1   | Phase 5 実装後の追加テスト特定     | 実装を確認し、Phase 4 でカバーされていないパスを洗い出す              |
| 2   | 境界値テストの追加（TC-13〜TC-16） | テンプレートが空でないこと・role 重複がないことを検証する             |
| 3   | 異常系テストの追加（TC-17〜TC-18） | セパレーターが正しく配置されていることを検証する                      |
| 4   | 回帰テストの追加（TC-19〜TC-20）   | Phase 5 実装後に発見したエッジケースを検証する                        |
| 5   | `menu.test.ts` へのテスト追加      | TC-13〜TC-20 を `apps/desktop/src/main/__tests__/menu.test.ts` に追記 |
| 6   | 追加テスト実行（全件 Green 確認）  | TC-1〜TC-20 の全テストが PASS することを確認する                      |

---

## 参照資料

| 資料                                                                 | 参照理由                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| `docs/30-workflows/electron-app-menu-zoom/phase-4-test-creation.md`  | TC-1〜TC-12 の一覧（重複追加を避けるため）             |
| `docs/30-workflows/electron-app-menu-zoom/phase-5-implementation.md` | 実装内容（追加テストケースの設計根拠）                 |
| `apps/desktop/src/main/__tests__/menu.test.ts`                       | 既存テストコード（追記先ファイル）                     |
| `apps/desktop/src/main/index.ts`                                     | 実装コード（テスト対象の実際の挙動確認）               |
| `.claude/rules/02-code-quality.md#カバレッジ基準`                    | Line 80% / Branch 60% / Function 80% の基準値          |
| `.claude/rules/06-known-pitfalls.md#P9`                              | テスト間状態リーク防止（afterEach でのモックリストア） |

---

## 追加テストケース一覧

| TC No. | テスト名                                                                                              | テスト対象関数          | 入力                      | 期待結果                                                                                    | カテゴリ   |
| ------ | ----------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------- | ---------- |
| TC-13  | buildMacTemplate は 4 つのトップレベルメニューを返す                                                  | `buildMacTemplate`      | —                         | 返り値の配列の length が 4 である（アプリ名/編集/表示/ウィンドウ）                          | 境界値     |
| TC-14  | buildMacTemplate の「表示」メニューに role の重複がない                                               | `buildMacTemplate`      | —                         | 「表示」メニューの submenu 内に同一 role が 2 回以上出現しない                              | 境界値     |
| TC-15  | buildDefaultTemplate の「表示」メニューに role の重複がない                                           | `buildDefaultTemplate`  | —                         | 「表示」メニューの submenu 内に同一 role が 2 回以上出現しない                              | 境界値     |
| TC-16  | buildMacTemplate の各メニューが submenu を持つ                                                        | `buildMacTemplate`      | —                         | 返り値の配列の全 4 要素が `submenu` プロパティを持ち、各 submenu が length > 0 の配列である | 境界値     |
| TC-17  | buildMacTemplate の「表示」メニューに zoomIn/zoomOut/resetZoom の後にセパレーターが配置されている     | `buildMacTemplate`      | —                         | 「表示」メニューの submenu で index 3 の要素が `{ type: "separator" }` である               | 異常系     |
| TC-18  | buildDefaultTemplate の「表示」メニューに zoomIn/zoomOut/resetZoom の後にセパレーターが配置されている | `buildDefaultTemplate`  | —                         | 「表示」メニューの submenu で index 3 の要素が `{ type: "separator" }` である               | 異常系     |
| TC-19  | createApplicationMenu を複数回呼んでも Menu.setApplicationMenu が各回 1 回ずつ呼ばれる                | `createApplicationMenu` | `"darwin"`（2回呼び出し） | `Menu.setApplicationMenu` が 2 回呼ばれる（累積 2 回）                                      | 回帰テスト |
| TC-20  | buildMacTemplate はウィンドウメニューに front role を含む（macOS 固有）                               | `buildMacTemplate`      | —                         | 「ウィンドウ」メニューの submenu に `{ role: "front" }` が存在する                          | 回帰テスト |

---

## 実行手順

### Step 1: Phase 5 実装後の追加テスト特定

`apps/desktop/src/main/index.ts` を Read ツールで再確認し、以下のパスが Phase 4 でカバーされているか確認する。

- `buildMacTemplate()` のトップレベル配列長（4 件）
- セパレーター項目（`{ type: "separator" }`）の配置位置
- `buildMacTemplate()` 内の `front` role（TC-9 では `minimize` と `close` のみ確認）
- `createApplicationMenu()` の複数回呼び出し時の挙動

確認の結果、TC-13〜TC-20 が Phase 4 でカバーされていないことを確認する。

### Step 2: `menu.test.ts` への TC-13〜TC-20 の追記

既存の `apps/desktop/src/main/__tests__/menu.test.ts` に以下のテストコードを追記する（Edit ツールを使用）。

```typescript
describe("buildMacTemplate - 境界値テスト", () => {
  it("TC-13: 4 つのトップレベルメニューを返す", () => {
    const template = buildMacTemplate();
    expect(template).toHaveLength(4);
  });

  it("TC-14: 「表示」メニューに role の重複がない", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = viewSubmenu
      .filter((item) => item.role !== undefined)
      .map((item) => item.role as string);
    const uniqueRoles = new Set(roles);
    expect(uniqueRoles.size).toBe(roles.length);
  });

  it("TC-16: 各メニューが submenu を持ち、submenu が空でない", () => {
    const template = buildMacTemplate();
    for (const item of template) {
      expect(Array.isArray(item.submenu)).toBe(true);
      expect(
        (item.submenu as Electron.MenuItemConstructorOptions[]).length,
      ).toBeGreaterThan(0);
    }
  });
});

describe("buildDefaultTemplate - 境界値テスト", () => {
  it("TC-15: 「表示」メニューに role の重複がない", () => {
    const template = buildDefaultTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = viewSubmenu
      .filter((item) => item.role !== undefined)
      .map((item) => item.role as string);
    const uniqueRoles = new Set(roles);
    expect(uniqueRoles.size).toBe(roles.length);
  });
});

describe("buildMacTemplate - 異常系テスト", () => {
  it("TC-17: 「表示」メニューの index 3 がセパレーター", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    // index 0: zoomIn, 1: zoomOut, 2: resetZoom, 3: separator, 4: togglefullscreen
    expect(viewSubmenu[3]).toEqual({ type: "separator" });
  });
});

describe("buildDefaultTemplate - 異常系テスト", () => {
  it("TC-18: 「表示」メニューの index 3 がセパレーター", () => {
    const template = buildDefaultTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    // index 0: zoomIn, 1: zoomOut, 2: resetZoom, 3: separator, 4: togglefullscreen
    expect(viewSubmenu[3]).toEqual({ type: "separator" });
  });
});

describe("createApplicationMenu - 回帰テスト", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-19: 複数回呼び出しても各回 Menu.setApplicationMenu が 1 回ずつ呼ばれる", async () => {
    const { Menu } = await import("electron");
    mockPlatform("darwin");
    createApplicationMenu();
    createApplicationMenu();
    expect(Menu.setApplicationMenu).toHaveBeenCalledTimes(2);
  });
});

describe("buildMacTemplate - 回帰テスト", () => {
  it("TC-20: ウィンドウメニューに front role を含む（macOS 固有）", () => {
    const template = buildMacTemplate();
    const windowSubmenu = findSubmenuByLabel(template, "ウィンドウ");
    const roles = collectRoles(windowSubmenu);
    expect(roles).toContain("front");
  });
});
```

### Step 3: 全テスト実行（TC-1〜TC-20 Green 確認）

```bash
cd apps/desktop && pnpm vitest run src/main/__tests__/menu.test.ts
```

期待される出力: TC-1〜TC-20 の全 20 テストが PASS（`✓ 20 tests passed`）。

テストが失敗した場合の対処方針:

- TC-13（配列長）が失敗: `buildMacTemplate()` のトップレベル配列が 4 件であることを確認する
- TC-14/TC-15（重複なし）が失敗: テンプレート内に同一 role が重複していないか確認する
- TC-17/TC-18（セパレーター位置）が失敗: submenu の index 3 が `{ type: "separator" }` であることを確認する
- TC-19（複数回呼び出し）が失敗: `vi.clearAllMocks()` と `vi.restoreAllMocks()` の使い分けを確認する
- TC-20（front role）が失敗: `buildMacTemplate()` のウィンドウメニューに `{ role: "front" }` が含まれているか確認する

---

## コード成果物パス

| 成果物                                         | 種別                 |
| ---------------------------------------------- | -------------------- |
| `apps/desktop/src/main/__tests__/menu.test.ts` | テストコード（追記） |

---

## 完了条件

- [ ] TC-13〜TC-20 の 8 件のテストケースが `menu.test.ts` に追記されている
- [ ] `describe("buildMacTemplate - 境界値テスト")` ブロックに TC-13/TC-14/TC-16 が含まれている
- [ ] `describe("buildDefaultTemplate - 境界値テスト")` ブロックに TC-15 が含まれている
- [ ] `describe("buildMacTemplate - 異常系テスト")` ブロックに TC-17 が含まれている
- [ ] `describe("buildDefaultTemplate - 異常系テスト")` ブロックに TC-18 が含まれている
- [ ] `describe("createApplicationMenu - 回帰テスト")` ブロックに TC-19 が含まれている
- [ ] `describe("buildMacTemplate - 回帰テスト")` ブロックに TC-20 が含まれている
- [ ] TC-1〜TC-20 の全 20 テストが PASS（Green）
- [ ] 追加テストに `afterEach(() => vi.restoreAllMocks())` が設定されている（P9 対策）
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が含まれていない

---

## 次 Phase

Phase 7（カバレッジ確認）へ進む。
前提条件: 本 Phase の完了条件チェックリストが全て満たされていること。
