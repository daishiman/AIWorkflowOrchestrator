# DEBT-SEC-001: State Parameter検証 実装ガイド

## メタ情報

| 項目         | 値                        |
| ------------ | ------------------------- |
| タスクID     | DEBT-SEC-001              |
| 機能名       | OAuth State Parameter検証 |
| 作成日       | 2026-02-06                |
| 対象レイヤー | Main Process（Electron）  |

---

## Part 1: 初学者・中学生レベル

### State Parameterって何？ — 図書館の貸出カードの例え

図書館で本を借りるとき、窓口で「貸出番号」をもらいます。本を返すとき、その番号を見せることで「本当にあなたが借りた本ですか？」と確認できます。

OAuth認証のState parameterも同じ仕組みです:

1. **ログインを始めるとき**: アプリが「確認番号」（state）を発行します
2. **ログインが完了したとき**: Google等から「ログイン完了通知」が返ってきます。この通知には「確認番号」が含まれています
3. **照合する**: アプリは「この確認番号、さっき自分が発行したものと合っているかな？」とチェックします

もし誰かが偽の「ログイン完了通知」を送ってきても、確認番号が合わないので見破れるのです。

### なぜ必要なの？

悪意ある第三者が「偽のログイン完了通知」を送りつける攻撃があります。これを **CSRF攻撃**（クロスサイト・リクエスト・フォージェリ）と呼びます。

この攻撃が成功すると、あなたのアカウントに攻撃者のアカウントが紐付けられてしまう可能性があります。State parameterはこの攻撃を防ぐための「確認番号」です。

### 安全を守る3つのルール

1. **一度きり**: 確認番号は一度使ったら捨てます（ワンタイムユース）。同じ番号は二度と使えません
2. **期限付き**: 確認番号は10分で期限切れになります。古い番号は無効です
3. **ランダム**: 確認番号は推測不可能なランダムな文字列です（256ビットの乱数）

---

## Part 2: 開発者・技術者レベル

### アーキテクチャ概要

StateManagerはElectronのMain Process内でシングルトンとして動作します。OAuth認証フローにおけるCSRF攻撃（RFC 6749 Section 10.12）を防止するため、state parameterの生成・検証・有効期限管理を担当します。

```
[Renderer]                [Main Process]              [External]
    |                          |                          |
    |--auth:login(provider)--->|                          |
    |                    stateManager.generate(provider)  |
    |                          |---OAuth URL + state----->|
    |                          |                   [Google/GitHub]
    |                          |<--callback#state+token---|
    |                    stateManager.consumeState(state)  |
    |                          |                          |
    |<-AUTH_STATE_CHANGED------|                          |
```

**配置先**: `apps/desktop/src/main/infrastructure/stateManager.ts`

stateはメモリ内のMapに保存され、ディスクには永続化されません。アプリ再起動時にはMapが空になりますが、OAuth認証フロー中にアプリを再起動するケースは実用上発生しないため問題ありません。

### TypeScriptインターフェース

```typescript
/** OAuthプロバイダー種別 */
type OAuthProvider = "google" | "github" | "discord";

/** State保存エントリ */
interface StateEntry {
  state: string; // 64文字hex文字列
  provider: OAuthProvider;
  createdAt: number; // Date.now()
  expiresAt: number; // createdAt + STATE_EXPIRY_MS
}
```

### APIシグネチャ

| メソッド                                           | 戻り値    | 説明                                                |
| -------------------------------------------------- | --------- | --------------------------------------------------- |
| `generate(provider: OAuthProvider)`                | `string`  | stateを生成し、プロバイダーと紐付けてMapに保存      |
| `validate(state: string, provider: OAuthProvider)` | `boolean` | stateとプロバイダーの一致を検証（ワンタイムユース） |
| `consumeState(state: string)`                      | `boolean` | プロバイダー指定不要でstateを検証・消費             |
| `cleanup()`                                        | `void`    | 期限切れstateエントリを一括削除                     |
| `_reset()`                                         | `void`    | テスト用: 全stateをクリア                           |

### 設定パラメータ

| パラメータ      | 値              | 説明                                           |
| --------------- | --------------- | ---------------------------------------------- |
| STATE_EXPIRY_MS | 600,000（10分） | stateの有効期限（ミリ秒）                      |
| STATE_LENGTH    | 64文字          | crypto.randomBytes(32).toString("hex")の出力長 |

### エラーハンドリング

| パターン             | 検出条件                        | エラーコード           | ユーザーメッセージ                                           |
| -------------------- | ------------------------------- | ---------------------- | ------------------------------------------------------------ |
| state欠落            | `!state`                        | CSRF_VALIDATION_FAILED | 認証状態が無効または期限切れです。再度ログインしてください。 |
| state不正形式        | `!/^[a-f0-9]{64}$/.test(state)` | CSRF_VALIDATION_FAILED | 認証状態が無効または期限切れです。再度ログインしてください。 |
| state期限切れ/不存在 | `consumeState()` が `false`     | CSRF_VALIDATION_FAILED | 認証状態が無効または期限切れです。再度ログインしてください。 |

エラー発生時は `AUTH_STATE_CHANGED` イベントで `{ authenticated: false, error, errorCode }` を送出します。

### 認証フローとの統合

#### authHandlers.ts（state生成・URL付与）

`auth:login` IPCハンドラ内で、OAuth URL生成前にstateを生成し、`queryParams`に付与します:

```typescript
import { stateManager } from "../infrastructure/stateManager";

// State parameter生成（CSRF対策: DEBT-SEC-001）
const state = stateManager.generate(provider as OAuthProvider);
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider as OAuthProvider,
  options: {
    queryParams: { state },
    redirectTo: AUTH_REDIRECT_URL,
    skipBrowserRedirect: true,
  },
});
```

#### index.ts（コールバック受信・state検証）

`handleAuthCallback`関数内で、コールバックURLのハッシュフラグメントからstateを取得・検証します:

```typescript
import { stateManager } from "./infrastructure/stateManager";

const state = hashParams.get("state");

// state形式バリデーション
if (state && (typeof state !== "string" || !/^[a-f0-9]{64}$/.test(state))) {
  // CSRF_VALIDATION_FAILED エラー送出
  return;
}

// state検証（consumeStateでワンタイム消費）
if (!state || !stateManager.consumeState(state)) {
  // CSRF_VALIDATION_FAILED エラー送出
  return;
}
```

### セキュリティ設計

| 項目               | 実装                                     | 根拠                        |
| ------------------ | ---------------------------------------- | --------------------------- |
| エントロピー       | `crypto.randomBytes(32)` — 256bit乱数    | NIST SP 800-63B推奨         |
| 保存先             | メモリ内Map（ディスク永続化なし）        | 漏洩リスク最小化            |
| ワンタイムユース   | 検証成功時にMapから即座に削除            | リプレイ攻撃防止            |
| 有効期限           | 10分（STATE_EXPIRY_MS）                  | OAuth認証フローの妥当な期間 |
| 形式バリデーション | `/^[a-f0-9]{64}$/` で64文字hex形式を検証 | インジェクション防止        |
| RFC準拠            | RFC 6749 Section 10.12                   | OAuth 2.0セキュリティ要件   |

### テストカバレッジ

- テストケース: 21件（全PASS）
- Line Coverage: 100%
- Branch Coverage: 100%
- Function Coverage: 100%
- Statement Coverage: 100%
