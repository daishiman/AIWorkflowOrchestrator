# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                 |
| Phase      | 4 / 13                                                              |
| 作成日     | 2026-03-16                                                          |
| 担当       | implementer                                                         |
| 依存 Phase | Phase 3（設計レビュー）— PASS 判定済み                              |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-4-test-creation.md` |

---

## 目的

Phase 2 で設計した `buildMacTemplate()` / `buildDefaultTemplate()` / `createApplicationMenu()` の3関数に対するユニットテストを作成する。テストは Phase 5 の実装が完了した時点で全件 PASS することを目標とする。本 Phase では Red（失敗）状態のテストコードを先に作成し、TDD サイクルの起点とする。

---

## 実行タスク

| No. | タスク名                     | 目的                                                                |
| --- | ---------------------------- | ------------------------------------------------------------------- |
| 1   | テスト環境の確認             | Vitest と electron モックの設定が利用可能であることを確認する       |
| 2   | テストケース一覧の設計       | TC-1〜TC-12 の入力・期待結果・カテゴリを定義する                    |
| 3   | `menu.test.ts` の作成        | `apps/desktop/src/main/__tests__/menu.test.ts` にテストコードを記述 |
| 4   | テスト実行（Red 確認）       | Phase 5 実装前に全テストが失敗（Red）することを確認する             |
| 5   | 完了条件チェックリストの確認 | 全項目が満たされていることを確認する                                |

---

## 参照資料

| 資料                                                               | 参照理由                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md` | 受入基準（AC-1〜AC-8）の参照                           |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`       | メニュー構造テーブル・テスト設計上の注意点の参照       |
| `apps/desktop/src/main/index.ts`                                   | 修正対象ファイル（テスト対象関数の現在の状態確認）     |
| `apps/desktop/vitest.config.ts`                                    | Vitest 設定（environment / setupFiles）の確認          |
| `.claude/rules/06-known-pitfalls.md#P9`                            | テスト間状態リーク防止（afterEach でのモックリストア） |
| `.claude/rules/06-known-pitfalls.md#P39`                           | happy-dom 環境での fireEvent 使用（今回は非該当）      |

---

## テストケース一覧

| TC No. | テスト名                                                                    | テスト対象関数                                             | 入力（process.platform） | 期待結果                                                                         | カテゴリ             |
| ------ | --------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------- | -------------------- |
| TC-1   | macOS では buildMacTemplate を返す                                          | `createApplicationMenu`                                    | `"darwin"`               | 返り値が `buildMacTemplate()` の内容と一致する Menu オブジェクト                 | プラットフォーム分岐 |
| TC-2   | Windows では buildDefaultTemplate を返す                                    | `createApplicationMenu`                                    | `"win32"`                | 返り値が `buildDefaultTemplate()` の内容と一致する Menu オブジェクト             | プラットフォーム分岐 |
| TC-3   | Linux では buildDefaultTemplate を返す                                      | `createApplicationMenu`                                    | `"linux"`                | 返り値が `buildDefaultTemplate()` の内容と一致する Menu オブジェクト             | プラットフォーム分岐 |
| TC-4   | buildMacTemplate は zoomIn role を含む                                      | `buildMacTemplate`                                         | —                        | 返り値の配列内の「表示」メニューの submenu に `{ role: "zoomIn" }` が存在する    | 機能要件（FR-1）     |
| TC-5   | buildMacTemplate は zoomOut role を含む                                     | `buildMacTemplate`                                         | —                        | 返り値の配列内の「表示」メニューの submenu に `{ role: "zoomOut" }` が存在する   | 機能要件（FR-2）     |
| TC-6   | buildMacTemplate は resetZoom role を含む                                   | `buildMacTemplate`                                         | —                        | 返り値の配列内の「表示」メニューの submenu に `{ role: "resetZoom" }` が存在する | 機能要件（FR-3）     |
| TC-7   | buildMacTemplate は編集メニューに undo/redo/cut/copy/paste/selectAll を含む | `buildMacTemplate`                                         | —                        | 「編集」メニューの submenu に 6 つの role がすべて存在する                       | 機能要件（FR-4）     |
| TC-8   | buildMacTemplate はアプリ名メニューに quit role を含む                      | `buildMacTemplate`                                         | —                        | 最初のメニュー項目の submenu に `{ role: "quit" }` が存在する                    | 機能要件（FR-4）     |
| TC-9   | buildMacTemplate はウィンドウメニューに minimize と close role を含む       | `buildMacTemplate`                                         | —                        | 「ウィンドウ」メニューの submenu に `minimize` と `close` role が存在する        | 機能要件（FR-4）     |
| TC-10  | buildDefaultTemplate は zoomIn/zoomOut/resetZoom role を含む                | `buildDefaultTemplate`                                     | —                        | 返り値の配列内の「表示」メニューの submenu に 3 つの role がすべて存在する       | 機能要件（FR-5）     |
| TC-11  | buildDefaultTemplate はメニューが 1 件のみ（「表示」のみ）                  | `buildDefaultTemplate`                                     | —                        | 返り値の配列の length が 1 である                                                | 機能要件（FR-5）     |
| TC-12  | createApplicationMenu 呼び出し時に Menu.setApplicationMenu が呼ばれる       | `createApplicationMenu` + `Menu.setApplicationMenu` の統合 | `"darwin"`               | `Menu.setApplicationMenu` モックが 1 回呼ばれる                                  | 統合テスト           |

