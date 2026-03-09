# Phase 2: 設計 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                    |
| --------- | ----------------------- |
| タスクID  | TASK-10A-G              |
| Phase     | 2                       |
| 名称      | 設計                    |
| 依存Phase | Phase 1（要件定義）     |
| 次Phase   | Phase 3（設計レビュー） |

---

## 目的

Phase 1 で定義された要件に基づき、3層テスト構成（Main IPC / Renderer統合 / 既存テスト整合）のアーキテクチャ、モック戦略、テストデータ設計、実行順序を設計する。特に Layer 2 は TASK-10A-F の store 駆動前提を維持し、Renderer からの direct IPC 呼び出しを再導入しない。

## 実行タスク

- Task 1: 3層テスト構成と SubAgent 責務境界を設計する
- Task 2: Main IPC / Renderer / ChatPanel 拡張のモック戦略を固定する
- Task 3: テストデータ、実行順序、品質ゲート手順を定義する
- Task 4: Phase 4 以降で再利用する依存関係と成果物名を固定する

---

## 1. テストアーキテクチャ設計

### 1.1 3層テスト構成

```
Layer 3: 既存テスト整合（ChatPanel.skill-management.test.tsx 拡張）
  |  モック: Store + コンポーネント（既存パターン維持）
  |
Layer 2: Renderer統合テスト（SkillLifecycle.integration.test.tsx 新規）
  |  real composition + 統合ハーネス（store action + electronAPI応答を一括制御）
  |
Layer 1: Main IPC契約テスト（skillHandlers.create.test.ts 新規）
  |  モック: SkillService + ipcMain + BrowserWindow
  |
  v
  実コード: skillHandlers.ts skill:create ハンドラー
```

### 1.2 テストファイル配置

| ファイル                              | レイヤー | 環境      | 主な検証対象                   |
| ------------------------------------- | -------- | --------- | ------------------------------ |
| `skillHandlers.create.test.ts`        | Layer 1  | Node.js   | IPC契約・バリデーション        |
| `SkillLifecycle.integration.test.tsx` | Layer 2  | happy-dom | UI遷移・store action・状態遷移 |
| `ChatPanel.skill-management.test.tsx` | Layer 3  | happy-dom | 既存導線維持 + 拡張            |

### 1.3 SubAgent別テスト分担

| SubAgent | テストファイル                          | テストカテゴリ                               |
| -------- | --------------------------------------- | -------------------------------------------- |
| G1       | skillHandlers.create.test.ts            | Sender検証、入力バリデーション、委譲、エラー |
| G2       | SkillLifecycle.integration.test.tsx     | create->list->analyze->improve遷移           |
| G3       | ChatPanel.skill-management.test.tsx修正 | 既存テスト整合 + create->list追加            |

---

## 2. モック戦略

### 2.1 Layer 1: Main IPC テスト モック

#### ipcMain モック

```typescript
// vi.mock("electron") でモジュール全体をモック
const mockHandle = vi.fn();
const mockRemoveHandler = vi.fn();
vi.mock("electron", () => ({
  ipcMain: { handle: mockHandle, removeHandler: mockRemoveHandler },
  BrowserWindow: vi.fn(),
}));
```

#### SkillService モック

```typescript
const mockSkillService = {
  createSkillFromWizard: vi.fn(),
  // 他メソッドは本テストスコープ外のため省略
};
```

#### validateIpcSender モック

```typescript
const mockValidateIpcSender = vi.fn();
vi.mock("../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: vi.fn((v) => ({ code: "VALIDATION_ERROR", ...v })),
}));
```

#### IpcMainInvokeEvent モック

```typescript
function createMockEvent(isValid: boolean): IpcMainInvokeEvent {
  return {
    sender: { id: isValid ? 1 : 999 },
    senderFrame: { url: "file://app" },
  } as unknown as IpcMainInvokeEvent;
}
```

### 2.2 Layer 2: Renderer統合テスト ハーネス

Layer 2 は `testing-component-patterns.md` の real composition パターンを採用する。`ChatPanel` / `SkillManagementPanel` / `SkillCreateWizard` / `SkillAnalysisView` は `vi.mock` で潰さず、テストハーネス側で store action と `window.electronAPI` 応答を統合管理する。

#### 統合ハーネス方針

- コンポーネントは実体をレンダーし、UI結線不良を検出する
- Renderer から direct `window.electronAPI.skill.*` 呼び出しを期待値にしない
- store action 呼び出しと state 遷移を主アサーションにする
- `window.electronAPI` は store action の下位依存としてのみ差し替える

#### electronAPI 応答モック（store action 下位依存）

