# 実行パターン集 / advanced specification

> 親仕様書: [patterns.md](patterns.md)
> 役割: advanced specification

## 成功パターン

成功した実行から学んだベストプラクティス。

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

### ログ移行

#### electron-log 標準移行パターン（TASK-FIX-14-1）

- **状況**: Main Process サービス層で `console.*` が直接使用されており、テスト環境でのログ汚染や本番でのログレベル制御が不可能
- **アプローチ**:
  - `import log from "electron-log"` を追加
  - ログレベルマッピングに従い置換（console.error→log.error, console.warn→log.warn, console.info→log.info, console.log→log.debug）
  - `[ClassName]` プレフィックスを全メッセージに統一
  - `if (this.debug)` / `process.env.NODE_ENV !== "test"` ガードを削除
- **結果**: 4ファイル27箇所を移行。テスト環境でのログ汚染が解消し、ログレベル制御がトランスポート設定に一元化
- **適用条件**: `apps/desktop/src/main/` 配下で `console.*` を使用しているサービスファイル
- **発見日**: 2026-02-14（TASK-FIX-14-1）
- **関連タスク**: TASK-FIX-14-1-CONSOLE-LOG-MIGRATION
- **詳細ガイド**: [logging-migration-guide.md](./logging-migration-guide.md)

#### テストモックテンプレート化パターン

- **状況**: electron-log を使用するサービスのテストファイルに個別にモックを追加する必要があり、漏れが発生しやすい
- **アプローチ**:
  - 標準モックパターンを定義: `vi.mock("electron-log", () => ({ default: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() } }))`
  - import 直後、describe 直前に配置
  - `grep -rn "from.*TargetClass" __tests__/` で影響テストを事前特定
- **結果**: 9ファイルに統一パターンで一括追加。P20（テスト環境でのログ出力汚染）を根本解決
- **適用条件**: Main Process サービス層のテスト作成時は常に適用
- **発見日**: 2026-02-14（TASK-FIX-14-1）
- **関連タスク**: TASK-FIX-14-1-CONSOLE-LOG-MIGRATION

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
- **問題**: `docs/30-workflows/skill-import-agent-system/tasks/unassigned-task/` に配置したが、正しくは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` だった
- **原因**:
  - task-workflow.md の「未タスク配置先」セクションを確認しなかった
  - 直感的に「関連タスクのディレクトリ配下」と誤認した
- **教訓**:
  - 未タスク仕様書は常に `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に配置する
  - 個別タスクディレクトリ配下には配置しない
  - task-workflow.md の残課題テーブルへの登録も必須
- **発見日**: 2026-02-09（TASK-FIX-12-1-IPC-HARDCODE-FIX）
- **関連**: 06-known-pitfalls.md#P3

#### Phase 12 spec-update-workflow.md全Step未実施（UT-STORE-HOOKS-COMPONENT-MIGRATION-001）

- **状況**: Phase 12でimplementation-guide.md等の主要ドキュメントは作成したが、spec-update-workflow.mdの全Stepを実施しなかった
- **問題**: LOGS.md×2、SKILL.md×2、arch-state-management.md関連タスク更新、task-workflow.md完了タスク追加、06-known-pitfalls.md P31更新、topic-map.md再生成、artifacts.json更新、unassigned-task-detection.md（5ソース形式）、skill-feedback-report.md — 合計12項目が漏れていた
- **原因**: Phase 12のTask 1（実装ガイド）とTask 4（未タスク検出）に注力し、Task 2（システムドキュメント更新）のStep 1-A〜1-E + Step 2の多段階プロセスを省略した
- **教訓**:
  1. Phase 12はTask 1-4の全てが必須であり、Task 2のステップ数が最も多い
  2. spec-update-workflow.mdの全Step（1-A〜1-E + Step 2）を逐次チェックリスト形式で実行する
  3. documentation-changelog.mdには全Stepの完了結果を記録してから「完了」とする（P4対策）
  4. 「LOGS.md×2」「SKILL.md×2」は別々のファイルであることを意識する（P1/P25対策）
- **発見日**: 2026-02-12（UT-STORE-HOOKS-COMPONENT-MIGRATION-001、P1/P2/P4/P25/P27/P29再発）

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

#### 内部関数変更によるテストモック値の波及修正

- **状況**: `safeInvoke` → `safeInvokeUnwrap` に変更したところ、`mockInvoke.mockResolvedValue([...])` で直接配列を返していた既存テスト19箇所が全て失敗。`safeInvokeUnwrap` は `{ success, data }` 形式を期待するため
- **原因**: テストが Preload 層の内部実装（`safeInvoke` の呼び出し元）に依存しており、`ipcRenderer.invoke` のモック値がメソッドの内部実装に結合していた
- **影響**: 3ファイル・計19箇所のモック値修正が必要（`skill-api.test.ts` 11箇所、`skill-api.unification.test.ts` 8箇所）
- **対策**:
  1. 変更前に `grep -n "mockResolvedValue\|mockResolvedValueOnce" *.test.ts` で影響範囲を調査
  2. `list()`, `getImported()`, `rescan()` を呼ぶテストのモック値を特定
  3. `{ success: true, data: [...] }` 形式に一括変更
- **Pitfall ID**: P21/P35 の拡張パターン
- **発見日**: 2026-02-14（UT-FIX-IPC-RESPONSE-UNWRAP-001）

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

### ログ環境

#### テストモック漏れによるログ出力汚染（TASK-FIX-14-1）

- **状況**: electron-log に移行した本番コードのテストファイルで、モック定義が漏れていた
- **問題**: テスト実行時に `[ClassName]` プレフィックスのログが stdout に大量出力され、テスト結果の可読性が低下
- **原因**: electron-log はデフォルトで stdout 出力するため、テスト環境でもモック未定義だとログが漏れる
- **教訓**: Main Process サービス層のテストファイルには **必ず** `vi.mock("electron-log")` を追加する。影響範囲は `grep -rn "from.*ClassName" __tests__/` で事前特定
- **発見日**: 2026-02-14（TASK-FIX-14-1）
- **関連タスク**: TASK-FIX-14-1-CONSOLE-LOG-MIGRATION
- **関連**: P20（テスト環境でのログ出力汚染）、[logging-migration-guide.md](./logging-migration-guide.md)

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

