# 実装パターン総合ガイド / reference bundle

> 親仕様書: [architecture-implementation-patterns.md](architecture-implementation-patterns.md)
> 役割: reference bundle

## テスト実装パターン

### テストレベル別アプローチ

| レベル         | 対象                | ツール       | モック範囲       |
| -------------- | ------------------- | ------------ | ---------------- |
| ユニット       | 関数、クラス        | Vitest       | 外部依存全て     |
| 統合           | モジュール間連携    | Vitest       | 外部サービスのみ |
| コンポーネント | Reactコンポーネント | RTL + Vitest | API、ストア      |
| E2E            | ユーザーフロー      | Playwright   | なし（実環境）   |

### テスト環境設定パターン（TASK-3-2-F 2026-01-30実装）

| 環境      | 特徴                             | 適用ケース                     |
| --------- | -------------------------------- | ------------------------------ |
| jsdom     | 完全なDOM機能、Clipboard API対応 | UI統合テスト、ブラウザAPI依存  |
| happy-dom | 軽量・高速、基本DOM機能          | 単純なコンポーネントテスト     |
| node      | DOM不要                          | ユーティリティ関数、サービス層 |

**テストファイル単位の環境指定**:

| 方法             | 説明                                                 |
| ---------------- | ---------------------------------------------------- |
| ディレクティブ   | ファイル先頭に `// @vitest-environment jsdom` を記述 |
| vitest.config.ts | environmentMatchGlobsで glob パターン指定            |

**グローバルモック設計（setup.ts）**:

| モック対象               | 設定タイミング | 用途                                            |
| ------------------------ | -------------- | ----------------------------------------------- |
| Clipboard API            | beforeAll      | コピー/ペースト機能テスト                       |
| window.electronAPI.skill | beforeAll      | useSkillExecution等のHook（TASK-FIX-5-1で統一） |
| IntersectionObserver     | トップレベル   | 無限スクロール等                                |

**モック上書きパターン**:

グローバルモック後にテスト固有モックを使用する場合、beforeEach内でvi.stubGlobalを再呼び出しする。

| 手順 | 処理                                                  |
| ---- | ----------------------------------------------------- |
| 1    | テストファイルでモックオブジェクト定義                |
| 2    | モジュールレベルでvi.stubGlobal実行                   |
| 3    | beforeEach内で再度vi.stubGlobal（setup.ts上書き対策） |
| 4    | vi.clearAllMocks()でカウンターリセット                |

### fireEvent vs userEvent 使い分けパターン（UT-FIX-AGENTVIEW-INFINITE-LOOP-001 2026-02-12実装）

| ライブラリ  | 特徴                                 | 適用ケース                     | テスト環境        |
| ----------- | ------------------------------------ | ------------------------------ | ----------------- |
| `fireEvent` | 同期的、低レベルDOMイベント発火      | happy-dom環境の標準テスト      | happy-dom（推奨） |
| `userEvent` | 非同期、ユーザー操作シミュレーション | アクセシビリティ検証、複合入力 | jsdom（必須）     |

**環境別推奨パターン**:

| テスト環境 | イベント発火           | 非同期ハンドラ                                   |
| ---------- | ---------------------- | ------------------------------------------------ |
| happy-dom  | `fireEvent.click(el)`  | `await act(async () => { fireEvent.click(el) })` |
| jsdom      | `await user.click(el)` | `await user.click(el)`（自動でact wrap）         |

**注意点**:

| 状況                           | 問題                                 | 解決策                                |
| ------------------------------ | ------------------------------------ | ------------------------------------- |
| happy-domで`userEvent.setup()` | `Symbol(Node prepared...)` エラー    | `fireEvent`に切り替え                 |
| `fireEvent`でPromiseハンドラ   | microtask未flush                     | `await act(async () => {...})` で包む |
| jsdomディレクティブ追加        | `toBeInTheDocument`動作不良、DOM重複 | happy-dom + fireEventに戻す           |

### モック戦略

| モック種別 | 用途               | 使用場面                   |
| ---------- | ------------------ | -------------------------- |
| Stub       | 固定値を返す       | 外部サービスのレスポンス   |
| Mock       | 呼び出し検証       | 関数が正しく呼ばれたか確認 |
| Spy        | 実装保持しつつ監視 | 既存実装の振る舞い観察     |
| Fake       | 軽量な代替実装     | InMemoryRepository         |

