# Phase 2: 設計 - TASK-10A-G スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 2（設計）                                          |
| 機能名     | task-10a-g-lifecycle-test-hardening                |
| タスク ID  | TASK-10A-G                                         |
| 作成日     | 2026-03-10                                         |
| 前提 Phase | Phase 1: 要件定義                                  |
| 依存タスク | TASK-10A-E（契約定義）、TASK-10A-F（状態遷移定義） |

## 目的

TASK-10A-E と TASK-10A-F で定義されたスキルライフサイクルの契約・状態遷移を、Main IPC テストと ChatPanel 起点統合テストで保護する品質ゲートを構築する。テストアーキテクチャ、テストケース構造、モック戦略を設計し、Phase 4 以降の実装に必要な全情報を定義する。

## 実行タスク

- Task 1: テストアーキテクチャと責務境界を設計する
- Task 2: G1/G2/G3 のテストケースを設計する
- Task 3: IPC/Store/Preload のモック構成を設計する

### Task 1: テストアーキテクチャ設計

テストファイル構成、モック戦略、テスト間分離の設計を行う。

### Task 2: テストケース設計

G1/G2/G3 各サブエージェント用テストケースの詳細設計を行う。

### Task 3: モック設計

IPC/Store/Preload のモック構成を定義する。

---

## 1. テストアーキテクチャ設計

### 1.1 テストファイル構成

```
apps/desktop/src/
  main/ipc/__tests__/
    skillHandlers.create.test.ts          # [G1] skill:create 契約テスト（新規）
  renderer/components/skill/__tests__/
    SkillLifecycle.integration.test.tsx    # [G2] ライフサイクル統合テスト（新規）
  renderer/components/chat/__tests__/
    ChatPanel.skill-management.test.tsx    # [G3] 既存テスト整合・拡張（修正）
```

### 1.2 テスト層構造と障害切り分け順序

```
Layer 1: Main IPC 契約テスト [G1]
  → skill:create ハンドラの入力バリデーション・委譲・エラー契約を検証
  → 失敗時: IPC ハンドラの契約違反

Layer 2: Renderer 統合テスト [G2]
  → Store action 経由のライフサイクル状態遷移を検証
  → 失敗時: Store/Action の状態遷移バグ

Layer 3: ChatPanel 起点テスト [G3]
  → UI 操作から Store action 呼び出しまでの導線を検証
  → 失敗時: コンポーネント結合バグ
```

**障害切り分け原則**: G1 失敗 → G2/G3 は原因不明のため G1 を優先修正。G2 失敗 → G3 の Store 依存部分は信頼不可。

### 1.3 テスト環境

| テストファイル                      | 環境      | 理由                          |
| ----------------------------------- | --------- | ----------------------------- |
| skillHandlers.create.test.ts        | node      | Main Process テスト、DOM 不要 |
| SkillLifecycle.integration.test.tsx | happy-dom | Renderer テスト、P39 準拠     |
| ChatPanel.skill-management.test.tsx | happy-dom | 既存テスト環境を維持          |

### 1.4 既知の落とし穴への対策マッピング

| Pitfall | 対策                                                        | 適用先   |
| ------- | ----------------------------------------------------------- | -------- |
| P9      | `beforeEach` で全モック・Store 状態をリセット               | 全テスト |
| P13     | タイマー使用時は `advanceTimersByTime` で1ステップずつ進行  | G2       |
| P31     | 個別セレクタ（`useCreateSkill` 等）のみ使用、合成 Hook 禁止 | G2/G3    |
| P39     | happy-dom 環境では `fireEvent` 使用、`userEvent` 禁止       | G2/G3    |
| P40     | `pnpm --filter @repo/desktop exec vitest run` で実行        | 全テスト |
| P42     | 3段バリデーション検証（型チェック→空文字列→トリム空文字列） | G1       |
| P48     | 派生セレクタに `useShallow` 適用を検証                      | G2       |

---

## 2. テストケース設計

### 2.1 G1: Main IPC `skill:create` 契約テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`

#### 2.1.1 テストカテゴリと ID 体系

| カテゴリ ID | カテゴリ名         | テスト数 | 説明                                 |
| ----------- | ------------------ | -------- | ------------------------------------ |
| G1-VAL      | 入力バリデーション | 6        | P42 準拠 3段バリデーション           |
| G1-DEL      | 正常系委譲         | 3        | SkillService.createSkillFromWizard() |
| G1-ERR      | エラー系           | 3        | エラーコード・メッセージ形式         |
| G1-SEC      | セキュリティ       | 2        | sender 検証、contextIsolation        |

