# Lessons Learned（教訓集） / auth settings / degradation / guard

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: Settings 契約防御、IPC Graceful Degradation、AuthGuard timeout/bypass 教訓
> 分割元: [lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md](lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md)

## メタ情報

| 項目 | 値 |
| --- | --- |
| 正本 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-settings-degradation-guard.md` |
| 目的 | Settings 契約防御・IPC Graceful Degradation・AuthGuard timeout 教訓を集約 |
| スコープ | 06-TASK-FIX-SETTINGS-APIKEY / TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION / TASK-FIX-AUTHGUARD-TIMEOUT |
| 対象読者 | AIWorkflowOrchestrator 開発者 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-27 | 1.0.0 | `lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` から分割して新設 |

---

## 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

### コンテキスト
- 対象: ApiKeysSection `apiKey.list()` 戻り値の契約防御
- 期間: 2026-03-07
- カテゴリ: Renderer 境界防御 / Main バリデーション / パターン統一

### 実装内容
1. **Renderer 層（ApiKeysSection/index.tsx）**: `normalizeProviders` type predicate フィルタ追加。`result.data?.providers` の nullish チェック + 要素 shape 検証（`provider`/`status` フィールド必須）
2. **Main 層（apiKeyHandlers.ts）**: `apiKey:list` ハンドラのレスポンス生成前に `Array.isArray(result?.providers)` バリデーション追加
3. **パターン統一（profileHandlers.ts）**: 3箇所の `identities ?? []` → `Array.isArray(user.identities) ? user.identities : []` に統一
4. **テスト**: 20件追加（Renderer 7件 + apiKeyHandlers 7件 + profileHandlers 6件）、全122件 PASS
5. **カバレッジ**: Statements 93.17% / Branches 86.23% / Functions 91.66%

### 苦戦箇所

#### S1: type predicate 内での型キャスト vs in 演算子
- **症状**: `normalizeProviders` 内で `(item as Record<string, unknown>).provider` を使用したが、Phase 8 で P19（型キャストバイパス）違反と判定
- **根本原因**: `as Record<string, unknown>` は実行時検証をバイパスする型アサーション。`in` 演算子は実行時チェックを伴う型ナロイング
- **解決策**: `"provider" in item && typeof item.provider === "string"` に変更。`in` 演算子で TypeScript の型ナロイングと実行時検証を同時に実現
- **再発条件**: type predicate でオブジェクトプロパティの存在を検証する場合
- **再利用手順**:
  1. `as` キャストの代わりに `in` 演算子を使用
  2. `in` 演算子の後に `typeof` で型検証
  3. P19 準拠を ESLint rule で強制（将来）

#### S2: Main ハンドラの直接テスト困難性
- **症状**: `apiKeyHandlers.ts` の list ハンドラは `ipcMain.handle` + `withValidation` でラップされており、ハンドラ関数を直接テストできない
- **根本原因**: ハンドラ登録が `registerApiKeyHandlers()` 関数内にカプセル化されており、個別のハンドラ関数をエクスポートしていない
- **解決策**: `ipcMain.handle` をモックし、登録時のコールバック関数を取得してテストする間接テストパターンを採用
- **再発条件**: `withValidation` ラッパーを使う IPC ハンドラの新規テスト作成時
- **再利用手順**:
  1. `vi.mock("electron")` で ipcMain をモック
  2. `registerXxxHandlers()` を呼び出し
  3. `ipcMain.handle.mock.calls` から対象チャネルのコールバックを取得
  4. コールバックを直接呼び出してバリデーションロジックをテスト

#### S3: `?? []` vs `Array.isArray` の防御力の差
- **症状**: `profileHandlers.ts` で `identities ?? []` が使われていたが、`identities` が文字列やオブジェクト等の非配列値の場合に防御できない
- **根本原因**: Nullish coalescing (`??`) は `null`/`undefined` のみ防御。P48 では全型に対する実行時検証が求められる
- **解決策**: `Array.isArray(user.identities) ? user.identities : []` に統一
- **再発条件**: 外部データ（IPC レスポンス、DB クエリ結果）から配列を取得する場合
- **再利用手順**:
  1. `grep -rn "?? \[\]" apps/desktop/src/` で全箇所を検出
  2. 外部データ由来の箇所を `Array.isArray` に置換
  3. 内部コード由来（確実に null/undefined のみ）は `?? []` を維持

#### S4: IPC契約ドリフト（仕様表の旧値残存）
- **症状**: API仕様書は更新済みだが、実装変更後に戻り値型テーブルだけ旧値が残るドリフトが発生
- **根本原因**: 「実装コード」と「仕様表」の両方を同時に検証する手順を固定していなかった
- **解決策**: `api-ipc-system.md` の `apiKey:list` を `IPCResponse<ProviderListResult>` へ更新し、フィールド表 (`providers/registeredCount/totalCount`) を追加
- **標準ルール**: IPC契約変更時は「型名 + フィールド表 + 完了タスク台帳」を同一コミット単位で更新する

#### S5: Phase 11 実画面証跡不足
- **症状**: Phase 11 が自動テスト代替に寄り、実画面証跡が不足しやすい
- **根本原因**: UI構造変更なしという前提で screenshot を省略する運用が残っていた
- **解決策**: `capture-task-06-settings-apikey-contract-guard-phase11.mjs` を追加し、TC-11-01〜03 を取得して manual-test-result へ証跡リンクを記録
- **標準ルール**: ユーザーが画面検証を要求した場合、`SCREENSHOT` を必須に切り替える

#### S6: Phase 11 証跡表ヘッダの validator 不一致
- **症状**: `validate-phase11-screenshot-coverage` が `manual-test-result.md` の証跡列を抽出できず失敗
- **根本原因**: 証跡テーブルが validator 期待ヘッダ（`テストケース` / `証跡`）を満たしていなかった
- **解決策**: Phase 11成果物に validator互換テーブルを追加し、TC-11-01〜03 の `.png` を1:1で紐付け
- **再発条件**: 手動テスト結果の表形式を独自変更した場合
- **標準ルール**: Phase 11完了前に `validate-phase11-screenshot-coverage` を必ず実行し、表形式を機械検証で固定

#### S7: screenshot 再取得時の依存欠落（Rollup optional dependency）
- **症状**: capture script 実行時に `Cannot find module @rollup/rollup-darwin-x64` で停止
- **根本原因**: worktree の optional dependency が欠落したまま Vite 起動を試行した
- **解決策**: `pnpm install` 後に capture script を再実行し、`phase11-capture-metadata.json` を更新
- **再発条件**: worktree切替直後や node_modules 再構成後に preview/capture を即実行する場合
- **標準ルール**: screenshot 再取得前に依存解決（`pnpm install`）と preflight（preview疎通）を先に実施

### 同種課題の5分解決カード

| ステップ | 操作 | 目的 |
|----------|------|------|
| 1 | `grep -rn "result.data\." apps/desktop/src/renderer/` で Renderer 側の data アクセスを検索 | 未防御の shape アクセスを発見 |
| 2 | `result?.data` + `Array.isArray(result.data.xxx)` の2段チェックを追加 | nullish + 非配列を同時に防御 |
| 3 | type predicate フィルタで要素 shape を検証（`in` 演算子 + `typeof`） | malformed 要素を安全に除外 |
| 4 | Main ハンドラ側にも `Array.isArray` バリデーションを追加 | 多層防御の実現 |
| 5 | テスト追加（undefined/null/空配列/malformed/reject の5パターン） | 回帰防止 |

### 検証ゲート
- `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/`
- `cd apps/desktop && pnpm exec tsc --noEmit`

### 同期先
- `references/security-electron-ipc.md`: apiKeyAPI セクション追加
- `references/ui-ux-settings.md`: ApiKeysSection 異常系表示仕様
- `.claude/rules/06-known-pitfalls.md`: P49 候補（type predicate の `as` vs `in`）

## TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 教訓

### 実装内容サマリー

`registerAllIpcHandlers()` の個別ハンドラ登録が例外を投げた場合でも、後続のハンドラ登録を継続する Graceful Degradation パターンを導入。`safeRegister()` 内部ヘルパーで個別 try-catch を行い、失敗情報を `IpcHandlerRegistrationResult` として構造化して返却する。

| 変更ファイル | 変更内容 |
|---|---|
| `apps/desktop/src/main/ipc/index.ts` | `safeRegister()`, `sanitizeRegistrationErrorMessage()`, `track()` 追加。戻り値を `IpcHandlerRegistrationResult` に変更 |
| `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | 19テスト新規作成（全PASS） |

