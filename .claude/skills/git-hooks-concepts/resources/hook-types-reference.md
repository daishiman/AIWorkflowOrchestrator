# Git Hooks フック種類リファレンス

## クライアント側フック

### pre-commit
実行タイミング: コミット前
```bash
# 用途: コード品質チェック
# 終了コード0で継続、1で中断
# ステージ済みファイルのみ対象
```

実装例:
```bash
#!/bin/bash
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)
if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

npx prettier --check $STAGED_FILES || exit 1
npx eslint $STAGED_FILES || exit 1
exit 0
```

### prepare-commit-msg
実行タイミング: コミットメッセージ作成時（エディタ開く直前）
```bash
# 用途: メッセージテンプレートの設定、プレフィックス追加
# COMMIT_EDITMSG ファイルを編集可能
```

実装例:
```bash
#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ $BRANCH != "main" && $BRANCH != "develop" ]]; then
  sed -i.bak -e "1s/^/[$BRANCH] /" $1
fi
```

### commit-msg
実行タイミング: メッセージ入力後、コミット実行前
```bash
# 用途: メッセージフォーマット検証
# Conventional Commits準拠確認
```

実装例:
```bash
#!/bin/bash
MSG=$(cat $1)
if ! [[ $MSG =~ ^(feat|fix|docs|style|refactor|test|chore) ]]; then
  echo "Error: Commit message must start with feat/fix/docs/etc"
  exit 1
fi
exit 0
```

### post-commit
実行タイミング: コミット完了後
```bash
# 用途: 通知、ログ記録、統計
# 失敗しても操作には影響なし
```

実装例:
```bash
#!/bin/bash
# コミット統計をログに記録
echo "Commit at $(date)" >> commit.log
# Slackに通知
curl -X POST -d "message: New commit" $SLACK_WEBHOOK
```

### pre-push
実行タイミング: プッシュ前
```bash
# 用途: テスト実行、ビルド確認
# リモートの情報を利用可能
```

実装例:
```bash
#!/bin/bash
# テスト実行
npm test || exit 1
# ビルド確認
npm run build || exit 1
exit 0
```

### post-push
実行タイミング: プッシュ完了後
```bash
# 用途: CI/CDトリガー、統計
# 失敗しても操作には影響なし
```

## サーバー側フック

### pre-receive
実行タイミング: サーバーがプッシュを受け取った直後
```bash
# 用途: ポリシー検証、ブランチ保護
# すべてのプッシュに対して動作
```

実装例:
```bash
#!/bin/bash
while read oldrev newrev refname; do
  if [[ $refname == "refs/heads/main" ]]; then
    # mainへの直接プッシュを禁止
    echo "Direct push to main is not allowed"
    exit 1
  fi
done
exit 0
```

### update
実行タイミング: 各参照ごとにpre-receiveより後
```bash
# 用途: 参照ごとの検証
# refname, oldrev, newrev にアクセス可能
```

### post-receive
実行タイミング: サーバープッシュ完了後
```bash
# 用途: デプロイ、CI/CDトリガー
# 失敗しても操作には影響なし
```

実装例:
```bash
#!/bin/bash
while read oldrev newrev refname; do
  if [[ $refname == "refs/heads/main" ]]; then
    # mainへのプッシュをトリガー
    ./deploy-to-production.sh
  fi
done
```

## フック実行順序と依存関係

```
git commit コマンド実行
    ↓
1. pre-commit（ステージ済みファイルのチェック）
    ↓
2. prepare-commit-msg（メッセージテンプレート設定）
    ↓
[ユーザーがメッセージ編集]
    ↓
3. commit-msg（メッセージフォーマット検証）
    ↓
[コミット作成]
    ↓
4. post-commit（通知・ログ）

git push コマンド実行
    ↓
pre-push（テスト・ビルド確認）
    ↓
[ネットワーク転送]
    ↓
[サーバー側]
    ↓
pre-receive（ポリシー検証）
    ↓
update（参照ごと検証）
    ↓
post-receive（デプロイ）
```

## パフォーマンス考慮事項

| フック | 推奨実行時間 | 理由 |
|--------|----------|------|
| pre-commit | < 1秒 | ユーザーが頻繁に実行 |
| commit-msg | < 0.5秒 | 軽量な検証 |
| pre-push | < 30秒 | テスト・ビルドを含む |
| post-commit | 任意 | 非同期実行推奨 |
| サーバー側 | 任意 | ネットワーク遅延許容 |
