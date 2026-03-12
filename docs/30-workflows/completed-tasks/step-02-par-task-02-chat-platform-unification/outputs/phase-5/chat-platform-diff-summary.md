# Chat Platform Diff Summary

## 以前

- message list は単一配列中心
- stream state と UI hook の責務が競合
- Workspace/Skill Center から chat 基盤への handoff 契約が弱い

## 以後

- mode 単位の reusable session を保持
- stream start/end/error/cancel を `chatSlice` に集約
- Workspace/Skill Center は adapter として context を渡す
- ChatView は mode 差分を UI で可視化

## 期待効果

- Task03 が独自会話基盤を持たずに済む
- abort/retry/context merge の不具合点が 1 箇所へ集まる
