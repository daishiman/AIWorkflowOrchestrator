# Phase 12: 未タスク検出レポート

## 概要

履歴UIコンポーネント統合タスク完了後の未タスク（残課題）を検出・記録。

## 検出日時

- **検出日**: 2026-01-11
- **タスクID**: history-ui-integration

---

## 検出ソース別結果

### 1. Phase 3 レビュー結果

MINOR判定なし（PASSのみ）

### 2. Phase 10 レビュー結果

MINOR判定なし（PASSのみ）。スコープ外の既知問題を記録:

| 問題                   | 分類       | 対応方針         |
| ---------------------- | ---------- | ---------------- |
| @repo/shared型エラー   | インフラ   | 別途インフラ改善 |
| validateDOMNesting警告 | CONV-05-03 | 別タスクで対応   |

### 3. Phase 11 手動テスト結果

DEFERRED項目を検出:

| ケースID | テスト項目         | 理由                 | 対応方針          |
| -------- | ------------------ | -------------------- | ----------------- |
| MT-06    | 追加読み込み       | HistoryServiceスタブ | DB統合後に検証    |
| UX-02    | ウィンドウリサイズ | GUI環境必要          | GUI環境で手動確認 |
| UX-06    | フォーカス表示     | GUI環境必要          | GUI環境で手動確認 |
| IT-03    | データ永続化       | HistoryServiceスタブ | DB統合後に検証    |

### 4. outputs/ 内のTODO/将来対応

| 場所                       | 内容                     | 分類     |
| -------------------------- | ------------------------ | -------- |
| phase-4/test-specification | E2Eテストは将来対応      | 将来対応 |
| phase-1/scope-definition   | 仮想スクロールは将来対応 | 将来対応 |

### 5. コードベース内のTODO/FIXME

検出結果（history関連ファイル）:

| ファイル          | 行  | 内容                                                   |
| ----------------- | --- | ------------------------------------------------------ |
| HistoryService.ts | 22  | `TODO: Integrate with actual database from CONV-05-02` |
| HistoryService.ts | 32  | `TODO: Implement actual database query`                |
| HistoryService.ts | 48  | `TODO: Implement actual database query`                |
| HistoryService.ts | 74  | `TODO: Implement actual database query`                |
| HistoryService.ts | 93  | `TODO: Implement actual restoration logic`             |

---

## 検出結果サマリー

| カテゴリ           | 件数  | 優先度 | 対応方針             |
| ------------------ | ----- | ------ | -------------------- |
| HistoryService統合 | 5     | 高     | CONV-05-02完了後対応 |
| DOM警告修正        | 1     | 低     | 別タスク             |
| E2Eテスト          | 1     | 低     | 将来対応             |
| 仮想スクロール     | 1     | 低     | 将来対応             |
| インフラ問題       | 1     | 中     | 別途インフラ改善     |
| **合計**           | **9** |        |                      |

---

## 未タスク詳細

### 1. HistoryService データベース統合（優先度: 高）

**現状**: HistoryServiceはスタブ実装で、空のデータを返す

**依存関係**: CONV-05-02（履歴取得サービス）

**必要な作業**:

1. CONV-05-02で実装されたHistoryServiceをインポート
2. スタブ実装を実際のDB接続に置き換え
3. 手動テストのDEFERRED項目を検証

**影響範囲**:

- `apps/desktop/src/main/services/HistoryService.ts`
- `apps/desktop/src/main/ipc/index.ts`（依存性注入）

### 2. VersionHistory DOM警告修正（優先度: 低）

**現状**: `<button>` が `<button>` の子要素になっている

**場所**: `apps/desktop/src/renderer/components/history/VersionHistory.tsx`

**必要な作業**:

- VersionHistoryItemコンポーネントの構造を見直し
- 復元ボタンをbutton外に移動、または別のアプローチ

**注意**: CONV-05-03で実装されたコンポーネントのため、本タスクのスコープ外

### 3. E2Eテスト（優先度: 低）

**現状**: ユニットテスト/統合テストのみ実装

**必要な作業**:

- Playwrightを使用したE2Eテスト作成
- 実際のElectronアプリでの動作確認

**注意**: Phase 5でE2Eテスト不要の合意があるため、将来対応

### 4. 仮想スクロール最適化（優先度: 低）

**現状**: 通常のリスト表示

**必要な作業**:

- 大量の履歴項目がある場合のパフォーマンス最適化
- react-virtualなどのライブラリ導入検討

**注意**: Phase 1でスコープ外として定義済み

---

## 未タスク指示書作成

### 作成対象

優先度「高」の未タスクについて指示書を作成:

| タスク             | 指示書パス                                                                 | 作成     |
| ------------------ | -------------------------------------------------------------------------- | -------- |
| HistoryService統合 | `docs/30-workflows/unassigned-task/task-history-service-db-integration.md` | **完了** |
| DOM警告修正        | 依存: CONV-05-03（既存タスクに追加対応として記録）                         | 不要     |

### 作成済み指示書

#### task-history-service-db-integration.md

- **タスクID**: history-service-db-integration
- **タスク名**: HistoryService データベース統合
- **優先度**: 高
- **依存タスク**: CONV-05-02（履歴取得サービス）
- **Phase構成**: 5フェーズ（要件確認→設計→実装→テスト→検証）
- **作成日**: 2026-01-11

**指示書概要**:

- Why: HistoryServiceはスタブ実装で実データを返さない
- What: CONV-05-02と統合し実DB接続を実現
- How: 5フェーズで段階的に実装・検証

---

## 結論

未タスク検出完了:

- **検出件数**: 9件
- **優先度高**: 1件（HistoryService統合）
  - 指示書作成: `docs/30-workflows/unassigned-task/task-history-service-db-integration.md`
- **優先度中**: 1件（インフラ問題 - 別途対応）
- **優先度低**: 7件（将来対応/別タスク）

未タスク指示書: **1件作成済み**

| 指示書             | パス                                                                       | ステータス |
| ------------------ | -------------------------------------------------------------------------- | ---------- |
| HistoryService統合 | `docs/30-workflows/unassigned-task/task-history-service-db-integration.md` | 作成済み   |

**Phase 12 タスク3（未タスク検出）: 完了**
