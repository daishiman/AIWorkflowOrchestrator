# 実行パターン集 / detail specification

> 親仕様書: [patterns.md](patterns.md)
> 役割: detail specification

## 成功パターン

成功した実行から学んだベストプラクティス。

### Phase 12 ドキュメント

#### 正本と派生ドキュメントの同期検索

- **状況**: references/ 配下の正本仕様書を更新した際、docs/00-requirements/ 配下の派生ドキュメントの同期更新が必要
- **アプローチ**: `grep -rn "KEYWORD" references/ docs/00-requirements/` で正本と派生の両方を検索し、更新漏れを防ぐ
- **結果**: 正本（references/security-principles.md）と派生（docs/00-requirements/17-security-guidelines.md）の両方を確実に同期できる
- **適用条件**: references/ 配下のファイルを更新した場合は常にこのパターンを適用すべき
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### 未タスク「包含」判断時の3ステップ

- **状況**: 未タスク（例: UT-SEC-001）を「既存タスク（例: DEBT-SEC-002）に包含」と判断した場合
- **アプローチ**: (1) 包含先仕様書のスコープに明示追記 (2) task-workflow.md 残課題テーブルに登録 (3) 関連仕様書にリンク追加
- **結果**: 包含の判断根拠と追跡性が確保され、後続タスク実行時にスコープ漏れを防止
- **適用条件**: 未タスクを別タスクに統合する判断をした場合
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### 多角的品質レビューの並列実行

- **状況**: Phase 12 完了後の品質検証で、単一視点では更新漏れを見逃す
- **アプローチ**: 3つの独立エージェントを並列実行（コード品質/セキュリティ、ドキュメント整合性、仕様対照監査）
- **結果**: 単一レビューでは見逃した17-security-guidelines.md未更新（CRITICAL）、artifacts.jsonパス不整合等を検出
- **適用条件**: Phase 12のStep完了後、documentation-changelog.mdに「完了」と記載する前
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### Phase 12チェックリストの機械的消化

- **状況**: Phase 12の更新対象が14ファイル以上に散在し、手動での網羅確認が困難
- **アプローチ**: 05-task-execution.mdのStep 1-A〜1-D + Step 2のチェックリストを1ステップずつ機械的に消化し、各Step完了時にdocumentation-changelog.mdに記録
- **結果**: 漏れが発生しても早期に検出でき、「完了」記載前に全Stepを確認済みであることを保証
- **適用条件**: Phase 12実行時は常に適用
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### 変更履歴バージョン順序の統一確認

- **状況**: 仕様書の変更履歴セクションでバージョン順序（昇順/降順）が不統一
- **アプローチ**: 更新前に対象ファイルの既存バージョン順序を確認し、同じ順序で追記する
- **結果**: task-workflow.md（昇順）、security-operations.md/security-principles.md（降順）それぞれの規則に従った追記が可能
- **適用条件**: 仕様書に変更履歴エントリを追加する場合
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### Phase 12追加検証パターン

- **状況**: Phase 12完了後、PRマージ前に追加のアーキテクチャ整合性検証が必要と判断
- **アプローチ**:
  1. 型定義と実装の一致確認（Preload API、IPC型定義）
  2. IPCチャネル名の命名規則確認（Main/Preload/Renderer間の整合性）
  3. 横断的セキュリティ問題の検出（複数ファイルにまたがるパターン）
- **結果**: 2件の追加問題を発見（UT-FIX-5-4: Preload型不一致、TASK-FIX-12-2: チャネル名命名規則不整合）
- **適用条件**: Phase 12完了後、複雑なIPC/Preload変更を含むタスクの場合
- **発見日**: 2026-02-10（UT-FIX-5-3）
- **教訓**: Phase 12完了時点でも追加検証が有効。特にレイヤー間の型整合性は自動テストで検出しにくい

#### 未タスク3ステップ完全実施パターン

- **状況**: 追加検証で発見した問題を未タスクとして登録する必要がある
- **アプローチ**:
  1. `unassigned-task/` に指示書作成（9セクション構成テンプレート準拠）
  2. `task-workflow.md` 残課題テーブルに登録（優先度・カテゴリ・関連タスク明記）
  3. 関連仕様書に参照リンク追加（該当する場合）
