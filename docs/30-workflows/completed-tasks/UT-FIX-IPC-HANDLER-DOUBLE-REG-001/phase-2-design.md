# Phase 2: 設計 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 2                                 |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 作成日       | 2026-02-14                        |

## 目的

Phase 1 で定義した要件に基づき、`app.on("activate")` 時の IPC ハンドラ二重登録例外を解消する修正方針を設計する。3つのアプローチ（A/B/C案）を比較評価し、mainWindowRef の参照方式を考慮して最適なアプローチを選定する。

## 実行タスク

- タスク実行: 本Phaseで定義したタスクを上から順に実行し、結果を成果物に記録する。

### Task 1: 3つのアプローチの比較評価

A/B/C 案を以下の評価軸で比較し、最適案を選定する。

### Task 2: mainWindowRef の参照方式に基づくアプローチ選定

`registerAllIpcHandlers()` 内の各関数が mainWindow をクロージャキャプチャしているか確認し、新ウィンドウ作成時の参照更新を保証するアプローチを選定する。

### Task 3: 修正対象ファイルのインターフェース設計

選定したアプローチに基づき、修正対象ファイルの変更インターフェースを設計する。

### Task 4: unregisterAllIpcHandlers() の設計（A案選択時）

A案を選択した場合、全ハンドラの解除関数を設計する。

## 参照資料

| 資料名                | パス                                    | 説明                               |
| --------------------- | --------------------------------------- | ---------------------------------- |
| Phase 1 要件定義      | `phase-1-requirements.md`               | Phase 1 成果物                     |
| Main Process エントリ | `apps/desktop/src/main/index.ts`        | activate イベント処理（行274-278） |
| IPC 登録集約          | `apps/desktop/src/main/ipc/index.ts`    | registerAllIpcHandlers 関数        |
| IPC チャネル定義      | `apps/desktop/src/preload/channels.ts`  | ホワイトリスト・チャンネル名定義   |
| 既知の落とし穴 P5     | `.claude/rules/06-known-pitfalls.md#P5` | リスナー二重登録の教訓             |
| セキュリティ原則      | `.claude/rules/04-electron-security.md` | IPC セキュリティ原則               |

---

## アプローチ比較評価

### A案: 既存ハンドラ削除後に再登録

**概要**: `unregisterAllIpcHandlers()` を新規作成し、activate 時に unregister → register の順で実行する。

**メカニズム**:

```
app.on("activate")
  → unregisterAllIpcHandlers()    // 全チャンネルを ipcMain.removeHandler() で解除
  → mainWindowRef = createWindow()
  → registerAllIpcHandlers(mainWindowRef)  // 新しい mainWindow 参照で再登録
```

| 評価軸              | 評価 | 理由                                                                                    |
| ------------------- | ---- | --------------------------------------------------------------------------------------- |
| 二重登録解消        | 確実 | removeHandler() で解除後に再登録するため、二重登録は発生しない                          |
| mainWindow 参照更新 | 確実 | 再登録時に新しい mainWindow が引数として渡されるため、全ハンドラが新しい参照を保持する  |
| 実装複雑度          | 中   | 全チャンネル名を列挙した unregister 関数の作成が必要                                    |
| セキュリティリスク  | 低   | unregister と register の間に短い隙間が生じるが、Renderer 側の Preload は同期的ではない |
| 既存コードへの影響  | 小   | index.ts の activate ハンドラと ipc/index.ts への関数追加のみ                           |
| テスタビリティ      | 高   | unregister/register の単体テストが容易                                                  |

**メリット**:

- mainWindow 参照の更新が構造的に保証される
- `ipcMain.on()` のリスナーも含めて一括クリーンアップできる
- 各ハンドラ登録関数の内部変更が不要

**デメリット**:

- 全チャンネル名の網羅が必要（漏れがあると一部ハンドラが解除されない）
- unregister → register の間に極めて短いハンドラ未登録期間が発生する

---

### B案: 登録済みフラグでガード

**概要**: モジュールスコープの `let isIpcHandlersRegistered = false` フラグで1回だけ登録する。

**メカニズム**:

```
let isIpcHandlersRegistered = false;

function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  if (isIpcHandlersRegistered) return;
  isIpcHandlersRegistered = true;
  // ... 既存の登録処理
}
```

