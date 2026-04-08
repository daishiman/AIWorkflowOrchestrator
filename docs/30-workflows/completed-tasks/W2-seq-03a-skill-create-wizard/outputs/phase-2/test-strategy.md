# Phase 2: テスト方針 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## テスト方針の概要

本タスクは TDD（テスト駆動開発）方式を採用する。
実装前にテストを全件記述し、Red → Green → Refactor のサイクルで品質を確保する。

## テストフレームワーク

| 項目           | 内容                                             |
| -------------- | ------------------------------------------------ |
| フレームワーク | Vitest                                           |
| 実行コマンド   | `pnpm vitest run`                                |
| テストファイル | `__tests__/smartDefaultReasoningService.test.ts` |
| インポート元   | `@repo/shared`（barrel 経由）                    |

## TDD 方針

1. **Red フェーズ**: テストファイルのみ作成し、実装は空のまま全件 FAIL を確認する
2. **Green フェーズ**: 最小限の実装でテストを全件 PASS させる
3. **Refactor フェーズ**: 可読性・保守性を高めつつ、テストが PASS を維持することを確認する

## テスト分類

### ユニットテスト（推論ロジック分岐ごとに1件ずつ）

| 分類             | テスト対象                                | 主な検証内容                      |
| ---------------- | ----------------------------------------- | --------------------------------- |
| ツール推論       | `inferTool()` 内部 / `purpose` キーワード | Slack / GitHub / Notion / null    |
| タイミング推論   | `inferTiming()` 内部 / 正規表現           | scheduled / realtime / null       |
| フォーマット推論 | `inferFormat()` 内部 / `category` 値      | code / structured / null          |
| inferenceLog     | ログ件数・内容                            | 推論件数と記録内容の整合          |
| フォールバック   | purpose が空/null/undefined               | tool・timing は null / エラーなし |
| 組み合わせ       | purpose + category 複合入力               | 全フィールドの組み合わせ確認      |

### 推論分岐網羅方針

- `TOOL_KEYWORDS` の各エントリ（Slack, GitHub, Notion）を個別に検証する
- `SCHEDULED_PATTERN`（毎日・毎週・定期・スケジュール）を個別に検証する
- `REALTIME_PATTERN`（リアルタイム・即座・すぐに）を個別に検証する
- 先勝ちルール（複数キーワード重複時の優先順位）を検証する
- 大文字小文字区別を明示的に検証する（例: 'Slack' vs 'slack'）

## テストケース件数計画

| フェーズ        | テストケース範囲   | 件数     |
| --------------- | ------------------ | -------- |
| Phase 4         | TC-01〜TC-15       | 15件     |
| Phase 6         | TC-16〜TC-20       | 5件      |
| Phase 6（追加） | エッジケース追加分 | 13件     |
| **合計**        |                    | **33件** |

## 品質基準

- 全テスト PASS が実装完了の条件
- 推論0件時も `inferenceLog` は `[]` を返すことをテストで担保する
- エラーを throw せず必ず値を返すことをテストで検証する
- 外部依存ゼロ（モック不要）を維持する