- **結果**: UT-FIX-5-4が適切に管理され、後続作業者が問題を見落とすリスクが低減
- **適用条件**: 新規に検出された問題を未タスクとして登録する場合
- **発見日**: 2026-02-10（UT-FIX-5-3）
- **教訓**: 3ステップ全てを省略せず実施することで追跡性が向上。「包含」判断時も同様

#### Phase 12 LOGS.md/SKILL.md 2ファイル更新パターン（TASK-FIX-6-1 2026-02-10）

- **状況**: Phase 12 Task 2 Step 1-A でタスク完了記録を更新する
- **アプローチ**:
  1. `aiworkflow-requirements/LOGS.md` を更新（タスクID、タイトル、完了日、学び/成果）
  2. `task-specification-creator/LOGS.md` を更新（同内容、2ファイル両方必須）
  3. `aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新
  4. `task-specification-creator/SKILL.md` の変更履歴テーブルを更新
  5. topic-map.md 再生成（セクション追加/削除/更新時）
- **結果**: 2つのスキル間で完了記録が一致し、LOGS.md と SKILL.md の情報整合性が確保される
- **適用条件**: Phase 12 実行時は常に適用。特に Step 1-A 完了条件として必須
- **発見日**: 2026-02-10（TASK-FIX-6-1-STATE-CENTRALIZATION）
- **関連**: 06-known-pitfalls.md#P1, P23

### IPC / Electron

#### IPC既存ペイロードへのエラーフィールド追加

- **状況**: Main ProcessのエラーをRendererに伝達する必要があるが、新規IPCチャンネルの追加は影響範囲が大きい
- **アプローチ**: 既存のAUTH_STATE_CHANGEDイベントペイロードにerror/errorCodeフィールドを追加（後方互換性維持）
- **結果**: 既存のリスナーに影響なく、エラー情報を伝達可能。新規チャンネル不要でテストも最小限
- **適用条件**: 既存IPCチャンネルにエラー情報を追加する場合
- **発見日**: 2026-02-05（TASK-FIX-GOOGLE-LOGIN-001）

#### IPC チャンネル名定数化パターン（TASK-FIX-12-1 2026-02-09）

- **カテゴリ**: セキュリティ / リファクタリング
- **状況**: Main Process 内で IPC チャンネル名がハードコード文字列で記述されている
- **アプローチ**:
  1. `grep -rn '"skill:' src/` でハードコード箇所を検出
  2. `@repo/shared/src/ipc/channels.ts` に定数が存在するか確認
  3. ハードコード文字列を定数参照（例: `SKILL_CHANNELS.SKILL_STREAM`）に置換
  4. 既存テストで動作確認（型エラー・ランタイムエラーがないこと）
- **結果**: IPC セキュリティ原則（04-electron-security.md）準拠。チャンネル名変更時の一括修正が容易に
- **適用条件**: IPC チャンネル名をハードコードしている箇所を発見した場合
- **発見日**: 2026-02-09（TASK-FIX-12-1-IPC-HARDCODE-FIX）
- **関連ファイル**:
  - 06-known-pitfalls.md: P23, P24
  - architecture-implementation-patterns.md: IPCチャンネル名定数化パターン

#### safeInvokeUnwrap による IPC ラッパー自動展開

- **状況**: Main Process の IPC ハンドラが `{ success: true, data: T }` 形式でレスポンスを返すが、Preload の `safeInvoke<T>()` は TypeScript type erasure により実行時にラッパーを透過させる。Renderer が `{ success, data }` オブジェクトを配列として扱いランタイムエラー発生
- **アプローチ**: `safeInvokeUnwrap<T>()` 関数を追加し、`safeInvoke<IpcResult<T>>()` でラッパーを受信 → `result.success` 検証 → `result.data` を返却。各ハンドラの応答形式を確認し、ラッパーあり=`safeInvokeUnwrap`、ラッパーなし=`safeInvoke` と使い分け
- **結果**: `list()`, `getImported()`, `rescan()` の3メソッドで配列が直接返却されるようになり、AgentView のクラッシュが解消。`import()` はハンドラが直接返却のため `safeInvoke` を維持（正しい判断）
- **適用条件**: Main Process ハンドラが `{ success, data }` ラッパーを使用するチャンネルで、Preload メソッドの戻り値が `data` フィールドの型と一致すべき場合
- **発見日**: 2026-02-14（UT-FIX-IPC-RESPONSE-UNWRAP-001）

### DI / アーキテクチャ

#### Setter Injectionパターン（遅延初期化DI）（TASK-FIX-7-1 2026-02-11）

- **状況**: BrowserWindow等の外部リソースを必要とする依存オブジェクトは、Constructor Injectionで対応できない
- **アプローチ**:
  1. Facadeサービス（例: SkillService）生成時点では依存先（SkillExecutor）は未初期化
  2. `setXxx(dependency)` Setterメソッドで、外部リソース準備後に依存オブジェクトを注入
  3. 実行メソッド呼び出し時に依存オブジェクトの存在を検証（未設定時はエラー）
- **結果**: 初期化タイミングが異なる依存オブジェクトを安全に注入可能。Facadeパターンとの併用でレイヤー分離を維持
- **適用条件**: 依存オブジェクトの生成に外部リソース（BrowserWindow、IPC接続等）が必要な場合
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION
- **関連ファイル**:
  - architecture-implementation-patterns.md: Setter Injection パターン詳細
  - skill-creator/references/patterns.md: [DI/Architecture] Setter Injectionパターン

#### IPC層とサービス層の型変換パターン（TASK-FIX-7-1 2026-02-11）

- **状況**: IPC層（Preload/Handler）とサービス層で異なる型定義を使用しており、型変換が必要
- **アプローチ**:
  1. IPC層では汎用型（`Skill`）、サービス層では詳細型（`SkillMetadata`）を使用
  2. IPCハンドラー内で明示的な型変換ロジックを実装
  3. 変換時に必須フィールドの存在確認とデフォルト値設定を行う
- **結果**: レイヤー間の型の責務が明確になり、型安全な通信が実現
- **適用条件**: IPC通信でRenderer/Main間でデータ構造が異なる場合
- **発見日**: 2026-02-11
- **関連タスク**: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION
- **関連ファイル**:
  - interfaces-agent-sdk-executor.md: SkillMetadata型定義
  - skill-creator/references/patterns.md: [IPC/Type] 型変換パターン

### OAuth / 認証

#### OAuth仕様制約の設計時実証

- **状況**: OAuth Implicit Flowの認証コールバック設計で、コールバックURLの実際の形式を確認する必要がある
- **アプローチ**: 設計Phase（Phase 2）でプロバイダーのコールバックURLサンプルを実際に取得し、利用可能なパラメータを検証
- **結果**: URLフラグメント(#)にトークンが含まれることを事前確認でき、url.hash.slice(1)のパース設計が正確に行える
- **適用条件**: 外部サービスのAPIレスポンス形式に依存する設計を行う場合
- **発見日**: 2026-02-06（DEBT-SEC-001）

### テスト / 品質

#### Zustandリスナー二重登録防止パターン

- **状況**: React StrictModeやHot Reloadでリスナー登録関数が複数回実行される
- **アプローチ**: モジュールスコープのフラグ変数（例: `authListenerRegistered`）で登録状態を管理し、テスト用に`resetXxxFlag()`をエクスポート
- **結果**: 二重登録によるイベント重複を防止。テスト間での状態リークも`beforeEach`でリセット可能
- **適用条件**: `useEffect`やモジュール初期化でIPC/イベントリスナーを登録する場合
- **発見日**: 2026-02-05（TASK-FIX-GOOGLE-LOGIN-001）

#### テストファイル種別分離パターン

- **状況**: 永続化、エラーハンドリング、境界値など異なる関心事のテストが混在し、テストの意図が不明確
- **アプローチ**:

| テスト種別   | ファイル命名            | 目的                               |
| ------------ | ----------------------- | ---------------------------------- |
| 永続化テスト | `*.persistence.test.ts` | ストア永続化・復元の検証           |
| エラーテスト | `*.error.test.ts`       | 異常系・エラーハンドリング検証     |
| 境界値テスト | `*.boundary.test.ts`    | 空配列・null・型不整合等の境界条件 |

- **結果**: テストの意図が明確になり、特定の関心事に集中したテスト設計が可能
- **適用条件**: 複雑なモジュールで異なる観点のテストが必要な場合
- **発見日**: 2026-02-08（TASK-FIX-4-2-SKILL-STORE-PERSISTENCE）
- **関連タスク**: TASK-FIX-4-2-SKILL-STORE-PERSISTENCE

### ストア / 永続化

#### electron-store get()型バリデーションパターン

- **状況**: electron-storeからデータ取得時に、ストアデータの型安全性を確保する必要がある
- **アプローチ**:
  - `store.get(key)` の戻り値を `unknown` として扱う
  - 明示的な型バリデーション関数（例: `validateStoredSkillIds()`）で検証
  - `Array.isArray()` と `filter()` で不正データを除外
- **結果**: アプリ再起動後もデータが正しく復元され、型安全性が保証される
- **適用条件**: electron-storeやlocalStorageなど外部ストレージからデータを取得する場合
- **発見日**: 2026-02-08（TASK-FIX-4-2-SKILL-STORE-PERSISTENCE）
- **関連タスク**: TASK-FIX-4-2-SKILL-STORE-PERSISTENCE
- **実装例**: `apps/desktop/src/main/services/skill/SkillImportManager.ts` の `validateStoredSkillIds()` 関数

#### DEBUGログ条件付き出力パターン

- **状況**: 開発時に追加したconsole.logが本番環境やテスト環境に残ると、パフォーマンス低下とログ汚染が発生
- **アプローチ**:
  - コンストラクタで `debug` フラグを受け取り、インスタンス変数として保持
  - ログ出力時は `if (this.debug) console.log(...)` でガード
  - 代替として `process.env.NODE_ENV !== 'test'` でテスト環境を除外
- **結果**: 本番では不要なログが出力されず、テスト時にはログ抑制で結果が見やすい
- **適用条件**: デバッグ情報を開発中のみ表示したい場合。特にサービス層やマネージャークラス
- **発見日**: 2026-02-08（TASK-FIX-4-2-SKILL-STORE-PERSISTENCE）
- **関連タスク**: TASK-FIX-4-2-SKILL-STORE-PERSISTENCE
- **実装例**: `SkillImportManager` のコンストラクタに `options?: { debug?: boolean }` を追加
- **関連**: 06-known-pitfalls.md#P20
- **補足（2026-02-14）**: TASK-FIX-14-1 により、`this.debug` ガードは `log.debug()` に置換するパターンが推奨に。詳細は [logging-migration-guide.md](./logging-migration-guide.md) を参照

#### Zustand Slice統合パターン（TASK-FIX-6-1 2026-02-10）

- **状況**: 複数のSlice（例: skillSlice）を既存のSlice（例: agentSlice）に統合する
- **アプローチ**:
  1. 統合先Sliceに全状態とアクションを移行（例: `isExecuting`, `streamingContent`, `executeSkill()`）
  2. 統合元Sliceファイルを削除
  3. 互換性セレクタ（例: `useSkillStore`）を作成し、後方互換性を維持
  4. `setupSkillListeners.ts` でIPCハンドラを統合先Storeのアクションに接続
  5. コンポーネント側は既存のセレクタ経由でアクセス可能（修正不要）
- **結果**: 状態の一元管理が実現。Sliceが削除されてもコンポーネント側の変更が最小限
- **適用条件**: 関連するドメインのSliceを1つに統合し、状態の重複を解消したい場合
- **発見日**: 2026-02-10（TASK-FIX-6-1-STATE-CENTRALIZATION）
- **関連ファイル**:
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`
  - `apps/desktop/src/renderer/store/setupSkillListeners.ts`
  - 03-state-management.md: Zustand設計原則