| 評価軸              | 評価   | 理由                                                                            |
| ------------------- | ------ | ------------------------------------------------------------------------------- |
| 二重登録解消        | 確実   | フラグで2回目以降をスキップするため、二重登録は発生しない                       |
| mainWindow 参照更新 | 不可能 | 2回目の呼び出しがスキップされるため、新しい mainWindow 参照がハンドラに渡らない |
| 実装複雑度          | 低     | フラグ1つの追加のみ                                                             |
| セキュリティリスク  | なし   | ハンドラは常に登録済みのため、隙間は発生しない                                  |
| 既存コードへの影響  | 最小   | ipc/index.ts の先頭にフラグチェックを追加するのみ                               |
| テスタビリティ      | 高     | フラグの状態をテストするだけで検証可能                                          |

**メリット**:

- 実装が最もシンプル

**デメリット**:

- mainWindow 参照が更新されないため、新ウィンドウへの `webContents.send()` が失敗する
- mainWindow をクロージャキャプチャしているハンドラは古い（破棄済み）ウィンドウを参照し続ける
- **FR-1.3（新ウィンドウへの参照更新）を満たせない**

---

### C案: activate では IPC 再登録しない

**概要**: `ipcMain.handle()` はプロセスレベルでハンドラを登録するため、ウィンドウ再作成時に IPC ハンドラの再登録は不要。ただし、ハンドラ内の mainWindow 参照を更新する仕組みを別途用意する。

**メカニズム**:

```
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    // registerAllIpcHandlers() は呼ばない
    // mainWindow 参照はモジュールスコープの mainWindowRef 経由で解決
  }
});
```

| 評価軸              | 評価   | 理由                                                                              |
| ------------------- | ------ | --------------------------------------------------------------------------------- |
| 二重登録解消        | 確実   | 再登録自体を行わないため、二重登録は発生しない                                    |
| mainWindow 参照更新 | 条件付 | ハンドラが mainWindowRef をモジュールスコープ経由で参照している場合のみ更新される |
| 実装複雑度          | 高     | 全ハンドラの mainWindow 参照方式を確認・修正する必要がある                        |
| セキュリティリスク  | なし   | ハンドラは常に登録済みのため、隙間は発生しない                                    |
| 既存コードへの影響  | 大     | 約15個のハンドラ登録関数で mainWindow の参照方式を変更する必要がある              |
| テスタビリティ      | 中     | mainWindow 参照の動的解決をテストする必要がある                                   |

**メリット**:

- ハンドラの登録解除・再登録が不要
- プロセスレベルのハンドラライフサイクルに沿った設計

**デメリット**:

- 約15個のハンドラ登録関数の引数と内部実装を変更する必要がある（影響範囲が大きい）
- 既存テストの大規模修正が必要
- サービスオブジェクト（SkillService, AuthModeService 等）のインスタンスも再生成されない

---

## アプローチ選定

### 選定結果: A案（既存ハンドラ削除後に再登録）

### 選定理由

| 観点                     | A案    | B案            | C案    |
| ------------------------ | ------ | -------------- | ------ |
| FR-1.1（例外解消）       | 満たす | 満たす         | 満たす |
| FR-1.2（IPC正常動作）    | 満たす | 満たす         | 条件付 |
| FR-1.3（mainWindow更新） | 満たす | **満たさない** | 条件付 |
| FR-2.1（二重登録防止）   | 満たす | 満たす         | 満たす |
| 既存コード影響           | 小     | 最小           | 大     |
| 既存テスト影響           | なし   | なし           | 大     |
| セキュリティ維持         | 維持   | 維持           | 維持   |

B案は FR-1.3 を満たせないため不採用。C案は約15個のハンドラ関数の大規模修正が必要で影響範囲が過大。A案は unregisterAllIpcHandlers() の追加のみで全要件を満たせるため、最適である。

---

## 修正対象ファイル設計

### ファイル1: `apps/desktop/src/main/ipc/index.ts`

#### 追加関数: `unregisterAllIpcHandlers()`

```typescript
/**
 * 全 IPC ハンドラを解除する
 * activate イベントで registerAllIpcHandlers() を再実行する前に呼び出す
 */
export function unregisterAllIpcHandlers(): void {
  // IPC_CHANNELS 定数から全チャンネル名を取得して removeHandler() を実行
  const allChannels = Object.values(IPC_CHANNELS);
  for (const channel of allChannels) {
    try {
      ipcMain.removeHandler(channel);
    } catch {
      // removeHandler() は未登録チャンネルでもエラーを出さないが、
      // 念のため例外を握りつぶさず warning を出力
    }
  }

  // ipcMain.on() で登録されたリスナーも削除
  for (const channel of allChannels) {
    ipcMain.removeAllListeners(channel);
  }
}
```

