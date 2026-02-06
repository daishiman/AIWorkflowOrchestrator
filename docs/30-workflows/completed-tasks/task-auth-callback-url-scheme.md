# 認証コールバックURLスキーム修正 - タスク実行仕様書

## メタ情報

```yaml
issue_number: 274
```

## ユーザーからの元の指示

```
認証機能のコールバックURLスキーム（aiworkflow://auth/callback）が
OSに登録されておらず、認証完了後にエラーが発生する問題を修正する。
現在は一時的に認証をスキップしているが、将来的に認証機能を復活させる必要がある。
```

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | TASK-AUTH-CALLBACK-001          |
| Worktreeパス | `.worktrees/task-{{timestamp}}` |
| ブランチ名   | `task-{{timestamp}}`            |
| タスク名     | 認証コールバックURLスキーム修正 |
| 分類         | バグ修正・機能改善              |
| 対象機能     | 認証                            |
| 優先度       | 中                              |
| 見積もり規模 | 中規模                          |
| ステータス   | 未実施                          |
| 作成日       | 2025-12-26                      |

---

## タスク概要

### 目的

Electron アプリケーションの OAuth 認証コールバックが正常に動作するよう、カスタムURLスキーム（`aiworkflow://`）をOSに登録し、認証フロー完了後にアプリケーションが正しくトークンを受け取れるようにする。

### 背景

現状、Supabase OAuth認証後のコールバックURL（`aiworkflow://auth/callback#access_token=...`）が、OSにURLスキームとして登録されていないため、以下のエラーが発生する：

```
URL aiworkflow://auth/callback#access_token=... を開くデフォルトのアプリケーションが設定されていません。
```

これにより、認証トークンがアプリケーションに戻らず、認証フローが完了しない。

**一時的な対策**:

- `devMockAuth.ts` の `isDevMode()` を強制的に `true` に設定
- モックユーザー（daishimanju@gmail.com）で認証をスキップ
- 実際のユーザーIDを保持して将来の認証機能復活に備える

### 最終ゴール

- カスタムURLスキーム `aiworkflow://` がOSに正しく登録される
- OAuth認証コールバックが正常に動作する
- 認証トークンがアプリケーションに正しく渡される
- 開発モードのモックユーザーから実際の認証フローに移行できる
- 既存のユーザーデータと連動する

### 成果物一覧

| 種別         | 成果物               | 配置先                                       |
| ------------ | -------------------- | -------------------------------------------- |
| 環境         | Git Worktree環境     | `.worktrees/task-{{timestamp}}`              |
| 機能         | URLスキーム登録機能  | `apps/desktop/electron-builder.config.js`    |
| 機能         | Deep Link ハンドラー | `apps/desktop/src/main/index.ts`             |
| 機能         | 認証コールバック処理 | `apps/desktop/src/main/ipc/authHandlers.ts`  |
| テスト       | URLスキームテスト    | `apps/desktop/src/**/*.test.ts`              |
| ドキュメント | 要件ドキュメント     | `docs/30-workflows/auth-callback-urlscheme/` |
| ドキュメント | 設計ドキュメント     | `docs/30-workflows/auth-callback-urlscheme/` |
| ドキュメント | 手動テストレポート   | `docs/30-workflows/auth-callback-urlscheme/` |
| PR           | GitHub Pull Request  | GitHub UI                                    |

---

## 参照ファイル