#### 互換性セレクタによる後方互換維持パターン（TASK-FIX-6-1 2026-02-10）

- **状況**: Slice統合後も既存コンポーネントが `useSkillStore()` を使用している
- **アプローチ**:
  ```typescript
  // 互換性セレクタ（index.ts）
  export const useSkillStore = <T>(selector: (state: AppState) => T): T =>
    useAppStore(selector);
  ```
- **結果**: 既存コンポーネントの import 文を変更せずに統合先Storeを参照可能
- **適用条件**: Slice統合時に既存コードへの影響を最小化したい場合
- **発見日**: 2026-02-10（TASK-FIX-6-1-STATE-CENTRALIZATION）
- **実装例**: `apps/desktop/src/renderer/store/index.ts` の `useSkillStore` エクスポート

#### Supabase OAuth flowType設定パターン

- **状況**: デスクトップアプリでSupabase OAuth認証を実装する際、Implicit Flow（#access_token）ではなくAuthorization Code Flow（?code）を使用したい
- **アプローチ**: Supabaseクライアント初期化時に `auth: { flowType: 'pkce' }` を設定する
- **結果**: コールバックURLが `?code=xxx` 形式になり、セキュアなトークン交換が可能に
- **適用条件**: Supabase + Electronでの認証実装時は必須
- **発見日**: 2026-02-06（TASK-AUTH-CALLBACK-001）

