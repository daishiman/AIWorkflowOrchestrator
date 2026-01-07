# 受け入れ基準 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目   | 内容                      |
| ------ | ------------------------- |
| 作成日 | 2026-01-05                |
| 作成者 | Claude Opus 4.5           |
| Phase  | 1                         |
| 機能名 | cicd-coverage-integration |

---

## AC-01: coverageジョブがCI/CDに追加されている

### Given-When-Then

```gherkin
Feature: CI/CDにcoverageジョブを追加

  Scenario: coverageジョブが正常に実行される
    Given CI/CDワークフローにcoverageジョブが定義されている
    And testジョブが完了している
    When coverageジョブが実行される
    Then カバレッジレポートが生成される
    And Codecovにレポートがアップロードされる
```

### 検証方法

- [ ] `.github/workflows/ci.yml` に `coverage` ジョブが存在する
- [ ] `coverage` ジョブに `needs: [test]` が設定されている
- [ ] codecov/codecov-action@v5 が使用されている

---

## AC-02: fail_ci_if_error: true が設定されている

### Given-When-Then

```gherkin
Feature: カバレッジ失敗でCIを失敗させる

  Scenario: カバレッジ閾値未達でCIが失敗する
    Given coverageジョブが実行されている
    And カバレッジが閾値未満である
    When Codecov Actionが実行される
    Then CIが失敗ステータスになる
    And PRのマージがブロックされる
```

### 検証方法

- [ ] Codecov Actionに `fail_ci_if_error: true` が設定されている
- [ ] `continue-on-error` が設定されていない（または false）

---

## AC-03: codecov.ymlで閾値80%が設定されている

### Given-When-Then

```gherkin
Feature: Codecovで閾値を設定

  Scenario: プロジェクトカバレッジ閾値の検証
    Given codecov.ymlが存在する
    And project.default.targetが80%に設定されている
    When カバレッジが79%である
    Then ステータスチェックが失敗する

  Scenario: パッチカバレッジ閾値の検証
    Given codecov.ymlが存在する
    And patch.default.targetが80%に設定されている
    When PRで追加されたコードのカバレッジが79%である
    Then ステータスチェックが失敗する
```

### 検証方法

- [ ] `codecov.yml` がリポジトリルートに存在する
- [ ] `coverage.status.project.default.target: 80%` が設定されている
- [ ] `coverage.status.patch.default.target: 80%` が設定されている

---

## AC-04: Codecov Actionがv5で設定されている

### Given-When-Then

```gherkin
Feature: Codecov Action v5を使用

  Scenario: 最新バージョンのActionを使用
    Given CI/CDワークフローが定義されている
    When coverageジョブを確認する
    Then codecov/codecov-action@v5 が使用されている
```

### 検証方法

- [ ] `uses: codecov/codecov-action@v5` が設定されている
- [ ] `token: ${{ secrets.CODECOV_TOKEN }}` が設定されている

---

## AC-05: PRにCodecovコメントが表示される

### Given-When-Then

```gherkin
Feature: PRにカバレッジコメントを表示

  Scenario: カバレッジ差分がPRにコメントされる
    Given PRが作成されている
    And coverageジョブが完了している
    When Codecovがレポートを処理する
    Then PRにCodecov botからコメントが追加される
    And カバレッジの差分が表示される
```

### 検証方法

- [ ] codecov.ymlに `comment.require_changes: true` が設定されている
- [ ] PRにCodecov botのコメントが表示される

---

## AC-06: 既存CIジョブに影響がない

### Given-When-Then

```gherkin
Feature: 既存CIジョブへの影響なし

  Scenario: lint, typecheck, test, buildが正常動作
    Given coverageジョブが追加されている
    When CIパイプラインが実行される
    Then lintジョブが正常に完了する
    And typecheckジョブが正常に完了する
    And testジョブが正常に完了する
    And buildジョブが正常に完了する
    And 各ジョブの実行時間が大幅に増加していない
```

### 検証方法

- [ ] lint, typecheck, test, build が全てPASS
- [ ] 各ジョブの実行時間が変更前と同程度（±20%以内）

---

## 検証チェックリスト

| AC ID | 受け入れ基準                            | 確認日 | 結果   |
| ----- | --------------------------------------- | ------ | ------ |
| AC-01 | coverageジョブがCI/CDに追加されている   |        | 未確認 |
| AC-02 | fail_ci_if_error: true が設定されている |        | 未確認 |
| AC-03 | codecov.ymlで閾値80%が設定されている    |        | 未確認 |
| AC-04 | Codecov Actionがv5で設定されている      |        | 未確認 |
| AC-05 | PRにCodecovコメントが表示される         |        | 未確認 |
| AC-06 | 既存CIジョブに影響がない                |        | 未確認 |
