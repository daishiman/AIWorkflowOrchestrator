# 実装ガイド: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスクID | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名 | Claude Agent SDK用認証キー管理基盤の構築 |
| Phase    | 12 (ドキュメント更新)                    |
| 作成日   | 2026-02-08                               |

---

# Part 1: 概念的説明（中学生レベル）

## 1.1 この機能って何？

### 日常の例えで説明

想像してみてください。あなたは銀行の金庫室を持っていて、その中に大切な「秘密の鍵」を保管しています。

**認証キー**は、まさにこの「秘密の鍵」のようなものです。

- **Anthropic API Key** = 銀行のVIP専用ルームに入るためのカードキー
- このカードキーがあると、Claude（AI）と話すことができる
- カードキーがなければ、「あなたは誰ですか？」と門前払いされる

### なぜ保護が必要？

この秘密の鍵を誰かに見られてしまうと...

- 他の人があなたのフリをしてClaude AIを使える
- あなたの使用料金が勝手に増える
- 悪意のある人に悪用されるかもしれない

だから、この「秘密の鍵」は**金庫**に入れて、**鍵をかけて**保管する必要があるのです。

---

## 1.2 どうやって守っているの？

### 金庫室の仕組み

```
┌─────────────────────────────────────────────────────────────┐
│                    あなたのパソコン                           │
│                                                              │
│  ┌──────────────────┐     ┌──────────────────────────────┐  │
│  │   来客スペース    │     │        金庫室               │  │
│  │   (Renderer)     │     │       (Main Process)        │  │
│  │                  │     │                              │  │
│  │  「APIキーを     │ 小窓 │  ┌─────────────────────┐     │  │
│  │   設定したい」  ─────────  │ 指紋認証付き金庫    │     │  │
│  │                  │ (IPC)│  │  (safeStorage)      │     │  │
│  │  「設定できた    │◄─────── │                     │     │  │
│  │   よ！」        │     │  │  [暗号化された鍵]   │     │  │
│  │                  │     │  └─────────────────────┘     │  │
│  └──────────────────┘     └──────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3つの大切な場所

| 場所             | 日常の例え         | 役割                                       |
| ---------------- | ------------------ | ------------------------------------------ |
| **来客スペース** | リビングルーム     | ユーザーが操作する画面。金庫には触れない   |
| **金庫室**       | 銀行の地下金庫室   | 秘密の鍵を安全に保管。本人確認も行う       |
| **小窓（IPC）**  | 銀行の窓口         | 来客スペースと金庫室の間の安全な受け渡し口 |
| **指紋認証金庫** | 指紋認証付きの金庫 | OSレベルで暗号化。本人しか開けられない     |

---

## 1.3 具体的な流れ

### シナリオ: APIキーを設定する

```
1. あなた「APIキーを保存して」と画面で入力

2. 来客スペース（Renderer）
   「わかりました！金庫室に伝えますね」
   ↓
   小窓（IPC）から金庫室へ伝言

3. 金庫室（Main Process）
   「了解。まず、本当にこのアプリからの依頼？」
   → 本人確認OK
   「よし、指紋認証金庫に入れるね」
   → 暗号化して保存完了

4. 金庫室 → 小窓 → 来客スペース
   「保存できたよ！」

5. あなたの画面に「設定完了」と表示
```

### シナリオ: AIを使う時

```
1. あなた「Claude AIに質問したい」

2. 金庫室（Main Process）
   「AIと話すには鍵が必要だな」
   → 指紋認証金庫から鍵を取り出す
   → 鍵を使ってAnthropicのサーバーへ
   → AIからの返答を受け取る

3. 来客スペースへは返答だけを渡す
   （鍵の中身は絶対に渡さない！）
