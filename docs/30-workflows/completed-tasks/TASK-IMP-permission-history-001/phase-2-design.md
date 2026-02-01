# Phase 2: 設計

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

要件を実現可能な構造に落とし込む。PermissionHistoryEntryデータモデル、Zustand Store拡張設計、PermissionHistoryPanel UIコンポーネント設計を行う。

## 実行タスク

- データモデル設計: PermissionHistoryEntry型の定義
- 状態管理設計: Zustand Store（permissionHistorySliceまたはskillSlice拡張）の設計
- UIコンポーネント設計: PermissionHistoryPanel・フィルタUI・仮想スクロールの構成
- 永続化設計: Zustand persist middleware + localStorage永続化の設計

## 参照資料

| 資料名                 | パス                                                                            | 説明                         |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                                    | Phase 1成果物                |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                                        | Phase 1成果物                |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                                           | Phase 1成果物                |
| PermissionSettings仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` L186-L277 | 既存UI仕様                   |
| 状態管理パターン       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | Zustand Store-directパターン |
| Permission Store仕様   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 既存PermissionStore設計      |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                            | 内容                               |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------------------- |
| UI/UX設定画面仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`           | PermissionSettings UIパターン      |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | Store-directパターン・Slice構成    |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | safeString()・セキュリティポリシー |

## 実行手順

### 1. データモデル設計

`PermissionHistoryEntry`型を定義する:

```typescript
// packages/shared/src/types/permission-history.ts or
// apps/desktop/src/renderer/components/skill/permissionHistory.ts

export type PermissionDecision = "approved" | "denied" | "approved_once";

export interface PermissionHistoryEntry {
  id: string; // crypto.randomUUID()
  timestamp: string; // ISO8601形式
  toolName: string; // ツール名（Bash, Read, Write等）
  argsSnapshot: string; // safeString()で安全化した引数要約
  decision: PermissionDecision; // 判断結果
  sessionId?: string; // agentSliceの現在セッションID
}

export interface PermissionHistoryFilter {
  toolName?: string; // ツール名フィルタ（undefinedで全件）
  decision?: PermissionDecision; // 判断結果フィルタ（undefinedで全件）
}

export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;
```

### 2. 状態管理設計（Zustand Store）

`permissionHistorySlice`をAppStoreに追加する:

```typescript
// apps/desktop/src/renderer/stores/slices/permissionHistorySlice.ts

export interface PermissionHistorySlice {
  // State
  permissionHistory: PermissionHistoryEntry[];
  historyFilter: PermissionHistoryFilter;

  // Actions
  addHistoryEntry: (
    entry: Omit<PermissionHistoryEntry, "id" | "timestamp">,
  ) => void;
  clearHistory: () => void;
  setHistoryFilter: (filter: PermissionHistoryFilter) => void;

  // Computed (selector functions)
  // getFilteredHistory(): PermissionHistoryEntry[] → useMemoで実装
  // getUniqueToolNames(): string[] → useMemoで実装
}
```

永続化設計:

- Zustand `persist` middlewareを使用
- `name: 'permission-history'` でlocalStorageに保存
- `partialize`で`permissionHistory`のみ永続化（filterは非永続化）
- `addHistoryEntry`内で`PERMISSION_HISTORY_MAX_ENTRIES`を超えた場合、先頭（最古）から削除

### 3. UIコンポーネント設計

#### コンポーネント構成

```
PermissionSettings/
├── index.tsx                    （既存: 許可済みツール一覧）
├── PermissionHistoryPanel.tsx   （新規: 履歴パネル）
├── PermissionHistoryFilter.tsx  （新規: フィルタUIコンポーネント）
└── PermissionHistoryItem.tsx    （新規: 個別履歴エントリ表示）
```

**配置場所の判断**: 既存のPermissionSettingsと密結合するため、`apps/desktop/src/renderer/components/settings/PermissionSettings/`に配置する。

**代替案（却下理由付き）**: `apps/desktop/src/renderer/components/skill/`に配置する案は、既存のPermissionSettingsとの物理的距離が離れるため却下。

#### PermissionHistoryPanel設計

| プロパティ | 型      | 説明                   |
| ---------- | ------- | ---------------------- |
| className  | string? | 外部からのスタイル注入 |

#### PermissionHistoryFilter設計

| プロパティ     | 型                                        | 説明                     |
| -------------- | ----------------------------------------- | ------------------------ |
| filter         | PermissionHistoryFilter                   | 現在のフィルタ状態       |
| onFilterChange | (filter: PermissionHistoryFilter) => void | フィルタ変更コールバック |
| availableTools | string[]                                  | 選択可能ツール名一覧     |

#### PermissionHistoryItem設計

| プロパティ | 型                     | 説明         |
| ---------- | ---------------------- | ------------ |
| entry      | PermissionHistoryEntry | 履歴エントリ |

### 4. 自動記録トリガー設計

PermissionDialogの応答処理（`respondToSkillPermission`）内で履歴を自動記録する:

```
respondToSkillPermission(approved, remember)
  ↓
pendingPermissionからtoolName, argsを取得
  ↓
addHistoryEntry({
  toolName,
  argsSnapshot: safeString(JSON.stringify(args)),
  decision: !approved ? 'denied' : remember ? 'approved' : 'approved_once',
  sessionId: currentSessionId
})
  ↓
既存処理（IPC送信、pendingPermission=null）
```

### 5. 仮想スクロール設計

- `@tanstack/react-virtual`を使用
- 各エントリの推定高さ: 72px（ツール名+引数+タイムスタンプ）
- ウィンドウサイズ: PermissionHistoryPanelの表示領域に合わせて動的計算
- 1000件表示時のDOM要素数: 表示領域分+オーバースキャン5件のみ

## 統合テスト連携【必須】

| 統合ポイント             | 契約定義                                                                  |
| ------------------------ | ------------------------------------------------------------------------- |
| PermissionDialog → Store | `respondToSkillPermission`内で`addHistoryEntry`を呼び出す（同期呼び出し） |
| Store → localStorage     | Zustand persist middleware（自動同期、`permission-history`キー）          |
| Store → UI               | `useAppStore`セレクタで`permissionHistory`を取得、`useMemo`でフィルタ適用 |

## アーキテクチャ層別設計（AIが判断）

| 層                         | 設計観点                                                                        | 仕様参照先                                             |
| -------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | PermissionHistoryPanel/Filter/Itemコンポーネント、Zustand Store、仮想スクロール | `aiworkflow-requirements: ui-ux-settings.md`           |
| データ                     | localStorage永続化、Zustand persist middleware、1000件上限                      | `aiworkflow-requirements: arch-state-management.md`    |
| セキュリティ               | argsのsafeString()化、機密データ非保存                                          | `aiworkflow-requirements: security-skill-execution.md` |

## 成果物

| 成果物             | パス                                     | 説明                         |
| ------------------ | ---------------------------------------- | ---------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | データモデル・Store・UI構成  |
| ドメインモデル     | `outputs/phase-2/domain-model.md`        | PermissionHistoryEntry型定義 |

## 完了条件

- [ ] PermissionHistoryEntry型が定義されている
- [ ] PermissionHistoryFilter型が定義されている
- [ ] permissionHistorySliceの状態・アクション・セレクタが設計されている
- [ ] Zustand persist middlewareの永続化設計が完了している
- [ ] PermissionHistoryPanel/Filter/Itemコンポーネント構成が設計されている
- [ ] 自動記録トリガー（respondToSkillPermission内）の設計が完了している
- [ ] 仮想スクロール（@tanstack/react-virtual）の設計が完了している
- [ ] 要件との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
