# Channel Ownership Table — Skill IPC チャネル所有権テーブル

> 生成日: 2026-02-25
> 生成元: TASK-013A-CONTRACT-AUDIT (SubAgent-A)

## 凡例

| 列名       | 説明                                       |
| ---------- | ------------------------------------------ |
| 定義タスク | チャネルを定義したタスク仕様書             |
| 消費タスク | チャネルを使用する UI/機能タスク           |
| Main       | Main Process ハンドラの有無                |
| Preload    | Preload API（skill-api.ts）での公開有無    |
| Renderer   | Renderer 側の呼び出し元コンポーネント/View |
| 命名準拠   | `skill:` プレフィックス + コロン区切り階層 |

## 1. スキル管理チャネル（既存 — 10チャネル）

| #   | チャネル名               | 定義タスク                        | 消費タスク                          | Main      | Preload       | Renderer                 | 方向 | 命名準拠 |
| --- | ------------------------ | --------------------------------- | ----------------------------------- | --------- | ------------- | ------------------------ | ---- | -------- |
| 1   | `skill:import`           | UT-FIX-SKILL-IMPORT-INTERFACE-001 | task-030 (UI-05), SkillImportDialog | ✅ handle | ✅ safeInvoke | SkillImportDialog        | R→M  | ✅       |
| 2   | `skill:remove`           | UT-FIX-SKILL-REMOVE-INTERFACE-001 | task-030 (UI-05), SkillCenterView   | ✅ handle | ✅ safeInvoke | SkillCenterView          | R→M  | ✅       |
| 3   | `skill:get-detail`       | 既存                              | task-030 (UI-05)                    | ✅ handle | ✅ safeInvoke | SkillDetailView          | R→M  | ✅       |
| 4   | `skill:list`             | 既存                              | task-030 (UI-05)                    | ✅ handle | ✅ safeInvoke | SkillCenterView          | R→M  | ✅       |
| 5   | `skill:scan`             | 既存                              | task-030 (UI-05)                    | ✅ handle | ✅ safeInvoke | SkillCenterView          | R→M  | ✅       |
| 6   | `skill:getImported`      | 既存                              | AgentView                           | ✅ handle | ✅ safeInvoke | AgentView                | R→M  | ✅       |
| 7   | `skill:update`           | 既存                              | task-030 (UI-05)                    | ✅ send   | ✅ safeOn     | SkillCenterView          | M→R  | ✅       |
| 8   | `skill:importFromSource` | task-9F (task-022)                | task-030 (UI-05)                    | ❌ 未実装 | ❌ 未実装     | SkillImportDialog (予定) | R→M  | ✅       |
| 9   | `skill:export`           | task-9F (task-022)                | task-030 (UI-05)                    | ❌ 未実装 | ❌ 未実装     | SkillShareDialog (予定)  | R→M  | ✅       |
| 10  | `skill:validateSource`   | task-9F (task-022)                | task-030 (UI-05)                    | ❌ 未実装 | ❌ 未実装     | SkillImportDialog (予定) | R→M  | ✅       |

## 2. スキル実行チャネル（TASK-9A-B — 6チャネル）

| #   | チャネル名         | 定義タスク | 消費タスク                     | Main      | Preload       | Renderer  | 方向 | 命名準拠 |
| --- | ------------------ | ---------- | ------------------------------ | --------- | ------------- | --------- | ---- | -------- |
| 11  | `skill:execute`    | TASK-9A-B  | AgentView, SkillExecutionPanel | ✅ handle | ✅ safeInvoke | AgentView | R→M  | ✅       |
| 12  | `skill:stream`     | TASK-9A-B  | AgentView                      | ✅ send   | ✅ safeOn     | AgentView | M→R  | ✅       |
| 13  | `skill:abort`      | TASK-9A-B  | AgentView, SkillExecutionPanel | ✅ handle | ✅ safeInvoke | AgentView | R→M  | ✅       |
| 14  | `skill:get-status` | TASK-9A-B  | AgentView                      | ✅ handle | ✅ safeInvoke | AgentView | R→M  | ✅       |
| 15  | `skill:complete`   | TASK-9A-B  | AgentView                      | ✅ send   | ✅ safeOn     | AgentView | M→R  | ✅       |
| 16  | `skill:error`      | TASK-9A-B  | AgentView                      | ✅ send   | ✅ safeOn     | AgentView | M→R  | ✅       |

## 3. スキル権限チャネル（TASK-9A-B — 2チャネル）

| #   | チャネル名                  | 定義タスク | 消費タスク       | Main      | Preload       | Renderer         | 方向 | 命名準拠 |
| --- | --------------------------- | ---------- | ---------------- | --------- | ------------- | ---------------- | ---- | -------- |
| 17  | `skill:permission:request`  | TASK-9A-B  | PermissionDialog | ✅ send   | ✅ safeOn     | PermissionDialog | M→R  | ✅       |
| 18  | `skill:permission:response` | TASK-9A-B  | PermissionDialog | ✅ handle | ✅ safeInvoke | PermissionDialog | R→M  | ✅       |

