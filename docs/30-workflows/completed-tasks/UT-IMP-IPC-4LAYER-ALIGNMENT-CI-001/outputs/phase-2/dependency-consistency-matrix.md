# Phase 2 成果物: 依存整合マトリクス

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| タスク | タスク5: 依存整合マトリクス        |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 4層間依存関係マトリクス

### 1.1 データフロー依存

```
Layer 1 (shared)      ←── 定義の正本
    │
    │ import
    ▼
Layer 2 (preload)     ←── ホワイトリスト + shared import + 独自定義
    │
    │ ipcRenderer.invoke → ipcMain.handle
    ▼
Layer 3 (main)        ←── ハンドラ実装
    │
    │ contextBridge.exposeInMainWorld
    ▲
Layer 2 (preload)     ←── API 構築 (safeInvoke/safeOn)
    │
    │ window.electronAPI
    ▼
Layer 4 (renderer)    ←── API 消費
```

### 1.2 ファイル間依存マトリクス

| 依存元 → 依存先    | 依存タイプ  | 検証ルール | 備考                           |
| ------------------ | ----------- | ---------- | ------------------------------ |
| preload → shared   | import      | Rule-1     | APPROVAL_CHANNELS 等の import  |
| preload → main     | IPC通信     | Rule-2     | safeInvoke → ipcMain.handle    |
| renderer → preload | API呼び出し | Rule-3     | window.electronAPI 経由        |
| main → preload     | IPC通信     | -          | webContents.send (on チャネル) |
| shared → (なし)    | -           | -          | 正本のため外部依存なし         |

---

## 2. 新規スクリプトの依存マトリクス

### 2.1 verify-ipc-4layer.js の依存

| 依存先              | 依存タイプ | 必須 | 用途                |
| ------------------- | ---------- | ---- | ------------------- |
| Node.js fs          | ランタイム | YES  | ファイル読み取り    |
| Node.js path        | ランタイム | YES  | パス解決            |
| shared/channels.ts  | 読取対象   | YES  | Rule-1 のソース     |
| preload/channels.ts | 読取対象   | YES  | Rule-1,2,3 のソース |
| main/ipc/\*.ts      | 読取対象   | YES  | Rule-2 のソース     |
| preload/\*.ts       | 読取対象   | YES  | Rule-3 のソース     |

### 2.2 テストの依存

| 依存先               | 依存タイプ   | 必須 | 用途                        |
| -------------------- | ------------ | ---- | --------------------------- |
| Vitest               | テストFW     | YES  | テスト実行                  |
| verify-ipc-4layer.js | テスト対象   | YES  | module.exports でインポート |
| テストフィクスチャ   | テストデータ | YES  | 期待入出力の定義            |

### 2.3 CI の依存

| 依存先                | 依存タイプ | 必須 | 用途             |
| --------------------- | ---------- | ---- | ---------------- |
| actions/checkout@v4   | CI         | YES  | ソースコード取得 |
| actions/setup-node@v6 | CI         | YES  | Node.js 環境構築 |
| build-shared job      | CI順序     | YES  | 実行順序の安定性 |

---

## 3. 検証ルールと対象ファイルの整合マトリクス

### 3.1 Rule-1: shared -> preload

| shared 定義グループ                       | preload 対応         | 整合状態 | 備考                                     |
| ----------------------------------------- | -------------------- | -------- | ---------------------------------------- |
| CHAT_EXPORT_CHANNELS (2ch)                | 要確認               | -        | 実装時に検証                             |
| FILE_SYSTEM_CHANNELS (3ch)                | 要確認               | -        | DIALOG_SHOW_SAVE は preload にもある     |
| SKILL_CHANNELS (14ch)                     | import 済み (spread) | -        | preload IPC_CHANNELS 内に個別定義あり    |
| NOTIFICATION_CHANNELS (6ch)               | preload 内に定義あり | -        | 同一チャネル値                           |
| HISTORY_SEARCH_CHANNELS (2ch)             | preload 内に定義あり | -        | 同一チャネル値                           |
| APPROVAL_CHANNELS (2ch)                   | import 済み          | -        | `APPROVAL_CHANNELS.XXX` 参照             |
| EXECUTION_CHANNELS (3ch)                  | import 済み          | -        | `EXECUTION_CHANNELS.XXX` 参照            |
| SKILL_CREATOR_SESSION_CHANNELS (6ch)      | import + spread      | -        | `...SKILL_CREATOR_SESSION_CHANNELS`      |
| SKILL_CREATOR_EXTERNAL_API_CHANNELS (3ch) | import + spread      | -        | `...SKILL_CREATOR_EXTERNAL_API_CHANNELS` |
| SKILL_CREATOR_RUNTIME_CHANNELS (3ch)      | import + spread      | -        | `...SKILL_CREATOR_RUNTIME_CHANNELS`      |
| 個別 export (4ch)                         | import 済み          | -        | 個別定数として import                    |

### 3.2 Rule-2: preload invoke -> main

