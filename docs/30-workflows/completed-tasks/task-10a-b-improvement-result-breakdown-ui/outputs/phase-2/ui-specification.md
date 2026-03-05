# Phase 2 UI仕様

## SubAgent分担実績

- SubAgent-A: UI階層/配置設計
- SubAgent-B: 表示タイミングと状態導線
- SubAgent-C: a11y反映方針

## コンポーネント構成

- organism: `SkillAnalysisView`
- molecule(新規): `ImprovementResultBreakdown`
- existing molecule: `ScoreDisplay`, `SuggestionList`, `RiskPanel`

## 配置ルール

- `analysis && !error` ブロック内の先頭に `ImprovementResultBreakdown` を表示
- 既存3区画はそのまま維持

## 表示ルール

- ヘッダ: 「改善実行結果」 + 実行日時
- サマリ: 成功/スキップ/失敗件数
- セクション:
  - 適用済み (`applied`)
  - スキップ (`skipped`)
  - 失敗 (`errors`)
- 空結果: 「変更対象はありませんでした。」

## トークン/カラー

- 成功: `--status-success`
- スキップ: `--status-warning`
- 失敗: `--status-error`
- 背景/境界: `--bg-primary`, `--bg-secondary`, `--border-primary`

## 完了判定

- [x] 既存3区画と責務競合しない
- [x] 結果表示情報の階層が確定
