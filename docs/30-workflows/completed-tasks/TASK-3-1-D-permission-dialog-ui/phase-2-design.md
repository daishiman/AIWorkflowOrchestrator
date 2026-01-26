# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

skillAPI拡張のインターフェース設計、IPC連携設計、SkillStreamDisplayコンポーネント統合設計を行う。

## 背景

Phase 1で定義した要件に基づき、具体的な実装設計を行う。既存のagentAPI permission実装パターンを参考に、skillAPI向けの設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: skillAPI拡張インターフェース設計

**目的**: skillAPIに追加するpermission関連メソッドのインターフェースを設計する

**実行手順**:

1. `SkillAPI`インターフェース拡張を設計

   ```typescript
   export interface SkillAPI {
     // 既存メソッド
     execute: (
       request: SkillExecutionRequest,
     ) => Promise<SkillExecutionResponse>;
     onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
     abort: (executionId: string) => Promise<boolean>;
     getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

     // 追加メソッド
     onPermission: (
       callback: (request: SkillPermissionRequest) => void,
     ) => () => void;
     respondPermission: (response: SkillPermissionResponse) => Promise<boolean>;
   }
   ```

2. `SkillPermissionRequest`型を設計

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
   ```

3. `SkillPermissionResponse`型を設計

   ```typescript
   export interface SkillPermissionResponse {
     requestId: string;
     approved: boolean;
     rememberChoice?: boolean;
   }
   ```

4. IPCチャネル設計（新規追加またはSKILL_STREAMの活用を決定）

**期待される成果物**:

- `outputs/phase-2/skill-api-interface-design.md`: skillAPIインターフェース設計書

---

### タスク2: IPC通信設計

**目的**: Main Process ↔ Renderer Process間のIPC通信を設計する

**実行手順**:

1. IPCチャネル方式の決定
   - **オプションA**: SKILL_STREAMチャネルでpermissionメッセージを送信
     - メリット: 既存チャネルを活用、チャネル追加不要
     - デメリット: メッセージタイプで分岐が必要
   - **オプションB**: 専用チャネル`SKILL_PERMISSION_REQUEST`/`SKILL_PERMISSION_RESPOND`を追加
     - メリット: 明確な責務分離
     - デメリット: チャネル追加・許可リスト更新が必要

2. channels.tsへの追加設計（オプションBの場合）

   ```typescript
   // 追加するチャネル
   SKILL_PERMISSION_REQUEST: "skill:permission:request",
   SKILL_PERMISSION_RESPOND: "skill:permission:respond",
   ```

3. 許可リスト更新設計

   ```typescript
   // ALLOWED_ON_CHANNELSに追加
   IPC_CHANNELS.SKILL_PERMISSION_REQUEST,

   // ALLOWED_INVOKE_CHANNELSに追加
   IPC_CHANNELS.SKILL_PERMISSION_RESPOND,
   ```

4. 通信シーケンス設計
   ```
   Main Process                    Renderer Process
        |                                |
        | skill:permission:request       |
        |------------------------------->|
        |                                | ダイアログ表示
        |                                | ユーザー選択
        | skill:permission:respond       |
        |<-------------------------------|
        |                                |
   ```

**期待される成果物**:

- `outputs/phase-2/ipc-communication-design.md`: IPC通信設計書

---

### タスク3: SkillStreamDisplay統合設計

**目的**: SkillStreamDisplayコンポーネントとPermissionDialogの連携を設計する

**実行手順**:

1. 状態管理設計
   - skillSliceまたはagentSliceにpendingSkillPermission状態を追加
   - または既存のpendingPermissionを共有

2. PermissionDialog連携設計

   ```typescript
   // SkillStreamDisplay内での使用イメージ
   const { pendingPermission, setPermissionRequest, clearPermissionRequest } =
     useSkillPermission();

   useEffect(() => {
     const cleanup = skillAPI.onPermission((request) => {
       setPermissionRequest(request);
     });
     return cleanup;
   }, []);

   const handleApprove = (remember: boolean) => {
     skillAPI.respondPermission({
       requestId,
       approved: true,
       rememberChoice: remember,
     });
     clearPermissionRequest();
   };

   const handleDeny = (remember: boolean) => {
     skillAPI.respondPermission({
       requestId,
       approved: false,
       rememberChoice: remember,
     });
     clearPermissionRequest();
   };
   ```

3. フォーカス管理設計
   - ダイアログ表示時: 「許可」ボタンにフォーカス
   - ダイアログ閉じる時: 元のフォーカス位置に戻す

4. エラーハンドリング設計
   - IPC通信エラー時の処理
   - タイムアウト時の処理（Main Process側で実装済み）

**期待される成果物**:

- `outputs/phase-2/component-integration-design.md`: コンポーネント統合設計書

---

### タスク4: 型定義設計

**目的**: 必要な型定義を設計する

**実行手順**:

1. preload/types.ts への型追加設計

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

2. 既存PermissionRequest型との関係
   - `@repo/shared/types/agent`のPermissionRequestを再利用可能か検討
   - skillId追加のため、拡張または新規型定義が必要

3. Window型拡張（types.d.ts）
   ```typescript
   interface SkillAPI {
     // 既存定義にpermissionメソッド追加
   }
   ```

**期待される成果物**:

- `outputs/phase-2/type-definitions-design.md`: 型定義設計書

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容                       |
| ------------------------- | --------------------------------------------------------------------------- | -------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 既存permission実装パターン |
| UI/UXコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | PermissionDialog仕様       |
| 既存agentAPI              | `apps/desktop/src/preload/index.ts`                                         | permission実装参考         |
| 既存skillAPI              | `apps/desktop/src/preload/skill-api.ts`                                     | 拡張対象                   |
| Phase 1成果物             | `outputs/phase-1/`                                                          | 要件定義                   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                           | 内容            |
| ------------------------- | ------------------------------------------------------------------------------ | --------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`    | IPC設計パターン |
| セキュリティ実装          | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | IPC安全性要件   |

---

## 成果物

| 成果物                         | パス                                              | 内容                        |
| ------------------------------ | ------------------------------------------------- | --------------------------- |
| skillAPIインターフェース設計書 | `outputs/phase-2/skill-api-interface-design.md`   | API拡張設計                 |
| IPC通信設計書                  | `outputs/phase-2/ipc-communication-design.md`     | IPC通信フロー・チャネル設計 |
| コンポーネント統合設計書       | `outputs/phase-2/component-integration-design.md` | UI統合設計                  |
| 型定義設計書                   | `outputs/phase-2/type-definitions-design.md`      | TypeScript型設計            |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2での統合テスト連携アクション:**

- skillAPI拡張設計にIPC統合テスト観点を含める
- PermissionDialog連携インターフェースをテスト可能な形で設計する
- Main Process（TASK-3-1-C）との接続インターフェースを明確化する

---

## 完了条件

- [ ] skillAPIインターフェース設計書が作成されている
- [ ] IPC通信設計書が作成されている
- [ ] コンポーネント統合設計書が作成されている
- [ ] 型定義設計書が作成されている
- [ ] 設計がPhase 1の要件を満たしている
- [ ] 統合テスト観点が設計に含まれている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-3-design-review.md`
