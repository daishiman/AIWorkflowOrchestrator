# スライド依存関係管理システム - タスク指示書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | task-feat-slide-dependency-management-003 |
| タスク名     | スライド依存関係管理システム              |
| 分類         | 要件（新機能）                            |
| 対象機能     | スライド作成システム                      |
| 優先度       | 高                                        |
| 見積もり規模 | 中規模                                    |
| ステータス   | 未実施                                    |
| 発見元       | 新規要件（ユーザー要求）                  |
| 発見日       | 2026-01-07                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

presentation-slide-generatorスキルでは、以下の2ファイルが密接に連携している：

- **structure.md**: スライドの構造化データ（メタ情報、スライド一覧、各スライド詳細）
- **index.html**: 実際のプレゼンテーションファイル

スキルの仕様では「index.htmlを修正したら必ずstructure.mdも同期更新する」「structure.mdを修正したらindex.htmlを再生成する」という整合性維持ルールがある。

この依存関係をアプリ上で自動管理することで、ユーザーの手動操作を減らし、整合性を保証する。

### 1.2 問題点・課題

- structure.md更新時に手動でhtml-generatorを呼び出す必要がある
- index.html修正時にstructure.mdへの反映を忘れやすい
- 両ファイルの整合性が崩れると、次回修正時に意図しない結果になる
- 4つのスキルフェーズ（hearing, structure-designer, html-generator, slide-modifier）の連携が煩雑

### 1.3 放置した場合の影響

- structure.mdとindex.htmlの非同期状態が発生する
- スライド修正時に手戻りが頻発する
- ユーザーがワークフローを覚える負担が大きい
- スライド作成の生産性が大幅に低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

structure.mdとindex.htmlの依存関係を自動管理し、4つのスキルフェーズをシームレスに呼び出せるシステムを構築する。

### 2.2 最終ゴール

1. structure.md更新時にindex.htmlが自動再生成される
2. ファイルウォッチャーがリアルタイムで変更を検知する
3. アプリUIから4つのスキルフェーズを呼び出せる
   - ヒアリング（hearing-facilitator）
   - 構成設計（structure-designer）
   - HTML生成（html-generator）
   - スライド修正（slide-modifier）
4. 依存関係の状態（同期/非同期）がUIに表示される

### 2.3 スコープ

#### 含むもの

- ファイルウォッチャー実装（chokidar使用）
- structure.md変更検知 → html-generator自動呼び出し
- 4つのスキルフェーズのUI統合
- 依存関係状態の可視化（同期/非同期インジケーター）
- 手動同期トリガーボタン
- スキル実行の進捗表示

#### 含まないもの

- スキル自体の修正・拡張
- 複数スライドプロジェクトの同時監視（将来拡張）
- バージョン管理・履歴機能（将来拡張）

### 2.4 成果物

| 成果物                             | 説明                                 |
| ---------------------------------- | ------------------------------------ |
| `packages/shared/src/slide/`       | スライド管理コアモジュール           |
| `apps/desktop/src/main/slide/`     | ファイルウォッチャー・スキル呼び出し |
| `apps/desktop/src/renderer/slide/` | スライド管理UIコンポーネント         |
| ユニットテスト                     | 依存関係管理のテストコード           |
| 統合テスト                         | スキル連携のテストコード             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Claude Agent SDK統合基盤が実装済み（task-feat-agent-sdk-integration-001）
- スライド出力ディレクトリ設定機能が実装済み（task-feat-slide-directory-settings-002）

### 3.2 依存タスク

| タスクID                               | 依存内容                   |
| -------------------------------------- | -------------------------- |
| task-feat-agent-sdk-integration-001    | Agent SDKの基盤が必要      |
| task-feat-slide-directory-settings-002 | 出力ディレクトリ設定が必要 |

### 3.3 必要な知識・スキル

- chokidar（ファイルウォッチャー）
- Claude Agent SDK（スキル呼び出し）
- React状態管理（Zustand/Jotai）
- Electron IPC通信
- presentation-slide-generatorスキルの仕様

### 3.4 推奨アプローチ

1. **ウォッチャー実装フェーズ**: chokidarでstructure.md監視
2. **スキル連携フェーズ**: 4つのスキルフェーズをAgent SDK経由で呼び出し
3. **UI実装フェーズ**: スライド管理画面を作成
4. **自動同期フェーズ**: 変更検知→自動再生成の実装

---

## 4. 実行手順

### Phase構成

