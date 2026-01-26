# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| Phase名    | 実装（TDD: Green）                     |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | task-3-1-e-remember-choice-persistence |

---

## 目的

TDDの「Green」フェーズとして、Phase 4で作成したテストを全てパスさせる最小限の実装を行う。

## 背景

Phase 4で作成した失敗するテストに対して、テストを通す実装を行う。最小限の実装を心がけ、過剰なエンジニアリングを避ける。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: PermissionStoreクラス実装

**目的**: 永続化ストアクラスを実装する

**実行手順**:

1. `apps/desktop/src/main/services/skill/PermissionStore.ts`を作成
2. electron-storeの初期化処理を実装
3. `isToolAllowed(toolName: string): boolean`を実装
4. `allowTool(toolName: string): void`を実装
5. `revokeTool(toolName: string): void`を実装
6. `getAllowedTools(): string[]`を実装
7. `clearAll(): void`を実装
8. エラーハンドリング（設定ファイル破損対応）を実装

**期待される成果物**:

- `apps/desktop/src/main/services/skill/PermissionStore.ts`

**実装例**:

```typescript
import Store from "electron-store";

interface AllowedToolEntry {
  toolName: string;
  allowedAt: string;
}

interface PermissionStoreSchema {
  version: number;
  allowedTools: AllowedToolEntry[];
  updatedAt: string;
}

export class PermissionStore {
  private store: Store<PermissionStoreSchema>;

  constructor() {
    this.store = new Store<PermissionStoreSchema>({
      name: "permission-store",
      defaults: {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      },
    });
  }

  isToolAllowed(toolName: string): boolean {
    return this.getAllowedTools().includes(toolName);
  }

  allowTool(toolName: string): void {
    if (this.isToolAllowed(toolName)) return;

    const allowedTools = this.store.get("allowedTools");
    allowedTools.push({
      toolName,
      allowedAt: new Date().toISOString(),
    });
    this.store.set("allowedTools", allowedTools);
    this.store.set("updatedAt", new Date().toISOString());
  }

  revokeTool(toolName: string): void {
    const allowedTools = this.store
      .get("allowedTools")
      .filter((entry) => entry.toolName !== toolName);
    this.store.set("allowedTools", allowedTools);
    this.store.set("updatedAt", new Date().toISOString());
  }

  getAllowedTools(): string[] {
    return this.store.get("allowedTools").map((entry) => entry.toolName);
  }

  clearAll(): void {
    this.store.set("allowedTools", []);
    this.store.set("updatedAt", new Date().toISOString());
  }
}
```

---

### タスク2: SkillExecutor連携実装

**目的**: SkillExecutorとPermissionStoreを連携させる

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillExecutor.ts`を修正
2. PermissionStoreのインスタンスを注入またはインポート
3. sendPermissionRequest前に`isToolAllowed()`チェックを追加
4. 許可済みの場合は自動許可レスポンスを返しダイアログをスキップ
5. handlePermissionResponse内で`rememberChoice=true && approved=true`の場合に`allowTool()`を呼び出し

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（修正）

**実装ポイント**:

```typescript
// SkillExecutor.ts の修正箇所

import { PermissionStore } from './PermissionStore';

private permissionStore: PermissionStore;

constructor(/* ... */) {
  // ...
  this.permissionStore = new PermissionStore();
}

// sendPermissionRequest内での自動許可チェック
private async sendPermissionRequest(request: SkillPermissionRequest): Promise<SkillPermissionResponse> {
  // 許可済みツールはダイアログをスキップ
  if (this.permissionStore.isToolAllowed(request.toolName)) {
    return {
      requestId: request.requestId,
      approved: true,
      rememberChoice: true // 既に記憶済みなので常にtrue
    };
  }

  // 通常の権限確認フローへ
  // ...
}

// handlePermissionResponseでの永続化処理
private handlePermissionResponse(response: SkillPermissionResponse): void {
  if (response.approved && response.rememberChoice) {
    this.permissionStore.allowTool(/* toolName */);
  }
  // ...
}
```

---

### タスク3: IPCハンドラー実装

**目的**: 設定画面用のIPCハンドラーを実装する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts`にチャネル定義を追加
2. `apps/desktop/src/main/ipc/permission-handlers.ts`を作成
3. `permission:getAllowedTools`ハンドラーを実装
4. `permission:revokeTool`ハンドラーを実装
5. `permission:clearAll`ハンドラーを実装
6. preload.tsにIPC APIを追加

