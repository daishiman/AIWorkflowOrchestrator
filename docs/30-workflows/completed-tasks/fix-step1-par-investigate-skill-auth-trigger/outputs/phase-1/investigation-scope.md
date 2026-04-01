# 調査スコープ定義 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## 静的解析サマリー

SubAgent A/B による並列静的解析を実施した。

### 判明した事実（ファクト）

| ファイル                          | 調査結果                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `authSlice.ts:287`                | `window.electronAPI.auth.login()` を唯一直接呼ぶ箇所。`login()` action の先頭で呼ばれる               |
| `AccountSection/index.tsx:89,230` | `const login = useAppStore(state => state.login)` → `handleLogin(provider)` でのみ呼出                |
| `AuthView/index.tsx:65,82`        | `const login = useAppStore(state => state.login)` → `handleProviderLogin(provider)` でのみ呼出        |
| `agentSlice.ts`                   | `login()` の参照なし。`preflightSkillExecutionAuth()` を呼ぶが `authKey.exists` / `authMode.get` のみ |
| `authModeSlice.ts`                | `authMode.get/set/status/validate/onModeChanged` のみ。`auth.login` の参照なし                        |
| `SkillLifecyclePanel.tsx`         | `login` の参照なし。useEffect 7箇所すべてを確認、auth 呼び出しなし                                    |
| `skillExecutionAuthPreflight.ts`  | `authMode.get()` + `authKey.exists()` のみ。`auth.login` の参照なし                                   |
| `preload/index.ts:216`            | `safeInvoke(IPC_CHANNELS.AUTH_LOGIN, request)` を `auth.login` として expose                          |
| `preload/ipc-utils.ts`            | タイムアウト = `IPC_TIMEOUT_MS = 5000ms`。応答なしで reject                                           |

### 静的解析の限界

- `useAppStore((state) => state.login)` を subscribe するコンポーネントは `AccountSection` と `AuthView` の 2 箇所のみ
- どちらもユーザー操作（ボタンクリック）でのみ `login()` を呼ぶ
- スキル生成フロー（handlePrepare → detectMode → planSkill）からの直接的な `login()` 呼び出しは**確認されない**
- → **動的な呼び出しパス（useEffect 連鎖、条件付きマウント）が存在する可能性が高い**

---

## 調査対象ファイル（優先順位付き）

| 優先度 | ファイル                                                             | 理由                                                                                     |
| ------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 高     | `apps/desktop/src/renderer/store/slices/authSlice.ts`                | `console.trace()` 挿入対象。`login()` が呼ばれた瞬間に記録                               |
| 高     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | スキル生成の state 変化が useEffect を誘発する可能性                                     |
| 中     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 7つの useEffect を持つ。依存配列が不適切な場合がある                                     |
| 中     | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`            | `fetchMode()` → `fetchStatus()` 連鎖が副作用を持つ可能性                                 |
| 中     | `apps/desktop/src/renderer/App.tsx`                                  | `initializeAuth()` を `useEffect([initializeAuth])` で呼ぶ。スキル生成と無関係だが確認要 |
| 低     | `apps/desktop/src/renderer/components/AuthGuard/index.tsx`           | `isDevMode()` が false の場合 `AuthView` をレンダリング。AuthView が login を持つ        |

---

## 除外範囲

以下はこのタスクの調査・修正対象外とする:

| 除外項目                                                  | 理由                                                   |
| --------------------------------------------------------- | ------------------------------------------------------ |
| 認証フロー全体の再設計                                    | スコープ外。最小変更で止血する                         |
| Main Process 側の auth ハンドラー                         | `auth:login` を呼び出している（Renderer 側）の特定が先 |
| `AccountSection` / `AuthView` の正当な `login()` 呼び出し | 既知の正当パスであり修正対象外                         |
| TASK-FIX-AUTH-IPC-001 の作業内容                          | 並列タスクだが本タスクのスコープ外                     |
| TASK-FIX-IPC-TIMEOUT-001 の作業内容                       | 並列タスクだが本タスクのスコープ外                     |

---

## 正当な auth:login 呼び出しパス（修正で壊さないこと）

```
AccountSection → handleLogin(provider) → login(provider) → window.electronAPI.auth.login({ provider })
AuthView → handleProviderLogin(provider) → login(provider) → window.electronAPI.auth.login({ provider })
```

---

## 検証4条件（完了基準）

| 番号 | 条件                 | 達成状況                  |
| ---- | -------------------- | ------------------------- |
| 1    | スタックトレース取得 | PENDING（Phase 5 で実施） |
| 2    | 呼び出し元特定       | PENDING（Phase 5 で実施） |
| 3    | トリガー条件特定     | PENDING（Phase 5 で実施） |
| 4    | 修正方針確定         | PENDING（Phase 5 で実施） |

---

## 並列実行候補タスクの確認

| タスク                   | 状態   | 本タスクとの関係                                     |
| ------------------------ | ------ | ---------------------------------------------------- |
| TASK-FIX-AUTH-IPC-001    | 未確認 | auth handler 側の修正（本タスクと並列実行可能）      |
| TASK-FIX-IPC-TIMEOUT-001 | 未確認 | IPC タイムアウト設定の修正（本タスクと並列実行可能） |

---

_Phase 1 完了: 2026-04-01_
