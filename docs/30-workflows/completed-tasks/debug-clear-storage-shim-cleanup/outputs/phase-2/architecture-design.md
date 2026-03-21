# Phase 2: 設計書

## 設計方針

### 原則

1. `debug-clear-storage` への参照は全て除去する（ソースコード・スクリプト）
2. 完了タスクの docs 内の記述は historical note に降格する（削除しない）
3. 認証バイパス機構（`skipAuth` / `VITE_E2E_MODE`）には一切触れない
4. `localStorage.clear()` の screenshot harness 用途は維持する

### e2e global-setup の設計変更

**Before**:

```typescript
// NOTE: App.tsx の debug-clear-storage reload と競合しないよう sessionStorage を事前設定する
// ...
window.sessionStorage.setItem("debug-clear-storage", "done");
```

**After**:

```typescript
// (コメント削除)
// ...
// (sessionStorage.setItem 行を削除)
```

認証バイパスは既存の `auth-storage` / `claude-auth-token` の localStorage 設定で実現されており、`debug-clear-storage` は不要。

### screenshot script の設計変更

各 script から `sessionStorage.setItem("debug-clear-storage", "done")` 行のみを削除。前後のコード（electronAPI モック、`dev-skip-auth` 設定等）は維持。

### historical note のフォーマット

```markdown
> **Historical Note** (TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001, 2026-03):
> 以下の記述は根本原因が解決済みのため、歴史的記録として残しています。
> 現在のコードベースには該当するコードは存在しません。
```

### .claude/skills/ の記述更新

既存のテキスト内で `debug-clear-storage` を参照する箇所に `[解決済み]` プレフィックスを付加。スキルのロジック（Trigger / Anchor）には影響しない。
