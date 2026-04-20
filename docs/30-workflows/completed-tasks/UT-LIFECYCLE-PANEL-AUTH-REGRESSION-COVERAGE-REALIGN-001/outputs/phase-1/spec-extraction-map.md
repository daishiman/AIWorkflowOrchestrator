# spec-extraction-map.md

## targeted run

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

## 現行テストケース全件マップ

| テストID | describe ブロック                                                       | it 内容                                                                                | 保証内容                                            | PASS 状態 |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- | --------- |
| TC-01    | TC-01: SkillLifecyclePanel wizard flow does not call auth:login         | ウィザードボタン押下時に auth:login が呼ばれないこと                                   | ウィザード起動フローで auth:login が発火しない      | PASS      |
| TC-02    | TC-02: AccountSection triggers auth:login on demand                     | AccountSection の handleLogin が login() を呼ぶこと                                    | AccountSection の正常系 login() 呼び出し            | PASS      |
| TC-04-1  | TC-04: authSlice.login thunk works correctly (no debug code)            | [TEMP DEBUG] タグがソースコードに存在しないこと                                        | デバッグコードの除去確認                            | PASS      |
| TC-04-2  | TC-04: authSlice.login thunk works correctly (no debug code)            | authSlice.login() が正常に IPC を呼び出すこと                                          | authSlice.login() の正常系動作                      | PASS      |
| TC-08    | TC-08: authModeSlice state changes do not trigger unexpected auth:login | authModeSlice の setMode('api-key') が auth.login を呼ばず IPC と state を更新すること | authModeSlice の setMode() が auth:login を呼ばない | PASS      |

合計: 5 テストケース（TC-01, TC-02, TC-04×2, TC-08）

## 削除された TC-06 / TC-07 の調査

### git log 調査結果

`UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001` により削除されたテストケース:

- **TC-06**: 旧 prepare フローに依存した rapid click テスト。prepare() 関数や preparationState を使った連打テストで、現行 UI には prepare フローが存在しないため削除された。
- **TC-07**: 旧 prepare フローに依存した rerender テスト。preparationState の変化による rerender をトリガーとしており、現行 UI には対応する状態がないため削除された。

### 保証の空白箇所

削除後、以下の保証点が空白になっている:

1. rapid click 時の `auth:login` 非発火保証
2. rerender 時の `auth:login` 非発火保証

## 空白保証点一覧

| 空白ID | 内容                                         | 対応テストID（新規）           |
| ------ | -------------------------------------------- | ------------------------------ |
| GAP-01 | rapid click 時の auth:login 非発火           | AUTH-REGRESS-RAPID-CLICK-06    |
| GAP-02 | rerender 時の auth:login 非発火              | AUTH-REGRESS-RERENDER-07       |
| GAP-03 | onOpenSkillWizard 呼び出し時の非発火明示保証 | AUTH-REGRESS-HANDLER-GUARANTEE |
| GAP-04 | onOpenWizard 呼び出し時の非発火明示保証      | AUTH-REGRESS-HANDLER-GUARANTEE |
