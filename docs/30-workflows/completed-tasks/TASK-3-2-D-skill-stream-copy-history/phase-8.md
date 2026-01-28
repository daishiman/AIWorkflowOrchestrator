# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 8                                    |
| 機能名 | TASK-3-2-D-skill-stream-copy-history |
| 作成日 | 2026-01-28                           |

## 目的

動作を変えずにコード品質を改善する。テストが継続してPASSすることを確認しながらリファクタリングを行う。

## 実行タスク

- コードスメル検出: 問題のあるコードパターンの特定
- リファクタリング: コード構造の改善（重複排除、命名改善、構造整理）
- SOLID原則適用: 設計原則に基づくコード改善

## 参照資料

| 資料名             | パス                                                                  | 説明          |
| ------------------ | --------------------------------------------------------------------- | ------------- |
| CopyHistoryContext | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`           | Phase 5成果物 |
| CopyHistoryPanel   | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` | Phase 5成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`                                  | Phase 7成果物 |

## 実行手順

### ステップ1: コードスメル検出

以下の観点でコードを分析する:

| コードスメル     | 検出対象                       |
| ---------------- | ------------------------------ |
| 重複コード       | 同様のロジックが複数箇所に存在 |
| 長すぎる関数     | 1関数が50行を超える            |
| 複雑な条件分岐   | ネストが3段以上                |
| マジックナンバー | 50, 100 などの定数が直書き     |
| 命名の不明確さ   | 役割が分かりにくい変数/関数名  |

### ステップ2: リファクタリング実施

#### 定数抽出

```typescript
// 改善前
if (history.length >= 50) { ... }
const preview = content.slice(0, 100);

// 改善後
const MAX_HISTORY_COUNT = 50;
const PREVIEW_MAX_LENGTH = 100;

if (history.length >= MAX_HISTORY_COUNT) { ... }
const preview = content.slice(0, PREVIEW_MAX_LENGTH);
```

#### ユーティリティ関数抽出

| 抽出候補関数           | 責務               |
| ---------------------- | ------------------ |
| `truncateText`         | テキスト省略処理   |
| `generateEntryId`      | 履歴エントリID生成 |
| `mergeHistoryContents` | 複数履歴内容の結合 |

#### コンポーネント分割

| 分割候補           | 分割後                                     |
| ------------------ | ------------------------------------------ |
| CopyHistoryPanel   | CopyHistoryItem, CopyHistoryActions に分割 |
| 大きなレンダー関数 | 個別のサブコンポーネントに分割             |

### ステップ3: テスト継続確認

リファクタリング後に全テストがPASSすることを確認:

```bash
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

| 確認項目       | 結果       |
| -------------- | ---------- |
| 全テストPASS   | {{RESULT}} |
| カバレッジ維持 | {{RESULT}} |
| 型エラーなし   | {{RESULT}} |
| Lintエラーなし | {{RESULT}} |

## リファクタリングチェックリスト

- [ ] マジックナンバーを定数に抽出
- [ ] 重複コードを共通関数に抽出
- [ ] 長い関数を分割
- [ ] 命名を改善
- [ ] 不要なコメントを削除
- [ ] インポートを整理
- [ ] 型定義を整理

## 成果物

| 成果物               | パス                                                 | 説明             |
| -------------------- | ---------------------------------------------------- | ---------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-report.md`              | 改善内容レポート |
| 抽出した定数         | `apps/desktop/src/renderer/constants/copyHistory.ts` | 定数定義ファイル |

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] マジックナンバーが定数化されている
- [ ] 関数の責務が明確になっている
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. コードスメル検出の実施
2. 定数抽出の実施
3. ユーティリティ関数抽出の実施
4. コンポーネント分割の実施
5. テスト継続確認
6. 成果物の作成・配置
7. 完了条件の検証

## 次のPhase

Phase 9: 品質保証
