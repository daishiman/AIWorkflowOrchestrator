# Phase 1 要件定義書

## 目的

SkillAnalysisViewで改善実行後の `applied / skipped / errors` を明示表示し、再試行判断を可能にする。

## SubAgent分担実績

- SubAgent-A(UI): 結果パネルの表示要件、文言、優先順位を定義
- SubAgent-B(契約): `ImprovementResult` 契約とUI項目の対応を定義
- SubAgent-C(品質): a11y/可読性/レスポンス要件を定義

## 機能要件 (FR)

- FR-1: 改善実行後に結果内訳パネルを表示する
- FR-2: `applied` は提案名と結果ステータス(成功/一部成功/失敗)を表示する
- FR-3: `skipped` は提案名を表示する
- FR-4: `errors` は提案名と失敗理由を表示する
- FR-5: 結果内訳パネルは再分析前に短時間表示する
- FR-6: 結果内訳表示は既存の ScoreDisplay/SuggestionList/RiskPanel を破壊しない

## 非機能要件 (NFR)

- NFR-1: WCAG 2.1 AA を満たすため `role="status"` と `aria-live="polite"` を使用する
- NFR-2: 既存のCSS変数トークンを利用し、ダーク/ライト双方で可読性を維持する
- NFR-3: 適用処理中の状態破綻(二重送信・クラッシュ)を発生させない
- NFR-4: 既存テスト群と両立し、差分テストを追加する

## 契約要件

- 入力: `ImprovementResult`
- 表示対象:
  - `applied[].suggestion.description`
  - `applied[].result`
  - `skipped[].description`
  - `errors[].suggestion.description`
  - `errors[].error`
  - `executedAt`

## 完了判定

- [x] applied/skipped/errors の表示責務が重複なく分離されている
- [x] テスト設計へ変換可能な粒度で要件化されている
- [x] 改善アルゴリズム変更がスコープ外で明記されている
