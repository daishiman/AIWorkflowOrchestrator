# Phase 2: 設計判断書

## タスク ID

TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001

## 1. 設計方針サマリ

設定画面(SettingsView)で `auth-mode=api-key` 選択時に、authKey 専用入力UIを追加する。
`auth-mode:status`(保存キー基準)と `auth-key:exists`(環境変数 fallback 含む)の結果を組み合わせ、4状態を明示的にユーザーへ表示する。

---

## 2. 新規コンポーネント: AuthKeySection

### 2.1 配置

- **ファイルパス**: `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`
- **表示条件**: `authMode === 'api-key'` の場合のみレンダリング
- **配置位置**: SettingsView 内の AuthModeSelector セクション直下

### 2.2 コンポーネント構成

```
SettingsView
  +-- AuthModeSelector (既存・変更なし)
  +-- AuthKeySection (新規)
        +-- AuthKeyStatusBadge (状態バッジ)
        +-- AuthKeyInputForm (入力・保存フォーム)
        +-- AuthKeyDeleteButton (削除ボタン)
```

AuthKeySection は単一ファイルで実装する。内部のサブ要素(StatusBadge, InputForm, DeleteButton)はファイル内のプライベートコンポーネントまたは JSX ブロックとして記述し、外部エクスポートしない。コンポーネントが肥大化した場合は Phase 8(リファクタリング)で分割を検討する。

### 2.3 Props インターフェース

```typescript
interface AuthKeySectionProps {
  /** 現在の認証モード。'api-key' 以外では呼び出し元で非表示にする */
  // Props は不要。内部で useAuthMode() セレクタから取得する。
  // SettingsView 側で authMode === 'api-key' ガードを行う。
}
```

AuthKeySection は Props を受け取らない。全ての状態は内部の useState と Preload API 呼び出しで管理する。

---

## 3. 状態管理設計

### 3.1 ローカル state (useState)

| state 名          | 型                                                        | 初期値      | 用途                            |
| ----------------- | --------------------------------------------------------- | ----------- | ------------------------------- |
| `inputValue`      | `string`                                                  | `""`        | APIキー入力値(一時保持)         |
| `isSubmitting`    | `boolean`                                                 | `false`     | 保存/削除処理中フラグ           |
| `showPassword`    | `boolean`                                                 | `false`     | パスワードマスク表示トグル      |
| `keyStatus`       | `"stored" \| "env-fallback" \| "not-set" \| "error"`      | `"not-set"` | 4状態の現在値                   |
| `statusMessage`   | `string`                                                  | `""`        | ユーザー向けフィードバック      |
| `operationResult` | `{ type: "success" \| "error"; message: string } \| null` | `null`      | 保存/削除操作後の結果メッセージ |

### 3.2 生キーのライフサイクル

1. ユーザーが入力フィールドに APIキーを入力 -> `inputValue` に保持
2. 「保存」ボタン押下 -> `authKeyAPI.set(inputValue)` を呼び出し
3. 成功時: `inputValue` を `""` にクリア(即破棄)
4. `authKeyAPI.exists()` + `useAuthModeStatus()` で状態を再取得
5. **inputValue は submit 後に必ず空文字列に戻す** -- Renderer の永続 state に生キーを保存しない

### 3.3 Zustand Store との連携

既存の個別セレクタを使用する(P31 対策済み):

```typescript
const authMode = useAuthMode(); // 現在のモード判定に使用
const authModeStatus = useAuthModeStatus(); // status.hasCredentials の取得
const fetchStatus = useFetchAuthModeStatus(); // 状態再取得トリガー
```

新規セレクタの追加は不要。`authKeyAPI.exists()` の結果はローカル state で管理する。

---

## 4. 4状態表示ロジック

### 4.1 状態判定フロー