**期待される成果物**:

- `packages/shared/src/ipc/channels.ts`（修正）
- `apps/desktop/src/main/ipc/permission-handlers.ts`
- `apps/desktop/src/preload.ts`（修正）

**チャネル定義**:

```typescript
// channels.ts
export const PERMISSION_CHANNELS = {
  GET_ALLOWED_TOOLS: "permission:getAllowedTools",
  REVOKE_TOOL: "permission:revokeTool",
  CLEAR_ALL: "permission:clearAll",
} as const;
```

---

### タスク4: 設定UIコンポーネント実装

**目的**: 許可済みツール管理UIを実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/PermissionSettings.tsx`を作成
2. 許可済みツール一覧の表示機能を実装
3. 個別ツールの削除機能を実装
4. 全設定クリア機能を実装
5. Zustand storeとの連携を実装

**期待される成果物**:

- `apps/desktop/src/renderer/components/PermissionSettings.tsx`

**コンポーネント例**:

```tsx
export function PermissionSettings() {
  const [allowedTools, setAllowedTools] = useState<string[]>([]);

  useEffect(() => {
    window.electronAPI.permission.getAllowedTools().then(setAllowedTools);
  }, []);

  const handleRevoke = async (toolName: string) => {
    await window.electronAPI.permission.revokeTool(toolName);
    setAllowedTools((prev) => prev.filter((t) => t !== toolName));
  };

  const handleClearAll = async () => {
    await window.electronAPI.permission.clearAll();
    setAllowedTools([]);
  };

  return (
    <div className="permission-settings">
      <h3>許可済みツール</h3>
      <p>「次回から確認しない」で許可したツールの一覧です。</p>

      {allowedTools.length === 0 ? (
        <p>許可済みのツールはありません。</p>
      ) : (
        <ul>
          {allowedTools.map((tool) => (
            <li key={tool}>
              {tool}
              <button onClick={() => handleRevoke(tool)}>削除</button>
            </li>
          ))}
        </ul>
      )}

      {allowedTools.length > 0 && (
        <button onClick={handleClearAll}>全て削除</button>
      )}
    </div>
  );
}
```

---

### タスク5: テスト実行（Green確認）

**目的**: 全テストがパスすることを確認する

**実行手順**:

1. 以下のコマンドでテストを実行:
   ```bash
   pnpm --filter @repo/desktop test -- --grep "PermissionStore"
   ```
2. 全テストがパス（Green状態）であることを確認
3. 失敗するテストがあれば実装を修正
4. テスト結果を記録

**期待される成果物**:

- テスト実行結果（全テストパスの確認）

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容             |
| ------------------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 2設計成果物         | `outputs/phase-2/`                                                          | 設計ドキュメント |
| Phase 4テストコード       | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`    | テストケース     |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義参照       |
| SkillExecutor実装         | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                     | 既存実装         |

---

## 成果物

| 成果物               | パス                                                          | 内容               |
| -------------------- | ------------------------------------------------------------- | ------------------ |
| PermissionStore      | `apps/desktop/src/main/services/skill/PermissionStore.ts`     | 永続化ストアクラス |
| SkillExecutor修正    | `apps/desktop/src/main/services/skill/SkillExecutor.ts`       | 連携処理追加       |
| IPCチャネル定義      | `packages/shared/src/ipc/channels.ts`                         | チャネル定義追加   |
| IPCハンドラー        | `apps/desktop/src/main/ipc/permission-handlers.ts`            | ハンドラー実装     |
| 設定UIコンポーネント | `apps/desktop/src/renderer/components/PermissionSettings.tsx` | 管理UI             |

---

## 統合テスト連携（Phase 1〜11は必須）

- フロント/バック接続の実装とテスト支援コード整備
- IPC連携の動作確認
- electron-store永続化の動作確認

---

## 完了条件

- [ ] PermissionStoreクラスが実装された
- [ ] SkillExecutorとの連携が実装された
- [ ] IPCハンドラーが実装された
- [ ] 設定UIコンポーネントが実装された
- [ ] Phase 4で作成した全テストがパスした

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "PermissionStore"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-e-remember-choice-persistence/phase-06-test-expansion.md`
