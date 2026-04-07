# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 6                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

Phase 5 実装後、3つのテストファイル全てに `mockHealthPolicy` を適切に統合し、
後方互換性テストを拡充する。`improve.test.ts` への必要な追加も完了させる。

---

## 実行タスク

- **タスク1**: `RuntimeSkillCreatorFacade.improve.test.ts` の影響範囲確認
- **タスク2**: `improve.test.ts` への `mockHealthPolicy` 統合（必要な場合）
- **タスク3**: 後方互換テストの追加（`healthPolicy` 未指定時の挙動確認）
- **タスク4**: 3テストファイル全体の回帰テスト実行

---

## 参照資料

| 資料名                                   | パス                                                                                         | 説明                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 5 GREEN 確認結果                   | `outputs/phase-5/green-confirmation.md`                                                      | Phase 5 完了状態確認           |
| RuntimeSkillCreatorFacade.improve テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 修正対象（影響範囲確認）       |
| RuntimeSkillCreatorFacade.test.ts        | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`         | 拡充対象（後方互換テスト追加） |
| Phase 4 テストマトリクス                 | `outputs/phase-4/test-matrix.md`                                                             | 既存テストとの照合             |

---

## 実行手順

### ステップ1: `improve.test.ts` の影響範囲確認

```bash
# improve テストで facade を生成している箇所を確認
grep -n "new RuntimeSkillCreatorFacade\|mockHealthPolicy\|healthPolicy" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts

# improve テストの現状を実行して確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

**判断基準**:

- `improve.test.ts` が `RuntimeSkillCreatorFacade` を生成しているが `healthPolicy` を渡していない場合
  → `healthPolicy?: HealthPolicy` は optional なため **変更不要**
- `improve.test.ts` が `RuntimePolicyResolver` を直接モックしている場合
  → モック定義に `healthPolicy` 関連の追加が必要か確認

### ステップ2: 後方互換テストの追加

`RuntimeSkillCreatorFacade.test.ts` に以下のテストを追加し、
`healthPolicy` なしでの動作が保証されることを明示的に検証する:

```typescript
describe("backward compatibility without healthPolicy", () => {
  it("should initialize without healthPolicy and use auth-based policy", async () => {
    // healthPolicy を渡さない（undefined）
    const facadeWithoutPolicy = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      authKeyService: mockAuthKeyService,
      subscriptionAuthProvider: mockSubscriptionAuthProvider,
      // healthPolicy: undefined (省略)
    });

    // インスタンス生成が成功し、既存の動作が維持されること
    expect(facadeWithoutPolicy).toBeInstanceOf(RuntimeSkillCreatorFacade);
  });

  it("should return correct result when healthPolicy is undefined", async () => {
    const facadeWithoutPolicy = new RuntimeSkillCreatorFacade({
      skillExecutor: mockSkillExecutor,
      // healthPolicy 省略
    });

    // isDegraded: false として動作する（healthPolicy が undefined の場合）
    const result = await facadeWithoutPolicy.plan("test-skill", "test prompt");
    expect(result.type).not.toBe("terminal_handoff");
  });
});
```

### ステップ3: カバレッジ観点でのテスト補完

Phase 4 のテストマトリクスと照合し、未カバーのシナリオを特定する:

| シナリオ                                | TC番号  | 追加済み | 追加先ファイル     |
| --------------------------------------- | ------- | -------- | ------------------ |
| `healthPolicy` 渡しあり・正常           | TC-H-01 | Phase 4  | `.test.ts`         |
| `healthPolicy` なし（後方互換）         | TC-H-02 | Phase 4  | `.test.ts`         |
| `isDegraded: true` → `terminal_handoff` | TC-H-03 | Phase 4  | `.plan.test.ts`    |
| `isDegraded: false` → 正常レスポンス    | TC-H-04 | Phase 4  | `.plan.test.ts`    |
| `healthPolicy` なし・`plan()` 動作確認  | 新規    | Phase 6  | `.test.ts`         |
| `improve.test.ts` 回帰（影響なし確認）  | 新規    | Phase 6  | `.improve.test.ts` |

### ステップ4: 3テストファイル全体の回帰実行

```bash
# 3テストファイル全て実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

**期待される結果**: 全テスト GREEN（回帰なし）

---

## 統合テスト連携

- 3テストファイル全ての `mockHealthPolicy` 統合を Phase 5 完了後に拡充
- 後方互換テストにより「`healthPolicy` 省略時の既存動作」が明示的に保証される

---

## サブタスク管理

| ID     | タスク名                                       | ステータス |
| ------ | ---------------------------------------------- | ---------- |
| T-06-1 | `improve.test.ts` 影響範囲確認                 | 未実施     |
| T-06-2 | `improve.test.ts` への `mockHealthPolicy` 統合 | 未実施     |
| T-06-3 | 後方互換テスト追加                             | 未実施     |
| T-06-4 | 3テストファイル全体の回帰実行                  | 未実施     |

---

## 成果物

| 成果物                      | 配置先                                                                                       | 形式       |
| --------------------------- | -------------------------------------------------------------------------------------------- | ---------- |
| テスト拡充コード（improve） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | TypeScript |
| テスト拡充コード（facade）  | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`         | TypeScript |
| テスト拡充結果              | `outputs/phase-6/test-expansion-result.md`                                                   | Markdown   |

---

## 完了条件

- [ ] `improve.test.ts` の影響範囲が確認済みであること
- [ ] `improve.test.ts` が全 GREEN であること（修正あり/なしに関わらず）
- [ ] 後方互換テスト（`healthPolicy` 省略時の動作）が `test.ts` に追加されていること
- [ ] 3テストファイル全て GREEN であること
- [ ] `outputs/phase-6/test-expansion-result.md` に全テスト結果が記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-06-1: `improve.test.ts` の影響範囲確認を実行済み
- [ ] T-06-2: `improve.test.ts` の対応完了（追加あり/不要のいずれかを記録）
- [ ] T-06-3: 後方互換テストを `test.ts` に追加済み
- [ ] T-06-4: 3テストファイル全体の回帰実行結果を `outputs/phase-6/test-expansion-result.md` に記録済み

---

## 次Phase

**Phase 7: カバレッジ確認** — 新規追加パスのカバレッジを計測し、目標（Line 80%/Branch 60%）達成を確認する。

**Phase 7 開始条件**: Phase 6 の全完了条件を満たし、3テストファイルが全 GREEN であること。