本タスクはtask-specification-creatorのPhase 1〜13フレームワークに従って実行する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                               | パス                                                             | 選定理由                                        |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| functional-non-functional-requirements | `.claude/skills/functional-non-functional-requirements/SKILL.md` | 機能要件・非機能要件の定義（Trigger: 要件定義） |
| acceptance-criteria-writing            | `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 受け入れ基準の作成（Trigger: 受け入れ基準）     |
| event-driven-file-watching             | `.claude/skills/event-driven-file-watching/SKILL.md`             | ファイル監視パターン（Trigger: ファイル監視）   |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

依存関係管理システムの詳細要件を定義する。

#### 成果物

- 依存関係管理仕様書
- スキル連携フロー図
- 受け入れ基準

#### 完了条件

- [ ] 4つのスキルフェーズの呼び出し仕様が定義されている
- [ ] ファイルウォッチャーの動作仕様が明確化されている
- [ ] 自動同期のトリガー条件が定義されている
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 2: 設計

#### 使用スキル

| スキル名               | パス                                                        | 選定理由                                          |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| architectural-patterns | `.claude/skills/architectural-patterns/SKILL.md`            | アーキテクチャ設計（Trigger: アーキテクチャ設計） |
| dependency-analysis    | `.claude/skills/dependency-analysis/SKILL.md`               | 依存関係分析（Trigger: 依存関係）                 |
| state-manager          | `.claude/skills/state-manager/SKILL.md`                     | 状態管理設計（Trigger: 状態管理, Zustand）        |
| workflow-engine        | `.claude/skills/workflow-engine/SKILL.md`                   | ワークフロー設計（Trigger: ワークフロー）         |
| claude-agent-sdk       | `.claude/skills/claude-agent-sdk/SKILL.md`（Phase 0で作成） | Agent SDK統合パターン（Trigger: Agent SDK）       |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

依存関係管理のアーキテクチャ設計を行う。

#### 成果物

- コンポーネント設計書
- 状態管理設計書
- シーケンス図（スキル呼び出しフロー）

#### 完了条件

- [ ] ファイルウォッチャーの設計が完了
- [ ] スキル呼び出しの連携設計が完了
- [ ] UI状態管理の設計が完了
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 4: テスト作成

#### 使用スキル

| スキル名              | パス                                            | 選定理由                                      |
| --------------------- | ----------------------------------------------- | --------------------------------------------- |
| tdd-principles        | `.claude/skills/tdd-principles/SKILL.md`        | TDD原則（Trigger: TDD, テスト駆動）           |
| test-doubles          | `.claude/skills/test-doubles/SKILL.md`          | モック・スタブ設計（Trigger: モック, スタブ） |
| frontend-testing      | `.claude/skills/frontend-testing/SKILL.md`      | フロントエンドテスト（Trigger: Reactテスト）  |
| flaky-test-prevention | `.claude/skills/flaky-test-prevention/SKILL.md` | 不安定テスト防止（Trigger: 非同期テスト）     |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

TDD: 失敗するテストを先に作成する。

#### 成果物

- ファイルウォッチャーのユニットテスト
- スキル連携の統合テスト
- UIコンポーネントのテスト

#### 完了条件

- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 5: 実装

#### 使用スキル

| スキル名                   | パス                                                 | 選定理由                                       |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| clean-code-practices       | `.claude/skills/clean-code-practices/SKILL.md`       | クリーンコード実践（Anchor: Clean Code）       |
| debounce-throttle-patterns | `.claude/skills/debounce-throttle-patterns/SKILL.md` | デバウンス・スロットル（Trigger: デバウンス）  |
| custom-hooks-patterns      | `.claude/skills/custom-hooks-patterns/SKILL.md`      | Reactカスタムフック（Trigger: カスタムフック） |
| electron-ipc-patterns      | `.claude/skills/electron-ipc-patterns/SKILL.md`      | Electron IPC通信（Trigger: IPC通信）           |
| concurrency-control        | `.claude/skills/concurrency-control/SKILL.md`        | 並行制御（Trigger: キュー管理, ロック）        |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

依存関係管理システムを実装する。

#### 成果物

```
packages/shared/src/slide/
├── slide-project.ts         # スライドプロジェクト管理
├── dependency-manager.ts    # 依存関係管理
└── types.ts                 # 型定義

apps/desktop/src/main/slide/
├── file-watcher.ts          # chokidarファイルウォッチャー
├── skill-executor.ts        # スキル実行サービス
└── sync-manager.ts          # 同期管理

