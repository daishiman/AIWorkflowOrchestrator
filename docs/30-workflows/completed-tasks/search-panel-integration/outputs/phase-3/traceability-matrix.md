# Phase 3: 要件-設計トレーサビリティマトリクス

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| 作成日     | 2026-01-22                |
| フェーズ   | Phase 3                   |
| 成果物種別 | 要件-設計トレーサビリティ |
| ステータス | 完了                      |
| 関連Issue  | #361                      |

---

## 1. 機能要件トレーサビリティ

### 1.1 ファイル内検索機能

| 要件ID | 要件                        | 設計での実現方法                  | 実装箇所                                           | 判定 |
| ------ | --------------------------- | --------------------------------- | -------------------------------------------------- | ---- |
| FR-001 | Cmd+F で SearchPanel を開く | useSearchKeyboardShortcuts        | EditorView/hooks/useSearchKeyboardShortcuts.ts     | ✓    |
| FR-002 | Escape で閉じる             | useSearchKeyboardShortcuts        | EditorView/hooks/useSearchKeyboardShortcuts.ts     | ✓    |
| FR-003 | 閉じるボタンで閉じる        | SearchPanel.onClose               | features/search/components/SearchPanel.tsx         | ✓    |
| FR-004 | リアルタイム検索            | SearchPanel 内部実装              | features/search/components/SearchPanel.tsx         | ✓    |
| FR-005 | 大文字小文字オプション      | SearchOptionButtons               | features/search/components/SearchOptionButtons.tsx | ✓    |
| FR-006 | 単語単位オプション          | SearchOptionButtons               | features/search/components/SearchOptionButtons.tsx | ✓    |
| FR-007 | 正規表現オプション          | SearchOptionButtons               | features/search/components/SearchOptionButtons.tsx | ✓    |
| FR-008 | 結果カウント表示            | SearchPanel 内部実装              | features/search/components/SearchPanel.tsx         | ✓    |
| FR-009 | 次へ移動 (Enter)            | SearchPanel onKeyDown             | features/search/components/SearchPanel.tsx         | ✓    |
| FR-010 | 前へ移動 (Shift+Enter)      | SearchPanel onKeyDown             | features/search/components/SearchPanel.tsx         | ✓    |
| FR-011 | F3 で次へ                   | SearchPanel onKeyDown             | features/search/components/SearchPanel.tsx         | ✓    |
| FR-012 | Shift+F3 で前へ             | SearchPanel onKeyDown             | features/search/components/SearchPanel.tsx         | ✓    |
| FR-013 | 循環ナビゲーション          | SearchPanel goToNext/goToPrevious | features/search/components/SearchPanel.tsx         | ✓    |
| FR-014 | 置換モード表示切替          | showReplace 状態                  | EditorView + SearchPanel                           | ✓    |
| FR-015 | Cmd+T で置換モード          | useSearchKeyboardShortcuts        | EditorView/hooks/useSearchKeyboardShortcuts.ts     | ✓    |
| FR-016 | 現在マッチを置換            | EditorInstance.replaceText        | features/search/adapters/TextAreaEditorAdapter.ts  | ✓    |
| FR-017 | 全マッチ置換                | EditorInstance.replaceAllText     | features/search/adapters/TextAreaEditorAdapter.ts  | ✓    |
| FR-018 | Alt+Enter で全置換          | SearchPanel onKeyDown             | features/search/components/SearchPanel.tsx         | ✓    |

### 1.2 ワークスペース検索機能

| 要件ID | 要件                         | 設計での実現方法               | 実装箇所                                            | 判定 |
| ------ | ---------------------------- | ------------------------------ | --------------------------------------------------- | ---- |
| FR-019 | Cmd+Shift+F で開く           | useSearchKeyboardShortcuts     | EditorView/hooks/useSearchKeyboardShortcuts.ts      | ✓    |
| FR-020 | Escape で閉じる              | useSearchKeyboardShortcuts     | EditorView/hooks/useSearchKeyboardShortcuts.ts      | ✓    |
| FR-021 | ワークスペース全体検索       | useWorkspaceSearch + IPC       | EditorView/hooks/useWorkspaceSearch.ts              | ✓    |
| FR-022 | Include フィルター           | WorkspaceSearchPanel 内部      | features/search/components/WorkspaceSearchPanel.tsx | ✓    |
| FR-023 | Exclude フィルター           | WorkspaceSearchPanel 内部      | features/search/components/WorkspaceSearchPanel.tsx | ✓    |
| FR-024 | 検索オプション               | SearchOptionButtons            | features/search/components/SearchOptionButtons.tsx  | ✓    |
| FR-025 | 結果統計表示                 | WorkspaceSearchPanel 内部      | features/search/components/WorkspaceSearchPanel.tsx | ✓    |
| FR-026 | 折りたたみ表示               | WorkspaceSearchPanel 内部      | features/search/components/WorkspaceSearchPanel.tsx | ✓    |
| FR-027 | マッチクリックでファイル開く | onFileOpen コールバック        | EditorView + WorkspaceSearchPanel                   | ✓    |
| FR-028 | キーボードナビゲーション     | WorkspaceSearchPanel onKeyDown | features/search/components/WorkspaceSearchPanel.tsx | ✓    |
| FR-029 | Enter で開く/展開            | WorkspaceSearchPanel onKeyDown | features/search/components/WorkspaceSearchPanel.tsx | ✓    |
| FR-030 | 全置換                       | WorkspaceSearchPanel + IPC     | features/search/components/WorkspaceSearchPanel.tsx | ✓    |
| FR-031 | 置換確認ダイアログ           | WorkspaceSearchPanel 内部      | features/search/components/WorkspaceSearchPanel.tsx | ✓    |

