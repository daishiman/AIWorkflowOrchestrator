# auth-callback-urlscheme - 実装ガイド

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-06              |
| 対象読者 | 開発者・技術者・学習者  |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. PKCE認証フローって何？

### 1.1 身近な例で考えてみよう

**宅配便の受け取りに例えてみよう。**

今までのやり方（Implicit Flow）は、配達員が「〇〇さんの荷物です」と言ったら、玄関にいる人が誰でも受け取れてしまう仕組みでした。これだと、家の前を通りかかった人が横取りできてしまいます。

新しいやり方（PKCE）は、こんな仕組みです：

```
1. 注文するとき、自分だけが知っている「合言葉」を決める
   （例: 「青い空の下で」）

2. お店には「合言葉のヒント」だけを伝える
   （例: 合言葉をSHA-256で暗号化した文字列）

3. 荷物が届いたら、自分が「合言葉」を言う
   → お店が「ヒント」と照合して、本人確認完了！

4. 合言葉を知らない第三者は荷物を受け取れない
```

| 日本語             | 英語                 | 宅配便の例え                           |
| ------------------ | -------------------- | -------------------------------------- |
| 合言葉             | code_verifier        | 「青い空の下で」（自分だけが知る秘密） |
| 合言葉のヒント     | code_challenge       | 合言葉を暗号化したもの（お店に渡す）   |
| 引換券             | authorization_code   | 荷物と交換する伝票                     |
| 注文番号           | state parameter      | 自分の注文を識別する番号               |
| 自分だけの郵便受け | ローカルHTTPサーバー | 家の前に設置した専用受取ボックス       |

### 1.2 なぜ変更が必要だったの？

以前の方式（Implicit Flow）にはセキュリティ上の問題がありました：

- ❌ **悪い例（以前）**: ログイン情報がURLの中に丸見え（`#access_token=xxx`）。ブラウザの履歴やリファラーから盗まれる可能性がある
- ⭕ **良い例（今回）**: 一時的な「引換券（authorization_code）」だけがURLに含まれる。引換券は「合言葉」を知っている人だけが使える

### 1.3 今回作ったもの

| 日本語       | 英語                    | 役割                                              |
| ------------ | ----------------------- | ------------------------------------------------- |
| 合言葉生成器 | pkce.ts                 | 暗号化された合言葉（code_verifier）とヒントを作る |
| 専用郵便受け | authCallbackServer.ts   | 自分だけの受取ボックスで認証結果を受け取る        |
| 全体の司令塔 | authFlowOrchestrator.ts | 注文→受取→本人確認の全工程を管理する              |
| 住所検証     | customProtocol.ts       | 正しい住所（URL）からの荷物だけを受け取る         |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
ユーザーが「Googleでログイン」ボタンを押す
    ↓
[Step 1] アプリが「合言葉」と「注文番号」を作る
    ↓
[Step 2] アプリが「専用郵便受け」を設置する（HTTPサーバー起動）
    ↓
[Step 3] Google の認証ページをブラウザで開く
         （合言葉のヒントと注文番号を一緒に送る）
    ↓
[Step 4] ユーザーが Google にログインを許可する
    ↓
[Step 5] Google が「引換券」を「専用郵便受け」に届ける
    ↓
[Step 6] アプリが注文番号を確認し、合言葉で引換券を交換する
    ↓
[Step 7] ログイン完了！アプリが前面に表示される
```

### 2.2 セキュリティの仕組み

| 守りたいもの     | 攻撃手法            | 対策                                    |
| ---------------- | ------------------- | --------------------------------------- |
| 引換券の横取り   | 通信傍受            | 合言葉（PKCE）で本人しか使えない        |
| 偽の認証応答     | CSRF攻撃            | 注文番号（State parameter）で正当性確認 |
| 不正なURL        | URLインジェクション | 許可リスト方式でURLを厳密検証           |
| 郵便受けの覗き見 | ネットワーク盗聴    | 127.0.0.1（自分のPC内部）だけに限定     |

---

## 3. 作ったものの全体像

```
┌──────────────────────┐
│  Renderer Process    │←── ユーザーがボタンを押す
│  （画面の表示担当）    │
└──────────────────────┘
        ↑ IPC通信 ↓
