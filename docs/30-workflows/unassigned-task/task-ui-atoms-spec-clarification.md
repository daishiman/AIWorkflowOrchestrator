# UT-UI-ATOMS-SPEC-CLARIFICATION-001: SuggestionBubble success-bounce 責務明確化

## メタ情報

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-UI-ATOMS-SPEC-CLARIFICATION-001                                            |
| タスク名     | SuggestionBubble success-bounceマイクロインタラクションの仕様書責務記述明確化 |
| 優先度       | 低                                                                            |
| 複雑度       | trivial                                                                       |
| 発見元       | TASK-UI-00-ATOMS Phase 10 MINOR指摘 M-3                                       |
| 依存タスク   | なし                                                                          |
| ブロック対象 | なし                                                                          |

## 目的

仕様書 `00-2-atoms-components.md` のSuggestionBubbleセクションに記載された「success-bounce」マイクロインタラクションの責務が、実際にはEmptyStateコンポーネント（`mood="celebrating"`）側にある点を仕様書で明確に記述する。現状の仕様書ではSuggestionBubble自体がsuccess-bounceを実装するように読めるため、将来の開発者が混乱する可能性がある。

## Why（なぜ必要か）

- 仕様書のSuggestionBubbleセクション「マイクロインタラクション」テーブルに「タップ後: success-bounceアニメーション」と記載されているが、実装ではSuggestionBubble単体にはbounceアニメーションは存在しない
- bounceアニメーションはEmptyStateの `mood="celebrating"` でアイコンラッパーに適用される
- 仕様書の記述が曖昧なため、SuggestionBubble単体でbounceを実装すべきか、EmptyState統合時のみ発動すべきかが不明確
- Phase 11手動テスト（#21）でもCONDITIONAL判定となっており、仕様の曖昧さが確認手順に影響している

## 実行タスク

### Task 1: 仕様書の責務記述修正

`docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` の以下の箇所を修正する:

1. **SuggestionBubble マイクロインタラクション テーブル**: 「タップ後: success-bounce」の記述に「EmptyState (`mood="celebrating"`) との統合時にアイコンに適用。SuggestionBubble単体には不適用」と注記を追加する
2. **EmptyState mood バリアント テーブル**: `celebrating` の「アニメーション」欄に「success-bounce（アイコンラッパーに適用。SuggestionBubbleではなくEmptyStateのアイコン要素がアニメーション対象）」と明記する

### Task 2: Phase 11テスト項目との整合

Phase 11テスト項目 #21（SuggestionBubble クリックで success-bounce）の期待結果を仕様修正に合わせて更新する。

## 成果物

| #   | 成果物         | パス                                                                                        |
| --- | -------------- | ------------------------------------------------------------------------------------------- |
| 1   | 修正済み仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |

## 完了条件

- [ ] SuggestionBubbleセクションのマイクロインタラクション記述がsuccess-bounceの実際の責務（EmptyState側）を正確に反映している
- [ ] EmptyStateセクションのcelebratingバリアントのアニメーション記述がアニメーション対象要素を明記している
- [ ] 仕様書の記述と実装コードの挙動に矛盾がない

## 参照資料

- `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` -- 実装（bounce未実装）
- `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx` -- 実装（mood="celebrating"でanimate-bounce適用）
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` -- 仕様書（Task 5, Task 6）
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-10/final-review-result.md` -- Phase 10 MINOR M-3
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-11/manual-test-result.md` -- Phase 11 テスト #21

## 親タスク教訓

| 教訓                       | 内容                                                                                                                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| コンポーネント間責務の明記 | 共通仕様セクションの「マイクロインタラクション」テーブルが各コンポーネントの個別仕様にコピーされた際、実際の責務配分（どのコンポーネントがアニメーションを実装するか）が不明確になった。共通仕様を個別仕様に展開する場合は、責務の所在を明示する注記を付与すべき |
| 仕様書の曖昧表現回避       | 02-code-quality.md ルール「仕様書に曖昧表現（「適切に」「必要に応じて」「など」）を使わない」に準じ、アニメーション適用対象の要素とコンポーネントを具体的に記載する                                                                                              |
