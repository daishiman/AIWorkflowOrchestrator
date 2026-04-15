# Phase 10: AC 検証記録

## 受入基準の証拠一覧

---

### AC-1: `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` が追加されている

```bash
grep -n "healthPolicy\?: HealthPolicy" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**出力**:

```
133:  healthPolicy?: HealthPolicy;
```

証拠: **L133 に存在** ✅

---

### AC-2: コンストラクタが `RuntimePolicyResolver` に3番目引数を渡している

```bash
grep -n "new RuntimePolicyResolver" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**出力**:

```
256:    this.resolver = new RuntimePolicyResolver(
257:      deps.authKeyService,
258:      deps.subscriptionAuthProvider,
259:      deps.healthPolicy,
260:    );
```

証拠: **3番目引数 `deps.healthPolicy` が存在** ✅

---

### AC-3: `index.ts` で `healthPolicy` が生成・渡されている（`undefined` 不可）

```bash
grep -n "healthPolicy\|resolveHealthPolicy" \
  apps/desktop/src/main/ipc/index.ts
```

**出力**:

```
122:  import { resolveHealthPolicy } from "@repo/shared/types";
721:  const runtimeHealthPolicy = resolveHealthPolicy({...});
1055: healthPolicy: options?.healthPolicy ?? runtimeHealthPolicy,
```

証拠: **`runtimeHealthPolicy` フォールバックにより `undefined` は渡らない** ✅

---

### AC-4: `isDegraded: true` テスト（TC-H-03）が PASS

```
✓ terminal_handoff 経路の非破壊 > healthPolicy が degraded の場合、api-key が有効でも terminal_handoff になる
✓ RuntimeSkillCreatorFacade.test.ts > execute > healthPolicy が degraded の場合、api-key が有効でも terminal_handoff を返す
✓ improve() > E-12: terminal_handoff 分岐 > healthPolicy が degraded の場合、api-key が有効でも terminal_handoff になる
```

証拠: **3メソッド全てで `isDegraded: true` → `terminal_handoff` が PASS** ✅

---

### AC-5: `healthPolicy` 省略時に既存テストが全 PASS（後方互換）

`RuntimeSkillCreatorFacade.test.ts` の `beforeEach`:

```typescript
facade = new RuntimeSkillCreatorFacade({
  skillExecutor: { execute: executeMock } as unknown as SkillExecutor,
  // healthPolicy: 省略（undefined）
});
```

既存 48 テスト全 PASS ✅

---

### AC-6: `pnpm --filter @repo/desktop typecheck` が PASS

```
> @repo/desktop@1.0.0 typecheck
> tsc --noEmit
（出力なし: エラー 0 件）
```

証拠: **エラー 0 件** ✅

---

### AC-7: 関連テストファイル3種が全 PASS

```
Test Files  3 passed (3)
     Tests  100 passed (100)
```

証拠: **100/100 テスト PASS** ✅
