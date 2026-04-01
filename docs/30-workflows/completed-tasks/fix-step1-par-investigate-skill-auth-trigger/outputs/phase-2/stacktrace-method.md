# スタックトレース取得方法 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## 観測点の設計根拠

`auth:login` IPC は `preload/index.ts:216` で `safeInvoke(IPC_CHANNELS.AUTH_LOGIN, request)` として呼ばれる。
この `safeInvoke` を呼ぶのは `authSlice.ts:287` の `window.electronAPI.auth.login({ provider })` のみ（静的解析で確認済み）。

よって `authSlice.ts` の `login()` action 先頭が「唯一かつ最上流の観測点」となる。

---

## 30種の思考法による分析（抜粋）

| 思考法カテゴリ | 適用結果                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| 論理分析       | `login()` action は Zustand state action。dispatch ではなく直接関数呼び出し。middleware 経由の観測は不要      |
| 構造分解       | 呼び出しチェーン: コンポーネント → `useAppStore(state.login)` → `login()` → `window.electronAPI.auth.login()` |
| メタ・抽象     | console.trace で「どのコンポーネントが useAppStore(state.login) を呼んだか」が判明する                        |
| システム系     | スキル生成中の state 変化が useEffect 依存配列を通じて AccountSection や AuthView を再実行させている可能性    |
| 戦略・価値     | 最小侵襲（1行追加）で呼び出し元を特定できるため patch で足りる可能性が高い                                    |

---

## 代替観測点（フォールバック）

`console.trace()` の出力が不明瞭な場合:

```typescript
// Alternative: Error オブジェクトで明示的にスタックを出力
const __debugStack = new Error("[TRACE-SKILL-AUTH-001] auth/login called");
console.log(__debugStack.stack);
```

---

## 破棄判断基準

| 状況                                             | 判断                                   |
| ------------------------------------------------ | -------------------------------------- |
| 1ファイル・1箇所の修正で済む                     | patch で進める                         |
| 複数コンポーネントにまたがる依存配列の修正が必要 | patch で進めるが Phase 5 前に再確認    |
| 責務境界を大幅に変更する必要がある               | 再構成案を提示してユーザー再承認を取得 |

---

_Phase 2 完了: 2026-04-01_
