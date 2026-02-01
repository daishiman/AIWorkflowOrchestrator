# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 5                               |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。PermissionHistoryEntryデータモデル、permissionHistorySlice、PermissionHistoryPanel UIコンポーネントを実装する。

## 実行タスク

- データモデル実装: PermissionHistoryEntry型・safeString引数安全化ユーティリティの実装
- Store実装: permissionHistorySlice（addHistoryEntry, clearHistory, setHistoryFilter）の実装
- UIコンポーネント実装: PermissionHistoryPanel・Filter・Itemの実装
- 自動記録統合: PermissionDialogのrespondToSkillPermission内にaddHistoryEntry呼び出しを追加
- 仮想スクロール実装: @tanstack/react-virtualを使用した大量データ表示

## 参照資料

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| ドメインモデル     | `outputs/phase-2/domain-model.md`            | Phase 2成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                            | 内容                         |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| UI/UX設定画面仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`           | PermissionSettingsのUI仕様   |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | Zustand Store-directパターン |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | safeString()要件             |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | エラー処理パターン           |

## 実行手順

### 1. データモデル実装

**ファイル**: `apps/desktop/src/renderer/components/skill/permissionHistory.ts`

実装内容:

- `PermissionDecision`型（`'approved' | 'denied' | 'approved_once'`）
- `PermissionHistoryEntry`インターフェース（id, timestamp, toolName, argsSnapshot, decision, sessionId?）
- `PermissionHistoryFilter`インターフェース（toolName?, decision?）
- `PERMISSION_HISTORY_MAX_ENTRIES`定数（1000）
- `createHistoryEntry`ヘルパー関数（引数安全化含む）
- `safeArgsSnapshot`関数（JSON.stringifyした引数をサニタイズ、200文字制限）

### 2. Store実装

**ファイル**: `apps/desktop/src/renderer/stores/slices/permissionHistorySlice.ts`

実装内容:

- `PermissionHistorySlice`インターフェース定義
- `createPermissionHistorySlice` StateCreator関数
- `addHistoryEntry`: エントリ追加（先頭挿入、1000件上限チェック）
- `clearHistory`: 全履歴削除
- `setHistoryFilter`: フィルタ設定
- Zustand persist middleware設定（`name: 'permission-history'`、`partialize`でhistoryのみ永続化）

**AppStore統合**: 既存の`useAppStore`に`permissionHistorySlice`をマージする。

### 3. UIコンポーネント実装

#### PermissionHistoryPanel.tsx

**ファイル**: `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`

実装内容:

- ヘッダー: 「権限要求履歴」タイトル + 件数表示 + クリアボタン
- フィルタ: PermissionHistoryFilter（ツール名ドロップダウン + 判断結果ドロップダウン）
- リスト: 仮想スクロール対応の履歴エントリリスト
- 空状態: 「権限要求の履歴はありません」メッセージ
- クリア確認: window.confirm()で確認ダイアログ表示

#### PermissionHistoryFilter.tsx

**ファイル**: `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx`

実装内容:

- ツール名ドロップダウン: `<select>`（全て + 履歴内のユニークツール名リスト）
- 判断結果ドロップダウン: `<select>`（全て / 許可 / 拒否 / 1回許可）

#### PermissionHistoryItem.tsx

**ファイル**: `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryItem.tsx`

実装内容:

- タイムスタンプ: 相対時間（「3分前」等）+ ホバーで絶対時間ツールチップ
- ツール名: アイコン + 名前（permissionDescriptions.tsのアイコンマッピング再利用）
- 判断結果バッジ: 色分け（approved=green, denied=red, approved_once=yellow）
- 引数要約: safeArgsSnapshotテキスト

### 4. 自動記録統合

**変更ファイル**: `apps/desktop/src/renderer/stores/slices/skillSlice.ts`

`respondToSkillPermission`メソッド内に以下を追加:

1. `pendingPermission`からtoolName, argsを取得
2. decisionを判定（denied / approved_once / approved）
3. `addHistoryEntry`を呼び出して履歴記録
4. 既存のIPC送信処理を続行

### 5. 仮想スクロール実装

**依存パッケージ追加**:

```bash
pnpm --filter @repo/desktop add @tanstack/react-virtual
```

PermissionHistoryPanel内で`useVirtualizer`を使用:

- `count`: フィルタ適用後のエントリ数
- `getScrollElement`: スクロールコンテナのref
- `estimateSize`: 72（各エントリの推定高さpx）
- `overscan`: 5（オーバースキャン行数）

### 6. PermissionSettings統合

**変更ファイル**: `apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx`

既存の許可済みツール一覧の下部に`<PermissionHistoryPanel />`を追加する。セクション区切りとして見出し「権限要求履歴」を配置。

## 統合テスト連携【必須】

| 実装項目               | 内容                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| データフロー実装       | respondToSkillPermission → addHistoryEntry → UI更新の一連フロー              |
| 状態永続化実装         | Zustand persist middleware → localStorage自動同期                            |
| エラーハンドリング実装 | localStorage容量超過時→console.warn出力して処理続行、JSON.parseエラー→空配列 |

## アーキテクチャ層別実装（AIが判断）

| 層                   | 実装観点                                                           | 実装ファイル配置             | 仕様参照先                                   |
| -------------------- | ------------------------------------------------------------------ | ---------------------------- | -------------------------------------------- |
| Renderer Process     | PermissionHistoryPanel/Filter/Item、Zustand permissionHistorySlice | `apps/desktop/src/renderer/` | `aiworkflow-requirements: ui-ux-settings.md` |
| Shared（型定義のみ） | PermissionHistoryEntry型（sharedに配置する場合のみ）               | `packages/shared/src/types/` | -                                            |

## 成果物

| 成果物        | パス                                                                                           | 説明                     |
| ------------- | ---------------------------------------------------------------------------------------------- | ------------------------ |
| データモデル  | `apps/desktop/src/renderer/components/skill/permissionHistory.ts`                              | 型定義・ユーティリティ   |
| Store         | `apps/desktop/src/renderer/stores/slices/permissionHistorySlice.ts`                            | Zustand Slice            |
| HistoryPanel  | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`  | メインUIコンポーネント   |
| HistoryFilter | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx` | フィルタUIコンポーネント |
| HistoryItem   | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryItem.tsx`   | 個別エントリ表示         |

## 完了条件

- [ ] すべてのPhase 4テストが成功状態（Green）
- [ ] PermissionHistoryEntry型が定義されている
- [ ] permissionHistorySliceが実装されている（addHistoryEntry, clearHistory, setHistoryFilter）
- [ ] PermissionHistoryPanel/Filter/Itemが実装されている
- [ ] PermissionDialogのrespondToSkillPermission内で自動履歴記録が動作する
- [ ] 仮想スクロールが実装されている（@tanstack/react-virtual）
- [ ] PermissionSettingsに履歴パネルが統合されている
- [ ] localStorage永続化が動作している
- [ ] 1000件上限が正しく適用される
- [ ] TypeScript strict modeでエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 5
```

## 次のPhase

Phase 6: テスト拡充
