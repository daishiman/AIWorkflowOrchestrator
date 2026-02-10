# 実装ガイド - TASK-FIX-6-1-STATE-CENTRALIZATION

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| 作成日   | 2026-02-10                        |
| 対象読者 | 初学者〜開発者                    |

---

# Part 1: 概念的説明（中学生レベル）

## 状態管理とは

アプリが「今どうなっているか」を記録する仕組みです。

例えば、スマートフォンのアプリを使っているとき：

- 今、どの画面を見ているか
- ログインしているかどうか
- 何かの処理中かどうか

これらの情報を「状態」と呼び、アプリはこれを記憶しておく必要があります。

## なぜ集約が必要か

**問題**: 複数の場所に同じ情報があると混乱する

今まで、スキルの情報を3つの別々の場所に保管していました。

### 日常での例え

例えると、同じメモを3つの引き出しに入れていて、どれが最新かわからなくなる問題がありました。

- 引き出しA（skillSlice）：「スキル一覧」のメモ
- 引き出しB（AgentViewのローカルstate）：「今選んでいるスキル」のメモ
- 引き出しC（useSkillExecution）：「スキル実行中かどうか」のメモ

**問題点**：

- Aを更新してもBには反映されない
- Cだけ見ると、Aの情報とズレていることがある
- 「本当の最新情報」がどこにあるのかわからない

## 何が改善されたか

このタスクでは、すべての情報を1つの引き出し（agentSlice）にまとめました。

- すべての情報が1か所にある
- いつでも正しい最新の情報がわかる
- 「この引き出しを見ればOK」という明確なルールができた

## race condition（競争状態）とは

スキルを実行するとき、「実行開始」と「結果受信」が別々に処理されます。

例えると、郵便局で「手紙を出す」と「返事を受け取る」の間にタイムラグがあるようなものです。

**問題**：
手紙を出した直後に返事が届いた場合、
「まだ手紙を出していない状態」で返事を処理しようとして混乱する。

**解決策**：
手紙を出す前に「返事待ちの番号」を先に決めておく。
そうすれば、返事が届いたときにすぐに紐付けられる。

→ これを「executionIdの事前生成」として実装しました。

---

# Part 2: 技術者向け実装詳細

## 統一状態インターフェース

`agentSlice`に統合された状態とアクション：

```typescript
// スキル関連の状態（skillSliceから統合）
interface SkillState {
  // スキル一覧
  availableSkillsMetadata: SkillMetadata[];
  importedSkills: ImportedSkill[];

  // 選択状態
  selectedSkillName: string | null;

  // 実行状態
  isExecuting: boolean;
  executionId: string | null;
  skillExecutionStatus: SkillExecutionStatus;

  // ストリーミング
  streamingMessages: SkillStreamMessage[];

  // 権限
  pendingPermission: PermissionRequest | null;

  // エラー
  skillError: string | null;

  // ローディング
  isLoadingSkills: boolean;
  isScanning: boolean;
  isImporting: boolean;
  importingSkillName: string | null;
}

// アクション
interface SkillActions {
  fetchSkills: () => Promise<void>;
  rescanSkills: () => Promise<void>;
  importSkill: (skillId: string) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  selectSkill: (skill: SkillMetadata | ImportedSkill | null) => void;
  selectSkillByName: (skillName: string | null) => void;
  executeSkill: (prompt: string, options?: ExecuteOptions) => Promise<void>;
  abortExecution: () => void;
  respondToSkillPermission: (
    approved: boolean,
    rememberChoice?: boolean,
  ) => Promise<void>;
  clearSkillError: () => void;
  clearStreamingMessages: () => void;

  // IPCイベントハンドラ（内部）
  _handleStreamMessage: (message: SkillStreamMessage) => void;
  _handleComplete: (data: { executionId: string; result?: unknown }) => void;
  _handleError: (data: { executionId: string; error: string }) => void;
  _handlePermissionRequest: (data: PermissionRequest) => void;
}
```

## 削除されたファイル

| ファイル                                                     | 行数    | 削除理由                                   |
| ------------------------------------------------------------ | ------- | ------------------------------------------ |
| `store/slices/skillSlice.ts`                                 | 約370行 | agentSliceに統合                           |
| `store/slices/__tests__/skillSlice.test.ts`                  | -       | agentSlice.skill-integration.test.tsに移行 |
| `store/slices/__tests__/skillSlice.edge-cases.test.ts`       | -       | 〃                                         |
| `store/slices/__tests__/skillSlice.integration.test.ts`      | -       | 〃                                         |
| `store/slices/__tests__/skillSlice.ipc.test.ts`              | -       | 〃                                         |
| `store/slices/__tests__/skillSlice.state-transition.test.ts` | -       | 〃                                         |

## 移行パターン

### 旧コード（skillSlice使用）

```typescript
// 旧: skillSliceを直接使用
import { useSkillSlice } from "../store/slices/skillSlice";

const Component = () => {
  const { selectedSkillName, executeSkill, isExecuting } = useSkillSlice();
  // ...
};
```

