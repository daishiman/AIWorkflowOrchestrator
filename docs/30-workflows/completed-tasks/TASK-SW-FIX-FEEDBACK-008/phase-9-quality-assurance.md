# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 9                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 8                                       |
| 後続Phase  | Phase 10                                      |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

typecheck、lint、対象テストを一括で確認する。

## 実行コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 実行タスク

- [ ] typecheck が成功することを確認する
- [ ] lint が成功することを確認する
- [ ] 対象テストが全件 PASS であることを確認する
- [ ] 不合格項目があれば差し戻し先を明記する

## 統合テスト連携

| 接続点     | 確認内容                                      |
| ---------- | --------------------------------------------- |
| Phase 5    | 実装が型・lint 観点で成立すること             |
| Unit test  | U-NEW 系と回帰ケースが一括 PASS であること    |
| Final gate | Phase 10 判定へ引き継ぐ品質サマリーを作ること |

## 完了条件

- [ ] typecheck が成功している
- [ ] lint が成功している
- [ ] 対象テストが全件 PASS である
- [ ] 差し戻し要否が記録されている

## 成果物

- `outputs/phase-9/quality-report.md`

## 参照資料

| 資料名             | パス                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Phase 5 成果物     | `outputs/phase-5/implementation-record.md`                                                         |
| 修正対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               |
| テスト対象ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
