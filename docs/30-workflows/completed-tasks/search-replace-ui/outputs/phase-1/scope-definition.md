# Phase 1: スコープ定義

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 1                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## スコープ概要

本タスクでは、既存の検索・置換UI実装を基盤として、以下の残作業を完了させる。

## 実装範囲（In Scope）

### 1. E2Eテスト作成

| 項目           | 詳細                                    |
| -------------- | --------------------------------------- |
| テストファイル | `apps/desktop/tests/e2e/search.spec.ts` |
| フレームワーク | Playwright                              |
| 対象シナリオ   | 8シナリオ（AC-4-2参照）                 |

### 2. グローバルショートカット統合確認

| 項目                       | 詳細                         |
| -------------------------- | ---------------------------- |
| Cmd+F / Ctrl+F             | ファイル内検索パネル開く     |
| Cmd+T / Ctrl+T             | 置換モードで開く             |
| Cmd+Shift+F / Ctrl+Shift+F | ワークスペース検索パネル開く |
| 登録場所                   | EditorView / AppLayout       |

### 3. IPC統合確認（WorkspaceSearch）

| 項目               | 詳細                  |
| ------------------ | --------------------- |
| チャンネル         | `search:workspace`    |
| 対象コンポーネント | WorkspaceSearchPanel  |
| Main側実装         | WorkspaceSearchEngine |

## 実装範囲外（Out of Scope）

| 項目                        | 理由                             |
| --------------------------- | -------------------------------- |
| SearchPanel UI変更          | 既に実装済み、変更不要           |
| WorkspaceSearchPanel UI変更 | 既に実装済み、変更不要           |
| useSearchStore変更          | 既に実装済み、変更不要           |
| 検索アルゴリズム改善        | 現行で十分、将来タスクとして検討 |
| 検索履歴機能                | 本タスクのスコープ外             |
| 検索結果のエクスポート      | 本タスクのスコープ外             |

## 既存実装の活用

### 活用するコンポーネント

```
apps/desktop/src/features/search/
├── components/
│   ├── SearchPanel.tsx           ← 活用（変更なし）
│   ├── WorkspaceSearchPanel.tsx  ← 活用（IPC統合確認のみ）
│   └── SearchOptionButtons.tsx   ← 活用（変更なし）
├── stores/
│   └── useSearchStore.ts         ← 活用（変更なし）
├── hooks/
│   └── useSearchKeyboardShortcuts.ts ← 活用（統合確認）
├── adapters/
│   └── TextAreaEditorAdapter.ts  ← 活用（変更なし）
├── utils/
│   ├── executeSearch.ts          ← 活用（変更なし）
│   └── highlightUtils.tsx        ← 活用（変更なし）
└── types.ts                      ← 活用（変更なし）
```

### 活用するテスト

```
apps/desktop/src/features/search/__tests__/
├── SearchPanel.test.tsx              ← 活用（46テスト）
├── WorkspaceSearchPanel.test.tsx     ← 活用（48テスト）
├── useSearchStore.test.ts            ← 活用（21テスト）
├── useSearchKeyboardShortcuts.test.ts← 活用（13テスト）
├── TextAreaEditorAdapter.test.ts     ← 活用（26テスト）
└── integration/
    ├── Accessibility.test.tsx        ← 活用（19テスト）
    ├── EdgeCases.test.tsx            ← 活用（15テスト）
    ├── EditorViewIntegration.test.tsx← 活用（16テスト）
    ├── ErrorHandling.test.tsx        ← 活用（10テスト）
    ├── KeyboardShortcuts.test.tsx    ← 活用（15テスト）
    ├── Performance.test.tsx          ← 活用（10テスト）
    ├── SearchPanelAdapter.test.tsx   ← 活用（17テスト）
    └── WorkspaceSearchIntegration.test.tsx ← 活用（19テスト）
```

## 新規作成ファイル

| ファイル                                | 種別      | 説明                 |
| --------------------------------------- | --------- | -------------------- |
| `apps/desktop/tests/e2e/search.spec.ts` | E2Eテスト | Playwright E2Eテスト |

## 品質基準

| 項目                     | 基準             |
| ------------------------ | ---------------- |
| ユニットテストカバレッジ | Line 80%以上     |
| E2Eテストカバレッジ      | 主要シナリオ100% |
| TypeScript型チェック     | エラー0件        |
| ESLint                   | エラー0件        |
| WCAG 2.1 AA              | 準拠             |

## リスクと対策

| リスク                       | 影響度 | 対策                             |
| ---------------------------- | ------ | -------------------------------- |
| E2E環境セットアップ失敗      | 高     | 既存E2E設定を参考に構築          |
| IPC統合の既存実装との不整合  | 中     | 既存IPCハンドラーを確認して統合  |
| グローバルショートカット競合 | 中     | OS標準ショートカットとの競合確認 |

## マイルストーン

| Phase | 内容             | 成果物                             |
| ----- | ---------------- | ---------------------------------- |
| 0     | 準備作業         | 準備完了レポート                   |
| 1     | 要件定義         | 要件定義書、受け入れ基準、スコープ |
| 2     | 設計             | E2E設計、IPC統合設計               |
| 3     | 設計レビュー     | レビューチェックリスト             |
| 4     | テスト作成       | E2Eテスト（Red）                   |
| 5     | 実装             | E2E統合、ショートカット統合        |
| 6     | テスト拡充       | エッジケーステスト                 |
| 7     | カバレッジ確認   | カバレッジレポート                 |
| 8     | リファクタリング | コード品質改善                     |
| 9     | 品質保証         | Lint/TypeCheck/Security確認        |
| 10    | 最終レビュー     | 最終チェックリスト                 |
| 11    | 手動テスト       | 手動テスト結果                     |
| 12    | ドキュメント     | 技術/ユーザードキュメント          |
