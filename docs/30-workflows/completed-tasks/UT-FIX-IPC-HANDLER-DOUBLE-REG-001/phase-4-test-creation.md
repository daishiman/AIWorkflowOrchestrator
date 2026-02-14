# Phase 4: テスト作成（TDD Red） - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| Phase        | 4                                  |
| Phase名      | テスト作成（TDD Red）              |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001  |
| タスク名     | IPC ハンドラ二重登録例外の修正     |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001  |
| 種別         | バグ修正 (fix)                     |
| 優先度       | 高                                 |
| GitHub Issue | #815                               |
| 関連Pitfall  | P5（リスナー二重登録）             |
| 前提Phase    | Phase 3（設計レビューゲート PASS） |
| 後続Phase    | Phase 5（実装 / TDD Green）        |
| ステータス   | 未実施                             |
| 作成日       | 2026-02-14                         |

---

## 目的

TDD 原則に従い、修正前に失敗するテスト（Red 状態）を作成する。`registerAllIpcHandlers()` の二重呼び出しで例外が発生する現状の動作と、修正後に期待される動作の両方を検証するテストを実装より先に作成し、実装の期待動作を明確化する。

## 背景

Phase 1 で定義された受入基準（AC-1 ~ AC-5）に基づき、以下のシナリオをテストで再現する:

1. `registerAllIpcHandlers()` を2回呼び出すと `ipcMain.handle()` が例外を送出する（現在のバグの再現）
2. `unregisterAllIpcHandlers()` を呼び出すと全チャンネルの `removeHandler` が実行される（修正後の期待動作）
3. unregister → re-register の流れで例外が発生しない（修正後の期待動作）

---

## 実行タスク

- タスク実行: 本Phaseで定義したタスクを上から順に実行し、結果を成果物に記録する。

### タスク 1: テストケース設計

受入基準（AC-1 ~ AC-5）に基づいてテストケースを設計する。

#### 正常系テスト

| TC-ID | テストケース名                                                     | 受入基準 | テスト内容                                                                             |
| ----- | ------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------- |
| TC-01 | registerAllIpcHandlers が全ハンドラ登録関数を呼び出す              | AC-3     | registerAllIpcHandlers(mainWindow) を呼び出すと、内部の全登録関数が1回ずつ呼ばれること |
| TC-02 | unregisterAllIpcHandlers が全チャンネルの removeHandler を呼び出す | AC-1     | unregisterAllIpcHandlers() で ipcMain.removeHandler が全登録チャンネル分呼ばれること   |
| TC-03 | unregister 後の re-register で例外が発生しない                     | AC-1     | unregisterAllIpcHandlers() → registerAllIpcHandlers() の順で例外なし                   |

#### 異常系テスト

| TC-ID | テストケース名                                        | 受入基準 | テスト内容                                                                         |
| ----- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| TC-04 | registerAllIpcHandlers の二重呼び出しで例外が発生する | AC-1     | registerAllIpcHandlers() を2回連続で呼び出すと ipcMain.handle が例外を送出すること |

#### activate イベントシミュレーションテスト

| TC-ID | テストケース名                                             | 受入基準 | テスト内容                                                                                       |
| ----- | ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| TC-05 | activate イベントで unregister → re-register が実行される  | AC-1,2   | activate コールバック内で unregisterAllIpcHandlers → registerAllIpcHandlers が順に実行されること |
| TC-06 | activate 後の新ウィンドウで IPC ハンドラが新参照を使用する | AC-2     | 再登録後のハンドラが新しい mainWindow 参照を保持していること                                     |

#### ハンドラ登録状態検証テスト

| TC-ID | テストケース名                                            | 受入基準 | テスト内容                                                              |
| ----- | --------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| TC-07 | 初回起動時に registerAllIpcHandlers が1回だけ呼ばれる     | AC-3     | app.whenReady() → registerAllIpcHandlers() が1回だけ呼ばれることの検証  |
| TC-08 | unregisterAllIpcHandlers が ipcMain.on リスナーも解除する | AC-1     | ipcMain.on() で登録されたリスナーも removeAllListeners で解除されること |

---

### タスク 2: テストファイル作成

**テストファイル配置**:

| テスト対象               | テストファイルパス                                                    |
| ------------------------ | --------------------------------------------------------------------- |
| IPC ハンドラ二重登録防止 | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` |

**テストファイル構造**:

```typescript
// apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- Electron モック ---
// vi.mock("electron") で ipcMain.handle / ipcMain.removeHandler をモック
// BrowserWindow は vi.fn() でモック生成

// --- テスト対象インポート ---
// import { registerAllIpcHandlers, unregisterAllIpcHandlers } from "../index";

