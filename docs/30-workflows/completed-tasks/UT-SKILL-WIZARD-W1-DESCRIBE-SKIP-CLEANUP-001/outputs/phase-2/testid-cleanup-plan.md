# testid クリーンアップ計画

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## 変更箇所一覧

### SkillLifecyclePanel.llm-generation.test.tsx

| describe.skip | 削除対象                                                                                                                                                  | 削除後の状態                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| U-1           | `const input = screen.getByTestId("skill-lifecycle-request-input");` + `fireEvent.change(input, { target: { value: "メールを自動送信する" } });` (複数行) | テスト構造維持、input 参照のみ削除 |
| U-2           | `const input = screen.getByTestId("skill-lifecycle-request-input");` + `fireEvent.change(input, { target: { value: "テスト用入力" } });`                  | 同上                               |
| U-4           | `const input = screen.getByTestId("skill-lifecycle-request-input");` + `fireEvent.change(input, { target: { value: "テスト入力" } });`                    | 同上                               |
| U-6           | `const input = screen.getByTestId("skill-lifecycle-request-input");` + `fireEvent.change(input, { target: { value: "大規模タスク" } });`                  | 同上                               |
| U-10 (it-1)   | `const input = screen.getByTestId("skill-lifecycle-request-input");` + `fireEvent.change(input, { target: { value: "テスト入力" } });`                    | 同上                               |
| U-10 (it-2)   | `const input = screen.getByTestId("skill-lifecycle-request-input");` + `fireEvent.change(input, { target: { value: "テスト入力" } });`                    | 同上                               |
| U-12          | `const input = screen.getByTestId("skill-lifecycle-request-input");` + `fireEvent.change(input, { target: { value: "テスト入力" } });`                    | 同上                               |
| U-8b          | `const input = ...;` + `fireEvent.change(input, ...)` (2箇所)                                                                                             | `input` 変数参照を全て削除         |
| U-18b         | `const input = ...;` + `fireEvent.change(input, ...)` (2箇所)                                                                                             | `input` 変数参照を全て削除         |
| U-19b         | `const input = ...;` + `fireEvent.change(input, ...)` (4箇所)                                                                                             | `input` 変数参照を全て削除         |
| U-21          | `const input = ...;` + `fireEvent.change(input, ...)`                                                                                                     | `input` 変数参照を全て削除         |

### SkillLifecyclePanel.auth-regression.test.tsx

| 変更箇所                                   | 削除対象                                                                                                 | 削除後の状態            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------- |
| `fillCreateRequest` 関数本体（行 172-174） | `fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), { target: { value: request } });` | 関数を空の no-op にする |

## 注意事項

- `input` 変数を複数回使用している describe.skip では、`const input = ...` とすべての `fireEvent.change(input, ...)` を削除する
- `fireEvent.change` に続く処理（アサーション等）は削除しない
- `describe.skip` ブロック自体は削除しない

---

_作成日: 2026-04-11_
