# Phase 1: 受け入れ基準（AC-01〜AC-07）

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## 受け入れ基準一覧

| AC番号 | 内容                                                                                                | 検証方法                     | 達成状況          |
| ------ | --------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------- |
| AC-01  | 3ステップ（Step 0: SkillInfoStep / Step 1: ConversationRoundStep / Step 2: CompleteStep）が動作する | ユニットテスト TC-01〜TC-05  | ✅ 達成           |
| AC-02  | Step 0 → Step 1 遷移時に `inferSmartDefaults` が呼び出される                                        | ユニットテスト TC-02         | ✅ 達成           |
| AC-03  | `SmartDefaultResult` が Step 1 の `ConversationRoundStep` に Props 経由で渡される                   | ユニットテスト TC-03         | ✅ 達成           |
| AC-04  | NON_VISUAL 計装ポイント 5 つが実装される（`console.log` または `trackEvent` スタブ）                | ユニットテスト TC-06〜TC-10  | ✅ 達成           |
| AC-05  | ユニットテストが全 PASS し、カバレッジが 90% 以上となる                                             | `pnpm vitest run --coverage` | ✅ 達成（98.14%） |
| AC-06  | `pnpm --filter @repo/desktop typecheck` がエラーなし                                                | TypeScript 型チェック        | ✅ 達成           |
| AC-07  | `pnpm --filter @repo/desktop lint` がエラー・警告なし                                               | ESLint 静的解析              | ✅ 達成           |

---

## 補足

- `inferSmartDefaults` は `@repo/shared/services/skillCreator` から利用する
- `trackEvent` スタブは Wave 3 で本実装に差し替え予定（TODO(W3-seq-04) コメント付き）
