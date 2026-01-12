# テスト仕様書

## 概要

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | AGENT-004          |
| 機能名   | agent-execution-ui |
| Phase    | 4                  |
| 作成日   | 2026-01-12         |

---

## テスト方針

### TDD (Test-Driven Development) 原則

本機能はTDDに従って開発される。Phase 4では「Red Phase」としてテストを先に作成し、全テストが失敗状態であることを確認する。

### テスト階層

| レベル      | 目的               | ツール      | カバレッジ目標 |
| ----------- | ------------------ | ----------- | -------------- |
| Unit        | 個別コンポーネント | Vitest, RTL | 80%以上        |
| Integration | コンポーネント連携 | Vitest, RTL | 70%以上        |
| E2E         | 全フロー確認       | Playwright  | 主要フロー100% |

---

## テスト対象

### 1. 状態管理テスト (agentSlice)

#### 1.1 実行状態テスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.execution.test.ts`

| テストグループ           | テストケース数 | 説明                       |
| ------------------------ | -------------- | -------------------------- |
| startExecution           | 4              | 実行開始時の状態設定       |
| stopExecution            | 2              | 実行停止時の状態設定       |
| addUserMessage           | 2              | ユーザーメッセージ追加     |
| addAssistantMessage      | 1              | アシスタントメッセージ追加 |
| appendStreamingContent   | 2              | ストリーミング内容追加     |
| finalizeStreamingMessage | 3              | ストリーミング完了処理     |
| setExecutionError        | 2              | エラー設定                 |
| clearMessages            | 2              | メッセージクリア           |
| resetExecutionState      | 1              | 状態リセット               |
| **合計**                 | **19**         |                            |

#### 1.2 Permission状態テスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.permission.test.ts`

| テストグループ           | テストケース数 | 説明               |
| ------------------------ | -------------- | ------------------ |
| setPermissionRequest     | 3              | 権限リクエスト設定 |
| respondToPermission      | 3              | 権限応答処理       |
| rememberPermissionChoice | 3              | 選択記憶           |
| getRememberedChoice      | 2              | 記憶取得           |
| clearRememberedChoices   | 1              | 記憶クリア         |
| **合計**                 | **12**         |                    |

---

### 2. コンポーネントテスト

#### 2.1 AgentChatInterface

**ファイル**: `apps/desktop/src/renderer/components/organisms/AgentChatInterface/__tests__/AgentChatInterface.test.tsx`

| テストグループ     | テストケース数 | 説明                   |
| ------------------ | -------------- | ---------------------- |
| rendering          | 3              | レンダリング確認       |
| user messages      | 2              | ユーザーメッセージ表示 |
| assistant messages | 3              | アシスタント表示       |
| streaming          | 2              | ストリーミング表示     |
| accessibility      | 2              | アクセシビリティ       |
| **合計**           | **12**         |                        |

#### 2.2 AgentMessageInput

**ファイル**: `apps/desktop/src/renderer/components/molecules/AgentMessageInput/__tests__/AgentMessageInput.test.tsx`

| テストグループ | テストケース数 | 説明             |
| -------------- | -------------- | ---------------- |
| input behavior | 3              | 入力動作         |
| send behavior  | 4              | 送信動作         |
| accessibility  | 2              | アクセシビリティ |
| **合計**       | **9**          |                  |

#### 2.3 AgentExecutionControls

**ファイル**: `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/__tests__/AgentExecutionControls.test.tsx`

| テストグループ | テストケース数 | 説明             |
| -------------- | -------------- | ---------------- |
| cancel button  | 4              | キャンセルボタン |
| clear button   | 4              | クリアボタン     |
| accessibility  | 2              | アクセシビリティ |
| **合計**       | **10**         |                  |

#### 2.4 PermissionDialog

**ファイル**: `apps/desktop/src/renderer/components/organisms/PermissionDialog/__tests__/PermissionDialog.test.tsx`

| テストグループ    | テストケース数 | 説明                 |
| ----------------- | -------------- | -------------------- |
| rendering         | 5              | レンダリング確認     |
| approve behavior  | 3              | 許可動作             |
| deny behavior     | 3              | 拒否動作             |
| remember checkbox | 2              | 記憶チェックボックス |
| accessibility     | 3              | アクセシビリティ     |
| **合計**          | **16**         |                      |

#### 2.5 AgentExecutionView

**ファイル**: `apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx`

| テストグループ    | テストケース数 | 説明             |
| ----------------- | -------------- | ---------------- |
| rendering         | 4              | レンダリング確認 |
| navigation        | 2              | ナビゲーション   |
| message flow      | 2              | メッセージフロー |
| execution control | 2              | 実行制御         |
| permission dialog | 3              | 権限ダイアログ   |
| **合計**          | **13**         |                  |

---

### 3. 統合テスト

| カテゴリ             | ファイル                   | テストケース数 |
| -------------------- | -------------------------- | -------------- |
| IPC接続テスト        | `agent.ipc.test.ts`        | 8              |
| ストリーミングテスト | `agent.streaming.test.ts`  | 8              |
| Permission連携テスト | `agent.permission.test.ts` | 9              |
| 状態同期テスト       | `agent.sync.test.ts`       | 8              |
| エラーハンドリング   | `agent.error.test.ts`      | 9              |
| **合計**             |                            | **42**         |

---

## テスト総数サマリー

| カテゴリ       | テストケース数 |
| -------------- | -------------- |
| agentSlice     | 31             |
| コンポーネント | 60             |
| 統合テスト     | 42             |
| **総合計**     | **133**        |

---

## モック戦略

### 1. Electron IPC

```typescript
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  },
}));
```

### 2. agentAPI (Preload)

```typescript
vi.stubGlobal("agentAPI", {
  start: vi.fn(),
  stop: vi.fn(),
  respondPermission: vi.fn(),
  onStream: vi.fn(),
  onStatus: vi.fn(),
  onPermission: vi.fn(),
});
```

### 3. Zustand Store

```typescript
const createMockStore = (overrides = {}) => ({
  executionState: {
    /* 初期状態 */
  },
  // アクション関数
  ...overrides,
});

vi.mock("@/renderer/store", () => ({
  useStore: (selector) => selector(createMockStore()),
}));
```

### 4. React Router

```typescript
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ skillId: "skill-1" }),
}));
```

---

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイル実行
pnpm --filter @repo/desktop test agentSlice.execution.test.ts

# カバレッジ付き実行
pnpm --filter @repo/desktop test:coverage

# ウォッチモード
pnpm --filter @repo/desktop test:watch
```

---

## TDD Red Phase 確認

Phase 4完了時点では、以下を確認する：

1. **全テストが失敗状態（Red）であること**
   - 実装前のため、テストはすべて失敗するはず
   - エラーは「コンポーネント/関数が存在しない」または「期待値と一致しない」

2. **テストコードが構文エラーなくコンパイルできること**
   - TypeScript型チェックが通ること
   - importパスが正しいこと

3. **テストカバレッジの対象が明確であること**
   - 全要件（FR/NFR）がテストで網羅されていること

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |
