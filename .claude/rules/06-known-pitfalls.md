# 既知の落とし穴と防止策

> 本ファイルは**過去のインシデントから学んだ教訓**のみを記録する。
> 汎用的な DO/DON'T ルールは各ドメインファイル（01〜05, 07）に記載。

## Phase 12 インシデント

### P1: LOGS.md 2ファイル更新漏れ

- **教訓**: LOGS.md は2箇所あり、片方の更新忘れが起きやすい
- **チェックリスト**: [05-task-execution.md#Step 1-A](./05-task-execution.md)

### P2: topic-map.md 再生成忘れ

- **教訓**: 仕様書更新後に topic-map の再生成を忘れると、インデックスが古いまま残る
- **チェックリスト**: [05-task-execution.md#Step 1-D](./05-task-execution.md)

### P3: 未タスク管理の3ステップ不完全

- **教訓**: 指示書作成だけでは不十分。①指示書 → ②残課題テーブル → ③関連仕様書リンク の全ステップが必要
- **チェックリスト**: [05-task-execution.md#Task 4](./05-task-execution.md)

### P4: documentation-changelog への早期「完了」記載

- **教訓**: 全 Step 完了前に「完了」と書くと、後続 Step の漏れに気付けない
- **チェックリスト**: [05-task-execution.md#Task 3](./05-task-execution.md)

### P25: Phase 12 LOGS.md 2ファイル更新漏れ（TASK-FIX-6-1）

- **教訓**: LOGS.md は aiworkflow-requirements と task-specification-creator の2箇所にあり、片方の更新忘れが起きやすい。P1と同様のミスが再発した
- **解決策**: Phase 12チェックリストで「2ファイル更新」を明示的にチェック
- **チェックリスト**: [05-task-execution.md#Step 1-A](./05-task-execution.md)
- **関連タスク**: TASK-FIX-6-1-STATE-CENTRALIZATION

### P26: システム仕様書更新遅延（TASK-FIX-6-1）

- **教訓**: 「PRマージ後に更新」と判断し、実装直後にシステム仕様書（arch-state-management.md 等）を更新しなかった。結果として仕様書と実装の乖離が発生
- **解決策**: Phase 12完了時点でシステム仕様書を更新する。PRマージを待たない
- **チェックリスト**: [05-task-execution.md#Step 2](./05-task-execution.md)
- **関連タスク**: TASK-FIX-6-1-STATE-CENTRALIZATION

### P27: topic-map.md 再生成トリガーの判断ミス（TASK-FIX-6-1）

- **教訓**: 「新規セクション追加なし」と判断したが、実際はセクション更新（削除・変更含む）があった。topic-map.md の再生成が必要だった
- **解決策**: セクションの追加だけでなく、削除・更新も再生成トリガーに含める。仕様書に変更があれば必ず再生成を実行
- **チェックリスト**: [05-task-execution.md#Step 1-D](./05-task-execution.md)
- **関連タスク**: TASK-FIX-6-1-STATE-CENTRALIZATION

### P28: スキルフィードバックレポート未作成（TASK-FIX-6-1）

- **教訓**: 「スキル改善なし」と判断したが、実際はワークフロー改善点があった。Phase 12でスキルフィードバックレポートを作成しなかった
- **解決策**: Phase 12で必ずスキル改善検討を実施し、改善点がなくても「改善点なし」としてレポートを作成する
- **チェックリスト**: [05-task-execution.md#Phase 12](./05-task-execution.md)
- **関連タスク**: TASK-FIX-6-1-STATE-CENTRALIZATION

### P43: Phase 12 サブエージェントの rate limit 中断

- **教訓**: Phase 12 Task 2（システム仕様書更新）を1つのサブエージェントに7ファイルの一括更新を委譲すると、49ツール使用・402秒実行後に rate limit に到達して中断する。LOGS.md に先に「完了」を記録したため、中断後の未完了検出が困難だった
- **解決策**:
  1. 仕様書更新は3ファイル以下/エージェントに分割する
  2. LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする
  3. 中断後は `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認
- **関連タスク**: TASK-9A-B

## Electron / ランタイム

### P5: リスナー二重登録（Renderer / Main 両プロセス）

- **教訓（Renderer側）**: React StrictMode では `useEffect` が2回実行される。リスナー登録はモジュールレベルでガードが必要
- **教訓（Main Process側）**: `ipcMain.handle()` は同一チャンネルへの二重登録で例外を送出する。`ipcMain.on()` は暗黙的にリスナーが累積される。macOS `activate` イベント等でのハンドラ再登録時に発生しやすい
- **対策（Main Process）**: `unregisterAllIpcHandlers()` で全チャンネルを一括解除後に `registerAllIpcHandlers()` で再登録する
- **ルール**: [03-state-management.md#リスナー管理](./03-state-management.md)
- **関連タスク**: UT-FIX-IPC-HANDLER-DOUBLE-REG-001

### P6: OAuth コールバックパース誤り

- **教訓**: OAuth コールバックではレスポンスモードに応じたパース先を選択する（fragment `#` vs query `?`）。PKCE 移行後は両経路が共存しうる
- **ルール**: [04-electron-security.md#認証セキュリティ](./04-electron-security.md)

### P12: 外部 SDK 自動処理との競合

- **教訓**: 外部 SDK のデフォルト自動処理（トークンリフレッシュ等）をカスタム実装で置き換える場合、元の自動処理を必ず無効化する

### P14: カスタムプロトコル URL パース

- **教訓**: `new URL("myapp://path/to")` では RFC 3986 の authority 規則により pathname が期待どおりにならない。カスタムプロトコルでは手動パースが安全

### P42: 文字列引数の .trim() バリデーション漏れ

- **教訓**: IPC ハンドラーの引数バリデーションで `typeof === "string"` と `=== ""` のみチェックすると、スペースのみの入力（`"   "`）がバリデーションを通過する。SkillFileManager 側で不正パスエラーとなるが、IPC 層で早期拒否すべき
- **解決策**: 全文字列引数に `.trim() === ""` チェックを追加して3段バリデーション（型チェック → 空文字列 → トリム空文字列）を標準化
- **関連タスク**: TASK-9A-B

```typescript
// ❌ 不十分
if (typeof args?.skillName !== "string" || args.skillName === "") { ... }

// ✅ 完全
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") { ... }
```

### P31: Zustand Store Hooks無限ループ

- **ステータス**: ✅ **解決済み**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001、2026-02-12）
- **教訓**: `useAuthModeStore()` 等の合成Store Hookが毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する
- **症状**: 設定画面がぐるぐる回り続ける、LLM/スキル選択が無限実行
- **解決策**:
  1. **短期（非推奨）**: useRefでガードし、依存配列は空にする（適用済み→個別セレクタ移行により削除）
  2. **長期（実装済）**: 個別セレクタベース（`useAuthMode()`, `useSetAuthMode()`, `useLLMFetchProviders()`等）に再設計 → **実装完了**
- **実装完了**: UT-STORE-HOOKS-REFACTOR-001 / UT-STORE-HOOKS-COMPONENT-MIGRATION-001
  - 53個の個別セレクタを追加（AuthModeSlice/LLMSlice/AgentSlice）
  - 合成Hookに`@deprecated`タグを追加
  - SettingsView, LLMSelectorPanel, SkillSelectorを個別セレクタベースにリファクタリング
  - 181テスト追加、全PASS
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001, UT-STORE-HOOKS-COMPONENT-MIGRATION-001

```typescript
// ❌ 無限ループ（旧パターン）
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);

// ⚠️ 短期対策（非推奨）
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);

// ✅ 長期解決策（推奨）- 個別セレクタ使用
const initializeAuthMode = useInitializeAuthMode();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // Zustandアクション参照は安定しているため安全
```

### P48: useShallow未適用による派生セレクタ無限ループ（P31派生）

- **教訓**: `.filter()` / `.map()` で配列を返す派生セレクタは、Zustandの `Object.is` 比較で毎回新しい参照と判定される。`useShallow` を適用しないと `useSyncExternalStore` が無限ループに陥る。P31（合成Hook）とは異なり、個別セレクタでも発生する
- **症状**: `renderHook` テストがタイムアウト、コンポーネントが無限再レンダー
- **解決策**: `zustand/react/shallow` の `useShallow` で派生セレクタをラップする
- **適用基準**: セレクタが `.filter()` / `.map()` / スプレッド構文で新しい参照を返す場合は必須
- **関連パターン**: P31（Zustand Store Hooks無限ループ）
- **関連タスク**: TASK-10A-E-C
- **参照**: [architecture-implementation-patterns.md#S18](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)

```typescript
// ❌ P48: 毎回新しい配列参照 → 無限ループ
export const useFilteredItems = () =>
  useAppStore((state) => state.items.filter((i) => i.active));

// ✅ useShallow で shallow 比較を適用
import { useShallow } from "zustand/react/shallow";
export const useFilteredItems = () =>
  useAppStore(useShallow((state) => state.items.filter((i) => i.active)));
```

### P54: safeRegister パターン不適合（戻り値キャプチャ必要なハンドラ）

- **教訓**: `safeRegister(name, fn)` は戻り値を破棄するため、`setupThemeWatcher` のように unsubscribe 関数をモジュールスコープ変数にキャプチャする必要があるハンドラには使えない。設計時に「戻り値の要否」を明確にしないと、実装時にパターン不適合が判明して手戻りが発生する
- **症状**: `safeRegister` で囲んだ後に戻り値が取得できないことに気付き、個別 try-catch に書き直す必要が発生
- **解決策**: ハンドラ登録関数の設計時に以下を判断する: (1) 戻り値不要 → `safeRegister`、(2) 戻り値必要 → 個別 try-catch。`track()` クロージャで両方の成功/失敗を統一管理する
- **関連パターン**: P5（リスナー二重登録）、S30（Graceful Degradation パターン）
- **関連タスク**: TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001

### P55: エラーメッセージ中のパスに正規表現メタ文字が含まれる

- **教訓**: `os.homedir()` が返すパス（例: `/Users/user.name`）をそのまま `new RegExp()` に渡すと、`.` がワイルドカードとして扱われ、意図しないマッチが発生する。`sanitizeRegistrationErrorMessage` でパスマスクする際に、正規表現メタ文字のエスケープを忘れるとセキュリティホールになる
- **症状**: パスマスクが正しく機能しない、または意図しない文字列までマスクされる
- **解決策**: `escapeRegExp()` でメタ文字をエスケープしてから `RegExp` 生成する
- **関連タスク**: TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001

```typescript
// ❌ メタ文字未エスケープ
const pattern = new RegExp(os.homedir(), "g");

// ✅ escapeRegExp でエスケープ後にパターン生成
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const pattern = new RegExp(escapeRegExp(os.homedir()), "g");
```

## ビルド / 環境

### P7: ネイティブモジュールのバイナリ不一致

- **教訓**: Node.js バージョン更新後は `pnpm store prune && pnpm install --force` が必要。通常の install ではキャッシュされた古いバイナリが残る
- **関連**: [07-git-and-tooling.md#Husky Hooks](./07-git-and-tooling.md)

### P8: 幽霊依存

- **教訓**: テスト環境では通るが実行時にモジュール未検出エラーになる。`import` するライブラリは必ず自身の `package.json` に宣言
- **ルール**: [01-architecture.md#モノレポ構造](./01-architecture.md)

## テスト

### P9: モジュールスコープ変数のテスト間リーク

- **教訓**: モジュールレベルの変数がテスト間で共有され、実行順序で結果が変わる。テストごとにリセット必須
- **ルール**: [02-code-quality.md#テスト設計の注意](./02-code-quality.md)

### P13: タイマーテストの無限ループ

- **教訓**: setTimeout + Promise + 再スケジュールのパターンでは `runAllTimers` 系が無限ループする。`advanceTimersByTime` で1ステップずつ進めること

### P41: v8 カバレッジプロバイダのインライン関数カウント

- **教訓**: Vitest の v8 カバレッジプロバイダは、インライン arrow function（例: `getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントする。validateIpcSender のオプションオブジェクト内のコールバックが実行されないと Function Coverage が大幅に低下する（44.44%まで低下した事例あり）
- **解決策**: セキュリティテストでコールバックの戻り値を明示的に検証する（`mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` で呼び出し確認）
- **関連タスク**: TASK-9A-B

### P47: CSS変数ベースのスタイルテストアサーション戦略

- **教訓**: デザイントークン（CSS変数）をTailwind arbitrary valuesで使用した場合、テストで `expect(el).toHaveClass("bg-[var(--status-primary)]")` のような長い文字列比較が必要になる。テストの可読性が低下し、トークン名変更時に全テストの修正が必要
- **解決策**: variantStyles を `Record<Variant, string>` 型でコンポーネント外部（モジュールスコープ）に抽出し、テスト側もその定数を import して期待値を生成する。これによりトークン名変更がRecord定義1箇所で完結する
- **関連タスク**: TASK-UI-00-ATOMS

```typescript
// ❌ テスト内でハードコード文字列
expect(element).toHaveClass("bg-[var(--status-primary)]");
expect(element).toHaveClass("text-[var(--text-inverse)]");

// ✅ Record定数をコンポーネントからexport → テストでimport
// コンポーネント側
export const variantStyles: Record<Variant, string> = {
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
};

// テスト側
import { variantStyles } from "./Badge";
expect(element.className).toContain(variantStyles.primary);
```

### P48: Non-null assertion (!) による Preload レスポンス安全性偽装

- **教訓**: `result.data!.providers` のような non-null assertion は TypeScript の型チェックを通過させるが、実行時の安全性を保証しない。contextBridge 経由のレスポンスは structured clone の制約により、型定義と実際の shape が乖離する可能性がある
- **症状**: TypeCheck は PASS するが、ランタイムで `TypeError: Cannot read properties of undefined` が発生
- **解決策**: non-null assertion を `Array.isArray()` / optional chaining による実行時型検証に置換する
- **関連パターン**: P19（型キャストによる実行時検証バイパス）
- **関連タスク**: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

```typescript
// ❌ non-null assertion（コンパイル通過、ランタイム危険）
const providers = result.data!.providers;

// ✅ 実行時型検証
const providers = Array.isArray(result.data?.providers)
  ? result.data.providers
  : [];
```

## Claude Code Hooks

### P11: PostToolUse フックによる Edit 失敗

- **教訓**: Prettier / ESLint の自動修正がファイルを変更し、後続の Edit の文字列マッチが失敗する。大量編集後は `git diff --stat` で変更数を検証

## 仕様書スクリプト

### P10: 正規表現の見出しレベル誤検出

- **教訓**: `/^##/` は H3 以降にもマッチする。見出しレベルを正確に検出するには否定文字クラス（`/^## [^#]/`）を使う

## Supabase OAuth

### P15: カスタム state パラメータ競合

- **教訓**: Supabase は内部で state を生成・検証する。カスタム state を `queryParams` に渡すと `bad_oauth_state` エラーが発生する
- **ルール**: [04-electron-security.md#認証セキュリティ](./04-electron-security.md)

### P16: Site URL 未設定によるリダイレクト失敗

- **教訓**: Supabase Dashboard の Redirect URLs だけでなく、Site URL も正しく設定する必要がある。Site URL はフォールバック先として使用される

### P17: flowType 未設定による Implicit Flow

- **教訓**: Supabase クライアント初期化時に `flowType: 'pkce'` を設定しないと、Implicit Flow（`#access_token`）が使用される。Authorization Code Flow（`?code`）を使うには明示的な設定が必要

### P18: カスタム PKCE パラメータ競合

- **教訓**: Supabase に `code_challenge` をカスタムで渡すと、内部の `code_verifier` と不整合が発生し `both auth code and code verifier should be non-empty` エラーになる。PKCE は Supabase に完全委任する

## TypeScript / 型安全

### P19: 型キャスト（as）による実行時検証バイパス

- **教訓**: `as string[]` などの型キャストは実行時検証を行わない。`electron-store` 等の JSON ストアから取得したデータは、破損や不正値によって型が保証されないため、必ず実行時バリデーションが必要
- **解決策**: 戻り値を `unknown` 型で受け取り、配列チェック（`Array.isArray()`）と要素フィルタリング（`.filter()`）を行うバリデーション関数を作成する
- **ルール**: [02-code-quality.md#TypeScript型安全](./02-code-quality.md)

### P46: HTMLAttributes Props型衝突パターン

- **教訓**: `React.HTMLAttributes<HTMLElement>` を extends する際、HTML標準属性と同名のカスタムPropsを定義するとTS2430エラーが発生する。Badge コンポーネントで `content?: string | number` が HTML標準の `content?: string` と衝突した
- **衝突しやすい属性**: `content`, `color`, `translate`, `hidden`, `title`, `dir`, `slot`
- **解決策**: `Omit<React.HTMLAttributes<HTMLElement>, "conflictingProp">` で衝突する属性を除外してからカスタム型を定義する
- **関連タスク**: TASK-UI-00-ATOMS

```typescript
// ❌ TS2430エラー: content は HTML標準属性(string)と衝突
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  content?: string | number;
}

// ✅ Omit で衝突属性を除外
interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  content?: string | number;
}
```

## テスト環境

### P20: テスト環境でのログ出力汚染

- **教訓**: `console.log` / `console.warn` をテスト中に出力すると、テスト結果の可読性が低下し、重要なエラーを見逃す原因になる
- **解決策**: `this.debug` フラグや `process.env.NODE_ENV !== 'test'` でガードし、開発環境でのみログ出力。または `electron-log` 等のロガーを使用して環境ごとに出力レベルを制御

### P21: 既存テストへの DI 追加時の大規模修正

- **教訓**: 新しいサービスを DI で追加する際、既存のテストファイルすべてにモックを追加する必要がある。SkillExecutor に AuthKeyService を追加した際、5つのテストファイル（test, auth, retry, integration, permission）すべてに mockAuthKeyService を追加する必要があった
- **解決策**:
  1. テストファイルごとに mockAuthKeyService を定義
  2. beforeEach で mockAuthKeyService.getKey.mockResolvedValue() をリセット
  3. SkillExecutor コンストラクタの第3引数として渡す
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE

### P22: Vitest Worker の予期しない終了

- **教訓**: 大規模テスト実行時（9000+ テスト）に Vitest Worker が予期せず終了することがある。メモリ消費やタイムアウトが原因の可能性
- **解決策**: テストを分割実行するか、`--poolOptions.workers.max` を調整。または `--no-file-parallelism` で並列実行を制限
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE

### P39: happy-dom環境でのuserEvent非互換

- **教訓**: `@testing-library/user-event`の`userEvent.setup()`はhappy-dom環境でSymbol操作エラー（`Symbol(Node prepared with document state workarounds)`）を起こす。49/53テストが一斉に失敗する
- **症状**: テスト追加後に大量のテストが`TypeError: Symbol(...)`で失敗
- **原因**: userEventはjsdomのDOM APIに依存するSymbol操作を内部実行するが、happy-domは未サポート
- **解決策**: happy-dom環境では`fireEvent`を使用。非同期ハンドラは`await act(async () => { fireEvent.click(el) })`で包む
- **再発防止**: テスト追加時は必ず実行確認。happy-dom環境では`userEvent`使用禁止
- **関連パターン**: [architecture-implementation-patterns.md](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) の「fireEvent vs userEvent使い分けパターン」
- **関連タスク**: UT-FIX-AGENTVIEW-INFINITE-LOOP-001

```typescript
// ❌ happy-domで失敗
const user = userEvent.setup();
await user.click(element);

// ✅ happy-domで安定
fireEvent.click(element);

// ✅ 非同期ハンドラ
await act(async () => {
  fireEvent.click(element);
});
```

### P40: テスト実行ディレクトリ依存（モノレポ）

- **教訓**: モノレポ環境で`pnpm vitest run apps/desktop/src/...`をプロジェクトルートから実行すると、`apps/desktop/vitest.config.ts`の`environment`設定と`setupFiles`が読み込まれず`document is not defined`エラーが発生する
- **症状**: ローカルでは通るテストがCI/別ディレクトリから実行すると全件失敗
- **原因**: Vitestはカレントディレクトリの`vitest.config.ts`を優先読み込みするため、`apps/desktop/`のhappy-dom設定が適用されない
- **解決策**: `cd apps/desktop && pnpm vitest run src/...` または `pnpm --filter @repo/desktop exec vitest run src/...` で実行
- **再発防止**: テスト実行は常に対象パッケージのディレクトリから行う
- **特にP40の影響を受けやすいパターン**: dynamic import（`await import("@/renderer/App")`）を使用するテストは、`vi.mock` がコンパイル時に解決されるのに対し、dynamic import はランタイムで解決されるため、`vitest.config.ts` の `resolve.alias` 設定（`@` エイリアス等）が適用されないとモジュール解決に失敗する。dynamic import を使うテストでは、対象パッケージディレクトリからの実行が必須
- **関連タスク**: UT-FIX-AGENTVIEW-INFINITE-LOOP-001, TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001

```typescript
// P40 影響例: dynamic import はエイリアス解決にconfig依存
// ❌ プロジェクトルートから実行すると @/ エイリアスが解決不可
const { App } = await import("@/renderer/App");

// ✅ apps/desktop/ ディレクトリから実行すれば vitest.config.ts の alias が適用される
// cd apps/desktop && pnpm vitest run src/renderer/App.test.tsx
```

## Preload / API 統一

### P23-P28 と実装パターンの対応表

| Pitfall ID | タイトル                      | 実装パターン参照                                                                                                                                                     | 関連Phase |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| P23        | API二重定義の型管理           | [S1: architecture-implementation-patterns.md](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#s1-api二重定義の型管理複雑性)     | Phase 5-9 |
| P24        | Store型定義不統一             | S1と同上                                                                                                                                                             | Phase 6   |
| P25        | OperationResult波及           | [S4: architecture-implementation-patterns.md](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#s4-operationresult廃止の影響波及) | Phase 5-8 |
| P26        | safeInvoke学習コスト          | [skill-creator/patterns.md](../skills/skill-creator/references/patterns.md)                                                                                          | Phase 12  |
| P27        | ハードコード文字列            | [skill-creator/patterns.md](../skills/skill-creator/references/patterns.md)                                                                                          | Phase 12  |
| P28        | 手動テスト確認漏れ            | -                                                                                                                                                                    | Phase 11  |
| P44        | import/removeインターフェース | P23, P32, P42 の複合パターン（✅解決済み）                                                                                                                           | Phase 5   |
| P45        | IPC引数命名の契約ドリフト     | P44 の派生パターン（✅解決済み）                                                                                                                                     | Phase 5   |

### P23: API 二重定義の型管理複雑性

- **教訓**: `window.skillAPI` と `window.electronAPI.skill` の両方に同じメソッドが存在する場合、型定義ファイル（types.ts, types.d.ts）の両方を同時に更新しないと型不整合が発生する
- **解決策**: 統一前に全ての型定義ファイルをリストアップし、変更順序を決定する。Preload 層の型は types.ts（実装）→ types.d.ts（宣言）の順で更新
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION

### P24: Store 型定義と Preload 型定義の不統一

- **教訓**: skillSlice.ts の `Skill` 型と preload/types.ts の `ImportedSkill` 型が異なる定義を持ち、AgentView で型アサーション（`as unknown as Skill[]`）が必要になる
- **解決策**: 共有型は `@repo/shared` に配置し、両層から参照する。既存コードでの型不一致は未タスク化して後続対応
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION, UT-FIX-5-1-001

### P25: OperationResult 廃止の波及影響調査不足

- **教訓**: OperationResult ラッパーを廃止する際、直接型を返すように変更すると、呼び出し元の `.success` / `.data` アクセスパターンが全て壊れる
- **解決策**: 廃止前に `grep -rn "OperationResult" apps/desktop/` で全使用箇所を特定し、移行計画を立てる
- **正本**: [architecture-implementation-patterns.md - S4](../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#operationresult廃止の影響波及s4)
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION

### P26: safeInvoke/safeOn パターンの学習コスト

- **教訓**: contextBridge + ホワイトリスト + safeInvoke/safeOn の組み合わせは初見では理解しづらく、実装ミスが起きやすい
- **解決策**: 実装ガイド Part 1 で「お店の入口統一」のような日常的アナロジーを用意し、概念理解を優先する
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION

### P27: Preload ハードコード文字列の見落とし

- **教訓**: safeInvoke を使用していても、チャネル名が `IPC_CHANNELS` 定数ではなく文字列リテラルで指定されている箇所がある。grep で発見しにくい
- **解決策**: 実装後に `grep -rn "safeInvoke\\|safeOn" | grep -v "IPC_CHANNELS"` で文字列リテラル使用箇所を検出
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION, UT-FIX-5-2, UT-FIX-5-3

### P29: SKILL.md 変更履歴の更新漏れ

- **教訓**: LOGS.md の更新だけでは不十分。SKILL.md の変更履歴テーブルも必ず更新する
- **チェックリスト**: [05-task-execution.md#Step 1-A](./05-task-execution.md)
- **関連タスク**: TASK-FIX-12-1-IPC-HARDCODE-FIX

### P30: 未タスク検出時の関連ファイル調査不足

- **教訓**: 修正対象ファイルだけでなく、同様のパターンを持つ関連ファイルも調査すべき
- **解決策**: `grep -rn` で同様のパターンをプロジェクト全体で検索
- **関連タスク**: TASK-FIX-12-1-IPC-HARDCODE-FIX

### P31: Phase 12のシステム仕様書更新漏れ（複数ファイル）

- **教訓**: Phase 12では複数のシステム仕様書を同時に更新する必要があるが、一部のファイル更新を忘れやすい。UT-FIX-5-4では以下の更新漏れが発生:
  - `api-ipc-agent.md` への完了タスクセクション追加漏れ
  - `security-api-electron.md` への完了タスクテーブル追加漏れ
  - `interfaces-agent-sdk.md` の型定義更新漏れ
  - `interfaces-agent-sdk-skill.md` への完了タスクセクション追加漏れ
  - `task-workflow.md` の残課題テーブル更新・完了タスクセクション追加漏れ
  - `topic-map.md` の再生成漏れ
- **解決策**: Phase 12仕様書のチェックリストを全項目確認してから完了とする。特に型定義変更タスクでは以下のファイルを必ず確認:
  1. 該当する `interfaces-*.md`（型定義の変更内容記録）
  2. `api-ipc-*.md`（IPC関連の場合）
  3. `security-*.md`（セキュリティ関連の場合）
  4. `task-workflow.md`（残課題・完了タスク記録）
  5. `topic-map.md`（常に再生成）
- **チェックリスト**: [05-task-execution.md#Phase 12](./05-task-execution.md)
- **関連タスク**: UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH

### P32: 型定義の二箇所同時更新必須（P23パターンの拡張）

- **教訓**: IPC関連の型定義変更では、以下の2ファイルを同時に更新する必要がある:
  - `packages/shared/src/agent/types.ts`（共有型定義）
  - `apps/desktop/src/preload/types.ts`（Preload層型定義）
    片方だけ更新すると、型不整合によるコンパイルエラーまたは実行時エラーが発生する
- **解決策**:
  1. 型変更前に両ファイルの該当型を確認
  2. 両ファイルを同時に編集（1つのコミットで）
  3. 編集後に `pnpm typecheck` で型整合性を検証
- **関連パターン**: P23（API二重定義の型管理複雑性）
- **関連タスク**: UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH

### P44: skill:import/remove IPCハンドラとPreloadのインターフェース不整合

- **ステータス**: ✅ **解決済み**（UT-FIX-SKILL-IMPORT-INTERFACE-001 + UT-FIX-SKILL-REMOVE-INTERFACE-001、2026-02-20）
- **教訓**: Main Processのハンドラがオブジェクト形式（`{ skillIds: string[] }` / `{ skillId: string }`）を期待しているのに、Preload側（`skill-api.ts`）が単一の文字列 `skillName` を渡しているため、`args?.skillIds` / `args?.skillId` が `undefined` となりバリデーションエラーが発生する。コンパイル時にはPreloadのモック化により検出されず、ランタイムで初めて顕在化する。skill:import と skill:remove で同一パターンの不整合が存在した
- **症状**:
  - skill:import: `Error occurred in handler for 'skill:import': { code: 'VALIDATION_ERROR', message: 'skillIds must be an array' }`
  - skill:remove: `Error occurred in handler for 'skill:remove': { code: 'VALIDATION_ERROR', message: 'skillId is required' }`
- **原因**: ハンドラは設計時にオブジェクト形式の引数で定義されたが、Preload/Renderer側は単一文字列を渡す設計になっており、インターフェース契約が乖離している。skill:import は「複数一括」想定の `{ skillIds: string[] }`、skill:remove は「ID指定」想定の `{ skillId: string }` で設計されたが、実際の呼び出し元は両方とも `string`（単一スキル名）を渡す
- **解決策**: ハンドラ側の引数を `string`（単一スキル名）に変更し、P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を追加する。内部メソッドの引数名も `skillId` → `skillName` に統一する。変更時は P23/P32 準拠で3箇所同時更新（ハンドラ・Preload API・テスト）
- **関連パターン**: P23（API二重定義の型管理複雑性）、P32（型定義の二箇所同時更新必須）、P42（.trim()バリデーション漏れ）、P45（引数命名の契約ドリフト）
- **Renderer側の同パターン**: IPC/Preload層の修正後も、Renderer側（`SkillImportDialog`）で `skill.id`（ハッシュ値）を `skillName` として渡す不整合が残存し、スキルインポートが100%失敗した。`skill.id` ではなく `skill.name` を使用する修正で解決。IPC層だけでなくRenderer側の呼び出し元も必ず検証すること（✅ UT-FIX-SKILL-IMPORT-ID-MISMATCH-001で解決済み、2026-02-22）
- **関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001, UT-FIX-SKILL-REMOVE-INTERFACE-001, UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

```typescript
// ❌ skill:import 不整合：ハンドラは{ skillIds: string[] }を期待
ipcMain.handle("skill:import", async (event, args: { skillIds: string[] }) => {
  if (!Array.isArray(args?.skillIds)) {
    throw { code: "VALIDATION_ERROR", message: "skillIds must be an array" };
  }
});

// ❌ skill:remove 不整合：ハンドラは{ skillId: string }を期待
ipcMain.handle("skill:remove", async (event, args: { skillId: string }) => {
  if (typeof args?.skillId !== "string") {
    throw { code: "VALIDATION_ERROR", message: "skillId is required" };
  }
  return skillService.removeSkill(args.skillId);
});

// Preloadは両方とも文字列を渡す
safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName); // "my-skill"
safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName); // "my-skill"

// ✅ 修正後：ハンドラをPreload側に合わせ、P42準拠3段バリデーション
ipcMain.handle("skill:import", async (event, skillName: string) => {
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
  return skillService.importSkills([skillName]);
});

ipcMain.handle("skill:remove", async (event, skillName: string) => {
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
  return skillService.removeSkill(skillName);
});
```

### P45: IPC引数命名の契約ドリフト（skillId vs skillName）

- **教訓**: IPCハンドラの引数名が `skillId` として定義されているのに、実際に渡される値はスキルの「名前」（`skillName`）であった。命名と実態の乖離により、IDベースの検索ロジックと名前ベースの検索ロジックが混在し、コードの可読性と保守性が低下する。skill:remove では `{ skillId: string }` という引数名だったが、実際の値はスキル名（例: `"my-skill"`）であり、内部メソッド（`SkillService.removeSkill` / `SkillImportManager.removeSkill`）でもパラメータ名が `skillId` のまま使用されていた
- **症状**: コードレビューで「IDを渡しているのか名前を渡しているのか」が不明確になり、将来のスキル検索ロジック変更時に誤った前提で実装するリスクがある
- **解決策**: ハンドラ、サービス、マネージャーの全レイヤーで引数名を `skillName` に統一する。命名規約として「実際の値のセマンティクスに合致する引数名」を使用する
- **再発防止**: 新規IPCハンドラ作成時は、Preload側で渡す値のセマンティクスと一致する引数名を使用する。`grep -rn "skillId" apps/desktop/src/main/` で命名不一致箇所を定期的に検出する
- **関連パターン**: P44（skill:import/remove IPCインターフェース不整合）
- **関連タスク**: UT-FIX-SKILL-REMOVE-INTERFACE-001

```typescript
// ❌ 命名ドリフト：引数名はskillIdだが実際の値はスキル名
async removeSkill(skillId: string): Promise<RemoveResult> {
  const removed = this.importedIds.has(skillId); // skillIdは実はskillName
}

// ✅ 修正後：セマンティクスに一致する命名
async removeSkill(skillName: string): Promise<RemoveResult> {
  const removed = this.importedIds.has(skillName);
}
```

### P28: 手動テストでの削除確認忘れ

- **教訓**: API 統一後、旧 API（`window.skillAPI`）が本当に削除されたかの手動確認を忘れがち。DevTools で `window.skillAPI === undefined` を確認する必要がある
- **解決策**: Phase 11 手動テストチェックリストに「旧 API が undefined であることを確認」を必ず含める
- **関連タスク**: TASK-FIX-5-1-SKILL-API-UNIFICATION

## DI パターン

### P34: 遅延初期化が必要な依存オブジェクトの DI パターン選択

- **教訓**: BrowserWindow 等の外部リソースを必要とする依存オブジェクトは、Constructor Injection では対応できない。SkillExecutor は mainWindow を必要とするため、SkillService のコンストラクタ時点では生成不可能だった
- **解決策**: Setter Injection パターンを使用し、外部リソース準備後に `setSkillExecutor()` で注入する
- **使い分け基準**:
  - Constructor Injection: 依存オブジェクトが生成時点で利用可能
  - Setter Injection: 依存オブジェクトの生成に外部リソースが必要
  - Factory Pattern: 依存オブジェクトを動的に生成する必要がある
- **参照**: [architecture-implementation-patterns.md#Setter Injection パターン](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION

### P35: DI 追加時のテストモック大規模修正（P21 派生）

- **教訓**: 新しい依存オブジェクト（SkillExecutor）を既存サービス（SkillService）に DI で追加する際、関連する全テストファイルにモックを追加する必要がある。TASK-FIX-7-1 では 5 つのテストファイルに mockSkillExecutor を追加した
- **解決策**:
  1. 影響範囲を事前に調査（`grep -rn "SkillService" **/*.test.ts`）
  2. 各テストファイルにモックオブジェクトを定義
  3. `beforeEach` でモックをリセット
  4. 標準的なモック構成をドキュメント化して再利用
- **参照**: [lessons-learned.md#テストモックの大規模修正](../skills/aiworkflow-requirements/references/lessons-learned.md)
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION, TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE（P21）

## SDK 型統合

### P36: カスタム declare module と SDK 実型の共存問題（TASK-9B-I）

- **教訓**: `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` にカスタム `declare module '@anthropic-ai/claude-agent-sdk'` を作成した状態で SDK をインストールすると、TypeScript は `node_modules` の実型を優先してカスタム型を無視する。仕様書にカスタム型の値（`auto`/`ask`/`deny`）が残り、実 SDK 型（`default`/`acceptEdits`/`bypassPermissions`/`plan`/`delegate`/`dontAsk`）との不整合が発生する
- **影響範囲**: PermissionMode の値セットが完全に異なるため、仕様書の PermissionMode 定義、テストの期待値、コードレビューの判断基準の全てに誤情報が波及する
- **検出方法**: `as any` 除去時に初めて型エラーとして顕在化した（それまではカスタム型でコンパイルが通っていたため気付けなかった）
- **解決策**: SDK インストール後はカスタム `.d.ts` を削除する。SDK 未インストール環境でのみ使用する場合はフラグで管理する
- **参照**: [architecture-implementation-patterns.md#S11](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION, UT-9B-I-001

### P37: ドキュメント数値の早期固定（TASK-9B-I）

- **教訓**: Phase 4（テスト設計）で想定したテスト数「18」を仕様書に記載したが、Phase 5（実装）で実際のテスト数は「13」になった。設計と実装の乖離がドキュメント全体に波及し、Phase 12 で documentation-changelog.md に早期に「完了」と記載したため、数値不整合の発見が遅れた（P4 パターン再発）
- **解決策**: Phase 12 でテスト数を実際のテストファイルから `grep -c "it(" *.test.ts` で正確にカウントして記載する。Phase 4 の想定値をそのまま使い回さない
- **関連パターン**: P4（documentation-changelog への早期「完了」記載）
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION

### P38: 未タスク配置ディレクトリ間違い（P3 再発、TASK-9B-I）

- **教訓**: UT-9B-I-001 の指示書を `tasks/` 直下に配置したが、正しくは `tasks/unassigned-task/` 配下に配置する必要があった。P3（未タスク管理の3ステップ不完全）と同じパターンの再発
- **解決策**: 未タスク指示書の配置先を確認するチェックリストを Phase 12 で必ず実行する。3ステップの確認: (1) `unassigned-task/` に指示書作成 (2) `task-workflow.md` 残課題テーブルに登録 (3) 関連仕様書に参照リンク追加
- **関連パターン**: P3（未タスク管理の3ステップ不完全）
- **チェックリスト**: [05-task-execution.md#Task 4](./05-task-execution.md)
- **関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION

### P49: type predicate 内での `as` キャスト vs `in` 演算子

- **教訓**: type predicate 内で `(item as Record<string, unknown>).provider` を使用すると、P19（型キャストバイパス）と同じリスクがある。TypeScript の型チェックは通過するが、`item` が実際にオブジェクトでない場合に実行時エラーが発生する
- **症状**: Phase 8 リファクタリングで TS2352 エラー（型キャスト不可）が発生
- **解決策**: `in` 演算子で実行時にプロパティ存在を検証してから `typeof` で型チェック
- **関連パターン**: P19（型キャストバイパス）、S27（Renderer 境界5層防御）
- **関連タスク**: 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

```typescript
// ❌ P49: as キャストで実行時検証バイパス
const isValid = (item: unknown): item is Target =>
  typeof (item as Record<string, unknown>).field === "string";

// ✅ in 演算子で実行時検証 + 型ナロイング
const isValid = (item: unknown): item is Target =>
  item != null &&
  typeof item === "object" &&
  "field" in item &&
  typeof item.field === "string";
```

## タスクワークフロー

### P50: 既実装防御の発見による Phase 転換

- **教訓**: GAP-01〜06 の全防御が既に実装済みだった。Phase 4-5（テスト作成→実装）のワークフローが「新規実装」前提で進み、対応する実装が既に存在しテストも全 PASS だった。この発見が遅れると、不要なコードを重複作成するリスクがある
- **症状**: Phase 4 でテストを書こうとした際、対応する実装が既に存在しテストも全 PASS だった
- **解決策**: Phase 4 開始前に対象ファイルの `git log` と現在のコードを確認し、既に実装済みかどうかを判定する。既実装の場合は Phase 4-5 を「検証・補完」モードに切り替える
- **再発防止**: Phase 1（要件定義）で「現在の実装状態の調査」を必須ステップとして含める
- **関連タスク**: TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

### P51: サブエージェントの documentation-changelog 早期完了記載（P4/P43 複合再発）

- **教訓**: Phase 12 サブエージェントが documentation-changelog.md に「Step 1-A 〜 Step 2 完了」と記載したが、実際には topic-map.md 再生成が未実行だった。P4（早期完了記載）と P43（サブエージェント中断）の複合パターン
- **症状**: `git diff --stat -- .claude/skills/` で indexes/ ディレクトリに変更がないことで発見
- **解決策**:
  1. documentation-changelog には各 Step の実行結果を「事後記録」する（実行前に完了と書かない）
  2. サブエージェント完了後にメインエージェントが `git diff --stat -- .claude/skills/` で実際の変更ファイル数を検証
  3. topic-map.md 再生成は `node scripts/generate-index.js` の実行ログで確認
- **関連パターン**: P4（早期完了記載）、P43（サブエージェント中断）、P2（topic-map 再生成忘れ）
- **関連タスク**: TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

### P52: 防御ガード実装時の同ファイル内 non-null assertion 残存

- **教訓**: 防御ガードを追加した同ファイル内の別箇所（L305-306）に `result.data!` という non-null assertion が残存していた。タスクスコープ内のコードは P48 準拠で修正済みだったが、同ファイル内の**スコープ外コード**に同パターンが残っていた
- **症状**: Phase 10 最終レビューで MINOR 判定。`result.data!.providers` が P48 違反として検出された
- **解決策**: 防御ガード実装時に、対象ファイル全体を `grep -n '!' ファイル名` でスキャンし、non-null assertion の残存箇所をリストアップする。スコープ内は修正、スコープ外は未タスク化
- **関連パターン**: P48（non-null assertion 禁止）、P19（型キャストバイパス）
- **関連タスク**: TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

```typescript
// ❌ P52: スコープ外に残存した non-null assertion
const providers = result.data!.providers;

// ✅ P48 準拠: 実行時型検証
const providers = Array.isArray(result.data?.providers)
  ? result.data.providers
  : [];
```

### P53: CLI 環境でのスクリーンショット取得制約

- **教訓**: Phase 11（手動テスト）でスクリーンショット取得が指示されたが、CLI 環境では Electron アプリの実画面キャプチャができない。自動テスト結果を「間接的な視覚検証」として代替記録する方式を採用したが、Apple UI/UX エンジニアとしての視覚検証は不完全
- **症状**: Phase 11 手動テスト仕様書でスクリーンショット撮影が指示されるが、CLI 環境では実行不可能
- **解決策**: Phase 11 にスクリーンショットが必要な場合、以下のいずれかで対応する:
  1. Playwright の `page.screenshot()` をスクリプト化して取得
  2. Electron の `webContents.capturePage()` をスクリプト化して取得
  3. CLI 環境でも `xvfb-run`（Linux）や headless モードで対応可能
- **関連タスク**: TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001
- **未タスク候補**: UT-FIX-PHASE11-SCREENSHOT-AUTOMATION（スクリーンショット取得自動化）

### P56: 再評価クローズ時の GitHub Issue Close 漏れ

- **教訓**: タスク仕様書を「再評価クローズ」した際に、対応する GitHub Issue を Close する操作が漏れた。`auto-create-issue.sh` が Issue 作成を自動化しているが、Close は手動のまま。3つの台帳（タスク仕様書 / task-workflow.md / GitHub Issue）のうち Issue だけが不整合を起こし、初見の開発者が不要な作業に着手するリスクがある
- **症状**: タスク仕様書は再評価クローズ、task-workflow.md は取消線でクローズ記録済みだが、GitHub Issue が OPEN + `status:unassigned` のまま残存。バックログが汚染され、priority:high ラベルのため誤って着手されるリスクが高い
- **解決策**: タスク仕様書を「再評価クローズ」する際は、対応する GitHub Issue を `gh issue close <number> --comment "再評価クローズ: ..."` で同時に Close する。Close コメントにはバリデーション PASS の証跡とクローズ理由を含める
- **再発防止**: Phase 12 Task 4 チェックリストに「再評価クローズ時の Issue Close」ステップを追加
- **関連パターン**: P4（documentation-changelog への早期「完了」記載）、P51（サブエージェントの早期完了記載）
- **関連タスク**: UT-IMP-PHASE12-WORKFLOW10-COMPLIANCE-FIX-001

### P57: 設計タスクにおける Phase 12 システム仕様書更新の先送りパターン

- **教訓**: 設計タスク（型定義・契約定義のみ、プロダクションコードなし）では「`.claude/skills/` の実更新は PR 作成時に実施」と先送りする判断をしがちだが、これは P26（システム仕様書更新遅延）の再発パターン。`system-spec-update-summary.md` に計画を記録しただけで実際のファイル更新が行われず、Phase 12 の完了条件を満たさなかった
- **解決策**: 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する。worktree 環境でのコンフリクトリスクより、仕様書と実装の乖離リスクの方が高い。「計画文」ではなく「実績ログ」のみを残す
- **関連パターン**: P26（システム仕様書更新遅延）、P4（documentation-changelog への早期「完了」記載）
- **関連タスク**: TASK-SKILL-LIFECYCLE-06

### P58: 設計タスクにおける未タスク指示書の配置省略

- **教訓**: 「設計タスクだから」という理由で `docs/30-workflows/unassigned-task/` への独立した指示書ファイルの作成を省略した。「本レポート内で完了」という代替措置を採用したが、P3 / P38 の3ステップ（①指示書作成 → ②task-workflow 残課題テーブル登録 → ③関連仕様書リンク追加）は設計タスクでも必須であり、後続の監査ツールが指示書パスを参照できず不整合が発生した
- **解決策**: 設計タスクの未タスクであっても、独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成する。P3 の3ステップに例外はない。指示書の内容が簡素であっても「ファイルが存在すること」が監査ツールの前提
- **関連パターン**: P3（未タスク管理の3ステップ不完全）、P38（未タスク配置ディレクトリ間違い）
- **関連タスク**: TASK-SKILL-LIFECYCLE-06

### P59: 並列エージェントによる documentation-changelog 件数不整合

- **教訓**: documentation-changelog.md では「Task 4 検出件数: 0件」と記載されたが、実際の `unassigned-task-detection.md` では8件検出されていた。Phase 12 を複数の並列エージェントで分担した結果、changelog 作成エージェントと未タスク検出エージェントの間で情報が断絶し、数値の整合チェックが行われなかった
- **解決策**: documentation-changelog.md は全 Task 完了後に1つのエージェントが一括作成する。並列エージェントで分担する場合でも、changelog は最後にメインエージェントが統合し、`unassigned-task-detection.md` の検出件数と照合してから記録する
- **関連パターン**: P4（documentation-changelog への早期「完了」記載）、P43（サブエージェント rate limit 中断）、P51（サブエージェントの documentation-changelog 早期完了記載）
- **関連タスク**: TASK-SKILL-LIFECYCLE-06

### P60: IPC テスト応答形式の不一致（Phase 4/5 間の wrapper 形式合意不足）

- **教訓**: Phase 4（テスト設計）で `{ code: "VALIDATION_ERROR" }` のフラットな形式を期待するテストを作成したが、Phase 5（実装）で IPC ハンドラが `{ success: false, error: { code: "VALIDATION_ERROR" } }` の wrapper 形式を返す実装になった。テスト I-3〜I-7 の全アサーション修正が必要になった
- **症状**: テストが `result.code` を参照するが、実装は `result.error.code` にエラー情報を格納しているため全テスト失敗
- **解決策**: Phase 2 設計書に IPC レスポンスの wrapper 形式（`{ success: boolean, data?: T, error?: { code: string, message: string } }`）を明示的に定義し、Phase 4 のテスト設計時にこの定義を参照してアサーションを記述する
- **再発防止**: 新規 IPC ハンドラのテスト作成時は、既存ハンドラのレスポンス形式を `grep -rn "success:" apps/desktop/src/main/handlers/` で確認してからテストを書く
- **関連パターン**: P44（IPC インターフェース不整合）、P45（IPC 引数命名の契約ドリフト）
- **関連タスク**: UT-06-003

```typescript
// Phase 4 で書いたテスト（不正）
expect(result).toEqual({ code: "VALIDATION_ERROR", message: "..." });

// Phase 5 実装が返す実際の形式
// テストは以下に修正する必要がある
expect(result).toEqual({
  success: false,
  error: { code: "VALIDATION_ERROR", message: "..." },
});
```

### P61: IPC ハンドラの DIP 違反が Phase 10 まで検出されない

- **教訓**: `registerSafetyGateHandlers` が `DefaultSafetyGate`（具象クラス）を引数に取る DIP 違反が、Phase 10（最終レビュー）まで検出されなかった。Phase 2（設計）で IPC ハンドラの依存方向を明示しなかったため、Phase 5（実装）で具象クラスへの直接依存が入り込んだ
- **症状**: コードは正常に動作するが、テスタビリティと拡張性が低下し、具象クラスのモック差し替えが困難になる
- **解決策**: 引数型を `SafetyGatePort`（インターフェース）に変更。Phase 2 設計書に「IPC ハンドラの依存先は Port/Interface であること」を設計チェック項目として含める
- **再発防止**: Phase 3（設計レビュー）のチェックリストに「IPC ハンドラ登録関数の引数型が具象クラスではなくインターフェースであること」を追加
- **関連パターン**: P34（遅延初期化 DI パターン選択）、DIP（依存性逆転原則）
- **関連タスク**: UT-06-003

```typescript
// P61: DIP 違反（具象クラス依存）
export function registerSafetyGateHandlers(
  safetyGate: DefaultSafetyGate,
): void {}

// DIP 準拠（インターフェース依存）
export function registerSafetyGateHandlers(safetyGate: SafetyGatePort): void {}
```

### P62: DEFAULT_CONFIG への暗黙 fallback（GAP-03 パターン）

- **教訓**: Provider/Model が未選択の場合に `DEFAULT_CONFIG` へ暗黙 fallback すると、ユーザーが意図しない AI モデルでリクエストが送信される。開発環境と本番環境で異なるデフォルトが設定されている場合、本番で予期しない動作になる
- **症状**: AI から予期しないレスポンスが返る、または本番環境と開発環境で動作が異なる。意図しない課金が発生する場合もある
- **解決策**: Provider/Model が未選択の場合はエラー表示またはセレクター画面へのリダイレクトを行う。fallback は一切行わない。明示的な選択を必須とする
- **検出方法**: `grep -rn "DEFAULT_CONFIG\|defaultConfig" apps/desktop/src/main/` で fallback 箇所を特定する
- **関連タスク**: TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001

### P63: サブエージェントによるテストファイルのインポートパス誤り

- **教訓**: テスト作成をサブエージェントに委譲した際、サブエージェントが既存テストファイルのインポートパスを参照せず、`__tests__/` ディレクトリ基準の誤ったパスでインポートを記述した。テスト実行時まで気付けない
- **症状**: `Module not found` エラー、または実行時に意図しないモジュールが読み込まれる
- **原因**: サブエージェントがプロジェクトのディレクトリ構造を把握せず、慣例的なパスを推測で記述する
- **解決策**: テスト作成を委譲するサブエージェントの指示に「同ディレクトリの既存テストファイルのインポートパスを必ず参照してから記述すること」を明示的に含める。具体的なコマンド例を与えると効果的: `grep -n "^import" src/path/to/existing.test.ts`
- **再発防止**: Phase 4 テスト作成サブエージェントの指示テンプレートに「インポートパス参照確認」を必須ステップとして追加する
- **関連タスク**: TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001

### P64: モノレポ内同名インターフェースのシグネチャドリフト

- **教訓**: 異なるサブモジュール（`crag/types.ts` と `llm/types.ts`）に同名 `ILLMClient` が定義され、メソッドシグネチャが乖離した。`crag/types.ts` は `complete(options: {prompt, maxTokens?, temperature?})` の1引数オブジェクト形式、`llm/types.ts` は `complete(prompt, options?)` の2引数形式。DI 配線（Factory パターン）時にのみ型不整合が顕在化し、各モジュール単独ではコンパイルが通るため検出が困難
- **症状**: Factory の Config に `llmClient: ILLMClient` を1つ定義したが、`LLMReranker`（llm/types）と `RelevanceEvaluator`（crag/types）で異なる `ILLMClient` を要求しており共有不可能
- **解決策**: モノレポ内で同名インターフェースを定義する場合は1箇所に集約し、他はインポートする。Factory 設計時に Phase 2 で全依存モジュールの import 元を確認し、同名型の互換性を検証する
- **関連パターン**: P23（API二重定義の型管理複雑性）、P32（型定義の二箇所同時更新必須）
- **関連タスク**: UT-RAG-08-002, UT-RAG-08-005

```typescript
// P64: 同名だがシグネチャが異なるインターフェース
// crag/types.ts
export interface ILLMClient {
  complete(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<Result<string, Error>>;
}

// llm/types.ts
export interface ILLMClient {
  complete(
    prompt: string,
    options?: LLMCompletionOptions,
  ): Promise<Result<string, Error>>;
}

// Factory で共有しようとすると型不整合
// 解決策: 1箇所に統一するか、Config で分離する
```