#### 2.1.2 テストケース詳細

**G1-VAL: 入力バリデーション（P42 準拠 3段バリデーション）**

| ID       | テスト名                                          | 入力                         | 期待結果                                                     |
| -------- | ------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| G1-VAL-1 | description が undefined の場合 VALIDATION_ERROR  | `(event, undefined, {})`     | `throw { code: "VALIDATION_ERROR", message: /description/ }` |
| G1-VAL-2 | description が数値の場合 VALIDATION_ERROR         | `(event, 123, {})`           | `throw { code: "VALIDATION_ERROR", message: /description/ }` |
| G1-VAL-3 | description が空文字列の場合 VALIDATION_ERROR     | `(event, "", {})`            | `throw { code: "VALIDATION_ERROR", message: /description/ }` |
| G1-VAL-4 | description がスペースのみの場合 VALIDATION_ERROR | `(event, "   ", {})`         | `throw { code: "VALIDATION_ERROR", message: /description/ }` |
| G1-VAL-5 | options が null の場合 VALIDATION_ERROR           | `(event, "desc", null)`      | `throw { code: "VALIDATION_ERROR", message: /options/ }`     |
| G1-VAL-6 | options が文字列の場合 VALIDATION_ERROR           | `(event, "desc", "invalid")` | `throw { code: "VALIDATION_ERROR", message: /options/ }`     |

**G1-DEL: 正常系委譲**

| ID       | テスト名                                         | 入力                                                     | 期待結果                                           |
| -------- | ------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| G1-DEL-1 | 有効な入力で createSkillFromWizard が呼ばれる    | `(event, "Create a tool", { generateTasks: true, ... })` | `skillService.createSkillFromWizard` が1回呼ばれる |
| G1-DEL-2 | description の前後空白が trim される             | `(event, "  trimmed  ", { ... })`                        | `createSkillFromWizard("trimmed", ...)` で呼ばれる |
| G1-DEL-3 | createSkillFromWizard の戻り値がそのまま返される | `(event, "desc", { ... })`                               | mock の戻り値と一致                                |

**G1-ERR: エラー系**

| ID       | テスト名                                              | 条件                                    | 期待結果                                               |
| -------- | ----------------------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| G1-ERR-1 | createSkillFromWizard が例外を投げた場合 CREATE_ERROR | `mockService.throws(new Error("fail"))` | `throw { code: "CREATE_ERROR", message: /sanitized/ }` |
| G1-ERR-2 | エラーメッセージがサニタイズされる                    | `throws(new Error("/Users/dm/secret"))` | message にパス情報が含まれない                         |
| G1-ERR-3 | 未知のエラー型でも CREATE_ERROR で返す                | `throws("string error")`                | `throw { code: "CREATE_ERROR" }`                       |

**G1-SEC: セキュリティ**

| ID       | テスト名                                         | 条件                                   | 期待結果                                                   |
| -------- | ------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------- |
| G1-SEC-1 | sender 検証失敗で IPC_UNAUTHORIZED               | `validateIpcSender → { valid: false }` | `throw { code: "IPC_UNAUTHORIZED" }`                       |
| G1-SEC-2 | validateIpcSender に正しいチャンネル名が渡される | 正常呼び出し                           | `validateIpcSender(event, "skill:create", ...)` で呼ばれる |

#### 2.1.3 ハンドラキャプチャ方式

既存の `skillHandlers.contract.test.ts` と同一のパターンを採用する:

```typescript
// ipcMain.handle のモックで登録されたハンドラをキャプチャ
let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

beforeEach(async () => {
  handlers = new Map();
  (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
    (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
      handlers.set(channel, handler);
    },
  );
  // registerSkillHandlers() を呼んでハンドラを登録
  const { registerSkillHandlers } = await import("../skillHandlers.js");
  registerSkillHandlers(mockSkillService as any, mockMainWindow);
});
```

---

