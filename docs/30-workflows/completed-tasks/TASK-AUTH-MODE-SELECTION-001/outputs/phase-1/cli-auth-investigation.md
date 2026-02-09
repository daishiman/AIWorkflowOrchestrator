# Claude Code CLI 認証メカニズム調査結果

## 調査日

2026-02-09

## 調査概要

Claude Code CLI が使用する認証トークンの格納場所と形式を調査し、AIWorkflowOrchestrator からプログラム的にトークンを取得する方法を特定した。

---

## ディレクトリ構造

### ~/.claude/ ディレクトリ

```
~/.claude/
├── agents/                   # エージェント設定
├── cache/                    # キャッシュ（changelog.md等）
├── chrome/                   # Chrome連携（chrome-native-host）
├── CLAUDE.md                 # グローバル設定（空ファイル）
├── commands/                 # カスタムコマンド
├── debug/                    # デバッグログ（5000+ファイル）
├── downloads/                # ダウンロードファイル
├── file-history/             # ファイル履歴
├── history.jsonl             # 会話履歴（12MB）
├── ide/                      # IDE連携設定
├── logs/                     # ログファイル
├── paste-cache/              # ペースト履歴
├── plans/                    # プラン情報
├── plugins/                  # プラグイン
├── projects/                 # プロジェクト設定
├── session-env/              # セッション環境変数
├── settings.json             # ユーザー設定
├── settings.local.json       # ローカル設定
├── shell-snapshots/          # シェルスナップショット
├── skills -> (symlink)       # スキルディレクトリ
├── stats-cache.json          # 統計キャッシュ
├── statsig/                  # Statsig（A/Bテスト）設定
├── statusline-command.sh     # ステータスライン
├── tasks/                    # タスク情報
├── telemetry/                # テレメトリ
└── todos/                    # TODOリスト
```

**重要**: ~/.claude/ ディレクトリには認証トークンは直接保存されていない。

### ~/Library/Application Support/Claude/ ディレクトリ

```
~/Library/Application Support/Claude/
├── ant-did                     # デバイスID（48文字）
├── config.json                 # 設定ファイル（oauth:tokenCache含む）
├── claude_desktop_config.json  # Claude Desktop設定
├── claude-code/
│   └── 2.1.34/
│       ├── .verified
│       └── claude              # Claude Code CLI バイナリ（181MB）
├── blob_storage/
├── Cache/
├── Cookies
├── IndexedDB/                  # claude.ai のIndexedDB
├── Local Storage/
├── Session Storage/            # セッションストレージ（LevelDB形式）
└── ... その他Electronアプリ関連
```

---

## トークン格納方法

### 1. 主要格納場所: macOS Keychain

**サービス名**: `Claude Code-credentials`
**アカウント名**: ユーザー名（例: `dm`）

```
keychain: "/Users/dm/Library/Keychains/login.keychain-db"
class: "genp"
attributes:
    "svce"<blob>="Claude Code-credentials"
    "acct"<blob>="dm"
    "cdat"<timedate>="20260206090634Z"  # 作成日
    "mdat"<timedate>="20260208140548Z"  # 更新日
```

### 2. 補助的格納場所: config.json

**ファイルパス**: `~/Library/Application Support/Claude/config.json`
**関連キー**: `oauth:tokenCache`
**形式**: 暗号化/エンコードされた文字列（432文字、`djEwF...`で開始）

```json
{
  "oauth:tokenCache": "djEwFlhmAzxfw5e/nGsd...",
  "darkMode": "..."
  // その他の設定
}
```

### 3. 環境変数

| 変数名                    | 用途                     |
| ------------------------- | ------------------------ |
| `CLAUDE_CODE_OAUTH_TOKEN` | OAuth トークンの直接指定 |
| `ANTHROPIC_API_KEY`       | API キー（別認証方式）   |

---

## トークン形式

### OAuth トークン種別

| トークン種別  | プレフィックス  | 有効期限 | 用途                |
| ------------- | --------------- | -------- | ------------------- |
| Access Token  | `sk-ant-oat01-` | 短期間   | API リクエスト認証  |
| Refresh Token | `sk-ant-ort01-` | 長期間   | Access Token の更新 |

### API キー（従来方式）

| トークン種別 | プレフィックス  | 用途          |
| ------------ | --------------- | ------------- |
| API Key      | `sk-ant-api03-` | 直接 API 認証 |

**注意**: `claude setup-token` で生成されるトークンは OAuth 形式であり、API キー形式（`sk-ant-api03-`）ではない。

### トークンライフサイクル

1. ユーザーが `/login` でブラウザ認証
2. OAuth callback で Access Token + Refresh Token を取得
3. Access Token は有効期限後に自動リフレッシュ
4. Refresh Token 期限切れ時は再ログインが必要

---

## プログラムからの取得方法

### 方法1: macOS Keychain 経由（推奨）

