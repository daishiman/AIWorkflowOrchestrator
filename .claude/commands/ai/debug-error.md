---
description: |
  エラーのデバッグと原因特定を行うコマンド。

  エラーメッセージからスタックトレースを分析し、根本原因を特定して
  修正方法を提案します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/logic-dev.md` - エラー原因分析・デバッグ専門
  - Phase 3 (必要時): `.claude/agents/sec-auditor.md` - セキュリティ起因エラー分析

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/debugging-techniques/SKILL.md` - デバッグ手法、仮説検証
  - `.claude/skills/error-pattern-recognition/SKILL.md` - エラーパターン認識、既知問題マッチング
  - `.claude/skills/stack-trace-analysis/SKILL.md` - スタックトレース解析、呼び出し経路追跡

  ⚙️ このコマンドの設定:
  - argument-hint: "[error-message]"（必須: エラーメッセージ）
  - allowed-tools: エラー調査用
    • Task: logic-dev/sec-auditorエージェント起動用
    • Read: エラー発生箇所コード確認用
    • Grep: エラー関連コード検索用
    • Bash: ログ確認、再現実行用
  - model: opus（複雑なエラー原因分析が必要）

  📋 成果物:
  - エラー原因分析レポート
  - 修正方法提案
  - 再現手順（該当する場合）

  🎯 分析対象:
  - ランタイムエラー
  - 型エラー
  - ビルドエラー
  - セキュリティエラー

  トリガーキーワード: debug, error analysis, エラー調査, デバッグ, 原因特定
argument-hint: "[error-message]"
allowed-tools:
  - Task
  - Read
  - Grep
  - Bash
model: opus
---

# エラーデバッグ

このコマンドは、エラーのデバッグと原因特定を行います。

## 📋 実行フロー

### Phase 1: エラーメッセージの確認

```bash
error_message="$ARGUMENTS"

if [ -z "$error_message" ]; then
  エラー: エラーメッセージは必須です
  使用例: /ai:debug-error "TypeError: Cannot read property 'map' of undefined"
fi

echo "分析対象エラー: $error_message"
```

### Phase 2: logic-devエージェントを起動（原因分析）

**使用エージェント**: `.claude/agents/logic-dev.md`

**依頼内容**:

`````markdown
エラーを分析し、根本原因を特定してください。

**エラーメッセージ**: ${error_message}

**要件**:

1. エラー種別の特定:
   - ランタイムエラー / 型エラー / ビルドエラー
   - エラーコード（該当する場合）

2. スタックトレース分析:
   - 呼び出し経路の追跡
   - エラー発生箇所の特定
   - 関連コードの確認

3. 根本原因の特定:

   ````markdown
   ## 根本原因

   **エラー種別**: TypeError（ランタイムエラー）

   **発生箇所**: src/features/sample/executor.ts:45

   **原因**:
   APIレスポンスが`null`の場合にmap()を呼び出している

   **コード**:

   ```typescript
   // エラー発生コード（45行目）
   const results = response.data.map((item) => item.name);
   //              ^^^^^^^^^^^^^ null の可能性
   ```
   ````
`````

```

**根本原因**:
APIがエラーを返した場合、response.dataがnullになるが、
nullチェックが行われていない

```

4. 修正方法提案:

```typescript
// 修正案1: Optional Chaining + Nullish Coalescing
const results = (response.data ?? []).map((item) => item.name);

// 修正案2: 明示的なnullチェック
if (!response.data) {
  throw new Error("API response data is null");
}
const results = response.data.map((item) => item.name);
```

5. 再発防止策:
   - 型定義の強化（non-null型）
   - テストケース追加（null/undefinedケース）
   - エラーハンドリング改善

**スキル参照**:

- `.claude/skills/debugging-techniques/SKILL.md`
- `.claude/skills/error-pattern-recognition/SKILL.md`

**成果物**: エラー分析レポート、修正提案

````

### Phase 3: 完了報告

```markdown
## エラーデバッグ完了

### 根本原因
${root_cause}

### 修正方法
${fix_proposal}

### 再発防止策
${prevention}

### Next Steps
1. 修正実装
2. テスト追加
3. 類似箇所の確認
````

## 使用例

### TypeError のデバッグ

```bash
/ai:debug-error "TypeError: Cannot read property 'map' of undefined"
```

### ビルドエラーのデバッグ

```bash
/ai:debug-error "Module not found: Can't resolve '@/components/Button'"
```

## 参照

- logic-dev: `.claude/agents/logic-dev.md`
- debugging-techniques: `.claude/skills/debugging-techniques/SKILL.md`
