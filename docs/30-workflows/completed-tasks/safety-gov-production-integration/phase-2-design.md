# Phase 2: 設計

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 2                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

production 統合の設計を確定する。IPC 4層整合性・ApprovalGate DI パターン・execution namespace 型定義・Push 通知タイミング・revokeAll() 統合ポイントを設計する。

## SubAgent lane 設計

| Lane   | 責務                                            | 主要出力                                   | 実行順序                        |
| ------ | ----------------------------------------------- | ------------------------------------------ | ------------------------------- |
| Lane A | IPC 4層契約と DI owner 確定                     | `outputs/phase-2/ipc-4layer-table.md`      | 並列開始可                      |
| Lane B | Preload / Renderer 契約設計                     | `outputs/phase-2/design.md` の型・hook節   | 並列開始可                      |
| Lane C | revokeAll() lifecycle と push timing の因果確認 | `outputs/phase-2/design.md` の lifecycle節 | Lane A/B の一次結果を受けて収束 |

Lane A と Lane B は並列化できるが、最終的な責務境界・状態所有権の判断は Lane C を含めて単一の設計結果へ統合する。

## 30種思考法の適用観点

| 思考法カテゴリ | 重点観点                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| 論理分析系     | UT-6〜UT-9 が本当に同一 workflow に束ねるべき gap か検証する             |
| 構造分解系     | Main / Preload / Renderer / Session Cleanup の4 concern へ分解する       |
| メタ・抽象系   | 「設計済み」ではなく「runtime で到達可能か」を評価軸に置き換える         |
| 発想・拡張系   | ApprovalGate 配置位置、push timing、degraded fallback の代替案を比較する |
| システム系     | `approval:request` 発火から `revokeAll()` までの因果ループを明示する     |
| 戦略・価値系   | 新規 channel 追加を避け、既存契約再利用で最小変更へ寄せる                |
| 問題解決系     | 実装前に blocker を特定し、UT-10 とは分離して扱う                        |

## 実行タスク

### 1. IPC 4層整合性チェック

新規チャンネルは追加しないが、既存チャンネルが4層全て整合していることを確認する。

| 層                | チャンネル                      | 確認内容                          | ファイル              | 状態                  |
| ----------------- | ------------------------------- | --------------------------------- | --------------------- | --------------------- |
| 1. 定数定義       | `APPROVAL_RESPOND`              | `IPC_CHANNELS` に定義済み         | `preload/channels.ts` | 確認                  |
| 1. 定数定義       | `APPROVAL_REQUEST`              | `IPC_CHANNELS` に定義済み         | `preload/channels.ts` | 確認                  |
| 1. 定数定義       | `EXECUTION_GET_DISCLOSURE_INFO` | `IPC_CHANNELS` に定義済み         | `preload/channels.ts` | 確認                  |
| 1. 定数定義       | `EXECUTION_GET_TERMINAL_LOG`    | `IPC_CHANNELS` に定義済み         | `preload/channels.ts` | 確認                  |
| 1. 定数定義       | `EXECUTION_GET_COPY_COMMAND`    | `IPC_CHANNELS` に定義済み         | `preload/channels.ts` | 確認                  |
| 2. ホワイトリスト | `APPROVAL_RESPOND`              | `ALLOWED_INVOKE_CHANNELS`         | `preload/channels.ts` | 確認必要              |
| 2. ホワイトリスト | `APPROVAL_REQUEST`              | `ALLOWED_ON_CHANNELS`             | `preload/channels.ts` | 登録済みと記載あり    |
| 2. ホワイトリスト | `EXECUTION_GET_*`               | `ALLOWED_INVOKE_CHANNELS`         | `preload/channels.ts` | 確認必要              |
| 3. ハンドラ登録   | 3ハンドラ                       | `registerAllIpcHandlers()`        | `main/ipc/index.ts`   | **未登録 → 今回追加** |
| 4. Preload API    | `execution` namespace           | `contextBridge.exposeInMainWorld` | `preload/index.ts`    | **未公開 → 今回追加** |

### 2. ApprovalGate DI 設計

```
registerAllIpcHandlers(mainWindow, ...) 関数内で:
  1. DefaultApprovalGate インスタンスを生成
     const approvalGate = new DefaultApprovalGate();

  2. approvalGate を registerApprovalHandlers に DI 注入
     registerApprovalHandlers(mainWindow, approvalGate);

  3. approvalGate を セッション終了ハンドラ にも渡す（UT-9 対応）
```

**DI 境界の型配置判断**:

| 条件                                                   | 配置先                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| `DefaultApprovalGate` は `approvalHandlers` のみで使用 | `main/ipc/index.ts` 内にインスタンス生成を閉じる               |
| `IApprovalGate` インターフェースはハンドラ間で共有     | `main/services/runtime/ApprovalGate.ts` に既存定義（変更不要） |

