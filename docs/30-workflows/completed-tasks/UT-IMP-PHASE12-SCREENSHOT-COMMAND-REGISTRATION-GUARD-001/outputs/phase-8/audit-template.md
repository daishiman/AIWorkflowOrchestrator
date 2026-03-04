# Phase 8 監査テンプレート

## current/baseline 分離テンプレート

```markdown
### 未タスク監査結果

- コマンド: `audit-unassigned-tasks --json --diff-from HEAD`
- currentViolations.total: <N>
- baselineViolations.total: <M>
- 判定: <PASS|FAIL>（current基準）
- 備考: baselineは既存負債として別管理
```

## Phase 12転記用テーブル

| 指標                     | 値     |
| ------------------------ | ------ | ------ |
| currentViolations.total  | `<N>`  |
| baselineViolations.total | `<M>`  |
| 判定                     | `<PASS | FAIL>` |
