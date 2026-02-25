# Phase 8 表現統一ルール

## 命名規則

- チャネル: `skill:{domain}:{action}`
- 定数名: `SKILL_<DOMAIN>_<ACTION>`
- APIメソッド: lowerCamelCase

## 用語統一

- 「チャネル」: IPC通信名
- 「定数」: `IPC_CHANNELS.*`
- 「onチャネル」: Main→Renderer pushイベント
- 「三点同期」: `channels.ts`, `skill-api.ts`, `preload/types.ts`

## task-9更新時の記述ルール

1. 各taskで追加チャネル数を明記する。
2. handle/on内訳を明記する。
3. `artifacts.modifies` と `artifacts.creates` を同時更新する。
4. `skill:importFromSource` を正本名称として記載する。

## 禁止表現

- ワイルドカード許可（`skill:*`）
- 曖昧語（「必要に応じて」「適切に」）
- 実体と異なるパスを注記なしで断定

## 完了状態

- Phase 8 Task 8-2: Completed