```
コンポーネントマウント時 / 保存・削除操作後:
  1. authModeStatus を取得 (useAuthModeStatus)
  2. authKeyAPI.exists() を呼び出し
  3. 以下のロジックで keyStatus を決定:

  if (IPC呼び出しエラー) {
    keyStatus = "error"
  } else if (authModeStatus.hasCredentials === true) {
    keyStatus = "stored"
  } else if (authModeStatus.hasCredentials === false && existsResult.exists === true) {
    keyStatus = "env-fallback"
  } else {
    keyStatus = "not-set"
  }
```

### 4.2 状態別 UI 表示

| keyStatus      | バッジ色              | テキスト                                                            | アイコン    |
| -------------- | --------------------- | ------------------------------------------------------------------- | ----------- |
| `stored`       | 緑 (`systemGreen`)    | APIキー設定済み                                                     | CheckCircle |
| `env-fallback` | 黄 (`systemOrange`)   | 環境変数(ANTHROPIC_API_KEY)で実行可能ですが、設定画面には未保存です | AlertCircle |
| `not-set`      | 赤 (`systemRed`)      | APIキーが未設定です                                                 | XCircle     |
| `error`        | 灰 (`secondaryLabel`) | 状態確認に失敗しました                                              | HelpCircle  |

### 4.3 状態別 UI 操作可否

| keyStatus      | 入力フォーム   | 保存ボタン | 削除ボタン         |
| -------------- | -------------- | ---------- | ------------------ |
| `stored`       | 表示(上書き用) | 有効       | 有効               |
| `env-fallback` | 表示           | 有効       | 無効(保存キーなし) |
| `not-set`      | 表示           | 有効       | 無効               |
| `error`        | 表示           | 有効       | 無効               |

---

## 5. ユーザー操作フロー

### 5.1 APIキー保存

```
1. ユーザーが入力フィールドにキーを入力
2. 「保存」ボタンを押下
3. isSubmitting = true, ボタンを disabled に
4. authKeyAPI.set(inputValue) を呼び出し
5a. 成功時:
    - inputValue = "" (即破棄)
    - operationResult = { type: "success", message: "APIキーを保存しました" }
    - refreshStatus() で4状態を再判定
    - fetchStatus() で authModeStatus を再取得
5b. 失敗時:
    - inputValue = "" (失敗時も破棄)
    - operationResult = { type: "error", message: "APIキーの保存に失敗しました" }
6. isSubmitting = false
```

### 5.2 APIキー削除

```
1. ユーザーが「削除」ボタンを押下
2. 確認ダイアログ表示: 「保存済みのAPIキーを削除しますか？」
3. 確認後: isSubmitting = true
4. authKeyAPI.delete() を呼び出し
5a. 成功時:
    - operationResult = { type: "success", message: "APIキーを削除しました" }
    - refreshStatus() で4状態を再判定
    - fetchStatus() で authModeStatus を再取得
5b. 失敗時:
    - operationResult = { type: "error", message: "APIキーの削除に失敗しました" }
6. isSubmitting = false
```

### 5.3 状態リフレッシュ (refreshStatus)

```typescript
async function refreshStatus(): Promise<void> {
  try {
    const existsResult = await window.electronAPI.authKey.exists();
    // authModeStatus は useAuthModeStatus() から取得済み
    // 判定ロジックで keyStatus を更新
  } catch {
    setKeyStatus("error");
  }
}
```

---

## 6. セキュリティ設計

### 6.1 入力フィールド

- `type="password"` をデフォルトに設定
- マスク表示トグルボタンで `type="text"` への切替を許可
- オートコンプリート無効: `autoComplete="off"`

### 6.2 生キーの保護

- `inputValue` は React の useState でのみ保持
- submit 成功/失敗いずれの場合も即座にクリア
- Zustand Store には生キーを保存しない
- localStorage / sessionStorage には書き込まない
- コンポーネントアンマウント時に自動クリア(React のライフサイクルで保証)

### 6.3 Preload 境界

