# Phase 6: テスト拡充結果

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 6                                      |
| 作成日 | 2026-04-14                             |
| タスク | UT-HEALTH-POLICY-RUNTIME-INJECTION-001 |

---

## T-06-1: `improve.test.ts` の影響範囲確認

```bash
grep -n "healthPolicy\|isDegraded\|makeDegraded" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

**結果**:

```
L80:   function makeDegradedPolicy(): HealthPolicy { isDegraded: true, ... }
L998:  it("healthPolicy が degraded の場合、api-key が有効でも terminal_handoff になる", ...)
L1007: healthPolicy: makeDegradedPolicy(),
```

`improve.test.ts` にも `healthPolicy` テストが存在し、全 PASS ✅

---

## T-06-2: `improve.test.ts` への `mockHealthPolicy` 統合

**判断**: すでに `makeDegradedPolicy()` が定義・使用済み

対象テスト（`E-12: terminal_handoff 分岐`）:

```typescript
it("healthPolicy が degraded の場合、api-key が有効でも terminal_handoff になる", ...)
it("terminal_handoff 判定時、LLM と SkillFileManager が呼ばれない", ...)
```

両テスト PASS ✅ → 追加変更不要

---

## T-06-3: テストシナリオカバレッジ照合

| シナリオ                                                         | TC番号       | 追加先ファイル                      | 状態 |
| ---------------------------------------------------------------- | ------------ | ----------------------------------- | ---- |
| `healthPolicy` 渡しあり・`isDegraded: true` → `terminal_handoff` | TC-H-01/03   | `.test.ts`, `.plan.test.ts`         | ✅   |
| `healthPolicy` なし（後方互換・既存動作）                        | TC-H-02      | `.test.ts`                          | ✅   |
| `isDegraded: false` → 正常レスポンス                             | TC-H-04      | `.plan.test.ts`                     | ✅   |
| `improve()` で `isDegraded: true` → `terminal_handoff`           | E-12         | `.improve.test.ts`                  | ✅   |
| `terminal_handoff` 時 LLM 呼び出しなし                           | TC-H-04/E-12 | `.plan.test.ts`, `.improve.test.ts` | ✅   |

---

## T-06-4: 3テストファイル全体の回帰実行結果

```
✓ RuntimeSkillCreatorFacade.test.ts     (48 tests)  30ms
✓ RuntimeSkillCreatorFacade.improve.test.ts (25 tests)  21ms
✓ RuntimeSkillCreatorFacade.plan.test.ts   (27 tests)  18ms

Test Files  3 passed (3)
     Tests  100 passed (100)
```

全テスト GREEN ✅（回帰なし）

---

## 追加発見: `improve.test.ts` の追加カバレッジ

`improve.test.ts` には Phase 4 テストマトリクス以外に、
`improve()` メソッドの `healthPolicy` テスト（E-12）が実装済みであった。
これにより `isDegraded: true` 分岐が 3メソッド（`execute`, `plan`, `improve`）全てでカバーされている。
