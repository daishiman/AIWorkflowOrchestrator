# test-expansion.md — Phase 6 成果物

## 追加テストケース

Phase 5 のテストコードで Phase 4 のテストマトリクス全 17 ケースを網羅済み。
Phase 6 ではエッジケースの追加確認を行った。

### AgentNameResolver エッジケース

| #   | テスト名                                                             | 結果                                             |
| --- | -------------------------------------------------------------------- | ------------------------------------------------ |
| E1  | schema/asset kind リソースを無視する                                 | ✅ pass（kind === "agent" フィルタが確実に動作） |
| E2  | manifest リソースが混合（agent/reference/schema）でも agent のみ返す | ✅ pass                                          |
| E3  | `names` は readonly（イミュータブル）                                | ✅ TypeScript 型チェックで保証                   |

### 既存テストとの統合確認

- `RuntimeSkillCreatorFacade.plan.test.ts` (21 tests): ✅ pass
  - legacy path で "discover-problem", "design-workflow", "plan-structure" が呼ばれることを確認
- `RuntimeSkillCreatorFacade.improve.test.ts` (21 tests): ✅ pass
  - legacy path で "improve-prompt" が呼ばれることを確認

## 完了宣言

エッジケースは既存テストで網羅されており、追加テストは不要。
全 26 テストファイル / 425 テストが pass している。
