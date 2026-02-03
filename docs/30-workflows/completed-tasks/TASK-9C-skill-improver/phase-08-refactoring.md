# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 8                                |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

動作を変えずにコード品質を改善する。

## 実行タスク

- リファクタリング: コード構造の改善（重複排除、命名改善、構造整理）
- コードスメル検出: 問題のあるコードパターンの特定と修正
- SOLID原則適用: 設計原則に基づくコード改善

## リファクタリング観点

### 1. 重複排除

| 対象               | 確認項目                                |
| ------------------ | --------------------------------------- |
| collectFiles       | SkillAnalyzer/SkillImproverで共通化可能 |
| SDK呼び出し        | query()呼び出しパターンの共通化         |
| エラーハンドリング | try-catchパターンの統一                 |

### 2. 命名改善

| 現在の名前         | 改善案 | 理由 |
| ------------------ | ------ | ---- |
| (レビュー時に記入) |        |      |

### 3. SOLID原則チェック

| 原則 | 確認項目                 | 対応                                             |
| ---- | ------------------------ | ------------------------------------------------ |
| SRP  | 各クラスが単一責務か     | SkillAnalyzer: 分析のみ、SkillImprover: 改善のみ |
| OCP  | 拡張に対して開いているか | 改善タイプの追加が容易か                         |
| LSP  | 置換可能か               | インターフェース抽出の検討                       |
| ISP  | インターフェースが最小か | 不要なメソッドがないか                           |
| DIP  | 依存関係が適切か         | SDK呼び出しの抽象化検討                          |

### 4. 共通ユーティリティ抽出

```typescript
// apps/desktop/src/main/services/skill/utils/fileUtils.ts

/**
 * ディレクトリを再帰的に走査してファイル内容を収集
 */
export async function collectFiles(dir: string): Promise<Map<string, string>> {
  // SkillAnalyzer/SkillImproverで共通利用
}

/**
 * バックアップディレクトリを作成
 */
export async function createBackupDir(skillDir: string): Promise<string> {
  // タイムスタンプ付きバックアップ
}

/**
 * バックアップから復元
 */
export async function restoreFromBackup(
  backupDir: string,
  targetDir: string,
): Promise<void> {
  // 安全な復元処理
}
```

```typescript
// apps/desktop/src/main/services/skill/utils/sdkUtils.ts

/**
 * Claude Agent SDK query() の共通ラッパー
 */
export async function queryWithRetry(
  params: QueryParams,
  options?: { maxRetries?: number; timeout?: number },
): Promise<QueryResult> {
  // リトライ、タイムアウト、エラーハンドリングを共通化
}

/**
 * JSON応答のパース（エラーハンドリング付き）
 */
export function parseJsonResponse<T>(content: string): T {
  // 不正なJSON時のエラーハンドリング
}
```

## 実行手順

### 1. コードレビュー

```bash
# Lintチェック
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### 2. リファクタリング実行

1. ユーティリティ関数の抽出
2. 重複コードの共通化
3. 命名の改善
4. コメント・ドキュメントの整備

### 3. テスト再実行

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test -- --grep "integration"
```

## リファクタリングチェックリスト

- [ ] collectFilesが共通ユーティリティに抽出されている
- [ ] SDK呼び出しパターンが統一されている
- [ ] エラーハンドリングが一貫している
- [ ] 不要なコード/コメントが削除されている
- [ ] 命名が適切で一貫している
- [ ] SOLID原則に違反していない

## 成果物

| 成果物               | パス                                          | 説明                   |
| -------------------- | --------------------------------------------- | ---------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`          | 変更内容の記録         |
| 共通ユーティリティ   | `apps/desktop/src/main/services/skill/utils/` | 抽出したユーティリティ |

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 共通ユーティリティが抽出されている
- [ ] Lint/型チェックがパス
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. コードレビュー（Lint/型チェック）
2. 重複排除（collectFiles共通化等）
3. SDK呼び出しパターン統一
4. 共通ユーティリティ抽出（fileUtils/sdkUtils）
5. SOLID原則チェック
6. テスト再実行・継続成功確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] リファクタリング後もテストが成功していることを確認
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 8
```

---

## 次のPhase

Phase 9: 品質保証
