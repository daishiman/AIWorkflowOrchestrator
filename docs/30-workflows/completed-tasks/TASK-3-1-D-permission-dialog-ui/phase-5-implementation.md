# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装                            |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

TDD（テスト駆動開発）のGreen段階として、Phase 4で作成したテストを通過させる実装を行う。

## 背景

Phase 2の設計とPhase 4のテストに基づき、skillAPI permission拡張とSkillStreamDisplay統合を実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: IPCチャネル定義追加

**目的**: skill permission用のIPCチャネルを定義する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` にチャネルを追加:

   ```typescript
   // Skill permission operations
   SKILL_PERMISSION_REQUEST: "skill:permission:request",
   SKILL_PERMISSION_RESPOND: "skill:permission:respond",
   ```

2. `ALLOWED_ON_CHANNELS` に追加:

   ```typescript
   IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
   ```

3. `ALLOWED_INVOKE_CHANNELS` に追加:
   ```typescript
   IPC_CHANNELS.SKILL_PERMISSION_RESPOND,
   ```

**期待される成果物**:

- `apps/desktop/src/preload/channels.ts`: 更新されたチャネル定義

---

### タスク2: 型定義追加

**目的**: skill permission用の型定義を追加する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` または `@repo/shared/types/skill-execution.ts` に型を追加:

   ```typescript
   export interface SkillPermissionRequest {
     requestId: string;
     executionId: string;
     skillId: string;
     toolName: string;
     args: Record<string, unknown>;
     reason?: string;
     timestamp: number;
   }

   export interface SkillPermissionResponse {
     requestId: string;
     approved: boolean;
     rememberChoice?: boolean;
   }
   ```

2. SkillAPI インターフェースを拡張:

   ```typescript
   export interface SkillAPI {
     // 既存メソッド...

     // 追加メソッド
     onPermission: (
       callback: (request: SkillPermissionRequest) => void,
     ) => () => void;
     respondPermission: (response: SkillPermissionResponse) => Promise<boolean>;
   }
   ```

**期待される成果物**:

- 型定義ファイルの更新

---

### タスク3: skillAPI permission実装

**目的**: skillAPIにpermission関連メソッドを実装する

**実行手順**:

1. `apps/desktop/src/preload/skill-api.ts` を拡張:

   ```typescript
   import type {
     SkillPermissionRequest,
     SkillPermissionResponse,
   } from "./types";

   export const skillAPI: SkillAPI = {
     // 既存メソッド...

     onPermission: (
       callback: (request: SkillPermissionRequest) => void,
     ): (() => void) =>
       safeOn<SkillPermissionRequest>(
         IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
         callback,
       ),

     respondPermission: (response: SkillPermissionResponse): Promise<boolean> =>
       safeInvoke(IPC_CHANNELS.SKILL_PERMISSION_RESPOND, response),
   };
   ```

2. エクスポートの確認

**期待される成果物**:

- `apps/desktop/src/preload/skill-api.ts`: 拡張されたskillAPI

---

### タスク4: SkillStreamDisplay permission統合

**目的**: SkillStreamDisplayコンポーネントにPermissionDialog統合を実装する

**実行手順**:

1. PermissionDialogの統合:

   ```typescript
   // SkillStreamDisplay.tsx内で
   import { PermissionDialog } from "../../organisms/PermissionDialog";

   // 状態管理
   const [pendingPermission, setPendingPermission] = useState<SkillPermissionRequest | null>(null);

   // permission requestリスナー
   useEffect(() => {
     const cleanup = window.skillAPI.onPermission((request) => {
       setPendingPermission(request);
     });
     return cleanup;
   }, []);

   // 許可ハンドラ
   const handleApprove = useCallback((rememberChoice: boolean) => {
     if (pendingPermission) {
       window.skillAPI.respondPermission({
         requestId: pendingPermission.requestId,
         approved: true,
         rememberChoice,
       });
       setPendingPermission(null);
     }
   }, [pendingPermission]);

   // 拒否ハンドラ
   const handleDeny = useCallback((rememberChoice: boolean) => {
     if (pendingPermission) {
       window.skillAPI.respondPermission({
         requestId: pendingPermission.requestId,
         approved: false,
         rememberChoice,
       });
       setPendingPermission(null);
     }
   }, [pendingPermission]);

   // JSX内
   <PermissionDialog
     request={pendingPermission}
     onApprove={handleApprove}
     onDeny={handleDeny}
   />
   ```

2. 既存PermissionDialogコンポーネントの再利用確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`: 更新されたコンポーネント

---

### タスク5: TDD Green確認

**目的**: Phase 4で作成したテストが通過することを確認する

**実行手順**:

1. テスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run skill-api.permission
   pnpm --filter @repo/desktop test -- --run SkillStreamDisplay.permission
   ```

2. 全テストがPASSすることを確認

3. 型チェック:

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

4. Lint:
   ```bash
   pnpm --filter @repo/desktop lint
   ```

**期待される成果物**:

- `outputs/phase-5/tdd-green-confirmation.md`: TDD Green確認結果

---

## 参照資料

| 参照資料             | パス                                                               | 内容                 |
| -------------------- | ------------------------------------------------------------------ | -------------------- |
| Phase 2設計書        | `outputs/phase-2/`                                                 | 設計ドキュメント     |
| Phase 4テスト        | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`  | テストファイル       |
| 既存PermissionDialog | `apps/desktop/src/renderer/components/organisms/PermissionDialog/` | 再利用コンポーネント |
| 既存agentAPI         | `apps/desktop/src/preload/index.ts`                                | 実装パターン参考     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容            |
| ------------------------- | --------------------------------------------------------------------------- | --------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | IPC実装パターン |

---

## 成果物

| 成果物                       | パス                                                                    | 内容            |
| ---------------------------- | ----------------------------------------------------------------------- | --------------- |
| 更新されたchannels.ts        | `apps/desktop/src/preload/channels.ts`                                  | IPCチャネル定義 |
| 更新された型定義             | 該当ファイル                                                            | TypeScript型    |
| 拡張されたskillAPI           | `apps/desktop/src/preload/skill-api.ts`                                 | permission実装  |
| 更新されたSkillStreamDisplay | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | UI統合実装      |
| TDD Green確認結果            | `outputs/phase-5/tdd-green-confirmation.md`                             | テスト成功確認  |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5での統合テスト連携アクション:**

- skillAPI permission実装がMain Process（TASK-3-1-C）と接続可能であることを確認
- SkillStreamDisplayとPermissionDialogの統合が正しく動作することを確認
- IPC通信が正常に機能することを確認

---

## 完了条件

- [ ] IPCチャネルが追加されている
- [ ] 型定義が追加されている
- [ ] skillAPIにpermission関連メソッドが実装されている
- [ ] SkillStreamDisplayにPermissionDialogが統合されている
- [ ] 全テストがPASSしている（TDD Green）
- [ ] 型チェックがPASSしている
- [ ] LintがPASSしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run skill-api.permission
pnpm --filter @repo/desktop test -- --run SkillStreamDisplay.permission
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-6-test-expansion.md`
