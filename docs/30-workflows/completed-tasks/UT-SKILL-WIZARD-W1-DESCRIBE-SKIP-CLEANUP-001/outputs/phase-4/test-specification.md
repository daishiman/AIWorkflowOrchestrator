# テスト仕様書

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## テスト方針

NON_VISUAL クリーンアップタスクのため、新規テスト作成は行わない。
既存テストの PASS 確認を中心に設計する。

## 旧 testid 参照箇所一覧（変更前）

### SkillLifecyclePanel.llm-generation.test.tsx

| 行番号    | describe.skip | 参照内容                                                                        |
| --------- | ------------- | ------------------------------------------------------------------------------- |
| 351       | U-1           | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 352-354   | U-1           | `fireEvent.change(input, { target: { value: "メールを自動送信する" } });`       |
| 381       | U-2           | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 382       | U-2           | `fireEvent.change(input, { target: { value: "テスト用入力" } });`               |
| 422       | U-4           | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 423       | U-4           | `fireEvent.change(input, { target: { value: "テスト入力" } });`                 |
| 474       | U-6           | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 475       | U-6           | `fireEvent.change(input, { target: { value: "大規模タスク" } });`               |
| 558       | U-10 (it-1)   | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 559       | U-10 (it-1)   | `fireEvent.change(input, { target: { value: "テスト入力" } });`                 |
| 584       | U-10 (it-2)   | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 585       | U-10 (it-2)   | `fireEvent.change(input, { target: { value: "テスト入力" } });`                 |
| 627       | U-12          | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 628       | U-12          | `fireEvent.change(input, { target: { value: "テスト入力" } });`                 |
| 1070      | U-8b          | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 1071      | U-8b          | `fireEvent.change(input, { target: { value: "承認済みの依頼" } });`             |
| 1088      | U-8b          | `fireEvent.change(input, { target: { value: "改ざんされた依頼" } });`           |
| 1400      | U-18b         | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 1403      | U-18b         | `fireEvent.change(input, { target: { value: "初回依頼" } });`                   |
| 1419      | U-18b         | `fireEvent.change(input, { target: { value: "二回目の依頼" } });`               |
| 1441      | U-19b         | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 1444      | U-19b         | `fireEvent.change(input, { target: { value: "固定されるべき依頼" } });`         |
| 1450      | U-19b         | `fireEvent.change(input, { target: { value: "変更1" } });`                      |
| 1451      | U-19b         | `fireEvent.change(input, { target: { value: "変更2" } });`                      |
| 1452      | U-19b         | `fireEvent.change(input, { target: { value: "変更3" } });`                      |
| 1509      | U-21          | `const input = screen.getByTestId("skill-lifecycle-request-input");`            |
| 1511-1513 | U-21          | `fireEvent.change(input, { target: { value: "失敗後も保持されるべき依頼" } });` |

### SkillLifecyclePanel.auth-regression.test.tsx

| 行番号  | 箇所                         | 参照内容                                                                                                 |
| ------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| 172-174 | `fillCreateRequest` 関数本体 | `fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), { target: { value: request } });` |

## テストマトリクス

| TC番号 | テスト名                                                    | 対象                                         | 期待結果 |
| ------ | ----------------------------------------------------------- | -------------------------------------------- | -------- |
| TC-1   | llm-generation.test.tsx 内に旧 testid 参照が存在しないこと  | SkillLifecyclePanel.llm-generation.test.tsx  | grep 0件 |
| TC-2   | auth-regression.test.tsx 内に旧 testid 参照が存在しないこと | SkillLifecyclePanel.auth-regression.test.tsx | grep 0件 |
| TC-3   | describe.skip 外の全アクティブテストが PASS すること        | 対象2ファイルを含む全テスト                  | 全 PASS  |
| TC-4   | pnpm --filter @repo/desktop typecheck が PASS すること      | TypeScript 型チェック                        | PASS     |

## 検証コマンド

```bash
# TC-1/TC-2: 旧 testid 残存確認（0件が期待値）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-3: 全テスト実行（変更後）
pnpm --filter @repo/desktop test:run

# TC-4: 型チェック
pnpm --filter @repo/desktop typecheck
```

---

_作成日: 2026-04-11_
