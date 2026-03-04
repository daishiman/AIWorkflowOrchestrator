# [#505] "[TASK-4-2] PermissionResolver IPC Handlers"

## メタ情報

```yaml
task_id: TASK-4-2
task_name: PermissionResolver IPC Handlers
category: 機能追加
target_feature: PermissionResolver → IPC → Renderer Process連携
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-3-2（PermissionResolver実装）完了時
created_date: 2026-01-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-4-2-permission-resolver-ipc-handlers.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-2でPermissionResolverクラス（権限確認管理）が完了した。PermissionResolverは以下の機能を提供する：

- `waitForResponse()`: 権限確認リクエストの送信・レスポンス待機
- `resolveRequest()`: ユーザーの権限判断結果の解決
- `cancelRequest()`: 個別リクエストのキャンセル
- `cancelAll()`: 全リクエストのキャンセル

しかし、Renderer Process側でユーザーに権限確認ダイアログを表示し、ユーザーの判断結果をMain Processに返すIPC連携が未実装。

### 1.2 問題点・課題

現在の状態:

- Main Process: PermissionResolver実装済み（権限確認待機可能）
- Preload API: `skill:permission-request`/`skill:permission-response` 未実装
- Renderer Process: 権限確認ダイアログUI未実装

この状態ではスキル実行時のツール使用許可がユーザーに確認されない。

### 1.3 放置した場合の影響

- スキル実行時のツール使用がユーザーに確認されない
- セキュリティ上の問題（危険なツールが無許可で実行される可能性）
- スキルシステムの権限制御が機能しない

---

## 2. 何を達成するか（What）

### 2.1 目的

PermissionResolverからの権限確認リクエストをRenderer Processで受信し、ユーザーに確認ダイアログを表示、判断結果をMain Processに返却できるようにする。

### 2.2 最終ゴール

- `skill:permission-request` IPC経由でRenderer Processに権限確認リクエストが届く
- Renderer Processで権限確認ダイアログが表示される
- ユーザーの判断（allow/deny/always_allow/always_deny）が`skill:permission-response`経由で返却される
- PermissionResolver.waitForResponse()が正しく解決される

### 2.3 スコープ

#### 含むもの

- IPC Handler登録（`skill:permission-request`送信、`skill:permission-response`受信）
- Preload API拡張（`skillAPI.onPermissionRequest`, `skillAPI.sendPermissionResponse`）
- 権限確認ダイアログUIコンポーネント
- React Hook（usePermissionDialog）
- 単体テスト・統合テスト

#### 含まないもの

- PermissionResolver本体の変更（TASK-3-2で完了済み）
- 権限記憶機能（always_allow/always_denyの永続化）
- スキル実行本体（SkillExecutorで完了済み）

### 2.4 成果物

- `apps/desktop/src/main/ipc/permission-handlers.ts`（新規）
- `apps/desktop/src/preload/skill-api.ts`（更新）
- `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx`（新規）
- `apps/desktop/src/renderer/hooks/usePermissionDialog.ts`（新規）
- 単体テスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-2（PermissionResolver実装）が完了していること ✅
- SkillExecutorが動作していること ✅

### 3.2 依存タスク

| タスクID   | タスク名               | ステータス |
| ---------- | ---------------------- | ---------- |
| TASK-3-2   | PermissionResolver実装 | 完了       |
| TASK-3-1-A | SDK query() 基本実装   | 完了       |

### 3.3 必要な知識

- Electron IPC（双方向通信：Main ↔ Renderer）
- React Hooks（useEffect, useState, useCallback）
- TypeScript
- PermissionResolver API（TASK-3-2実装ガイド参照）

### 3.4 推奨アプローチ

#### 型定義（既存）

```typescript
// interfaces-agent-sdk.md で定義済み
interface SkillPermissionRequest {
  requestId: string;
  executionId: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  skillPath: string;
  reason?: string;
  timestamp: Date;
}

interface SkillPermissionResponse {
  requestId: string;
  decision: "allow" | "deny" | "always_allow" | "always_deny";
  respondedAt: Date;
}
```

#### Main Process IPC Handler

```typescript
// apps/desktop/src/main/ipc/permission-handlers.ts
import { ipcMain, BrowserWindow } from "electron";
import { PermissionResolver } from "../services/skill/PermissionResolver";

export function registerPermissionHandlers(
  permissionResolver: PermissionResolver,
  getMainWindow: () => BrowserWindow | null,
): void {
  // Renderer側のレスポンスを受信
  ipcMain.handle(
    "skill:permission-response",
    async (_event, response: SkillPermissionResponse) => {
      permissionResolver.resolveRequest(response.requestId, response.decision);
      return { success: true };
    },
  );
}

