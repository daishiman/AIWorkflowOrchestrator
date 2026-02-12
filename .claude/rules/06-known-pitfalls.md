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

## Electron / ランタイム

### P5: リスナー二重登録

- **教訓**: React StrictMode では `useEffect` が2回実行される。リスナー登録はモジュールレベルでガードが必要
- **ルール**: [03-state-management.md#リスナー管理](./03-state-management.md)

### P6: OAuth コールバックパース誤り

- **教訓**: OAuth コールバックではレスポンスモードに応じたパース先を選択する（fragment `#` vs query `?`）。PKCE 移行後は両経路が共存しうる
- **ルール**: [04-electron-security.md#認証セキュリティ](./04-electron-security.md)

### P12: 外部 SDK 自動処理との競合

- **教訓**: 外部 SDK のデフォルト自動処理（トークンリフレッシュ等）をカスタム実装で置き換える場合、元の自動処理を必ず無効化する

### P14: カスタムプロトコル URL パース

- **教訓**: `new URL("myapp://path/to")` では RFC 3986 の authority 規則により pathname が期待どおりにならない。カスタムプロトコルでは手動パースが安全

### P31: Zustand Store Hooks無限ループ

- **教訓**: `useAuthModeStore()` 等の合成Store Hookが毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する
- **症状**: 設定画面がぐるぐる回り続ける、LLM/スキル選択が無限実行
- **解決策**:
  1. **短期（非推奨）**: useRefでガードし、依存配列は空にする
  2. **長期（実装済）**: 個別セレクタベース（`useAuthMode()`, `useSetAuthMode()`等）に再設計
- **実装完了**: UT-STORE-HOOKS-REFACTOR-001
  - 53個の個別セレクタを追加（AuthModeSlice/LLMSlice/AgentSlice）
  - 合成Hookに`@deprecated`タグを追加
  - SettingsView, LLMSelectorPanelを個別セレクタベースにリファクタリング
  - 181テスト追加、全PASS

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

## Preload / API 統一

### P23-P28 と実装パターンの対応表

| Pitfall ID | タイトル             | 実装パターン参照                                                                                                                                                     | 関連Phase |
| ---------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| P23        | API二重定義の型管理  | [S1: architecture-implementation-patterns.md](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#s1-api二重定義の型管理複雑性)     | Phase 5-9 |
| P24        | Store型定義不統一    | S1と同上                                                                                                                                                             | Phase 6   |
| P25        | OperationResult波及  | [S4: architecture-implementation-patterns.md](../skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#s4-operationresult廃止の影響波及) | Phase 5-8 |
| P26        | safeInvoke学習コスト | [skill-creator/patterns.md](../skills/skill-creator/references/patterns.md)                                                                                          | Phase 12  |
| P27        | ハードコード文字列   | [skill-creator/patterns.md](../skills/skill-creator/references/patterns.md)                                                                                          | Phase 12  |
| P28        | 手動テスト確認漏れ   | -                                                                                                                                                                    | Phase 11  |

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