┌──────────────────────┐
│  Main Process        │←── 認証フローの全工程を管理
│  ┌────────────────┐  │
│  │ Orchestrator   │  │←── 司令塔：全体を統合制御
│  ├────────────────┤  │
│  │ PKCE Generator │  │←── 合言葉の生成
│  ├────────────────┤  │
│  │ HTTP Server    │  │←── 専用郵便受け（127.0.0.1）
│  ├────────────────┤  │
│  │ Protocol       │  │←── URLの検証（ホワイトリスト）
│  └────────────────┘  │
└──────────────────────┘
        ↑ HTTPS ↓
┌──────────────────────┐
│  外部ブラウザ        │←── Google認証ページ
│  （Chrome/Safari等）  │
└──────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
apps/desktop/src/main/auth/
├── pkce.ts                    # PKCE code_verifier/code_challenge生成
├── authCallbackServer.ts      # ローカルHTTPサーバー
├── authFlowOrchestrator.ts    # 認証フロー統合制御
└── __tests__/
    ├── pkce.test.ts                   # PKCE単体テスト (21件)
    ├── authCallbackServer.test.ts      # HTTPサーバーテスト (16件)
    ├── authFlowOrchestrator.test.ts    # オーケストレーターテスト (14件)
    └── auth-ipc-integration.test.ts    # IPC統合テスト (6件)

apps/desktop/src/main/protocol/
├── customProtocol.ts          # カスタムプロトコルハンドラー
└── customProtocol.test.ts     # プロトコルテスト (11件)

packages/shared/types/
└── auth.ts                    # PKCEPair, AuthCallbackResult型定義
```

### 1.2 データモデル

```
PKCEPair
├── codeVerifier: string  - RFC 7636準拠ランダム文字列（43-128文字）
└── codeChallenge: string - SHA-256(codeVerifier) → Base64URLエンコード

AuthCallbackResult
├── code: string  - authorization_code（Supabase発行）
└── state: string - CSRF対策用State parameter

PendingAuthFlow (内部状態)
├── state: string            - State parameter値
├── codeVerifier: string     - 対応するcode_verifier
├── server: AuthCallbackServer - 対応するHTTPサーバー
└── createdAt: number        - 作成タイムスタンプ（TTL管理用）
```

---

## 2. 設計判断の根拠

### 2.1 重要な設計判断

| 設計判断                  | 選択肢                         | 採用理由                                                  |
| ------------------------- | ------------------------------ | --------------------------------------------------------- |
| 認証フロー方式            | PKCE vs Implicit Flow          | PKCE: トークン漏洩リスク排除、RFC 7636準拠                |
| コールバック受信          | HTTPサーバー vs ディープリンク | HTTPサーバー: 確実な制御、パラメータ検証が容易            |
| サーバーバインドアドレス  | 127.0.0.1 vs 0.0.0.0           | 127.0.0.1: 外部アクセス不可、セキュリティ要件             |
| ポート割り当て            | 固定ポート vs 動的割り当て     | 動的: ポート競合回避、OS自動割り当て（port=0）            |
| State生成                 | UUID vs crypto.randomBytes     | crypto.randomBytes(32): 256ビットエントロピー、推測不可能 |
| code_verifier長           | 43文字 vs 64文字               | 64文字: RFC 7636範囲内でセキュリティマージン確保          |
| カスタムプロトコルURL検証 | substring vs exactMatch        | exactMatch: パス拡張攻撃を防止                            |

### 2.2 カスタムプロトコルURLパース（実装上の重要な注意点）

**落とし穴**: `new URL("aiworkflow://auth/callback")` は RFC 3986 の authority component 解析により、以下のように**誤った**パースをする：

```typescript
const url = new URL("aiworkflow://auth/callback");
// url.hostname === "auth"    ← "auth" がホスト名と解釈される
// url.pathname === "/callback" ← "/callback" だけがパス
// 期待値: pathname === "/auth/callback"
```

**対策**: `extractProtocolPath()` で手動パースを実装：

```typescript
// なぜnew URL()を使わないか: カスタムプロトコルでauthorityが誤解釈されるため
function extractProtocolPath(url: string): string | null {
  const prefix = `${CUSTOM_PROTOCOL}://`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length);
  const pathOnly = rest.split("?")[0].split("#")[0];
  return `/${pathOnly}`;
}
```

---

## 3. 型定義

### 3.1 PKCEPair（packages/shared/types/auth.ts）

```typescript
export interface PKCEPair {
  codeVerifier: string; // RFC 7636 Section 4.1: [A-Za-z0-9\-._~]{43,128}
  codeChallenge: string; // BASE64URL(SHA256(codeVerifier))
}
```

### 3.2 AuthCallbackResult（packages/shared/types/auth.ts）

```typescript
export interface AuthCallbackResult {
  code: string; // authorization_code（Supabase発行、一回限り使用）
  state: string; // CSRF対策パラメータ（送信時と一致必須）
}
```

### 3.3 AuthCallbackServer（apps/desktop/src/main/auth/authCallbackServer.ts）

```typescript
export interface AuthCallbackServer {
  start(): Promise<{ port: number }>; // HTTPサーバー起動、割り当てポート返却
  stop(): Promise<void>; // HTTPサーバー停止、リソース解放
  waitForCallback(): Promise<AuthCallbackResult>; // コールバック待機（5分タイムアウト）
  readonly isRunning: boolean; // サーバー動作状態
}
```

### 3.4 OAuthProvider（packages/shared/types/auth.ts）

```typescript
export type OAuthProvider = "google" | "github" | "discord";
```

---

## 4. 使用例

### 4.1 PKCE生成

```typescript
import {
  generatePKCEPair,
  generateCodeVerifier,
  calculateCodeChallenge,
} from "./auth/pkce";