### 2.2 G2: Renderer 統合テスト（SkillLifecycle.integration.test.tsx）

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`

#### 2.2.1 テストカテゴリと ID 体系

| カテゴリ ID | カテゴリ名          | テスト数 | 説明                             |
| ----------- | ------------------- | -------- | -------------------------------- |
| G2-CL       | create → fetch 遷移 | 3        | スキル作成後の再取得とエラー     |
| G2-LA       | analyze 状態遷移    | 3        | 分析開始と結果反映               |
| G2-AI       | improve 状態遷移    | 3        | 改善開始と後処理                 |
| G2-SD       | Store 駆動検証      | 3        | agentSlice action と hook 安定性 |

#### 2.2.2 テストケース詳細

**G2-CL: create → fetch 遷移**

| ID      | テスト名                                                       | 操作                               | 期待結果                                           |
| ------- | -------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| G2-CL-1 | createSkill 成功後に fetchSkills が呼ばれる                    | `createSkill("desc", opts)` → 成功 | `fetchSkills` が1回呼ばれる                        |
| G2-CL-2 | createSkill 成功後に preload API へ description/options が渡る | `createSkill("desc", opts)`        | `window.electronAPI.skill.create` が正しく呼ばれる |
| G2-CL-3 | createSkill 失敗時にエラー状態が設定される                     | `createSkill` → IPC エラー         | `skillError` にエラーメッセージが設定              |

**G2-LA: analyze 状態遷移**

| ID      | テスト名                                             | 操作                      | 期待結果                           |
| ------- | ---------------------------------------------------- | ------------------------- | ---------------------------------- |
| G2-LA-1 | analyzeSkill 開始時に currentAnalysis がクリアされる | `analyzeSkill("skill-1")` | `currentAnalysis === null`         |
| G2-LA-2 | analyzeSkill 実行中に isAnalyzing が true になる     | `analyzeSkill("skill-1")` | `isAnalyzing === true`             |
| G2-LA-3 | analyzeSkill 完了後に currentAnalysis が設定される   | `analyzeSkill` → 成功     | `currentAnalysis` に分析結果が設定 |

**G2-AI: improve 状態遷移**

| ID      | テスト名                                         | 操作                                       | 期待結果                   |
| ------- | ------------------------------------------------ | ------------------------------------------ | -------------------------- |
| G2-AI-1 | applySkillImprovements 実行中は isImproving=true | `applySkillImprovements("skill-1", [...])` | `isImproving === true`     |
| G2-AI-2 | 改善完了後に分析結果がクリアされる               | `applySkillImprovements` → 成功            | `currentAnalysis === null` |
| G2-AI-3 | 改善失敗時に skillError が設定される             | `applySkillImprovements` → 失敗            | `skillError` が設定される  |

**G2-SD: Store 駆動検証**

| ID      | テスト名                                                                     | 操作                                 | 期待結果                   |
| ------- | ---------------------------------------------------------------------------- | ------------------------------------ | -------------------------- |
| G2-SD-1 | 個別セレクタ useCreateSkill の参照が安定（P31）                              | `renderHook(() => useCreateSkill())` | 不要再レンダーが発生しない |
| G2-SD-2 | 個別セレクタ useAnalyzeSkill / useApplySkillImprovements の参照が安定（P31） | hook を個別に描画                    | 不要再レンダーが発生しない |
| G2-SD-3 | 派生セレクタに useShallow が適用されている（P48）                            | selector stability を検証            | 再評価が抑制される         |

#### 2.2.3 テスト構成パターン

```typescript
/**
 * @vitest-environment happy-dom
 */
import { renderHook, act, cleanup } from "@testing-library/react";
import { render, screen, fireEvent } from "@testing-library/react"; // P39: userEvent 禁止

// Store を直接操作してライフサイクル遷移を検証
// Preload API はモックで IPC レスポンスをシミュレート
```

---

### 2.3 G3: 既存テスト整合・品質ゲート

**ファイル**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`（修正）

#### 2.3.1 テストカテゴリと ID 体系

| カテゴリ ID | カテゴリ名       | テスト数 | 説明                        |
| ----------- | ---------------- | -------- | --------------------------- |
| G3-INT      | ChatPanel 結線   | 3        | toggle / visibility / guard |
| G3-ISO      | テスト間分離検証 | 2        | P9 準拠モック分離           |

#### 2.3.2 テストケース詳細

**G3-INT: ChatPanel 結線**

| ID       | テスト名                                       | 操作                | 期待結果                     |
| -------- | ---------------------------------------------- | ------------------- | ---------------------------- |
| G3-INT-1 | スキル管理ボタンで panel 表示を切り替えられる  | ToggleButton click  | panel の表示状態が切り替わる |
| G3-INT-2 | panel 表示中はメッセージ領域が非表示になる     | panel open          | message list が隠れる        |
| G3-INT-3 | スキル実行中はスキル管理パネル操作が制限される | `isExecuting: true` | toggle が disabled           |

