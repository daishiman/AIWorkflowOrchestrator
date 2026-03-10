# Agent View Enhancement 要件トレーサビリティ・マトリクス

## 目的

`task-specification-creator` の品質基準（自己完結性・依存明示・観点網羅）と、`aiworkflow-requirements` の正本仕様参照を、単一ドキュメントで追跡可能にする。

## SubAgent分担（関心ごとの分離）

| SubAgent        | 関心ごと                        | 入力                                                                   | 出力         |
| --------------- | ------------------------------- | ---------------------------------------------------------------------- | ------------ |
| A: 仕様準拠監査 | Phase構造・依存関係             | phase-\*.md, verification-report                                       | 構造整合判定 |
| B: 要件抽出監査 | aiworkflow-requirements参照網羅 | `.claude/skills/aiworkflow-requirements/references/*.md`, `phase-*.md` | 参照漏れ判定 |
| C: 一貫性監査   | 矛盾・重複・命名                | phase-\*.md, artifacts.json                                            | 改善提案     |

## aiworkflow-requirements 抽出マップ

| 観点                   | 必須度   | 正本仕様                                                                                          | 本タスクでの適用内容                             | 反映Phase                  |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| UI/UXコンポーネント    | 必須     | `references/ui-ux-components.md`                                                                  | SkillChip/ExecuteButton等のUI仕様                | 1,2,3,4,5,6,7,8,9,10,11,12 |
| 機能コンポーネント     | 必須     | `references/ui-ux-feature-components.md`                                                          | AgentView機能責務                                | 1,2,3,4,5,6,7,12           |
| デザイン原則           | 必須     | `references/ui-ux-design-principles.md`                                                           | Tap & Discover、Apple HIG、UX文言                | 1,2,3,8,9,10,12            |
| デザインシステム       | 必須     | `references/ui-ux-design-system.md`                                                               | デザイントークン、8px grid、配色                 | 1,2,3,5,8,9,11,12          |
| UIアーキテクチャ       | 必須     | `references/arch-ui-components.md`                                                                | 階層構造、Atomic Design整合                      | 1,2,3,4,5,6,7,8,9,10,12    |
| 状態管理               | 必須     | `references/arch-state-management.md`                                                             | agentSlice拡張、P31個別セレクタ                  | 1,2,3,4,5,6,7,8,9,10,11,12 |
| ナビゲーション         | 条件付き | `references/ui-ux-navigation.md`                                                                  | GlobalNavStripとのレイヤー整合                   | 1,2,3,index                |
| 実行UI仕様             | 必須     | `references/ui-ux-agent-execution.md`                                                             | 実行中/完了/失敗の表示契約                       | 1,2,3,5,9,11,12            |
| モデル選択UI           | 必須     | `references/ui-ux-llm-selector.md`                                                                | AdvancedSettingsPanel のモデル選択               | 1,2,3,5,11,12              |
| 許可設定UI             | 必須     | `references/ui-ux-settings.md`                                                                    | AdvancedSettingsPanel の許可モード/記憶済み件数  | 1,2,3,5,9,11,12            |
| スキル実行セキュリティ | 必須     | `references/security-skill-execution.md`                                                          | PermissionMode、remembered choice、allowed tools | 1,2,5,9,12                 |
| テスト戦略             | 必須     | `references/testing-component-patterns.md`                                                        | コンポーネント/Store テストの観点                | 4,6,7,9                    |
| テストフィクスチャ     | 必須     | `references/testing-fixtures.md`                                                                  | Props/Store factory、境界値フィクスチャ          | 4,6,7                      |
| アクセシビリティテスト | 必須     | `references/testing-accessibility.md`                                                             | WCAG 2.1 AAの検証項目                            | 9,11                       |
| セキュリティ原則       | 必須     | `references/security-principles.md`                                                               | XSS/CSP/入力検証の品質ゲート                     | 9                          |
| 実装パターン           | 必須     | `references/architecture-implementation-patterns.md`                                              | P24/P31/P40/P47、段階移行、型ドリフト是正        | 2,3,5,8,9,12               |
| 品質要件               | 必須     | `references/quality-requirements.md`                                                              | 品質ゲート判定基準                               | 9                          |
| 仕様更新運用           | 必須     | `references/task-workflow.md` / `references/lessons-learned.md` / `references/spec-guidelines.md` | Phase12での同期更新                              | 10,12,13                   |

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
- `validate-phase-output`: エラー 0 / 警告 0
- `validate-phase12-implementation-guide`: 未実行（Phase 12 実成果物は今回の作成対象外）

## 現行実装照合メモ

1. `apps/desktop/src/renderer/views/AgentView/index.tsx` には `importedSkills as unknown as Skill[]` と `availableSkillsMetadata as unknown as Skill[]` の型アサーションが残存している。P24観点を仕様書側でも見落とさないよう、`architecture-implementation-patterns.md` を必須参照に引き上げた。
2. `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` は現状 `permissionMode: string` を受け、`AgentView` からも空のモデル配列・ダミーコールバックが渡されている。モデル選択・許可設定の本来契約を落とさないため、`ui-ux-llm-selector.md` / `ui-ux-settings.md` / `security-skill-execution.md` を必須参照に追加した。
3. Phase 10/12 の `task-workflow.md` 参照は自己完結性のためフルパスに統一する。`task-specification-creator` の「依存明示」基準に合わせる。
4. 本ブランチでは元タスク仕様 `task-058a-ui-03-agent-view-enhancement.md` の canonical path が旧シーケンス配置から `tasks/completed-task/` へ移動している。workflow 仕様書群も同じ正本へ追従させ、参照ドリフトを解消した。

## 残課題（仕様品質上の軽微）

1. Phase 12 実行時に `outputs/phase-12/implementation-guide.md` などの実成果物を生成して `validate-phase12-implementation-guide` を通す
2. Phase 10/12 で未タスクが出た場合は `docs/30-workflows/unassigned-task/` へ切り出し、`.claude/skills/aiworkflow-requirements/references/task-workflow.md` と `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` を同一ターンで同期する