apps/desktop/src/renderer/slide/
├── SlideWorkspace.tsx       # メインワークスペース
├── SkillPhasePanel.tsx      # スキルフェーズ選択パネル
├── SyncStatusIndicator.tsx  # 同期状態インジケーター
└── useSlideProject.ts       # カスタムフック
```

#### 完了条件

- [ ] すべてのテストが成功（Green）
- [ ] ファイルウォッチャーが動作する
- [ ] 4つのスキルフェーズが呼び出せる
- [ ] 自動同期が動作する
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] structure.md更新時にindex.htmlが自動再生成される
- [ ] ファイルウォッチャーがリアルタイムで変更を検知する
- [ ] hearing-facilitatorスキルが呼び出せる
- [ ] structure-designerスキルが呼び出せる
- [ ] html-generatorスキルが呼び出せる
- [ ] slide-modifierスキルが呼び出せる
- [ ] 依存関係の状態がUIに表示される
- [ ] 手動同期ボタンが動作する

### 品質要件

- [ ] ユニットテストカバレッジ 80%以上
- [ ] 統合テストが成功している
- [ ] ESLint/Prettierエラーがない
- [ ] ファイルウォッチャーのリソースリークがない

### ドキュメント要件

- [ ] 依存関係管理の使い方ドキュメントが作成されている
- [ ] スキル連携フロー図が作成されている

---

## 6. 検証方法

### テストケース

1. **ファイルウォッチャーテスト**: structure.md変更が検知される
2. **自動同期テスト**: structure.md更新でindex.htmlが再生成される
3. **スキル呼び出しテスト**: 4つのスキルフェーズが正常に実行される
4. **状態表示テスト**: 同期/非同期状態が正しく表示される
5. **手動同期テスト**: 手動トリガーで同期が実行される

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# Electronアプリ起動
pnpm --filter @repo/desktop dev

# 手動検証
# 1. スライドプロジェクトを作成
# 2. structure.mdを編集
# 3. 自動的にindex.htmlが再生成されることを確認
# 4. 各スキルフェーズボタンをクリック
# 5. 同期状態インジケーターの表示を確認
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                               |
| -------------------------------- | ------ | -------- | ---------------------------------- |
| ファイルウォッチャーの無限ループ | 高     | 中       | デバウンス処理、変更元の識別       |
| スキル実行の長時間化             | 中     | 中       | 進捗表示、キャンセル機能           |
| 大量ファイル監視のパフォーマンス | 中     | 低       | 監視対象の制限、ポーリング間隔調整 |
| スキル実行中のファイル変更       | 中     | 中       | ロック機構、キュー管理             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/presentation-slide-generator/SKILL.md`
- `.claude/skills/presentation-slide-generator/agents/hearing-facilitator.md`
- `.claude/skills/presentation-slide-generator/agents/structure-designer.md`
- `.claude/skills/presentation-slide-generator/agents/html-generator.md`
- `.claude/skills/presentation-slide-generator/agents/slide-modifier.md`
- `task-feat-agent-sdk-integration-001`
- `task-feat-slide-directory-settings-002`

### 参考資料

| リソース | URL                                   |
| -------- | ------------------------------------- |
| chokidar | https://github.com/paulmillr/chokidar |
| Zustand  | https://github.com/pmndrs/zustand     |

---

## 9. 備考

### スキルフェーズフロー

```
【新規作成フロー】
User Request → hearing-facilitator → structure-designer
                                            ↓
                                    Output: structure.md
                                            ↓
                                    [User Review & Approval]
                                            ↓
                                    html-generator
                                            ↓
                                    Output: index.html

【修正・改善フロー】
structure.md 変更検知 → html-generator 自動実行 → index.html 更新
    or
User Request → slide-modifier → structure.md 更新 → html-generator → index.html 更新
```

### ファイルウォッチャー設計

```typescript
import chokidar from "chokidar";

interface SlideWatcher {
  projectPath: string;
  watcher: chokidar.FSWatcher | null;

  start(): void;
  stop(): void;
  onStructureChange(callback: (path: string) => void): void;
}

const createSlideWatcher = (projectPath: string): SlideWatcher => {
  let watcher: chokidar.FSWatcher | null = null;
  const callbacks: Array<(path: string) => void> = [];

  return {
    projectPath,
    watcher,

    start() {
      const structurePath = `${projectPath}/structure.md`;
      watcher = chokidar.watch(structurePath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100,
        },
      });

      watcher.on("change", (path) => {
        callbacks.forEach((cb) => cb(path));
      });
    },

    stop() {
      watcher?.close();
      watcher = null;
    },

    onStructureChange(callback) {
      callbacks.push(callback);
    },
  };
};
```

### UI状態管理

```typescript
interface SlideProjectState {
  projectPath: string | null;
  syncStatus: "synced" | "out-of-sync" | "syncing";
  currentPhase: "idle" | "hearing" | "structure" | "html" | "modifier";
  lastSyncAt: Date | null;

  // Actions
  setProject(path: string): void;
  startSync(): void;
  completeSync(): void;
  setPhase(phase: SlideProjectState["currentPhase"]): void;
}
```

### IPC通信インターフェース

```typescript
// スキル実行
ipcMain.handle("slide:executePhase", async (_, phase, projectPath) => {
  // 'hearing' | 'structure' | 'html' | 'modifier'
  return await skillExecutor.execute(phase, projectPath);
});

// ウォッチャー制御
ipcMain.handle("slide:startWatching", (_, projectPath) =>
  fileWatcher.start(projectPath),
);
ipcMain.handle("slide:stopWatching", () => fileWatcher.stop());

// 同期状態
ipcMain.handle("slide:getSyncStatus", (_, projectPath) =>
  syncManager.getStatus(projectPath),
);
ipcMain.handle("slide:manualSync", (_, projectPath) =>
  syncManager.sync(projectPath),
);
```

### 補足事項

- 本タスクはスライド作成システムの中核機能
- デバウンス処理で無限ループを防止（structure.md変更→html生成→structure.md更新の連鎖を防ぐ）
- スキル実行中は他のスキル実行をキューに入れる