### テストデータ管理

| 手法        | 用途                           |
| ----------- | ------------------------------ |
| Factory関数 | ユニークなテストデータ生成     |
| Fixture     | 固定のテストデータセット       |
| Builder     | 複雑なオブジェクトの段階的構築 |

### ESModuleモッキング制約パターン（TASK-9A-A 2026-02-03実装）

Node.js ESModule（`node:fs/promises`等）のエクスポートは読み取り専用プロパティのため、`vi.spyOn()`で再定義できない。この制約に対する回避策パターン。

#### 問題

| 状況                              | エラー                                          |
| --------------------------------- | ----------------------------------------------- |
| `vi.spyOn(fs, "readFile")` を使用 | `TypeError: Cannot redefine property: readFile` |
| ESModuleエクスポートのモック試行  | Vitestが再定義を許可しない                      |

#### 解決策：実エラー条件の使用

| 方法                   | 説明                                         |
| ---------------------- | -------------------------------------------- |
| 実際のエラー条件を使用 | モックせず、実際にエラーが発生する条件を作る |
| 存在しないパスの使用   | `ENOENT`エラーを発生させる                   |
| 権限のないパスの使用   | `EACCES`エラーを発生させる                   |
| 無効な引数の使用       | `EINVAL`エラーを発生させる                   |

#### 回避策パターン比較

| パターン     | 適用場面               | 安定性     |
| ------------ | ---------------------- | ---------- |
| 実エラー条件 | ファイルシステム操作   | 高（推奨） |
| vi.mock()    | モジュール全体モック   | 中         |
| 依存注入     | テスタビリティ設計済み | 高         |
| Wrapper関数  | レガシーコード対応     | 低         |

**推奨**: `node:fs/promises`のテストでは、モックを避けて実際のエラー条件（存在しないファイル、権限不足等）を使用する。これによりVitestの制約を回避しつつ、実際の動作に近いテストが可能。

### Vitest モックリセット戦略パターン（TASK-FIX-11-1 2026-02-13実装）

SDK統合テスト有効化時に発見された、`vi.clearAllMocks()` では不十分なモックリセットの問題と解決策。

#### 問題

| 状況                                          | 結果                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| `beforeEach` で `vi.clearAllMocks()` のみ使用 | `mockImplementation()` で設定した実装が残存し、後続テストが失敗 |
| `mockRejectedValue()` でエラーモック設定      | 永続的なモックのため、次のテストケースにもエラーが漏洩          |

#### Vitest モックリセット API の挙動差異

| API                    | `.mock.calls` クリア | `mockImplementation` リセット | `mockReturnValue` リセット |
| ---------------------- | :------------------: | :---------------------------: | :------------------------: |
| `vi.clearAllMocks()`   |          ✅          |              ❌               |             ❌             |
| `vi.resetAllMocks()`   |          ✅          |              ✅               |             ✅             |
| `vi.restoreAllMocks()` |          ✅          |        ✅（元に戻す）         |       ✅（元に戻す）       |

#### 解決策：2段階リセット + Once サフィックス

| 手順 | 処理                                              | 目的                                  |
| ---- | ------------------------------------------------- | ------------------------------------- |
| 1    | `vi.clearAllMocks()`                              | 呼び出し履歴クリア                    |
| 2    | `mock.mockResolvedValue(defaultResponse)`         | デフォルト正常応答を再設定            |
| 3    | エラーテストでは `mockRejectedValueOnce()` を使用 | 1回限りのエラーで次テストに影響しない |

#### コード例

```typescript
// beforeEach で2段階リセットを実施
beforeEach(() => {
  vi.clearAllMocks();
  // mockImplementation をデフォルト応答で上書き
  mockAgentAPI.query.mockResolvedValue({
    response: "mock response",
    tokenUsage: { input: 100, output: 50 },
  });
});

// エラーテストでは "Once" を使用
it("SDK障害をハンドリング", async () => {
  mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));
  // テスト実行...
});
```

#### 適用条件

| 条件     | 説明                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 対象     | `vi.mock()` でモジュール全体をモック化しているテスト                          |
| トリガー | テスト実行順序により結果が変わる場合                                          |
| 関連     | P9（モジュールスコープ変数のテスト間リーク）、P13（タイマーテスト無限ループ） |

### モジュールレベルモックのタイムアウトテストパターン（TASK-FIX-11-1 2026-02-13実装）