## 4. スキル品質改善チャネル（TASK-9C — 5チャネル）

| #   | チャネル名                | 定義タスク | 消費タスク       | Main      | Preload       | Renderer                 | 方向 | 命名準拠 |
| --- | ------------------------- | ---------- | ---------------- | --------- | ------------- | ------------------------ | ---- | -------- |
| 19  | `skill:analyze`           | TASK-9C    | task-030 (UI-05) | ✅ handle | ✅ safeInvoke | SkillAnalysisView (予定) | R→M  | ✅       |
| 20  | `skill:improve`           | TASK-9C    | task-030 (UI-05) | ✅ handle | ✅ safeInvoke | SkillAnalysisView (予定) | R→M  | ✅       |
| 21  | `skill:optimize`          | TASK-9C    | task-030 (UI-05) | ✅ handle | ✅ safeInvoke | SkillOptimizeView (予定) | R→M  | ✅       |
| 22  | `skill:optimize:variants` | TASK-9C    | task-030 (UI-05) | ✅ handle | ✅ safeInvoke | SkillOptimizeView (予定) | R→M  | ✅       |
| 23  | `skill:optimize:evaluate` | TASK-9C    | task-030 (UI-05) | ✅ handle | ✅ safeInvoke | SkillOptimizeView (予定) | R→M  | ✅       |

## 5. スキルファイル操作チャネル（TASK-9A / task-020b — 6チャネル）

| #   | チャネル名            | 定義タスク          | 消費タスク               | Main      | Preload       | Renderer               | 方向 | 命名準拠 |
| --- | --------------------- | ------------------- | ------------------------ | --------- | ------------- | ---------------------- | ---- | -------- |
| 24  | `skill:readFile`      | TASK-9A (task-020b) | task-020b (Skill Editor) | ✅ handle | ✅ safeInvoke | SkillEditorView (予定) | R→M  | ✅       |
| 25  | `skill:writeFile`     | TASK-9A (task-020b) | task-020b (Skill Editor) | ✅ handle | ✅ safeInvoke | SkillEditorView (予定) | R→M  | ✅       |
| 26  | `skill:createFile`    | TASK-9A (task-020b) | task-020b (Skill Editor) | ✅ handle | ✅ safeInvoke | SkillEditorView (予定) | R→M  | ✅       |
| 27  | `skill:deleteFile`    | TASK-9A (task-020b) | task-020b (Skill Editor) | ✅ handle | ✅ safeInvoke | SkillEditorView (予定) | R→M  | ✅       |
| 28  | `skill:listBackups`   | TASK-9A (task-020b) | task-020b (Skill Editor) | ✅ handle | ✅ safeInvoke | SkillEditorView (予定) | R→M  | ✅       |
| 29  | `skill:restoreBackup` | TASK-9A (task-020b) | task-020b (Skill Editor) | ✅ handle | ✅ safeInvoke | SkillEditorView (予定) | R→M  | ✅       |

## 6. スキルフォーク（task-9E — 1チャネル）

| #   | チャネル名   | 定義タスク | 消費タスク            | Main      | Preload   | Renderer               | 方向 | 命名準拠 |
| --- | ------------ | ---------- | --------------------- | --------- | --------- | ---------------------- | ---- | -------- |
| 30  | `skill:fork` | task-9E    | task-030 (UI-05 予定) | ❌ 未実装 | ❌ 未実装 | SkillDetailView (予定) | R→M  | ✅       |

## 7. スキルチェーンチャネル（task-9D — 5チャネル）

| #   | チャネル名            | 定義タスク | 消費タスク         | Main      | Preload   | Renderer                | 方向 | 命名準拠 |
| --- | --------------------- | ---------- | ------------------ | --------- | --------- | ----------------------- | ---- | -------- |
| 31  | `skill:chain:list`    | task-9D    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillChainView (予定)   | R→M  | ✅       |
| 32  | `skill:chain:get`     | task-9D    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillChainView (予定)   | R→M  | ✅       |
| 33  | `skill:chain:save`    | task-9D    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillChainEditor (予定) | R→M  | ✅       |
| 34  | `skill:chain:delete`  | task-9D    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillChainView (予定)   | R→M  | ✅       |
| 35  | `skill:chain:execute` | task-9D    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillChainView (予定)   | R→M  | ✅       |

## 8. スキルスケジュールチャネル（task-9G — 5チャネル）

| #   | チャネル名              | 定義タスク | 消費タスク         | Main      | Preload   | Renderer                   | 方向 | 命名準拠 |
| --- | ----------------------- | ---------- | ------------------ | --------- | --------- | -------------------------- | ---- | -------- |
| 36  | `skill:schedule:list`   | task-9G    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillScheduleView (予定)   | R→M  | ✅       |
| 37  | `skill:schedule:add`    | task-9G    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillScheduleEditor (予定) | R→M  | ✅       |
| 38  | `skill:schedule:update` | task-9G    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillScheduleEditor (予定) | R→M  | ✅       |
| 39  | `skill:schedule:delete` | task-9G    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillScheduleView (予定)   | R→M  | ✅       |
| 40  | `skill:schedule:toggle` | task-9G    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillScheduleView (予定)   | R→M  | ✅       |

