# Documentation Changelog

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| タスク | TASK-FIX-AUTH-IPC-001                      |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 記録日 | 2026-04-01                                 |
| Phase  | 12                                         |

---

## 変更ファイル一覧

### current（本タスクで変更した実体ファイル）

| ファイル                                                                               | 状態    | 変更内容                                                                                           |
| -------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`                                            | updated | `await startOAuthFlow()` を `void startOAuthFlow().catch(console.error)` の fire-and-forget に変更 |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                                       | updated | 非ブロッキング化の回帰テスト追加（handler が即時 resolve することを検証）                          |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                    | updated | public IPC contract へ fire-and-forget 応答タイミング・completion semantics を同期                 |
| `.claude/skills/aiworkflow-requirements/references/architecture-auth-security-core.md` | updated | `AUTH_STATE_CHANGED` の state ownership が AuthFlowOrchestrator にあることを明記                   |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`         | updated | 「IPC タイムアウト制約下でのレスポンス分離」教訓を追加                                             |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | updated | TASK-FIX-AUTH-IPC-001 の完了記録を追記                                                             |

### baseline（本タスクで変更しなかった実体ファイル）

| ファイル                                                                              | 状態  | no-op である理由                                                                                                  |
| ------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/ipc-utils.ts`                                               | no-op | preload の表面（`safeInvoke` 呼び出し・引数型・戻り値型）は変更なし。応答タイミングの変更は main 側だけで完結する |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md` | no-op | preload 境界（IPC surface・contextBridge 設定）に変更がないため同期不要                                           |

---

## preload が no-op である理由（詳細）

`auth:login` の fire-and-forget 化は **main プロセス内の handler 実装**の変更であり、
preload が公開する `safeInvoke('auth:login', ...)` の**シグネチャ・引数型・戻り値型**はすべて変更なし。

- `ipc-utils.ts` の `safeInvoke` はチャンネル名と引数を main に転送するだけ
- レスポンス受取の変更（即時 `{ success: true }` が返るようになった）は renderer 側の UI ロジックで処理される変更ではない
- preload は型安全のブリッジ役を担うのみで、内部実装の非同期戦略変更には関与しない

---

## task-workflow.md への完了記録

- ファイル: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- 状態: **updated**
- 記録内容: TASK-FIX-AUTH-IPC-001 の実施日・変更ファイル・lessons-learned 参照を追記済み

---

## topic-map.md 再生成の有無

- 状態: **不要（再生成なし）**
- 理由: 今回の変更は既存の `auth:login` チャンネルの**内部実装変更**であり、新規チャンネル追加・チャンネル廃止・新規モジュール追加はない。topic-map の構造（カテゴリ・エントリ）は変更の影響を受けない。

---

## 変更サマリー

| 区分     | ファイル数 |
| -------- | ---------- |
| updated  | 6          |
| no-op    | 2          |
| **合計** | **8**      |