```

---

## 1.4 セキュリティのポイント

### 絶対に守ること

| ルール                         | 理由                                 |
| ------------------------------ | ------------------------------------ |
| 鍵は来客スペースに見せない     | 画面に表示すると他の人に見られるかも |
| 鍵はログに書かない             | ログファイルを見られたら鍵がバレる   |
| 小窓経由以外で金庫室に入れない | 正規ルート以外は危険                 |
| 依頼者の本人確認を毎回する     | なりすましを防ぐ                     |

### 万が一の対策

- **パソコンが暗号化非対応の場合**: 警告を出して、それでも保存するか確認
- **環境変数にキーがある場合**: そちらを使う（開発者向けの裏口）
- **キーが間違っている場合**: Anthropicサーバーに確認してからエラーを返す

---

## 1.5 用語集

| 用語              | 読み方                           | 意味                                              |
| ----------------- | -------------------------------- | ------------------------------------------------- |
| Anthropic API Key | アンスロピック エーピーアイ キー | Claude AIを使うためのパスワードのようなもの       |
| safeStorage       | セーフストレージ                 | OSレベルで暗号化してくれる安全な保管庫            |
| Main Process      | メインプロセス                   | アプリの「金庫室」部分。システム操作ができる      |
| Renderer          | レンダラー                       | アプリの「来客スペース」部分。画面表示を担当      |
| IPC               | アイピーシー                     | Inter-Process Communication。プロセス間の「小窓」 |
| electron-store    | エレクトロン ストア              | 設定を保存するためのファイルベースの保管庫        |
| PKCE              | ピーケーシーイー                 | 認証の安全性を高める仕組み（別の認証で使用）      |

---

# Part 2: 開発者向け実装詳細

## 2.1 アーキテクチャ概要

### レイヤー構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  React UI                                                      │  │
│  │  window.electronAPI.authKey.set(key)                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ IPC (invoke)
┌─────────────────────────────────────────────────────────────────────┐
│                         Preload (Bridge)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  contextBridge.exposeInMainWorld("electronAPI", { authKey })  │  │
│  │  ipcRenderer.invoke(AUTH_KEY_CHANNELS.SET, { key })           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ ipcMain.handle
┌─────────────────────────────────────────────────────────────────────┐
│                          Main Process                                │
│  ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐  │
│  │ authKeyHandlers│───▶│  AuthKeyService  │───▶│  safeStorage    │  │
│  │ (IPC Handler)  │    │  (Service)       │    │  (Encryption)   │  │
│  └────────────────┘    └──────────────────┘    └─────────────────┘  │
│           │                     │                      │            │
│           │                     │                      ▼            │
│           │                     │            ┌─────────────────┐    │
│           │                     └───────────▶│  electron-store │    │
│           │                                  │  (Persistence)  │    │
│           │                                  └─────────────────┘    │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  SkillExecutor                                              │    │
│  │  - getApiKey() で認証キーを取得                              │    │
│  │  - callSDKQuery() で Anthropic API を呼び出し                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2.2 クラス図

### AuthKeyService

```
┌──────────────────────────────────────────────────────────────┐
│                    <<interface>>                             │
│                    IAuthKeyService                           │
├──────────────────────────────────────────────────────────────┤
│ + setKey(key: string): Promise<void>                         │
│ + getKey(): Promise<string | null>                           │
│ + hasKey(): Promise<boolean>                                 │
│ + validateKey(key: string): Promise<boolean>                 │
│ + deleteKey(): Promise<void>                                 │
└──────────────────────────────────────────────────────────────┘
                            △
                            │ implements
┌──────────────────────────────────────────────────────────────┐
│                      AuthKeyService                          │
├──────────────────────────────────────────────────────────────┤
│ - storage: IAuthKeyStorage                                   │
│ - cachedKey: string | null                                   │
├──────────────────────────────────────────────────────────────┤
│ + constructor(storage?: IAuthKeyStorage)                     │
│ + setKey(key: string): Promise<void>                         │
│ + getKey(): Promise<string | null>                           │
│ + hasKey(): Promise<boolean>                                 │
│ + validateKey(key: string): Promise<boolean>                 │
│ + deleteKey(): Promise<void>                                 │
│ - validateKeyFormat(key: string): void                       │
│ - getFromEnvironment(): string | null                        │
└──────────────────────────────────────────────────────────────┘
```

### IAuthKeyStorage

```
┌──────────────────────────────────────────────────────────────┐
│                    <<interface>>                             │
│                    IAuthKeyStorage                           │
├──────────────────────────────────────────────────────────────┤
│ + store(key: string): Promise<void>                          │
│ + retrieve(): Promise<string | null>                         │
│ + delete(): Promise<void>                                    │
│ + exists(): Promise<boolean>                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 2.3 IPC チャンネル一覧

