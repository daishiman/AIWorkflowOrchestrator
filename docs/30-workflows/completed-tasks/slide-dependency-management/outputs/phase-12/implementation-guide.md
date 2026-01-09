# スライド依存関係管理システム 実装ガイド

## Part 1: 概念的な説明

### 何をするシステム？

このシステムは「スライドの設計図（structure.md）と実際のスライド（index.html）を自動で同期させる」ものです。

**身近な例え**:
建築で例えると、structure.mdは「設計図」、index.htmlは「実際の建物」です。設計図を修正したら、建物も自動で修正される仕組みを作っています。従来は設計図を変更するたびに、職人（開発者）が手動で建物を直していましたが、このシステムがその作業を自動化します。

### なぜ必要？

**従来の課題**:

1. structure.mdを編集 → 手動でスキルを実行 → index.htmlが更新
2. 編集を忘れると「設計図」と「建物」がずれてしまう
3. 複数回手動で実行すると、無限ループが発生する可能性

**解決策**:

- ファイルの変更を自動検知（chokidar）
- 変更を検知したら自動でスキルを実行
- 無限ループを防止する仕組み（changeContextMap）

### 4つのスキルフェーズ

```
[hearing] → [structure] → [html] → [modifier]
 ヒアリング   構造設計      HTML生成   修正

各フェーズは、スライド作成の異なる段階を担当します：
1. hearing: ユーザーの要望を聞き出す
2. structure: スライドの構造を設計
3. html: HTMLファイルを生成
4. modifier: 既存スライドを修正
```

---

## Part 2: 技術的な詳細

### アーキテクチャ

```
┌──────────────────────────────────────────────────────────────────┐
│                         Renderer Process                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Zustand Store │  │  useSlideProject│  │   UI Components │  │
│  │   (store.ts)    │◄─┤  (hook)         │◄─┤  - SyncStatus   │  │
│  │   - syncStatus  │  │  - openProject  │  │  - SkillPhase   │  │
│  │   - currentPhase│  │  - executePhase │  │  - SlideWork    │  │
│  │   - progress    │  │  - manualSync   │  │                 │  │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘  │
│           │                    │                                  │
│           │  IPC通信           │                                  │
└───────────┼────────────────────┼──────────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                          Main Process                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  IPC Handlers   │  │  File Watcher   │  │  Sync Manager   │   │
│  │  (ipc-handlers) │◄─┤  (file-watcher) │  │  (sync-manager) │   │
│  │                 │  │  - chokidar     │  │  - getStatus    │   │
│  │  - startWatch   │  │  - onChange     │  │  - sync         │   │
│  │  - executePhase │  │  - markSkill    │  │  - cancel       │   │
│  └────────┬────────┘  └─────────────────┘  └────────┬────────┘   │
│           │                                          │            │
│           ▼                                          ▼            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     Skill Executor                           │ │
│  │  - execute(phase, projectPath)                               │ │
│  │  - cancel() with AbortController                             │ │
│  │  - onProgress(callback)                                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                     @repo/shared Package                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │     types.ts    │  │  slide-project  │  │ dependency-mgr  │   │
│  │  - SlideProject │  │  - create       │  │  - check        │   │
│  │  - SyncStatus   │  │  - validate     │  │  - bothExist    │   │
│  │  - SkillPhase   │  │  - update       │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

### 各層の実装詳細

#### 1. @repo/shared - 共有型定義

```typescript
// types.ts - 同期状態の定義
export type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";

// スキルフェーズの定義
export type SkillPhase = "hearing" | "structure" | "html" | "modifier";

// 変更コンテキスト（無限ループ防止用）
export interface ChangeContext {
  source: "user" | "skill"; // 変更の発生元
  timestamp: number; // タイムスタンプ
  skillPhase?: SkillPhase; // スキル起因の場合
}
```

**設計意図**: 型定義を共有パッケージに配置することで、Main/Renderer間で型安全な通信を実現。

#### 2. File Watcher - ファイル監視

```typescript
// file-watcher.ts
const DEFAULT_CONFIG: WatcherConfig = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500, // 500ms待機
    pollInterval: 100,
  },
};

