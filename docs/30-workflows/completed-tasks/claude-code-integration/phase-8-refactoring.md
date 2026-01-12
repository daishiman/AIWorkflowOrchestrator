# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 8                       |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

テストを維持しながらコードの品質を向上させる。

## 実行タスク

- コード品質改善: 重複排除・命名改善・構造整理
- パフォーマンス最適化: 不要な処理の削減
- テスト維持確認: リファクタリング後もテストがパスすることを確認

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                    | 内容           |
| ---------------- | ----------------------------------------------------------------------- | -------------- |
| コーディング規約 | `.claude/skills/aiworkflow-requirements/references/coding-standards.md` | コード品質基準 |

### Phase 5-7成果物

| 資料名               | パス                                      | 説明          |
| -------------------- | ----------------------------------------- | ------------- |
| 実装コード           | `apps/desktop/src/main/services/agent/*`  | Phase 5成果物 |
| カバレッジ達成確認書 | `outputs/phase-7/coverage-achievement.md` | Phase 7成果物 |

## リファクタリング観点

### 1. コード重複の排除

| 対象                | 改善内容                         |
| ------------------- | -------------------------------- |
| エラーハンドリング  | 共通エラー処理関数の抽出         |
| IPC送信処理         | メッセージ送信ヘルパーの作成     |
| AbortSignalチェック | シグナルチェックデコレータの検討 |

### 2. 命名の改善

| 対象       | 確認観点                   |
| ---------- | -------------------------- |
| クラス名   | 責務を正確に表現しているか |
| メソッド名 | 動詞から始まっているか     |
| 変数名     | 意図が明確か               |

### 3. 構造の整理

| 対象           | 改善内容                           |
| -------------- | ---------------------------------- |
| 長いメソッド   | 小さなメソッドへの分割             |
| 複雑な条件分岐 | ガード節・早期リターンの適用       |
| 依存関係       | インターフェース抽出による疎結合化 |

## 実行手順

### 1. 静的解析

```bash
# ESLint実行
pnpm --filter @repo/desktop lint

# 複雑度チェック（任意）
pnpm --filter @repo/desktop analyze:complexity
```

### 2. リファクタリング実施

リファクタリングは小さなステップで行い、各ステップ後にテストを実行:

```bash
# 各変更後にテスト実行
pnpm --filter @repo/desktop test
```

### 3. リファクタリング対象

#### 3.1 HooksFactory

```typescript
// Before: 危険コマンドパターンがハードコード
private readonly dangerousPatterns = [
  /rm\s+(-rf?|--recursive)/,
  /sudo\s+/,
  // ...
];

// After: 設定ファイルから読み込み可能に（必要であれば）
```

#### 3.2 AgentExecutor

```typescript
// Before: ストリーミング処理が長い
async *executeWithStreaming() {
  // 100行以上のメソッド
}

// After: 責務ごとにメソッド分割
async *executeWithStreaming() {
  await this.validateRequest();
  const client = await this.createClient();
  yield* this.processStream(client);
}
```

#### 3.3 ExecutionManager

```typescript
// Before: Map操作が直接
this.executions.set(id, execution);
this.executions.delete(id);

// After: メソッド抽出で意図を明確に
private registerExecution(id: string, execution: AgentExecutor): void
private unregisterExecution(id: string): void
```

### 4. テスト確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# カバレッジ維持確認
pnpm --filter @repo/desktop test:coverage
```

## 統合テスト連携【必須】

リファクタリング後の統合テスト確認:

| 確認項目           | 検証内容                             | 状態 |
| ------------------ | ------------------------------------ | ---- |
| IPC通信            | リファクタリング後も正常に動作するか | [ ]  |
| ストリーミング     | メッセージ転送が正常に動作するか     | [ ]  |
| Permission連携     | ダイアログ連携が正常に動作するか     | [ ]  |
| エラーハンドリング | エラー伝播が正常に動作するか         | [ ]  |

## 成果物

| 成果物               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-summary.md` | 改善内容の記録 |
| コード品質レポート   | `outputs/phase-8/code-quality-report.md` | 静的解析結果   |

## 完了条件

- [ ] コード重複が排除されている
- [ ] 命名が適切に改善されている
- [ ] 構造が整理されている
- [ ] すべてのテストがパスしている
- [ ] カバレッジが維持されている
- [ ] リファクタリング記録が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功すること
# - [ ] カバレッジが低下していないこと
```

## 次のPhase

Phase 9: 品質検証
