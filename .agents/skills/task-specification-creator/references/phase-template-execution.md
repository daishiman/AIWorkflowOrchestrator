# Phase Template Execution

## 対象

Phase 4〜10。

## Phase 4-6

| Phase | 重点 |
| --- | --- |
| 4 | test scenario、command suite、expected result |
| 5 | `.claude` 正本更新、mirror sync、first validation |
| 6 | regression check、補助 command、再検証 |

## Phase 7-10

| Phase | 重点 |
| --- | --- |
| 7 | concern × command × dependency edge の coverage |
| 8 | duplicate、naming、navigation 短縮 |
| 9 | validator と quality gate の一括判定 |
| 10 | acceptance criteria と blocker の final review |

## execution template

```md
## 実行タスク
- タスク1: ...
- タスク2: ...
- タスク3: ...

## 実行手順
### ステップ1: ...
### ステップ2: ...
### ステップ3: ...

## 統合テスト連携
## 成果物
## 完了条件
```

## 注意事項

- Phase 5 は `.claude` 正本を先に更新する。
- Phase 8 は refactor 後も validator を再実行する。
- Phase 10 は MINOR と MAJOR の戻り先を曖昧にしない。
