# Phase 2: 設計 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-05                    |
| 機能名     | cicd-coverage-integration     |

---

## 目的

要件を実現するためのCI/CDワークフロー設計を行う。

## 背景

Phase 1で定義された要件に基づき、GitHub ActionsワークフローとCodecov統合の詳細設計を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: github-actions-syntax

**パス**: `.claude/skills/github-actions-syntax/SKILL.md`

**Trigger条件**:

- GitHub Actionsワークフロー構文の設計
- on/jobs/steps構文、トリガーイベント

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. ワークフロー構文のベストプラクティスを確認
3. 成果物を下記のパスに出力

**期待される成果物**:

- ワークフロー設計書

---

### スキル2: github-actions-expressions

**パス**: `.claude/skills/github-actions-expressions/SKILL.md`

**Trigger条件**:

- ${{ }}式、github/env/secrets コンテキストの使用
- 条件分岐・変数参照の設計

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 式・コンテキストの使用パターンを確認
3. 成果物を下記のパスに出力

**期待される成果物**:

- 条件分岐設計

---

### スキル3: github-actions-security

**パス**: `.claude/skills/github-actions-security/SKILL.md`

**Trigger条件**:

- Secretsの管理
- 最小権限の原則

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. セキュリティベストプラクティスを確認
3. 成果物を下記のパスに出力

**期待される成果物**:

- セキュリティ設計

---

## 参照資料

| 参照資料           | パス                                         | 内容          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| 現行CIワークフロー | `.github/workflows/ci.yml`                   | 現状のCI設定  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料  | パス                                                         | 内容          |
| --------- | ------------------------------------------------------------ | ------------- |
| CI/CD仕様 | `.claude/skills/aiworkflow-requirements/references/ci-cd.md` | CI/CD設計方針 |

---

## 実行手順

### ステップ1: ワークフロー構造設計

```yaml
# 設計案: .github/workflows/ci.yml への追加

jobs:
  # 既存ジョブ: lint, typecheck, test, security, build

  coverage:
    name: Coverage Check
    runs-on: ubuntu-latest
    needs: [test] # testジョブ完了後に実行
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "22"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build shared package
        run: pnpm --filter @repo/shared build

      - name: Run tests with coverage
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v5
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

### ステップ2: Codecov設定ファイル設計

```yaml
# 設計案: codecov.yml

coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 1%
    patch:
      default:
        target: 80%
        threshold: 1%

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: true
```

### ステップ3: セキュリティ設計

- **CODECOV_TOKEN**: GitHub Secretsに保存
- **permissions**: 必要最小限の権限のみ付与
- **fail_ci_if_error**: カバレッジ未達時はCIを失敗させる

### ステップ4: 依存関係設計

```
lint ─────┐
typecheck ─┼─→ build
test ─────┤
          └─→ coverage
security ────（独立）
```

---

## 成果物

| 成果物           | パス                                       | 内容              |
| ---------------- | ------------------------------------------ | ----------------- |
| ワークフロー設計 | `outputs/phase-2/workflow-design.md`       | CI/CD構造設計     |
| Codecov設定設計  | `outputs/phase-2/codecov-config-design.md` | Codecov設定詳細   |
| セキュリティ設計 | `outputs/phase-2/security-design.md`       | Secrets・権限設計 |

---

## 完了条件

- [ ] ワークフロー構造が設計されている
- [ ] Codecov設定が設計されている
- [ ] セキュリティ要件が満たされている
- [ ] 既存ジョブとの依存関係が明確
- [ ] 要件定義との整合性が確認されている
- [ ] artifacts.jsonが更新されている

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- github-actions-syntax: {{result}}
- github-actions-expressions: {{result}}
- github-actions-security: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/cicd-coverage-integration/phase-3-design-review.md`
