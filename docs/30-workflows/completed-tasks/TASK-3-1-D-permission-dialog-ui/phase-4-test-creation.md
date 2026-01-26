# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト作成                      |
| 前提Phase  | Phase 3                         |
| 後続Phase  | Phase 5                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

TDD（テスト駆動開発）のRed段階として、skillAPI permission拡張のテストを作成する。テストは最初失敗することを確認する。

## 背景

Phase 2の設計に基づき、実装前にテストを作成することで、要件を満たす実装を確実に行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: skillAPI permissionテスト作成

**目的**: skillAPIのpermission関連メソッドのユニットテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`

2. テストケースを作成:

   ```typescript
   describe("skillAPI permission", () => {
     describe("onPermission", () => {
       it("should register a permission request listener", () => {
         // リスナー登録テスト
       });

       it("should call the callback when permission request is received", () => {
         // コールバック呼び出しテスト
       });

       it("should return a cleanup function", () => {
         // クリーンアップ関数テスト
       });
     });

     describe("respondPermission", () => {
       it("should send permission response with approved=true", () => {
         // 許可応答テスト
       });

       it("should send permission response with approved=false", () => {
         // 拒否応答テスト
       });

       it("should include rememberChoice when provided", () => {
         // rememberChoice付き応答テスト
       });

       it("should return true on successful response", () => {
         // 成功時戻り値テスト
       });
     });
   });
   ```

3. モック設定:
   - `ipcRenderer.on` のモック
   - `ipcRenderer.invoke` のモック

**期待される成果物**:

- `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`: skillAPI permissionテスト

---

### タスク2: SkillStreamDisplay permission統合テスト作成

**目的**: SkillStreamDisplayコンポーネントのpermission統合テストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.permission.test.tsx`

2. テストケースを作成:

   ```typescript
   describe("SkillStreamDisplay permission integration", () => {
     it("should show PermissionDialog when permission request is received", () => {
       // ダイアログ表示テスト
     });

     it("should call respondPermission with approved=true when Allow is clicked", () => {
       // 許可クリックテスト
     });

     it("should call respondPermission with approved=false when Deny is clicked", () => {
       // 拒否クリックテスト
     });

     it("should hide PermissionDialog after response", () => {
       // ダイアログ閉じるテスト
     });

     it("should pass rememberChoice to respondPermission", () => {
       // rememberChoice連携テスト
     });
   });
   ```

3. モック設定:
   - `skillAPI` のモック
   - Zustand store のモック

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.permission.test.tsx`: SkillStreamDisplay permissionテスト

---

### タスク3: IPC統合テスト作成

**目的**: Main Process ↔ Renderer Process間のIPC通信テストを作成する

**実行手順**:

1. テストケースを追加:

   ```typescript
   describe("skill permission IPC integration", () => {
     it("should receive permission request from Main Process", () => {
       // Main → Renderer 受信テスト
     });

     it("should send permission response to Main Process", () => {
       // Renderer → Main 送信テスト
     });

     it("should use correct IPC channel for permission request", () => {
       // チャネル確認テスト
     });

     it("should use correct IPC channel for permission response", () => {
       // チャネル確認テスト
     });
   });
   ```

**期待される成果物**:

- IPC統合テストが既存テストファイルに追加される

---

### タスク4: TDD Red確認

**目的**: 作成したテストが失敗することを確認する

**実行手順**:

1. テスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run skill-api.permission
   pnpm --filter @repo/desktop test -- --run SkillStreamDisplay.permission
   ```

2. 全テストが失敗することを確認（実装前のため）

3. 失敗理由の記録:
   - 未実装のメソッドが存在しない
   - 未定義の型が存在しない

**期待される成果物**:

- `outputs/phase-4/tdd-red-confirmation.md`: TDD Red確認結果

---

## 参照資料

| 参照資料             | パス                                                                             | 内容               |
| -------------------- | -------------------------------------------------------------------------------- | ------------------ |
| Phase 2設計書        | `outputs/phase-2/`                                                               | 設計ドキュメント   |
| 既存skillAPIテスト   | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                           | テストパターン参考 |
| 既存agentSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.permission.test.ts` | テストパターン参考 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容       |
| ------------------------- | --------------------------------------------------------------------------- | ---------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義参考 |

---

## 成果物

| 成果物                              | パス                                                                                              | 内容                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------- |
| skillAPI permissionテスト           | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`                                 | preloadテスト        |
| SkillStreamDisplay permissionテスト | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.permission.test.tsx` | コンポーネントテスト |
| TDD Red確認結果                     | `outputs/phase-4/tdd-red-confirmation.md`                                                         | テスト失敗確認       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4での統合テスト連携アクション:**

- skillAPI permission統合テストシナリオを作成する
- IPC通信の統合テストを含める
- 全カテゴリ（正常系・異常系・エッジケース）のテストを作成する

---

## 完了条件

- [ ] skillAPI permissionテストが作成されている
- [ ] SkillStreamDisplay permissionテストが作成されている
- [ ] IPC統合テストが作成されている
- [ ] 全テストが失敗することを確認（TDD Red）

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

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-5-implementation.md`