### 1.3 検索モード切替

| 要件ID | 要件                   | 設計での実現方法           | 実装箇所                                       | 判定 |
| ------ | ---------------------- | -------------------------- | ---------------------------------------------- | ---- |
| FR-032 | file モードへ切替      | useSearchKeyboardShortcuts | EditorView/hooks/useSearchKeyboardShortcuts.ts | ✓    |
| FR-033 | workspace モードへ切替 | useSearchKeyboardShortcuts | EditorView/hooks/useSearchKeyboardShortcuts.ts | ✓    |
| FR-034 | filename モードへ切替  | useSearchKeyboardShortcuts | EditorView/hooks/useSearchKeyboardShortcuts.ts | ✓    |

---

## 2. 非機能要件トレーサビリティ

### 2.1 パフォーマンス要件

| 要件ID  | 要件                           | 設計での対応                           | 実装箇所                     | 判定 |
| ------- | ------------------------------ | -------------------------------------- | ---------------------------- | ---- |
| NFR-001 | ファイル内検索デバウンス 150ms | constants.FILE_SEARCH_DEBOUNCE_MS      | features/search/constants.ts | ✓    |
| NFR-002 | ワークスペースデバウンス 300ms | constants.WORKSPACE_SEARCH_DEBOUNCE_MS | features/search/constants.ts | ✓    |
| NFR-005 | 大量結果の仮想化               | 最大表示件数制限                       | WorkspaceSearchPanel         | ✓    |
| NFR-009 | 検索キャンセル                 | AbortController                        | WorkspaceSearchPanel         | ✓    |

### 2.2 アクセシビリティ要件

| 要件ID  | 要件               | 設計での対応                    | 実装箇所                         | 判定 |
| ------- | ------------------ | ------------------------------- | -------------------------------- | ---- |
| NFR-011 | キーボード操作対応 | onKeyDown ハンドラー            | SearchPanel/WorkspaceSearchPanel | ✓    |
| NFR-014 | role 属性設定      | role="dialog", role="searchbox" | SearchPanel/WorkspaceSearchPanel | ✓    |
| NFR-015 | aria-label 設定    | 全ボタン・入力に設定            | SearchOptionButtons 他           | ✓    |
| NFR-016 | aria-pressed 設定  | トグルボタン                    | SearchOptionButtons              | ✓    |
| NFR-018 | aria-live 設定     | 結果カウント表示                | SearchPanel/WorkspaceSearchPanel | ✓    |

### 2.3 テスト要件

| 要件ID  | 要件                 | 設計での対応   | 実装箇所               | 判定       |
| ------- | -------------------- | -------------- | ---------------------- | ---------- |
| NFR-022 | 既存テスト 94 件合格 | 統合テスト追加 | **tests**/integration/ | ✓          |
| NFR-024 | Line Coverage 80%+   | テスト拡充     | 全テストファイル       | △ (71.23%) |

### 2.4 コード品質要件

| 要件ID  | 要件                   | 設計での対応                    | 実装箇所              | 判定 |
| ------- | ---------------------- | ------------------------------- | --------------------- | ---- |
| NFR-029 | TypeScript エラー 0 件 | 厳密な型定義                    | types.ts              | ✓    |
| NFR-032 | ESLint エラー 0 件     | ESLint 設定遵守                 | 全ソースファイル      | ✓    |
| NFR-035 | 依存性逆転原則         | EditorInstance インターフェース | types.ts + アダプター | ✓    |

---

## 3. 統合要件トレーサビリティ

| 統合要件                        | 設計での実現方法          | 実装箇所                                       | 判定 |
| ------------------------------- | ------------------------- | ---------------------------------------------- | ---- |
| EditorInstance インターフェース | types.ts で定義           | features/search/types.ts                       | ✓    |
| useSearchStore 連携             | Zustand ストア            | features/search/stores/useSearchStore.ts       | ✓    |
| useEditorInstance 統合          | EditorView フック         | EditorView/hooks/useEditorInstance.ts          | ✓    |
| useWorkspaceSearch 統合         | EditorView フック         | EditorView/hooks/useWorkspaceSearch.ts         | ✓    |
| useSearchKeyboardShortcuts 統合 | EditorView フック         | EditorView/hooks/useSearchKeyboardShortcuts.ts | ✓    |
| IPC 通信                        | window.electronAPI.search | メインプロセス + フック                        | ✓    |

---

## 4. トレーサビリティサマリー

| カテゴリ   | 要件数 | 設計反映済み | 未反映 | カバー率  |
| ---------- | ------ | ------------ | ------ | --------- |
| 機能要件   | 34     | 34           | 0      | 100%      |
| 非機能要件 | 15     | 14           | 1      | 93.3%     |
| 統合要件   | 6      | 6            | 0      | 100%      |
| **合計**   | **55** | **54**       | **1**  | **98.2%** |

### 未達成項目

| 要件ID  | 要件               | 現状   | 対策                 |
| ------- | ------------------ | ------ | -------------------- |
| NFR-024 | Line Coverage 80%+ | 71.23% | Phase 6 でテスト拡充 |

---

## 完了条件チェック

- [x] 全ての機能要件が設計に反映されている
- [x] 非機能要件の大部分（93.3%）が設計に反映されている
- [x] 統合要件が全て設計に反映されている
- [x] カバレッジ未達は Phase 6 で対応予定
