# Phase 2: 設計

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 2                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

`HooksFactory.createPreToolUseHook()` 内に `pushApprovalRequest()` を呼び出す producer を接続するための技術設計を確定する。接続ポイント・DI チェーン・型設計・IPC 4 層整合性・型互換性検証テーブルを明示する。

---

## 接続ポイント設計（Option A 採用）

### 選択肢の比較

既存設計書（`UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001-design.md`）の判断を引き継ぐ:

| Option | 接続先                                       | 評価                                                                                                                                                     |
| ------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A**  | `HooksFactory.createPreToolUseHook()` 内     | **採用** — 危険コマンド検出ロジックが集約されており、`mainWindow` が既に注入済み。単一責務を維持できる。`TODO(human)` が設置済みで接続が最小変更で完了。 |
| B      | `SkillCreatorHooksFactory.onPreToolUse()` 内 | 不採用 — 監査専用 Hooks であり、`BrowserWindow` 参照を持たない。IPC 送信責務を混入すると SRP 違反になる。                                                |
| C      | `ClaudeCliManager` / IPC Handler 層          | 不採用 — `Bash` ツール実行の前段フックを持たず、大規模改修を要する。                                                                                     |

### Option A 採用理由

1. **危険コマンド検出の単一箇所**: `DANGEROUS_PATTERNS.BASH_COMMANDS` チェックは既に `HooksFactory.createPreToolUseHook()` 内の `for...of` ループで行われている。検出と通知を同一ループ内に置くことで検出漏れを防ぐ。
2. **`mainWindow` 参照がすでに存在**: `HooksFactory` クラスは `constructor` で `mainWindow: BrowserWindow` を受け取っており、`pushApprovalRequest()` の呼び出しに必要な依存が揃っている。
3. **既存 IPC 送信パターンとの整合**: `PostToolUse` での `AGENT_EXECUTION_STATUS` 送信、`PermissionRequest` での `AGENT_EXECUTION_PERMISSION` 送信と同パターンであり、approval request の producer 接続はこのパターンと完全に一致する。
4. **`TODO(human)` 設置済み**: 行 189-200 に実装箇所が明示されており、最小変更で完了できる。

---

## 現在の実装（未完成箇所）

```typescript
// apps/desktop/src/main/services/agent/HooksFactory.ts
// 行 187-210 (createPreToolUseHook 内)

for (const pattern of DANGEROUS_PATTERNS.BASH_COMMANDS) {
  if (command.includes(pattern)) {
    // TODO(human): ここに pushApprovalRequest 呼び出しを実装してください
    // operationId を生成し、pushApprovalRequest(this.mainWindow, {...}) を呼ぶ
    // sessionId: this.sessionId, operationType: "dangerous_bash_command" を使用
    // 例:
    //   const operationId = uuidv4();
    //   pushApprovalRequest(this.mainWindow, {
    //     sessionId: this.sessionId,
    //     operationId,
    //     operationType: "dangerous_bash_command",
    //     description: `Dangerous command blocked: ${pattern}`,
    //   });
    return {
      proceed: false,
      message: `Dangerous command blocked: ${pattern}`,
    };
  }
}
```

## 修正後の設計

```typescript
// apps/desktop/src/main/services/agent/HooksFactory.ts
// createPreToolUseHook() 内の for ループ修正後

for (const pattern of DANGEROUS_PATTERNS.BASH_COMMANDS) {
  if (command.includes(pattern)) {
    const operationId = uuidv4();
    pushApprovalRequest(this.mainWindow, {
      sessionId: this.sessionId,
      operationId,
      operationType: "dangerous_bash_command",
      description: `Dangerous command blocked: ${pattern}`,
    });
    return {
      proceed: false,
      message: `Dangerous command blocked: ${pattern}`,
    };
  }
}
```

### 設計の要点

- `uuidv4()` は既に `HooksFactory.ts` でインポート済み（`PermissionRequest` Hook で使用）
- `pushApprovalRequest` は既に `HooksFactory.ts` でインポート済み（行 18）
- `this.mainWindow` / `this.sessionId` はコンストラクタで注入済み
- `TODO(human)` コメント（行 189-200）を実際の実装コードで置き換えるのみ
- `return` 文の前に `pushApprovalRequest` 呼び出しを追加する

---

## DI チェーン設計（確認済み）