### 苦戦箇所

#### S-GD-1: setupThemeWatcher が safeRegister パターンに適合しない

- **再発条件**: ハンドラ登録関数の戻り値（unsubscribe function 等）をモジュールスコープ変数に保持する必要がある場合
- **症状**: `safeRegister()` は戻り値を破棄するため、`setupThemeWatcher` の unsubscribe 関数をキャプチャできない
- **解決策**: `setupThemeWatcher` は個別の try-catch で囲み、戻り値を `themeWatcherUnsubscribe` に代入する。`safeRegister` との使い分けを設計書で明示する
- **再利用**: 戻り値が必要なハンドラ登録は `safeRegister` ではなく個別 try-catch を使用する。設計時に戻り値の要否を明確にする

#### S-GD-2: track() クロージャの成功カウント管理

- **再発条件**: 複数のハンドラを一括で登録する関数（例: `registerSkillHandlers` 1関数で複数チャネルを登録）の成功カウント
- **症状**: `safeRegister` 呼び出し元で成功数を手動管理するとカウント漏れが発生しやすい
- **解決策**: `track()` 内部クロージャで `safeRegister` の成功/失敗を自動追跡し、最終的に `IpcHandlerRegistrationResult` として集約する
- **再利用**: 複数の独立操作の成功/失敗を集約する場合、クロージャで状態を閉じ込めるパターンを適用する

