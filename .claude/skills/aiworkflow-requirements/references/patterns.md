# 実行パターン集

> **読み込み条件**: スキル実行時、改善検討時、類似問題の解決策検索時
> **更新タイミング**: パターンを発見したら追記
> **相対パス**: `references/patterns.md`

---

## 目次

### 成功パターン

| カテゴリ                                        | パターン数 | 主要トピック                             |
| ----------------------------------------------- | ---------- | ---------------------------------------- |
| [Phase 12 ドキュメント](#phase-12-ドキュメント) | 7件        | 仕様書同期、チェックリスト消化、追加検証 |
| [IPC / Electron](#ipc--electron)                | 2件        | チャンネル定数化、ペイロード拡張         |
| [DI / アーキテクチャ](#di--アーキテクチャ)      | 2件        | Setter Injection遅延初期化、型変換パターン |
| [OAuth / 認証](#oauth--認証)                    | 4件        | Supabase PKCE、コールバック受信          |
| [テスト / 品質](#テスト--品質)                  | 3件        | ファイル種別分離、リスナー管理           |
| [ストア / 永続化](#ストア--永続化)              | 5件        | 型バリデーション、DEBUGログ、Slice統合、Zustand無限ループ対策 |
| [非同期処理](#非同期処理)                       | 1件        | race condition対策、executionId事前生成  |

### 失敗パターン

| カテゴリ                                 | パターン数 | 主要トピック                                |
| ---------------------------------------- | ---------- | ------------------------------------------- |
| [Phase 12 漏れ](#phase-12-漏れ)          | 8件        | LOGS.md更新漏れ、SKILL.md漏れ、未タスク管理 |
| [IPC / Preload](#ipc--preload)           | 2件        | チャネル名命名規則不整合、型定義不一致      |
| [OAuth / 認証エラー](#oauth--認証エラー) | 4件        | state競合、flowType未設定                   |
| [テスト / 型安全](#テスト--型安全)       | 3件        | モジュールリーク、型アサーション            |
| [その他](#その他)                        | 2件        | 設計段階検証、pnpm幽霊依存                  |

---

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

#### Zustand Store Hooks 無限ループ対策（P31）

##### 1. 問題の概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| 発見日 | 2026-02-10 |
| 影響範囲 | SettingsView, LLMSelectorPanel, SkillSelector |
| 症状 | 設定画面がぐるぐる回り続ける、LLM/スキル選択が無限実行 |

##### 2. 根本原因

- **状況**: 合成Store Hook（`useAuthModeStore()` 等）が毎回新しいオブジェクトを返す
- **問題**: `useEffect` の依存配列に含めると無限ループが発生
- **原因**: Zustand の合成 Store は呼び出しごとに新しいオブジェクト参照を生成するため、React の依存配列比較で常に「変更あり」と判定される

```typescript
// ❌ 無限ループ発生
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // initializeAuthMode は毎回新しい参照

// ✅ 修正後
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []); // 依存配列は空
```

##### 3. 解決パターン

| アプローチ | 実装方法 | 適用場面 |
|-----------|---------|---------|
| **短期（即時対応）** | `useRef` ガード + 空の依存配列 | 既存コードの緊急修正 |
| **長期（設計改善）** | 個別セレクタベース再設計（`useAuthMode()`, `useSetAuthMode()` 等） | 新規実装・リファクタリング時 |

- **短期解決策**: `useRef` で初期化済みフラグを管理し、依存配列を空にする
- **長期解決策**: UT-STORE-HOOKS-REFACTOR-001 で個別セレクタベースの Hook に再設計

##### 4. 実装時の苦戦箇所

| 課題 | 症状 | 解決策 |
|------|------|--------|
| ESLint キャッシュ | `react-hooks/exhaustive-deps` ルールが検出されない | `rm -f .eslintcache` でキャッシュクリア |
| 合成 Hook の参照不安定 | 依存配列に含めると無限ループ | `useRef` ガードで初期化を1回に制限 |
| コメントフォーマット | 抑制コメントの形式が不統一 | `// P31対策:` 形式に標準化 |
| 依存配列設計判断 | ESLint ルールとの競合 | ケース別判断基準（下記参照） |

**依存配列設計の判断基準**:
- 合成 Store Hook から取得した関数 → 依存配列に含めない（`useRef` ガード使用）
- 個別セレクタ（`useAuthMode()` 等）から取得した値 → 依存配列に含める
- `eslint-disable-next-line` を使用する場合は理由コメント必須

##### 5. 検証チェックリスト

- [ ] **症状確認**: 対象画面で無限ループ（ローディングが止まらない）が発生しているか
- [ ] **原因特定**: `useEffect` の依存配列に合成 Store Hook の関数が含まれているか
- [ ] **修正適用**: `useRef` ガードを追加し、依存配列を空にしたか
- [ ] **コメント追加**: `// P31対策: 合成Store Hookは毎回新しい参照を返すため依存配列から除外` を記載したか
- [ ] **動作検証**: 画面遷移・リロード後も正常に動作するか
- [ ] **ESLint 確認**: `.eslintcache` をクリアして警告を確認したか

##### 6. 参照リンク

- **落とし穴記録**: [06-known-pitfalls.md#P31](../../rules/06-known-pitfalls.md)
- **状態管理設計**: [arch-state-management.md](./arch-state-management.md)
- **後続タスク**: UT-STORE-HOOKS-REFACTOR-001（個別セレクタベース再設計）

### 非同期処理

#### executionId事前生成によるrace condition防止パターン（TASK-FIX-6-1 2026-02-10）

- **状況**: IPC呼び出し前に状態を設定し、イベント到着時にフィルタリングする必要がある
- **アプローチ**:

  ```typescript
  // executeSkill アクション内
  const tempExecutionId = crypto.randomUUID();
  set({ executionId: tempExecutionId, isExecuting: true });
  await window.electronAPI.skill.execute(...);

  // _handleStreamMessage でexecutionIdを検証
  if (get().executionId !== message.executionId) {
    return; // 古いメッセージを無視
  }
  ```

- **結果**: 連続実行時に古いexecutionIdのメッセージがフィルタリングされ、状態の整合性が保証される
- **適用条件**: IPC経由の非同期処理で、実行IDによるメッセージフィルタリングが必要な場合
- **発見日**: 2026-02-10（TASK-FIX-6-1-STATE-CENTRALIZATION）
- **関連ファイル**:
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`: `executeSkill()`, `_handleStreamMessage()`
  - `apps/desktop/src/renderer/store/setupSkillListeners.ts`
- **関連**: 03-state-management.md#リスナー管理

---

## 失敗パターン（避けるべきこと）

失敗から学んだアンチパターン。

### Phase 12 漏れ

#### 正本更新時の派生ドキュメント同期漏れ

- **状況**: references/security-principles.md（正本）を更新した
- **問題**: docs/00-requirements/17-security-guidelines.md（派生）の更新を忘れ、正本と派生で内容が不一致になった
- **原因**: 正本のみを検索・更新し、派生ドキュメントの存在を確認しなかった
- **教訓**: `grep -rn "KEYWORD" references/ docs/00-requirements/` で両方検索する。特にセキュリティ関連は正本と派生の両方に反映必須
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### 未タスク包含判断の追跡性不足

- **状況**: UT-SEC-001を「DEBT-SEC-002/003に包含」と判断
- **問題**: 包含先の仕様書にスコープ追記なし。task-workflow.md残課題テーブルへの登録も未実施。3ステップ未完了
- **原因**: 「包含」と判断した時点で管理完了と誤認し、追跡性確保の手順を省略
- **教訓**: 包含判断時は (1) 包含先スコープに追記 (2) task-workflow.md登録 (3) 関連仕様書リンク追加 の3ステップ必須
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### Phase 12 全Step確認前の早期完了記載

- **状況**: Phase 12 の Step 1-A のみ完了した時点
- **問題**: documentation-changelog.md に「完了」と記載し、Step 1-D（topic-map.md 再生成）の漏れに気付けなかった
- **原因**: 一部Stepの完了を全体完了と誤認
- **教訓**: 全 Step (1-A〜1-D + Step 2) の確認が終わるまで「完了」と記載しない
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### LOGS.md 2ファイル更新漏れ

- **状況**: Phase 12でaiworkflow-requirements/LOGS.mdのみ更新した
- **問題**: task-specification-creator/LOGS.mdの更新を忘れ、2スキル間で更新日付が不一致
- **原因**: Phase 12のStep 1-Aに「LOGS.md 2ファイル更新」と明記されているのに、1ファイルのみで完了と誤認
- **教訓**: LOGS.mdは必ず2ファイル（aiworkflow-requirements + task-specification-creator）セットで更新する
- **発見日**: 2026-02-06（DEBT-SEC-001、06-known-pitfalls.md P1と同一パターン再現）

#### topic-map.md 再生成忘れ

- **状況**: references/ 配下の仕様書を更新した
- **問題**: `node generate-index.js` を実行せず、topic-map.md が古いまま残った
- **原因**: Step 1-Dのチェックリストを確認せずにStep 2に進んだ
- **教訓**: references/ のファイルを更新した場合は必ず topic-map.md を再生成する
- **発見日**: 2026-02-06（DEBT-SEC-001、06-known-pitfalls.md P2と同一パターン再現）

#### SKILL.md 変更履歴更新漏れ（TASK-FIX-12-1 2026-02-09）

- **状況**: Phase 12 の Step 1-A で LOGS.md を更新した
- **問題**: SKILL.md の変更履歴テーブルの更新を忘れ、LOGS.md と SKILL.md で情報が不一致になった
- **原因**:
  - LOGS.md と SKILL.md が別ファイルであることを認識していなかった
  - Phase 12 完了条件チェックリスト（05-task-execution.md）を確認しなかった
  - LOGS.md 更新で「完了」と誤認した
- **教訓**:
  - phase-11-12-guide.md の完了条件チェックリストを必ず確認する
  - SKILL.md 変更履歴は LOGS.md とは別に更新が必要
  - Step 1-A の完了条件: LOGS.md 2ファイル更新 + SKILL.md 変更履歴更新
- **発見日**: 2026-02-09（TASK-FIX-12-1-IPC-HARDCODE-FIX）
- **関連**: 06-known-pitfalls.md#P23

#### 未タスク検出時の関連ファイル調査不足（TASK-FIX-12-1 2026-02-09）

- **状況**: TASK-FIX-12-1 で SkillExecutor.ts のハードコード箇所を修正した
- **問題**: 同様のパターンを持つ他のファイル（updater.ts, agent-handler.ts）の調査が初回で行われなかった
- **原因**:
  - 指示された修正対象ファイルのみに注目した
  - `grep -rn '"skill:' src/` などの横断検索を行わなかった
- **教訓**:
  - 修正対象のパターン（例: ハードコード文字列）を特定したら、`grep` で全ファイルを横断検索する
  - 同様のパターンを持つファイルがあれば、未タスク仕様書として登録する
  - 「1箇所の修正」ではなく「パターンの撲滅」として捉える
- **発見日**: 2026-02-09（TASK-FIX-12-1-IPC-HARDCODE-FIX）
- **関連**: 06-known-pitfalls.md#P24

#### 未タスク配置ディレクトリの誤り（TASK-FIX-12-1 2026-02-09）

- **状況**: TASK-FIX-12-2 未タスク仕様書を作成した
- **問題**: `docs/30-workflows/skill-import-agent-system/tasks/unassigned-task/` に配置したが、正しくは `docs/30-workflows/unassigned-task/` だった
- **原因**:
  - task-workflow.md の「未タスク配置先」セクションを確認しなかった
  - 直感的に「関連タスクのディレクトリ配下」と誤認した
- **教訓**:
  - 未タスク仕様書は常に `docs/30-workflows/unassigned-task/` に配置する
  - 個別タスクディレクトリ配下には配置しない
  - task-workflow.md の残課題テーブルへの登録も必須
- **発見日**: 2026-02-09（TASK-FIX-12-1-IPC-HARDCODE-FIX）
- **関連**: 06-known-pitfalls.md#P3

### IPC / Preload

#### IPCチャネル名命名規則不整合

- **状況**: Main側とPreload側で同じIPCチャネルを参照しているが、実行時に通信が成立しない
- **問題**: Main側 `agent:getStatus`（camelCase） vs Preload側 `agent:get-status`（kebab-case）で不一致
- **原因**:
  - チャネル名が定数化されておらず、各層で独立してハードコード
  - 命名規則がプロジェクト全体で統一されていなかった
  - Main側とPreload側を別の開発者/タイミングで実装し、命名規則の合意がなかった
- **影響**: IPC通信が成立せず、Main側ハンドラに到達しない。エラーメッセージからは原因が特定しにくい
- **教訓**:
  1. チャンネル名は必ず定数化（`@repo/shared/src/ipc/channels.ts`）
  2. 命名規則をプロジェクト全体で統一（kebab-caseを推奨）
  3. Phase 10で横断的なチャンネル名検証を実施
  4. Phase 12の追加検証でアーキテクチャ整合性確認を実施する
- **発見日**: 2026-02-10（UT-FIX-5-3）
- **発見方法**: Phase 12追加検証でのアーキテクチャ整合性確認
- **関連タスク**: TASK-FIX-12-2
- **関連**: 04-electron-security.md#IPCセキュリティ原則

#### Preload型定義と実装の戻り値型不一致

- **状況**: Preload APIの型定義と実際の実装で戻り値型が異なる
- **問題**: 型定義 `abort: () => void` vs 実際の戻り値 `Promise<void>`（safeInvoke経由）
- **原因**:
  - safeInvoke()がPromiseを返すことを型定義に反映していなかった
  - Preload実装変更時に型定義ファイルの同期更新を忘れた
  - 型定義と実装を別々に作成し、整合性確認を行わなかった
- **影響**:
  - TypeScriptコンパイラが誤った型推論を行う
  - await/then()が使用できない（型エラーにならないため気づきにくい）
  - Promise rejectionをキャッチできず、unhandled rejection が発生
- **教訓**:
  1. Preload APIの型定義は実装と必ず一致させる
  2. safeInvoke()使用時は必ず`Promise<T>`型を使用
  3. 型定義変更時は呼び出し側（Renderer）も確認
  4. Phase 10でPreload型定義と実装の整合性を検証項目に追加
- **発見日**: 2026-02-10（UT-FIX-5-3）
- **発見方法**: safeInvoke()の戻り値型確認
- **関連タスク**: UT-FIX-5-4
- **関連**: 02-code-quality.md#TypeScript型安全

### OAuth / 認証エラー

#### Supabaseカスタムstateパラメータ競合

- **状況**: CSRF対策のため独自のstateパラメータをqueryParamsに渡した
- **問題**: `bad_oauth_state`エラーが発生し、認証が失敗
- **原因**: Supabaseが内部でstateを生成・検証しており、カスタムstateを渡すと競合する
- **教訓**: SupabaseのOAuth認証では、state管理をSupabaseに完全委任する。カスタムstateは渡さない
- **発見日**: 2026-02-06（TASK-AUTH-CALLBACK-001、06-known-pitfalls.md P15）

#### Supabase Site URL未設定によるリダイレクト失敗

- **状況**: Redirect URLsに`http://localhost:52100/auth/callback`を登録したが、コールバックが別のURLにリダイレクトされる
- **問題**: ブラウザが`localhost:3000`にリダイレクトされ、HTTPサーバーが受信できない
- **原因**: Supabase DashboardのSite URLがデフォルトの`localhost:3000`のままだった
- **教訓**: Redirect URLsだけでなく、Site URLも正しい値に設定する。Site URLはフォールバック先として使用される
- **発見日**: 2026-02-06（TASK-AUTH-CALLBACK-001、06-known-pitfalls.md P16）

#### Implicit Flow vs Authorization Code Flow混同

- **状況**: コールバックURLに`#access_token=...`（フラグメント）が含まれ、`?code=...`（クエリ）が期待と異なる
- **問題**: HTTPサーバーで`code`パラメータを取得できず、「認証コードが見つかりません」エラー
- **原因**: Supabaseクライアントに`flowType: 'pkce'`を設定していなかったため、Implicit Flowが使用された
- **教訓**: Authorization Code Flow + PKCEを使用する場合、クライアント初期化時に`flowType: 'pkce'`を明示的に設定する
- **発見日**: 2026-02-06（TASK-AUTH-CALLBACK-001、06-known-pitfalls.md P17）

#### exchangeCodeForSession code_verifier不足エラー

- **状況**: `exchangeCodeForSession(code)`呼び出し時に「both auth code and code verifier should be non-empty」エラー
- **問題**: トークン交換が失敗し、セッションが確立できない
- **原因**: カスタムcode_challengeをqueryParamsに渡したが、Supabase内部のcode_verifierと不整合
- **教訓**: Supabase PKCEではカスタムcode_challenge/code_verifierを渡さない。Supabaseに完全委任する
- **発見日**: 2026-02-06（TASK-AUTH-CALLBACK-001、06-known-pitfalls.md P18）

### テスト / 型安全

#### モジュールスコープ変数のテスト間リーク

- **状況**: authListenerRegistered等のフラグ変数がテスト間で共有される
- **問題**: テスト実行順序で結果が変わる不安定なテスト
- **原因**: Vitestのモジュールキャッシュがテスト間で共有される
- **教訓**: モジュールスコープ変数にはresetXxxFlag()リセット関数を用意し、beforeEachで呼び出す
- **発見日**: 2026-02-05（TASK-FIX-GOOGLE-LOGIN-001、06-known-pitfalls.md P9）

#### 型アサーションによるストアデータ取得

- **状況**: `store.get('importedSkillIds') as string[]` のように型アサーションでストアデータを取得
- **問題**: アプリ再起動後にデータが消失、またはコンソールに型エラーが発生
- **原因**: 外部ストレージ（electron-store）のデータ型は実行時には不明。型アサーションはコンパイル時のみ有効で、実行時バリデーションを行わない
- **教訓**: ストレージからのデータ取得は常に `unknown` 型で受け取り、`Array.isArray()` と `typeof` による実行時バリデーションを行う
- **発見日**: 2026-02-08（TASK-FIX-4-2-SKILL-STORE-PERSISTENCE）
- **関連タスク**: TASK-FIX-4-2-SKILL-STORE-PERSISTENCE

#### テスト中のログ出力による可読性低下

- **状況**: 開発中に追加した `console.log` / `console.warn` がテスト実行時にも出力される
- **問題**: テスト結果の可読性が低下し、重要なエラーメッセージを見逃す。CI/CDのログ容量も増大
- **原因**: 本番コードのDEBUGログが環境判定なしに出力され、テストランナーの出力が汚染された
- **教訓**: ログ出力は環境によって制御可能にすべき。以下のいずれかを実装する:
  - `this.debug` フラグをコンストラクタで受け取り、`{ debug: false }` でテスト時は抑制
  - `process.env.NODE_ENV !== 'test'` ガードでテスト環境では出力しない
  - `electron-log` 等のロガーを使用し、環境ごとにログレベルを設定
- **発見日**: 2026-02-08（TASK-FIX-4-2-SKILL-STORE-PERSISTENCE）
- **関連タスク**: TASK-FIX-4-2-SKILL-STORE-PERSISTENCE
- **関連**: 06-known-pitfalls.md#P20

### その他

#### 設計段階でのAPI境界条件検証不足

- **状況**: DEBT-SEC-001の設計でvalidate(state, provider)メソッドを定義
- **問題**: Implicit FlowのコールバックURLにプロバイダー情報が含まれず、設計通りの実装が不可能だった
- **原因**: 設計PhaseでOAuth仕様の制約（コールバックURLのパラメータ構成）を実際に確認しなかった
- **教訓**: 外部サービスAPIに依存する設計は、設計Phaseで実際のレスポンスサンプルを取得して検証すべき
- **発見日**: 2026-02-06（DEBT-SEC-001）

#### pnpm幽霊依存によるランタイムエラー

- **状況**: packages/sharedで外部ライブラリをimportしているが、package.jsonに宣言がない
- **問題**: vitestではエイリアスで通るが、Electron実行時にERR_MODULE_NOT_FOUND
- **原因**: pnpm厳格モードで宣言されていない依存は解決できない
- **教訓**: importする外部ライブラリは必ず自パッケージのpackage.jsonに宣言する。テスト通過 ≠ ランタイム安全
- **発見日**: 2026-02-05（AGENT-SDK-DEP-FIX、06-known-pitfalls.md P8）

---

## ガイドライン

実行時の判断基準。

### 仕様書更新時の派生ドキュメント確認

- **状況**: references/ 配下の仕様書を更新する場合
- **指針**: 必ず `grep -rn "ファイル名のキーワード" docs/00-requirements/` で派生ドキュメントの有無を確認し、存在すれば同期更新する
- **根拠**: 正本と派生で内容が不一致になると、参照元によって異なる情報が提供され混乱を招く

### 未タスクの統合判断基準

- **状況**: 新規に検出された未タスクが既存タスクのスコープに含まれると判断する場合
- **指針**: 単に「包含」と記録するだけでなく、包含先の仕様書にスコープとして明示追記し、task-workflow.md にも登録する。関連仕様書への参照リンクも追加する
- **根拠**: 暗黙的な包含は追跡できず、実装時にスコープ漏れとなるリスクがある

### 変更履歴追記時の順序確認

- **状況**: 仕様書の変更履歴セクションにエントリを追加する場合
- **指針**: 対象ファイルの既存エントリの順序（昇順/降順）を確認してから追記する。混在させない
- **根拠**: バージョン順序の不統一はdiffレビュー時の混乱やCI検証スクリプトの誤検出を招く

### 新規仕様ファイル作成の判断基準

- **状況**: 既存の仕様書に詳細情報を追加するか、新規ファイルとして切り出すか判断が必要
- **指針**: 追加内容が独立したAPI仕様・型定義・設計根拠を含み、他の文脈から単独参照される場合は新規ファイル。既存ファイルが500行を超える場合も分離を検討
- **根拠**: skill-creatorの「1 file = 1 responsibility」原則。Progressive Disclosureで必要な情報だけ読み込める
