# T-00-2: Error Boundary要件定義書

## メタ情報

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| タスクID         | T-00-2                         |
| タスク名         | Error Boundary要件定義         |
| 分類             | コード品質改善                 |
| 対象機能         | 認証コンポーネントのエラー境界 |
| 優先度           | 必須                           |
| ステータス       | 完了                           |
| 作成日           | 2025-12-09                     |
| 作成エージェント | @req-analyst                   |

---

## 1. 背景

### 1.1 現状分析

現在、認証関連コンポーネント（AuthGuard、AuthView、AccountSection）にはError Boundaryが実装されていない。

```
apps/desktop/src/renderer/
├── components/
│   └── AuthGuard/
│       ├── index.tsx          ← Error Boundary なし
│       └── LoadingScreen.tsx
├── views/
│   └── AuthView/
│       └── index.tsx          ← Error Boundary なし
```

### 1.2 問題点

1. **UIクラッシュのリスク**: 認証処理中にエラーが発生すると、アプリ全体が白画面になる可能性がある
2. **エラー情報の消失**: エラーがキャッチされずに消失し、デバッグが困難
3. **ユーザー体験の低下**: エラー発生時に適切なフィードバックがない
4. **リカバリー手段の欠如**: エラー発生後にユーザーが復帰する手段がない

### 1.3 目的

認証関連コンポーネントでエラーが発生した場合でも、アプリケーションがクラッシュせず、ユーザーが適切な対応を取れるようにする。

---

## 2. 機能要件

### 2.1 CQ-EB-01: エラーキャッチ機能

**要件ID**: CQ-EB-01
**優先度**: 必須

| 項目 | 内容                                                                |
| ---- | ------------------------------------------------------------------- |
| 説明 | 子コンポーネントで発生したJavaScriptエラーをキャッチする            |
| 対象 | render中のエラー、ライフサイクルメソッド中のエラー                  |
| 除外 | イベントハンドラー内のエラー（try-catchで対応）、非同期処理のエラー |

**受け入れ基準**:

- [ ] `getDerivedStateFromError`でエラー状態を更新できる
- [ ] `componentDidCatch`でエラー情報を受け取れる
- [ ] エラー発生後もアプリケーションがクラッシュしない

### 2.2 CQ-EB-02: フォールバックUI表示

**要件ID**: CQ-EB-02
**優先度**: 必須

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| 説明     | エラー発生時にユーザーフレンドリーなフォールバックUIを表示する |
| 表示要素 | エラーアイコン、エラーメッセージ、再試行ボタン                 |
| デザイン | 既存のGlassPanelを使用し、一貫したスタイルを維持               |

**UI仕様**:

```
┌─────────────────────────────────────┐
│                                     │
│         ⚠️ (エラーアイコン)          │
│                                     │
│      エラーが発生しました           │
│                                     │
│  認証処理中にエラーが発生しました。 │
│  再試行してください。               │
│                                     │
│        [ 再試行 ]                   │
│                                     │
└─────────────────────────────────────┘
```

**受け入れ基準**:

- [ ] エラー時にフォールバックUIが表示される
- [ ] エラーメッセージが日本語で表示される
- [ ] 既存のデザインシステム（GlassPanel、Button）を使用している
- [ ] アクセシビリティ要件を満たす（role="alert"、aria-live="assertive"）

### 2.3 CQ-EB-03: エラーログ出力

**要件ID**: CQ-EB-03
**優先度**: 必須

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 説明         | エラー情報をコンソールに出力し、将来的なエラーレポーティングに備える |
| 出力内容     | エラーオブジェクト、コンポーネントスタック                           |
| フォーマット | `[AuthErrorBoundary] Error caught: {error}`                          |

**受け入れ基準**:

- [ ] `console.error`でエラーとコンポーネントスタックが出力される
- [ ] エラーメッセージにコンポーネント名が含まれる
- [ ] 将来的なSentry等への拡張ポイントがコメントで示されている

### 2.4 CQ-EB-04: リトライ機能

**要件ID**: CQ-EB-04
**優先度**: 推奨

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| 説明         | ユーザーがエラー状態をリセットして再試行できる機能     |
| 動作         | エラー状態をクリアし、子コンポーネントを再レンダリング |
| コールバック | オプションで親コンポーネントにリトライを通知           |

**受け入れ基準**:

- [ ] 再試行ボタンをクリックするとエラー状態がリセットされる
- [ ] 子コンポーネントが再レンダリングされる
- [ ] オプションの`onRetry`コールバックが呼ばれる

---

## 3. 非機能要件

### 3.1 パフォーマンス

