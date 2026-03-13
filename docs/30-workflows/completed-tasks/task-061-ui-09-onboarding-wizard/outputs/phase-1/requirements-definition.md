# Requirements Definition

## 背景

原本 task-061 はオンボーディング体験の方向性として妥当だが、現行アプリの view 契約、設定保存 API、表示名ロジック、テーマ契約を前提に再構成しないと実装整合が崩れる。

## 現行システム調査からの確定事項（実装照合済み）

1. `settings` は `App.tsx` で AuthGuard をバイパスする例外として扱われる。オンボーディングは独立 view 追加ではなく `App.tsx` 内の overlay として統合されている（`z-[80]` で全 view の上に重なる）。
2. 永続化の正本は `window.electronAPI.store.get/set` であり、`electronAPI.config` 新設は不要。`ONBOARDING_STORE_KEYS` 定数が `OnboardingWizard/index.tsx` で公開されており、`App.tsx` がインポートして使用する。
3. Dashboard greeting への名前反映は `updateUserProfile({ name: trimmedName })` で行う。`onboarding.userName` キーと `userProfile.name` の2箇所に保存されるため、オンボーディング専用キーだけを参照するとプロフィールに反映されない。名前が空欄の場合は `updateUserProfile` を呼ばず、既存プロフィール名を維持する。
4. テーマ保存は `ThemeMode` 4値契約（`"kanagawa-dragon" | "light" | "dark" | "system"`）と `setThemeMode()` IPC 呼び出しで行う。`onboarding.themeMode` のような専用ストアキーは存在しない。
5. `SuggestionBubble` は Workspace/Dashboard で既に利用されており、atom の API 破壊は避けるべき。Step 2 では `SuggestionBubble` を `size="lg"` で再利用し、モック応答は `OnboardingWizard` 内部の定数から取得する。
6. Step 3 の実 skill import は含めない。選択結果（`workspace` / `skillCenter` / `agent` の3択）は `onboarding.selectedStarterTool` に保存するのみで、view 遷移や自動インストールは行わない。
7. 完了後の遷移先は `setCurrentView("dashboard")` で固定される。
8. `allowDismiss` props が `true` の場合は閉じるボタンと Escape キーで途中終了できる。初回表示時は `allowDismiss: true` で提供する（App.tsx 実装確認済み）。
9. Step 2 の選択（`selectedBubbleId`）は完了ペイロード `OnboardingCompletionPayload` に含まれるが、永続化キーには含まれない（メモリ上のみ）。
10. 表示名の正規化: `"User"` / `"ユーザー"` は汎用名として扱い、Step 1 初期値を空欄にする（`GENERIC_NAMES` セット）。

## Functional Requirements

- FR-01: 初回利用（`onboarding.hasCompleted` が falsy）または強制再表示状態で onboarding overlay を開く。
- FR-02: Step 1 で名前を入力すると、同一画面内のプレビューカードに即座に反映される。名前が空の場合は `"User"` をプレビュー表示する。
- FR-03: Step 1 の名前入力は空欄のまま「次へ」で進行できる。空欄で完了した場合は `updateUserProfile` を呼ばず、既存プロフィール名を維持する。
- FR-04: Step 2 は 3 つの `SuggestionBubble`（要点/次の一手/不具合）から 1 つを選択する。未選択では「次へ」が非活性になる。
- FR-05: Step 2 の応答はコンポーネント内部の定数から取得するモック応答であり、ネットワーク接続を要求しない。
- FR-06: Step 3 は 3 択（`workspace` / `skillCenter` / `agent`）から 1 つを選択する。未選択では「完了する」が非活性になる。選択結果は意図の保存のみであり、即時インストールを行わない旨をUI文言で明示する。
- FR-07: Step 4 はテーマを 4 択（`kanagawa-dragon` / `light` / `dark` / `system`）から選択する。選択変更と同時に右側の `ThemePreviewCard` が切り替わる。
- FR-08: 完了時に `onboarding.hasCompleted=true`、`onboarding.userName`、`onboarding.selectedStarterTool`、`onboarding.lastCompletedAt` を `electronAPI.store.set` で保存し、テーマを `setThemeMode()` で適用する。名前が非空の場合は `updateUserProfile({ name })` でプロフィールにも反映する。
- FR-09: 完了後は `currentView` を `"dashboard"` にセットし、完了サマリー画面（Step 5）を表示する。
- FR-10: Settings から `onOpenOnboarding` コールバック経由で wizard を再表示できる。再表示時は既存の保存値（名前・スターター用途）を初期値として渡す。

## Non-Functional Requirements

- NFR-01: 既存公開シェル契約（`App.tsx` の AuthGuard バイパス、IPC チャネル）を壊さない。
- NFR-02: 新規 IPC チャネルを追加しない。`store.get/set` と `setThemeMode` の既存 API のみを使用する。
- NFR-03: semantic token（`var(--bg-primary)` 等）ベースのスタイルを維持し、Tailwind arbitrary values で実装する。
- NFR-04: キーボード操作（Tab/Shift-Tab フォーカストラップ、Escape で閉じる）とスクリーンリーダー対応（`role="dialog"`、`aria-modal`、`aria-labelledby`、`aria-describedby`）を含む。
- NFR-05: `max-w-[1040px]` + レスポンシブ grid（`sm:` / `lg:` ブレークポイント）で Mobile/Tablet/Desktop 幅で破綻しない。

## 永続化キー（実装コードと一致確認済み）

| キー                             | 型                                        | 説明                                    |
| -------------------------------- | ----------------------------------------- | --------------------------------------- |
| `onboarding.hasCompleted`        | boolean                                   | 完了フラグ。true の場合は自動表示しない |
| `onboarding.userName`            | string                                    | 入力された表示名（空文字可）            |
| `onboarding.selectedStarterTool` | `"workspace" \| "skillCenter" \| "agent"` | 選択されたスターター用途                |
| `onboarding.lastCompletedAt`     | string (ISO 8601)                         | 完了日時                                |

※ テーマ選択は `onboarding.*` キーには含まれない。`setThemeMode()` IPC 経由でグローバルテーマに適用される。

## 制約

- Step 3 は actual skill import や agent 自動追加を含めない。
- `allowDismiss: true` の場合、途中終了しても `onboarding.hasCompleted` は false のまま維持される（次回起動時に再表示される）。
- Phase 1-3 完了前に実装へ進まない。
- 本 workflow では検証実行を行わない。
