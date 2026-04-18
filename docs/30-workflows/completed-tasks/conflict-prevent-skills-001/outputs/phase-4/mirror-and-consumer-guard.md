# Phase 4 Output: Mirror Parity & Consumer Guard

## Mirror Parity Guard

### 目的

`.claude/skills/` と `.agents/skills/` の差分を定期的に検出し、意図しない乖離を可視化する。

### 手順

```bash
diff -qr .claude/skills .agents/skills
```

### 評価基準

| 差分種別                                               | 対応方針                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| LOGS.md, task-workflow-completed.md                    | 並列ブランチの追記差分。union merge で自動統合対象                    |
| indexes/_.md, indexes/_.json                           | generate-index.js による regenerate で統一                            |
| SKILL.md, references/\*.md                             | canonical (.claude) の内容を mirror (.agents) へ手動同期（follow-up） |
| int-test-skill のような canonical のみに存在するスキル | mirror への追加が必要（follow-up）                                    |

## EVALS Consumer Guard

### 目的

`EVALS.json` の schema を参照するコードを確認し、本 task での schema 変更がないことを保証する。

### 手順

```bash
rg -l "EVALS\.json" . --include="*.ts" --include="*.js" 2>/dev/null
rg -l "EVALS" . --include="*.ts" --include="*.js" 2>/dev/null | head -20
```

### 判定

- consumer が見つかった場合: schema 変更の影響範囲を確認し、本 task では変更しない
- consumer がいない場合: follow-up で schema を見直す
- 本 task の判定: `EVALS.json` の schema は変更しない（AC-6 遵守）
