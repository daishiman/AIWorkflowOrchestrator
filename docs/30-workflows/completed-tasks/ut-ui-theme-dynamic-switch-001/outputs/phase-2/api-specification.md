# Phase 2 API仕様

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 担当: SubAgent-B

## IPCチャンネル

| チャンネル             | 方向             | 入力                        | 出力                        | 目的               |
| ---------------------- | ---------------- | --------------------------- | --------------------------- | ------------------ |
| `theme:get`            | Renderer -> Main | なし                        | `{ mode, resolvedTheme }`   | 保存済みテーマ取得 |
| `theme:set`            | Renderer -> Main | `{ mode }`                  | `{ mode, resolvedTheme }`   | 保存と解決         |
| `theme:get-system`     | Renderer -> Main | なし                        | `{ isDark, resolvedTheme }` | 現在OSテーマ取得   |
| `theme:system-changed` | Main -> Renderer | `{ isDark, resolvedTheme }` | event                       | OSテーマ変更通知   |

## 型仕様

- `ThemeMode`: `kanagawa-dragon | light | dark | system`
- `ResolvedTheme`: `kanagawa-dragon | light | dark`
- `validateThemeMode(mode)` で入力検証

## 永続化仕様

- Store名: `knowledge-studio-theme`
- キー: `theme.mode`
- 既定値: `system`（Main）
- Rendererフォールバック: `kanagawa-dragon`

## エラーハンドリング

- `theme:set` の不正入力は `success: false` で返却。
- `theme:get` / `theme:get-system` 失敗時は安全な既定値で `success: true` を返却。
