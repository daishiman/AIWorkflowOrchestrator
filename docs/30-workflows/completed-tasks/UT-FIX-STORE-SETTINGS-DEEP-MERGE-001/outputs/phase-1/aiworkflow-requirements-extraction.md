# aiworkflow-requirements 抽出結果

## IPC 契約要件

- `settings:update` チャネルは `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に含まれている
- ハンドラは `IPC_CHANNELS.USER_SETTINGS_UPDATE` (`"settings:update"`) で登録
- 入力型: `Record<string, unknown>` (部分更新ペイロード)
- 出力型: `{ success: boolean; error?: string }`

## エラーハンドリング基準

- try/catch でエラーを捕捉し `{ success: false, error: message }` を返す
- `safeInvoke` パターンに準拠

## 型安全性要件

- `any` 型禁止（TypeScript strict モード準拠）
- ジェネリクス `T extends Record<string, unknown>` でネスト構造を型安全に扱う

## 教訓（lessons-learned）

- シャロー vs ディープマージ戦略は Phase 2 設計で明示的に決定すること
- `Record<string, unknown>` 型はマージ戦略の設計を曖昧にしやすい
