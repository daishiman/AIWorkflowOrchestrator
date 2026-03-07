# Agent View Enhancement 要件トレーサビリティ・マトリクス

## 目的

`task-specification-creator` の品質基準（自己完結性・依存明示・観点網羅）と、`aiworkflow-requirements` の正本仕様参照を、単一ドキュメントで追跡可能にする。

## SubAgent分担（関心ごとの分離）

| SubAgent        | 関心ごと                        | 入力                             | 出力         |
| --------------- | ------------------------------- | -------------------------------- | ------------ |
| A: 仕様準拠監査 | Phase構造・依存関係             | phase-\*.md, verification-report | 構造整合判定 |
| B: 要件抽出監査 | aiworkflow-requirements参照網羅 | references/_.md, phase-_.md      | 参照漏れ判定 |
| C: 一貫性監査   | 矛盾・重複・命名                | phase-\*.md, artifacts.json      | 改善提案     |

## aiworkflow-requirements 抽出マップ

| 観点                   | 必須度   | 正本仕様                                                                                          | 本タスクでの適用内容              | 反映Phase                  |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------- |
| UI/UXコンポーネント    | 必須     | `references/ui-ux-components.md`                                                                  | SkillChip/ExecuteButton等のUI仕様 | 1,2,3,4,5,6,7,8,9,10,11,12 |
| 機能コンポーネント     | 必須     | `references/ui-ux-feature-components.md`                                                          | AgentView機能責務                 | 1,2,3,4,5,6,7,12           |
| デザイン原則           | 必須     | `references/ui-ux-design-principles.md`                                                           | Tap & Discover、Apple HIG、UX文言 | 1,2,3,8,9,10,12            |
| UIアーキテクチャ       | 必須     | `references/arch-ui-components.md`                                                                | 階層構造、Atomic Design整合       | 1,2,3,4,5,6,7,8,9,10,12    |
| 状態管理               | 必須     | `references/arch-state-management.md`                                                             | agentSlice拡張、P31個別セレクタ   | 1,2,3,4,5,6,7,8,9,10,11,12 |
| ナビゲーション         | 条件付き | `references/ui-ux-navigation.md`                                                                  | GlobalNavStripとのレイヤー整合    | 1,2,3,index                |
| テスト戦略             | 必須     | `references/testing-component-patterns.md`                                                        | コンポーネントテストの観点        | 7                          |
| アクセシビリティテスト | 必須     | `references/testing-accessibility.md`                                                             | WCAG 2.1 AAの検証項目             | 9,11                       |
| セキュリティ原則       | 必須     | `references/security-principles.md`                                                               | XSS/CSP/入力検証の品質ゲート      | 9                          |
| 実行UI仕様             | 条件付き | `references/ui-ux-agent-execution.md`                                                             | 実行中/完了/失敗の表示契約        | 11                         |
| 実装パターン           | 条件付き | `references/architecture-implementation-patterns.md`                                              | リファクタリング・P31/P40/P47適用 | 8                          |
| 品質要件               | 必須     | `references/quality-requirements.md`                                                              | 品質ゲート判定基準                | 9                          |
| 仕様更新運用           | 必須     | `references/task-workflow.md` / `references/lessons-learned.md` / `references/spec-guidelines.md` | Phase12での同期更新               | 10,12,13                   |

## 依存関係トレース

| 依存                   | 生成Phase | 参照Phase       |
| ---------------------- | --------- | --------------- |
| 要件定義書             | 1         | 2,3,8,10        |
| 設計書                 | 2         | 3,10,11,12,13   |
| 実装成果物             | 5         | 7,9,10,11,12,13 |
| テスト拡充成果物       | 6         | 7,8,11,12,13    |
| カバレッジ成果物       | 7         | 8,10,11,12,13   |
| リファクタリング成果物 | 8         | 9,10,11,12,13   |
| 品質成果物             | 9         | 10,11,12,13     |
| 最終レビュー成果物     | 10        | 11,12,13        |
| 手動テスト成果物       | 11        | 12,13           |
| ドキュメント成果物     | 12        | 13              |

## 整合性判定（現時点）

- `verify-all-specs`: 警告 0 / エラー 0
- `validate-phase-output`: エラー 0（命名推奨警告 2件のみ）
- `validate-phase12-implementation-guide`: PASS

## 残課題（仕様品質上の軽微）

1. `phase-7-coverage-check.md` を推奨名 `phase-7-coverage-check.md` に寄せるか判断
2. `phase-11-manual-test.md` を推奨名 `phase-11-manual-test.md` に寄せるか判断
