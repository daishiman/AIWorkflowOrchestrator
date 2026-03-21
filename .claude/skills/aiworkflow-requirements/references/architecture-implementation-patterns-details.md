# 実装パターン総合ガイド / detail specification

> 親仕様書: [architecture-implementation-patterns.md](architecture-implementation-patterns.md)
> 役割: detail specification

## デスクトップ（Electron）実装パターン

### IPC通信パターン

| パターン                   | 方向                    | 用途                 |
| -------------------------- | ----------------------- | -------------------- |
| 単方向（Push）             | Main → Renderer         | 通知、プログレス更新 |
| 双方向（Request/Response） | Renderer ↔ Main         | データ取得、操作実行 |
| ストリーミング             | Main → Renderer（連続） | AI応答、ログ出力     |

#### IPC通信設計原則

| 原則               | 説明                                |
| ------------------ | ----------------------------------- |
| Whitelist方式      | 許可されたチャンネルのみ通信可能    |
| 型安全性           | チャンネル名と引数/戻り値の型を定義 |
| エラーハンドリング | Main側でtry-catch、Result型で返却   |
| セキュリティ       | sender検証、パス検証を実施          |

#### IPCチャンネル統合パターン（TASK-FIX-4-1-IPC-CONSOLIDATION 2026-02-05実装）

既存のIPCチャンネル定義が複数箇所に重複している場合に、Single Source of Truthへ統合するパターン。

**問題**: `preload/channels.ts` と `shared/ipc/channels.ts` に同じチャンネル定義が存在し、変更時に不整合が発生する。

| 課題                     | 問題                                                 | 解決策                                        |
| ------------------------ | ---------------------------------------------------- | --------------------------------------------- |
| ハードコード文字列の発見 | `"skill:complete" as string` で型チェックをバイパス  | Grepで `as string` パターンを検索し定数に置換 |
| 重複定義の整理           | preload/channels.ts と shared/ipc/channels.ts の重複 | Single Source of Truth（preload側）に集約     |
| ホワイトリスト更新漏れ   | 旧チャンネル名が ALLOWED_INVOKE_CHANNELS に残存      | テストで旧チャンネルが含まれないことを検証    |

**Single Source of Truth パターン**:

| ステップ | 処理内容                                  | 成果物                                             |
| -------- | ----------------------------------------- | -------------------------------------------------- |
| 1        | Grep で重複チャンネル定義を検出           | 重複箇所リスト                                     |
| 2        | 正規のソース（preload/channels.ts）を特定 | IPC_CHANNELS オブジェクト定義                      |
| 3        | ハードコード文字列を定数参照に置換        | 型安全な import 使用                               |
| 4        | ホワイトリスト更新                        | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS 更新 |
| 5        | テスト追加                                | チャンネル存在検証、旧名称排除検証                 |

**チャンネルマイグレーション例**:

| 旧チャンネル         | 新チャンネル      | 理由                      |
| -------------------- | ----------------- | ------------------------- |
| skill:list-available | skill:list        | 冗長なサフィックス削除    |
| skill:list-imported  | skill:getImported | 命名規則統一（動詞:対象） |

**効果**:

| 観点         | 効果                                        |
| ------------ | ------------------------------------------- |
| 保守性       | 変更箇所が1箇所に集約され、不整合リスク排除 |
| 型安全性     | TypeScript の型チェックでチャンネル名を検証 |
| セキュリティ | ホワイトリスト更新漏れをテストで防止        |

**関連仕様書**: [security-skill-ipc.md](./security-skill-ipc.md)

#### IPCチャンネル名定数化パターン（TASK-FIX-12-1-IPC-HARDCODE-FIX 2026-02-09実装）

IPC チャンネル名のハードコード文字列を定数参照に置換し、04-electron-security.md IPC セキュリティ原則に準拠するパターン。

**問題**: Main Process 内で IPC チャンネル名がハードコードされており、タイポや不整合のリスクがある。

