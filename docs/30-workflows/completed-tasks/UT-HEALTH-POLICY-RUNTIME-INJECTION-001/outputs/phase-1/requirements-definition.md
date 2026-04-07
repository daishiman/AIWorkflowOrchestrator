# フェーズ1: 要件定義

## タスクID

UT-HEALTH-POLICY-RUNTIME-INJECTION-001

## 問題の背景

`RuntimePolicyResolver` のコンストラクタ第3引数 `healthPolicy?: HealthPolicy` は
`TASK-IMP-HEALTH-POLICY-UNIFICATION-001` で追加済みだが、実際に値を渡す呼び出し元が
未実装のままである。

### 現状の問題箇所

| ファイル                                                              | 行番号  | 問題                                |
| --------------------------------------------------------------------- | ------- | ----------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                                  | 715-718 | `healthPolicy` 引数が渡されていない |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 188-191 | 同上                                |

```typescript
// 現状（healthPolicy が未注入）
const runtimePolicyResolver = new RuntimePolicyResolver(
  authKeyService,
  subscriptionAuthProvider,
  // healthPolicy が渡されていない
);
```

## 受入基準

1. **AC-1**: `RuntimePolicyResolver` が起動時に実際の `HealthPolicy` を受け取って動作する
2. **AC-2**: degraded 状態（`isDegraded === true`）のとき `terminal_handoff` が返される
3. **AC-3**: HealthCheck 失敗時は `unknown` HealthPolicy にフォールバックし既存動作を維持する
4. **AC-4**: 後方互換性: `healthPolicy` 未注入時の既存ロジックを壊さない

## スコープ

### 含む

- `buildHealthPolicy()` ヘルパー関数の新規実装
- `index.ts` の RuntimePolicyResolver 生成部分の修正
- `RuntimeSkillCreatorFacade` の deps 型と生成部分の修正
- 単体テストの追加

### 含まない

- `RuntimePolicyResolver` 自体のロジック変更（変更不要）
- HealthPolicy の定期更新・ウォッチャー機能（別タスク）
- IPC チャネルの追加
