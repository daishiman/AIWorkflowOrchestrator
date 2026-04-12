# 変更ファイル一覧

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## 変更ファイル

### 1. SkillLifecyclePanel.llm-generation.test.tsx

**パス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`

**変更内容**: `skill-lifecycle-request-input` testid 参照の削除

| describe.skip ブロック | 削除内容                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| U-1                    | `const input = screen.getByTestId(...)` + `fireEvent.change(input, { target: { value: "メールを自動送信する" } })` (複数行) |
| U-2                    | `const input = screen.getByTestId(...)` + `fireEvent.change(input, { target: { value: "テスト用入力" } })`                  |
| U-4                    | `const input = screen.getByTestId(...)` + `fireEvent.change(input, { target: { value: "テスト入力" } })`                    |
| U-6                    | `const input = screen.getByTestId(...)` + `fireEvent.change(input, { target: { value: "大規模タスク" } })`                  |
| U-10 (it-1)            | `const input = screen.getByTestId(...)` + `fireEvent.change(input, { target: { value: "テスト入力" } })`                    |
| U-10 (it-2)            | `const input = screen.getByTestId(...)` + `fireEvent.change(input, { target: { value: "テスト入力" } })`                    |
| U-12                   | `const input = screen.getByTestId(...)` + `fireEvent.change(input, { target: { value: "テスト入力" } })`                    |
| U-8b                   | `const input = screen.getByTestId(...)` + `fireEvent.change(input, ...)` (2箇所)                                            |
| U-18b                  | `const input = screen.getByTestId(...)` + `fireEvent.change(input, ...)` (2箇所)                                            |
| U-19b                  | `const input = screen.getByTestId(...)` + `fireEvent.change(input, ...)` (4箇所)                                            |
| U-21                   | `const input = screen.getByTestId(...)` + `fireEvent.change(input, ...)`                                                    |

### 2. SkillLifecyclePanel.auth-regression.test.tsx

**パス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

**変更内容**: `fillCreateRequest` 関数本体を no-op に変更

```diff
- function fillCreateRequest(request = defaultCreateRequest): void {
-   fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
-     target: { value: request },
-   });
- }
+ function fillCreateRequest(_request = defaultCreateRequest): void {
+   // 旧リクエスト入力 testid は UI リファクタリング（遷移ボタン化）により削除済み
+   // describe.skip ブロック内でのみ使用されていたため、本体は no-op とする
+ }
```

## 変更しなかったファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（本体コード - 変更なし）
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`（アクティブテスト - 変更なし）

---

_作成日: 2026-04-11_
