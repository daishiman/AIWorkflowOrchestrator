# Phase 10 是正計画

## MINOR項目

- M-01: shared buildのesbuild環境不整合
- M-02: global coverage閾値未達

## 対応方針

1. M-01: Node/PNPM/esbuildのバージョン整合をCI/ローカルで固定。
2. M-02: カバレッジ計測範囲を対象機能へ限定、または追加テストで分母を補正。

## フェーズ遷移

- Phase 11（手動テスト）へ進行。
- 重大戻り（Phase 5/6/1）不要。
