# スコープ定義: Permission要求履歴トラッキングUI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | task-imp-permission-history-001 |
| Phase    | 1                               |
| 作成日   | 2026-01-31                      |

## 実装範囲

### 新規作成ファイル

| ファイル                                                                                                     | 概要                         |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `apps/desktop/src/renderer/components/skill/permissionHistory.ts`                                            | データモデル・ユーティリティ |
| `apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts`                                           | Zustand Store Slice          |
| `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`                | メインUIパネル               |
| `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx`               | フィルタUI                   |
| `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryItem.tsx`                 | 個別エントリ表示             |
| `apps/desktop/src/renderer/components/skill/__tests__/permissionHistory.test.ts`                             | データモデルテスト           |
| `apps/desktop/src/renderer/store/slices/__tests__/permissionHistorySlice.test.ts`                            | Storeテスト                  |
| `apps/desktop/src/renderer/components/settings/PermissionSettings/__tests__/PermissionHistoryPanel.test.tsx` | コンポーネントテスト         |

### 変更ファイル

| ファイル                                                                     | 変更内容                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/renderer/store/index.ts`                                   | permissionHistorySliceの追加                     |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`                       | respondToSkillPermission内で履歴記録呼び出し追加 |
| `apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx` | PermissionHistoryPanelの統合                     |

### 新規依存パッケージ

| パッケージ                | 用途           |
| ------------------------- | -------------- |
| `@tanstack/react-virtual` | 仮想スクロール |

## 除外範囲

| 項目                             | 理由                                              |
| -------------------------------- | ------------------------------------------------- |
| 履歴のエクスポート/インポート    | 別タスク（task-imp-permission-export-import-001） |
| 履歴に基づく自動推奨ロジック     | スコープ外                                        |
| 外部ログサービスとの連携         | スコープ外                                        |
| Main Processでのログファイル出力 | スコープ外                                        |
| 期間別フィルタリング             | スコープ外                                        |
| localStorage暗号化               | 機密データを保存しないため不要                    |

## 影響範囲

| レイヤー     | 影響                                             |
| ------------ | ------------------------------------------------ |
| Renderer     | PermissionSettings UI拡張、新規Zustand Slice追加 |
| Main Process | 変更なし                                         |
| IPC          | 変更なし（既存のPermissionDialog応答IPCを利用）  |
| Shared Types | 変更なし（型定義はRenderer側に配置）             |