- Error Boundaryの追加によるレンダリングパフォーマンスへの影響は最小限
- エラーが発生していない通常時は追加のオーバーヘッドなし

### 3.2 アクセシビリティ

| 要件               | 内容                                    |
| ------------------ | --------------------------------------- |
| スクリーンリーダー | エラーメッセージが読み上げられる        |
| キーボード操作     | 再試行ボタンにフォーカス可能            |
| ARIA               | `role="alert"`, `aria-live="assertive"` |

### 3.3 国際化対応

- エラーメッセージは日本語で固定（現時点）
- 将来的なi18n対応を考慮した構造

---

## 4. コンポーネント設計

### 4.1 ファイル配置

```
apps/desktop/src/renderer/components/AuthGuard/
├── index.tsx
├── AuthErrorBoundary.tsx       ← 新規作成
├── AuthErrorBoundary.test.tsx  ← 新規作成
└── LoadingScreen.tsx
```

### 4.2 Props定義

```typescript
interface AuthErrorBoundaryProps {
  /** 子コンポーネント */
  children: React.ReactNode;

  /** リトライ時のコールバック（オプション） */
  onRetry?: () => void;
}
```

### 4.3 State定義

```typescript
interface AuthErrorBoundaryState {
  /** エラーが発生したかどうか */
  hasError: boolean;

  /** 発生したエラーオブジェクト */
  error: Error | null;
}
```

### 4.4 使用方法

```tsx
// AuthGuard/index.tsx での使用例
import { AuthErrorBoundary } from "./AuthErrorBoundary";

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  return (
    <AuthErrorBoundary onRetry={() => window.location.reload()}>
      {/* 既存の実装 */}
    </AuthErrorBoundary>
  );
};
```

---

## 5. フォールバックUI詳細仕様

### 5.1 レイアウト

- **配置**: 画面中央（flex center）
- **背景**: `bg-[#0a0a0a]`（既存のAuthViewと同じ）
- **カード**: GlassPanelを使用、最大幅 `max-w-md`

### 5.2 要素

| 要素     | 仕様                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| アイコン | `alert-triangle`、サイズ48px、色 `text-red-400`                                     |
| タイトル | 「エラーが発生しました」、`text-xl font-semibold text-white`                        |
| 説明文   | 「認証処理中にエラーが発生しました。再試行してください。」、`text-white/60 text-sm` |
| ボタン   | `Button variant="primary"`、テキスト「再試行」                                      |

### 5.3 アクセシビリティ属性

```tsx
<div
  role="alert"
  aria-live="assertive"
  aria-labelledby="error-title"
  aria-describedby="error-description"
>
  <h2 id="error-title">エラーが発生しました</h2>
  <p id="error-description">
    認証処理中にエラーが発生しました。再試行してください。
  </p>
  <button type="button">再試行</button>
</div>
```

---

## 6. 完了条件（受け入れ基準）

### 6.1 機能完了条件

- [ ] CQ-EB-01: 子コンポーネントのエラーをキャッチできる
- [ ] CQ-EB-02: フォールバックUIが仕様通りに表示される
- [ ] CQ-EB-03: エラーログがコンソールに出力される
- [ ] CQ-EB-04: 再試行ボタンでエラー状態がリセットされる

### 6.2 品質完了条件

- [ ] TypeScript型エラーがない
- [ ] ESLintエラーがない
- [ ] ユニットテストが存在し、全て成功する
- [ ] アクセシビリティ要件を満たす

### 6.3 テストケース

| テストID | シナリオ                     | 期待結果                     |
| -------- | ---------------------------- | ---------------------------- |
| EB-01    | 正常時                       | 子コンポーネントが表示される |
| EB-02    | 子コンポーネントでエラー発生 | フォールバックUIが表示される |
| EB-03    | 再試行ボタンクリック         | エラー状態がリセットされる   |
| EB-04    | onRetryコールバック          | コールバック関数が呼ばれる   |
| EB-05    | エラーログ                   | console.errorが呼ばれる      |

---

## 7. 参照情報

### 7.1 関連ドキュメント

- [React Error Boundary公式ドキュメント](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- `docs/30-workflows/code-quality-improvements/task-login-only-auth-code-quality.md`

### 7.2 関連タスク

- T-01-2: Error Boundary設計
- T-02-1: Error Boundaryテスト作成
- T-03-2: Error Boundary実装

### 7.3 既存コンポーネント参照

- `apps/desktop/src/renderer/components/organisms/GlassPanel/index.tsx`
- `apps/desktop/src/renderer/components/atoms/Button/index.tsx`
- `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`
