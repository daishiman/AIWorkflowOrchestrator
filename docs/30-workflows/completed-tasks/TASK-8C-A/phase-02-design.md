# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| Phase名    | 設計                     |
| 前提Phase  | Phase 1（要件定義）      |
| 後続Phase  | Phase 3（設計レビュー）  |
| ステータス | 未実施                   |
| 作成日     | 2026-02-01               |
| 機能名     | TASK-8C-A: IPC統合テスト |

---

## 目的

Phase 1 で定義した22テストケースの要件に基づき、テストファイルの構造設計・Mock戦略・テストヘルパー設計を行う。既存テストコードとの共存と `SkillService` ファサードの効果的なMock方法を設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイル構造設計

**目的**: `skillIpc.integration.test.ts` の全体構造を設計する

**実行手順**:

1. テストファイルの `describe` / `it` 構造を設計する：

```
describe("Skill IPC Integration")
  ├── describe("Handler Registration")
  │   └── it("should register all skill handlers via ipcMain.handle")
  ├── describe("skill:list-available")
  │   ├── it("TC-01: should return available skills from SkillService.scanAvailable")
  │   └── it("TC-02: should return error when scan fails")
  ├── describe("skill:list-imported")
  │   └── it("TC-03: should return imported skills from SkillService.listImported")
  ├── describe("skill:import")
  │   ├── it("TC-04: should import skill and return imported data")
  │   ├── it("TC-05: should return error if skill already imported")
  │   └── it("TC-06: should return error if skill not found")
  ├── describe("skill:remove")
  │   ├── it("TC-07: should remove skill from store")
  │   └── it("TC-08: should return error if skill not imported")
  ├── describe("skill:execute")
  │   └── it("TC-09: should start execution and return execution ID")
  ├── describe("skill:abort")
  │   └── it("TC-10: should abort execution")
  ├── describe("skill:permission:response")
  │   └── it("TC-11: should forward permission response to executor")
  ├── describe("skill:list-available (rescan)")
  │   └── it("TC-12: should trigger rescan and return updated list")
  ├── describe("skill:settings")
  │   ├── it("TC-13: should get skill settings")
  │   ├── it("TC-14: should return error for non-existent skill settings")
  │   ├── it("TC-15: should update skill settings")
  │   └── it("TC-16: should return validation error for invalid settings")
  ├── describe("skill:permissions")
  │   ├── it("TC-17: should get skill permissions")
  │   ├── it("TC-18: should grant permission")
  │   └── it("TC-19: should revoke permission")
  └── describe("skill:cache")
      ├── it("TC-20: should get cached data")
      ├── it("TC-21: should set cache data")
      └── it("TC-22: should invalidate cache")
```

2. 各 `describe` ブロック内の `beforeEach` / `afterEach` スコープを設計する
3. `outputs/phase-02/integration-test-design.md` に記録する

**期待される成果物**:

- `outputs/phase-02/integration-test-design.md`

---

### タスク2: Mock戦略の設計

**目的**: テストで使用するMockオブジェクトの生成方法と戻り値パターンを設計する

**実行手順**:

1. **Electron Mock設計**:
   - `vi.mock("electron")` で `ipcMain.handle` / `ipcMain.on` をモックする
   - `ipcMain.handle` のモック実装: `handlers` Map に `(channel, handler)` を格納する
   - `BrowserWindow.getFocusedWindow` でダミーの `webContents.send` を返す

2. **SkillService Mock設計**:
   - `SkillService` のPartial Mockを作成する（使用メソッドのみモック）
   - 各メソッドの正常系/異常系の戻り値パターンを定義する：

| メソッド        | 正常系戻り値                                      | 異常系戻り値                          |
| --------------- | ------------------------------------------------- | ------------------------------------- |
| scanAvailable() | `[{ name: "skill-a" }, { name: "skill-b" }]`      | `throw new Error("Scan failed")`      |
| listImported()  | `[{ name: "imported-skill", importedAt: "..." }]` | （異常系なし）                        |
| importSkill()   | `{ name: "new-skill", importedAt: "..." }`        | `throw new Error("Already imported")` |
| removeSkill()   | `undefined`                                       | `throw new Error("Not imported")`     |
| execute()       | `{ executionId: "exec-123" }`                     | `throw new Error("Execution failed")` |
| abort()         | `true`                                            | `false`                               |

3. **validateIpcSender Mock設計**:
   - `vi.mock("../infrastructure/security/ipc-validator")` でセキュリティバリデーションをモックする
   - 正常系: `validateIpcSender` が例外をスローしない
   - 異常系（セキュリティテスト用）: `validateIpcSender` が `Error("Invalid sender")` をスローする

4. `outputs/phase-02/integration-test-design.md` に追記する

**期待される成果物**:

- Mock戦略設計（`outputs/phase-02/integration-test-design.md` に含む）

---

### タスク3: テストヘルパー関数の設計

**目的**: テストの可読性と保守性を向上させるヘルパー関数を設計する

**実行手順**:

1. 以下のヘルパー関数を設計する：

| 関数名                   | 引数                   | 戻り値               | 用途                           |
| ------------------------ | ---------------------- | -------------------- | ------------------------------ |
| `createMockSkillService` | `overrides?: Partial`  | `MockSkillService`   | SkillService Mockの生成        |
| `getRegisteredHandler`   | `channel: string`      | `HandlerFunction`    | 登録済みハンドラーの取得       |
| `createMockIpcEvent`     | `senderId?: number`    | `IpcMainInvokeEvent` | IPC イベントオブジェクトの生成 |
| `expectOperationSuccess` | `result, expectedData` | `void (assertion)`   | OperationResult 正常系の検証   |
| `expectOperationError`   | `result, errorPattern` | `void (assertion)`   | OperationResult 異常系の検証   |

