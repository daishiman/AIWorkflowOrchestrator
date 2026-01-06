# Phase 7: 品質保証 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 7                             |
| Phase名    | 品質保証                      |
| 前提Phase  | Phase 6（リファクタリング）   |
| 後続Phase  | Phase 8（最終レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-05                    |
| 機能名     | cicd-coverage-integration     |

---

## 目的

定義された品質基準をすべて満たすことを検証する。

## 背景

CI/CDワークフローの品質を保証するため、構文チェック・セキュリティチェック・ベストプラクティス準拠を確認する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: github-actions-debugging

**パス**: `.claude/skills/github-actions-debugging/SKILL.md`

**Trigger条件**:

- ワークフローのデバッグ・検証
- ACTIONS_STEP_DEBUG、ログ出力確認

**期待される成果物**:

- デバッグ設定確認結果

---

## 参照資料

| 参照資料             | パス                                 | 内容          |
| -------------------- | ------------------------------------ | ------------- |
| CIワークフロー       | `.github/workflows/ci.yml`           | 実装成果物    |
| Codecov設定          | `codecov.yml`                        | 実装成果物    |
| リファクタリング記録 | `outputs/phase-6/refactoring-log.md` | Phase 6成果物 |

---

## 品質ゲート

### 1. 構文検証

```bash
# actionlintによる構文チェック
actionlint .github/workflows/ci.yml

# yamllintによるYAML検証
yamllint .github/workflows/ci.yml
yamllint codecov.yml
```

| チェック項目           | 結果 | 備考 |
| ---------------------- | ---- | ---- |
| actionlintエラーなし   |      |      |
| yamllintエラーなし     |      |      |
| Prettierフォーマット済 |      |      |

### 2. セキュリティチェック

| チェック項目                         | 結果 | 備考 |
| ------------------------------------ | ---- | ---- |
| Secretsがハードコードされていない    |      |      |
| 最小権限の原則が守られている         |      |      |
| サードパーティActionのバージョン固定 |      |      |
| サードパーティActionの信頼性確認     |      |      |

### 3. ベストプラクティス準拠

| チェック項目                    | 結果 | 備考 |
| ------------------------------- | ---- | ---- |
| timeout-minutesが設定されている |      |      |
| concurrencyが設定されている     |      |      |
| fail-fastが適切に設定されている |      |      |
| continue-on-errorの使用が適切   |      |      |

### 4. Codecov設定検証

| チェック項目        | 結果 | 備考 |
| ------------------- | ---- | ---- |
| 閾値設定が80%       |      |      |
| threshold設定が適切 |      |      |
| コメント設定が適切  |      |      |

---

## 検証コマンド

```bash
# 構文チェック
npx action-validator .github/workflows/ci.yml

# YAMLフォーマットチェック
pnpm prettier --check .github/workflows/ci.yml codecov.yml

# セキュリティスキャン（Actionsに対する）
# 注: 実際のスキャンはGitHub上で実行
```

---

## 成果物

| 成果物       | パス                                | 内容         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-7/quality-report.md` | 品質検証結果 |

---

## 完了条件

- [ ] actionlintエラーなし
- [ ] yamllintエラーなし
- [ ] セキュリティチェック完了
- [ ] ベストプラクティス準拠確認
- [ ] Codecov設定検証完了
- [ ] artifacts.jsonが更新されている

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 使用スキル

- github-actions-debugging: {{result}}

### 品質ゲート結果

- 構文検証: {{PASS/FAIL}}
- セキュリティ: {{PASS/FAIL}}
- ベストプラクティス: {{PASS/FAIL}}

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

`docs/30-workflows/cicd-coverage-integration/phase-8-final-review.md`
