# Phase 5 File Change Scope

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 5                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1-4                                       |

---

## File Ownership 一覧

### 新規ファイル

| ファイル                                                                     | Owner Layer | Step | 責務                                                                                                      | テストファイル                               |
| ---------------------------------------------------------------------------- | ----------- | ---- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts`                     | Main        | 1    | Approval token 生成・検証                                                                                 | `__tests__/approvalGate.test.ts`             |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`                              | Main        | 2    | Approval IPC handler 登録                                                                                 | `__tests__/approvalHandlers.test.ts`         |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`                            | Main        | 2    | Disclosure IPC handler 登録                                                                               | `__tests__/disclosureHandlers.test.ts`       |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`           | Renderer    | 3    | Approval UI コンポーネント                                                                                | `__tests__/ApprovalSheet.test.tsx`           |
| `apps/desktop/src/renderer/components/execution/SessionDisclosureBanner.tsx` | Renderer    | 3    | AI / 送信 disclosure バナー                                                                               | `__tests__/SessionDisclosureBanner.test.tsx` |
| `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`    | Renderer    | 5    | opt-in raw terminal パネル                                                                                | `__tests__/AdvancedConsolePanel.test.tsx`    |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`                         | Renderer    | 4    | Approval IPC 通信 + state 管理                                                                            | `__tests__/useApprovalFlow.test.ts`          |
| `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts`                      | Renderer    | 5    | Advanced console IPC + state                                                                              | `__tests__/useAdvancedConsole.test.ts`       |
| `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts`                       | Main        | 5    | execution:get-terminal-log / execution:get-copy-command の Main 側ハンドラ（TBD: 応答型は後続実装で確定） | `__tests__/advancedConsoleHandlers.test.ts`  |

### 修正ファイル

| ファイル                                                              | Owner Layer | Step | 変更内容                                                       | 影響範囲             |
| --------------------------------------------------------------------- | ----------- | ---- | -------------------------------------------------------------- | -------------------- |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`     | Main        | 1    | lane authority 拡張: approval check 挿入 + consumer token 拒否 | 全実行パス           |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | Main        | 1    | handoff 前 approval check + disclosure bundle 追加             | handoff フロー       |
| `apps/desktop/src/main/ipc/terminalHandlers.ts`                       | Main        | 1    | terminal:open 実行前の approval token 検証追加                 | terminal handoff     |
| `apps/desktop/src/preload/channels.ts`                                | Preload     | 2    | 新規チャネル定数追加                                           | IPC 契約             |
| `apps/desktop/src/preload/index.ts`                                   | Preload     | 2    | ALLOWED_INVOKE_CHANNELS に新規チャネル登録                     | IPC ホワイトリスト   |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`      | Renderer    | 3-5  | disclosure banner + approval flow + advanced console gate 統合 | ExecutionConsoleView |

---

## レイヤー別変更マトリクス

### Main Process（6 ファイル）

| ファイル                     | 変更種別 | Step | DENY 対応       | MUST 対応      |
| ---------------------------- | -------- | ---- | --------------- | -------------- |
| ApprovalGate.ts              | 新規     | 1    | DENY-9          | MUST-2, MUST-3 |
| RuntimePolicyResolver.ts     | 修正     | 1    | DENY-1, DENY-10 | -              |
| RuntimeSkillCreatorFacade.ts | 修正     | 1    | -               | MUST-2, MUST-3 |
| terminalHandlers.ts          | 修正     | 1    | DENY-9          | MUST-3         |
| approvalHandlers.ts          | 新規     | 2    | -               | MUST-10        |
| disclosureHandlers.ts        | 新規     | 2    | DENY-5, DENY-6  | MUST-1, MUST-9 |

### Preload（2 ファイル）

| ファイル    | 変更種別 | Step | DENY 対応 | MUST 対応 |
| ----------- | -------- | ---- | --------- | --------- |
| channels.ts | 修正     | 2    | -         | -         |
| index.ts    | 修正     | 2    | DENY-5    | -         |

### Renderer（6 ファイル）

| ファイル                       | 変更種別 | Step | DENY 対応      | MUST 対応                      |
| ------------------------------ | -------- | ---- | -------------- | ------------------------------ |
| ApprovalSheet.tsx              | 新規     | 3    | DENY-8, DENY-9 | MUST-2, MUST-3                 |
| SessionDisclosureBanner.tsx    | 新規     | 3    | -              | MUST-1                         |
| ExecutionConsoleView/index.tsx | 修正     | 3-5  | DENY-7, DENY-8 | MUST-5, MUST-6, MUST-7, MUST-8 |
| useApprovalFlow.ts             | 新規     | 4    | -              | MUST-2, MUST-3                 |
| AdvancedConsolePanel.tsx       | 新規     | 5    | DENY-7         | MUST-5                         |
| useAdvancedConsole.ts          | 新規     | 5    | DENY-6         | -                              |

---

## IPC 影響分析

### 新規 IPC チャネルと既存チャネルの関係

| 新規チャネル                    | 関連する既存チャネル     | 関係                                               |
| ------------------------------- | ------------------------ | -------------------------------------------------- |
| `approval:request`              | `terminal:open`          | terminal:open 前に approval:request が発火         |
| `approval:respond`              | なし                     | 新規導入。Main の ApprovalGate に直接接続          |
| `execution:get-disclosure-info` | `llm:get-config`（既存） | llm:get-config から provider 名と model 名を取得   |
| `execution:get-terminal-log`    | `terminal:open`          | terminal:open で起動した terminal の output を取得 |
| `execution:get-copy-command`    | `terminal:open`          | handoff 用コマンドを生成（API key 除外）           |

### 既存ホワイトリストへの影響

```
ALLOWED_INVOKE_CHANNELS に追加するチャネル:
  + "approval:respond"
  + "execution:get-disclosure-info"
  + "execution:get-terminal-log"
  + "execution:get-copy-command"

ALLOWED_ON_CHANNELS に追加するチャネル:
  + "approval:request"    (Main → Renderer push 通知)
```

---

## セキュリティチェックリスト（ファイル単位）

### ApprovalGate.ts

- [ ] token 生成に crypto-safe な乱数を使用する
- [ ] token に sessionId + operationId + timestamp を含める
- [ ] TTL 検証ロジックが Date.now() ベースで正確に動作する
- [ ] 単一操作失効: 使用済み token を無効化するロジックが存在する

### approvalHandlers.ts

- [ ] validateIpcSender を handler 先頭に配置
- [ ] approval:respond の引数に P42 3段バリデーション適用
- [ ] エラーメッセージに sanitizeErrorMessage() 適用

### disclosureHandlers.ts

- [ ] Main → Renderer への応答に API key / token を含めない
- [ ] provider 名と model 名のみを返す
- [ ] validateIpcSender を handler 先頭に配置

### AdvancedConsolePanel.tsx

- [ ] raw terminal output に API key が含まれないことを検証する sanitize 処理
- [ ] copy command から API key を除外する処理
- [ ] isOpen のデフォルト値が false であること

### preload/index.ts

- [ ] cookie API が contextBridge で公開されていないこと
- [ ] 新規チャネルのみがホワイトリストに追加されていること

---

## 変更ファイル総数

| 区分           | ファイル数 |
| -------------- | ---------- |
| 新規ファイル   | 8          |
| 修正ファイル   | 6          |
| **合計**       | **14**     |
| テストファイル | 9          |
| **全体合計**   | **23**     |
