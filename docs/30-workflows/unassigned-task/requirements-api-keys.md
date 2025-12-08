# APIキー管理 - 機能要件定義書

## 概要

### 目的

Claude、Gemini、XAI（Grok）など複数のAIプロバイダーのAPIキーを安全に保存・管理する。

### 背景

現在のSettingsViewはOpenAI用の単一APIキーフィールドのみ。複数のAIプロバイダーを切り替えて使用できる機能が必要。

### スコープ

- 複数プロバイダーのAPIキー保存
- 安全な暗号化保存（safeStorage）
- APIキーの検証
- プロバイダー切り替え

---

## 機能要件

### FR-AK-001: マルチプロバイダーAPIキー管理

#### 説明

複数のAIプロバイダーのAPIキーを個別に管理する。

#### 対応プロバイダー

| プロバイダー       | APIキー形式 | ベースURL                                   |
| ------------------ | ----------- | ------------------------------------------- |
| Claude (Anthropic) | `sk-ant-*`  | `https://api.anthropic.com`                 |
| Gemini (Google)    | `AIza*`     | `https://generativelanguage.googleapis.com` |
| XAI (Grok)         | `xai-*`     | `https://api.x.ai`                          |
| OpenAI             | `sk-*`      | `https://api.openai.com`                    |

#### 受け入れ基準

- [ ] 各プロバイダーのAPIキーを個別に設定できる
- [ ] APIキーはマスク表示される（`sk-ant-****`）
- [ ] 「表示」ボタンでAPIキーを一時的に表示できる
- [ ] APIキーを削除（クリア）できる
- [ ] デフォルトプロバイダーを選択できる

#### データモデル

```typescript
interface ApiKeyConfig {
  provider: ApiProvider;
  apiKey: string; // 暗号化済み
  isValid: boolean | null; // 検証結果（null=未検証）
  lastValidated?: Date; // 最終検証日時
  customBaseUrl?: string; // カスタムエンドポイント（オプション）
}

type ApiProvider = "claude" | "gemini" | "xai" | "openai";

interface ApiKeySettings {
  keys: Record<ApiProvider, ApiKeyConfig | null>;
  defaultProvider: ApiProvider;
}
```

---

### FR-AK-002: 安全な保存

#### 説明

APIキーをElectronのsafeStorageを使用して暗号化保存する。

#### 受け入れ基準

- [ ] APIキーはsafeStorageで暗号化される
- [ ] 平文のAPIキーはメモリ上にのみ保持される
- [ ] 保存時に自動的に暗号化される
- [ ] 取得時に自動的に復号化される
- [ ] safeStorage未対応環境ではエラーを表示する

#### セキュリティ仕様

- Electron `safeStorage.encryptString()` / `decryptString()` を使用
- OSのキーチェーン/資格情報マネージャーを活用
- アプリ外からのアクセス不可

---

### FR-AK-003: APIキー検証

#### 説明

入力されたAPIキーの有効性を検証する。

#### 受け入れ基準

- [ ] 「接続テスト」ボタンでAPIキーを検証できる
- [ ] 検証中はローディング表示
- [ ] 成功時は緑のチェックマーク表示
- [ ] 失敗時はエラーメッセージ表示
- [ ] 検証結果は保存される（次回起動時に表示）

#### 検証方法

各プロバイダーのAPIに軽量なリクエストを送信：

- Claude: `POST /v1/messages` (minimal request)
- Gemini: `GET /v1beta/models`
- XAI: `POST /v1/chat/completions` (minimal request)
- OpenAI: `GET /v1/models`

---

### FR-AK-004: プロバイダー切り替え

#### 説明

チャット時に使用するAIプロバイダーを切り替える。

#### 受け入れ基準

- [ ] 設定画面でデフォルトプロバイダーを選択できる
- [ ] チャット画面でプロバイダーを一時的に切り替えられる
- [ ] 有効なAPIキーがあるプロバイダーのみ選択可能
- [ ] 現在選択中のプロバイダーが視覚的に分かる

---

## 非機能要件

### NFR-AK-001: セキュリティ

