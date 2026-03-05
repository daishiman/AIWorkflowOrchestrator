# Phase 2 IPC契約設計

## 1. 契約対象

- `IPC_CHANNELS.AUTH_STATE_CHANGED`
- `profile.getProviders()` 応答 `linkedProviders`

## 2. 入出力契約

| 経路                                     | 期待契約           | 設計                                |
| ---------------------------------------- | ------------------ | ----------------------------------- |
| Main → Renderer (`AUTH_STATE_CHANGED`)   | `user?: AuthUser`  | `toAuthUser` を強制適用             |
| Main → Renderer (`profile.getProviders`) | `LinkedProvider[]` | Rendererで配列正規化 + 要素フィルタ |

## 3. エラー契約

- 契約違反（shape不一致）は `warn` ログ化し、処理は継続。
- 業務エラー（network/auth）は既存 `AuthError` 経路を維持。

## 4. 互換性判定

- 新規チャンネル追加: なし
- 既存チャンネル削除: なし
- 既存payload意味変更: なし（shape整合のみ）