// --- 依存モジュールのモック ---
// 各ハンドラ登録関数をモック（registerFileHandlers, registerStoreHandlers, ... ）
// インフラストラクチャ関数をモック（getSupabaseClient, createSecureStorage, ... ）
// サービスクラスをモック（SkillService, AuthKeyService, ... ）

describe("IPC ハンドラ二重登録防止", () => {
  // describe("registerAllIpcHandlers", () => { ... });
  // describe("unregisterAllIpcHandlers", () => { ... });
  // describe("activate イベントシミュレーション", () => { ... });
  // describe("ハンドラ登録状態検証", () => { ... });
});
```

**Electron モック方式（既存パターン準拠）**:

```typescript
// authModeHandlers.test.ts のパターンに従う
const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
};

const mockBrowserWindow = {
  isDestroyed: vi.fn().mockReturnValue(false),
  webContents: {
    send: vi.fn(),
  },
};

vi.mock("electron", () => ({
  ipcMain: mockIpcMain,
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([]),
  },
  nativeTheme: {
    shouldUseDarkColors: false,
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  net: {
    isOnline: vi.fn().mockReturnValue(true),
  },
  app: {
    getPath: vi.fn().mockReturnValue("/tmp/test"),
  },
}));
```

**依存モジュールのモック方式**:

`registerAllIpcHandlers` は内部で多くの依存モジュール（サービス、インフラ）をインスタンス化するため、以下をモックする:

```typescript
// インフラストラクチャ関数モック
vi.mock("../../infrastructure", () => ({
  getSupabaseClient: vi.fn().mockReturnValue(null), // Supabase 未設定パスを使用
  createSecureStorage: vi.fn(),
  createProfileCache: vi.fn(),
  createApiKeyStorage: vi.fn().mockReturnValue({}),
  createStubSharedHistoryService: vi.fn().mockReturnValue({}),
  createStubLogRepository: vi.fn().mockReturnValue({}),
  createStubLogger: vi.fn().mockReturnValue({}),
}));

// 各ハンドラ登録関数モック（個別の動作テストはそれぞれのテストファイルで実施済み）
vi.mock("../fileHandlers", () => ({
  registerFileHandlers: vi.fn(),
}));
// ... 他の全ハンドラ登録関数も同様にモック

// サービスクラスモック
vi.mock("../../services/skill", () => ({
  SkillScanner: vi.fn().mockImplementation(() => ({})),
  SkillParser: vi.fn().mockImplementation(() => ({})),
  SkillImportManager: vi.fn().mockImplementation(() => ({})),
  SkillService: vi.fn().mockImplementation(() => ({})),
  PermissionStore: vi.fn().mockImplementation(() => ({})),
}));
```

**テストケース詳細（TC-01 ~ TC-08）**:

```typescript
describe("registerAllIpcHandlers", () => {
  it("TC-01: 全ハンドラ登録関数を呼び出す", () => {
    // Arrange
    const mainWindow = mockBrowserWindow as unknown as BrowserWindow;

    // Act
    registerAllIpcHandlers(mainWindow);

    // Assert - 各登録関数が1回ずつ呼ばれること
    expect(registerFileHandlers).toHaveBeenCalledTimes(1);
    expect(registerStoreHandlers).toHaveBeenCalledTimes(1);
    // ... 全26関数を検証
  });
});

describe("unregisterAllIpcHandlers", () => {
  it("TC-02: 全チャンネルの removeHandler を呼び出す [RED]", () => {
    // この関数はまだ存在しないため、import エラーまたは undefined で失敗する
    // Act
    unregisterAllIpcHandlers();

    // Assert
    expect(mockIpcMain.removeHandler).toHaveBeenCalled();
    // removeHandler の呼び出し回数が登録チャンネル数と一致すること
  });
});

describe("二重登録防止", () => {
  it("TC-03: unregister 後の re-register で例外が発生しない [RED]", () => {
    const mainWindow = mockBrowserWindow as unknown as BrowserWindow;

    // Act
    registerAllIpcHandlers(mainWindow);
    unregisterAllIpcHandlers(); // まだ存在しない → RED
    expect(() => registerAllIpcHandlers(mainWindow)).not.toThrow();
  });

  it("TC-04: 二重呼び出しで例外が発生する（現状の再現）", () => {
    const mainWindow = mockBrowserWindow as unknown as BrowserWindow;

    // 2回目の handle 呼び出しで例外を発生させる
    mockIpcMain.handle
      .mockImplementationOnce(() => {}) // 1回目: 成功
      .mockImplementationOnce(() => {
        throw new Error("Attempted to register a second handler");
      });

    registerAllIpcHandlers(mainWindow);
    expect(() => registerAllIpcHandlers(mainWindow)).toThrow(
      "Attempted to register a second handler",
    );
  });
});