`vi.mock()` でモジュール全体をモック化した場合、内部のタイマーロジック（`setTimeout` + `AbortController`）が消失する問題のパターン。

#### 問題

| 状況                                                          | 結果                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `vi.mock("../agent-client")` でモジュール全体をモック         | 内部の `setTimeout` + `AbortController` ロジックが消失           |
| `vi.advanceTimersByTimeAsync(30000)` でタイムアウト再現を試行 | モジュール内のタイマーが存在しないため、タイムアウトが発生しない |

#### 解決策：外部インターフェースでのタイムアウトシミュレーション

モジュール内部のタイマーロジックを再現するのではなく、モック関数の応答としてタイムアウトエラーを注入する。

| アプローチ         | 手法                                                                                         | 利点                             |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------------------- |
| 直接エラー注入     | `mockRejectedValueOnce(new Error("Request timeout"))`                                        | シンプル、タイマー不要           |
| タイマー付きモック | `mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(...), 30000)))` | タイマーテストとの組み合わせ可能 |

#### コード例

```typescript
// アプローチ1: 直接エラー注入（推奨）
it("タイムアウトエラーをハンドリング", async () => {
  mockAgentAPI.query.mockRejectedValueOnce(new Error("Request timeout"));
  const result = await skillExecutor.execute(request, metadata);
  expect(result.error).toContain("timeout");
});

// アプローチ2: タイマー付きモック（fake timer必要時）
it("30秒タイムアウト", async () => {
  vi.useFakeTimers();
  mockAgentAPI.query.mockImplementation(
    () =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000);
      }),
  );
  const promise = skillExecutor.execute(request, metadata);
  await vi.advanceTimersByTimeAsync(30000);
  await expect(promise).resolves.toMatchObject({
    error: expect.stringContaining("timeout"),
  });
  vi.useRealTimers();
});
```

#### 適用条件

| 条件     | 説明                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 対象     | `vi.mock()` でモジュール全体をモック化し、かつタイムアウトテストが必要 |
| トリガー | fake timer を使ってもタイムアウトが発生しない場合                      |
| 関連     | P13（タイマーテスト無限ループ）、ESModuleモッキング制約パターン        |

### バックアップファイルテストパターン（TASK-9A-A 2026-02-03実装）

ファイル操作サービスのバックアップ機能をテストするためのパターン。

#### テスト観点

| 観点                 | テスト方法                                          |
| -------------------- | --------------------------------------------------- |
| バックアップ作成     | 書き込み後に`.backup.{timestamp}`ファイルの存在確認 |
| バックアップ一覧取得 | `listBackups()`の戻り値でtimestamp降順を検証        |
| バックアップ復元     | `restoreBackup()`後の内容一致を検証                 |
| 削除時バックアップ   | 削除後に`.deleted.{timestamp}`ファイルの存在確認    |

#### 一時ディレクトリ活用

| 要素           | 実装                                                        |
| -------------- | ----------------------------------------------------------- |
| セットアップ   | `beforeEach`で`os.tmpdir()`配下にユニーク名ディレクトリ作成 |
| クリーンアップ | `afterEach`で`fs.rm(dir, { recursive: true, force: true })` |
| 隔離性         | 各テストで独立したディレクトリを使用                        |
| CI環境対応     | 環境変数`TMPDIR`等に依存しない相対パス使用                  |

### IPC通信テストパターン（TASK-8C-A 2026-02-02実装）

Electron IPC ハンドラーの統合テストにおいて、Main Process のハンドラーを Renderer Process を起動せずにテストするためのパターン群。

#### Handler Map方式

`ipcMain.handle` をモック化し、登録されたハンドラー関数を `Map<string, Function>` に格納する方式。テスト側から `handlers.get(channel)` でハンドラーを直接呼び出すことにより、IPC通信層を経由せず統合テストを実行できる。

| 要素           | 実装                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| モック対象     | `ipcMain.handle`                                                               |
| 格納構造       | `Map<string, (...args: unknown[]) => Promise<unknown>>`                        |
| ハンドラー取得 | `handlers.get("skill:list-available")`                                         |
| 呼び出し方法   | `handler(mockIpcEvent, ...args)`                                               |
| セットアップ   | `beforeEach` 内で `registerSkillHandlers()` を呼び出し、Map にハンドラーを蓄積 |