#### Supabase PKCE内部管理委任パターン

- **状況**: PKCEのcode_verifier/code_challengeを自前で生成・管理しようとしたが、トークン交換時にエラーが発生
- **アプローチ**:
  - 問題: カスタムcode_challengeをqueryParamsに渡すと、Supabase内部のcode_verifierと不整合になる
  - 解決: PKCEパラメータを一切渡さず、Supabaseに完全委任（`flowType: 'pkce'`のみ設定）
  - 理由: Supabase JSクライアントが内部ストレージでcode_verifierを管理し、exchangeCodeForSession時に自動で使用
- **結果**: `both auth code and code verifier should be non-empty`エラーが解消、認証成功
- **適用条件**: Supabase OAuth + PKCEを使用する場合は、カスタムPKCE実装を避ける
- **発見日**: 2026-02-06（TASK-AUTH-CALLBACK-001）

#### ローカルHTTPサーバーによるOAuthコールバック受信パターン

- **状況**: デスクトップアプリでOAuthコールバックを受信するため、カスタムプロトコル(aiworkflow://)ではなくHTTPサーバーを使用
- **アプローチ**:
  - localhost:52100（固定ポート）でHTTPサーバーを起動
  - Supabase Dashboard の Redirect URLs に `http://localhost:52100/auth/callback` を登録
  - Site URL も `http://localhost:52100` に設定（フォールバック先として重要）
- **結果**: ブラウザからのコールバックを確実に受信可能。カスタムプロトコルの制限（OSによる登録問題）を回避
- **適用条件**: Electron/Tauri等のデスクトップアプリでのOAuth実装時
- **発見日**: 2026-02-06（TASK-AUTH-CALLBACK-001)

