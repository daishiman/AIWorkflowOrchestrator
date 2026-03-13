# Scope Definition

## In Scope

- Onboarding overlay の要件定義・設計・実装（`OnboardingWizard` コンポーネント）
- 4 ステップ UI（名前 / AI おためし / スターター用途 / テーマ）と完了サマリー画面の仕様
- `electronAPI.store.get/set` を使った永続化設計（4キー）
- Settings からの再表示導線（`onOpenOnboarding` コールバック）
- Dashboard greeting への名前反映設計（`updateUserProfile` 連携）
- Step 3 の starter intent 保存設計（`selectedStarterTool` キー）
- アクセシビリティ対応（フォーカストラップ、ARIA 属性、Escape キー）
- レスポンシブ対応（`sm:` / `lg:` ブレークポイント）

## Out of Scope

- 実 skill import / 自動インストール
- 実際の API 呼び出しを伴う AI 応答（Step 2 はモック固定）
- 新規認証フロー変更
- 新規 IPC チャネルの導入
- `useDisplayName()` セレクタの新規作成（`updateUserProfile` 既存 API を使う）
- PR 作成、コミット、デプロイ

## 依存関係（実装照合済み）

| 依存先                                  | 用途                                                             | 状態                 |
| --------------------------------------- | ---------------------------------------------------------------- | -------------------- |
| `App.tsx` overlay mount                 | `shouldShowOnboarding` 判定と `OnboardingWizard` レンダリング    | 実装済み             |
| `SettingsView` `onOpenOnboarding` props | 再表示ボタン導線                                                 | 実装済み             |
| `electronAPI.store.get/set`             | 永続化読み書き                                                   | 既存 API 使用        |
| `setThemeMode()`                        | テーマ適用（`App.tsx` の `handleCompleteOnboarding` で呼び出し） | 既存 IPC 使用        |
| `updateUserProfile({ name })`           | Dashboard greeting への名前反映                                  | 既存 action 使用     |
| `SuggestionBubble` atom                 | Step 2 の選択肢 UI                                               | `size="lg"` で再利用 |
| `ThemeMode` 型（`store/types.ts`）      | Step 4 の 4 値契約                                               | 既存型に準拠         |

## 主なリスク

- 表示名を `onboarding.userName` のみに保存すると `updateUserProfile` が呼ばれず、Dashboard greeting に反映されない。`updateUserProfile` の呼び出し条件（名前が非空）を正確に守ること。
- Step 3 の言い回しを誤ると存在しない import 機能を期待させる。UI 文言に「即時インストールは行いません」を明示すること。
- ThemePreview を既存の ThemeSelector と混同すると、オンボーディング用のインライン preview スタイル（固定 className）と semantic token ベーススタイルが衝突し、ライトテーマ負債を再注入する。`ThemePreviewCard` はオンボーディング専用コンポーネントとして分離することで回避済み。
- `allowDismiss` 途中終了時に `hasCompleted` を誤って `true` に設定すると再表示不可になる。`handleCloseOnboarding` と `handleCompleteOnboarding` のフラグ管理を明確に区別すること。