---

## 実行手順

### Step 1: テスト環境の確認

1. `apps/desktop/vitest.config.ts` を読み込み、`environment` の設定（`node` または `happy-dom`）を確認する。
2. `apps/desktop/package.json` に `vitest` と `@vitest/coverage-v8` が devDependencies に含まれていることを確認する。
3. `apps/desktop/src/main/__tests__/` ディレクトリが存在しない場合、ディレクトリを作成する（Bash で `mkdir -p`）。

### Step 2: `menu.test.ts` の作成

以下の方針でテストコードを記述する。

#### electron モックの設定

```typescript
import { vi, describe, it, expect, afterEach } from "vitest";

// electron をモック化（Main Process テストのため実際の electron を使わない）
vi.mock("electron", () => {
  const mockMenu = {
    buildFromTemplate: vi.fn((template) => ({ template })), // templateをそのまま保持
    setApplicationMenu: vi.fn(),
  };
  return { Menu: mockMenu };
});
```

#### `process.platform` のモック方法

```typescript
// afterEach でリストアするため vi.spyOn を使用
let platformSpy: ReturnType<typeof vi.spyOn>;

afterEach(() => {
  vi.restoreAllMocks(); // P9対策: テスト間の状態リーク防止
});

function mockPlatform(platform: NodeJS.Platform) {
  platformSpy = vi.spyOn(process, "platform", "get").mockReturnValue(platform);
}
```

#### テスト対象関数のインポート

Phase 5 の実装完了後にインポートが成立する。Phase 4 時点では実装前のため Red 状態になる。

```typescript
// Phase 5 実装後にインポート可能
import {
  buildMacTemplate,
  buildDefaultTemplate,
  createApplicationMenu,
} from "../index";
```

**注意**: Phase 5 で `buildMacTemplate` / `buildDefaultTemplate` / `createApplicationMenu` を `export` で公開すること。

#### ヘルパー関数: role 検索

```typescript
// submenu からすべての role を再帰的に収集するヘルパー
function collectRoles(items: Electron.MenuItemConstructorOptions[]): string[] {
  return items.flatMap((item) => {
    const roles: string[] = [];
    if (item.role) roles.push(item.role as string);
    if (item.submenu && Array.isArray(item.submenu)) {
      roles.push(
        ...collectRoles(item.submenu as Electron.MenuItemConstructorOptions[]),
      );
    }
    return roles;
  });
}

// 特定 label のメニュー項目の submenu を取得するヘルパー
function findSubmenuByLabel(
  template: Electron.MenuItemConstructorOptions[],
  label: string,
): Electron.MenuItemConstructorOptions[] {
  const item = template.find((m) => m.label === label);
  if (!item || !Array.isArray(item.submenu)) return [];
  return item.submenu as Electron.MenuItemConstructorOptions[];
}
```

### Step 3: テストケースの実装

