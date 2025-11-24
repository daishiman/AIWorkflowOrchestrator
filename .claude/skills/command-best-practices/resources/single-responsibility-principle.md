# 単一責任原則（SRP）

## 原則

**1つのコマンド = 1つの明確な責任**

## 良い例

```markdown
# ✓ 単一責任: Gitコミット作成
---
description: Create Git commit
---
# commit
Create conventional commit message
Execute git commit
```

```markdown
# ✓ 単一責任: デプロイ実行
---
description: Deploy to staging
---
# deploy-staging
Build application
Upload to staging
Verify deployment
```

## 悪い例

```markdown
# ✗ 複数責任（コミット + プッシュ + デプロイ）
---
description: Commit, push, and deploy
---
# commit-and-deploy
Create commit
Push to remote
Deploy to production  # 責任過多
```

**問題点**:
- テストが困難
- 部分的な実行不可
- 変更の影響範囲が大きい

## リファクタリング

```markdown
# Before: 1つのコマンドが3つの責任
/commit-and-deploy

# After: 3つの独立したコマンド
/commit       # 責任1: コミット作成
/push         # 責任2: リモートプッシュ
/deploy       # 責任3: デプロイ実行

# 組み合わせ（パイプライン）
/commit && /push && /deploy
```

## 判断基準

コマンドが複数責任を持つか判断:
- 「〜と〜」が説明に含まれる → 分割検討
- 異なるタイミングで実行したい → 分割
- 片方だけ必要な状況がある → 分割
