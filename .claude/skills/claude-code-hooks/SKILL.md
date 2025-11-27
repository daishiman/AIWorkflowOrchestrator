# Claude Code フック実装

## 概要
Claude Code (Claude Codeツール) 統合時のGit Hooks実装パターン

## 核心概念

### 1. Claude Code特有の課題
- Claudeが生成したコードの品質保証
- 自動修正の妥当性検証
- マルチターン编集の一貫性確認

### 2. フック戦略
```
Claude編集 → pre-commit → 品質チェック → コミット許可
```

### 3. 検証対象
- 生成されたコードの型安全性
- テストカバレッジ維持
- エラーメッセージの明確さ
- セキュリティベストプラクティス準拠

## 設計原則

### 1. 二重検証（Dual Validation）
- Claudeが提案 → フックが検証 → マージ前再確認

### 2. 段階的リリース（Phased Release）
- 開発環境: すべてのチェック有効
- ステージング: 重要なチェックのみ
- 本番環境: 最小限のオーバーヘッド

### 3. 学習フィードバック（Learning Feedback）
- フック失敗 → Claudeへフィードバック
- パターン蓄積 → プロンプト改善

### 4. 人間の裁量（Human Override）
- `--no-verify` で緊急対応可能
- ただし記録・追跡必須

## 実装パターン

### パターン1: 型安全性チェック
```bash
#!/bin/bash
# Claude生成コードの型チェック
npx tsc --noEmit || {
  echo "⚠️ Type errors in Claude-generated code"
  exit 1
}
```

### パターン2: テストカバレッジ検証
```bash
#!/bin/bash
# テストカバレッジが低下していないか確認
COVERAGE=$(npm run test:coverage 2>&1 | grep "Coverage" | awk '{print $2}')
THRESHOLD=80
if [ ${COVERAGE%\%} -lt $THRESHOLD ]; then
  echo "❌ Coverage below threshold: $COVERAGE < $THRESHOLD%"
  exit 1
fi
```

### パターン3: セキュリティスキャン
```bash
#!/bin/bash
# Claude生成コードのセキュリティチェック
npm audit --production || exit 1
grep -r "TODO\|FIXME\|HACK" src/ && exit 1
```

## 関連スキル

- `.claude/skills/git-hooks-concepts/SKILL.md`: Git Hooks基本
- `.claude/skills/automation-scripting/SKILL.md`: スクリプト自動化
- `.claude/skills/approval-gates/SKILL.md`: 承認ゲート

## 参照リソース

### 詳細リソース
- `.claude/skills/claude-code-hooks/resources/claude-code-guidelines.md`: Claude Code ガイドライン
- `.claude/skills/claude-code-hooks/resources/quality-metrics.md`: 品質指標定義

### テンプレート
- `.claude/skills/claude-code-hooks/templates/claude-commit-template.sh`: Claudeコミットテンプレート
- `.claude/skills/claude-code-hooks/templates/claude-quality-template.sh`: 品質チェックテンプレート

### スクリプト
- `.claude/skills/claude-code-hooks/scripts/validate-claude-quality.mjs`: Claude生成コード品質検証