**設計ポイント**:

- `IPC_CHANNELS` 定数（`apps/desktop/src/preload/channels.ts`）から全チャンネル名を取得する
- `ipcMain.removeHandler()` は未登録チャンネルに対してエラーを出さないため、安全に全チャンネルを走査できる
- `ipcMain.removeAllListeners()` で `ipcMain.on()` で登録されたリスナーも合わせてクリーンアップする
- `IPC_CHANNELS` に含まれないチャンネル名でハンドラが登録されている場合は検出できないが、プロジェクトの IPC セキュリティ原則（チャンネル名はホワイトリストで管理）に準拠していれば全チャンネルが `IPC_CHANNELS` に定義されている

#### IPC_CHANNELS の網羅性確認

`unregisterAllIpcHandlers()` が全ハンドラを確実に解除するためには、`IPC_CHANNELS` オブジェクトが全チャンネル名を網羅している必要がある。Phase 4（テスト作成）で以下を検証する:

- `ipcMain.handle()` の第1引数に渡される全チャンネル名が `IPC_CHANNELS` の値に含まれていること
- ハードコード文字列でチャンネル名を指定しているハンドラがないこと（P27: Preload ハードコード文字列の見落とし）

### ファイル2: `apps/desktop/src/main/index.ts`

#### activate イベントハンドラの修正

**修正前（行274-278）**:

```typescript
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

**修正後**:

```typescript
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindowRef = createWindow();
    unregisterAllIpcHandlers();
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

**変更点**:

- `import { registerAllIpcHandlers }` に `unregisterAllIpcHandlers` を追加
- `registerAllIpcHandlers()` の前に `unregisterAllIpcHandlers()` を呼び出す

---

## アーキテクチャ設計

### コンポーネント構成

```
┌───────────────────────────────────────────────────────────────┐
│                      Main Process                              │
│                                                                │
│  index.ts                                                      │
│  ├── app.whenReady()                                           │
│  │   ├── createWindow() → mainWindowRef                        │
│  │   └── registerAllIpcHandlers(mainWindowRef)  ← 初回登録     │
│  │                                                             │
│  └── app.on("activate")                                        │
│      ├── unregisterAllIpcHandlers()  ← 全解除（NEW）           │
│      ├── createWindow() → mainWindowRef                        │
│      └── registerAllIpcHandlers(mainWindowRef)  ← 新参照で再登録│
│                                                                │
│  ipc/index.ts                                                  │
│  ├── registerAllIpcHandlers(mainWindow)                        │
│  │   ├── registerFileHandlers()                                │
│  │   ├── registerStoreHandlers()                               │
│  │   ├── ... (約26個のハンドラ登録関数)                        │
│  │   └── registerChatEditHandlers(mainWindow, ...)             │
│  │                                                             │
│  └── unregisterAllIpcHandlers()          ← NEW                 │
│      ├── Object.values(IPC_CHANNELS) を走査                    │
│      ├── ipcMain.removeHandler(channel)  ← handle() 解除      │
│      └── ipcMain.removeAllListeners(channel)  ← on() 解除     │
└───────────────────────────────────────────────────────────────┘
```

### 処理フロー

```
[初回起動]
app.whenReady()
  │
  ├─ mainWindowRef = createWindow()
  │
  └─ registerAllIpcHandlers(mainWindowRef)
       └─ ipcMain.handle("file:get-tree", handler)  ← 成功

[全ウィンドウ閉鎖（macOS）]
window-all-closed
  └─ process.platform === "darwin" → app.quit() しない
     （ハンドラはプロセスレベルで残存）

[ドックアイコンクリック]
app.on("activate")
  │
  ├─ BrowserWindow.getAllWindows().length === 0  ← true
  │
  ├─ unregisterAllIpcHandlers()                  ← NEW: 全ハンドラ解除
  │   ├─ ipcMain.removeHandler("file:get-tree")  ← 成功
  │   ├─ ipcMain.removeHandler("file:read")       ← 成功
  │   └─ ... (全チャンネル)
  │
  ├─ mainWindowRef = createWindow()               ← 新ウィンドウ作成
  │
  └─ registerAllIpcHandlers(mainWindowRef)         ← 新参照で再登録
       └─ ipcMain.handle("file:get-tree", handler)  ← 成功（解除済み）
```