2. 各ヘルパー関数のシグネチャと実装方針を記録する
3. `outputs/phase-02/integration-test-design.md` に追記する

**期待される成果物**:

- テストヘルパー設計（`outputs/phase-02/integration-test-design.md` に含む）

---

### タスク4: テストデータ設計

**目的**: テストケースで使用する固定テストデータを設計する

**実行手順**:

1. テストフィクスチャの再利用を検討する：
   - `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md` の内容を確認する
   - 既存フィクスチャで不足するデータを特定する

2. テストデータ定数を設計する：

| 定数名                 | 型                | 値の例                                            |
| ---------------------- | ----------------- | ------------------------------------------------- |
| `MOCK_SKILL_LIST`      | `Skill[]`         | `[{ name: "skill-a", ... }]`                      |
| `MOCK_IMPORTED_SKILLS` | `ImportedSkill[]` | `[{ name: "imported-skill", importedAt: "..." }]` |
| `MOCK_EXECUTION_ID`    | `string`          | `"exec-test-001"`                                 |
| `MOCK_SKILL_NAME`      | `string`          | `"test-skill"`                                    |
| `MOCK_PERMISSION_REQ`  | `PermissionReq`   | `{ requestId: "req-001", approved: true }`        |

3. `outputs/phase-02/integration-test-design.md` に追記する

**期待される成果物**:

- テストデータ設計（`outputs/phase-02/integration-test-design.md` に含む）

---

## 参照資料

| 参照資料             | パス                                                                    | 内容                   |
| -------------------- | ----------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件定義書   | `outputs/phase-01/requirements-definition.md`                           | テストケース要件       |
| Phase 1 受け入れ基準 | `outputs/phase-01/acceptance-criteria.md`                               | 受け入れ基準           |
| 既存ユニットテスト   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             | Mock パターン参考      |
| 既存統合テスト       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts` | 統合テストパターン参考 |
| IPC バリデーター     | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`        | セキュリティMock対象   |
| テスト品質要件       | `aiworkflow-requirements: quality-requirements.md`                      | テスト戦略・Mock方針   |
| IPC永続化パターン    | `aiworkflow-requirements: arch-ipc-persistence.md`                      | ハンドラー登録パターン |

---

## 成果物

| 成果物           | パス                                          | 内容                               |
| ---------------- | --------------------------------------------- | ---------------------------------- |
| 統合テスト設計書 | `outputs/phase-02/integration-test-design.md` | テスト構造・Mock戦略・ヘルパー設計 |

---

## 統合テスト連携

Phase 2 では統合テストの設計を行うため、以下の統合ポイントを確認する：

- **IPC登録パス**: `registerSkillHandlers` → `ipcMain.handle` → ハンドラー実行
- **サービス連携パス**: ハンドラー → `SkillService` メソッド → `OperationResult` 変換
- **セキュリティパス**: `validateIpcSender` → 正常 / エラー分岐
- **イベントパス**: `skill:stream` / `skill:permission:request` の M→R 通知

---

## アーキテクチャ層別設計（AIが判断）

タスクの性質に応じて、以下の層別に設計を行う：

| 層                         | 設計観点                                                        | 仕様参照先                                                           |
| -------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| フロントエンド（Renderer） | 設計対象外（本タスクはMain Processのテスト設計のみ）            | -                                                                    |
| バックエンド（Main）       | SkillService Mock設計、ハンドラーテスト構造                     | `aiworkflow-requirements: architecture-*.md`                         |
| IPC通信                    | ipcMain.handle Map方式、チャネル登録テスト、OperationResult変換 | `aiworkflow-requirements: api-*.md`, `interfaces-agent-sdk-skill.md` |
| Preload                    | channels.ts ホワイトリスト検証設計                              | `aiworkflow-requirements: security-api-electron.md`                  |
| セキュリティ               | validateIpcSender Mock方針、セキュリティテスト設計              | `aiworkflow-requirements: security-skill-ipc.md`                     |

---

## 多角的チェック観点

| 観点           | 確認内容                                                       |
| -------------- | -------------------------------------------------------------- |
| テスタビリティ | Mock設計が実装可能で、テストの独立性が保たれているか           |
| 保守性         | SkillService のメソッド追加時にテストの修正箇所が最小限か      |
| IPC通信        | 全チャネルのハンドラー登録・呼び出しパスが設計に含まれているか |
| セキュリティ   | validateIpcSender のテスト方針が明確か                         |
| Electron固有   | ipcMain.handle / ipcMain.on の両パターンが考慮されているか     |
| 型安全         | Mock型が SkillService の実際の型と整合しているか               |

---

## 完了条件

- [ ] テストファイルの `describe` / `it` 構造が設計されている
- [ ] Electron Mock（ipcMain, BrowserWindow）の設計が完了している
- [ ] SkillService Mock の正常系/異常系パターンが定義されている
- [ ] validateIpcSender Mock の設計が完了している
- [ ] テストヘルパー関数（5種）のシグネチャが設計されている
- [ ] テストデータ定数が設計されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] 全成果物が outputs/phase-02/ に配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: テストファイル構造設計
3. タスク2: Mock戦略の設計
4. タスク3: テストヘルパー関数の設計
5. タスク4: テストデータ設計
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-03-design-review.md`