| preload invoke カテゴリ | main handler ファイル                                 | 想定ハンドラ数 |
| ----------------------- | ----------------------------------------------------- | -------------- |
| Analytics               | analyticsHandler.ts                                   | 1              |
| File                    | fileHandlers.ts                                       | 6              |
| Store                   | storeHandlers.ts                                      | 4              |
| AI                      | aiHandlers.ts                                         | 3              |
| Graph                   | graphHandlers.ts                                      | 2              |
| Dashboard               | dashboardHandlers.ts                                  | 2              |
| Window                  | windowHandlers.ts                                     | 1              |
| App                     | (appHandlers.ts相当)                                  | 1              |
| Terminal                | terminalHandlers.ts                                   | 1              |
| Theme                   | themeHandlers.ts                                      | 3              |
| Auth                    | authHandlers.ts                                       | 7              |
| Profile                 | profileHandlers.ts                                    | 11             |
| Avatar                  | avatarHandlers.ts                                     | 3              |
| Settings                | (settingsHandlers.ts相当)                             | 2              |
| API Key                 | apiKeyHandlers.ts                                     | 4              |
| Dialog                  | dialogHandlers.ts                                     | 2              |
| Workspace               | workspaceHandlers.ts                                  | 5              |
| Search/Replace          | searchHandlers.ts                                     | 8              |
| File Selection          | fileSelectionHandlers.ts                              | 4              |
| LLM                     | (llmHandlers.ts相当)                                  | 5              |
| Slide                   | (slideHandlers.ts相当)                                | 6              |
| Agent                   | agentHandlers.ts                                      | 15+            |
| Skill                   | skillHandlers.ts                                      | 30+            |
| History                 | historyHandlers.ts                                    | 4              |
| Notification            | notificationHandlers.ts                               | 5              |
| Community               | communityHandlers.ts                                  | 6              |
| Slide Settings          | slideSettingsHandlers.ts                              | 5              |
| Claude CLI              | (claudeCliHandlers.ts相当)                            | 7              |
| System Prompt           | systemPromptHandlers.ts                               | 7              |
| Conversation            | (conversationHandlers.ts)                             | 7              |
| Chat Edit               | chatEditHandlers.ts                                   | 4              |
| Permission              | permission-handlers.ts / permission-store-handlers.ts | 4              |
| Auth Key                | authKeyHandlers.ts                                    | 4              |
| Auth Mode               | authModeHandlers.ts                                   | 4              |
| Skill Creator           | creatorHandlers.ts / skillCreatorHandlers.ts          | 19+            |
| Approval/Disclosure     | approvalHandlers.ts / disclosureHandlers.ts           | 4              |

### 3.3 Rule-3: renderer usage -> shared/preload

renderer (preload経由) で使用されるチャネルは preload の `IPC_CHANNELS` に定義されたもの + shared からの import で全て定義されている。未定義チャネルが `safeInvoke`/`safeOn` に渡された場合、ランタイムでブロックされるが、その前にこのスクリプトで検出する。

---

## 4. パーサー -> 検証ルール -> 成果物の整合

| パーサー              | 出力          | 使用する検証ルール     | 成果物への影響            |
| --------------------- | ------------- | ---------------------- | ------------------------- |
| parseSharedChannels   | Set<string>   | Rule-1, Rule-3         | shared 正本チャネル集合   |
| parsePreloadWhitelist | ParsedPreload | Rule-1, Rule-2, Rule-3 | ホワイトリスト + 定義集合 |
| parseMainHandlers     | Set<string>   | Rule-2                 | ハンドラ登録集合          |
| parseRendererUsage    | Set<string>   | Rule-3                 | 使用チャネル集合          |

---

## 5. 既存スクリプトとの検証範囲整合

| 検証観点              | check-ipc-contracts.ts | verify-ipc-4layer.js | 重複     |
| --------------------- | ---------------------- | -------------------- | -------- |
| main handler 存在検証 | R-01 (warning)         | Rule-2 (error)       | 部分重複 |
| preload 使用存在検証  | R-04 (error)           | -                    | なし     |
| shared 定義存在検証   | -                      | Rule-1 (error)       | なし     |
| renderer 使用存在検証 | -                      | Rule-3 (error)       | なし     |
| 引数パターン整合      | R-02 (error)           | -                    | なし     |
| リテラル使用警告      | R-03 (warning)         | -                    | なし     |

**重複箇所の扱い**: `check-ipc-contracts.ts` の R-01 は「main にあるが preload にない」(warning) で、`verify-ipc-4layer.js` の Rule-2 は「preload にあるが main にない」(error)。方向が逆のため実質的に重複ではなく補完関係。

---

## 6. 破壊的変更リスクマトリクス

| 変更シナリオ                        | 影響を受けるルール | 期待される振る舞い                    |
| ----------------------------------- | ------------------ | ------------------------------------- |
| shared に新チャネル追加             | Rule-1             | preload 未登録で検出                  |
| preload whitelist に新チャネル追加  | Rule-2             | main 未実装で検出                     |
| main に新ハンドラ追加               | -                  | 影響なし（余剰ハンドラは許容）        |
| preload safeInvoke に新呼び出し追加 | Rule-3             | shared/preload 未定義で検出           |
| shared からチャネル削除             | -                  | Rule-1 で検出されなくなる（正常動作） |
| preload whitelist からチャネル削除  | Rule-2             | 検出対象から外れる（正常動作）        |
| main ハンドラ削除                   | Rule-2             | 未実装として検出                      |
| channels.ts の構文変更              | 全ルール           | パーサー破損リスク → テストで検出     |

---

## 7. 一貫性チェックサマリー

- [x] 4層の依存方向が一方向（shared -> preload -> main, preload -> renderer）であることを確認
- [x] 検証ルール (Rule-1,2,3) が依存方向に沿っていることを確認
- [x] パーサーの出力型がバリデーターの入力型と一致していることを確認
- [x] 既存スクリプトとの機能重複が最小限であることを確認
- [x] CI 統合が既存パイプラインの構造に適合していることを確認
- [x] テスト戦略が全パーサー・バリデーターをカバーしていることを確認