本仕様書のコマンド選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                  | 責務                               | 依存     |
| ------ | -------- | ----------------------------- | ---------------------------------- | -------- |
| T--1-1 | Phase -1 | Git Worktree環境作成・初期化  | Git Worktree環境の作成と初期化     | なし     |
| T-00-1 | Phase 0  | 機能要件定義                  | URLスキーム登録機能の要件を明文化  | T--1-1   |
| T-01-1 | Phase 1  | URLスキーム登録設計           | electron-builder設定の設計         | T-00-1   |
| T-01-2 | Phase 1  | Deep Linkハンドラー設計       | main プロセスでのURL受信処理設計   | T-00-1   |
| T-01-3 | Phase 1  | 認証コールバック処理設計      | トークン抽出・検証・状態更新の設計 | T-00-1   |
| T-02-1 | Phase 2  | 設計レビュー                  | 要件・設計の妥当性検証             | T-01-1~3 |
| T-03-1 | Phase 3  | URLスキームテスト作成         | URLスキーム登録の検証テスト作成    | T-02-1   |
| T-03-2 | Phase 3  | Deep Linkハンドラーテスト作成 | URL受信処理のテスト作成            | T-02-1   |
| T-03-3 | Phase 3  | 認証コールバックテスト作成    | トークン処理のテスト作成           | T-02-1   |
| T-04-1 | Phase 4  | URLスキーム登録実装           | electron-builder.config.js の設定  | T-03-1   |
| T-04-2 | Phase 4  | Deep Linkハンドラー実装       | mainプロセスのURL受信処理実装      | T-03-2   |
| T-04-3 | Phase 4  | 認証コールバック処理実装      | トークン抽出・検証・状態更新の実装 | T-03-3   |
| T-04-4 | Phase 4  | devMockAuth.ts 復元           | 一時的な修正を元に戻す             | T-04-1~3 |
| T-05-1 | Phase 5  | コードリファクタリング        | コード品質の改善                   | T-04-1~4 |
| T-06-1 | Phase 6  | 品質保証                      | テスト実行・品質チェック           | T-05-1   |
| T-07-1 | Phase 7  | 最終レビュー                  | 全体的な品質・整合性検証           | T-06-1   |
| T-08-1 | Phase 8  | 手動テスト検証                | OAuth認証フロー全体の手動確認      | T-07-1   |
| T-09-1 | Phase 9  | ドキュメント更新              | セキュリティガイドライン等の更新   | T-08-1   |
| T-10-1 | Phase 10 | コミット作成                  | 差分確認・コミット作成             | T-09-1   |
| T-10-2 | Phase 10 | PR作成                        | PR作成・CI確認                     | T-10-1   |

**総サブタスク数**: 20個

---

## 現在の状況（一時的な修正内容）

### 修正ファイル

**`apps/desktop/src/renderer/utils/devMockAuth.ts:22-31`**

```typescript
export function isDevMode(): boolean {
  // 本番環境では常にfalse
  if (import.meta.env.PROD) {
    return false;
  }

  // 🔧 一時的な修正: 開発環境では常に認証をスキップ
  // TODO: 認証機能を復活させる際にこの行を削除
  // 関連タスク: docs/30-workflows/unassigned-task/task-auth-callback-url-scheme.md
  return true;

  // ... 以下、本来のロジック（現在は到達不能）
}
```

**`apps/desktop/src/renderer/utils/devMockAuth.ts:82-90`**

```typescript
export const DEFAULT_MOCK_USER: MockUser = {
  id: "34d1ff23-db41-4201-9ede-4ba55b6ea202", // 実際のユーザーID
  email: "daishimanju@gmail.com", // 実際のメールアドレス
  displayName: "Daishi Manju",
  avatarUrl: null,
  provider: "google" as OAuthProvider,
  createdAt: new Date().toISOString(),
  lastSignInAt: new Date().toISOString(),
};
```

### 復元手順（将来のタスク実行時）

このタスクを実行する際は、以下の一時修正を元に戻す：

1. `devMockAuth.ts:31` の `return true;` を削除
2. その下のコメントアウトされていない本来のロジックを有効化
3. `DEFAULT_MOCK_USER` は実際のユーザーIDを保持（連動のため変更不要）

---

## Phase 0: 要件定義

### T-00-1: 機能要件定義

#### 目的

カスタムURLスキーム登録とOAuth認証コールバック処理の要件を明文化する。

#### 機能要件

| ID     | 要件                                                     | 優先度 |
| ------ | -------------------------------------------------------- | ------ |
| FR-001 | `aiworkflow://` URLスキームをOSに登録する                | 必須   |
| FR-002 | アプリケーション起動時にURLスキームを関連付ける          | 必須   |
| FR-003 | ブラウザからのコールバックURLを受信する                  | 必須   |
| FR-004 | URLからaccess_token、refresh_token、expires_atを抽出する | 必須   |
| FR-005 | 抽出したトークンをSupabaseセッションに設定する           | 必須   |
| FR-006 | 認証成功後にアプリケーションをフォアグラウンドに表示する | 必須   |
| FR-007 | 認証失敗時に適切なエラーメッセージを表示する             | 必須   |
| FR-008 | 既存のモックユーザー（daishimanju@gmail.com）と連動する  | 必須   |

#### 非機能要件

| ID      | 要件                                          | 基準値    |
| ------- | --------------------------------------------- | --------- |
| NFR-001 | コールバック処理のレスポンス                  | 500ms以内 |
| NFR-002 | トークン検証エラー時のフォールバック          | 必須      |
| NFR-003 | macOS、Windows、Linux でのURLスキーム登録対応 | 必須      |