// ペア生成（推奨）
const pair = generatePKCEPair();
// pair.codeVerifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk..."
// pair.codeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

// カスタム長指定
const customPair = generatePKCEPair(128); // 最大長

// RFC 7636範囲外はRangeErrorをスロー
generateCodeVerifier(42); // RangeError: code_verifier length must be between 43 and 128
generateCodeVerifier(129); // RangeError: 同上
```

### 4.2 HTTPサーバー起動

```typescript
import { createAuthCallbackServer } from "./auth/authCallbackServer";

const server = createAuthCallbackServer({ timeoutMs: 300_000 }); // 5分
const { port } = await server.start();
// port: 54321 (OS自動割り当て)

// コールバック待機（非同期）
const result = await server.waitForCallback();
// result: { code: "auth_code_xxx", state: "random_state_xxx" }

await server.stop();
```

### 4.3 オーケストレーター呼び出し

```typescript
import { AuthFlowOrchestrator } from "./auth/authFlowOrchestrator";

const orchestrator = new AuthFlowOrchestrator(
  supabase,
  mainWindow,
  secureStorage,
);

// fire-and-forget パターン（IPC ハンドラから呼び出し）
orchestrator.startOAuthFlow("google").catch((err) => {
  console.error("[Auth] OAuth flow failed:", sanitizeErrorMessage(err));
});

// リソース解放
await orchestrator.dispose();
```

---

## 5. 設定値一覧

| 設定項目              | 値                | 変更可否 | 備考                     |
| --------------------- | ----------------- | -------- | ------------------------ |
| HTTPサーバーホスト    | `127.0.0.1`       | 不可     | セキュリティ要件         |
| HTTPサーバーポート    | 動的割り当て（0） | 不可     | OS自動割り当て           |
| 認証タイムアウト      | 300,000ms（5分）  | 可       | `DEFAULT_TIMEOUT_MS`     |
| PKCE code_verifier長  | 64文字            | 可       | 43-128の範囲（RFC 7636） |
| State parameterサイズ | 32バイト          | 不可     | 256ビットエントロピー    |
| State有効期限         | 5分               | 可       | `STATE_TTL_MS`           |

---

## 6. テスト構成

| テストファイル               | テスト数 | カバー範囲                         |
| ---------------------------- | -------- | ---------------------------------- |
| pkce.test.ts                 | 21       | PKCE生成・検証・エッジケース       |
| authCallbackServer.test.ts   | 16       | HTTPサーバー起動・停止・受信       |
| authFlowOrchestrator.test.ts | 14       | フロー全体・エラー・クリーンアップ |
| auth-ipc-integration.test.ts | 6        | IPC経由の認証フロー統合テスト      |
| customProtocol.test.ts       | 11       | URL検証・パス拡張攻撃防止          |
| **合計**                     | **68**   |                                    |

---

## 7. 使用上の注意

### 7.1 カスタムプロトコルのURLパース

```typescript
// ❌ 使用禁止: new URL() はカスタムプロトコルで誤解釈する
const url = new URL("aiworkflow://auth/callback");
url.pathname; // "/callback" ← 期待値は "/auth/callback"

// ⭕ 正しい使い方: extractProtocolPath() を使う
const path = extractProtocolPath("aiworkflow://auth/callback");
// path: "/auth/callback" ← 正しくパースされる
```

### 7.2 State parameterの有効期限

```typescript
// ❌ State生成から5分以上経過した認証フローは無効
// cleanupExpiredFlows() が自動的に期限切れフローを削除

