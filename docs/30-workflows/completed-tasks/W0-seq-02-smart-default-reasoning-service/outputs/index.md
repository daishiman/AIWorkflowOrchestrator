# W0-seq-02: スマートデフォルト推論サービス実装

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001                              |
| タスク名     | スマートデフォルト推論サービス実装                                          |
| タスク種別   | NON_VISUAL                                                                  |
| 実行順       | Wave 0（W0-seq-01完了後・直列）                                             |
| 依存タスク   | W0-seq-01（共有型定義）                                                     |
| 対象ファイル | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` |
| 作成日       | 2026-04-08                                                                  |
| ステータス   | completed                                                                   |
| 関連Issue    | #2003                                                                       |

## 概要

スキルウィザードにおいて、ユーザーが入力したスキル情報（`SkillInfoFormData`）を元に
AIが推奨設定（`SmartDefaultResult`）を自動提案する独立推論サービスを実装する。

W0-seq-01 で `SmartDefaultResult` 型定義は完了済みだが、実際にその値を生成する
推論ロジックが未実装（スタブ状態）のため、本タスクで独立サービスとして実装する。

推論サービスは `packages/shared/` に配置し、規則ベース推論を実装する。
フォールバック定義・`inferenceLog` による根拠記録・全受け入れ基準（AC-1〜AC-4）の充足が必須。
本タスクは NON_VISUAL であり、Phase 11 は画面証跡ではなく REPL / CLI の確認記録を主証跡とする。

## 実装対象

| ファイル                                                                                   | 変更種別 | 概要                           |
| ------------------------------------------------------------------------------------------ | -------- | ------------------------------ |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                | 新規     | 推論サービス本体               |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 新規     | ユニットテスト                 |
| `packages/shared/src/services/skillCreator/index.ts`（または同等の barrel）                | 変更     | 推論サービスのエクスポート追加 |

## 受け入れ基準（AC）

| AC番号 | 内容                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| AC-1   | `inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult` が実装されること          |
| AC-2   | スキル入力から適切なカテゴリ・ツール・タイミング・フォーマットのデフォルト値が提案されること |
| AC-3   | ユニットテストが全件 PASS すること                                                           |
| AC-4   | 推論不能時のフォールバック挙動が定義・実装されること                                         |

## 推論ルール概要

| 入力フィールド         | 推論キーワード                                   | 推論結果                              |
| ---------------------- | ------------------------------------------------ | ------------------------------------- |
| `purpose`（目的）      | "Slack" を含む                                   | `tool = "slack"`                      |
| `purpose`（目的）      | "GitHub" を含む                                  | `tool = "github"`                     |
| `purpose`（目的）      | "Notion" を含む                                  | `tool = "notion"`                     |
| `purpose`（目的）      | "毎日" / "毎週" / "定期" / "スケジュール" を含む | `timing = "scheduled"`                |
| `purpose`（目的）      | "リアルタイム" / "即座" / "すぐに" を含む        | `timing = "realtime"`                 |
| `category`（カテゴリ） | `"code-support"`                                 | `format = "code"`                     |
| `category`（カテゴリ） | `"data-analysis"`                                | `format = "structured"`               |
| 上記いずれも非該当     | -                                                | 各フィールド `null`（フォールバック） |

## フォールバック挙動

推論できなかったフィールドは `null` を返す。
推論結果が0件でも `inferenceLog` は空配列として返す（エラーにならない）。
`null` フィールドは呼び出し側（`SkillCreateWizard`）が既定値として扱う。

## Phaseリスト

| Phase | 名前                                      | 概要                                         |
| ----- | ----------------------------------------- | -------------------------------------------- |
| 1     | [要件定義](phase-1-requirements.md)       | 影響範囲分析・受け入れ基準定義               |
| 2     | [設計](phase-2-design.md)                 | 推論サービスのAPI設計・フローチャート確定    |
| 3     | [設計レビュー](phase-3-design-review.md)  | 設計の矛盾・漏れチェック                     |
| 4     | [テスト作成](phase-4-test-creation.md)    | Red段階テスト定義（TDD起点）                 |
| 5     | [実装](phase-5-implementation.md)         | 推論サービス本体の実装                       |
| 6     | [テスト拡充](phase-6-test-expansion.md)   | エッジケース・回帰テスト追加                 |
| 7     | [カバレッジ](phase-7-coverage-check.md)   | カバレッジ計測・未到達分析                   |
| 8     | [リファクタ](phase-8-refactoring.md)      | コード品質改善・責務分離確認                 |
| 9     | [品質保証](phase-9-quality-assurance.md)  | 静的解析・リスク評価・因果ループ監査         |
| 10    | [最終レビュー](phase-10-final-review.md)  | Phase 1-9 の成果物統合レビュー               |
| 11    | [手動テスト](phase-11-manual-test.md)     | ウィザード統合動作確認（推論結果の適用確認） |
| 12    | [ドキュメント](phase-12-documentation.md) | 実装ガイド・仕様更新・フィードバック         |
| 13    | [PR作成](phase-13-pr-creation.md)         | 提出準備・承認待ち                           |
