# Gap Resolution List

更新日: 2026-03-13（実装コード照合によりすべて検証済）

| Gap                                                        | 影響                   | 解消方針                                      | 状態     | 実装確認                                                                                                                                                                     |
| ---------------------------------------------------------- | ---------------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `electronAPI.config` が現行コードに存在しない              | 永続化設計が成立しない | `electronAPI.store.get/set` に置換            | Resolved | `readOnboardingValue` / `writeOnboardingValue` で実装済み（App.tsx L98-147）                                                                                                 |
| `onboardingUserName` 単独保存では Dashboard に反映されない | Step 1 の価値が薄れる  | `useDisplayName()` フォールバック設計を必須化 | Resolved | 完了時に `updateUserProfile({ name: trimmedName })` を呼び出し、`useDisplayName()` が `state.userProfile.name` を参照する経路が確定（App.tsx L253-255, store/index.ts L284） |
| `ThemeSelector` 直利用でライトテーマ負債を再注入する       | UI 品質が悪化          | onboarding 専用 `ThemePreview` 新設           | Resolved | `ThemePreviewCard` コンポーネントを index.tsx 内に実装。semantic token ベースのクラス名を使用しており、ライトテーマ負債を再注入しない（index.tsx L182-237）                  |
| Step 3 のツール追加対象が不明                              | 虚偽導線になる         | starter intent 保存に変更                     | Resolved | 文言「ツールの即時インストールは行いません」が実装済み。STARTER_TOOLS は intent 識別子のみを定義し、actual import なし（index.tsx L57-79, L641-643）                         |
| settings 公開シェルと wizard 表示条件の競合                | 表示崩れや導線破綻     | App shell overlay + Settings 強制再表示フラグ | Resolved | `shouldShowOnboarding` フラグで表示制御。settings バイパス契約（currentView === "settings" を AuthGuard から除外）と overlay 表示が独立して動作（App.tsx L382-408）          |

## 新規 Gap（Phase 4 対応）

| Gap                                                         | 影響                                      | 解消方針                                                       | 状態         |
| ----------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- | ------------ |
| M-01: system theme が初回起動時に選択状態になる場合がある   | テスト期待値が設計意図と乖離する          | Phase 4 テストで `system` 初期状態のシナリオを明示的に検証     | Phase 4 対応 |
| M-02: bubble 未選択時の完了ブロック仕様が明文化されていない | AC-4 の「空欄でも進める」との整合が不明瞭 | Phase 4 テストで「bubble 未選択 → 完了ボタン無効」ケースを追加 | Phase 4 対応 |