**使用ライブラリ**: `keytar` (https://github.com/atom/keytar)

```typescript
import * as keytar from "keytar";

// Claude Code の認証情報を取得
const credentials = await keytar.getPassword(
  "Claude Code-credentials", // service
  process.env.USER || "unknown", // account (ユーザー名)
);

if (credentials) {
  // JSON パース（トークン情報が格納されている可能性）
  const tokenData = JSON.parse(credentials);
  // tokenData.accessToken, tokenData.refreshToken 等
}
```

**注意事項**:

- `keytar` はネイティブモジュール（コンパイルが必要）
- Electron では `electron-rebuild` が必要
- 初回アクセス時にユーザーに Keychain アクセス許可を求められる

### 方法2: 環境変数経由

```typescript
// claude setup-token で設定された場合
const oauthToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;

if (oauthToken) {
  // OAuth トークンとして使用
}
```

### 方法3: config.json 経由（非推奨）

```typescript
import fs from "fs";
import path from "path";

const configPath = path.join(
  process.env.HOME || "",
  "Library/Application Support/Claude/config.json",
);

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const tokenCache = config["oauth:tokenCache"];

// tokenCache は暗号化されているため、復号処理が必要
// 暗号化方式は非公開のため、この方法は推奨しない
```

---

## セキュリティ考慮事項

### パーミッション

| リソース                | パーミッション     | 備考             |
| ----------------------- | ------------------ | ---------------- |
| ~/.claude/              | `drwxr-xr-x` (755) | 公開ディレクトリ |
| ~/.claude/settings.json | `-rw-r--r--` (644) | 読み取り可能     |
| macOS Keychain          | ユーザーアクセス   | ACL 保護         |
| config.json             | `-rw-r--r--` (644) | 読み取り可能     |

### Keychain アクセス制御

- Keychain エントリへのアクセスはアプリごとにACL管理
- 初回アクセス時にユーザー確認ダイアログが表示される
- 「常に許可」を選択するとACLに追加される

### トークン保護

1. **Keychain 暗号化**: macOS Keychain は AES-256-GCM で暗号化
2. **config.json の tokenCache**: 独自の暗号化（復号方式非公開）
3. **環境変数**: プロセス間で露出リスクあり

### 推奨事項

1. Keychain アクセスには `keytar` を使用
2. 取得したトークンは Electron の `safeStorage` で再暗号化して保存
3. トークンのログ出力を禁止（サニタイズ処理必須）
4. Renderer プロセスへのトークン直接送信を禁止

---

## 既存実装との互換性

### 現在の AuthKeyService 実装

**ファイル**: `apps/desktop/src/main/services/auth/AuthKeyService.ts`

```typescript
// 現在の認証キー取得優先順位
1. メモリキャッシュ
2. electron-store（safeStorage 暗号化）
3. ANTHROPIC_API_KEY 環境変数
```

**サポートするキー形式**: `sk-` プレフィックス

### 拡張提案

AuthKeyService を拡張して、以下の認証モードをサポート:

```typescript
enum AuthMode {
  API_KEY = "api-key", // 従来: Anthropic API Key
  SUBSCRIPTION = "subscription", // 新規: Claude サブスクリプション
}

interface IAuthKeyService {
  // 既存メソッド
  setKey(key: string): Promise<void>;
  getKey(): Promise<string | null>;
  hasKey(): Promise<boolean>;
  validateKey(key: string): Promise<boolean>;
  deleteKey(): Promise<void>;

  // 新規メソッド
  setAuthMode(mode: AuthMode): Promise<void>;
  getAuthMode(): Promise<AuthMode>;
  getSubscriptionToken(): Promise<string | null>;
  hasSubscription(): Promise<boolean>;
}
```

### 統合アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    AuthModeService                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │   API Key Mode      │    │   Subscription Mode      │   │
│  │  (AuthKeyService)   │    │  (SubscriptionService)   │   │
│  ├─────────────────────┤    ├──────────────────────────┤   │
│  │ - electron-store    │    │ - macOS Keychain         │   │
│  │ - safeStorage       │    │ - keytar                 │   │
│  │ - ANTHROPIC_API_KEY │    │ - CLAUDE_CODE_OAUTH_TOKEN│   │
│  └─────────────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 結論

### サブスクリプション認証の実現可能性

**結論**: 技術的に実現可能

Claude Code CLI は macOS Keychain にサブスクリプション認証情報を保存しており、`keytar` ライブラリを使用することでプログラムからアクセス可能。

### 推奨実装方式

1. **認証モード選択 UI**: ユーザーが API Key モードと Subscription モードを選択
2. **SubscriptionAuthService**: 新規サービスとして Keychain アクセスを実装
3. **AuthModeService**: 統合サービスとして認証モードに応じたサービスを使い分け
4. **IPC ハンドラ拡張**: 認証モード関連の IPC チャンネルを追加

### 必要な依存パッケージ

| パッケージ                | バージョン | 用途                    |
| ------------------------- | ---------- | ----------------------- |
| keytar                    | ^7.9.0     | macOS Keychain アクセス |
| @anthropic-ai/claude-code | -          | Claude Code SDK（参考） |

### リスクと制約

1. **Keychain アクセス許可**: 初回実行時にユーザー確認が必要
2. **トークン有効期限**: Refresh Token 期限切れ時の再ログイン誘導が必要
3. **プラットフォーム依存**: 現在は macOS のみ対応（Windows/Linux は別途調査要）
4. **Claude Code CLI 依存**: CLI がインストール・認証済みであることが前提

### 次のステップ

1. Phase 2 で SubscriptionAuthService の詳細設計
2. keytar の依存関係追加と electron-rebuild 設定
3. 認証モード選択 UI のワイヤーフレーム作成
4. IPC チャンネル設計

---

## 参考資料

- [Claude Code Authentication Docs](https://code.claude.com/docs/en/iam)
- [keytar - GitHub](https://github.com/atom/keytar)
- [Electron safeStorage API](https://www.electronjs.org/docs/latest/api/safe-storage)
- [macOS Keychain Services](https://developer.apple.com/documentation/security/keychain_services)
