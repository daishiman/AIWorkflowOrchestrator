---
description: |
  ビルドエラーの修正を行うコマンド。

  ビルドプロセスで発生したエラーを分析し、自動修正を試みます。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/devops-eng.md` - ビルド設定・環境専門
  - Phase 3: `.claude/agents/code-quality.md` - コード修正専門

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/build-troubleshooting/SKILL.md` - ビルドエラーパターン、解決策
  - `.claude/skills/nextjs-optimization/SKILL.md` - Next.jsビルド最適化

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: ビルド実行と修正用
    • Task: devops-eng/code-qualityエージェント起動用
    • Bash(pnpm run build*): ビルド実行専用
    • Read: ビルド設定・コード確認用
    • Edit: エラー修正用
  - model: sonnet（標準的なビルドエラー修正タスク）

  📋 成果物:
  - 修正されたコード
  - ビルド成功確認

  トリガーキーワード: build error, ビルドエラー, コンパイルエラー
argument-hint: ""
allowed-tools:
  - Task
  - Bash(pnpm run build*)
  - Read
  - Edit
model: sonnet
---

# ビルドエラー修正

このコマンドは、ビルドエラーを修正します。

## 📋 実行フロー

### Phase 1: ビルド実行とエラー確認

```bash
echo "ビルド実行中..."
pnpm build 2>&1 | tee build-error.log

if [ $? -eq 0 ]; then
  echo "ビルド成功: エラーなし"
  exit 0
fi

echo "ビルドエラー検出"
cat build-error.log
```

### Phase 2: devops-engエージェントを起動

**使用エージェント**: `.claude/agents/devops-eng.md`

**依頼内容**:
```markdown
ビルドエラーを修正してください。

**ビルドログ**: ${cat build-error.log}

**要件**:
1. エラー種別の特定
2. 修正実施
3. ビルド再実行

**スキル参照**: `.claude/skills/build-troubleshooting/SKILL.md`

**成果物**: 修正されたコード
```

### Phase 3: 完了報告

```markdown
## ビルドエラー修正完了

### 修正内容
${fix_summary}

### ビルド結果
✅ ビルド成功
```

## 使用例

```bash
/ai:fix-build-error
```

## 参照

- devops-eng: `.claude/agents/devops-eng.md`
- build-troubleshooting: `.claude/skills/build-troubleshooting/SKILL.md`
