# 受け入れ基準（Acceptance Criteria）

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

| ID   | 基準                                                                         | 検証方法                                                                                                              |
| ---- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `skill-lifecycle-request-input` testid 参照が対象2ファイルから削除されている | `grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/` が対象2ファイルで0件 |
| AC-2 | `describe.skip` ブロック内の参照も含めて削除・更新されている                 | 対象2ファイルの `describe.skip` ブロック内に旧 testid 参照がないことを確認                                            |
| AC-3 | 削除後、テストが現行 UI（遷移ボタン化後）を正しく反映した内容になっている    | テストコードの内容を目視確認                                                                                          |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する                          | テストコマンド実行結果が全件PASS                                                                                      |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                         | 型チェックコマンド実行結果がエラーなし                                                                                |

## 補足

- `SkillLifecyclePanel.test.tsx` の `queryByTestId("skill-lifecycle-request-input")` 参照（line 304, 385）は
  「存在しないこと」を確認する正常なアサーションのため、本タスクの対象外
- 変更は対象2ファイルのテストコードのみに限定する

---

_作成日: 2026-04-11_