```
ipc/index.ts (行 682)
  └── DefaultApprovalGate インスタンス生成
  └── registerAgentExecutionHandlers(mainWindow, approvalGate)
        └── agentHandlers.ts
              └── executionManager.startExecution(request, mainWindow, approvalGate)
                    └── ExecutionManager.ts
                          └── AgentExecutor(request, mainWindow, approvalGate, ...)
                                └── HooksFactory(mainWindow, executionId, permissionResolver, approvalGate, sessionId=executionId)
                                      └── createPreToolUseHook()
                                            └── pushApprovalRequest(this.mainWindow, {...})  ← 接続対象
```

**sessionId の扱い**: `AgentExecutor.ts` 行 60-65 で `this.request.executionId!` を `sessionId` として渡している。既存設計書の「executionId を sessionId として流用」方針と一致している。

---

## 型設計

### ペイロード型（既存 `pushApprovalRequest` 引数型に準拠）

`approvalHandlers.ts` 行 24-32 の引数型をそのまま使用する。追加の型定義は不要。

```typescript
// pushApprovalRequest の引数型（approvalHandlers.ts 行 23-37 より）
payload: {
  sessionId: string;      // this.sessionId（executionId から注入）
  operationId: string;    // uuidv4() で生成
  operationType: string;  // "dangerous_bash_command"
  description: string;    // `Dangerous command blocked: ${pattern}`
  destination?: string;   // 使用しない（外部送信先がない）
}
```

### DI 境界の型配置判断

concern 数: **1 concern**（producer 接続のみ）→ 単一 `phase-2-design.md` に全て記述。

型配置判断フロー（phase-template-core.md 準拠）:

| 質問                                                              | 判断                            |
| ----------------------------------------------------------------- | ------------------------------- |
| Factory が返す型 T を使用する注入先 Port/Interface が存在するか？ | YES（`IApprovalGate`）          |
| T は注入先 Interface を満たすか？                                 | YES（既存実装済み）             |
| Factory ファイルと注入先が同一パッケージか？                      | YES（`apps/desktop/src/main/`） |

結論: 現在のパッケージ内に型定義を置く（`packages/shared/` への移動は不要）。

---

## IPC 4 層整合性チェック（デッドチャンネル防止）

**新規チャンネルは追加しない**。`APPROVAL_REQUEST` は既存チャンネルを使用する。

| 層                | ファイル                                                       | 確認内容                                        | 状態     |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------- | -------- |
| 1. 定数定義       | `packages/shared/src/ipc/channels.ts`                          | `APPROVAL_REQUEST` が定義されているか           | 確認済み |
| 2. ホワイトリスト | `apps/desktop/src/preload/channels.ts` (`ALLOWED_ON_CHANNELS`) | `APPROVAL_REQUEST` が登録されているか           | 確認済み |
| 3. ハンドラ登録   | `apps/desktop/src/main/ipc/approvalHandlers.ts`                | `registerApprovalHandlers()` が登録済みか       | 確認済み |
| 4. Preload API    | `apps/desktop/src/preload/index.ts`                            | Renderer から `APPROVAL_REQUEST` を受信できるか | 確認済み |

全 4 層が整合済み。新規変更は `HooksFactory.ts` の送信側（`webContents.send` は `pushApprovalRequest` 内で実行）のみ。

---

## 型互換性検証テーブル（Factory パターン）

Phase 2 下書き（Phase 3 で最終確認）:

| Factory               | 返す具象型                  | 注入先 Interface                                | 互換性（Phase 3 で確認） |
| --------------------- | --------------------------- | ----------------------------------------------- | ------------------------ |
| `HooksFactory`        | `HooksFactory` インスタンス | `SDKHooks` オブジェクト（createHooks() 戻り値） | TBD                      |
| `DefaultApprovalGate` | `DefaultApprovalGate`       | `IApprovalGate`                                 | TBD                      |

---

## 変更スコープ

