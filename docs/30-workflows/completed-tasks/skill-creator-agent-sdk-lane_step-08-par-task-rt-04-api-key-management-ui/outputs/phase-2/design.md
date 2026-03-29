# Phase 2: 設計書 — TASK-RT-04 API Key Management UI

## 1. コンポーネント設計

### ApiKeySettingsPanel

```
ApiKeySettingsPanel
├── ヘッダー（タイトル + ステータスバッジ）
├── コンテンツ（状態に応じて切り替え）
│   ├── not_set / error: 入力フォーム
│   │   ├── テキスト入力（type="password"）
│   │   ├── バリデーションエラー表示
│   │   └── 保存ボタン
│   ├── validating: スピナー + "検証中..." テキスト
│   └── configured: 設定済み表示
│       ├── マスク表示（sk-ant-***...***）
│       ├── ソース表示（"保存済み" / "環境変数"）
│       └── 削除ボタン
└── エラーメッセージ（error 状態時）
```

### Props

```typescript
interface ApiKeySettingsPanelProps {
  /** 設定変更時のコールバック（親コンポーネント通知用） */
  onStatusChange?: (status: ApiKeyStatus) => void;
}
```

### ファイルパス

```
apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

## 2. Preload API 設計

**既存 `window.electronAPI.authKey` をそのまま使用する。**

```typescript
// 呼び出しパターン（コンポーネント内）
const api = window.electronAPI.authKey;

// 存在確認
const { exists, source } = await api.exists();

// 保存
const { success, error } = await api.set(apiKey);

// 検証
const { valid, error } = await api.validate(apiKey);

// 削除
const { success, error } = await api.delete();
```

**skill-creator-api.ts への追加は不要** — 既存 electronAPI 経由で十分。

## 3. 状態管理設計

### ローカル useState パターン

```typescript
const [status, setStatus] = useState<ApiKeyStatus>("not_set");
const [inputValue, setInputValue] = useState("");
const [validationError, setValidationError] = useState<string | null>(null);
const [apiError, setApiError] = useState<string | null>(null);
const [keySource, setKeySource] = useState<"saved" | "env-fallback" | null>(
  null,
);
```

### 初期化フロー（useEffect）

```
コンポーネントマウント
  → electronAPI.authKey.exists() 呼び出し
  → exists === true → setStatus("configured"), setKeySource(source)
  → exists === false → setStatus("not_set")
```

## 4. バリデーションロジック設計

```typescript
function validateApiKey(key: string): string | null {
  const trimmed = key.trim();
  if (trimmed === "") return "APIキーを入力してください";
  if (trimmed.length > 200) return "APIキーの長さが不正です";
  if (!/^sk-ant-api\d{2}-/.test(trimmed))
    return "Anthropic APIキーの形式が正しくありません";
  return null; // valid
}
```

### 保存フロー

```
ユーザー入力 → validateApiKey() → エラーあり → validationError 表示
                                → エラーなし → setStatus("validating")
                                            → electronAPI.authKey.set(key)
                                            → success → setStatus("configured")
                                            → error → setStatus("error"), setApiError(error)
```

## 5. SkillLifecyclePanel 統合設計

### 配置位置

SkillLifecyclePanel の「1. 依頼をまとめる」セクションの**上部**に配置。
APIキーはスキル生成・実行の前提条件であるため、ユーザーが最初に目にする位置が適切。

### 統合方法

```tsx
// SkillLifecyclePanel.tsx 内
import { ApiKeySettingsPanel } from "./ApiKeySettingsPanel";

// メインコンテンツ内、リクエスト入力セクションの前に配置
<ApiKeySettingsPanel onStatusChange={handleApiKeyStatusChange} />;
```

### 条件付き表示

- 常時表示（折りたたみ可能）
- `configured` 状態時はコンパクト表示（1行のステータス表示）
- `not_set` / `error` 状態時は展開表示（入力フォーム表示）

## 6. セキュリティ設計

| 観点     | 対策                                                        |
| -------- | ----------------------------------------------------------- |
| キー表示 | `type="password"` で入力、表示時はマスク `sk-ant-***...***` |
| キー送信 | IPC 経由のみ（HTTP 直接送信なし）                           |
| メモリ   | 入力値は保存後にクリア（`setInputValue("")`）               |
| ログ     | コンソール出力にキーを含めない                              |
| 取得API  | 不在（main側でauth-key:getは非公開）                        |
