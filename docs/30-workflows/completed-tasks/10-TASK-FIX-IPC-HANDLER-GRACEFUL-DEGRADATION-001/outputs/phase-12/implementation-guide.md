# TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 実装ガイド

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスク ID  | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001           |
| Phase      | 12 - ドキュメント                                       |
| 作成日     | 2026-03-08                                              |
| 関連 P5    | リスナー二重登録（06-known-pitfalls.md#P5）             |
| 前提タスク | UT-FIX-IPC-HANDLER-DOUBLE-REG-001（二重登録防止の基盤） |

---

## Part 1: この修正は何をしたのか（やさしい説明）

### なぜこの修正が必要だったのか

### たとえ話：ショッピングモールの開店準備

大きなショッピングモールを想像してください。朝、開店準備でたくさんのレジを順番に開けていきます。

- **レジ** = アプリの中にある「受付窓口」（画面からの操作を受け取って処理する担当）
- **レジを開ける作業** = それぞれの担当を登録する作業
- **壊れたレジ** = 何らかの原因で登録に失敗する1つの担当

#### 何が問題だったのか

今までの仕組みでは、5番目のレジを開けようとして壊れていた場合、**6番目以降のレジも全部開けられなくなっていました**。1か所の故障がモール全体の営業を止めてしまうのです。

たとえば「スキル管理」という窓口の登録に失敗すると、それ以降の「認証」「チャット」「通知」といった全く関係ない窓口まで開かなくなっていました。お客さん（ユーザー）からすると、スキル管理だけが使えないはずなのに、アプリ全体がまともに動かないという状態です。

### 何をしたか

#### どうやって直したのか

新しいやり方では、レジを1つ開けるたびに「ここは大丈夫か」を個別に確認します。

1. レジを開けてみる
2. 無事に開いた → 次のレジへ進む
3. 壊れていた → 「このレジは今だめ」と記録して、**次のレジへ進む**

つまり、全部を1本のひもでつなぐのをやめて、1つずつ独立して扱うようにしました。

さらに、閉店後には「今日の開店結果」として以下の情報がまとまります。

- 何台のレジが無事に開いたか
- 何台が壊れていたか
- 壊れていたレジの名前と、壊れた理由

#### 修正前と修正後の比較

| 状況                 | 修正前                             | 修正後                                   |
| -------------------- | ---------------------------------- | ---------------------------------------- |
| 途中の1か所が失敗    | 残り全部が止まる                   | 壊れた担当だけ飛ばして残りは続く         |
| 何が失敗したか       | エラー画面が出るだけで特定しにくい | 失敗した担当名と理由が記録される         |
| 関係ない機能への影響 | まとめて使えなくなる               | 無関係な機能はそのまま使える             |
| 開店結果             | 成功か失敗かの二択                 | 成功数・失敗数・失敗詳細の構造化レポート |

#### ポイントまとめ

- **問題**: 1つの受付窓口の登録失敗が、残り全ての窓口の登録を巻き込んで止めていた
- **解決**: 各窓口を個別に try-catch で囲み、失敗を記録しつつ次へ進む仕組み（Graceful Degradation）を導入した
- **効果**: アプリの起動時の堅牢性が向上し、部分的な障害でも可能な限り多くの機能が利用可能になった

---

## Part 2: 開発者向け技術詳細

### 2.1 問題の根本原因

`registerAllIpcHandlers()` 内で各ドメインのハンドラ登録関数（`registerFileHandlers()`, `registerSkillHandlers()` など）を順次呼び出していたが、いずれかの関数が例外を投げると、後続の登録関数が一切実行されなかった。

例えば `SkillService` のコンストラクタで依存パス解決に失敗した場合、それ以降の Auth、ChatEdit、ClaudeCLI などの全く無関係なハンドラまで未登録のまま残る。Renderer 側からの IPC 呼び出しは「ハンドラ未登録」として失敗し、ユーザーにとってはアプリ全体が壊れたように見える。

### 2.2 変更ファイル一覧

| ファイル                                                               | 変更内容                                                                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/index.ts`                                   | `safeRegister()` / `sanitizeRegistrationErrorMessage()` 追加、`track()` 内部関数追加、戻り値を `IpcHandlerRegistrationResult` に変更 |
| `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | Graceful Degradation 19 テストとログサニタイズ回帰検証                                                                               |

### 2.3 型定義

```typescript
/** ハンドラ登録失敗情報 */
export interface HandlerRegistrationFailure {
  handlerName: string;
  errorMessage: string;
  errorCode: number; // 4001 = Infrastructure Error
}

/** registerAllIpcHandlers の戻り値 */
export interface IpcHandlerRegistrationResult {
  successCount: number;
  failureCount: number;
  failures: HandlerRegistrationFailure[];
}
```

- `errorCode: 4001` は `error-handling.md` の Infrastructure Error（4000-4999 範囲）に該当する
- `errorMessage` にはファイルパスやスタックトレースなどの内部情報を含めない（NFR-02 準拠）
- ユーザーホーム配下のパスは `sanitizeRegistrationErrorMessage()` で `~` へマスクする

