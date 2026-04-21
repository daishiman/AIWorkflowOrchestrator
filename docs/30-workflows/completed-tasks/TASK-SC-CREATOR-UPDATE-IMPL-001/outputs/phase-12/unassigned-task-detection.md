# Phase 12: 未タスク検出

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

## 検出結果

| #   | 未タスク                                                     | 種別       | 優先度 | 理由                                                 |
| --- | ------------------------------------------------------------ | ---------- | ------ | ---------------------------------------------------- |
| 1   | `skillPath` 指定時の統合テスト                               | テスト補充 | 低     | フォールバック連鎖が保護しているため即座に対応不要   |
| 2   | `extractPurposeFromSkillMd()` frontmatter なしケースのテスト | テスト補充 | 低     | `null` 返却 → description フォールバックで吸収される |
| 3   | update モードの差分更新契約是正                              | 実装改善   | 高     | 既存スキル更新としては契約未閉鎖                     |

## スコープ外確認

以下はスコープ外として本 task から除外済み：

- `runImprovePromptWorkflow()` の本体実装
- `SkillService.updateSkill()` の内部永続化ロジック再設計
- skill 定義そのものの改訂

## formalize 済み

- `docs/30-workflows/unassigned-task/TASK-SC-UPDATE-MODE-DIFF-SEMANTICS-001.md`