```typescript
function createMockElectronAPI() {
  return {
    skill: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ path: "/skills/new-skill" }),
      analyze: vi.fn().mockResolvedValue({ suggestions: [] }),
      improve: vi.fn().mockResolvedValue({ improved: true }),
      getImported: vi.fn().mockResolvedValue([]),
      import: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue(undefined),
      rescan: vi.fn().mockResolvedValue([]),
      execute: vi.fn().mockResolvedValue({ executionId: "test-exec-id" }),
      abort: vi.fn().mockResolvedValue(undefined),
      onStream: vi.fn().mockReturnValue(() => {}),
      onComplete: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
      getExecutionStatus: vi.fn().mockResolvedValue(null),
    },
    authMode: {
      get: vi
        .fn()
        .mockResolvedValue({ success: true, data: { mode: "subscription" } }),
      set: vi.fn().mockResolvedValue({ success: true }),
      status: vi.fn().mockResolvedValue({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          hasCredentials: true,
          message: "OK",
          lastCheckedAt: Date.now(),
        },
      }),
      validate: vi.fn().mockResolvedValue({ success: true, data: {} }),
      onModeChanged: vi.fn(),
    },
    llm: {
      getProviders: vi.fn().mockResolvedValue([]),
      checkHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
    },
  };
}
```

#### 統合ハーネスの形

```typescript
interface SkillLifecycleHarnessOptions {
  createResult?: string;
  analyzeResult?: SkillAnalysis | null;
  improveResult?: ImprovementResult | null;
  importedSkills?: ImportedSkill[];
  availableSkills?: SkillMetadata[];
  createError?: Error | null;
  analyzeError?: Error | null;
  improveError?: Error | null;
}

function createSkillLifecycleHarness(
  options: SkillLifecycleHarnessOptions = {},
) {
  // module-scope state と action を束ね、beforeEach ごとに再初期化する
  // 実際のコンポーネントは real composition でレンダーする
}
```

#### 既存 seed テスト

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx`
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`

### 2.3 Layer 3: 既存テスト整合 モック

既存の `ChatPanel.skill-management.test.tsx` のモック構成を維持し、追加テストケースのみ拡張する。既存モック変更は回帰リスクがあるため禁止。

---

## 3. テストデータ設計

### 3.1 フィクスチャ定数

```typescript
// 共通テストデータ
const VALID_DESCRIPTION = "タスク管理を自動化するスキル";
const VALID_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: true,
};
const CREATED_SKILL_PATH = "/home/user/.claude/skills/task-automation";

// エラーケース用データ
const EMPTY_STRING = "";
const WHITESPACE_ONLY = "   ";
const NULL_VALUE = null;
const UNDEFINED_VALUE = undefined;
const NUMBER_VALUE = 12345;
```

### 3.2 スキルメタデータフィクスチャ（testing-component-patterns.md セクション2準拠）

```typescript
function createMockSkillMetadata(overrides = {}) {
  return {
    name: "test-skill",
    description: "Test skill for lifecycle testing",
    allowedTools: ["Bash", "Read"],
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    ...overrides,
  };
}
```

### 3.3 バリデーションエラーフィクスチャ

| テストケース            | description         | options         | 期待エラーコード   |
| ----------------------- | ------------------- | --------------- | ------------------ |
| description未指定       | `undefined`         | `VALID_OPTIONS` | `VALIDATION_ERROR` |
| description数値型       | `12345`             | `VALID_OPTIONS` | `VALIDATION_ERROR` |
| description空文字列     | `""`                | `VALID_OPTIONS` | `VALIDATION_ERROR` |
| descriptionスペースのみ | `"   "`             | `VALID_OPTIONS` | `VALIDATION_ERROR` |
| options未指定           | `VALID_DESCRIPTION` | `null`          | `VALIDATION_ERROR` |
| options非オブジェクト   | `VALID_DESCRIPTION` | `"invalid"`     | `VALIDATION_ERROR` |

---

## 4. テスト実行順序と依存関係

### 4.1 ファイル内テスト順序

各テストファイル内の `describe` ブロック順序:

**skillHandlers.create.test.ts**:

1. `describe("Sender検証")` - FR-G01-1
2. `describe("入力バリデーション")` - FR-G01-2, FR-G01-3
3. `describe("正常系: サービス委譲")` - FR-G01-4
4. `describe("エラー系")` - FR-G01-5, FR-G01-6

**SkillLifecycle.integration.test.tsx**:

1. `describe("ウィザード起動")` - FR-G02-1
2. `describe("作成フロー")` - FR-G02-2, FR-G02-3
3. `describe("分析・改善フロー")` - FR-G02-4, FR-G02-5
4. `describe("エラーハンドリング")` - FR-G02-6

