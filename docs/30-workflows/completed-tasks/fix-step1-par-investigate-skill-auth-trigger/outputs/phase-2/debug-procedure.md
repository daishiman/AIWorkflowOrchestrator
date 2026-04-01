# デバッグ手順書 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## 前提

- Phase 1 静的解析により、`window.electronAPI.auth.login()` は `authSlice.ts:287` の1箇所のみで呼ばれることが確認済み
- したがって `login()` action の先頭に `console.trace()` を挿入することで、あらゆる経路から発火した場合でも確実に捕捉できる

---

## ステップ 1: デバッグコード挿入

**対象ファイル**: `apps/desktop/src/renderer/store/slices/authSlice.ts`

`login: async (provider: OAuthProvider) => {` の直後、`set({ isLoading: true, authError: null });` の前に以下を挿入する:

```typescript
// [TEMP DEBUG] TASK-TRACE-SKILL-AUTH-001 — 調査完了後に必ず削除すること
console.trace("[TRACE-SKILL-AUTH-001] auth/login が呼び出されました");
```

挿入後の形:

```typescript
login: async (provider: OAuthProvider) => {
  // [TEMP DEBUG] TASK-TRACE-SKILL-AUTH-001 — 調査完了後に必ず削除すること
  console.trace("[TRACE-SKILL-AUTH-001] auth/login が呼び出されました");
  set({ isLoading: true, authError: null });
  // ...
```

**重要事項**:

- このコードはコミットしない（調査専用の一時変更）
- `[TEMP DEBUG]` プレフィックスで検索しやすくしておく

---

## ステップ 2: アプリ起動

```bash
cd apps/desktop
pnpm --filter @repo/desktop dev
```

---

## ステップ 3: スキル生成ボタン押下

1. Electron アプリが起動したらスキル生成画面を開く
2. テキストフィールドに任意の文字列を入力する
3. スキル生成ボタン（または「作成依頼」相当のボタン）を押下する

---

## ステップ 4: スタックトレースの確認

Electron DevTools（Renderer プロセス側）を開き、コンソールで `[TRACE-SKILL-AUTH-001]` でフィルタリングする。

### 記録すべき情報

```
## 取得日時
2026-XX-XX HH:MM

## 操作
スキル生成ボタン押下

## スタックトレース
[TRACE-SKILL-AUTH-001] auth/login が呼び出されました
    at authSlice.ts:XX (login)
    at <呼び出し元ファイル>:XX (<関数名>)
    ...

## 特定された呼び出し元
- ファイル: <特定されたファイルパス>
- 関数: <特定された関数名>
- 行番号: <行番号>
- トリガー条件: <スキル生成のどのタイミングか>
```

---

## ステップ 5: 確認コマンド（デバッグコード除去確認）

```bash
# デバッグコードが残っていないことを確認
grep -r "TEMP DEBUG" apps/desktop/src/
grep -r "TRACE-SKILL-AUTH-001" apps/desktop/src/
```

---

## リスクと対策

| リスク                              | 対策                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| スタックトレースが不明瞭            | `new Error().stack` を使って明示的に stack を出力          |
| タイムアウトで trace が取得前に失敗 | `safeInvoke` の `IPC_TIMEOUT_MS` を一時的に 30000ms に延長 |
| 非同期で追跡困難                    | `AsyncLocalStorage` またはカスタムコンテキストを利用       |

---

_Phase 2 完了: 2026-04-01_
