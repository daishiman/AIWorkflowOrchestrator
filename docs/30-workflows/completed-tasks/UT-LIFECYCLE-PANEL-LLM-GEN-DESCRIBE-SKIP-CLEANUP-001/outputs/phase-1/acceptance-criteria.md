# Phase 1 成果物: 受け入れ基準

| ID   | 受け入れ基準                                                                   | 検証コマンド                               |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| AC-1 | 旧フロー依存の describe.skip（U-1/U-2/U-6/U-10/U-12）が削除されている          | `grep -c "describe\.skip" <test_file>` → 0 |
| AC-2 | 要調査テスト（U-4/U-11/U-8b）が describe に昇格 or 削除で解消されている        | 各 testid が describe.skip に存在しない    |
| AC-3 | snapshot 系テスト（U-18b/U-19b/U-20b/U-21）の処置が完了: U-20b 昇格、残3件削除 | describe.skip が 0 件                      |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する                            | vitest 全件 PASS                           |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                           | 0 errors                                   |
| AC-6 | mockDetectMode / mockPlanSkill の宣言・beforeEach 設定が全件除去されている     | grep "mockDetectMode\|mockPlanSkill" → 0件 |