// ⭕ 新しいフロー開始時に期限切れフローをクリーンアップ
this.cleanupExpiredFlows();
await this.cancelExistingFlows(); // 既存フローもキャンセル
```

### 7.3 XSS防止

```typescript
// ❌ テンプレートリテラルに直接ユーザー入力を埋め込まない
const html = `<p>エラー: ${message}</p>`;

// ⭕ escapeHtml() でサニタイズしてから埋め込む
const html = `<p>エラー: ${escapeHtml(message)}</p>`;
```

---

## 8. 実装時の苦戦ポイントと教訓

### 8.1 カスタムプロトコルURLのパース問題

**問題**: `new URL("aiworkflow://auth/callback")` が `hostname: "auth"`, `pathname: "/callback"` とパースされる。RFC 3986の authority component 規則により、`://` 直後の文字列がホスト名として解釈される。

**教訓**: カスタムプロトコル（`http://` や `https://` 以外）のURL処理では、標準の `new URL()` パーサーに依存しない。プロトコルプレフィックスを除去して手動でパスを抽出するヘルパー関数を作成する。

**テストで発見**: パス拡張攻撃（`aiworkflow://auth/callbackextra`）や パストラバーサル攻撃（`aiworkflow://auth/callback/../../secret`）が `url.includes()` 方式では検出できないことが判明。`extractProtocolPath()` + `ALLOWED_PATHS.includes()` の完全一致で対策。

### 8.2 PKCE定数の未使用問題

**問題**: `CODE_VERIFIER_MIN_LENGTH` / `CODE_VERIFIER_MAX_LENGTH` を定数として宣言したが、バリデーションロジックが存在しなかった（デッドコード）。

**教訓**: RFC準拠の定数を宣言した場合、対応するバリデーション関数を同時に実装する。`validateVerifierLength()` を追加し、定数を防御的バリデーションに活用した。

### 8.3 規則ファイルとシステム仕様書の同期

**問題**: `.claude/rules/04-electron-security.md` がシステム仕様書（`references/`）の「正本」から派生しているが、自動同期の仕組みがない。PKCE実装完了後も規則ファイル側が「Implicit Flow」のままだった。

**教訓**: 実装完了時に、影響する全ての層（コード → テスト → システム仕様書 → 規則ファイル → 未タスクステータス）を更新するチェックリストを厳密に実行する。

---

## 9. 次のステップ

| タスクID | タスク名                           | 相対パス                                                             | 状態   |
| -------- | ---------------------------------- | -------------------------------------------------------------------- | ------ |
| VAL-001  | 本番環境カスタムプロトコル動作検証 | docs/30-workflows/unassigned-task/task-auth-production-validation.md | 未実施 |

---

## 10. 用語集

| 用語                    | 読み方                       | 説明                                                                            |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| PKCE                    | ピクシー                     | Proof Key for Code Exchange。OAuth認証の安全性を高めるRFC 7636標準。合言葉方式  |
| code_verifier           | コードベリファイア           | PKCE認証で使う秘密の合言葉。43-128文字のランダム文字列                          |
| code_challenge          | コードチャレンジ             | code_verifierをSHA-256ハッシュ化したもの。認証サーバーに渡す「ヒント」          |
| authorization_code      | 認可コード                   | 認証サーバーが発行する一時的な引換券。code_verifierと組み合わせてトークンに交換 |
| State parameter         | ステートパラメータ           | CSRF攻撃対策の注文番号。リクエストとレスポンスの対応を検証する                  |
| Implicit Flow           | インプリシットフロー         | 旧方式。トークンがURLフラグメントに直接含まれる。セキュリティリスクあり         |
| Authorization Code Flow | 認可コードフロー             | 新方式。認可コードを中間トークンとして使い、サーバー側でトークン交換する        |
| Base64URL               | ベース64ユーアールエル       | URLに安全な文字だけを使うエンコード方式。`+` → `-`, `/` → `_`, `=` 除去         |
| CSRF                    | シーエスアールエフ           | Cross-Site Request Forgery。偽のリクエストを送り付ける攻撃                      |
| XSS                     | クロスサイトスクリプティング | HTMLに悪意のあるスクリプトを注入する攻撃。escapeHtml()で防止                    |
| Supabase                | スパベース                   | バックエンドサービス。認証・データベース・ストレージを提供するBaaS              |
| contextBridge           | コンテキストブリッジ         | ElectronのRendererとMainプロセス間を安全に接続するAPI                           |
| IPC                     | アイピーシー                 | Inter-Process Communication。Electronの2つのプロセス間通信の仕組み              |
