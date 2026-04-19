# Phase 4 成果物: モック宣言出現箇所一覧

## mockDetectMode の全出現

| 行  | 内容                                                                 | 処置 |
| --- | -------------------------------------------------------------------- | ---- |
| 195 | `const mockDetectMode = vi.fn();`                                    | 削除 |
| 268 | `detectMode: mockDetectMode,` (beforeEach の skillCreatorAPI)        | 削除 |
| 281 | `mockDetectMode.mockResolvedValue({ success: true, data: "plan" });` | 削除 |

アクティブテストでの使用: **なし** → 削除可能

## mockPlanSkill の全出現

| 行      | 内容                                                        | 処置 |
| ------- | ----------------------------------------------------------- | ---- |
| 196     | `const mockPlanSkill = vi.fn();`                            | 削除 |
| 269     | `planSkill: mockPlanSkill,` (beforeEach の skillCreatorAPI) | 削除 |
| 282-290 | `mockPlanSkill.mockResolvedValue({...})` 9行                | 削除 |

アクティブテストでの使用: **なし** → 削除可能

## mockExecutePlan の全出現

アクティブテスト（U-8, U-13, U-14, U-15, U-21 等）で使用中 → **維持**

## 削除後の TypeScript 安全性

- `mockDetectMode` / `mockPlanSkill` は `window.skillCreatorAPI` の optional プロパティ（`detectMode?`, `planSkill?`）へのアサイン
- 削除後は当該プロパティが `undefined` になるだけで型エラーは発生しない
- アクティブテストはこれらの値を参照しないため副作用なし
