# Design Review Result

## 判定

- 総合判定: `PASS WITH CONDITIONS`
- レビュー実施日: 2026-03-13
- 実装コード照合: 完了（OnboardingWizard/index.tsx, App.tsx, SettingsView/index.tsx）

## 主なレビュー観点と結果

| 観点                  | 結果                   | コメント                                                                                                                                                                                                                                                                                   |
| --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 公開シェル整合        | **Pass（実装確認済）** | `App.tsx` L382-408 で overlay 方式を実装。`renderCatchAllElement()` 内で `{content}` の後に `<OnboardingWizard>` を重ねており、新規 ViewType 追加なし。settings バイパス契約（L387-392）とも衝突しない                                                                                     |
| 永続化 API            | **Pass（実装確認済）** | `electronAPI.store.get/set` を `readOnboardingValue` / `writeOnboardingValue` でラップして使用（App.tsx L98-147）。新規 IPC チャネルなし                                                                                                                                                   |
| Display Name 整合     | **Pass（実装確認済）** | `handleCompleteOnboarding` 内で `updateUserProfile({ name: trimmedName })` を呼び出し（App.tsx L253-255）。`useDisplayName()` は `state.userProfile.name` をフォールバック 3段目として参照（store/index.ts L284）。Dashboard greeting はこの selector を使用しており反映経路が確定している |
| Theme 契約            | **Pass（実装確認済）** | `ThemeMode = "kanagawa-dragon" \| "light" \| "dark" \| "system"` 4値契約を維持（store/types.ts L156）。THEME_OPTIONS は全4値を定義し、完了時に `setThemeMode(payload.themeMode)` を呼び出す（App.tsx L250）                                                                                |
| Step 3 実現性         | **Pass（実装確認済）** | 文言「ここでは「何から始めたいか」だけを保存します。ツールの即時インストールは行いません。」が実装済み（OnboardingWizard/index.tsx L642-643）。`selectedStarterTool` の intent 保存のみで actual import なし                                                                               |
| 既存 atom API 非破壊  | **Pass（実装確認済）** | `SuggestionBubble` を `label`, `icon`, `onClick`, `size` props で呼び出し（index.tsx L587-592）。既存 API 契約（label, onClick, size, icon, disabled）を破壊していない                                                                                                                     |
| hasCompleted 破壊防止 | **Pass（実装確認済）** | Settings 再表示は `setIsOnboardingForcedOpen(true)` で強制 open し、`hasCompleted` を書き換えない（App.tsx L224-227）。完了時のみ `writeOnboardingValue(hasCompleted, true)` を実行                                                                                                        |

## blocking issue の有無

- なし

## 新たに発見した注意事項（MINOR）

### M-01: system theme のデフォルト選択挙動

`initialThemeMode` prop のデフォルトは `DEFAULT_THEME_MODE = "kanagawa-dragon"` であり（index.tsx L25, L243）、App.tsx では `initialThemeMode={themeMode}` で現在値を渡す（L403）。初回起動時に `themeMode` が `"system"` の場合、Step 4 では `system` カードが選択状態になる。設計では「system は補助選択または未提示でもよい」とあるが、実装では表示される。Phase 4 テストで初期選択状態を明示的に検証すること。

### M-02: selectedBubbleId 未選択時の完了ブロック

`handleComplete` は `!selectedBubbleId || !selectedStarterTool` の場合に早期 return する（index.tsx L362-364）。Step 2 と Step 3 をスキップして完了ボタンを押しても保存されない。受け入れ基準 AC-4「名前未入力でも進める」に準拠した「bubble 未選択でも進める」仕様かどうか Phase 4 で確認が必要。

## レビュー結論

設計は Phase 4 へ進める品質に達している。実装コードとの照合により、Display Name 反映経路（`updateUserProfile` → `useDisplayName` フォールバック）が設計どおり確定していることを確認した。M-01・M-02 は Phase 4 のテスト設計で拘束条件として扱う。
