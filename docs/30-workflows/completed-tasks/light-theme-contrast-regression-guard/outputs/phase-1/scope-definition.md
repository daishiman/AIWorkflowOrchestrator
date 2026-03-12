# Scope Definition

> P50パターン該当: 検証・補完モード。既存 light theme 実装の再発検知責務だけを本 workflow に残す。

## In Scope

- representative surface の screenshot matrix 定義
- hardcoded color audit rule と優先度定義
- current / baseline evidence policy
- Phase 11 manual review と Phase 12 system spec sync の handoff

## Out of Scope

- token 値の変更
- renderer component / view の色置換そのもの
- 本ターンでの実装、テスト実行、スクリーンショット取得
- commit / push / PR

## Routing Rule

| 事象                                        | 一次責務                              |
| ------------------------------------------- | ------------------------------------- |
| token hierarchy の設計不整合                | light-theme-token-foundation          |
| component 直書き色の実装修正                | light-theme-shared-color-migration    |
| screenshot / evidence / documentation drift | light-theme-contrast-regression-guard |

## 依存前提

1. Phase 1-3 の設計成果物が揃うまで future execution に進まない
2. `.claude` を正本とし、`.agents` は mirror として扱う
3. current evidence は current build static serve と selector-based capture を前提にする
