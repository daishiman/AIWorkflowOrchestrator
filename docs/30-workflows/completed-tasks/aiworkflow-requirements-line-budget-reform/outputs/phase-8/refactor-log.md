# Phase 8 Output: Refactor Log

## 実施した整理

- 親仕様書の命名を据え置き、child companion を `core` / `details` / `advanced` / `reference` / `history` に正規化
- F1 は `active` / `completed-*` / `backlog` / `history`、`logs-archive-*`、`lessons-learned-*` へ整理
- parent には共通で `概要`、`仕様書インデックス`、`利用順序`、`関連ドキュメント` を配置
- `generate-index.js` 再生成で `quick-reference.md` / `resource-map.md` / `keywords.json` / `topic-map.md` を再同期

## 判定

- naming drift: 解消
- duplicate explanation: parent に限定
- discovery drift: representative path で解消