// PermissionResolverのコールバックでRendererへ送信
export function setupPermissionRequestForwarder(
  permissionResolver: PermissionResolver,
  getMainWindow: () => BrowserWindow | null,
): void {
  permissionResolver.onRequest = (request: SkillPermissionRequest) => {
    const window = getMainWindow();
    if (window) {
      window.webContents.send("skill:permission-request", request);
    }
  };
}
```

#### Preload API設計

```typescript
// apps/desktop/src/preload/skill-api.ts
export const skillAPI = {
  // 既存のAPI...

  // 権限確認リクエスト受信
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ): (() => void) => {
    const handler = (
      _event: IpcRendererEvent,
      request: SkillPermissionRequest,
    ) => {
      callback(request);
    };
    ipcRenderer.on("skill:permission-request", handler);
    return () =>
      ipcRenderer.removeListener("skill:permission-request", handler);
  },

  // 権限判断結果送信
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ): Promise<{ success: boolean }> =>
    ipcRenderer.invoke("skill:permission-response", response),
};
```

#### React Hook

```typescript
// apps/desktop/src/renderer/hooks/usePermissionDialog.ts
export function usePermissionDialog() {
  const [pendingRequest, setPendingRequest] =
    useState<SkillPermissionRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = skillAPI.onPermissionRequest((request) => {
      setPendingRequest(request);
      setIsOpen(true);
    });
    return unsubscribe;
  }, []);

  const respond = useCallback(
    async (decision: SkillPermissionResponse["decision"]) => {
      if (!pendingRequest) return;

      await skillAPI.sendPermissionResponse({
        requestId: pendingRequest.requestId,
        decision,
        respondedAt: new Date(),
      });

      setIsOpen(false);
      setPendingRequest(null);
    },
    [pendingRequest],
  );

  return { pendingRequest, isOpen, respond };
}
```

---

## 4. 実行手順

### Phase構成

13フェーズ構成（task-specification-creator標準ワークフロー適用）

### Phase 1: 要件定義

#### 目的

IPC連携・権限確認UIの詳細要件を定義する

#### 手順

1. PermissionResolver APIを確認（TASK-3-2実装ガイド参照）
2. IPC通信仕様を定義
3. UI要件（ダイアログ表示仕様）を定義
4. 受け入れ基準を作成

#### 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`

#### 完了条件

- IPC通信仕様が定義されている
- UI表示要件が明確になっている

### Phase 2: 設計

#### 目的

IPC Handler・Preload API・UI連携の設計

#### 手順

1. IPC Handlerアーキテクチャ設計
2. Preload API設計
3. React Hook設計
4. PermissionDialogコンポーネント設計

#### 成果物

- `outputs/phase-2/architecture-design.md`
- `outputs/phase-2/interface-design.md`

#### 完了条件

- IPC Handler設計完了
- Preload API設計完了
- UIコンポーネント設計完了

### Phase 3-13

標準ワークフロー（TDD Red/Green/Refactor）に従う

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:permission-request` IPCで権限確認リクエストがRendererに届く
- [ ] 権限確認ダイアログが正しく表示される
- [ ] ユーザーの判断結果が`skill:permission-response`で返却される
- [ ] PermissionResolver.waitForResponse()が解決される
- [ ] タイムアウト時に適切なエラーが発生する

### 品質要件

- [ ] ユニットテストカバレッジ 80%以上
- [ ] 統合テストが全件PASS
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] システム仕様書（interfaces-agent-sdk.md）が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID     | テスト内容               | 期待結果                              |
| --------- | ------------------------ | ------------------------------------- |
| TC-42-001 | 権限確認リクエスト送信   | RendererにIPCメッセージが届く         |
| TC-42-002 | ダイアログ表示           | 正しいツール名・理由が表示される      |
| TC-42-003 | allow判断                | waitForResponse()がallowで解決        |
| TC-42-004 | deny判断                 | waitForResponse()がdenyで解決         |
| TC-42-005 | always_allow判断         | waitForResponse()がalways_allowで解決 |
| TC-42-006 | always_deny判断          | waitForResponse()がalways_denyで解決  |
| TC-42-007 | タイムアウト             | 適切なエラーが発生する                |
| TC-42-008 | 複数リクエストの同時処理 | キュー順序が保持される                |

### 検証手順

1. 自動テストを実行（`pnpm --filter @repo/desktop test`）
2. 手動でスキル実行を確認（権限確認ダイアログ表示）
3. 各判断ボタンの動作確認

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                 |
| -------------------------- | ------ | -------- | ------------------------------------ |
| ダイアログ表示のタイミング | 中     | 中       | 適切なz-index、モーダル管理          |
| 複数ダイアログの競合       | 高     | 中       | キューイング実装、1つずつ表示        |
| IPC通信エラー              | 中     | 低       | エラーハンドリング、タイムアウト処理 |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                         | 内容                              |
| -------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| Agent SDK仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | PermissionResolver型定義・API仕様 |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCパターン・セキュリティ要件     |

### 関連ドキュメント

- TASK-3-2実装ガイド: `docs/30-workflows/TASK-3-2-permission-resolver/outputs/phase-12/implementation-guide.md`
- PermissionResolver実装: `apps/desktop/src/main/services/skill/PermissionResolver.ts`
- PermissionResolverテスト: `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts`

### 参考資料

- Electron IPC Best Practices: https://www.electronjs.org/docs/latest/tutorial/ipc

---

## 9. 備考

### 関連タスク

| タスクID   | 関係性                     |
| ---------- | -------------------------- |
| TASK-3-2   | 依存（PermissionResolver） |
| TASK-3-1-A | 関連（SkillExecutor）      |
| TASK-3-1-B | 関連（IPC統合）            |
| TASK-8c    | 後続（E2E統合テスト）      |

### 補足事項

- TASK-3-2のPermissionResolverは`waitForResponse()`で権限判断を待機可能
- 本タスクはRenderer側のUI実装とIPC連携が主な作業
- タイムアウト（デフォルト5分）はPermissionResolver側で管理済み