describe("activate イベントシミュレーション", () => {
  it("TC-05: activate で unregister → re-register が実行される [RED]", () => {
    const oldWindow = mockBrowserWindow as unknown as BrowserWindow;
    const newWindow = { ...mockBrowserWindow } as unknown as BrowserWindow;

    // 初回登録
    registerAllIpcHandlers(oldWindow);

    // activate シミュレーション: unregister → re-register
    unregisterAllIpcHandlers(); // まだ存在しない → RED
    expect(() => registerAllIpcHandlers(newWindow)).not.toThrow();
  });

  it("TC-06: activate 後のハンドラが新ウィンドウ参照を使用する [RED]", () => {
    // 新しい mainWindow 参照での登録関数呼び出しを検証
    const newWindow = { ...mockBrowserWindow } as unknown as BrowserWindow;

    unregisterAllIpcHandlers(); // まだ存在しない → RED
    registerAllIpcHandlers(newWindow);

    // mainWindow を必要とする登録関数に新ウィンドウが渡されていること
    expect(registerWindowHandlers).toHaveBeenCalledWith(newWindow);
    expect(registerDialogHandlers).toHaveBeenCalledWith(newWindow);
  });
});
```

---

### タスク 3: テスト実行と Red 状態の確認

テストを実行し、`unregisterAllIpcHandlers` が存在しないため失敗（Red 状態）することを確認する。

**テスト実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts
```

**期待される Red 状態**:

| TC-ID | 失敗理由                                                            |
| ----- | ------------------------------------------------------------------- |
| TC-02 | `unregisterAllIpcHandlers` が export されていないため import エラー |
| TC-03 | 同上                                                                |
| TC-05 | 同上                                                                |
| TC-06 | 同上                                                                |
| TC-08 | 同上                                                                |

TC-01, TC-04, TC-07 は現状のコードでも PASS する可能性がある（既存動作の検証）。

---

## 参照資料

| 資料名                | パス                                                                           | 説明                               |
| --------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| Phase 1 要件定義      | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-1-requirements.md`  | 受入基準 AC-1 ~ AC-5               |
| Phase 2 設計          | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-2-design.md`        | 修正アプローチと設計根拠           |
| Phase 3 設計レビュー  | `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-3-design-review.md` | レビュー判定と指摘事項             |
| IPC 登録集約          | `apps/desktop/src/main/ipc/index.ts`                                           | registerAllIpcHandlers 関数        |
| Main Process エントリ | `apps/desktop/src/main/index.ts`                                               | activate イベント処理（行274-278） |
| IPC チャネル定義      | `apps/desktop/src/preload/channels.ts`                                         | 全チャンネル定数定義               |
| 既存テストパターン    | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                 | Electron モック方式の参考          |
| 既知の落とし穴 P5     | `.claude/rules/06-known-pitfalls.md#P5`                                        | リスナー二重登録の教訓             |
| 既知の落とし穴 P40    | `.claude/rules/06-known-pitfalls.md#P40`                                       | テスト実行ディレクトリ依存         |

---

## 実行手順

1. テストファイル `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` を作成する
2. Electron モック（ipcMain, BrowserWindow, nativeTheme, net, app）を定義する
3. 全依存モジュール（ハンドラ登録関数、インフラ関数、サービスクラス）をモックする
4. TC-01 ~ TC-08 のテストケースを実装する
5. テスト実行コマンドを `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts` で実行する（P40 対策）
6. TC-02, TC-03, TC-05, TC-06, TC-08 が Red（失敗）状態であることを確認する
7. TC-01, TC-04 が Green（成功）状態であることを確認する（既存動作の検証）

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物         | パス                                                                  | 説明                          |
| -------------- | --------------------------------------------------------------------- | ----------------------------- |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | 二重登録防止テスト（8ケース） |

---

## 完了条件

- [ ] テストファイル `ipc-double-registration.test.ts` が作成されている
- [ ] TC-01 ~ TC-08 の全テストケースが実装されている
- [ ] Electron モック（ipcMain, BrowserWindow）が authModeHandlers.test.ts のパターンに準拠している
- [ ] 全依存モジュールがモックされており、実際のファイルシステムやネットワークアクセスが発生しない
- [ ] TC-02, TC-03, TC-05, TC-06, TC-08 が Red（失敗）状態で、失敗理由が `unregisterAllIpcHandlers` の未存在であること
- [ ] TC-01, TC-04 が現状のコードで PASS すること（既存動作の検証）
- [ ] テスト実行が `cd apps/desktop && pnpm vitest run` で実行されている（P40 対策）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 5: 実装（TDD Green）