| チャンネル名        | 方向            | 説明                 | リクエスト        | レスポンス            |
| ------------------- | --------------- | -------------------- | ----------------- | --------------------- |
| `auth-key:set`      | Renderer → Main | 認証キー設定         | `{ key: string }` | `{ success, error? }` |
| `auth-key:exists`   | Renderer → Main | 認証キー存在確認     | なし              | `{ exists: boolean }` |
| `auth-key:validate` | Renderer → Main | Anthropic API で検証 | `{ key: string }` | `{ valid, error? }`   |
| `auth-key:delete`   | Renderer → Main | 認証キー削除         | なし              | `{ success, error? }` |

**セキュリティ注意**: `auth-key:get` チャンネルは**意図的に存在しません**。認証キーの値を Renderer に送信することはセキュリティリスクとなるためです。

---

## 2.4 シーケンス図: 認証キー設定フロー

```
┌─────────┐     ┌─────────┐     ┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│   UI    │     │ Preload │     │ authKeyHandlers │     │AuthKeyService│    │ safeStorage  │
└────┬────┘     └────┬────┘     └────────┬────────┘     └──────┬──────┘     └──────┬───────┘
     │               │                   │                     │                   │
     │ set(key)      │                   │                     │                   │
     │──────────────>│                   │                     │                   │
     │               │ invoke(SET,{key}) │                     │                   │
     │               │──────────────────>│                     │                   │
     │               │                   │                     │                   │
     │               │                   │ validateIpcSender() │                   │
     │               │                   │─────────────────────│                   │
     │               │                   │                     │                   │
     │               │                   │ setKey(key)         │                   │
     │               │                   │────────────────────>│                   │
     │               │                   │                     │                   │
     │               │                   │                     │ validateFormat()  │
     │               │                   │                     │──────────────────>│
     │               │                   │                     │                   │
     │               │                   │                     │ store(encrypted)  │
     │               │                   │                     │──────────────────>│
     │               │                   │                     │                   │
     │               │                   │                     │<── void ──────────│
     │               │                   │<─── void ───────────│                   │
     │               │<── {success:true} │                     │                   │
     │<── resolved ──│                   │                     │                   │
```

---

## 2.5 SkillExecutor への統合

### 変更点

```typescript
// コンストラクタ
class SkillExecutor {
  private authKeyService?: IAuthKeyService;

  constructor(
    mainWindow: BrowserWindow,
    permissionStore: PermissionStore,
    authKeyService?: IAuthKeyService, // 新規追加（オプショナル）
  ) {
    this.authKeyService = authKeyService;
  }
}
```

### APIキー取得優先順位

```typescript
private async getApiKey(): Promise<string | null> {
  // 1. AuthKeyService から取得（最優先）
  if (this.authKeyService) {
    try {
      const key = await this.authKeyService.getKey();
      if (key) return key;
    } catch (error) {
      console.warn('[SkillExecutor] AuthKeyService error, falling back to env');
    }
  }

  // 2. 環境変数フォールバック
  return process.env.ANTHROPIC_API_KEY || null;
}
```

### SDK 呼び出し時のエラーハンドリング

```typescript
private async callSDKQuery(/* params */): Promise<SkillResult> {
  const apiKey = await this.getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Anthropic API key is not configured',
      },
    };
  }

  // SDK 呼び出し...
}
```

---

## 2.6 エラーハンドリングパターン

### エラーコード定義

```typescript
export const AUTH_KEY_ERROR_CODES = {
  /** 認証キー未設定 */
  NOT_SET: 3001,
  /** 認証キー無効 */
  INVALID: 3002,
  /** バリデーションエラー */
  VALIDATION_FAILED: 3003,
  /** 暗号化不可 */
  ENCRYPTION_UNAVAILABLE: 4001,
  /** ストレージエラー */
  STORAGE_ERROR: 4002,
  /** ネットワークエラー */
  NETWORK_ERROR: 3004,
} as const;
```

### エラーカテゴリ

