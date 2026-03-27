# Phase 9: 品質保証

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 9                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 8                           |
| 後続Phase | Phase 10                          |

## 目的

主導線一本化が user value を損なわず、secondary route を残したまま lane 全体の説明可能性を高めることを確認する。

## 実行タスク

- panel / wizard 重複の再点検
- primary route と secondary route の分離確認
- provenance / warning summary の可読性確認
- improve / verify 再入場時の責務境界確認

## 参照資料

| 資料名                 | パス                                                                      | 説明                  |
| ---------------------- | ------------------------------------------------------------------------- | --------------------- |
| Phase 2 design         | `phase-2-design.md`                                                       | route / warning 配置  |
| Phase 4 test creation  | `phase-4-test-creation.md`                                                | テスト観点            |
| Phase 5 implementation | `phase-5-implementation.md`                                               | 実装対象との一致確認  |
| Phase 6 test expansion | `phase-6-test-expansion.md`                                               | edge case 追補        |
| Phase 8 refactoring    | `phase-8-refactoring.md`                                                  | wording 統一          |
| Task06 index           | `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md` | verify / improve 境界 |

## 品質観点

- create の一次入口が 1 つに読める
- `SkillCreateWizard` は destination surface として説明できる
- `SkillLifecyclePanel` / `SkillManagementPanel` は advanced / secondary route として説明できる
- provenance / warning が mainline で必要十分な summary に留まる
- Task06 / Task07 の責務を奪っていない

## 並列化観点

- Task06 と並列化しても、Task05 は entry surface だけに責務を絞る
- 共通 component を触る場合も、Task06 は result surface、Task05 は entry surface で write scope を分ける
- shared lifecycle state contract は Task02 / Task04 の正本に従う

## 統合テスト連携

- Phase 4〜7 のテスト観点が quality観点へ対応付けられていることを確認する。
- Phase 10 で PASS 判定するため、曖昧な wording や Task06 侵食をここで洗い出す。

## 成果物

| 成果物     | パス                           | 内容                |
| ---------- | ------------------------------ | ------------------- |
| 品質保証書 | `phase-9-quality-assurance.md` | QA 観点と並列化観点 |

## 完了条件

- [ ] 主導線一本化の価値が説明できる
- [ ] primary route と secondary route の境界が明確
- [ ] provenance / warning summary の可読性が担保されている
- [ ] Task06 並列時の競合ポイントが読める
- [ ] **本Phase内の全タスクを100%実行完了**
