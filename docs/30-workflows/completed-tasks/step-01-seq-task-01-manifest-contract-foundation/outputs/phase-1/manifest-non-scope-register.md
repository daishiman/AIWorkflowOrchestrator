# Manifest Non-Scope Register

manifest に入れない責務を先に固定した。

| 非責務                                                  | owner                       | 根拠                                     |
| ------------------------------------------------------- | --------------------------- | ---------------------------------------- |
| runtime policy / `authMode`                             | `RuntimeSkillCreatorFacade` | route authority を manifest に委譲しない |
| public IPC channel / sender validation / error envelope | `creatorHandlers.ts`        | manifest は IPC authority を持たない     |
| preload timeout / `safeInvoke` / `safeOn`               | `skill-creator-api.ts`      | preload security boundary を維持する     |
| execute / improve / handoff ルーティング                | `RuntimeSkillCreatorFacade` | manifest は execution engine ではない    |
| session persistence / permission / verify               | 後続 task                   | foundation task では扱わない             |
| UI / renderer 導線                                      | 後続 task                   | docs-only foundation で閉じる            |

## 失敗ケースに落とした禁止項目

- `authMode`
- `permission`
- `session`
- `route`
- `verify`
- 任意の unknown top-level field