- APIキーはsafeStorageで暗号化必須
- メモリ上のAPIキーは使用後にクリア
- ログにAPIキーを出力しない
- エラーメッセージにAPIキーを含めない

### NFR-AK-002: パフォーマンス

- APIキー保存: 100ms以内
- APIキー取得: 50ms以内
- 接続テスト: タイムアウト5秒

### NFR-AK-003: 可用性

- safeStorage未対応時の代替手段（警告表示のみ、保存は許可しない）
- ネットワークエラー時の適切なエラーハンドリング

---

## UI/UX要件

### 設定画面レイアウト

```
┌─────────────────────────────────────────────────┐
│ API設定                                          │
│ AIサービスへの接続設定                           │
├─────────────────────────────────────────────────┤
│                                                  │
│ デフォルトプロバイダー                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ ○ Claude  ○ Gemini  ○ XAI  ○ OpenAI      │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ Claude (Anthropic)                     [✓ 有効] │
│ ┌─────────────────────────────────────────────┐ │
│ │ sk-ant-****************************        │ │
│ └─────────────────────────────────────────────┘ │
│ [👁 表示] [🔗 接続テスト] [🗑 削除]              │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ Gemini (Google)                        [未設定] │
│ ┌─────────────────────────────────────────────┐ │
│ │ APIキーを入力...                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ XAI (Grok)                             [未設定] │
│ ┌─────────────────────────────────────────────┐ │
│ │ APIキーを入力...                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 状態表示

- ✓ 有効（緑）: APIキー設定済み、検証成功
- ⚠ 未検証（黄）: APIキー設定済み、未検証
- ✗ 無効（赤）: APIキー設定済み、検証失敗
- 未設定（グレー）: APIキー未設定

---

## IPCチャネル定義

```typescript
const API_KEY_CHANNELS = {
  // APIキー操作
  GET_ALL: "apiKey:getAll", // 全プロバイダーのAPIキー取得
  SET: "apiKey:set", // APIキー設定
  DELETE: "apiKey:delete", // APIキー削除
  VALIDATE: "apiKey:validate", // APIキー検証

  // 設定操作
  GET_DEFAULT: "apiKey:getDefault", // デフォルトプロバイダー取得
  SET_DEFAULT: "apiKey:setDefault", // デフォルトプロバイダー設定
} as const;

// リクエスト/レスポンス型
interface SetApiKeyRequest {
  provider: ApiProvider;
  apiKey: string;
}

interface ValidateApiKeyResponse {
  success: boolean;
  provider: ApiProvider;
  isValid: boolean;
  error?: string;
}
```

---

## ユースケース

### UC-AK-001: APIキーを設定する

1. ユーザーが設定画面を開く
2. プロバイダー（例: Claude）のAPIキー入力欄にキーを入力
3. 「接続テスト」ボタンをクリック
4. 検証中のローディング表示
5. 検証成功 → 緑のチェックマーク表示、APIキーが保存される
6. 検証失敗 → エラーメッセージ表示、保存はされる（再検証可能）

### UC-AK-002: デフォルトプロバイダーを変更する

1. ユーザーが設定画面でデフォルトプロバイダーを選択
2. 有効なAPIキーがあるプロバイダーのみ選択可能
3. 選択が即座に保存される
4. チャット画面で新規チャット開始時にデフォルトプロバイダーが使用される

### UC-AK-003: APIキーを削除する

1. ユーザーがプロバイダーの「削除」ボタンをクリック
2. 確認ダイアログ表示
3. 「削除」を選択するとAPIキーが削除される
4. そのプロバイダーがデフォルトだった場合、別のプロバイダーに切り替え

---

## 依存関係

### 既存コンポーネント

- `SettingsSlice` - 現在の設定状態管理（拡張が必要）
- `SettingsView` - 設定画面（APIキーセクション改修）
- `storeHandlers` - safeStorage操作（セキュア保存機能あり）

### 新規コンポーネント

- `ApiKeySettings` - APIキー設定コンポーネント（molecule）
- `ProviderSelector` - プロバイダー選択（molecule）
- `apiKeySlice` - APIキー状態管理（store slice）
- `apiKeyHandlers` - IPCハンドラー（main process）
- `apiKeyValidator` - 検証ロジック（main process）