**G3-ISO: テスト間分離**

| ID       | テスト名                                            | 操作                             | 期待結果                    |
| -------- | --------------------------------------------------- | -------------------------------- | --------------------------- |
| G3-ISO-1 | 前のテストの Store 状態が次のテストに漏れない（P9） | テスト A で状態変更 → テスト B   | テスト B は初期状態で開始   |
| G3-ISO-2 | モック関数の呼び出し回数がテスト間でリセットされる  | テスト A で mock 呼出 → テスト B | テスト B で callCount === 0 |

---

## 3. モック設計

### 3.1 G1 モック構成（Main Process）

```typescript
// === 必須モック ===

// 1. SkillService（DI 対象）
const mockSkillService = {
  createSkillFromWizard: vi.fn(),
  // 他のメソッドは skillHandlers.contract.test.ts と同一
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  getSkillByName: vi.fn(),
  executeSkill: vi.fn(),
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
};

// 2. validateIpcSender（セキュリティ検証）
const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    code: result.errorCode ?? "IPC_UNAUTHORIZED",
    message: result.errorMessage ?? "Unauthorized IPC call",
  })),
}));

// 3. electron（ipcMain, BrowserWindow）
vi.mock("electron", () => ({
  ipcMain: { handle: vi.fn(), removeHandler: vi.fn() },
  BrowserWindow: {
    fromWebContents: vi
      .fn()
      .mockReturnValue({ id: 1, isDestroyed: () => false }),
  },
}));

// 4. electron-store（PermissionStore 依存）
vi.mock("electron-store", () => ({
  default: class MockElectronStore {
    private data: Record<string, unknown> = {};
    get(key: string) {
      return this.data[key];
    }
    set(key: string | Record<string, unknown>, value?: unknown) {
      if (typeof key === "object") Object.assign(this.data, key);
      else this.data[key] = value;
    }
    clear() {
      this.data = {};
    }
  },
}));

// 5. IPC イベントオブジェクト
const mockEvent = {
  senderFrame: { url: "file://" },
  sender: { getURL: () => "file://" },
} as unknown as IpcMainInvokeEvent;
```

### 3.2 G2 モック構成（Renderer）

```typescript
// === Preload API モック ===

const mockElectronAPI = {
  skill: {
    create: vi.fn(),
    list: vi.fn(),
    analyze: vi.fn(),
    improve: vi.fn(),
    getImported: vi.fn(),
  },
};

// window.electronAPI をモック
Object.defineProperty(window, "electronAPI", {
  value: mockElectronAPI,
  writable: true,
});

// === Store 初期状態 ===
// agentSlice の初期状態を直接設定
// P31: 個別セレクタ経由でアクセス
// P48: 派生セレクタには useShallow 適用済みを前提
```

### 3.3 G3 モック構成（既存テスト拡張）

既存の `ChatPanel.skill-management.test.tsx` のモック構成を維持し、以下を追加:

```typescript
// 追加モック: ライフサイクル関連の Store 状態
const extendedStoreState = {
  ...defaultStoreState,
  // G3 追加分
  currentAnalysis: null,
  isAnalyzing: false,
  isImproving: false,
  createSkill: vi.fn(),
  analyzeSkill: vi.fn(),
  applySkillImprovements: vi.fn(),
};
```

### 3.4 モック分離原則（P9 準拠）

```typescript
// 全テストファイル共通パターン
beforeEach(() => {
  vi.clearAllMocks();
  // Store 状態リセット
  // モック戻り値のデフォルト設定
});

afterEach(() => {
  cleanup(); // Renderer テストのみ
});
```

---

## 統合テスト連携

### 4.1 テスト実行順序と依存関係

```
G1 (Main IPC) ──→ G2 (Renderer 統合) ──→ G3 (ChatPanel 整合)
  独立実行可能       独立実行可能         G1/G2 後に実行
```

- G1 と G2 は並列実行可能（依存関係なし）
- G3 は G1/G2 の設計を前提とするため、直列で実行

### 4.2 品質ゲート定義

