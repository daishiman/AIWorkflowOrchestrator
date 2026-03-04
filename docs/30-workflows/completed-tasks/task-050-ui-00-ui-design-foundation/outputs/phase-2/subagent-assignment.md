# Phase 2 SubAgent分担表

## チーム構成（関心ごと分離）

| SubAgent              | 担当                                         | 入力                        | 出力                                           |
| --------------------- | -------------------------------------------- | --------------------------- | ---------------------------------------------- |
| A: Design Tokens      | テーマトークン整合（Task 1, 5C）             | `tokens.css`, Apple HIG要件 | トークン差分方針、インタラクショントークン確認 |
| B: Component Catalog  | Atomicコンポーネント設計（Task 2）           | Task 2インターフェース仕様  | Atoms/Molecules/Organisms責務境界              |
| C: UX/A11y/Responsive | WCAG/操作導線/レスポンシブ（Task 4,5,5B,5D） | UI原則・A11y基準            | ARIA/フォーカス/画面幅別動作の設計             |
| D: Test Strategy      | テスト戦略（Task 6）                         | AC一覧、設計成果            | Red/Green計画、TC-ID台帳                       |

## 並列実行方針

- A/B/C/Dは設計フェーズで独立ドラフトを同時作成
- 統合時に `Props命名` / `状態名` / `TC-ID` の衝突を解消
- 依存がある統合作業（テストケース採番、最終命名）は直列で実施