| カテゴリ               | コード範囲 | リトライ可能 |
| ---------------------- | ---------- | ------------ |
| External Service Error | 3000-3999  | 可能         |
| Infrastructure Error   | 4000-4999  | 可能         |

---

## 2.7 セキュリティチェックリスト

### 実装時の必須確認事項

| カテゴリ               | チェック項目                                 | 確認 |
| ---------------------- | -------------------------------------------- | ---- |
| **データ保護**         | 認証キーを safeStorage で暗号化              | ✅   |
| **データ保護**         | 認証キーを electron-store に Base64 で保存   | ✅   |
| **データ保護**         | メモリキャッシュで高速アクセス               | ✅   |
| **IPC セキュリティ**   | 全ハンドラーで sender 検証                   | ✅   |
| **IPC セキュリティ**   | チャンネル名はホワイトリスト管理             | ✅   |
| **IPC セキュリティ**   | `auth-key:get` チャンネルは存在しない        | ✅   |
| **ログ保護**           | 認証キーをログに出力しない                   | ✅   |
| **ログ保護**           | エラーメッセージから認証キーをサニタイズ     | ✅   |
| **入力バリデーション** | キー形式の検証 (`sk-ant-api` プレフィックス) | ✅   |
| **入力バリデーション** | キー長の検証 (MIN/MAX)                       | ✅   |
| **フォールバック**     | 環境変数 `ANTHROPIC_API_KEY` 対応            | ✅   |
| **フォールバック**     | safeStorage 利用不可時の警告                 | ✅   |

### ログサニタイズ実装

```typescript
function sanitizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.replace(
        /sk-ant-api\d{2}-[A-Za-z0-9_-]+/g,
        "[REDACTED]",
      ),
    };
  }
  return { error: String(error) };
}
```

---

## 2.8 定数一覧

```typescript
/** 認証キー Store 名 */
export const AUTH_KEY_STORE_NAME = "auth-key-store";

/** 暗号化済みキーの Store キー */
export const ENCRYPTED_AUTH_KEY = "encryptedAuthKey";

/** 環境変数名 */
export const ENV_ANTHROPIC_API_KEY = "ANTHROPIC_API_KEY";

/** キーの最大長 */
export const MAX_KEY_LENGTH = 200;

/** キーの最小長 */
export const MIN_KEY_LENGTH = 1;

/** Anthropic API Key のプレフィックスパターン */
export const ANTHROPIC_API_KEY_PREFIX_PATTERN = /^sk-ant-api\d{2}-/;
```

---

## 2.9 テスト結果サマリー

| テストファイル               | テスト数 | 結果     |
| ---------------------------- | -------- | -------- |
| `AuthKeyService.test.ts`     | 24       | PASS     |
| `authKeyHandlers.test.ts`    | 20       | PASS     |
| `SkillExecutor.auth.test.ts` | 24       | PASS     |
| **合計**                     | **68**   | **PASS** |

### カバレッジ

| ファイル           | Lines  | Branches | Functions |
| ------------------ | ------ | -------- | --------- |
| AuthKeyService.ts  | 76.92% | 82.22%   | 82.35%    |
| authKeyHandlers.ts | 82.87% | 78.72%   | 100%      |

---

## 2.10 後方互換性

### SkillExecutor コンストラクタ

```typescript
// 既存コード（変更不要）
const executor = new SkillExecutor(mainWindow, permissionStore);

// 新規コード（AuthKeyService 使用）
const executor = new SkillExecutor(mainWindow, permissionStore, authKeyService);
```

### 環境変数フォールバック

`ANTHROPIC_API_KEY` 環境変数が設定されている場合、AuthKeyService 未設定でも動作します。

---

## 2.11 関連ファイル

| カテゴリ     | ファイルパス                                            |
| ------------ | ------------------------------------------------------- |
| 型定義       | `apps/desktop/src/main/services/auth/types.ts`          |
| サービス     | `apps/desktop/src/main/services/auth/AuthKeyService.ts` |
| IPC ハンドラ | `apps/desktop/src/main/ipc/authKeyHandlers.ts`          |
| Preload API  | `apps/desktop/src/preload/authKeyApi.ts`                |
| チャンネル   | `apps/desktop/src/preload/channels.ts`                  |
| 統合先       | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
