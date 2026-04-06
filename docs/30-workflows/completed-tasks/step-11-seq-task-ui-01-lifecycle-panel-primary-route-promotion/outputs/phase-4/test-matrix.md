# Phase 4 成果物: テストマトリクス

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 4          |
| 作成日     | 2026-04-06 |
| ステータス | completed  |

---

## テストケース一覧

### 新規追加テスト

| TC ID             | テストファイル                      | 説明                                                                          | AC 対応 | TDD 状態  |
| ----------------- | ----------------------------------- | ----------------------------------------------------------------------------- | ------- | --------- |
| TC-SL-16          | `skillLifecycleJourney.test.ts`     | `SKILL_LIFECYCLE_PRIMARY_VIEW === "skillLifecycle"`                           | AC-4    | Red→Green |
| TC-SL-17          | `skillLifecycleJourney.test.ts`     | `normalizeSkillLifecycleView("skillLifecycle")` がそのまま返る                | AC-3    | Red→Green |
| TC-07             | `useSkillCenter.navigation.test.ts` | `navigateToSkillLifecycle` が `setCurrentView("skillLifecycle")` を呼ぶ       | AC-1    | Red→Green |
| TC-08             | `useSkillCenter.navigation.test.ts` | 返り値に `navigateToSkillLifecycle` が含まれる                                | AC-1    | Red→Green |
| TC-CTA-12-updated | `SkillCenterView.cta.test.tsx`      | `skill-lifecycle-cta-create` クリックで `navigateToSkillLifecycle` が呼ばれる | AC-1    | Red→Green |

### 既存テスト（変更なし・pass 確認）

| TC ID        | テストファイル                      | 説明                                                      | AC 対応 |
| ------------ | ----------------------------------- | --------------------------------------------------------- | ------- |
| TC-01        | `useSkillCenter.navigation.test.ts` | `navigateToSkillCreate` → `setCurrentView("skillCreate")` | AC-2    |
| TC-CTA-03    | `SkillCenterView.cta.test.tsx`      | ヘッダー CTA → `navigateToSkillCreate`                    | AC-2    |
| TC-04d       | `SkillCenterView.cta.test.tsx`      | `header-create-cta` → `navigateToSkillCreate`（回帰）     | AC-2    |
| TC-SL-01〜15 | `skillLifecycleJourney.test.ts`     | 既存全テスト                                              | AC-6    |

---

## AC-1〜AC-6 対応表

| AC   | テスト                                    | 新規/既存 |
| ---- | ----------------------------------------- | --------- |
| AC-1 | TC-SL-16, TC-07, TC-08, TC-CTA-12-updated | 新規      |
| AC-2 | TC-01, TC-CTA-03, TC-04d                  | 既存維持  |
| AC-3 | TC-SL-17                                  | 新規      |
| AC-4 | TC-SL-16                                  | 新規      |
| AC-5 | Phase 11 手動テスト                       | 手動      |
| AC-6 | 全既存テストの pass 確認                  | 既存維持  |
