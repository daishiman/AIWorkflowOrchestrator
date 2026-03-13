# Acceptance Criteria

## 表示制御

1. 初回利用時（`onboarding.hasCompleted` が falsy）に onboarding wizard が自動表示される。
2. `onboarding.hasCompleted = true` の場合、アプリ起動時に自動表示されない。
3. Settings 画面の「はじめてガイドを再表示」ボタン（`data-testid="settings-open-onboarding"`）をクリックすると wizard が開く。

## Step 1（名前）

4. Step 1 で入力した名前が同一画面内のプレビューカード（`data-testid="onboarding-name-preview"`）にリアルタイムで反映される。
5. 名前フィールドが空欄のまま「次へ」を押しても Step 2 に進行できる（空欄は許容）。
6. プレビュー表示は名前が空欄の場合「User」、入力がある場合は入力値のトリム後の文字列になる。
7. `"User"` / `"ユーザー"` を初期値として渡した場合、Step 1 の入力フィールドは空欄として扱われる（汎用名正規化）。

## Step 2（AI おためし）

8. `SuggestionBubble` コンポーネントを `size="lg"` で使用し、既存の atom API を変更しない。
9. Bubble を選択するまで「次へ」ボタンが非活性（disabled）になっている。
10. Bubble を選択するとモック応答パネル（`data-testid="onboarding-ai-response"`）が表示される。
11. モック応答はネットワーク通信なしに表示される（外部 API 依存なし）。

## Step 3（スターター用途）

12. 3 択（workspace / skillCenter / agent）のいずれかを選択するまで「完了する」ボタンが非活性になっている。
13. 選択結果が `onboarding.selectedStarterTool` キーとして `electronAPI.store.set` で保存される。
14. Step 3 の UI 文言（「ここでは「何から始めたいか」だけを保存します。ツールの即時インストールは行いません。」）が「即時インストール」を誤認させない表現になっている。

## Step 4（テーマ）

15. テーマ選択肢が 4 択（`kanagawa-dragon` / `light` / `dark` / `system`）の `ThemeMode` 型の全値に対応している。
16. テーマ選択を変更すると `ThemePreviewCard`（`data-testid="onboarding-theme-preview"`）が即座に切り替わる。
17. 完了時に `setThemeMode()` が呼ばれ、グローバルテーマに反映される。

## 完了・永続化

18. 完了時に `onboarding.hasCompleted=true`、`onboarding.userName`、`onboarding.selectedStarterTool`、`onboarding.lastCompletedAt` が `electronAPI.store.set` で保存される。
19. 名前が非空の場合、`updateUserProfile({ name })` によって Dashboard greeting に反映される。名前が空の場合は `updateUserProfile` を呼ばない。
20. 完了サマリー画面（`data-testid="onboarding-step-complete"`）に Name / Start Here / Theme の 3 カード要約が表示される。
21. 完了後に `currentView` が `"dashboard"` に遷移する。

## アクセシビリティ・品質

22. dialog ルートが `role="dialog"` / `aria-modal="true"` / `aria-labelledby` / `aria-describedby` を持つ。
23. Tab / Shift-Tab でフォーカストラップが機能し、ダイアログ外にフォーカスが抜けない。
24. `allowDismiss=true` の状態で Escape キーを押すと wizard が閉じる。`isCompleting` 中または完了サマリー画面では Escape が無効になる。
25. 公開シェル / settings AuthGuard バイパス契約を壊さない。
26. Phase 3 review gate が `PASS` または `PASS WITH MINOR` 以上である。