| ファイル                                                                       | 変更内容                                                           | 変更量         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------- |
| `apps/desktop/src/main/services/agent/HooksFactory.ts`                         | `createPreToolUseHook()` 内に `pushApprovalRequest` 呼び出しを追加 | 小（5〜8行）   |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`                        | `approvalGate` / `sessionId` を `HooksFactory` へ伝搬              | 小（引数追加） |
| `apps/desktop/src/main/services/agent/ExecutionManager.ts`                     | `approvalGate` を `AgentExecutor` へ伝搬                           | 小（引数追加） |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                                   | `approvalGate` を `ExecutionManager` へ伝搬                        | 小（引数追加） |
| `apps/desktop/src/main/ipc/index.ts`                                           | `DefaultApprovalGate` を生成して共有                               | 小（配線調整） |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` | producer 単体テストを新規追加                                      | 中             |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`          | 既存 HooksFactory テストを新コンストラクタへ追従                   | 小             |
| `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`         | 既存 AgentExecutor テストを新コンストラクタへ追従                  | 小             |
| `apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts`      | 既存 ExecutionManager テストを新コンストラクタへ追従               | 小             |
| `apps/desktop/src/main/services/agent/__tests__/integration.test.ts`           | ExecutionManager/IPC 連携テストを新シグネチャへ追従                | 小             |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                    | 既存 IPC ハンドラテストを `approvalGate` 注入へ追従                | 小             |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`            | 既存 runtime ハンドラテストを `approvalGate` 注入へ追従            | 小             |

**変更しないファイル**（送信ヘルパーと監査専用 Hooks は既存資産を再利用）:

- `approvalHandlers.ts`
- `SkillCreatorHooksFactory.ts`

---

## シーケンス図

### 修正前（producer 未接続）

```
HooksFactory.createPreToolUseHook()
  │
  ├── コマンド危険パターンチェック
  │     ├── pattern 検出
  │     │     └── [TODO(human): pushApprovalRequest 未実装]
  │     │     └── return { proceed: false }   ← Renderer へ IPC 未送信
  │     └── 安全なコマンド → return { proceed: true }
```

### 修正後（producer 接続）

```
HooksFactory.createPreToolUseHook()
  │
  ├── コマンド危険パターンチェック
  │     ├── pattern 検出
  │     │     ├── operationId = uuidv4()
  │     │     ├── pushApprovalRequest(mainWindow, { sessionId, operationId, operationType, description })
  │     │     │     └── mainWindow.webContents.send(APPROVAL_REQUEST, payload)
  │     │     │           └── [Renderer: 承認 UI 起動]
  │     │     └── return { proceed: false }
  │     └── 安全なコマンド → return { proceed: true }
```

---

## 参照資料

| 資料名                  | パス                                                                                      | 説明                             |
| ----------------------- | ----------------------------------------------------------------------------------------- | -------------------------------- |
| HooksFactory.ts         | `apps/desktop/src/main/services/agent/HooksFactory.ts`                                    | 主要修正対象                     |
| approvalHandlers.ts     | `apps/desktop/src/main/ipc/approvalHandlers.ts`                                           | `pushApprovalRequest()` 実装済み |
| AgentExecutor.ts        | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                   | HooksFactory 呼び出し元          |
| 既存設計書              | `docs/30-workflows/unassigned-task/UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001-design.md` | 接続ポイント選択根拠・モック構成 |
| phase-1-requirements.md | `./phase-1-requirements.md`                                                               | 要件・受入基準                   |

---

## 成果物

| 成果物 | パス                | 説明       |
| ------ | ------------------- | ---------- |
| 設計書 | `phase-2-design.md` | 本ファイル |

---

## 完了条件

- [x] 接続ポイント（Option A: `HooksFactory.createPreToolUseHook()` 内）が選択・根拠付きで明記されている
- [x] 修正前後のコードが明記されている
- [x] DI チェーンの全経路が確認されている
- [x] 型設計（ペイロード型・DI 境界）が明記されている
- [x] IPC 4 層整合性チェックが実施されている（既存チャンネル使用、全 4 層確認済み）
- [x] 型互換性検証テーブル（下書き）が成果物に含まれている
- [x] 変更スコープが producer 接続と最小限の DI 伝搬・テスト追従に絞られていることが確認されている
- [x] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 3: 設計レビューゲート → [phase-3-design-review.md](phase-3-design-review.md)

## 実行タスク

- current contract を各 Phase の責務へ分解する
- 依存関係と完了条件を明文化する
- 後続 Phase への引き継ぎ点を固定する

## 統合テスト連携

- Phase 4 のテスト設計に current contract を渡す
- Phase 5 以降の実装・回帰確認に使う観点を固定する
