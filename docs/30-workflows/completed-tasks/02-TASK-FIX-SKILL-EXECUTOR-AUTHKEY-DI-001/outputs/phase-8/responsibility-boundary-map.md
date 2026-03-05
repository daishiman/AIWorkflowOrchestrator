# Phase 8 責務境界マップ

## 境界定義

| 層                                    | 主責務               | 本タスクの確定事項                                           |
| ------------------------------------- | -------------------- | ------------------------------------------------------------ |
| Main IPC (`ipc/index.ts`)             | 依存生成・配線       | `AuthKeyService`を単一生成し、Skill/Auth系ハンドラに共有注入 |
| Main Handler (`ipc/skillHandlers.ts`) | チャネル登録・委譲   | `SkillExecutor`へ`authKeyService`を注入し、実行契約を維持    |
| Service (`SkillExecutor`)             | 実行時キー判定       | 注入サービス優先 + env fallbackの優先順序を維持              |
| Preload (`preload/skill-api.ts`)      | 例外整形・境界公開   | `errorCode`を`Error.code`へ転写しRendererへ伝搬              |
| Renderer (`useSkillExecution`)        | preflight/UI状態遷移 | 未設定時に実行抑止し、Main最終防衛と整合                     |

## 禁止事項（再発防止）

- Main composition root外で`AuthKeyService`を重複生成しない。
- `registerSkillHandlers`の引数を暗黙依存へ戻さない。
- `AUTHENTICATION_ERROR`のエラーコード変換仕様を破壊しない。

## SubAgent-D統合判定

- 矛盾: なし
- 漏れ: なし
- 整合性: あり
- 依存関係: あり（Phase 5実装 + Phase 7分析と整合）