| ゲート ID | チェック内容                            | コマンド                                                                                                                  | 合否基準            |
| --------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| QG-1      | TypeScript 型チェック                   | `pnpm --filter @repo/desktop exec tsc --noEmit`                                                                           | エラー 0            |
| QG-2      | G1 テスト PASS                          | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 全 PASS             |
| QG-3      | G2 テスト PASS                          | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 全 PASS             |
| QG-4      | G3 テスト PASS（回帰ゼロ）              | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 全 PASS（既存含む） |
| QG-5      | 既存 skillHandlers テスト回帰ゼロ       | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers`                                        | 全 PASS             |
| QG-6      | agentSlice ライフサイクルテスト回帰ゼロ | `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle`              | 全 PASS             |

---

## 5. 多角的チェック観点

### 5.1 IPC 通信

- [ ] `skill:create` チャンネルのハンドラ登録・解除が正しい
- [ ] 引数形式（positional: `description`, `options`）が Preload 側と一致
- [ ] 戻り値形式がフロントエンド Store の期待と一致
- [ ] `IPC_CHANNELS.SKILL_CREATE` 定数を使用（ハードコード文字列禁止 P27）

### 5.2 セキュリティ

- [ ] `validateIpcSender` が全テストケースで呼ばれる
- [ ] エラーメッセージに内部パス情報が漏洩しない（P55 準拠）
- [ ] バリデーションエラーが P42 準拠 3段バリデーション

### 5.3 テスト設計

- [ ] テスト間でモジュールスコープ変数がリークしない（P9）
- [ ] happy-dom 環境で `userEvent` を使用していない（P39）
- [ ] タイマーテストで `runAllTimers` を使用していない（P13）
- [ ] 個別セレクタの参照安定性を検証している（P31）
- [ ] テスト実行が `pnpm --filter` 経由で行われる（P40）

---

## 参照資料

| 資料名                                  | パス                                                                                        | 用途                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ui-ux-components.md                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | `skill:create` の4層同期と SkillCreateWizard 契約             |
| ui-ux-feature-components.md             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView / SkillCreateWizard / TASK-10A-F の画面責務 |
| arch-ui-components.md                   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | ChatPanel 導線と SkillManagementPanel 状態遷移                |
| interfaces-agent-sdk-ui.md              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | ChatPanel 公開インターフェースと UI 統合境界                  |
| interfaces-agent-sdk-skill.md           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | UI 側期待契約                                                 |
| security-electron-ipc.md                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender/P42 検証                                               |
| testing-component-patterns.md           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | 統合テスト構成                                                |
| quality-requirements.md                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ・品質ゲート                                        |
| error-handling.md                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 異常系期待値                                                  |
| arch-state-management.md                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store 設計                                                    |
| architecture-implementation-patterns.md | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン                                                  |
| task-workflow.md                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-10A-C/D/F の完了記録と同期観点                           |
| lessons-learned.md                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 契約同期漏れと handler-scope coverage の再発防止              |
| Phase 1 要件分析                        | `outputs/phase-1/requirements-analysis.md`                                                  | FR/NFR/AC の検証可能性を設計へ引き継ぐ                        |

---

## 成果物

| 成果物                       | パス                                                                                       | 状態    |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------- |
| Phase 2 設計仕様書（本文書） | `docs/30-workflows/.../task-045-task-10a-g-lifecycle-test-hardening/phase-2-design.md`     | 作成済  |
| G1 テストファイル            | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | Phase 4 |
| G2 テストファイル            | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | Phase 4 |
| G3 テストファイル（修正）    | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | Phase 4 |

---

## 完了条件

- [ ] G1/G2/G3 全テストケースの ID・入力・期待結果が定義されている
- [ ] モック構成が既存テスト（skillHandlers.contract.test.ts）と整合している
- [ ] 既知の落とし穴（P9/P13/P31/P39/P40/P42/P48）への対策が設計に含まれている
- [ ] 品質ゲート（QG-1〜QG-6）が定義されている
- [ ] テスト環境（node/happy-dom）が各ファイルで指定されている
- [ ] 障害切り分け順序（G1→G2→G3）が明記されている
- [ ] 参照資料テーブルが完備している

---

## 実行手順

1. Task 1 で G1/G2/G3 の責務分離と依存方向を固定する。
2. Task 2 で各テスト ID・入力・期待値・失敗時切り分け先を定義する。
3. Task 3 で `ipcMain.handle` ハンドラーキャプチャ、Store モック、Preload モックの構成を決定する。
4. 統合テスト連携セクションで実行順序と品質ゲートを確認する。

## 次の Phase

**Phase 3: 設計レビュー** → 本設計の妥当性を多角的に検証し、PASS/MINOR/MAJOR 判定を行う。
