# 要件定義書: Permission要求履歴トラッキングUI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | task-imp-permission-history-001 |
| Phase    | 1                               |
| 作成日   | 2026-01-31                      |

## 既存実装分析

### PermissionStore（Main Process）

- `apps/desktop/src/main/services/skill/PermissionStore.ts`
- electron-storeベースの永続ストレージ（許可済みツール管理）
- メソッド: `isToolAllowed`, `allowTool`, `revokeTool`, `getAllowedTools`, `getAllowedToolEntries`, `clearAll`
- 型: `AllowedToolEntry { toolName: string; allowedAt: string }`

### PermissionDialog（Renderer）

- `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`
- 3ボタンパターン: 拒否 / 1回許可 / 許可（記憶チェックボックス付き）
- `respondToSkillPermission(approved: boolean, remember?: boolean)` を呼び出し
- ツールアイコンのemoji表示、折りたたみ可能な技術詳細、ARIA対応

### PermissionSettings（Renderer）

- `apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx`
- 許可済みツール一覧表示、個別取り消し、一括クリア
- IPC経由で `window.permissionAPI` を使用

### skillSlice（Renderer Store）

- `apps/desktop/src/renderer/store/slices/skillSlice.ts`
- `pendingPermission: SkillPermissionRequest | null` を管理
- `respondToSkillPermission(approved, remember)`: IPC送信後 `pendingPermission = null`

### permissionDescriptions（Renderer）

- `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`
- 12ツール対応の人間可読説明文生成: `getDescription(toolName, args): string`

### AppStore構成

- `apps/desktop/src/renderer/store/index.ts`
- 15個のSliceをマージするZustand Store
- persist middleware: `knowledge-studio-store` キーでlocalStorage永続化
- `partialize`で一部フィールドのみ永続化

## 機能要件（FR）

| FR ID | 要件                                                                                              | 優先度 |
| ----- | ------------------------------------------------------------------------------------------------- | ------ |
| FR-1  | 権限許可/拒否/1回許可の判断時に自動的に履歴エントリを記録する                                     | 必須   |
| FR-2  | PermissionSettingsに「権限履歴」セクションを追加し、履歴を時系列で表示する                        | 必須   |
| FR-3  | 各エントリにタイムスタンプ・ツール名・引数要約・判断結果（approved/denied/approved_once）を含める | 必須   |
| FR-4  | ツール名でフィルタリングできる（ドロップダウン選択）                                              | 必須   |
| FR-5  | 判断結果でフィルタリングできる（approved/denied/approved_once）                                   | 必須   |
| FR-6  | 履歴のクリア機能を提供する（確認ダイアログ付き）                                                  | 必須   |
| FR-7  | 履歴件数の上限を1000件とし、超過時は古いエントリを自動削除する                                    | 必須   |

## 非機能要件（NFR）

| NFR ID | 要件                                                                      | 優先度 |
| ------ | ------------------------------------------------------------------------- | ------ |
| NFR-1  | 1000件以上の履歴でもスムーズに表示される（仮想スクロール使用）            | 必須   |
| NFR-2  | 履歴データはRenderer Process内のZustand storeで管理しlocalStorageに永続化 | 必須   |
| NFR-3  | TypeScript strict modeでエラーなし                                        | 必須   |
| NFR-4  | テストカバレッジ Lines 95%以上                                            | 必須   |
| NFR-5  | 引数スナップショットはsafeString()で安全化した要約テキストのみ保存        | 必須   |
| NFR-6  | アクセシビリティ: ARIA属性、キーボード操作対応                            | 推奨   |

## アーキテクチャ層別要件

| 層                         | 要件                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| フロントエンド（Renderer） | PermissionHistoryPanel UIコンポーネント、フィルタリングUI、仮想スクロール                  |
| バックエンド（Main）       | 不要（履歴はRenderer Processで管理）                                                       |
| IPC通信                    | 不要（履歴はRenderer Process内で完結、PermissionDialog応答は既存IPC）                      |
| セキュリティ               | 引数のsafeString()化、機密情報の非保存、localStorage暗号化は不要（機密データ非保持のため） |
| データ                     | localStorage永続化、Zustand persist middleware、最大1000件制限                             |

## 接続要件（統合テスト連携）

| 接続要件カテゴリ | 記載内容                                                                                |
| ---------------- | --------------------------------------------------------------------------------------- |
| IPC通信          | PermissionDialog応答（SKILL_PERMISSION_RESPONSE）→ 履歴記録（Renderer内Zustand）の連携  |
| データフロー     | PermissionDialog応答 → skillSlice.respondToSkillPermission → 履歴Store記録 → UI表示更新 |
| 状態永続化       | Zustand persist middleware → localStorage → 起動時復元                                  |