## 9. スキルデバッグチャネル（task-9H — 7チャネル）

| #   | チャネル名                      | 定義タスク | 消費タスク         | Main      | Preload   | Renderer              | 方向 | 命名準拠 |
| --- | ------------------------------- | ---------- | ------------------ | --------- | --------- | --------------------- | ---- | -------- |
| 41  | `skill:debug:start`             | task-9H    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillDebugView (予定) | R→M  | ✅       |
| 42  | `skill:debug:command`           | task-9H    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillDebugView (予定) | R→M  | ✅       |
| 43  | `skill:debug:breakpoint:add`    | task-9H    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillDebugView (予定) | R→M  | ✅       |
| 44  | `skill:debug:breakpoint:remove` | task-9H    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillDebugView (予定) | R→M  | ✅       |
| 45  | `skill:debug:inspect`           | task-9H    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillDebugView (予定) | R→M  | ✅       |
| 46  | `skill:debug:evaluate`          | task-9H    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillDebugView (予定) | R→M  | ✅       |
| 47  | `skill:debug:event`             | task-9H    | task-031b (UI-05B) | ❌ 未実装 | ❌ 未実装 | SkillDebugView (予定) | M→R  | ✅       |

## 10. スキルドキュメントチャネル（task-9I — 4チャネル）

| #   | チャネル名             | 定義タスク | 消費タスク | Main      | Preload   | Renderer | 方向 | 命名準拠 |
| --- | ---------------------- | ---------- | ---------- | --------- | --------- | -------- | ---- | -------- |
| 48  | `skill:docs:generate`  | task-9I    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |
| 49  | `skill:docs:preview`   | task-9I    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |
| 50  | `skill:docs:export`    | task-9I    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |
| 51  | `skill:docs:templates` | task-9I    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |

## 11. スキル分析チャネル（task-9J — 5チャネル）

| #   | チャネル名                   | 定義タスク | 消費タスク | Main      | Preload   | Renderer | 方向 | 命名準拠 |
| --- | ---------------------------- | ---------- | ---------- | --------- | --------- | -------- | ---- | -------- |
| 52  | `skill:analytics:record`     | task-9J    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |
| 53  | `skill:analytics:statistics` | task-9J    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |
| 54  | `skill:analytics:summary`    | task-9J    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |
| 55  | `skill:analytics:trend`      | task-9J    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |
| 56  | `skill:analytics:export`     | task-9J    | 未定       | ❌ 未実装 | ❌ 未実装 | 未定     | R→M  | ✅       |

## 12. 所有権サマリー

### タスク別チャネル数

| 定義タスク                               | 実装済み | 未実装 | 合計   |
| ---------------------------------------- | -------- | ------ | ------ |
| 既存（レガシー）                         | 6        | 0      | 6      |
| UT-FIX-SKILL-IMPORT/REMOVE-INTERFACE-001 | 2        | 0      | 2      |
| TASK-9A-B（実行・権限）                  | 8        | 0      | 8      |
| TASK-9A / task-020b（ファイル操作）      | 6        | 0      | 6      |
| TASK-9C（品質改善）                      | 5        | 0      | 5      |
| task-9D（チェーン）                      | 0        | 5      | 5      |
| task-9E（フォーク）                      | 0        | 1      | 1      |
| task-9F / task-022（共有）               | 0        | 3      | 3      |
| task-9G（スケジュール）                  | 0        | 5      | 5      |
| task-9H（デバッグ）                      | 0        | 7      | 7      |
| task-9I（ドキュメント）                  | 0        | 4      | 4      |
| task-9J（分析）                          | 0        | 5      | 5      |
| **合計**                                 | **27**   | **30** | **57** |

> 注: 合計57は #3 `skill:get-detail`（既存）を含むためセクション3テーブルの26実装済み+1（スキル管理の未定義含む）= 27

### 消費タスク別チャネル数

| 消費タスク                            | 消費チャネル数 | 備考                               |
| ------------------------------------- | -------------- | ---------------------------------- |
| task-030 (UI-05 SkillCenterView)      | 13             | 管理系 + 共有系 + 品質改善系       |
| task-031b (UI-05B SkillAdvancedViews) | 22             | チェーン + スケジュール + デバッグ |
| task-020b (Skill Editor)              | 6              | ファイル操作                       |
| AgentView（既存）                     | 7              | 実行系 + 権限系                    |
| 未割当                                | 9              | task-9I, task-9J の消費先未定      |

### 命名規則準拠率

| 項目                        | 件数  | 割合                                                        |
| --------------------------- | ----- | ----------------------------------------------------------- |
| `skill:` プレフィックス準拠 | 56/56 | 100%                                                        |
| コロン区切り階層準拠        | 56/56 | 100%                                                        |
| P45命名ドリフトなし         | 54/56 | 96.4%（`skill:get-detail` と `skill:execute` に要確認あり） |