### ファイル構成

| ファイル                             | 変更内容                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| `apps/desktop/src/main/index.ts`     | activate ハンドラに `unregisterAllIpcHandlers()` 呼び出しを追加 |
| `apps/desktop/src/main/ipc/index.ts` | `unregisterAllIpcHandlers()` 関数を新規追加・エクスポート       |

---

## セキュリティ設計

### 4層防御の維持確認

| 防御層                 | 修正による影響 | 理由                                             |
| ---------------------- | -------------- | ------------------------------------------------ |
| L1: ホワイトリスト     | 影響なし       | `IPC_CHANNELS` 定数は変更しない                  |
| L2: Sender検証         | 影響なし       | 各ハンドラ内の検証ロジックは変更しない           |
| L3: 引数バリデーション | 影響なし       | 各ハンドラ内のバリデーションロジックは変更しない |
| L4: エラーサニタイズ   | 影響なし       | エラーレスポンスの形式は変更しない               |

### unregister → register 間のセキュリティ

- `unregisterAllIpcHandlers()` と `registerAllIpcHandlers()` は同期的に連続実行される
- Renderer プロセスの IPC 呼び出しは非同期（`ipcRenderer.invoke()` は Promise）であるため、unregister → register の間に Renderer からのリクエストが処理される可能性は事実上ない
- 仮に隙間にリクエストが到達した場合、`ipcMain.handle()` が未登録状態なので `Error: No handler registered for 'channel'` が返され、Renderer 側でエラーとして処理される（フェイルセキュア）

---

## エッジケース設計

### 1. activate が連続で発火した場合

```typescript
// activate が短時間に複数回発火しても安全
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // 2回目の activate 時:
    // - unregister で全ハンドラ解除（1回目で登録済みのものを解除）
    // - register で再登録
    // → 正常動作
    unregisterAllIpcHandlers();
    mainWindowRef = createWindow();
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

`BrowserWindow.getAllWindows().length === 0` のガードがあるため、ウィンドウが存在する間は再登録されない。ウィンドウが閉じられた直後に再度 activate が発火した場合も、unregister → register の順序で安全に処理される。

### 2. registerAllIpcHandlers() 内で条件分岐するハンドラ

`registerAuthHandlers()` / `registerAuthFallbackHandlers()` は Supabase の設定有無で条件分岐する。`unregisterAllIpcHandlers()` は `IPC_CHANNELS` の全チャンネルを走査するため、どちらのパスで登録されたハンドラも確実に解除される。

### 3. setupThemeWatcher() の二重呼び出し

`registerAllIpcHandlers()` 内の `setupThemeWatcher()` はテーマ変更の監視を開始する。再登録時に二重で呼ばれるため、`setupThemeWatcher()` 内で既存リスナーの重複を防ぐガードが必要か確認する（Phase 4 のテストで検証）。

---

## 統合テスト連携【必須】

- 本Phaseの決定事項・検証観点を `outputs/phase-11/manual-test-result.md` の手動テスト観点に反映する。
- `app.on("activate")` 再初期化シナリオ（unregister → createWindow → register）の確認観点を維持する。

## 成果物

| 成果物           | パス                                 | 説明                           |
| ---------------- | ------------------------------------ | ------------------------------ |
| 設計ドキュメント | `outputs/phase-2/design-document.md` | 本ドキュメントの実行結果を記録 |

---

## 完了条件

- [ ] A/B/C 案の比較評価が完了し、全評価軸の根拠が記載されている
- [ ] 選定理由が FR-1.1 ~ FR-2.3 の要件マッピングで説明されている
- [ ] `unregisterAllIpcHandlers()` の関数シグネチャとロジックが設計されている
- [ ] `apps/desktop/src/main/index.ts` の activate ハンドラ修正内容が明確である
- [ ] `IPC_CHANNELS` の網羅性確認方針が記載されている
- [ ] 4層防御への影響分析が完了し、全レイヤーで「影響なし」が確認されている
- [ ] エッジケース（activate 連続発火、条件分岐ハンドラ、setupThemeWatcher 二重呼出）が分析されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート
