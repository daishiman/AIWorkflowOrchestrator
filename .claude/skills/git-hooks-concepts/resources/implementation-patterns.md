# Git Hooks 実装パターン集

## パターン1: Prettier + ESLint統合
```bash
#!/bin/bash
# pre-commit: コード品質の統一チェック

# ステージ済みファイルを取得
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Prettierでフォーマット確認
echo "Running Prettier..."
npx prettier --check $STAGED_FILES
if [ $? -ne 0 ]; then
  echo "❌ Prettier formatting failed"
  echo "Run: npx prettier --write ."
  exit 1
fi

# ESLintで構文チェック
echo "Running ESLint..."
npx eslint $STAGED_FILES
if [ $? -ne 0 ]; then
  echo "❌ ESLint failed"
  exit 1
fi

echo "✅ All checks passed"
exit 0
```

## パターン2: TypeScript型チェック
```bash
#!/bin/bash
# pre-commit: TypeScript型チェック

STAGED_TS=$(git diff --cached --name-only | grep ".ts$")

if [ -z "$STAGED_TS" ]; then
  exit 0
fi

echo "Running TypeScript compiler..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed"
  exit 1
fi

echo "✅ TypeScript checks passed"
exit 0
```

## パターン3: テスト実行
```bash
#!/bin/bash
# pre-push: テスト実行

echo "Running unit tests..."
npm test -- --bail

if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "✅ All tests passed"
exit 0
```

## パターン4: Conventional Commits検証
```bash
#!/bin/bash
# commit-msg: Conventional Commitsフォーマット検証

MSG=$(head -1 $1)

# パターン: type(scope): subject
if ! [[ $MSG =~ ^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:\ .+ ]]; then
  echo "❌ Invalid commit message format"
  echo "Expected: feat(scope): description"
  echo "Got: $MSG"
  exit 1
fi

if [ ${#MSG} -gt 72 ]; then
  echo "❌ Commit message subject too long (max 72 chars)"
  exit 1
fi

exit 0
```

## パターン5: ブランチ名検証
```bash
#!/bin/bash
# prepare-commit-msg: ブランチ名をプレフィックスとして追加

BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_FILE=$1

# mainやdevelopには追加しない
if [[ $BRANCH == "main" || $BRANCH == "develop" ]]; then
  exit 0
fi

# チケット番号を抽出 (例: feature/PROJ-123)
if [[ $BRANCH =~ ^[a-z]+/([A-Z]+-[0-9]+) ]]; then
  TICKET=${BASH_REMATCH[1]}
  # メッセージにプレフィックスを追加
  sed -i.bak -e "1s/^/[$TICKET] /" $COMMIT_FILE
fi

exit 0
```

## パターン6: ビルド確認
```bash
#!/bin/bash
# pre-push: ビルド成功確認

echo "Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
exit 0
```

## パターン7: セキュリティチェック
```bash
#!/bin/bash
# pre-commit: セキュリティ脆弱性検査

echo "Running security scan..."

# APIキーがコミットされていないか確認
if git diff --cached | grep -E "(api_key|secret_key|password)" > /dev/null; then
  echo "❌ Potential secrets found in commit"
  exit 1
fi

# 依存関係の脆弱性確認
npm audit --audit-level=moderate

if [ $? -ne 0 ]; then
  echo "⚠️  Security vulnerabilities detected"
  exit 1
fi

echo "✅ Security checks passed"
exit 0
```

## パターン8: ファイルサイズ制限
```bash
#!/bin/bash
# pre-commit: ファイルサイズ制限

MAX_SIZE=$((5 * 1024 * 1024))  # 5MB

STAGED_FILES=$(git diff --cached --name-only)

for file in $STAGED_FILES; do
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ $SIZE -gt $MAX_SIZE ]; then
      echo "❌ File too large: $file ($(($SIZE / 1024 / 1024))MB > 5MB)"
      exit 1
    fi
  fi
done

echo "✅ File size checks passed"
exit 0
```

## パターン9: 通知送信
```bash
#!/bin/bash
# post-commit: Slack通知

BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
AUTHOR=$(git log -1 --pretty=%an)

SLACK_MESSAGE="New commit on $BRANCH by $AUTHOR: $COMMIT_MSG"

curl -X POST -d "text=$SLACK_MESSAGE" $SLACK_WEBHOOK

exit 0
```

## パターン10: 条件付きチェック
```bash
#!/bin/bash
# pre-commit: ファイルタイプに応じた検証

STAGED_FILES=$(git diff --cached --name-only)

# TypeScriptファイルのみ
TS_FILES=$(echo "$STAGED_FILES" | grep ".ts$")
if [ ! -z "$TS_FILES" ]; then
  npx tsc --noEmit || exit 1
fi

# JavaScriptファイルのみ
JS_FILES=$(echo "$STAGED_FILES" | grep ".js$")
if [ ! -z "$JS_FILES" ]; then
  npx eslint $JS_FILES || exit 1
fi

# Pythonファイルのみ
PY_FILES=$(echo "$STAGED_FILES" | grep ".py$")
if [ ! -z "$PY_FILES" ]; then
  python -m py_compile $PY_FILES || exit 1
fi

exit 0
```

## トラブルシューティング

### フックが実行されない場合
```bash
# 実行権限を確認
ls -la .git/hooks/pre-commit

# 権限がない場合
chmod +x .git/hooks/pre-commit
```

### デバッグモード
```bash
# フック内でデバッグを有効化
#!/bin/bash
set -x  # 実行されるコマンドを出力
```

### 特定フックのみをスキップ
```bash
# すべてのフックをスキップ
git commit --no-verify

# または
HUSKY=0 git commit
```

## ベストプラクティス

1. **段階的な検証**: 軽いチェックから重いチェックへ
2. **明確なエラーメッセージ**: ユーザーが修正方法を理解できるように
3. **パフォーマンス**: pre-commitは1秒以内を目標
4. **バイパス可能性**: `--no-verify` で緊急時のみスキップ可能
5. **ログ記録**: 何が実行されたかを記録