| 問題                 | 例                                                                      | リスク                             |
| -------------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| ハードコード文字列   | `this.mainWindow.webContents.send("skill:stream", message)`             | タイポがコンパイル時に検出されない |
| 定数との不整合       | Preload側は定数、Main側はハードコード                                   | 変更時に片方だけ更新される         |
| セキュリティ原則違反 | 04-electron-security.md「ハードコード文字列でチャンネル名を指定しない」 | レビューで見落とされやすい         |

**解決策: 定数参照への置換**

| 修正前（NG）                                | 修正後（OK）                                             |
| ------------------------------------------- | -------------------------------------------------------- |
| `webContents.send("skill:stream", message)` | `webContents.send(SKILL_CHANNELS.SKILL_STREAM, message)` |

**実装ステップ**:

| ステップ | 処理内容                                                           | 成果物         |
| -------- | ------------------------------------------------------------------ | -------------- |
| 1        | `grep -rn '"skill:' src/` でハードコード箇所を検出                 | 対象箇所リスト |
| 2        | 対応する定数が `@repo/shared/src/ipc/channels.ts` に存在するか確認 | 定数マッピング |
| 3        | ハードコード文字列を定数参照に置換                                 | コード修正     |
| 4        | テスト実行で動作確認                                               | 品質検証       |

**メリット**:

| 観点           | 効果                             |
| -------------- | -------------------------------- |
| 型安全性       | タイポがコンパイル時に検出される |
| 保守性         | チャンネル名変更が1箇所で済む    |
| セキュリティ   | IPC セキュリティ原則準拠         |
| コードレビュー | 定数参照は意図が明確             |

**関連タスク**: TASK-FIX-12-1-IPC-HARDCODE-FIX（2026-02-09完了）

### サービス層パターン

#### Facadeパターン

| 要素    | 説明                                             |
| ------- | ------------------------------------------------ |
| 目的    | 複雑なサブシステムへの単純なインターフェース提供 |
| 構成    | 複数の下位サービス（DB、Config、Logger等）を統合 |
| 初期化  | initialize()メソッドで依存関係を初期化           |
| 公開API | 上位から必要な操作のみを公開                     |

#### Setter Injection パターン（TASK-FIX-7-1 2026-02-11実装）

遅延初期化が必要な依存オブジェクトを、コンストラクタではなく Setter メソッドで注入するパターン。

| 要素     | 説明                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 目的     | 初期化タイミングが異なる依存オブジェクトの注入                                                 |
| 構成     | `setXxx(dependency)` メソッドでオブジェクトを受け取り、内部フィールドに保持                    |
| 適用場面 | 依存オブジェクトが外部リソース（BrowserWindow等）を必要とし、Facade よりも後で初期化される場合 |
| 検証     | `executeXxx()` 呼び出し時に依存オブジェクトの存在を検証（未設定時はエラー）                    |

**適用例: SkillService と SkillExecutor**

| ステップ | 処理                                      | 説明                                         |
| -------- | ----------------------------------------- | -------------------------------------------- |
| 1        | `new SkillService()`                      | Facade サービス生成（skillExecutor は null） |
| 2        | `new SkillExecutor(mainWindow, ...)`      | 実行エンジン生成（mainWindow 依存）          |
| 3        | `skillService.setSkillExecutor(executor)` | Setter で注入                                |
| 4        | `skillService.executeSkill(...)`          | 内部で `skillExecutor.execute()` に委譲      |

**使い分け基準**:

| パターン              | 適用場面                                   | 例                            |
| --------------------- | ------------------------------------------ | ----------------------------- |
| Constructor Injection | 依存オブジェクトが生成時点で利用可能       | DB接続、設定オブジェクト      |
| Setter Injection      | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern       | 依存オブジェクトを動的に生成する必要がある | プラグインシステム            |

#### IPC ハンドラー登録パターン（TASK-9B-H 2026-02-12実装）

