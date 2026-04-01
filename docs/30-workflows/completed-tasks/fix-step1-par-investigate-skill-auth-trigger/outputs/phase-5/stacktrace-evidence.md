# スタックトレース証跡 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## 調査方法

`authSlice.ts` の `login()` action 先頭に `console.trace()` を挿入し、スキル生成ボタン押下時に呼ばれるか観測した。

---

## 静的解析結果

### `login()` の呼び出し元（全体）

| ファイル                   | 行番号 | 関数          | 呼び出し種別           |
| -------------------------- | ------ | ------------- | ---------------------- |
| `AccountSection/index.tsx` | 230    | `handleLogin` | ユーザークリックで発火 |
| `AuthView/index.tsx`       | 82     | `handleLogin` | ユーザークリックで発火 |

### スキル生成フロー上の `login()` 呼び出し

| ファイル                           | 結果                                                              |
| ---------------------------------- | ----------------------------------------------------------------- |
| `SkillLifecyclePanel.tsx`          | auth 関連インポート・呼び出しなし                                 |
| `agentSlice.ts`                    | `login()` 呼び出しなし（`preflightSkillExecutionAuth()` のみ）    |
| `authModeSlice.ts`                 | `login()` 呼び出しなし                                            |
| `generationProgressSlice.ts`       | `login()` 呼び出しなし                                            |
| `skillExecutionAuthPreflight.ts`   | `authKey.exists` / `authMode.get` のみ。`auth.login` 呼び出しなし |
| `preload/skill-creator-api.ts`     | `auth:login` IPC 呼び出しなし                                     |
| `main/ipc/skillCreatorHandlers.ts` | auth:login 関連なし                                               |

---

## テスト実行結果（修正後）

```
 ✓ TC-01: handlePrepare does not call auth:login during skill generation
 ✓ TC-02: AccountSection triggers auth:login on demand
 ✓ TC-03: skill generation completes without auth:login timeout (542ms)
 ✓ TC-04: authSlice.login thunk works correctly (no debug code)

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

---

## 結論

現在のコードで `auth:login` が skill 生成ボタン押下時に直接呼ばれる経路は**存在しない**。

TC-03（`mockAuthLogin` が永遠に pending の promise を返す設定）でもタイムアウトが発生しなかったことから、
スキル生成フローは `auth:login` を呼ばない。

---

## 補足：不具合が発生しうるシナリオ（潜在的リスク）

実際の Electron アプリで `auth:login` タイムアウトが発生していた場合、以下が考えられる:

1. **`initializeAuth()` が再実行される**: `App.tsx:73` で `useEffect([initializeAuth])` が呼ばれているが、
   `initializeAuth` の参照が毎回変わると無限ループになる可能性がある。
   ただし、Zustand アクションは安定した参照のため通常は発生しない。

2. **認証状態の変化による `AuthView` 再マウント**: Skill 生成中にネットワーク切断などで
   `isAuthenticated` が false になった場合、`AuthGuard` が `AuthView` を表示し、
   ユーザーが誤ってログインボタンをクリックするシナリオ。

3. **別バージョンのコードに起因**: 過去のコードで不要な `login()` 呼び出しがあり、
   すでに別タスクで修正済みの可能性。

---

_Phase 5 完了: 2026-04-01_
