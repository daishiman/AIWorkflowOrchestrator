# AuthView 要件定義書

## 概要

AuthViewは、未認証ユーザーに表示されるログイン画面コンポーネントである。OAuth認証（Google/GitHub/Discord）を提供し、新規登録・ログインの両方に対応する。

## 機能要件

### FR-AV-01: OAuthプロバイダー選択

以下のOAuthプロバイダーでのログイン/登録を提供する:

| プロバイダー | アイコン | ボタンラベル        |
| ------------ | -------- | ------------------- |
| Google       | Google   | 「Googleで続ける」  |
| GitHub       | GitHub   | 「GitHubで続ける」  |
| Discord      | Discord  | 「Discordで続ける」 |

### FR-AV-02: 既存authSliceとの連携

AuthViewは既存の`authSlice`から以下の状態・アクションを使用する:

```typescript
// 使用する状態
const isLoading = useAppStore((state) => state.isLoading);
const authError = useAppStore((state) => state.authError);

// 使用するアクション
const login = useAppStore((state) => state.login);
const setAuthError = useAppStore((state) => state.setAuthError);
```

### FR-AV-03: ログインフロー

1. ユーザーがプロバイダーボタンをクリック
2. `login(provider)`を呼び出し
3. 外部ブラウザでOAuth認証画面が開く
4. OAuth認証完了後、`aiworkflow://auth/callback`でコールバック
5. `auth:state-changed`イベントで認証状態が更新
6. AuthGuardが認証済み状態を検知し、メイン画面に遷移

### FR-AV-04: ローディング状態の表示

`isLoading === true`の間:

1. すべてのプロバイダーボタンを`disabled`にする
2. クリックされたボタンにスピナーを表示
3. 「認証中...」のメッセージを表示

### FR-AV-05: エラー表示

`authError`が存在する場合:

1. エラーメッセージをアラート形式で表示
2. 閉じるボタンで`setAuthError(null)`を呼び出し
3. 赤色の背景で視覚的に区別

## 非機能要件

### NFR-AV-01: アクセシビリティ

- すべてのボタンに適切な`aria-label`を設定
- キーボード操作に対応（Tab/Enter）
- スクリーンリーダー対応

### NFR-AV-02: レスポンシブデザイン

- デスクトップ/モバイル両対応
- ボタンは縦並びで配置
- 最小幅320px対応

### NFR-AV-03: デザインシステム整合性

- 既存のAtomicDesignコンポーネントを活用
- GlassPanelでカード背景を表現
- 既存のカラーパレットを使用

## UI設計

### 画面構成

```
┌─────────────────────────────────────────┐
│                                         │
│              [アプリロゴ]                │
│                                         │
│      AIWorkflowOrchestrator            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │    ┌─────────────────────────┐    │  │
│  │    │  [G] Googleで続ける     │    │  │
│  │    └─────────────────────────┘    │  │
│  │                                   │  │
│  │    ┌─────────────────────────┐    │  │
│  │    │  [GH] GitHubで続ける    │    │  │
│  │    └─────────────────────────┘    │  │
│  │                                   │  │
│  │    ┌─────────────────────────┐    │  │
│  │    │  [D] Discordで続ける    │    │  │
│  │    └─────────────────────────┘    │  │
│  │                                   │  │
│  │   アカウントを連携してデータを    │  │
│  │   同期しましょう                   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│         [エラーメッセージ領域]          │
│                                         │
└─────────────────────────────────────────┘
```

### 状態別UI

#### 初期状態

- すべてのプロバイダーボタンが有効
- エラーメッセージなし

#### ローディング状態

- ボタンが無効化
- クリックしたボタンにスピナー表示
- 「認証中...」メッセージ

#### エラー状態

- エラーメッセージを赤色背景で表示
- 閉じるボタン（×）を右側に配置
- ボタンは有効状態に戻る

## インターフェース設計

### Props

```typescript
interface AuthViewProps {
  /** クラス名（スタイル拡張用） */
  className?: string;
}
```

### 内部状態

```typescript
// クリック中のプロバイダー（スピナー表示用）
const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
  null,
);
```

## 使用する既存コンポーネント

| コンポーネント | パス                              | 用途             |
| -------------- | --------------------------------- | ---------------- |
| `Button`       | `components/atoms/Button`         | OAuthボタン      |
| `Icon`         | `components/atoms/Icon`           | アイコン表示     |
| `Spinner`      | `components/atoms/Spinner`        | ローディング表示 |
| `GlassPanel`   | `components/organisms/GlassPanel` | カード背景       |

## 既存実装参照

`AccountSection`コンポーネント（`components/organisms/AccountSection/index.tsx`）には以下の実装が存在する:

- OAuthプロバイダーアイコン（`ProviderIcon`コンポーネント）
- ログインボタンのスタイリング
- エラー表示のUI

これらを参考に、AuthViewを実装する。

## 完了条件チェックリスト

- [x] OAuthプロバイダー選択UIが定義されている
- [x] ローディング状態のUI仕様が定義されている
- [x] エラー表示のUI仕様が定義されている
- [x] 既存デザインシステムとの整合性が確認されている

## 参照

- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` - 既存OAuth UI参照
- `apps/desktop/src/renderer/store/slices/authSlice.ts` - 認証状態管理
- `apps/desktop/src/renderer/components/atoms/Button/index.tsx` - ボタンコンポーネント
- `apps/desktop/src/renderer/components/organisms/GlassPanel/index.tsx` - ガラスパネル
