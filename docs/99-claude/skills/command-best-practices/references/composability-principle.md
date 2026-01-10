# 組み合わせ可能性の原則

## 原則

**小さなコマンドを組み合わせて複雑なワークフローを構築**

## 設計パターン

### 原子的コマンド

```markdown
/lint # 単機能：Lint実行
/test # 単機能：テスト実行
/build # 単機能：ビルド実行
/deploy # 単機能：デプロイ実行
```

### 組み合わせ

```markdown
# パイプラインコマンド

---

## description: Full CI/CD pipeline

# ci-cd

Execute in sequence:

1. /lint
2. /test
3. /build
4. /deploy
```

## 利点

1. **再利用性**: 各コマンドを単独で使用可能
2. **柔軟性**: 異なる組み合わせが可能
3. **テスト容易性**: 各コマンドを個別にテスト

## 例

```markdown
# 原子的コマンド群

/validate-code # コード検証
/run-unit-tests # ユニットテスト
/run-e2e-tests # E2Eテスト
/create-bundle # バンドル作成

# 組み合わせパターン1: 開発用

/validate-code && /run-unit-tests

# 組み合わせパターン2: CI用

/validate-code && /run-unit-tests && /run-e2e-tests

# 組み合わせパターン3: リリース用

/validate-code && /run-unit-tests && /run-e2e-tests && /create-bundle
```

## インターフェース設計

組み合わせ可能にするための設計:

```markdown
# ✓ 良い設計：標準的な出力

Output: exit code (0=success, 1=failure)

# ✓ 良い設計：標準的な入力

Input: $ARGUMENTS or stdin

# ✗ 悪い設計：特殊な出力形式

Output: カスタム独自形式
```

## ベストプラクティス

1. **標準的なI/O**: 入出力を標準化
2. **明確な成功/失敗**: exit codeで明示
3. **独立性**: 他のコマンドに依存しない
4. **副作用の最小化**: 予測可能な動作