#### S-GD-3: sanitizeRegistrationErrorMessage でのパスマスク

- **再発条件**: エラーメッセージにユーザーのホームディレクトリパスが含まれる場合（NFR-02 プライバシー保護）
- **症状**: `os.homedir()` が `/Users/username` を返すが、エラーメッセージ中のパスは正規表現のメタ文字を含む可能性がある
- **解決策**: `escapeRegExp()` でホームディレクトリパスをエスケープしてから `RegExp` で置換。`~` にマスクする
- **再利用**: ログ出力にファイルパスが含まれる場合は必ず `sanitize` 処理を適用する。P20（テスト環境ログ汚染）と組み合わせて運用する

#### S-GD-4: agentHandlers.test.ts の既存テスト失敗との分離

- **再発条件**: IPC テストスイート全体実行時に、変更と無関係なテストファイルが Vite 依存解決エラーで失敗する
- **症状**: `agentHandlers.test.ts` の 16 テストが `resolvePackageEntry` エラーで失敗。Graceful Degradation 変更とは無関係
- **解決策**: 変更対象のテストファイルを `--testPathPattern` で絞って実行し、無関係な失敗を分離する。全体テスト失敗はベースブランチでも再現することを確認し、変更起因でないことを証明する
- **再利用**: IPC テスト追加時は対象テストファイルのみを先に実行し、全体テスト失敗との混同を避ける

### 同種課題向け再利用手順

1. **設計時**: 各ハンドラ登録関数の「戻り値の要否」と「失敗時の影響範囲」を明確にする
2. **実装時**: 戻り値不要 → `safeRegister`、戻り値必要 → 個別 try-catch の使い分けを適用
3. **テスト時**: `vi.hoisted()` でモック変数を宣言し、30+ のハンドラ登録関数を網羅的にモック化
4. **検証時**: 対象テストファイルのみを先に実行し、既存テスト失敗との混同を回避
5. **ログ検証**: `sanitizeRegistrationErrorMessage` のパスマスク動作を専用テスト（T-18相当）で確認

### 関連未タスク（TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 から派生）

| タスクID | 概要 | 優先度 | 指示書パス |
|---|---|---|---|
| UT-FIX-AGENT-HANDLERS-VITE-RESOLVE-001 | agentHandlers.test.ts 16テスト失敗（Vite resolvePackageEntry エラー）修正 | 高 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-fix-agent-handlers-vite-resolve.md` |
| UT-IMP-IPC-ERROR-SANITIZE-COMMON-001 | sanitizeErrorMessage の IPC ハンドラ横断共通化 | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-ipc-error-sanitize-common.md` |
| UT-IMP-WORKFLOW-STALE-VALIDATOR-001 | index.md / artifacts.json / phase-*.md stale 状態一括検出バリデータ | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-workflow-stale-validator.md` |
| UT-IMP-SKILL-CONFLICT-MARKER-LINT-001 | SKILL.md / LOGS.md conflict marker 検出 lint | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-skill-conflict-marker-lint.md` |