### 4.2 テスト間の独立性保証

| 対策              | 実装方法                                      |
| ----------------- | --------------------------------------------- |
| モックリセット    | `beforeEach(() => { vi.clearAllMocks(); })`   |
| Store状態リセット | `beforeEach` でデフォルト状態を再代入         |
| electronAPI復元   | `afterEach` で `Object.defineProperty` で復元 |
| DOMクリーンアップ | `afterEach(() => { cleanup(); })`             |

### 4.3 品質ゲート実行順序

```
Step 1: pnpm --filter @repo/shared build
Step 2: pnpm --filter @repo/desktop typecheck
Step 3: cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
Step 4: cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
Step 5: cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

---

## 5. テストID体系

| プレフィックス | カテゴリ       | 範囲    | 例         |
| -------------- | -------------- | ------- | ---------- |
| TC-G01         | Main IPC契約   | 001-099 | TC-G01-001 |
| TC-G02         | Renderer統合   | 001-099 | TC-G02-001 |
| TC-G03         | 既存テスト整合 | 001-099 | TC-G03-001 |

### テストケース一覧

#### Layer 1: Main IPC契約テスト（skillHandlers.create.test.ts）

| ID         | カテゴリ       | テスト内容                                      | 関連FR   |
| ---------- | -------------- | ----------------------------------------------- | -------- |
| TC-G01-001 | Sender検証     | 正当なsenderからの呼び出しが成功する            | FR-G01-1 |
| TC-G01-002 | Sender検証     | 不正なsenderからの呼び出しが拒否される          | FR-G01-1 |
| TC-G01-003 | バリデーション | description未指定でVALIDATION_ERRORを返す       | FR-G01-2 |
| TC-G01-004 | バリデーション | description空文字列でVALIDATION_ERRORを返す     | FR-G01-2 |
| TC-G01-005 | バリデーション | descriptionスペースのみでVALIDATION_ERRORを返す | FR-G01-2 |
| TC-G01-006 | バリデーション | description数値型でVALIDATION_ERRORを返す       | FR-G01-2 |
| TC-G01-007 | バリデーション | options未指定(null)でVALIDATION_ERRORを返す     | FR-G01-3 |
| TC-G01-008 | バリデーション | options文字列型でVALIDATION_ERRORを返す         | FR-G01-3 |
| TC-G01-009 | 正常系         | 有効な引数でcreateSkillFromWizardに委譲する     | FR-G01-4 |
| TC-G01-010 | 正常系         | descriptionがtrim()されてサービスに渡される     | FR-G01-4 |
| TC-G01-011 | エラー系       | サービス例外をCREATE_ERRORでラップする          | FR-G01-5 |
| TC-G01-012 | エラー系       | エラーメッセージからファイルパスが除去される    | FR-G01-6 |
| TC-G01-013 | エラー系       | エラーメッセージからトークン情報が除去される    | FR-G01-6 |
| TC-G01-014 | エラー系       | 非Errorオブジェクトでデフォルトメッセージを返す | FR-G01-6 |

#### Layer 2: Renderer統合テスト（SkillLifecycle.integration.test.tsx）

| ID         | カテゴリ       | テスト内容                                           | 関連FR   |
| ---------- | -------------- | ---------------------------------------------------- | -------- |
| TC-G02-001 | ウィザード起動 | スキル作成ボタンからウィザードが開く                 | FR-G02-1 |
| TC-G02-002 | ウィザード起動 | ウィザードが初期状態で表示される                     | FR-G02-1 |
| TC-G02-003 | 作成フロー     | description入力後に `useCreateSkill` が呼ばれる      | FR-G02-2 |
| TC-G02-004 | 作成フロー     | optionsが store action に正しく渡る                  | FR-G02-2 |
| TC-G02-005 | リスト更新     | 作成成功後に一覧 state が同期される                  | FR-G02-3 |
| TC-G02-006 | 分析フロー     | スキル選択後に `analyzeSkill` が呼ばれる             | FR-G02-4 |
| TC-G02-007 | 改善フロー     | 改善/再分析フローが store action で完結する          | FR-G02-4 |
| TC-G02-008 | エラー系       | create action 失敗時にエラーメッセージが表示される   | FR-G02-5 |
| TC-G02-009 | エラー系       | analyze action 失敗後に再試行で回復できる            | FR-G02-5 |
| TC-G02-010 | 排他制御       | `isAnalyzing` / `isImproving` 中の操作がガードされる | FR-G02-6 |

#### Layer 3: 既存テスト整合（ChatPanel.skill-management.test.tsx 追加分）

| ID         | カテゴリ     | テスト内容                             | 関連FR   |
| ---------- | ------------ | -------------------------------------- | -------- |
| TC-G03-001 | create->list | スキル作成後にリスト表示が更新される   | FR-G03-2 |
| TC-G03-002 | create->list | 作成キャンセル時にリストが変更されない | FR-G03-2 |
| TC-G03-003 | 回帰確認     | 既存テスト全件がPASSする               | FR-G03-1 |
| TC-G03-004 | 回帰確認     | 新規テスト追加後も実行順序非依存       | FR-G03-1 |

---

## 6. エラーハンドリング設計

### 6.1 Main IPC層のエラー分類

| エラー種別     | コード             | ソース                      | テスト検証     |
| -------------- | ------------------ | --------------------------- | -------------- |
| Sender不正     | `VALIDATION_ERROR` | `toIPCValidationError`      | TC-G01-002     |
| 引数型不正     | `VALIDATION_ERROR` | ハンドラー内throw           | TC-G01-003-008 |
| サービス層例外 | `CREATE_ERROR`     | `sanitizeErrorMessage` 経由 | TC-G01-011     |

### 6.2 Renderer層のエラーフォールバック

| エラー種別    | UI動作                         | テスト検証     |
| ------------- | ------------------------------ | -------------- |
| action失敗    | エラーメッセージをトースト表示 | TC-G02-008     |
| state回復失敗 | 再試行/初期化パスを検証する    | TC-G02-009-010 |

## 6. 依存トレーサビリティ

| 依存元     | 固定済み観点             | Layer   | 対応テストケース |
| ---------- | ------------------------ | ------- | ---------------- |
| TASK-10A-F | RT-01 作成後一覧同期     | Layer 2 | TC-G02-005       |
| TASK-10A-F | RT-02 改善後再分析       | Layer 2 | TC-G02-007       |
| TASK-10A-F | RT-03 全自動改善後再分析 | Layer 2 | TC-G02-007       |
| TASK-10A-F | RT-04 エラー回復         | Layer 2 | TC-G02-009       |
| TASK-10A-F | RT-05 状態初期化         | Layer 2 | TC-G02-010       |
| TASK-10A-F | RT-06 分析→改善→再分析   | Layer 2 | TC-G02-007       |
| TASK-10A-F | RT-07 並行操作防止       | Layer 2 | TC-G02-010       |
| TASK-10A-E | sender / P42 / error     | Layer 1 | TC-G01-001〜014  |

---

## 参照資料

| 参照資料                | パス                                                                                                                    | 使用セクション                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1 要件定義書      | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md`                         | FR/NFR/受入基準                       |
| IPC API仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                    | skill:create契約                      |
| ChatPanel UI仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                                          | ChatPanel 起点導線                    |
| UI機能仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                         | SkillCreateWizard / SkillAnalysisView |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                            | store action / selector               |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                             | real composition / useShallow         |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                       | モック戦略全般                        |
| エラー仕様              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                   | エラー分類                            |
| IPCセキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                            | Sender検証/P42                        |
| IPC契約チェック         | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                           | error envelope / DTO                  |
| TASK-10A-F 引き渡し設計 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                                         | RT-01〜RT-07 原本                     |
| TASK-10A-E 引き渡し条件 | `docs/30-workflows/completed-tasks/task-043a-ipc-contract-and-security-alignment/outputs/phase-10/handover-criteria.md` | sender/P42/エラー                     |