### 新コード（agentSlice経由）

```typescript
// 新: useSkillStoreセレクタ経由（変更不要）
import { useSkillStore } from "../store";

const Component = () => {
  const { selectedSkillName, executeSkill, isExecuting } = useSkillStore();
  // ...
};
```

**ポイント**: `useSkillStore`セレクタは既存インターフェースを維持。呼び出し元の変更は不要。

## race condition対策

### 問題

```typescript
// 問題: IPC呼び出し後にexecutionIdを設定
executeSkill: async (prompt: string) => {
  const response = await window.electronAPI.skill.execute({ prompt });
  set({ executionId: response.executionId }); // ← ここで設定
  // 問題: responseが返る前にstreamイベントが届くとexecutionIdがnull
};
```

### 解決策（executionId事前生成）

```typescript
executeSkill: async (prompt: string) => {
  // 1. 先にexecutionIdを生成（UUID）
  const tempExecutionId = crypto.randomUUID();

  set({
    isExecuting: true,
    streamingMessages: [],
    executionId: tempExecutionId, // ← IPC呼び出し前に設定
    skillExecutionStatus: "running",
  });

  try {
    // 2. IPC呼び出し
    const response = await window.electronAPI.skill.execute({
      skillId: get().selectedSkillName,
      prompt,
    });

    // 3. サーバーからのexecutionIdで更新（必要な場合）
    if (
      response.data?.executionId &&
      response.data.executionId !== tempExecutionId
    ) {
      set({ executionId: response.data.executionId });
    }
  } catch (error) {
    set({
      skillError: error instanceof Error ? error.message : "Unknown error",
      isExecuting: false,
      skillExecutionStatus: "error",
    });
  }
};
```

## セレクタ最適化

### 推奨パターン

```typescript
// 良い: 必要なフィールドのみ取得
const selectedSkillName = useAppStore((state) => state.selectedSkillName);
const isExecuting = useAppStore((state) => state.isExecuting);

// 良い: useSkillStoreで関連フィールドをまとめて取得
const { selectedSkillName, executeSkill, isExecuting } = useSkillStore();
```

### 避けるべきパターン

```typescript
// 悪い: Store全体を一括取得（不要な再レンダリングの原因）
const store = useAppStore();
const { selectedSkillName, isExecuting } = store;
```

## テスト修正ポイント

### storeRef パターン

テストでZustand storeをモックする際、状態更新が正しく反映されるようにするパターン：

```typescript
function createTestStore(): AgentSlice {
  const storeRef: { current: AgentSlice | null } = { current: null };

  const mockSet = (
    fn: ((state: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>,
  ) => {
    if (!storeRef.current) return;
    const partial =
      typeof fn === "function"
        ? fn(storeRef.current)
        : (fn as Partial<AgentSlice>);
    Object.assign(storeRef.current, partial); // ← 同一オブジェクトを更新
  };

  const mockGet = () => storeRef.current!;

  const initialStore = createAgentSlice(
    mockSet as never,
    mockGet as never,
    {} as never,
  );
  storeRef.current = initialStore;

  return initialStore;
}
```

**ポイント**: `Object.assign`で同一オブジェクトを更新することで、テスト内で状態変更が正しく反映される。

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │   AgentView   │   │  ChatPanel   │   │ SkillImportDialog│ │
│  └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘ │
│         │                  │                     │           │
│         └────────────┬─────┴─────────────────────┘           │
│                      │                                        │
│                      ▼                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   useSkillStore()                       │  │
│  │              （セレクタ - 後方互換性維持）               │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                                │
│                              ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    agentSlice                           │  │
│  │           （状態 + アクション - 単一ソース）            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ • availableSkillsMetadata                        │  │  │
│  │  │ • importedSkills                                 │  │  │
│  │  │ • selectedSkillName                              │  │  │
│  │  │ • isExecuting, executionId                       │  │  │
│  │  │ • streamingMessages                              │  │  │
│  │  │ • pendingPermission                              │  │  │
│  │  │ • skillError                                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                                │
│                              ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              setupSkillListeners()                      │  │
│  │           （IPCリスナー登録 - 一度だけ）                │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼────────────────────────────────┘
                               │
                     IPC (contextBridge)
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       Main Process                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   SkillExecutor                          │  │
│  │                 （スキル実行エンジン）                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 関連ドキュメント

| ドキュメント               | パス                                                     |
| -------------------------- | -------------------------------------------------------- |
| 状態管理アーキテクチャ仕様 | `references/arch-state-management.md`                    |
| 状態管理ルール             | `.claude/rules/03-state-management.md`                   |
| agentSlice実装             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`   |
| セレクタ定義               | `apps/desktop/src/renderer/store/index.ts`               |
| IPCリスナー設定            | `apps/desktop/src/renderer/store/setupSkillListeners.ts` |