### 2.4 safeRegister ヘルパー

#### APIシグネチャ

```typescript
function sanitizeRegistrationErrorMessage(message: string): string;

function safeRegister(
  handlerName: string,
  registerFn: () => void,
  failures: HandlerRegistrationFailure[],
): boolean;
```

```typescript
/**
 * 個別ハンドラ登録を try-catch で囲み、失敗時にログ出力と記録を行う
 */
function safeRegister(
  handlerName: string,
  registerFn: () => void,
  failures: HandlerRegistrationFailure[],
): boolean {
  try {
    registerFn();
    return true;
  } catch (error: unknown) {
    const errorMessage = sanitizeRegistrationErrorMessage(
      error instanceof Error ? error.message : "Unknown error",
    );
    console.error(`[IPC] Failed to register ${handlerName}: ${errorMessage}`);
    failures.push({
      handlerName,
      errorMessage,
      errorCode: 4001,
    });
    return false;
  }
}
```

**設計判断**:

- `safeRegister` はモジュールスコープの独立関数として定義（`registerAllIpcHandlers` 内のクロージャではない）
- `failures` 配列を引数で受け取ることで、呼び出し元が失敗情報を集約できる
- 戻り値 `boolean` により、呼び出し元で成功カウントを管理できる
- ログ出力前に `sanitizeRegistrationErrorMessage` を通すことで、`/Users/<name>/...` や `/home/<name>/...` を `~` へ置換できる

### 2.5 track 内部ヘルパー

#### 使用例

```typescript
const failures: HandlerRegistrationFailure[] = [];
let successCount = 0;

const track = (name: string, fn: () => void): void => {
  if (safeRegister(name, fn, failures)) {
    successCount++;
  }
};

track("registerFileHandlers", () => registerFileHandlers());
track("registerWindowHandlers", () => registerWindowHandlers(mainWindow));
```

`registerAllIpcHandlers` 内部で `safeRegister` をさらに簡潔に呼び出すためのクロージャ。

```typescript
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
): IpcHandlerRegistrationResult {
  const failures: HandlerRegistrationFailure[] = [];
  let successCount = 0;

  const track = (name: string, fn: () => void): void => {
    if (safeRegister(name, fn, failures)) {
      successCount++;
    }
  };

  // --- 1. 依存なしハンドラ ---
  track("registerFileHandlers", () => registerFileHandlers());
  track("registerStoreHandlers", () => registerStoreHandlers());
  // ... 他のハンドラも同様 ...

  // --- サマリーログ ---
  if (failures.length > 0) {
    console.error(
      `[IPC] Handler registration completed with ${failures.length} failure(s): ${failures.map((f) => f.handlerName).join(", ")}`,
    );
  }

  return { successCount, failureCount: failures.length, failures };
}
```

### 2.6 ログ出力パターン

| タイミング | フォーマット                                                                               | レベル |
| ---------- | ------------------------------------------------------------------------------------------ | ------ |
| 個別失敗時 | `[IPC] Failed to register ${handlerName}: ${errorMessage}`                                 | error  |
| サマリー   | `[IPC] Handler registration completed with ${failures.length} failure(s): ${failureNames}` | error  |

- サマリーログは `failures.length > 0` の場合のみ出力される
- ログには内部ファイルパスやスタックトレースを含めない（NFR-02: セキュリティ情報の非漏洩）
- `error.message` に含まれるホームディレクトリ配下パスは `~` に正規化してから出力する

### 2.7 setupThemeWatcher の個別扱い

`setupThemeWatcher()` は IPC ハンドラではなく `nativeTheme.on("updated", ...)` のイベントリスナーを登録する関数であり、unsubscribe 関数を戻り値として返す。この戻り値をモジュールスコープ変数 `themeWatcherUnsubscribe` に保存する必要があるため、`safeRegister` を使わず個別の try-catch で管理する。

```typescript
// --- 3. Theme watcher ---
try {
  themeWatcherUnsubscribe = setupThemeWatcher(nativeTheme, () =>
    BrowserWindow.getAllWindows(),
  );
  successCount++;
} catch (error: unknown) {
  const errorMessage = sanitizeRegistrationErrorMessage(
    error instanceof Error ? error.message : "Unknown error",
  );
  console.error(`[IPC] Failed to register setupThemeWatcher: ${errorMessage}`);
  failures.push({
    handlerName: "setupThemeWatcher",
    errorMessage,
    errorCode: 4001,
  });
}
```

**なぜ `safeRegister` を使わないか**: `safeRegister` の `registerFn` は `() => void` であり、戻り値を取得できない。`setupThemeWatcher` の戻り値（unsubscribe 関数）をキャプチャする必要があるため、個別に try-catch を書く。

### 2.8 unregisterAllIpcHandlers との対称性

`unregisterAllIpcHandlers()` は UT-FIX-IPC-HANDLER-DOUBLE-REG-001 で追加された既存関数であり、本タスクでは変更不要。

**変更不要の理由**:

- `ipcMain.removeHandler()` は未登録チャンネルに対して呼び出してもエラーを投げない
- 一部のハンドラ登録が失敗した場合でも、`unregisterAllIpcHandlers()` は全チャンネルを安全に走査できる
- `themeWatcherUnsubscribe` が `null`（setupThemeWatcher 失敗時）の場合、条件分岐で安全にスキップされる

```
registerAllIpcHandlers()      unregisterAllIpcHandlers()
  ├─ track("fileHandlers")      ├─ unregisterAuthKeyHandlers()
  ├─ track("storeHandlers")     ├─ Object.values(IPC_CHANNELS).forEach:
  ├─ track("...") x N           │   ├─ removeHandler(channel)
  ├─ themeWatcher 個別管理      │   └─ removeAllListeners(channel)
  └─ return Result              └─ themeWatcherUnsubscribe?.()
```

### 2.9 後方互換性

既存の呼び出し元（`apps/desktop/src/main/index.ts` L272, L278）は `registerAllIpcHandlers(mainWindow)` の戻り値を使用していない。

```typescript
// 既存コード（変更不要）
registerAllIpcHandlers(mainWindowRef);
```

戻り値が `void` から `IpcHandlerRegistrationResult` に変わっても、戻り値を無視している呼び出し元には影響がない。将来的に戻り値を活用して、失敗したハンドラに応じた UI フィードバック（機能制限バナー等）を実装できる拡張ポイントとなる。

### 2.10 ハンドラ登録グループの構造

`registerAllIpcHandlers` 内のハンドラ登録は以下のグループに分類される。

| グループ | 内容                                | 依存関係                     |
| -------- | ----------------------------------- | ---------------------------- |
| 1        | 依存なしハンドラ（11個）            | なし                         |
| 2        | mainWindow 依存ハンドラ（2個）      | `mainWindow`                 |
| 3        | Theme watcher（1個）                | `nativeTheme`（個別管理）    |
| 4        | Supabase 条件分岐（3個 or 1個）     | `getSupabaseClient()`        |
| 5        | API Key ハンドラ（1個）             | `apiKeyStorage`              |
| 6        | History ハンドラ（3個）             | DI サービス群                |
| 7        | Agent Execution ハンドラ（1個）     | `mainWindow`                 |
| 8        | Auth Key + Skill 系ハンドラ（10個） | `authKeyService`, Skill DI群 |
| 9        | Auth Mode ハンドラ（2個）           | `authKeyService`             |
| 10       | Skill Creator ハンドラ（1個）       | `SkillCreatorService`        |
| 11       | Claude CLI ハンドラ（1個）          | `mainWindow`                 |
| 12       | Chat Edit ハンドラ（1個）           | DI サービス群                |

各グループ内の個々の `track()` 呼び出しが独立して成功/失敗する。あるグループの失敗が他グループに波及することはない。

### 2.11 エラーハンドリング

| 項目       | 方針                                                             |
| ---------- | ---------------------------------------------------------------- |
| エラー分類 | Infrastructure Error（4000番台）、固定値 `4001`                  |
| ログ内容   | ハンドラ名とサニタイズ済みメッセージのみ（NFR-02 準拠）          |
| 継続条件   | 失敗したハンドラ以外は登録を継続する                             |
| 戻り値     | 成功数・失敗数・失敗詳細を `IpcHandlerRegistrationResult` で返す |

### 2.12 エッジケース

| ケース                               | 対応                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| 全ハンドラが正常に登録された場合     | `failureCount: 0`, `failures: []` が返る。サマリーログは出力されない                    |
| 全ハンドラが失敗した場合             | `successCount: 0` が返る。全失敗がログに記録される                                      |
| `setupThemeWatcher` が失敗した場合   | `themeWatcherUnsubscribe` は `null` のまま。`unregisterAllIpcHandlers` で安全にスキップ |
| Supabase 未設定の場合                | フォールバックハンドラが `track` 経由で登録される                                       |
| 既存呼び出し元が戻り値を使わない場合 | 後方互換。`void` 無視と同じ動作                                                         |

### 2.13 設定と定数

| 項目               | 値 / 出典                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------ |
| エラーコード       | `4001`（Infrastructure Error: 4000-4999 範囲）                                             |
| ログプレフィックス | `[IPC]`                                                                                    |
| 登録入口           | `registerAllIpcHandlers` を単一入口として維持                                              |
| 参照仕様           | `error-handling.md`, `security-electron-ipc.md`, `architecture-implementation-patterns.md` |

### 2.14 関連する既知の落とし穴

- **P5（リスナー二重登録）**: `unregisterAllIpcHandlers` と組み合わせることで、activate イベントでの再登録時も安全に動作する。本タスクの Graceful Degradation は P5 の基盤（UT-FIX-IPC-HANDLER-DOUBLE-REG-001）の上に構築されている
- **P9（モジュールスコープ変数のテスト間リーク）**: `themeWatcherUnsubscribe` がモジュールスコープで管理されるため、テストでは `beforeEach` でリセットが必要