// 無限ループ防止メカニズム
const handleChange = (filePath: string): void => {
  const context = changeContextMap.get(filePath);
  const now = Date.now();

  // スキル起因の変更かどうかをチェック
  const isSkillChange =
    context?.source === "skill" && now - context.timestamp < CHANGE_CONTEXT_TTL; // 1000ms

  if (isSkillChange) {
    // スキル起因の変更は無視
    changeContextMap.delete(filePath);
    return;
  }

  // ユーザー起因の変更としてコールバック実行
  callbacks.forEach((cb) => cb(filePath));
};
```

**設計意図**:

- `awaitWriteFinish`でファイル書き込みの安定化を待つ
- `changeContextMap`でスキル起因の変更を記録し、無限ループを防止

#### 3. Skill Executor - スキル実行

```typescript
// skill-executor.ts
export const createSkillExecutor = (): SkillExecutor => {
  let abortController: AbortController | null = null;

  return {
    async execute(phase, projectPath) {
      abortController = new AbortController();

      try {
        emitProgress(0);
        const skillName = getSkillName(phase);
        emitProgress(50);

        // キャンセルチェック
        if (cancelled) {
          throw new Error("Cancelled");
        }

        // TODO: Claude Agent SDK統合
        await simulateSkillExecution();

        emitProgress(100);
        return { phase, success: true, duration };
      } finally {
        abortController = null;
      }
    },

    cancel() {
      abortController?.abort();
    },
  };
};
```

**設計意図**:

- `AbortController`でキャンセル可能に
- 進捗コールバックでUIに進捗を通知

#### 4. Zustand Store - 状態管理

```typescript
// store.ts
export const useSlideProjectStore = create<SlideProjectState>()(
  subscribeWithSelector((set) => ({
    projectPath: null,
    syncStatus: "synced" as SyncStatus,
    currentPhase: "idle" as const,
    executionProgress: 0,

    setSyncStatus: (status) =>
      set((state) => ({
        syncStatus: status,
        lastSyncAt: status === "synced" ? new Date() : state.lastSyncAt,
      })),

    setProgress: (progress) =>
      set({
        executionProgress: progress,
      }),
  })),
);
```

**設計意図**:

- `subscribeWithSelector`で特定の状態変更のみを購読可能
- イミュータブルな更新で安全な状態管理

---

## 用語集

| 用語             | 読み方                       | 意味                                          |
| ---------------- | ---------------------------- | --------------------------------------------- |
| chokidar         | チョキダー                   | ファイル監視ライブラリ（Node.js向け）         |
| Zustand          | ツースタンド                 | React用の軽量状態管理ライブラリ               |
| IPC              | アイピーシー                 | Inter-Process Communication（プロセス間通信） |
| AbortController  | アボートコントローラ         | 非同期処理のキャンセル機構                    |
| awaitWriteFinish | アウェイトライトフィニッシュ | ファイル書き込み完了を待つオプション          |
| TTL              | ティーティーエル             | Time To Live（有効期限）                      |
| changeContextMap | チェンジコンテキストマップ   | 変更の発生元を追跡するMap                     |
| invoke/handle    | インボーク/ハンドル          | Electron IPCの通信パターン                    |

---

## データフロー

### ユーザーがstructure.mdを編集した場合

```
1. ユーザーがstructure.mdを保存
   ↓
2. chokidarが変更を検知（500ms待機後）
   ↓
3. changeContextMapをチェック
   - スキル起因? → 無視して終了
   - ユーザー起因? → 続行
   ↓
4. IPC経由でRenderer側に通知
   ↓
5. Zustandストアを更新（syncStatus: "out-of-sync"）
   ↓
6. UIが更新される
   ↓
7. html-generatorスキルが自動実行
   ↓
8. 実行前にmarkAsSkillChange()を呼び出し
   ↓
9. スキルがindex.htmlを更新
   ↓
10. changeContextMapにより変更は無視される
   ↓
11. 同期完了（syncStatus: "synced"）
```

---

## トラブルシューティング

### 無限ループが発生した場合

1. `CHANGE_CONTEXT_TTL`（現在1000ms）を確認
2. スキル実行前に`markAsSkillChange()`が呼ばれているか確認
3. 変更検知のタイミングを確認（awaitWriteFinish設定）

### キャンセルが効かない場合

1. `AbortController`が正しく設定されているか確認
2. 長時間の処理にキャンセルチェックポイントがあるか確認
3. IPC通信のタイムアウト設定を確認