```typescript
describe("buildMacTemplate", () => {
  it("TC-4: zoomIn role を含む", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("zoomIn");
  });

  it("TC-5: zoomOut role を含む", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("zoomOut");
  });

  it("TC-6: resetZoom role を含む", () => {
    const template = buildMacTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("resetZoom");
  });

  it("TC-7: 編集メニューに undo/redo/cut/copy/paste/selectAll を含む", () => {
    const template = buildMacTemplate();
    const editSubmenu = findSubmenuByLabel(template, "編集");
    const roles = collectRoles(editSubmenu);
    expect(roles).toContain("undo");
    expect(roles).toContain("redo");
    expect(roles).toContain("cut");
    expect(roles).toContain("copy");
    expect(roles).toContain("paste");
    expect(roles).toContain("selectAll");
  });

  it("TC-8: アプリ名メニューに quit role を含む", () => {
    const template = buildMacTemplate();
    const appMenu = template[0];
    const submenu = Array.isArray(appMenu.submenu)
      ? (appMenu.submenu as Electron.MenuItemConstructorOptions[])
      : [];
    const roles = collectRoles(submenu);
    expect(roles).toContain("quit");
  });

  it("TC-9: ウィンドウメニューに minimize と close role を含む", () => {
    const template = buildMacTemplate();
    const windowSubmenu = findSubmenuByLabel(template, "ウィンドウ");
    const roles = collectRoles(windowSubmenu);
    expect(roles).toContain("minimize");
    expect(roles).toContain("close");
  });
});

describe("buildDefaultTemplate", () => {
  it("TC-10: zoomIn/zoomOut/resetZoom role を含む", () => {
    const template = buildDefaultTemplate();
    const viewSubmenu = findSubmenuByLabel(template, "表示");
    const roles = collectRoles(viewSubmenu);
    expect(roles).toContain("zoomIn");
    expect(roles).toContain("zoomOut");
    expect(roles).toContain("resetZoom");
  });

  it("TC-11: メニューが 1 件のみ（「表示」のみ）", () => {
    const template = buildDefaultTemplate();
    expect(template).toHaveLength(1);
    expect(template[0].label).toBe("表示");
  });
});

describe("createApplicationMenu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-1: darwin では buildMacTemplate を使う", () => {
    mockPlatform("darwin");
    const menu = createApplicationMenu();
    // macOS テンプレートは 4 メニュー（アプリ名/編集/表示/ウィンドウ）
    expect(menu.template).toHaveLength(4);
  });

  it("TC-2: win32 では buildDefaultTemplate を使う", () => {
    mockPlatform("win32");
    const menu = createApplicationMenu();
    // Windows テンプレートは 1 メニュー（表示のみ）
    expect(menu.template).toHaveLength(1);
  });

  it("TC-3: linux では buildDefaultTemplate を使う", () => {
    mockPlatform("linux");
    const menu = createApplicationMenu();
    expect(menu.template).toHaveLength(1);
  });

  it("TC-12: Menu.setApplicationMenu が 1 回呼ばれる", async () => {
    const { Menu } = await import("electron");
    mockPlatform("darwin");
    createApplicationMenu();
    expect(Menu.setApplicationMenu).toHaveBeenCalledTimes(1);
  });
});
```

### Step 4: テスト実行（Red 確認）

Phase 5 の実装前にテストを実行し、全テストが失敗（Red）であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/__tests__/menu.test.ts
```

期待される出力: 全 12 テストが失敗（`FAIL` ステータス）。理由: `buildMacTemplate` / `buildDefaultTemplate` / `createApplicationMenu` が `index.ts` に存在しない。

---

## コード成果物パス

| 成果物                                         | 種別                 |
| ---------------------------------------------- | -------------------- |
| `apps/desktop/src/main/__tests__/menu.test.ts` | テストコード（新規） |

---

## 完了条件

- [ ] `apps/desktop/src/main/__tests__/menu.test.ts` が作成されている
- [ ] TC-1〜TC-12 の全テストケースがコードとして実装されている
- [ ] `vi.mock("electron")` で `Menu.buildFromTemplate` / `Menu.setApplicationMenu` がモック化されている
- [ ] `afterEach(() => vi.restoreAllMocks())` が各 describe ブロックまたはファイルレベルに設定されている（P9 対策）
- [ ] `process.platform` が `vi.spyOn(process, "platform", "get")` でモック化されている
- [ ] `findSubmenuByLabel` / `collectRoles` ヘルパー関数がテストファイル内に定義されている
- [ ] Phase 5 実装前にテストを実行して全テストが Red（失敗）であることを確認済み
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が含まれていない

---

## 次 Phase

Phase 5（実装）へ進む。
前提条件: 本 Phase の完了条件チェックリストが全て満たされていること。