**使い分け基準**:

| 基準         | Handler Map方式        | 実プロセス起動方式       |
| ------------ | ---------------------- | ------------------------ |
| テスト速度   | 高速（プロセス不要）   | 低速（Electron起動必要） |
| テスト粒度   | ハンドラーロジック単体 | E2Eプロセス間通信        |
| セットアップ | `vi.mock("electron")`  | Spectron/Playwright      |
| 適用場面     | 統合テスト（推奨）     | E2Eテスト                |

#### SkillService Partial Mock

テスト対象ハンドラーの依存サービス（SkillService）を部分モックする方式。全メソッドを `vi.fn()` で置き換えつつ、テストケースごとに `mockResolvedValueOnce` で個別の戻り値を設定する。

| 要素       | 実装                                                               |
| ---------- | ------------------------------------------------------------------ |
| モック構造 | 全メソッドを `vi.fn()` で定義したオブジェクトリテラル              |
| 型キャスト | `mockSkillService as never` で型チェックを回避                     |
| 個別設定   | `mockSkillService.scanAvailableSkills.mockResolvedValueOnce(data)` |
| リセット   | `vi.clearAllMocks()` を `beforeEach` で実行                        |

**メソッド数の目安**: テスト対象の全IPCチャネルが呼び出すServiceメソッドを網羅する（TASK-8C-Aでは15メソッド）。

#### invokeOptionalHandler パターン

未実装チャネル（将来実装予定）のテストを「ハンドラー未登録」の検証として記述する方式。ハンドラーが登録されていれば実行し、未登録であれば `undefined` を検証する。

| 要素               | 実装                                                   |
| ------------------ | ------------------------------------------------------ |
| ヘルパー関数       | `invokeOptionalHandler(handlerMap, channel, ...args)`  |
| 戻り値（登録済み） | `{ exists: true, result: unknown }`                    |
| 戻り値（未登録）   | `{ exists: false }`                                    |
| テスト記述         | `it("should handle channel (if handler exists)", ...)` |

**移行容易性**: ハンドラーが実装された時点で、テストは自動的に実ハンドラーパスを通過するため、テストコードの変更は不要。

#### validateIpcSender失敗検証パターン

セキュリティ検証（`validateIpcSender`）の失敗パスをテストする方式。`mockReturnValueOnce` で一時的にバリデーション失敗を返し、ハンドラーがエラー応答を返すことを検証する。

| 要素         | 実装                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| モック設定   | `validateIpcSender.mockReturnValueOnce({ valid: false, errorCode: "..." })` |
| 検証対象     | ハンドラーが `success: false` を返すこと                                    |
| エラー変換   | `toIPCValidationError(result)` で統一エラー形式に変換                       |
| 適用チャネル | セキュリティ上重要なチャネル（abort, get-status等）                         |

### IPC ハンドラー3層テスト分離パターン（TASK-9A-B 2026-02-19実装）

**目的**: IPCハンドラーのテストをUnit/Security/Integrationの3層に分離し、各テストの責務を明確化

**テスト構成**:

| テスト層    | ファイル                                | テスト数 | 責務                                                                            |
| ----------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| Unit        | `skillFileHandlers.test.ts`             | 38       | 引数バリデーション、正常系レスポンス、ハンドラー登録/解除、境界値、エッジケース |
| Security    | `skillFileHandlers.security.test.ts`    | 14       | Sender検証、パストラバーサル、エラーサニタイズ、XSSコンテンツ                   |
| Integration | `skillFileHandlers.integration.test.ts` | 13       | 実SkillFileManagerとの統合、ファイル操作サイクル、バックアップ/復元             |

**テストレイヤー間の責務分離**:

```
Unit（モック）     → ハンドラー単体の入出力検証
Security（モック）  → セキュリティ境界の検証（validateIpcSender、パストラバーサル、情報漏洩）
Integration（実装） → 実ファイルシステムでの一連操作フロー
```

**カバレッジ結果**: Line 91.14% / Branch 93.93% / Function 100%（65テスト全PASS）

**関連**:

- Handler Map 方式: 3テストファイル共通で `Map<string, Function>` によるハンドラーキャプチャを使用
- 実装: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers*.test.ts`
- **未タスク**: UT-9A-B-003（IPCテストhandlerMapモックユーティリティ共通化）— Handler Map 方式のセットアップコードを共通ユーティリティに抽出