---

## TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 実装教訓（2026-03-10）

### 概要

AuthGuard タイムアウトフォールバック + Settings 認証除外の実装。認証初期化がハングした場合に10秒タイムアウトでフォールバック UI を表示し、Settings 画面は AuthGuard をバイパスしてアクセス可能にする。

### 苦戦箇所

#### 1. App.tsx の AuthGuard 構造変換の複雑さ

| 項目 | 内容 |
| --- | --- |
| 課題 | 既存の `<AuthGuard>` が全ルートを一括ラップしていたため、Settings だけをバイパスするにはルート構造全体のリファクタリングが必要だった |
| 再発条件 | 認証除外ビューを追加する際に、catch-all route の構造を変更する必要がある場合 |
| 解決策 | catch-all route の `renderCatchAllElement()` を抽出し、`currentView === "settings"` の条件分岐で AuthGuard バイパスを実現。直接 URL ルート（`/agent`, `/chat/*`, `/advanced/*`）は個別に `<AuthGuard>` でラップ |
| 標準ルール | 認証除外ビューを追加するときは、catch-all route と直接 URL route の両方で AuthGuard の適用範囲を確認する |

```typescript
// catch-all route での条件分岐パターン
if (currentView === "settings") {
  return viewContent; // AuthGuard バイパス
}
return <AuthGuard>{viewContent}</AuthGuard>;
```

#### 2. useAuthState タイマー管理と P13 準拠

| 項目 | 内容 |
| --- | --- |
| 課題 | setTimeout + Promise + 再スケジュールパターンでテストが無限ループする P13 問題。`vi.runAllTimers()` を使うと無限ループする |
| 再発条件 | タイムアウト機構をテストする際に `vi.runAllTimers()` 系の API を使用する場合 |
| 解決策 | `vi.advanceTimersByTime(10_000)` で1ステップずつ進める。useEffect のクリーンアップで `clearTimeout` を確実に呼ぶ |
| 標準ルール | タイマーテストでは `vi.advanceTimersByTime()` を使用し、`vi.runAllTimers()` は避ける（P13 準拠） |

```typescript
// P13 準拠のタイマーテストパターン
vi.useFakeTimers();
act(() => {
  vi.advanceTimersByTime(10_000);
});
// タイムアウト後の状態を検証
expect(result.current.authState).toBe("timed-out");
```

#### 3. getAuthState の判定優先順位設計

| 項目 | 内容 |
| --- | --- |
| 課題 | `isTimedOut` と `isLoading` の組み合わせ条件の優先順位を間違えると、タイムアウト後に認証完了しても自動遷移しない |
| 再発条件 | 複数の boolean フラグの組み合わせで状態を決定するロジックを設計する場合 |
| 解決策 | `isTimedOut && isLoading` を最優先に判定。`isLoading=false` になれば自動的に `authenticated` or `unauthenticated` に遷移 |
| 標準ルール | 状態判定は「最も特殊な条件」から順に評価する。タイムアウトは「ローディング中のみ有効」という制約を明示する |

```typescript
// 判定優先順位（上から順に評価）
function getAuthState(isTimedOut: boolean, isLoading: boolean, isAuthenticated: boolean): AuthState {
  if (isTimedOut && isLoading) return "timed-out";   // (1) 最優先: タイムアウト中
  if (isLoading) return "checking";                   // (2) ローディング中
  if (isAuthenticated) return "authenticated";         // (3) 認証済み
  return "unauthenticated";                            // (4) 未認証
}
```

#### 4. Settings bypass のセキュリティ境界

