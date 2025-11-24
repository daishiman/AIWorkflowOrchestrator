# コマンド命名規則

## 基本ルール

### ケバブケース
```bash
✓ create-component
✓ deploy-staging
✓ run-tests

✗ createComponent (camelCase)
✗ CreateComponent (PascalCase)
✗ create_component (snake_case)
```

### 動詞ベース
```bash
✓ create-user
✓ deploy-app
✓ test-api

✗ user (名詞のみ)
✗ deployment (名詞化)
```

## 命名パターン

### パターン1: 動詞-目的語
```bash
create-component
delete-branch
deploy-service
```

### パターン2: 動詞-目的語-修飾語
```bash
deploy-staging
deploy-production
test-unit
test-integration
```

### パターン3: 名前空間プレフィックス
```bash
git-commit
git-push
docker-build
docker-run
```

## 長さのガイドライン

- **最小**: 2語（create-user）
- **推奨**: 2-3語
- **最大**: 4語まで

## 避けるべき名前

```bash
✗ cmd (曖昧)
✗ do-stuff (不明確)
✗ helper (汎用的すぎ)
✗ very-long-command-name-that-is-hard-to-type
```

## 一貫性

プロジェクト内で統一:
```bash
# 一貫した命名
create-component
update-component
delete-component

# 一貫性なし（避ける）
create-component
component-update
remove-comp
```