#### スコープ定義

**含むもの**:

- electron-builder による URLスキーム登録
- main プロセスでの Deep Link ハンドラー実装
- 認証トークンの抽出・検証・保存
- エラーハンドリング

**含まないもの**:

- OAuth認証フロー自体の変更（Supabase側）
- 認証UI の変更
- 複数アカウントサポート（単一ユーザーのみ）

#### 成果物

| 成果物     | パス                                                                    | 内容                 |
| ---------- | ----------------------------------------------------------------------- | -------------------- |
| 要件定義書 | `docs/30-workflows/auth-callback-urlscheme/task-step00-requirements.md` | 機能要件・非機能要件 |

---

## Phase 1: 設計

### T-01-1: URLスキーム登録設計

#### Claude Code スラッシュコマンド

```
/ai:setup-electron-config
```

#### 目的

electron-builder 設定ファイルにカスタムURLスキームを登録する設計を行う。

#### 参照資料

- `apps/desktop/electron-builder.config.js` - 既存のElectron Builder設定
- Electron公式ドキュメント: [Custom Protocol](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)

#### 設計内容

**macOS**:

```json
{
  "protocols": [
    {
      "name": "AI Workflow Orchestrator",
      "schemes": ["aiworkflow"]
    }
  ]
}
```

**Windows**:

```json
{
  "protocols": {
    "name": "AI Workflow Orchestrator",
    "schemes": ["aiworkflow"]
  }
}
```

**Linux**:

```json
{
  "protocols": [
    {
      "name": "aiworkflow",
      "schemes": ["aiworkflow"]
    }
  ]
}
```

#### 成果物

| 成果物            | パス                                                                        | 内容                       |
| ----------------- | --------------------------------------------------------------------------- | -------------------------- |
| URLスキーム設計書 | `docs/30-workflows/auth-callback-urlscheme/task-step01-urlscheme-design.md` | electron-builder設定の設計 |

---

### T-01-2: Deep Linkハンドラー設計

#### Claude Code スラッシュコマンド

```
/ai:design-ipc-handler
```

#### 目的

main プロセスで `aiworkflow://` URL を受信し、renderer プロセスに転送する設計を行う。

#### 設計内容

**main プロセス（`apps/desktop/src/main/index.ts`）**:

```typescript
// macOS/Windows: second-instance イベント
app.on("second-instance", (event, commandLine) => {
  const url = commandLine.find((arg) => arg.startsWith("aiworkflow://"));
  if (url) {
    handleAuthCallback(url);
  }
});

// macOS: open-url イベント
app.on("open-url", (event, url) => {
  event.preventDefault();
  if (url.startsWith("aiworkflow://auth/callback")) {
    handleAuthCallback(url);
  }
});

function handleAuthCallback(url: string) {
  // URLからトークンを抽出
  // renderer プロセスに送信
  // ウィンドウをフォアグラウンドに表示
}
```

#### 成果物

| 成果物                     | パス                                                                       | 内容              |
| -------------------------- | -------------------------------------------------------------------------- | ----------------- |
| Deep Link ハンドラー設計書 | `docs/30-workflows/auth-callback-urlscheme/task-step01-deeplink-design.md` | URL受信処理の設計 |

---

### T-01-3: 認証コールバック処理設計

#### Claude Code スラッシュコマンド

```
/ai:design-business-logic
```

#### 目的

受信したURLからトークンを抽出し、Supabaseセッションに設定する処理を設計する。

#### 設計内容

**トークン抽出処理**:

```typescript
function extractTokensFromUrl(url: string): {
  access_token: string;
  refresh_token: string;
  expires_at: number;
} | null {
  const urlObj = new URL(url);
  const hash = urlObj.hash.substring(1); // # を除去
  const params = new URLSearchParams(hash);

  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  const expires_at = params.get("expires_at");

  if (!access_token || !refresh_token || !expires_at) {
    return null;
  }

  return {
    access_token,
    refresh_token,
    expires_at: parseInt(expires_at, 10),
  };
}
```

**Supabaseセッション設定**:

```typescript
async function setAuthSession(tokens: Tokens): Promise<void> {
  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  if (error) {
    throw new Error(`Auth session failed: ${error.message}`);
  }

  // ユーザー情報を取得
  const user = data.user;

  // Store に保存（既存のユーザーIDと連動）
  // daishimanju@gmail.com のユーザー情報と一致させる
}
```