---

## 成果物

| 成果物 | パス                                                                                      | 説明                                |
| ------ | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| 設計書 | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md` | テスト構成/モック/データ/ゲート設計 |

---

## 統合テスト連携

| 連携対象 | 設計で固定する内容                 | 受け渡し先 |
| -------- | ---------------------------------- | ---------- |
| Phase 4  | TC-G01〜03 とテストファイル配置    | テスト作成 |
| Phase 5  | モック形状と実装契約の突合ポイント | Green調整  |
| Phase 11 | 手動実行時の検証コマンドと判定軸   | 手動検証   |

---

## 完了条件

- [ ] 3層テスト構成（Main IPC / Renderer統合 / 既存テスト整合）が設計されている
- [ ] 各レイヤーのモック戦略が testing-component-patterns.md 準拠で定義されている
- [ ] テストデータ（フィクスチャ・バリデーションエラーケース）が設計されている
- [ ] テストケース一覧（TC-G01/G02/G03）が FR 要件にトレース可能
- [ ] テスト実行順序と独立性保証が明記されている
- [ ] 品質ゲートの実行手順が定義されている
- [ ] P9, P31, P39, P40, P42, P48 の教訓がモック戦略に反映されている

---

## 次Phase

Phase 3（設計レビュー）: テスト設計の妥当性、モック整合性、既存テストとの共存を検証する。