| 項目 | 内容 |
| --- | --- |
| 課題 | Settings を AuthGuard 外に出すと、未認証状態で API キー設定画面にアクセス可能になるセキュリティ考慮が必要 |
| 再発条件 | 認証ガードから特定ビューを除外する設計判断を行う場合 |
| 解決策 | API キー操作はすべて IPC 経由で Main Process 管理。Renderer 側に機密データは直接保持されない。direct URL routes は全て AuthGuard 配下に維持 |
| 標準ルール | 最小権限（Settings shell のみバイパス）+ 多層防御（IPC + Main Process バリデーション維持）を徹底する |

#### 5. バックグラウンドテスト実行のタイムアウト（exit code 144）

| 項目 | 内容 |
| --- | --- |
| 課題 | サブエージェントで Vitest 実行すると exit code 144（SIGTERM）で中断される |
| 再発条件 | サブエージェントにテスト実行を委譲し、タイムアウトが不十分な場合 |
| 解決策 | メインフローでテスト実行する。サブエージェントにテスト実行を委譲する場合はタイムアウトを十分に確保するか、テスト対象を限定する |
| 標準ルール | 104件以上のテストスイートはサブエージェントではなくメインフローで実行する |

### 同種課題の5分解決カード

```
症状: AuthGuard（または類似のブロッキングコンポーネント）が無限ローディング状態
根本原因: 認証初期化のハング（IPC/ネットワーク）
5手順:
  1. useAuthState にタイムアウト state を追加（useState + useEffect + setTimeout）
  2. getAuthState の判定ロジックに isTimedOut 条件を最優先で追加
  3. フォールバック UI（リトライ + 代替導線）を作成
  4. ブロッキング対象から除外すべきビューを条件分岐で bypass
  5. テスト: vi.advanceTimersByTime() でタイマーを制御（P13準拠）
検証ゲート: 104テスト全PASS、AC-1〜AC-8全達成
同期先: architecture-auth-security.md, ui-ux-navigation.md, arch-state-management.md
```

### 再利用手順（4ステップ）

1. 対象コンポーネントの状態遷移図を作成し、タイムアウト状態を追加する。
2. 純粋関数（getAuthState 相当）で判定ロジックをテスタブルに実装する。
3. bypass 対象のビューを条件分岐で分離する（catch-all route パターン）。
4. P13/P39/P31 準拠でテストを実装する（fake timers + fireEvent + 個別セレクタ）。

---

## TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査教訓（2026-03-10）

### 苦戦箇所: Settings bypass と未認証 reset が相殺する

| 項目 | 内容 |
| --- | --- |
| 課題 | `currentView === "settings"` の bypass を入れても、未認証時 `setCurrentView("dashboard")` が残ると Settings へ到達しても即座に戻される |
| 再発条件 | bypass 判定と navigation reset 判定を別々の層で更新する |
| 対処 | `shouldResetUnauthenticatedView` を追加し、公開ビュー配列で `settings` を除外した |
| 標準ルール | 認証除外ビューを追加するときは「描画条件」と「reset 条件」を同時に監査する |

### 苦戦箇所: ユーザー明示の screenshot 要求に P53 代替を残してしまう

| 項目 | 内容 |
| --- | --- |
| 課題 | 既存成果物に「CLI なのでコード検証で代替」と残っていた |
| 再発条件 | screenshot 制約を一般ルールで処理し、ユーザー要求の優先度を下げる |
| 対処 | 専用 harness route と capture script で screenshot 4件を実取得し、Phase 11 文書を差し替えた |
| 標準ルール | ユーザーが screenshot を要求したら `screenshot-plan.json` / capture metadata / coverage validator まで完了させる |

### 苦戦箇所: worktree で optional dependency が欠ける

| 項目 | 内容 |
| --- | --- |
| 課題 | vitest / Playwright 起動前に Rollup optional dependency 欠損で失敗しうる |
| 再発条件 | 新しい worktree で install を省略する |
| 対処 | `pnpm install --frozen-lockfile` を先に実行した |
| 標準ルール | Phase 11/12 の再監査を始める前に install preflight を入れる |

### 同種課題の簡潔解決手順（4ステップ）

1. bypass 対象ビューがあるなら、描画条件と reset 条件を両方 `rg` で洗う。
2. screenshot 要求があるなら、専用 harness と capture metadata を先に作る。
3. worktree では `pnpm install --frozen-lockfile` を preflight として実行する。
4. workflow outputs、system spec、LOGS/SKILL を同一ターンで閉じる。

---
