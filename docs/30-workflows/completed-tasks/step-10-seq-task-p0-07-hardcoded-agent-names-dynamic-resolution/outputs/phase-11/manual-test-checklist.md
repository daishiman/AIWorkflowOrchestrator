# Phase 11: 手動テストチェックリスト — TASK-P0-07

## 判定方針

NON_VISUAL。`RuntimeSkillCreatorFacade` / `SkillCreatorSourceResolver` / `PhaseResourcePlanner` の内部ロジック変更のみで、Renderer の見た目変更はない。

## チェック項目

| テストケース | 確認観点         | 確認内容                                                              | 結果 | 備考                                                          |
| ------------ | ---------------- | --------------------------------------------------------------------- | ---- | ------------------------------------------------------------- |
| TC-11-01     | plan 動的解決    | manifest の custom resource ids が plan の system prompt に反映される | PASS | `RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`   |
| TC-11-02     | improve fallback | `IMPROVE_RESOURCE_REQUESTS` の agent ids だけを fallback で読む       | PASS | `RuntimeSkillCreatorFacade.p0-07-dynamic-agent-names.test.ts` |
| TC-11-03     | root dedupe      | manifest / explicit / env が同一 root の場合に候補が 1 件にまとまる   | PASS | `SkillCreatorSourceResolver.test.ts`                          |
| TC-11-04     | 非視覚理由       | screenshot capture が不要な理由を明記する                             | PASS | UI surface 変更なし                                           |

## 補足

- visual evidence は不要
- 代わりに unit test と docs の current facts を証跡とする
