# Phase 5: 実装 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 5                           |
| Phase名    | 実装                        |
| 前提Phase  | Phase 4（テスト作成）       |
| 後続Phase  | Phase 6（リファクタリング） |
| ステータス | 未実施                      |
| 作成日     | 2026-01-05                  |
| 機能名     | cicd-coverage-integration   |

---

## 目的

Phase 2の設計に基づき、CI/CDワークフローとCodecov設定を実装する。

## 背景

設計レビューをパスした設計に基づき、実際のワークフローファイルを更新する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: github-actions-syntax

**パス**: `.claude/skills/github-actions-syntax/SKILL.md`

**Trigger条件**:

- GitHub Actionsワークフローの実装
- on/jobs/steps構文の記述

**期待される成果物**:

- 更新されたci.ymlファイル

---

### スキル2: github-actions-security

**パス**: `.claude/skills/github-actions-security/SKILL.md`

**Trigger条件**:

- Secretsの設定
- 最小権限の設定

**期待される成果物**:

- セキュアなワークフロー設定

---

## 参照資料

| 参照資料         | パス                                       | 内容          |
| ---------------- | ------------------------------------------ | ------------- |
| ワークフロー設計 | `outputs/phase-2/workflow-design.md`       | Phase 2成果物 |
| Codecov設定設計  | `outputs/phase-2/codecov-config-design.md` | Phase 2成果物 |
| セキュリティ設計 | `outputs/phase-2/security-design.md`       | Phase 2成果物 |
| 検証シナリオ     | `outputs/phase-4/test-scenarios.md`        | Phase 4成果物 |

---

## 実装手順

### ステップ1: ci.ymlの更新

**ファイル**: `.github/workflows/ci.yml`

```yaml
# 追加するジョブ（testジョブの後に追加）

coverage:
  name: Coverage Check
  runs-on: ubuntu-latest
  timeout-minutes: 15
  needs: [test]
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

    - name: Configure git to use HTTPS instead of SSH
      run: git config --global url."https://github.com/".insteadOf "git@github.com:"

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
        files: ./coverage/lcov.info,./packages/shared/coverage/lcov.info,./apps/desktop/coverage/lcov.info
        fail_ci_if_error: true
        verbose: true
```

### ステップ2: codecov.yml作成

**ファイル**: `codecov.yml`（リポジトリルート）

```yaml
coverage:
  precision: 2
  round: down
  range: "70...100"

  status:
    project:
      default:
        target: 80%
        threshold: 1%
        if_ci_failed: error
    patch:
      default:
        target: 80%
        threshold: 1%
        only_pulls: true

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: true
  require_base: false
  require_head: true

flags:
  shared:
    paths:
      - packages/shared/
    carryforward: true
  desktop:
    paths:
      - apps/desktop/
    carryforward: true
```

### ステップ3: GitHub Secrets設定（手動）

**重要**: 以下の設定はGitHub UI上で手動で行う必要があります。

1. GitHubリポジトリの Settings → Secrets and variables → Actions
2. "New repository secret" をクリック
3. Name: `CODECOV_TOKEN`
4. Value: Codecovダッシュボードから取得したトークン
5. "Add secret" をクリック

### ステップ4: 構文検証

```bash
# ワークフロー構文チェック（actionlint使用）
actionlint .github/workflows/ci.yml

# YAMLバリデーション
yamllint .github/workflows/ci.yml
yamllint codecov.yml
```

---

## 成果物

| 成果物         | パス                                        | 内容                |
| -------------- | ------------------------------------------- | ------------------- |
| CIワークフロー | `.github/workflows/ci.yml`                  | 更新されたCI設定    |
| Codecov設定    | `codecov.yml`                               | Codecov設定ファイル |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md` | 実装内容まとめ      |

---

## 完了条件

- [ ] ci.ymlにcoverageジョブが追加されている
- [ ] codecov.ymlが作成されている
- [ ] ワークフロー構文エラーがない
- [ ] YAML構文エラーがない
- [ ] Secrets設定手順がドキュメント化されている
- [ ] artifacts.jsonが更新されている

---

## 検証コマンド

```bash
# ローカルでの構文チェック
npx action-validator .github/workflows/ci.yml

# YAMLフォーマット確認
pnpm prettier --check .github/workflows/ci.yml codecov.yml
```

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- github-actions-syntax: {{result}}
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

`docs/30-workflows/cicd-coverage-integration/phase-6-refactoring.md`
