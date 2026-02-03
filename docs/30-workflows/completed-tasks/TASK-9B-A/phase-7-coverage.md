# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 7                           |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

Phase 6で拡充したテスト結果を検証し、検証カバレッジ基準を満たすことを確認する。

## 実行タスク

### Task 1: 検証カバレッジ測定

```bash
# 全検証スクリプトを実行し、結果を集計
run_all_validations() {
  local skill_file="$HOME/.aiworkflow/skills/skill-creator/SKILL.md"
  local results=()

  # 1. 構造検証
  bash outputs/phase-4/validate-skill-md.sh && results+=("structure:PASS") || results+=("structure:FAIL")

  # 2. 拡充検証
  bash outputs/phase-6/validate-skill-md-extended.sh && results+=("extended:PASS") || results+=("extended:FAIL")

  # 結果出力
  echo "=== Validation Coverage Report ==="
  for result in "${results[@]}"; do
    echo "$result"
  done

  # 全PASS確認
  [[ ! " ${results[*]} " =~ "FAIL" ]]
}
```

### Task 2: 検証項目チェックリスト

| カテゴリ      | 検証項目                           | 結果 |
| ------------- | ---------------------------------- | ---- |
| 構造          | SKILL.md ファイル存在              | -    |
| 構造          | YAML Frontmatter 存在              | -    |
| 構造          | Markdown Body 存在                 | -    |
| Frontmatter   | name フィールド存在・形式正確      | -    |
| Frontmatter   | description フィールド存在・複数行 | -    |
| Frontmatter   | allowed-tools フィールド存在・配列 | -    |
| allowed-tools | Read ツール含む                    | -    |
| allowed-tools | Write ツール含む                   | -    |
| allowed-tools | Edit ツール含む                    | -    |
| allowed-tools | Glob ツール含む                    | -    |
| allowed-tools | Grep ツール含む                    | -    |
| allowed-tools | Bash ツール含む                    | -    |
| allowed-tools | Task ツール含む                    | -    |
| allowed-tools | WebFetch ツール含む                | -    |
| allowed-tools | AskUserQuestion ツール含む         | -    |
| 機能          | chat 機能セクション存在            | -    |
| 機能          | api 機能セクション存在             | -    |
| 機能          | improve 機能セクション存在         | -    |
| 機能          | execute 機能セクション存在         | -    |
| 機能          | use 機能セクション存在             | -    |
| 機能          | chain 機能セクション存在           | -    |
| 機能          | fork 機能セクション存在            | -    |
| 機能          | share 機能セクション存在           | -    |
| 機能          | schedule 機能セクション存在        | -    |
| 機能          | debug 機能セクション存在           | -    |
| 機能          | docs 機能セクション存在            | -    |
| 機能          | stats 機能セクション存在           | -    |
| description   | Anchors セクション存在             | -    |
| description   | Anchors 3つ以上                    | -    |
| description   | Trigger セクション存在             | -    |
| 参照          | agents/ 参照5つ以上                | -    |
| 参照          | references/ 参照4つ以上            | -    |
| 参照          | 参照パス形式が正しい               | -    |

### Task 3: 未達の場合の対応

検証カバレッジ未達や検証失敗がある場合、Phase 5へ戻ってSKILL.mdを修正する。

## 検証カバレッジ基準

| 指標         | 基準 | 結果 |
| ------------ | ---- | ---- |
| 構造検証     | 100% | -    |
| 必須要素検証 | 100% | -    |
| 形式検証     | 100% | -    |
| 整合性検証   | 80%+ | -    |

## 参照資料

| 資料名        | パス                                            | 説明         |
| ------------- | ----------------------------------------------- | ------------ |
| Phase 6成果物 | `outputs/phase-6/validation-coverage-report.md` | 検証レポート |
| SKILL.md      | `~/.aiworkflow/skills/skill-creator/SKILL.md`   | 検証対象     |

## 統合テスト連携【必須】

| 判定項目     | 基準 | 結果       |
| ------------ | ---- | ---------- |
| 構造検証     | 100% | {{RESULT}} |
| 必須要素検証 | 100% | {{RESULT}} |
| 形式検証     | 100% | {{RESULT}} |
| 整合性検証   | 80%+ | {{RESULT}} |

## 成果物

| 成果物             | パス                                      | 説明           |
| ------------------ | ----------------------------------------- | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`      | 最終検証結果   |
| チェックリスト結果 | `outputs/phase-7/validation-checklist.md` | 全項目チェック |

## 完了条件

- [ ] 検証カバレッジ基準を達成（構造100%、必須要素100%、形式100%、整合性80%+）
- [ ] 全検証項目がチェックリストで確認済み
- [ ] 検証カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