#### 成果物

| 成果物                     | パス                                                                       | 内容               |
| -------------------------- | -------------------------------------------------------------------------- | ------------------ |
| 認証コールバック処理設計書 | `docs/30-workflows/auth-callback-urlscheme/task-step01-callback-design.md` | トークン処理の設計 |

---

## Phase 2: 設計レビューゲート

### T-02-1: 設計レビュー

#### Claude Code スラッシュコマンド

```
/ai:review-architecture
```

#### レビューチェックリスト

**セキュリティ**

- [ ] トークンの安全な抽出・検証が設計されている
- [ ] CSRF攻撃への対策がある
- [ ] URLパラメータのバリデーションがある

**プラットフォーム互換性**

- [ ] macOS、Windows、Linux で動作する設計である
- [ ] 各OSの仕様差異が考慮されている

**エラーハンドリング**

- [ ] トークン抽出失敗時の処理が設計されている
- [ ] ネットワークエラー時の処理が設計されている

---

## Phase 3-10: 実装・テスト・PR作成

（以下、標準的なTDDフロー・品質保証・最終レビュー・手動テスト・ドキュメント更新・PR作成のフェーズ）

詳細は `docs/00-requirements/task-orchestration-specification.md` の標準フローを参照。

---

## 完了条件チェックリスト

### 機能実装

- [ ] `aiworkflow://` URLスキームがOSに登録される
- [ ] OAuth認証コールバックが正常に動作する
- [ ] 認証トークンがアプリケーションに渡される
- [ ] 既存のユーザーデータ（daishimanju@gmail.com）と連動する
- [ ] devMockAuth.ts の一時修正が元に戻されている

### 品質保証

- [ ] すべてのテストが成功している
- [ ] 型チェックが成功している
- [ ] macOS、Windows、Linux でURLスキームが動作する

### ドキュメント

- [ ] セキュリティガイドラインが更新されている
- [ ] 認証フローのドキュメントが更新されている

### PR

- [ ] PRが作成されている
- [ ] CI/CDが成功している

---

## リスクと対策

| リスク                            | 影響度 | 対策                                 |
| --------------------------------- | ------ | ------------------------------------ |
| OS間でのURLスキーム登録方法の差異 | 高     | 各OSごとのテストを実施               |
| 既存の認証セッションとの競合      | 中     | セッション上書きロジックの慎重な実装 |
| ブラウザのリダイレクトタイミング  | 中     | アプリ起動待機処理の実装             |
| トークンの有効期限切れ            | 低     | refresh_token による自動更新実装     |

---

## 技術参考資料

### Electron公式ドキュメント

- [Custom Protocol Handler](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)
- [Deep Linking](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)

### Supabase公式ドキュメント

- [OAuth with PKCE flow](https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr)
- [Session Management](https://supabase.com/docs/reference/javascript/auth-setsession)

### electron-builder

- [Protocol Schemes Configuration](https://www.electron.build/configuration/configuration#Configuration-protocols)

---

## 備考

### 一時的な修正の復元方法

本タスク実行時は、以下の手順で一時修正を復元する：

1. `devMockAuth.ts:31` の `return true;` を削除
2. 下記のコードのコメントアウトを解除（現在はunreachable code）
   ```typescript
   // E2E環境フラグ
   if (import.meta.env.VITE_E2E_MODE === "true") {
     return true;
   }
   // ... 以下続く
   ```

### 関連する既存実装

- `apps/desktop/src/renderer/components/AuthGuard/index.tsx` - 認証ガードコンポーネント
- `apps/desktop/src/renderer/views/AuthView/index.tsx` - 認証画面
- `apps/desktop/src/main/ipc/authHandlers.ts` - 認証IPCハンドラー
- `apps/desktop/src/renderer/store/slices/authSlice.ts` - 認証状態管理

---

## 優先度の理由

**中優先度**としている理由:

1. **現在の回避策が機能している**: モックユーザーで開発・テストが可能
2. **他の機能実装が優先**: システムプロンプト機能など、コア機能の実装を優先
3. **将来的には必須**: 本番リリース前には必ず修正が必要

---

## 関連タスク

- `task-chat-system-prompt.md` - システムプロンプト設定機能（本タスクの前提）
- 将来の認証機能拡張タスク（複数アカウント、SSO等）
