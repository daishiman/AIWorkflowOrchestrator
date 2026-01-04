# Test Case Patterns

## 概要

エージェントの動作を検証するためのテストケースパターン集。

## テストケースの3つの分類

### 1. 正常系テスト（Normal Case）

**目的**: エージェントが期待通りに動作することを確認

**パターン**:

```yaml
test_case:
  name: "正常系: 標準的な入力での動作確認"
  input:
    task: "コードレビューを実行"
    files: ["src/main.ts", "src/utils.ts"]
  expected_output:
    status: "completed"
    artifacts: [".claude/docs/review-report.md"]
    issues_found: 0-5
  validation:
    - レポートファイルが生成されている
    - レポートに品質評価が含まれている
    - ベストプラクティスへの準拠が確認されている
```

### 2. エッジケーステスト（Edge Case）

**目的**: 境界値や極端な条件下での動作を確認

**パターン**:

```yaml
test_case:
  name: "エッジケース: 空のファイルリスト"
  input:
    task: "コードレビューを実行"
    files: []
  expected_output:
    status: "partial"
    message: "レビュー対象ファイルがありません"
  validation:
    - 適切なエラーメッセージが表示される
    - エージェントがクラッシュしない
```

**一般的なエッジケース**:

- 空の入力
- 最大値・最小値
- 存在しないファイル
- 権限のないファイル
- 巨大なファイル（>10MB）

### 3. 異常系テスト（Error Case）

**目的**: エラー時の適切なハンドリングを確認

**パターン**:

```yaml
test_case:
  name: "異常系: 構文エラーファイルの処理"
  input:
    task: "コードレビューを実行"
    files: ["broken-syntax.ts"]
  expected_output:
    status: "failed"
    error_type: "SyntaxError"
    retry_count: 3
    fallback: "スキップして続行"
  validation:
    - エラーが適切に報告される
    - Retryが実行される
    - Fallback動作が正しい
    - ログに記録される
```

## テストケーステンプレート

### 基本テンプレート

```yaml
test_case:
  # テストケース識別情報
  id: "TC-{{number}}"
  name: "{{test_name}}"
  category: "normal|edge|error"
  priority: "high|medium|low"

  # 前提条件
  preconditions:
    - "{{precondition_1}}"
    - "{{precondition_2}}"

  # 入力
  input:
    {{input_parameters}}

  # 期待される出力
  expected_output:
    status: "completed|partial|failed"
    {{expected_fields}}

  # 検証項目
  validation:
    - "{{validation_1}}"
    - "{{validation_2}}"
    - "{{validation_3}}"

  # 後処理
  postconditions:
    - "{{cleanup_1}}"
    - "{{cleanup_2}}"
```

### 拡張テンプレート（パフォーマンス・セキュリティ）

```yaml
test_case:
  id: "TC-{{number}}"
  name: "{{test_name}}"
  category: "performance|security"

  # パフォーマンステスト
  performance:
    max_duration: "{{max_time}}"
    max_memory: "{{max_memory}}"
    max_token_count: "{{max_tokens}}"

  # セキュリティテスト
  security:
    test_type: "path_traversal|injection|privilege_escalation"
    malicious_input: "{{malicious_input}}"
    expected_behavior: "reject|sanitize|log"

  # 検証
  validation:
    - "実行時間が{{max_time}}以内"
    - "メモリ使用量が{{max_memory}}以内"
    - "セキュリティ脅威が検出される"
    - "適切にブロックされる"
```

## テストカバレッジ

### 推奨カバレッジ基準

| カテゴリ       | 推奨テスト数  | 最小カバレッジ |
| -------------- | ------------- | -------------- |
| 正常系         | 各Phase 1-2個 | 100%           |
| エッジケース   | 各Phase 1個   | 80%            |
| 異常系         | 各Phase 1個   | 60%            |
| パフォーマンス | 全体で3-5個   | 主要操作のみ   |
| セキュリティ   | 全体で2-3個   | 危険操作のみ   |

### カバレッジ計算

```
カバレッジ = (実行されたテストケース数 / 総テストケース数) × 100%
```

## テスト実行例

### 正常系テスト実行

```bash
# テストケース: TC-001
echo "=== TC-001: 正常系テスト ==="

# 入力準備
echo "タスク: コードレビューを実行"
echo "ファイル: src/main.ts, src/utils.ts"

# エージェント実行
claude-code run code-reviewer --files="src/main.ts,src/utils.ts"

# 検証
if [ -f ".claude/docs/review-report.md" ]; then
  echo "✓ レポート生成成功"
else
  echo "✗ レポート生成失敗"
fi
```

### エッジケーステスト実行

```bash
# テストケース: TC-002
echo "=== TC-002: エッジケーステスト（空リスト） ==="

# 入力準備
echo "タスク: コードレビューを実行"
echo "ファイル: （なし）"

# エージェント実行
claude-code run code-reviewer --files=""

# 検証
if grep -q "ファイルがありません" output.log; then
  echo "✓ 適切なエラーメッセージ"
else
  echo "✗ エラーメッセージ不適切"
fi
```

## テストデータ

### 正常系データ

```typescript
// test-data/valid-code.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

### エラー系データ

```typescript
// test-data/invalid-code.ts
export function add(a: number, b: number) {
  return a + b; // セミコロンなし（構文エラー）
}
```

### エッジケースデータ

```typescript
// test-data/empty-file.ts
// （空ファイル）
```

## ベストプラクティス

### ✅ すべきこと

1. **3つのカテゴリすべてをテスト**: 正常系、エッジケース、異常系
2. **明確な期待値**: expected_outputを具体的に定義
3. **自動化**: テストスクリプトで自動実行
4. **継続的実行**: エージェント変更時に必ず実行
5. **カバレッジ追跡**: 80%以上を維持

### ❌ 避けるべきこと

1. **正常系のみテスト**: エッジケース、異常系を省略
2. **曖昧な期待値**: "うまく動作すること"のような曖昧な定義
3. **手動テストのみ**: 自動化しない
4. **テストの放置**: 変更後にテストを実行しない
5. **低カバレッジ**: 50%未満のカバレッジ

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-24 | 初版作成 |