#### Zustand Store Hooks 無限ループ対策（P31）-- 解決済み

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001（短期対策） → UT-STORE-HOOKS-COMPONENT-MIGRATION-001（根本解決） |
| 発見日 | 2026-02-10 |
| 解決日 | 2026-02-12 |
| 影響範囲 | SettingsView, LLMSelectorPanel, SkillSelector |
| ステータス | **解決済み**（個別セレクタHookへの移行完了） |

**問題**: 合成Store Hook（`useAuthModeStore()` 等）が毎回新しいオブジェクトを返し、`useEffect` の依存配列で無限ループ発生

**解決策**:

| 段階 | 方法 | 状態 |
|------|------|------|
| 旧短期（緊急修正） | `useRef` ガード + 空の依存配列 | 当時の暫定策。現在は新規採用しない |
| 標準（根本解決） | 個別セレクタHook（`useInitializeAuthMode()`, `useFetchProviders()` 等）に再設計 | 2026-02-12完了 |

```typescript
// ❌ 無限ループ（合成Hook）
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => { initializeAuthMode(); }, [initializeAuthMode]);

// ✅ 安全（個別セレクタ）
const initializeAuthMode = useInitializeAuthMode();
useEffect(() => { initializeAuthMode(); }, [initializeAuthMode]);
```

