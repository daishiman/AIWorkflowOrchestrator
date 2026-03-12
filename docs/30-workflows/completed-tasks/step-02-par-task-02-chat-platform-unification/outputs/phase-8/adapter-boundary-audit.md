# Adapter 境界監査

| Surface      | 入口責務              | 共通基盤へ渡すもの           | 持たない責務         |
| ------------ | --------------------- | ---------------------------- | -------------------- |
| Chat         | direct chat 開始      | `entryPoint: chat`           | file collection      |
| Workspace    | file/context 準備     | workspace context            | stream/render 本体   |
| Skill Center | lifecycle intent 整理 | lifecycle job + handoffLabel | skill execution 本体 |

## 監査結果

- boundary leak なし
- Workspace/Skill Center とも `activateChatMode()` の public contract だけを利用
