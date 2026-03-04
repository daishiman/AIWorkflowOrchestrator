# Phase 7 カバレッジ計画

## 対象境界

| 境界     | 対象                               | 目標                   |
| -------- | ---------------------------------- | ---------------------- |
| Main IPC | `skill:execute`, `auth-key:exists` | 契約分岐 100%確認      |
| Preload  | `safeInvokeUnwrap`                 | `errorCode` 分岐網羅   |
| Renderer | AgentView / Hook / Store           | preflight 成否分岐網羅 |

## カバレッジ達成戦略

1. 契約境界（Main/Preload）を先に固定。
2. UI層は「実行前停止」「設定誘導表示」を独立検証。
3. 回帰セット 7ファイルを継続実行して変更の局所性を維持。
