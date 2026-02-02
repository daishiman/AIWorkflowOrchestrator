# TASK-8B スコープ定義

## テスト範囲

### 対象（In Scope）

| カテゴリ         | 内容                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| コンポーネント   | SkillSelector, SkillImportDialog, PermissionDialog, SkillStreamingView |
| テスト種別       | コンポーネントテスト（@testing-library/react）                         |
| テストケース     | 55ケース（15 + 12 + 12 + 16）                                          |
| テストカテゴリ   | レンダリング、インタラクション、状態管理、a11y、キーボード             |
| アーキテクチャ層 | Renderer Process（UI層）のみ                                           |
| Store接続        | vi.mockによるモック経由                                                |
| テスト環境       | Vitest + happy-dom + @testing-library/react                            |

### 対象外（Out of Scope）

| カテゴリ           | 理由                                           |
| ------------------ | ---------------------------------------------- |
| Main Process       | テスト対象コンポーネントがRenderer Processのみ |
| IPC通信            | Storeレベルでモックするため直接テスト不要      |
| Preload            | テスト対象コンポーネントが直接使用しない       |
| ローカルストレージ | テスト対象コンポーネントが直接使用しない       |
| E2Eテスト          | TASK-8C管轄                                    |
| ユニットテスト     | TASK-8A管轄                                    |
| スナップショット   | 本タスクのスコープ外（将来タスク候補）         |
| Visual Regression  | 本タスクのスコープ外（将来タスク候補）         |

### 追加対象（関連ファイルのテスト）

| ファイル                  | テスト種別     | 理由                                     |
| ------------------------- | -------------- | ---------------------------------------- |
| permissionDescriptions.ts | ユニットテスト | PermissionDialogの表示に直接関与         |
| toolMetadata.ts           | ユニットテスト | PermissionDialogのリスクレベル表示に関与 |
| permissionHistory.ts      | ユニットテスト | Permission機能の一部                     |

## カバレッジ基準

| 指標               | 最低基準 | 推奨基準 |
| ------------------ | -------- | -------- |
| Line Coverage      | 80%      | 90%      |
| Branch Coverage    | 60%      | 70%      |
| Function Coverage  | 80%      | 90%      |
| Statement Coverage | 80%      | 90%      |

## 現状（既存テスト）

既存テストファイルが9ファイル、280テストケース存在し、全テスト通過済み:

| テストファイル                     | テスト数 | 状態 |
| ---------------------------------- | -------- | ---- |
| SkillSelector.test.tsx             | 28       | PASS |
| SkillImportDialog.test.tsx         | 56       | PASS |
| PermissionDialog.test.tsx          | 70+      | PASS |
| PermissionDialog.metadata.test.tsx | 15       | PASS |
| PermissionDialog.readable.test.tsx | 23       | PASS |
| SkillStreamingView.test.tsx        | 38       | PASS |
| permissionDescriptions.test.ts     | 28       | PASS |
| toolMetadata.test.ts               | 32       | PASS |
| permissionHistory.test.ts          | 22       | PASS |

## 前提条件

- TASK-7A（SkillSelector）、TASK-7B（SkillImportDialog）、TASK-7C（PermissionDialog）、TASK-7D（ChatPanel統合）が完了していること
- 4コンポーネントの実装ファイルが存在すること
- `@repo/shared`の型定義が利用可能であること
