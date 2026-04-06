# Lessons Learned — Skill Creator IPC ハンドラー責務分離（Session vs Runtime）

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: TASK-UI-02 ConversationPanel 孤立解消で発生した IPC ハンドラー責務分散の記録

## TASK-UI-02: Skill Creator IPC ハンドラー責務分離

### タスク概要

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-02 / TASK-SDK-SC-04                                                                                          |
| 目的       | `SkillCreatorConversationPanel` の孤立を解消し、`ConversationalInterview` へ一本化する。Session IPC と Runtime IPC の責務境界を確定する |
| 完了日     | 2026-04-06                                                                                                           |
| ステータス | **完了**                                                                                                             |

### 実装内容

| 変更内容                       | ファイル                                                                             | 説明                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| ConversationPanel stub 化      | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | `export {}` stub 化。`ConversationalInterview` が正式な対話 UI に一本化   |
| Session IPC 廃止               | `apps/desktop/src/preload/skill-creator-session-api.ts`                              | `skillCreatorSessionAPI` を廃止し Runtime IPC を正本採用                  |
| IPC チャンネル移管             | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                       | `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` をここへ集約  |
| IpcBridge 責務限定             | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`                    | `SKILL_CREATOR_SESSION_START` / `SKILL_CREATOR_SESSION_ANSWER` のみ残留   |
| Skill Creator Widgets stub 化  | `apps/desktop/src/renderer/components/skill-creator/` 各ファイル                    | `QuestionCard` / `ChoiceButton` / `ConversationProgress` / `FreeTextInput` |
| SkillCreatorResultPanel 移動   | `apps/desktop/src/renderer/components/skill/`                                        | `skill-creator/` ディレクトリから `skill/` ディレクトリへ移動             |

### 苦戦箇所と解決策

#### 1. Session IPC と Runtime IPC で同チャンネルを二重ハンドリングする構造

| 項目       | 内容                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `SkillCreatorIpcBridge` が Session 系（SESSION_START / SESSION_ANSWER）だけでなく、`CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` も処理していたため、Runtime IPC との責務が混在していた |
| **原因**   | TASK-SDK-SC-04 での Skill Output 統合実装時に、便宜上 `SkillCreatorIpcBridge` へまとめてハンドラーを追加したことで责务境界が曖昧になった                                                             |
| **解決策** | `SkillCreatorIpcBridge` の責務を「セッションライフサイクル管理（START / ANSWER）」のみに限定し、それ以外の Runtime チャンネルはすべて `creatorHandlers.ts` へ一元移管した                             |
| **教訓**   | IPC ハンドラーは「Session scope（対話セッション専任）」と「Runtime scope（ワークフロー実行専任）」の 2 軸で分類し、新規チャンネル追加時に scope を先に確定してからハンドラー配置先を決める              |

**ハンドラー責務分離マトリクス**:

| チャンネル | scope | 正本ハンドラー | 備考 |
| --- | --- | --- | --- |
| `SKILL_CREATOR_SESSION_START` | Session | `SkillCreatorIpcBridge` | セッション起動専任 |
| `SKILL_CREATOR_SESSION_ANSWER` | Session | `SkillCreatorIpcBridge` | 回答受信専任 |
| `CONFIGURE_API` | Runtime | `creatorHandlers.ts` | TASK-UI-02 で移管 |
| `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` | Runtime | `creatorHandlers.ts` | TASK-UI-02 で移管 |

---

#### 2. stub 化 vs git delete の扱いが Phase 9 QA checklist に未定義

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `SkillCreatorConversationPanel` 等の UI コンポーネントを「削除」するか「stub 化（`export {}`）」するかの判断基準が Phase 9 QA checklist に記載されていなかった                         |
| **原因**   | コンポーネント削除の影響範囲（import 先・テスト・型参照）が広く、単純削除ではビルドエラーが連鎖するリスクがあった。stub 化は既存 import を壊さずに実装を無効化できる安全なアプローチ |
| **解決策** | stub 化（`export {}`）を選択し、既存 import を維持しつつコンポーネントを無効化した。Phase 9 QA checklist に「stub 化 vs git delete の判断基準」を追記する（FB-1 改善提案）             |
| **教訓**   | 既存 import が多数存在するコンポーネントの廃止は、まず stub 化で安全に無効化し、import 整理が完了した後に git delete する 2 ステップを標準手順とする                                   |

---

#### 3. 「全テスト SIGKILL 問題」が Phase 1 要件定義に未定義

| 項目       | 内容                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `pnpm test` の全テスト一括実行でプロセスが SIGKILL で終了するケースが発生したが、Phase 1 要件定義にこのリスクと対処方針が記載されていなかった               |
| **原因**   | メモリ集約型のテストスイートを大量並列実行すると OOM Killer が発動する。Vitest の `--pool=forks` / `--maxWorkers` 制約が事前に共有されていなかった           |
| **解決策** | focused vitest（特定ファイルを `vitest run <path>` で個別実行）で代替した                                                                                  |
| **教訓**   | Phase 1 要件定義に「全テスト一括実行での SIGKILL リスクとその回避策（focused vitest / --maxWorkers 制限）」を事前定義する（FB-2 改善提案）                  |

---

### 標準ルール（再発防止）

1. IPC ハンドラー新規追加時は「Session scope / Runtime scope」のどちらに属するかを先に確定する。
2. 既存コンポーネントの廃止は stub 化 → import 整理 → git delete の 2 ステップを標準手順とする。
3. Phase 1 要件定義には「全テスト SIGKILL リスクと対処方針」を必ず記載する。
4. `SkillCreatorIpcBridge` への新規ハンドラー追加は Session 系チャンネルのみ許可し、Runtime 系は `creatorHandlers.ts` へ追加する。

### 関連ドキュメント

| ドキュメント | 関連性 |
| --- | --- |
| [ipc-contract-checklist.md](./ipc-contract-checklist.md) | Skill Creator IPC scope 分離マトリクス |
| [lessons-learned-ipc-channel-whitelist-sync.md](./lessons-learned-ipc-channel-whitelist-sync.md) | whitelist 同期ガード教訓 |
| [ui-ux-navigation.md](./ui-ux-navigation.md) | TASK-UI-02 IPC ハンドラー責務分離記録 |
