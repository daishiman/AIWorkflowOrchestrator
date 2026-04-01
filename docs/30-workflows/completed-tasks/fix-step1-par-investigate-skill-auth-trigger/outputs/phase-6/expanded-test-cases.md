# 拡張テストケース定義 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## Phase 6 で追加したテストケース

### TC-05: 未認証状態でのスキル生成

**目的**: ユーザーが未認証状態でスキル生成ボタンを押しても `auth:login` が呼ばれないこと

**前提条件**:

- `isAuthenticated: false`
- `mockAuthLogin` は呼ばれた場合に検出できる mock

**手順**:

1. `SkillLifecyclePanel` を `isOpen=true` で render
2. `skill-lifecycle-prepare-button` を取得してクリック
3. `detectMode` が 1 回だけ呼ばれることを確認
4. `skill-lifecycle-mode-label` が `直作成` に変わることを確認

**期待結果**: `mockDetectMode` が 1 回だけ呼ばれ、`mockPlanSkill` / `mockAuthLogin` が呼ばれないこと

**ファイル**: `SkillLifecyclePanel.auth-regression.test.tsx`（TC-05 describe ブロック）

---

### TC-06: 複数回クリックによる重複呼び出し防止

**目的**: スキル生成ボタンを短時間に複数回押しても `auth:login` が呼ばれないこと

**前提条件**:

- TC-01 と同様のモック設定
- `detectMode` は deferred promise で保持し、再入の有無を観測できること

**手順**:

1. `SkillLifecyclePanel` を render
2. ボタンを 3回連続クリック
3. `mockDetectMode` の呼び出し回数が 1 回であることを確認
4. `detectMode` を resolve し、`skill-lifecycle-mode-label` が `直作成` になることを確認

**期待結果**: `mockDetectMode` が 1 回、`mockPlanSkill` / `mockAuthLogin` が 0 回であること

---

### TC-07: コンポーネント再レンダリング時の auth:login 非発火

**目的**: `SkillLifecyclePanel` のマウント・再レンダリング時に `auth:login` が呼ばれないこと

**前提条件**:

- TC-01 と同様のモック設定
- `detectMode` は deferred promise で保持し、再レンダリング時の重複呼び出しを観測できること

**手順**:

1. `render(<SkillLifecyclePanel ... />)` でマウント
2. `skill-lifecycle-prepare-button` を押下して処理を開始
3. `rerender(<SkillLifecyclePanel ... />)` で再レンダリング
4. `mockDetectMode` の呼び出し回数が 1 回であることを確認
5. `detectMode` を resolve し、`skill-lifecycle-mode-label` が `直作成` になることを確認

**期待結果**: `mockDetectMode` が 1 回、`mockPlanSkill` / `mockAuthLogin` が 0 回であること

---

### TC-08: authModeSlice の状態変化で auth:login が呼ばれないこと

**目的**: `authModeSlice.setMode("api-key")` が `auth:login` IPC を呼ばず、IPC と state 更新だけで完結すること

**前提条件**:

- `createAuthModeSlice` に `mockSet` / `mockGet` と `window.electronAPI.authMode.*` のモックを渡す
- `mockLoginIPC` で `window.electronAPI.auth.login` をモック

**手順**:

1. `createAuthModeSlice(mockSet, mockGet, {})` でスライスを生成
2. `slice.setMode("api-key")` を呼び出す
3. `authMode.set` / `authMode.status` の呼び出しと state 変化を確認する

**期待結果**: `mockLoginIPC` が一度も呼ばれず、`mode` が `api-key` に更新され、`status` も反映されること

---

## テストケース一覧（Phase 5 + Phase 6）

| TC    | 概要                                              | 状態  |
| ----- | ------------------------------------------------- | ----- |
| TC-01 | handlePrepare が auth:login を呼ばないこと        | GREEN |
| TC-02 | AccountSection がオンデマンドで auth:login を呼ぶ | GREEN |
| TC-03 | スキル生成が auth:login タイムアウトしないこと    | GREEN |
| TC-04 | authSlice.login thunk にデバッグコードがないこと  | GREEN |
| TC-05 | 未認証状態でもスキル生成が auth:login を呼ばない  | GREEN |
| TC-06 | 複数回クリックでも auth:login が呼ばれない        | GREEN |
| TC-07 | 再レンダリング時に auth:login が呼ばれない        | GREEN |
| TC-08 | authModeSlice 状態変化が auth:login を呼ばない    | GREEN |

---

_Phase 6 完了: 2026-04-01_
