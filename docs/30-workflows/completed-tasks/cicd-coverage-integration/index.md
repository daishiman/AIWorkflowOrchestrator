# CI/CDカバレッジ閾値統合 - ワークフローインデックス

## 概要

GitHub ActionsのCI/CDパイプラインにカバレッジ閾値チェックを統合し、品質低下を自動的に検出・防止する。

## メタ情報

| 項目           | 内容                            |
| -------------- | ------------------------------- |
| タスクID       | CI-01                           |
| タスク名       | CI/CDカバレッジ閾値統合         |
| 優先度         | 高                              |
| 作成日         | 2026-01-05                      |
| 元ワークフロー | frontend-testing-best-practices |
| ステータス     | 未実施                          |

---

## Phase一覧

| Phase | 名称                       | ステータス | 仕様書                                                       |
| ----- | -------------------------- | ---------- | ------------------------------------------------------------ |
| 1     | 要件定義                   | 未実施     | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | 設計                       | 未実施     | [phase-2-design.md](phase-2-design.md)                       |
| 3     | 設計レビューゲート         | 未実施     | [phase-3-design-review.md](phase-3-design-review.md)         |
| 4     | テスト作成（検証シナリオ） | 未実施     | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | 実装                       | 未実施     | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | リファクタリング           | 未実施     | [phase-6-refactoring.md](phase-6-refactoring.md)             |
| 7     | 品質保証                   | 未実施     | [phase-7-quality-assurance.md](phase-7-quality-assurance.md) |
| 8     | 最終レビューゲート         | 未実施     | [phase-8-final-review.md](phase-8-final-review.md)           |
| 9     | 手動テスト検証             | 未実施     | [phase-9-manual-testing.md](phase-9-manual-testing.md)       |
| 10    | ドキュメント更新           | 未実施     | [phase-10-documentation.md](phase-10-documentation.md)       |
| 11    | PR作成                     | 未実施     | [phase-11-pr-creation.md](phase-11-pr-creation.md)           |

---

## 使用スキル

| スキル                     | パス                                                 | 用途              |
| -------------------------- | ---------------------------------------------------- | ----------------- |
| github-actions-syntax      | `.claude/skills/github-actions-syntax/SKILL.md`      | ワークフロー構文  |
| github-actions-expressions | `.claude/skills/github-actions-expressions/SKILL.md` | 式・コンテキスト  |
| test-coverage              | `.claude/skills/test-coverage/SKILL.md`              | カバレッジ分析    |
| github-actions-security    | `.claude/skills/github-actions-security/SKILL.md`    | Secrets・最小権限 |

### 選定理由

- **github-actions-syntax**: CI/CDワークフローの基本構文を正しく記述するため
- **github-actions-expressions**: カバレッジ結果の条件分岐・変数参照に必要
- **test-coverage**: カバレッジ閾値設定・レポート分析の知見
- **github-actions-security**: Codecovトークンなどの機密情報管理

---

## 実装スコープ

### 含むもの

1. GitHub Actions CI/CDワークフロー更新（`.github/workflows/ci.yml`）
2. カバレッジ閾値チェックジョブ追加
3. Codecov統合（カバレッジ可視化・PRコメント）
4. 閾値未達時のPRブロック設定

### 含まないもの

- テストコード自体の修正
- カバレッジ閾値の変更（現行80%を維持）
- ローカル開発環境の変更

---

## 成果物ディレクトリ

```
docs/30-workflows/cicd-coverage-integration/
├── index.md                      # このファイル
├── artifacts.json                # 成果物レジストリ
├── phase-1-requirements.md       # Phase 1 仕様書
├── phase-2-design.md             # Phase 2 仕様書
├── ...
├── phase-11-pr-creation.md       # Phase 11 仕様書
└── outputs/                      # 各Phase成果物
    ├── phase-1/
    ├── phase-2/
    └── ...
```

---

## 関連ドキュメント

| ドキュメント         | パス                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| 元タスク指示書       | `docs/30-workflows/unassigned-task/task-cicd-coverage-integration.md` |
| 現行CIワークフロー   | `.github/workflows/ci.yml`                                            |
| Vitestカバレッジ設定 | `vitest.config.ts`                                                    |