- 既存の `authKeyAPI` をそのまま使用(変更なし)
- Main Process 側のバリデーション(P42 準拠 3段バリデーション)は既存実装で担保済み
- Renderer 側でも空文字列チェックを実施(二重防御)

---

## 7. UI/UX 設計

### 7.1 Apple HIG 準拠

| 要素           | 仕様                                             |
| -------------- | ------------------------------------------------ |
| 角丸           | `rounded-lg` (8px)                               |
| フォント       | システムフォント(-apple-system)                  |
| 色             | Apple systemColors (ライト/ダーク両対応)         |
| スペーシング   | 8px グリッド (`space-2`, `space-4`, `space-6`)   |
| トランジション | 200ms ease-in-out                                |
| 影             | `shadow-sm` (カード: 0 1px 3px rgba(0,0,0,0.04)) |

### 7.2 レイアウト構造

```
[AuthKeySection]
  [StatusBadge] -- 4状態バッジ(上部に常時表示)
  [InputForm]
    [PasswordInput] + [ToggleVisibility]
    [SaveButton]
  [DeleteButton] -- stored 状態のみ有効
  [OperationResult] -- 操作結果メッセージ(一時表示)
```

### 7.3 アクセシビリティ (WCAG 2.1 AA)

| 要素           | 対応                                                          |
| -------------- | ------------------------------------------------------------- |
| 入力フィールド | `aria-label="APIキー"`, `aria-describedby` で状態説明と紐付け |
| 状態バッジ     | `role="status"`, `aria-live="polite"`                         |
| 保存ボタン     | `aria-label="APIキーを保存"`                                  |
| 削除ボタン     | `aria-label="APIキーを削除"`                                  |
| マスクトグル   | `aria-label="パスワードの表示を切り替え"`                     |
| フォーカス順序 | 入力 -> トグル -> 保存 -> 削除 の順                           |
| キーボード操作 | Enter で保存、Tab でフォーカス移動                            |
| コントラスト比 | 全テキスト 4.5:1 以上                                         |

---

## 8. エラーハンドリング

### 8.1 エラーカテゴリ(02-code-quality.md 準拠)

| 操作           | 想定エラー           | カテゴリ              | リトライ |
| -------------- | -------------------- | --------------------- | -------- |
| authKey.set    | IPC通信失敗          | Infrastructure (4xxx) | 可能     |
| authKey.set    | バリデーションエラー | Validation (1xxx)     | 不可     |
| authKey.exists | IPC通信失敗          | Infrastructure (4xxx) | 可能     |
| authKey.delete | IPC通信失敗          | Infrastructure (4xxx) | 可能     |

### 8.2 Renderer 側バリデーション

保存前に以下をチェックし、IPC 呼び出し前にエラーを返す:

```typescript
if (typeof inputValue !== "string" || inputValue.trim() === "") {
  setOperationResult({ type: "error", message: "APIキーを入力してください" });
  return;
}
```

---

## 9. 設計判断の根拠

| 判断項目                    | 選択                           | 根拠                                                  |
| --------------------------- | ------------------------------ | ----------------------------------------------------- | --- | -------------------- |
| 案C採用(専用セクション追加) | AuthKeySection 新規作成        | index.md で確定済み。既存コンポーネントへの影響最小化 |
| Preload API 変更なし        | 既存 authKeyAPI をそのまま使用 | 既存 API で4状態判定に必要な情報が全て取得可能        |
| Main Process 変更なし       | 既存ハンドラーをそのまま使用   | auth-key:exists は hasStoredKey                       |     | hasEnvKey で判定済み |
| ローカル state のみ         | useState                       | 生キーを Store に保存しないセキュリティ要件           |
| 個別セレクタ使用            | useAuthMode() 等               | P31 対策(合成Hook無限ループ防止)                      |
| サブコンポーネント非分割    | 単一ファイル                   | 初期実装はシンプルに。Phase 8 で必要に応じて分割      |
