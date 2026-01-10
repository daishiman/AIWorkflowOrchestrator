# 名前空間戦略

## 基本構造

```bash
.claude/commands/
├── deploy-staging.md
├── deploy-prod.md
├── test-unit.md
└── test-e2e.md
```

## 命名パターン

### パターン1: カテゴリプレフィックス

```bash
git-commit.md
git-push.md
docker-build.md
docker-deploy.md
```

### パターン2: 機能グループ

```bash
deploy-staging.md
deploy-production.md
deploy-rollback.md
```

### パターン3: サブディレクトリ

```bash
.claude/commands/
├── git/
│   ├── commit.md
│   └── push.md
└── docker/
    ├── build.md
    └── deploy.md
```

起動: `/git/commit`

## ベストプラクティス

1. **一貫性**: プロジェクト内で統一された命名規則
2. **可読性**: 名前から機能が推測できる
3. **衝突回避**: プレフィックスで名前空間を分離
4. **階層化**: サブディレクトリで論理的にグループ化
