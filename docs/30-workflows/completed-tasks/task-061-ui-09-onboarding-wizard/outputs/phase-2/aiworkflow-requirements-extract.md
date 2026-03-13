# AIWorkflow Requirements Extract

## 参照した正本仕様の要点

| 要件カテゴリ     | 要点                                                              |
| ---------------- | ----------------------------------------------------------------- |
| Navigation       | 公開シェルと導線再編の整合を最優先にする                          |
| Settings         | 設定画面は再表示や永続設定の正式導線である                        |
| Components       | 既存 primitive の API を壊さず組み合わせで拡張する                |
| Design System    | semantic token を通す。ライトテーマ負債を増やさない               |
| State Management | Renderer UI state と persistence を分離する                       |
| Workflow         | Phase 1-3 を gate として扱う                                      |
| Lessons Learned  | 実在する契約を優先し、仮想 API を前提にしない（P44/P45 対策）     |
| Apple HIG        | 8px グリッド、角丸 8-32px、影は繊細に、WCAG 2.1 AA 準拠           |
| Accessibility    | focus trap、Escape キーで閉じる、aria-modal、aria-labelledby 必須 |
| Error Handling   | IPC 失敗時は in-memory state にフォールバック（完了フラグ除く）   |

## task-061 への適用結果（実装確認済み）

1. **Onboarding は route ではなく overlay**: `ViewType` を増やさず `renderCatchAllElement()` 末尾に `<OnboardingWizard>` を追加。AuthGuard の外側に配置
2. **保存は `electronAPI.store`**: `readOnboardingValue` / `writeOnboardingValue` ヘルパー経由。新規 IPC channel なし
3. **Step 2 は SuggestionBubble 再利用**: `<SuggestionBubble label={} icon={} onClick={} size="lg" />` をそのまま使用
4. **Step 4 は onboarding 専用 preview**: `ThemePreviewCard` コンポーネント（同ファイル内）で独立実装。`ThemeSelector` は不使用
5. **Step 3 は intent-first**: ツールのインストールは行わず「最初に触りたい導線」のみ保存
6. **Phase 1-3 完了を仕様上の gate として明示**: 本設計文書群が Phase 3 レビューゲートの成果物

## 実装で確認された追加要件

- **`completionError` のインライン表示**: `onComplete` 失敗時は footer 内にエラー文字列を表示（外部エラー境界なし）
- **`isOnboardingDismissed` フラグ**: 未完了 close 後の再表示防止に使用。セッション内のみ有効（永続化しない）
- **`getFallbackOnboardingName()`**: `userProfile.name` が汎用名（`"User"` / `"ユーザー"`）の場合は空文字で初期化
- **`normalizeInitialName()`**: 初期値から汎用名を除去する純粋関数。`GENERIC_NAMES = new Set(["User", "ユーザー"])`
- **`isOnboardingStarterToolId()`**: store から取得した値の型ガード。`unknown` 型の値が `OnboardingStarterToolId` かを検証
- **`system` テーマの選択可能化**: 設計では「未提示でもよい」としたが実装では4択に含めた

## Apple HIG 準拠確認

| 要件              | 実装状況                                                                    |
| ----------------- | --------------------------------------------------------------------------- |
| 角丸統一          | modal: `rounded-[32px]`、カード: `rounded-[28px]`、内部: `rounded-[24px]`   |
| 8px グリッド      | padding: `p-6`（24px）、gap: `gap-3`/`gap-4`/`gap-6`                        |
| WCAG コントラスト | `var(--text-primary)` / `var(--text-secondary)` token 経由                  |
| focus trap        | `getFocusableElements()` + Tab/Shift+Tab trap 実装済み                      |
| Escape キー       | `allowDismiss && !isCompleting` の場合のみ閉じる                            |
| aria ラベル       | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` |
| フォーカス復元    | `previousFocusRef` で close 時に元要素へ復元                                |
