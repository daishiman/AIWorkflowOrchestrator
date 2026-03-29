# Phase 1 受入基準

タスクID: `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001`

---

## 受入基準 (Acceptance Criteria)

### AC-1: shared 側チャネル定義の存在

**条件**: `packages/shared/src/ipc/channels.ts` に `APPROVAL_CHANNELS` と `EXECUTION_CHANNELS` が `as const` オブジェクトとして定義されている。

**検証方法**:

- `APPROVAL_CHANNELS.APPROVAL_RESPOND === "approval:respond"`
- `APPROVAL_CHANNELS.APPROVAL_REQUEST === "approval:request"`
- `EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO === "execution:get-disclosure-info"`
- `IPC_CHANNELS` にスプレッドで含まれている

---

### AC-2: desktop 側が shared 定義を参照

**条件**: `apps/desktop/src/preload/channels.ts` の `APPROVAL_RESPOND`, `APPROVAL_REQUEST`, `EXECUTION_GET_DISCLOSURE_INFO` の文字列値が shared 側定義と同一である。

**検証方法**:

- desktop 側の該当3チャネルの値が shared 定義と完全一致する
- import パス (`@repo/shared/src/ipc/channels` 等) が正しく解決される、またはテストで parity が担保される

---

### AC-3: チャネル分離の保証

**条件**: Approval チャネルと Execution チャネルの文字列値が衝突しない。

**検証方法**:

- `APPROVAL_CHANNELS.APPROVAL_RESPOND !== EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO`
- `APPROVAL_CHANNELS.APPROVAL_REQUEST !== EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO`
- 各チャネル値がプロジェクト全体で一意である

---

### AC-4: parity テストの通過

**条件**: shared と desktop の cross-layer parity テストがグリーンで通過する。

**検証方法**:

- shared ユニットテスト: チャネル定義の存在と値の一致
- desktop preload allowlist テスト: `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` への正しい登録
- cross-layer parity テスト: shared 側と desktop 側の文字列値が全て一致

---

### AC-5: 既存テスト・ビルドの非破壊

**条件**: 変更後、既存の全テストスイートとビルドが通過する。

**検証方法**:

- `pnpm --filter @repo/shared build` が成功
- `pnpm --filter @repo/desktop build` が成功 (または typecheck が通る)
- 既存テスト (`vitest run`) が全てグリーン
- `governance-bundle.test.ts` が引き続きグリーン
