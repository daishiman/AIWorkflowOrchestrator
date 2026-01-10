# Phase 2: 設計

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 2                     |
| 機能名 | history-ui-components |
| 作成日 | 2026-01-10            |

## 目的

要件を実現可能なコンポーネント・フック構造に落とし込む。

## 使用スキル

| スキル                           | 選定理由                                        |
| -------------------------------- | ----------------------------------------------- |
| `component-composition-patterns` | Reactコンポーネントの構成パターンを設計するため |
| `custom-hooks-patterns`          | データ取得フックの設計パターンを適用するため    |
| `electron-ui-patterns`           | Electronデスクトップアプリ向けUI設計のため      |

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                  |
| ------------------- | --------------------------------------------------------------------------- | --------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | Atomic Design準拠     |
| デザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`  | Tailwind CSS設定      |
| Electronパターン    | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md`  | Electronアプリ設計    |
| インターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-converter.md` | IHistoryService型定義 |

## 実行手順

### ステップ1: コンポーネント構成設計

`component-composition-patterns`スキルを使用して、Atomic Designに基づくコンポーネント構成を設計する。

**コンポーネント階層:**

```
Organisms (セクション単位)
├── VersionHistory     # 履歴一覧パネル
├── VersionDetail      # バージョン詳細パネル
├── ConversionLogs     # ログ一覧パネル
└── RestoreDialog      # 復元確認ダイアログ

Molecules (機能単位)
├── VersionHistoryItem # 履歴アイテム行
├── LogEntry           # ログエントリ行
└── LoadMoreButton     # さらに読み込むボタン

Atoms (最小単位) - 既存を再利用
├── Button
├── Badge
├── Spinner
├── Select
└── IconButton
```

**Props設計:**

```typescript
// VersionHistory Props
interface VersionHistoryProps {
  fileId: string;
  onVersionSelect?: (item: VersionHistoryItem) => void;
  onRestore?: (item: VersionHistoryItem) => void;
}

// VersionDetail Props
interface VersionDetailProps {
  conversionId: string;
  onClose?: () => void;
  onRestore?: () => void;
}

// ConversionLogs Props
interface ConversionLogsProps {
  fileId?: string;
  levelFilter?: LogLevel[];
  limit?: number;
}

// RestoreDialog Props
interface RestoreDialogProps {
  isOpen: boolean;
  version: VersionHistoryItem;
  onConfirm: () => void;
  onCancel: () => void;
  isRestoring: boolean;
}
```

### ステップ2: カスタムフック設計

`custom-hooks-patterns`スキルを使用して、データ取得・状態管理フックを設計する。

**useVersionHistory:**

```typescript
interface UseVersionHistoryReturn {
  history: VersionHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

function useVersionHistory(fileId: string): UseVersionHistoryReturn;
```

**useConversionLogs:**

```typescript
interface UseConversionLogsOptions {
  fileId?: string;
  levelFilter?: LogLevel[];
  limit?: number;
}

interface UseConversionLogsReturn {
  logs: ConversionLog[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

function useConversionLogs(
  options: UseConversionLogsOptions,
): UseConversionLogsReturn;
```

**useVersionDetail:**

```typescript
interface UseVersionDetailReturn {
  detail: VersionHistoryItem | null;
  isLoading: boolean;
  error: Error | null;
}

function useVersionDetail(conversionId: string): UseVersionDetailReturn;
```

**useRestore:**

```typescript
interface UseRestoreReturn {
  restore: (conversionId: string) => Promise<void>;
  isRestoring: boolean;
  error: Error | null;
}

function useRestore(): UseRestoreReturn;
```

### ステップ3: データフロー設計

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ VersionHistory  │───▶│ useVersionHistory               │ │
│  │ (Component)     │    │  - history[]                    │ │
│  │                 │    │  - isLoading, error             │ │
│  │                 │    │  - loadMore(), refresh()        │ │
│  └────────┬────────┘    └───────────────┬─────────────────┘ │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ VersionDetail   │───▶│ useVersionDetail                │ │
│  │ (Component)     │    │  - detail                       │ │
│  └────────┬────────┘    │  - isLoading, error             │ │
│           │             └───────────────┬─────────────────┘ │
│           ▼                             │                    │
│  ┌─────────────────┐                    │                    │
│  │ RestoreDialog   │───▶ useRestore()   │                    │
│  │ (Component)     │                    │                    │
│  └─────────────────┘                    │                    │
│                                         ▼                    │
│                         ┌─────────────────────────────────┐ │
│                         │ window.historyAPI (Preload)     │ │
│                         │  - getFileHistory()             │ │
│                         │  - getVersionDetail()           │ │
│                         │  - restoreVersion()             │ │
│                         └───────────────┬─────────────────┘ │
└─────────────────────────────────────────┼───────────────────┘
                                          │ IPC
┌─────────────────────────────────────────┼───────────────────┐
│                      Main Process       ▼                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ IPC Handlers                                            ││
│  │  - history:getFileHistory                               ││
│  │  - history:getVersionDetail                             ││
│  │  - history:restoreVersion                               ││
│  └───────────────────────────┬─────────────────────────────┘│
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ HistoryService (packages/shared)                        ││
│  │  - getFileHistory()                                     ││
│  │  - restoreVersion()                                     ││
│  └───────────────────────────┬─────────────────────────────┘│
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ SQLite Database                                         ││
│  │  - conversion_history table                             ││
│  │  - conversion_logs table                                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### ステップ4: 状態管理設計

**ローカル状態（useState）:**

- `selectedVersion`: 選択中のバージョン
- `isRestoreDialogOpen`: 復元ダイアログの開閉状態
- `selectedLogLevel`: ログフィルタの選択値

**カスタムフック状態:**

- フック内でuseState/useReducerを使用して状態を管理
- 外部ストア（Zustand等）は使用しない（コンポーネント単位で完結）

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント       | 契約定義                                           |
| ------------------ | -------------------------------------------------- |
| フロント→IPC       | window.historyAPI.getFileHistory(fileId, options)  |
| IPC→Service        | historyService.getFileHistory(fileId, options)     |
| Service→Repository | conversionRepository.findByFileId(fileId, options) |

## 成果物

| 成果物         | パス                                     | 説明                  |
| -------------- | ---------------------------------------- | --------------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | コンポーネント構成    |
| データフロー   | `outputs/phase-2/data-flow.md`           | 状態・データの流れ    |
| Props設計      | `outputs/phase-2/props-design.md`        | 各コンポーネントProps |
| フック設計     | `outputs/phase-2/hooks-design.md`        | カスタムフック仕様    |

## 完了条件

- [ ] コンポーネント階層がAtomic Designに基づいて設計されている
- [ ] 各コンポーネントのProps型が定義されている
- [ ] カスタムフックの戻り値型が定義されている
- [ ] データフローが図示されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. component-composition-patternsスキルの実行
3. custom-hooks-patternsスキルの実行
4. electron-ui-patternsスキルの実行
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-components --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
