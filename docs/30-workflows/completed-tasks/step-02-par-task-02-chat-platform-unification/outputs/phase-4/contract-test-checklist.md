# 契約テストチェックリスト

- [x] `activateChatMode("workspace")` が context を受け取る
- [x] `activateChatMode("skill-lifecycle")` が lifecycle job を保持する
- [x] model 未選択で `MODEL_REQUIRED` を返す
- [x] stream start failure で retryable error を保持する
- [x] abort が cancel IPC を呼ぶ
- [x] recent session rail で session 復帰できる
- [x] Workspace button が chat view に handoff する
- [x] Skill Center button が chat view に handoff する
- [x] light theme でも Chat surface が読める
