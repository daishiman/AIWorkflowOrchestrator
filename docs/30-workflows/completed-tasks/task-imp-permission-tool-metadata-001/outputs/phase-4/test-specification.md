# Phase 4: テスト仕様書

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | task-imp-permission-tool-metadata-001 |
| Issue  | #606                                  |
| 作成日 | 2026-01-31                            |

---

## テストケース一覧

### toolMetadata.test.ts

| #   | テストケース                                   | 優先度   | カバー対象        |
| --- | ---------------------------------------------- | -------- | ----------------- |
| 1   | getRiskLevel: Bash → 'High'                    | Critical | getRiskLevel      |
| 2   | getRiskLevel: Read → 'Low'                     | Critical | getRiskLevel      |
| 3   | getRiskLevel: Write → 'Medium'                 | High     | getRiskLevel      |
| 4   | getRiskLevel: Edit → 'Medium'                  | High     | getRiskLevel      |
| 5   | getRiskLevel: Glob → 'Low'                     | High     | getRiskLevel      |
| 6   | getRiskLevel: Grep → 'Low'                     | High     | getRiskLevel      |
| 7   | getRiskLevel: WebSearch → 'Low'                | High     | getRiskLevel      |
| 8   | getRiskLevel: Task → 'Medium'                  | High     | getRiskLevel      |
| 9   | getRiskLevel: NotebookEdit → 'Medium'          | High     | getRiskLevel      |
| 10  | getRiskLevel: WebFetch → 'Medium'              | High     | getRiskLevel      |
| 11  | getRiskLevel: Skill → 'Medium'                 | High     | getRiskLevel      |
| 12  | getRiskLevel: AskUser → 'Low'                  | High     | getRiskLevel      |
| 13  | getRiskLevel: 未定義ツール → 'Medium'          | Critical | デフォルト値      |
| 14  | getRiskLevel: 空文字列 → 'Medium'              | High     | エッジケース      |
| 15  | getSecurityImpact: 12ツール各テキスト正確性    | Critical | getSecurityImpact |
| 16  | getSecurityImpact: 各テキストが空でない        | High     | getSecurityImpact |
| 17  | getSecurityImpact: 各テキストが1行（改行なし） | Medium   | getSecurityImpact |
| 18  | getSecurityImpact: 未定義ツール → デフォルト   | Critical | デフォルト値      |
| 19  | getSecurityImpact: 空文字列 → デフォルト       | High     | エッジケース      |
| 20  | getToolMetadata: 各ツールのオブジェクト構造    | High     | getToolMetadata   |
| 21  | getToolMetadata: 未定義ツール → デフォルト     | Critical | デフォルト値      |
| 22  | getToolMetadata: Bash詳細                      | High     | getToolMetadata   |
| 23  | getToolMetadata: Read詳細                      | High     | getToolMetadata   |
| 24  | エッジケース: RiskLevel型妥当性                | Medium   | 型安全性          |
| 25  | エッジケース: ToolMetadata型妥当性             | Medium   | 型安全性          |
| 26  | エッジケース: 長いツール名                     | Low      | 境界値            |

### PermissionDialog.metadata.test.tsx

| #   | テストケース                       | 優先度   | カバー対象       |
| --- | ---------------------------------- | -------- | ---------------- |
| 1   | Bashツールで「High」バッジ表示     | Critical | リスクバッジ表示 |
| 2   | Readツールで「Low」バッジ表示      | Critical | リスクバッジ表示 |
| 3   | Writeツールで「Medium」バッジ表示  | High     | リスクバッジ表示 |
| 4   | 未定義ツールで「Medium」バッジ表示 | Critical | デフォルト表示   |
| 5   | Low: 緑色系クラス適用              | High     | 色分け           |
| 6   | Medium: 黄色系クラス適用           | High     | 色分け           |
| 7   | High: オレンジ色系クラス適用       | High     | 色分け           |
| 8   | Bash: セキュリティ影響テキスト表示 | Critical | テキスト表示     |
| 9   | Read: セキュリティ影響テキスト表示 | High     | テキスト表示     |
| 10  | 未定義: デフォルトテキスト表示     | High     | テキスト表示     |
| 11  | aria-label設定（High）             | Critical | アクセシビリティ |
| 12  | aria-label設定（Low）              | High     | アクセシビリティ |
| 13  | 回帰: 3ボタン表示                  | Critical | 既存機能         |
| 14  | 回帰: 人間可読説明文表示           | Critical | 既存機能         |
| 15  | 回帰: 詳細展開/折りたたみ          | High     | 既存機能         |
| 16  | 回帰: 拒否ボタン動作               | High     | 既存機能         |
| 17  | 回帰: 1回許可ボタン動作            | High     | 既存機能         |
| 18  | 回帰: 許可ボタン動作               | High     | 既存機能         |
| 19  | 回帰: チェックボックス表示         | Medium   | 既存機能         |

---

## テストカバレッジ目標

| ファイル        | Lines | Branch | Function |
| --------------- | ----- | ------ | -------- |
| toolMetadata.ts | 95%+  | 60%+   | 80%+     |

---

## テスト戦略

- **toolMetadata.test.ts**: 純関数のユニットテスト（モック不要）
- **PermissionDialog.metadata.test.tsx**: React Testing Libraryによるコンポーネントテスト（Storeモック使用）
- 既存テスト（PermissionDialog.test.tsx, PermissionDialog.readable.test.tsx）との干渉なし
