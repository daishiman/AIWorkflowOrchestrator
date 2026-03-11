# Phase 1 SubAgent責務表

| SubAgent   | 関心       | 実施内容                                                                                            |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------- |
| SubAgent-A | UI/UX      | `WorkspaceChatPanel` / `WorkspaceChatInput` / `WorkspaceChatMessageList` / chips / mention dropdown |
| SubAgent-B | 状態・通信 | `useWorkspaceChatController` で conversation + stream + attach 制御                                 |
| SubAgent-C | テスト     | `WorkspaceView.test.tsx` 拡張、mention hook test、file selection test                               |
| SubAgent-D | 仕様同期   | outputs 生成、system spec 更新、LOGS/SKILL 更新、validator 実行                                     |
