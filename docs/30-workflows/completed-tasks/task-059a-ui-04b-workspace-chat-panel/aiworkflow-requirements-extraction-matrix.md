# aiworkflow-requirements 抽出台帳

## 抽出入口

| 入口                                                                | 用途                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | 04B に関係するキーワードと検索分割ルールの確認            |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`    | UI実装 / LLM連携 / テスト実装として読むべき正本仕様の特定 |

| 分類         | 正本仕様                        | 04B で固定する契約                                                                                                   |
| ------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 入口         | `quick-reference.md`            | broad query を避け、`workspace` / `chat` / `streaming` / `conversation` / `mention` を分割検索する                   |
| 入口         | `resource-map.md`               | UI実装・LLM連携・テスト実装として必要最小限の仕様を段階読込する                                                      |
| UI           | `ui-ux-feature-components.md`   | Workspace ChatPanel は 04A の内部子コンポーネントとして実装し、04A レイアウト責務を侵食しない                        |
| UI           | `ui-ux-components.md`           | 既存 UI 基盤との再利用境界を維持する                                                                                 |
| UI           | `ui-ux-panels.md`               | `aria-live="polite"`、status 表示、panel 切替時の focus 移動を実装する                                               |
| UI           | `ui-ux-design-principles.md`    | 入力欄 44px 以上のタッチターゲット、focus ring、light/dark 両テーマで可読性を確保する                                |
| 状態管理     | `arch-state-management.md`      | `workspaceSlice` / `fileSelectionSlice` を再利用し、新規グローバル slice は Phase 3 で必要性が通らない限り追加しない |
| LLM          | `interfaces-llm.md`             | 送信は preload 公開 API 経由で行い、Renderer は provider adapter に直接触れない                                      |
| LLM          | `llm-streaming.md`              | chunk / end / error / cancel を renderer 側 state に正しく反映する                                                   |
| LLM          | `llm-workspace-chat-edit.md`    | file context は `workspacePath` 境界、`MAX_FILE_CONTEXTS`、size 上限を尊重する                                       |
| 会話履歴     | `interfaces-chat-history.md`    | `conversation:create/get/addMessage/update` でメッセージ永続化を行う                                                 |
| セキュリティ | `security-electron-ipc.md`      | `file:read` / `llm:*` / `conversation:*` の preload allowlist から外れたアクセスを設計に含めない                     |
| エラー       | `error-handling.md`             | file / stream / conversation 失敗時の分類と UI surfacing を固定する                                                  |
| テスト       | `testing-component-patterns.md` | component / hook / integration の3層テストを作成する                                                                 |
| テスト       | `testing-accessibility.md`      | mention dropdown、chip remove、send button、message list の keyboard 操作を検証する                                  |
| 構造         | `directory-structure.md`        | `WorkspaceView` 配下のファイル配置を既存構造へ揃える                                                                 |
| 品質         | `quality-requirements.md`       | Phase 7 で changed files coverage 基準を満たす                                                                       |
| 運用         | `task-workflow.md`              | Phase 12 で system spec と lessons を current workflow に同期する                                                    |
| 運用         | `lessons-learned.md`            | worktree / screenshot / canonical root の再発条件を事前に拾う                                                        |
