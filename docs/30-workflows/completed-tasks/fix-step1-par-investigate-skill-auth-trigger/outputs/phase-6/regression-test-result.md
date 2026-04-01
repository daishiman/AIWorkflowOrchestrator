# リグレッションテスト結果 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## Phase 6 実行結果

### コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

### 実行結果（最終）

```
 ✓ src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx (9 tests) 363ms
   ✓ TC-01: SkillLifecyclePanel prepare flow does not call auth:login during skill generation
   ✓ TC-02: AccountSection triggers auth:login on demand
   ✓ TC-03: skill generation completes without auth:login timeout
   ✓ TC-04: authSlice.login thunk works correctly (no debug code)
   ✓ TC-04: authSlice.login thunk works correctly (no debug code) — console.trace が存在しないこと
   ✓ TC-05: skill generation does not call auth:login when user is unauthenticated
   ✓ TC-06: rapid skill generation clicks do not trigger multiple auth:login
   ✓ TC-07: auth:login is not triggered on component re-render during skill flow
   ✓ TC-08: authModeSlice state changes do not trigger unexpected auth:login

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  08:58:02
   Duration  21.08s
```

---

## TC-08 修正内容

**観点変更**: `authModeSlice.initializeAuthMode()` の smoke test ではなく、
`setMode("api-key")` の IPC / state 連動を確認するテストに変更した。

**確認内容**:

- `authMode.set({ mode: "api-key" })` が 1 回だけ呼ばれる
- `authMode.status()` が 1 回呼ばれる
- `mode` が `api-key` に更新される
- `status` が IPC の返り値で更新される
- `auth.login` は呼ばれない

---

## テスト結果サマリー

| TC    | 結果  | 実行時間 |
| ----- | ----- | -------- |
| TC-01 | GREEN | —        |
| TC-02 | GREEN | —        |
| TC-03 | GREEN | —        |
| TC-04 | GREEN | —        |
| TC-05 | GREEN | —        |
| TC-06 | GREEN | —        |
| TC-07 | GREEN | —        |
| TC-08 | GREEN | —        |

**合計**: 9 tests passed (1 test file)

---

_Phase 6 完了: 2026-04-01_
