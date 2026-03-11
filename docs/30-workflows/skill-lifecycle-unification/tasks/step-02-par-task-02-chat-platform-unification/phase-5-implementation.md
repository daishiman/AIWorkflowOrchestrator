# Phase 5: 実装 - タスク仕様書

## 目的

Task02 設計に従い、共通会話基盤を実装し、既存チャット導線を mode 差分として統合する。

## 実装対象

- 共通チャット状態モデル
- ストリーミング統合
- 会話履歴永続化
- Workspace 文脈 adapter
- Skill lifecycle mode の露出

## SubAgent 分担

- Session Agent: 会話 ID / 履歴
- Stream Agent: chunk / abort / retry
- Context Agent: workspace / skill lifecycle 文脈

## 完了条件

- [ ] 3モードが同一基盤で動作する
- [ ] Task03 が共通 API を利用できる