### 3. Preload execution namespace 型設計

```typescript
// preload/types.ts に追加
export interface ExecutionAPI {
  getDisclosureInfo: () => Promise<{
    success: boolean;
    data?: unknown;
    error?: unknown;
  }>;
  getTerminalLog: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string; error?: unknown }>;
  getCopyCommand: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string; error?: unknown }>;
  respondApproval: (request: {
    sessionId: string;
    operationId: string;
    action: "approve" | "reject";
  }) => Promise<{ success: boolean; error?: unknown }>;
  onApprovalRequest: (
    callback: (payload: {
      operationType: string;
      description: string;
      destination: string;
      sessionId: string;
      operationId: string;
    }) => void,
  ) => () => void; // unsubscribe 関数を返す
}

// ElectronAPI に追加
export interface ElectronAPI {
  // ... 既存フィールド ...
  execution: ExecutionAPI;
}
```

### 4. Preload execution 実装設計

```typescript
// preload/index.ts に追加（contextBridge.exposeInMainWorld の execution フィールド）
execution: {
  getDisclosureInfo: () =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO),
  getTerminalLog: (sessionId: string) =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG, sessionId),
  getCopyCommand: (sessionId: string) =>
    safeInvoke(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND, sessionId),
  respondApproval: (request: {
    sessionId: string;
    operationId: string;
    action: 'approve' | 'reject';
  }) => safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, request),
  onApprovalRequest: (callback: (payload: unknown) => void) =>
    safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback),
},
```

### 5. Push 通知タイミング設計

**問題**: Renderer の準備完了前に `webContents.send()` を呼ぶと通知が失われる

**解決策**: セッション実行フローは Renderer が起動完了した後に開始されるため、この問題は発生しない想定。
ただし `mainWindow.webContents.isLoading()` チェックを推奨する。

```typescript
// Push 通知の実装パターン
function sendApprovalRequest(
  mainWindow: BrowserWindow,
  payload: ApprovalRequestPayload,
): void {
  if (!mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload);
  }
}
```

### 6. revokeAll() 統合ポイント設計

**調査が必要な点**: セッション状態遷移ハンドラの場所を特定する

```bash
# セッション終了（done/aborted）遷移箇所を特定
grep -rn "done\|aborted\|session.*end\|sessionId" \
  apps/desktop/src/main/ipc/ \
  apps/desktop/src/main/services/runtime/ | grep -v ".test."
```

**想定実装箇所**: `agentHandlers.ts` またはセッション状態管理サービス内

```typescript
// セッション終了時の呼び出しパターン
approvalGate.revokeAll(sessionId);
```

### 7. concern 数と設計書分割判断

| concern | 内容                                  |
| ------- | ------------------------------------- |
| C-1     | IPC handler 登録（main/ipc/index.ts） |
| C-2     | ApprovalGate DI（singleton 生成）     |
| C-3     | Preload API 公開（contextBridge）     |
| C-4     | Push 通知（webContents.send）         |
| C-5     | revokeAll() セッション終了連携        |

concern が 5件あるため、単一 `phase-2-design.md` 内でセクション分割して記述する（ファイル分割不要）。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                              | 内容                           |
| ---------------- | ----------------------------------------------------------------- | ------------------------------ |
| IPC設計仕様      | `.claude/skills/aiworkflow-requirements/references/`              | Preload/Main IPC パターン      |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-*.md` | contextBridge セキュリティ要件 |

## 統合テスト連携【必須】

| 判定項目              | 基準                   | 結果（実行時に記録） |
| --------------------- | ---------------------- | -------------------- |
| IPC 4層整合性確認完了 | 全5チャンネル          | -                    |
| 型定義設計完了        | ExecutionAPI 定義      | -                    |
| DI 設計完了           | ApprovalGate singleton | -                    |

## 成果物

| 成果物    | パス                                  | 説明                  |
| --------- | ------------------------------------- | --------------------- |
| 設計書    | `outputs/phase-2/design.md`           | concern 別設計内容    |
| IPC 4層表 | `outputs/phase-2/ipc-4layer-table.md` | 4層整合性チェック結果 |

## 完了条件

- [ ] IPC 4層整合性チェックが完了している（5チャンネル全て確認）
- [ ] ApprovalGate DI パターンが設計されている
- [ ] Preload execution namespace の型定義が設計されている
- [ ] Push 通知タイミングの設計が完了している
- [ ] revokeAll() の統合ポイントが特定されている
- [ ] `outputs/phase-2/design.md` と `outputs/phase-2/ipc-4layer-table.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
