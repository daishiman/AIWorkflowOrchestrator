# Phase 1 受け入れ基準

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-A

## AC-1 参照リンク検証ゼロエラー

```gherkin
Scenario: verify-unassigned-links.js の実行で参照切れが 0 件
  Given Phase 12 Task 2 の全ステップが完了している
  When node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js を実行する
  Then 参照切れエラーが 0 件である
  And ALL_LINKS_EXIST が出力される
```

## AC-2 3点同期チェックリスト完全実行

```gherkin
Scenario: task-workflow / SKILL / LOGS の同期が完了する
  Given Phase 12 の仕様更新を実行する
  When 3点同期チェックリストを順番に実行する
  Then task-workflow.md が更新される
  And SKILL.md 2ファイルが更新される
  And LOGS.md 2ファイルが更新される
```

## AC-3 苦戦箇所の未タスク転記

```gherkin
Scenario: 苦戦箇所検出時に未タスクへ転記される
  Given 苦戦箇所が記録されている
  When 3ステップ転記を実行する
  Then unassigned-task 指示書が作成される
  And 残課題テーブルへ登録される
  And 関連仕様へ参照リンクが追加される
```

## AC-4 baseline/current 判定分離

```gherkin
Scenario: baseline と current が混同されない
  Given 監査結果に既存違反と今回差分違反が混在する
  When 判定ルールで分類する
  Then baseline は既存課題として記録される
  And current は今回修正必須として記録される
```

## AC-5 曖昧表現排除

```gherkin
Scenario: チェックリストが具体的である
  Given 強化後チェックリストが作成されている
  When 禁止曖昧語を検索する
  Then 該当件数が 0 件である
```