> **このセクションの役割**: 実装パターン（どう実装するか）を記録する。プロセス面の教訓（何が問題だったか、どう防止するか）については [lessons-learned.md - TASK-9B-H](./lessons-learned.md#task-9b-h-skillcreatorservice-ipcハンドラー登録) を参照。

BrowserWindow と service/facade を受け取り、IPC ハンドラーを登録するパターン。`skillCreatorHandlers.ts` は public entrypoint を維持しつつ、runtime public channels は `creatorHandlers.ts` を内部 helper として統合する。

| 要素 | 説明 |
| --- | --- |
| 目的 | Main Process で public IPC surface を登録し、Renderer からの要求を処理する |
| 構成 | `registerXxxHandlers(mainWindow, service, optionalFacade?)` で登録、`unregisterXxxHandlers()` で解除 |
| 適用場面 | 既存 namespace を維持したまま新規 public channel を追加する時 |
| 適用例 | `registerSkillCreatorHandlers(mainWindow, skillCreatorService, runtimeSkillCreatorService)` |

**構成要素**:

| 要素 | 数量 | 説明 |
| --- | --- | --- |
| `ipcMain.handle()` 標準群 | 12チャンネル | 既存 Skill Creator invoke |
| `ipcMain.handle()` runtime 群 | 3チャンネル | `plan` / `execute-plan` / `improve-skill` |
| `sendXxxProgress()` | 1チャンネル | Main → Renderer の progress |
| `unregisterXxxHandlers()` | 1関数 | 標準群 + runtime 群を対称解除 |

**セキュリティ層（4層防御）**:

> セキュリティ仕様の正本: [security-electron-ipc.md - skillCreatorAPI](./security-electron-ipc.md)

| 層  | 実装                       | 説明                                                                     |
| --- | -------------------------- | ------------------------------------------------------------------------ |
| L1  | channels.ts ホワイトリスト | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に登録                     |
| L2  | validateIpcSender          | 送信元BrowserWindowの正当性検証、DevToolsからの呼び出し検出・拒否        |
| L3  | 引数バリデーション         | typeof手動チェックによる型検証（文字列型・オブジェクト型）をMain側で実施 |
| L4  | エラーサニタイズ           | error.messageのみ返却。error.stack・ファイルパス等の内部情報は非露出     |

**Preload統合（4箇所更新必須）**:

| 更新箇所                   | ファイル                       | 内容                                                                   |
| -------------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| 1. API実装                 | `preload/skill-creator-api.ts` | safeInvoke/safeOn でホワイトリスト検証付き API 実装                    |
| 2. import追加              | `preload/index.ts`             | API実装モジュールの import                                             |
| 3. electronAPIオブジェクト | `preload/index.ts`             | `electronAPI.skillCreator` として追加                                  |
| 4. contextBridge統合       | `preload/index.ts`             | `contextBridge.exposeInMainWorld` で公開 + non-isolated フォールバック |

**既存の同パターン実装**:

| ハンドラー | ファイル | チャンネル数 |
| --- | --- | --- |
| registerAuthHandlers | `authHandlers.ts` | 認証関連チャンネル |
| registerSkillHandlers | `skillHandlers.ts` | スキル管理・実行チャンネル |
| registerSkillCreatorHandlers | `skillCreatorHandlers.ts` | 標準 12 invoke + 1 on、必要時 runtime 3 invoke を内包 |

**実装時の注意点**:

| 注意点 | 対策 |
| --- | --- |
| IpcResult型の重複定義（Main側とPreload側で独立に型定義） | `@repo/shared/types` に共通 contract を配置する |
| optional facade 不在で channel 未登録にすると renderer 側が generic error になる | runtime helper 側で degraded response を返す |
| `SkillExecutor` と `authKeyService` の DI 経路が分散しやすい | `ipc/index.ts` で facade を組み立てて `registerSkillCreatorHandlers()` へ渡す |

**プロセス面の教訓（苦戦箇所の詳細）**: [lessons-learned.md - TASK-9B-H 教訓1-8](./lessons-learned.md#task-9b-h-skillcreatorservice-ipcハンドラー登録) を参照。Preload統合漏れ、並列Phase実行、設計-実装乖離、仕様書更新漏れの教訓を記録。

**関連タスク**: TASK-9B-H-SKILL-CREATOR-IPC（2026-02-12完了）

### SDK連携パターン（TASK-9C 2026-02-03実装）

外部SDK（Claude Agent SDK等）との連携で発生する課題と解決パターン。

#### Graceful SDK Fallback パターン

SDK接続エラー時にアプリケーションをクラッシュさせず継続動作させるパターン。

| 要素           | 説明                                                                  |
| -------------- | --------------------------------------------------------------------- |
| ユーティリティ | `sdkUtils.ts: tryAgentSdkWithFallback<T>(fn, fallback)`               |
| 動作           | SDK呼び出しをtry-catchで囲み、エラー時はフォールバック値を返却        |
| ログ           | `console.warn()` で警告出力、アプリは継続動作                         |
| 適用例         | `tryAgentSdkWithFallback(() => queryFn(prompt), { suggestions: [] })` |

| 効果     | 説明                                               |
| -------- | -------------------------------------------------- |
| 堅牢性   | SDKが未インストール/設定不備でもアプリが起動・動作 |
| UX       | ユーザーには「分析結果なし」等の空状態を表示       |
| デバッグ | エラー詳細は開発者コンソールで確認可能             |

#### queryFn DI パターン（SDK テスト用）

SDK呼び出しを依存注入可能にし、テストでモック関数を渡せるようにするパターン。

| 要素             | 説明                                                       |
| ---------------- | ---------------------------------------------------------- |
| インターフェース | `queryFn?: (prompt: string) => Promise<Result>`            |
| デフォルト値     | 本番: Claude Agent SDK の `query()` を呼び出す関数         |
| テスト時         | `vi.fn().mockResolvedValue({ suggestions: [...] })` を注入 |

| 効果         | 説明                                      |
| ------------ | ----------------------------------------- |
| ESModule回避 | SDK本体をモック不要（ESModule制約を回避） |
| 高速テスト   | 実際のAPI呼び出しなしで高速・決定論的     |
| 本番互換     | 本番コードは変更なしで動作                |

#### スキル名バリデーションパターン

ユーザー入力のスキル名をファイルパスとして使用する際のセキュリティ対策。

| 要素             | 説明                                                           |
| ---------------- | -------------------------------------------------------------- |
| 禁止文字定数     | `FORBIDDEN_CHARS = ['<', '>', ':', '"', '\|', '?', '*']`       |
| 検証関数         | `validateSkillName(name): { valid: boolean; error?: string }`  |
| エラーメッセージ | 「スキル名に使用できない文字が含まれています: <具体的な文字>」 |

| 効果         | 説明                                        |
| ------------ | ------------------------------------------- |
| セキュリティ | パストラバーサル攻撃の防止                  |
| 互換性       | Windows/macOS/Linux全環境で安全なファイル名 |
| UX           | ユーザーフレンドリーなエラーメッセージ      |

### データ永続化パターン

| 用途         | 技術           | 設定                           |
| ------------ | -------------- | ------------------------------ |
| アプリデータ | better-sqlite3 | WALモード、NORMAL同期          |
| ユーザー設定 | electron-store | スキーマ検証、暗号化オプション |
| 機密情報     | safeStorage    | OSキーチェーン活用             |

#### SQLite最適化設定

| 設定         | 値     | 効果                           |
| ------------ | ------ | ------------------------------ |
| journal_mode | WAL    | 並行読み取り性能向上           |
| synchronous  | NORMAL | 書き込み性能と安全性のバランス |

### ウィンドウ管理パターン

| 機能               | 説明                         |
| ------------------ | ---------------------------- |
| ウィンドウ登録     | Map構造でID管理              |
| ライフサイクル管理 | closed イベントで自動削除    |
| 一括操作           | closeAll()で全ウィンドウ終了 |

### React Portal によるオーバーレイUI最前面表示パターン（AUTH-UI-001 2026-02-04実装）

CSSスタッキングコンテキストによりz-indexが親要素の範囲内に制限される問題を、React Portalで解決するパターン。

#### 問題

| 問題                           | 原因                        | 症状                               |
| ------------------------------ | --------------------------- | ---------------------------------- |
| ドロップダウンが他要素に隠れる | CSSスタッキングコンテキスト | z-[9999]でも親要素の範囲内に制限   |
| モーダルの重なり順が不正       | position指定の親要素存在    | 新しいスタッキングコンテキスト生成 |

#### 解決策：React Portal + createPortal

| 要素         | 実装                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| インポート   | `import { createPortal } from "react-dom"`                              |
| レンダリング | `createPortal(<DropdownContent className="z-[9999]" />, document.body)` |
| 位置計算     | `getBoundingClientRect()` でトリガー要素の位置を取得                    |
| SSR対応      | `typeof document !== "undefined"` でガード                              |

#### 実装ファイル

| ファイル                 | 行番号 | 内容                                                   |
| ------------------------ | ------ | ------------------------------------------------------ |
| AccountSection/index.tsx | 501    | ドロップダウンメニューをPortalでbody直下にレンダリング |

#### 適用基準

| 適用する                           | 適用しない                       |
| ---------------------------------- | -------------------------------- |
| ドロップダウンメニュー             | インライン展開コンテンツ         |
| モーダルダイアログ                 | 親要素内に収まるポップオーバー   |
| ツールチップ（オーバーフロー防止） | トースト通知（専用コンテナ使用） |

---

### Supabase認証状態変更時の即時UI更新パターン（AUTH-UI-001 2026-02-04実装）

認証状態変更（OAuth連携/解除）後にUIを即座に更新するためのパターン。

#### 問題

| 問題                           | 原因                                                      |
| ------------------------------ | --------------------------------------------------------- |
| OAuth連携後にUIが更新されない  | `onAuthStateChange`後にプロバイダー情報を再取得していない |
| 連携解除後も連携中と表示される | 状態更新がイベントハンドラ内で完結していない              |

#### 解決策：明示的なデータ再取得

| 要素         | 実装                                                       |
| ------------ | ---------------------------------------------------------- |
| トリガー     | `supabase.auth.onAuthStateChange((event, session) => ...)` |
| 再取得関数   | `fetchLinkedProviders()`                                   |
| 呼び出し位置 | 認証状態変更イベントハンドラ内（コールバック直後）         |

#### 実装ファイル

| ファイル     | 行番号  | 内容                                               |
| ------------ | ------- | -------------------------------------------------- |
| authSlice.ts | 342-345 | 認証状態変更時に`fetchLinkedProviders()`を呼び出し |

#### Zustandとの統合

| ステップ | 処理                                     |
| -------- | ---------------------------------------- |
| 1        | `onAuthStateChange`イベント発火          |
| 2        | セッション情報をZustandストアに保存      |
| 3        | `fetchLinkedProviders()`を呼び出し       |
| 4        | プロバイダー情報をZustandストアに保存    |
| 5        | React コンポーネントが自動再レンダリング |

#### 認証イベント種別

| イベント        | 再取得要否 | 理由                          |
| --------------- | ---------- | ----------------------------- |
| SIGNED_IN       | 必要       | OAuth連携が追加された可能性   |
| TOKEN_REFRESHED | 不要       | プロバイダー情報は変更なし    |
| SIGNED_OUT      | 必要       | 全連携情報をクリア            |
| USER_UPDATED    | 必要       | プロバイダー連携/解除の可能性 |

### IPC レスポンスラッパー展開パターン（safeInvokeUnwrap）

> **導入タスク**: UT-FIX-IPC-RESPONSE-UNWRAP-001（2026-02-14）
> **関連 Pitfall**: P19（型アサーションによる実行時検証バイパス）

#### 問題

Main Process の IPC ハンドラが `{ success: true, data: T }` 形式のラッパーでレスポンスを返す場合、Preload 層の `safeInvoke<T>()` は TypeScript ジェネリクスの type erasure により、ラッパーオブジェクトをそのまま Renderer に透過する。結果として `importedSkills.forEach is not a function` のようなランタイムエラーが発生する。

#### 解決パターン

```typescript
// IPC ハンドラのレスポンスラッパー型（ファイルスコープ）
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ラッパー展開関数
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

#### 使い分け基準

| ハンドラの return 文                           | 使用する関数       | 例                              |
| ---------------------------------------------- | ------------------ | ------------------------------- |
| `return { success: true, data: result }`       | `safeInvokeUnwrap` | list(), getImported(), rescan() |
| `return service.method()` (直接返却)           | `safeInvoke`       | import(), execute()             |
| `return { success: boolean }` (ステータスのみ) | `safeInvoke`       | sendPermissionResponse()        |
| `void` (戻り値なし)                            | `safeInvoke`       | abort(), remove()               |

#### データフロー

```
Renderer          Preload (safeInvokeUnwrap)        Main Process
  │                       │                              │
  │── skill.list() ──────>│                              │
  │                       │── ipcRenderer.invoke() ─────>│
  │                       │                              │── skillService.getSkills()
  │                       │<── { success, data: [...] } ─│
  │                       │                              │
  │                       │── if (!result.success) throw ─│
  │                       │── return result.data ─────────│
  │<── SkillMetadata[] ──│                              │
```

#### 注意事項

- `IpcResult<T>` はファイルスコープ（エクスポートしない）
- `safeInvokeUnwrap` は内部で `safeInvoke` を呼び出すため、チャンネルホワイトリスト検証は維持される
- `result.data as T` の型アサーションは、`success` チェック後の安全なパターンとして許容
- 新しいスキルメソッド追加時は、対応するハンドラの return 文を確認してから `safeInvoke` / `safeInvokeUnwrap` を選択すること

---

### S32: ViewType union 拡張パターン（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 2026-03-17実装）

ViewType union に新メンバーを追加する際の標準手順を定義する。

#### 変更対象ファイルと手順

| 順序 | ファイル | 変更内容 |
| --- | --- | --- |
| 1 | `store/types.ts` | ViewType union にメンバー追加 |
| 2 | `App.tsx` | `renderView()` の switch に対応する case を追加 |
| 3 | テスト | `types.test.ts` + `App.renderView.viewtype.test.tsx` を追加 |
| 4 | `normalizeSkillLifecycleView` | 新メンバーは変換不要（passthrough）であることを確認 |

#### 注意事項

- `Record<ViewType, Config>` パターンを使用している箇所は新メンバーを網羅すること（TypeScript が未網羅を型エラーで検出する）
- テスト実行は必ず `apps/desktop` ディレクトリから行う（P40 準拠: dynamic import のエイリアス解決に必須）
- `onClose` パターンは2箇所までは共通化不要（YAGNI）、3箇所以上で共通 Hook 化を検討する

#### コード例

```typescript
// store/types.ts
export type ViewType =
  | "home"
  | "settings"
  | "agent"
  | "skillCenter"
  | "skillAnalysis"  // 新規追加
  | "skillCreate";   // 新規追加

// App.tsx — renderView() switch
case "skillAnalysis":
  return <SkillAnalysisView onClose={() => setCurrentView("skillCenter")} />;
case "skillCreate":
  return <SkillCreateWizard onClose={() => setCurrentView("skillCenter")} />;
```

#### 関連パターン

- P40: テスト実行ディレクトリ依存（モノレポ）
- P37: ドキュメント数値の早期固定
- S26: 直接IPC→Store個別セレクタ移行パターン（セレクタ設計時の参考）

---