**詳細**: [arch-state-management.md - P31対策セクション](./arch-state-management.md)
**落とし穴記録**: [06-known-pitfalls.md#P31](../../rules/06-known-pitfalls.md)
**実装ガイド**: [implementation-guide.md](../../../docs/30-workflows/completed-tasks/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/outputs/phase-12/implementation-guide.md)

#### 個別セレクタHookへのコンポーネント移行パターン（UT-STORE-HOOKS-COMPONENT-MIGRATION-001 2026-02-12実装）

- **状況**: P31対策として合成Store Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）から個別セレクタHookへの移行が必要だった
- **アプローチ**:
  1. `store/index.ts`に30個の個別セレクタHook（LLM:12, Skill:15, AuthMode:3）を追加
  2. 対象コンポーネント3件（LLMSelectorPanel, SkillSelector, SettingsView）を一括移行
  3. useRefガードパターンを削除し、`useEffect` の依存配列に安定した action selector を直接含める
  ```typescript
  // Before: 合成Hook + useRefガード
  const { fetchProviders } = useLLMStore();
  const ref = useRef(false);
  useEffect(() => { if (!ref.current) { ref.current = true; fetchProviders(); } }, []);

  // After: 個別セレクタ（ガード不要）
  const fetchProviders = useLLMFetchProviders();
  useEffect(() => { fetchProviders(); }, [fetchProviders]);
  ```
- **結果**: 71テスト全PASS、P31問題の根本解決、ESLint exhaustive-deps準拠
- **適用条件**: Zustand Storeの合成Hookを使用しているコンポーネントでuseEffect依存配列の問題がある場合
- **発見日**: 2026-02-12（UT-STORE-HOOKS-COMPONENT-MIGRATION-001）
- **関連ファイル**:
  - `apps/desktop/src/renderer/store/index.ts`: 個別セレクタHook定義
  - `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`: LLM移行例
  - `apps/desktop/src/renderer/views/SettingsView/index.tsx`: AuthMode移行例
- **横断確認コマンド**: `rg -n "useAuthModeStore|useInitializeAuthMode|useAuthModeStatus" apps/desktop/src/renderer`
- **関連**: 06-known-pitfalls.md#P31、arch-state-management.md#P31対策

##### 実装時の苦戦箇所（UT-STORE-HOOKS-COMPONENT-MIGRATION-001）

| # | 課題 | 症状 | 根本原因 | 解決策 |
|---|------|------|----------|--------|
| 1 | Phase 12 spec-update-workflow全Step未実施 | LOGS.md×2、SKILL.md×2、arch-state-management.md更新、task-workflow.md更新、06-known-pitfalls.md P31更新、topic-map.md再生成、artifacts.json更新、unassigned-task-detection.md作成、skill-feedback-report.md作成 — 合計12項目が漏れた | Phase 12のTask 1（実装ガイド）とTask 4（未タスク検出）に注力し、Task 2（システムドキュメント更新）のStep 1-A〜1-E + Step 2の多段階プロセスを省略。成果物リストとspec-update-workflow.mdのStepリストが分散しており一覧性が低い | Phase 12実行時は「spec-update-workflow.mdのStep 1-A〜1-E + Step 2」と「Phase 12仕様書のTask 1〜5」を並列にチェックリストとして管理し、全Step完了まで「完了」と記載しない |
| 2 | patterns.md の古い参照残存 | patterns.md内で UT-STORE-HOOKS-REFACTOR-001（先行計画タスク）が「後続タスク」「未実施」として残っており、本タスクで完了済みに更新すべきだった | 先行タスクの参照を横断的に検索して更新する手順がワークフローに組み込まれていなかった | タスク完了時に `grep -rn "TASK_ID" .claude/` で関連参照を全検索し、ステータスを更新する手順をPhase 12チェックリストに追加 |
| 3 | artifacts.json のステータス矛盾 | Phase 12完了時にartifacts.jsonのトップレベルstatusを"completed"にしたが、Phase 13（PR作成）がpendingのため矛盾が発生 | Phase 12完了とタスク全体完了を混同し、トップレベルstatusの更新タイミングを誤った | トップレベルstatusはPhase 13（PR作成・マージ）完了まで"in_progress"を維持する。個別Phaseのstatusのみ"completed"に更新する |

**再発防止のためのチェックリスト**:
- [ ] Phase 12開始時にspec-update-workflow.mdの全Step（1-A〜1-E + Step 2）を書き出す
- [ ] 各Stepの完了をdocumentation-changelog.mdに逐次記録する
- [ ] `grep -rn "TASK_ID" .claude/ docs/` で先行タスクの参照を検索し、ステータスを更新する
- [ ] artifacts.jsonのトップレベルstatusはPhase 13完了まで"in_progress"を維持する
- [ ] 全Step完了を確認してからdocumentation-changelog.mdに「完了」と記載する

#### Zustand 個別セレクタベース再設計パターン（UT-STORE-HOOKS-REFACTOR-001 2026-02-11）

##### 1. 問題の概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-STORE-HOOKS-REFACTOR-001 |
| 発見日 | 2026-02-11 |
| 目的 | P31（無限ループ）の根本解決 |
| 対象 | useAuthModeStore, useLLMConfigStore, useAgentStore |

##### 2. 設計方針

合成Store Hookが毎回新しいオブジェクトを返す問題を、個別セレクタで解決する。

```typescript
// ❌ 従来の合成Store Hook（参照不安定）
export const useAuthModeStore = () => ({
  authMode: useAppStore((state) => state.authMode),
  setAuthMode: useAppStore((state) => state.setAuthMode),
  initializeAuthMode: useAppStore((state) => state.initializeAuthMode),
});

// ✅ 個別セレクタ（参照安定）
export const useAuthMode = () => useAppStore((state) => state.authMode);
export const useSetAuthMode = () => useAppStore((state) => state.setAuthMode);
export const useInitializeAuthMode = () => useAppStore((state) => state.initializeAuthMode);
```

##### 3. 命名規則

| セレクタ種別 | 命名パターン | 例 |
|-------------|-------------|-----|
| 状態取得 | `use{StateName}` | `useAuthMode`, `useIsExecuting` |
| アクション取得 | `use{ActionName}` | `useSetAuthMode`, `useExecuteSkill` |
| 派生状態取得 | `use{DerivedName}` | `useIsApiKeyMode`, `useCanExecute` |

##### 4. 移行戦略

| フェーズ | 作業内容 | 影響範囲 |
|---------|---------|---------|
| Phase 1 | 個別セレクタを追加（既存維持） | 新規Hook追加のみ |
| Phase 2 | 既存コンポーネントを個別セレクタに移行 | 段階的リファクタリング |
| Phase 3 | 合成Store Hookを削除 | 最終クリーンアップ |

##### 5. 実装チェックリスト

- [ ] Slice内の全状態に対応する個別セレクタを作成
- [ ] Slice内の全アクションに対応する個別セレクタを作成
- [ ] 派生状態が必要な場合は専用セレクタを作成
- [ ] JSDocコメントで用途と戻り値型を明記
- [ ] 既存の合成Store Hookは互換性維持のため残す（Phase 1）
- [ ] 新規コンポーネントでは個別セレクタを使用

##### 6. カバレッジ目標

| 指標 | 目標 |
|------|------|
| Line Coverage | 80%以上 |
| Branch Coverage | 70%以上 |
| セレクタ数 | Slice内の状態+アクション数の100% |

##### 7. 参照リンク

- **完了タスク**: UT-STORE-HOOKS-REFACTOR-001
- **P31対策**: 個別セレクタを標準とし、useRefガードは legacy emergency only とする
- **後続タスク**: UT-STORE-HOOKS-REFACTOR-002（JSDoc追加）、UT-STORE-HOOKS-REFACTOR-003（合成Hook移行）

